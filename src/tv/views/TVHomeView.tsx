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
    /* Grille TV : rangées réservées pour navbar & barre flottante =>
       aucun chevauchement possible, quelle que soit la résolution. */
    <div
      className="relative w-full overflow-hidden select-none bg-[#050A08]"
      style={{
        height: '100vh',
        display: 'grid',
        gridTemplateRows: 'var(--tv-nav-h) minmax(0, 1fr) var(--tv-bar-h)',
      }}
    >
      {/* 1. Full-Bleed Dynamic Ambient Background (VisionOS Style) */}
      <div className="absolute inset-0 z-0 pointer-events-none transition-all duration-700 overflow-hidden">
        <img
          src={activeGame.heroImage || activeGame.coverImage}
          alt=""
          aria-hidden
          className="w-full h-full object-cover object-center filter blur-2xl opacity-25 scale-110 transition-opacity duration-700"
        />
        {/* Soft radial vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050A08] via-[#050A08]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050A08]/80 via-transparent to-[#050A08]" />
      </div>

      {/* 2. Centerpiece Cover Flow (rangée centrale de la grille) */}
      <div className="relative z-10 w-full h-full min-h-0 flex items-center justify-center px-[3vw] overflow-hidden">
        <TVCoverFlowLauncher
          games={games}
          activeIndex={activeIndex}
          onIndexChange={setActiveIndex}
          onPlayGame={handlePlayGame}
          onMoreInfo={handleMoreInfo}
        />
      </div>

      {/* 3. Floating VisionOS Glassmorphic Control Bar (rangée basse réservée) */}
      <div className="relative z-20 flex items-end justify-center">
        <TVFloatingControlBar
          activeGame={activeGame}
          onPrev={() => setActiveIndex((prev) => (prev > 0 ? prev - 1 : games.length - 1))}
          onNext={() => setActiveIndex((prev) => (prev < games.length - 1 ? prev + 1 : 0))}
          onPlay={handlePlayGame}
          onMoreInfo={handleMoreInfo}
        />
      </div>
    </div>
  );
};
