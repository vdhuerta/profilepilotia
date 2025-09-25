import React, { useState, useCallback, useEffect } from 'react';
import { TOPICS, WORD_COUNT_RANGES } from './constants';
import { generateLinkedInPost, generateImageForPost } from './services/geminiService';
import NeumorphicCard from './components/NeumorphicCard';
import NeumorphicInput from './components/NeumorphicInput';
import NeumorphicSelect from './components/NeumorphicSelect';
import NeumorphicButton from './components/NeumorphicButton';
import Spinner from './components/Spinner';
import TrashIcon from './components/icons/TrashIcon';
import ClipboardIcon from './components/icons/ClipboardIcon';
import NeumorphicTextarea from './components/NeumorphicTextarea';
import DownloadIcon from './components/icons/DownloadIcon';

interface HistoryItem {
  id: string;
  post: string;
  image: string;
  topic: string;
  timestamp: number;
  generativeLinks: string[];
  wordCount: number;
}

function App() {
  const [topics, setTopics] = useState<string[]>(TOPICS);
  const [topic, setTopic] = useState<string>(topics[0]);
  const [topicDetails, setTopicDetails] = useState<string>('');
  
  // Temporarily disabled for debugging
  // const [generativeLinks, setGenerativeLinks] = useState<string[]>([]);
  // const [currentGenerativeLink, setCurrentGenerativeLink] = useState<string>('');
  // const [pastedLinks, setPastedLinks] = useState<string[]>([]);
  // const [currentPastedLink, setCurrentPastedLink] = useState<string>('');

  const [wordCountRange, setWordCountRange] = useState<string>(WORD_COUNT_RANGES[2]);
  const [imagePrompt, setImagePrompt] = useState<string>('');
  
  const [generatedPost, setGeneratedPost] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [wordCount, setWordCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const [isAddingTopic, setIsAddingTopic] = useState<boolean>(false);
  const [newTopic, setNewTopic] = useState<string>('');

  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [selectedHistoryItems, setSelectedHistoryItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem('linkedinPostHistory');
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (e) {
      console.error("Failed to parse history from localStorage", e);
      localStorage.removeItem('linkedinPostHistory');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('linkedinPostHistory', JSON.stringify(history));
  }, [history]);

  const handleAddNewTopic = () => {
    if (newTopic.trim() && !topics.includes(newTopic.trim())) {
      const updatedTopics = [...topics, newTopic.trim()];
      setTopics(updatedTopics);
      setTopic(newTopic.trim());
      setNewTopic('');
      setIsAddingTopic(false);
    }
  };

  /* Temporarily disabled for debugging
  const handleAddLink = (type: 'generative' | 'pasted') => {
    const link = type === 'generative' ? currentGenerativeLink : currentPastedLink;
    const setLinks = type === 'generative' ? setGenerativeLinks : setPastedLinks;
    const setCurrentLink = type === 'generative' ? setCurrentGenerativeLink : setCurrentPastedLink;
    const links = type === 'generative' ? generativeLinks : pastedLinks;

    if (link && !links.includes(link)) {
      try {
        new URL(link);
        setLinks([...links, link]);
        setCurrentLink('');
        setError(null);
      } catch (_) {
        setError('Por favor, introduce una URL válida.');
      }
    }
  };

  const handleRemoveLink = (type: 'generative' | 'pasted', linkToRemove: string) => {
    const links = type === 'generative' ? generativeLinks : pastedLinks;
    const setLinks = type === 'generative' ? setGenerativeLinks : setPastedLinks;
    setLinks(links.filter(link => link !== linkToRemove));
  };
  */

  const handleClearPost = () => {
    setGeneratedPost(null);
    setGeneratedImage(null);
    setWordCount(0);
    setTopic(topics[0]);
    setTopicDetails('');
    // setGenerativeLinks([]);
    // setCurrentGenerativeLink('');
    // setPastedLinks([]);
    // setCurrentPastedLink('');
    setImagePrompt('');
    setWordCountRange(WORD_COUNT_RANGES[2]);
    setError(null);
  };
  
  const handleGenerate = useCallback(async () => {
    if (!imagePrompt) {
      setError('El prompt para la imagen es obligatorio.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedPost(null);
    setGeneratedImage(null);
    setWordCount(0);
    setCopied(false);

    try {
      const [postResponse, imageResponse] = await Promise.all([
        // Pass empty arrays for links to simplify the API call for debugging
        generateLinkedInPost(topic, [], [], topicDetails, wordCountRange),
        generateImageForPost(imagePrompt),
      ]);
      
      const count = postResponse.trim().split(/\s+/).filter(Boolean).length;
      setGeneratedPost(postResponse);
      setGeneratedImage(imageResponse);
      setWordCount(count);

      const newHistoryItem: HistoryItem = {
        id: Date.now().toString(),
        post: postResponse,
        image: imageResponse,
        topic: topic,
        timestamp: Date.now(),
        generativeLinks: [], // Pass empty array
        wordCount: count,
      };
      setHistory(prev => [newHistoryItem, ...prev]);

    } catch (err) {
      console.error(err);
      setError('Ha ocurrido un error al contactar con la IA. Por favor, inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  }, [topic, imagePrompt, topicDetails, wordCountRange]);
  
  const handleCopyToClipboard = () => {
    if (generatedPost) {
      navigator.clipboard.writeText(generatedPost);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleImageDownload = () => {
    if (generatedImage) {
      const link = document.createElement('a');
      link.href = generatedImage;
      link.download = `linkedin-post-image-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };
  
  const handleDeleteHistoryItem = (id: string) => {
    setHistory(history.filter(item => item.id !== id));
    setSelectedHistoryItems(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  };

  const handleToggleHistorySelection = (id: string) => {
    setSelectedHistoryItems(prevSelected => {
      const newSelected = new Set(prevSelected);
      if (newSelected.has(id)) {
        newSelected.delete(id);
      } else {
        newSelected.add(id);
      }
      return newSelected;
    });
  };

  const handleCreatePortfolio = () => {
    const selectedItems = history.filter(item => selectedHistoryItems.has(item.id));
    if (selectedItems.length === 0) {
      alert("Por favor, selecciona al menos una publicación para crear el portafolio.");
      return;
    }
    
    selectedItems.sort((a, b) => b.timestamp - a.timestamp);

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Portafolio de Publicaciones - ProfilePilot</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          body { 
            font-family: sans-serif; 
            background-color: #e2e8f0; 
            color: #334155;
          }
          .card { 
            background-color: #f8fafc;
            border-radius: 1rem; 
            box-shadow: 8px 8px 16px #c5c5c5, -8px -8px 16px #ffffff;
            margin: 2rem auto;
            padding: 1.5rem;
            max-width: 1100px;
            overflow: hidden;
          }
          .post-content {
            font-size: 8px;
            line-height: 1.4;
            white-space: pre-wrap;
            word-break: break-word;
            padding: 0.75rem;
            background-color: #f1f5f9;
            border-radius: 0.5rem;
            box-shadow: inset 3px 3px 6px #d1d9e6, inset -3px -3px 6px #ffffff;
          }
          .tag {
            display: inline-block;
            padding: 0.25rem 0.75rem;
            border-radius: 9999px;
            font-size: 0.7rem;
            font-weight: 600;
            margin-right: 0.5rem;
            margin-bottom: 0.5rem;
          }
          .tag-topic { background-color: #dbeafe; color: #1e40af; }
          .tag-words { background-color: #dcfce7; color: #166534; }
          .tag-link { background-color: #fee2e2; color: #991b1b; }
          .tag-link:hover { text-decoration: underline; }
        </style>
      </head>
      <body class="p-4 sm:p-8">
        <header class="text-center mb-12">
          <h1 class="text-4xl sm:text-5xl font-bold text-blue-800">Portafolio de Publicaciones</h1>
          <p class="text-slate-500 mt-2 text-base sm:text-lg">Generado con ProfilePilot</p>
        </header>
        <main>
          ${selectedItems.map(item => `
            <div class="card">
              <div class="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                <div class="col-span-1 md:col-span-4">
                  <img src="${item.image}" alt="Imagen de la publicación" class="w-full rounded-lg object-cover shadow-md aspect-video"/>
                </div>
                <div class="col-span-1 md:col-span-8">
                  <div class="mb-3">
                    <span class="tag tag-topic">${item.topic}</span>
                    <span class="tag tag-words">${item.wordCount} palabras</span>
                    ${item.generativeLinks.map(link => {
                      try {
                        return `<a href="${link}" target="_blank" rel="noopener noreferrer" class="tag tag-link truncate">${new URL(link).hostname}</a>`;
                      } catch (e) { return ''; }
                    }).join('')}
                  </div>
                  <p class="text-xs text-slate-500 mb-2">${new Date(item.timestamp).toLocaleString()}</p>
                  <div class="post-content">${item.post}</div>
                </div>
              </div>
            </div>
          `).join('')}
        </main>
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'portafolio-profilepilot.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 text-slate-700 font-sans">
      <header className="text-center mb-6 sm:mb-8">
        <h1 className="text-4xl sm:text-5xl font-bold text-blue-800">ProfilePilot</h1>
        <p className="text-slate-500 mt-2 text-base sm:text-lg">Crea tu próxima publicación en LinkedIn con un solo clic.</p>
      </header>
      
      <main className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-8">
        <NeumorphicCard className="bg-sky-50">
          <div className="p-6">
            <h2 className="text-xl sm:text-2xl font-semibold mb-6 text-blue-800">Configuración de la Publicación</h2>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label htmlFor="topic" className="block text-sm font-medium">1. Elige o crea un tema</label>
                   {!isAddingTopic && (
                     <NeumorphicButton onClick={() => setIsAddingTopic(true)} className="!px-3 !py-1 text-xs">
                       Tema Nuevo
                     </NeumorphicButton>
                  )}
                </div>
                 {isAddingTopic ? (
                  <div className="flex items-center gap-2">
                    <NeumorphicInput type="text" value={newTopic} onChange={(e) => setNewTopic(e.target.value)} placeholder="Escribe el nuevo tema" aria-label="Nuevo tema" onKeyDown={(e) => e.key === 'Enter' && handleAddNewTopic()}/>
                    <NeumorphicButton onClick={handleAddNewTopic} className="!px-4 !py-2 shrink-0">Guardar</NeumorphicButton>
                    <button onClick={() => { setIsAddingTopic(false); setNewTopic(''); }} className="p-2 rounded-full hover:bg-slate-200 transition-colors shrink-0" aria-label="Cancelar añadir tema">X</button>
                  </div>
                ) : (
                  <NeumorphicSelect id="topic" value={topic} onChange={(e) => setTopic(e.target.value)}>
                    {topics.map(t => <option key={t} value={t}>{t}</option>)}
                  </NeumorphicSelect>
                )}
              </div>

              <div>
                <label htmlFor="topic-details" className="block text-sm font-medium mb-2">2. Amplía el tema (opcional)</label>
                <NeumorphicTextarea id="topic-details" value={topicDetails} onChange={(e) => setTopicDetails(e.target.value)} placeholder="Añade detalles, ideas clave o un ángulo específico para la publicación..." rows={3}/>
              </div>

              {/* Temporarily disabled for debugging
              <div>
                 <label htmlFor="generative-link-input" className="block text-sm font-medium mb-2">3. Añade Enlaces Generativos (opcional)</label>
                 <p className="text-xs text-slate-500 -mt-1 mb-2">La IA buscará información en estas páginas para enriquecer el contenido.</p>
                <div className="flex items-center gap-2">
                  <NeumorphicInput id="generative-link-input" type="url" value={currentGenerativeLink} onChange={(e) => { setCurrentGenerativeLink(e.target.value); setError(null); }} placeholder="https://ejemplo.com" onKeyDown={(e) => e.key === 'Enter' && handleAddLink('generative')}/>
                  <NeumorphicButton onClick={() => handleAddLink('generative')} className="!px-4 !py-2 shrink-0">Añadir</NeumorphicButton>
                </div>
                <div className="mt-3 space-y-2">
                  {generativeLinks.map(link => (
                    <div key={link} className="flex items-center justify-between bg-slate-100 rounded-lg p-2 text-sm shadow-inner">
                      <a href={link} target="_blank" rel="noopener noreferrer" className="truncate text-blue-600 hover:underline">{link}</a>
                      <button onClick={() => handleRemoveLink('generative', link)} className="p-1 rounded-full hover:bg-slate-200 transition-colors" aria-label={`Eliminar enlace ${link}`}><TrashIcon className="w-4 h-4 text-slate-500" /></button>
                    </div>
                  ))}
                </div>
              </div>

               <div>
                 <label htmlFor="pasted-link-input" className="block text-sm font-medium mb-2">4. Pega tus Enlaces (opcional)</label>
                  <p className="text-xs text-slate-500 -mt-1 mb-2">Estos enlaces se añadirán al final de la publicación, antes de los hashtags.</p>
                <div className="flex items-center gap-2">
                  <NeumorphicInput id="pasted-link-input" type="url" value={currentPastedLink} onChange={(e) => { setCurrentPastedLink(e.target.value); setError(null); }} placeholder="https://mi-blog.com/articulo" onKeyDown={(e) => e.key === 'Enter' && handleAddLink('pasted')}/>
                  <NeumorphicButton onClick={() => handleAddLink('pasted')} className="!px-4 !py-2 shrink-0">Añadir</NeumorphicButton>
                </div>
                <div className="mt-3 space-y-2">
                  {pastedLinks.map(link => (
                    <div key={link} className="flex items-center justify-between bg-slate-100 rounded-lg p-2 text-sm shadow-inner">
                      <a href={link} target="_blank" rel="noopener noreferrer" className="truncate text-blue-600 hover:underline">{link}</a>
                      <button onClick={() => handleRemoveLink('pasted', link)} className="p-1 rounded-full hover:bg-slate-200 transition-colors" aria-label={`Eliminar enlace ${link}`}><TrashIcon className="w-4 h-4 text-slate-500" /></button>
                    </div>
                  ))}
                </div>
              </div>
              */}

              <div>
                <label htmlFor="word-count-range" className="block text-sm font-medium mb-2">3. Cantidad de Palabras</label>
                <NeumorphicSelect id="word-count-range" value={wordCountRange} onChange={(e) => setWordCountRange(e.target.value)}>
                  {WORD_COUNT_RANGES.map(range => <option key={range} value={range}>{range}</option>)}
                </NeumorphicSelect>
              </div>

              <div>
                <label htmlFor="image-prompt" className="block text-sm font-medium mb-2">4. Describe la imagen deseada</label>
                <NeumorphicInput id="image-prompt" type="text" value={imagePrompt} onChange={(e) => setImagePrompt(e.target.value)} placeholder="Ej: Un robot y un humano colaborando"/>
              </div>

              <NeumorphicButton onClick={handleGenerate} disabled={isLoading || !imagePrompt} className="w-full !py-3 text-lg font-bold">{isLoading ? 'Generando...' : 'Generar Publicación'}</NeumorphicButton>
              {error && <p className="text-red-500 text-sm text-center mt-2">{error}</p>}
            </div>
          </div>
        </NeumorphicCard>

        <div className="flex flex-col space-y-8">
          {isLoading && (<NeumorphicCard><div className="p-6 h-full flex flex-col items-center justify-center text-center"><Spinner /><p className="mt-4 font-semibold text-slate-600">Creando magia...</p><p className="text-sm text-slate-500">El agente IA está redactando el texto y diseñando la imagen.</p></div></NeumorphicCard>)}
          {!isLoading && (generatedPost || generatedImage) && (<NeumorphicCard className="bg-red-50"><div className="p-6"><div className="flex justify-between items-center mb-4"><h2 className="text-xl sm:text-2xl font-semibold text-slate-800">Resultado Generado</h2><NeumorphicButton onClick={handleClearPost} className="!px-3 !py-1 text-xs">Limpiar Publicación</NeumorphicButton></div>{generatedImage && (<div className="mb-6 relative group"><img src={generatedImage} alt="Generated for post" className="rounded-lg w-full object-cover aspect-video shadow-md"/><button onClick={handleImageDownload} className="absolute top-2 right-2 p-2 bg-slate-800/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Descargar Imagen"><DownloadIcon className="w-5 h-5"/></button></div>)}{generatedPost && (<div className="relative"><div className="whitespace-pre-wrap p-4 bg-slate-50 rounded-lg h-64 sm:h-80 overflow-y-auto shadow-inner text-sm">{generatedPost}</div><NeumorphicButton onClick={handleCopyToClipboard} className="absolute top-2 right-2 !p-2" aria-label="Copiar texto al portapapeles"><ClipboardIcon className="w-5 h-5"/></NeumorphicButton>{copied && <span className="absolute top-2 right-12 text-xs bg-green-200 text-green-800 px-2 py-1 rounded">Copiado!</span>}<span className="absolute bottom-2 right-2 text-xs font-medium text-slate-500 bg-slate-200/80 px-2 py-1 rounded-md backdrop-blur-sm">{wordCount} palabras</span></div>)}</div></NeumorphicCard>)}
          {!isLoading && !generatedPost && !generatedImage && (<NeumorphicCard><div className="p-6 h-full flex flex-col items-center justify-center text-center"><div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center shadow-inner mb-4"><svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></div><p className="font-semibold text-slate-600">Tu publicación aparecerá aquí</p><p className="text-sm text-slate-500">Completa los pasos para generar el contenido.</p></div></NeumorphicCard>)}
        </div>
      </main>

      {history.length > 0 && (
        <section className="w-full max-w-4xl mt-12">
            <div className="text-center mb-6">
                 <NeumorphicButton onClick={() => setShowHistory(!showHistory)}>
                    {showHistory ? 'Ocultar Historial' : 'Ver Historial de Publicaciones'}
                 </NeumorphicButton>
            </div>
            {showHistory && (
              <>
                <div className="text-center mb-6 space-y-2">
                  <NeumorphicButton
                    onClick={handleCreatePortfolio}
                    className="bg-sky-100 !shadow-[5px_5px_10px_#aed0e6,_-5px_-5px_10px_#ffffff] active:!shadow-[inset_4px_4px_8px_#aed0e6,_inset_-4px_-4px_8px_#ffffff]"
                    disabled={selectedHistoryItems.size === 0}
                  >
                    Crear Portafolio ({selectedHistoryItems.size})
                  </NeumorphicButton>
                  <p className="text-sm text-slate-600">Selecciona las entradas que quieres incluir en el portafolio.</p>
                </div>

                <div className="space-y-6">
                    {history.map(item => (
                      <div 
                        key={item.id} 
                        onClick={() => handleToggleHistorySelection(item.id)}
                        className="cursor-pointer"
                        role="checkbox"
                        aria-checked={selectedHistoryItems.has(item.id)}
                        tabIndex={0}
                        onKeyDown={(e) => (e.key === ' ' || e.key === 'Enter') && handleToggleHistorySelection(item.id)}
                      >
                        <NeumorphicCard className={`!shadow-[5px_5px_10px_#c5c5c5,_-5px_-5px_10px_#ffffff] transition-all duration-200 ${selectedHistoryItems.has(item.id) ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-slate-100' : ''}`}>
                           <div className="p-4 flex flex-col sm:flex-row gap-4 items-start">
                                <input 
                                  type="checkbox"
                                  readOnly
                                  checked={selectedHistoryItems.has(item.id)}
                                  className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-1"
                                  tabIndex={-1}
                                />
                                <img src={item.image} alt="History item" className="w-full sm:w-32 h-auto sm:h-32 rounded-lg object-cover shadow-md"/>
                                <div className="flex-grow">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-slate-800">{item.topic}</h3>
                                            <p className="text-xs text-slate-500">{new Date(item.timestamp).toLocaleString()}</p>
                                        </div>
                                        <button 
                                          onClick={(e) => { e.stopPropagation(); handleDeleteHistoryItem(item.id); }} 
                                          className="p-2 rounded-full hover:bg-slate-200 transition-colors shrink-0" aria-label="Eliminar del historial">
                                            <TrashIcon className="w-5 h-5 text-slate-500" />
                                        </button>
                                    </div>
                                    <p className="text-sm text-slate-600 mt-2 line-clamp-3">{item.post}</p>
                                </div>
                           </div>
                        </NeumorphicCard>
                      </div>
                    ))}
                </div>
              </>
            )}
        </section>
      )}
    </div>
  );
}

export default App;