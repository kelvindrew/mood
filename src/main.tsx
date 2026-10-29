import React from 'react';
import ReactDOM from 'react-dom/client';
import { GameProvider, useGame } from './context/GameContext';
import { TVApp } from './tv/TVApp';
import { MobileApp } from './mobile/MobileApp';
import { ConnectionBanner } from './components/ConnectionBanner';
import { startIdleAssetPreloading } from './services/assetPreloader';
import './index.css';

const RootRouter: React.FC = () => {
  const { appMode } = useGame();

  // Masquage fluide du préchargeur natif HTML dès que React a monté la vue
  React.useEffect(() => {
    const preloader = document.getElementById('app-preloader');
    if (preloader) {
      preloader.style.opacity = '0';
      preloader.style.pointerEvents = 'none';
      const timer = setTimeout(() => {
        preloader.remove();
      }, 420);
      return () => clearTimeout(timer);
    }
  }, []);

  // Téléchargement et mise en cache local de tous les modules et assets en arrière-plan
  React.useEffect(() => {
    startIdleAssetPreloading(appMode);
  }, [appMode]);

  if (appMode === 'mobile') {
    return <MobileApp />;
  }

  return <TVApp />;
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <GameProvider>
      <ConnectionBanner />
      <RootRouter />
    </GameProvider>
  </React.StrictMode>
);
