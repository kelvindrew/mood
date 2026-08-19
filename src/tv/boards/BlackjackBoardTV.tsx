import React from 'react';
import { useGame } from '../../context/GameContext';
import { BlackjackGameState, PlayingCard } from '../../types/game';
import { Clock, Shield, Trophy, Coins, Sparkles } from 'lucide-react';

const SUIT_ICONS: Record<string, { icon: string; color: string }> = {
  spades: { icon: '♠', color: 'text-gray-900' },
  hearts: { icon: '♥', color: 'text-red-600' },
  diamonds: { icon: '♦', color: 'text-red-600' },
  clubs: { icon: '♣', color: 'text-gray-900' },
};

export const BlackjackBoardTV: React.FC = () => {
  const { room } = useGame();
  const gameState = room?.gameState as BlackjackGameState | undefined;

  if (!gameState) {
    return <div className="p-10 text-white">Chargement de la table de Blackjack...</div>;
  }

  const dealer = gameState.dealerHand;

  return (
    <div className="w-full h-full flex flex-col justify-between px-10 py-5 select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center space-x-3">
          <span className="px-3.5 py-1 rounded-full bg-brand-gold text-background font-black text-xs uppercase tracking-wider shadow-glow-gold">
            BLACKJACK 21 VIP
          </span>
          <span className="text-gray-300 text-sm font-bold">
            LE CROUPIER RESTE SUR 17 • PAIEMENT 3:2
          </span>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 px-5 py-2 rounded-2xl bg-surface-card border border-white/10 shadow-lg">
            <Clock className="w-4 h-4 text-brand-gold" />
            <span className="font-mono font-black text-xl text-white">{gameState.timeRemaining}s</span>
          </div>
        </div>
      </div>

      {/* Center: Dealer Hand & Half-Circle Blackjack Felt */}
      <div className="my-auto max-w-4xl mx-auto w-full flex flex-col items-center space-y-6">
        {/* Dealer Station */}
        <div className="flex flex-col items-center space-y-3">
          <div className="flex items-center space-x-2 px-4 py-1 rounded-full bg-black/60 border border-brand-gold/40 text-brand-gold text-xs font-black uppercase">
            <span>CROUPIER DE LA SMART TV</span>
            <span className="font-mono text-white text-sm">
              ({dealer.hideHoleCard ? '?' : `${dealer.score} pts`})
            </span>
          </div>

          {/* Dealer Cards */}
          <div className="flex items-center space-x-3">
            {dealer.cards.map((card: PlayingCard, idx: number) => {
              const isHoleHidden = idx === 1 && dealer.hideHoleCard;
              if (isHoleHidden) {
                return (
                  <div
                    key={`dealer_hidden`}
                    className="w-20 h-28 rounded-xl bg-gradient-to-tr from-brand-red to-rose-900 border-2 border-white shadow-xl flex items-center justify-center text-white font-black text-2xl"
                  >
                    🂠
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
        </div>

        {/* Players Seats and Active Hands */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
          {room?.players.map((player) => {
            const hand = gameState.playerHands && gameState.playerHands[player.id];
            if (!hand) return null;

            const isCurrent = player.id === gameState.currentPlayerId;

            return (
              <div
                key={player.id}
                className={`p-4 rounded-3xl border-2 flex flex-col justify-between space-y-3 transition-all ${
                  isCurrent
                    ? 'bg-surface-card border-brand-red shadow-glow-red scale-105'
                    : 'bg-surface-card/80 border-white/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">{player.avatar}</span>
                    <span className="text-xs font-black text-white truncate max-w-[80px]">{player.name}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-brand-gold/20 text-brand-gold font-mono font-black text-xs">
                    {hand.score} pts
                  </span>
                </div>

                {/* Hand Cards */}
                <div className="flex items-center justify-center -space-x-3 py-1">
                  {hand.cards.map((card: PlayingCard, idx: number) => {
                    const suitMeta = SUIT_ICONS[card.suit] || SUIT_ICONS.spades;
                    return (
                      <div
                        key={card.id || idx}
                        className="w-14 h-20 rounded-lg bg-white text-gray-900 border border-gray-300 shadow-md p-1 flex flex-col justify-between"
                      >
                        <div className="font-black text-[10px] leading-none">{card.rank}</div>
                        <div className={`text-lg text-center font-black ${suitMeta.color}`}>{suitMeta.icon}</div>
                        <div className="font-black text-[10px] leading-none rotate-180 text-right">{card.rank}</div>
                      </div>
                    );
                  })}
                </div>

                {/* Status or Action Badge */}
                <div className="text-center">
                  {hand.isBust ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-600 text-white font-black text-[10px] uppercase">
                      💥 CRÈVE (BUST)
                    </span>
                  ) : hand.isBlackjack ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-brand-gold text-background font-black text-[10px] uppercase shadow-glow-gold">
                      ✨ BLACKJACK !
                    </span>
                  ) : hand.payoutStatus === 'win' ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-white font-black text-[10px] uppercase shadow-glow-emerald">
                      🏆 VICTOIRE
                    </span>
                  ) : hand.payoutStatus === 'push' ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-gray-500 text-white font-black text-[10px] uppercase">
                      ⚖️ ÉGALITÉ
                    </span>
                  ) : isCurrent ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-brand-red text-white font-black text-[10px] uppercase animate-pulse">
                      À VOUS DE JOUER
                    </span>
                  ) : (
                    <span className="text-[10px] text-gray-400 font-bold">Mise : {hand.bet}$</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
