import React, { useState, useEffect } from 'react';
import { useGame } from '../../../context/GameContext';
import { FourPicsGameState } from '../../../types/game';
import { MobileHeader } from '../../components/MobileHeader';
import { ReactionFlinger } from '../../components/ReactionFlinger';
import { triggerHaptic, hapticPatterns } from '../../components/HapticFeedback';
import { audio } from '../../../services/audio';
import { Check, Delete, Trash2, Sparkles, Trophy, Clock, AlertCircle } from 'lucide-react';

interface LetterTile {
  id: string;
  char: string;
  isUsed: boolean;
}

export const FourPicsController: React.FC = () => {
  const { room, localPlayer, sendGameAction } = useGame();
  const gameState = room?.gameState as FourPicsGameState | undefined;

  const [letterTiles, setLetterTiles] = useState<LetterTile[]>([]);
  const [selectedLetterIds, setSelectedLetterIds] = useState<string[]>([]);
  const [feedbackError, setFeedbackError] = useState<string>('');

  const currentPuzzle = gameState?.currentPuzzle;
  const wordLength = currentPuzzle?.wordLength || 5;

  // Initialize or reset letter pool when round changes
  useEffect(() => {
    if (gameState?.scrambledLetters) {
      const tiles: LetterTile[] = gameState.scrambledLetters.map((char, idx) => ({
        id: `tile_${idx}_${char}_${gameState.roundNumber}`,
        char,
        isUsed: false,
      }));
      setLetterTiles(tiles);
      setSelectedLetterIds([]);
      setFeedbackError('');
    }
  }, [gameState?.roundNumber, gameState?.currentPuzzle?.id]);

  if (!gameState || !currentPuzzle || !localPlayer) return null;

  const isSolvedByMe = gameState.solvedPlayersThisRound?.includes(localPlayer.id);
  const isRevealed = gameState.roundStatus === 'revealed';

  // Construct current composed word string
  const composedWord = selectedLetterIds
    .map((id) => letterTiles.find((t) => t.id === id)?.char || '')
    .join('');

  const handleSelectTile = (tileId: string) => {
    if (selectedLetterIds.length >= wordLength || isSolvedByMe || isRevealed) return;

    triggerHaptic(hapticPatterns.tap);
    audio.playFocus();
    setFeedbackError('');

    setSelectedLetterIds((prev) => [...prev, tileId]);
    setLetterTiles((prev) =>
      prev.map((t) => (t.id === tileId ? { ...t, isUsed: true } : t))
    );
  };

  const handleRemovePlacedSlot = (slotIndex: number) => {
    if (slotIndex >= selectedLetterIds.length || isSolvedByMe || isRevealed) return;

    triggerHaptic(hapticPatterns.tap);
    audio.playFocus();
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
    audio.playFocus();
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
    audio.playBack();
    setFeedbackError('');

    setSelectedLetterIds([]);
    setLetterTiles((prev) => prev.map((t) => ({ ...t, isUsed: false })));
  };

  const handleValidate = () => {
    if (selectedLetterIds.length !== wordLength || isSolvedByMe || isRevealed) return;

    triggerHaptic(hapticPatterns.success);
    audio.playSelect();

    sendGameAction('four_pics_submit_word', { word: composedWord });
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-background text-white select-none">
      <MobileHeader />

      <main className="p-3.5 flex-1 flex flex-col justify-between space-y-3 animate-scale-in">
        {/* Top Status Banner */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-surface-card border border-white/10 shadow-md">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-brand-red to-brand-accent text-white text-[10px] font-black uppercase">
              MANCHE {gameState.roundNumber} / {gameState.totalRounds}
            </span>
            <span className="text-xs font-bold text-gray-300">{currentPuzzle.category}</span>
          </div>

          <div className="flex items-center space-x-1.5 font-mono font-bold text-xs text-brand-gold">
            <Clock className="w-3.5 h-3.5" />
            <span>{gameState.timeLeft}s</span>
          </div>
        </div>

        {/* Round Solved Banner */}
        {isSolvedByMe && (
          <div className="p-4 rounded-3xl bg-emerald-950/90 border-2 border-emerald-400 shadow-glow-emerald text-center space-y-1 animate-scale-in">
            <div className="flex items-center justify-center space-x-2 text-emerald-400 font-black text-sm uppercase">
              <Check className="w-5 h-5" />
              <span>VOUS AVEZ TROUVÉ EN PREMIER !</span>
            </div>
            <div className="text-2xl font-black font-mono tracking-widest text-white">
              "{composedWord}"
            </div>
            <p className="text-xs text-emerald-300">
              +{gameState.roundResult?.pointsAwarded || 100} points accordés !
            </p>
          </div>
        )}

        {/* Composed Word Answer Slots */}
        <div className="p-3.5 rounded-3xl bg-[#0F1422] border-2 border-white/15 shadow-xl space-y-2 text-center">
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">
              VOTRE RÉPONSE ({composedWord.length}/{wordLength} LETTRES)
            </span>
            {selectedLetterIds.length > 0 && !isSolvedByMe && (
              <button
                onClick={handleClear}
                className="text-[11px] font-bold text-rose-400 flex items-center space-x-1 active:scale-95"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Effacer</span>
              </button>
            )}
          </div>

          {/* Letter Slots */}
          <div className="flex items-center justify-center space-x-2 py-1">
            {Array.from({ length: wordLength }).map((_, idx) => {
              const tileId = selectedLetterIds[idx];
              const letter = tileId ? letterTiles.find((t) => t.id === tileId)?.char : null;

              return (
                <button
                  key={`slot_${idx}`}
                  disabled={!letter || isSolvedByMe || isRevealed}
                  onClick={() => handleRemovePlacedSlot(idx)}
                  className={`w-12 h-14 rounded-2xl border-2 flex items-center justify-center font-display font-black text-2xl shadow-lg transition-all ${
                    letter
                      ? 'bg-gradient-to-b from-[#EAD7B2] to-[#D5BE93] text-gray-900 border-[#FAF0DC] scale-105 active:scale-95'
                      : 'bg-surface-dark/80 border-dashed border-white/20 text-transparent'
                  }`}
                >
                  {letter || ''}
                </button>
              );
            })}
          </div>

          {feedbackError && (
            <div className="text-xs font-bold text-rose-400 flex items-center justify-center space-x-1 animate-shake">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{feedbackError}</span>
            </div>
          )}
        </div>

        {/* 2-Row Scrambled Letters Tactile Keyboard */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-black uppercase text-gray-400 block px-1">
            LETTRES DISPONIBLES (TOUCHEZ DANS L'ORDRE)
          </span>

          <div className="grid grid-cols-6 gap-2 p-3 rounded-3xl bg-surface-card border border-white/10 shadow-2xl">
            {letterTiles.map((tile) => (
              <button
                key={tile.id}
                disabled={tile.isUsed || isSolvedByMe || isRevealed}
                onClick={() => handleSelectTile(tile.id)}
                className={`h-13 aspect-square rounded-2xl font-display font-black text-xl flex items-center justify-center transition-all ${
                  tile.isUsed
                    ? 'bg-surface-dark border border-white/5 text-gray-700 opacity-30 shadow-inner'
                    : 'bg-gradient-to-br from-surface-light via-slate-800 to-surface-dark text-white border-2 border-white/25 shadow-md active:scale-90 hover:scale-105 hover:border-brand-gold'
                }`}
              >
                {tile.char}
              </button>
            ))}
          </div>
        </div>

        {/* Bottom Control Buttons */}
        <div className="grid grid-cols-4 gap-2">
          <button
            disabled={selectedLetterIds.length === 0 || isSolvedByMe || isRevealed}
            onClick={handleBackspace}
            className="py-4 rounded-2xl bg-surface-card border border-white/15 text-gray-300 font-bold text-xs disabled:opacity-30 flex items-center justify-center space-x-1 active:scale-95 transition-all shadow-md"
            title="Effacer dernière lettre"
          >
            <Delete className="w-4 h-4" />
            <span>Effacer</span>
          </button>

          <button
            disabled={selectedLetterIds.length !== wordLength || isSolvedByMe || isRevealed}
            onClick={handleValidate}
            className="col-span-3 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black text-base shadow-glow-emerald disabled:opacity-35 flex items-center justify-center space-x-2 active:scale-95 transition-all border border-white/20"
          >
            <Check className="w-5 h-5" />
            <span>VALIDER LE MOT ({composedWord.length}/{wordLength})</span>
          </button>
        </div>

        <ReactionFlinger />
      </main>
    </div>
  );
};
