import React, { useEffect, useRef, useState } from 'react';
import { useGame } from '../../context/GameContext';
import { adminCms } from '../../services/adminCmsService';
import { GAMES_CATALOG } from '../../data/gamesCatalog';
import { GameCatalogItem } from '../../types/game';
import { tvNav } from '../../services/tvNavigation';
import { Clock3, Gamepad2, Play, Sparkles, Users } from 'lucide-react';
import { audio } from '../../services/audio';

const FILTERED_IDS = ['wild_rush', 'blind_test', 'president'];

export const TVHomeView: React.FC = () => {
  const { room, selectGame, setSelectedGame, createRoom, setTvView } = useGame();
  const [games, setGames] = useState<GameCatalogItem[]>(() =>
    adminCms.getGamesCatalog().filter((game) => !FILTERED_IDS.includes(game.id))
  );
  const [spotlightGame, setSpotlightGame] = useState<GameCatalogItem>(() => games[0] || GAMES_CATALOG[0]);
  const homeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    tvNav.setInitialFocus('button', homeRef.current);
    const unsubscribe = adminCms.subscribe(() => {
      const updated = adminCms.getGamesCatalog().filter((game) => !FILTERED_IDS.includes(game.id));
      setGames(updated);
      setSpotlightGame((previous) =>
        updated.find((game) => game.id === previous?.id) || updated[0] || GAMES_CATALOG[0]
      );
    });
    return () => unsubscribe();
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

  const handleFocus = (game: GameCatalogItem, target?: HTMLElement | null) => {
    audio.playFocus();
    setSpotlightGame(game);
    setSelectedGame(game);
    target?.scrollIntoView({ behavior: 'auto', block: 'nearest', inline: 'nearest' });
  };

  const active = spotlightGame || games[0] || GAMES_CATALOG[0];
  const categoryLabels: Record<string, string> = {
    party: 'Jeux de soirée',
    reflexion: 'Jeux de réflexion',
    cards: 'Jeux de cartes',
    popular: 'Les plus populaires',
  };
  const shelves = [
    { title: 'Tous les jeux', items: games },
    ...Array.from(new Set(games.map((game) => game.category))).map((category) => ({
      title: categoryLabels[category] || category,
      items: games.filter((game) => game.category === category),
    })),
  ];

  return (
    <div className="tv-home relative min-h-screen overflow-hidden text-white">
      <div className="tv-home__glow tv-home__glow--one" aria-hidden="true" />
      <div className="tv-home__glow tv-home__glow--two" aria-hidden="true" />

      <div ref={homeRef} className="tv-home__content relative z-10 mx-auto flex min-h-screen w-full max-w-[1800px] flex-col px-[5vw] pb-[7vh] pt-[clamp(88px,10vh,116px)]">
        <section className="tv-home__hero grid flex-none items-center gap-7 pb-6 lg:grid-cols-[0.88fr_1.12fr] lg:gap-12">
          <div className="max-w-2xl py-4">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-lime-200/20 bg-lime-200/[0.08] px-3.5 py-2 text-xs font-bold uppercase tracking-[0.18em] text-lime-200">
              <Sparkles className="h-4 w-4" />
              La soirée commence ici
            </div>
            <h1 className="max-w-3xl text-5xl font-black leading-[0.96] tracking-[-0.055em] md:text-7xl xl:text-[5.6rem]">
              Un jeu.<br />
              <span className="text-lime-300">Tout le salon.</span>
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-white/65 md:text-lg">
              Choisissez votre ambiance, connectez les téléphones et jouez tous ensemble.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <button
                data-tv-focus
                tabIndex={0}
                onClick={() => handlePlay(active)}
                className="tv-primary-button inline-flex min-h-14 items-center gap-3 rounded-2xl px-7 py-3.5 text-sm font-black uppercase tracking-wider transition-colors"
              >
                <Play className="h-5 w-5 fill-current" />
                {room?.code ? 'Reprendre la soirée' : 'Jouer maintenant'}
              </button>
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-semibold text-white/55">
              <span className="inline-flex items-center gap-2"><Gamepad2 className="h-4 w-4 text-lime-300" /> {games.length} jeux à découvrir</span>
              <span className="inline-flex items-center gap-2"><Users className="h-4 w-4 text-lime-300" /> Les téléphones servent de manettes</span>
            </div>
          </div>

          <article className="tv-feature-card group relative isolate flex min-h-[34vh] flex-col justify-end overflow-hidden rounded-[2rem] border border-white/10 bg-[#1A1B17] md:min-h-[39vh]">
            <img
              key={active.id}
              src={active.heroImage || active.coverImage}
              alt=""
              className="absolute inset-0 h-full w-full object-cover object-center opacity-55 transition-opacity duration-300"
            />
            <div className="tv-feature-card__shade absolute inset-0" />
            <div className="relative z-10 max-w-2xl p-6 md:p-9">
              <div className="mb-3 flex flex-wrap items-center gap-2.5">
                <span className="rounded-full bg-lime-300 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-[#171810]">À la une</span>
                <span className="text-xs font-bold uppercase tracking-[0.16em] text-white/75">{active.category}</span>
                {active.badge && <span className="rounded-full border border-white/20 bg-black/30 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white/80">{active.badge}</span>}
              </div>
              <h2 className="max-w-xl text-3xl font-black uppercase leading-[1.02] tracking-[-0.04em] md:text-5xl">{active.title}</h2>
              <p className="mt-3 line-clamp-2 max-w-lg text-sm leading-relaxed text-white/75 md:text-base">{active.tagline || active.description}</p>
              <div className="mt-5 flex flex-wrap items-center gap-3 text-sm font-semibold text-white/75">
                <span className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-black/25 px-3.5 py-2"><Users className="h-4 w-4 text-lime-200" /> Jusqu’à {active.maxPlayers} joueurs</span>
                {active.durationMinutes && <span className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-black/25 px-3.5 py-2"><Clock3 className="h-4 w-4 text-lime-200" /> {active.durationMinutes}</span>}
              </div>
            </div>
            <span className="absolute right-5 top-5 rounded-full border border-white/15 bg-black/30 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white/65">Sélection du moment</span>
          </article>
        </section>

        <div className="tv-home__shelves relative z-10 space-y-7 pb-8">
          {shelves.map((shelf) => (
            <section key={shelf.title} className="tv-home__shelf">
              <div className="mb-3 flex items-end justify-between gap-4 px-1">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-lime-300/80">À vous de choisir</p>
                  <h2 className="mt-1 text-xl font-black tracking-tight md:text-2xl">{shelf.title}</h2>
                </div>
                <span className="hidden items-center gap-2 text-xs font-semibold text-white/45 md:flex">Parcourir <span className="text-lime-200">← →</span></span>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-none">
                {shelf.items.map((game) => (
                  <button
                    key={game.id}
                    data-tv-focus
                    tabIndex={0}
                    onFocus={(event) => handleFocus(game, event.currentTarget)}
                    onMouseEnter={(event) => handleFocus(game, event.currentTarget)}
                    onClick={() => handlePlay(game)}
                    className={'tv-game-card group relative w-[clamp(210px,22vw,330px)] flex-shrink-0 overflow-hidden rounded-2xl border text-left outline-none transition-colors ' + (active.id === game.id ? 'tv-game-card--active' : '')}
                  >
                    <div className="relative aspect-[16/9] overflow-hidden bg-white/5">
                      <img src={game.coverImage || game.heroImage} alt="" loading="lazy" className="h-full w-full object-cover transition-opacity duration-300 group-hover:opacity-100" />
                      <div className="tv-game-card__shade absolute inset-0" />
                      <span className="absolute bottom-2.5 left-3 text-[9px] font-black uppercase tracking-[0.16em] text-lime-200">{game.category}</span>
                    </div>
                    <div className="flex min-h-[52px] items-center justify-between gap-2 px-3 py-2.5">
                      <span className="line-clamp-1 text-xs font-extrabold text-white/85 md:text-sm">{game.title}</span>
                      <Play className="h-3.5 w-3.5 flex-shrink-0 fill-current text-lime-300" />
                    </div>
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
};
