import React from 'react';
import { GameCatalogItem } from '../../types/game';
import { Users, Clock, Play, Sparkles } from 'lucide-react';
import { audio } from '../../services/audio';

interface TVGameCardProps {
  game: GameCatalogItem;
  onSelect: (game: GameCatalogItem) => void;
  onPlayDirect: (game: GameCatalogItem) => void;
}

export const TVGameCard: React.FC<TVGameCardProps> = ({ game, onSelect, onPlayDirect }) => {
  return (
    <div
      data-tv-focus
      tabIndex={0}
      onClick={() => {
        audio.playSelect();
        onSelect(game);
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          audio.playSelect();
          onSelect(game);
        }
      }}
      className="group relative flex-shrink-0 w-80 h-48 rounded-3xl overflow-hidden cursor-pointer bg-surface-card border border-white/15 shadow-tv-card transition-all duration-300 transform outline-none focus:scale-110 focus:z-30 focus:ring-4 focus:ring-brand-red focus:shadow-glow-red hover:scale-105 hover:border-white/30"
    >
      {/* Background Cover Image */}
      <img
        src={game.coverImage}
        alt={game.title}
        className="w-full h-full object-cover object-center transform group-hover:scale-110 group-focus:scale-110 transition-transform duration-500"
      />

      {/* Dark Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#07090E] via-[#07090E]/60 to-transparent opacity-90 group-hover:opacity-75 group-focus:opacity-75 transition-opacity" />

      {/* Top Badges */}
      <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between z-10">
        {game.badge ? (
          <span className="px-3 py-0.5 rounded-full bg-brand-red text-white text-[10px] font-black uppercase tracking-wider shadow-md border border-white/20">
            {game.badge}
          </span>
        ) : (
          <span className="px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-gray-300 text-[10px] font-bold border border-white/10">
            {game.difficulty}
          </span>
        )}

        <div className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-[11px] font-bold text-gray-200 border border-white/10">
          <Users className="w-3 h-3 text-brand-accent" />
          <span>{game.minPlayers}-{game.maxPlayers}</span>
        </div>
      </div>

      {/* Bottom Information */}
      <div className="absolute bottom-3.5 left-3.5 right-3.5 z-10 flex flex-col space-y-1.5">
        <h3 className="text-lg font-black font-display text-white tracking-wide leading-tight group-hover:text-red-200 group-focus:text-white transition-colors truncate">
          {game.title}
        </h3>

        <div className="flex items-center justify-between text-xs text-gray-300">
          <div className="flex items-center space-x-1.5 font-semibold text-[11px] text-gray-300">
            <Clock className="w-3.5 h-3.5 text-brand-gold" />
            <span>{game.durationMinutes}</span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              audio.playSelect();
              onPlayDirect(game);
            }}
            className="opacity-0 group-focus:opacity-100 group-hover:opacity-100 flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-brand-red to-brand-accent text-white font-black text-xs hover:brightness-110 transition-all shadow-glow-red"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>JOUER</span>
          </button>
        </div>
      </div>
    </div>
  );
};
