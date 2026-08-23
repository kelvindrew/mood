import React, { useEffect, useState } from 'react';
import { useGame } from '../../context/GameContext';
import { adminCms } from '../../services/adminCmsService';
import { TVCoverFlowLauncher } from '../components/TVCoverFlowLauncher';
import { TVFloatingControlBar } from '../components/TVFloatingControlBar';
import { TVGameRow } from '../components/TVGameRow';
import { GameCatalogItem } from '../../types/game';
import { tvNav } from '../../services/tvNavigation';
import { Flame, Sparkles, Trophy, Dice6, Zap } from 'lucide-react';

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

  const arcadeAndActionGames = games.filter((g) =>
    ['mini_racing', 'quick_games', 'four_pics'].includes(g.id)
  );

  const classicAndBoardGames = games.filter((g) =>
    ['ludo', 'scrabble'].includes(g.id)
  );

  const partyAndShowGames = games.filter((g) =>
    ['quiz', 'draw_and_guess', 'blind_test', 'werewolf'].includes(g.id)
  );

  const cardGames = games.filter((g) =>
    ['menteur', 'inter', 'card_party', 'president', 'poker', 'blackjack'].includes(g.id)
  );

  return (
    <div className="flex flex-col min-h-screen pt-20 pb-36 select-none forest-sunlight-bg relative">
      {/* 1. Centerpiece 3D Perspective Cover Flow Launcher (VisionOS Style) */}
      <TVCoverFlowLauncher
        games={games}
        activeIndex={activeIndex}
        onIndexChange={setActiveIndex}
        onPlayGame={handlePlayGame}
        onMoreInfo={handleMoreInfo}
      />

      {/* 2. Secondary Horizontal Rails for Rapid Category Exploration */}
      <div className="flex flex-col space-y-6 mt-4 relative z-20">
        <TVGameRow
          title="⚡ Quick Games & Nouveautés 3D"
          games={arcadeAndActionGames.length > 0 ? arcadeAndActionGames : games}
          icon={<Zap className="w-5 h-5 text-[#F59E0B] fill-current" />}
          onSelectGame={handleMoreInfo}
          onPlayGame={handlePlayGame}
        />

        <TVGameRow
          title="🔥 Tendances & Hits du Salon"
          games={games}
          icon={<Flame className="w-5 h-5 text-[#F59E0B] fill-current" />}
          onSelectGame={handleMoreInfo}
          onPlayGame={handlePlayGame}
        />

        <TVGameRow
          title="🎲 Jeux de Société & Classiques"
          games={classicAndBoardGames.length > 0 ? classicAndBoardGames : games}
          icon={<Dice6 className="w-5 h-5 text-[#34D399]" />}
          onSelectGame={handleMoreInfo}
          onPlayGame={handlePlayGame}
        />

        <TVGameRow
          title="🏆 Ambiance, Soirée & Fous Rires"
          games={partyAndShowGames.length > 0 ? partyAndShowGames : games}
          icon={<Trophy className="w-5 h-5 text-[#FBBF24]" />}
          onSelectGame={handleMoreInfo}
          onPlayGame={handlePlayGame}
        />

        <TVGameRow
          title="🃏 Jeux de Cartes & Stratégie"
          games={cardGames.length > 0 ? cardGames : games}
          icon={<Sparkles className="w-5 h-5 text-[#FBBF24] fill-current" />}
          onSelectGame={handleMoreInfo}
          onPlayGame={handlePlayGame}
        />
      </div>

      {/* 3. Floating VisionOS Glassmorphic Control Bar (Exact match of Reference Image) */}
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
