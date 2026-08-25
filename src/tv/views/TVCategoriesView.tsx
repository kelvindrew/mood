import React, { useState, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { GAMES_CATALOG, CATEGORIES } from '../../data/gamesCatalog';
import { TVGameCard } from '../components/TVGameCard';
import { Layers, Flame, Users, Sparkles, Trophy, Brain, Zap } from 'lucide-react';
import { audio } from '../../services/audio';
import { tvNav } from '../../services/tvNavigation';
import { useTvBack } from '../hooks/useTvNav';
import { GameCatalogItem } from '../../types/game';

export const TVCategoriesView: React.FC = () => {
  const { setSelectedGame, setTvView, createRoom } = useGame();
  const [selectedCat, setSelectedCat] = useState('all');

  // M5 — Back télécommande = retour à l'accueil
  useTvBack(() => {
    audio.playBack();
    setTvView('home');
  });

  useEffect(() => {
    tvNav.setInitialFocus('button');
  }, [selectedCat]);

  const filteredGames = selectedCat === 'all'
    ? GAMES_CATALOG
    : GAMES_CATALOG.filter((g) => g.category === selectedCat);

  const handlePlayGame = async (game: GameCatalogItem) => {
    setSelectedGame(game);
    await createRoom(game.id);
  };

  const handleSelectGame = (game: GameCatalogItem) => {
    setSelectedGame(game);
    setTvView('detail');
  };

  return (
    <div className="min-h-screen pt-24 px-12 pb-24 select-none flex flex-col space-y-8">
      {/* Category Pills Header */}
      <div className="space-y-4">
        <div>
          <span className="text-xs font-black uppercase text-brand-red tracking-widest">CATALOGUE COMPLET</span>
          <h1 className="text-3xl font-black font-display text-white mt-1">Explorez par Catégories</h1>
        </div>

        <div className="flex items-center space-x-3 overflow-x-auto pb-2">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCat === cat.id;
            return (
              <button
                key={cat.id}
                data-tv-focus
                tabIndex={0}
                onClick={() => {
                  audio.playSelect();
                  setSelectedCat(cat.id);
                }}
                className={`flex items-center space-x-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all outline-none flex-shrink-0 ${
                  isActive
                    ? 'bg-brand-red text-white shadow-glow-red scale-105 ring-2 ring-white'
                    : 'bg-surface-card border border-white/10 text-gray-300 hover:text-white focus:bg-white focus:text-background focus:ring-4 focus:ring-brand-accent'
                }`}
              >
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid of Games */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredGames.map((game) => (
          <TVGameCard
            key={game.id}
            game={game}
            onSelect={handleSelectGame}
            onPlayDirect={handlePlayGame}
          />
        ))}
      </div>
    </div>
  );
};
