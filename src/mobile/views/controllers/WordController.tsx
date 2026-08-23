import React, { useState, useMemo } from 'react';
import { useGame } from '../../../context/GameContext';
import { ScrabbleGameState } from '../../../types/game';
import { MobileHeader } from '../../components/MobileHeader';
import { ReactionFlinger } from '../../components/ReactionFlinger';
import { triggerHaptic, hapticPatterns } from '../../components/HapticFeedback';
import { audio } from '../../../services/audio';
import {
  Check,
  SkipForward,
  RotateCcw,
  ArrowRight,
  ArrowDown,
  Grid,
  Sparkles,
  BookOpen,
  RefreshCw,
  X,
  Trophy,
  Crown,
  Home,
} from 'lucide-react';
import { getFrenchDefinition } from '../../../data/frenchDefinitions';

function getMultiplier(r: number, c: number): string {
  if (r === 7 && c === 7) return 'CENTER';
  if ((r === 0 || r === 7 || r === 14) && (c === 0 || c === 7 || c === 14) && !(r === 7 && c === 7)) return 'TW';
  if ((r === c || r + c === 14) && ((r >= 1 && r <= 4) || (r >= 10 && r <= 13))) return 'DW';
  if ((r === 1 || r === 5 || r === 9 || r === 13) && (c === 5 || c === 9) ||
      (r === 5 || r === 9) && (c === 1 || c === 13)) return 'TL';
  if (
    (r === 0 || r === 14) && (c === 3 || c === 11) ||
    (r === 2 || r === 12) && (c === 6 || c === 8) ||
    (r === 3 || r === 11) && (c === 0 || c === 7 || c === 14) ||
    (r === 6 || r === 8) && (c === 2 || c === 6 || c === 8 || c === 12) ||
    (r === 7) && (c === 3 || c === 11)
  ) return 'DL';
  return 'NONE';
}

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
  CENTER: { label: '★', bg: 'bg-amber-400', text: 'text-black' },
};

