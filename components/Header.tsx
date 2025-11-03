import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="text-center p-6 md:p-8 bg-gray-800/50 border border-gray-700 rounded-xl shadow-lg mb-6">
      <h1 className="inline-block text-5xl md:text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600 [text-shadow:1px_1px_3px_rgba(0,0,0,0.4)]">
        Admin البلد
      </h1>
      <p className="mt-4 text-xl text-gray-300">
        Edit images with the power of AI. Just upload an image, type a command, and see the magic.
      </p>
    </header>
  );
};

export default Header;