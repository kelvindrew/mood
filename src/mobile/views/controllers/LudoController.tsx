import React, { useEffect, useRef } from 'react';
import { useGame } from '../../../context/GameContext';
import { LudoGameState, LudoPawn, LudoMovableOption } from '../../../types/game';
import { MobileHeader } from '../../components/MobileHeader';
import { ReactionFlinger } from '../../components/ReactionFlinger';
import { triggerHaptic, hapticPatterns } from '../../components/HapticFeedback';
import { audio } from '../../../services/audio';
import { ShakeDetector } from '../../components/MotionControls';
import { Dices, Smartphone, ArrowRight, Shield, Swords, Sparkles, Trophy, Clock } from 'lucide-react';

const COLOR_NAMES: Record<string, { name: string; bg: string; border: string; text: string; dot: string }> = {
  red: { name: 'Rouge', bg: 'bg-red-600', border: 'border-red-500', text: 'text-red-400', dot: 'bg-red-500' },
  green: { name: 'Vert', bg: 'bg-emerald-600', border: 'border-emerald-500', text: 'text-emerald-400', dot: 'bg-emerald-500' },
  yellow: { name: 'Jaune', bg: 'bg-amber-500', border: 'border-amber-500', text: 'text-amber-400', dot: 'bg-amber-500' },
  blue: { name: 'Bleu', bg: 'bg-blue-600', border: 'border-blue-500', text: 'text-blue-400', dot: 'bg-blue-500' },
};

