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
import { LEVEL_DEFINITIONS } from '../../types/fourPicsConstants';

export const FourPicsBoardTV: React.FC = () => {
  const { room, returnToLobby, sendGameAction } = useGame();
  const gameState = room?.gameState as FourPicsGameState | undefined;

  const [showStageSelector, setShowStageSelector] = useState<boolean>(false);
  const [activeZoomIndex, setActiveZoomIndex] = useState<number | null>(null);
  const [lastStarsAwarded, setLastStarsAwarded] = useState<number>(0);
  const [newMilestone, setNewMilestone] = useState<MilestoneReward | null>(null);
  const [localComposed, setLocalComposed] = useState<string>('');

  // Handle local TV/PC letter tile clicks
  const handleTvTileClick = (char: string) => {
    if (gameState?.roundStatus !== 'guessing') return;
    audio.playSelect();
    setLocalComposed((prev) => {
      const wordLen = gameState?.currentPuzzle?.wordLength || 4;
      if (prev.length >= wordLen) return prev;
      const next = prev + char;
      if (next.length === wordLen) {
        sendGameAction('four_pics_submit_word', { word: next });
      }
      return next;
    });
  };

  const handleTvBackspace = () => {
    audio.playBack();
    setLocalComposed((prev) => prev.slice(0, -1));
  };

  useEffect(() => {
    setLocalComposed('');
  }, [gameState?.roundNumber, gameState?.currentPuzzle?.id]);

  // Support direct typing on physical computer keyboard (A-Z, Backspace)
  useEffect(() => {
    if (!gameState || gameState.roundStatus !== 'guessing') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (showStageSelector || activeZoomIndex !== null) {
        if (e.key === 'Escape') setActiveZoomIndex(null);
        return;
      }
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'Backspace') {
        setLocalComposed((prev) => prev.slice(0, -1));
      } else if (/^[a-zA-Z]$/.test(e.key)) {
        const char = e.key.toUpperCase();
        setLocalComposed((prev) => {
          const wordLen = gameState.currentPuzzle?.wordLength || 4;
          if (prev.length >= wordLen) return prev;
          const next = prev + char;
          if (next.length === wordLen) {
            sendGameAction('four_pics_submit_word', { word: next });
          }
          return next;
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState?.roundStatus, gameState?.currentPuzzle?.wordLength, showStageSelector, activeZoomIndex]);

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
        const time = res.timeElapsedSeconds || 15;
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
          <div className="w-14 h-14 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span className="font-display font-black text-lg uppercase tracking-widest text-emerald-400">
            CHARGEMENT DU NIVEAU...
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
  const currentLvl = puzzle.level || gameState.currentLevel || 1;
  const levelDef = LEVEL_DEFINITIONS.find((d) => d.level === currentLvl) || LEVEL_DEFINITIONS[0];
  const levelMultiplier = (1 + (currentLvl - 1) * 0.25).toFixed(2);

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

  const handleRestartFromBeginning = () => {
    audio.playSelect();
    sendGameAction('four_pics_select_stage', { level: 1, stageNumber: 1 });
  };

  return (
    <div className="relative w-full min-h-screen flex flex-col justify-between px-[4vw] py-3.5 select-none overflow-hidden bg-[#07090E] text-white">
      {/* 1. Top Header: Navigation & Level Progression */}
      <header className="relative z-20 flex items-center justify-between border-b border-white/10 pb-3">
        {/* Left: Stage Progress & Map Button */}
        <div className="flex items-center space-x-2.5">
          <button
            data-tv-focus
            tabIndex={0}
            onClick={() => {
              audio.playSelect();
              setShowStageSelector(true);
            }}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-[#121622] border border-white/15 hover:bg-white hover:text-black focus:bg-white focus:text-black transition-all outline-none"
            title="Ouvrir la carte de tous les niveaux"
          >
            <Map className="w-4 h-4 text-emerald-400" />
            <span className="font-black text-xs uppercase">Carte des Niveaux</span>
          </button>

          <button
            data-tv-focus
            tabIndex={0}
            onClick={handleRestartFromBeginning}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white text-xs font-bold transition-all outline-none"
            title="Revenir au tout premier niveau"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Niveau 1</span>
          </button>

          <div
            className="px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider shadow-md flex items-center space-x-1.5"
            style={{
              background:
                currentLvl >= 9
                  ? 'linear-gradient(135deg, #A855F7, #EC4899, #EAB308)'
                  : currentLvl >= 7
                  ? 'linear-gradient(135deg, #EF4444, #F97316)'
                  : currentLvl >= 5
                  ? 'linear-gradient(135deg, #F97316, #FBBF24)'
                  : 'linear-gradient(135deg, #10B981, #2DD4BF)',
              color: currentLvl >= 7 ? '#FFFFFF' : '#000000',
            }}
          >
            <span>NIV. {currentLvl} • {levelDef.badge}</span>
            <span className="opacity-80 text-[10px]">STAGE {puzzle.stageNumber || gameState.roundNumber}/100</span>
          </div>

          <div className="px-2.5 py-1 rounded-xl bg-amber-500/20 border border-amber-400/40 text-xs font-black text-amber-300 flex items-center space-x-1">
            <Zap className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>x{levelMultiplier} PTS</span>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-[#121622] border border-white/10 text-xs font-bold text-gray-300">
            {puzzle.category}
          </div>
        </div>

        {/* Center: Title Logo & Stars Counter */}
        <div className="flex items-center space-x-3">
          <h1 className="text-xl font-black font-display text-white tracking-wider flex items-center space-x-2">
            <span>4 IMAGES 1 MOT</span>
          </h1>
          <div className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-[#181F33] border border-white/10 text-xs font-black text-amber-400">
            <Star className="w-3.5 h-3.5 fill-amber-400" />
            <span>{globalStats.totalStars}</span>
          </div>
        </div>

        {/* Right: Dynamic Countdown Timer */}
        <div
          className={`flex items-center space-x-2.5 px-5 py-2 rounded-xl border transition-all shadow-md ${
            gameState.timeLeft <= 6
              ? 'bg-rose-950/80 border-rose-500 shadow-[0_0_25px_rgba(244,63,94,0.8)] animate-pulse'
              : 'bg-[#121622] border-white/15'
          }`}
        >
          <Clock className={`w-4 h-4 ${gameState.timeLeft <= 6 ? 'text-rose-400 animate-bounce' : 'text-amber-400'}`} />
          <div className="flex flex-col text-right">
            <span className="text-[9px] font-black uppercase text-gray-400">TEMPS</span>
            <span
              className={`font-mono font-black text-xl leading-none ${
                gameState.timeLeft <= 6 ? 'text-rose-400' : 'text-white'
              }`}
            >
              {gameState.timeLeft}s
            </span>
          </div>
        </div>
      </header>

      {/* 2. Main Stage: 4 Images 2x2 Grid + Word Mystery Slots */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center my-1.5">
        {/* 2x2 Grid of High-Resolution Themed Images */}
        <div className="grid grid-cols-2 gap-3.5 max-w-[580px] max-h-[400px] aspect-square w-full">
          {puzzle.images.map((imgUrl, idx) => (
            <div
              key={`fourpic_${idx}`}
              onClick={() => setActiveZoomIndex(idx)}
              className="relative rounded-2xl overflow-hidden bg-[#101420] border-2 border-white/15 shadow-xl group cursor-pointer transition-all duration-300 hover:scale-102 hover:border-emerald-400"
            >
              <img
                src={imgUrl}
                alt={`Photo indice ${idx + 1}`}
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80';
                }}
                className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

              {/* Index Badge & Zoom Hint */}
              <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-lg bg-black/75 border border-white/20 text-xs font-black text-amber-400 font-mono shadow-md flex items-center space-x-1">
                <span>#{idx + 1}</span>
              </div>

              <div className="absolute bottom-2.5 right-2.5 p-1.5 rounded-lg bg-black/60 text-white/80 opacity-0 group-hover:opacity-100 transition-opacity">
                <ZoomIn className="w-4 h-4 text-emerald-400" />
              </div>
            </div>
          ))}
        </div>

        {/* Word Length Mystery Letter Slots */}
        <div className="mt-3.5 flex items-center justify-center flex-wrap gap-1.5 sm:gap-2 max-w-2xl px-2">
          {Array.from({ length: wordLength }).map((_, idx) => {
            const revealedLetter =
              isRevealed && gameState.roundResult ? gameState.roundResult.word[idx] : null;
            const displayChar = revealedLetter || localComposed[idx] || '';

            const slotSizeClass =
              wordLength > 10
                ? 'w-9 h-11 sm:w-11 sm:h-13 text-xl sm:text-2xl'
                : wordLength > 7
                ? 'w-10 h-12 sm:w-12 sm:h-15 text-2xl sm:text-3xl'
                : 'w-12 h-14 sm:w-14 sm:h-16 text-2xl sm:text-3xl';

            return (
              <div
                key={`slot_${idx}`}
                className={`${slotSizeClass} rounded-xl border-2 flex items-center justify-center font-display font-black shadow-xl transition-all ${
                  revealedLetter
                    ? 'bg-gradient-to-tr from-emerald-500 to-teal-400 border-white text-black shadow-[0_0_25px_rgba(16,185,129,0.8)] scale-105 animate-bounce'
                    : displayChar
                    ? 'bg-gradient-to-tr from-[#1E293B] to-[#334155] border-emerald-400 text-emerald-300 scale-102 shadow-[0_0_15px_rgba(16,185,129,0.3)] animate-scale-in'
                    : 'bg-[#101420] border-white/20 text-gray-500'
                }`}
              >
                {displayChar || '_'}
              </div>
            );
          })}
        </div>

        {/* TV / PC Interactive Clickable Letter Tiles */}
        {!isRevealed && gameState.scrambledLetters && (
          <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5 max-w-xl">
            {gameState.scrambledLetters.map((char, idx) => (
              <button
                key={`tv_tile_${idx}`}
                data-tv-focus
                tabIndex={0}
                onClick={() => handleTvTileClick(char)}
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg bg-[#181F33] hover:bg-emerald-500 hover:text-black border border-white/20 font-display font-black text-base sm:text-lg text-white shadow-md active:scale-90 transition-all outline-none focus:bg-emerald-500 focus:text-black focus:scale-110"
              >
                {char}
              </button>
            ))}

            {localComposed.length > 0 && (
              <button
                data-tv-focus
                tabIndex={0}
                onClick={handleTvBackspace}
                className="px-3 h-10 sm:h-11 rounded-lg bg-rose-950/60 hover:bg-rose-600 border border-rose-500/40 text-rose-300 hover:text-white font-bold text-xs uppercase transition-all flex items-center space-x-1 outline-none focus:bg-rose-600 focus:text-white active:scale-95"
              >
                <span>Effacer</span>
              </button>
            )}
          </div>
        )}

        {/* Clue Hint */}
        <div className="mt-2 text-center text-xs font-medium text-gray-400">
          <span>💡 Indice : <strong className="text-white">{puzzle.hint}</strong></span>
        </div>
      </main>

      {/* 3. Bottom Player Podiums & Scores */}
      <footer className="relative z-20 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2.5 pt-2 border-t border-white/10">
        {sortedPlayers.map((player, idx) => {
          const score = gameState.scores[player.id] || 0;
          const combo = gameState.combos ? gameState.combos[player.id] || 0 : 0;
          const isSolved = gameState.solvedPlayersThisRound?.includes(player.id);

          return (
            <div
              key={player.id}
              className={`p-2.5 rounded-xl border transition-all flex items-center space-x-2.5 ${
                isSolved
                  ? 'bg-emerald-950/60 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)] scale-102'
                  : 'bg-[#101420] border-white/10 opacity-80'
              }`}
            >
              <div className="relative">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-xl border border-white/20 shadow-sm">
                  {player.avatar || '🦊'}
                </div>
                {idx === 0 && <span className="absolute -top-1.5 -left-1.5 text-xs">👑</span>}
              </div>

              <div className="overflow-hidden flex-1">
                <div className="flex items-center space-x-1">
                  <h4 className="font-black text-xs text-white truncate">{player.name}</h4>
                  {combo >= 2 && (
                    <span className="px-1 py-0.2 rounded bg-amber-500 text-black font-black text-[9px] flex items-center">
                      <Flame className="w-2.5 h-2.5" />x{combo}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between mt-0.5">
                  <span className="text-xs font-mono font-black text-amber-400">{score} pts</span>
                  {isSolved ? (
                    <span className="text-[10px] font-black text-emerald-400 flex items-center space-x-0.5">
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

      {/* 4. Fullscreen Zoom Image Overlay */}
      {activeZoomIndex !== null && puzzle.images[activeZoomIndex] && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-lg flex items-center justify-center p-6 select-none animate-fade-in"
          onClick={() => setActiveZoomIndex(null)}
        >
          <div className="relative max-w-4xl w-full max-h-[85vh] rounded-3xl overflow-hidden border-2 border-white/20 shadow-2xl">
            <img
              src={puzzle.images[activeZoomIndex]}
              alt={`Zoom Indice #${activeZoomIndex + 1}`}
              className="w-full h-full object-contain mx-auto"
            />
            <div className="absolute top-4 right-4">
              <button
                onClick={() => setActiveZoomIndex(null)}
                className="w-10 h-10 rounded-full bg-black/75 border border-white/30 text-white flex items-center justify-center hover:bg-white hover:text-black transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="absolute bottom-4 left-6 px-4 py-1.5 rounded-full bg-black/80 border border-white/20 text-xs font-black text-amber-400 font-mono">
              Indice #{activeZoomIndex + 1} / 4 • Cliquez n'importe où pour fermer
            </div>
          </div>
        </div>
      )}

      {/* 5. Stage Victory / Revealed Flash Overlay Modal with Stars & Next Stage */}
      {isRevealed && gameState.roundResult && !isGameOver && (
        <div className="fixed inset-0 z-40 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none animate-scale-in">
          <div className="max-w-md w-full p-6 rounded-2xl bg-[#101420] border border-emerald-500/50 shadow-[0_0_50px_rgba(16,185,129,0.4)] text-center space-y-4">
            {/* Golden Stars Animation */}
            <div className="flex items-center justify-center space-x-2">
              {Array.from({ length: 3 }).map((_, sIdx) => {
                const isEarned = sIdx < (gameState.roundResult?.starsEarned || lastStarsAwarded || 1);
                return (
                  <Star
                    key={`star_anim_${sIdx}`}
                    className={`w-10 h-10 transition-all ${
                      isEarned
                        ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.9)] animate-bounce'
                        : 'fill-gray-800 text-gray-700 opacity-40'
                    }`}
                  />
                );
              })}
            </div>

            <div>
              <span className="text-[10px] font-black uppercase text-emerald-400 tracking-widest block">
                {gameState.roundResult.winnerName ? 'STAGE RÉUSSI !' : 'TEMPS ÉCOULÉ !'}
              </span>
              <h2 className="text-3xl font-black font-display text-white mt-0.5">
                "{gameState.roundResult.word}"
              </h2>
              {gameState.roundResult.winnerName && (
                <p className="text-xs font-bold text-emerald-400 mt-1">
                  🏆 {gameState.roundResult.winnerName} (+{gameState.roundResult.pointsEarned || 100} pts)
                </p>
              )}
            </div>

            {/* Next Milestone Notification */}
            {newMilestone && (
              <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-400 flex items-center justify-center space-x-2 text-xs font-black text-amber-400">
                <span>{newMilestone.icon}</span>
                <span>NOUVELLE RÉCOMPENSE DÉBLOQUÉE : {newMilestone.title} !</span>
              </div>
            )}

            {/* Auto advance progress bar */}
            {Boolean(gameState.autoAdvanceSeconds) && (
              <div className="w-full space-y-1 px-1">
                <div className="flex items-center justify-between text-xs font-mono font-bold text-gray-400">
                  <span>Enchaînement automatique</span>
                  <span className="text-emerald-400 font-black">{gameState.autoAdvanceSeconds}s</span>
                </div>
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-1000"
                    style={{ width: `${((gameState.autoAdvanceSeconds || 5) / 5) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-center space-x-2.5 pt-1">
              <button
                data-tv-focus
                tabIndex={0}
                onClick={handleNextStage}
                className="flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-black font-display font-black text-xs uppercase tracking-wider shadow-lg hover:scale-105 active:scale-95 transition-all outline-none focus:ring-2 focus:ring-white"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>STAGE SUIVANT</span>
              </button>

              <button
                data-tv-focus
                tabIndex={0}
                onClick={() => setShowStageSelector(true)}
                className="px-3.5 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white font-bold text-xs uppercase transition-all outline-none focus:bg-white focus:text-black"
              >
                Carte
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
