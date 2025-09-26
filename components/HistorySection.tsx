import React, { useState } from 'react';
import { HistoryItem } from '../types';
import NeumorphicCard from './NeumorphicCard';

interface HistorySectionProps {
  history: HistoryItem[];
  setHistory: React.Dispatch<React.SetStateAction<HistoryItem[]>>;
}

const HistorySection: React.FC<HistorySectionProps> = ({ history, setHistory }) => {
  const [showHistory, setShowHistory] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const toggleSelection = (id: string) => {
    setSelectedItems(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(id)) {
        newSelection.delete(id);
      } else {
        newSelection.add(id);
      }
      return newSelection;
    });
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      setHistory(prev => prev.filter(item => item.id !== itemToDelete));
      setItemToDelete(null);
    }
  };
  
  const createPortfolio = () => {
    const itemsToExport = history.filter(item => selectedItems.has(item.id));
    if (itemsToExport.length === 0) return;

    const portfolioHTML = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Portafolio de ProfilePilot</title>
          <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f0f2f5; color: #333; margin: 0; padding: 2rem; }
              h1 { color: #1e293b; text-align: center; margin-bottom: 2rem; }
              .post { background-color: #ffffff; border-radius: 16px; box-shadow: 0 10px 20px rgba(0,0,0,0.1); margin-bottom: 2rem; overflow: hidden; display: flex; flex-direction: column; }
              @media (min-width: 768px) { .post { flex-direction: row; } }
              .post-image { width: 100%; height: auto; object-fit: cover; }
              @media (min-width: 768px) { .post-image { width: 40%; max-width: 400px; } }
              .post-content { padding: 2rem; white-space: pre-wrap; word-wrap: break-word; flex-grow: 1; }
              .post-content h2 { margin-top: 0; color: #334155; border-bottom: 2px solid #e2e8f0; padding-bottom: 0.5rem; }
              .post-content p { line-height: 1.6; }
              .post-meta { font-size: 0.8rem; color: #64748b; margin-top: 1.5rem; }
          </style>
      </head>
      <body>
          <h1>Mi Portafolio Generado</h1>
          ${itemsToExport.map(item => `
            <div class="post">
                ${item.imageUrl ? `<img class="post-image" src="${item.imageUrl}" alt="Imagen para ${item.theme}">` : ''}
                <div class="post-content">
                    <h2>${item.theme}</h2>
                    <p>${item.text.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>
                    <div class="post-meta">
                      <span>Fecha: ${new Date(item.date).toLocaleDateString()}</span> | 
                      <span>Palabras: ${item.wordCount}</span>
                    </div>
                </div>
            </div>
          `).join('')}
      </body>
      </html>
    `;

    const blob = new Blob([portfolioHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ProfilePilot-Portfolio.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };


  return (
    <div className="w-full mt-12">
      <div className="text-center">
        <button 
          onClick={() => setShowHistory(!showHistory)}
          className="px-6 py-3 text-lg font-bold text-slate-700 rounded-lg bg-slate-200 transition-all duration-200 ease-in-out shadow-[8px_8px_16px_#c5c5c5,_-8px_-8px_16px_#ffffff] active:shadow-[inset_8px_8px_16px_#c5c5c5,inset_-8px_-8px_16px_#ffffff]">
          {showHistory ? 'Ocultar' : 'Ver'} Historial de Publicaciones ({history.length})
        </button>
      </div>

      {showHistory && (
        <div className="mt-8">
            {history.length > 0 ? (
                <>
                <div className="text-center mb-6">
                    <button 
                    onClick={createPortfolio}
                    disabled={selectedItems.size === 0}
                    className="px-6 py-3 font-bold text-slate-700 rounded-lg bg-slate-200 transition-all duration-200 ease-in-out shadow-[8px_8px_16px_#c5c5c5,_-8px_-8px_16px_#ffffff] active:shadow-[inset_8px_8px_16px_#c5c5c5,inset_-8px_-8px_16px_#ffffff] disabled:opacity-50 disabled:cursor-not-allowed">
                        Crear Portafolio ({selectedItems.size} seleccionados)
                    </button>
                </div>
                <div className="flex flex-col gap-8">
                  {history.map(item => (
                    <NeumorphicCard key={item.id} className="!p-4 flex flex-col sm:flex-row items-center gap-4">
                      <div className="flex-shrink-0 self-center">
                        <input
                          type="checkbox"
                          checked={selectedItems.has(item.id)}
                          onChange={() => toggleSelection(item.id)}
                          className="h-6 w-6 accent-blue-500 cursor-pointer"
                          aria-label={`Seleccionar post sobre ${item.theme}`}
                        />
                      </div>
                      
                      {item.imageUrl ? (
                         <img
                          src={item.imageUrl}
                          alt={item.theme}
                          className="w-full sm:w-40 md:w-48 sm:h-auto aspect-[16/9] object-cover rounded-lg flex-shrink-0"
                        />
                      ) : (
                        <div className="w-full sm:w-40 md:w-48 h-auto aspect-[16/9] bg-slate-200 rounded-lg flex-shrink-0 flex items-center justify-center">
                            <i className="fas fa-image-slash text-3xl text-slate-400"></i>
                        </div>
                      )}
                      
                      <div className="flex-grow w-full text-left sm:text-left self-start sm:self-center">
                        <h3 className="font-bold text-slate-700">{item.theme}</h3>
                        <p className="text-sm text-slate-500 h-12 overflow-hidden text-ellipsis my-1">{item.text}</p>
                        <span className="text-xs text-slate-400 mt-1 block">{new Date(item.date).toLocaleString()}</span>
                      </div>
                      
                      <div className="flex-shrink-0 self-center ml-auto pl-2">
                        <button onClick={() => setItemToDelete(item.id)} className="text-red-400 hover:text-red-600" aria-label={`Eliminar post sobre ${item.theme}`}>
                          <i className="fas fa-trash-alt fa-lg"></i>
                        </button>
                      </div>
                    </NeumorphicCard>
                  ))}
                </div>
                </>
            ) : (
                <p className="text-center text-slate-500 mt-8">No hay publicaciones en tu historial.</p>
            )}
        </div>
      )}

      {itemToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <NeumorphicCard className="w-full max-w-sm">
                <h3 className="text-xl font-bold text-slate-700 mb-4">Confirmar Eliminación</h3>
                <p className="text-slate-600 mb-6">¿Estás seguro de que quieres eliminar esta publicación? Esta acción no se puede deshacer.</p>
                <div className="flex justify-end gap-4">
                    <button
                        onClick={() => setItemToDelete(null)}
                        className="px-4 py-2 font-semibold text-slate-700 rounded-lg bg-slate-200 shadow-[4px_4px_8px_#c5c5c5,_-4px_-4px_8px_#ffffff] active:shadow-[inset_4px_4px_8px_#c5c5c5,inset_-4px_-4px_8px_#ffffff]"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={confirmDelete}
                        className="px-4 py-2 font-semibold text-white bg-red-500 rounded-lg shadow-md hover:bg-red-600 transition-colors"
                    >
                        Eliminar
                    </button>
                </div>
            </NeumorphicCard>
        </div>
      )}
    </div>
  );
};

export default HistorySection;