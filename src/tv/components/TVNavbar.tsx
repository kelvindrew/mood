import React from 'react';
import { useGame } from '../../context/GameContext';
import { Radio } from 'lucide-react';

export const TVNavbar: React.FC = () => {
  const { room } = useGame();

  return (
    <header className="fixed top-0 left-0 right-0 z-40 px-8 md:px-12 pt-6 pb-4 flex items-center justify-between select-none pointer-events-none bg-gradient-to-b from-[#0A0F1D]/95 via-[#0A0F1D]/60 to-transparent">
      {/* Brand Logo */}
      <div className="flex items-center space-x-3">
        <span className="font-display font-black text-2xl md:text-3xl tracking-tight text-white drop-shadow-sm">
          PLAY<span className="text-cyan-400">FLIX</span>
        </span>
        <span className="text-[10px] md:text-[11px] font-black uppercase tracking-widest text-cyan-300/90 border border-cyan-500/25 bg-cyan-950/40 px-2 py-0.5 rounded-md">
          TV
        </span>
      </div>

      {/* Discreet Live Status Indicator */}
      {room && (
        <div className="flex items-center space-x-3 bg-slate-900/90 px-4 py-1.5 rounded-full border border-slate-700/60 shadow-lg">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-mono font-bold text-slate-300">
            SALON <span className="text-amber-400 font-black tracking-wider">{room.code}</span>
          </span>
          <div className="flex items-center space-x-1 pl-2 border-l border-slate-700 text-xs font-bold text-emerald-400">
            <Radio className="w-3.5 h-3.5" />
            <span>{room.players.length} joueur{room.players.length > 1 ? 's' : ''}</span>
          </div>
        </div>
      )}
    </header>
  );
};
