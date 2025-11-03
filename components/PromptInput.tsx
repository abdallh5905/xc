import React from 'react';
import Spinner from './Spinner';

interface PromptInputProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

const PromptInput: React.FC<PromptInputProps> = ({ prompt, setPrompt, onSubmit, isLoading }) => {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !event.shiftKey && !isLoading) {
      event.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="اكتب وصفك هنا يا رايق"
        className="flex-grow bg-gray-700 text-gray-200 placeholder-gray-400 border border-gray-600 rounded-md p-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition duration-200"
        disabled={isLoading}
        dir="auto"
      />
      <button
        onClick={onSubmit}
        disabled={isLoading || !prompt}
        className="flex items-center justify-center bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-md transition duration-200 shadow-md"
      >
        {isLoading ? (
          <>
            <Spinner className="w-5 h-5 mr-2" />
            <span>Generating...</span>
          </>
        ) : (
          'Generate'
        )}
      </button>
    </div>
  );
};

export default PromptInput;