import React from 'react';
import { GameCatalogItem } from '../../types/game';
import { Play } from 'lucide-react';
import { audio } from '../../services/audio';

interface TVHeroBannerProps {
  game: GameCatalogItem;
  onPlay: (game: GameCatalogItem) => void;
  onMoreInfo: (game: GameCatalogItem) => void;
}

export const TVHeroBanner: React.FC<TVHeroBannerProps> = ({ game, onPlay, onMoreInfo }) => {
  return (
    <div className="relative w-full pt-28 md:pt-36 pb-6 px-8 md:px-12 select-none z-10">
      <div className="max-w-3xl flex flex-col space-y-4 animate-fade-in">
        {/* Main Title: Massive, Bold, Crisp White Display Typography (Reference Image: RAYA AND THE LAST DRAGON) */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black font-display tracking-tight text-white uppercase leading-[1.02] drop-shadow-[0_4px_30px_rgba(0,0,0,0.9)]">
          {game.title}
        </h1>

        {/* Metadata Line: Origin • 98% Match (Emerald) • Year & Players */}
        <div className="flex items-center flex-wrap gap-x-3 gap-y-1.5 text-xs md:text-sm font-medium text-gray-300">
          <span className="text-gray-200 font-semibold tracking-wide">
            Jeu Original MOOD
          </span>
          <span className="text-emerald-400 font-bold tracking-wide">
            98% Match
          </span>
          <span className="text-gray-400">
            2024
          </span>
          <span className="text-gray-500">•</span>
          <span className="text-gray-300 font-mono">
            {game.minPlayers}–{game.maxPlayers} Joueurs
          </span>
          <span className="text-gray-500">•</span>
          <span className="text-gray-400">
            {game.durationMinutes}
          </span>
        </div>

        {/* Synopsis / Tagline (Concise, Clean & Readable) */}
        <p className="text-xs md:text-sm text-gray-300/90 font-sans leading-relaxed max-w-xl line-clamp-2 drop-shadow">
          {game.description || game.tagline}
        </p>

        {/* Action CTAs (Reference Image: Single Clean Purple Pill 'PLAY') */}
        <div className="flex items-center space-x-4 pt-2">
          {/* Primary Pill Button: PLAY */}
          <button
            data-tv-focus
            tabIndex={0}
            onClick={() => {
              audio.playSelect();
              onPlay(game);
            }}
            className="px-10 py-3.5 rounded-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold text-xs uppercase tracking-[0.2em] shadow-[0_0_35px_rgba(124,58,237,0.65)] hover:scale-105 active:scale-95 transition-all outline-none focus:ring-4 focus:ring-white flex items-center justify-center space-x-2"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>PLAY</span>
          </button>
        </div>
      </div>
    </div>
  );
};
