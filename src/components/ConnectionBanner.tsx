import React from 'react';
import { useGame, ConnectionState } from '../context/GameContext';
import { WifiOff, Loader2 } from 'lucide-react';

// E9 — bannière de connexion partagée TV / mobile.
// Masquée quand tout va bien (un marqueur discret reste dans le DOM
// pour l'observabilité/tests) ; visible dès que la liaison Socket.IO
// n'est plus saine. La reconnexion automatique continue en arrière-plan.

const BANNER_CONFIG: Record<Exclude<ConnectionState, 'connected'>, { text: string; wrap: string; spinner: boolean }> = {
  connecting: {
    text: 'Connexion au serveur…',
    wrap: 'bg-amber-500/95 text-gray-950',
    spinner: true,
  },
  reconnecting: {
    text: 'Connexion perdue — reconnexion…',
    wrap: 'bg-rose-600/95 text-white',
    spinner: true,
  },
  disconnected: {
    text: 'Hors ligne — vérifiez le réseau Wi-Fi',
    wrap: 'bg-rose-700/95 text-white',
    spinner: false,
  },
};

export const ConnectionBanner: React.FC = () => {
  const { connectionState } = useGame();

  if (connectionState === 'connected') {
    // Marqueur discret (non rendu visuellement) pour l'état sain
    return <div aria-hidden data-conn="connected" style={{ display: 'none' }} />;
  }

  const cfg = BANNER_CONFIG[connectionState];

  return (
    <div
      role="status"
      aria-live="polite"
      data-conn={connectionState}
      className={`fixed inset-x-0 top-0 z-[100] px-4 py-2 flex items-center justify-center space-x-2 shadow-lg backdrop-blur-sm ${cfg.wrap}`}
    >
      {cfg.spinner ? (
        <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
      ) : (
        <WifiOff className="w-4 h-4 flex-shrink-0" />
      )}
      <span className="text-xs sm:text-sm font-black uppercase tracking-widest">{cfg.text}</span>
    </div>
  );
};
