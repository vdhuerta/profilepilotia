import { GoogleGenAI } from "@google/genai";
import { FormData } from '../types';

// Fix: Use process.env.API_KEY as per guidelines.
// This resolves the TypeScript error with 'import.meta.env' and aligns with project requirements.
// The value is replaced by Vite during the build process.
if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const HUMAN_DIRECTIVE = "DIRECTIVA HUMANA OBLIGATORIA: Para que el texto parezca escrito por un profesor de universidad, tendrás que usar un lenguaje sofisticado y culto, pero sin que resulte arcaico o inaccesible. Evita el uso de palabras rebuscadas del diccionario o un lenguaje demasiado antiguo (por ejemplo, evita términos como 'aditamiento', 'advenimiento' o 'pergueñar'). Mantén un tono SERIO y un estilo de ESCRITURA LITERARIO, pero claro y comprensible para una audiencia profesional moderna. Cuando parafrasees ideas de fuentes teóricas, DEBES incluir una cita en el texto inmediatamente después del parafraseo, siguiendo el formato de autor-fecha de la norma APA 7ma edición (por ejemplo, (Apellido, Año)). Asegúrate de incluir 2 o 3 de estas citas a lo largo de la publicación. NO incluyas una lista de 'Referencias' al final.";

const buildTextPrompt = (data: FormData): string => {
  let prompt = `Eres un experto en marketing de redes sociales, especializado en crear contenido atractivo y profesional para LinkedIn. Tu tarea es escribir una publicación para LinkedIn basada en las siguientes especificaciones. La publicación debe estar en español.

${HUMAN_DIRECTIVE}

**Tema:** ${data.theme}
**Rango de palabras aproximado:** ${data.wordCount}
`;

  if (data.details) {
    prompt += `**Detalles clave/Ángulo a considerar:** ${data.details}\n`;
  }

  if (data.pasteLinks.length > 0) {
    prompt += `**Enlaces para incluir al final de la publicación (antes de las referencias APA):**\n${data.pasteLinks.map(link => `- ${link}`).join('\n')}\n`;
  }

  prompt += `
Por favor, escribe una publicación de LinkedIn convincente que sea profesional, informativa y fomente la interacción. Formateala con espaciado adecuado, emojis relevantes y hashtags pertinentes al final.

IMPORTANTE: Responde únicamente con el texto de la publicación. No incluyas encabezados, introducciones o frases como 'Aquí tienes tu publicación:'.`;

  return prompt;
};

export const generateContent = async (formData: FormData) => {
  try {
    // Part 1: Generate Text
    const textModel = 'gemini-2.5-flash';
    let textResponse;

    if (formData.generativeLinks.length > 0) {
      const groundingPrompt = `Basado en el tema "${formData.theme}" y la información encontrada en la web, escribe una publicación profesional para LinkedIn en español. ${formData.details}\n\n${HUMAN_DIRECTIVE}\n\nLa publicación debe ser profesional, informativa y fomentar la interacción. Formateala con espaciado adecuado, emojis relevantes y hashtags pertinentes al final.\n\nIMPORTANTE: Responde únicamente con el texto de la publicación. No incluyas encabezados, introducciones o frases como 'Aquí tienes tu publicación:'.`;
      textResponse = await ai.models.generateContent({
        model: textModel,
        contents: groundingPrompt,
        config: { tools: [{ googleSearch: {} }] },
      });
    } else {
      const textPrompt = buildTextPrompt(formData);
      textResponse = await ai.models.generateContent({
        model: textModel,
        contents: textPrompt,
      });
    }
    
    const generatedText = textResponse.text;

    // Part 2: Attempt to Generate Image
    let imageUrl: string | null = null;
    try {
      const imageModel = 'imagen-4.0-generate-001';
      const imageResponse = await ai.models.generateImages({
        model: imageModel,
        prompt: formData.imageDescription,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: '16:9',
        },
      });

      const base64ImageBytes = imageResponse.generatedImages[0].image.imageBytes;
      imageUrl = `data:image/jpeg;base64,${base64ImageBytes}`;
    } catch (imageError) {
        console.warn("Image generation failed, proceeding without an image. This could be a billing issue.", imageError);
        // The function will continue and return imageUrl as null
    }
    
    return { text: generatedText, imageUrl };

  } catch (error) {
    console.error("Error generating content:", error);
    if (error instanceof Error) {
      // This will now primarily catch text generation errors
      throw new Error(`Error con la API de IA: ${error.message}`);
    }
    throw new Error("Un error desconocido ocurrió durante la generación de contenido.");
  }
};