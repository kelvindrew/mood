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
  const { setSelectedGame, setTvView, createRoom } = useGame();
  const [selectedCat, setSelectedCat] = useState('all');
  const [spotlightGame, setSpotlightGame] = useState<GameCatalogItem>(GAMES_CATALOG[0]);

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
      ? GAMES_CATALOG
      : GAMES_CATALOG.filter((g) => g.category === selectedCat);

  // Met à jour le jeu vedette lorsque la catégorie change
  useEffect(() => {
    if (filteredGames.length > 0) {
      setSpotlightGame(filteredGames[0]);
    }
  }, [selectedCat]);

  const handlePlayGame = async (game: GameCatalogItem) => {
    setSelectedGame(game);
    await createRoom(game.id);
  };

  const handleSelectGame = (game: GameCatalogItem) => {
    setSelectedGame(game);
    setTvView('detail');
  };

  return (
    <div className="min-h-screen pt-20 px-[4vw] pb-24 select-none flex flex-col space-y-8 bg-[#07090E] text-white">
      {/* 1. Header & Navigation Top Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center space-x-2 text-xs font-black uppercase text-emerald-400 tracking-widest mb-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>ESPACE JEUX VIDÉO • 10 EXPÉRIENCES CONNECTÉES</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black font-display text-white tracking-tight">
            Catalogue & Jeux Multijoueur
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Jouez instantanément sur grand écran en connectant vos smartphones comme manettes
          </p>
        </div>

        {/* Categories Chips Switcher */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 max-w-full">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCat === cat.id;
            const count =
              cat.id === 'all'
                ? GAMES_CATALOG.length
                : GAMES_CATALOG.filter((g) => g.category === cat.id).length;

            return (
              <button
                key={cat.id}
                data-tv-focus
                tabIndex={0}
                onClick={() => {
                  audio.playSelect();
                  setSelectedCat(cat.id);
                }}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 outline-none flex-shrink-0 ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-black font-black shadow-[0_0_20px_rgba(16,185,129,0.4)] scale-105 ring-2 ring-white/50'
                    : 'bg-[#121622] hover:bg-[#1A2030] border border-white/10 text-gray-300 hover:text-white'
                }`}
              >
                <span>{CATEGORY_ICONS[cat.id] || <Gamepad2 className="w-4 h-4" />}</span>
                <span>{cat.name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                    isActive ? 'bg-black/30 text-black' : 'bg-white/10 text-gray-400'
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
        <div className="relative w-full rounded-3xl overflow-hidden border border-white/15 shadow-2xl bg-[#0D121F] min-h-[220px] flex flex-col md:flex-row items-stretch group">
          {/* Background Ambient Poster */}
          <div className="absolute inset-0 z-0 overflow-hidden">
            <img
              src={spotlightGame.heroImage || spotlightGame.coverImage}
              alt={spotlightGame.title}
              className="w-full h-full object-cover object-center filter blur-lg opacity-35 scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#07090E] via-[#07090E]/85 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#07090E] via-transparent to-transparent" />
          </div>

          {/* Left Hero Poster Thumbnail */}
          <div className="relative z-10 p-6 md:p-8 flex items-center">
            <div className="w-36 h-48 md:w-44 md:h-56 rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl flex-shrink-0">
              <img
                src={spotlightGame.coverImage || spotlightGame.heroImage}
                alt={spotlightGame.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Middle Content */}
            <div className="ml-6 md:ml-8 flex flex-col justify-center space-y-3 max-w-xl">
              <div className="flex items-center space-x-2">
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-mono text-[11px] font-black uppercase tracking-wider flex items-center space-x-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>{spotlightGame.badge || 'EN VEDETTE'}</span>
                </span>
                <span className="px-2.5 py-1 rounded-full bg-white/10 text-gray-300 text-[11px] font-bold">
                  {spotlightGame.category.toUpperCase()}
                </span>
              </div>

              <h2 className="text-3xl md:text-4xl font-black font-display text-white tracking-tight leading-tight">
                {spotlightGame.title}
              </h2>

              <p className="text-xs md:text-sm text-gray-300 line-clamp-2 leading-relaxed">
                {spotlightGame.description}
              </p>

              <div className="flex items-center space-x-4 text-xs text-gray-400 font-bold pt-1">
                <div className="flex items-center space-x-1 text-emerald-400">
                  <Users className="w-4 h-4" />
                  <span>{spotlightGame.minPlayers} à {spotlightGame.maxPlayers} Joueurs</span>
                </div>
                <span>•</span>
                <div className="flex items-center space-x-1 text-amber-400">
                  <Clock className="w-4 h-4" />
                  <span>{spotlightGame.durationMinutes}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-3 pt-2">
                <button
                  data-tv-focus
                  tabIndex={0}
                  onClick={() => {
                    audio.playSelect();
                    handlePlayGame(spotlightGame);
                  }}
                  className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-black font-display font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(16,185,129,0.5)] transition-all hover:scale-105 active:scale-95 outline-none focus:scale-110 focus:ring-4 focus:ring-emerald-300"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>JOUER MAINTENANT</span>
                </button>

                <button
                  data-tv-focus
                  tabIndex={0}
                  onClick={() => {
                    audio.playSelect();
                    handleSelectGame(spotlightGame);
                  }}
                  className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white font-bold text-xs transition-all outline-none focus:scale-105 focus:bg-white focus:text-black"
                >
                  <Info className="w-4 h-4" />
                  <span>RÈGLES & DÉTAILS</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Games Grid Showcase */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-black text-lg text-white flex items-center space-x-2">
            <span>Tous les jeux de la catégorie</span>
            <span className="text-xs text-emerald-400 font-mono font-bold">({filteredGames.length})</span>
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filteredGames.map((game) => (
            <TVGameCard
              key={game.id}
              game={game}
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
