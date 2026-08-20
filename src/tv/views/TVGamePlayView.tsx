import React, { useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { LudoBoardTV } from '../boards/LudoBoardTV';
import { WordBoardTV } from '../boards/WordBoardTV';
import { CardBoardTV } from '../boards/CardBoardTV';
import { QuizBoardTV } from '../boards/QuizBoardTV';
import { DrawBoardTV } from '../boards/DrawBoardTV';
import { WerewolfBoardTV } from '../boards/WerewolfBoardTV';
import { BlindTestBoardTV } from '../boards/BlindTestBoardTV';
import { PresidentBoardTV } from '../boards/PresidentBoardTV';
import { PokerBoardTV } from '../boards/PokerBoardTV';
import { BlackjackBoardTV } from '../boards/BlackjackBoardTV';
import { MenteurBoardTV } from '../boards/MenteurBoardTV';
import { InterBoardTV } from '../boards/InterBoardTV';
import { FourPicsBoardTV } from '../boards/FourPicsBoardTV';
import { MiniRacingBoardTV } from '../boards/MiniRacingBoardTV';
import { QuickGamesBoardTV } from '../boards/QuickGamesBoardTV';
import { tvNav } from '../../services/tvNavigation';
import { ArrowLeft } from 'lucide-react';

export const TVGamePlayView: React.FC = () => {
  const { room, returnToLobby } = useGame();

  useEffect(() => {
    // Disable active spatial D-pad navigation during live game to prevent crashes/leaks
    tvNav.setEnabled(false);

    const unregisterBack = tvNav.registerBackHandler(() => {
      returnToLobby();
    });

    return () => {
      unregisterBack();
      tvNav.setEnabled(true);
    };
  }, []);

  if (!room) return null;

  const renderActiveBoard = () => {
    switch (room.gameId) {
      case 'ludo':
        return <LudoBoardTV />;
      case 'scrabble':
        return <WordBoardTV />;
      case 'card_party':
        return <CardBoardTV />;
      case 'quiz':
        return <QuizBoardTV />;
      case 'draw_and_guess':
        return <DrawBoardTV />;
      case 'werewolf':
        return <WerewolfBoardTV />;
      case 'blind_test':
        return <BlindTestBoardTV />;
      case 'president':
        return <PresidentBoardTV />;
      case 'poker':
        return <PokerBoardTV />;
      case 'blackjack':
        return <BlackjackBoardTV />;
      case 'menteur':
        return <MenteurBoardTV />;
      case 'inter':
        return <InterBoardTV />;
      case 'four_pics':
        return <FourPicsBoardTV />;
      case 'mini_racing':
        return <MiniRacingBoardTV />;
      case 'quick_games':
        return <QuickGamesBoardTV />;
      default:
        return <LudoBoardTV />;
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#07090F] flex flex-col justify-center items-center">
      {/* Discreet Exit to Lobby Button for TV Remote */}
      <button
        onClick={returnToLobby}
        className="absolute top-3 left-4 z-50 flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-black/50 hover:bg-black/80 border border-white/10 text-gray-400 hover:text-white text-xs font-bold transition-all"
        title="Quitter vers le salon"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span className="text-[11px]">Salon (Quitter)</span>
      </button>

      {renderActiveBoard()}
    </div>
  );
};
