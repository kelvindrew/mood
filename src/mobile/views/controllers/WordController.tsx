import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
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
  BookOpen,
  RefreshCw,
  X,
  Trophy,
  Crown,
  Shuffle,
  Hand,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { getFrenchDefinition } from '../../../data/frenchDefinitions';

function getMultiplier(r: number, c: number): string {
  if (r === 7 && c === 7) return 'CENTER';
  if ((r === 0 || r === 7 || r === 14) && (c === 0 || c === 7 || c === 14) && !(r === 7 && c === 7)) return 'TW';
  if ((r === c || r + c === 14) && ((r >= 1 && r <= 4) || (r >= 10 && r <= 13))) return 'DW';
  if (
    ((r === 1 || r === 5 || r === 9 || r === 13) && (c === 5 || c === 9)) ||
    ((r === 5 || r === 9) && (c === 1 || c === 13))
  )
    return 'TL';
  if (
    ((r === 0 || r === 14) && (c === 3 || c === 11)) ||
    ((r === 2 || r === 12) && (c === 6 || c === 8)) ||
    ((r === 3 || r === 11) && (c === 0 || c === 7 || c === 14)) ||
    ((r === 6 || r === 8) && (c === 2 || c === 6 || c === 8 || c === 12)) ||
    (r === 7 && (c === 3 || c === 11))
  )
    return 'DL';
  return 'NONE';
}

interface TileItem {
  id: string;
  letter: string;
  points: number;
}

interface PlacedTile {
  tile: TileItem;
  row: number;
  col: number;
}

type DragSource = 'rack' | 'board';

interface DragState {
  pointerId: number;
  tile: TileItem;
  source: DragSource;
  sourceRow?: number;
  sourceCol?: number;
  sourceRackIndex?: number;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  isDragging: boolean;
  hoveredCell: {
    row: number;
    col: number;
    multiplier: string;
    isOccupied: boolean;
  } | null;
  hoveredRackIndex: number | null;
}

const MULTIPLIERS_MAP: Record<string, { label: string; bg: string; text: string; name: string }> = {
  TW: { label: 'MT', bg: 'bg-rose-600', text: 'text-white', name: 'Mot Triple (x3)' },
  DW: { label: 'MD', bg: 'bg-pink-500', text: 'text-white', name: 'Mot Double (x2)' },
  TL: { label: 'LT', bg: 'bg-blue-600', text: 'text-white', name: 'Lettre Triple (x3)' },
  DL: { label: 'LD', bg: 'bg-sky-500', text: 'text-white', name: 'Lettre Double (x2)' },
  CENTER: { label: '★', bg: 'bg-amber-400', text: 'text-black', name: 'Case Départ ★ (x2)' },
};

