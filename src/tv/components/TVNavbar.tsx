import React, { useState, useEffect } from 'react';
import { useGame, TVView } from '../../context/GameContext';
import {
  Globe,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Smartphone,
  Wifi,
  Search,
  RefreshCw,
  Sliders,
  Layers,
} from 'lucide-react';
import { audio } from '../../services/audio';

export const TVNavbar: React.FC = () => {
  const { tvView, setTvView, isSimulatorOpen, setIsSimulatorOpen, room } = useGame();
  const [time, setTime] = useState<string>('');
  const [searchCode, setSearchCode] = useState<string>('');

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
    <header className="fixed top-5 left-0 right-0 z-40 px-[5vw] flex items-center justify-center pointer-events-auto select-none">
      {/* Top VisionOS Capsule Bar (Exact match of Reference Image Top Bar) */}
      <div className="glass-pill-bar px-5 py-2.5 rounded-full flex items-center justify-between w-full max-w-4xl shadow-[0_15px_40px_rgba(0,0,0,0.6)]">
        {/* 1. Left Controls: Brand Logo & Navigation History */}
        <div className="flex items-center space-x-2">
          <button
            data-tv-focus
            tabIndex={0}
            onClick={() => handleNav('home')}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all outline-none focus:ring-2 focus:ring-[#10B981]"
            title="Accueil"
          >
            <Globe className="w-4 h-4 text-[#34D399]" />
          </button>

          <button
            data-tv-focus
            tabIndex={0}
            onClick={() => handleNav('home')}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 text-gray-300 hover:text-white flex items-center justify-center transition-all outline-none focus:ring-2 focus:ring-white"
            title="Précédent"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            data-tv-focus
            tabIndex={0}
            onClick={() => handleNav('categories')}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 text-gray-300 hover:text-white flex items-center justify-center transition-all outline-none focus:ring-2 focus:ring-white"
            title="Suivant / Catégories"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <span className="hidden md:inline-block px-2.5 py-0.5 rounded-full bg-white/10 text-[#FBBF24] font-mono text-[10px] font-black uppercase">
            PLAYFLIX AI
          </span>
        </div>

        {/* 2. Center Capsule Title / Room Search Display */}
        <div className="flex items-center space-x-2 px-6 py-1 rounded-full bg-black/40 border border-white/10 text-xs text-gray-200">
          <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
          <span className="font-display font-black text-white tracking-widest text-xs">
            {room ? `SALON ACTIF #${room.code}` : 'PLAYFLIX SMART TV LAUNCHER'}
          </span>
          <span className="text-gray-500">•</span>
          <span className="text-[#FBBF24] font-mono text-[11px] font-bold">10 JEUX 3D</span>
        </div>

        {/* 3. Right Status & Quick Utilities */}
        <div className="flex items-center space-x-2">
          {/* Categories Button */}
          <button
            data-tv-focus
            tabIndex={0}
            onClick={() => handleNav('categories')}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white flex items-center justify-center transition-all outline-none focus:ring-2 focus:ring-[#FBBF24]"
            title="Catalogue de Catégories"
          >
            <Layers className="w-3.5 h-3.5 text-[#38BDF8]" />
          </button>

          {/* AI Content Studio Button */}
          <button
            data-tv-focus
            tabIndex={0}
            onClick={() => handleNav('admin')}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white flex items-center justify-center transition-all outline-none focus:ring-2 focus:ring-[#FBBF24]"
            title="AI Studio (Gemini)"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#FBBF24]" />
          </button>

          {/* Controller Simulator */}
          <button
            data-tv-focus
            tabIndex={0}
            onClick={() => {
              audio.playSelect();
              setIsSimulatorOpen(!isSimulatorOpen);
            }}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all outline-none focus:ring-2 focus:ring-white ${
              isSimulatorOpen ? 'bg-[#F59E0B] text-black' : 'bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white'
            }`}
            title="Manette Mobile"
          >
            <Smartphone className="w-3.5 h-3.5" />
          </button>

          {/* Digital Time Pill */}
          <div className="px-3 py-1 rounded-full bg-white/10 border border-white/10 text-white font-mono text-xs font-bold">
            {time || '20:00'}
          </div>
        </div>
      </div>
    </header>
  );
};
