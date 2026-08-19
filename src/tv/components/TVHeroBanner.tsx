import React from 'react';
import { GameCatalogItem } from '../../types/game';
import { Play, Info, Users, Clock, Flame, Smartphone, Bot } from 'lucide-react';
import { audio } from '../../services/audio';

interface TVHeroBannerProps {
  game: GameCatalogItem;
  onPlay: (game: GameCatalogItem) => void;
  onMoreInfo: (game: GameCatalogItem) => void;
}

export const TVHeroBanner: React.FC<TVHeroBannerProps> = ({ game, onPlay, onMoreInfo }) => {
  return (
    <div className="relative w-full h-[70vh] min-h-[520px] flex items-center px-14 overflow-hidden select-none">
      {/* Background Hero Image with multi-directional gradients */}
      <div className="absolute inset-0 z-0">
        <img
          src={game.heroImage}
          alt={game.title}
          className="w-full h-full object-cover object-center transform scale-105 transition-transform duration-1000 ease-out"
        />
        {/* Left-to-right fade for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#07090E] via-[#07090E]/90 to-transparent" />
        {/* Bottom fade into content carousels */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#07090E] via-[#07090E]/40 to-transparent" />
        {/* Top vignette */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#07090E]/80 via-transparent to-transparent" />
      </div>

      {/* Hero Content Information */}
      <div className="relative z-10 max-w-2xl flex flex-col space-y-4 pt-14 animate-scale-in">
        {/* Badges Bar */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 px-3.5 py-1 rounded-full bg-gradient-to-r from-brand-red to-brand-accent text-white text-xs font-black tracking-wider uppercase shadow-glow-red border border-white/20">
            <Flame className="w-3.5 h-3.5 fill-current text-white" />
            <span>{game.badge || 'HIT DU SALON'}</span>
          </div>

          <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-surface-light/80 border border-white/10 text-brand-cyan text-xs font-bold backdrop-blur-md">
            <Smartphone className="w-3.5 h-3.5" />
            <span>Manettes Smartphones</span>
          </div>

          <div className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 text-xs font-bold">
            <Bot className="w-3.5 h-3.5" />
            <span>Bots IA Inclus</span>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-5xl lg:text-7xl font-black font-display tracking-tight text-white drop-shadow-2xl leading-none">
          {game.title}
        </h1>

        {/* Tagline */}
        <p className="text-xl font-bold text-red-200/90 leading-snug drop-shadow">
          {game.tagline}
        </p>

        {/* Badges: Players, Duration, Difficulty */}
        <div className="flex items-center space-x-3.5 text-sm font-bold text-gray-200 pt-0.5">
          <div className="flex items-center space-x-1.5 px-3.5 py-1 rounded-xl bg-surface-light/80 border border-white/15 backdrop-blur-md shadow-md">
            <Users className="w-4 h-4 text-brand-accent" />
            <span>{game.minPlayers}–{game.maxPlayers} Joueurs</span>
          </div>
          <div className="flex items-center space-x-1.5 px-3.5 py-1 rounded-xl bg-surface-light/80 border border-white/15 backdrop-blur-md shadow-md">
            <Clock className="w-4 h-4 text-brand-gold" />
            <span>{game.durationMinutes}</span>
          </div>
          <div className="px-3.5 py-1 rounded-xl bg-surface-light/80 border border-white/15 text-emerald-400 font-bold backdrop-blur-md shadow-md">
            {game.difficulty}
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-300 text-sm line-clamp-3 leading-relaxed pt-1 max-w-xl font-medium">
          {game.description}
        </p>

        {/* Action Buttons with clean icons */}
        <div className="flex items-center space-x-4 pt-4">
          <button
            data-tv-focus
            tabIndex={0}
            onClick={() => {
              audio.playSelect();
              onPlay(game);
            }}
            className="flex items-center space-x-3 px-9 py-4 rounded-2xl bg-gradient-to-r from-brand-red to-brand-accent hover:from-red-600 hover:to-brand-red text-white font-black text-lg hover:scale-105 focus:scale-110 focus:bg-white focus:text-brand-red focus:ring-4 focus:ring-white shadow-glow-red transition-all outline-none"
          >
            <Play className="w-6 h-6 fill-current" />
            <span>CRÉER UN SALON</span>
          </button>

          <button
            data-tv-focus
            tabIndex={0}
            onClick={() => {
              audio.playSelect();
              onMoreInfo(game);
            }}
            className="flex items-center space-x-2.5 px-7 py-4 rounded-2xl bg-surface-card hover:bg-surface-light text-white font-bold text-base border border-white/20 hover:border-white/40 focus:scale-105 focus:bg-white focus:text-background focus:ring-4 focus:ring-brand-accent transition-all outline-none backdrop-blur-md shadow-lg"
          >
            <Info className="w-5 h-5 text-gray-300" />
            <span>RÈGLES & DÉTAILS</span>
          </button>
        </div>
      </div>
    </div>
  );
};
