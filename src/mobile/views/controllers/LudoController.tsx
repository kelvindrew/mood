import React, { useEffect, useRef } from 'react';
import { useGame } from '../../../context/GameContext';
import { LudoGameState, LudoPawn, LudoMovableOption } from '../../../types/game';
import { MobileHeader } from '../../components/MobileHeader';
import { ReactionFlinger } from '../../components/ReactionFlinger';
import { triggerHaptic, hapticPatterns } from '../../components/HapticFeedback';
import { audio } from '../../../services/audio';
import { ShakeDetector } from '../../components/MotionControls';
import { Dices, Smartphone, ArrowRight, Shield, Swords, Sparkles, Trophy, Clock, Box, Play, CheckCircle2 } from 'lucide-react';

const COLOR_NAMES: Record<string, { name: string; bg: string; border: string; text: string; dot: string; glow: string }> = {
  red: { name: 'Rouge', bg: 'bg-red-600', border: 'border-red-500', text: 'text-red-400', dot: 'bg-red-500', glow: 'shadow-[0_0_25px_rgba(239,68,68,0.5)]' },
  green: { name: 'Vert', bg: 'bg-emerald-600', border: 'border-emerald-500', text: 'text-emerald-400', dot: 'bg-emerald-500', glow: 'shadow-[0_0_25px_rgba(16,185,129,0.5)]' },
  yellow: { name: 'Jaune', bg: 'bg-amber-500', border: 'border-amber-500', text: 'text-amber-400', dot: 'bg-amber-500', glow: 'shadow-[0_0_25px_rgba(245,158,11,0.5)]' },
  blue: { name: 'Bleu', bg: 'bg-blue-600', border: 'border-blue-500', text: 'text-blue-400', dot: 'bg-blue-500', glow: 'shadow-[0_0_25px_rgba(59,130,246,0.5)]' },
};