export const WordController: React.FC = () => {
  const { room, localPlayer, sendGameAction } = useGame();
  const gameState = room?.gameState as ScrabbleGameState | undefined;

  const [composedWord, setComposedWord] = useState<TileItem[]>([]);
  const [startRow, setStartRow] = useState<number>(7);
  const [startCol, setStartCol] = useState<number>(7);
  const [direction, setDirection] = useState<'horizontal' | 'vertical'>('horizontal');
  const [showSwapModal, setShowSwapModal] = useState<boolean>(false);
  const [selectedSwapIds, setSelectedSwapIds] = useState<string[]>([]);
  const [localError, setLocalError] = useState<string>('');

  if (!gameState || !localPlayer) return null;

  const isGameOver = !!(gameState.isGameOver || gameState.winner);
  const isMyTurn = !isGameOver && gameState.currentPlayerId === localPlayer.id;
  const myRack: TileItem[] = (gameState.playerRacks && gameState.playerRacks[localPlayer.id]) || [];

  const myPodiumInfo = gameState.finalPodium?.find((p) => p.id === localPlayer.id);

  const handleAddTile = (tile: TileItem) => {
    if (isGameOver) return;
    triggerHaptic(hapticPatterns.tap);
    audio.playFocus();
    setLocalError('');
    setComposedWord((prev) => [...prev, tile]);
  };

  const handleRemoveTile = (tileId: string) => {
    if (isGameOver) return;
    triggerHaptic(hapticPatterns.tap);
    setLocalError('');
    setComposedWord((prev) => prev.filter((t) => t.id !== tileId));
  };

  const handleClear = () => {
    if (isGameOver) return;
    triggerHaptic(hapticPatterns.tap);
    setLocalError('');
    setComposedWord([]);
  };

  const handleSelectCell = (r: number, c: number) => {
    if (isGameOver) return;
    triggerHaptic(hapticPatterns.tap);
    audio.playFocus();
    setLocalError('');
    setStartRow(r);
    setStartCol(c);
  };

  const handleToggleDirection = () => {
    if (isGameOver) return;
    triggerHaptic(hapticPatterns.tap);
    audio.playFocus();
    setLocalError('');
    setDirection((prev) => (prev === 'horizontal' ? 'vertical' : 'horizontal'));
  };

  // Compute exact cell assignments for newly placed tiles, skipping occupied board cells
  const placedTilePlacements = useMemo(() => {
    const placements: { row: number; col: number; tile: TileItem }[] = [];
    let curR = startRow;
    let curC = startCol;

    for (let i = 0; i < composedWord.length; i++) {
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
    if (!isMyTurn || isGameOver || placedTilePlacements.length === 0) return;
    triggerHaptic(hapticPatterns.success);
    audio.playSelect();
    setLocalError('');

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
    if (!isMyTurn || isGameOver) return;
    triggerHaptic(hapticPatterns.tap);
    sendGameAction('word_pass_turn');
    setComposedWord([]);
    setLocalError('');
  };

  const handleToggleSwapTile = (tileId: string) => {
    setSelectedSwapIds((prev) =>
      prev.includes(tileId) ? prev.filter((id) => id !== tileId) : [...prev, tileId]
    );
  };

  const handleConfirmSwap = () => {
    if (selectedSwapIds.length === 0 || isGameOver) return;
    triggerHaptic(hapticPatterns.success);
    sendGameAction('word_swap_tiles', { tileIds: selectedSwapIds });
    setSelectedSwapIds([]);
    setShowSwapModal(false);
    setComposedWord([]);
  };

  const handleReplay = () => {
    triggerHaptic(hapticPatterns.success);
    sendGameAction('word_restart');
  };

  const potentialScore = composedWord.reduce((sum, t) => sum + t.points, 0);

  const getPreviewTileAt = (r: number, c: number) => {
    return placedTilePlacements.find((p) => p.row === r && p.col === c)?.tile || null;
  };

  // Game Over Mobile Screen
  if (isGameOver) {
    const isWinner = myPodiumInfo?.rank === 1;
    return (
      <div className="min-h-screen flex flex-col justify-between bg-[#0B100E] text-white select-none">
        <MobileHeader />

        <main className="p-4 flex-1 flex flex-col justify-center items-center text-center space-y-5 max-w-sm mx-auto w-full animate-scale-in">
          <div className="p-5 rounded-full bg-amber-500/20 border-2 border-amber-400 text-amber-300 shadow-[0_0_50px_rgba(251,191,36,0.4)]">
            {isWinner ? <Crown className="w-16 h-16 fill-current animate-bounce" /> : <Trophy className="w-16 h-16" />}
          </div>

          <div className="space-y-1">
            <span className="text-xs font-black uppercase tracking-widest text-[#FBBF24]">PARTIE TERMINÉE</span>
            <h1 className="text-3xl font-black font-display text-white">
              {isWinner ? '🎉 VICTOIRE !' : `${myPodiumInfo?.rank === 2 ? '🥈 2ème' : myPodiumInfo?.rank === 3 ? '🥉 3ème' : `${myPodiumInfo?.rank}ème`} Place`}
            </h1>
            <p className="text-xs text-gray-400">
              {gameState.finisherPlayerName
                ? `Terminé par ${gameState.finisherPlayerName}`
                : 'Fin par absence de coups'}
            </p>
          </div>

          {/* Player Final Score Card */}
          <div className="w-full p-4 rounded-3xl bg-white/[0.07] border border-white/15 space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-300 font-bold uppercase">Score Final</span>
              <span className="font-mono font-black text-3xl text-[#FBBF24]">{myPodiumInfo?.score || 0} pts</span>
            </div>

            <div className="flex items-center justify-between text-xs text-gray-400 border-t border-white/10 pt-2">
              <span>Points de jeu : {myPodiumInfo?.rawScore || 0}</span>
              {myPodiumInfo?.malusDeducted ? (
                <span className="text-rose-400 font-bold">-{myPodiumInfo.malusDeducted} malus</span>
              ) : null}
              {myPodiumInfo?.bonusReceived ? (
                <span className="text-emerald-400 font-bold">+{myPodiumInfo.bonusReceived} bonus</span>
              ) : null}
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10 text-center">
              <div className="p-2 rounded-xl bg-black/40">
                <div className="text-[9px] text-gray-400 uppercase">Meilleur Mot</div>
                <div className="font-mono font-bold text-xs text-emerald-300 truncate">
                  {myPodiumInfo?.stats?.bestWord || '—'}
                </div>
              </div>
              <div className="p-2 rounded-xl bg-black/40">
                <div className="text-[9px] text-gray-400 uppercase">Coup Max</div>
                <div className="font-mono font-bold text-xs text-[#38BDF8]">
                  +{myPodiumInfo?.stats?.maxTurnScore || 0} pts
                </div>
              </div>
              <div className="p-2 rounded-xl bg-black/40">
                <div className="text-[9px] text-gray-400 uppercase">Scrabbles</div>
                <div className="font-mono font-bold text-xs text-amber-300">
                  {myPodiumInfo?.stats?.scrabbleCount || 0}
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="w-full space-y-2.5 pt-2">
            <button
              onClick={handleReplay}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#10B981] to-[#059669] text-white font-black text-sm uppercase tracking-wider shadow-lg flex items-center justify-center space-x-2 active:scale-95 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>REJOUER UNE PARTIE</span>
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#0B100E] text-white select-none">
      <MobileHeader />

      <main className="p-3 flex-1 flex flex-col justify-between space-y-2.5 max-w-lg mx-auto w-full">
        {/* Turn Status Banner */}
        <div
          className={`p-2.5 rounded-2xl text-center border transition-all ${
            isMyTurn
              ? 'bg-[#10B981]/20 border-[#10B981] shadow-[0_0_15px_rgba(16,185,129,0.3)]'
              : 'bg-white/5 border-white/10 text-gray-400'
          }`}
        >
          <div className="flex items-center justify-between px-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-[#10B981]">
              {isMyTurn ? '🌟 VOTRE TOUR DE JOUER' : 'TOUR ADVERSE'}
            </span>
            <div className="flex items-center space-x-1 font-mono font-bold text-xs text-white">
              <span>{direction === 'horizontal' ? '↔ Ligne ' + (startRow + 1) : '↕ Colonne ' + (startCol + 1)}</span>
            </div>
          </div>
        </div>

        {/* Live Word Formation Display with Definition */}
        {fullFormedWordString && (
          <div className="p-2.5 rounded-2xl bg-white/[0.08] border-2 border-[#38BDF8] shadow-lg space-y-1.5 animate-scale-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-4 h-4 text-[#38BDF8]" />
                <span className="text-[10px] font-black uppercase text-gray-300">Mot formé :</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-base font-black font-mono tracking-widest text-[#38BDF8]">
                  "{fullFormedWordString}"
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#38BDF8]/20 text-[#38BDF8]">
                  +{potentialScore} pts
                </span>
              </div>
            </div>

            {/* Live Definition Preview */}
            <div className="p-2 rounded-xl bg-black/40 border border-white/10 text-[11px] text-gray-300 space-y-0.5">
              <div className="text-[10px] font-bold italic text-emerald-300 font-serif">
                — {getFrenchDefinition(fullFormedWordString).nature}
              </div>
              <p className="text-[10px] leading-tight text-gray-300">
                {getFrenchDefinition(fullFormedWordString).def}
              </p>
            </div>
          </div>
        )}

        {/* Interactive 15x15 Mini Scrabble Table */}
        <div className="rounded-3xl bg-[#140F0A] border-2 border-[#3A2D23] p-2 shadow-2xl space-y-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center space-x-1.5">
              <Grid className="w-4 h-4 text-[#FBBF24]" />
              <span className="text-[11px] font-black uppercase tracking-wide text-gray-200">
                TABLEAU SCRABBLE 15x15
              </span>
            </div>

            <button
              onClick={handleToggleDirection}
              className="px-2.5 py-1 rounded-xl bg-white/10 border border-white/15 text-xs font-bold text-[#38BDF8] flex items-center space-x-1 active:scale-95 transition-all"
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
                      className={`relative w-full h-full rounded-xs flex items-center justify-center font-display font-black text-[9px] transition-all leading-none ${
                        isSelectedStart
                          ? 'ring-2 ring-[#FBBF24] bg-amber-400 text-gray-950 z-20 scale-110 shadow-lg'
                          : previewTile
                          ? 'bg-[#10B981] text-white ring-1 ring-white z-10 animate-pulse'
                          : boardTile
                          ? 'bg-[#FBF2DE] text-gray-950 shadow-sm'
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

          <div className="flex items-center justify-between text-[10px] text-gray-400 px-1">
            <span>📍 Case départ : <strong className="text-white">Ligne {startRow + 1}, Col {startCol + 1}</strong></span>
            <span className="text-[#FBBF24]">Touchez une case pour viser</span>
          </div>
        </div>

        {/* Word Builder Construction Area */}
        <div className="p-2.5 rounded-2xl bg-white/[0.06] border border-white/10 space-y-1.5 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-gray-300">LETTRES POSÉES</span>
            {composedWord.length > 0 && (
              <button
                onClick={handleClear}
                className="text-xs text-rose-400 font-bold flex items-center space-x-1 hover:underline"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Rappeler tout</span>
              </button>
            )}
          </div>

          {/* Letter Slots */}
          <div className="flex items-center space-x-1.5 min-h-[44px] p-1.5 rounded-xl bg-black/40 border border-dashed border-white/20 overflow-x-auto">
            {composedWord.length === 0 ? (
              <span className="text-xs text-gray-500 mx-auto">Touchez vos lettres ci-dessous pour former un mot</span>
            ) : (
              composedWord.map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleRemoveTile(t.id)}
                  className="w-10 h-10 rounded-xl bg-[#FBF2DE] border border-[#D5C29A] text-gray-950 font-black font-display text-lg flex items-center justify-center relative shadow-md active:scale-90 transition-transform flex-shrink-0"
                >
                  <span>{t.letter}</span>
                  <span className="absolute bottom-0.5 right-0.5 text-[8px] text-gray-700 font-sans font-bold leading-none">
                    {t.points}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Secret Player Rack of 7 Tiles */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10px] font-black uppercase text-gray-300 px-1">
            <span>VOTRE CHEVALET PRIVÉ (7 LETTRES)</span>
            <span className="text-[#38BDF8]">{gameState.letterBagCount} dans le sac</span>
          </div>

          <div className="grid grid-cols-7 gap-1.5 p-2 rounded-2xl bg-[#2A1F18] border-2 border-[#543E30] shadow-2xl">
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
                      : 'bg-[#FBF2DE] border-2 border-[#D5C29A] text-gray-950 shadow-lg hover:scale-105 active:scale-90'
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

        {/* Action Controls: Validate Word, Swap Letters, Pass Turn */}
        <div className="grid grid-cols-4 gap-2 pt-1">
          <button
            disabled={!isMyTurn || composedWord.length === 0}
            onClick={handleValidateWord}
            className="col-span-2 py-3.5 rounded-2xl bg-gradient-to-r from-[#10B981] via-[#059669] to-[#F59E0B] text-white font-black text-xs shadow-lg disabled:opacity-30 flex items-center justify-center space-x-1.5 active:scale-95 transition-all"
          >
            <Check className="w-4 h-4" />
            <span>VALIDER LE COUP</span>
          </button>

          <button
            disabled={!isMyTurn || gameState.letterBagCount < 7}
            onClick={() => setShowSwapModal(true)}
            className="py-3.5 rounded-2xl bg-white/10 border border-white/15 text-[#38BDF8] font-bold text-xs hover:bg-white/20 disabled:opacity-30 flex items-center justify-center space-x-1 active:scale-95 transition-all"
            title="Échanger des lettres avec le sac"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>ÉCHANGER</span>
          </button>

          <button
            disabled={!isMyTurn}
            onClick={handlePass}
            className="py-3.5 rounded-2xl bg-white/10 border border-white/15 text-gray-300 font-bold text-xs hover:text-white disabled:opacity-30 flex items-center justify-center space-x-1 active:scale-95 transition-all"
          >
            <SkipForward className="w-3.5 h-3.5" />
            <span>PASSER</span>
          </button>
        </div>

        {/* Letter Swap Modal */}
        {showSwapModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-scale-in">
            <div className="w-full max-w-sm p-5 rounded-3xl bg-[#1A140F] border-2 border-[#38BDF8] shadow-2xl space-y-4 text-center">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-[#38BDF8] tracking-wider">
                  ÉCHANGE DE LETTRES
                </span>
                <button onClick={() => setShowSwapModal(false)} className="text-gray-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-gray-300">
                Sélectionnez les lettres de votre chevalet à échanger avec le sac ({gameState.letterBagCount} disponibles).
              </p>

              <div className="grid grid-cols-4 gap-2 py-2">
                {myRack.map((tile) => {
                  const isSelected = selectedSwapIds.includes(tile.id);
                  return (
                    <button
                      key={tile.id}
                      onClick={() => handleToggleSwapTile(tile.id)}
                      className={`aspect-square rounded-2xl flex flex-col items-center justify-center font-display font-black text-xl relative transition-all ${
                        isSelected
                          ? 'bg-[#38BDF8] text-gray-950 ring-4 ring-[#38BDF8]/50 scale-105 shadow-lg'
                          : 'bg-[#FBF2DE] text-gray-950 border-2 border-[#D5C29A]'
                      }`}
                    >
                      <span>{tile.letter}</span>
                      <span className="absolute bottom-1 right-1 text-[8px] font-sans font-bold leading-none">
                        {tile.points}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  disabled={selectedSwapIds.length === 0}
                  onClick={handleConfirmSwap}
                  className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-[#38BDF8] to-[#0284C7] text-white font-black text-xs uppercase disabled:opacity-40 shadow-lg"
                >
                  Confirmer ({selectedSwapIds.length})
                </button>
                <button
                  onClick={() => setShowSwapModal(false)}
                  className="px-4 py-3 rounded-2xl bg-white/10 text-gray-300 font-bold text-xs"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}

        <ReactionFlinger />
      </main>
    </div>
  );
};
