import React, { useState, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { FourPicsGameState } from '../../types/game';
import {
  Clock,
  Trophy,
  Sparkles,
  Award,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Flame,
  ZoomIn,
  X,
  Star,
  Map,
  ChevronRight,
  Zap,
  Play,
} from 'lucide-react';
import { audio } from '../../services/audio';
import { playSoundFX } from '../../engine/PlaySoundFX';
import { fourPicsProgress, MilestoneReward } from '../../services/fourPicsProgressService';
import { FourPicsStageSelectorTV } from '../views/FourPicsStageSelectorTV';
import { tvNav } from '../../services/tvNavigation';

export const FourPicsBoardTV: React.FC = () => {
  const { room, replayGame, returnToLobby, sendGameAction } = useGame();
  const gameState = room?.gameState as FourPicsGameState | undefined;

  const [showStageSelector, setShowStageSelector] = useState<boolean>(false);
  const [activeZoomIndex, setActiveZoomIndex] = useState<number | null>(null);
  const [lastStarsAwarded, setLastStarsAwarded] = useState<number>(0);
  const [newMilestone, setNewMilestone] = useState<MilestoneReward | null>(null);

  useEffect(() => {
    tvNav.setInitialFocus('button');
  }, [showStageSelector, gameState?.roundStatus]);

  // Sync zoomed image if commanded from server/mobile
  useEffect(() => {
    if (gameState?.zoomedImageIndex !== undefined) {
      setActiveZoomIndex(gameState.zoomedImageIndex);
    }
  }, [gameState?.zoomedImageIndex]);

  // Audio cues on timer and victory
  useEffect(() => {
    if (!gameState) return;
    if (gameState.timeLeft <= 5 && gameState.roundStatus === 'guessing') {
      playSoundFX.playCountdownBeep(gameState.timeLeft === 1);
    }
  }, [gameState?.timeLeft, gameState?.roundStatus]);

  // Record victory in persistent local progression
  useEffect(() => {
    if (gameState?.roundResult && gameState.roundStatus === 'revealed') {
      const res = gameState.roundResult;
      if (res.winnerName && gameState.currentPuzzle) {
        const lvl = gameState.currentPuzzle.level || 1;
        const stg = gameState.currentPuzzle.stageNumber || 1;
        const time = res.timeElapsedSeconds || 20;
        const hints = res.hintsUsed || 0;
        const pts = res.pointsEarned || 100;

        const result = fourPicsProgress.recordStageVictory(lvl, stg, time, hints, pts);
        setLastStarsAwarded(result.starsAwarded);
        if (result.newMilestoneUnlocked) {
          setNewMilestone(result.newMilestoneUnlocked);
          playSoundFX.playDiceSixBonus();
        } else {
          playSoundFX.playDiceSixBonus();
        }
      } else {
        playSoundFX.playHop();
      }
    }
  }, [gameState?.roundResult?.timestamp]);

  if (showStageSelector) {
    return (
      <FourPicsStageSelectorTV
        onSelectStage={(lvl, stg) => {
          sendGameAction('four_pics_select_stage', { level: lvl, stageNumber: stg });
          setShowStageSelector(false);
        }}
        onStartRandomMode={() => {
          sendGameAction('four_pics_rematch');
          setShowStageSelector(false);
        }}
        onBack={() => setShowStageSelector(false)}
      />
    );
  }

  if (!gameState || !gameState.currentPuzzle) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#07090E] text-white select-none">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 border-4 border-[#E50914] border-t-transparent rounded-full animate-spin" />
          <span className="font-display font-black text-xl uppercase tracking-widest text-[#FFB800]">
            CHARGEMENT DU STAGE...
          </span>
        </div>
      </div>
    );
  }

  const puzzle = gameState.currentPuzzle;
  const wordLength = puzzle.wordLength;
  const isRevealed = gameState.roundStatus === 'revealed';
  const isGameOver = gameState.roundStatus === 'game_over';

  const globalStats = fourPicsProgress.getGlobalStats();

  // Sorted leaderboard
  const sortedPlayers = [...(room?.players || [])].sort((a, b) => {
    const scoreA = gameState.scores[a.id] || 0;
    const scoreB = gameState.scores[b.id] || 0;
    return scoreB - scoreA;
  });

  const handleNextStage = () => {
    audio.playSelect();
    sendGameAction('four_pics_next_stage');
  };

  return (
    <div className="relative w-full min-h-screen flex flex-col justify-between px-[5vw] py-4 select-none overflow-hidden bg-[#07090E]">
      {/* 1. Top Header: Level & Stage Pill, Map Button, Category, and Dynamic Timer */}
      <header className="relative z-20 flex items-center justify-between border-b border-white/10 pb-3">
        {/* Left: Stage Progress & Map Button */}
        <div className="flex items-center space-x-3">
          <button
            data-tv-focus
            tabIndex={0}
            onClick={() => {
              audio.playSelect();
              setShowStageSelector(true);
            }}
            className="flex items-center space-x-2 px-4 py-2 rounded-2xl bg-[#101420] border-2 border-white/15 hover:bg-white hover:text-black focus:bg-white focus:text-black transition-all outline-none"
          >
            <Map className="w-4 h-4 text-[#00F2FE]" />
            <span className="font-black text-xs uppercase">Carte des 1 000 Stages</span>
          </button>

          <div className="px-4 py-1.5 rounded-full bg-gradient-to-r from-[#E50914] to-[#FF2E63] text-white text-xs font-black uppercase tracking-wider shadow-[0_0_20px_rgba(229,9,20,0.5)]">
            NIVEAU {puzzle.level || 1} • STAGE {puzzle.stageNumber || gameState.roundNumber}/100
          </div>

          <div className="px-3.5 py-1.5 rounded-2xl bg-[#101420] border border-white/15 text-xs font-black text-[#00F2FE]">
            {puzzle.category}
          </div>
        </div>

        {/* Center: Title Logo & Stars Counter */}
        <div className="flex items-center space-x-3">
          <h1 className="text-2xl font-black font-display text-white tracking-widest flex items-center space-x-2">
            <span>4 IMAGES 1 MOT</span>
          </h1>
          <div className="flex items-center space-x-1 px-3 py-1 rounded-xl bg-[#181F33] border border-white/10 text-xs font-black text-[#FFB800]">
            <Star className="w-3.5 h-3.5 fill-[#FFB800]" />
            <span>{globalStats.totalStars}</span>
          </div>
        </div>

        {/* Right: Dynamic Countdown Timer */}
        <div
          className={`flex items-center space-x-3 px-6 py-2 rounded-2xl border-2 transition-all shadow-xl ${
            gameState.timeLeft <= 6
              ? 'bg-rose-950/80 border-rose-500 shadow-[0_0_35px_rgba(244,63,94,0.8)] animate-pulse'
              : 'bg-[#101420] border-[#FFB800]/50 shadow-[0_0_20px_rgba(255,184,0,0.3)]'
          }`}
        >
          <Clock className={`w-5 h-5 ${gameState.timeLeft <= 6 ? 'text-rose-400 animate-bounce' : 'text-[#FFB800]'}`} />
          <div className="flex flex-col text-right">
            <span className="text-[9px] font-black uppercase text-gray-400">CHRONO</span>
            <span
              className={`font-mono font-black text-2xl leading-none ${
                gameState.timeLeft <= 6 ? 'text-rose-400' : 'text-white'
              }`}
            >
              {gameState.timeLeft}s
            </span>
          </div>
        </div>
      </header>

      {/* 2. Main Stage: 4 Images 2x2 Grid + Word Mystery Slots */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center my-2">
        {/* 2x2 Grid of High-Resolution Themed Images */}
        <div className="grid grid-cols-2 gap-4 max-w-[640px] max-h-[440px] aspect-square w-full">
          {puzzle.images.map((imgUrl, idx) => (
            <div
              key={`fourpic_${idx}`}
              onClick={() => setActiveZoomIndex(idx)}
              className="relative rounded-3xl overflow-hidden bg-[#101420] border-4 border-[#181F33] shadow-2xl group cursor-pointer transition-all duration-300 hover:scale-102 hover:border-[#00F2FE]"
            >
              <img
                src={imgUrl}
                alt={`Indice ${idx + 1}`}
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80';
                }}
                className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

              {/* Index Chip & Zoom Hint */}
              <div className="absolute top-2.5 left-2.5 px-3 py-1 rounded-xl bg-black/75 border border-white/20 text-xs font-black text-[#FFB800] font-mono shadow-md flex items-center space-x-1">
                <span>#{idx + 1}</span>
              </div>

              <div className="absolute bottom-2.5 right-2.5 p-2 rounded-xl bg-black/60 text-white/80 opacity-0 group-hover:opacity-100 transition-opacity">
                <ZoomIn className="w-4 h-4 text-[#00F2FE]" />
              </div>
            </div>
          ))}
        </div>

        {/* Word Length Mystery Letter Slots */}
        <div className="mt-5 flex items-center space-x-3">
          {Array.from({ length: wordLength }).map((_, idx) => {
            const revealedLetter =
              isRevealed && gameState.roundResult ? gameState.roundResult.word[idx] : null;

            return (
              <div
                key={`slot_${idx}`}
                className={`w-16 h-18 rounded-2xl border-2 flex items-center justify-center font-display font-black text-4xl shadow-2xl transition-all ${
                  revealedLetter
                    ? 'bg-gradient-to-tr from-[#FFB800] to-amber-500 border-white text-gray-950 shadow-[0_0_30px_rgba(255,184,0,0.8)] scale-108 animate-bounce'
                    : 'bg-[#101420] border-white/20 text-gray-500'
                }`}
              >
                {revealedLetter || '_'}
              </div>
            );
          })}
        </div>

        {/* Descriptive Hint below word slots */}
        <div className="mt-2 text-center text-xs font-bold text-[#B8C2D8]">
          <span>💡 Indice : {puzzle.hint}</span>
        </div>
      </main>

      {/* 3. Bottom Player Podiums & Score Bar */}
      <footer className="relative z-20 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 pt-2 border-t border-white/10">
        {sortedPlayers.map((player, idx) => {
          const score = gameState.scores[player.id] || 0;
          const combo = gameState.combos ? gameState.combos[player.id] || 0 : 0;
          const isSolved = gameState.solvedPlayersThisRound?.includes(player.id);

          return (
            <div
              key={player.id}
              className={`p-3 rounded-2xl border-2 transition-all flex items-center space-x-3 ${
                isSolved
                  ? 'bg-emerald-950/60 border-[#10B981] shadow-[0_0_20px_rgba(16,185,129,0.4)] scale-105'
                  : 'bg-[#101420] border-white/10 opacity-80'
              }`}
            >
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#E50914] to-[#FFB800] flex items-center justify-center text-2xl border border-white/20 shadow-md">
                  {player.avatar || '🦊'}
                </div>
                {idx === 0 && <span className="absolute -top-1.5 -left-1.5 text-xs">👑</span>}
              </div>

              <div className="overflow-hidden flex-1">
                <div className="flex items-center space-x-1">
                  <h4 className="font-black text-xs text-white truncate">{player.name}</h4>
                  {combo >= 2 && (
                    <span className="px-1.5 py-0.2 rounded bg-amber-500 text-gray-950 font-black text-[9px] flex items-center">
                      <Flame className="w-2.5 h-2.5" />x{combo}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between mt-0.5">
                  <span className="text-xs font-mono font-black text-[#FFB800]">{score} pts</span>
                  {isSolved ? (
                    <span className="text-[10px] font-black text-[#10B981] flex items-center space-x-0.5">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>TROUVÉ</span>
                    </span>
                  ) : (
                    <span className="text-[10px] text-gray-500 font-bold">Cherche...</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </footer>

      {/* 4. Stage Victory / Revealed Flash Overlay Modal with Stars & Next Stage */}
      {isRevealed && gameState.roundResult && !isGameOver && (
        <div className="fixed inset-0 z-40 bg-black/85 backdrop-blur-md flex items-center justify-center p-6 select-none animate-scale-in">
          <div className="max-w-lg w-full p-8 rounded-3xl bg-[#101420] border-2 border-[#FFB800] shadow-[0_0_60px_rgba(255,184,0,0.5)] text-center space-y-5">
            {/* Golden Stars Animation */}
            <div className="flex items-center justify-center space-x-2">
              {Array.from({ length: 3 }).map((_, sIdx) => {
                const isEarned = sIdx < (gameState.roundResult?.starsEarned || lastStarsAwarded || 1);
                return (
                  <Star
                    key={`star_anim_${sIdx}`}
                    className={`w-12 h-12 transition-all ${
                      isEarned
                        ? 'fill-[#FFB800] text-[#FFB800] drop-shadow-[0_0_20px_rgba(255,184,0,0.9)] animate-bounce'
                        : 'fill-gray-800 text-gray-700 opacity-40'
                    }`}
                  />
                );
              })}
            </div>

            <div>
              <span className="text-xs font-black uppercase text-[#FFB800] tracking-widest block">
                {gameState.roundResult.winnerName ? 'STAGE RÉUSSI !' : 'TEMPS ÉCOULÉ !'}
              </span>
              <h2 className="text-4xl font-black font-display text-white mt-1">
                "{gameState.roundResult.word}"
              </h2>
              {gameState.roundResult.winnerName && (
                <p className="text-sm font-bold text-[#10B981] mt-2">
                  🏆 {gameState.roundResult.winnerName} (+{gameState.roundResult.pointsEarned || 100} pts)
                </p>
              )}
            </div>

            {/* Next Milestone Notification */}
            {newMilestone && (
              <div className="p-3 rounded-2xl bg-gradient-to-r from-[#FFB800]/20 to-amber-500/20 border border-[#FFB800] flex items-center justify-center space-x-2 text-xs font-black text-[#FFB800]">
                <span className="text-lg">{newMilestone.icon}</span>
                <span>NOUVELLE RÉCOMPENSE DÉBLOQUÉE : {newMilestone.title} !</span>
              </div>
            )}

            {/* Action Buttons: Next Stage or Map */}
            <div className="flex items-center justify-center space-x-3 pt-2">
              <button
                data-tv-focus
                tabIndex={0}
                onClick={handleNextStage}
                className="flex-1 flex items-center justify-center space-x-2 py-4 rounded-2xl bg-gradient-to-r from-[#10B981] to-[#059669] text-white font-black text-sm uppercase shadow-[0_0_25px_rgba(16,185,129,0.5)] hover:scale-105 focus:scale-105 focus:bg-white focus:text-emerald-900 transition-all outline-none"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>STAGE SUIVANT</span>
              </button>

              <button
                data-tv-focus
                tabIndex={0}
                onClick={() => {
                  audio.playSelect();
                  setShowStageSelector(true);
                }}
                className="px-6 py-4 rounded-2xl bg-[#181F33] border-2 border-white/20 text-white font-bold text-sm hover:border-white focus:bg-white focus:text-black transition-all outline-none"
              >
                <span>Carte des Stages</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Image Zoom Modal */}
      {activeZoomIndex !== null && puzzle.images[activeZoomIndex] && (
        <div
          onClick={() => setActiveZoomIndex(null)}
          className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-8 select-none animate-scale-in cursor-pointer"
        >
          <div className="relative max-w-4xl max-h-[85vh] rounded-3xl overflow-hidden border-4 border-[#00F2FE] shadow-[0_0_60px_rgba(0,242,254,0.5)]">
            <img
              src={puzzle.images[activeZoomIndex]}
              alt={`Zoom Indice ${activeZoomIndex + 1}`}
              className="w-full h-full object-contain max-h-[80vh]"
            />
            <div className="absolute top-4 left-4 px-4 py-2 rounded-2xl bg-black/80 border border-white/20 text-white font-black text-sm font-mono">
              INDICE #{activeZoomIndex + 1} • {puzzle.category}
            </div>
            <button
              onClick={() => setActiveZoomIndex(null)}
              className="absolute top-4 right-4 p-3 rounded-full bg-black/80 text-white hover:bg-[#E50914] transition-all"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}

      {/* 6. GAME OVER PODIUM CEREMONY */}
      {isGameOver && (
        <div className="fixed inset-0 z-50 bg-[#07090E]/95 backdrop-blur-xl flex flex-col items-center justify-center p-8 select-none animate-scale-in">
          <div className="max-w-xl w-full p-8 rounded-3xl bg-[#101420] border-2 border-[#FFB800] shadow-[0_0_60px_rgba(255,184,0,0.6)] text-center space-y-6">
            <div className="relative inline-block">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-[#FFB800] to-amber-600 flex items-center justify-center text-5xl shadow-2xl border-4 border-white mx-auto animate-bounce">
                👑
              </div>
              <div className="absolute -top-3 -right-3 p-2 rounded-full bg-[#FFB800] text-gray-950 shadow-lg">
                <Trophy className="w-6 h-6" />
              </div>
            </div>

            <div>
              <span className="text-xs font-black uppercase tracking-widest text-[#FFB800] block">
                FIN DE PARTIE 4 IMAGES 1 MOT
              </span>
              <h2 className="text-3xl font-black font-display text-white mt-1">
                {sortedPlayers[0]?.name || 'Le Champion'} REMPORTE LA VICTOIRE !
              </h2>
            </div>

            <div className="flex items-center justify-center space-x-4 pt-2">
              <button
                onClick={() => {
                  playSoundFX.playHop();
                  replayGame();
                }}
                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#E50914] to-[#FF2E63] text-white font-display font-black text-sm uppercase shadow-[0_0_25px_rgba(229,9,20,0.6)] hover:scale-105 active:scale-95 transition-all"
              >
                Rejouer la Partie
              </button>

              <button
                onClick={() => {
                  playSoundFX.playHop();
                  returnToLobby();
                }}
                className="px-6 py-3.5 rounded-2xl bg-[#181F33] border border-white/20 text-gray-300 font-bold text-sm hover:text-white transition-all"
              >
                Retour au Salon
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
