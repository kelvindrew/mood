import React from 'react';
import { GameCatalogItem } from '../../types/game';
import { Users, Clock, Play } from 'lucide-react';
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
      className="group relative flex-shrink-0 w-80 h-48 rounded-3xl overflow-hidden cursor-pointer bg-[#101420] border-2 border-white/15 shadow-[0_12px_30px_rgba(0,0,0,0.8)] transition-all duration-200 transform outline-none
                 focus:scale-110 focus:z-30 focus:border-white focus:ring-4 focus:ring-[#E50914] focus:shadow-[0_0_40px_rgba(229,9,20,0.8)] hover:scale-105 hover:border-white/30"
    >
      {/* Background Cover Image */}
      <img
        src={game.coverImage}
        alt={game.title}
        loading="lazy"
        className="w-full h-full object-cover object-center transform group-focus:scale-105 transition-transform duration-300"
      />

      {/* Dark Gradient Overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#07090E] via-[#07090E]/65 to-transparent" />

      {/* Top Badges */}
      <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between z-10">
        {game.badge ? (
          <span className="px-3 py-1 rounded-full bg-[#E50914] text-white text-[11px] font-black uppercase tracking-wider shadow-md border border-white/20">
            {game.badge}
          </span>
        ) : (
          <span className="px-2.5 py-1 rounded-full bg-[#07090E]/80 border border-white/15 text-gray-300 text-[11px] font-bold">
            {game.difficulty}
          </span>
        )}

        <div className="flex items-center space-x-1 px-3 py-1 rounded-full bg-[#07090E]/85 border border-white/15 text-xs font-black text-[#00F2FE]">
          <Users className="w-3.5 h-3.5" />
          <span>{game.minPlayers}-{game.maxPlayers}</span>
        </div>
      </div>

      {/* Bottom Information */}
      <div className="absolute bottom-3.5 left-3.5 right-3.5 z-10 flex flex-col space-y-1">
        <h3 className="text-xl font-black font-display text-white tracking-wide leading-tight group-focus:text-white transition-colors truncate drop-shadow">
          {game.title}
        </h3>

        <div className="flex items-center justify-between text-xs text-[#B8C2D8]">
          <div className="flex items-center space-x-1.5 font-bold text-xs text-[#B8C2D8]">
            <Clock className="w-3.5 h-3.5 text-[#FFB800]" />
            <span>{game.durationMinutes}</span>
            <span>•</span>
            <span className="text-[#10B981] font-bold">{game.difficulty}</span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              audio.playSelect();
              onPlayDirect(game);
            }}
            className="opacity-0 group-focus:opacity-100 group-hover:opacity-100 flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#E50914] to-[#FF2E63] text-white font-black text-xs transition-all shadow-[0_0_20px_rgba(229,9,20,0.6)]"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>JOUER</span>
          </button>
        </div>
      </div>
    </div>
  );
};
