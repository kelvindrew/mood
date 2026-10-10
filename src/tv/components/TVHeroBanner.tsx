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
    <div className="relative w-full pt-16 md:pt-20 pb-3 px-8 md:px-12 select-none z-10">
      <div className="max-w-2xl flex flex-col space-y-3 animate-fade-in">
        {/* Catégorie et métadonnées hiérarchisées */}
        <div className="flex items-center space-x-3">
          <span className="px-2.5 py-0.5 rounded-full bg-cyan-950/70 border border-cyan-400/30 text-cyan-300 text-[11px] font-bold uppercase tracking-wider">
            {game.category}
          </span>
          {game.badge && (
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[11px] font-black uppercase tracking-wider">
              {game.badge}
            </span>
          )}
          <span className="text-slate-300 text-xs sm:text-sm font-semibold flex items-center space-x-1.5">
            <span>{game.minPlayers}–{game.maxPlayers} Joueurs</span>
            <span className="text-slate-500">•</span>
            <span>{game.durationMinutes}</span>
          </span>
        </div>

        {/* Titre Display proportionné */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-display tracking-tight text-white leading-tight drop-shadow-[0_2px_15px_rgba(0,0,0,0.85)]">
          {game.title}
        </h1>

        {/* Description Épurée et concise */}
        <p className="text-xs sm:text-sm md:text-base text-slate-300 font-sans leading-relaxed max-w-xl line-clamp-2 drop-shadow">
          {game.description || game.tagline}
        </p>

        {/* Bouton Unique : JOUER (lancement / salon QR) */}
        <div className="flex items-center space-x-4 pt-1">
          <button
            data-tv-focus
            tabIndex={0}
            onClick={() => {
              audio.playSelect();
              onPlay(game);
            }}
            className="px-8 py-3 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black text-xs sm:text-sm md:text-base uppercase tracking-wider flex items-center space-x-2.5 transition-all outline-none focus:scale-105 focus:ring-4 focus:ring-white focus:bg-white shadow-[0_4px_20px_rgba(6,182,212,0.35)] cursor-pointer"
          >
            <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
            <span>JOUER</span>
          </button>
        </div>
      </div>
    </div>
  );
};
