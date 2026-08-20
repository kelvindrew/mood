import React, { useState } from 'react';
import { useGame } from '../../../context/GameContext';
import { CardGameState, UnoCard, CardColor } from '../../../types/game';
import { Card3D } from '../../../tv/components/Card3D';
import { MobileHeader } from '../../components/MobileHeader';
import { ReactionFlinger } from '../../components/ReactionFlinger';
import { triggerHaptic, hapticPatterns } from '../../components/HapticFeedback';
import { playSoundFX } from '../../../engine/PlaySoundFX';
import { Flame, Plus, Sparkles, AlertCircle, ArrowUpCircle } from 'lucide-react';

const COLOR_OPTIONS: { id: CardColor; label: string; bg: string; border: string; text: string }[] = [
  { id: 'red', label: 'ROUGE', bg: 'bg-rose-600', border: 'border-rose-400', text: 'text-white' },
  { id: 'blue', label: 'BLEU', bg: 'bg-sky-600', border: 'border-sky-400', text: 'text-white' },
  { id: 'green', label: 'VERT', bg: 'bg-emerald-600', border: 'border-emerald-400', text: 'text-white' },
  { id: 'yellow', label: 'JAUNE', bg: 'bg-amber-500', border: 'border-amber-300', text: 'text-gray-950' },
];

