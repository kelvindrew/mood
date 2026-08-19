import React, { useState } from 'react';
import { useGame } from '../../../context/GameContext';
import { PresidentGameState, PlayingCard } from '../../../types/game';
import { MobileHeader } from '../../components/MobileHeader';
import { ReactionFlinger } from '../../components/ReactionFlinger';
import { triggerHaptic, hapticPatterns } from '../../components/HapticFeedback';
import { audio } from '../../../services/audio';
import { Crown, Play, SkipForward, Sparkles, Check } from 'lucide-react';

const SUIT_ICONS: Record<string, { icon: string; color: string }> = {
  spades: { icon: '♠', color: 'text-gray-900' },
  hearts: { icon: '♥', color: 'text-red-600' },
  diamonds: { icon: '♦', color: 'text-red-600' },
  clubs: { icon: '♣', color: 'text-gray-900' },
};

export const PresidentController: React.FC = () => {
  const { room, localPlayer, sendGameAction } = useGame();
  const gameState = room?.gameState as PresidentGameState | undefined;

  const [selectedCardIds, setSelectedCardIds] = useState<string[]>([]);

  if (!gameState || !localPlayer) return null;

  const myHand: PlayingCard[] = (gameState.playerHands && gameState.playerHands[localPlayer.id]) || [];
  const isMyTurn = gameState.currentTurnPlayerId === localPlayer.id;

  const toggleCard = (cardId: string) => {
    triggerHaptic(hapticPatterns.tap);
    if (selectedCardIds.includes(cardId)) {
      setSelectedCardIds(selectedCardIds.filter(id => id !== cardId));
    } else {
      setSelectedCardIds([...selectedCardIds, cardId]);
    }
  };

  const handlePlay = () => {
    if (!isMyTurn || selectedCardIds.length === 0) return;
    triggerHaptic(hapticPatterns.cardPlay);
    audio.playCardSwoosh();
    sendGameAction('president_play', { cardIds: selectedCardIds });
    setSelectedCardIds([]);
  };

  const handlePass = () => {
    if (!isMyTurn) return;
    triggerHaptic(hapticPatterns.tap);
    audio.playBack();
    sendGameAction('president_pass');
    setSelectedCardIds([]);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-background text-white select-none">
      <MobileHeader />

      <main className="p-4 flex-1 flex flex-col justify-between space-y-4">
        {/* Turn Status Alert */}
        <div
          className={`p-3.5 rounded-2xl text-center border-2 transition-all ${
            isMyTurn
              ? 'bg-brand-gold/20 border-brand-gold shadow-glow-gold scale-105 animate-pulse'
              : 'bg-surface-card border-white/10 text-gray-400'
          }`}
        >
          <span className="text-[10px] font-black uppercase tracking-widest block text-brand-gold">
            {isMyTurn ? '🚨 C’EST À VOUS DE JOUER !' : 'ATTENTE DU TOUR'}
          </span>
          <h2 className="text-base font-black font-display text-white mt-0.5">
            {isMyTurn ? 'Sélectionnez vos cartes à poser' : 'Regardez la table sur la Smart TV'}
          </h2>
        </div>

        {/* Current Table Trick Preview */}
        <div className="p-3 rounded-2xl bg-surface-card border border-white/10 flex items-center justify-between text-xs">
          <span className="text-gray-400 font-bold">Pli actuel sur la TV :</span>
          {gameState.currentTrick.length > 0 ? (
            <span className="text-brand-gold font-black">
              {gameState.currentTrick.length}x {gameState.currentTrick[0].rank}
            </span>
          ) : (
            <span className="text-emerald-400 font-bold">Table libre</span>
          )}
        </div>

        {/* Secret Player Hand (Multi-select) */}
        <div className="my-auto space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase text-gray-300">
              VOTRE MAIN SECRÈTE ({myHand.length} CARTES)
            </span>
            {selectedCardIds.length > 0 && (
              <span className="text-xs font-bold text-brand-gold">
                {selectedCardIds.length} sélectionnée(s)
              </span>
            )}
          </div>

          <div className="grid grid-cols-4 gap-2 max-h-[260px] overflow-y-auto pr-1">
            {myHand.map((card) => {
              const isSelected = selectedCardIds.includes(card.id);
              const suitMeta = SUIT_ICONS[card.suit] || SUIT_ICONS.spades;

              return (
                <button
                  key={card.id}
                  onClick={() => toggleCard(card.id)}
                  className={`h-28 rounded-2xl bg-white text-gray-900 border-2 p-2 flex flex-col justify-between transition-all transform ${
                    isSelected
                      ? '-translate-y-2 ring-4 ring-brand-gold border-brand-gold shadow-2xl scale-105'
                      : 'border-gray-300 shadow-md'
                  }`}
                >
                  <div className="flex items-center justify-between font-black text-sm leading-none">
                    <span>{card.rank}</span>
                    <span className={`text-base ${suitMeta.color}`}>{suitMeta.icon}</span>
                  </div>
                  <div className={`text-2xl text-center font-black ${suitMeta.color}`}>
                    {suitMeta.icon}
                  </div>
                  <div className="flex items-center justify-between font-black text-xs leading-none rotate-180">
                    <span>{card.rank}</span>
                    <span className={`text-sm ${suitMeta.color}`}>{suitMeta.icon}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Play & Pass Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            disabled={!isMyTurn}
            onClick={handlePass}
            className="py-3.5 rounded-2xl bg-surface-card border border-white/20 text-gray-300 font-black text-sm flex items-center justify-center space-x-2 active:scale-95 disabled:opacity-40"
          >
            <SkipForward className="w-4 h-4" />
            <span>PASSER</span>
          </button>

          <button
            disabled={!isMyTurn || selectedCardIds.length === 0}
            onClick={handlePlay}
            className="py-3.5 rounded-2xl bg-gradient-to-r from-brand-gold to-amber-600 text-background font-black text-sm shadow-glow-gold flex items-center justify-center space-x-2 active:scale-95 disabled:opacity-40"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>JOUER ({selectedCardIds.length})</span>
          </button>
        </div>

        <ReactionFlinger />
      </main>
    </div>
  );
};
