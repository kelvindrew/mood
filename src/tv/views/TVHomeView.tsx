import React, { useEffect, useState, useRef } from 'react';
import { useGame } from '../../context/GameContext';
import { adminCms, PlatformBranding } from '../../services/adminCmsService';
import { GAMES_CATALOG } from '../../data/gamesCatalog';
import { GameCatalogItem } from '../../types/game';
import { tvNav } from '../../services/tvNavigation';
import { Play } from 'lucide-react';
import { audio } from '../../services/audio';
import { WorldLandscapeBackground, WORLD_LANDSCAPES } from '../../components/WorldLandscapeBackground';

const FILTERED_IDS = ['wild_rush', 'blind_test', 'president'];

export const TVHomeView: React.FC = () => {
  const { room, selectGame, setSelectedGame, createRoom, setTvView } = useGame();
  const [games, setGames] = useState<GameCatalogItem[]>(() =>
    adminCms.getGamesCatalog().filter((g) => !FILTERED_IDS.includes(g.id))
  );
  const [spotlightGame, setSpotlightGame] = useState<GameCatalogItem>(() => games[0] || GAMES_CATALOG[0]);
  const [branding, setBranding] = useState<PlatformBranding>(() => adminCms.getPlatformBranding());
  const [landscapeIndex, setLandscapeIndex] = useState<number>(0);
  const rowRef = useRef<HTMLDivElement>(null);

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

  const handlePlay = async (game: GameCatalogItem) => {
    audio.playSelect();
    setSelectedGame(game);
    if (room?.code) {
      selectGame(game.id);
      setTvView('lobby');
    } else {
      await createRoom(game.id, { maxPlayers: game.maxPlayers });
    }
  };

  const handleFocus = (game: GameCatalogItem, targetEl?: HTMLElement | null) => {
    audio.playFocus();
    setSpotlightGame(game);
    setSelectedGame(game);
    if (targetEl) {
      try {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      } catch {}
    }
  };

  const isLandscapeMode = branding.homeBackgroundMode === 'landscapes';
  const active = spotlightGame || games[0] || GAMES_CATALOG[0];
  const heroBg = isLandscapeMode ? null : (active?.heroImage || active?.coverImage);

  return (
    <div className="relative w-full h-screen bg-[#0a0a0a] text-white select-none overflow-hidden flex flex-col">

      {/* ── HERO : arrière-plan plein écran ── */}
      {isLandscapeMode ? (
        <WorldLandscapeBackground
          overlayDarkness={0.18}
          showLocationBadge={false}
          controlledIndex={landscapeIndex}
          onIndexChange={setLandscapeIndex}
          intervalMs={6500}
          tintClass="from-black/30 via-transparent to-transparent"
        />
      ) : (
        heroBg && (
          <div className="absolute inset-0 z-0 pointer-events-none">
            <img
              key={active.id}
              src={heroBg}
              alt=""
              className="w-full h-full object-cover object-center animate-ken-burns transition-opacity duration-700"
            />
          </div>
        )
      )}

      {/* Dégradé gauche pour lisibilité du texte */}
      <div className="absolute inset-0 z-[1] pointer-events-none bg-gradient-to-r from-black/80 via-black/30 to-transparent" />
      {/* Dégradé bas pour faire apparaître les cartes */}
      <div className="absolute bottom-0 left-0 right-0 z-[1] pointer-events-none h-[45%] bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/85 to-transparent" />

      {/* ── HERO TEXTE : posé directement sur l'image ── */}
      <div
        key={active.id}
        className="relative z-10 flex-shrink-0 flex flex-col justify-end px-12 md:px-16"
        style={{ paddingTop: '15vh', paddingBottom: '3vh', maxWidth: '42%' }}
      >
        {/* Catégorie */}
        <p className="text-xs md:text-sm font-bold uppercase tracking-widest text-slate-300 mb-2 animate-hero-content">
          {active.category}
          {active.badge && (
            <span className="ml-3 px-2 py-0.5 rounded bg-amber-400 text-[9px] font-black text-neutral-950 uppercase">
              {active.badge}
            </span>
          )}
        </p>

        {/* Titre monumental */}
        <h1 className="font-display font-black uppercase leading-none text-white mb-3 animate-hero-content"
          style={{ fontSize: 'clamp(2.8rem, 6vw, 5.5rem)', letterSpacing: '-0.02em', textShadow: '0 4px 40px rgba(0,0,0,0.9)' }}
        >
          {active.title}
        </h1>

        {/* Description courte */}
        <p className="text-sm md:text-base text-slate-300 leading-snug mb-5 line-clamp-2 animate-hero-content" style={{ maxWidth: '34ch' }}>
          {active.description || active.tagline}
        </p>

        {/* UN seul bouton */}
        <div className="animate-hero-content">
          <button
            data-tv-focus
            tabIndex={0}
            onClick={() => handlePlay(active)}
            className="inline-flex items-center space-x-2.5 px-8 py-3 rounded-xl bg-white/90 hover:bg-white text-neutral-950 font-display font-black text-sm uppercase tracking-wider shadow-[0_6px_30px_rgba(0,0,0,0.6)] hover:shadow-[0_8px_40px_rgba(255,255,255,0.3)] transform hover:scale-[1.03] active:scale-95 transition-all outline-none focus:ring-4 focus:ring-white/60 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-neutral-950 translate-x-0.5" />
            <span>{room?.code ? 'Rejoindre' : 'Jouer'}</span>
          </button>
        </div>
      </div>

      {/* ── RANGÉE DE JEUX : cartes paysage 16:9 ── */}
      <div className="relative z-10 flex-shrink-0 pb-6 mt-auto">
        {/* Titre de la section */}
        <p className="px-12 md:px-16 text-sm md:text-base font-display font-black uppercase tracking-wider text-white mb-3">
          Catalogue MOOD
        </p>

        {/* Cartes horizontales */}
        <div
          ref={rowRef}
          className="flex items-end space-x-4 px-12 md:px-16 overflow-x-auto pb-2 scrollbar-none"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {games.map((game) => {
            const isActive = active.id === game.id;
            return (
              <div
                key={game.id}
                data-tv-focus
                tabIndex={0}
                onFocus={(e) => handleFocus(game, e.currentTarget)}
                onMouseEnter={(e) => handleFocus(game, e.currentTarget)}
                onClick={() => handlePlay(game)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handlePlay(game); }
                }}
                className={`group flex-shrink-0 cursor-pointer outline-none select-none transition-all duration-300 ease-out ${
                  isActive ? 'scale-[1.08] z-20' : 'opacity-70 hover:opacity-100 hover:scale-[1.04]'
                }`}
                style={{ width: 'clamp(140px, 13vw, 210px)' }}
              >
                {/* Thumbnail paysage 16:9 */}
                <div
                  className={`relative overflow-hidden rounded-lg bg-neutral-900 transition-all duration-300 ${
                    isActive
                      ? 'ring-2 ring-white shadow-[0_8px_30px_rgba(0,0,0,0.8)]'
                      : 'ring-1 ring-white/10 group-hover:ring-white/40 shadow-lg'
                  }`}
                  style={{ aspectRatio: '16/9' }}
                >
                  <img
                    src={game.coverImage || game.heroImage}
                    alt={game.title}
                    loading="lazy"
                    className="w-full h-full object-cover object-center brightness-90 group-hover:brightness-105 group-hover:scale-110 transition-all duration-500"
                  />
                  {/* Léger dégradé bas sur la carte */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                  {/* Icône play au survol */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-200">
                    <div className="w-9 h-9 rounded-full bg-white/90 flex items-center justify-center shadow-xl scale-90 group-hover:scale-100 transition-transform">
                      <Play className="w-3.5 h-3.5 fill-neutral-950 translate-x-0.5" />
                    </div>
                  </div>
                </div>

                {/* Titre + sous-titre sous la carte */}
                <div className="mt-2 px-0.5 space-y-0.5">
                  <p className={`text-[11px] md:text-xs font-bold truncate transition-colors ${
                    isActive ? 'text-white' : 'text-slate-300 group-hover:text-white'
                  }`}>
                    {game.title}
                  </p>
                  <p className="text-[10px] text-slate-500 truncate capitalize">
                    {game.category} · {game.maxPlayers}J max
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
