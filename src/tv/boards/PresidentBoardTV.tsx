import React from 'react';
import { useGame } from '../../context/GameContext';
import { PresidentGameState, PlayingCard } from '../../types/game';
import { Crown, Sparkles, Clock, Flame, Shield, ArrowUpRight } from 'lucide-react';

const SUIT_ICONS: Record<string, { icon: string; color: string }> = {
  spades: { icon: '♠', color: 'text-gray-200' },
  hearts: { icon: '♥', color: 'text-red-500' },
  diamonds: { icon: '♦', color: 'text-red-500' },
  clubs: { icon: '♣', color: 'text-gray-200' },
};

const RANK_LABELS: Record<string, { label: string; badge: string; color: string }> = {
  president: { label: 'Président', badge: '👑', color: 'border-brand-gold bg-brand-gold/20 text-brand-gold' },
  vice_president: { label: 'Vice-Président', badge: '🥈', color: 'border-gray-300 bg-gray-400/20 text-gray-200' },
  neutral: { label: 'Neutre', badge: '⚖️', color: 'border-blue-400 bg-blue-500/20 text-blue-300' },
  vice_trouduc: { label: 'Vice-Trouduc', badge: '🧹', color: 'border-amber-700 bg-amber-800/20 text-amber-500' },
  trouduc: { label: 'Trouduc', badge: '🤡', color: 'border-rose-600 bg-rose-900/30 text-rose-400' },
};

export const PresidentBoardTV: React.FC = () => {
  const { room } = useGame();
  const gameState = room?.gameState as PresidentGameState | undefined;

  if (!gameState) {
    return <div className="p-10 text-white">Chargement de la table de Président...</div>;
  }

  const currentTurnPlayer = room?.players.find(p => p.id === gameState.currentTurnPlayerId);

  return (
    <div className="w-full h-full flex flex-col justify-between px-12 py-6 select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-2xl bg-brand-gold/20 border border-brand-gold/40 text-brand-gold">
            <Crown className="w-6 h-6 animate-bounce" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full bg-brand-red text-white text-[10px] font-black uppercase tracking-wider">
                JEU DE CARTES CULTE
              </span>
              {gameState.isRevolution && (
                <span className="px-2.5 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider animate-pulse">
                  💥 RÉVOLUTION ACTIVE (3 = MAX)
                </span>
              )}
            </div>
            <h1 className="text-2xl font-black font-display text-white mt-0.5">
              Le Président (Trouduc)
            </h1>
          </div>
        </div>

        {/* Turn Timer & Active Player */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 px-5 py-2.5 rounded-2xl bg-surface-card border border-white/10 shadow-lg">
            <Clock className="w-4 h-4 text-brand-gold" />
            <span className="font-mono font-black text-xl text-white">{gameState.turnTimeLeft}s</span>
          </div>
        </div>
      </div>

      {/* Center Table: Discard Pile / Current Trick & Revolution Banner */}
      <div className="my-auto max-w-4xl mx-auto w-full flex flex-col items-center space-y-6">
        {/* Active Player Halo Banner */}
        <div className="p-3.5 px-8 rounded-3xl bg-surface-card/90 border-2 border-brand-gold text-center shadow-glow-gold">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">C'EST AU TOUR DE :</span>
          <h2 className="text-2xl font-black font-display text-white capitalize mt-0.5">
            {currentTurnPlayer?.name || 'Joueur actif'}
          </h2>
        </div>

        {/* Card Play Arena */}
        <div className="relative w-full max-w-md h-56 rounded-3xl bg-gradient-to-b from-[#141829] to-[#0A0D18] border-4 border-[#252C42] shadow-2xl flex items-center justify-center p-6">
          {gameState.currentTrick.length === 0 ? (
            <div className="text-center text-gray-500 font-bold text-sm">
              🃏 Table vide • Le joueur actif peut poser n’importe quelle combinaison
            </div>
          ) : (
            <div className="flex items-center justify-center -space-x-4 animate-scale-in">
              {gameState.currentTrick.map((card: PlayingCard, idx) => {
                const suitMeta = SUIT_ICONS[card.suit] || SUIT_ICONS.spades;
                return (
                  <div
                    key={card.id || idx}
                    className="w-24 h-36 rounded-2xl bg-white text-gray-900 border-2 border-gray-300 shadow-2xl p-2.5 flex flex-col justify-between transform hover:-translate-y-2 transition-transform select-none"
                    style={{ transform: `rotate(${(idx - (gameState.currentTrick.length - 1) / 2) * 6}deg)` }}
                  >
                    <div className="flex items-center justify-between font-black text-lg leading-none">
                      <span>{card.rank}</span>
                      <span className={`text-xl ${suitMeta.color}`}>{suitMeta.icon}</span>
                    </div>
                    <div className={`text-4xl text-center font-black ${suitMeta.color}`}>
                      {suitMeta.icon}
                    </div>
                    <div className="flex items-center justify-between font-black text-lg leading-none rotate-180">
                      <span>{card.rank}</span>
                      <span className={`text-xl ${suitMeta.color}`}>{suitMeta.icon}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Action Log Message */}
        <div className="text-sm font-bold text-brand-gold bg-surface-dark/80 px-6 py-2 rounded-2xl border border-white/10 shadow-inner">
          {gameState.lastActionLog}
        </div>
      </div>

      {/* Bottom: Player Ranks and Remaining Cards */}
      <div className="border-t border-white/10 pt-4 flex items-center justify-between">
        <span className="text-xs font-black uppercase tracking-wider text-gray-400">RANGS & CARTES RESTANTES</span>
        <div className="flex items-center space-x-4">
          {room?.players.map((player) => {
            const cardCount = (gameState.playerCardCounts && gameState.playerCardCounts[player.id]) ?? 0;
            const finishedInfo = gameState.finishedPlayers?.find(f => f.playerId === player.id);
            const rankMeta = finishedInfo ? RANK_LABELS[finishedInfo.rankTitle] : null;

            return (
              <div
                key={player.id}
                className={`p-3 rounded-2xl border-2 flex items-center space-x-3 transition-all ${
                  rankMeta
                    ? rankMeta.color
                    : player.id === gameState.currentTurnPlayerId
                    ? 'bg-brand-red/20 border-brand-red text-white shadow-glow-red'
                    : 'bg-surface-card border-white/10 text-gray-300'
                }`}
              >
                <div className="text-2xl">{player.avatar}</div>
                <div>
                  <div className="text-xs font-black text-white truncate max-w-[100px]">{player.name}</div>
                  <div className="text-[11px] font-bold">
                    {rankMeta ? `${rankMeta.badge} ${rankMeta.label}` : `🃏 ${cardCount} cartes`}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
