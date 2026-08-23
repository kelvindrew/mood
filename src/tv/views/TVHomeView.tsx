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
    <div className="relative w-full h-screen min-h-screen flex flex-col justify-between items-center select-none bg-[#050A08] overflow-hidden">
      {/* 1. Ultra-Fast High Performance Dark Ambient Background (Zero Blur Filter for 60 FPS TV) */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-gradient-to-b from-[#08120E] via-[#050A08] to-[#020504]">
        {/* Soft subtle ambient accent (pure CSS gradient, no CPU-heavy blur filter) */}
        <div className="absolute top-0 left-1/3 w-1/3 h-1/2 bg-[#10B981]/5 rounded-full pointer-events-none" />
      </div>

      {/* 2. Centerpiece High-Performance Widescreen Launcher */}
      <div className="relative z-10 w-full flex-1 flex items-center justify-center pt-14 pb-20 px-4 overflow-hidden">
        <TVCoverFlowLauncher
          games={games}
          activeIndex={activeIndex}
          onIndexChange={setActiveIndex}
          onPlayGame={handlePlayGame}
          onMoreInfo={handleMoreInfo}
        />
      </div>

      {/* 3. Floating Clean Control Bar */}
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
