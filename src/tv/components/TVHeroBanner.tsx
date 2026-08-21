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
    <div className="relative w-full h-[65vh] min-h-[500px] flex items-center px-[5vw] overflow-hidden select-none">
      {/* Background Hero Image with multi-directional gradients */}
      <div className="absolute inset-0 z-0">
        <img
          src={game.heroImage}
          alt={game.title}
          className="w-full h-full object-cover object-center transform scale-100 transition-transform duration-700 ease-out"
        />
        {/* Left-to-right fade for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#07090E] via-[#07090E]/90 to-transparent" />
        {/* Bottom fade into content carousels */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#07090E] via-[#07090E]/50 to-transparent" />
        {/* Top vignette */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#07090E]/80 via-transparent to-transparent" />
      </div>

      {/* Hero Content Information */}
      <div className="relative z-10 max-w-2xl flex flex-col space-y-4 pt-12 animate-scale-in">
        {/* Badges Bar */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-[#E50914] to-[#FF2E63] text-white text-xs font-black tracking-wider uppercase shadow-[0_0_20px_rgba(229,9,20,0.5)] border border-white/20">
            <Flame className="w-3.5 h-3.5 fill-current text-white" />
            <span>{game.badge || 'HIT DU SALON'}</span>
          </div>

          <div className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-[#181F33] border border-white/15 text-[#00F2FE] text-xs font-black">
            <Smartphone className="w-3.5 h-3.5" />
            <span>Manettes Smartphones</span>
          </div>

          <div className="flex items-center space-x-1 px-3 py-1.5 rounded-full bg-[#101420] border border-indigo-500/30 text-indigo-300 text-xs font-black">
            <Bot className="w-3.5 h-3.5" />
            <span>Bots IA Inclus</span>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-5xl lg:text-6xl font-black font-display tracking-tight text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)] leading-none">
          {game.title}
        </h1>

        {/* Tagline */}
        <p className="text-xl font-bold text-[#FFB800] leading-snug drop-shadow">
          {game.tagline}
        </p>

        {/* Badges: Players, Duration, Difficulty */}
        <div className="flex items-center space-x-3.5 text-sm font-bold text-gray-200 pt-0.5">
          <div className="flex items-center space-x-1.5 px-4 py-1.5 rounded-xl bg-[#181F33] border border-white/15 shadow-md">
            <Users className="w-4 h-4 text-[#FF2E63]" />
            <span className="font-black text-sm">{game.minPlayers}–{game.maxPlayers} Joueurs</span>
          </div>
          <div className="flex items-center space-x-1.5 px-4 py-1.5 rounded-xl bg-[#181F33] border border-white/15 shadow-md">
            <Clock className="w-4 h-4 text-[#FFB800]" />
            <span className="font-black text-sm">{game.durationMinutes}</span>
          </div>
          <div className="px-4 py-1.5 rounded-xl bg-[#181F33] border border-white/15 text-[#10B981] font-black text-sm shadow-md">
            {game.difficulty}
          </div>
        </div>

        {/* Description */}
        <p className="text-[#B8C2D8] text-base line-clamp-2 leading-relaxed pt-1 max-w-xl font-medium">
          {game.description}
        </p>

        {/* Action Buttons with high-contrast D-pad focus */}
        <div className="flex items-center space-x-4 pt-3">
          <button
            data-tv-focus
            tabIndex={0}
            onClick={() => {
              audio.playSelect();
              onPlay(game);
            }}
            className="flex items-center space-x-3 px-9 py-4 rounded-2xl bg-[#E50914] text-white font-black text-lg shadow-[0_0_30px_rgba(229,9,20,0.6)] transition-all duration-200 outline-none
                       focus:scale-110 focus:bg-white focus:text-[#E50914] focus:ring-4 focus:ring-white focus:shadow-[0_0_45px_rgba(229,9,20,0.85)]"
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
            className="flex items-center space-x-2.5 px-7 py-4 rounded-2xl bg-[#181F33] border-2 border-white/20 text-white font-bold text-base transition-all duration-200 outline-none
                       focus:scale-110 focus:bg-white focus:text-[#07090E] focus:border-white focus:shadow-[0_0_30px_rgba(255,255,255,0.7)]"
          >
            <Info className="w-5 h-5" />
            <span>Règles & Détails</span>
          </button>
        </div>
      </div>
    </div>
  );
};
