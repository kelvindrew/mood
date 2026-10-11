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
    wrap: 'bg-slate-900/95 border-cyan-400/60 text-cyan-300 shadow-[0_6px_25px_rgba(6,182,212,0.25)]',
    spinner: true,
  },
  reconnecting: {
    text: 'Connexion perdue — reconnexion…',
    wrap: 'bg-slate-900/95 border-amber-400/70 text-amber-300 shadow-[0_6px_25px_rgba(245,158,11,0.25)]',
    spinner: true,
  },
  disconnected: {
    text: 'Hors ligne — vérifiez le réseau Wi-Fi',
    wrap: 'bg-slate-900/95 border-rose-500/70 text-rose-200 shadow-[0_6px_25px_rgba(244,63,94,0.25)]',
    spinner: false,
  },
};

export const ConnectionBanner: React.FC = () => {
  const { connectionState } = useGame();
  const [showConnecting, setShowConnecting] = React.useState(false);

  React.useEffect(() => {
    if (connectionState === 'connecting') {
      const timer = setTimeout(() => setShowConnecting(true), 1800);
      return () => clearTimeout(timer);
    } else {
      setShowConnecting(false);
    }
  }, [connectionState]);

  if (connectionState === 'connected') {
    // Marqueur discret (non rendu visuellement) pour l'état sain
    return <div aria-hidden data-conn="connected" style={{ display: 'none' }} />;
  }

  if (connectionState === 'connecting' && !showConnecting) {
    return <div aria-hidden data-conn="connecting" style={{ display: 'none' }} />;
  }

  const cfg = BANNER_CONFIG[connectionState];

  return (
    <div
      role="status"
      aria-live="polite"
      data-conn={connectionState}
      className={`fixed top-3 left-1/2 -translate-x-1/2 z-[100] px-5 py-2 rounded-full border flex items-center space-x-2.5 shadow-2xl transition-all duration-200 max-w-[90vw] ${cfg.wrap}`}
    >
      {cfg.spinner ? (
        <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
      ) : (
        <WifiOff className="w-4 h-4 flex-shrink-0" />
      )}
      <span className="text-xs sm:text-sm font-bold tracking-wide truncate">{cfg.text}</span>
    </div>
  );
};
