import React, { useState, useEffect } from 'react';
import { useGame, TVView } from '../../context/GameContext';
import {
  Globe,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Smartphone,
  Layers,
} from 'lucide-react';
import { audio } from '../../services/audio';

export const TVNavbar: React.FC = () => {
  const { setTvView, isSimulatorOpen, setIsSimulatorOpen, room } = useGame();
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleNav = (view: TVView) => {
    setTvView(view);
  };

  return (
    <header className="fixed top-5 left-0 right-0 z-40 px-[4vw] flex items-center justify-between pointer-events-auto select-none">
      <div className="flex items-center justify-between w-full max-w-7xl mx-auto px-4 py-2.5 rounded-2xl bg-[#060810]/70 backdrop-blur-xl border border-white/10 shadow-2xl">
        {/* 1. Left Controls: MOOD Brand & Navigation Shortcuts */}
        <div className="flex items-center space-x-4">
          <button
            data-tv-focus
            tabIndex={0}
            onClick={() => handleNav('home')}
            className="flex items-center space-x-2.5 text-white transition-all outline-none focus:scale-110 group"
            title="Accueil MOOD"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-mood-indigo via-mood-coral to-mood-amber flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <span className="font-display font-black text-white text-base tracking-tighter">M</span>
            </div>
            <div className="flex flex-col text-left">
              <span className="font-display font-black text-base tracking-widest text-white leading-none">
                MOOD
              </span>
              <span className="text-[9px] font-mono font-bold tracking-widest text-mood-coral uppercase">
                SMART TV
              </span>
            </div>
          </button>

          <div className="h-5 w-px bg-white/15 mx-1" />

          {/* Quick Views */}
          <div className="flex items-center space-x-1.5">
            <button
              data-tv-focus
              tabIndex={0}
              onClick={() => handleNav('home')}
              className="px-3 py-1 rounded-xl text-xs font-bold text-gray-300 hover:text-white hover:bg-white/10 transition-all outline-none focus:bg-white focus:text-black"
            >
              Accueil
            </button>
            <button
              data-tv-focus
              tabIndex={0}
              onClick={() => handleNav('categories')}
              className="px-3 py-1 rounded-xl text-xs font-bold text-gray-300 hover:text-white hover:bg-white/10 transition-all outline-none focus:bg-white focus:text-black flex items-center space-x-1.5"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Catalogue (21)</span>
            </button>
          </div>
        </div>

        {/* 2. Center Status & Room Indicator */}
        <div className="flex items-center space-x-3 text-xs">
          <div className="flex items-center space-x-2 px-3.5 py-1 rounded-full bg-white/5 border border-white/10">
            <span
              className="w-2 h-2 rounded-full animate-pulse bg-mood-emerald"
            />
            <span className="font-display font-black text-white tracking-widest text-[11px] uppercase">
              {room ? `SALON #${room.code}` : '21 JEUX DE SALON EN LIGNE'}
            </span>
            <span className="text-gray-500">•</span>
            <span className="text-mood-amber font-mono text-[10px] font-bold">100% SMARTPHONE</span>
          </div>
        </div>

        {/* 3. Right Controls: AI Studio, Gamepad Simulator & Live Clock */}
        <div className="flex items-center space-x-3 text-white/80">
          {/* AI Content Studio Button */}
          <button
            data-tv-focus
            tabIndex={0}
            onClick={() => handleNav('admin')}
            className="p-1.5 rounded-xl hover:text-white hover:bg-white/10 transition-all outline-none focus:scale-125 focus:text-mood-amber"
            title="Studio de Contenu (Gemini)"
          >
            <Sparkles className="w-4 h-4 text-mood-amber fill-current" />
          </button>

          {/* Controller Simulator */}
          <button
            data-tv-focus
            tabIndex={0}
            onClick={() => {
              audio.playSelect();
              setIsSimulatorOpen(!isSimulatorOpen);
            }}
            className={`p-1.5 rounded-xl transition-all outline-none focus:scale-125 ${
              isSimulatorOpen ? 'text-mood-amber bg-mood-amber/20 font-black' : 'hover:text-white hover:bg-white/10'
            }`}
            title="Simulateur Manette"
          >
            <Smartphone className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-white/15" />

          {/* Digital Time */}
          <span className="font-mono text-xs font-bold text-white tracking-wider px-1">
            {time || '20:00'}
          </span>
        </div>
      </div>
    </header>
  );
};
