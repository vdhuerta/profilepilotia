import React, { useState } from 'react';
import NeumorphicCard from './NeumorphicCard';
import { GeneratedPost } from '../types';

interface ResultsDisplayProps {
  isLoading: boolean;
  result: GeneratedPost | null;
  onClear: () => void;
}

const Spinner: React.FC = () => (
  <div className="border-4 border-slate-300 border-t-slate-500 rounded-full w-12 h-12 animate-spin"></div>
);

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ isLoading, result, onClear }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (result && result.imageUrl) {
      const link = document.createElement('a');
      link.href = result.imageUrl;
      link.download = 'generated-image.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };
  
  if (isLoading) {
    return (
      <NeumorphicCard className="flex flex-col items-center justify-center h-full min-h-[400px]">
        <Spinner />
        <p className="mt-4 text-slate-600 font-semibold text-center">Creando magia...<br/>El agente IA está redactando el texto y diseñando la imagen.</p>
      </NeumorphicCard>
    );
  }

  if (result) {
    return (
      <NeumorphicCard className="h-full">
        <div className="flex flex-col h-full">
          <h2 className="text-2xl font-bold text-slate-700 mb-4 flex-shrink-0">Resultado Generado</h2>
          
          {result.imageUrl ? (
            <div className="relative group mb-4 flex-shrink-0">
              <img src={result.imageUrl} alt="Generated content" className="w-full aspect-video object-cover rounded-lg"/>
              <button 
                onClick={handleDownload} 
                className="absolute top-3 right-3 bg-black bg-opacity-60 text-white w-10 h-10 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-opacity-80"
                aria-label="Descargar imagen"
              >
                <i className="fas fa-download"></i>
              </button>
            </div>
          ) : (
            <div className="mb-4 flex-shrink-0 w-full aspect-video rounded-lg bg-slate-200 flex flex-col items-center justify-center p-4 text-center shadow-[inset_4px_4px_8px_#c5c5c5,inset_-4px_-4px_8px_#ffffff]">
              <i className="fas fa-exclamation-triangle text-3xl text-amber-500 mb-2"></i>
              <p className="text-sm font-semibold text-slate-600">Error al generar la imagen.</p>
              <p className="text-xs text-slate-500">La generación de la imagen falló. Revisa la configuración del servicio y tu clave de API.</p>
            </div>
          )}

          <div className="relative flex-grow mb-4 min-h-[14rem]">
            <div className="absolute inset-0 bg-slate-100 rounded-lg p-3 pr-14 text-slate-800 overflow-y-auto whitespace-pre-wrap shadow-[inset_4px_4px_8px_#c5c5c5,inset_-4px_-4px_8px_#ffffff]">
              {result.text}
            </div>
            <button 
              onClick={handleCopy} 
              className="absolute top-3 right-3 bg-black bg-opacity-60 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-opacity-80 transition-all"
              aria-label="Copiar texto"
            >
                <i className="fas fa-copy fa-lg"></i>
            </button>
            {copied && <span className="absolute top-14 right-1 text-xs bg-slate-700 text-white px-2 py-1 rounded">¡Copiado!</span>}
          </div>
          <div className="flex justify-between items-center text-slate-500 flex-shrink-0">
            <span>Palabras: {result.wordCount}</span>
            <button onClick={onClear} className="px-4 py-2 text-sm bg-slate-200 rounded-lg shadow-[4px_4px_8px_#c5c5c5,_-4px_-4px_8px_#ffffff] active:shadow-[inset_4px_4px_8px_#c5c5c5,inset_-4px_-4px_8px_#ffffff]">
              Limpiar Publicación
            </button>
          </div>
        </div>
      </NeumorphicCard>
    );
  }

  return (
    <NeumorphicCard className="flex flex-col items-center justify-center h-full min-h-[400px]">
      <i className="fas fa-magic text-6xl text-slate-400"></i>
      <p className="mt-4 text-slate-600 font-semibold text-center">Tu publicación aparecerá aquí.<br/>Completa los pasos para generar el contenido.</p>
    </NeumorphicCard>
  );
};

export default ResultsDisplay;