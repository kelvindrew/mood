import React from 'react';
import { useGame, ConnectionState } from '../../context/GameContext';
import { Volume2, VolumeX, User } from 'lucide-react';
import { audio } from '../../services/audio';

// E9 — badge reflétant l'état RÉEL de la liaison Socket.IO
const BADGE: Record<ConnectionState, { label: string; wrap: string; dot: string; ping: boolean }> = {
  connected: { label: 'CONNECTÉ', wrap: 'bg-emerald-500/20 text-emerald-400', dot: 'bg-emerald-400', ping: true },
  connecting: { label: 'CONNEXION…', wrap: 'bg-amber-500/20 text-amber-300', dot: 'bg-amber-400', ping: true },
  reconnecting: { label: 'RECONNEXION…', wrap: 'bg-rose-500/20 text-rose-300', dot: 'bg-rose-400', ping: true },
  disconnected: { label: 'HORS LIGNE', wrap: 'bg-rose-500/20 text-rose-400', dot: 'bg-rose-500', ping: false },
};

export const MobileHeader: React.FC = () => {
  const { room, localPlayer, selectedGame, connectionState } = useGame();
  const [muted, setMuted] = React.useState(false);
  const badge = BADGE[connectionState];

  const toggleSound = () => {
    const isMuted = audio.toggleMute();
    setMuted(isMuted);
  };

  if (!room) return null;

  return (
    <header className="px-4 py-3 bg-surface-card/95 border-b border-white/10 flex items-center justify-between backdrop-blur-md sticky top-0 z-30">
      <div className="flex items-center space-x-2.5">
        <div className="text-2xl">{localPlayer?.avatar || '🦊'}</div>
        <div>
          <div className="flex items-center space-x-1.5">
            <span className="font-bold text-sm text-white truncate max-w-[110px]">{localPlayer?.name || 'Joueur'}</span>
            {localPlayer?.isHost && (
              <span className="px-1.5 py-0.2 rounded bg-brand-gold/20 text-brand-gold text-[9px] font-black uppercase">
                HÔTE
              </span>
            )}
          </div>
          <div className="flex items-center space-x-1 text-[11px] text-gray-400">
            <span>Salon :</span>
            <span className="font-mono font-black text-brand-gold">{room.code}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <div
          data-conn={connectionState}
          className={`flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${badge.wrap}`}
        >
          <span className="relative flex h-2 w-2 flex-shrink-0">
            {badge.ping && (
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${badge.dot} opacity-75`} />
            )}
            <span className={`relative inline-flex rounded-full h-2 w-2 ${badge.dot}`} />
          </span>
          <span>{badge.label}</span>
        </div>

        <button
          onClick={toggleSound}
          className="p-1.5 rounded-lg bg-surface-light text-gray-400 hover:text-white"
        >
          {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
