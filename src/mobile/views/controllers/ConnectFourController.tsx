import React, { useState } from 'react';
import { useGame } from '../../../context/GameContext';
import { ConnectFourGameState } from '../../../types/game';
import { audio } from '../../../services/audio';
import { triggerHaptic, hapticPatterns } from '../../components/HapticFeedback';
import { Trophy, Star, ChevronDown, CheckCircle2, ShieldAlert } from 'lucide-react';

const COLS = 7;
const ROWS = 6;

export const ConnectFourController: React.FC = () => {
  const { room, localPlayer, sendGameAction } = useGame();
  const [selectedCol, setSelectedCol] = useState<number>(3); // center col default

  const gameState = room?.gameState as ConnectFourGameState | null;

  const phase = gameState?.phase || 'playing';
  const board = gameState?.board || Array(ROWS).fill(null).map(() => Array(COLS).fill(null));
  const myId = localPlayer?.id || '';
  const isP1 = gameState?.p1?.id === myId;
  const isP2 = gameState?.p2?.id === myId;
  const myRole = isP1 ? 'p1' : isP2 ? 'p2' : 'spectator';
  const myChipColor = isP1 ? 'red' : isP2 ? 'yellow' : null;

  const isMyTurn = gameState?.currentTurnPlayerId === myId && phase === 'playing';
  const isGameOver = Boolean(gameState?.isGameOver);
  const podium = gameState?.finalPodium || null;

  const myState = isP1 ? gameState?.p1 : gameState?.p2;
  const opponentState = isP1 ? gameState?.p2 : gameState?.p1;

  // Check if a column has at least one open slot
  const isColAvailable = (colIdx: number) => {
    return board[0][colIdx] === null;
  };

  const handleSelectCol = (colIdx: number) => {
    if (!isMyTurn || !isColAvailable(colIdx)) return;

    if (selectedCol === colIdx) {
      handleDrop();
    } else {
      triggerHaptic(hapticPatterns.tap);
      audio.playSelect();
      setSelectedCol(colIdx);
    }
  };

  const handleDrop = () => {
    if (!isMyTurn || !isColAvailable(selectedCol)) return;

    triggerHaptic(hapticPatterns.cardPlay);
    audio.playDiceRoll();

    sendGameAction('c4_drop_chip', { col: selectedCol });
  };

  // GAMEOVER VIEW
  if (isGameOver && podium) {
    const winner = podium[0];
    const isWinner = winner.id === myId;

    return (
      <div className="flex flex-col items-center justify-between min-h-screen bg-slate-950 text-white p-6 select-none">
        <div className="flex flex-col items-center text-center mt-12">
          <div className="w-20 h-20 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center mb-4">
            <Trophy className="w-10 h-10 text-amber-300 animate-bounce" />
          </div>
          <span className="text-amber-400 font-black uppercase tracking-widest text-xs">
            FIN DU MATCH
          </span>
          <h1 className="text-3xl font-black font-display text-white mt-1">
            {isWinner ? 'VICTOIRE SUPRÊME ! 👑' : 'FIN DE PARTIE 🔴🟡'}
          </h1>
          <p className="text-sm text-gray-400 mt-2">
            {isWinner
              ? 'Tu as triomphé au Puissance 4 !'
              : `${winner?.name} a remporté la série de manches.`}
          </p>
        </div>

        <div className="w-full bg-slate-900 border border-white/10 rounded-2xl p-4 my-auto space-y-3">
          <span className="text-xs uppercase tracking-wider text-gray-400 font-bold block text-center">
            Scores Finaux
          </span>
          {podium.map((p) => (
            <div
              key={p.id}
              className={`flex items-center justify-between p-3.5 rounded-xl border ${
                p.id === myId
                  ? 'border-amber-400 bg-amber-500/10'
                  : 'border-white/5 bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{p.avatar || '🔴'}</span>
                <div>
                  <span className="font-bold text-white block">{p.name}</span>
                  <span className="text-xs text-gray-400">
                    {p.isWinner ? 'Champion' : 'Challenger'}
                  </span>
                </div>
              </div>
              <span className="font-mono font-bold text-emerald-400">
                {p.score} pts
              </span>
            </div>
          ))}
        </div>

        <div className="w-full text-center text-xs text-gray-500 pb-4">
          Regarde la Smart TV pour la cérémonie finale !
        </div>
      </div>
    );
  }

  // SPECTATOR VIEW
  if (myRole === 'spectator') {
    return (
      <div className="flex flex-col items-center justify-between min-h-screen bg-slate-950 text-white p-6 select-none">
        <div className="flex flex-col items-center text-center mt-12">
          <div className="w-20 h-20 rounded-full bg-blue-900/40 border border-blue-500/30 flex items-center justify-center text-4xl mb-4">
            👀
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">
            Mode Spectateur
          </span>
          <h2 className="text-2xl font-black font-display text-white mt-1">
            Duel Puissance 4 en direct
          </h2>
          <p className="text-sm text-gray-400 mt-2">
            Regarde l’affrontement entre {gameState?.p1?.name} et {gameState?.p2?.name} sur la TV !
          </p>
        </div>

        <div className="w-full bg-slate-900 border border-white/10 rounded-2xl p-5 my-auto text-center space-y-2">
          <span className="text-xs text-amber-400 font-bold uppercase">Tour actuel :</span>
          <p className="text-xl font-black font-display text-white">
            {gameState?.currentTurnPlayerName} ({gameState?.currentTurnColor === 'red' ? '🔴 Rouge' : '🟡 Jaune'})
          </p>
        </div>

        <div className="w-full text-center text-xs text-gray-500 pb-4">
          Playflix Salon • Expérience Multijoueur
        </div>
      </div>
    );
  }

  // ACTIVE PLAYER CONTROLLER
  return (
    <div className="flex flex-col justify-between min-h-screen bg-slate-950 text-white p-5 select-none">
      {/* HEADER: Player color & Rounds won */}
      <div className="flex items-center justify-between bg-slate-900/90 border border-white/10 rounded-2xl px-4 py-3">
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-full border-2 shadow-md flex items-center justify-center text-lg ${
              myChipColor === 'red'
                ? 'bg-red-600 border-red-300 shadow-red-500/50'
                : 'bg-yellow-400 border-yellow-100 shadow-yellow-400/50 text-black'
            }`}
          >
            {myChipColor === 'red' ? '🔴' : '🟡'}
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-gray-400 block">
              {myChipColor === 'red' ? 'Pions Rouges' : 'Pions Jaunes'}
            </span>
            <span className="text-sm font-black font-display text-white">
              {isMyTurn ? '🎯 À TON TOUR !' : `Attente de ${opponentState?.name}`}
            </span>
          </div>
        </div>

        {/* Stars */}
        <div className="flex items-center gap-1 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl">
          {[...Array(gameState?.targetWins || 2)].map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${
                i < (myState?.roundsWon ?? 0)
                  ? 'text-amber-400 fill-amber-400'
                  : 'text-slate-700 fill-slate-800'
              }`}
            />
          ))}
        </div>
      </div>

      {/* CENTER: COLUMN SELECTOR */}
      <div className="my-auto flex flex-col items-center w-full">
        <span className="text-xs uppercase font-bold tracking-widest text-amber-400 mb-2">
          {isMyTurn ? 'Choisis une colonne pour lâcher ton pion' : 'Observe la Smart TV'}
        </span>

        {/* 7 Columns Selector Bar */}
        <div className="grid grid-cols-7 gap-1.5 w-full max-w-sm bg-slate-900/90 border border-blue-500/30 rounded-2xl p-2.5 shadow-xl">
          {[...Array(COLS)].map((_, colIdx) => {
            const isAvail = isColAvailable(colIdx);
            const isSelected = selectedCol === colIdx;

            return (
              <button
                key={colIdx}
                onClick={() => handleSelectCol(colIdx)}
                disabled={!isMyTurn || !isAvail}
                className={`flex flex-col items-center justify-between h-36 rounded-xl border-2 transition-all p-1.5 ${
                  isSelected && isMyTurn
                    ? 'border-amber-400 bg-amber-500/20 shadow-lg shadow-amber-500/40 scale-105 z-10'
                    : isAvail && isMyTurn
                    ? 'border-blue-500/40 bg-blue-950/40 hover:border-blue-400 active:scale-95'
                    : !isAvail
                    ? 'border-red-950 bg-red-950/20 opacity-30 cursor-not-allowed'
                    : 'border-white/5 bg-slate-900/40 opacity-50 cursor-not-allowed'
                }`}
              >
                {/* Top arrow */}
                <div className="h-6 flex items-center justify-center">
                  {isSelected && isMyTurn && (
                    <ChevronDown className="w-5 h-5 text-amber-400 animate-bounce" />
                  )}
                </div>

                {/* Column chip representation */}
                <div
                  className={`w-8 h-8 rounded-full border flex items-center justify-center text-xs font-bold ${
                    isSelected && isMyTurn
                      ? myChipColor === 'red'
                        ? 'bg-red-600 border-red-300 shadow-md shadow-red-500/50'
                        : 'bg-yellow-400 border-yellow-200 text-black shadow-md shadow-yellow-400/50'
                      : 'bg-slate-800 border-white/10 text-gray-400'
                  }`}
                >
                  {colIdx + 1}
                </div>

                {/* Column label or Full status */}
                <span className="text-[10px] font-bold text-gray-400">
                  {isAvail ? `Col ${colIdx + 1}` : 'Plein'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* FOOTER: DROP BUTTON */}
      <div className="w-full space-y-2">
        <button
          onClick={handleDrop}
          disabled={!isMyTurn || !isColAvailable(selectedCol)}
          className={`w-full py-4 rounded-2xl font-black font-display text-lg uppercase tracking-wider flex items-center justify-center gap-2 shadow-2xl transition-all ${
            isMyTurn && isColAvailable(selectedCol)
              ? myChipColor === 'red'
                ? 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-red-500/40 active:scale-95'
                : 'bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-black shadow-yellow-500/40 active:scale-95'
              : 'bg-slate-900 text-gray-600 border border-white/5 cursor-not-allowed'
          }`}
        >
          <ChevronDown className="w-6 h-6 animate-bounce" />
          <span>
            {isMyTurn
              ? `LÂCHER LE PION EN COLONNE ${selectedCol + 1} !`
              : "Attente de l'adversaire..."}
          </span>
        </button>

        <div className="flex items-center justify-between text-[11px] text-gray-500 px-2">
          <span>{myState?.name} ({myState?.score ?? 0} pts)</span>
          <span>Adversaire : {opponentState?.score ?? 0} pts</span>
        </div>
      </div>
    </div>
  );
};
