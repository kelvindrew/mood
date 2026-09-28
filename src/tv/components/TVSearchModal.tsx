import React, { useState, useEffect, useRef } from 'react';
import { GameCatalogItem } from '../../types/game';
import { Search, X, Play, Users, Clock, Sparkles } from 'lucide-react';
import { audio } from '../../services/audio';

interface TVSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  games: GameCatalogItem[];
  onSelectGame: (game: GameCatalogItem) => void;
  onPlayGame: (game: GameCatalogItem) => void;
}

export const TVSearchModal: React.FC<TVSearchModalProps> = ({
  isOpen,
  onClose,
  games,
  onSelectGame,
  onPlayGame,
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        audio.playBack();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filtered = query.trim() === ''
    ? games
    : games.filter(
        (g) =>
          g.title.toLowerCase().includes(query.toLowerCase()) ||
          g.tagline.toLowerCase().includes(query.toLowerCase()) ||
          g.category.toLowerCase().includes(query.toLowerCase())
      );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/85 backdrop-blur-xl animate-fade-in select-none">
      <div className="w-full max-w-4xl bg-[#090C14] border border-white/15 rounded-3xl p-6 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Top Search Input Bar */}
        <div className="flex items-center space-x-3 pb-4 border-b border-white/10">
          <div className="p-2.5 rounded-2xl bg-white/10 text-white">
            <Search className="w-6 h-6 text-purple-400" />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un jeu de salon (ex: Espion, Petit Bac, Ludo, Poker...)"
            className="flex-1 bg-transparent border-none text-white text-lg md:text-xl font-bold placeholder-gray-500 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={() => {
              audio.playBack();
              onClose();
            }}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-gray-300 hover:text-white uppercase tracking-wider"
          >
            Fermer (Échap)
          </button>
        </div>

        {/* Results Grid */}
        <div className="flex-1 overflow-y-auto pt-4 pr-1 scrollbar-none">
          <div className="flex items-center justify-between pb-3">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              {filtered.length} {filtered.length > 1 ? 'Jeux trouvés' : 'Jeu trouvé'}
            </span>
            <span className="text-[11px] text-purple-400 font-mono font-bold">
              Flèches ou Clic pour sélectionner
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {filtered.map((game) => (
              <div
                key={game.id}
                data-tv-focus
                tabIndex={0}
                onClick={() => {
                  audio.playSelect();
                  onSelectGame(game);
                  onClose();
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    audio.playSelect();
                    onSelectGame(game);
                    onClose();
                  }
                }}
                className="group relative aspect-[2/3] rounded-2xl overflow-hidden cursor-pointer border border-white/10 bg-[#0E1322] shadow-lg transition-all duration-300 outline-none
                           focus:scale-105 focus:ring-4 focus:ring-purple-500 focus:border-purple-400 hover:scale-105 hover:border-purple-500"
              >
                <img
                  src={game.coverImage || game.heroImage}
                  alt={game.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90 group-hover:opacity-75 transition-opacity" />

                <div className="absolute inset-0 p-3 flex flex-col justify-between">
                  <div className="flex justify-end">
                    <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-mono font-bold text-emerald-400 border border-white/10">
                      98% Match
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xs md:text-sm font-black font-display text-white uppercase tracking-tight leading-tight line-clamp-2">
                      {game.title}
                    </h4>
                    <p className="text-[10px] text-gray-300 line-clamp-1 mt-0.5">
                      {game.tagline}
                    </p>
                    <div className="mt-2 flex items-center justify-between pt-1 border-t border-white/15">
                      <span className="text-[10px] text-gray-400 font-mono">
                        {game.minPlayers}-{game.maxPlayers}j
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          audio.playSelect();
                          onPlayGame(game);
                          onClose();
                        }}
                        className="px-2.5 py-1 rounded-full bg-purple-600 hover:bg-purple-500 text-white font-bold text-[10px] uppercase flex items-center space-x-1"
                      >
                        <Play className="w-2.5 h-2.5 fill-current" />
                        <span>Jouer</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