export const CardController: React.FC = () => {
  const { room, localPlayer, sendGameAction } = useGame();
  const gameState = room?.gameState as CardGameState | undefined;

  const [selectedCard, setSelectedCard] = useState<UnoCard | null>(null);
  const [wildPickerCard, setWildPickerCard] = useState<UnoCard | null>(null);

  if (!gameState || !localPlayer) return null;

  const isMyTurn = gameState.currentPlayerId === localPlayer.id;
  const myCards: UnoCard[] = (gameState.playerHands && gameState.playerHands[localPlayer.id]) || [];
  const topCard = gameState.discardPileTop;

  // Check if a card is legally playable
  const isCardPlayable = (card: UnoCard) => {
    if (!isMyTurn) return false;
    if (card.color === 'wild') return true;
    if (card.color === gameState.currentColor) return true;
    if (topCard && card.value === topCard.value) return true;
    return false;
  };

  const handleCardClick = (card: UnoCard) => {
    if (!isMyTurn) {
      triggerHaptic(hapticPatterns.error);
      return;
    }

    if (selectedCard?.id === card.id) {
      // Double tap -> play directly
      executePlayCard(card);
    } else {
      setSelectedCard(card);
      triggerHaptic(hapticPatterns.tap);
      playSoundFX.playHop();
    }
  };

  const executePlayCard = (card: UnoCard) => {
    if (!isCardPlayable(card)) {
      triggerHaptic(hapticPatterns.error);
      return;
    }

    if (card.color === 'wild') {
      setWildPickerCard(card);
      return;
    }

    triggerHaptic(hapticPatterns.cardPlay);
    playSoundFX.playCardSlap();
    sendGameAction('card_play_card', { cardId: card.id });
    setSelectedCard(null);
  };

  const handleChooseColor = (color: CardColor) => {
    if (!wildPickerCard) return;
    triggerHaptic(hapticPatterns.cardPlay);
    playSoundFX.playCardSlap();
    sendGameAction('card_play_card', { cardId: wildPickerCard.id, chosenColor: color });
    setWildPickerCard(null);
    setSelectedCard(null);
  };

  const handleDrawCard = () => {
    if (!isMyTurn) return;
    triggerHaptic(hapticPatterns.tap);
    playSoundFX.playCardSwoosh();
    sendGameAction('card_draw');
    setSelectedCard(null);
  };

  const handleCallUno = () => {
    triggerHaptic(hapticPatterns.buzzer);
    playSoundFX.playUnoHorn();
    sendGameAction('card_uno');
  };

  const hasUnoOpportunity = myCards.length <= 2;

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#07090E] text-white select-none relative overflow-hidden">
      <MobileHeader />

      <main className="p-4 flex-1 flex flex-col justify-between space-y-3 relative z-10">
        {/* 1. Turn Status & Table Color Status */}
        <div
          className={`p-3.5 rounded-2xl text-center border-2 transition-all shadow-xl ${
            isMyTurn
              ? 'bg-gradient-to-r from-brand-red/30 to-amber-500/30 border-brand-gold shadow-glow-gold scale-102 animate-pulse'
              : 'bg-surface-card border-white/10 text-gray-400'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="text-left">
              <span className="text-[10px] font-black uppercase tracking-wider block text-brand-gold">
                {isMyTurn ? '🔥 C’EST VOTRE TOUR !' : 'EN ATTENTE...'}
              </span>
              <span className="text-sm font-black text-white">
                {isMyTurn ? 'Jouez une carte ou piochez' : 'Regardez la table sur la TV'}
              </span>
            </div>

            {/* Current Color Indicator on table */}
            <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-surface-dark border border-white/20">
              <span
                className={`w-3.5 h-3.5 rounded-full ${
                  gameState.currentColor === 'red'
                    ? 'bg-rose-500'
                    : gameState.currentColor === 'blue'
                    ? 'bg-sky-500'
                    : gameState.currentColor === 'green'
                    ? 'bg-emerald-500'
                    : 'bg-amber-400'
                }`}
              />
              <span className="text-xs font-black uppercase font-mono">{gameState.currentColor}</span>
            </div>
          </div>
        </div>

        {/* 2. Main Fanned Card Hand Area */}
        <div className="flex-1 flex flex-col justify-center space-y-2 my-auto">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-black uppercase text-gray-300">
              VOTRE MAIN SECRÈTE ({myCards.length} CARTES)
            </span>
            <span className="text-[10px] text-brand-gold font-bold">
              {selectedCard ? 'Double-tapez pour jouer' : 'Touchez pour sélectionner'}
            </span>
          </div>

          {/* Smooth Horizontal Scroll Hand */}
          <div className="flex items-center space-x-3 overflow-x-auto py-6 px-3 -mx-2 scrollbar-none">
            {myCards.map((card: UnoCard) => {
              const playable = isCardPlayable(card);
              const isSelected = selectedCard?.id === card.id;

              return (
                <div key={card.id} className="flex-shrink-0">
                  <Card3D
                    card={card}
                    size="md"
                    isSelected={isSelected}
                    isPlayable={playable && isMyTurn}
                    onClick={() => handleCardClick(card)}
                  />
                </div>
              );
            })}
          </div>

          {/* Selected Card Action Confirmation Bar */}
          {selectedCard && (
            <div className="p-3 rounded-2xl bg-surface-card border-2 border-brand-gold flex items-center justify-between shadow-2xl animate-scale-in">
              <div className="text-xs font-black text-brand-gold uppercase">
                Carte prête : "{selectedCard.value}" ({selectedCard.color})
              </div>
              <button
                onClick={() => executePlayCard(selectedCard)}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-brand-red to-amber-500 text-white font-black text-xs uppercase shadow-glow-red flex items-center space-x-1.5"
              >
                <ArrowUpCircle className="w-4 h-4" />
                <span>Poser la Carte</span>
              </button>
            </div>
          )}
        </div>

        {/* 3. Bottom Action Controls: Pioche & Buzzer UNO */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          {/* Draw Button */}
          <button
            disabled={!isMyTurn}
            onClick={handleDrawCard}
            className={`py-3.5 px-4 rounded-2xl border-2 font-display font-black text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-all ${
              isMyTurn
                ? 'bg-surface-card border-white/30 text-white hover:border-brand-gold active:scale-95 shadow-lg'
                : 'bg-surface-card/40 border-white/5 text-gray-500 opacity-60'
            }`}
          >
            <Plus className="w-4 h-4 text-brand-gold" />
            <span>Piocher (+1)</span>
          </button>

          {/* UNO Buzzer Call */}
          <button
            onClick={handleCallUno}
            className={`py-3.5 px-4 rounded-2xl font-display font-black text-xs uppercase tracking-wider flex items-center justify-center space-x-2 border-2 transition-all ${
              hasUnoOpportunity
                ? 'bg-gradient-to-r from-brand-red to-amber-500 border-white text-white shadow-glow-red scale-105 animate-bounce'
                : 'bg-surface-card/60 border-white/10 text-gray-400'
            }`}
          >
            <Flame className="w-4 h-4 text-amber-300" />
            <span>CRIER "UNO !"</span>
          </button>
        </div>

        {/* 4. Live Reaction Emojis Bar */}
        <ReactionFlinger />
      </main>

      {/* 5. Wild Card Choose Color Modal */}
      {wildPickerCard && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-6 select-none animate-scale-in">
          <div className="max-w-xs w-full p-6 rounded-3xl bg-surface-card border-2 border-white/30 shadow-2xl text-center space-y-5">
            <div>
              <span className="text-xs font-black uppercase text-brand-gold tracking-wider">JOKER MAGIQUE</span>
              <h3 className="text-lg font-black font-display text-white mt-1">CHOISISSEZ LA COULEUR</h3>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c.id}
                  onClick={() => handleChooseColor(c.id)}
                  className={`py-4 rounded-2xl ${c.bg} ${c.border} border-2 ${c.text} font-display font-black text-sm uppercase shadow-xl hover:scale-105 active:scale-95 transition-all`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => setWildPickerCard(null)}
              className="text-xs text-gray-400 hover:text-white font-bold"
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
