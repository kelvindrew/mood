import React, { useEffect, useRef } from 'react';
import { useGame } from '../../context/GameContext';
import { ConnectFourGameState } from '../../types/game';
import { audio } from '../../services/audio';
import { Trophy, Star, Sparkles, ChevronDown, CircleDot, Flame } from 'lucide-react';

const COLS = 7;
const ROWS = 6;

export const ConnectFourBoardTV: React.FC = () => {
  const { room } = useGame();
  const gameState = room?.gameState as ConnectFourGameState | null;

  const phase = gameState?.phase || 'playing';
  const board = gameState?.board || Array(ROWS).fill(null).map(() => Array(COLS).fill(null));
  const winningCells = gameState?.winningCells || null;
  const p1 = gameState?.p1;
  const p2 = gameState?.p2;
  const currentTurnPlayerId = gameState?.currentTurnPlayerId || '';
  const currentTurnColor = gameState?.currentTurnColor || 'red';
  const lastDrop = gameState?.lastDrop || null;
  const isGameOver = Boolean(gameState?.isGameOver);
  const podium = gameState?.finalPodium || null;

  const prevDropRef = useRef(lastDrop);
  const prevPhaseRef = useRef(phase);

  // Sound effects on chip drop & win
  useEffect(() => {
    if (lastDrop && lastDrop !== prevDropRef.current) {
      prevDropRef.current = lastDrop;
      audio.playDiceRoll(); // satisfying drop sound
    }
  }, [lastDrop]);

  useEffect(() => {
    if (phase !== prevPhaseRef.current) {
      prevPhaseRef.current = phase;
      if (phase === 'round_over' || phase === 'gameover') {
        audio.playCustomBuzzer('airhorn');
      }
    }
  }, [phase]);

  // Is winning cell helper
  const isWinningCell = (r: number, c: number) => {
    if (!winningCells) return false;
    return winningCells.some(([wr, wc]) => wr === r && wc === c);
  };

  // GAMEOVER VIEW
  if (isGameOver && podium) {
    const winner = podium[0];
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-gradient-to-br from-slate-950 via-blue-950/60 to-slate-950 text-white select-none">
        <div className="relative flex flex-col items-center max-w-4xl w-full bg-slate-900/80 border-2 border-amber-500/40 rounded-3xl p-10 shadow-2xl backdrop-blur-xl">
          <div className="w-24 h-24 rounded-full bg-amber-500/20 border-4 border-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/30 mb-4 animate-bounce">
            <Trophy className="w-12 h-12 text-amber-300" />
          </div>

          <span className="text-amber-400 font-black tracking-widest text-sm uppercase">
            🏆 CHAMPION DU PUISSANCE 4
          </span>
          <h1 className="text-5xl font-black font-display text-white mt-1 mb-6 text-center drop-shadow-lg">
            {winner?.name} REMPORTE LA VICTOIRE !
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-xl mt-4">
            {podium.map((p, idx) => (
              <div
                key={p.id}
                className={`flex flex-col items-center p-6 rounded-2xl border-2 ${
                  idx === 0
                    ? 'border-amber-400 bg-amber-500/10 shadow-amber-500/30'
                    : 'border-slate-700 bg-slate-800/40'
                } shadow-xl`}
              >
                <span className="text-3xl mb-2">{idx === 0 ? '👑 CHAMPION' : '🥈 VAINCU'}</span>
                <div className="w-16 h-16 rounded-full bg-slate-800 border-2 border-white/20 flex items-center justify-center text-3xl mb-2">
                  {p.avatar || (idx === 0 ? '🔴' : '🟡')}
                </div>
                <span className="font-bold text-2xl text-white truncate max-w-full">
                  {p.name}
                </span>
                <span className="text-base font-semibold text-emerald-400 mt-1">
                  {p.score} points
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col justify-between p-6 bg-slate-950 text-white select-none relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-1/3 translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-yellow-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* TOP BAR: Score & Current Turn */}
      <div className="relative z-10 flex items-center justify-between bg-slate-900/80 border border-white/10 rounded-2xl px-8 py-3.5 backdrop-blur-md shadow-xl">
        {/* Player 1 Card (Red) */}
        <div className={`flex items-center gap-4 px-6 py-2 rounded-2xl border-2 transition-all ${
          currentTurnPlayerId === p1?.id && phase === 'playing'
            ? 'border-red-500 bg-red-500/20 shadow-lg shadow-red-500/30 scale-105'
            : 'border-white/10 bg-slate-900/60'
        }`}>
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-red-700 border-2 border-red-300 shadow-md flex items-center justify-center text-2xl">
            🔴
          </div>
          <div>
            <span className="font-display font-black text-lg text-white block leading-tight">
              {p1?.name}
            </span>
            <div className="flex items-center gap-1.5 mt-1">
              {[...Array(gameState?.targetWins || 2)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < (p1?.roundsWon ?? 0)
                      ? 'text-amber-400 fill-amber-400'
                      : 'text-slate-700 fill-slate-800'
                  }`}
                />
              ))}
              <span className="text-xs font-bold text-gray-400 ml-1">
                ({p1?.score ?? 0} pts)
              </span>
            </div>
          </div>
        </div>

        {/* Center Banner */}
        <div className="flex flex-col items-center">
          <span className="text-[11px] uppercase tracking-widest font-black text-amber-400">
            PUISSANCE 4 DELUXE
          </span>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-base font-black font-display text-white">
              {phase === 'round_over'
                ? '🎉 ALIGNEMENT GAGNANT !'
                : `Tour de ${currentTurnColor === 'red' ? p1?.name : p2?.name}`}
            </span>
          </div>
          <span className="text-[10px] text-gray-400">
            Manche {gameState?.roundNumber || 1} • Premier à {gameState?.targetWins || 2} victoires
          </span>
        </div>

        {/* Player 2 Card (Yellow) */}
        <div className={`flex items-center gap-4 px-6 py-2 rounded-2xl border-2 transition-all ${
          currentTurnPlayerId === p2?.id && phase === 'playing'
            ? 'border-yellow-400 bg-yellow-400/20 shadow-lg shadow-yellow-400/30 scale-105'
            : 'border-white/10 bg-slate-900/60'
        }`}>
          <div>
            <span className="font-display font-black text-lg text-white block text-right leading-tight">
              {p2?.name}
            </span>
            <div className="flex items-center justify-end gap-1.5 mt-1">
              <span className="text-xs font-bold text-gray-400 mr-1">
                ({p2?.score ?? 0} pts)
              </span>
              {[...Array(gameState?.targetWins || 2)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < (p2?.roundsWon ?? 0)
                      ? 'text-amber-400 fill-amber-400'
                      : 'text-slate-700 fill-slate-800'
                  }`}
                />
              ))}
            </div>
          </div>
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-300 to-amber-500 border-2 border-yellow-200 shadow-md flex items-center justify-center text-2xl">
            🟡
          </div>
        </div>
      </div>

      {/* CENTER ARENA: THE VERTICAL PUISSANCE 4 GRID */}
      <div className="relative z-10 flex flex-col items-center justify-center my-auto">
        {/* Column Arrow Indicators */}
        <div className="grid grid-cols-7 gap-3 mb-2 w-full max-w-[560px] px-4">
          {[...Array(COLS)].map((_, colIdx) => (
            <div key={colIdx} className="flex flex-col items-center justify-center h-6">
              {lastDrop?.col === colIdx && (
                <ChevronDown className={`w-5 h-5 animate-bounce ${
                  lastDrop.playerChip === 'red' ? 'text-red-400' : 'text-yellow-400'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* The 7x6 Plastic Board Frame */}
        <div className="relative bg-gradient-to-b from-blue-700 via-blue-800 to-blue-900 p-5 rounded-3xl border-4 border-blue-400/60 shadow-[0_20px_50px_rgba(0,0,0,0.8),inset_0_2px_10px_rgba(255,255,255,0.3)]">
          <div className="grid grid-rows-6 gap-3">
            {board.map((row, r) => (
              <div key={r} className="grid grid-cols-7 gap-3">
                {row.map((cell, c) => {
                  const isWin = isWinningCell(r, c);
                  const isLast = lastDrop?.row === r && lastDrop?.col === c;

                  return (
                    <div
                      key={c}
                      className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 shadow-[inset_0_4px_8px_rgba(0,0,0,0.7)] ${
                        cell === null
                          ? 'bg-slate-950/80 border-2 border-blue-950'
                          : cell === 'red'
                          ? 'bg-gradient-to-br from-red-500 via-red-600 to-red-800 border-2 border-red-300 shadow-lg shadow-red-600/50'
                          : 'bg-gradient-to-br from-yellow-300 via-amber-400 to-amber-600 border-2 border-yellow-100 shadow-lg shadow-yellow-500/50'
                      } ${
                        isWin
                          ? 'ring-4 ring-white animate-pulse scale-110 z-20 shadow-[0_0_30px_rgba(255,255,255,0.9)]'
                          : isLast
                          ? 'scale-105'
                          : ''
                      }`}
                    >
                      {/* Inner glossy highlight for realistic chip depth */}
                      {cell && (
                        <div className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center">
                          {isWin && (
                            <Sparkles className="w-5 h-5 text-white animate-spin" />
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Board Feet / Base Stand */}
          <div className="absolute -bottom-4 left-6 w-12 h-6 bg-blue-950 rounded-b-xl border border-blue-500/30 shadow-lg" />
          <div className="absolute -bottom-4 right-6 w-12 h-6 bg-blue-950 rounded-b-xl border border-blue-500/30 shadow-lg" />
        </div>
      </div>

      {/* FOOTER */}
      <div className="relative z-10 flex items-center justify-between text-xs text-gray-500 pt-2 px-4">
        <span>Alignez 4 pions de votre couleur horizontalement, verticalement ou en diagonale</span>
        <span>Touchez une colonne sur votre smartphone pour lâcher votre pion</span>
      </div>
    </div>
  );
};
