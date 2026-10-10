import React, { useState } from 'react';
import { useGame } from '../../../context/GameContext';
import { InterGameState, PlayingCard, StandardRank, StandardSuit } from '../../../types/game';
import { MobileHeader } from '../../components/MobileHeader';
import { ReactionFlinger } from '../../components/ReactionFlinger';
import { triggerHaptic, hapticPatterns } from '../../components/HapticFeedback';
import { audio } from '../../../services/audio';
import { Sparkles, Zap, Flame, Shield, ArrowDown, Target, Check } from 'lucide-react';
import { StandardPlayingCard } from '../../../components/cards/StandardPlayingCard';

const RANKS: StandardRank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

const SUIT_ICONS: Record<StandardSuit, { symbol: string; color: string }> = {
  spades: { symbol: '♠', color: 'text-gray-900' },
  hearts: { symbol: '♥', color: 'text-rose-600' },
  diamonds: { symbol: '♦', color: 'text-rose-600' },
  clubs: { symbol: '♣', color: 'text-gray-900' },
};

export const InterController: React.FC = () => {
  const { room, localPlayer, sendGameAction } = useGame();
  const gameState = room?.gameState as InterGameState | undefined;

  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [showDemandModal, setShowDemandModal] = useState<boolean>(false);
  const [pendingEightCardId, setPendingEightCardId] = useState<string | null>(null);

  if (!gameState || !localPlayer) return null;

  const isMyTurn = gameState.currentTurnPlayerId === localPlayer.id;
  const myHand: PlayingCard[] = (gameState.playerHands && gameState.playerHands[localPlayer.id]) || [];

  const isCardPlayable = (card: PlayingCard) => {
    if (card.rank === 'JOKER') return true;

    // Counter-attack against penalty
    if (gameState.pendingPenaltyDraws > 0) {
      return card.rank === '2' || card.rank === '10';
    }

    if (gameState.activeDemandRank) {
      return card.rank === gameState.activeDemandRank;
    }

    return card.rank === gameState.topCard.rank || card.suit === gameState.currentSuit;
  };

  const handleSelectCard = (card: PlayingCard) => {
    if (!isMyTurn) return;
    if (!isCardPlayable(card)) {
      triggerHaptic(hapticPatterns.error);
      return;
    }

    triggerHaptic(hapticPatterns.tap);
    audio.playFocus();

    if (card.rank === '8') {
      // Open demand rank modal
      setPendingEightCardId(card.id);
      setShowDemandModal(true);
      return;
    }

    // Play card immediately
    sendGameAction('inter_play_card', { cardId: card.id });
    setSelectedCardId(null);
  };

  const handleConfirmDemand = (demandedRank: StandardRank) => {
    if (!pendingEightCardId) return;
    triggerHaptic(hapticPatterns.success);
    audio.playSelect();

    sendGameAction('inter_play_card', {
      cardId: pendingEightCardId,
      chosenDemandRank: demandedRank,
    });

    setPendingEightCardId(null);
    setShowDemandModal(false);
  };

  const handleDraw = () => {
    if (!isMyTurn) return;
    triggerHaptic(hapticPatterns.tap);
    audio.playFocus();
    sendGameAction('inter_draw_card', {});
  };

  const topSuitCfg = SUIT_ICONS[gameState.currentSuit] || SUIT_ICONS.spades;

  return (
    <div className="min-h-screen flex flex-col justify-between bg-background text-white select-none">
      <MobileHeader />

      <main className="p-3 flex-1 flex flex-col justify-between space-y-3">
        {/* Turn & Attack Status Header */}
        <div
          className={`p-3 rounded-2xl text-center border transition-all ${
            isMyTurn
              ? 'bg-blue-600/20 border-brand-cyan shadow-glow-cyan'
              : 'bg-surface-card border-white/10 text-gray-400'
          }`}
        >
          <div className="flex items-center justify-between px-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-brand-cyan">
              {isMyTurn ? '🌟 VOTRE TOUR DE JOUER' : 'TOUR ADVERSE'}
            </span>
            <span className="font-mono font-bold text-xs text-white">
              {myHand.length} cartes en main
            </span>
          </div>

          {/* Under Attack Alert */}
          {gameState.pendingPenaltyDraws > 0 && isMyTurn && (
            <div className="mt-2 p-2 rounded-xl bg-rose-600 text-white font-black text-xs shadow-glow-red flex items-center justify-between animate-pulse">
              <span className="flex items-center space-x-1">
                <Flame className="w-4 h-4" />
                <span>ATTAQUE REÇUE : +{gameState.pendingPenaltyDraws} CARTES !</span>
              </span>
              <span className="text-[10px] uppercase font-bold underline">
                Contrez avec 2, 10 ou Joker !
              </span>
            </div>
          )}
        </div>

        {/* Current Table Top Card Info */}
        <div className="p-3 rounded-2xl bg-surface-card border border-white/10 flex items-center justify-between shadow-xl">
          <div className="flex items-center space-x-3">
            <StandardPlayingCard
              card={gameState.topCard}
              size="xs"
              className="shadow-md"
            />

            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                CARTE SUR LA TABLE
              </span>
              <div className="flex items-center space-x-1.5 mt-0.5">
                <span className="text-sm font-black text-white">
                  {gameState.topCard.rank === 'JOKER' ? 'JOKER' : `${gameState.topCard.rank} de ${gameState.currentSuit}`}
                </span>
              </div>
              {gameState.activeDemandRank && (
                <span className="text-xs font-bold text-amber-400 block mt-0.5">
                  Valeur exigée : <strong>{gameState.activeDemandRank}</strong>
                </span>
              )}
            </div>
          </div>

          {/* Quick Draw Button */}
          <button
            disabled={!isMyTurn}
            onClick={handleDraw}
            className="px-4 py-3 rounded-xl bg-surface-light border border-white/20 text-white font-black text-xs disabled:opacity-40 flex items-center space-x-1.5 active:scale-95 transition-all shadow-md"
          >
            <ArrowDown className="w-4 h-4 text-brand-cyan" />
            <span>
              {gameState.pendingPenaltyDraws > 0 && isMyTurn
                ? `PIOCHER (+${gameState.pendingPenaltyDraws})`
                : 'PIOCHER 1'}
            </span>
          </button>
        </div>

        {/* Private Hand with Playable Highlights */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-gray-300">
              VOTRE MAIN (TOUCHEZ UNE CARTE ILLUMINÉE POUR LA JOUER)
            </span>
          </div>

          <div className="p-2.5 rounded-3xl bg-[#0B1020] border-2 border-white/10 min-h-[170px] flex items-center overflow-x-auto space-x-2 shadow-inner">
            {myHand.length === 0 ? (
              <span className="text-xs text-gray-500 mx-auto">Vous avez gagné la manche !</span>
            ) : (
              myHand.map((card) => {
                const playable = isMyTurn && isCardPlayable(card);
                const suitCfg = SUIT_ICONS[card.suit] || { symbol: '♠', color: 'text-gray-900' };

                let specialLabel = '';
                if (card.rank === 'A') specialLabel = 'STOP';
                else if (card.rank === '2') specialLabel = '+2';
                else if (card.rank === '8') specialLabel = 'DEMANDE';
                else if (card.rank === '10') specialLabel = '+4';
                else if (card.rank === 'J') specialLabel = 'RETOUR';
                else if (card.rank === 'JOKER') specialLabel = '+5';

                return (
                  <div key={card.id} className="relative flex-shrink-0">
                    {specialLabel && (
                      <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded-full bg-indigo-600 text-white font-black text-[8px] tracking-wider uppercase shadow-md z-30">
                        {specialLabel}
                      </div>
                    )}
                    <StandardPlayingCard
                      card={card}
                      size="sm"
                      isPlayable={playable}
                      isSelected={playable}
                      onClick={playable ? () => handleSelectCard(card) : undefined}
                      className={playable ? 'cursor-pointer animate-pulse' : 'cursor-not-allowed'}
                    />
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* 8 Demand Selection Modal */}
        {showDemandModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
            <div className="w-full max-w-sm p-5 rounded-3xl bg-surface-card border-2 border-brand-gold shadow-2xl space-y-4 animate-scale-in text-center">
              <div className="flex items-center justify-center space-x-2 text-brand-gold font-black text-sm uppercase">
                <Target className="w-5 h-5" />
                <span>EXIGER UNE VALEUR (DEMANDE DU 8)</span>
              </div>

              <p className="text-xs text-gray-300">
                Choisissez la valeur que le joueur suivant sera obligé de jouer :
              </p>

              <div className="grid grid-cols-4 gap-2">
                {RANKS.map((r) => (
                  <button
                    key={r}
                    onClick={() => handleConfirmDemand(r)}
                    className="py-2.5 rounded-xl bg-surface-dark border border-white/10 hover:border-brand-gold text-white font-mono font-black text-sm hover:bg-brand-gold hover:text-gray-900 transition-all"
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <ReactionFlinger />
      </main>
    </div>
  );
};
