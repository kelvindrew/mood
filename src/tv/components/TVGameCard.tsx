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
      className={`group relative aspect-[16/9] w-full rounded-xl overflow-hidden cursor-pointer bg-[#0F172A] transition-all duration-200 transform outline-none select-none ${
        isActive
          ? 'border-2 border-cyan-400 scale-[1.02] z-20 shadow-[0_12px_28px_rgba(6,182,212,0.25)] opacity-100 ring-2 ring-cyan-400/30'
          : 'border border-slate-700/60 hover:border-cyan-400/80 hover:scale-[1.02] hover:z-20 focus:border-2 focus:border-cyan-400 focus:scale-[1.02] focus:z-20 shadow-md opacity-90 hover:opacity-100 focus:opacity-100'
      } ${className}`}
    >
      {/* 1. Full Bleed 16:9 Thumbnail Image */}
      <img
        src={game.coverImage || game.heroImage}
        alt={game.title}
        loading="lazy"
        className="w-full h-full object-cover object-center filter brightness-[0.92] group-hover:brightness-100 transition-all duration-300"
      />

      {/* 2. Vignette sombre progressive et légère pour une lisibilité parfaite */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0A0F1D] via-[#0A0F1D]/60 via-45% to-transparent opacity-85 group-hover:opacity-90 transition-opacity" />

      {/* 3. Badge distinctif en haut uniquement s'il apporte une information utile */}
      {game.badge && (
        <div className="absolute top-3 left-3 pointer-events-none">
          <span className="px-2.5 py-0.5 rounded-md bg-amber-500/20 border border-amber-400/40 text-[10px] sm:text-xs font-black uppercase tracking-wider text-amber-200 shadow-sm">
            {game.badge}
          </span>
        </div>
      )}

      {/* 4. Bouton Play flottant discret au survol ou focus */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-200">
        <div className="w-11 h-11 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center shadow-xl transform scale-90 group-hover:scale-100 group-focus:scale-100 transition-transform">
          <Play className="w-5 h-5 fill-slate-950 translate-x-0.5" />
        </div>
      </div>

      {/* 5. Titre et métadonnées en bas */}
      <div className="absolute bottom-0 left-0 right-0 p-3.5 sm:p-4 flex flex-col justify-end pointer-events-none">
        <h4 className="text-sm sm:text-base md:text-lg font-black font-display text-white uppercase tracking-tight leading-tight drop-shadow truncate">
          {game.title}
        </h4>
        <div className="flex items-center space-x-1.5 text-[11px] sm:text-xs text-slate-300 font-medium truncate mt-0.5">
          <span className="text-cyan-300/90 font-semibold">{game.category}</span>
          <span className="text-slate-500">•</span>
          <span>{game.minPlayers}–{game.maxPlayers} joueurs</span>
        </div>
      </div>
    </div>
  );
};
