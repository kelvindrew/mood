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
} from 'lucide-react';

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
  const [feedbackSuccess, setFeedbackSuccess] = useState<boolean>(false);
  const [inspectImageIndex, setInspectImageIndex] = useState<number | null>(null);

  const currentPuzzle = gameState?.currentPuzzle;
  const wordLength = currentPuzzle?.wordLength || 5;

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
      setFeedbackSuccess(false);
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

    sendGameAction('four_pics_guess', { word: wordToSubmit });

    // Client-side quick check
    if (wordToSubmit.toUpperCase() === currentPuzzle.hint) {
      setFeedbackSuccess(true);
      triggerHaptic(hapticPatterns.success);
      playSoundFX.playDiceSixBonus();
    } else {
      setTimeout(() => {
        if (!isSolvedByMe) {
          setFeedbackError('Ce n’est pas le bon mot. Réessayez !');
          triggerHaptic(hapticPatterns.error);
        }
      }, 300);
    }
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

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#07090E] text-white select-none relative overflow-hidden">
      <MobileHeader />

      <main className="p-4 flex-1 flex flex-col justify-between space-y-3 relative z-10">
        {/* 1. Header: Category & Score & Combo */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-[#101420] border border-white/15 shadow-md">
          <div>
            <span className="text-[10px] font-black uppercase text-[#00F2FE] tracking-wider block">
              {currentPuzzle.category}
            </span>
            <span className="text-xs font-bold text-gray-300">
              Niveau {currentPuzzle.difficulty}/10 • {currentPuzzle.difficultyLabel}
            </span>
          </div>

          <div className="flex items-center space-x-3 text-right">
            {myCombo >= 2 && (
              <div className="px-2 py-1 rounded-xl bg-gradient-to-r from-red-600 to-amber-500 text-white font-black text-xs shadow-md flex items-center space-x-1 animate-pulse">
                <Flame className="w-3.5 h-3.5" />
                <span>x{myCombo}</span>
              </div>
            )}
            <div>
              <span className="text-[9px] font-black uppercase text-gray-400 block">VOTRE SCORE</span>
              <span className="text-sm font-mono font-black text-[#FFB800]">{myScore} PTS</span>
            </div>
          </div>
        </div>

        {/* 2. 4 Mini Thumbnails Preview with Click-to-Zoom */}
        <div className="grid grid-cols-4 gap-2">
          {currentPuzzle.images.map((img, i) => (
            <div
              key={`thumb_${i}`}
              onClick={() => setInspectImageIndex(i)}
              className="relative aspect-square rounded-2xl overflow-hidden bg-[#101420] border-2 border-white/20 shadow-md cursor-pointer group"
            >
              <img src={img} alt={`Indice ${i + 1}`} className="w-full h-full object-cover" />
              <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md bg-black/70 text-[9px] font-mono font-bold text-[#FFB800]">
                #{i + 1}
              </span>
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <ZoomIn className="w-4 h-4 text-white" />
              </div>
            </div>
          ))}
        </div>

        {/* 3. Word Mystery Slots (Composed Letters) */}
        <div className="space-y-2 text-center">
          <div className="flex items-center justify-center space-x-2">
            {Array.from({ length: wordLength }).map((_, idx) => {
              const char = composedWord[idx] || '';

              return (
                <button
                  key={`slot_${idx}`}
                  onClick={() => handleRemovePlacedSlot(idx)}
                  className={`w-11 h-13 rounded-2xl border-2 font-display font-black text-xl flex items-center justify-center transition-all shadow-md ${
                    char
                      ? 'bg-gradient-to-tr from-[#E50914] to-[#FF2E63] border-white text-white scale-105 animate-scale-in'
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

          {isSolvedByMe && (
            <div className="p-2.5 rounded-2xl bg-emerald-950/80 border border-[#10B981] text-[#10B981] text-xs font-black flex items-center justify-center space-x-1.5 animate-scale-in">
              <CheckCircle2 className="w-4 h-4" />
              <span>VOUS AVEZ TROUVÉ LA BONNE RÉPONSE ! 🎉</span>
            </div>
          )}
        </div>

        {/* 4. Tactile Keyboard Grid */}
        <div className="space-y-2">
          <div className="grid grid-cols-6 gap-2">
            {letterTiles.map((tile) => {
              if (tile.isRemoved) {
                return (
                  <div
                    key={tile.id}
                    className="h-12 rounded-xl bg-surface-dark/40 border border-white/5 opacity-20 flex items-center justify-center"
                  />
                );
              }

              return (
                <button
                  key={tile.id}
                  disabled={tile.isUsed || isSolvedByMe || isRevealed}
                  onClick={() => handleSelectTile(tile.id)}
                  className={`h-12 rounded-2xl font-display font-black text-lg border-2 transition-all flex items-center justify-center shadow-lg active:scale-90 ${
                    tile.isUsed
                      ? 'bg-[#101420]/40 border-white/10 text-gray-600 opacity-40'
                      : 'bg-[#181F33] border-white/25 text-white hover:border-[#00F2FE] hover:bg-white hover:text-gray-950'
                  }`}
                >
                  {tile.char}
                </button>
              );
            })}
          </div>

          {/* Action Tools: Delete, Clear, Hints */}
          <div className="grid grid-cols-4 gap-2 pt-1">
            <button
              onClick={handleBackspace}
              disabled={selectedLetterIds.length === 0 || isSolvedByMe || isRevealed}
              className="py-2.5 rounded-xl bg-[#101420] border border-white/20 text-gray-300 font-black text-xs flex items-center justify-center space-x-1 active:scale-95 disabled:opacity-40"
            >
              <Delete className="w-4 h-4" />
              <span>Effacer</span>
            </button>

            <button
              onClick={handleClear}
              disabled={selectedLetterIds.length === 0 || isSolvedByMe || isRevealed}
              className="py-2.5 rounded-xl bg-[#101420] border border-white/20 text-rose-400 font-black text-xs flex items-center justify-center space-x-1 active:scale-95 disabled:opacity-40"
            >
              <Trash2 className="w-4 h-4" />
              <span>Vider</span>
            </button>

            <button
              onClick={handleHintReveal}
              disabled={isSolvedByMe || isRevealed}
              className="py-2.5 rounded-xl bg-[#101420] border border-[#FFB800]/40 text-[#FFB800] font-black text-[11px] flex items-center justify-center space-x-1 active:scale-95 disabled:opacity-40"
              title="Révéler une lettre (-30 pts)"
            >
              <Lightbulb className="w-3.5 h-3.5" />
              <span>Lettre (-30)</span>
            </button>

            <button
              onClick={handleHintRemove}
              disabled={isSolvedByMe || isRevealed}
              className="py-2.5 rounded-xl bg-[#101420] border border-[#00F2FE]/40 text-[#00F2FE] font-black text-[11px] flex items-center justify-center space-x-1 active:scale-95 disabled:opacity-40"
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
          className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-6 select-none animate-scale-in"
        >
          <div className="relative max-w-sm w-full rounded-3xl overflow-hidden border-2 border-[#00F2FE] shadow-2xl">
            <img
              src={currentPuzzle.images[inspectImageIndex]}
              alt={`Indice #${inspectImageIndex + 1}`}
              className="w-full h-auto max-h-[70vh] object-contain"
            />
            <div className="p-3 bg-[#101420] text-center">
              <span className="text-xs font-black text-[#FFB800]">INDICE #{inspectImageIndex + 1}</span>
            </div>
            <button
              onClick={() => setInspectImageIndex(null)}
              className="absolute top-3 right-3 p-2 rounded-full bg-black/80 text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