export const LudoController: React.FC = () => {
  const { room, localPlayer, sendGameAction } = useGame();
  const gameState = room?.gameState as LudoGameState | undefined;
  const shakeDetectorRef = useRef<ShakeDetector | null>(null);

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

  const is3D = gameState.viewMode3D ?? true;

  return (
    <div className="min-h-screen flex flex-col justify-between bg-neutral-950 text-white select-none">
      <MobileHeader />

      <main className="p-4 flex-1 flex flex-col justify-between space-y-3">
        {/* Top Controls: Identity + TV 3D/2D View Toggle */}
        <div className="flex items-center justify-between gap-2">
          {/* Player Identity Pill */}
          <div className={`flex-1 p-2.5 rounded-2xl border-2 flex items-center space-x-2.5 bg-neutral-900 ${colorCfg.border}`}>
            <div className={`w-3.5 h-3.5 rounded-full ${colorCfg.dot} shadow-md shrink-0`} />
            <div className="truncate text-xs font-black uppercase text-white">
              <span className="text-gray-400 font-semibold">VOUS : </span>
              <strong className={colorCfg.text}>{colorCfg.name.toUpperCase()}</strong>
            </div>
          </div>

          {/* TV 3D/2D Toggle Button */}
          <button
            onClick={() => {
              triggerHaptic(hapticPatterns.tap);
              audio.playSelect();
              sendGameAction('ludo_toggle_3d', { enabled: !is3D });
            }}
            className={`flex items-center space-x-1.5 px-3 py-2.5 rounded-2xl text-xs font-black transition-all border shrink-0 ${
              is3D
                ? 'bg-amber-400 text-neutral-950 border-amber-300 shadow-md font-black'
                : 'bg-white/10 text-white border-white/20'
            }`}
            title="Basculer l'affichage 3D sur l'écran TV"
          >
            <Box className="w-3.5 h-3.5" />
            <span>{is3D ? 'TV en 3D' : 'TV en 2D'}</span>
          </button>
        </div>

        {/* Turn Status Alert Banner */}
        <div
          className={`p-3.5 rounded-2xl text-center border-2 transition-all ${
            isMyTurn
              ? 'bg-gradient-to-r from-red-600/30 via-red-500/20 to-amber-500/30 border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.4)] scale-102 animate-pulse'
              : 'bg-neutral-900 border-white/10 text-gray-400'
          }`}
        >
          <span className="text-[11px] font-black uppercase tracking-widest block text-amber-300">
            {isMyTurn ? '🚨 C’EST À VOTRE TOUR !' : `TOUR DE : ${(COLOR_NAMES[gameState.currentTurnColor]?.name || gameState.currentTurnColor).toUpperCase()}`}
          </span>
          <h2 className="text-base sm:text-lg font-black font-display text-white mt-0.5">
            {isMyTurn
              ? (canRoll ? 'Lancez le Dé (Bouton ou Secouez !)' : 'Touchez un pion pour le déplacer')
              : 'En attente du joueur actif sur la TV'}
          </h2>
        </div>

        {/* ── GRANDE ZONE DE JOUABILITÉ OPTIMISÉE ── */}
        {canRoll ? (
          /* ÉTAT 1 : GRAND BOUTON DE LANCER DE DÉ TACTILE */
          <div className="flex-1 flex flex-col items-center justify-center space-y-4 py-2">
            <button
              onClick={handleRollDice}
              className={`w-64 h-64 sm:w-72 sm:h-72 rounded-3xl bg-gradient-to-tr from-rose-600 via-red-500 to-amber-500 border-4 border-white shadow-[0_15px_40px_rgba(239,68,68,0.5)] active:scale-95 transition-all flex flex-col items-center justify-center space-y-3 group cursor-pointer ${colorCfg.glow}`}
            >
              <div className="w-24 h-24 rounded-2xl bg-white/20 border-2 border-white/40 flex items-center justify-center shadow-inner group-hover:rotate-12 transition-transform duration-300">
                <Dices className="w-16 h-16 text-white drop-shadow-md animate-pulse" />
              </div>
              <div className="text-center">
                <span className="font-display font-black text-2xl sm:text-3xl text-white tracking-wider block drop-shadow">
                  LANCER LE DÉ
                </span>
                <span className="text-xs text-amber-200 font-bold uppercase tracking-widest mt-1 block">
                  Touchez ou secouez le téléphone
                </span>
              </div>
            </button>

            <div className="flex items-center space-x-2 px-4 py-2 rounded-full bg-amber-400/15 text-amber-300 text-xs font-bold border border-amber-400/30 shadow-sm">
              <Smartphone className="w-4 h-4 animate-bounce text-amber-400" />
              <span>Accéléromètre actif : secouez pour lancer !</span>
            </div>
          </div>
        ) : isMyTurn && gameState.diceValue ? (
          /* ÉTAT 2 : GRANDS BOUTONS TACTILES POUR DÉPLACER LES PIONS */
          <div className="flex-1 flex flex-col justify-between space-y-3 py-1">
            {/* Header Score de Dé */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 border-2 border-amber-400/40 shadow-lg">
              <div className="flex items-center space-x-2">
                <Dices className="w-5 h-5 text-amber-400" />
                <span className="text-xs font-black uppercase text-slate-200 tracking-wider">Score obtenu :</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-12 h-12 rounded-xl bg-white text-neutral-950 flex items-center justify-center font-display font-black text-3xl shadow-[0_0_20px_rgba(255,255,255,0.6)] border-2 border-amber-300">
                  {gameState.diceValue}
                </div>
                {gameState.diceValue === 6 && (
                  <span className="px-2 py-1 rounded-lg bg-amber-400 text-neutral-950 text-[10px] font-black uppercase shadow-md animate-bounce">
                    ★ REJOUER !
                  </span>
                )}
              </div>
            </div>

            {/* Instruction de sélection */}
            <div className="text-center">
              <span className="text-xs font-black text-emerald-400 uppercase tracking-wider">
                {movablePawns.length > 0 ? '👇 CHOISISSEZ VOTRE PION À DÉPLACER :' : 'AUCUN MOUVEMENT POSSIBLE'}
              </span>
            </div>

            {/* Grille des Pions en Grands Formats Tactiles */}
            <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[50vh] pr-0.5">
              {myPawns.map((pawn: LudoPawn) => {
                const isMovable = movablePawns.includes(pawn.id);
                const option = movableOptions.find((o) => o.pawnId === pawn.id);

                return (
                  <button
                    key={pawn.id}
                    disabled={!isMovable}
                    onClick={() => handleSelectPawn(pawn.id)}
                    className={`w-full min-h-[85px] p-4 rounded-3xl border-2 text-left transition-all flex items-center justify-between shadow-lg cursor-pointer ${
                      isMovable
                        ? 'bg-gradient-to-r from-emerald-950/90 via-emerald-900/60 to-neutral-900 border-emerald-400 text-white shadow-[0_0_25px_rgba(16,185,129,0.4)] scale-102 active:scale-95 ring-2 ring-emerald-400/50'
                        : 'bg-neutral-900/60 border-white/5 text-gray-500 opacity-40 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center space-x-3.5">
                      {/* Avatar Pion Grand Format */}
                      <div
                        className={`w-13 h-13 rounded-2xl font-display font-black text-xl flex items-center justify-center shadow-md shrink-0 ${
                          isMovable
                            ? 'bg-emerald-500 text-white border-2 border-emerald-300'
                            : 'bg-neutral-800 text-gray-500 border border-white/10'
                        }`}
                      >
                        #{pawn.id + 1}
                      </div>

                      {/* Détails du Mouvement */}
                      <div className="space-y-0.5">
                        <div className="font-black text-base text-white flex items-center space-x-2">
                          <span>Pion #{pawn.id + 1}</span>
                          {isMovable && (
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-400 text-neutral-950">
                              Prêt à bouger
                            </span>
                          )}
                        </div>

                        <div className="text-xs font-bold">
                          {option ? (
                            option.isExitingHome ? (
                              <span className="text-amber-300 flex items-center space-x-1 font-black text-xs">
                                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                                <span>Sortir de la base ➔ Case de départ</span>
                              </span>
                            ) : option.isWinning ? (
                              <span className="text-amber-300 flex items-center space-x-1 font-black text-xs">
                                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                                <span>Arrive au centre ! (Victoire)</span>
                              </span>
                            ) : (
                              <span className="flex items-center space-x-1.5 text-slate-200">
                                <span className="text-gray-400">Case {option.fromPosition}</span>
                                <ArrowRight className="w-3.5 h-3.5 text-emerald-400 font-bold" />
                                <span className="text-white font-black text-sm bg-white/10 px-2 py-0.5 rounded-md">
                                  Case {option.targetPosition}
                                </span>
                              </span>
                            )
                          ) : pawn.isFinished ? (
                            <span className="text-amber-400 font-bold">🏆 Arrivé au centre</span>
                          ) : (
                            <span className="text-gray-500 font-medium">En base de repos</span>
                          )}
                        </div>

                        {option?.willCapture && (
                          <div className="pt-1">
                            <span className="px-2 py-0.5 rounded-md bg-rose-600 text-white text-[10px] font-black uppercase flex items-center space-x-1 shadow-md w-fit animate-pulse">
                              <Swords className="w-3 h-3" />
                              <span>Capture un adversaire (+ Rejouer) !</span>
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Button Indicator */}
                    {isMovable && (
                      <div className="shrink-0 pl-2">
                        <div className="px-3.5 py-2 rounded-xl bg-emerald-400 text-neutral-950 font-black text-xs uppercase shadow-md flex items-center space-x-1 hover:bg-emerald-300">
                          <span>DÉPLACER</span>
                          <Play className="w-3.5 h-3.5 fill-neutral-950" />
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          /* ÉTAT 3 : EN ATTENTE / VUE D'ENSEMBLE DES 4 PIONS */
          <div className="space-y-3 my-auto">
            <div className="p-4 rounded-3xl bg-neutral-900 border border-white/10 text-center space-y-2">
              <span className="text-xs font-black text-gray-400 uppercase tracking-wider block">
                VOS 4 PIONS EN JEU
              </span>

              <div className="grid grid-cols-2 gap-2.5 pt-1">
                {myPawns.map((pawn) => (
                  <div
                    key={pawn.id}
                    className="p-3 rounded-2xl bg-neutral-800/80 border border-white/10 flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-2">
                      <div className={`w-6 h-6 rounded-lg ${colorCfg.bg} text-white font-black text-xs flex items-center justify-center`}>
                        #{pawn.id + 1}
                      </div>
                      <span className="text-xs font-bold text-white">Pion {pawn.id + 1}</span>
                    </div>
                    <span className="text-[11px] font-black text-amber-400">
                      {pawn.isFinished
                        ? '🏆 Gagné'
                        : pawn.isHome
                        ? 'En Base'
                        : pawn.position >= 100
                        ? `Allée ${pawn.position - 99}`
                        : `Case ${pawn.position}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-center text-xs text-gray-400">
              Regardez l'écran TV pendant le tour de l'adversaire
            </div>
          </div>
        )}

        <ReactionFlinger />
      </main>
    </div>
  );
};
