import React from 'react';
import { useGame } from '../../../context/GameContext';
import { BlackjackGameState, PlayingCard } from '../../../types/game';
import { MobileHeader } from '../../components/MobileHeader';
import { ReactionFlinger } from '../../components/ReactionFlinger';
import { triggerHaptic, hapticPatterns } from '../../components/HapticFeedback';
import { audio } from '../../../services/audio';
import { Plus, Hand, Zap, Sparkles } from 'lucide-react';

const SUIT_ICONS: Record<string, { icon: string; color: string }> = {
  spades: { icon: '♠', color: 'text-gray-900' },
  hearts: { icon: '♥', color: 'text-red-600' },
  diamonds: { icon: '♦', color: 'text-red-600' },
  clubs: { icon: '♣', color: 'text-gray-900' },
};

export const BlackjackController: React.FC = () => {
  const { room, localPlayer, sendGameAction } = useGame();
  const gameState = room?.gameState as BlackjackGameState | undefined;

  if (!gameState || !localPlayer) return null;

  const myHand = gameState.playerHands && gameState.playerHands[localPlayer.id];
  if (!myHand) return null;

  const isMyTurn = gameState.currentPlayerId === localPlayer.id && !myHand.isStand && !myHand.isBust;

  const handleHit = () => {
    if (!isMyTurn) return;
    triggerHaptic(hapticPatterns.cardPlay);
    audio.playCardSwoosh();
    sendGameAction('blackjack_hit');
  };

  const handleStand = () => {
    if (!isMyTurn) return;
    triggerHaptic(hapticPatterns.tap);
    audio.playSelect();
    sendGameAction('blackjack_stand');
  };

  const handleDouble = () => {
    if (!isMyTurn || myHand.cards.length !== 2) return;
    triggerHaptic(hapticPatterns.cardPlay);
    audio.playCardSwoosh();
    sendGameAction('blackjack_double');
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-background text-white select-none">
      <MobileHeader />

      <main className="p-4 flex-1 flex flex-col justify-between space-y-4">
        {/* Turn Status Alert */}
        <div
          className={`p-3.5 rounded-2xl text-center border-2 transition-all ${
            isMyTurn
              ? 'bg-brand-red/20 border-brand-red shadow-glow-red scale-105 animate-pulse'
              : 'bg-surface-card border-white/10 text-gray-400'
          }`}
        >
          <span className="text-[10px] font-black uppercase tracking-widest block text-brand-gold">
            {isMyTurn ? '🚨 C’EST À VOUS DE JOUER !' : 'ATTENTE DU CROUPIER'}
          </span>
          <h2 className="text-base font-black font-display text-white mt-0.5">
            {isMyTurn ? 'Tirez une carte ou restez sur votre score' : 'Regardez la Smart TV'}
          </h2>
        </div>

        {/* Hand Cards & Score Display */}
        <div className="my-auto space-y-3">
          <div className="flex items-center justify-between px-2">
            <span className="text-xs font-black uppercase text-gray-400">VOTRE MAIN</span>
            <div className="px-3 py-1 rounded-full bg-brand-gold text-background font-mono font-black text-sm shadow-glow-gold">
              {myHand.score} POINTS
            </div>
          </div>

          <div className="flex items-center justify-center space-x-2.5">
            {myHand.cards.map((card: PlayingCard, idx: number) => {
              const suitMeta = SUIT_ICONS[card.suit] || SUIT_ICONS.spades;
              return (
                <div
                  key={card.id || idx}
                  className="w-24 h-36 rounded-2xl bg-white text-gray-900 border-2 border-gray-300 shadow-2xl p-2 flex flex-col justify-between animate-scale-in"
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

        {/* Action Buttons (Hit, Stand, Double) */}
        <div className="grid grid-cols-3 gap-2.5">
          <button
            disabled={!isMyTurn}
            onClick={handleHit}
            className="py-4 rounded-2xl bg-emerald-600 active:bg-emerald-700 text-white font-black text-xs uppercase shadow-glow-emerald flex flex-col items-center justify-center space-y-1 active:scale-95 disabled:opacity-40"
          >
            <Plus className="w-5 h-5" />
            <span>TIRER</span>
          </button>

          <button
            disabled={!isMyTurn}
            onClick={handleStand}
            className="py-4 rounded-2xl bg-rose-600 active:bg-rose-700 text-white font-black text-xs uppercase shadow-glow-red flex flex-col items-center justify-center space-y-1 active:scale-95 disabled:opacity-40"
          >
            <Hand className="w-5 h-5" />
            <span>RESTER</span>
          </button>

          <button
            disabled={!isMyTurn || myHand.cards.length !== 2}
            onClick={handleDouble}
            className="py-4 rounded-2xl bg-brand-gold active:bg-amber-600 text-background font-black text-xs uppercase shadow-glow-gold flex flex-col items-center justify-center space-y-1 active:scale-95 disabled:opacity-40"
          >
            <Zap className="w-5 h-5 fill-current" />
            <span>DOUBLER</span>
          </button>
        </div>

        <ReactionFlinger />
      </main>
    </div>
  );
};
