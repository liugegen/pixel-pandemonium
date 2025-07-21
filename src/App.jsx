// src/App.jsx
import React, { useState } from 'react'; // 1. Import useState
import { ConnectButton } from '@rainbow-me/rainbowkit';
import './App.css';
import CanvasGrid from './components/CanvasGrid';
import { MultisynqProvider } from './components/MultisynqProvider';
import ColorPalette from './components/ColorPalette'; // 2. Import ColorPalette

function App() {
  
  const [selectedColor, setSelectedColor] = useState('#000000'); // Default ke hitam

  return (
    <MultisynqProvider>
      <div className="app-container">
        <header className="app-header">
          <h1>Pixel Pandemonium</h1>
          <ConnectButton />
        </header>
        <main>
          {/* 4. Tampilkan ColorPalette di atas kanvas */}
          <div className="main-content">
            <ColorPalette 
              selectedColor={selectedColor} 
              onColorChange={setSelectedColor} 
            />
            {/* 5. Berikan warna yang dipilih ke CanvasGrid */}
            <CanvasGrid selectedColor={selectedColor} />
          </div>
        </main>
      </div>
    </MultisynqProvider>
  );
}

export default App;
