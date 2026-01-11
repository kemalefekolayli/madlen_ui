import React, { type FormEvent, useRef, useEffect, useState, useCallback } from 'react';
import { Send, StopCircle } from 'lucide-react';
import { ImageUpload } from './ImageUpload';
import { VisionWarningModal } from './VisionWarningModal';
import type { Model, ImageContent } from '../types';
import { filesToImageContents, revokePreviewUrl } from '../utils/imageUtils';

interface ImagePreview {
  file: File;
  previewUrl: string;
}

interface ChatInputProps {
  onSendMessage: (message: string, images?: ImageContent[]) => void;
  isLoading: boolean;
  input: string;
  setInput: (value: string) => void;
  models: Model[];
  selectedModel: string;
  onSelectModel: (modelId: string) => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({ 
  onSendMessage, 
  isLoading, 
  input, 
  setInput,
  models,
  selectedModel,
  onSelectModel
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [selectedImages, setSelectedImages] = useState<ImagePreview[]>([]);
  const [showVisionWarning, setShowVisionWarning] = useState(false);

  // Get current model info
  const currentModel = models.find(m => m.id === selectedModel) || null;
  const supportsVision = currentModel?.supportsVision ?? false;
  const visionModels = models.filter(m => m.supportsVision);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'inherit';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      selectedImages.forEach(img => revokePreviewUrl(img.previewUrl));
    };
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && selectedImages.length === 0) || isLoading) return;

    // Check if trying to send images with non-vision model
    if (selectedImages.length > 0 && !supportsVision) {
      setShowVisionWarning(true);
      return;
    }

    let images: ImageContent[] | undefined;
    
    if (selectedImages.length > 0) {
      images = await filesToImageContents(selectedImages.map(img => img.file));
    }

    onSendMessage(input, images);
    
    // Clear images after send
    selectedImages.forEach(img => revokePreviewUrl(img.previewUrl));
    setSelectedImages([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleImagesChange = useCallback((images: ImagePreview[]) => {
    setSelectedImages(images);
  }, []);

  const handleVisionWarning = useCallback(() => {
    setShowVisionWarning(true);
  }, []);

  const handleModelSelect = useCallback((modelId: string) => {
    onSelectModel(modelId);
  }, [onSelectModel]);

  const canSend = (input.trim() || selectedImages.length > 0) && !isLoading;

  return (
    <>
      <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
        <form 
          onSubmit={handleSubmit} 
          className="max-w-4xl mx-auto"
        >
          {/* Image previews area */}
          {selectedImages.length > 0 && (
            <div className="mb-2">
              <ImageUpload
                selectedImages={selectedImages}
                onImagesChange={handleImagesChange}
                disabled={isLoading}
                supportsVision={supportsVision}
                onVisionWarning={handleVisionWarning}
              />
            </div>
          )}

          {/* Input area */}
          <div className="relative flex items-end gap-2 bg-gray-50 dark:bg-gray-800 p-2 rounded-3xl border border-gray-200 dark:border-gray-700 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all shadow-sm">
            {/* Image upload button */}
            {selectedImages.length === 0 && (
              <ImageUpload
                selectedImages={selectedImages}
                onImagesChange={handleImagesChange}
                disabled={isLoading}
                supportsVision={supportsVision}
                onVisionWarning={handleVisionWarning}
              />
            )}

            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={selectedImages.length > 0 ? "Resim hakkında bir şeyler yazın..." : "Bir mesaj yazın..."}
              className="flex-1 max-h-32 bg-transparent border-none focus:ring-0 resize-none py-3 px-4 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
              disabled={isLoading}
            />
            
            <button
              type="submit"
              disabled={!canSend}
              className={`p-3 rounded-full flex-shrink-0 transition-all duration-200 ${
                canSend
                  ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md transform hover:scale-105'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isLoading ? <StopCircle size={20} className="animate-pulse" /> : <Send size={20} />}
            </button>
          </div>
        </form>

        <div className="text-center mt-2 text-xs text-gray-400 dark:text-gray-500">
          {selectedImages.length > 0 
            ? `${selectedImages.length} resim eklendi • ` 
            : ''}
          Madlen AI hata yapabilir. Önemli bilgileri kontrol edin.
        </div>
      </div>

      {/* Vision Warning Modal */}
      <VisionWarningModal
        isOpen={showVisionWarning}
        onClose={() => setShowVisionWarning(false)}
        currentModel={currentModel}
        visionModels={visionModels}
        onSelectModel={handleModelSelect}
      />
    </>
  );
};
