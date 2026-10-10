import React, { useState, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { GAMES_CATALOG, CATEGORIES } from '../../data/gamesCatalog';
import { TVGameCard } from '../components/TVGameCard';
import {
  Gamepad2,
  Flame,
  Sparkles,
  Trophy,
  Brain,
  Play,
  Info,
  Users,
  Clock,
  ChevronRight,
  Search,
} from 'lucide-react';
import { audio } from '../../services/audio';
import { tvNav } from '../../services/tvNavigation';
import { useTvBack } from '../hooks/useTvNav';
import { GameCatalogItem } from '../../types/game';

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  all: <Gamepad2 className="w-4 h-4" />,
  popular: <Flame className="w-4 h-4 text-amber-400" />,
  cards: <Sparkles className="w-4 h-4 text-emerald-400" />,
  party: <Trophy className="w-4 h-4 text-rose-400" />,
  reflexion: <Brain className="w-4 h-4 text-cyan-400" />,
};

export const TVCategoriesView: React.FC = () => {
  const { setSelectedGame, setTvView, createRoom, games } = useGame();
  const [selectedCat, setSelectedCat] = useState('all');
  const [spotlightGame, setSpotlightGame] = useState<GameCatalogItem>(games[0] || GAMES_CATALOG[0]);

  // M5 — Back télécommande = retour à l'accueil
  useTvBack(() => {
    audio.playBack();
    setTvView('home');
  });

  useEffect(() => {
    tvNav.setInitialFocus('button');
  }, [selectedCat]);

  const filteredGames =
    selectedCat === 'all'
      ? games
      : games.filter((g) => g.category === selectedCat);

  // Met à jour le jeu vedette lorsque la catégorie change
  useEffect(() => {
    if (filteredGames.length > 0) {
      setSpotlightGame(filteredGames[0]);
    }
  }, [selectedCat]);

  const handlePlayGame = async (game: GameCatalogItem) => {
    setSelectedGame(game);
    await createRoom(game.id, { maxPlayers: game.maxPlayers });
  };

  const handleSelectGame = (game: GameCatalogItem) => {
    setSelectedGame(game);
    setTvView('detail');
  };

  return (
    <div className="min-h-screen pt-20 px-[5vw] pb-24 select-none flex flex-col space-y-7 bg-[#0A0F1D] text-white">
      {/* 1. Header & Navigation Top Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold uppercase text-cyan-400 tracking-widest mb-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>MOOD SMART TV • CATALOGUE COMPLET</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black font-display text-white tracking-tight">
            Catalogue des Jeux de Salon
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Jouez instantanément sur grand écran en connectant vos smartphones comme manettes sans fil
          </p>
        </div>

        {/* Categories Chips Switcher */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 max-w-full">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCat === cat.id;
            const count =
              cat.id === 'all'
                ? games.length
                : games.filter((g) => g.category === cat.id).length;

            return (
              <button
                key={cat.id}
                data-tv-focus
                tabIndex={0}
                onClick={() => {
                  audio.playSelect();
                  setSelectedCat(cat.id);
                }}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 outline-none flex-shrink-0 ${
                  isActive
                    ? 'bg-cyan-400 text-slate-950 font-black shadow-[0_4px_20px_rgba(6,182,212,0.35)] scale-102 ring-2 ring-white/60'
                    : 'bg-slate-900 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white'
                }`}
              >
                <span>{CATEGORY_ICONS[cat.id] || <Gamepad2 className="w-4 h-4" />}</span>
                <span>{cat.name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                    isActive ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Spotlight Cinematic Hero Showcase */}
      {spotlightGame && (
        <div className="relative w-full rounded-3xl overflow-hidden border border-slate-700/80 shadow-2xl bg-slate-900 min-h-[200px] flex flex-col md:flex-row items-stretch group">
          {/* Background Ambient Poster */}
          <div className="absolute inset-0 z-0 overflow-hidden">
            <img
              src={spotlightGame.heroImage || spotlightGame.coverImage}
              alt={spotlightGame.title}
              className="w-full h-full object-cover object-center filter blur-xl opacity-25 scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0A0F1D] via-[#0A0F1D]/85 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0F1D] via-transparent to-transparent" />
          </div>

          {/* Left Hero Poster Thumbnail */}
          <div className="relative z-10 p-5 md:p-6 flex items-center">
            <div className="w-32 h-44 md:w-40 md:h-52 rounded-2xl overflow-hidden border border-slate-700/80 shadow-2xl flex-shrink-0 bg-slate-950">
              <img
                src={spotlightGame.coverImage || spotlightGame.heroImage}
                alt={spotlightGame.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Middle Content */}
            <div className="ml-5 md:ml-6 flex flex-col justify-center space-y-2.5 max-w-xl">
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-950/70 border border-cyan-400/30 text-cyan-300 font-mono text-[10px] font-bold uppercase tracking-wider flex items-center space-x-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>{spotlightGame.badge || 'EN VEDETTE'}</span>
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-semibold">
                  {spotlightGame.category.toUpperCase()}
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black font-display text-white tracking-tight leading-tight">
                {spotlightGame.title}
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 leading-relaxed">
                {spotlightGame.description}
              </p>

              <div className="flex items-center space-x-3 text-xs text-slate-400 font-semibold pt-0.5">
                <div className="flex items-center space-x-1 text-cyan-300">
                  <Users className="w-3.5 h-3.5" />
                  <span>{spotlightGame.minPlayers} à {spotlightGame.maxPlayers} Joueurs</span>
                </div>
                <span>•</span>
                <div className="flex items-center space-x-1 text-amber-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{spotlightGame.durationMinutes}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-3 pt-1">
                <button
                  data-tv-focus
                  tabIndex={0}
                  onClick={() => {
                    audio.playSelect();
                    handlePlayGame(spotlightGame);
                  }}
                  className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black text-xs uppercase tracking-wider shadow-[0_4px_20px_rgba(6,182,212,0.35)] transition-all hover:scale-102 active:scale-95 outline-none focus:scale-105 focus:ring-4 focus:ring-white"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>JOUER</span>
                </button>

                <button
                  data-tv-focus
                  tabIndex={0}
                  onClick={() => {
                    audio.playSelect();
                    handleSelectGame(spotlightGame);
                  }}
                  className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700/80 text-slate-200 font-bold text-xs transition-all outline-none focus:scale-105 focus:bg-white focus:text-slate-950"
                >
                  <Info className="w-3.5 h-3.5" />
                  <span>RÈGLES DU JEU</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Games Grid Showcase (Vertical Poster Grid) */}
      <div>
        <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
          <h3 className="font-display font-bold text-sm sm:text-base text-white tracking-wider uppercase flex items-center space-x-2">
            <span>CATALOGUE COMPLET</span>
            <span className="text-xs text-cyan-400 font-mono font-bold">({filteredGames.length} jeux)</span>
          </h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5">
          {filteredGames.map((game) => (
            <TVGameCard
              key={game.id}
              game={game}
              isActive={spotlightGame?.id === game.id}
              onHighlight={(g) => setSpotlightGame(g)}
              onSelect={(g) => {
                setSpotlightGame(g);
                handleSelectGame(g);
              }}
              onPlayDirect={handlePlayGame}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
