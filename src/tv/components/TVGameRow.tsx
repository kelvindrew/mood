import React, { useRef } from 'react';
import { GameCatalogItem } from '../../types/game';
import { TVGameCard } from './TVGameCard';
import { ChevronRight } from 'lucide-react';

interface TVGameRowProps {
  title: string;
  games: GameCatalogItem[];
  icon?: React.ReactNode;
  onSelectGame: (game: GameCatalogItem) => void;
  onPlayGame: (game: GameCatalogItem) => void;
}

export const TVGameRow: React.FC<TVGameRowProps> = ({ title, games, icon, onSelectGame, onPlayGame }) => {
  const rowRef = useRef<HTMLDivElement>(null);

  if (games.length === 0) return null;

  return (
    <div className="flex flex-col space-y-3 py-3 px-12 select-none">
      {/* Category Row Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          {icon}
          <h2 className="text-xl font-black font-display text-white tracking-wide flex items-center group cursor-pointer">
            <span>{title}</span>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-white group-hover:translate-x-1 transition-all ml-1" />
          </h2>
        </div>
        <span className="text-xs font-semibold text-gray-400">
          {games.length} {games.length > 1 ? 'Jeux' : 'Jeu'}
        </span>
      </div>

      {/* Horizontal Carousel */}
      <div
        ref={rowRef}
        className="flex items-center space-x-5 overflow-x-auto py-4 -my-4 scrollbar-none scroll-smooth focus-within:scroll-auto"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {games.map((game) => (
          <TVGameCard
            key={game.id}
            game={game}
            onSelect={onSelectGame}
            onPlayDirect={onPlayGame}
          />
        ))}
      </div>
    </div>
  );
};
