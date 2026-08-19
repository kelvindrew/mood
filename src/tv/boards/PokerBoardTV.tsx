import React from 'react';
import { useGame } from '../../context/GameContext';
import { PokerGameState, PlayingCard } from '../../types/game';
import { Coins, Clock, Trophy, Sparkles, User, Shield } from 'lucide-react';

const SUIT_ICONS: Record<string, { icon: string; color: string }> = {
  spades: { icon: '♠', color: 'text-gray-900' },
  hearts: { icon: '♥', color: 'text-red-600' },
  diamonds: { icon: '♦', color: 'text-red-600' },
  clubs: { icon: '♣', color: 'text-gray-900' },
};

export const PokerBoardTV: React.FC = () => {
  const { room } = useGame();
  const gameState = room?.gameState as PokerGameState | undefined;

  if (!gameState) {
    return <div className="p-10 text-white">Chargement de la table de Poker...</div>;
  }

  const currentTurnPlayer = room?.players.find(p => p.id === gameState.currentTurnPlayerId);

  return (
    <div className="w-full h-full flex flex-col justify-between px-10 py-5 select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center space-x-3">
          <span className="px-3.5 py-1 rounded-full bg-brand-gold text-background font-black text-xs uppercase tracking-wider shadow-glow-gold">
            TEXAS HOLD’EM NO LIMIT
          </span>
          <span className="text-gray-300 text-sm font-bold uppercase">
            ÉTAPE : <strong className="text-brand-cyan">{gameState.stage.toUpperCase()}</strong>
          </span>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 px-5 py-2 rounded-2xl bg-surface-card border border-white/10 shadow-lg">
            <Clock className="w-4 h-4 text-brand-gold" />
            <span className="font-mono font-black text-xl text-white">{gameState.turnTimeLeft}s</span>
          </div>
        </div>
      </div>

      {/* Center: Luxury Green Felt Oval Poker Table */}
      <div className="relative my-auto w-full max-w-4xl mx-auto h-[380px] rounded-[100px] bg-emerald-900 border-[14px] border-[#3D2512] shadow-2xl flex flex-col items-center justify-between p-8">
        {/* Inner Table Watermark */}
        <div className="absolute inset-4 rounded-[80px] border border-emerald-500/20 pointer-events-none flex items-center justify-center">
          <span className="font-display font-black text-5xl text-emerald-950/40 tracking-widest uppercase">
            PLAYFLIX CASINO
          </span>
        </div>

        {/* Central Pot Chips */}
        <div className="relative z-10 flex items-center space-x-3 px-6 py-2 rounded-2xl bg-black/60 border-2 border-brand-gold shadow-glow-gold">
          <Coins className="w-6 h-6 text-brand-gold animate-bounce" />
          <span className="text-xs font-black uppercase text-gray-300">POT TOTAL :</span>
          <span className="font-mono font-black text-2xl text-brand-gold">{gameState.pot} $</span>
        </div>

        {/* 5 Community Cards (Flop, Turn, River) */}
        <div className="relative z-10 flex items-center justify-center space-x-3 my-auto">
          {Array.from({ length: 5 }).map((_, idx) => {
            const card = gameState.communityCards[idx];
            if (!card) {
              return (
                <div
                  key={`empty_${idx}`}
                  className="w-20 h-28 rounded-xl border-2 border-dashed border-emerald-600/40 bg-emerald-950/40 flex items-center justify-center text-emerald-600 font-black text-xs"
                >
                  {idx < 3 ? 'FLOP' : idx === 3 ? 'TURN' : 'RIVER'}
                </div>
              );
            }

            const suitMeta = SUIT_ICONS[card.suit] || SUIT_ICONS.spades;
            return (
              <div
                key={card.id || idx}
                className="w-20 h-28 rounded-xl bg-white text-gray-900 border-2 border-gray-200 shadow-2xl p-2 flex flex-col justify-between animate-scale-in"
              >
                <div className="flex items-center justify-between font-black text-sm leading-none">
                  <span>{card.rank}</span>
                  <span className={`text-base ${suitMeta.color}`}>{suitMeta.icon}</span>
                </div>
                <div className={`text-3xl text-center font-black ${suitMeta.color}`}>
                  {suitMeta.icon}
                </div>
                <div className="flex items-center justify-between font-black text-sm leading-none rotate-180">
                  <span>{card.rank}</span>
                  <span className={`text-base ${suitMeta.color}`}>{suitMeta.icon}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Log Message */}
        <div className="relative z-10 text-xs font-bold text-emerald-200 bg-black/50 px-5 py-1.5 rounded-full border border-emerald-400/30">
          {gameState.lastActionLog}
        </div>
      </div>

      {/* Bottom: Player Seats around table */}
      <div className="border-t border-white/10 pt-3 flex items-center justify-between">
        <span className="text-xs font-black uppercase tracking-wider text-gray-400">TABLE DES JOUEURS</span>
        <div className="flex items-center space-x-4">
          {room?.players.map((player) => {
            const chips = (gameState.playerChips && gameState.playerChips[player.id]) ?? 1000;
            const bet = (gameState.playerBets && gameState.playerBets[player.id]) ?? 0;
            const isFolded = gameState.foldedPlayers?.includes(player.id);
            const isCurrent = player.id === gameState.currentTurnPlayerId;

            return (
              <div
                key={player.id}
                className={`p-3 rounded-2xl border-2 flex items-center space-x-3 transition-all ${
                  isFolded
                    ? 'bg-black/40 border-gray-800 text-gray-600 opacity-50'
                    : isCurrent
                    ? 'bg-brand-red/20 border-brand-red text-white shadow-glow-red scale-105'
                    : 'bg-surface-card border-white/10 text-gray-300'
                }`}
              >
                <div className="text-2xl">{player.avatar}</div>
                <div>
                  <div className="text-xs font-black text-white truncate max-w-[100px]">{player.name}</div>
                  <div className="flex items-center space-x-2 text-[11px] font-bold">
                    <span className="text-brand-gold">{chips} $</span>
                    {bet > 0 && <span className="text-emerald-400 font-mono">Mise: {bet}$</span>}
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
