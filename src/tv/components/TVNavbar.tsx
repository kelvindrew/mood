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
    audio.playSelect();
    setTvView(view);
  };

  return (
    <header className="fixed top-5 left-0 right-0 z-40 px-[4vw] flex items-center justify-between pointer-events-auto select-none">
      {/* Pure Floating Top Navigation (Without any surrounding capsule or background box) */}
      <div className="flex items-center justify-between w-full max-w-6xl mx-auto">
        {/* 1. Left Controls: Brand Logo & Navigation */}
        <div className="flex items-center space-x-3">
          <button
            data-tv-focus
            tabIndex={0}
            onClick={() => handleNav('home')}
            className="flex items-center space-x-2 text-white hover:text-[#34D399] transition-transform active:scale-95 outline-none focus:scale-115 focus:text-[#34D399]"
            title="Accueil"
          >
            <Globe className="w-5 h-5 text-[#34D399] drop-shadow" />
            <span className="font-display font-black text-sm tracking-wider uppercase text-white drop-shadow">
              PLAYFLIX AI
            </span>
          </button>

          <div className="flex items-center space-x-1 text-white/70 pl-2">
            <button
              data-tv-focus
              tabIndex={0}
              onClick={() => handleNav('home')}
              className="p-1 hover:text-white transition-transform outline-none focus:scale-125 focus:text-[#FBBF24]"
              title="Précédent"
            >
              <ChevronLeft className="w-5 h-5 drop-shadow" />
            </button>

            <button
              data-tv-focus
              tabIndex={0}
              onClick={() => handleNav('categories')}
              className="p-1 hover:text-white transition-transform outline-none focus:scale-125 focus:text-[#FBBF24]"
              title="Suivant"
            >
              <ChevronRight className="w-5 h-5 drop-shadow" />
            </button>
          </div>
        </div>

        {/* 2. Center Text Title Display */}
        <div className="flex items-center space-x-2 text-xs text-gray-200 drop-shadow">
          <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
          <span className="font-display font-black text-white tracking-widest text-xs uppercase drop-shadow-md">
            {room ? `SALON ACTIF #${room.code}` : 'PLAYFLIX SMART TV LAUNCHER'}
          </span>
          <span className="text-gray-500">•</span>
          <span className="text-[#FBBF24] font-mono text-[11px] font-bold">10 JEUX 3D</span>
        </div>

        {/* 3. Right Status & Action Icons */}
        <div className="flex items-center space-x-4 text-white/70">
          {/* Categories Button */}
          <button
            data-tv-focus
            tabIndex={0}
            onClick={() => handleNav('categories')}
            className="p-1.5 hover:text-white transition-transform outline-none focus:scale-125 focus:text-[#38BDF8]"
            title="Catalogue de Catégories"
          >
            <Layers className="w-5 h-5 drop-shadow" />
          </button>

          {/* AI Content Studio Button */}
          <button
            data-tv-focus
            tabIndex={0}
            onClick={() => handleNav('admin')}
            className="p-1.5 hover:text-white transition-transform outline-none focus:scale-125 focus:text-[#FBBF24]"
            title="AI Studio (Gemini)"
          >
            <Sparkles className="w-5 h-5 text-[#FBBF24] fill-current drop-shadow" />
          </button>

          {/* Controller Simulator */}
          <button
            data-tv-focus
            tabIndex={0}
            onClick={() => {
              audio.playSelect();
              setIsSimulatorOpen(!isSimulatorOpen);
            }}
            className={`p-1.5 transition-transform outline-none focus:scale-125 ${
              isSimulatorOpen ? 'text-[#F59E0B] font-black' : 'hover:text-white'
            }`}
            title="Manette Mobile"
          >
            <Smartphone className="w-5 h-5 drop-shadow" />
          </button>

          {/* Digital Time */}
          <span className="font-mono text-xs font-bold text-white/90 drop-shadow pl-1">
            {time || '20:00'}
          </span>
        </div>
      </div>
    </header>
  );
};
