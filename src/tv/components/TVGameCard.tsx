import React from 'react';
import { GameCatalogItem } from '../../types/game';
import { Play, Sparkles } from 'lucide-react';
import { audio } from '../../services/audio';

interface TVGameCardProps {
  game: GameCatalogItem;
  isActive?: boolean;
  onSelect: (game: GameCatalogItem) => void;
  onPlayDirect: (game: GameCatalogItem) => void;
  onHighlight?: (game: GameCatalogItem) => void;
  className?: string;
}

export const TVGameCard: React.FC<TVGameCardProps> = ({
  game,
  isActive = false,
  onSelect,
  onPlayDirect,
  onHighlight,
  className = '',
}) => {
  const handleFocus = () => {
    if (onHighlight) {
      onHighlight(game);
    }
  };

  const handleMouseEnter = () => {
    if (onHighlight) {
      onHighlight(game);
    }
  };

  return (
    <div
      data-tv-focus
      tabIndex={0}
      onFocus={handleFocus}
      onMouseEnter={handleMouseEnter}
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
      className={`group relative aspect-[2/3] rounded-2xl overflow-hidden cursor-pointer bg-[#0A0D16] border transition-all duration-300 transform outline-none select-none flex-shrink-0 ${
        isActive
          ? 'border-purple-400 ring-4 ring-purple-500/80 scale-105 shadow-[0_16px_40px_rgba(139,92,246,0.55)] z-20'
          : 'border-white/10 hover:border-purple-400 hover:scale-105 focus:border-purple-400 focus:ring-4 focus:ring-purple-500/90 focus:scale-105 focus:z-20 shadow-xl'
      } ${className}`}
    >
      {/* 1. Full Bleed Movie / Game Poster Image */}
      <img
        src={game.coverImage || game.heroImage}
        alt={game.title}
        loading="lazy"
        className="w-full h-full object-cover object-center group-hover:scale-108 group-focus:scale-108 transition-transform duration-500 filter brightness-95"
      />

      {/* 2. Cinematic Gradients */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#060810] via-[#060810]/40 via-40% to-transparent opacity-90 group-hover:opacity-80 transition-opacity" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent opacity-60" />

      {/* 3. Top Badges (Category & Match Score) */}
      <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
        {game.badge ? (
          <span className="px-2 py-0.5 rounded-md bg-purple-600/90 backdrop-blur-md text-[9px] font-black uppercase tracking-wider text-white shadow-md flex items-center space-x-1">
            <Sparkles className="w-2.5 h-2.5 fill-current" />
            <span>{game.badge}</span>
          </span>
        ) : (
          <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[9px] font-bold uppercase tracking-wider text-gray-300 border border-white/10">
            {game.category}
          </span>
        )}

        <span className="px-1.5 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[9px] font-mono font-bold text-emerald-400 border border-white/10">
          98%
        </span>
      </div>

      {/* 4. Bottom Content Info Bar */}
      <div className="absolute bottom-0 left-0 right-0 p-3 flex flex-col justify-end">
        <h4 className="text-xs md:text-sm font-black font-display text-white uppercase tracking-tight leading-tight drop-shadow line-clamp-2 group-hover:text-purple-300 group-focus:text-purple-300 transition-colors">
          {game.title}
        </h4>

        <div className="flex items-center justify-between text-[10px] text-gray-400 font-medium mt-1 pt-1.5 border-t border-white/10">
          <span className="font-mono text-gray-300">{game.minPlayers}–{game.maxPlayers}j</span>
          <span className="text-emerald-400 font-bold">{game.durationMinutes}</span>
        </div>
      </div>
    </div>
  );
};
