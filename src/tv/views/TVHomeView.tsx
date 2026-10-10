import React, { useEffect, useState, useMemo } from 'react';
import { useGame } from '../../context/GameContext';
import { adminCms } from '../../services/adminCmsService';
import { TVHeroBanner } from '../components/TVHeroBanner';
import { TVGameCard } from '../components/TVGameCard';
import { GameCatalogItem } from '../../types/game';
import { tvNav } from '../../services/tvNavigation';
import { Sparkles, Users, Layers, Trophy } from 'lucide-react';

export const TVHomeView: React.FC = () => {
  const { setSelectedGame, createRoom } = useGame();
  const [games, setGames] = useState<GameCatalogItem[]>(adminCms.getGamesCatalog());
  const [spotlightGame, setSpotlightGame] = useState<GameCatalogItem>(games[0]);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'party' | 'board' | 'cards'>('all');

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

  // Groupes de jeux
  const partyGames = useMemo(() => {
    return games.filter((g) =>
      ['spy', 'bomb_party', 'petit_bac', 'fake_news', 'meme_factory', 'connect_four', 'quick_games', 'wild_rush'].includes(g.id)
    );
  }, [games]);

  const boardGames = useMemo(() => {
    return games.filter((g) =>
      ['ludo', 'scrabble', 'four_pics', 'naval_battle', 'werewolf', 'quiz', 'blind_test', 'draw_and_guess'].includes(g.id)
    );
  }, [games]);

  const cardGames = useMemo(() => {
    return games.filter((g) =>
      ['card_party', 'president', 'poker', 'blackjack', 'menteur', 'inter'].includes(g.id)
    );
  }, [games]);

  // Jeux affichés selon le filtre sélectionné
  const displayedGames = useMemo(() => {
    if (selectedFilter === 'party') return partyGames;
    if (selectedFilter === 'board') return boardGames;
    if (selectedFilter === 'cards') return cardGames;
    return games;
  }, [selectedFilter, games, partyGames, boardGames, cardGames]);

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

      {/* 3. Disposition des jeux d'en haut vers le bas (Grande grille verticale) */}
      <div className="relative z-10 pt-6 px-8 md:px-12 space-y-6">
        {/* En-tête de section avec titre et filtres par catégories */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-white/10">
          <div>
            <h2 className="text-xl sm:text-2xl font-black font-display text-white tracking-wide">
              TOUS LES JEUX DU SALON
            </h2>
            <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
              Sélectionnez un jeu ci-dessous pour ouvrir le salon et connecter vos smartphones
            </p>
          </div>

          {/* Pilules de filtres */}
          <div className="flex items-center space-x-2.5 overflow-x-auto scrollbar-none py-1">
            <button
              onClick={() => setSelectedFilter('all')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider flex items-center space-x-1.5 transition-all outline-none cursor-pointer ${
                selectedFilter === 'all'
                  ? 'bg-white text-black shadow-lg scale-105'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Tous ({games.length})</span>
            </button>

            <button
              onClick={() => setSelectedFilter('party')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider flex items-center space-x-1.5 transition-all outline-none cursor-pointer ${
                selectedFilter === 'party'
                  ? 'bg-white text-black shadow-lg scale-105'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Ambiance</span>
            </button>

            <button
              onClick={() => setSelectedFilter('board')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider flex items-center space-x-1.5 transition-all outline-none cursor-pointer ${
                selectedFilter === 'board'
                  ? 'bg-white text-black shadow-lg scale-105'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>Société</span>
            </button>

            <button
              onClick={() => setSelectedFilter('cards')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider flex items-center space-x-1.5 transition-all outline-none cursor-pointer ${
                selectedFilter === 'cards'
                  ? 'bg-white text-black shadow-lg scale-105'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Cartes</span>
            </button>
          </div>
        </div>

        {/* Disposition d'en haut vers le bas : Grille verticale de grandes cartes paysages 16:9 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-6 md:gap-8 pb-12">
          {displayedGames.map((game) => (
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
