import React, { useState, useEffect } from 'react';
import { useGame, TVView } from '../../context/GameContext';
import {
  Globe,
  ChevronLeft,
  ChevronRight,
  Layers,
} from 'lucide-react';

export const TVNavbar: React.FC = () => {
  const { setTvView, room } = useGame();
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleNav = (view: TVView) => {
    setTvView(view);
  };

  return (
    <header className="fixed top-4 left-0 right-0 z-40 px-6 flex items-center justify-between pointer-events-auto select-none">
      {/* Pure Floating Top Navigation (No Heavy GPU Blur Filters) */}
      <div className="flex items-center justify-between w-full max-w-6xl mx-auto py-1">
        {/* 1. Left Controls: Brand Logo & Navigation */}
        <div className="flex items-center space-x-3">
          <button
            data-tv-focus
            tabIndex={0}
            onClick={() => handleNav('home')}
            className="flex items-center space-x-2 text-white hover:text-[#34D399] transition-transform active:scale-95 outline-none focus:scale-110"
            title="Accueil"
          >
            <Globe className="w-5 h-5 text-[#34D399]" />
            <span className="font-display font-black text-sm tracking-wider uppercase text-white">
              PLAYFLIX TV
            </span>
          </button>

          <div className="flex items-center space-x-1 text-white/70 pl-2">
            <button
              data-tv-focus
              tabIndex={0}
              onClick={() => handleNav('home')}
              className="p-1 hover:text-white transition-transform outline-none focus:scale-120 focus:text-[#FBBF24]"
              title="Accueil"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              data-tv-focus
              tabIndex={0}
              onClick={() => handleNav('categories')}
              className="p-1 hover:text-white transition-transform outline-none focus:scale-120 focus:text-[#FBBF24]"
              title="Catégories"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 2. Center Text Title Display */}
        <div className="flex items-center space-x-2 text-xs text-gray-200">
          <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
          <span className="font-display font-black text-white tracking-widest text-xs uppercase">
            {room ? `SALON #${room.code}` : 'SMART TV LAUNCHER'}
          </span>
          <span className="text-gray-500">•</span>
          <span className="text-[#FBBF24] font-mono text-[11px] font-bold">10 JEUX</span>
        </div>

        {/* 3. Right Status & Time Display */}
        <div className="flex items-center space-x-3 text-white/80">
          <button
            data-tv-focus
            tabIndex={0}
            onClick={() => handleNav('categories')}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-transform outline-none focus:scale-115"
            title="Catalogue de Catégories"
          >
            <Layers className="w-4 h-4" />
          </button>

          {/* Clock Display */}
          <span className="font-mono text-xs font-bold text-gray-300 px-2 py-0.5 rounded-md bg-black/40">
            {time}
          </span>
        </div>
      </div>
    </header>
  );
};
