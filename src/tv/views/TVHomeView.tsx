import React, { useEffect, useState } from 'react';
import { useGame } from '../../context/GameContext';
import { GAMES_CATALOG } from '../../data/gamesCatalog';
import { TVHeroBanner } from '../components/TVHeroBanner';
import { TVGameRow } from '../components/TVGameRow';
import { GameCatalogItem } from '../../types/game';
import { tvNav } from '../../services/tvNavigation';
import { Flame, Sparkles, Trophy, Dice6, BookOpen } from 'lucide-react';

export const TVHomeView: React.FC = () => {
  const { setSelectedGame, setTvView, createRoom } = useGame();
  const [featuredGameIndex, setFeaturedGameIndex] = useState<number>(0);

  useEffect(() => {
    tvNav.setInitialFocus('button');
  }, []);

  const handlePlayGame = async (game: GameCatalogItem) => {
    setSelectedGame(game);
    await createRoom(game.id);
  };

  const handleMoreInfo = (game: GameCatalogItem) => {
    setSelectedGame(game);
    setTvView('detail');
  };

  const featuredGame = GAMES_CATALOG[featuredGameIndex] || GAMES_CATALOG[0];

  const classicAndBoardGames = GAMES_CATALOG.filter((g) =>
    ['ludo', 'scrabble'].includes(g.id)
  );

  const partyAndShowGames = GAMES_CATALOG.filter((g) =>
    ['quiz', 'draw_and_guess', 'blind_test', 'werewolf'].includes(g.id)
  );

  const cardGames = GAMES_CATALOG.filter((g) =>
    ['card_party', 'president', 'poker', 'blackjack'].includes(g.id)
  );

  return (
    <div className="flex flex-col min-h-screen pb-28 select-none">
      {/* Hero Banner with Featured Game */}
      <TVHeroBanner
        game={featuredGame}
        onPlay={handlePlayGame}
        onMoreInfo={handleMoreInfo}
      />

      {/* Clean Category Rails */}
      <div className="flex flex-col space-y-8 -mt-8 relative z-20">
        <TVGameRow
          title="Tendances & Hits du Salon"
          games={GAMES_CATALOG}
          icon={<Flame className="w-5 h-5 text-brand-red fill-current" />}
          onSelectGame={handleMoreInfo}
          onPlayGame={handlePlayGame}
        />

        <TVGameRow
          title="Jeux de Société & Classiques"
          games={classicAndBoardGames.length > 0 ? classicAndBoardGames : GAMES_CATALOG}
          icon={<Dice6 className="w-5 h-5 text-brand-cyan" />}
          onSelectGame={handleMoreInfo}
          onPlayGame={handlePlayGame}
        />

        <TVGameRow
          title="Ambiance, Soirée & Fous Rires"
          games={partyAndShowGames.length > 0 ? partyAndShowGames : GAMES_CATALOG}
          icon={<Trophy className="w-5 h-5 text-brand-purple" />}
          onSelectGame={handleMoreInfo}
          onPlayGame={handlePlayGame}
        />

        <TVGameRow
          title="Jeux de Cartes & Stratégie"
          games={cardGames.length > 0 ? cardGames : GAMES_CATALOG}
          icon={<Sparkles className="w-5 h-5 text-brand-gold" />}
          onSelectGame={handleMoreInfo}
          onPlayGame={handlePlayGame}
        />
      </div>
    </div>
  );
};
