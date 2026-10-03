import React, { useState } from 'react';
import { useGame, TVView } from '../../context/GameContext';
import { Search } from 'lucide-react';
import { audio } from '../../services/audio';
import { TVSearchModal } from './TVSearchModal';

interface TVNavbarProps {
  onSelectCategory?: (category: string) => void;
  activeCategory?: string;
}

export const TVNavbar: React.FC<TVNavbarProps> = ({ onSelectCategory, activeCategory = 'all' }) => {
  const { tvView, setTvView, setSelectedGame, createRoom, games } = useGame();
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
      <header className="fixed top-0 left-0 right-0 z-40 px-8 md:px-12 pt-6 pb-4 flex items-center justify-between select-none pointer-events-auto bg-gradient-to-b from-black/95 via-black/70 to-transparent">
        {/* Left Navigation: Brand & Minimalist Streaming Links */}
        <div className="flex items-center space-x-6 md:space-x-10">
          {/* Brand Logo */}
          <button
            data-tv-focus
            tabIndex={0}
            onClick={() => handleNav('home', 'all')}
            className="flex items-center space-x-2 text-white outline-none focus:scale-105 group"
            title="Accueil PLAYFLIX"
          >
            <span className="font-display font-black text-xl md:text-2xl tracking-tighter text-[#E50914] drop-shadow-[0_2px_12px_rgba(229,9,20,0.7)]">
              PLAYFLIX
            </span>
          </button>

          {/* Minimalist Uppercase Links (Netflix 10-foot TV UI) */}
          <nav className="flex items-center space-x-5 md:space-x-7 text-xs md:text-sm font-bold tracking-normal">
            <button
              data-tv-focus
              tabIndex={0}
              onClick={() => handleNav('home', 'all')}
              className={`transition-all outline-none py-1 focus:text-white focus:scale-105 ${
                tvView === 'home' && activeCategory === 'all'
                  ? 'text-white font-extrabold border-b-2 border-[#E50914]'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Accueil
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
              className={`transition-all outline-none py-1 focus:text-white focus:scale-105 ${
                tvView === 'categories'
                  ? 'text-white font-extrabold border-b-2 border-[#E50914]'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Tous les Jeux
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
              className={`transition-all outline-none py-1 focus:text-white focus:scale-105 ${
                activeCategory === 'party' && tvView === 'home'
                  ? 'text-white font-extrabold border-b-2 border-[#E50914]'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Party
            </button>

            <button
              data-tv-focus
              tabIndex={0}
              onClick={() => {
                if (onSelectCategory) {
                  onSelectCategory('cards');
                }
                handleNav('home', 'cards');
              }}
              className={`transition-all outline-none py-1 focus:text-white focus:scale-105 ${
                activeCategory === 'cards' && tvView === 'home'
                  ? 'text-white font-extrabold border-b-2 border-[#E50914]'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Cartes
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
              className={`transition-all outline-none py-1 focus:text-white focus:scale-105 ${
                activeCategory === 'reflexion' && tvView === 'home'
                  ? 'text-white font-extrabold border-b-2 border-[#E50914]'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Société
            </button>
          </nav>
        </div>

        {/* Right Navigation: Minimalist Search, Profile Avatar & Red PLAYFLIX Badge (Exact Reference Style) */}
        <div className="flex items-center space-x-4 md:space-x-5">
          {/* Quick Search Icon Button */}
          <button
            data-tv-focus
            tabIndex={0}
            onClick={() => {
              audio.playSelect();
              setIsSearchOpen(true);
            }}
            className="p-2 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-all outline-none focus:scale-125 focus:text-white"
            title="Rechercher un jeu"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Profile Avatar */}
          <button
            data-tv-focus
            tabIndex={0}
            onClick={() => handleNav('profiles')}
            className="w-8 h-8 rounded-sm overflow-hidden border border-white/30 hover:border-white focus:border-white focus:ring-2 focus:ring-white focus:scale-110 transition-all outline-none shadow-lg cursor-pointer"
            title="Profils & Joueurs"
          >
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
              alt="Profil"
              className="w-full h-full object-cover"
            />
          </button>

          {/* Iconic Red PLAYFLIX Badge in Top-Right Corner (Matches reference image) */}
          <div className="bg-[#E50914] text-white px-3 py-1 rounded-sm font-black text-xs md:text-sm tracking-wider uppercase shadow-[0_2px_15px_rgba(229,9,20,0.6)] select-none pointer-events-none">
            PLAYFLIX
          </div>
        </div>
      </header>

      {/* Instant TV Search Modal */}
      <TVSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        games={games}
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
