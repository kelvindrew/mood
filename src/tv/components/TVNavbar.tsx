import React, { useState, useEffect } from 'react';
import { useGame, TVView } from '../../context/GameContext';
import { Search } from 'lucide-react';
import { audio } from '../../services/audio';
import { TVSearchModal } from './TVSearchModal';
import { GAMES_CATALOG } from '../../data/gamesCatalog';

interface TVNavbarProps {
  onSelectCategory?: (category: string) => void;
  activeCategory?: string;
}

export const TVNavbar: React.FC<TVNavbarProps> = ({ onSelectCategory, activeCategory = 'all' }) => {
  const { tvView, setTvView, isSimulatorOpen, setIsSimulatorOpen, setSelectedGame, createRoom } = useGame();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const handleNav = (view: TVView, cat?: string) => {
    audio.playSelect();
    if (cat && onSelectCategory) {
      onSelectCategory(cat);
    }
    setTvView(view);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 px-8 md:px-12 pt-7 pb-4 flex items-center justify-between select-none pointer-events-auto bg-gradient-to-b from-[#07090E]/95 via-[#07090E]/60 to-transparent">
        {/* Left Navigation: Brand & Minimalist Streaming Links */}
        <div className="flex items-center space-x-8 md:space-x-12">
          {/* Brand Logo */}
          <button
            data-tv-focus
            tabIndex={0}
            onClick={() => handleNav('home', 'all')}
            className="flex items-center space-x-2 text-white outline-none focus:scale-105 group"
            title="Accueil MOOD"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-600 via-indigo-600 to-purple-800 flex items-center justify-center shadow-[0_0_20px_rgba(124,58,237,0.5)] group-hover:scale-105 transition-transform">
              <span className="font-display font-black text-white text-base tracking-tighter">M</span>
            </div>
            <span className="font-display font-black text-lg tracking-[0.25em] text-white">
              MOOD
            </span>
          </button>

          {/* Minimalist Uppercase Links (Inspired by reference image: DASHBOARD, MOVIES, SERIES, KIDS) */}
          <nav className="flex items-center space-x-6 md:space-x-8 text-xs font-extrabold tracking-[0.2em] uppercase">
            <button
              data-tv-focus
              tabIndex={0}
              onClick={() => handleNav('home', 'all')}
              className={`transition-all outline-none py-1 focus:text-purple-400 focus:scale-105 ${
                tvView === 'home' && activeCategory === 'all'
                  ? 'text-white font-black drop-shadow-[0_0_12px_rgba(255,255,255,0.8)] border-b-2 border-purple-500'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              Dashboard
            </button>

            <button
              data-tv-focus
              tabIndex={0}
              onClick={() => {
                if (onSelectCategory) {
                  onSelectCategory('all');
                  handleNav('categories');
                } else {
                  handleNav('categories');
                }
              }}
              className={`transition-all outline-none py-1 focus:text-purple-400 focus:scale-105 ${
                tvView === 'categories'
                  ? 'text-white font-black drop-shadow-[0_0_12px_rgba(255,255,255,0.8)] border-b-2 border-purple-500'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              Jeux (21)
            </button>

            <button
              data-tv-focus
              tabIndex={0}
              onClick={() => {
                if (onSelectCategory) {
                  onSelectCategory('party');
                }
                handleNav('home', 'party');
              }}
              className={`transition-all outline-none py-1 focus:text-purple-400 focus:scale-105 ${
                activeCategory === 'party' && tvView === 'home'
                  ? 'text-white font-black drop-shadow-[0_0_12px_rgba(255,255,255,0.8)] border-b-2 border-purple-500'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              Party
            </button>

            <button
              data-tv-focus
              tabIndex={0}
              onClick={() => {
                if (onSelectCategory) {
                  onSelectCategory('reflexion');
                }
                handleNav('home', 'reflexion');
              }}
              className={`transition-all outline-none py-1 focus:text-purple-400 focus:scale-105 ${
                activeCategory === 'reflexion' && tvView === 'home'
                  ? 'text-white font-black drop-shadow-[0_0_12px_rgba(255,255,255,0.8)] border-b-2 border-purple-500'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              Société
            </button>
          </nav>
        </div>

        {/* Right Navigation: Minimalist Search & Profile Avatar (Reference Image Style: 🔍 + Avatar) */}
        <div className="flex items-center space-x-5">
          {/* Quick Search Icon Button */}
          <button
            data-tv-focus
            tabIndex={0}
            onClick={() => {
              audio.playSelect();
              setIsSearchOpen(true);
            }}
            className="p-2 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-all outline-none focus:scale-125 focus:text-purple-400"
            title="Rechercher un jeu"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Profile Avatar */}
          <button
            data-tv-focus
            tabIndex={0}
            onClick={() => handleNav('profiles')}
            className="w-8 h-8 rounded-full overflow-hidden border-2 border-white/30 hover:border-purple-400 focus:border-purple-400 focus:ring-4 focus:ring-purple-500/80 focus:scale-110 transition-all outline-none shadow-lg cursor-pointer"
            title="Profils & Joueurs"
          >
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
              alt="Profil"
              className="w-full h-full object-cover"
            />
          </button>
        </div>
      </header>

      {/* Instant TV Search Modal */}
      <TVSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        games={GAMES_CATALOG}
        onSelectGame={(g) => {
          setSelectedGame(g);
          setTvView('detail');
        }}
        onPlayGame={async (g) => {
          setSelectedGame(g);
          await createRoom(g.id, { maxPlayers: g.maxPlayers });
        }}
      />
    </>
  );
};
