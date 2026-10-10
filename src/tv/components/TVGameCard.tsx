import React from 'react';
import { GameCatalogItem } from '../../types/game';
import { audio } from '../../services/audio';
import { Play } from 'lucide-react';

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
      className={`group relative aspect-[16/9] w-full rounded-xl overflow-hidden cursor-pointer bg-[#141414] transition-all duration-300 transform outline-none select-none ${
        isActive
          ? 'border-[3px] border-white scale-[1.03] z-30 shadow-[0_15px_35px_rgba(0,0,0,0.95)] opacity-100 ring-4 ring-white/20'
          : 'border border-white/10 hover:border-white hover:scale-[1.03] hover:z-30 focus:border-[3px] focus:border-white focus:scale-[1.03] focus:z-30 shadow-lg opacity-85 hover:opacity-100 focus:opacity-100'
      } ${className}`}
    >
      {/* 1. Full Bleed 16:9 Thumbnail Image */}
      <img
        src={game.coverImage || game.heroImage}
        alt={game.title}
        loading="lazy"
        className="w-full h-full object-cover object-center filter brightness-95 group-hover:brightness-105 transition-all duration-500 group-hover:scale-105"
      />

      {/* 2. Vignette sombre progressive pour une lisibilité parfaite */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 via-50% to-transparent opacity-90 group-hover:opacity-95 transition-opacity" />

      {/* 3. Badges en haut : Catégorie & Nombre de Joueurs */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
        {game.badge ? (
          <span className="px-2.5 py-1 rounded bg-[#E50914] text-[10px] sm:text-xs font-black uppercase tracking-wider text-white shadow-md">
            {game.badge}
          </span>
        ) : (
          <span className="px-2.5 py-0.5 rounded bg-black/80 text-[10px] sm:text-xs font-black uppercase tracking-wider text-gray-200 border border-white/15">
            {game.category}
          </span>
        )}

        <span className="px-2.5 py-0.5 rounded bg-black/80 text-[10px] sm:text-xs font-mono font-bold text-gray-200 border border-white/15">
          {game.minPlayers}–{game.maxPlayers} joueurs
        </span>
      </div>

      {/* 4. Bouton Play flottant au survol */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-300">
        <div className="w-12 h-12 rounded-full bg-white/90 text-black flex items-center justify-center shadow-2xl transform scale-75 group-hover:scale-100 transition-transform">
          <Play className="w-6 h-6 fill-black translate-x-0.5" />
        </div>
      </div>

      {/* 5. Titre et description en bas */}
      <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 flex flex-col justify-end pointer-events-none">
        <h4 className="text-base sm:text-lg md:text-xl font-black font-display text-white uppercase tracking-tight leading-tight drop-shadow truncate">
          {game.title}
        </h4>
        <span className="text-xs sm:text-sm text-gray-300 font-medium truncate mt-1">
          {game.tagline}
        </span>
      </div>
    </div>
  );
};
