import { useState, useRef, useEffect } from 'react';
import { Eye } from 'lucide-react';
import type { Model } from '../types';

interface ModelSelectorProps {
  models: Model[];
  selectedModel: string;
  onSelectModel: (modelId: string) => void;
  loading?: boolean;
  disabled?: boolean;
}

export function ModelSelector({ models, selectedModel, onSelectModel, loading, disabled }: ModelSelectorProps) {
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

  const toggleOpen = () => {
    if (!disabled && !loading) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleOpen}
        disabled={loading || disabled}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all duration-200 text-sm font-medium
                   ${disabled 
                     ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed dark:bg-dark-300 dark:border-dark-100 dark:text-gray-500' 
                     : 'bg-cream-100 dark:bg-dark-400 border-cream-300 dark:border-dark-100 hover:bg-cream-200 dark:hover:bg-dark-300 text-dark-200 dark:text-slate-200'
                   }`}
      >
        {selectedModelData?.supportsVision && (
          // DÜZELTME: Title prop'u span'a taşındı
          <span title="Görsel destekler" className="flex items-center">
            <Eye size={16} className={disabled ? "text-gray-400" : "text-madlen-500"} />
          </span>
        )}
        
        <span className="max-w-[150px] truncate">
          {loading ? 'Yükleniyor...' : (selectedModelData?.name || 'Model Seç')}
        </span>

        {!disabled && (
          <svg 
            className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </button>

      {isOpen && !disabled && (
        <div className="absolute top-full right-0 mt-2 w-80 max-h-96 overflow-y-auto
                        bg-white dark:bg-dark-400 rounded-xl shadow-medium
                        border border-cream-300 dark:border-dark-100
                        z-[100] py-2">
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
                  <div className="flex items-center gap-2">
                    {model.supportsVision && (
                      // DÜZELTME: Title prop'u span'a taşındı
                      <span title="Görsel destekler" className="flex items-center">
                        <Eye size={14} className="text-madlen-500 flex-shrink-0" />
                      </span>
                    )}
                    <span className={`font-medium text-sm ${
                      selectedModel === model.id 
                        ? 'text-madlen-600 dark:text-madlen-400' 
                        : 'text-dark-200 dark:text-slate-200'
                    }`}>
                      {model.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {model.supportsVision && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full">
                        Vision
                      </span>
                    )}
                    {model.free && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">
                        Ücretsiz
                      </span>
                    )}
                  </div>
                </div>
                {model.description && (
                  <p className={`text-xs text-slate-500 dark:text-slate-400 mt-1 ${model.supportsVision ? 'pl-5' : ''}`}>
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