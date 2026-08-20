import React, { useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { FourPicsGameState } from '../../types/game';
import { Clock, Trophy, Sparkles, Award, CheckCircle2, AlertTriangle, RotateCcw, Flame } from 'lucide-react';
import { audio } from '../../services/audio';

export const FourPicsBoardTV: React.FC = () => {
  const { room, sendGameAction } = useGame();
  const gameState = room?.gameState as FourPicsGameState | undefined;

  useEffect(() => {
    if (gameState?.roundResult) {
      if (gameState.roundResult.winnerName) {
        audio.playSelect();
      } else {
        audio.playBack();
      }
    }
  }, [gameState?.roundResult?.timestamp]);

  if (!gameState || !gameState.currentPuzzle) {
    return <div className="p-10 text-white">Chargement de 4 Images 1 Mot...</div>;
  }

  const puzzle = gameState.currentPuzzle;
  const wordLength = puzzle.wordLength;
  const isRevealed = gameState.roundStatus === 'revealed';
  const isGameOver = gameState.roundStatus === 'game_over';

  // Sorted leaderboard
  const sortedPlayers = [...(room?.players || [])].sort((a, b) => {
    const scoreA = gameState.scores[a.id] || 0;
    const scoreB = gameState.scores[b.id] || 0;
    return scoreB - scoreA;
  });

  return (
    <div className="relative w-full h-full flex flex-col justify-between px-10 py-3 select-none overflow-hidden">
      {/* Top Header: Round badge, Category, and Timer */}
      <div className="flex items-center justify-between z-20 border-b border-white/10 pb-3">
        <div className="flex items-center space-x-4">
          <div className="px-3.5 py-1 rounded-full bg-gradient-to-r from-brand-red to-brand-accent text-white text-xs font-black uppercase tracking-wider shadow-glow-red">
            MANCHE {gameState.roundNumber} / {gameState.totalRounds}
          </div>
          <div className="px-3 py-1 rounded-xl bg-surface-card border border-white/10 text-xs font-bold text-brand-cyan">
            {puzzle.category}
          </div>
        </div>

        <h1 className="text-2xl font-black font-display text-white tracking-wide">
          4 IMAGES 1 MOT
        </h1>

        {/* Dynamic Countdown Timer */}
        <div className={`flex items-center space-x-2.5 px-5 py-2 rounded-2xl border-2 transition-all ${
          gameState.timeLeft <= 5
            ? 'bg-rose-950/80 border-rose-500 shadow-glow-red animate-pulse'
            : 'bg-surface-card border-brand-gold/50 shadow-glow-gold'
        }`}>
          <Clock className={`w-5 h-5 ${gameState.timeLeft <= 5 ? 'text-rose-400' : 'text-brand-gold'}`} />
          <span className="text-xs font-bold text-gray-300">Temps :</span>
          <span className="font-mono font-black text-2xl text-white">{gameState.timeLeft}s</span>
        </div>
      </div>

      {/* Main Game Stage: 4 Big Pictures 2x2 Grid + Word Mystery Slots */}
      <div className="relative flex-1 flex flex-col items-center justify-center my-2">
        {/* 4 Images 2x2 Grid with high-depth console styling */}
        <div className="grid grid-cols-2 gap-4 max-w-[620px] max-h-[420px] aspect-square w-full">
          {puzzle.images.map((imgUrl, idx) => (
            <div
              key={`fourpic_${idx}`}
              className="relative rounded-3xl overflow-hidden bg-surface-dark border-4 border-[#202738] shadow-2xl group transition-transform duration-300 hover:scale-105"
            >
              <img
                src={imgUrl}
                alt={`Indice ${idx + 1}`}
                onError={(e) => {
                  // Fallback to high reliability backup image if original fails
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80';
                }}
                className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
              <div className="absolute top-2 left-2 px-2.5 py-1 rounded-xl bg-black/70 backdrop-blur-md border border-white/20 text-xs font-black text-brand-gold font-mono shadow-md">
                INDICE #{idx + 1}
              </div>
            </div>
          ))}
        </div>

        {/* Word Length Mystery Letter Slots */}
        <div className="mt-4 flex items-center space-x-2.5">
          {Array.from({ length: wordLength }).map((_, idx) => {
            const revealedLetter = isRevealed && gameState.roundResult ? gameState.roundResult.word[idx] : null;

            return (
              <div
                key={`slot_${idx}`}
                className={`w-14 h-16 rounded-2xl border-2 flex items-center justify-center font-display font-black text-3xl shadow-xl transition-all ${
                  revealedLetter
                    ? 'bg-gradient-to-b from-brand-gold to-amber-600 text-gray-900 border-yellow-200 shadow-glow-gold scale-110'
                    : 'bg-surface-card border-brand-cyan/40 text-transparent shadow-inner'
                }`}
              >
                {revealedLetter || ''}
              </div>
            );
          })}
        </div>

        <span className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-wider">
          Mot commun en {wordLength} lettres à composer sur votre smartphone
        </span>
      </div>

      {/* Round Result Reveal Overlay Banner */}
      {isRevealed && gameState.roundResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-2xl animate-scale-in">
          <div className="max-w-lg w-full p-8 rounded-3xl bg-surface-card border-4 border-brand-gold/80 shadow-[0_0_80px_rgba(234,179,8,0.4)] flex flex-col items-center text-center space-y-5">
            {gameState.roundResult.winnerName ? (
              <>
                <div className="flex items-center space-x-2 text-brand-gold font-black text-sm uppercase tracking-widest animate-pulse">
                  <Trophy className="w-5 h-5" />
                  <span>BONNE RÉPONSE !</span>
                </div>

                <div className="text-5xl font-black font-display tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-brand-gold to-amber-500 py-1">
                  "{gameState.roundResult.word}"
                </div>

                <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 w-full flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                    <span className="text-base font-black text-white">{gameState.roundResult.winnerName}</span>
                  </div>
                  <span className="px-3 py-1 rounded-xl bg-emerald-500 text-gray-900 font-mono font-black text-sm">
                    +{gameState.roundResult.pointsAwarded} PTS
                  </span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center space-x-2 text-rose-400 font-black text-sm uppercase tracking-widest">
                  <AlertTriangle className="w-5 h-5" />
                  <span>TEMPS ÉCOULÉ !</span>
                </div>

                <p className="text-xs text-gray-300">Le mot à trouver était :</p>

                <div className="text-5xl font-black font-display tracking-widest text-white py-1">
                  "{gameState.roundResult.word}"
                </div>

                <div className="text-xs text-gray-400">
                  Préparez-vous pour la manche suivante...
                </div>
              </>
            )}

            <div className="w-full bg-surface-dark rounded-full h-1.5 overflow-hidden">
              <div className="bg-brand-gold h-full animate-pulse w-full" />
            </div>
          </div>
        </div>
      )}

      {/* Game Over Grand Podium Screen */}
      {isGameOver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-2xl animate-scale-in p-8">
          <div className="max-w-2xl w-full p-8 rounded-3xl bg-surface-card border-4 border-brand-gold shadow-2xl flex flex-col items-center text-center space-y-6">
            <div className="flex items-center space-x-2 text-brand-gold font-black text-sm uppercase tracking-widest animate-pulse">
              <Sparkles className="w-5 h-5" />
              <span>FIN DE PARTIE • PODIUM DU SALON</span>
            </div>

            <h2 className="text-4xl font-black font-display text-white">
              VICTOIRE DE {sortedPlayers[0]?.name || 'CHAMPION'} !
            </h2>

            {/* Podium Players */}
            <div className="w-full space-y-2">
              {sortedPlayers.map((player, rankIdx) => {
                const score = gameState.scores[player.id] || 0;
                const medalColors = ['from-amber-400 to-yellow-600', 'from-slate-300 to-gray-400', 'from-amber-700 to-amber-900'];
                const rankColor = medalColors[rankIdx] || 'from-surface-light to-surface-dark';

                return (
                  <div
                    key={player.id}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border ${
                      rankIdx === 0
                        ? 'bg-amber-950/80 border-brand-gold shadow-glow-gold'
                        : 'bg-surface-dark/70 border-white/10'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${rankColor} text-gray-900 font-black flex items-center justify-center text-sm shadow-md`}>
                        {rankIdx + 1}
                      </div>
                      <span className="font-black text-white text-base">{player.name}</span>
                    </div>

                    <div className="font-mono font-black text-xl text-brand-gold">
                      {score} PTS
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Rematch Button */}
            <button
              onClick={() => sendGameAction('four_pics_rematch', {})}
              className="px-10 py-4 rounded-2xl bg-gradient-to-r from-brand-red to-brand-accent text-white font-black text-lg shadow-glow-red hover:scale-105 transition-transform flex items-center space-x-2"
            >
              <RotateCcw className="w-5 h-5" />
              <span>REVANCHE IMMÉDIATE</span>
            </button>
          </div>
        </div>
      )}

      {/* Bottom Live Scores Leaderboard */}
      <div className="flex items-center justify-between z-20 border-t border-white/10 pt-3">
        <div className="flex items-center space-x-2 text-xs font-black uppercase text-gray-300">
          <Trophy className="w-4 h-4 text-brand-gold" />
          <span>CLASSEMENT EN DIRECT</span>
        </div>

        <div className="flex items-center space-x-3">
          {sortedPlayers.map((p, i) => (
            <div
              key={p.id}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-surface-card border border-white/10 text-xs font-bold"
            >
              <span className="text-gray-400">#{i + 1}</span>
              <span className="text-white truncate max-w-[80px]">{p.name}</span>
              <span className="font-mono font-black text-brand-gold">{gameState.scores[p.id] || 0}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
