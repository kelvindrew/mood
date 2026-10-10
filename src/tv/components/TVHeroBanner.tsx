import React from 'react';
import { GameCatalogItem } from '../../types/game';
import { Play } from 'lucide-react';
import { audio } from '../../services/audio';

interface TVHeroBannerProps {
  game: GameCatalogItem;
  onPlay: (game: GameCatalogItem) => void;
}

export const TVHeroBanner: React.FC<TVHeroBannerProps> = ({ game, onPlay }) => {
  return (
    <div className="relative w-full pt-20 md:pt-28 pb-6 px-8 md:px-12 select-none z-10">
      <div className="max-w-3xl flex flex-col space-y-4 animate-fade-in">
        {/* Catégorie et métadonnées */}
        <div className="flex items-center space-x-3">
          <span className="px-2.5 py-0.5 rounded bg-[#E50914] text-white text-[11px] font-black uppercase tracking-wider shadow-sm">
            {game.badge || game.category.toUpperCase()}
          </span>
          <span className="text-gray-300 text-xs md:text-sm font-semibold">
            {game.minPlayers}–{game.maxPlayers} Joueurs • {game.durationMinutes}
          </span>
        </div>

        {/* Titre Display Widescreen */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black font-display tracking-tight text-white leading-[1.05] drop-shadow-[0_4px_25px_rgba(0,0,0,0.95)]">
          {game.title}
        </h1>

        {/* Description Épurée */}
        <p className="text-sm md:text-base lg:text-lg text-gray-200/90 font-sans leading-relaxed max-w-2xl drop-shadow line-clamp-3">
          {game.description || game.tagline}
        </p>

        {/* Bouton Unique : JOUER (qui ouvre le salon avec le Code QR) */}
        <div className="flex items-center space-x-4 pt-3">
          <button
            data-tv-focus
            tabIndex={0}
            onClick={() => {
              audio.playSelect();
              onPlay(game);
            }}
            className="px-9 py-3.5 rounded-lg bg-white hover:bg-gray-200 text-black font-black text-sm md:text-base uppercase tracking-wider flex items-center space-x-3 transition-transform active:scale-95 outline-none focus:ring-4 focus:ring-[#E50914] shadow-[0_4px_25px_rgba(255,255,255,0.35)] cursor-pointer"
          >
            <Play className="w-5 h-5 fill-black" />
            <span>JOUER</span>
          </button>
        </div>
      </div>
    </div>
  );
};
