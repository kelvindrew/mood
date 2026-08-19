import React, { useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import confetti from 'canvas-confetti';
import { Trophy, RotateCcw, Home, Sparkles, Flame, ShieldAlert, Award } from 'lucide-react';
import { audio } from '../../services/audio';
import { tvNav } from '../../services/tvNavigation';

export const TVResultsView: React.FC = () => {
  const { room, replayGame, returnToHome } = useGame();

  const players = room?.players || [];
  const winner = players[0] || { name: 'Champion', avatar: '👑', color: 'red' };

  useEffect(() => {
    // Play celebratory victory fanfare
    audio.playVictory();

    // Voice commentator announcement
    audio.speak(`Victoire éclatante de ${winner.name} ! Quel match formidable !`);

    // Fire fireworks confetti
    const duration = 4 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#E50914', '#FFB800', '#10B981', '#3B82F6', '#8A2BE2'],
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#E50914', '#FFB800', '#10B981', '#3B82F6', '#8A2BE2'],
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
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-brand-red/15 via-[#0B0D14] to-[#0B0D14] pointer-events-none" />

      {/* Top Banner */}
      <div className="relative z-10 space-y-2">
        <div className="inline-flex items-center space-x-2 px-4 py-1 rounded-full bg-brand-gold/20 border border-brand-gold/40 text-brand-gold text-xs font-black uppercase tracking-widest">
          <Sparkles className="w-4 h-4 fill-current" />
          <span>FIN DE PARTIE • RÉSULTATS OFFICIELS</span>
        </div>
        <h1 className="text-5xl lg:text-6xl font-black font-display text-white tracking-tight">
          VICTOIRE ÉCLATANTE !
        </h1>
      </div>

      {/* Center Podium of Champions */}
      <div className="relative z-10 flex items-end justify-center space-x-6 my-auto pt-4">
        {/* 2nd Place */}
        {players.length > 1 && (
          <div className="flex flex-col items-center animate-scale-in">
            <div className="text-5xl mb-2">{players[1]?.avatar || '🥈'}</div>
            <div className="font-bold text-base text-gray-200">{players[1]?.name || 'Joueur 2'}</div>
            <div className="text-xs text-gray-400 mb-2">2ème Place</div>
            <div className="w-44 h-32 rounded-t-3xl bg-surface-card border-t-4 border-gray-400 flex flex-col items-center justify-center p-4 shadow-xl">
              <span className="font-display font-black text-4xl text-gray-400">2</span>
              <span className="text-[11px] text-gray-400 mt-1">Excellent match</span>
            </div>
          </div>
        )}

        {/* 1st Place (Champion) */}
        <div className="flex flex-col items-center animate-scale-in">
          <Trophy className="w-12 h-12 text-brand-gold drop-shadow-glow-gold animate-bounce mb-1" />
          <div className="text-7xl mb-2">
            {winner.selfieImage ? (
              <img src={winner.selfieImage} alt={winner.name} className="w-20 h-20 rounded-2xl object-cover border-2 border-brand-gold mx-auto shadow-lg" />
            ) : (
              winner.avatar
            )}
          </div>
          <div className="font-black font-display text-2xl text-white tracking-wide">{winner.name}</div>
          <div className="text-xs font-bold text-brand-gold uppercase tracking-wider mb-2">★ CHAMPION DU SALON ★</div>
          <div className="w-52 h-44 rounded-t-3xl bg-gradient-to-t from-brand-red/60 via-brand-red/30 to-brand-gold/30 border-t-4 border-brand-gold flex flex-col items-center justify-center p-4 shadow-glow-gold">
            <span className="font-display font-black text-6xl text-white drop-shadow-md">1</span>
            <span className="text-xs font-black text-brand-gold mt-1 tracking-wider uppercase">VICTOIRE</span>
          </div>
        </div>

        {/* 3rd Place */}
        {players.length > 2 && (
          <div className="flex flex-col items-center animate-scale-in">
            <div className="text-5xl mb-2">{players[2]?.avatar || '🥉'}</div>
            <div className="font-bold text-base text-gray-200">{players[2]?.name || 'Joueur 3'}</div>
            <div className="text-xs text-gray-400 mb-2">3ème Place</div>
            <div className="w-44 h-24 rounded-t-3xl bg-surface-card border-t-4 border-amber-700 flex flex-col items-center justify-center p-4 shadow-xl">
              <span className="font-display font-black text-3xl text-amber-700">3</span>
              <span className="text-[11px] text-gray-400 mt-1">Bien joué</span>
            </div>
          </div>
        )}
      </div>

      {/* Party Gage / Challenge Box (if active) */}
      {room?.activeGage && (
        <div className="relative z-10 p-4 rounded-3xl bg-rose-950/70 border-2 border-rose-500 max-w-xl w-full shadow-2xl animate-scale-in my-2">
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
          className="flex items-center space-x-3 px-10 py-4 rounded-2xl bg-brand-red hover:bg-red-600 text-white font-black text-lg shadow-glow-red hover:scale-105 focus:scale-110 focus:bg-white focus:text-brand-red focus:ring-4 focus:ring-brand-red transition-all outline-none"
        >
          <RotateCcw className="w-5 h-5" />
          <span>REJOUER AVEC LE MÊME GROUPE</span>
        </button>

        <button
          data-tv-focus
          tabIndex={0}
          onClick={() => {
            audio.playSelect();
            returnToHome();
          }}
          className="flex items-center space-x-3 px-8 py-4 rounded-2xl bg-surface-card border border-white/20 hover:border-white/40 text-gray-200 font-bold text-base hover:text-white focus:scale-105 focus:bg-white focus:text-background focus:ring-4 focus:ring-brand-accent transition-all outline-none"
        >
          <Home className="w-5 h-5" />
          <span>RETOUR À L'ACCUEIL</span>
        </button>
      </div>
    </div>
  );
};
