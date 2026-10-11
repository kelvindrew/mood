import React, { useEffect, useState } from 'react';
import { useGame } from '../../context/GameContext';
import { adminCms } from '../../services/adminCmsService';
import { TVHeroBanner } from '../components/TVHeroBanner';
import { TVGameCard } from '../components/TVGameCard';
import { GameCatalogItem } from '../../types/game';
import { tvNav } from '../../services/tvNavigation';

const CATEGORIES: { id: string; label: string }[] = [
  { id: 'all', label: 'Tous' },
  { id: 'popular', label: 'Populaires' },
  { id: 'party', label: 'Ambiance & Party' },
  { id: 'cards', label: 'Cartes' },
  { id: 'reflexion', label: 'Réflexion' },
];

export const TVHomeView: React.FC = () => {
  const { setSelectedGame, createRoom } = useGame();
  const [games, setGames] = useState<GameCatalogItem[]>(adminCms.getGamesCatalog());
  const [spotlightGame, setSpotlightGame] = useState<GameCatalogItem>(games[0]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

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

  const displayedGames =
    selectedCategory === 'all'
      ? games
      : games.filter((g) => g.category === selectedCategory);

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
            {displayedGames.length} jeu{displayedGames.length > 1 ? 'x' : ''} affiché{displayedGames.length > 1 ? 's' : ''}
          </span>
        </div>

        {/* Filtres de catégories accessibles à la télécommande */}
        <div className="flex items-center space-x-2.5 overflow-x-auto py-1 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            const count = cat.id === 'all' ? games.length : games.filter((g) => g.category === cat.id).length;
            return (
              <button
                key={cat.id}
                data-tv-focus
                tabIndex={0}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all outline-none cursor-pointer ${
                  isSelected
                    ? 'bg-cyan-400 text-slate-950 font-black shadow-[0_2px_15px_rgba(6,182,212,0.35)] scale-102 ring-2 ring-white/50'
                    : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 focus:bg-white focus:text-slate-950 focus:ring-4 focus:ring-cyan-400'
                }`}
              >
                <span>{cat.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isSelected ? 'bg-slate-950/30 text-slate-950 font-black' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Grille équilibrée 16:9 adaptée à 720p, 1080p et 4K */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-5 md:gap-6 pb-12">
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
