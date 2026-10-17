import React from 'react';
import { useGame } from '../../context/GameContext';
import { Radio, Search, Settings } from 'lucide-react';
import { audio } from '../../services/audio';

const NAV_TABS = [
  { id: 'all', label: 'Tous' },
  { id: 'popular', label: 'Populaires' },
  { id: 'party', label: 'Ambiance & Party' },
  { id: 'cards', label: 'Cartes' },
  { id: 'reflexion', label: 'Réflexion' },
];

export const TVNavbar: React.FC = () => {
  const { room, tvView, setTvView, selectedCategory, setSelectedCategory } = useGame();

  const handleSelectTab = (tabId: string) => {
    audio.playFocus();
    setSelectedCategory(tabId);
    if (tvView !== 'home') {
      setTvView('home');
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 px-8 md:px-14 py-4 flex items-center justify-between select-none bg-[#07090E]/60 backdrop-blur-xl border-b border-white/[0.06]">
      {/* Brand Logo - Netflix-inspired Minimalist White MOOD TV */}
      <div
        onClick={() => {
          audio.playSelect();
          setSelectedCategory('all');
          setTvView('home');
        }}
        className="flex items-center space-x-2.5 cursor-pointer pointer-events-auto"
      >
        <span className="font-display font-black text-2xl md:text-3xl tracking-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]">
          MOOD
        </span>
        <span className="text-[10px] md:text-[11px] font-black uppercase tracking-widest text-slate-300 border border-white/20 bg-white/[0.08] px-2 py-0.5 rounded-md">
          TV
        </span>
      </div>

      {/* Center Navigation Links */}
      <nav className="flex items-center space-x-2 md:space-x-3 pointer-events-auto bg-black/30 backdrop-blur-md p-1.5 rounded-full border border-white/[0.08]">
        {NAV_TABS.map((tab) => {
          const isActive = selectedCategory === tab.id && tvView === 'home';
          return (
            <button
              key={tab.id}
              data-tv-focus
              tabIndex={0}
              onClick={() => handleSelectTab(tab.id)}
              className={`text-xs md:text-sm font-bold tracking-wide transition-all outline-none cursor-pointer px-4 py-1.5 rounded-full ${
                isActive
                  ? 'bg-white text-neutral-950 font-black shadow-[0_2px_15px_rgba(255,255,255,0.35)] scale-105'
                  : 'text-slate-300 hover:text-white hover:bg-white/10 focus:bg-white/15 focus:text-white'
              }`}
            >
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Right Action: Search / Live Room Pill / Manette Switch */}
      <div className="flex items-center space-x-3 pointer-events-auto">
        {room && (
          <div className="flex items-center space-x-2.5 liquid-glass-pill px-3.5 py-1.5 shadow-lg">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-xs font-mono font-bold text-slate-300">
              SALON <span className="text-amber-400 font-black tracking-wider">{room.code}</span>
            </span>
            <div className="flex items-center space-x-1 pl-2 border-l border-white/10 text-xs font-bold text-emerald-400">
              <Radio className="w-3.5 h-3.5" />
              <span>{room.players.length}</span>
            </div>
          </div>
        )}

        {/* Bouton direct manette mobile pour tester ou connecter */}
        <a
          href="/?mode=mobile"
          className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full liquid-glass-pill hover:bg-white/15 text-xs font-bold text-slate-300 hover:text-white transition-all shadow-sm active:scale-95"
          title="Ouvrir la Manette Smartphone"
        >
          <span>📱 Manette</span>
        </a>

        {/* Circular Admin / Settings Button */}
        <button
          data-tv-focus
          tabIndex={0}
          onClick={() => {
            audio.playSelect();
            setTvView('admin');
          }}
          className="w-9 h-9 rounded-full liquid-glass-pill hover:bg-white/15 text-slate-300 hover:text-white flex items-center justify-center transition-all outline-none focus:scale-110 focus:ring-2 focus:ring-white"
          title="Connexion Administrateur"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* Circular Search Button */}
        <button
          data-tv-focus
          tabIndex={0}
          onClick={() => {
            audio.playSelect();
            setTvView('categories');
          }}
          className="w-9 h-9 rounded-full liquid-glass-pill hover:bg-white/15 text-slate-300 hover:text-white flex items-center justify-center transition-all outline-none focus:scale-110 focus:ring-2 focus:ring-white"
          title="Rechercher / Explorer"
        >
          <Search className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
