import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import ImageDisplay from './components/ImageDisplay';
import PromptInput from './components/PromptInput';
import FileUpload from './components/FileUpload';
import { editImageWithGemini } from './services/geminiService';
import { fileToImageData, fetchAndEncodeImage } from './utils/imageUtils';
import type { ImageData } from './types';
import Spinner from './components/Spinner';

const INITIAL_IMAGE_URL = 'https://picsum.photos/seed/ai-image-editor/1024/768';

const App: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<ImageData | null>(null);
  const [editedImage, setEditedImage] = useState<ImageData | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadInitialImage = async () => {
      try {
        setError(null);
        const imageData = await fetchAndEncodeImage(INITIAL_IMAGE_URL);
        setOriginalImage(imageData);
      } catch (e) {
        setError('Failed to load initial placeholder image. Please try refreshing.');
        console.error(e);
      } finally {
        setIsInitializing(false);
      }
    };
    loadInitialImage();
  }, []);

  const handleFileChange = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);
    try {
      const imageData = await fileToImageData(file);
      setOriginalImage(imageData);
      setEditedImage(null);
      setPrompt('');
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(`Failed to load image: ${errorMessage}`);
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!prompt || !originalImage) {
      setError("Please provide a prompt and ensure an image is loaded.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setEditedImage(null);

    try {
      const newImageBase64 = await editImageWithGemini(originalImage, prompt);
      setEditedImage({
        base64: newImageBase64,
        mimeType: originalImage.mimeType,
      });
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(errorMessage);
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [prompt, originalImage]);
  
  if (isInitializing) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white gap-4">
            <Spinner className="w-12 h-12" />
            <p className="text-lg text-gray-400">Loading Admin البلد...</p>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col p-4">
      <Header />
      <main className="flex-grow container mx-auto w-full max-w-6xl flex flex-col gap-6">
        {error && (
            <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-md relative" role="alert">
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">{error}</span>
                <span className="absolute top-0 bottom-0 right-0 px-4 py-3" onClick={() => setError(null)}>
                    <svg className="fill-current h-6 w-6 text-red-400" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg>
                </span>
            </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ImageDisplay title="Original" imageData={originalImage} />
          <ImageDisplay title="Edited" imageData={editedImage} isLoading={isLoading && !!prompt} />
        </div>

        <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 flex flex-col gap-4 sticky bottom-4">
            <PromptInput 
                prompt={prompt} 
                setPrompt={setPrompt} 
                onSubmit={handleSubmit} 
                isLoading={isLoading} 
            />
            <FileUpload onFileSelect={handleFileChange} disabled={isLoading} />
        </div>
      </main>
    </div>
  );
};

export default App;