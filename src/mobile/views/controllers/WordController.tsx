import React, { useState, useMemo } from 'react';
import { useGame } from '../../../context/GameContext';
import { ScrabbleGameState } from '../../../types/game';
import { MobileHeader } from '../../components/MobileHeader';
import { ReactionFlinger } from '../../components/ReactionFlinger';
import { triggerHaptic, hapticPatterns } from '../../components/HapticFeedback';
import { audio } from '../../../services/audio';
import { Check, SkipForward, Trash2, ArrowRight, ArrowDown, Grid, Sparkles, BookOpen, AlertCircle } from 'lucide-react';

interface TileItem {
  id: string;
  letter: string;
  points: number;
}

const MULTIPLIERS_MAP: Record<string, { label: string; bg: string; text: string }> = {
  TW: { label: 'MT', bg: 'bg-rose-600', text: 'text-white' },
  DW: { label: 'MD', bg: 'bg-pink-500', text: 'text-white' },
  TL: { label: 'LT', bg: 'bg-blue-600', text: 'text-white' },
  DL: { label: 'LD', bg: 'bg-sky-500', text: 'text-white' },
  CENTER: { label: '★', bg: 'bg-brand-red', text: 'text-white' },
};

function getMultiplier(r: number, c: number): string {
  if (r === 7 && c === 7) return 'CENTER';
  if ((r === 0 || r === 7 || r === 14) && (c === 0 || c === 7 || c === 14) && !(r === 7 && c === 7)) return 'TW';
  if ((r === c || r + c === 14) && (r >= 1 && r <= 4 || r >= 10 && r <= 13)) return 'DW';
  if ((r === 1 || r === 5 || r === 9 || r === 13) && (c === 1 || c === 5 || c === 9 || c === 13)) return 'TL';
  if ((r === 0 || r === 14) && (c === 3 || c === 11) || (r === 2 || r === 12) && (c === 6 || c === 8) || (r === 3 || r === 11) && (c === 0 || c === 7 || c === 14) || (r === 6 || r === 8) && (c === 2 || c === 6 || c === 8 || c === 12) || (r === 7) && (c === 3 || c === 11)) return 'DL';
  return 'NONE';
}

