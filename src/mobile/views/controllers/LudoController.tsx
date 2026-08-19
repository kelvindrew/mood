import React, { useEffect, useRef } from 'react';
import { useGame } from '../../../context/GameContext';
import { LudoGameState, LudoPawn, LudoMovableOption } from '../../../types/game';
import { MobileHeader } from '../../components/MobileHeader';
import { ReactionFlinger } from '../../components/ReactionFlinger';
import { triggerHaptic, hapticPatterns } from '../../components/HapticFeedback';
import { audio } from '../../../services/audio';
import { ShakeDetector } from '../../components/MotionControls';
import { Dices, Smartphone, ArrowRight, Shield, Swords, Sparkles } from 'lucide-react';

export const LudoController: React.FC = () => {
  const { room, localPlayer, sendGameAction } = useGame();
  const gameState = room?.gameState as LudoGameState | undefined;
  const shakeDetectorRef = useRef<ShakeDetector | null>(null);

  if (!gameState || !localPlayer) return null;

  const isMyTurn = gameState.currentTurnColor === localPlayer.color;
  const myPawns: LudoPawn[] = (gameState.pawns && gameState.pawns[localPlayer.color]) || [];
  const canRoll = isMyTurn && gameState.canRollDice;
  const movablePawns = isMyTurn ? gameState.movablePawns || [] : [];
  const movableOptions: LudoMovableOption[] = isMyTurn ? gameState.movableOptions || [] : [];

  const handleRollDice = () => {
    if (!canRoll) return;
    triggerHaptic(hapticPatterns.diceRoll);
    audio.playDiceRoll();
    sendGameAction('ludo_roll_dice');
  };

  // Setup Gyroscopic Shake Detector for physical dice rolling
  useEffect(() => {
    shakeDetectorRef.current = new ShakeDetector(() => {
      if (canRoll) {
        handleRollDice();
      }
    }, 15);
    shakeDetectorRef.current.start();

    return () => {
      shakeDetectorRef.current?.stop();
    };
  }, [canRoll]);

  const handleSelectPawn = (pawnId: number) => {
    if (!isMyTurn || !movablePawns.includes(pawnId)) return;
    triggerHaptic(hapticPatterns.tap);
    audio.playSelect();
    sendGameAction('ludo_move_pawn', { pawnId });
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-background text-white select-none">
      <MobileHeader />

      <main className="p-4 flex-1 flex flex-col justify-between space-y-4">
        {/* Turn Status Alert Banner */}
        <div
          className={`p-3.5 rounded-2xl text-center border-2 transition-all ${
            isMyTurn
              ? 'bg-brand-red/20 border-brand-red shadow-glow-red scale-105 animate-pulse'
              : 'bg-surface-card border-white/10 text-gray-400'
          }`}
        >
          <span className="text-[10px] font-black uppercase tracking-widest block">
            {isMyTurn ? '🚨 C’EST À VOUS DE JOUER !' : `TOUR DE ${gameState.currentTurnColor.toUpperCase()}`}
          </span>
          <h2 className="text-lg font-black font-display text-white mt-0.5">
            {isMyTurn ? (canRoll ? 'Lancez le Dé (Bouton ou Secouez !)' : 'Choisissez votre Pion') : 'Regardez la TV'}
          </h2>
        </div>

        {/* Big Dice Roller Button with Motion Controls Hint */}
        {canRoll ? (
          <div className="my-auto flex flex-col items-center space-y-3">
            <button
              onClick={handleRollDice}
              className="w-44 h-44 rounded-3xl bg-gradient-to-tr from-brand-red to-brand-accent border-4 border-white shadow-glow-red hover:scale-105 active:scale-95 transition-all flex flex-col items-center justify-center space-y-2 group"
            >
              <Dices className="w-16 h-16 text-white group-hover:rotate-180 transition-transform duration-500" />
              <span className="font-display font-black text-xl text-white tracking-wider">
                LANCER LE DÉ
              </span>
            </button>

            {/* Shake Phone Hint */}
            <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-brand-gold/20 text-brand-gold text-xs font-bold border border-brand-gold/30">
              <Smartphone className="w-4 h-4 animate-bounce" />
              <span>Astuce : Secouez votre téléphone !</span>
            </div>
          </div>
        ) : gameState.diceValue && isMyTurn ? (
          /* Dice Result & Pawn Selection Grid with Destination Preview */
          <div className="space-y-3 my-auto">
            <div className="flex items-center justify-center space-x-3 p-3 rounded-2xl bg-surface-card border border-white/10">
              <span className="text-xs font-bold text-gray-400">Score de votre dé :</span>
              <div className="w-11 h-11 rounded-xl bg-white text-background flex items-center justify-center font-display font-black text-2xl shadow-glow-red">
                {gameState.diceValue}
              </div>
            </div>

            <div>
              <span className="text-xs font-black text-gray-300 uppercase tracking-wider block mb-2 text-center">
                {movablePawns.length > 0 ? 'Touchez un pion pour le déplacer' : 'Aucun mouvement possible'}
              </span>

              <div className="grid grid-cols-1 gap-2.5">
                {myPawns.map((pawn: LudoPawn) => {
                  const isMovable = movablePawns.includes(pawn.id);
                  const option = movableOptions.find(o => o.pawnId === pawn.id);

                  return (
                    <button
                      key={pawn.id}
                      disabled={!isMovable}
                      onClick={() => handleSelectPawn(pawn.id)}
                      className={`p-3.5 rounded-2xl border-2 text-left transition-all flex items-center justify-between ${
                        isMovable
                          ? 'bg-emerald-950/70 border-emerald-400 text-white shadow-glow-emerald scale-105 active:scale-95'
                          : 'bg-surface-card border-white/10 text-gray-500 opacity-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-9 h-9 rounded-xl font-display font-black text-base flex items-center justify-center ${isMovable ? 'bg-emerald-500 text-white' : 'bg-surface-light text-gray-500'}`}>
                          #{pawn.id + 1}
                        </div>
                        <div>
                          <div className="font-black text-sm text-white">
                            Pion #{pawn.id + 1}
                          </div>
                          <div className="text-xs text-gray-400 font-semibold">
                            {option ? (
                              option.isExitingHome ? (
                                <span className="text-brand-gold">Sortir de la base ➔ Case de départ</span>
                              ) : option.isWinning ? (
                                <span className="text-brand-gold flex items-center space-x-1">
                                  <Sparkles className="w-3 h-3" />
                                  <span>Arrive au centre ! (Victoire)</span>
                                </span>
                              ) : (
                                <span className="flex items-center space-x-1">
                                  <span>Case {option.fromPosition}</span>
                                  <ArrowRight className="w-3 h-3" />
                                  <span className="text-white font-bold">Case {option.targetPosition}</span>
                                </span>
                              )
                            ) : pawn.isFinished ? (
                              '🎉 Arrivé au centre'
                            ) : (
                              'En base'
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Capture or Action Badge */}
                      {option?.willCapture && (
                        <span className="px-2 py-1 rounded-lg bg-rose-600 text-white text-[10px] font-black uppercase flex items-center space-x-1 animate-bounce">
                          <Swords className="w-3 h-3" />
                          <span>Capture !</span>
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="my-auto p-6 rounded-3xl bg-surface-card/60 border border-white/10 text-center space-y-2">
            <div className="text-4xl animate-bounce">🎲</div>
            <h3 className="text-sm font-bold text-white">Action en cours sur la TV</h3>
            <p className="text-[11px] text-gray-400">
              Préparez votre stratégie pour votre prochain tour !
            </p>
          </div>
        )}

        <ReactionFlinger />
      </main>
    </div>
  );
};
