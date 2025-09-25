
import React, { useState } from 'react';
import ConfigurationForm from './components/ConfigurationForm';
import ResultsDisplay from './components/ResultsDisplay';
import HistorySection from './components/HistorySection';
import { generateContent } from './services/geminiService';
import useLocalStorage from './hooks/useLocalStorage';
import { GeneratedPost, HistoryItem, FormData } from './types';

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GeneratedPost | null>(null);
  const [history, setHistory] = useLocalStorage<HistoryItem[]>('profilepilot-history', []);
  const [currentTheme, setCurrentTheme] = useState('');

  const handleGenerate = async (formData: FormData) => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    setCurrentTheme(formData.theme);

    try {
      const { text, imageUrl } = await generateContent(formData);
      const wordCount = text.split(/\s+/).filter(Boolean).length;
      const newResult = { text, imageUrl, wordCount };
      setResult(newResult);

      const newHistoryItem: HistoryItem = {
        ...newResult,
        id: new Date().toISOString(),
        theme: formData.theme,
        date: new Date().toISOString(),
      };
      setHistory(prev => [newHistoryItem, ...prev]);

    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ocurrió un error inesperado.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen text-slate-800 p-4 sm:p-8">
      <header className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-700">ProfilePilot <i className="fas fa-rocket text-blue-500"></i></h1>
        <p className="text-slate-500 mt-2">Tu asistente IA para crear publicaciones de LinkedIn impactantes.</p>
      </header>

      <main className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          <div className="w-full">
            <ConfigurationForm onGenerate={handleGenerate} isLoading={isLoading} error={error} />
          </div>
          <div className="w-full lg:sticky top-8">
            <ResultsDisplay isLoading={isLoading} result={result} onClear={handleClear} />
          </div>
        </div>
        
        <HistorySection history={history} setHistory={setHistory} />
      </main>

      <footer className="text-center mt-16 text-slate-400 text-sm">
        <p>Desarrollado por Víctor Huerta © 2025</p>
      </footer>
    </div>
  );
}

export default App;
