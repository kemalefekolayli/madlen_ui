import type { ImageContent } from '../types';

// Allowed image types
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

// Maximum file size (5MB)
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

// Validate image before upload
export const validateImage = (file: File): { valid: boolean; error?: string } => {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { 
      valid: false, 
      error: `Desteklenmeyen format. Lütfen ${ALLOWED_IMAGE_TYPES.map(t => t.split('/')[1].toUpperCase()).join(', ')} formatında bir resim seçin.` 
    };
  }
  
  if (file.size > MAX_IMAGE_SIZE) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
    return { 
      valid: false, 
      error: `Dosya boyutu çok büyük (${sizeMB} MB). Maksimum 5 MB olmalıdır.` 
    };
  }
  
  return { valid: true };
};

// Convert File to base64 (without data URI prefix)
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove "data:image/png;base64," prefix
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
};

// Convert File to ImageContent object
export const fileToImageContent = async (file: File): Promise<ImageContent> => {
  const base64 = await fileToBase64(file);
  return {
    type: 'base64',
    data: base64,
    mediaType: file.type
  };
};

// Convert multiple files to ImageContent array
export const filesToImageContents = async (files: File[]): Promise<ImageContent[]> => {
  return Promise.all(files.map(fileToImageContent));
};

// Create object URL for preview
export const createPreviewUrl = (file: File): string => {
  return URL.createObjectURL(file);
};

// Revoke object URL to free memory
export const revokePreviewUrl = (url: string): void => {
  URL.revokeObjectURL(url);
};

// Get image dimensions from a File
export const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.width, height: img.height });
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Resim yüklenemedi'));
    };
    
    img.src = url;
  });
};

// Format file size for display
export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

// Create base64 data URL from ImageContent (for displaying saved images)
export const imageContentToDataUrl = (image: ImageContent): string => {
  if (image.type === 'url') {
    return image.data;
  }
  return `data:${image.mediaType};base64,${image.data}`;
};
