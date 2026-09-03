import React, { useEffect, useState } from 'react';
import { useGame } from '../../context/GameContext';
import { adminCms } from '../../services/adminCmsService';
import { TVCoverFlowLauncher } from '../components/TVCoverFlowLauncher';
import { TVFloatingControlBar } from '../components/TVFloatingControlBar';
import { GameCatalogItem } from '../../types/game';
import { tvNav } from '../../services/tvNavigation';

export const TVHomeView: React.FC = () => {
  const { setSelectedGame, setTvView, createRoom } = useGame();
  const [games, setGames] = useState<GameCatalogItem[]>(adminCms.getGamesCatalog());
  const [activeIndex, setActiveIndex] = useState<number>(0);

  useEffect(() => {
    tvNav.setInitialFocus('button');
    const unsub = adminCms.subscribe(() => {
      setGames(adminCms.getGamesCatalog());
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

  const activeGame = games[activeIndex] || games[0];

  return (
    <div
      className="relative w-full h-screen min-h-screen flex flex-col justify-center items-center select-none theme-bg overflow-hidden transition-colors duration-500"
      style={{ backgroundColor: 'var(--theme-bg, #040711)' }}
    >
      {/* 1. Full-Bleed Dynamic Ambient Background with Theme Lighting */}
      <div className="fixed inset-0 z-0 pointer-events-none transition-all duration-700 overflow-hidden">
        <img
          src={activeGame.heroImage || activeGame.coverImage}
          alt={activeGame.title}
          className="w-full h-full object-cover object-center filter blur-3xl opacity-25 scale-125 transition-opacity duration-700"
        />
        {/* Soft theme-aware radial vignette */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to top, var(--theme-bg, #040711) 0%, transparent 50%, var(--theme-bg, #040711) 100%)',
          }}
        />
        <div
          className="absolute inset-0 opacity-20 transition-all duration-700"
          style={{
            background:
              'radial-gradient(circle at 50% 40%, var(--theme-primary, #00F2FE) 0%, transparent 60%)',
          }}
        />
      </div>

      {/* 2. Centerpiece 3D Perspective Cover Flow Launcher (VisionOS Style) */}
      <div className="relative z-10 w-full h-screen flex items-center justify-center pt-16 pb-24 px-4 overflow-hidden">
        <TVCoverFlowLauncher
          games={games}
          activeIndex={activeIndex}
          onIndexChange={setActiveIndex}
          onPlayGame={handlePlayGame}
          onMoreInfo={handleMoreInfo}
        />
      </div>

      {/* 3. Floating VisionOS Glassmorphic Control Bar (Minimal & Clean) */}
      <TVFloatingControlBar
        activeGame={activeGame}
        onPrev={() => setActiveIndex((prev) => (prev > 0 ? prev - 1 : games.length - 1))}
        onNext={() => setActiveIndex((prev) => (prev < games.length - 1 ? prev + 1 : 0))}
        onPlay={handlePlayGame}
        onMoreInfo={handleMoreInfo}
      />
    </div>
  );
};
