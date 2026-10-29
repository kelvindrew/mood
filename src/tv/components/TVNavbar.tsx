import React from 'react';
import { useGame } from '../../context/GameContext';
import { Settings, Radio } from 'lucide-react';
import { audio } from '../../services/audio';
import { WindowsSpinner } from '../../components/WindowsSpinner';

export const TVNavbar: React.FC = () => {
  const { room, setTvView, setSelectedCategory, connectionState } = useGame();

  return (
    <header className="fixed top-0 left-0 right-0 z-40 px-8 md:px-14 py-5 flex items-center justify-between select-none">
      {/* Dégradé de fondu vers le bas uniquement (comme Netflix) — pas de bordure */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#07090E]/90 via-[#07090E]/40 to-transparent pointer-events-none" />

      {/* Logo MOOD — cliquable pour revenir à l'accueil */}
      <div
        onClick={() => {
          audio.playSelect();
          setSelectedCategory('all');
          setTvView('home');
        }}
        className="relative flex items-center space-x-2.5 cursor-pointer pointer-events-auto"
      >
        <span className="font-display font-black text-3xl md:text-4xl tracking-tight text-white drop-shadow-[0_2px_20px_rgba(0,0,0,0.9)]">
          MOOD
        </span>
        <span className="text-[10px] md:text-[11px] font-black uppercase tracking-widest text-slate-300 border border-white/20 bg-white/[0.08] px-2 py-0.5 rounded-md">
          TV
        </span>
      </div>

      {/* Droite : indicateur de salon actif + réglages uniquement */}
      <div className="relative flex items-center space-x-3 pointer-events-auto">
        {/* Indicateur de connexion style Windows si connexion en cours */}
        {(connectionState === 'connecting' || connectionState === 'reconnecting') && (
          <div className="flex items-center space-x-2 liquid-glass-pill px-3 py-1.5 shadow-lg text-xs font-bold text-cyan-300 animate-fade-in">
            <WindowsSpinner size="xs" className="text-cyan-400" />
            <span className="text-[11px] uppercase tracking-wider font-semibold">
              {connectionState === 'connecting' ? 'Connexion…' : 'Reconnexion…'}
            </span>
          </div>
        )}

        {/* Indicateur de salon connecté (discret, si actif) */}
        {room && (
          <div className="flex items-center space-x-2 liquid-glass-pill px-3 py-1.5 shadow-lg">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-xs font-mono font-bold text-slate-300">
              <span className="text-amber-400 font-black tracking-wider">{room.code}</span>
            </span>
            <div className="flex items-center space-x-1 pl-2 border-l border-white/10 text-xs font-bold text-emerald-400">
              <Radio className="w-3 h-3" />
              <span>{room.players.length}</span>
            </div>
          </div>
        )}

        {/* Seul bouton visible : Réglages / Admin */}
        <button
          data-tv-focus
          tabIndex={0}
          onClick={() => {
            audio.playSelect();
            setTvView('admin');
          }}
          className="w-9 h-9 rounded-full liquid-glass-pill hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-all outline-none focus:scale-110 focus:ring-2 focus:ring-white active:scale-90 cursor-pointer"
          title="Réglages & Administration"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
