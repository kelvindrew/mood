import React from 'react';
import { useGame } from '../../context/GameContext';
import { WerewolfGameState } from '../../types/game';
import { Moon, Sun, Clock, Skull, Shield, Eye, Flame } from 'lucide-react';

export const WerewolfBoardTV: React.FC = () => {
  const { room } = useGame();
  const gameState = room?.gameState as WerewolfGameState | undefined;

  if (!gameState) {
    return <div className="p-10 text-white">Chargement du village de Thiercelieux...</div>;
  }

  const isNight = gameState.phase.startsWith('night');
  const playersList = Object.values(gameState.players || {});
  const aliveCount = playersList.filter((p) => p.isAlive).length;

  return (
    <div className={`w-full h-full flex flex-col justify-between px-12 py-6 select-none transition-colors duration-1000 ${
      isNight ? 'bg-gradient-to-b from-[#060814] to-[#0A0D1E]' : 'bg-gradient-to-b from-[#1C160F] to-[#0D101A]'
    }`}>
      {/* Top Phase & Timer Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-3 rounded-2xl ${isNight ? 'bg-indigo-900/60 text-indigo-300 border border-indigo-500/40' : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'}`}>
            {isNight ? <Moon className="w-6 h-6 animate-pulse" /> : <Sun className="w-6 h-6 animate-spin-slow" />}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                isNight ? 'bg-indigo-600 text-white shadow-glow-purple' : 'bg-amber-500 text-background font-black'
              }`}>
                {isNight ? 'PHASE DE NUIT' : 'PHASE DE JOUR'}
              </span>
              <span className="text-xs text-gray-400 font-bold">JOUR {gameState.dayNumber}</span>
            </div>
            <h1 className="text-2xl font-black font-display text-white mt-0.5">
              Village de Thiercelieux
            </h1>
          </div>
        </div>

        {/* Phase Timer */}
        <div className="flex items-center space-x-2 px-5 py-2.5 rounded-2xl bg-surface-card border border-white/10 shadow-lg">
          <Clock className="w-4 h-4 text-brand-gold" />
          <span className="font-mono font-black text-xl text-white">{gameState.timeRemaining}s</span>
        </div>
      </div>

      {/* Center Narration Banner & Village Arena */}
      <div className="my-auto max-w-4xl mx-auto w-full flex flex-col space-y-6">
        <div className={`p-6 rounded-3xl border-2 backdrop-blur-xl text-center shadow-2xl transition-all ${
          isNight ? 'bg-[#0E122B]/90 border-indigo-500/40' : 'bg-surface-card/90 border-amber-500/40'
        }`}>
          <span className="text-xs font-black uppercase tracking-widest text-brand-gold">CHRONIQUE DU VILLAGE</span>
          <p className="text-xl font-bold text-white mt-2 leading-relaxed">
            {gameState.narratorLog}
          </p>
        </div>

        {/* Village Roster Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {playersList.map((player) => (
            <div
              key={player.id}
              className={`p-4 rounded-2xl border-2 flex items-center space-x-3 transition-all ${
                player.isAlive
                  ? 'bg-surface-card/80 border-white/15 text-white'
                  : 'bg-red-950/20 border-red-900/50 text-gray-500 opacity-50 grayscale'
              }`}
            >
              <div className="text-4xl filter drop-shadow">
                {player.isAlive ? player.avatar : '🪦'}
              </div>
              <div className="min-w-0">
                <div className="font-black text-sm text-white truncate">{player.name}</div>
                <div className={`text-[11px] font-bold ${player.isAlive ? 'text-emerald-400' : 'text-red-400'}`}>
                  {player.isAlive ? 'Vivant' : 'Éliminé'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Status */}
      <div className="border-t border-white/10 pt-4 flex items-center justify-between text-xs text-gray-400">
        <div className="flex items-center space-x-2">
          <Shield className="w-4 h-4 text-emerald-400" />
          <span>Survivants dans le village : <strong className="text-white">{aliveCount} / {playersList.length}</strong></span>
        </div>
        <span className="font-semibold text-brand-gold">
          {isNight ? 'Chaque rôle agit discrètement sur son smartphone...' : 'Exprimez-vous et votez sur vos mobiles !'}
        </span>
      </div>
    </div>
  );
};
