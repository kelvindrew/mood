import React, { useRef } from 'react';
import { GameCatalogItem } from '../../types/game';
import { TVGameCard } from './TVGameCard';
import { ChevronRight } from 'lucide-react';

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
      {/* Category Row Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {icon}
          <h2 className="text-sm md:text-base font-extrabold font-display text-white tracking-[0.2em] uppercase flex items-center group cursor-pointer">
            <span>{title}</span>
            <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-white group-hover:translate-x-1 transition-all ml-1" />
          </h2>
        </div>
        <span className="text-[11px] font-mono font-bold text-gray-500 uppercase tracking-widest">
          {games.length} {games.length > 1 ? 'Jeux' : 'Jeu'}
        </span>
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
