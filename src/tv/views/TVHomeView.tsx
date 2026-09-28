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
import { Layers, Box } from 'lucide-react';

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
      if (updated.length > 0 && !spotlightGame) {
        setSpotlightGame(updated[0]);
      }
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
    return games.filter((g) =>
      ['spy', 'bomb_party', 'petit_bac', 'fake_news', 'meme_factory', 'connect_four', 'quick_games'].includes(g.id)
    );
  }, [games]);

  const cardGames = useMemo(() => {
    return games.filter(
      (g) => ['menteur', 'inter', 'card_party', 'president', 'poker', 'blackjack'].includes(g.id) || g.category === 'cards'
    );
  }, [games]);

  const boardGames = useMemo(() => {
    return games.filter(
      (g) =>
        ['scrabble', 'naval_battle', 'ludo', 'four_pics', 'werewolf', 'quiz', 'blind_test', 'draw_and_guess'].includes(g.id) ||
        g.category === 'reflexion'
    );
  }, [games]);

  const filteredGames = useMemo(() => {
    if (selectedCat === 'all') return games;
    return games.filter((g) => g.category === selectedCat);
  }, [games, selectedCat]);

  // 3D CoverFlow Mode
  if (viewMode === 'coverflow') {
    const activeCoverGame = games[coverflowIndex] || games[0];
    return (
      <div className="relative w-full h-screen min-h-screen flex flex-col justify-center items-center select-none bg-transparent overflow-hidden">
        {/* Ambient Blur Backdrop */}
        <div className="fixed inset-0 z-0 pointer-events-none transition-all duration-700 overflow-hidden">
          <img
            src={activeCoverGame.heroImage || activeCoverGame.coverImage}
            alt={activeCoverGame.title}
            className="w-full h-full object-cover object-center filter blur-3xl opacity-30 scale-125 transition-opacity duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#07090E] via-[#07090E]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#07090E]/80 via-transparent to-[#07090E]" />
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
            className="flex items-center space-x-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs backdrop-blur-md outline-none focus:scale-110 focus:bg-white focus:text-black"
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
            onIndexChange={(idx) => {
              setCoverflowIndex(idx);
              if (games[idx]) setSpotlightGame(games[idx]);
            }}
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

  // Cinematic Smart TV Mode (Reference Image: RAYA AND THE LAST DRAGON Style)
  return (
    <div className="relative min-h-screen text-white select-none pb-20 overflow-x-hidden">
      {/* 1. Dynamic Full-Bleed Background (Directly Inspired by Reference Image) */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden select-none">
        <img
          key={spotlightGame.id}
          src={spotlightGame.heroImage || spotlightGame.coverImage}
          alt={spotlightGame.title}
          className="w-full h-full object-cover object-right md:object-center filter brightness-[0.90] contrast-[1.05] transition-opacity duration-700 animate-fade-in"
        />

        {/* Left Dark Gradient: Deep contrast for Title, Meta, and Buttons */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#07090E] via-[#07090E]/85 via-42% via-[#07090E]/30 to-transparent" />

        {/* Top Vignette under Navbar */}
        <div className="absolute top-0 left-0 right-0 h-44 bg-gradient-to-b from-[#07090E] via-[#07090E]/60 to-transparent" />

        {/* Bottom Vignette for the MY LIST carousel */}
        <div className="absolute bottom-0 left-0 right-0 h-[48vh] bg-gradient-to-t from-[#07090E] via-[#07090E]/90 to-transparent" />
      </div>

      {/* 2. Hero Title & Actions Section */}
      <TVHeroBanner
        game={spotlightGame}
        onPlay={handlePlayGame}
        onMoreInfo={handleMoreInfo}
      />

      {/* 3. Category Filter & View Mode Bar */}
      <div className="relative z-10 px-8 md:px-12 pt-4 pb-2 flex items-center justify-between">
        <div className="flex items-center space-x-3 overflow-x-auto scrollbar-none py-1">
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
                className={`flex items-center space-x-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all outline-none flex-shrink-0 ${
                  isActive
                    ? 'bg-purple-600 text-white font-extrabold shadow-[0_0_20px_rgba(124,58,237,0.5)] scale-105 ring-1 ring-purple-400'
                    : 'bg-white/10 hover:bg-white/20 border border-white/10 text-gray-300 hover:text-white'
                }`}
              >
                <span>{cat.name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                    isActive ? 'bg-black/30 text-white' : 'bg-white/10 text-gray-400'
                  }`}
                >
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
          className="hidden md:flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white font-bold text-xs transition-all outline-none focus:scale-105 focus:bg-white focus:text-black ml-4 flex-shrink-0"
          title="Afficher la vue CoverFlow 3D"
        >
          <Box className="w-3.5 h-3.5 text-purple-400" />
          <span>CoverFlow 3D</span>
        </button>
      </div>

      {/* 4. Bottom Shelves: MY LIST Carousel (Reference Image Style) */}
      <div className="relative z-10 pt-2 pb-6 space-y-4">
        {selectedCat === 'all' ? (
          <>
            {/* Shelf 1: MY LIST (Reference Image: MY LIST with Vertical Posters) */}
            <TVGameRow
              title="MY LIST • COUPS DE CŒUR"
              games={partyGames}
              activeGameId={spotlightGame.id}
              onHighlightGame={(g) => setSpotlightGame(g)}
              onSelectGame={(g) => {
                setSpotlightGame(g);
                handleMoreInfo(g);
              }}
              onPlayGame={handlePlayGame}
            />

            {/* Shelf 2: Card Games */}
            <TVGameRow
              title="JEUX DE CARTES DE SALON"
              games={cardGames}
              activeGameId={spotlightGame.id}
              onHighlightGame={(g) => setSpotlightGame(g)}
              onSelectGame={(g) => {
                setSpotlightGame(g);
                handleMoreInfo(g);
              }}
              onPlayGame={handlePlayGame}
            />

            {/* Shelf 3: Board & Words */}
            <TVGameRow
              title="SOCIÉTÉ, MOTS & STRATÉGIE"
              games={boardGames}
              activeGameId={spotlightGame.id}
              onHighlightGame={(g) => setSpotlightGame(g)}
              onSelectGame={(g) => {
                setSpotlightGame(g);
                handleMoreInfo(g);
              }}
              onPlayGame={handlePlayGame}
            />
          </>
        ) : (
          <TVGameRow
            title={`JEUX : ${CATEGORIES.find((c) => c.id === selectedCat)?.name || selectedCat}`}
            games={filteredGames}
            activeGameId={spotlightGame.id}
            onHighlightGame={(g) => setSpotlightGame(g)}
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
