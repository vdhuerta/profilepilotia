import React, { useState } from 'react';
import { THEMES, WORD_COUNTS } from '../constants';
import NeumorphicCard from './NeumorphicCard';
import { FormData } from '../types';

interface ConfigurationFormProps {
  onGenerate: (data: FormData) => void;
  isLoading: boolean;
  error: string | null;
}

const ConfigurationForm: React.FC<ConfigurationFormProps> = ({ onGenerate, isLoading, error }) => {
  const [themes, setThemes] = useState<string[]>(THEMES);
  const [isAddingNewTheme, setIsAddingNewTheme] = useState(false);
  const [newTheme, setNewTheme] = useState('');
  
  const [formData, setFormData] = useState<FormData>({
    theme: themes[0],
    details: '',
    generativeLinks: [],
    pasteLinks: [],
    wordCount: WORD_COUNTS[1],
    imageDescription: '',
  });

  const [currentGenerativeLink, setCurrentGenerativeLink] = useState('');
  const [currentPasteLink, setCurrentPasteLink] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveNewTheme = () => {
    if (newTheme.trim()) {
      const updatedThemes = [...themes, newTheme.trim()];
      setThemes(updatedThemes);
      setFormData(prev => ({ ...prev, theme: newTheme.trim() }));
      setNewTheme('');
      setIsAddingNewTheme(false);
    }
  };
  
  const addLink = (type: 'generativeLinks' | 'pasteLinks') => {
    const link = type === 'generativeLinks' ? currentGenerativeLink : currentPasteLink;
    if (link.trim() && !formData[type].includes(link.trim())) {
      setFormData(prev => ({ ...prev, [type]: [...prev[type], link.trim()] }));
      if(type === 'generativeLinks') setCurrentGenerativeLink('');
      else setCurrentPasteLink('');
    }
  };

  const removeLink = (type: 'generativeLinks' | 'pasteLinks', linkToRemove: string) => {
    setFormData(prev => ({ ...prev, [type]: prev[type].filter(link => link !== linkToRemove) }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate(formData);
  };

  const handleClearForm = () => {
    setFormData({
      theme: themes[0],
      details: '',
      generativeLinks: [],
      pasteLinks: [],
      wordCount: WORD_COUNTS[1],
      imageDescription: '',
    });
    setCurrentGenerativeLink('');
    setCurrentPasteLink('');
  };

  return (
    <NeumorphicCard>
      <form onSubmit={handleSubmit} className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-700 mb-4">Configuración de la Publicación</h2>
        
        {/* 1. Theme */}
        <div className="space-y-2">
          <label className="font-semibold text-slate-600">1. Tema de la Publicación</label>
          {isAddingNewTheme ? (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <input type="text" value={newTheme} onChange={(e) => setNewTheme(e.target.value)} placeholder="Escribe un nuevo tema" className="flex-grow w-full bg-slate-100 rounded-lg p-3 focus:outline-none shadow-[inset_4px_4px_8px_#c5c5c5,inset_-4px_-4px_8px_#ffffff]" />
              <div className="flex-shrink-0 flex gap-2">
                  <button type="button" onClick={handleSaveNewTheme} className="flex-1 sm:flex-auto px-4 py-2 bg-slate-200 rounded-lg shadow-[4px_4px_8px_#c5c5c5,_-4px_-4px_8px_#ffffff] active:shadow-[inset_4px_4px_8px_#c5c5c5,inset_-4px_-4px_8px_#ffffff]">Guardar</button>
                  <button type="button" onClick={() => setIsAddingNewTheme(false)} className="flex-1 sm:flex-auto px-4 py-2 bg-slate-200 rounded-lg shadow-[4px_4px_8px_#c5c5c5,_-4px_-4px_8px_#ffffff] active:shadow-[inset_4px_4px_8px_#c5c5c5,inset_-4px_-4px_8px_#ffffff]">X</button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="relative flex-grow w-full">
                <select name="theme" value={formData.theme} onChange={handleInputChange} className="w-full bg-slate-100 rounded-lg p-3 pr-10 focus:outline-none shadow-[inset_4px_4px_8px_#c5c5c5,inset_-4px_-4px_8px_#ffffff] appearance-none">
                  {themes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                    <i className="fas fa-chevron-down"></i>
                </div>
              </div>
              <button type="button" onClick={() => setIsAddingNewTheme(true)} className="flex-shrink-0 px-4 py-2 bg-slate-200 rounded-lg shadow-[4px_4px_8px_#c5c5c5,_-4px_-4px_8px_#ffffff] active:shadow-[inset_4px_4px_8px_#c5c5c5,inset_-4px_-4px_8px_#ffffff]">Tema Nuevo</button>
            </div>
          )}
        </div>

        {/* 2. Details */}
        <div className="space-y-2">
            <label htmlFor="details" className="font-semibold text-slate-600">2. Detalles del Tema (Opcional)</label>
            <textarea id="details" name="details" value={formData.details} onChange={handleInputChange} rows={3} placeholder="Añade contexto, ideas clave, un ángulo específico..." className="w-full bg-slate-100 rounded-lg p-3 focus:outline-none shadow-[inset_4px_4px_8px_#c5c5c5,inset_-4px_-4px_8px_#ffffff]"></textarea>
        </div>

        {/* 3. Generative Links */}
        <div className="space-y-2">
            <div className="flex items-center gap-2">
                <label className="font-semibold text-slate-600">3. Enlaces Generativos (Opcional)</label>
                <div className="relative group flex items-center">
                    <i className="fas fa-question-circle text-slate-400 cursor-help"></i>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-3 bg-slate-800 text-white text-sm rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
                        Usa estos enlaces para que la IA busque información en la web y base la publicación en su contenido. Ideal para noticias o artículos recientes.
                        <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-slate-800"></div>
                    </div>
                </div>
            </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <input type="url" value={currentGenerativeLink} onChange={(e) => setCurrentGenerativeLink(e.target.value)} placeholder="https://ejemplo.com" className="flex-grow w-full bg-slate-100 rounded-lg p-3 focus:outline-none shadow-[inset_4px_4px_8px_#c5c5c5,inset_-4px_-4px_8px_#ffffff]" />
            <button type="button" onClick={() => addLink('generativeLinks')} className="flex-shrink-0 px-4 py-2 bg-slate-200 rounded-lg shadow-[4px_4px_8px_#c5c5c5,_-4px_-4px_8px_#ffffff] active:shadow-[inset_4px_4px_8px_#c5c5c5,inset_-4px_-4px_8px_#ffffff]">Añadir</button>
          </div>
          <ul className="space-y-1 pt-2">
            {formData.generativeLinks.map(link => (
              <li key={link} className="flex justify-between items-center text-sm text-slate-500 bg-slate-200 p-2 rounded-md">
                <span className="truncate pr-2">{link}</span>
                <button type="button" onClick={() => removeLink('generativeLinks', link)}><i className="fas fa-trash-alt text-red-500"></i></button>
              </li>
            ))}
          </ul>
        </div>
        
        {/* 4. Paste Links */}
        <div className="space-y-2">
            <div className="flex items-center gap-2">
                <label className="font-semibold text-slate-600">4. Enlaces a Pegar (Opcional)</label>
                <div className="relative group flex items-center">
                    <i className="fas fa-question-circle text-slate-400 cursor-help"></i>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-3 bg-slate-800 text-white text-sm rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
                        Estos enlaces se añadirán directamente al final de tu publicación. Úsalos para dirigir tráfico a tu portafolio, blog, etc.
                        <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-slate-800"></div>
                    </div>
                </div>
            </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <input type="url" value={currentPasteLink} onChange={(e) => setCurrentPasteLink(e.target.value)} placeholder="https://mi-portfolio.com" className="flex-grow w-full bg-slate-100 rounded-lg p-3 focus:outline-none shadow-[inset_4px_4px_8px_#c5c5c5,inset_-4px_-4px_8px_#ffffff]" />
            <button type="button" onClick={() => addLink('pasteLinks')} className="flex-shrink-0 px-4 py-2 bg-slate-200 rounded-lg shadow-[4px_4px_8px_#c5c5c5,_-4px_-4px_8px_#ffffff] active:shadow-[inset_4px_4px_8px_#c5c5c5,inset_-4px_-4px_8px_#ffffff]">Añadir</button>
          </div>
           <ul className="space-y-1 pt-2">
            {formData.pasteLinks.map(link => (
              <li key={link} className="flex justify-between items-center text-sm text-slate-500 bg-slate-200 p-2 rounded-md">
                <span className="truncate pr-2">{link}</span>
                <button type="button" onClick={() => removeLink('pasteLinks', link)}><i className="fas fa-trash-alt text-red-500"></i></button>
              </li>
            ))}
          </ul>
        </div>

        {/* 5. Word Count */}
        <div className="space-y-2">
          <label htmlFor="wordCount" className="font-semibold text-slate-600">5. Cantidad de Palabras</label>
          <div className="relative">
            <select id="wordCount" name="wordCount" value={formData.wordCount} onChange={handleInputChange} className="w-full bg-slate-100 rounded-lg p-3 pr-10 focus:outline-none shadow-[inset_4px_4px_8px_#c5c5c5,inset_-4px_-4px_8px_#ffffff] appearance-none">
              {WORD_COUNTS.map(wc => <option key={wc} value={wc}>{wc}</option>)}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                <i className="fas fa-chevron-down"></i>
            </div>
          </div>
        </div>
        
        {/* 6. Image Description */}
        <div className="space-y-2">
          <label htmlFor="imageDescription" className="font-semibold text-slate-600">6. Descripción de la Imagen (Obligatorio)</label>
          <input type="text" id="imageDescription" name="imageDescription" value={formData.imageDescription} onChange={handleInputChange} placeholder="Ej: Un robot amigable ayudando a un niño con sus deberes" className="w-full bg-slate-100 rounded-lg p-3 focus:outline-none shadow-[inset_4px_4px_8px_#c5c5c5,inset_-4px_-4px_8px_#ffffff]" />
        </div>
        
        {/* 7. Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-2">
          <button 
            type="button" 
            onClick={handleClearForm}
            disabled={isLoading} 
            className="w-full sm:w-2/5 text-lg font-bold text-slate-600 py-4 rounded-lg bg-slate-200 transition-all duration-200 ease-in-out
                       shadow-[8px_8px_16px_#c5c5c5,_-8px_-8px_16px_#ffffff] 
                       active:shadow-[inset_8px_8px_16px_#c5c5c5,inset_-8px_-8px_16px_#ffffff]
                       disabled:opacity-50 disabled:cursor-not-allowed disabled:active:shadow-[8px_8px_16px_#c5c5c5,_-8px_-8px_16px_#ffffff]">
            Limpiar
          </button>
          <button 
            type="submit" 
            disabled={!formData.imageDescription || isLoading} 
            className="w-full sm:w-3/5 text-lg font-bold text-slate-700 py-4 rounded-lg bg-slate-200 transition-all duration-200 ease-in-out
                       shadow-[8px_8px_16px_#c5c5c5,_-8px_-8px_16px_#ffffff] 
                       active:shadow-[inset_8px_8px_16px_#c5c5c5,inset_-8px_-8px_16px_#ffffff]
                       disabled:opacity-50 disabled:cursor-not-allowed disabled:active:shadow-[8px_8px_16px_#c5c5c5,_-8px_-8px_16px_#ffffff]">
            {isLoading ? 'Generando...' : 'Generar Publicación'}
          </button>
        </div>

        {/* 8. Error Zone */}
        {error && <p className="text-red-500 text-center font-medium">{error}</p>}
      </form>
    </NeumorphicCard>
  );
};

export default ConfigurationForm;