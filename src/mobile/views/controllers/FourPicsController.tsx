import React, { useState, useEffect } from 'react';
import { useGame } from '../../../context/GameContext';
import { FourPicsGameState } from '../../../types/game';
import { MobileHeader } from '../../components/MobileHeader';
import { ReactionFlinger } from '../../components/ReactionFlinger';
import { triggerHaptic, hapticPatterns } from '../../components/HapticFeedback';
import { playSoundFX } from '../../../engine/PlaySoundFX';
import {
  Lightbulb,
  Trash2,
  Delete,
  Sparkles,
  Trophy,
  Clock,
  CheckCircle2,
  AlertCircle,
  Flame,
  ZoomIn,
  X,
  Play,
  Zap,
} from 'lucide-react';
import { LEVEL_DEFINITIONS } from '../../../types/fourPicsConstants';

interface LetterTile {
  id: string;
  char: string;
  isUsed: boolean;
  isRemoved?: boolean;
}

export const FourPicsController: React.FC = () => {
  const { room, localPlayer, sendGameAction } = useGame();
  const gameState = room?.gameState as FourPicsGameState | undefined;

  const [letterTiles, setLetterTiles] = useState<LetterTile[]>([]);
  const [selectedLetterIds, setSelectedLetterIds] = useState<string[]>([]);
  const [feedbackError, setFeedbackError] = useState<string>('');
  const [inspectImageIndex, setInspectImageIndex] = useState<number | null>(null);

  const currentPuzzle = gameState?.currentPuzzle;
  const wordLength = currentPuzzle?.wordLength || 4;

  // Initialize or reset letter pool when round changes
  useEffect(() => {
    if (gameState?.scrambledLetters) {
      const removedIndices = (localPlayer && gameState.removedLettersIndices?.[localPlayer.id]) || [];

      const tiles: LetterTile[] = gameState.scrambledLetters.map((char, idx) => ({
        id: `tile_${idx}_${char}_${gameState.roundNumber}`,
        char,
        isUsed: false,
        isRemoved: removedIndices.includes(idx),
      }));

      setLetterTiles(tiles);
      setSelectedLetterIds([]);
      setFeedbackError('');
    }
  }, [gameState?.roundNumber, gameState?.currentPuzzle?.id]);

  // Update removed tiles when hint is used
  useEffect(() => {
    if (localPlayer && gameState?.removedLettersIndices?.[localPlayer.id]) {
      const removed = gameState.removedLettersIndices[localPlayer.id];
      setLetterTiles((prev) =>
        prev.map((t, idx) => (removed.includes(idx) ? { ...t, isRemoved: true } : t))
      );
    }
  }, [gameState?.removedLettersIndices, localPlayer?.id]);

  if (!gameState || !currentPuzzle || !localPlayer) return null;

  const isSolvedByMe = gameState.solvedPlayersThisRound?.includes(localPlayer.id);
  const isRevealed = gameState.roundStatus === 'revealed';
  const myScore = gameState.scores[localPlayer.id] || 0;
  const myCombo = gameState.combos ? gameState.combos[localPlayer.id] || 0 : 0;

  // Construct current composed word string
  const composedWord = selectedLetterIds
    .map((id) => letterTiles.find((t) => t.id === id)?.char || '')
    .join('');

  const handleSelectTile = (tileId: string) => {
    if (selectedLetterIds.length >= wordLength || isSolvedByMe || isRevealed) return;

    triggerHaptic(hapticPatterns.tap);
    playSoundFX.playHop();
    setFeedbackError('');

    const newSelected = [...selectedLetterIds, tileId];
    setSelectedLetterIds(newSelected);
    setLetterTiles((prev) =>
      prev.map((t) => (t.id === tileId ? { ...t, isUsed: true } : t))
    );

    // Auto-submit when word is complete
    if (newSelected.length === wordLength) {
      const fullWord = newSelected
        .map((id) => letterTiles.find((t) => t.id === id)?.char || '')
        .join('');
      submitWord(fullWord);
    }
  };

  const handleRemovePlacedSlot = (slotIndex: number) => {
    if (slotIndex >= selectedLetterIds.length || isSolvedByMe || isRevealed) return;

    triggerHaptic(hapticPatterns.tap);
    playSoundFX.playHop();
    setFeedbackError('');

    const removedTileId = selectedLetterIds[slotIndex];
    setSelectedLetterIds((prev) => prev.filter((_, i) => i !== slotIndex));
    setLetterTiles((prev) =>
      prev.map((t) => (t.id === removedTileId ? { ...t, isUsed: false } : t))
    );
  };

  const handleBackspace = () => {
    if (selectedLetterIds.length === 0 || isSolvedByMe || isRevealed) return;

    triggerHaptic(hapticPatterns.tap);
    playSoundFX.playHop();
    setFeedbackError('');

    const lastTileId = selectedLetterIds[selectedLetterIds.length - 1];
    setSelectedLetterIds((prev) => prev.slice(0, -1));
    setLetterTiles((prev) =>
      prev.map((t) => (t.id === lastTileId ? { ...t, isUsed: false } : t))
    );
  };

  const handleClear = () => {
    if (selectedLetterIds.length === 0 || isSolvedByMe || isRevealed) return;

    triggerHaptic(hapticPatterns.tap);
    playSoundFX.playHop();
    setFeedbackError('');

    setSelectedLetterIds([]);
    setLetterTiles((prev) => prev.map((t) => ({ ...t, isUsed: false })));
  };

  const submitWord = (wordToSubmit: string) => {
    if (wordToSubmit.length !== wordLength) return;
    setFeedbackError('');
    sendGameAction('four_pics_guess', { word: wordToSubmit });
  };

  // Hint 1: Reveal a letter (-30 pts)
  const handleHintReveal = () => {
    if (isSolvedByMe || isRevealed) return;
    triggerHaptic(hapticPatterns.tap);
    playSoundFX.playHop();
    sendGameAction('four_pics_hint_reveal');
  };

  // Hint 2: Remove 3 fake letters (-20 pts)
  const handleHintRemove = () => {
    if (isSolvedByMe || isRevealed) return;
    triggerHaptic(hapticPatterns.tap);
    playSoundFX.playHop();
    sendGameAction('four_pics_hint_remove');
  };

  const currentLvl = currentPuzzle.level || gameState.currentLevel || 1;
  const levelDef = LEVEL_DEFINITIONS.find((d) => d.level === currentLvl) || LEVEL_DEFINITIONS[0];
  const levelMultiplier = (1 + (currentLvl - 1) * 0.25).toFixed(2);

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#07090E] text-white select-none relative overflow-hidden">
      <MobileHeader />

      <main className="p-3.5 flex-1 flex flex-col justify-between space-y-2.5 relative z-10">
        {/* 1. Header: Level & Score */}
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#121622] border border-white/10 shadow-sm">
          <div>
            <div className="flex items-center space-x-1.5 mb-0.5">
              <span
                className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider"
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
                NIV. {currentLvl} • {levelDef.badge}
              </span>
              <span className="px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[9px] font-black flex items-center space-x-0.5">
                <Zap className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                <span>x{levelMultiplier}</span>
              </span>
            </div>
            <span className="text-xs font-bold text-gray-300">
              Stage {currentPuzzle.stageNumber || 1}/100 • {currentPuzzle.category}
            </span>
          </div>

          <div className="flex items-center space-x-2.5 text-right">
            {myCombo >= 2 && (
              <div className="px-1.5 py-0.5 rounded-lg bg-gradient-to-r from-amber-500 to-red-500 text-black font-black text-xs shadow-sm flex items-center space-x-0.5 animate-pulse">
                <Flame className="w-3 h-3" />
                <span>x{myCombo}</span>
              </div>
            )}
            <div>
              <span className="text-[8px] font-black uppercase text-gray-400 block">VOTRE SCORE</span>
              <span className="text-sm font-mono font-black text-amber-400">{myScore} PTS</span>
            </div>
          </div>
        </div>

        {/* 2. 4 Mini Thumbnails Preview with Click-to-Zoom */}
        <div className="grid grid-cols-4 gap-1.5">
          {currentPuzzle.images.map((img, i) => (
            <div
              key={`thumb_${i}`}
              onClick={() => setInspectImageIndex(i)}
              className="relative aspect-square rounded-xl overflow-hidden bg-[#101420] border border-white/20 shadow-sm cursor-pointer group"
            >
              <img src={img} alt={`Indice ${i + 1}`} className="w-full h-full object-cover" />
              <span className="absolute top-1 left-1 px-1 py-0.2 rounded bg-black/70 text-[8px] font-mono font-bold text-amber-400">
                #{i + 1}
              </span>
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <ZoomIn className="w-3.5 h-3.5 text-white" />
              </div>
            </div>
          ))}
        </div>

        {/* 3. Word Mystery Slots (Composed Letters) */}
        <div className="space-y-1.5 text-center">
          <div className="flex items-center justify-center flex-wrap gap-1 max-w-full px-1">
            {Array.from({ length: wordLength }).map((_, idx) => {
              const char = composedWord[idx] || '';

              const slotSizeClass =
                wordLength > 10
                  ? 'w-7 h-9 text-xs'
                  : wordLength > 8
                  ? 'w-8 h-10 text-sm'
                  : 'w-10 h-12 text-lg';

              return (
                <button
                  key={`slot_${idx}`}
                  onClick={() => handleRemovePlacedSlot(idx)}
                  className={`${slotSizeClass} rounded-xl border-2 font-display font-black flex items-center justify-center transition-all shadow-md ${
                    char
                      ? 'bg-gradient-to-tr from-emerald-500 to-teal-400 border-white text-black scale-105 animate-scale-in'
                      : 'bg-[#101420] border-white/20 text-gray-500'
                  }`}
                >
                  {char || '_'}
                </button>
              );
            })}
          </div>

          {feedbackError && (
            <div className="text-xs font-bold text-rose-400 animate-shake">
              {feedbackError}
            </div>
          )}

          {isSolvedByMe && !isRevealed && (
            <div className="p-2 rounded-xl bg-emerald-950/80 border border-emerald-400 text-emerald-400 text-xs font-black flex items-center justify-center space-x-1 animate-scale-in">
              <CheckCircle2 className="w-4 h-4" />
              <span>BRAVO ! VOUS AVEZ TROUVÉ ! 🎉</span>
            </div>
          )}

          {isRevealed && (
            <div className="p-3.5 rounded-2xl bg-[#121622] border border-emerald-500/40 text-center space-y-2.5 animate-scale-in shadow-xl">
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 block">
                {gameState.roundResult?.winnerName ? 'STAGE RÉUSSI !' : 'TEMPS ÉCOULÉ !'}
              </span>
              <div className="text-xl font-display font-black text-white">
                « {gameState.roundResult?.word} »
              </div>
              {gameState.roundResult?.winnerName && (
                <p className="text-xs font-bold text-emerald-400">
                  🏆 Trouvé par {gameState.roundResult.winnerName} (+{gameState.roundResult.pointsEarned || 100} pts)
                </p>
              )}

              <button
                onClick={() => {
                  triggerHaptic(hapticPatterns.tap);
                  sendGameAction('four_pics_next_stage');
                }}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-black font-display font-black text-xs uppercase shadow-md active:scale-95 transition-all flex items-center justify-center space-x-2"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>STAGE SUIVANT</span>
                {Boolean(gameState.autoAdvanceSeconds) && (
                  <span className="px-1.5 py-0.2 rounded-full bg-black/20 text-[10px] font-mono font-bold">
                    {gameState.autoAdvanceSeconds}s
                  </span>
                )}
              </button>
            </div>
          )}
        </div>

        {/* 4. Tactile Keyboard Grid */}
        <div className="space-y-1.5">
          <div className={`grid ${letterTiles.length > 12 ? 'grid-cols-7 sm:grid-cols-8' : 'grid-cols-6'} gap-1.5`}>
            {letterTiles.map((tile) => {
              if (tile.isRemoved) {
                return (
                  <div
                    key={tile.id}
                    className="h-11 rounded-xl bg-white/5 border border-white/5 opacity-20 flex items-center justify-center"
                  />
                );
              }

              return (
                <button
                  key={tile.id}
                  disabled={tile.isUsed || isSolvedByMe || isRevealed}
                  onClick={() => handleSelectTile(tile.id)}
                  className={`h-11 rounded-xl font-display font-black text-base border transition-all flex items-center justify-center shadow-sm active:scale-90 ${
                    tile.isUsed
                      ? 'bg-[#101420]/40 border-white/10 text-gray-600 opacity-40'
                      : 'bg-[#181F33] border-white/20 text-white hover:border-emerald-400 hover:bg-white hover:text-black'
                  }`}
                >
                  {tile.char}
                </button>
              );
            })}
          </div>

          {/* Action Tools: Delete, Clear, Hints */}
          <div className="grid grid-cols-4 gap-1.5 pt-0.5">
            <button
              onClick={handleBackspace}
              disabled={selectedLetterIds.length === 0 || isSolvedByMe || isRevealed}
              className="py-2 rounded-xl bg-[#121622] border border-white/15 text-gray-300 font-bold text-xs flex items-center justify-center space-x-1 active:scale-95 disabled:opacity-40"
            >
              <Delete className="w-3.5 h-3.5" />
              <span>Effacer</span>
            </button>

            <button
              onClick={handleClear}
              disabled={selectedLetterIds.length === 0 || isSolvedByMe || isRevealed}
              className="py-2 rounded-xl bg-[#121622] border border-white/15 text-rose-400 font-bold text-xs flex items-center justify-center space-x-1 active:scale-95 disabled:opacity-40"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Vider</span>
            </button>

            <button
              onClick={handleHintReveal}
              disabled={isSolvedByMe || isRevealed}
              className="py-2 rounded-xl bg-[#121622] border border-amber-500/30 text-amber-400 font-bold text-[11px] flex items-center justify-center space-x-1 active:scale-95 disabled:opacity-40"
              title="Révéler une lettre (-30 pts)"
            >
              <Lightbulb className="w-3.5 h-3.5" />
              <span>Lettre (-30)</span>
            </button>

            <button
              onClick={handleHintRemove}
              disabled={isSolvedByMe || isRevealed}
              className="py-2 rounded-xl bg-[#121622] border border-emerald-500/30 text-emerald-400 font-bold text-[11px] flex items-center justify-center space-x-1 active:scale-95 disabled:opacity-40"
              title="Retirer 3 fausses lettres (-20 pts)"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>3 Faux (-20)</span>
            </button>
          </div>
        </div>

        {/* 5. Live Reaction Bar */}
        <ReactionFlinger />
      </main>

      {/* 6. Image Zoom Modal on Smartphone */}
      {inspectImageIndex !== null && currentPuzzle.images[inspectImageIndex] && (
        <div
          onClick={() => setInspectImageIndex(null)}
          className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-4 select-none animate-scale-in"
        >
          <div className="relative max-w-sm w-full rounded-2xl overflow-hidden border border-white/20 shadow-2xl">
            <img
              src={currentPuzzle.images[inspectImageIndex]}
              alt={`Indice #${inspectImageIndex + 1}`}
              className="w-full h-auto max-h-[70vh] object-contain mx-auto"
            />
            <div className="p-2.5 bg-[#121622] text-center">
              <span className="text-xs font-black text-amber-400">INDICE #{inspectImageIndex + 1}</span>
            </div>
            <button
              onClick={() => setInspectImageIndex(null)}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-black/80 text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
