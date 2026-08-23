import React from 'react';
import { GameCatalogItem } from '../../types/game';
import {
  Play,
  SkipBack,
  SkipForward,
} from 'lucide-react';
import { useGame } from '../../context/GameContext';

interface TVFloatingControlBarProps {
  activeGame: GameCatalogItem;
  onPrev: () => void;
  onNext: () => void;
  onPlay: (game: GameCatalogItem) => void;
  onMoreInfo: (game: GameCatalogItem) => void;
}

export const TVFloatingControlBar: React.FC<TVFloatingControlBarProps> = ({
  activeGame,
  onPrev,
  onNext,
  onPlay,
  onMoreInfo,
}) => {
  const { setTvView } = useGame();

  return (
    <div className="fixed bottom-5 left-0 right-0 z-40 flex items-center justify-center pointer-events-auto select-none">
      {/* Pure Floating Controls (Instant Response, Zero Audio Overhead) */}
      <div className="flex items-center justify-center space-x-6 sm:space-x-8 max-w-4xl px-4 py-1.5 rounded-2xl bg-black/60 border border-white/10 shadow-xl">
        {/* 1. Left Navigation Controls */}
        <div className="flex items-center space-x-3">
          <button
            data-tv-focus
            tabIndex={0}
            onClick={onPrev}
            className="text-white/70 hover:text-white p-1.5 transition-transform active:scale-90 outline-none focus:scale-115 focus:text-[#FBBF24]"
            title="Précédent"
          >
            <SkipBack className="w-5 h-5 fill-current" />
          </button>

          <button
            data-tv-focus
            tabIndex={0}
            onClick={() => onPlay(activeGame)}
            className="w-11 h-11 rounded-full bg-emerald-400 text-black flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.7)] transition-all hover:scale-105 active:scale-95 outline-none focus:scale-115"
            title="Lancer le Salon"
          >
            <Play className="w-5 h-5 fill-current ml-0.5" />
          </button>

          <button
            data-tv-focus
            tabIndex={0}
            onClick={onNext}
            className="text-white/70 hover:text-white p-1.5 transition-transform active:scale-90 outline-none focus:scale-115 focus:text-[#FBBF24]"
            title="Suivant"
          >
            <SkipForward className="w-5 h-5 fill-current" />
          </button>
        </div>

        {/* 2. Center Active Game Track Info */}
        <div
          onClick={() => onMoreInfo(activeGame)}
          className="flex items-center space-x-3 cursor-pointer transition-transform hover:scale-102 max-w-xs sm:max-w-md truncate"
        >
          <div className="w-9 h-9 rounded-lg overflow-hidden shadow relative flex-shrink-0">
            <img
              src={activeGame.coverImage || activeGame.heroImage}
              alt={activeGame.title}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex flex-col truncate">
            <span className="font-display font-black text-sm text-white truncate">
              {activeGame.title}
            </span>
            <span className="text-[11px] text-gray-400 truncate">
              Appuyez sur Entrée / Play pour lancer
            </span>
          </div>
        </div>

        {/* 3. Direct Category catalogue button */}
        <button
          onClick={() => setTvView('categories')}
          className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center space-x-1.5 transition-all outline-none focus:scale-110 focus:bg-white/25"
        >
          <span>TOUS LES JEUX</span>
        </button>
      </div>
    </div>
  );
};
