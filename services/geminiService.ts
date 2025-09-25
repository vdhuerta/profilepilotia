import { GoogleGenAI } from "@google/genai";

// Fix: Use process.env.API_KEY to align with Gemini API guidelines and resolve the TypeScript error.
// The value is injected at build time via vite.config.ts.
const apiKey = process.env.API_KEY;
if (!apiKey) {
  throw new Error("API_KEY is not defined. Please set it in your environment variables.");
}

const ai = new GoogleGenAI({ apiKey });

export async function generateLinkedInPost(topic: string, generativeLinks: string[], pastedLinks: string[], topicDetails: string, wordCountRange: string): Promise<string> {
  const generativeLinksText = generativeLinks.length > 0 ? `Usa la información de las siguientes páginas como inspiración y para fundamentar el contenido: ${generativeLinks.join(', ')}.` : '';
  const pastedLinksText = pastedLinks.length > 0 ? `Al final de la publicación, justo antes de los hashtags, debes incluir la siguiente lista de enlaces sin modificarlos:\n${pastedLinks.join('\n')}` : '';
  const detailsText = topicDetails ? `Aquí hay detalles adicionales para ampliar el tema: "${topicDetails}".` : '';
  const longitudText = `El texto debe tener una longitud de ${wordCountRange} palabras.`;

  const prompt = `
    Actúa como un experto estratega de contenido viral para LinkedIn y un redactor con profundo conocimiento académico.
    Tu tarea es escribir una publicación para un perfil personal que genere alta interacción.
    
    Analiza la estructura de publicaciones de LinkedIn con alto rendimiento (muchos "me gusta", comentarios y compartidos) y aplica esos principios:
    1.  **Gancho Fuerte:** Comienza con una primera línea que capte la atención de inmediato (una pregunta provocadora, un dato sorprendente, una declaración audaz).
    2.  **Cuerpo Valioso:** Desarrolla el tema con párrafos cortos y fáciles de leer. Aporta valor, ya sea a través de una nueva perspectiva, información útil o una historia personal.
    3.  **Llamada a la Acción (CTA):** Finaliza con una pregunta abierta para fomentar la discusión en los comentarios.

    **Tema principal de la publicación:** "${topic}".
    ${detailsText}

    **Requisitos de Contenido y Estilo:**
    -   **Idioma:** Español.
    -   **Longitud:** ${longitudText}
    -   **DIRECTIVA HUMANA OBLIGATORIA:** Para que el texto parezca escrito por un profesor de universidad, tendrás que usar un lenguaje sofisticado y culto, pero sin que resulte arcaico o inaccesible. Evita el uso de palabras rebuscadas del diccionario o un lenguaje demasiado antiguo (por ejemplo, evita términos como 'aditamiento', 'advenimiento' o 'pergueñar'). Mantén un tono SERIO y un estilo de ESCRITURA LITERARIO, pero claro y comprensible para una audiencia profesional moderna.
    -   **Formato:** Usa emojis relevantes para separar ideas y mejorar la legibilidad. No abuses de ellos.
    -   **Credibilidad (APA 7):** Para dar más autoridad al texto, parafrasea sutilmente uno o dos conceptos clave como si provinieran de una fuente académica. Al final de la frase parafraseada, incluye una cita de referencia en formato APA 7 (Parafraseo), por ejemplo: (Johnson, 2023). No es necesario que la fuente sea real, pero debe ser verosímil.
    -   **Enlaces Generativos:** ${generativeLinksText}
    -   **Enlaces a Pegar:** ${pastedLinksText}
    -   **Hashtags:** Concluye con 3 a 5 hashtags relevantes y populares.
  `;
  
  try {
    let response;

    if (generativeLinks.length > 0) {
        response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
            },
        });
    } else {
        response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
    }

    let postText = response.text;

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (groundingChunks && groundingChunks.length > 0) {
        const sources = groundingChunks
            .map((chunk: any) => chunk.web)
            .filter(Boolean)
            .filter((web: any, index: number, self: any[]) => 
                index === self.findIndex((w: any) => w.uri === web.uri)
            )
            .map((web: any) => `- ${web.title}: ${web.uri}`);

        if (sources.length > 0) {
            postText += '\n\n---\nFuentes consultadas:\n' + sources.join('\n');
        }
    }
    
    return postText;

  } catch (error) {
    console.error("Error generating LinkedIn post:", error);
    throw new Error("Failed to generate text content.");
  }
}

export async function generateImageForPost(prompt: string): Promise<string> {
  const fullPrompt = `Una imagen profesional y moderna para una publicación de LinkedIn. El estilo debe ser limpio, minimalista y corporativo. Tema: ${prompt}`;
  
  try {
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: fullPrompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: '16:9',
        },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
      const base64ImageBytes = response.generatedImages[0].image.imageBytes;
      return `data:image/jpeg;base64,${base64ImageBytes}`;
    } else {
      throw new Error("No image was generated.");
    }
  } catch (error) {
    console.error("Error generating image:", error);
    throw new Error("Failed to generate image content.");
  }
}