export const LudoController: React.FC = () => {
  const { room, localPlayer, sendGameAction } = useGame();
  const gameState = room?.gameState as LudoGameState | undefined;
  const shakeDetectorRef = useRef<ShakeDetector | null>(null);

  // Find player's assigned color
  // C2 : ces dérivations alimentent le useEffect ci-dessous ; elles tolèrent
  // un état absent (transition room.status='playing' -> premier
  // game_state_update) afin que le hook s'exécute toujours, dans le même ordre.
  const playerIndex = room?.players.findIndex((p) => p.id === localPlayer?.id) ?? 0;
  const defaultColors = ['red', 'green', 'yellow', 'blue'];
  const playerColor: string =
    gameState && localPlayer
      ? gameState.players && gameState.players.includes(localPlayer.color as any)
        ? localPlayer.color
        : gameState.players?.[playerIndex] || defaultColors[playerIndex % 4] || 'red'
      : '';

  const colorCfg = COLOR_NAMES[playerColor] || COLOR_NAMES.red;
  const isMyTurn = !!(gameState && localPlayer && gameState.currentTurnColor === playerColor);
  const myPawns: LudoPawn[] = (gameState && playerColor && gameState.pawns && gameState.pawns[playerColor]) || [];
  const canRoll = isMyTurn && !!gameState?.canRollDice;
  const movablePawns = isMyTurn ? gameState?.movablePawns || [] : [];
  const movableOptions: LudoMovableOption[] = isMyTurn ? gameState?.movableOptions || [] : [];

  const handleRollDice = () => {
    if (!canRoll) return;
    triggerHaptic(hapticPatterns.diceRoll);
    audio.playDiceRoll();
    sendGameAction('ludo_roll_dice');
  };

  // Setup Gyroscopic Shake Detector for physical dice rolling
  // C2 : hook inconditionnel — jamais après l'early-return.
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

  if (!gameState || !localPlayer) return null;

  const handleSelectPawn = (pawnId: number) => {
    if (!isMyTurn || !movablePawns.includes(pawnId)) return;
    triggerHaptic(hapticPatterns.tap);
    audio.playSelect();
    sendGameAction('ludo_move_pawn', { pawnId });
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-background text-white select-none">
      <MobileHeader />

      <main className="p-4 flex-1 flex flex-col justify-between space-y-3.5">
        {/* Player Identity Banner */}
        <div className={`p-3 rounded-2xl border-2 flex items-center justify-between bg-surface-card ${colorCfg.border}`}>
          <div className="flex items-center space-x-2.5">
            <div className={`w-4 h-4 rounded-full ${colorCfg.dot} shadow-md`} />
            <span className="text-xs font-black text-white uppercase">
              VOUS ÊTES : <strong className={colorCfg.text}>{colorCfg.name.toUpperCase()}</strong>
            </span>
          </div>
          <span className="text-[11px] font-bold text-gray-400">
            {localPlayer.name}
          </span>
        </div>

        {/* Turn Status Alert Banner */}
        <div
          className={`p-3.5 rounded-2xl text-center border-2 transition-all ${
            isMyTurn
              ? 'bg-brand-red/25 border-brand-red shadow-glow-red scale-105 animate-pulse'
              : 'bg-surface-card border-white/10 text-gray-400'
          }`}
        >
          <span className="text-[10px] font-black uppercase tracking-widest block">
            {isMyTurn ? '🚨 C’EST À VOTRE TOUR !' : `TOUR DE : ${(COLOR_NAMES[gameState.currentTurnColor]?.name || gameState.currentTurnColor).toUpperCase()}`}
          </span>
          <h2 className="text-lg font-black font-display text-white mt-0.5">
            {isMyTurn
              ? (canRoll ? 'Lancez le Dé (Bouton ou Secouez !)' : 'Choisissez votre Pion')
              : 'En attente du joueur actif sur la TV'}
          </h2>
        </div>

        {/* Big Interactive Dice Roller Button */}
        {canRoll ? (
          <div className="my-auto flex flex-col items-center space-y-3">
            <button
              onClick={handleRollDice}
              className="w-48 h-48 rounded-3xl bg-gradient-to-tr from-brand-red to-brand-accent border-4 border-white shadow-glow-red active:scale-95 transition-all flex flex-col items-center justify-center space-y-2 group"
            >
              <Dices className="w-18 h-18 text-white group-hover:rotate-180 transition-transform duration-500" />
              <span className="font-display font-black text-2xl text-white tracking-wider">
                LANCER LE DÉ
              </span>
            </button>

            <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-brand-gold/20 text-brand-gold text-xs font-bold border border-brand-gold/30">
              <Smartphone className="w-4 h-4 animate-bounce" />
              <span>Astuce : Secouez votre téléphone !</span>
            </div>
          </div>
        ) : isMyTurn && gameState.diceValue ? (
          /* Dice Result & Movable Pawns Grid */
          <div className="space-y-3 my-auto">
            <div className="flex items-center justify-center space-x-3 p-3 rounded-2xl bg-surface-card border border-white/10">
              <span className="text-xs font-bold text-gray-400">Score de votre dé :</span>
              <div className="w-12 h-12 rounded-xl bg-white text-gray-900 flex items-center justify-center font-display font-black text-3xl shadow-glow-gold border-2 border-amber-300">
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
                  const option = movableOptions.find((o) => o.pawnId === pawn.id);

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
                        <div
                          className={`w-9 h-9 rounded-xl font-display font-black text-base flex items-center justify-center ${
                            isMovable ? 'bg-emerald-500 text-white' : 'bg-surface-light text-gray-500'
                          }`}
                        >
                          #{pawn.id + 1}
                        </div>
                        <div>
                          <div className="font-black text-sm text-white">
                            Pion #{pawn.id + 1}
                          </div>
                          <div className="text-xs text-gray-400 font-semibold">
                            {option ? (
                              option.isExitingHome ? (
                                <span className="text-brand-gold font-bold">Sortir de la base ➔ Case de départ</span>
                              ) : option.isWinning ? (
                                <span className="text-brand-gold flex items-center space-x-1 font-bold">
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
          /* Waiting / Overview of Player's 4 Pawns */
          <div className="space-y-3 my-auto">
            <div className="p-4 rounded-2xl bg-surface-card border border-white/10 text-center space-y-1">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">ÉTAT DE VOS PIONS</span>
              <div className="grid grid-cols-2 gap-2 pt-2">
                {myPawns.map((pawn) => (
                  <div key={pawn.id} className="p-2.5 rounded-xl bg-surface-dark border border-white/5 flex items-center justify-between">
                    <span className="text-xs font-black text-white">Pion #{pawn.id + 1}</span>
                    <span className="text-[11px] font-bold text-brand-gold">
                      {pawn.isFinished ? '🏆 Gagné' : pawn.isHome ? 'En Base' : pawn.position >= 100 ? `Allée ${pawn.position - 99}` : `Case ${pawn.position}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <ReactionFlinger />
      </main>
    </div>
  );
};
