import React, { useEffect, useState, useMemo } from 'react';
import { useGame } from '../../context/GameContext';
import { adminCms } from '../../services/adminCmsService';
import { TVHeroBanner } from '../components/TVHeroBanner';
import { TVGameRow } from '../components/TVGameRow';
import { TVCoverFlowLauncher } from '../components/TVCoverFlowLauncher';
import { TVFloatingControlBar } from '../components/TVFloatingControlBar';
import { GameCatalogItem } from '../../types/game';
import { CATEGORIES } from '../../data/gamesCatalog';
import { tvNav } from '../../services/tvNavigation';
import { audio } from '../../services/audio';
import { Sparkles, Flame, Layers, Box, Gamepad2, Brain } from 'lucide-react';

export const TVHomeView: React.FC = () => {
  const { setSelectedGame, setTvView, createRoom } = useGame();
  const [games, setGames] = useState<GameCatalogItem[]>(adminCms.getGamesCatalog());
  const [spotlightGame, setSpotlightGame] = useState<GameCatalogItem>(games[0]);
  const [selectedCat, setSelectedCat] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'platform' | 'coverflow'>('platform');
  const [coverflowIndex, setCoverflowIndex] = useState<number>(0);

  useEffect(() => {
    tvNav.setInitialFocus('button');
    const unsub = adminCms.subscribe(() => {
      const updated = adminCms.getGamesCatalog();
      setGames(updated);
      if (updated.length > 0) setSpotlightGame(updated[0]);
    });
    return () => unsub();
  }, []);

  const handlePlayGame = async (game: GameCatalogItem) => {
    setSelectedGame(game);
    await createRoom(game.id);
  };

  const handleMoreInfo = (game: GameCatalogItem) => {
    setSelectedGame(game);
    setTvView('detail');
  };

  // Thematic collections for Smart TV shelf layout
  const partyGames = useMemo(() => {
    return games.filter((g) => ['spy', 'bomb_party', 'petit_bac', 'fake_news', 'meme_factory', 'connect_four', 'quick_games'].includes(g.id));
  }, [games]);

  const cardGames = useMemo(() => {
    return games.filter((g) => ['menteur', 'inter', 'card_party', 'president', 'poker', 'blackjack'].includes(g.id) || g.category === 'cards');
  }, [games]);

  const boardGames = useMemo(() => {
    return games.filter((g) => ['scrabble', 'naval_battle', 'ludo', 'four_pics', 'werewolf', 'quiz', 'blind_test', 'draw_and_guess'].includes(g.id) || g.category === 'reflexion');
  }, [games]);

  const filteredGames = useMemo(() => {
    if (selectedCat === 'all') return games;
    return games.filter((g) => g.category === selectedCat);
  }, [games, selectedCat]);

  // If in 3D CoverFlow mode
  if (viewMode === 'coverflow') {
    const activeCoverGame = games[coverflowIndex] || games[0];
    return (
      <div className="relative w-full h-screen min-h-screen flex flex-col justify-center items-center select-none bg-[#060810] overflow-hidden">
        {/* Ambient Blur Backdrop */}
        <div className="fixed inset-0 z-0 pointer-events-none transition-all duration-700 overflow-hidden">
          <img
            src={activeCoverGame.heroImage || activeCoverGame.coverImage}
            alt={activeCoverGame.title}
            className="w-full h-full object-cover object-center filter blur-3xl opacity-30 scale-125 transition-opacity duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#060810] via-[#060810]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#060810]/80 via-transparent to-[#060810]" />
        </div>

        {/* Top Switcher Button */}
        <div className="absolute top-20 right-[5vw] z-30">
          <button
            data-tv-focus
            tabIndex={0}
            onClick={() => {
              audio.playSelect();
              setViewMode('platform');
            }}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs backdrop-blur-md outline-none focus:scale-110 focus:bg-white focus:text-black"
          >
            <Layers className="w-4 h-4" />
            <span>Vue Plateforme Smart TV</span>
          </button>
        </div>

        {/* 3D CoverFlow Launcher */}
        <div className="relative z-10 w-full h-screen flex items-center justify-center pt-16 pb-24 px-4 overflow-hidden">
          <TVCoverFlowLauncher
            games={games}
            activeIndex={coverflowIndex}
            onIndexChange={setCoverflowIndex}
            onPlayGame={handlePlayGame}
            onMoreInfo={handleMoreInfo}
          />
        </div>

        {/* Floating Control Bar */}
        <TVFloatingControlBar
          activeGame={activeCoverGame}
          onPrev={() => setCoverflowIndex((prev) => (prev > 0 ? prev - 1 : games.length - 1))}
          onNext={() => setCoverflowIndex((prev) => (prev < games.length - 1 ? prev + 1 : 0))}
          onPlay={handlePlayGame}
          onMoreInfo={handleMoreInfo}
        />
      </div>
    );
  }

  // Smart TV Platform Mode (Default)
  return (
    <div className="relative min-h-screen bg-[#060810] text-white select-none pb-24 overflow-x-hidden">
      {/* 1. Cinematic Hero Banner */}
      <TVHeroBanner
        game={spotlightGame}
        onPlay={handlePlayGame}
        onMoreInfo={handleMoreInfo}
      />

      {/* 2. Category Filter Switcher & Mode Toggle Bar */}
      <div className="px-[5vw] py-4 flex items-center justify-between border-t border-b border-white/10 bg-[#060810]/80 backdrop-blur-md sticky top-16 z-20">
        <div className="flex items-center space-x-2 overflow-x-auto scrollbar-none py-1">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCat === cat.id;
            return (
              <button
                key={cat.id}
                data-tv-focus
                tabIndex={0}
                onClick={() => {
                  audio.playSelect();
                  setSelectedCat(cat.id);
                }}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all outline-none flex-shrink-0 ${
                  isActive
                    ? 'bg-gradient-to-r from-mood-coral to-mood-amber text-white font-black shadow-[0_0_25px_rgba(255,71,87,0.5)] scale-105 ring-2 ring-white/50'
                    : 'bg-[#0F1424] hover:bg-[#1A2238] border border-white/10 text-gray-300 hover:text-white'
                }`}
              >
                <span>{cat.name}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${isActive ? 'bg-black/30 text-white' : 'bg-white/10 text-gray-400'}`}>
                  {cat.id === 'all' ? games.length : games.filter((g) => g.category === cat.id).length}
                </span>
              </button>
            );
          })}
        </div>

        {/* 3D CoverFlow View Toggle */}
        <button
          data-tv-focus
          tabIndex={0}
          onClick={() => {
            audio.playSelect();
            setViewMode('coverflow');
          }}
          className="hidden md:flex items-center space-x-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-mood-cyan font-bold text-xs transition-all outline-none focus:scale-105 focus:bg-white focus:text-black ml-4 flex-shrink-0"
          title="Afficher la vue CoverFlow 3D"
        >
          <Box className="w-4 h-4 text-mood-cyan" />
          <span>Vue CoverFlow 3D</span>
        </button>
      </div>

      {/* 3. Thematic Game Shelves / Rows */}
      <div className="py-6 space-y-6">
        {selectedCat === 'all' ? (
          <>
            {/* Shelf 1: Party & Hits */}
            <TVGameRow
              title="🔥 Tendances & Soirées Multijoueurs"
              games={partyGames}
              icon={<Flame className="w-5 h-5 text-mood-coral" />}
              onSelectGame={(g) => {
                setSpotlightGame(g);
                handleMoreInfo(g);
              }}
              onPlayGame={handlePlayGame}
            />

            {/* Shelf 2: Card Games */}
            <TVGameRow
              title="🃏 Jeux de Cartes de Salon"
              games={cardGames}
              icon={<Sparkles className="w-5 h-5 text-mood-amber" />}
              onSelectGame={(g) => {
                setSpotlightGame(g);
                handleMoreInfo(g);
              }}
              onPlayGame={handlePlayGame}
            />

            {/* Shelf 3: Board, Words & Strategy */}
            <TVGameRow
              title="🧠 Société, Mots & Réflexion"
              games={boardGames}
              icon={<Brain className="w-5 h-5 text-mood-cyan" />}
              onSelectGame={(g) => {
                setSpotlightGame(g);
                handleMoreInfo(g);
              }}
              onPlayGame={handlePlayGame}
            />
          </>
        ) : (
          <TVGameRow
            title={`Jeux : ${CATEGORIES.find((c) => c.id === selectedCat)?.name || selectedCat}`}
            games={filteredGames}
            icon={<Gamepad2 className="w-5 h-5 text-mood-coral" />}
            onSelectGame={(g) => {
              setSpotlightGame(g);
              handleMoreInfo(g);
            }}
            onPlayGame={handlePlayGame}
          />
        )}
      </div>
    </div>
  );
};
