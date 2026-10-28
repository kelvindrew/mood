import React, { useEffect, useRef } from 'react';
import { useGame } from '../../../context/GameContext';
import { LudoGameState, LudoPawn, LudoMovableOption } from '../../../types/game';
import { MobileHeader } from '../../components/MobileHeader';
import { ReactionFlinger } from '../../components/ReactionFlinger';
import { triggerHaptic, hapticPatterns } from '../../components/HapticFeedback';
import { audio } from '../../../services/audio';
import { ShakeDetector } from '../../components/MotionControls';
import { Dices, Smartphone, ArrowRight, Shield, Swords, Sparkles, Trophy, Box, Play, AlertCircle, Clock } from 'lucide-react';

const COLOR_NAMES: Record<string, { name: string; bg: string; border: string; text: string; dot: string; glow: string; ring: string }> = {
  red: { name: 'Rouge', bg: 'bg-red-600', border: 'border-red-500', text: 'text-red-400', dot: 'bg-red-500', glow: 'shadow-[0_0_30px_rgba(239,68,68,0.55)]', ring: 'ring-red-500' },
  green: { name: 'Vert', bg: 'bg-emerald-600', border: 'border-emerald-500', text: 'text-emerald-400', dot: 'bg-emerald-500', glow: 'shadow-[0_0_30px_rgba(16,185,129,0.55)]', ring: 'ring-emerald-500' },
  yellow: { name: 'Jaune', bg: 'bg-amber-500', border: 'border-amber-500', text: 'text-amber-400', dot: 'bg-amber-500', glow: 'shadow-[0_0_30px_rgba(245,158,11,0.55)]', ring: 'ring-amber-500' },
  blue: { name: 'Bleu', bg: 'bg-blue-600', border: 'border-blue-500', text: 'text-blue-400', dot: 'bg-blue-500', glow: 'shadow-[0_0_30px_rgba(59,130,246,0.55)]', ring: 'ring-blue-500' },
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

  // Separate movable pawns from blocked pawns to maximize playable space
  const movablePawnsList = myPawns.filter((p) => movablePawns.includes(p.id));
  const blockedPawnsList = myPawns.filter((p) => !movablePawns.includes(p.id));

  return (
    <div className="h-[100dvh] w-full flex flex-col bg-neutral-950 text-white select-none overflow-hidden">
      <MobileHeader />

      <main className="flex-1 w-full flex flex-col justify-between p-3 overflow-hidden gap-2">
        {/* ── BARRE D'IDENTITÉ & BASCULE TV 3D/2D COMPACTE ── */}
        <div className="flex items-center justify-between gap-2 shrink-0">
          {/* Identity Pill */}
          <div className={`flex-1 px-3 py-2 rounded-2xl border-2 flex items-center space-x-2 bg-neutral-900 ${colorCfg.border}`}>
            <div className={`w-3.5 h-3.5 rounded-full ${colorCfg.dot} shadow-md shrink-0 animate-pulse`} />
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
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-2xl text-xs font-black transition-all border shrink-0 cursor-pointer active:scale-95 ${
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

        {/* ── BANNIÈRE D'ÉTAT DU TOUR (SLIM) ── */}
        <div
          className={`px-3 py-2 rounded-2xl text-center border transition-all shrink-0 ${
            isMyTurn
              ? 'bg-gradient-to-r from-red-600/30 via-red-500/20 to-amber-500/30 border-red-500 shadow-[0_0_25px_rgba(239,68,68,0.35)]'
              : 'bg-neutral-900 border-white/10 text-gray-400'
          }`}
        >
          <div className="flex items-center justify-center space-x-2">
            <span className="text-[11px] font-black uppercase tracking-widest text-amber-300">
              {isMyTurn ? '🚨 C’EST À VOTRE TOUR !' : `TOUR DE : ${(COLOR_NAMES[gameState.currentTurnColor]?.name || gameState.currentTurnColor).toUpperCase()}`}
            </span>
            <span className="text-xs font-mono font-bold text-amber-300">
              ({gameState.turnTimeLeft}s)
            </span>
          </div>
        </div>

        {/* ── ZONE DE JOUABILITÉ PLEIN ÉCRAN (100% DU VIEWPORT DISPONIBLE) ── */}
        {canRoll ? (
          /* =========================================================================
             ÉTAT 1 : LE BOUTON DE LANCER DE DÉ OCCUPE TOUT L'ÉCRAN
             ========================================================================= */
          <div className="flex-1 w-full flex flex-col justify-stretch py-1 gap-2 overflow-hidden">
            <button
              onClick={handleRollDice}
              className={`w-full flex-1 rounded-3xl bg-gradient-to-tr from-rose-600 via-red-500 to-amber-500 border-4 border-white shadow-[0_15px_45px_rgba(239,68,68,0.55)] active:scale-[0.98] transition-all flex flex-col items-center justify-center p-6 relative overflow-hidden group cursor-pointer ${colorCfg.glow}`}
            >
              {/* Animated Glow Rings in Background */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-white/20 pointer-events-none" />
              <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 via-red-500 to-rose-600 rounded-3xl blur-2xl opacity-40 group-hover:opacity-60 transition duration-500 pointer-events-none animate-pulse" />

              {/* Big Animated 3D Dice Display */}
              <div className="relative z-10 w-28 h-28 sm:w-36 sm:h-36 rounded-3xl bg-white/25 border-4 border-white flex items-center justify-center shadow-[inset_0_4px_20px_rgba(255,255,255,0.4)] group-hover:rotate-6 group-active:scale-95 transition-transform duration-300">
                <Dices className="w-18 h-18 sm:w-24 sm:h-24 text-white drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)] animate-pulse" />
              </div>

              {/* Main Call-to-Action Text */}
              <div className="relative z-10 text-center mt-5 space-y-1">
                <span className="font-display font-black text-3xl sm:text-4xl text-white tracking-wider block drop-shadow-[0_4px_10px_rgba(0,0,0,0.6)]">
                  LANCER LE DÉ
                </span>
                <span className="text-xs sm:text-sm text-amber-100 font-bold uppercase tracking-widest block bg-black/25 px-4 py-1.5 rounded-full border border-white/20 mt-2">
                  Touchez n'importe où sur l'écran
                </span>
              </div>

              {/* Gyroscopic Shake Detection Pill */}
              <div className="relative z-10 flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/20 text-white text-xs font-bold border border-white/30 shadow-sm mt-4">
                <Smartphone className="w-4 h-4 animate-bounce text-amber-300" />
                <span>Ou secouez votre téléphone 📱</span>
              </div>
            </button>
          </div>
        ) : isMyTurn && gameState.diceValue ? (
          /* =========================================================================
             ÉTAT 2 : SÉLECTION DES PIONS - OCCUPE TOUT L'ÉCRAN SANS SCROLL CONTRAINT
             ========================================================================= */
          <div className="flex-1 w-full flex flex-col justify-stretch gap-2 py-1 overflow-hidden">
            {/* Header Score de Dé Obtenu */}
            <div className="flex items-center justify-between px-4 py-2.5 rounded-2xl bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 border-2 border-amber-400/40 shadow-lg shrink-0">
              <div className="flex items-center space-x-2">
                <Dices className="w-5 h-5 text-amber-400" />
                <span className="text-xs font-black uppercase text-slate-200 tracking-wider">
                  Score obtenu :
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-11 h-11 rounded-xl bg-white text-neutral-950 flex items-center justify-center font-display font-black text-2xl shadow-[0_0_20px_rgba(255,255,255,0.7)] border-2 border-amber-300">
                  {gameState.diceValue}
                </div>
                {gameState.diceValue === 6 && (
                  <span className="px-2.5 py-1 rounded-lg bg-amber-400 text-neutral-950 text-[10px] font-black uppercase shadow-md animate-bounce">
                    ★ REJOUER !
                  </span>
                )}
              </div>
            </div>

            {/* Instruction de Sélection */}
            <div className="text-center shrink-0">
              <span className="text-xs font-black text-emerald-400 uppercase tracking-wider">
                {movablePawnsList.length > 0
                  ? '👇 TOUCHEZ UN PION POUR LE DÉPLACER :'
                  : 'AUCUN MOUVEMENT POSSIBLE'}
              </span>
            </div>

            {/* Les Pions Jouables occupent 100% de la hauteur disponible de l'écran */}
            {movablePawnsList.length > 0 ? (
              <div className="flex-1 w-full flex flex-col justify-stretch gap-2.5 overflow-y-auto">
                {movablePawnsList.map((pawn) => {
                  const option = movableOptions.find((o) => o.pawnId === pawn.id);

                  return (
                    <button
                      key={pawn.id}
                      onClick={() => handleSelectPawn(pawn.id)}
                      className="w-full flex-1 min-h-[90px] p-4 rounded-3xl border-3 border-emerald-400 bg-gradient-to-r from-emerald-950/95 via-emerald-900/80 to-neutral-900 text-left transition-all flex items-center justify-between shadow-[0_8px_30px_rgba(16,185,129,0.4)] active:scale-[0.98] ring-4 ring-emerald-400/40 cursor-pointer group"
                    >
                      <div className="flex items-center space-x-4">
                        {/* Avatar Grand Format */}
                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-emerald-500 border-2 border-white text-white font-display font-black text-2xl sm:text-3xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform shrink-0">
                          #{pawn.id + 1}
                        </div>

                        {/* Détails du Mouvement en grand format */}
                        <div className="space-y-1">
                          <div className="font-black text-base sm:text-lg text-white flex items-center space-x-2">
                            <span>Pion #{pawn.id + 1}</span>
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-400 text-neutral-950 shadow-sm">
                              Jouable
                            </span>
                          </div>

                          <div className="text-xs sm:text-sm font-bold">
                            {option ? (
                              option.isExitingHome ? (
                                <span className="text-amber-300 flex items-center space-x-1.5 font-black text-sm">
                                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                                  <span>SORTIR DE LA BASE ➔ Case départ</span>
                                </span>
                              ) : option.isWinning ? (
                                <span className="text-amber-300 flex items-center space-x-1.5 font-black text-sm">
                                  <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
                                  <span>ARRIVÉE AU CENTRE ! (Victoire)</span>
                                </span>
                              ) : (
                                <span className="flex items-center space-x-2 text-slate-100">
                                  <span className="text-gray-300">Case {option.fromPosition}</span>
                                  <ArrowRight className="w-4 h-4 text-emerald-400 font-bold shrink-0" />
                                  <span className="text-white font-black text-sm bg-white/20 px-2 py-0.5 rounded-md">
                                    Case {option.targetPosition} (+{gameState.diceValue})
                                  </span>
                                </span>
                              )
                            ) : (
                              <span className="text-emerald-300">Prêt au déplacement</span>
                            )}
                          </div>

                          {option?.willCapture && (
                            <div className="pt-0.5">
                              <span className="px-2.5 py-1 rounded-md bg-rose-600 text-white text-[10px] font-black uppercase flex items-center space-x-1 shadow-md w-fit animate-pulse">
                                <Swords className="w-3.5 h-3.5" />
                                <span>Capture un adversaire (+ Rejouer) !</span>
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Button CTA */}
                      <div className="shrink-0 pl-2">
                        <div className="px-4 py-2.5 rounded-2xl bg-emerald-400 group-hover:bg-emerald-300 text-neutral-950 font-black text-xs sm:text-sm uppercase shadow-xl flex items-center space-x-1.5 transition-all">
                          <span>DÉPLACER</span>
                          <Play className="w-4 h-4 fill-neutral-950" />
                        </div>
                      </div>
                    </button>
                  );
                })}

                {/* Statut compact des pions bloqués (ne prend pas d'espace sur l'écran) */}
                {blockedPawnsList.length > 0 && (
                  <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-[11px] text-gray-400 shrink-0">
                    <span className="font-semibold">Autres pions :</span>
                    <div className="flex items-center space-x-2">
                      {blockedPawnsList.map((bp) => (
                        <span key={bp.id} className="text-gray-400">
                          #{bp.id + 1} ({bp.isFinished ? '🏆 Centre' : bp.isHome ? 'Base' : `Case ${bp.position}`})
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* ÉCRAN EN CAS D'AUCUN PION JOUABLE */
              <div className="flex-1 w-full rounded-3xl bg-neutral-900/80 border-2 border-white/10 flex flex-col items-center justify-center p-6 text-center space-y-3">
                <AlertCircle className="w-14 h-14 text-amber-400 animate-pulse" />
                <h3 className="font-display font-black text-xl text-white">
                  AUCUN PION NE PEUT AVANCER
                </h3>
                <p className="text-xs text-gray-400 max-w-xs">
                  {myPawns.every((p) => p.isHome)
                    ? "Tous vos pions sont dans la base. Vous devez obtenir un 6 au dé pour en faire sortir un."
                    : `Le score de ${gameState.diceValue} ne permet aucun déplacement valide.`}
                </p>
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-widest pt-2">
                  Passage automatique au joueur suivant...
                </span>
              </div>
            )}
          </div>
        ) : (
          /* =========================================================================
             ÉTAT 3 : EN ATTENTE DU TOUR ADVERSE - TABLEAU DE BORD PLEIN ÉCRAN
             ========================================================================= */
          <div className="flex-1 w-full flex flex-col justify-between py-1 gap-2.5 overflow-hidden">
            {/* Carte de surveillance du joueur actif */}
            <div className="p-3.5 rounded-2xl bg-neutral-900 border border-white/15 flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2.5">
                <Clock className="w-4 h-4 text-amber-400 animate-spin" />
                <span className="text-xs font-bold text-gray-300">
                  Action en cours sur la TV...
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-amber-400">
                {gameState.turnTimeLeft}s
              </span>
            </div>

            {/* Vue d'ensemble des 4 pions du joueur en plein écran */}
            <div className="flex-1 w-full flex flex-col justify-stretch gap-2 overflow-y-auto">
              <span className="text-[11px] font-black text-gray-400 uppercase tracking-wider block text-center shrink-0">
                STATUT DE VOS 4 PIONS
              </span>

              {myPawns.map((pawn) => {
                const progressPct = pawn.isFinished
                  ? 100
                  : pawn.isHome
                  ? 0
                  : pawn.position >= 100
                  ? 80 + Math.min(20, (pawn.position - 99) * 4)
                  : Math.min(80, Math.round(((pawn.position % 52) / 52) * 80));

                return (
                  <div
                    key={pawn.id}
                    className="flex-1 min-h-[55px] px-4 py-2 rounded-2xl bg-neutral-900/90 border border-white/10 flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-9 h-9 rounded-xl ${colorCfg.bg} text-white font-black text-sm flex items-center justify-center shadow-md shrink-0`}>
                        #{pawn.id + 1}
                      </div>
                      <div>
                        <span className="text-xs font-black text-white block">
                          Pion {pawn.id + 1}
                        </span>
                        <span className="text-[11px] text-gray-400 font-medium">
                          {pawn.isFinished
                            ? '🏆 Arrivé au centre'
                            : pawn.isHome
                            ? 'En base de départ'
                            : pawn.position >= 100
                            ? `Allée finale (Case ${pawn.position - 99}/5)`
                            : `Sur le circuit (Case ${pawn.position})`}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-black text-amber-400 block">
                        {pawn.isFinished ? '100%' : `${progressPct}%`}
                      </span>
                      <div className="w-16 h-1.5 rounded-full bg-white/10 overflow-hidden mt-1">
                        <div
                          className={`h-full ${pawn.isFinished ? 'bg-amber-400' : 'bg-emerald-400'}`}
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Reaction Flinger */}
            <div className="shrink-0 pt-1">
              <ReactionFlinger />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};