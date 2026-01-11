import React, { useRef, useCallback } from 'react';
import { ImagePlus, X, AlertCircle } from 'lucide-react';
import { validateImage, createPreviewUrl, formatFileSize, ALLOWED_IMAGE_TYPES } from '../utils/imageUtils';

interface ImagePreview {
  file: File;
  previewUrl: string;
}

interface ImageUploadProps {
  selectedImages: ImagePreview[];
  onImagesChange: (images: ImagePreview[]) => void;
  maxImages?: number;
  disabled?: boolean;
  supportsVision: boolean;
  onVisionWarning?: () => void;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  selectedImages,
  onImagesChange,
  maxImages = 4,
  disabled = false,
  supportsVision,
  onVisionWarning
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [isDragOver, setIsDragOver] = React.useState(false);

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    // Check if model supports vision
    if (!supportsVision) {
      onVisionWarning?.();
      return;
    }

    setError(null);
    const newImages: ImagePreview[] = [];
    const errors: string[] = [];

    // Check if adding would exceed max
    const remainingSlots = maxImages - selectedImages.length;
    const filesToProcess = Array.from(files).slice(0, remainingSlots);

    if (files.length > remainingSlots) {
      errors.push(`En fazla ${maxImages} resim ekleyebilirsiniz.`);
    }

    for (const file of filesToProcess) {
      const validation = validateImage(file);
      if (validation.valid) {
        newImages.push({
          file,
          previewUrl: createPreviewUrl(file)
        });
      } else {
        errors.push(`${file.name}: ${validation.error}`);
      }
    }

    if (errors.length > 0) {
      setError(errors.join('\n'));
    }

    if (newImages.length > 0) {
      onImagesChange([...selectedImages, ...newImages]);
    }
  }, [selectedImages, maxImages, supportsVision, onVisionWarning, onImagesChange]);

  const handleRemoveImage = useCallback((index: number) => {
    const imageToRemove = selectedImages[index];
    URL.revokeObjectURL(imageToRemove.previewUrl);
    const newImages = selectedImages.filter((_, i) => i !== index);
    onImagesChange(newImages);
    setError(null);
  }, [selectedImages, onImagesChange]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && supportsVision) {
      setIsDragOver(true);
    }
  }, [disabled, supportsVision]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    
    if (!disabled) {
      handleFileSelect(e.dataTransfer.files);
    }
  }, [disabled, handleFileSelect]);

  const handleClick = () => {
    if (!supportsVision) {
      onVisionWarning?.();
      return;
    }
    fileInputRef.current?.click();
  };

  return (
    <div className="relative">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={ALLOWED_IMAGE_TYPES.join(',')}
        multiple
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
        disabled={disabled || !supportsVision}
      />

      {/* Image Previews */}
      {selectedImages.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2 p-2 bg-cream-100 dark:bg-dark-300 rounded-xl">
          {selectedImages.map((image, index) => (
            <div 
              key={index}
              className="relative group w-20 h-20 rounded-lg overflow-hidden border-2 border-cream-300 dark:border-dark-100"
            >
              <img
                src={image.previewUrl}
                alt={`Yüklenen resim ${index + 1}`}
                className="w-full h-full object-cover"
              />
              {/* File size overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs px-1 py-0.5 text-center">
                {formatFileSize(image.file.size)}
              </div>
              {/* Remove button */}
              <button
                onClick={() => handleRemoveImage(index)}
                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full 
                           opacity-0 group-hover:opacity-100 transition-opacity duration-200
                           hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
                title="Resmi kaldır"
              >
                <X size={12} />
              </button>
            </div>
          ))}
          
          {/* Add more button */}
          {selectedImages.length < maxImages && (
            <button
              onClick={handleClick}
              disabled={disabled}
              className="w-20 h-20 rounded-lg border-2 border-dashed border-cream-400 dark:border-dark-100
                         flex items-center justify-center
                         hover:border-madlen-500 hover:bg-madlen-50 dark:hover:bg-madlen-500/10
                         transition-all duration-200
                         disabled:opacity-50 disabled:cursor-not-allowed"
              title="Daha fazla resim ekle"
            >
              <ImagePlus size={20} className="text-slate-400" />
            </button>
          )}
        </div>
      )}

      {/* Drop zone indicator */}
      {isDragOver && (
        <div 
          className="absolute inset-0 bg-madlen-500/20 border-2 border-dashed border-madlen-500 
                     rounded-xl flex items-center justify-center z-10"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="text-madlen-600 dark:text-madlen-400 font-medium">
            Resmi buraya bırakın
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="flex items-start gap-2 p-2 mb-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-xs">
          <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
          <span className="whitespace-pre-wrap">{error}</span>
        </div>
      )}

      {/* Attach button (when no images) */}
      {selectedImages.length === 0 && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <button
            onClick={handleClick}
            disabled={disabled}
            className={`p-2.5 rounded-full transition-all duration-200
              ${supportsVision 
                ? 'hover:bg-madlen-100 dark:hover:bg-madlen-500/20 text-slate-500 hover:text-madlen-600 dark:hover:text-madlen-400' 
                : 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
              }
              disabled:opacity-50 disabled:cursor-not-allowed`}
            title={supportsVision ? "Resim ekle" : "Bu model görsel desteklemiyor"}
          >
            <ImagePlus size={20} />
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
