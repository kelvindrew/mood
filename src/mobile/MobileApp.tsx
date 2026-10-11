import React, { Suspense } from 'react';
import { useGame } from '../context/GameContext';
import { MobileJoinView } from './views/MobileJoinView';
import { MobileLobbyView } from './views/MobileLobbyView';
import { MobileSpectatorView } from './views/MobileSpectatorView';
import { useWakeLock } from '../hooks/useWakeLock';
import { Loader2 } from 'lucide-react';

// Code-splitting dynamique des contrôleurs mobiles pour un chargement ultra-léger sur smartphone
const LudoController = React.lazy(() => import('./views/controllers/LudoController').then(m => ({ default: m.LudoController })));
const WordController = React.lazy(() => import('./views/controllers/WordController').then(m => ({ default: m.WordController })));
const CardController = React.lazy(() => import('./views/controllers/CardController').then(m => ({ default: m.CardController })));
const QuizController = React.lazy(() => import('./views/controllers/QuizController').then(m => ({ default: m.QuizController })));
const DrawController = React.lazy(() => import('./views/controllers/DrawController').then(m => ({ default: m.DrawController })));
const WerewolfController = React.lazy(() => import('./views/controllers/WerewolfController').then(m => ({ default: m.WerewolfController })));
const BlindTestController = React.lazy(() => import('./views/controllers/BlindTestController').then(m => ({ default: m.BlindTestController })));
const PresidentController = React.lazy(() => import('./views/controllers/PresidentController').then(m => ({ default: m.PresidentController })));
const PokerController = React.lazy(() => import('./views/controllers/PokerController').then(m => ({ default: m.PokerController })));
const BlackjackController = React.lazy(() => import('./views/controllers/BlackjackController').then(m => ({ default: m.BlackjackController })));
const MenteurController = React.lazy(() => import('./views/controllers/MenteurController').then(m => ({ default: m.MenteurController })));
const InterController = React.lazy(() => import('./views/controllers/InterController').then(m => ({ default: m.InterController })));
const FourPicsController = React.lazy(() => import('./views/controllers/FourPicsController').then(m => ({ default: m.FourPicsController })));
const QuickGamesController = React.lazy(() => import('./views/controllers/QuickGamesController').then(m => ({ default: m.QuickGamesController })));
const SpyController = React.lazy(() => import('./views/controllers/SpyController').then(m => ({ default: m.SpyController })));
const PetitBacController = React.lazy(() => import('./views/controllers/PetitBacController').then(m => ({ default: m.PetitBacController })));
const FakeNewsController = React.lazy(() => import('./views/controllers/FakeNewsController').then(m => ({ default: m.FakeNewsController })));
const BombPartyController = React.lazy(() => import('./views/controllers/BombPartyController').then(m => ({ default: m.BombPartyController })));
const NavalBattleController = React.lazy(() => import('./views/controllers/NavalBattleController').then(m => ({ default: m.NavalBattleController })));
const MemeFactoryController = React.lazy(() => import('./views/controllers/MemeFactoryController').then(m => ({ default: m.MemeFactoryController })));
const ConnectFourController = React.lazy(() => import('./views/controllers/ConnectFourController').then(m => ({ default: m.ConnectFourController })));
const WildRushController = React.lazy(() => import('./views/controllers/WildRushController').then(m => ({ default: m.WildRushController })));
const JeuDePaysController = React.lazy(() => import('./views/controllers/JeuDePaysController').then(m => ({ default: m.JeuDePaysController })));

const ControllerLoader: React.FC = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-[#0A120E] text-white p-6 select-none space-y-4">
    <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shadow-lg">
      <Loader2 className="w-7 h-7 text-emerald-400 animate-spin" />
    </div>
    <div className="flex flex-col items-center space-y-1">
      <span className="font-display font-black text-lg uppercase tracking-wide">
        CHARGEMENT DE LA MANETTE
      </span>
      <span className="text-xs text-gray-400">
        Connexion au salon en cours...
      </span>
    </div>
  </div>
);

interface MobileAppProps {
  isSimulatorMode?: boolean;
  defaultRoomCode?: string;
}

export const MobileApp: React.FC<MobileAppProps> = ({ isSimulatorMode = false, defaultRoomCode = '' }) => {
  const { room, mobileView, localPlayer, isAutoReconnecting } = useGame();

  // Empêche l'extinction de l'écran du smartphone pendant la partie
  useWakeLock(Boolean(room && localPlayer));

  if (isAutoReconnecting) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#070D0B] text-white p-6 select-none space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center shadow-2xl animate-pulse">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
        </div>
        <div className="text-center space-y-1">
          <h2 className="text-lg font-black font-display tracking-wider text-white">RECONNEXION À LA PARTIE</h2>
          <p className="text-xs text-slate-400">Restauration automatique de votre session MOOD...</p>
        </div>
      </div>
    );
  }

  if (!room || mobileView === 'join' || !localPlayer) {
    return <MobileJoinView defaultRoomCode={defaultRoomCode} />;
  }

  if (mobileView === 'spectator' || localPlayer.isSpectator) {
    return <MobileSpectatorView />;
  }

  if (mobileView === 'lobby' || room.status === 'lobby') {
    return <MobileLobbyView />;
  }

  const renderActiveController = () => {
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
      case 'quick_games':
        return <QuickGamesController />;
      case 'spy':
        return <SpyController />;
      case 'petit_bac':
        return <PetitBacController />;
      case 'fake_news':
        return <FakeNewsController />;
      case 'bomb_party':
        return <BombPartyController />;
      case 'naval_battle':
        return <NavalBattleController />;
      case 'meme_factory':
        return <MemeFactoryController />;
      case 'connect_four':
        return <ConnectFourController />;
      case 'wild_rush':
        return <WildRushController />;
      case 'jeu_de_pays':
        return <JeuDePaysController />;
      default:
        return <LudoController />;
    }
  };

  return (
    <Suspense fallback={<ControllerLoader />}>
      {renderActiveController()}
    </Suspense>
  );
};
