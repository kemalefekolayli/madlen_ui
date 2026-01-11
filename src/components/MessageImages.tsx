import React, { useState } from 'react';
import type { ImageContent } from '../types';
import { imageContentToDataUrl } from '../utils/imageUtils';
import { ImagePreviewModal } from './ImagePreviewModal';

interface MessageImagesProps {
  images: ImageContent[];
}

export const MessageImages: React.FC<MessageImagesProps> = ({ images }) => {
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  if (!images || images.length === 0) return null;

  const handleImageClick = (image: ImageContent) => {
    setPreviewImage(imageContentToDataUrl(image));
  };

  return (
    <>
      <div className={`flex flex-wrap gap-2 mb-2 ${images.length === 1 ? '' : 'grid grid-cols-2'}`}>
        {images.map((image, index) => {
          const imageUrl = imageContentToDataUrl(image);
          return (
            <button
              key={index}
              onClick={() => handleImageClick(image)}
              className={`relative overflow-hidden rounded-lg cursor-pointer 
                         hover:opacity-90 transition-opacity duration-200
                         focus:outline-none focus:ring-2 focus:ring-madlen-500 focus:ring-offset-2
                         ${images.length === 1 ? 'max-w-[280px]' : 'w-full aspect-square'}`}
            >
              <img
                src={imageUrl}
                alt={`Attached image ${index + 1}`}
                className={`w-full h-full ${images.length === 1 ? 'rounded-lg' : 'object-cover'}`}
              />
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors duration-200 flex items-center justify-center">
                <span className="opacity-0 hover:opacity-100 text-white bg-black/50 px-2 py-1 rounded text-xs">
                  Büyütmek için tıkla
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Full-size preview modal */}
      {previewImage && (
        <ImagePreviewModal
          imageUrl={previewImage}
          onClose={() => setPreviewImage(null)}
        />
      )}
    </>
  );
};

export default MessageImages;
