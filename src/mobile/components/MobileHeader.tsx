import React from 'react';
import { useGame } from '../../context/GameContext';
import { Wifi, Volume2, VolumeX, Shield, User } from 'lucide-react';
import { audio } from '../../services/audio';

export const MobileHeader: React.FC = () => {
  const { room, localPlayer, selectedGame } = useGame();
  const [muted, setMuted] = React.useState(false);

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
        <div className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          <span>CONNECTÉ</span>
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
