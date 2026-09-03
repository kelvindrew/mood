import React from 'react';
import ReactDOM from 'react-dom/client';
import { GameProvider, useGame } from './context/GameContext';
import { TVApp } from './tv/TVApp';
import { MobileApp } from './mobile/MobileApp';
import { ConnectionBanner } from './components/ConnectionBanner';
import './index.css';

const RootRouter: React.FC = () => {
  const { appMode } = useGame();

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
