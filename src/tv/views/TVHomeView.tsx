import React, { useEffect, useState, useMemo } from 'react';
import { useGame } from '../../context/GameContext';
import { adminCms } from '../../services/adminCmsService';
import { TVHeroBanner } from '../components/TVHeroBanner';
import { TVGameRow } from '../components/TVGameRow';
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

  const filterTitle = useMemo(() => {
    if (selectedFilter === 'party') return "JEUX D'AMBIANCE & FÊTE";
    if (selectedFilter === 'board') return "SOCIÉTÉ, MOTS & RÉFLEXION";
    if (selectedFilter === 'cards') return "JEUX DE CARTES & BLUFF";
    return "CATALOGUE COMPLET DES JEUX";
  }, [selectedFilter]);

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

        {/* Dégradé sombre gauche pour une lisibilité parfaite des textes */}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/95 via-42% via-black/50 via-75% to-transparent" />

        {/* Vignette haut & bas */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black via-black/70 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-[50vh] bg-gradient-to-t from-black via-black/95 to-transparent" />
      </div>

      {/* 2. Hero Section : Présentation du Jeu + Bouton JOUER */}
      <TVHeroBanner
        game={spotlightGame}
        onPlay={handlePlayGame}
      />

      {/* 3. Filtres de Catégories épurés & Disposition Grand Format */}
      <div className="relative z-10 pt-2 pb-6 space-y-4">
        {/* Pilules de filtres pour naviguer sans encombrement */}
        <div className="flex items-center space-x-3 px-8 md:px-12 overflow-x-auto scrollbar-none py-1">
          <button
            onClick={() => setSelectedFilter('all')}
            className={`px-4 py-2 rounded-full text-xs md:text-sm font-black uppercase tracking-wider flex items-center space-x-2 transition-all outline-none cursor-pointer ${
              selectedFilter === 'all'
                ? 'bg-white text-black shadow-lg scale-105'
                : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Tous les Jeux ({games.length})</span>
          </button>

          <button
            onClick={() => setSelectedFilter('party')}
            className={`px-4 py-2 rounded-full text-xs md:text-sm font-black uppercase tracking-wider flex items-center space-x-2 transition-all outline-none cursor-pointer ${
              selectedFilter === 'party'
                ? 'bg-white text-black shadow-lg scale-105'
                : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Ambiance & Fête</span>
          </button>

          <button
            onClick={() => setSelectedFilter('board')}
            className={`px-4 py-2 rounded-full text-xs md:text-sm font-black uppercase tracking-wider flex items-center space-x-2 transition-all outline-none cursor-pointer ${
              selectedFilter === 'board'
                ? 'bg-white text-black shadow-lg scale-105'
                : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>Société & Mots</span>
          </button>

          <button
            onClick={() => setSelectedFilter('cards')}
            className={`px-4 py-2 rounded-full text-xs md:text-sm font-black uppercase tracking-wider flex items-center space-x-2 transition-all outline-none cursor-pointer ${
              selectedFilter === 'cards'
                ? 'bg-white text-black shadow-lg scale-105'
                : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Cartes & Casino</span>
          </button>
        </div>

        {/* Le Grand Carrousel 16:9 Widescreen Agrandit */}
        <TVGameRow
          title={filterTitle}
          games={displayedGames}
          activeGameId={spotlightGame.id}
          onHighlightGame={handleHighlightGame}
          onSelectGame={handlePlayGame}
          onPlayGame={handlePlayGame}
        />
      </div>
    </div>
  );
};
