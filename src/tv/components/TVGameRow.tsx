import React, { useRef } from 'react';
import { GameCatalogItem } from '../../types/game';
import { TVGameCard } from './TVGameCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface TVGameRowProps {
  title: string;
  games: GameCatalogItem[];
  activeGameId?: string;
  onSelectGame: (game: GameCatalogItem) => void;
  onPlayGame: (game: GameCatalogItem) => void;
  onHighlightGame?: (game: GameCatalogItem) => void;
}

export const TVGameRow: React.FC<TVGameRowProps> = ({
  title,
  games,
  activeGameId,
  onSelectGame,
  onPlayGame,
  onHighlightGame,
}) => {
  const rowRef = useRef<HTMLDivElement>(null);

  if (games.length === 0) return null;

  const scroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const scrollAmount = rowRef.current.clientWidth * 0.7;
      rowRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="relative group/row flex flex-col space-y-3 py-2 px-8 md:px-12 select-none">
      {/* Category Row Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-base sm:text-lg md:text-xl font-bold font-display text-white tracking-wide">
          {title}
        </h2>
        <span className="text-xs font-mono font-bold text-gray-400">
          {games.length} jeux
        </span>
      </div>

      {/* Horizontal Carousel Container with Left/Right Chevrons */}
      <div className="relative">
        {/* Left Arrow Button */}
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-40 w-12 h-24 rounded-r-xl bg-black/60 hover:bg-black/90 border-r border-y border-white/20 text-white flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity backdrop-blur-md cursor-pointer outline-none focus:opacity-100"
          title="Défiler vers la gauche"
        >
          <ChevronLeft className="w-8 h-8" />
        </button>

        {/* The Grand 16:9 Landscape Cards Carousel */}
        <div
          ref={rowRef}
          className="flex items-center space-x-5 md:space-x-6 overflow-x-auto py-5 px-2 scrollbar-none scroll-smooth focus-within:scroll-auto"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {games.map((game) => (
            <TVGameCard
              key={game.id}
              game={game}
              isActive={activeGameId === game.id}
              className="w-72 sm:w-80 md:w-96 lg:w-[410px] xl:w-[450px]"
              onSelect={onSelectGame}
              onPlayDirect={onPlayGame}
              onHighlight={onHighlightGame}
            />
          ))}
        </div>

        {/* Right Arrow Button */}
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-40 w-12 h-24 rounded-l-xl bg-black/60 hover:bg-black/90 border-l border-y border-white/20 text-white flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity backdrop-blur-md cursor-pointer outline-none focus:opacity-100"
          title="Défiler vers la droite"
        >
          <ChevronRight className="w-8 h-8" />
        </button>
      </div>
    </div>
  );
};
