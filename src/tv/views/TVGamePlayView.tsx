import React, { useEffect, Suspense } from 'react';
import { useGame } from '../../context/GameContext';
import { tvNav } from '../../services/tvNavigation';
import { ArrowLeft, Loader2 } from 'lucide-react';

// Code-splitting dynamique des 15 plateaux TV pour un démarrage instantané de l'accueil
const LudoBoardTV = React.lazy(() => import('../boards/LudoBoardTV').then(m => ({ default: m.LudoBoardTV })));
const WordBoardTV = React.lazy(() => import('../boards/WordBoardTV').then(m => ({ default: m.WordBoardTV })));
const CardBoardTV = React.lazy(() => import('../boards/CardBoardTV').then(m => ({ default: m.CardBoardTV })));
const QuizBoardTV = React.lazy(() => import('../boards/QuizBoardTV').then(m => ({ default: m.QuizBoardTV })));
const DrawBoardTV = React.lazy(() => import('../boards/DrawBoardTV').then(m => ({ default: m.DrawBoardTV })));
const WerewolfBoardTV = React.lazy(() => import('../boards/WerewolfBoardTV').then(m => ({ default: m.WerewolfBoardTV })));
const BlindTestBoardTV = React.lazy(() => import('../boards/BlindTestBoardTV').then(m => ({ default: m.BlindTestBoardTV })));
const PresidentBoardTV = React.lazy(() => import('../boards/PresidentBoardTV').then(m => ({ default: m.PresidentBoardTV })));
const PokerBoardTV = React.lazy(() => import('../boards/PokerBoardTV').then(m => ({ default: m.PokerBoardTV })));
const BlackjackBoardTV = React.lazy(() => import('../boards/BlackjackBoardTV').then(m => ({ default: m.BlackjackBoardTV })));
const MenteurBoardTV = React.lazy(() => import('../boards/MenteurBoardTV').then(m => ({ default: m.MenteurBoardTV })));
const InterBoardTV = React.lazy(() => import('../boards/InterBoardTV').then(m => ({ default: m.InterBoardTV })));
const FourPicsBoardTV = React.lazy(() => import('../boards/FourPicsBoardTV').then(m => ({ default: m.FourPicsBoardTV })));
const MiniRacingBoardTV = React.lazy(() => import('../boards/MiniRacingBoardTV').then(m => ({ default: m.MiniRacingBoardTV })));
const QuickGamesBoardTV = React.lazy(() => import('../boards/QuickGamesBoardTV').then(m => ({ default: m.QuickGamesBoardTV })));

const TVBoardLoader: React.FC<{ gameId: string }> = ({ gameId }) => (
  <div className="flex flex-col items-center justify-center space-y-4 text-center select-none animate-scale-in">
    <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.3)]">
      <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
    </div>
    <div className="flex flex-col space-y-1">
      <span className="font-display font-black text-xl text-white tracking-wide uppercase">
        CHARGEMENT DU JEU
      </span>
      <span className="font-mono text-xs text-emerald-400 font-bold uppercase tracking-widest">
        {gameId}
      </span>
    </div>
  </div>
);

export const TVGamePlayView: React.FC = () => {
  const { room, returnToLobby } = useGame();

  useEffect(() => {
    // Désactiver la navigation spatiale D-Pad globale durant le jeu
    tvNav.setEnabled(false);

    const unregisterBack = tvNav.registerBackHandler(() => {
      returnToLobby();
    });

    return () => {
      unregisterBack();
      tvNav.setEnabled(true);
    };
  }, [returnToLobby]);

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
    <div className="relative w-screen h-screen overflow-hidden bg-[#07090F] flex flex-col justify-center items-center select-none">
      {/* Bouton retour vers le salon */}
      <button
        onClick={returnToLobby}
        className="absolute top-4 left-5 z-50 flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-black/60 hover:bg-black/85 border border-white/15 text-gray-300 hover:text-white text-xs font-bold transition-all shadow-lg active:scale-95"
        title="Quitter vers le salon"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-[11px] uppercase tracking-wider">Salon (Quitter)</span>
      </button>

      <Suspense fallback={<TVBoardLoader gameId={room.gameId} />}>
        {renderActiveBoard()}
      </Suspense>
    </div>
  );
};
