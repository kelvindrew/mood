import React, { useEffect, useState, useRef } from 'react';
import { useGame } from '../../context/GameContext';
import { adminCms, PlatformBranding } from '../../services/adminCmsService';
import { GAMES_CATALOG } from '../../data/gamesCatalog';
import { GameCatalogItem } from '../../types/game';
import { tvNav } from '../../services/tvNavigation';
import { Play, Info, ChevronLeft, ChevronRight, Image as ImageIcon, Sparkles } from 'lucide-react';
import { audio } from '../../services/audio';
import { WorldLandscapeBackground, WORLD_LANDSCAPES } from '../../components/WorldLandscapeBackground';

export const TVHomeView: React.FC = () => {
  const { room, selectGame, setSelectedGame, createRoom, selectedCategory, setTvView } = useGame();
  const [games, setGames] = useState<GameCatalogItem[]>(() =>
    adminCms.getGamesCatalog().filter((g) => !['wild_rush', 'blind_test', 'president'].includes(g.id))
  );
  const [spotlightGame, setSpotlightGame] = useState<GameCatalogItem>(() => games[0] || GAMES_CATALOG[0]);
  const [branding, setBranding] = useState<PlatformBranding>(() => adminCms.getPlatformBranding());
  const [landscapeIndex, setLandscapeIndex] = useState<number>(0);
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
    audio.playFocus();
    if (carouselRef.current) {
      const amount = carouselRef.current.clientWidth * 0.7;
      carouselRef.current.scrollBy({
        left: direction === 'left' ? -amount : amount,
        behavior: 'smooth',
      });
    }
  };

  const handleNextLandscape = () => {
    audio.playFocus();
    setLandscapeIndex((prev) => (prev + 1) % WORLD_LANDSCAPES.length);
  };

  const handlePrevLandscape = () => {
    audio.playFocus();
    setLandscapeIndex((prev) => (prev - 1 + WORLD_LANDSCAPES.length) % WORLD_LANDSCAPES.length);
  };

  const activeGame = spotlightGame || displayedGames[0] || games[0] || GAMES_CATALOG[0];
  const currentPoster = activeGame?.heroImage || activeGame?.coverImage;
  const isLandscapeMode = branding.homeBackgroundMode === 'landscapes';

  return (
    <div className="relative min-h-screen bg-[#07090E] text-white select-none overflow-hidden flex flex-col justify-between">
      {/* 1. Arrière-plan cinématique avec zoom lent Ken Burns */}
      {isLandscapeMode ? (
        <WorldLandscapeBackground
          overlayDarkness={0.28}
          showLocationBadge={false}
          controlledIndex={landscapeIndex}
          onIndexChange={(idx) => setLandscapeIndex(idx)}
          intervalMs={6500}
          tintClass="from-black/40 via-transparent to-[#07090E]/95"
        />
      ) : (
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden select-none bg-[#07090E]">
          {currentPoster && (
            <img
              key={activeGame.id}
              src={currentPoster}
              alt={activeGame.title}
              className="w-full h-full object-cover object-center filter brightness-[0.92] contrast-[1.08] transition-opacity duration-700 animate-fade-in animate-ken-burns"
            />
          )}
          <div className="absolute inset-0 cinematic-hero-vignette" />
        </div>
      )}

      {/* Dégradé cinématique latéral ultra-doux (lisibilité à gauche, paysage radieux à droite) */}
      <div className="fixed inset-0 pointer-events-none z-[1] bg-gradient-to-r from-[#07090E]/95 via-[#07090E]/50 via-40% to-transparent" />

      {/* 2. Discrète capsule d'exploration des 12 bannières paysages en haut à droite */}
      {isLandscapeMode && (
        <div className="fixed top-20 right-8 md:right-14 z-20 pointer-events-auto flex items-center space-x-2 bg-black/40 backdrop-blur-xl border border-white/10 px-3.5 py-1.5 rounded-full shadow-2xl animate-fade-in transition-all hover:bg-black/60">
          <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-[11px] font-mono text-slate-300 font-semibold">
            PANORAMA <strong className="text-white">{landscapeIndex + 1}</strong>/{WORLD_LANDSCAPES.length}
          </span>
          <div className="flex items-center space-x-1 pl-1.5 border-l border-white/10">
            <button
              onClick={handlePrevLandscape}
              className="w-5 h-5 rounded-full hover:bg-white/20 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
              title="Paysage précédent"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleNextLandscape}
              className="w-5 h-5 rounded-full hover:bg-white/20 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
              title="Paysage suivant"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 3. Section Héro Netflix : Typographie monumentale, métadonnées épurées et EXACTEMENT 2 boutons visibles */}
      <div className="relative z-10 pt-24 md:pt-32 px-8 md:px-14 max-w-2xl flex flex-col space-y-4 pointer-events-auto">
        <div className="relative group">
          {/* Halo d'ambiance doux en arrière-plan du bloc de texte */}
          <div className="absolute -inset-2 bg-gradient-to-r from-cyan-500/10 via-amber-500/5 to-purple-500/10 rounded-3xl blur-2xl pointer-events-none animate-pulse-glow" />

          <div
            key={activeGame.id}
            className="relative p-6 sm:p-8 rounded-3xl liquid-glass border border-white/[0.12] shadow-[0_30px_70px_rgba(0,0,0,0.8)] space-y-4 animate-hero-content backdrop-blur-2xl"
          >
            {/* Tag multijoueur salon & métadonnées */}
            <div className="flex items-center flex-wrap gap-2 text-xs font-semibold text-slate-300">
              <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-cyan-400/15 border border-cyan-400/40 text-[11px] font-bold text-cyan-300 uppercase tracking-wider shadow-sm">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                <span>{activeGame.category}</span>
              </span>

              <span className="px-3 py-1 rounded-full liquid-glass-pill text-[11px] text-slate-200 font-medium">
                👥 {activeGame.minPlayers}–{activeGame.maxPlayers} Joueurs
              </span>

              <span className="px-3 py-1 rounded-full liquid-glass-pill text-[11px] text-slate-200 font-medium">
                ⏱ {activeGame.durationMinutes}
              </span>

              {activeGame.badge && (
                <span className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black uppercase text-[10px] tracking-wider shadow-md">
                  ★ {activeGame.badge}
                </span>
              )}
            </div>

            {/* Titre Display Majuscule Netflix */}
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black font-display tracking-tight text-white uppercase leading-none drop-shadow-[0_4px_30px_rgba(0,0,0,0.95)]">
              {activeGame.title}
            </h1>

            {/* Synopsis / Tagline épuré */}
            <p className="text-sm md:text-base text-slate-300 font-sans leading-relaxed line-clamp-2 max-w-xl text-shadow-sm">
              {activeGame.description || activeGame.tagline}
            </p>

            {/* RÈGLE STRICTE DES DEUX BOUTONS : JOUER (Primaire) & DÉTAILS (Secondaire) */}
            <div className="flex items-center space-x-4 pt-2">
              {/* Bouton 1 : Primaire Haute Visibilité */}
              <button
                data-tv-focus
                tabIndex={0}
                onClick={() => handlePlayGame(activeGame)}
                className="px-9 py-4 rounded-2xl bg-white hover:bg-neutral-100 text-neutral-950 font-display font-black text-xs sm:text-sm uppercase tracking-wider flex items-center space-x-3 shadow-[0_8px_30px_rgba(255,255,255,0.35)] hover:shadow-[0_12px_45px_rgba(255,255,255,0.6)] transform hover:scale-105 active:scale-95 transition-all outline-none focus:scale-105 focus:ring-4 focus:ring-white cursor-pointer"
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
                className="px-7 py-4 rounded-2xl liquid-glass hover:bg-white/15 text-white font-display font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center space-x-2.5 border border-white/20 hover:border-white/40 transform hover:scale-105 active:scale-95 transition-all outline-none focus:scale-105 focus:ring-4 focus:ring-white cursor-pointer"
              >
                <Info className="w-4 h-4 sm:w-5 sm:h-5 text-slate-300" />
                <span>DÉTAILS</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Carrousel Inférieur de Vignettes Netflix (Cartes entièrement cliquables sans boutons parasites) */}
      <div className="relative z-10 pb-6 pt-4 px-8 md:px-14">
        {/* En-tête discret du carrousel avec décompte */}
        <div className="flex items-center justify-between pb-3">
          <div className="flex items-center space-x-3">
            <span className="text-xs sm:text-sm font-display font-black uppercase tracking-wider text-white drop-shadow">
              Catalogue des Jeux
            </span>
            <span className="text-[11px] font-mono text-cyan-300 bg-cyan-400/10 border border-cyan-400/30 px-2.5 py-0.5 rounded-full font-bold">
              {displayedGames.length} titres
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => scrollCarousel('left')}
              className="w-9 h-9 rounded-full liquid-glass-pill hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-lg hover:scale-110 active:scale-95"
              title="Défiler à gauche"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scrollCarousel('right')}
              className="w-9 h-9 rounded-full liquid-glass-pill hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-lg hover:scale-110 active:scale-95"
              title="Défiler à droite"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Rangée horizontale de posters avec expansion au survol/focus */}
        <div
          ref={carouselRef}
          className="flex items-start space-x-5 overflow-x-auto py-4 scrollbar-none scroll-smooth focus-within:scroll-auto"
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
                className={`group flex-shrink-0 w-36 sm:w-40 md:w-44 lg:w-48 cursor-pointer transition-all duration-300 ease-out outline-none select-none ${
                  isActive
                    ? 'scale-110 z-30'
                    : 'opacity-80 hover:opacity-100 hover:scale-105'
                }`}
              >
                {/* Poster rectangulaire avec effet vitre Liquid Glass */}
                <div
                  className={`relative aspect-[3/4] rounded-2xl overflow-hidden bg-neutral-900 transition-all duration-300 ${
                    isActive
                      ? 'border-2 border-white ring-4 ring-cyan-400/40 shadow-[0_20px_50px_rgba(0,0,0,0.95),0_0_35px_rgba(6,182,212,0.4)]'
                      : 'border border-white/10 group-hover:border-white/35 shadow-xl'
                  }`}
                >
                  <img
                    src={game.coverImage || game.heroImage}
                    alt={game.title}
                    loading="lazy"
                    className="w-full h-full object-cover object-center filter brightness-[0.92] group-hover:brightness-105 group-hover:scale-110 transition-all duration-500"
                  />

                  {/* Gradient inférieur cinématique sombre pour lisibilité */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 via-40% to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                  {/* Badge compact en haut à gauche */}
                  {game.badge && (
                    <div className="absolute top-2.5 left-2.5 pointer-events-none">
                      <span className="px-2 py-0.5 rounded-md bg-amber-400 text-[9px] font-black uppercase text-neutral-950 shadow-lg">
                        {game.badge}
                      </span>
                    </div>
                  )}

                  {/* Bouton Play animé flottant au centre au survol ou focus */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-all duration-300">
                    <div className="w-12 h-12 rounded-full bg-white text-slate-950 flex items-center justify-center shadow-2xl transform scale-75 group-hover:scale-100 transition-transform">
                      <Play className="w-5 h-5 fill-slate-950 translate-x-0.5" />
                    </div>
                  </div>

                  {/* Métadonnées discrètes incrustées en bas du poster */}
                  <div className="absolute bottom-2.5 left-2.5 right-2.5 pointer-events-none flex items-center justify-between text-[10px] font-bold text-slate-300">
                    <span className="text-cyan-300 uppercase">{game.category}</span>
                    <span>{game.maxPlayers}P max</span>
                  </div>
                </div>

                {/* Titre du jeu sous la vignette */}
                <span
                  className={`text-xs font-bold block mt-2.5 text-center truncate tracking-wide transition-colors ${
                    isActive ? 'text-white font-black drop-shadow' : 'text-slate-300 group-hover:text-white'
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
