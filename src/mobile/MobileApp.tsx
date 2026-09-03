import React from 'react';
import { useGame } from '../context/GameContext';
import { MobileJoinView } from './views/MobileJoinView';
import { MobileLobbyView } from './views/MobileLobbyView';
import { MobileSpectatorView } from './views/MobileSpectatorView';
import { LudoController } from './views/controllers/LudoController';
import { WordController } from './views/controllers/WordController';
import { CardController } from './views/controllers/CardController';
import { QuizController } from './views/controllers/QuizController';
import { DrawController } from './views/controllers/DrawController';
import { WerewolfController } from './views/controllers/WerewolfController';
import { BlindTestController } from './views/controllers/BlindTestController';
import { PresidentController } from './views/controllers/PresidentController';
import { PokerController } from './views/controllers/PokerController';
import { BlackjackController } from './views/controllers/BlackjackController';
import { MenteurController } from './views/controllers/MenteurController';
import { InterController } from './views/controllers/InterController';
import { FourPicsController } from './views/controllers/FourPicsController';
import { MiniRacingController } from './views/controllers/MiniRacingController';
import { QuickGamesController } from './views/controllers/QuickGamesController';
import { useWakeLock } from '../hooks/useWakeLock';

interface MobileAppProps {
  isSimulatorMode?: boolean;
  defaultRoomCode?: string;
}

export const MobileApp: React.FC<MobileAppProps> = ({ isSimulatorMode = false, defaultRoomCode = '' }) => {
  const { room, mobileView, localPlayer } = useGame();

  // Prevent smartphone screen from going to sleep while connected in a room
  useWakeLock(Boolean(room && localPlayer));

  if (!room || mobileView === 'join' || !localPlayer) {
    return <MobileJoinView defaultRoomCode={defaultRoomCode} />;
  }

  if (mobileView === 'spectator' || localPlayer.isSpectator) {
    return <MobileSpectatorView />;
  }

  if (mobileView === 'lobby' || room.status === 'lobby') {
    return <MobileLobbyView />;
  }

  // Active game controllers across all games
  switch (room.gameId) {
    case 'ludo':
      return <LudoController />;
    case 'scrabble':
      return <WordController />;
    case 'card_party':
      return <CardController />;
    case 'quiz':
      return <QuizController />;
    case 'draw_and_guess':
      return <DrawController />;
    case 'werewolf':
      return <WerewolfController />;
    case 'blind_test':
      return <BlindTestController />;
    case 'president':
      return <PresidentController />;
    case 'poker':
      return <PokerController />;
    case 'blackjack':
      return <BlackjackController />;
    case 'menteur':
      return <MenteurController />;
    case 'inter':
      return <InterController />;
    case 'four_pics':
      return <FourPicsController />;
    case 'mini_racing':
      return <MiniRacingController />;
    case 'quick_games':
      return <QuickGamesController />;
    default:
      return <LudoController />;
  }
};
