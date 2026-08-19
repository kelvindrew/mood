import React from 'react';
import { useGame } from '../../context/GameContext';
import { ScrabbleGameState } from '../../types/game';
import { Clock, Trophy, Award, Sparkles, BookOpen, CheckCircle2, AlertTriangle, User } from 'lucide-react';

const MULTIPLIERS_MAP: Record<string, { label: string; bg: string; text: string }> = {
  TW: { label: 'MT', bg: 'bg-rose-600', text: 'text-white' }, // Mot Triple
  DW: { label: 'MD', bg: 'bg-pink-500', text: 'text-white' }, // Mot Double
  TL: { label: 'LT', bg: 'bg-blue-600', text: 'text-white' }, // Lettre Triple
  DL: { label: 'LD', bg: 'bg-sky-500', text: 'text-white' },  // Lettre Double
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

export const WordBoardTV: React.FC = () => {
  const { room } = useGame();
  const gameState = room?.gameState as ScrabbleGameState | undefined;

  if (!gameState) {
    return <div className="p-10 text-white">Chargement du plateau Scrabble...</div>;
  }

  const currentPlayer = room?.players.find((p) => p.id === gameState.currentPlayerId);

  return (
    <div className="w-full min-h-screen flex items-center justify-between px-8 py-2 select-none">
      {/* Left Column: Player Scores & Turn Info */}
      <div className="w-72 flex flex-col space-y-3.5">
        {/* Active Turn Card */}
        <div className="p-5 rounded-3xl bg-surface-card border-2 border-brand-red/50 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-brand-gold">TOUR DU JOUEUR</span>
            <div className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-surface-light border border-white/10">
              <Clock className="w-3 h-3 text-brand-gold" />
              <span className="font-mono font-bold text-xs text-brand-gold">{gameState.turnTimeLeft}s</span>
            </div>
          </div>

          <div className="flex items-center space-x-3.5 my-3">
            <div className="w-12 h-12 rounded-2xl bg-surface-light border border-white/20 flex items-center justify-center text-white font-bold text-lg">
              {currentPlayer?.name.charAt(0).toUpperCase() || 'J'}
            </div>
            <div>
              <h2 className="text-xl font-black font-display text-white truncate">{currentPlayer?.name || 'Joueur'}</h2>
              <span className="text-xs text-gray-400 font-semibold">Placez vos lettres sur le smartphone</span>
            </div>
          </div>

          {/* Dictionary Validation Box */}
          {gameState.lastWordPlayed && (
            <div
              className={`p-3 rounded-2xl border text-xs transition-all animate-scale-in ${
                gameState.lastWordPlayed.isValid !== false
                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                  : 'bg-rose-950/80 border-rose-500/60 text-rose-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase flex items-center space-x-1">
                  {gameState.lastWordPlayed.isValid !== false ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>MOT VALIDÉ ODS</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                      <span>MOT REFUSÉ (0 PT)</span>
                    </>
                  )}
                </span>
                <span className="font-bold text-[10px]">
                  {gameState.lastWordPlayed.player}
                </span>
              </div>

              <div className="flex items-center justify-between mt-1.5">
                <span className="text-base font-black tracking-widest font-mono">
                  "{gameState.lastWordPlayed.word}"
                </span>
                <span
                  className={`px-2 py-0.5 rounded font-black text-xs ${
                    gameState.lastWordPlayed.isValid !== false
                      ? 'bg-emerald-500 text-gray-900 shadow-sm'
                      : 'bg-rose-500 text-white'
                  }`}
                >
                  {gameState.lastWordPlayed.isValid !== false
                    ? `+${gameState.lastWordPlayed.points} pts`
                    : 'Tour passé'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Players Leaderboard */}
        <div className="p-4 rounded-3xl bg-surface-card/85 border border-white/10 backdrop-blur-md space-y-2.5">
          <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-gray-300">
            <span>CLASSEMENT SCORES</span>
            <Trophy className="w-4 h-4 text-brand-gold" />
          </div>

          <div className="space-y-1.5">
            {room?.players.map((p, idx) => {
              const score = (gameState.playerScores && gameState.playerScores[p.id]) || 0;
              const isCurrent = p.id === gameState.currentPlayerId;
              return (
                <div
                  key={p.id}
                  className={`flex items-center justify-between p-2.5 rounded-2xl border transition-all ${
                    isCurrent
                      ? 'bg-brand-red/20 border-brand-red text-white shadow-glow-red scale-105'
                      : 'bg-surface-light/50 border-white/5 text-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <div className="w-6 h-6 rounded-lg bg-surface-light border border-white/20 flex items-center justify-center text-xs font-bold text-white">
                      {p.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white truncate max-w-[100px]">{p.name}</div>
                      <div className="text-[9px] text-gray-400">Joueur {idx + 1}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-black text-base text-brand-gold">{score}</div>
                    <div className="text-[8px] text-gray-400 uppercase">PTS</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tile Bag Counter */}
        <div className="p-3.5 rounded-2xl bg-surface-card/70 border border-white/10 flex items-center justify-between text-xs">
          <span className="text-gray-400 font-semibold">Lettres dans le sac :</span>
          <span className="font-mono font-black text-white px-2.5 py-0.5 bg-surface-light rounded-lg">
            {gameState.letterBagCount}
          </span>
        </div>
      </div>

      {/* Center: 15x15 Scrabble Board (720px) */}
      <div className="relative w-[720px] h-[720px] max-w-[55vw] max-h-[86vh] aspect-square rounded-3xl overflow-hidden bg-[#1E1712] border-4 border-[#3A2D23] shadow-2xl p-2 flex items-center justify-center">
        <div
          className="w-full h-full grid grid-cols-15 grid-rows-15 gap-1 bg-[#140F0C] p-1.5 rounded-2xl border border-white/10"
          style={{ gridTemplateColumns: 'repeat(15, minmax(0, 1fr))', gridTemplateRows: 'repeat(15, minmax(0, 1fr))' }}
        >
          {gameState.board.map((row, rIdx) =>
            row.map((tile, cIdx) => {
              const mult = getMultiplier(rIdx, cIdx);
              const multConfig = MULTIPLIERS_MAP[mult];

              if (tile) {
                // Placed Letter Tile
                return (
                  <div
                    key={`tile_${rIdx}_${cIdx}`}
                    className="relative rounded-md bg-[#EAD7B2] border-2 border-[#D5BE93] shadow-md flex items-center justify-center font-display font-black text-gray-900 text-sm transform hover:scale-110 transition-transform"
                  >
                    <span className="leading-none text-base">{tile.letter}</span>
                    <span className="absolute bottom-0.5 right-0.5 text-[8px] font-sans font-bold text-gray-700 leading-none">
                      {tile.points}
                    </span>
                  </div>
                );
              }

              // Empty multiplier slot
              if (multConfig) {
                return (
                  <div
                    key={`mult_${rIdx}_${cIdx}`}
                    className={`rounded-md ${multConfig.bg} ${multConfig.text} flex items-center justify-center font-black text-[10px] shadow-inner`}
                  >
                    {multConfig.label}
                  </div>
                );
              }

              // Normal empty grid cell
              return (
                <div
                  key={`empty_${rIdx}_${cIdx}`}
                  className="rounded-md bg-[#251D17]/80 border border-white/5 flex items-center justify-center"
                />
              );
            })
          )}
        </div>
      </div>

      {/* Right Column: Multipliers Legend & Dictionnaire ODS Info */}
      <div className="w-72 flex flex-col space-y-3.5">
        <div className="p-4 rounded-3xl bg-surface-card/90 border border-white/10 backdrop-blur-xl shadow-2xl space-y-3">
          <div className="flex items-center space-x-2 text-xs font-black uppercase tracking-wider text-brand-gold">
            <BookOpen className="w-4 h-4 text-brand-gold" />
            <span>DICTIONNAIRE OFFICIEL</span>
          </div>

          <p className="text-[11px] text-gray-300 leading-relaxed">
            Chaque mot posé est vérifié par le <strong>Dictionnaire Scrabble (ODS)</strong> :
          </p>

          <div className="space-y-1.5 text-xs">
            <div className="flex items-center space-x-2 p-2 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span className="text-[11px]"><strong>Mot valide</strong> : Points & multiplicateurs accordés.</span>
            </div>
            <div className="flex items-center space-x-2 p-2 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span className="text-[11px]"><strong>Mot invalide</strong> : 0 point et tour passé.</span>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="p-3.5 rounded-2xl bg-surface-card/70 border border-white/10 space-y-2 text-xs">
          <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">CASES MULTIPLICATEURS</span>
          <div className="grid grid-cols-2 gap-1.5 text-[11px]">
            <div className="flex items-center space-x-1.5 text-rose-400">
              <span className="w-5 h-5 rounded bg-rose-600 text-white font-black text-[9px] flex items-center justify-center">MT</span>
              <span>Mot x3</span>
            </div>
            <div className="flex items-center space-x-1.5 text-pink-400">
              <span className="w-5 h-5 rounded bg-pink-500 text-white font-black text-[9px] flex items-center justify-center">MD</span>
              <span>Mot x2</span>
            </div>
            <div className="flex items-center space-x-1.5 text-blue-400">
              <span className="w-5 h-5 rounded bg-blue-600 text-white font-black text-[9px] flex items-center justify-center">LT</span>
              <span>Lettre x3</span>
            </div>
            <div className="flex items-center space-x-1.5 text-sky-400">
              <span className="w-5 h-5 rounded bg-sky-500 text-white font-black text-[9px] flex items-center justify-center">LD</span>
              <span>Lettre x2</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
