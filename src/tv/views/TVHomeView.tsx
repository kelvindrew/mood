import React, { useEffect, useState } from 'react';
import { useGame } from '../../context/GameContext';
import { adminCms } from '../../services/adminCmsService';
import { TVHeroBanner } from '../components/TVHeroBanner';
import { TVGameCard } from '../components/TVGameCard';
import { GameCatalogItem } from '../../types/game';
import { tvNav } from '../../services/tvNavigation';

export const TVHomeView: React.FC = () => {
  const { setSelectedGame, createRoom } = useGame();
  const [games, setGames] = useState<GameCatalogItem[]>(adminCms.getGamesCatalog());
  const [spotlightGame, setSpotlightGame] = useState<GameCatalogItem>(games[0]);

  useEffect(() => {
    tvNav.setInitialFocus('button');
    const unsub = adminCms.subscribe(() => {
      const updated = adminCms.getGamesCatalog();
      setGames(updated);
      if (updated.length > 0 && !spotlightGame) {
        setSpotlightGame(updated[0]);
      }
    });
    return () => unsub();
  }, []);

  // Clic sur le jeu : crée le salon et bascule sur l'écran du Code QR
  const handlePlayGame = async (game: GameCatalogItem) => {
    setSelectedGame(game);
    await createRoom(game.id, { maxPlayers: game.maxPlayers });
  };

  const handleHighlightGame = (game: GameCatalogItem) => {
    setSpotlightGame(game);
    setSelectedGame(game);
  };

  return (
    <div className="relative min-h-screen text-white select-none pb-20 overflow-x-hidden bg-black">
      {/* 1. Dynamic Full-Bleed Background Cinema Widescreen */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden select-none bg-black">
        <img
          key={spotlightGame.id}
          src={spotlightGame.heroImage || spotlightGame.coverImage}
          alt={spotlightGame.title}
          className="w-full h-full object-cover object-right md:object-center filter brightness-[0.78] contrast-[1.15] transition-opacity duration-700 animate-fade-in"
        />

        {/* Dégradé sombre gauche pour une lisibilité parfaite des textes */}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/95 via-45% via-black/50 via-75% to-transparent" />

        {/* Vignette haut & bas */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black via-black/70 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-[60vh] bg-gradient-to-t from-black via-black/95 to-transparent" />
      </div>

      {/* 2. Hero Section en tête : Présentation du Jeu + Bouton JOUER */}
      <TVHeroBanner
        game={spotlightGame}
        onPlay={handlePlayGame}
      />

      {/* 3. Disposition des jeux d'en haut vers le bas (Sans boutons superflus) */}
      <div className="relative z-10 pt-4 px-8 md:px-12 space-y-5">
        {/* En-tête épuré sans aucun bouton */}
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <h2 className="text-xl sm:text-2xl font-black font-display text-white tracking-wide">
            CATALOGUE DES JEUX
          </h2>
          <span className="text-xs font-mono font-bold text-gray-400">
            {games.length} jeux disponibles
          </span>
        </div>

        {/* Grille verticale de grandes cartes paysages 16:9 : Cliquez sur un jeu pour lancer */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-6 md:gap-8 pb-12">
          {games.map((game) => (
            <TVGameCard
              key={game.id}
              game={game}
              isActive={spotlightGame.id === game.id}
              onSelect={handlePlayGame}
              onPlayDirect={handlePlayGame}
              onHighlight={handleHighlightGame}
              className="w-full"
            />
          ))}
        </div>
      </div>
    </div>
  );
};
