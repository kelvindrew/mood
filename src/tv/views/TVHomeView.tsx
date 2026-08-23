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
    <div className="flex flex-col min-h-screen justify-center items-center select-none forest-sunlight-bg relative overflow-hidden">
      {/* 1. Centerpiece 3D Perspective Cover Flow Launcher (VisionOS Style) */}
      <div className="w-full max-w-7xl px-4 flex items-center justify-center my-auto pt-16 pb-28">
        <TVCoverFlowLauncher
          games={games}
          activeIndex={activeIndex}
          onIndexChange={setActiveIndex}
          onPlayGame={handlePlayGame}
          onMoreInfo={handleMoreInfo}
        />
      </div>

      {/* 2. Floating VisionOS Glassmorphic Control Bar (Minimal & Clean) */}
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
