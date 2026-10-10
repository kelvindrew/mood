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
    <div className="relative min-h-screen text-white select-none pb-16 overflow-x-hidden bg-[#0A0F1D]">
      {/* 1. Arrière-plan cinématique bleu nuit profond */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden select-none bg-[#0A0F1D]">
        <img
          key={spotlightGame.id}
          src={spotlightGame.heroImage || spotlightGame.coverImage}
          alt={spotlightGame.title}
          className="w-full h-full object-cover object-right md:object-center filter brightness-[0.75] contrast-[1.08] transition-opacity duration-700 animate-fade-in"
        />

        {/* Dégradé latéral pour préserver le contraste des textes */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A0F1D] via-[#0A0F1D]/90 via-45% to-transparent" />

        {/* Vignettes douces haut et bas */}
        <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-b from-[#0A0F1D] via-[#0A0F1D]/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-[55vh] bg-gradient-to-t from-[#0A0F1D] via-[#0A0F1D]/95 to-transparent" />
      </div>

      {/* 2. Zone Hero équilibrée : Présentation du Jeu + Bouton JOUER */}
      <TVHeroBanner
        game={spotlightGame}
        onPlay={handlePlayGame}
      />

      {/* 3. Catalogue des jeux : Navigation fluide et aérée */}
      <div className="relative z-10 pt-2 px-8 md:px-12 space-y-4">
        {/* Titre de section sobre avec repère turquoise */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <span className="w-1.5 h-4 sm:h-5 rounded-full bg-cyan-400" />
            <h2 className="text-base sm:text-lg md:text-xl font-bold font-display text-white tracking-wide uppercase">
              Catalogue des jeux
            </h2>
          </div>
          <span className="text-xs font-mono font-medium text-slate-400 bg-slate-900/80 border border-slate-700/50 px-2.5 py-0.5 rounded-full">
            {games.length} jeux disponibles
          </span>
        </div>

        {/* Grille équilibrée 16:9 adaptée à 720p, 1080p et 4K */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-5 md:gap-6 pb-12">
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
