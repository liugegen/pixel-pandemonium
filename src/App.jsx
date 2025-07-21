import React, { useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import './App.css';
import CanvasGrid from './components/CanvasGrid';
import { MultisynqProvider } from './components/MultisynqProvider';
import ColorPalette from './components/ColorPalette';
import Stats from './components/Stats';
import Chat from './components/Chat';
import PixelEffects from './components/PixelEffects';
import EventManager from './components/EventManager';
import EventNotification from './components/EventNotification';
import PowerUps from './components/PowerUps';
import NFTMinter from './components/NFTMinter';

function App() {
  const [selectedColor, setSelectedColor] = useState('#000000');

  return (
    <MultisynqProvider>
      <div className="app-container">
        <header className="app-header">
          <div className="header-content">
            <div className="logo-section">
              <h1 className="app-title">Pixel Pandemonium</h1>
              <p className="app-subtitle">Create, Collaborate, Mint</p>
            </div>
            <div className="connect-section">
              <ConnectButton />
            </div>
          </div>
        </header>
        
        <main className="main-content">
          <div className="content-grid">
            <aside className="sidebar-left">
              <div className="widget-container">
                <Stats />
              </div>
              <div className="widget-container">
                <PowerUps />
              </div>
              <div className="widget-container">
                <EventManager />
              </div>
            </aside>

            <section className="canvas-section">
              <div className="canvas-controls">
                <ColorPalette 
                  selectedColor={selectedColor} 
                  onColorChange={setSelectedColor} 
                />
              </div>
              <div className="canvas-wrapper">
                <CanvasGrid selectedColor={selectedColor} />
              </div>
              <div className="action-controls">
                <NFTMinter />
              </div>
            </section>

            <aside className="sidebar-right">
              <div className="widget-container chat-widget">
                <Chat />
              </div>
            </aside>
          </div>
        </main>

        <footer className="app-footer">
          <div className="footer-content">
            <p>Powered by <a href="https://github.com/liugegen" target="_blank" rel="noopener noreferrer">GitHub - liugegen</a></p>
          </div>
        </footer>

        <PixelEffects />
        <EventNotification />
      </div>
    </MultisynqProvider>
  );
}

export default App;
