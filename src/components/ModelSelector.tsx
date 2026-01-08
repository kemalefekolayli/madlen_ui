import { useState, useRef, useEffect } from 'react';
import type { Model } from '../types';

interface ModelSelectorProps {
  models: Model[];
  selectedModel: string;
  onSelectModel: (modelId: string) => void;
  loading?: boolean;
}

export function ModelSelector({ models, selectedModel, onSelectModel, loading }: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedModelData = models.find(m => m.id === selectedModel);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cream-100 dark:bg-dark-400 
                   border border-cream-300 dark:border-dark-100
                   hover:bg-cream-200 dark:hover:bg-dark-300 
                   transition-all duration-200
                   text-sm font-medium text-dark-200 dark:text-slate-200
                   disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg className="w-4 h-4 text-madlen-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        <span className="max-w-[150px] truncate">
          {loading ? 'Yükleniyor...' : (selectedModelData?.name || 'Model Seç')}
        </span>
        <svg 
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 max-h-96 overflow-y-auto
                        bg-white dark:bg-dark-400 rounded-xl shadow-medium
                        border border-cream-300 dark:border-dark-100
                        z-50 py-2">
          {models.length === 0 ? (
            <div className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">
              Model bulunamadı
            </div>
          ) : (
            models.map((model) => (
              <button
                key={model.id}
                onClick={() => {
                  onSelectModel(model.id);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-3 transition-all duration-150
                  ${selectedModel === model.id 
                    ? 'bg-madlen-50 dark:bg-madlen-500/20' 
                    : 'hover:bg-cream-100 dark:hover:bg-dark-300'
                  }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`font-medium text-sm ${
                    selectedModel === model.id 
                      ? 'text-madlen-600 dark:text-madlen-400' 
                      : 'text-dark-200 dark:text-slate-200'
                  }`}>
                    {model.name}
                  </span>
                  {model.free && (
                    <span className="px-2 py-0.5 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">
                      Ücretsiz
                    </span>
                  )}
                </div>
                {model.description && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {model.description}
                  </p>
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
