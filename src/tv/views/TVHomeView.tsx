import React, { useEffect, useState, useRef } from 'react';
import { useGame } from '../../context/GameContext';
import { adminCms, PlatformBranding } from '../../services/adminCmsService';
import { GAMES_CATALOG } from '../../data/gamesCatalog';
import { GameCatalogItem } from '../../types/game';
import { tvNav } from '../../services/tvNavigation';
import { Play, Plus, Star, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import { audio } from '../../services/audio';
import { WorldLandscapeBackground } from '../../components/WorldLandscapeBackground';

export const TVHomeView: React.FC = () => {
  const { room, selectGame, setSelectedGame, createRoom, selectedCategory, setTvView } = useGame();
  const [games, setGames] = useState<GameCatalogItem[]>(() => adminCms.getGamesCatalog());
  const [spotlightGame, setSpotlightGame] = useState<GameCatalogItem>(games[0]);
  const [branding, setBranding] = useState<PlatformBranding>(() => adminCms.getPlatformBranding());
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    tvNav.setInitialFocus('button');
    const unsub = adminCms.subscribe(() => {
      const updated = adminCms.getGamesCatalog();
      setGames(updated);
      setBranding(adminCms.getPlatformBranding());
      if (updated.length > 0 && !spotlightGame) {
        setSpotlightGame(updated[0]);
      }
    });
    return () => unsub();
  }, []);

  // Filtrage selon l'onglet actif sélectionné dans la Navbar
  const displayedGames =
    !selectedCategory || selectedCategory === 'all'
      ? games
      : games.filter((g) => g.category === selectedCategory);

  // Mettre à jour le jeu mis en avant si la catégorie change et le jeu actuel n'en fait pas partie
  useEffect(() => {
    if (displayedGames.length > 0 && !displayedGames.some((g) => g.id === spotlightGame?.id)) {
      setSpotlightGame(displayedGames[0]);
    }
  }, [selectedCategory, displayedGames]);

  // Lancement du jeu -> Conservation des manettes connectées ou création de salon
  const handlePlayGame = async (game: GameCatalogItem) => {
    audio.playSelect();
    setSelectedGame(game);
    if (room && room.code) {
      // Les manettes restent connectées ! On met à jour le jeu dans le salon existant
      selectGame(game.id);
      setTvView('lobby');
    } else {
      await createRoom(game.id, { maxPlayers: game.maxPlayers });
    }
  };

  const handleHighlightGame = (game: GameCatalogItem) => {
    audio.playFocus();
    setSpotlightGame(game);
    setSelectedGame(game);
  };

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const amount = carouselRef.current.clientWidth * 0.65;
      carouselRef.current.scrollBy({
        left: direction === 'left' ? -amount : amount,
        behavior: 'smooth',
      });
    }
  };

  const activeGame = spotlightGame || displayedGames[0] || games[0] || GAMES_CATALOG[0];
  const currentPoster = activeGame?.heroImage || activeGame?.coverImage;

  const isLandscapeMode = branding.homeBackgroundMode === 'landscapes';

  return (
    <div className="relative min-h-screen bg-[#0A1118] text-white select-none overflow-hidden flex flex-col justify-between">
      {/* 1. Arrière-plan cinématique : Bannières Paysages défilantes ou Visuel du jeu */}
      {isLandscapeMode ? (
        <WorldLandscapeBackground
          overlayDarkness={0.70}
          showLocationBadge={true}
          tintClass="from-slate-950/40 via-[#0A1118]/70 to-[#0A1118]/95"
        />
      ) : (
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden select-none bg-[#0A1118]">
          {currentPoster && (
            <img
              key={activeGame.id}
              src={currentPoster}
              alt={activeGame.title}
              className="w-full h-full object-cover object-right-top md:object-right filter brightness-[0.78] contrast-[1.10] transition-opacity duration-700 animate-fade-in"
            />
          )}

          {/* Dégradé latéral gauche : préserve une lisibilité parfaite des textes et boutons */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A1118] via-[#0A1118]/90 via-48% to-transparent" />

          {/* Dégradé supérieur pour la Navbar */}
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#0A1118] via-[#0A1118]/70 to-transparent" />

          {/* Dégradé inférieur pour le carrousel de vignettes */}
          <div className="absolute bottom-0 left-0 right-0 h-[62vh] bg-gradient-to-t from-[#0A1118] via-[#0A1118]/95 via-50% to-transparent" />
        </div>
      )}

      {/* 2. Section Héro (Titre, Saison/Joueurs, Étoiles, Catégorie, Boutons Jouer & Plus, Synopsis) */}
      <div className="relative z-10 pt-28 md:pt-32 px-8 md:px-14 max-w-2xl flex flex-col space-y-3.5 animate-fade-in">
        {/* Titre Display Majuscule Stylisé */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black font-display tracking-tight text-white uppercase leading-none drop-shadow-[0_2px_15px_rgba(0,0,0,0.9)]">
          {activeGame.title}
        </h1>

        {/* Sous-titre / Mode (Ex: Season 1 -> Multijoueur Smart TV) */}
        <div className="text-sm md:text-base font-semibold text-slate-300 drop-shadow">
          <span>{activeGame.minPlayers}–{activeGame.maxPlayers} Joueurs</span>
          <span className="mx-2 text-slate-500">•</span>
          <span>{activeGame.durationMinutes}</span>
          {activeGame.badge && (
            <>
              <span className="mx-2 text-slate-500">•</span>
              <span className="text-amber-400 font-bold uppercase">{activeGame.badge}</span>
            </>
          )}
        </div>

        {/* Étoiles dorées & Tags de genre (Crime • Drama • Mystery) */}
        <div className="flex items-center space-x-3 text-xs sm:text-sm font-medium">
          <div className="flex items-center text-amber-400 space-x-0.5">
            <Star className="w-4 h-4 fill-amber-400" />
            <Star className="w-4 h-4 fill-amber-400" />
            <Star className="w-4 h-4 fill-amber-400" />
            <Star className="w-4 h-4 fill-amber-400" />
            <Star className="w-4 h-4 fill-amber-400/50" />
          </div>
          <span className="text-slate-400">
            {activeGame.category.toUpperCase()} • SMART TV • SANS MANETTE
          </span>
        </div>

        {/* Boutons d'Action : JOUER (Cyan) + PLUS (Règles / Infos) */}
        <div className="flex items-center space-x-3 pt-1">
          <button
            data-tv-focus
            tabIndex={0}
            onClick={() => handlePlayGame(activeGame)}
            className="px-6 py-2.5 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black text-sm uppercase tracking-wider flex items-center space-x-2 shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all outline-none focus:scale-105 focus:ring-4 focus:ring-white focus:bg-white cursor-pointer"
          >
            <Play className="w-4 h-4 fill-slate-950 translate-x-0.5" />
            <span>JOUER</span>
          </button>

          <button
            data-tv-focus
            tabIndex={0}
            onClick={() => {
              audio.playSelect();
              setSelectedGame(activeGame);
              setTvView('game_detail');
            }}
            className="w-10 h-10 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-300 hover:text-white flex items-center justify-center transition-all outline-none focus:scale-110 focus:ring-4 focus:ring-white focus:bg-cyan-400 focus:text-slate-950 cursor-pointer"
            title="Règles et détails du jeu"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Description / Synopsis épuré (2 à 3 lignes) */}
        <p className="text-xs sm:text-sm text-slate-300/90 font-sans leading-relaxed max-w-lg line-clamp-3 drop-shadow pt-0.5">
          {activeGame.description || activeGame.tagline}
        </p>
      </div>

      {/* 3. Carrousel Inférieur de Vignettes Verticales / Posters (Tous les 23 jeux disponibles) */}
      <div className="relative z-10 pb-6 pt-4 px-8 md:px-14">
        {/* En-tête discret du carrousel avec le décompte */}
        <div className="flex items-center justify-between pb-2">
          <span className="text-[11px] font-mono uppercase tracking-widest text-slate-400">
            {displayedGames.length} jeux multijoueurs disponibles
          </span>
          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => scrollCarousel('left')}
              className="w-7 h-7 rounded-full bg-slate-900/80 border border-slate-700/60 text-slate-300 hover:text-white hover:border-cyan-400 flex items-center justify-center transition-all"
              title="Défiler à gauche"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scrollCarousel('right')}
              className="w-7 h-7 rounded-full bg-slate-900/80 border border-slate-700/60 text-slate-300 hover:text-white hover:border-cyan-400 flex items-center justify-center transition-all"
              title="Défiler à droite"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Rangée horizontale de vignettes avec défilement fluide */}
        <div
          ref={carouselRef}
          className="flex items-start space-x-3.5 sm:space-x-4 overflow-x-auto py-2 scrollbar-none scroll-smooth focus-within:scroll-auto"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {displayedGames.map((game) => {
            const isActive = spotlightGame.id === game.id;
            return (
              <div
                key={game.id}
                data-tv-focus
                tabIndex={0}
                onFocus={() => handleHighlightGame(game)}
                onMouseEnter={() => handleHighlightGame(game)}
                onClick={() => handlePlayGame(game)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handlePlayGame(game);
                  }
                }}
                className={`group flex-shrink-0 w-28 sm:w-32 md:w-36 lg:w-40 cursor-pointer transition-all duration-200 outline-none ${
                  isActive ? 'scale-105 z-20' : 'opacity-70 hover:opacity-100 hover:scale-102'
                }`}
              >
                {/* Poster rectangulaire avec border turquoise en état actif */}
                <div
                  className={`relative aspect-[3/4] rounded-xl overflow-hidden bg-slate-900 transition-all ${
                    isActive
                      ? 'border-2 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.55)] ring-2 ring-white/40'
                      : 'border border-slate-700/60 group-hover:border-slate-500'
                  }`}
                >
                  <img
                    src={game.coverImage || game.heroImage}
                    alt={game.title}
                    loading="lazy"
                    className="w-full h-full object-cover object-center filter brightness-[0.92] group-hover:brightness-100 transition-all"
                  />

                  {/* Gradient inférieur léger sur la carte */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A1118]/80 via-transparent to-transparent opacity-60" />

                  {/* Badge compact (si présent) */}
                  {game.badge && (
                    <div className="absolute top-1.5 left-1.5">
                      <span className="px-1.5 py-0.5 rounded bg-amber-500/80 text-[8px] font-black uppercase text-slate-950 shadow-sm">
                        {game.badge}
                      </span>
                    </div>
                  )}

                  {/* Bouton Play discret au focus/survol */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity">
                    <div className="w-9 h-9 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center shadow-lg">
                      <Play className="w-4 h-4 fill-slate-950 translate-x-0.5" />
                    </div>
                  </div>
                </div>

                {/* Titre du jeu sous la vignette */}
                <span
                  className={`text-[11px] sm:text-xs font-bold block mt-1.5 text-center truncate ${
                    isActive ? 'text-cyan-300 font-black' : 'text-slate-300'
                  }`}
                >
                  {game.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
