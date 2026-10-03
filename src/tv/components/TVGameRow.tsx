import React, { useRef } from 'react';
import { GameCatalogItem } from '../../types/game';
import { TVGameCard } from './TVGameCard';

interface TVGameRowProps {
  title: string;
  games: GameCatalogItem[];
  activeGameId?: string;
  icon?: React.ReactNode;
  onSelectGame: (game: GameCatalogItem) => void;
  onPlayGame: (game: GameCatalogItem) => void;
  onHighlightGame?: (game: GameCatalogItem) => void;
}

export const TVGameRow: React.FC<TVGameRowProps> = ({
  title,
  games,
  activeGameId,
  icon: _icon,
  onSelectGame,
  onPlayGame,
  onHighlightGame,
}) => {
  const rowRef = useRef<HTMLDivElement>(null);

  if (games.length === 0) return null;

  return (
    <div className="flex flex-col space-y-2 py-1 px-8 md:px-12 select-none">
      {/* Category Row Header (Netflix Style: Clean, bold, accessible) */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm md:text-base lg:text-lg font-bold text-gray-200 tracking-normal hover:text-white transition-colors">
          {title}
        </h2>
      </div>

      {/* Horizontal Posters Carousel */}
      <div
        ref={rowRef}
        className="flex items-center space-x-4 md:space-x-5 overflow-x-auto py-4 px-2 scrollbar-none scroll-smooth focus-within:scroll-auto"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {games.map((game) => (
          <TVGameCard
            key={game.id}
            game={game}
            isActive={activeGameId === game.id}
            className="w-56 md:w-64 lg:w-72"
            onSelect={onSelectGame}
            onPlayDirect={onPlayGame}
            onHighlight={onHighlightGame}
          />
        ))}
      </div>
    </div>
  );
};
