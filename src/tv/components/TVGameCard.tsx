import React from 'react';
import { GameCatalogItem } from '../../types/game';
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
  onPlayDirect: _onPlayDirect,
  onHighlight,
  className = '',
}) => {
  const cardRef = React.useRef<HTMLDivElement>(null);

  const handleFocus = () => {
    if (onHighlight) {
      onHighlight(game);
    }
    cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  };

  const handleMouseEnter = () => {
    if (onHighlight) {
      onHighlight(game);
    }
  };

  return (
    <div
      ref={cardRef}
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
      className={`group relative aspect-[16/9] rounded-sm overflow-hidden cursor-pointer bg-[#141414] transition-all duration-200 transform outline-none select-none flex-shrink-0 ${
        isActive
          ? 'border-[3px] border-white scale-105 z-30 shadow-[0_12px_30px_rgba(0,0,0,0.95)] opacity-100 ring-0'
          : 'border border-white/10 hover:border-white hover:scale-105 hover:z-30 focus:border-[3px] focus:border-white focus:scale-105 focus:z-30 shadow-md opacity-80 hover:opacity-100 focus:opacity-100'
      } ${className}`}
    >
      {/* 1. Full Bleed 16:9 Thumbnail Image */}
      <img
        src={game.coverImage || game.heroImage}
        alt={game.title}
        loading="lazy"
        className="w-full h-full object-cover object-center filter brightness-95 group-hover:brightness-105 transition-all duration-300"
      />

      {/* 2. Subtle Vignette at bottom for title legibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 via-40% to-transparent opacity-90 group-hover:opacity-95 transition-opacity" />

      {/* 3. Top Badges (Category & Tag) */}
      <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none">
        {game.badge ? (
          <span className="px-1.5 py-0.5 rounded-sm bg-[#E50914] text-[9px] font-black uppercase tracking-wider text-white shadow-sm">
            {game.badge}
          </span>
        ) : (
          <span className="px-1.5 py-0.5 rounded-sm bg-black/70 text-[9px] font-bold uppercase tracking-wider text-gray-300 border border-white/10">
            {game.category}
          </span>
        )}

        <span className="px-1.5 py-0.5 rounded-sm bg-black/70 text-[9px] font-mono font-bold text-gray-200 border border-white/10">
          {game.minPlayers}–{game.maxPlayers}j
        </span>
      </div>

      {/* 4. Bottom Content Title */}
      <div className="absolute bottom-0 left-0 right-0 p-2.5 flex flex-col justify-end pointer-events-none">
        <h4 className="text-xs sm:text-sm font-extrabold font-display text-white uppercase tracking-tight leading-tight drop-shadow truncate">
          {game.title}
        </h4>
        <span className="text-[10px] text-gray-300 font-medium truncate mt-0.5">
          {game.tagline}
        </span>
      </div>
    </div>
  );
};
