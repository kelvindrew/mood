import React from 'react';
import { GameCatalogItem } from '../../types/game';
import { Play, Info, Star, Trophy } from 'lucide-react';
import { audio } from '../../services/audio';
import { GAME_ACCOLADES } from '../../data/gameAccolades';

interface TVHeroBannerProps {
  game: GameCatalogItem;
  onPlay: (game: GameCatalogItem) => void;
  onMoreInfo: (game: GameCatalogItem) => void;
}

export const TVHeroBanner: React.FC<TVHeroBannerProps> = ({ game, onPlay, onMoreInfo }) => {
  const accoladeText =
    GAME_ACCOLADES[game.id] ||
    game.tagline ||
    "Jeu de société culte primé, idéal pour jouer jusqu'à 8 joueurs avec vos smartphones sur grand écran.";

  const maturityBadge =
    game.category === 'party'
      ? 'PEGI 3'
      : game.category === 'cards'
      ? 'TOUT PUBLIC'
      : game.category === 'reflexion'
      ? 'PEGI 7'
      : 'TOUT PUBLIC';

  return (
    <div className="relative w-full pt-16 md:pt-24 pb-4 px-10 md:px-14 select-none z-10">
      <div className="max-w-2xl flex flex-col space-y-3.5 animate-fade-in">
        {/* 1. Main Title: Large, Clean, Pure White Display Typography (Reference Image: 'House of Cards' style) */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black font-display tracking-tight text-white leading-[1.05] drop-shadow-[0_4px_25px_rgba(0,0,0,0.95)]">
          {game.title}
        </h1>

        {/* 2. Metadata Line: 4 Red Stars • Year • Age Rating • Duration/Players • HD • 5.1 */}
        <div className="flex items-center flex-wrap gap-x-3 gap-y-1.5 text-xs md:text-sm font-medium text-gray-300">
          {/* Red Stars */}
          <div className="flex items-center space-x-1 text-[#E50914]">
            <Star className="w-3.5 h-3.5 fill-[#E50914] text-[#E50914]" />
            <Star className="w-3.5 h-3.5 fill-[#E50914] text-[#E50914]" />
            <Star className="w-3.5 h-3.5 fill-[#E50914] text-[#E50914]" />
            <Star className="w-3.5 h-3.5 fill-[#E50914] text-[#E50914]" />
            <Star className="w-3.5 h-3.5 fill-[#E50914]/20 text-[#E50914]/60" />
          </div>

          <span className="text-gray-400 font-normal">2024</span>

          {/* Maturity Age Rating Tag (Boxed) */}
          <span className="px-1.5 py-0.5 border border-gray-400/80 text-gray-300 text-[10px] font-bold tracking-wider rounded-sm uppercase">
            {maturityBadge}
          </span>

          {/* Duration / Player count */}
          <span className="text-gray-300 font-medium">
            {game.minPlayers}–{game.maxPlayers} Joueurs
          </span>

          <span className="text-gray-400 font-medium">
            {game.durationMinutes}
          </span>

          {/* Quality Tags (HD / 5.1 in small gray boxes) */}
          <div className="flex items-center space-x-1 pl-1">
            <span className="px-1 py-0.2 border border-gray-400/70 text-gray-300 text-[9px] font-bold rounded-sm tracking-wider">
              HD
            </span>
            <span className="px-1 py-0.2 border border-gray-400/70 text-gray-300 text-[9px] font-bold rounded-sm tracking-wider">
              5.1
            </span>
          </div>
        </div>

        {/* 3. Synopsis / Description (Clean, Readable, 2-3 lines) */}
        <p className="text-xs sm:text-sm md:text-base text-gray-200/90 font-sans leading-relaxed max-w-xl line-clamp-3 drop-shadow">
          {game.description || game.tagline}
        </p>

        {/* 4. Accolade / Award Callout with Red Trophy Badge (Exact Netflix Screenshot style) */}
        <div className="flex items-center space-x-3 max-w-xl py-1">
          <div className="w-7 h-7 rounded-full bg-[#E50914] flex items-center justify-center text-white flex-shrink-0 shadow-md shadow-red-600/30">
            <Trophy className="w-3.5 h-3.5 text-white" />
          </div>
          <p className="text-xs md:text-sm text-gray-300/85 italic leading-tight font-serif">
            {accoladeText}
          </p>
        </div>

        {/* 5. Sleek Netflix Action Buttons (Play & More Info) */}
        <div className="flex items-center space-x-3 pt-2">
          <button
            data-tv-focus
            tabIndex={0}
            onClick={() => {
              audio.playSelect();
              onPlay(game);
            }}
            className="px-7 py-2.5 rounded bg-white hover:bg-gray-200 text-black font-extrabold text-xs md:text-sm uppercase tracking-wider flex items-center space-x-2 transition-transform active:scale-95 outline-none focus:ring-4 focus:ring-[#E50914] shadow-lg"
          >
            <Play className="w-4 h-4 fill-black" />
            <span>JOUER</span>
          </button>

          <button
            data-tv-focus
            tabIndex={0}
            onClick={() => {
              audio.playSelect();
              onMoreInfo(game);
            }}
            className="px-6 py-2.5 rounded bg-white/20 hover:bg-white/30 text-white font-bold text-xs md:text-sm tracking-wider flex items-center space-x-2 transition-transform active:scale-95 outline-none focus:ring-4 focus:ring-white backdrop-blur-md"
          >
            <Info className="w-4 h-4" />
            <span>Plus d'infos</span>
          </button>
        </div>
      </div>
    </div>
  );
};
