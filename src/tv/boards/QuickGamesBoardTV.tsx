import React, { useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { QuickGamesGameState } from '../../types/game';
import { Clock, Trophy, Sparkles, Zap, Flame, Award, Crown } from 'lucide-react';
import { playSoundFX } from '../../engine/PlaySoundFX';

export const QuickGamesBoardTV: React.FC = () => {
  const { room } = useGame();
  const gameState = room?.gameState as QuickGamesGameState | undefined;

  useEffect(() => {
    if (!gameState) return;
    if (gameState.roundStatus === 'intro') {
      playSoundFX.playCountdownBeep(false);
    } else if (gameState.roundStatus === 'active') {
      playSoundFX.playCountdownBeep(true);
    }
  }, [gameState?.roundStatus, gameState?.roundNumber]);

  if (!gameState) {
    return <div className="p-10 text-white">Chargement du Quick Games Arcade...</div>;
  }

  const sortedPlayers = [...(room?.players || [])].sort((a, b) => {
    const scoreA = gameState.scores[a.id] || 0;
    const scoreB = gameState.scores[b.id] || 0;
    return scoreB - scoreA;
  });

  return (
    <div className="relative w-full h-full flex flex-col justify-between px-12 py-5 select-none overflow-hidden bg-[#07090E]">
      {/* Top Header: Round badge, Game title & Timer */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4 z-20">
        <div className="flex items-center space-x-4">
          <div className="px-4 py-1.5 rounded-full bg-gradient-to-r from-brand-red to-amber-500 text-white font-black text-xs uppercase tracking-wider shadow-glow-red flex items-center space-x-1.5">
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>MANCHE {gameState.roundNumber} / {gameState.totalRounds}</span>
          </div>
          <span className="text-xl font-black font-display text-white">
            {gameState.miniGameState?.title || 'QUICK GAMES ARCADE'}
          </span>
        </div>

        {/* Big Countdown Timer */}
        <div className="flex items-center space-x-2 px-5 py-2 rounded-2xl bg-surface-card border border-white/10 shadow-lg">
          <Clock className="w-5 h-5 text-brand-gold" />
          <span className="font-mono font-black text-2xl text-white">{gameState.timeRemaining}s</span>
        </div>
      </div>

      {/* Main Game Stage Arena */}
      <div className="relative flex-1 flex flex-col items-center justify-center my-4">
        {/* Intro Countdown */}
        {gameState.roundStatus === 'intro' && (
          <div className="max-w-2xl w-full p-8 rounded-3xl bg-surface-card/90 border-4 border-amber-400 shadow-glow-gold text-center space-y-4 animate-scale-in">
            <span className="text-xs font-black uppercase tracking-widest text-brand-gold">ÉPREUVE SUIVANTE</span>
            <h2 className="text-4xl font-black font-display text-white">
              {gameState.miniGameState?.title}
            </h2>
            <p className="text-lg font-bold text-gray-300 leading-relaxed">
              {gameState.miniGameState?.instructions}
            </p>
            <div className="w-20 h-20 mx-auto rounded-full bg-brand-red text-white font-display font-black text-4xl flex items-center justify-center shadow-glow-red animate-bounce">
              {gameState.timeRemaining}
            </div>
          </div>
        )}

        {/* 1. Reaction Speed (Flash Screen) */}
        {gameState.currentMiniGame === 'reaction_speed' && gameState.roundStatus === 'active' && (
          <div className={`w-full max-w-3xl h-80 rounded-3xl flex flex-col items-center justify-center text-center p-8 transition-colors duration-200 border-4 ${
            gameState.miniGameState?.isGreen
              ? 'bg-emerald-500 border-white shadow-[0_0_80px_rgba(16,185,129,0.8)] animate-pulse'
              : 'bg-rose-950/60 border-rose-500/50'
          }`}>
            <h2 className="text-5xl font-black font-display text-white tracking-tight">
              {gameState.miniGameState?.isGreen ? '⚡ TOUCHEZ MAINTENANT !' : '⏳ ATTENDEZ LE VERT...'}
            </h2>
          </div>
        )}

        {/* 2. Color Match (Stroop) */}
        {gameState.currentMiniGame === 'color_match' && gameState.roundStatus === 'active' && (
          <div className="p-10 rounded-3xl bg-surface-card border-4 border-white/20 text-center space-y-4 shadow-2xl">
            <span className="text-xs font-black uppercase text-gray-400">QUELLE EST CETTE COULEUR ?</span>
            <h2
              className="text-7xl font-black font-display tracking-widest filter drop-shadow-2xl"
              style={{ color: gameState.miniGameState?.targetHex }}
            >
              {gameState.miniGameState?.targetWord}
            </h2>
          </div>
        )}

        {/* 3. Math Flash */}
        {gameState.currentMiniGame === 'math_flash' && gameState.roundStatus === 'active' && (
          <div className="p-10 rounded-3xl bg-surface-card border-4 border-white/20 text-center space-y-4 shadow-2xl">
            <span className="text-xs font-black uppercase text-brand-gold">CALCUL RAPIDE</span>
            <h2 className="text-6xl font-black font-mono text-white tracking-wider">
              {gameState.miniGameState?.equation}
            </h2>
          </div>
        )}

        {/* 4. Tap Rush */}
        {gameState.currentMiniGame === 'tap_rush' && gameState.roundStatus === 'active' && (
          <div className="p-10 rounded-3xl bg-surface-card border-4 border-white/20 text-center space-y-4 shadow-2xl">
            <span className="text-xs font-black uppercase text-brand-gold">FRÉNÉSIE DU CLIC</span>
            <h2 className="text-5xl font-black font-display text-white">
              TOUCHEZ 20 FOIS LE PLUS VITE !
            </h2>
          </div>
        )}

        {/* Reveal / Round Winner Ticker */}
        {gameState.roundStatus === 'reveal' && (
          <div className="p-6 rounded-3xl bg-surface-card/95 border-2 border-brand-gold shadow-glow-gold text-center space-y-2 animate-scale-in">
            <span className="text-xs font-black uppercase text-brand-gold">FIN DE LA MANCHE</span>
            <h3 className="text-2xl font-black text-white">Résultats enregistrés !</h3>
          </div>
        )}

        {/* Final Tournament Winner */}
        {gameState.roundStatus === 'finished' && (
          <div className="p-8 rounded-3xl bg-gradient-to-br from-amber-500 to-yellow-600 text-gray-900 shadow-2xl text-center space-y-3 animate-scale-in">
            <Crown className="w-14 h-14 mx-auto text-white animate-bounce" />
            <h2 className="text-4xl font-black font-display">GRAND VAINQUEUR !</h2>
            <p className="text-xl font-bold uppercase tracking-widest">
              🏆 {gameState.winner} REMPORTE LE TOURNOI !
            </p>
          </div>
        )}
      </div>

      {/* Bottom Live Scores Ribbon */}
      <div className="p-4 rounded-3xl bg-surface-card border border-white/10 z-20 flex items-center justify-between">
        <div className="flex items-center space-x-2 text-xs font-black uppercase text-brand-gold">
          <Trophy className="w-4 h-4" />
          <span>SCORES DU SALON :</span>
        </div>

        <div className="flex items-center space-x-6">
          {sortedPlayers.map((p, idx) => (
            <div key={p.id} className="flex items-center space-x-2">
              <span className="text-xs font-bold text-gray-300">{p.name} :</span>
              <span className="font-mono font-black text-sm text-brand-gold">
                {gameState.scores[p.id] || 0} pts
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
