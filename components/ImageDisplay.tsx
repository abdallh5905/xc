
import React from 'react';
import type { ImageData } from '../types';
import Spinner from './Spinner';

interface ImageDisplayProps {
  title: string;
  imageData: ImageData | null;
  isLoading?: boolean;
}

const ImageDisplay: React.FC<ImageDisplayProps> = ({ title, imageData, isLoading = false }) => {
  const imageUrl = imageData ? `data:${imageData.mimeType};base64,${imageData.base64}` : '';

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-xl font-semibold text-gray-300 mb-3">{title}</h2>
      <div className="aspect-video w-full bg-gray-800 rounded-lg shadow-lg flex items-center justify-center border-2 border-gray-700 overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center gap-2 text-gray-400">
            <Spinner className="w-10 h-10"/>
            <span>Generating...</span>
          </div>
        ) : imageData ? (
          <img src={imageUrl} alt={title} className="w-full h-full object-contain" />
        ) : (
          <div className="text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageDisplay;
