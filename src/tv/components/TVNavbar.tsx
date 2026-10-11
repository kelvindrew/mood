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
    <header className="fixed top-0 left-0 right-0 z-40 px-8 md:px-12 py-5 flex items-center justify-between select-none bg-gradient-to-b from-[#0A1118]/95 via-[#0A1118]/80 to-transparent border-b border-white/10 backdrop-blur-sm">
      {/* Brand Logo - Turquoise / Cyan Accent */}
      <div
        onClick={() => {
          audio.playSelect();
          setSelectedCategory('all');
          setTvView('home');
        }}
        className="flex items-center space-x-2.5 cursor-pointer pointer-events-auto"
      >
        <span className="font-display font-black text-2xl md:text-3xl tracking-wider text-cyan-400 drop-shadow-[0_0_15px_rgba(6,182,212,0.4)]">
          MOOD
        </span>
        <span className="text-[10px] md:text-[11px] font-black uppercase tracking-widest text-cyan-300 border border-cyan-400/30 bg-cyan-950/60 px-2 py-0.5 rounded-md shadow-sm">
          TV
        </span>
      </div>

      {/* Center Navigation Links (Matching Moviestan mockup) */}
      <nav className="flex items-center space-x-6 md:space-x-8 pointer-events-auto">
        {NAV_TABS.map((tab) => {
          const isActive = selectedCategory === tab.id && tvView === 'home';
          return (
            <button
              key={tab.id}
              data-tv-focus
              tabIndex={0}
              onClick={() => handleSelectTab(tab.id)}
              className={`text-xs md:text-sm font-bold tracking-wide transition-all outline-none cursor-pointer py-1 relative ${
                isActive
                  ? 'text-cyan-400'
                  : 'text-slate-400 hover:text-white focus:text-cyan-300'
              }`}
            >
              <span>{tab.label}</span>
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Right Action: Search / Live Room Pill */}
      <div className="flex items-center space-x-4 pointer-events-auto">
        {room && (
          <div className="flex items-center space-x-2.5 bg-slate-900/90 px-3.5 py-1 rounded-full border border-slate-700/70 shadow-lg">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-xs font-mono font-bold text-slate-300">
              SALON <span className="text-amber-400 font-black tracking-wider">{room.code}</span>
            </span>
            <div className="flex items-center space-x-1 pl-2 border-l border-slate-700 text-xs font-bold text-emerald-400">
              <Radio className="w-3.5 h-3.5" />
              <span>{room.players.length}</span>
            </div>
          </div>
        )}

        {/* Circular Admin / Settings Button */}
        <button
          data-tv-focus
          tabIndex={0}
          onClick={() => {
            audio.playSelect();
            setTvView('admin');
          }}
          className="w-9 h-9 rounded-full bg-slate-900/80 border border-slate-700/70 hover:border-cyan-400/80 hover:bg-slate-800 text-slate-300 hover:text-cyan-400 flex items-center justify-center transition-all outline-none focus:scale-110 focus:ring-2 focus:ring-cyan-400"
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
          className="w-9 h-9 rounded-full bg-slate-900/80 border border-slate-700/70 hover:border-cyan-400/80 hover:bg-slate-800 text-slate-300 hover:text-cyan-400 flex items-center justify-center transition-all outline-none focus:scale-110 focus:ring-2 focus:ring-cyan-400"
          title="Rechercher / Explorer"
        >
          <Search className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
