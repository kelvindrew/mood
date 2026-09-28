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
  icon,
  onSelectGame,
  onPlayGame,
  onHighlightGame,
}) => {
  const rowRef = useRef<HTMLDivElement>(null);

  if (games.length === 0) return null;

  return (
    <div className="flex flex-col space-y-3 py-2 px-8 md:px-12 select-none">
      {/* Category Row Header (Reference Image Style: Pure Clean 'MY LIST') */}
      <div className="flex items-center justify-between pb-1">
        <h2 className="text-sm md:text-base font-extrabold font-display text-white tracking-[0.2em] uppercase">
          {title}
        </h2>
      </div>

      {/* Horizontal Posters Carousel */}
      <div
        ref={rowRef}
        className="flex items-center space-x-4 md:space-x-5 overflow-x-auto py-3 px-1 scrollbar-none scroll-smooth focus-within:scroll-auto"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {games.map((game) => (
          <TVGameCard
            key={game.id}
            game={game}
            isActive={activeGameId === game.id}
            className="w-36 md:w-44 lg:w-48"
            onSelect={onSelectGame}
            onPlayDirect={onPlayGame}
            onHighlight={onHighlightGame}
          />
        ))}
      </div>
    </div>
  );
};
