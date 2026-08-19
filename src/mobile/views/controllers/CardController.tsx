import React, { useState } from 'react';
import { useGame } from '../../../context/GameContext';
import { CardGameState, UnoCard, CardColor } from '../../../types/game';
import { MobileHeader } from '../../components/MobileHeader';
import { ReactionFlinger } from '../../components/ReactionFlinger';
import { triggerHaptic, hapticPatterns } from '../../components/HapticFeedback';
import { audio } from '../../../services/audio';
import { Plus, Bell } from 'lucide-react';

const CARD_COLOR_MAP: Record<CardColor, { bg: string; border: string; text: string }> = {
  red: { bg: 'bg-red-600', border: 'border-red-400', text: 'text-red-400' },
  blue: { bg: 'bg-blue-600', border: 'border-blue-400', text: 'text-blue-400' },
  green: { bg: 'bg-emerald-600', border: 'border-emerald-400', text: 'text-emerald-400' },
  yellow: { bg: 'bg-amber-500', border: 'border-amber-300', text: 'text-amber-400' },
  wild: { bg: 'bg-gradient-to-tr from-purple-600 via-pink-600 to-amber-500', border: 'border-white', text: 'text-purple-400' },
};

export const CardController: React.FC = () => {
  const { room, localPlayer, sendGameAction } = useGame();
  const gameState = room?.gameState as CardGameState | undefined;

  const [selectedWildCard, setSelectedWildCard] = useState<UnoCard | null>(null);

  if (!gameState || !localPlayer) return null;

  const isMyTurn = gameState.currentPlayerId === localPlayer.id;
  const myCards: UnoCard[] = (gameState.playerHands && gameState.playerHands[localPlayer.id]) || [];

  const handlePlayCard = (card: UnoCard) => {
    if (!isMyTurn) return;

    if (card.color === 'wild') {
      setSelectedWildCard(card);
      return;
    }

    triggerHaptic(hapticPatterns.cardPlay);
    audio.playCardSwoosh();
    sendGameAction('card_play_card', { cardId: card.id });
  };

  const handleChooseColor = (color: CardColor) => {
    if (!selectedWildCard) return;
    triggerHaptic(hapticPatterns.cardPlay);
    audio.playCardSwoosh();
    sendGameAction('card_play_card', { cardId: selectedWildCard.id, chosenColor: color });
    setSelectedWildCard(null);
  };

  const handleDrawCard = () => {
    if (!isMyTurn) return;
    triggerHaptic(hapticPatterns.tap);
    audio.playFocus();
    sendGameAction('card_draw');
  };

  const handleCallUno = () => {
    triggerHaptic(hapticPatterns.buzzer);
    audio.playVictory();
    sendGameAction('card_uno');
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-background text-white select-none">
      <MobileHeader />

      <main className="p-4 flex-1 flex flex-col justify-between space-y-4">
        {/* Turn Status Alert */}
        <div
          className={`p-3 rounded-2xl text-center border transition-all ${
            isMyTurn
              ? 'bg-brand-red/20 border-brand-red shadow-glow-red scale-105 animate-pulse'
              : 'bg-surface-card border-white/10 text-gray-400'
          }`}
        >
          <span className="text-[10px] font-black uppercase tracking-wider block">
            {isMyTurn ? '🔥 C’EST VOTRE TOUR DE JOUER' : 'TOUR ADVERSE'}
          </span>
          <span className="text-sm font-bold text-white">
            {isMyTurn ? 'Sélectionnez une carte ou piochez' : 'Regardez la table sur la TV'}
          </span>
        </div>

        {/* Secret Player Cards Hand (Fanned / Horizontal Scroll) */}
        <div className="space-y-2 my-auto">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase text-gray-300">
              VOTRE MAIN SECRÈTE ({myCards.length} CARTES)
            </span>
            <span className="text-[10px] text-brand-gold font-bold">Glissez ou touchez pour jouer</span>
          </div>

          <div className="flex items-center space-x-2.5 overflow-x-auto py-4 px-1 -mx-1 scrollbar-none">
            {myCards.map((card: UnoCard) => {
              const style = CARD_COLOR_MAP[card.color] || CARD_COLOR_MAP.red;
              return (
                <button
                  key={card.id}
                  disabled={!isMyTurn}
                  onClick={() => handlePlayCard(card)}
                  className={`flex-shrink-0 w-24 h-36 rounded-2xl ${style.bg} border-2 ${style.border} p-2 flex flex-col justify-between shadow-xl transform transition-all duration-200 ${
                    isMyTurn ? 'hover:-translate-y-4 active:scale-95 shadow-glow-red' : 'opacity-70'
                  }`}
                >
                  <div className="text-left font-black text-sm text-white">{card.value}</div>
                  <div className="my-auto text-center font-display font-black text-2xl text-white">
                    {card.value}
                  </div>
                  <div className="text-right font-black text-sm text-white transform rotate-180">
                    {card.value}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Actions: Draw Card & Buzzer UNO */}
        <div className="grid grid-cols-2 gap-3">
          <button
            disabled={!isMyTurn}
            onClick={handleDrawCard}
            className="py-3.5 rounded-2xl bg-surface-card border border-white/20 text-white font-bold text-xs hover:bg-surface-light disabled:opacity-40 flex items-center justify-center space-x-1.5"
          >
            <Plus className="w-4 h-4 text-brand-gold" />
            <span>PIOCHER UNE CARTE</span>
          </button>

          <button
            onClick={handleCallUno}
            className="py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-brand-red text-white font-black text-sm shadow-glow-gold active:scale-95 flex items-center justify-center space-x-1.5"
          >
            <Bell className="w-4 h-4 animate-bounce" />
            <span>BUZZER UNO !</span>
          </button>
        </div>

        {/* Reaction Flinger */}
        <ReactionFlinger />
      </main>

      {/* Wild Card Color Picker Modal */}
      {selectedWildCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-xs bg-surface-card border border-white/20 rounded-3xl p-6 shadow-2xl space-y-4 text-center">
            <h3 className="text-lg font-black font-display text-white">Choisissez une Couleur</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleChooseColor('red')}
                className="py-4 rounded-2xl bg-red-600 text-white font-black text-sm shadow-md"
              >
                ROUGE
              </button>
              <button
                onClick={() => handleChooseColor('blue')}
                className="py-4 rounded-2xl bg-blue-600 text-white font-black text-sm shadow-md"
              >
                BLEU
              </button>
              <button
                onClick={() => handleChooseColor('green')}
                className="py-4 rounded-2xl bg-emerald-600 text-white font-black text-sm shadow-md"
              >
                VERT
              </button>
              <button
                onClick={() => handleChooseColor('yellow')}
                className="py-4 rounded-2xl bg-amber-500 text-background font-black text-sm shadow-md"
              >
                JAUNE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
