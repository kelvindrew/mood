import React from 'react';
import { useGame } from '../../context/GameContext';
import { ScrabbleGameState } from '../../types/game';
import { Clock, Trophy, Award, Sparkles, BookOpen, CheckCircle2, AlertTriangle, Layers, Flame, Crown } from 'lucide-react';

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

const MULTIPLIERS_MAP: Record<string, { label: string; bg: string; text: string; full: string }> = {
  TW: { label: 'MT', bg: 'bg-rose-600', text: 'text-white', full: 'Mot Triple (x3)' },
  DW: { label: 'MD', bg: 'bg-pink-500', text: 'text-white', full: 'Mot Double (x2)' },
  TL: { label: 'LT', bg: 'bg-blue-600', text: 'text-white', full: 'Lettre Triple (x3)' },
  DL: { label: 'LD', bg: 'bg-sky-500', text: 'text-white', full: 'Lettre Double (x2)' },
  CENTER: { label: '★', bg: 'bg-gradient-to-tr from-amber-500 to-amber-300', text: 'text-black', full: 'Case Départ (MD x2)' },
};

export const WordBoardTV: React.FC = () => {
  const { room, setTvView } = useGame();
  const gameState = room?.gameState as ScrabbleGameState | undefined;

  if (!gameState) {
    return <div className="p-10 text-white font-bold text-center">Chargement du plateau Scrabble...</div>;
  }

  const currentPlayer = room?.players.find((p) => p.id === gameState.currentPlayerId);
  const isGameOver = !!gameState.winner;

  return (
    <div className="w-full min-h-screen flex items-center justify-between px-10 py-6 select-none bg-[#070D0B] text-white">
      {/* 1. Left Column: Turn info, Dictionary feedback, and Leaderboard */}
      <div className="w-80 flex flex-col justify-between h-[88vh] space-y-4">
        {/* Active Player Card */}
        <div className="p-5 rounded-3xl bg-white/[0.06] border border-white/15 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#FBBF24]">TOUR DU JOUEUR</span>
            <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-black/40 border border-white/10">
              <Clock className="w-3.5 h-3.5 text-[#FBBF24]" />
              <span className="font-mono font-bold text-xs text-[#FBBF24]">{gameState.turnTimeLeft}s</span>
            </div>
          </div>

          <div className="flex items-center space-x-3.5 my-3">
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-[#10B981] to-[#059669] border border-white/20 flex items-center justify-center text-white font-black text-xl shadow-lg">
              {currentPlayer?.name.charAt(0).toUpperCase() || 'J'}
            </div>
            <div className="truncate">
              <h2 className="text-xl font-black font-display text-white truncate">{currentPlayer?.name || 'Joueur'}</h2>
              <span className="text-xs text-gray-400 font-semibold">Posez vos lettres sur smartphone</span>
            </div>
          </div>

          {/* Turn timer progress bar */}
          <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden mt-1">
            <div
              className={`h-full transition-all duration-1000 ${
                gameState.turnTimeLeft <= 10 ? 'bg-rose-500 animate-pulse' : 'bg-[#10B981]'
              }`}
              style={{ width: `${Math.max(0, Math.min(100, (gameState.turnTimeLeft / 45) * 100))}%` }}
            />
          </div>

          {/* Letter Bag Count */}
          <div className="flex items-center justify-between pt-3 mt-3 border-t border-white/10 text-xs font-bold text-gray-300">
            <div className="flex items-center space-x-2">
              <Layers className="w-4 h-4 text-[#38BDF8]" />
              <span>Sac de Lettres :</span>
            </div>
            <span className="px-2.5 py-0.5 rounded-lg bg-white/10 font-mono text-[#FBBF24] font-black">
              {gameState.letterBagCount} restantes
            </span>
          </div>

          {/* Dictionary Validation Box */}
          {gameState.lastWordPlayed && (
            <div
              className={`mt-4 p-3.5 rounded-2xl border text-xs transition-all animate-scale-in ${
                gameState.lastWordPlayed.isValid !== false
                  ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300'
                  : 'bg-rose-950/80 border-rose-500/60 text-rose-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase flex items-center space-x-1.5">
                  {gameState.lastWordPlayed.isValid !== false ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>VALIDE ODS {gameState.lastWordPlayed.isScrabble ? '✨ SCRABBLE !' : ''}</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                      <span>MOT REFUSÉ (0 PT)</span>
                    </>
                  )}
                </span>
                <span className="font-bold text-[10px] opacity-80">
                  {gameState.lastWordPlayed.player}
                </span>
              </div>

              <div className="flex items-center justify-between mt-2">
                <span className="text-xl font-black tracking-widest font-mono text-white">
                  "{gameState.lastWordPlayed.word}"
                </span>
                <span
                  className={`px-2.5 py-1 rounded-lg font-black text-xs ${
                    gameState.lastWordPlayed.isValid !== false
                      ? 'bg-emerald-500 text-gray-950 shadow-sm'
                      : 'bg-rose-500 text-white'
                  }`}
                >
                  +{gameState.lastWordPlayed.points} pts
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Players Leaderboard */}
        <div className="p-5 rounded-3xl bg-white/[0.06] border border-white/10 backdrop-blur-md space-y-3 flex-1 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-gray-300">
            <span>CLASSEMENT EN DIRECT</span>
            <Trophy className="w-4 h-4 text-[#FBBF24]" />
          </div>

          <div className="space-y-2 flex-1">
            {room?.players.map((p, idx) => {
              const score = (gameState.playerScores && gameState.playerScores[p.id]) || 0;
              const isCurrent = p.id === gameState.currentPlayerId;
              return (
                <div
                  key={p.id}
                  className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                    isCurrent
                      ? 'bg-[#10B981]/25 border-[#10B981] text-white shadow-[0_0_20px_rgba(16,185,129,0.4)] scale-102'
                      : 'bg-black/30 border-white/5 text-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-7 h-7 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-xs font-bold text-white">
                      {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}
                    </div>
                    <div className="truncate">
                      <div className="text-sm font-bold text-white truncate max-w-[110px]">{p.name}</div>
                      <div className="text-[10px] text-gray-400">Joueur {idx + 1}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-black text-lg text-[#FBBF24]">{score}</div>
                    <div className="text-[9px] text-gray-400 uppercase">PTS</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Log pill */}
          <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 text-center text-xs text-gray-300 font-medium truncate">
            {gameState.lastActionLog || 'La partie commence !'}
          </div>
        </div>
      </div>

      {/* 2. Center: 15x15 Official French Scrabble Board */}
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        {/* Scrabble Board Container */}
        <div className="relative p-3.5 rounded-3xl bg-[#140F0A] border-4 border-[#3A2D23] shadow-[0_25px_60px_rgba(0,0,0,0.9)] max-w-[760px] w-full aspect-square">
          <div
            className="w-full h-full grid grid-cols-15 grid-rows-15 gap-1 bg-[#100C09] p-1 rounded-2xl border border-white/10"
            style={{ gridTemplateColumns: 'repeat(15, minmax(0, 1fr))', gridTemplateRows: 'repeat(15, minmax(0, 1fr))' }}
          >
            {gameState.board.map((row, r) =>
              row.map((tile, c) => {
                const mult = getMultiplier(r, c);
                const multConfig = MULTIPLIERS_MAP[mult];
                const isCenter = r === 7 && c === 7;

                if (tile) {
                  // Placed Tile (Ivory/Wood Style with Letter Subscript)
                  return (
                    <div
                      key={`tile_${r}_${c}`}
                      className="relative w-full h-full rounded-md bg-[#FBF2DE] text-gray-950 border border-[#D5C29A] shadow-md flex items-center justify-center font-display font-black text-sm lg:text-base select-none leading-none animate-scale-in"
                    >
                      <span>{tile.letter}</span>
                      <span className="absolute bottom-0.5 right-0.5 text-[8px] lg:text-[9px] font-sans font-bold text-gray-700 leading-none">
                        {tile.points}
                      </span>
                    </div>
                  );
                }

                // Empty Multiplier Cell
                if (multConfig) {
                  return (
                    <div
                      key={`cell_${r}_${c}`}
                      className={`w-full h-full rounded-md flex flex-col items-center justify-center font-sans font-black text-[9px] lg:text-[10px] select-none leading-none ${multConfig.bg} ${multConfig.text} opacity-90 shadow-sm`}
                      title={multConfig.full}
                    >
                      <span>{multConfig.label}</span>
                    </div>
                  );
                }

                // Standard Empty Grid Square
                return (
                  <div
                    key={`cell_${r}_${c}`}
                    className="w-full h-full rounded-md bg-[#251D17]/90 border border-white/[0.03]"
                  />
                );
              })
            )}
          </div>
        </div>

        {/* Multipliers Legend */}
        <div className="flex items-center space-x-6 mt-4 text-xs font-bold text-gray-300">
          <div className="flex items-center space-x-1.5">
            <span className="w-3.5 h-3.5 rounded bg-rose-600 flex items-center justify-center text-[8px] font-black text-white">MT</span>
            <span>Mot Triple (x3)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3.5 h-3.5 rounded bg-pink-500 flex items-center justify-center text-[8px] font-black text-white">MD</span>
            <span>Mot Double (x2)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3.5 h-3.5 rounded bg-blue-600 flex items-center justify-center text-[8px] font-black text-white">LT</span>
            <span>Lettre Triple (x3)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3.5 h-3.5 rounded bg-sky-500 flex items-center justify-center text-[8px] font-black text-white">LD</span>
            <span>Lettre Double (x2)</span>
          </div>
        </div>
      </div>

      {/* 3. Game Over Podium Modal */}
      {isGameOver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-6">
          <div className="w-full max-w-2xl p-8 rounded-3xl bg-[#140F0A] border-2 border-[#FBBF24] shadow-[0_0_80px_rgba(251,191,36,0.6)] flex flex-col items-center space-y-6 text-center animate-scale-in">
            <div className="flex items-center space-x-2 text-[#FBBF24]">
              <Crown className="w-8 h-8 fill-current" />
              <span className="text-xl font-black uppercase tracking-widest">FIN DE PARTIE SCRABBLE</span>
            </div>

            <h1 className="text-4xl font-black font-display text-white">
              Victoire de {gameState.finalPodium?.[0]?.name || 'Champion'} !
            </h1>

            {/* Podium List */}
            <div className="w-full space-y-3">
              {gameState.finalPodium?.map((item, idx) => (
                <div
                  key={item.id}
                  className={`flex items-center justify-between p-4 rounded-2xl border ${
                    idx === 0
                      ? 'bg-gradient-to-r from-amber-500/20 to-amber-600/10 border-[#FBBF24] shadow-lg'
                      : 'bg-white/5 border-white/10'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <span className="text-2xl font-black font-mono text-[#FBBF24]">
                      {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                    </span>
                    <div className="text-left">
                      <span className="font-bold text-lg text-white">{item.name}</span>
                      <div className="text-xs text-gray-400">
                        {item.stats.scrabbleCount > 0 ? `✨ ${item.stats.scrabbleCount} Scrabble(s)` : ''} • Meilleur mot : {item.stats.bestWord || '—'}
                      </div>
                    </div>
                  </div>
                  <span className="font-mono font-black text-2xl text-[#FBBF24]">{item.score} PTS</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setTvView('home')}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#10B981] to-[#059669] text-white font-black text-base uppercase tracking-wider shadow-lg hover:scale-105 transition-all"
            >
              Retour à l'Accueil
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
