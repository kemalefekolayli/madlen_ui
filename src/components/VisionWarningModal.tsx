import React from 'react';
import { AlertTriangle, Eye, X } from 'lucide-react';
import type { Model } from '../types';

interface VisionWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentModel: Model | null;
  visionModels: Model[];
  onSelectModel: (modelId: string) => void;
}

export const VisionWarningModal: React.FC<VisionWarningModalProps> = ({
  isOpen,
  onClose,
  currentModel,
  visionModels,
  onSelectModel
}) => {
  if (!isOpen) return null;

  const handleSelectModel = (modelId: string) => {
    onSelectModel(modelId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-dark-400 rounded-2xl shadow-xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-cream-300 dark:border-dark-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-full">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <h3 className="text-lg font-semibold text-dark-300 dark:text-white">
              Görsel Desteği Yok
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-cream-200 dark:hover:bg-dark-300 rounded-full transition-colors"
          >
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          <p className="text-slate-600 dark:text-slate-300 mb-4">
            <strong>{currentModel?.name || 'Seçili model'}</strong> görsel/resim girişlerini desteklemiyor. 
            Resim göndermek için aşağıdaki modellerden birini seçin:
          </p>

          {/* Vision-capable models list */}
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {visionModels.length > 0 ? (
              visionModels.map((model) => (
                <button
                  key={model.id}
                  onClick={() => handleSelectModel(model.id)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border border-cream-300 dark:border-dark-100
                             hover:bg-madlen-50 dark:hover:bg-madlen-500/10 hover:border-madlen-300 dark:hover:border-madlen-500/30
                             transition-all duration-200 text-left"
                >
                  <div className="p-2 bg-madlen-100 dark:bg-madlen-500/20 rounded-lg">
                    <Eye size={16} className="text-madlen-600 dark:text-madlen-400" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-dark-300 dark:text-white">
                      {model.name}
                    </div>
                    {model.description && (
                      <div className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                        {model.description}
                      </div>
                    )}
                  </div>
                  {model.free && (
                    <span className="px-2 py-0.5 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">
                      Ücretsiz
                    </span>
                  )}
                </button>
              ))
            ) : (
              <div className="text-center py-4 text-slate-500 dark:text-slate-400">
                Görsel destekleyen model bulunamadı
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-cream-50 dark:bg-dark-500 border-t border-cream-300 dark:border-dark-100">
          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 bg-slate-200 dark:bg-dark-300 text-slate-700 dark:text-slate-300 
                       rounded-xl font-medium hover:bg-slate-300 dark:hover:bg-dark-200 transition-colors"
          >
            İptal
          </button>
        </div>
      </div>
    </div>
  );
};

export default VisionWarningModal;
