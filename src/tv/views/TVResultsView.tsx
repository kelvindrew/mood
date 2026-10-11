import React, { useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import confetti from 'canvas-confetti';
import { Trophy, RotateCcw, Home, Sparkles, Flame, ShieldAlert, Award } from 'lucide-react';
import { audio } from '../../services/audio';
import { tvNav } from '../../services/tvNavigation';
import { useTvBack } from '../hooks/useTvNav';

export const TVResultsView: React.FC = () => {
  const { room, replayGame, returnToHome } = useGame();

  // M5 — Back télécommande = retour à l'accueil (partie terminée, non destructif)
  useTvBack(() => {
    audio.playBack();
    returnToHome();
  });

  const players = room?.players || [];

  // C3 — Le podium est issu du classement final explicite calculé par le
  // serveur à partir du résultat RÉEL de la partie (scores, ordre d'arrivée,
  // jetons, statuts, pions, équipe...), jamais de la position dans room.players.
  const ranking = room?.finalRanking || [];
  const resolveEntry = (idx: number) => {
    const entry = ranking[idx];
    if (!entry) return null;
    const player = players.find((p) => p.id === entry.playerId);
    return {
      playerId: entry.playerId,
      name: entry.name || player?.name || 'Joueur',
      avatar: player?.avatar || entry.avatar || '🎮',
      selfieImage: player?.selfieImage,
      score: entry.score ?? 0,
      rank: entry.rank,
    };
  };

  const winner = resolveEntry(0) || (players[0] ? {
    playerId: players[0].id, name: players[0].name, avatar: players[0].avatar, selfieImage: players[0].selfieImage, score: players[0].score, rank: 1,
  } : { playerId: '', name: 'Champion', avatar: '👑', selfieImage: undefined as string | undefined, score: 0, rank: 1 });
  const second = resolveEntry(1);
  const third = resolveEntry(2);
  // Ex æquo en tête (jeux à score) : plusieurs rangs 1
  const coChampions = ranking.filter((e) => e.rank === winner.rank).length;

  useEffect(() => {
    // Play celebratory victory fanfare
    audio.playVictory();

    // Fire fireworks confetti
    const duration = 4 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#06B6D4', '#22D3EE', '#F59E0B', '#10B981', '#6366F1'],
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#06B6D4', '#22D3EE', '#F59E0B', '#10B981', '#6366F1'],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();

    tvNav.setInitialFocus('button');
  }, []);

  return (
    <div className="relative min-h-screen pt-16 px-12 pb-20 select-none flex flex-col justify-between items-center text-center">
      {/* Background Glow */}
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-cyan-500/10 via-[#0A0F1D] to-[#0A0F1D] pointer-events-none" />

      {/* Top Banner */}
      <div className="relative z-10 space-y-2">
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-xs font-black uppercase tracking-widest">
          <Sparkles className="w-4 h-4 fill-current text-amber-400" />
          <span>FIN DE PARTIE • RÉSULTATS OFFICIELS</span>
        </div>
        <h1 className="text-5xl lg:text-6xl font-black font-display text-white tracking-tight">
          {room?.resultLabel || 'VICTOIRE ÉCLATANTE !'}
        </h1>
      </div>

      {/* Center Podium of Champions */}
      <div className="relative z-10 flex items-end justify-center space-x-6 my-auto pt-4">
        {/* 2nd Place */}
        {second && (
          <div className="flex flex-col items-center animate-scale-in">
            <div className="text-5xl mb-2">{second.avatar || '🥈'}</div>
            <div className="font-bold text-base text-slate-200">{second.name || 'Joueur 2'}</div>
            <div className="text-xs text-slate-400 mb-2">
              2ème Place{second.score > 0 ? ` • ${second.score} pts` : ''}
            </div>
            <div className="w-44 h-32 rounded-t-3xl bg-slate-800/90 border-t-4 border-slate-300 border-x border-slate-700/60 flex flex-col items-center justify-center p-4 shadow-xl">
              <span className="font-display font-black text-4xl text-slate-300">2</span>
              <span className="text-[11px] text-slate-400 mt-1 font-semibold">Excellent match</span>
            </div>
          </div>
        )}

        {/* 1st Place (Champion) */}
        <div className="flex flex-col items-center animate-scale-in">
          <Trophy className="w-12 h-12 text-amber-400 drop-shadow-[0_0_20px_rgba(245,158,11,0.5)] animate-bounce mb-1" />
          <div className="text-7xl mb-2">
            {winner.selfieImage ? (
              <img src={winner.selfieImage} alt={winner.name} className="w-20 h-20 rounded-2xl object-cover border-2 border-amber-400 mx-auto shadow-lg" />
            ) : (
              winner.avatar
            )}
          </div>
          <div className="font-black font-display text-2xl text-white tracking-wide">{winner.name}</div>
          <div className="text-xs font-black text-amber-400 uppercase tracking-wider mb-2">
            ★ CHAMPION DU SALON ★{coChampions > 1 ? ' • EX ÆQUO' : ''}
          </div>
          <div className="w-52 h-44 rounded-t-3xl bg-gradient-to-t from-cyan-950/80 via-slate-800/95 to-amber-500/25 border-t-4 border-amber-400 border-x border-cyan-500/30 flex flex-col items-center justify-center p-4 shadow-[0_0_35px_rgba(245,158,11,0.25)]">
            <span className="font-display font-black text-6xl text-white drop-shadow-md">1</span>
            <span className="text-xs font-black text-amber-300 mt-1 tracking-wider uppercase">VICTOIRE</span>
          </div>
        </div>

        {/* 3rd Place */}
        {third && (
          <div className="flex flex-col items-center animate-scale-in">
            <div className="text-5xl mb-2">{third.avatar || '🥉'}</div>
            <div className="font-bold text-base text-slate-200">{third.name || 'Joueur 3'}</div>
            <div className="text-xs text-slate-400 mb-2">
              3ème Place{third.score > 0 ? ` • ${third.score} pts` : ''}
            </div>
            <div className="w-44 h-24 rounded-t-3xl bg-slate-800/90 border-t-4 border-amber-600/80 border-x border-slate-700/60 flex flex-col items-center justify-center p-4 shadow-xl">
              <span className="font-display font-black text-3xl text-amber-500/90">3</span>
              <span className="text-[11px] text-slate-400 mt-1 font-semibold">Bien joué</span>
            </div>
          </div>
        )}
      </div>

      {/* Party Gage / Challenge Box (if active) */}
      {room?.activeGage && (
        <div className="relative z-10 p-4 rounded-3xl bg-rose-950/60 border border-rose-500/60 max-w-xl w-full shadow-2xl animate-scale-in my-2">
          <div className="flex items-center justify-center space-x-2 text-rose-300 text-xs font-black uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4" />
            <span>GAGE DE SOIRÉE POUR : {room.activeGage.targetPlayerName}</span>
          </div>
          <h3 className="text-lg font-black font-display text-white mt-1">
            "{room.activeGage.challenge}"
          </h3>
        </div>
      )}

      {/* Action Buttons for Smart TV Remote */}
      <div className="relative z-10 flex items-center space-x-6 pt-4">
        <button
          data-tv-focus
          tabIndex={0}
          onClick={() => {
            audio.playSelect();
            replayGame();
          }}
          className="flex items-center space-x-3 px-10 py-4 rounded-2xl bg-gradient-to-r from-cyan-400 to-cyan-300 hover:from-cyan-300 hover:to-cyan-200 text-slate-950 font-black text-lg shadow-[0_4px_25px_rgba(6,182,212,0.35)] hover:scale-105 focus:scale-105 focus:bg-white focus:text-slate-950 focus:ring-4 focus:ring-white transition-all outline-none cursor-pointer"
        >
          <RotateCcw className="w-5 h-5 stroke-[2.5]" />
          <span>REJOUER AVEC LE MÊME GROUPE</span>
        </button>

        <button
          data-tv-focus
          tabIndex={0}
          onClick={() => {
            audio.playSelect();
            returnToHome();
          }}
          className="flex items-center space-x-3 px-8 py-4 rounded-2xl bg-slate-800/90 hover:bg-slate-700/90 border border-slate-600/70 text-slate-200 font-bold text-base hover:text-white focus:scale-105 focus:bg-cyan-400 focus:text-slate-950 focus:ring-4 focus:ring-white transition-all outline-none cursor-pointer"
        >
          <Home className="w-5 h-5" />
          <span>RETOUR À L'ACCUEIL</span>
        </button>
      </div>
    </div>
  );
};
