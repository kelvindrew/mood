import React, { useState } from 'react';
import { useGame } from '../../../context/GameContext';
import { PokerGameState, PlayingCard } from '../../../types/game';
import { MobileHeader } from '../../components/MobileHeader';
import { ReactionFlinger } from '../../components/ReactionFlinger';
import { triggerHaptic, hapticPatterns } from '../../components/HapticFeedback';
import { audio } from '../../../services/audio';
import { Eye, EyeOff, Coins, ArrowUpRight, Flame, ShieldAlert } from 'lucide-react';

const SUIT_ICONS: Record<string, { icon: string; color: string }> = {
  spades: { icon: '♠', color: 'text-gray-900' },
  hearts: { icon: '♥', color: 'text-red-600' },
  diamonds: { icon: '♦', color: 'text-red-600' },
  clubs: { icon: '♣', color: 'text-gray-900' },
};

export const PokerController: React.FC = () => {
  const { room, localPlayer, sendGameAction } = useGame();
  const gameState = room?.gameState as PokerGameState | undefined;

  const [peekCards, setPeekCards] = useState(false);
  const [raiseAmount, setRaiseAmount] = useState(40);

  if (!gameState || !localPlayer) return null;

  const myHoleCards: PlayingCard[] = (gameState.playerHands && gameState.playerHands[localPlayer.id]) || [];
  const myChips = (gameState.playerChips && gameState.playerChips[localPlayer.id]) ?? 1000;
  const myCurrentBet = (gameState.playerBets && gameState.playerBets[localPlayer.id]) ?? 0;
  const isMyTurn = gameState.currentTurnPlayerId === localPlayer.id;
  const toCall = Math.max(0, gameState.currentBet - myCurrentBet);

  const handleFold = () => {
    if (!isMyTurn) return;
    triggerHaptic(hapticPatterns.tap);
    audio.playBack();
    sendGameAction('poker_fold');
  };

  const handleCheckCall = () => {
    if (!isMyTurn) return;
    triggerHaptic(hapticPatterns.tap);
    audio.playSelect();
    sendGameAction('poker_check_call');
  };

  const handleRaise = () => {
    if (!isMyTurn) return;
    triggerHaptic(hapticPatterns.cardPlay);
    audio.playCardSwoosh();
    sendGameAction('poker_raise', { amount: raiseAmount });
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-background text-white select-none">
      <MobileHeader />

      <main className="p-4 flex-1 flex flex-col justify-between space-y-4">
        {/* Status Bar */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-surface-card border border-white/10">
          <div className="flex items-center space-x-2">
            <Coins className="w-4 h-4 text-brand-gold" />
            <span className="font-mono font-black text-sm text-brand-gold">{myChips} $</span>
          </div>

          <span className="px-2.5 py-0.5 rounded-full bg-surface-light border border-white/10 text-xs font-bold text-gray-300">
            {gameState.stage.toUpperCase()}
          </span>

          <button
            onClick={() => {
              triggerHaptic(hapticPatterns.tap);
              setPeekCards(!peekCards);
            }}
            className="px-3 py-1 rounded-full bg-brand-cyan/20 border border-brand-cyan/40 text-brand-cyan text-xs font-bold flex items-center space-x-1"
          >
            {peekCards ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
            <span>{peekCards ? 'Cacher' : 'Voir cartes'}</span>
          </button>
        </div>

        {/* 2 Secret Hole Cards */}
        <div className="my-auto space-y-3">
          <div className="flex items-center justify-center space-x-4">
            {peekCards ? (
              myHoleCards.map((card, idx) => {
                const suitMeta = SUIT_ICONS[card.suit] || SUIT_ICONS.spades;
                return (
                  <div
                    key={card.id || idx}
                    className="w-32 h-44 rounded-3xl bg-white text-gray-900 border-2 border-gray-300 shadow-2xl p-3 flex flex-col justify-between animate-scale-in"
                  >
                    <div className="flex items-center justify-between font-black text-base leading-none">
                      <span>{card.rank}</span>
                      <span className={`text-lg ${suitMeta.color}`}>{suitMeta.icon}</span>
                    </div>
                    <div className={`text-4xl text-center font-black ${suitMeta.color}`}>
                      {suitMeta.icon}
                    </div>
                    <div className="flex items-center justify-between font-black text-base leading-none rotate-180">
                      <span>{card.rank}</span>
                      <span className={`text-lg ${suitMeta.color}`}>{suitMeta.icon}</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div
                onClick={() => setPeekCards(true)}
                className="w-full py-10 rounded-3xl bg-surface-card border-2 border-dashed border-gray-700 text-center space-y-2 cursor-pointer"
              >
                <div className="text-3xl">🔒</div>
                <div className="text-xs font-bold text-gray-400">
                  Cartes masquées pour votre intimité
                </div>
                <div className="text-[10px] text-brand-gold font-bold">
                  Touchez ici pour les dévoiler discrètement
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Betting Actions Grid */}
        <div className="space-y-3">
          {/* Quick Raise Slider / Pills */}
          {isMyTurn && (
            <div className="flex items-center justify-between space-x-2">
              {[20, 50, 100].map((amt) => (
                <button
                  key={amt}
                  onClick={() => setRaiseAmount(amt)}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-black border transition-all ${
                    raiseAmount === amt
                      ? 'bg-brand-gold text-background border-brand-gold'
                      : 'bg-surface-card border-white/10 text-gray-400'
                  }`}
                >
                  +{amt}$
                </button>
              ))}
            </div>
          )}

          <div className="grid grid-cols-3 gap-2">
            <button
              disabled={!isMyTurn}
              onClick={handleFold}
              className="py-3.5 rounded-2xl bg-surface-card border border-rose-500/30 text-rose-400 font-black text-xs uppercase active:scale-95 disabled:opacity-40"
            >
              SE COUCHER
            </button>

            <button
              disabled={!isMyTurn}
              onClick={handleCheckCall}
              className="py-3.5 rounded-2xl bg-surface-card border border-emerald-500/50 text-emerald-400 font-black text-xs uppercase active:scale-95 disabled:opacity-40"
            >
              {toCall > 0 ? `SUIVRE (${toCall}$)` : 'PAROLE'}
            </button>

            <button
              disabled={!isMyTurn}
              onClick={handleRaise}
              className="py-3.5 rounded-2xl bg-gradient-to-r from-brand-red to-brand-accent text-white font-black text-xs uppercase shadow-glow-red active:scale-95 disabled:opacity-40"
            >
              RELANCER
            </button>
          </div>
        </div>

        <ReactionFlinger />
      </main>
    </div>
  );
};
