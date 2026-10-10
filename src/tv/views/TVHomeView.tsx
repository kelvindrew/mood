import React, { useEffect, useState, useMemo } from 'react';
import { useGame } from '../../context/GameContext';
import { adminCms } from '../../services/adminCmsService';
import { TVHeroBanner } from '../components/TVHeroBanner';
import { TVGameRow } from '../components/TVGameRow';
import { GameCatalogItem } from '../../types/game';
import { tvNav } from '../../services/tvNavigation';
import { socketService } from '../../services/socket';

export const TVHomeView: React.FC = () => {
  const { setSelectedGame, createRoom, room, startGame } = useGame();
  const [games, setGames] = useState<GameCatalogItem[]>(adminCms.getGamesCatalog());
  const [spotlightGame, setSpotlightGame] = useState<GameCatalogItem>(games[0]);

  // Initialisation et auto-création du salon dès l'allumage pour afficher le QR code
  useEffect(() => {
    tvNav.setInitialFocus('button');
    const unsub = adminCms.subscribe(() => {
      const updated = adminCms.getGamesCatalog();
      setGames(updated);
      if (updated.length > 0 && !spotlightGame) {
        setSpotlightGame(updated[0]);
      }
    });

    // Si aucun salon n'est encore actif, on en crée un immédiatement
    if (!room && spotlightGame) {
      createRoom(spotlightGame.id, { maxPlayers: spotlightGame.maxPlayers });
    }

    return () => unsub();
  }, []);

  // Changement de jeu en temps réel pour le salon actif
  const handleSelectGame = (game: GameCatalogItem) => {
    setSpotlightGame(game);
    setSelectedGame(game);
    if (room?.code) {
      socketService.getSocket()?.emit('select_game', { code: room.code, gameId: game.id });
    }
  };

  const handleLaunchGame = async () => {
    if (!room) {
      await createRoom(spotlightGame.id, { maxPlayers: spotlightGame.maxPlayers });
    }
    startGame();
  };

  // Groupes de jeux épurés
  const partyGames = useMemo(() => {
    return games.filter((g) =>
      ['spy', 'bomb_party', 'petit_bac', 'fake_news', 'meme_factory', 'connect_four', 'quick_games', 'wild_rush'].includes(g.id)
    );
  }, [games]);

  const boardAndCards = useMemo(() => {
    return games.filter((g) =>
      ['ludo', 'scrabble', 'card_party', 'president', 'poker', 'blackjack', 'menteur', 'inter', 'four_pics', 'naval_battle', 'werewolf', 'quiz', 'blind_test', 'draw_and_guess'].includes(g.id)
    );
  }, [games]);

  return (
    <div className="relative min-h-screen text-white select-none pb-12 overflow-x-hidden bg-black">
      {/* 1. Dynamic Full-Bleed Background Cinema Widescreen */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden select-none bg-black">
        <img
          key={spotlightGame.id}
          src={spotlightGame.heroImage || spotlightGame.coverImage}
          alt={spotlightGame.title}
          className="w-full h-full object-cover object-right md:object-center filter brightness-[0.80] contrast-[1.12] transition-opacity duration-700 animate-fade-in"
        />

        {/* Dégradé sombre gauche pour une lisibilité parfaite des textes et du QR Code */}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/95 via-42% via-black/50 via-75% to-transparent" />

        {/* Vignette haut & bas */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black via-black/70 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-[50vh] bg-gradient-to-t from-black via-black/95 to-transparent" />
      </div>

      {/* 2. Hero Section : Présentation du Jeu + Le Module Connexion Code QR */}
      <TVHeroBanner
        game={spotlightGame}
        onLaunchGame={handleLaunchGame}
      />

      {/* 3. Carrousels Horizontaux 16:9 Widescreen */}
      <div className="relative z-10 pt-2 pb-6 space-y-4">
        {/* Ligne 1 : Jeux d'Ambiance & Fête */}
        <TVGameRow
          title="JEUX D'AMBIANCE & FÊTE"
          games={partyGames}
          activeGameId={spotlightGame.id}
          onHighlightGame={handleSelectGame}
          onSelectGame={handleSelectGame}
          onPlayGame={handleLaunchGame}
        />

        {/* Ligne 2 : Société, Cartes & Stratégie */}
        <TVGameRow
          title="SOCIÉTÉ, CARTES & STRATÉGIE"
          games={boardAndCards}
          activeGameId={spotlightGame.id}
          onHighlightGame={handleSelectGame}
          onSelectGame={handleSelectGame}
          onPlayGame={handleLaunchGame}
        />
      </div>
    </div>
  );
};
