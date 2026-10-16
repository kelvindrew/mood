import React, { useEffect, useState, useRef } from 'react';
import { useGame } from '../../context/GameContext';
import { adminCms, PlatformBranding } from '../../services/adminCmsService';
import { GAMES_CATALOG } from '../../data/gamesCatalog';
import { GameCatalogItem } from '../../types/game';
import { tvNav } from '../../services/tvNavigation';
import { Play, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import { audio } from '../../services/audio';
import { WorldLandscapeBackground } from '../../components/WorldLandscapeBackground';

export const TVHomeView: React.FC = () => {
  const { room, selectGame, setSelectedGame, createRoom, selectedCategory, setTvView } = useGame();
  const [games, setGames] = useState<GameCatalogItem[]>(() =>
    adminCms.getGamesCatalog().filter((g) => !['wild_rush', 'blind_test', 'president'].includes(g.id))
  );
  const [spotlightGame, setSpotlightGame] = useState<GameCatalogItem>(() => games[0] || GAMES_CATALOG[0]);
  const [branding, setBranding] = useState<PlatformBranding>(() => adminCms.getPlatformBranding());
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    tvNav.setInitialFocus('button');
    const unsub = adminCms.subscribe(() => {
      const updated = adminCms
        .getGamesCatalog()
        .filter((g) => !['wild_rush', 'blind_test', 'president'].includes(g.id));
      setGames(updated);
      setBranding(adminCms.getPlatformBranding());
      setSpotlightGame((prev) => {
        if (!prev || ['wild_rush', 'blind_test', 'president'].includes(prev.id)) {
          return updated[0];
        }
        return updated.find((g) => g.id === prev.id) || updated[0];
      });
    });
    return () => unsub();
  }, []);

  // Filtrage selon l'onglet actif sélectionné dans la Navbar
  const displayedGames = (
    !selectedCategory || selectedCategory === 'all'
      ? games
      : games.filter((g) => g.category === selectedCategory)
  ).filter((g) => !['wild_rush', 'blind_test', 'president'].includes(g.id));

  // Mettre à jour le jeu mis en avant si la catégorie change et le jeu actuel n'en fait pas partie
  useEffect(() => {
    if (
      displayedGames.length > 0 &&
      (!spotlightGame || !displayedGames.some((g) => g.id === spotlightGame?.id))
    ) {
      setSpotlightGame(displayedGames[0]);
    }
  }, [selectedCategory, displayedGames, spotlightGame]);

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
      const amount = carouselRef.current.clientWidth * 0.7;
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
    <div className="relative min-h-screen bg-[#07090E] text-white select-none overflow-hidden flex flex-col justify-between">
      {/* 1. Arrière-plan cinématique : Image du jeu occupant toute la partie visible, parfaitement centrée */}
      {isLandscapeMode ? (
        <WorldLandscapeBackground
          overlayDarkness={0.25}
          showLocationBadge={false}
          tintClass="from-black/30 via-transparent to-[#07090E]/90"
        />
      ) : (
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden select-none bg-[#07090E]">
          {currentPoster && (
            <img
              key={activeGame.id}
              src={currentPoster}
              alt={activeGame.title}
              className="w-full h-full object-cover object-center filter brightness-[0.92] contrast-[1.08] transition-opacity duration-700 animate-fade-in"
            />
          )}

          {/* Dégradés cinématiques multicouches pour lisibilité premium type Netflix */}
          <div className="absolute inset-0 cinematic-hero-vignette" />
        </div>
      )}

      {/* 2. Section Héro Netflix : Typographie imposante, métadonnées épurées et EXACTEMENT 2 boutons visibles */}
      <div className="relative z-10 pt-24 md:pt-32 px-8 md:px-14 max-w-2xl flex flex-col space-y-4 animate-fade-in pointer-events-auto">
        <div className="p-6 md:p-8 rounded-3xl liquid-glass border border-white/[0.08] shadow-[0_25px_60px_rgba(0,0,0,0.7)] space-y-4">
          {/* Metadata Badges */}
          <div className="flex items-center flex-wrap gap-2 text-xs font-semibold text-slate-300">
            <span className="px-2.5 py-1 rounded-full liquid-glass-pill text-[11px] font-bold text-white uppercase tracking-wider">
              {activeGame.category}
            </span>
            <span className="px-2.5 py-1 rounded-full liquid-glass-pill text-[11px] text-slate-300">
              {activeGame.minPlayers}–{activeGame.maxPlayers} Joueurs
            </span>
            <span className="px-2.5 py-1 rounded-full liquid-glass-pill text-[11px] text-slate-300">
              {activeGame.durationMinutes}
            </span>
            {activeGame.badge && (
              <span className="px-2.5 py-1 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 font-bold uppercase text-[10px] tracking-wider">
                {activeGame.badge}
              </span>
            )}
          </div>

          {/* Titre Display Majuscule Netflix */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black font-display tracking-tight text-white uppercase leading-none drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)]">
            {activeGame.title}
          </h1>

          {/* Synopsis / Tagline épuré */}
          <p className="text-sm md:text-base text-slate-300 font-sans leading-relaxed line-clamp-2 max-w-xl">
            {activeGame.description || activeGame.tagline}
          </p>

          {/* RÈGLE STRICTE DES DEUX BOUTONS : JOUER (Primaire) & DÉTAILS (Secondaire) */}
          <div className="flex items-center space-x-3.5 pt-2">
            {/* Bouton 1 : Primaire Haute Visibilité */}
            <button
              data-tv-focus
              tabIndex={0}
              onClick={() => handlePlayGame(activeGame)}
              className="px-8 py-3.5 rounded-xl bg-white hover:bg-neutral-200 text-neutral-950 font-display font-black text-xs sm:text-sm uppercase tracking-wider flex items-center space-x-2.5 shadow-[0_4px_25px_rgba(255,255,255,0.25)] transition-all outline-none focus:scale-105 focus:ring-4 focus:ring-white cursor-pointer"
            >
              <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-neutral-950 translate-x-0.5" />
              <span>{room && room.code ? 'REJOINDRE LE SALON' : 'JOUER'}</span>
            </button>

            {/* Bouton 2 : Secondaire Liquid Glass */}
            <button
              data-tv-focus
              tabIndex={0}
              onClick={() => {
                audio.playSelect();
                setSelectedGame(activeGame);
                setTvView('game_detail');
              }}
              className="px-6 py-3.5 rounded-xl liquid-glass hover:bg-white/10 text-white font-display font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center space-x-2 transition-all outline-none focus:scale-105 focus:ring-4 focus:ring-white cursor-pointer"
            >
              <Info className="w-4 h-4 sm:w-5 sm:h-5 text-slate-300" />
              <span>DÉTAILS</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Carrousel Inférieur de Vignettes Netflix (Cartes entièrement cliquables sans boutons parasites) */}
      <div className="relative z-10 pb-6 pt-4 px-8 md:px-14">
        {/* En-tête discret du carrousel avec décompte */}
        <div className="flex items-center justify-between pb-2.5">
          <div className="flex items-center space-x-2.5">
            <span className="text-xs sm:text-sm font-display font-bold uppercase tracking-wider text-slate-200">
              Tous les jeux disponibles
            </span>
            <span className="text-[11px] font-mono text-slate-400 bg-white/[0.05] border border-white/[0.08] px-2 py-0.5 rounded-md">
              {displayedGames.length}
            </span>
          </div>
          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => scrollCarousel('left')}
              className="w-8 h-8 rounded-full liquid-glass-pill hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
              title="Défiler à gauche"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scrollCarousel('right')}
              className="w-8 h-8 rounded-full liquid-glass-pill hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
              title="Défiler à droite"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Rangée horizontale de posters avec expansion au survol/focus */}
        <div
          ref={carouselRef}
          className="flex items-start space-x-4 overflow-x-auto py-3 scrollbar-none scroll-smooth focus-within:scroll-auto"
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
                className={`group flex-shrink-0 w-32 sm:w-36 md:w-40 lg:w-44 cursor-pointer transition-all duration-300 outline-none ${
                  isActive ? 'scale-105 z-20' : 'opacity-75 hover:opacity-100 hover:scale-102'
                }`}
              >
                {/* Poster rectangulaire Liquid Glass */}
                <div
                  className={`relative aspect-[3/4] rounded-2xl overflow-hidden bg-neutral-900 transition-all ${
                    isActive
                      ? 'ring-2 ring-white border-2 border-white shadow-[0_12px_40px_rgba(0,0,0,0.85)]'
                      : 'border border-white/10 group-hover:border-white/30'
                  }`}
                >
                  <img
                    src={game.coverImage || game.heroImage}
                    alt={game.title}
                    loading="lazy"
                    className="w-full h-full object-cover object-center filter brightness-[0.92] group-hover:brightness-100 transition-all duration-300"
                  />

                  {/* Gradient inférieur délicat */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-70" />

                  {/* Badge compact si présent */}
                  {game.badge && (
                    <div className="absolute top-2 left-2">
                      <span className="px-2 py-0.5 rounded-md bg-amber-400 text-[9px] font-black uppercase text-neutral-950 shadow-md">
                        {game.badge}
                      </span>
                    </div>
                  )}

                  {/* Effet Liquid Glass au focus/survol */}
                  <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity pointer-events-none" />
                </div>

                {/* Titre du jeu sous la vignette */}
                <span
                  className={`text-xs font-bold block mt-2 text-center truncate tracking-wide transition-colors ${
                    isActive ? 'text-white font-black' : 'text-slate-300 group-hover:text-white'
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
