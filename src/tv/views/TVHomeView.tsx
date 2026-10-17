import React, { useEffect, useState, useRef } from 'react';
import { useGame } from '../../context/GameContext';
import { adminCms, PlatformBranding } from '../../services/adminCmsService';
import { GAMES_CATALOG } from '../../data/gamesCatalog';
import { GameCatalogItem } from '../../types/game';
import { tvNav } from '../../services/tvNavigation';
import { Play, Info, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { audio } from '../../services/audio';
import { WorldLandscapeBackground, WORLD_LANDSCAPES } from '../../components/WorldLandscapeBackground';

const FILTERED_IDS = ['wild_rush', 'blind_test', 'president'];

// Rangées Netflix par catégorie
const CATEGORY_ROWS: { id: string; label: string }[] = [
  { id: 'popular', label: 'Populaires' },
  { id: 'party', label: 'Ambiance & Party' },
  { id: 'cards', label: 'Cartes' },
  { id: 'reflexion', label: 'Réflexion' },
];

// Composant rangée horizontale Netflix
const GameRow: React.FC<{
  label: string;
  games: GameCatalogItem[];
  activeId: string;
  onHighlight: (g: GameCatalogItem) => void;
  onPlay: (g: GameCatalogItem) => void;
}> = ({ label, games, activeId, onHighlight, onPlay }) => {
  const rowRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'left' | 'right') => {
    if (rowRef.current) {
      const amt = rowRef.current.clientWidth * 0.65;
      rowRef.current.scrollBy({ left: dir === 'left' ? -amt : amt, behavior: 'smooth' });
      audio.playFocus();
    }
  };

  if (!games.length) return null;

  return (
    <div className="space-y-2 relative group/row">
      {/* En-tête de rangée */}
      <div className="flex items-center justify-between px-8 md:px-14">
        <h2 className="text-sm md:text-base font-display font-black uppercase tracking-wider text-white">
          {label}
        </h2>
        <div className="flex items-center space-x-1.5 opacity-0 group-hover/row:opacity-100 transition-opacity duration-200">
          <button
            onClick={() => scroll('left')}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-all cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-all cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Rangée de posters */}
      <div
        ref={rowRef}
        className="flex items-end space-x-3 overflow-x-auto px-8 md:px-14 pb-4 scrollbar-none scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {games.map((game) => {
          const isActive = activeId === game.id;
          return (
            <div
              key={game.id}
              data-tv-focus
              tabIndex={0}
              onFocus={() => onHighlight(game)}
              onMouseEnter={() => onHighlight(game)}
              onClick={() => onPlay(game)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onPlay(game);
                }
              }}
              className={`group/card flex-shrink-0 w-32 sm:w-36 md:w-40 lg:w-44 cursor-pointer outline-none select-none transition-all duration-300 ease-out ${
                isActive ? 'scale-110 z-30' : 'hover:scale-105 opacity-75 hover:opacity-100'
              }`}
            >
              <div
                className={`relative aspect-[3/4] rounded-xl overflow-hidden bg-neutral-900 transition-all duration-300 ${
                  isActive
                    ? 'border-2 border-white shadow-[0_15px_45px_rgba(0,0,0,0.95),0_0_30px_rgba(6,182,212,0.35)]'
                    : 'border border-white/10 group-hover/card:border-white/30 shadow-lg'
                }`}
              >
                <img
                  src={game.coverImage || game.heroImage}
                  alt={game.title}
                  loading="lazy"
                  className="w-full h-full object-cover object-center brightness-90 group-hover/card:brightness-105 group-hover/card:scale-110 transition-all duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-70 group-hover/card:opacity-90 transition-opacity" />

                {game.badge && (
                  <div className="absolute top-2 left-2 pointer-events-none">
                    <span className="px-1.5 py-0.5 rounded bg-amber-400 text-[8px] font-black uppercase text-neutral-950">
                      {game.badge}
                    </span>
                  </div>
                )}

                {/* Play icon on hover */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover/card:opacity-100 group-focus/card:opacity-100 transition-all duration-200">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-2xl scale-75 group-hover/card:scale-100 transition-transform">
                    <Play className="w-4 h-4 fill-slate-950 translate-x-0.5" />
                  </div>
                </div>

                {/* Bottom metadata */}
                <div className="absolute bottom-2 left-2 right-2 pointer-events-none flex items-center justify-between text-[9px] font-bold text-slate-300">
                  <span className="text-cyan-300 uppercase truncate">{game.category}</span>
                  <span>{game.maxPlayers}P</span>
                </div>
              </div>
              <span
                className={`text-[11px] font-bold block mt-2 text-center truncate tracking-wide transition-colors ${
                  isActive ? 'text-white font-black' : 'text-slate-400 group-hover/card:text-white'
                }`}
              >
                {game.title}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const TVHomeView: React.FC = () => {
  const { room, selectGame, setSelectedGame, createRoom, setTvView } = useGame();
  const [games, setGames] = useState<GameCatalogItem[]>(() =>
    adminCms.getGamesCatalog().filter((g) => !FILTERED_IDS.includes(g.id))
  );
  const [spotlightGame, setSpotlightGame] = useState<GameCatalogItem>(() => games[0] || GAMES_CATALOG[0]);
  const [branding, setBranding] = useState<PlatformBranding>(() => adminCms.getPlatformBranding());
  const [landscapeIndex, setLandscapeIndex] = useState<number>(0);

  useEffect(() => {
    tvNav.setInitialFocus('button');
    const unsub = adminCms.subscribe(() => {
      const updated = adminCms.getGamesCatalog().filter((g) => !FILTERED_IDS.includes(g.id));
      setGames(updated);
      setBranding(adminCms.getPlatformBranding());
      setSpotlightGame((prev) => {
        if (!prev || FILTERED_IDS.includes(prev.id)) return updated[0];
        return updated.find((g) => g.id === prev.id) || updated[0];
      });
    });
    return () => unsub();
  }, []);

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

  const activeGame = spotlightGame || games[0] || GAMES_CATALOG[0];
  const currentPoster = activeGame?.heroImage || activeGame?.coverImage;
  const isLandscapeMode = branding.homeBackgroundMode === 'landscapes';

  // Rangées par catégorie (Netflix style)
  const rows = CATEGORY_ROWS.map((cat) => ({
    ...cat,
    games: games.filter((g) => g.category === cat.id),
  })).filter((r) => r.games.length > 0);

  // Jeux sans catégorie connue (fallback dans "Tous")
  const categorizedIds = new Set(CATEGORY_ROWS.map((r) => r.id));
  const otherGames = games.filter((g) => !categorizedIds.has(g.category));

  return (
    <div className="relative min-h-screen bg-[#07090E] text-white select-none overflow-hidden flex flex-col">
      {/* 1. Background cinématique */}
      {isLandscapeMode ? (
        <WorldLandscapeBackground
          overlayDarkness={0.25}
          showLocationBadge={false}
          controlledIndex={landscapeIndex}
          onIndexChange={(idx) => setLandscapeIndex(idx)}
          intervalMs={6500}
          tintClass="from-black/40 via-transparent to-[#07090E]/95"
        />
      ) : (
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-[#07090E]">
          {currentPoster && (
            <img
              key={activeGame.id}
              src={currentPoster}
              alt={activeGame.title}
              className="w-full h-full object-cover object-center brightness-90 contrast-[1.08] transition-opacity duration-700 animate-fade-in animate-ken-burns"
            />
          )}
          <div className="absolute inset-0 cinematic-hero-vignette" />
        </div>
      )}

      {/* Dégradé du bas : couverture pour les rangées de jeux (effet Netflix) */}
      <div className="fixed bottom-0 left-0 right-0 h-1/2 z-[1] pointer-events-none bg-gradient-to-t from-[#07090E] via-[#07090E]/80 to-transparent" />
      {/* Dégradé latéral gauche */}
      <div className="fixed inset-0 pointer-events-none z-[1] bg-gradient-to-r from-[#07090E]/95 via-[#07090E]/40 via-35% to-transparent" />

      {/* 2. Hero Section — 60vh plein écran */}
      <div className="relative z-10 pt-28 md:pt-36 px-8 md:px-14 max-w-xl flex flex-col space-y-5 pointer-events-auto" style={{ minHeight: '55vh' }}>
        <div
          key={activeGame.id}
          className="flex flex-col space-y-4 animate-hero-content"
        >
          {/* Badges */}
          <div className="flex items-center flex-wrap gap-2 text-xs font-semibold text-slate-300">
            <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-cyan-400/15 border border-cyan-400/40 text-[11px] font-bold text-cyan-300 uppercase tracking-wider">
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
              <span className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-neutral-950 font-black uppercase text-[10px] tracking-wider shadow-md">
                ★ {activeGame.badge}
              </span>
            )}
          </div>

          {/* Titre Netflix monumentale */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black font-display tracking-tight text-white uppercase leading-none drop-shadow-[0_4px_35px_rgba(0,0,0,0.95)]">
            {activeGame.title}
          </h1>

          {/* Synopsis */}
          <p className="text-sm md:text-base text-slate-300 font-sans leading-relaxed line-clamp-2 max-w-lg">
            {activeGame.description || activeGame.tagline}
          </p>

          {/* Deux boutons — règle stricte */}
          <div className="flex items-center space-x-4 pt-1">
            <button
              data-tv-focus
              tabIndex={0}
              onClick={() => handlePlayGame(activeGame)}
              className="px-9 py-3.5 rounded-xl bg-white hover:bg-neutral-100 text-neutral-950 font-display font-black text-sm uppercase tracking-wider flex items-center space-x-3 shadow-[0_6px_25px_rgba(255,255,255,0.3)] hover:shadow-[0_10px_40px_rgba(255,255,255,0.55)] transform hover:scale-[1.03] active:scale-95 transition-all outline-none focus:ring-4 focus:ring-white cursor-pointer"
            >
              <Play className="w-4 h-4 fill-neutral-950 translate-x-0.5" />
              <span>{room && room.code ? 'REJOINDRE' : 'JOUER'}</span>
            </button>

            <button
              data-tv-focus
              tabIndex={0}
              onClick={() => {
                audio.playSelect();
                setSelectedGame(activeGame);
                setTvView('game_detail');
              }}
              className="px-7 py-3.5 rounded-xl liquid-glass hover:bg-white/15 text-white font-display font-bold text-sm uppercase tracking-wider flex items-center space-x-2.5 border border-white/20 hover:border-white/40 transform hover:scale-[1.03] active:scale-95 transition-all outline-none focus:ring-4 focus:ring-white/40 cursor-pointer"
            >
              <Info className="w-4 h-4 text-slate-300" />
              <span>DÉTAILS</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Rangées Netflix par catégorie */}
      <div className="relative z-10 pb-10 space-y-8 mt-4">
        {rows.map((row) => (
          <GameRow
            key={row.id}
            label={row.label}
            games={row.games}
            activeId={activeGame.id}
            onHighlight={handleHighlightGame}
            onPlay={handlePlayGame}
          />
        ))}
        {otherGames.length > 0 && (
          <GameRow
            label="Autres Jeux"
            games={otherGames}
            activeId={activeGame.id}
            onHighlight={handleHighlightGame}
            onPlay={handlePlayGame}
          />
        )}
      </div>
    </div>
  );
};