export const WordController: React.FC = () => {
  const { room, localPlayer, sendGameAction } = useGame();
  const gameState = room?.gameState as ScrabbleGameState | undefined;

  const [composedWord, setComposedWord] = useState<TileItem[]>([]);
  const [startRow, setStartRow] = useState<number>(7);
  const [startCol, setStartCol] = useState<number>(10);
  const [direction, setDirection] = useState<'horizontal' | 'vertical'>('horizontal');

  if (!gameState || !localPlayer) return null;

  const isMyTurn = gameState.currentPlayerId === localPlayer.id;
  const myRack: TileItem[] = (gameState.playerRacks && gameState.playerRacks[localPlayer.id]) || [];

  const handleAddTile = (tile: TileItem) => {
    triggerHaptic(hapticPatterns.tap);
    audio.playFocus();
    setComposedWord((prev) => [...prev, tile]);
  };

  const handleRemoveTile = (tileId: string) => {
    triggerHaptic(hapticPatterns.tap);
    setComposedWord((prev) => prev.filter((t) => t.id !== tileId));
  };

  const handleClear = () => {
    triggerHaptic(hapticPatterns.tap);
    setComposedWord([]);
  };

  const handleSelectCell = (r: number, c: number) => {
    triggerHaptic(hapticPatterns.tap);
    audio.playFocus();
    setStartRow(r);
    setStartCol(c);
  };

  const handleToggleDirection = () => {
    triggerHaptic(hapticPatterns.tap);
    audio.playFocus();
    setDirection((prev) => (prev === 'horizontal' ? 'vertical' : 'horizontal'));
  };

  // Compute exact cell assignments for newly placed tiles, skipping occupied board cells
  const placedTilePlacements = useMemo(() => {
    const placements: { row: number; col: number; tile: TileItem }[] = [];
    let curR = startRow;
    let curC = startCol;

    for (let i = 0; i < composedWord.length; i++) {
      // Find the next available empty cell along the direction
      while (curR < 15 && curC < 15 && gameState.board[curR]?.[curC] !== null) {
        if (direction === 'horizontal') curC++;
        else curR++;
      }

      if (curR < 15 && curC < 15) {
        placements.push({
          row: curR,
          col: curC,
          tile: composedWord[i],
        });
        if (direction === 'horizontal') curC++;
        else curR++;
      }
    }
    return placements;
  }, [composedWord, startRow, startCol, direction, gameState.board]);

  // Compute the COMPLETE reconstructed word formed on the board
  const fullFormedWordString = useMemo(() => {
    if (placedTilePlacements.length === 0) return '';

    // Create a virtual line copy
    const virtualBoard = gameState.board.map((row) => row.map((cell) => (cell ? { ...cell } : null)));
    for (const p of placedTilePlacements) {
      virtualBoard[p.row][p.col] = {
        letter: p.tile.letter,
        points: p.tile.points,
      };
    }

    let word = '';
    if (direction === 'horizontal') {
      const r = placedTilePlacements[0].row;
      const cols = placedTilePlacements.map((p) => p.col);
      let minC = Math.min(...cols);
      let maxC = Math.max(...cols);

      while (minC > 0 && virtualBoard[r][minC - 1] !== null) minC--;
      while (maxC < 14 && virtualBoard[r][maxC + 1] !== null) maxC++;

      for (let c = minC; c <= maxC; c++) {
        const cell = virtualBoard[r][c];
        if (cell) word += cell.letter;
      }
    } else {
      const c = placedTilePlacements[0].col;
      const rows = placedTilePlacements.map((p) => p.row);
      let minR = Math.min(...rows);
      let maxR = Math.max(...rows);

      while (minR > 0 && virtualBoard[minR - 1][c] !== null) minR--;
      while (maxR < 14 && virtualBoard[maxR + 1][c] !== null) maxR++;

      for (let r = minR; r <= maxR; r++) {
        const cell = virtualBoard[r][c];
        if (cell) word += cell.letter;
      }
    }

    return word.toUpperCase();
  }, [placedTilePlacements, direction, gameState.board]);

  const handleValidateWord = () => {
    if (!isMyTurn || placedTilePlacements.length === 0) return;
    triggerHaptic(hapticPatterns.success);
    audio.playSelect();

    const tilesPlaced = placedTilePlacements.map((p) => ({
      row: p.row,
      col: p.col,
      letter: p.tile.letter,
      tileId: p.tile.id,
    }));

    sendGameAction('word_play_word', { tilesPlaced });
    setComposedWord([]);
  };

  const handlePass = () => {
    if (!isMyTurn) return;
    triggerHaptic(hapticPatterns.tap);
    sendGameAction('word_pass_turn');
    setComposedWord([]);
  };

  const potentialScore = composedWord.reduce((sum, t) => sum + t.points, 0);

  const getPreviewTileAt = (r: number, c: number) => {
    return placedTilePlacements.find((p) => p.row === r && p.col === c)?.tile || null;
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-background text-white select-none">
      <MobileHeader />

      <main className="p-3 flex-1 flex flex-col justify-between space-y-3">
        {/* Turn Status Banner */}
        <div
          className={`p-2.5 rounded-2xl text-center border transition-all ${
            isMyTurn
              ? 'bg-brand-gold/20 border-brand-gold shadow-glow-gold'
              : 'bg-surface-card border-white/10 text-gray-400'
          }`}
        >
          <div className="flex items-center justify-between px-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-brand-gold">
              {isMyTurn ? '🌟 VOTRE TOUR DE JOUER' : 'TOUR ADVERSE'}
            </span>
            <div className="flex items-center space-x-1 font-mono font-bold text-xs text-white">
              <span>{direction === 'horizontal' ? '↔ Ligne ' + (startRow + 1) : '↕ Colonne ' + (startCol + 1)}</span>
            </div>
          </div>
        </div>

        {/* Complete Word Live Formation Display */}
        {fullFormedWordString && (
          <div className="p-3 rounded-2xl bg-surface-card border-2 border-brand-cyan/60 shadow-glow-cyan flex items-center justify-between animate-scale-in">
            <div className="flex items-center space-x-2">
              <BookOpen className="w-4 h-4 text-brand-cyan" />
              <span className="text-[10px] font-black uppercase text-gray-300">Mot complet formé :</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-black font-mono tracking-widest text-brand-cyan">
                "{fullFormedWordString}"
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand-cyan/20 text-brand-cyan">
                +{potentialScore} pts
              </span>
            </div>
          </div>
        )}

        {/* Interactive 15x15 Mini Scrabble Table */}
        <div className="rounded-3xl bg-[#1A140F] border-2 border-[#3A2D23] p-2 shadow-2xl space-y-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center space-x-2">
              <Grid className="w-4 h-4 text-brand-gold" />
              <span className="text-xs font-black uppercase tracking-wide text-gray-200">
                TABLEAU SCRABBLE ({direction === 'horizontal' ? 'HORIZONTAL ➔' : 'VERTICAL ⬇'})
              </span>
            </div>

            <button
              onClick={handleToggleDirection}
              className="px-2.5 py-1 rounded-lg bg-surface-card border border-white/15 text-xs font-bold text-brand-cyan flex items-center space-x-1 active:scale-95 transition-all"
            >
              {direction === 'horizontal' ? <ArrowRight className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />}
              <span>{direction === 'horizontal' ? 'Horizontal' : 'Vertical'}</span>
            </button>
          </div>

          {/* 15x15 Mini Grid */}
          <div className="w-full aspect-square overflow-hidden bg-[#100C09] p-1 rounded-2xl border border-white/10">
            <div
              className="w-full h-full grid grid-cols-15 grid-rows-15 gap-0.5"
              style={{ gridTemplateColumns: 'repeat(15, minmax(0, 1fr))', gridTemplateRows: 'repeat(15, minmax(0, 1fr))' }}
            >
              {gameState.board.map((row, rIdx) =>
                row.map((boardTile, cIdx) => {
                  const isSelectedStart = rIdx === startRow && cIdx === startCol;
                  const previewTile = getPreviewTileAt(rIdx, cIdx);
                  const mult = getMultiplier(rIdx, cIdx);
                  const multConfig = MULTIPLIERS_MAP[mult];

                  return (
                    <button
                      key={`grid_${rIdx}_${cIdx}`}
                      onClick={() => handleSelectCell(rIdx, cIdx)}
                      className={`relative w-full h-full rounded-sm flex items-center justify-center font-display font-black text-[9px] transition-all leading-none ${
                        isSelectedStart
                          ? 'ring-2 ring-brand-gold bg-amber-400 text-gray-900 z-20 scale-110 shadow-lg'
                          : previewTile
                          ? 'bg-emerald-400 text-gray-900 ring-1 ring-emerald-200 z-10 animate-pulse'
                          : boardTile
                          ? 'bg-[#EAD7B2] text-gray-900 shadow-sm'
                          : multConfig
                          ? `${multConfig.bg} ${multConfig.text} opacity-90`
                          : 'bg-[#221A14]/80 text-gray-600 hover:bg-[#34281F]'
                      }`}
                    >
                      {previewTile ? (
                        <span>{previewTile.letter}</span>
                      ) : boardTile ? (
                        <span>{boardTile.letter}</span>
                      ) : multConfig ? (
                        <span className="text-[7px] font-sans font-black">{multConfig.label}</span>
                      ) : null}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-gray-400 px-1">
            <span>📍 Case départ : <strong className="text-white">Ligne {startRow + 1}, Col {startCol + 1}</strong></span>
            <span className="text-brand-gold">Touchez une case pour viser</span>
          </div>
        </div>

        {/* Word Builder Construction Area */}
        <div className="p-3 rounded-2xl bg-surface-card border border-white/10 space-y-2 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-gray-300">LETTRES POSÉES DEPUIS LE CHEVALET</span>
            <div className="flex items-center space-x-2">
              {composedWord.length > 0 && (
                <button onClick={handleClear} className="p-1 text-gray-400 hover:text-white">
                  <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                </button>
              )}
            </div>
          </div>

          {/* Letter Slots */}
          <div className="flex items-center space-x-1.5 min-h-[44px] p-1.5 rounded-xl bg-surface-dark border border-dashed border-white/20 overflow-x-auto">
            {composedWord.length === 0 ? (
              <span className="text-xs text-gray-500 mx-auto">Touchez vos lettres ci-dessous pour former un mot</span>
            ) : (
              composedWord.map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleRemoveTile(t.id)}
                  className="w-9 h-9 rounded-xl bg-[#EAD7B2] border border-[#D5BE93] text-gray-900 font-black font-display text-base flex items-center justify-center relative shadow-md active:scale-90 transition-transform flex-shrink-0"
                >
                  <span>{t.letter}</span>
                  <span className="absolute bottom-0.5 right-0.5 text-[7px] text-gray-700 font-sans font-bold leading-none">
                    {t.points}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Secret Player Rack of 7 Tiles */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-black uppercase text-gray-300 block">
            VOTRE CHEVALET PRIVÉ (7 LETTRES)
          </span>

          <div className="grid grid-cols-7 gap-1.5 p-2.5 rounded-2xl bg-[#2A1F18] border-2 border-[#543E30] shadow-2xl">
            {myRack.map((tile: TileItem) => {
              const isUsed = composedWord.some((w) => w.id === tile.id);
              return (
                <button
                  key={tile.id}
                  disabled={isUsed || !isMyTurn}
                  onClick={() => handleAddTile(tile)}
                  className={`aspect-square rounded-xl flex flex-col items-center justify-center font-display font-black text-lg relative transition-all ${
                    isUsed
                      ? 'bg-black/40 border border-white/5 text-gray-600 opacity-25'
                      : 'bg-[#EAD7B2] border-2 border-[#D5BE93] text-gray-900 shadow-lg hover:scale-105 active:scale-90'
                  }`}
                >
                  <span className="leading-none">{tile.letter}</span>
                  <span className="absolute bottom-0.5 right-0.5 text-[8px] text-gray-700 font-sans font-bold leading-none">
                    {tile.points}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Buttons: Validate Word & Pass Turn */}
        <div className="grid grid-cols-3 gap-2">
          <button
            disabled={!isMyTurn || composedWord.length === 0}
            onClick={handleValidateWord}
            className="col-span-2 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-black text-xs shadow-glow-emerald disabled:opacity-40 flex items-center justify-center space-x-2 active:scale-95 transition-all"
          >
            <Check className="w-4 h-4" />
            <span>VALIDER LE MOT COMPLET</span>
          </button>

          <button
            disabled={!isMyTurn}
            onClick={handlePass}
            className="py-3.5 rounded-2xl bg-surface-card border border-white/10 text-gray-300 font-bold text-xs hover:text-white disabled:opacity-40 flex items-center justify-center space-x-1 active:scale-95 transition-all"
          >
            <SkipForward className="w-3.5 h-3.5" />
            <span>PASSER</span>
          </button>
        </div>

        <ReactionFlinger />
      </main>
    </div>
  );
};