export const WordController: React.FC = () => {
  const { room, localPlayer, sendGameAction } = useGame();
  const gameState = room?.gameState as ScrabbleGameState | undefined;

  // C2: All hooks declared before any early return
  const [placedTiles, setPlacedTiles] = useState<PlacedTile[]>([]);
  const [focusedCell, setFocusedCell] = useState<{ row: number; col: number }>({ row: 7, col: 7 });
  const [direction, setDirection] = useState<'horizontal' | 'vertical'>('horizontal');
  const [rackOrder, setRackOrder] = useState<string[]>([]);
  const [showSwapModal, setShowSwapModal] = useState<boolean>(false);
  const [selectedSwapIds, setSelectedSwapIds] = useState<string[]>([]);
  const [localError, setLocalError] = useState<string>('');
  const [dragState, setDragState] = useState<DragState | null>(null);

  const dragRef = useRef<DragState | null>(null);

  const myRack: TileItem[] = useMemo(() => {
    if (!gameState || !localPlayer) return [];
    return (gameState.playerRacks && gameState.playerRacks[localPlayer.id]) || [];
  }, [gameState, localPlayer]);

  // Keep custom order of rack tiles, appending any new drawn tiles
  const orderedRack: TileItem[] = useMemo(() => {
    if (!myRack || myRack.length === 0) return [];
    const map = new Map<string, TileItem>(myRack.map((t) => [t.id, t]));
    const result: TileItem[] = [];

    for (const id of rackOrder) {
      const tile = map.get(id);
      if (tile) {
        result.push(tile);
        map.delete(id);
      }
    }
    for (const tile of map.values()) {
      result.push(tile);
    }
    return result;
  }, [myRack, rackOrder]);

  // Sync rackOrder when rack tiles change
  useEffect(() => {
    if (myRack.length > 0) {
      setRackOrder((prev) => {
        const existingSet = new Set(myRack.map((t) => t.id));
        const filtered = prev.filter((id) => existingSet.has(id));
        const currentSet = new Set(filtered);
        for (const t of myRack) {
          if (!currentSet.has(t.id)) filtered.push(t.id);
        }
        return filtered;
      });
    }
  }, [myRack]);

  // Map of placed tiles for quick coordinate lookup
  const placedTileMap = useMemo(() => {
    const map = new Map<string, PlacedTile>();
    for (const p of placedTiles) {
      map.set(`${p.row}_${p.col}`, p);
    }
    return map;
  }, [placedTiles]);

  const isBoardEmpty = useMemo(() => {
    if (!gameState) return true;
    return gameState.board.every((row) => row.every((cell) => cell === null));
  }, [gameState?.board]);

  // Validate placed tiles alignment, continuity, center star coverage, and construct formed word
  const validationInfo = useMemo(() => {
    if (!gameState || placedTiles.length === 0) {
      return {
        isValidAlignment: true,
        hasGap: false,
        direction: direction,
        sortedPlacements: [] as PlacedTile[],
        fullWord: '',
        error: '',
      };
    }

    const rows = placedTiles.map((p) => p.row);
    const cols = placedTiles.map((p) => p.col);
    const isHorizontal = rows.every((r) => r === rows[0]);
    const isVertical = cols.every((c) => c === cols[0]);

    if (!isHorizontal && !isVertical) {
      return {
        isValidAlignment: false,
        hasGap: false,
        direction: direction,
        sortedPlacements: placedTiles,
        fullWord: '',
        error: 'Toutes les lettres doivent être alignées sur la même ligne ou colonne',
      };
    }

    let dir: 'horizontal' | 'vertical' = isHorizontal ? 'horizontal' : 'vertical';
    if (placedTiles.length === 1) {
      const { row, col } = placedTiles[0];
      const hasAdjH =
        (col > 0 && gameState.board[row]?.[col - 1] !== null) ||
        (col < 14 && gameState.board[row]?.[col + 1] !== null);
      const hasAdjV =
        (row > 0 && gameState.board[row - 1]?.[col] !== null) ||
        (row < 14 && gameState.board[row + 1]?.[col] !== null);
      if (hasAdjV && !hasAdjH) dir = 'vertical';
      else if (hasAdjH && !hasAdjV) dir = 'horizontal';
      else dir = direction;
    }

    const sorted = [...placedTiles].sort((a, b) =>
      dir === 'horizontal' ? a.col - b.col : a.row - b.row
    );

    const virtualBoard = gameState.board.map((row) =>
      row.map((cell) => (cell ? { ...cell } : null))
    );
    for (const p of sorted) {
      virtualBoard[p.row][p.col] = {
        letter: p.tile.letter,
        points: p.tile.points,
      };
    }

    if (dir === 'horizontal') {
      const r = sorted[0].row;
      const minC = sorted[0].col;
      const maxC = sorted[sorted.length - 1].col;

      for (let c = minC; c <= maxC; c++) {
        if (virtualBoard[r][c] === null) {
          return {
            isValidAlignment: true,
            hasGap: true,
            direction: dir,
            sortedPlacements: sorted,
            fullWord: '',
            error: 'Il ne peut pas y avoir de case vide au milieu du mot',
          };
        }
      }

      let startC = minC;
      let endC = maxC;
      while (startC > 0 && virtualBoard[r][startC - 1] !== null) startC--;
      while (endC < 14 && virtualBoard[r][endC + 1] !== null) endC++;

      let word = '';
      for (let c = startC; c <= endC; c++) {
        word += virtualBoard[r][c]?.letter || '';
      }

      return {
        isValidAlignment: true,
        hasGap: false,
        direction: dir,
        sortedPlacements: sorted,
        fullWord: word.toUpperCase(),
        error: '',
      };
    } else {
      const c = sorted[0].col;
      const minR = sorted[0].row;
      const maxR = sorted[sorted.length - 1].row;

      for (let r = minR; r <= maxR; r++) {
        if (virtualBoard[r][c] === null) {
          return {
            isValidAlignment: true,
            hasGap: true,
            direction: dir,
            sortedPlacements: sorted,
            fullWord: '',
            error: 'Il ne peut pas y avoir de case vide au milieu du mot',
          };
        }
      }

      let startR = minR;
      let endR = maxR;
      while (startR > 0 && virtualBoard[startR - 1][c] !== null) startR--;
      while (endR < 14 && virtualBoard[endR + 1][c] !== null) endR++;

      let word = '';
      for (let r = startR; r <= endR; r++) {
        word += virtualBoard[r][c]?.letter || '';
      }

      return {
        isValidAlignment: true,
        hasGap: false,
        direction: dir,
        sortedPlacements: sorted,
        fullWord: word.toUpperCase(),
        error: '',
      };
    }
  }, [gameState?.board, placedTiles, direction]);

  const potentialScore = useMemo(() => {
    return placedTiles.reduce((sum, p) => sum + p.tile.points, 0);
  }, [placedTiles]);

  // Clean up global drag listeners on unmount
  useEffect(() => {
    return () => {
      document.body.style.userSelect = '';
      document.body.style.touchAction = '';
    };
  }, []);

  if (!gameState || !localPlayer) return null;

  const isGameOver = !!(gameState.isGameOver || gameState.winner);
  const isMyTurn = !isGameOver && gameState.currentPlayerId === localPlayer.id;
  const myPodiumInfo = gameState.finalPodium?.find((p) => p.id === localPlayer.id);

  // Reorder letters in the rack
  const handleReorderRack = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) return;
    const currentIds = orderedRack.map((t) => t.id);
    const [movedId] = currentIds.splice(fromIndex, 1);
    currentIds.splice(toIndex, 0, movedId);
    setRackOrder(currentIds);
    triggerHaptic(hapticPatterns.tap);
  };

  // Shuffle letters in rack
  const handleShuffleRack = () => {
    triggerHaptic(hapticPatterns.tap);
    audio.playFocus();
    const shuffled = [...orderedRack.map((t) => t.id)].sort(() => Math.random() - 0.5);
    setRackOrder(shuffled);
  };

  // Sort rack alphabetically
  const handleSortRackAlphabetical = () => {
    triggerHaptic(hapticPatterns.tap);
    audio.playFocus();
    const sorted = [...orderedRack].sort((a, b) => a.letter.localeCompare(b.letter));
    setRackOrder(sorted.map((t) => t.id));
  };

  // Recall all placed tiles back to rack
  const handleRecallAll = () => {
    if (isGameOver || placedTiles.length === 0) return;
    triggerHaptic(hapticPatterns.tap);
    audio.playFocus();
    setPlacedTiles([]);
    setLocalError('');
  };

  // Remove a single placed tile back to rack
  const handleRemovePlacedTile = (tileId: string) => {
    if (isGameOver) return;
    triggerHaptic(hapticPatterns.tap);
    audio.playFocus();
    setPlacedTiles((prev) => prev.filter((p) => p.tile.id !== tileId));
    setLocalError('');
  };

  // Tap handler (when touch doesn't move > 7px)
  const handleTap = (
    tile: TileItem,
    source: DragSource,
    sourceRow?: number,
    sourceCol?: number
  ) => {
    if (source === 'board') {
      handleRemovePlacedTile(tile.id);
      return;
    }

    // Tap on rack tile: place at focused cell or next available empty cell
    if (!isMyTurn) return;
    triggerHaptic(hapticPatterns.tap);
    audio.playFocus();
    setLocalError('');

    const isCellTaken = (r: number, c: number) => {
      return gameState.board[r]?.[c] !== null || placedTiles.some((p) => p.row === r && p.col === c);
    };

    let curR = focusedCell.row;
    let curC = focusedCell.col;

    while (curR < 15 && curC < 15 && isCellTaken(curR, curC)) {
      if (direction === 'horizontal') curC++;
      else curR++;
    }

    if (curR < 15 && curC < 15) {
      setPlacedTiles((prev) => [...prev, { tile, row: curR, col: curC }]);
      let nextR = curR;
      let nextC = curC;
      if (direction === 'horizontal') nextC++;
      else nextR++;
      if (nextR < 15 && nextC < 15) {
        setFocusedCell({ row: nextR, col: nextC });
      }
    }
  };

  // Pointer Down: starts touch tracking for finger drag & drop
  const handlePointerDown = (
    e: React.PointerEvent,
    tile: TileItem,
    source: DragSource,
    sourceRow?: number,
    sourceCol?: number,
    sourceRackIndex?: number
  ) => {
    if (isGameOver || !isMyTurn) return;
    if (e.button !== 0 && e.pointerType === 'mouse') return;

    const startX = e.clientX;
    const startY = e.clientY;
    const pointerId = e.pointerId;

    dragRef.current = {
      pointerId,
      tile,
      source,
      sourceRow,
      sourceCol,
      sourceRackIndex,
      startX,
      startY,
      currentX: startX,
      currentY: startY,
      isDragging: false,
      hoveredCell: null,
      hoveredRackIndex: null,
    };

    const handlePointerMove = (moveEvt: PointerEvent) => {
      if (!dragRef.current || moveEvt.pointerId !== dragRef.current.pointerId) return;

      const dx = moveEvt.clientX - dragRef.current.startX;
      const dy = moveEvt.clientY - dragRef.current.startY;
      const dist = Math.hypot(dx, dy);

      if (!dragRef.current.isDragging && dist > 7) {
        dragRef.current.isDragging = true;
        triggerHaptic(hapticPatterns.tap);
        audio.playFocus();
        document.body.style.userSelect = 'none';
        document.body.style.touchAction = 'none';
      }

      if (dragRef.current.isDragging) {
        dragRef.current.currentX = moveEvt.clientX;
        dragRef.current.currentY = moveEvt.clientY;

        // Check target under finger or slightly above finger (preview tile offset ~28px)
        let target = document.elementFromPoint(moveEvt.clientX, moveEvt.clientY);
        let cellEl = target?.closest('[data-board-cell="true"]') as HTMLElement | null;
        if (!cellEl) {
          const targetAbove = document.elementFromPoint(moveEvt.clientX, moveEvt.clientY - 28);
          cellEl = targetAbove?.closest('[data-board-cell="true"]') as HTMLElement | null;
        }

        let hoveredCell = null;
        if (cellEl) {
          const r = parseInt(cellEl.getAttribute('data-row') || '-1', 10);
          const c = parseInt(cellEl.getAttribute('data-col') || '-1', 10);
          if (r >= 0 && r < 15 && c >= 0 && c < 15) {
            const isBoardOccupied = !!gameState.board[r]?.[c];
            const isPlacedByOther = placedTiles.some(
              (p) => p.row === r && p.col === c && p.tile.id !== dragRef.current?.tile.id
            );
            const mult = getMultiplier(r, c);
            hoveredCell = {
              row: r,
              col: c,
              multiplier: mult,
              isOccupied: isBoardOccupied || isPlacedByOther,
            };
          }
        }

        // Check rack hover for reordering letters
        let rackEl = target?.closest('[data-rack-slot="true"]') as HTMLElement | null;
        let hoveredRackIndex = null;
        if (rackEl) {
          const idx = parseInt(rackEl.getAttribute('data-index') || '-1', 10);
          if (!isNaN(idx)) hoveredRackIndex = idx;
        }

        dragRef.current.hoveredCell = hoveredCell;
        dragRef.current.hoveredRackIndex = hoveredRackIndex;

        setDragState({ ...dragRef.current });
      }
    };

    const handlePointerUp = (upEvt: PointerEvent) => {
      if (!dragRef.current || upEvt.pointerId !== dragRef.current.pointerId) return;

      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
      document.body.style.userSelect = '';
      document.body.style.touchAction = '';

      const drag = dragRef.current;
      dragRef.current = null;
      setDragState(null);

      if (drag.isDragging) {
        // Drag release
        if (drag.hoveredCell && !drag.hoveredCell.isOccupied) {
          const { row, col } = drag.hoveredCell;
          setPlacedTiles((prev) => {
            const filtered = prev.filter((p) => p.tile.id !== drag.tile.id);
            return [...filtered, { tile: drag.tile, row, col }];
          });
          setFocusedCell({ row, col });
          triggerHaptic(hapticPatterns.tap);
          audio.playSelect();
          setLocalError('');
        } else if (drag.hoveredRackIndex !== null) {
          if (drag.source === 'board') {
            setPlacedTiles((prev) => prev.filter((p) => p.tile.id !== drag.tile.id));
            triggerHaptic(hapticPatterns.tap);
          } else if (drag.source === 'rack' && drag.sourceRackIndex !== undefined) {
            handleReorderRack(drag.sourceRackIndex, drag.hoveredRackIndex);
          }
        } else if (drag.source === 'board') {
          // Dragged from board and dropped outside valid empty cell: recall to rack
          setPlacedTiles((prev) => prev.filter((p) => p.tile.id !== drag.tile.id));
          triggerHaptic(hapticPatterns.tap);
        }
      } else {
        // Tap
        handleTap(drag.tile, drag.source, drag.sourceRow, drag.sourceCol);
      }
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: false });
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);
  };

  const handleSelectCell = (r: number, c: number) => {
    if (isGameOver) return;
    triggerHaptic(hapticPatterns.tap);
    audio.playFocus();
    setLocalError('');
    setFocusedCell({ row: r, col: c });
  };

  const handleToggleDirection = () => {
    if (isGameOver) return;
    triggerHaptic(hapticPatterns.tap);
    audio.playFocus();
    setLocalError('');
    setDirection((prev) => (prev === 'horizontal' ? 'vertical' : 'horizontal'));
  };

  const handleValidateWord = () => {
    if (!isMyTurn || isGameOver || placedTiles.length === 0) return;

    if (!validationInfo.isValidAlignment) {
      triggerHaptic(hapticPatterns.error);
      setLocalError(validationInfo.error || 'Les lettres doivent être alignées sur une même ligne ou colonne');
      return;
    }

    if (validationInfo.hasGap) {
      triggerHaptic(hapticPatterns.error);
      setLocalError(validationInfo.error || 'Il y a un trou vide entre les lettres posées');
      return;
    }

    if (isBoardEmpty) {
      const coversCenter = placedTiles.some((p) => p.row === 7 && p.col === 7);
      if (!coversCenter) {
        triggerHaptic(hapticPatterns.error);
        setLocalError('Le premier mot doit passer par l’étoile centrale ★ (Ligne 8, Colonne 8)');
        return;
      }
      if (placedTiles.length < 2) {
        triggerHaptic(hapticPatterns.error);
        setLocalError('Le premier mot doit comporter au moins 2 lettres');
        return;
      }
    }

    triggerHaptic(hapticPatterns.success);
    audio.playSelect();
    setLocalError('');

    const tilesPlaced = validationInfo.sortedPlacements.map((p) => ({
      row: p.row,
      col: p.col,
      letter: p.tile.letter,
      tileId: p.tile.id,
    }));

    sendGameAction('word_play_word', { tilesPlaced });
    setPlacedTiles([]);
  };

  const handlePass = () => {
    if (!isMyTurn || isGameOver) return;
    triggerHaptic(hapticPatterns.tap);
    sendGameAction('word_pass_turn');
    setPlacedTiles([]);
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
    setPlacedTiles([]);
  };

  const handleReplay = () => {
    triggerHaptic(hapticPatterns.success);
    sendGameAction('word_restart');
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
              {isWinner
                ? '🎉 VICTOIRE !'
                : `${myPodiumInfo?.rank === 2 ? '🥈 2ème' : myPodiumInfo?.rank === 3 ? '🥉 3ème' : `${myPodiumInfo?.rank}ème`} Place`}
            </h1>
            <p className="text-xs text-gray-400">
              {gameState.finisherPlayerName
                ? `Terminé par ${gameState.finisherPlayerName}`
                : 'Fin par absence de coups'}
            </p>
          </div>

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
    <div className="min-h-screen flex flex-col justify-between bg-[#0B100E] text-white select-none relative overflow-x-hidden">
      <MobileHeader />

      <main className="p-3 flex-1 flex flex-col justify-between space-y-2.5 max-w-lg mx-auto w-full pb-6">
        {/* Turn Status Banner */}
        <div
          className={`p-2.5 rounded-2xl text-center border transition-all ${
            isMyTurn
              ? 'bg-[#10B981]/20 border-[#10B981] shadow-[0_0_15px_rgba(16,185,129,0.3)]'
              : 'bg-white/5 border-white/10 text-gray-400'
          }`}
        >
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
              <span className="text-[11px] font-black uppercase tracking-wider text-[#10B981]">
                {isMyTurn ? 'VOTRE TOUR DE JOUER' : 'TOUR ADVERSE'}
              </span>
            </div>
            <div className="flex items-center space-x-1 font-mono font-bold text-xs text-white">
              <span>
                {direction === 'horizontal'
                  ? '↔ Ligne ' + (focusedCell.row + 1)
                  : '↕ Colonne ' + (focusedCell.col + 1)}
              </span>
            </div>
          </div>
        </div>

        {/* Tactile Tip Banner */}
        <div className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/15 to-emerald-500/15 border border-amber-500/30 flex items-center justify-between text-[11px]">
          <div className="flex items-center space-x-1.5 text-amber-200">
            <Hand className="w-3.5 h-3.5 text-amber-400 animate-pulse flex-shrink-0" />
            <span className="leading-tight">
              Glissez vos lettres avec le doigt sur le plateau ou le chevalet !
            </span>
          </div>
          <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 ml-1">
            Tactile
          </span>
        </div>

        {/* Error Notification */}
        {localError && (
          <div className="p-2 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs flex items-center space-x-2 animate-scale-in">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{localError}</span>
          </div>
        )}

        {/* Live Word Formation Display with Definition */}
        {validationInfo.fullWord && (
          <div className="p-2.5 rounded-2xl bg-white/[0.08] border-2 border-[#38BDF8] shadow-lg space-y-1.5 animate-scale-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-4 h-4 text-[#38BDF8]" />
                <span className="text-[10px] font-black uppercase text-gray-300">Mot formé :</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-base font-black font-mono tracking-widest text-[#38BDF8]">
                  "{validationInfo.fullWord}"
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#38BDF8]/20 text-[#38BDF8]">
                  +{potentialScore} pts
                </span>
              </div>
            </div>

            {/* Live Definition Preview */}
            <div className="p-2 rounded-xl bg-black/40 border border-white/10 text-[11px] text-gray-300 space-y-0.5">
              <div className="text-[10px] font-bold italic text-emerald-300 font-serif">
                — {getFrenchDefinition(validationInfo.fullWord).nature}
              </div>
              <p className="text-[10px] leading-tight text-gray-300">
                {getFrenchDefinition(validationInfo.fullWord).def}
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
              {direction === 'horizontal' ? (
                <ArrowRight className="w-3.5 h-3.5" />
              ) : (
                <ArrowDown className="w-3.5 h-3.5" />
              )}
              <span>{direction === 'horizontal' ? 'Horizontal' : 'Vertical'}</span>
            </button>
          </div>

          {/* 15x15 Mini Grid */}
          <div className="w-full aspect-square overflow-hidden bg-[#100C09] p-1 rounded-2xl border border-white/10 relative touch-none">
            <div
              className="w-full h-full grid gap-[1.5px]"
              style={{
                gridTemplateColumns: 'repeat(15, minmax(0, 1fr))',
                gridTemplateRows: 'repeat(15, minmax(0, 1fr))',
              }}
            >
              {gameState.board.map((row, rIdx) =>
                row.map((boardTile, cIdx) => {
                  const coordKey = `${rIdx}_${cIdx}`;
                  const placed = placedTileMap.get(coordKey);
                  const isSelectedFocus = rIdx === focusedCell.row && cIdx === focusedCell.col;
                  const mult = getMultiplier(rIdx, cIdx);
                  const multConfig = MULTIPLIERS_MAP[mult];

                  const isHoveredDuringDrag =
                    dragState?.isDragging &&
                    dragState.hoveredCell?.row === rIdx &&
                    dragState.hoveredCell?.col === cIdx;

                  return (
                    <div
                      key={`grid_${rIdx}_${cIdx}`}
                      data-board-cell="true"
                      data-row={rIdx}
                      data-col={cIdx}
                      onClick={() => handleSelectCell(rIdx, cIdx)}
                      onPointerDown={
                        placed
                          ? (e) => handlePointerDown(e, placed.tile, 'board', rIdx, cIdx)
                          : undefined
                      }
                      className={`relative w-full h-full rounded-[3px] flex items-center justify-center font-display font-black text-[9px] transition-all leading-none select-none cursor-pointer ${
                        isHoveredDuringDrag
                          ? dragState?.hoveredCell?.isOccupied
                            ? 'ring-2 ring-rose-500 bg-rose-500/40 text-rose-200 z-30 scale-125 shadow-lg'
                            : 'ring-2 ring-emerald-400 bg-emerald-500/50 text-white z-30 scale-125 shadow-lg'
                          : placed
                          ? 'bg-gradient-to-b from-[#FFF5DE] to-[#EBD4A8] border border-[#C5B084] text-gray-950 shadow-md ring-2 ring-emerald-400/80 z-10 active:scale-95'
                          : isSelectedFocus
                          ? 'ring-2 ring-[#FBBF24] bg-amber-400 text-gray-950 z-20 scale-110 shadow-lg'
                          : boardTile
                          ? 'bg-[#FBF2DE] text-gray-950 shadow-sm opacity-90'
                          : multConfig
                          ? `${multConfig.bg} ${multConfig.text} opacity-90`
                          : 'bg-[#221A14]/80 text-gray-600 hover:bg-[#34281F]'
                      }`}
                    >
                      {placed ? (
                        <div className="flex flex-col items-center justify-center w-full h-full relative">
                          <span className="leading-none text-[10px] font-black">{placed.tile.letter}</span>
                          <span className="absolute bottom-[1px] right-[1px] text-[6px] text-gray-800 font-sans font-bold leading-none">
                            {placed.tile.points}
                          </span>
                        </div>
                      ) : boardTile ? (
                        <span>{boardTile.letter}</span>
                      ) : multConfig ? (
                        <span className="text-[7px] font-sans font-black">{multConfig.label}</span>
                      ) : null}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] text-gray-400 px-1">
            <span>
              📍 Viseur :{' '}
              <strong className="text-white">
                Ligne {focusedCell.row + 1}, Col {focusedCell.col + 1}
              </strong>
            </span>
            <span className="text-[#FBBF24]">Glissez ou touchez pour poser</span>
          </div>
        </div>

        {/* Word Builder Construction Area ("Lettres posées") */}
        <div className="p-2.5 rounded-2xl bg-white/[0.06] border border-white/10 space-y-1.5 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5">
              <span className="text-[10px] font-black uppercase text-gray-300">
                LETTRES POSÉES CE TOUR ({placedTiles.length})
              </span>
            </div>
            {placedTiles.length > 0 && (
              <button
                onClick={handleRecallAll}
                className="text-xs text-rose-400 font-bold flex items-center space-x-1 hover:underline active:scale-95 transition-transform"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Tout rappeler</span>
              </button>
            )}
          </div>

          {/* Letter Slots */}
          <div className="flex items-center space-x-1.5 min-h-[48px] p-1.5 rounded-xl bg-black/40 border border-dashed border-white/20 overflow-x-auto">
            {placedTiles.length === 0 ? (
              <span className="text-xs text-gray-500 mx-auto text-center py-1">
                Glissez vos lettres sur le plateau ci-dessus
              </span>
            ) : (
              placedTiles.map((p) => (
                <div
                  key={p.tile.id}
                  onPointerDown={(e) => handlePointerDown(e, p.tile, 'board', p.row, p.col)}
                  className="w-10 h-10 rounded-xl bg-gradient-to-b from-[#FFF5DE] to-[#EBD4A8] border-2 border-emerald-400 text-gray-950 font-black font-display text-lg flex items-center justify-center relative shadow-md active:scale-90 transition-transform flex-shrink-0 cursor-grab touch-none"
                  title="Touchez ou glissez pour rappeler au chevalet"
                >
                  <span>{p.tile.letter}</span>
                  <span className="absolute bottom-0.5 right-0.5 text-[8px] text-gray-700 font-sans font-bold leading-none">
                    {p.tile.points}
                  </span>
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 text-white text-[7px] font-mono font-bold flex items-center justify-center shadow">
                    ✓
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Tactile Wooden Rack (Chevalet de 7 lettres) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[10px] font-black uppercase text-gray-300 px-1">
            <span>VOTRE CHEVALET PRIVÉ (7 LETTRES)</span>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleShuffleRack}
                className="text-[#FBBF24] hover:text-amber-300 flex items-center space-x-1 active:scale-95 transition-transform"
                title="Mélanger l'ordre des lettres"
              >
                <Shuffle className="w-3 h-3" />
                <span>Mélanger</span>
              </button>
              <button
                onClick={handleSortRackAlphabetical}
                className="text-[#38BDF8] hover:text-sky-300 flex items-center space-x-1 active:scale-95 transition-transform"
                title="Trier par ordre alphabétique"
              >
                <span>A-Z</span>
              </button>
              <span className="text-gray-400">|</span>
              <span className="text-[#38BDF8]">{gameState.letterBagCount} sac</span>
            </div>
          </div>

          {/* Wooden Rack Bar */}
          <div className="grid grid-cols-7 gap-1.5 p-2 rounded-2xl bg-gradient-to-b from-[#382619] via-[#2A1C12] to-[#1E130B] border-2 border-[#5C402B] shadow-2xl relative">
            {orderedRack.map((tile: TileItem, idx: number) => {
              const isPlaced = placedTiles.some((p) => p.tile.id === tile.id);
              const isHoveredSlot =
                dragState?.isDragging && dragState?.hoveredRackIndex === idx;

              return (
                <div
                  key={tile.id}
                  data-rack-slot="true"
                  data-index={idx}
                  onPointerDown={
                    !isPlaced && isMyTurn
                      ? (e) => handlePointerDown(e, tile, 'rack', undefined, undefined, idx)
                      : undefined
                  }
                  className={`aspect-square rounded-xl flex flex-col items-center justify-center font-display font-black text-lg relative transition-all touch-none select-none ${
                    isPlaced
                      ? 'bg-black/30 border border-dashed border-white/10 text-gray-600 opacity-30 shadow-inner'
                      : isHoveredSlot
                      ? 'bg-amber-400 text-gray-950 ring-4 ring-amber-400 scale-105 shadow-xl'
                      : 'bg-gradient-to-b from-[#FFF5DE] to-[#EEDBB5] border-2 border-[#D5C29A] text-gray-950 shadow-[0_4px_8px_rgba(0,0,0,0.5)] active:scale-90 cursor-grab hover:scale-105'
                  }`}
                >
                  {isPlaced ? (
                    <span className="text-xs text-gray-500 font-sans font-bold">posée</span>
                  ) : (
                    <>
                      <span className="leading-none text-xl">{tile.letter}</span>
                      <span className="absolute bottom-0.5 right-1 text-[8px] text-gray-700 font-sans font-bold leading-none">
                        {tile.points}
                      </span>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Controls: Valider, Échanger, Passer */}
        <div className="grid grid-cols-4 gap-2 pt-1">
          <button
            disabled={!isMyTurn || placedTiles.length === 0}
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

        {/* Floating Tile Preview following finger during drag */}
        {dragState && dragState.isDragging && (
          <div
            className="fixed pointer-events-none z-50 transform -translate-x-1/2 -translate-y-full"
            style={{
              left: `${dragState.currentX}px`,
              top: `${dragState.currentY - 14}px`,
            }}
          >
            {/* Coordinate / Status Tooltip Badge */}
            <div className="mb-2 text-center whitespace-nowrap">
              {dragState.hoveredCell ? (
                dragState.hoveredCell.isOccupied ? (
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-rose-600 text-white font-bold text-[10px] shadow-lg border border-rose-400 animate-pulse">
                    ⚠️ Case occupée
                  </span>
                ) : (
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-600 text-white font-black text-[10px] shadow-lg border border-emerald-400">
                    L.{dragState.hoveredCell.row + 1}, C.{dragState.hoveredCell.col + 1}
                    {dragState.hoveredCell.multiplier !== 'NONE' &&
                      ` (${MULTIPLIERS_MAP[dragState.hoveredCell.multiplier]?.name || dragState.hoveredCell.multiplier})`}
                  </span>
                )
              ) : dragState.hoveredRackIndex !== null ? (
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-amber-600 text-white font-bold text-[10px] shadow-lg border border-amber-400">
                  Chevalet (emplacement {dragState.hoveredRackIndex + 1})
                </span>
              ) : dragState.source === 'board' ? (
                <span className="inline-block px-2 py-0.5 rounded-full bg-rose-600/90 text-white text-[9px] shadow-md border border-rose-400">
                  Relâchez pour rappeler au chevalet
                </span>
              ) : (
                <span className="inline-block px-2 py-0.5 rounded-full bg-black/80 text-gray-300 text-[9px] shadow-md border border-white/20">
                  Glissez vers le plateau 15x15
                </span>
              )}
            </div>

            {/* Elevated 3D Wooden Tile */}
            <div className="w-12 h-12 rounded-xl bg-gradient-to-b from-[#FFF5DE] to-[#EBD4A8] border-2 border-[#D5C29A] text-gray-950 font-black font-display text-2xl flex items-center justify-center relative shadow-[0_20px_35px_rgba(0,0,0,0.7)] ring-2 ring-amber-400/90 rotate-2 scale-110">
              <span className="leading-none">{dragState.tile.letter}</span>
              <span className="absolute bottom-1 right-1 text-[9px] text-gray-700 font-sans font-bold leading-none">
                {dragState.tile.points}
              </span>
            </div>
          </div>
        )}

        {/* Letter Swap Modal */}
        {showSwapModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-scale-in">
            <div className="w-full max-w-sm p-5 rounded-3xl bg-[#1A140F] border-2 border-[#38BDF8] shadow-2xl space-y-4 text-center">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-[#38BDF8] tracking-wider">
                  ÉCHANGE DE LETTRES
                </span>
                <button
                  onClick={() => setShowSwapModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-gray-300">
                Sélectionnez les lettres de votre chevalet à échanger avec le sac (
                {gameState.letterBagCount} disponibles).
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
