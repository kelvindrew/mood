import React, { useState } from 'react';
import { useGame } from '../../../context/GameContext';
import { MenteurGameState, PlayingCard, StandardRank, StandardSuit } from '../../../types/game';
import { MobileHeader } from '../../components/MobileHeader';
import { ReactionFlinger } from '../../components/ReactionFlinger';
import { triggerHaptic, hapticPatterns } from '../../components/HapticFeedback';
import { audio } from '../../../services/audio';
import { AlertTriangle, Check, Shield, Flame, Sparkles } from 'lucide-react';

const RANKS: StandardRank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

const SUIT_ICONS: Record<StandardSuit, { symbol: string; color: string }> = {
  spades: { symbol: '♠', color: 'text-gray-900' },
  hearts: { symbol: '♥', color: 'text-rose-600' },
  diamonds: { symbol: '♦', color: 'text-rose-600' },
  clubs: { symbol: '♣', color: 'text-gray-900' },
};

export const MenteurController: React.FC = () => {
  const { room, localPlayer, sendGameAction } = useGame();
  const gameState = room?.gameState as MenteurGameState | undefined;

  const [selectedCardIds, setSelectedCardIds] = useState<string[]>([]);
  const [chosenClaimRank, setChosenClaimRank] = useState<StandardRank>('A');

  if (!gameState || !localPlayer) return null;

  const isMyTurn = gameState.currentTurnPlayerId === localPlayer.id;
  const myHand: PlayingCard[] = (gameState.playerHands && gameState.playerHands[localPlayer.id]) || [];

  const handleToggleSelectCard = (card: PlayingCard) => {
    triggerHaptic(hapticPatterns.tap);
    audio.playFocus();
    setSelectedCardIds((prev) => {
      if (prev.includes(card.id)) {
        return prev.filter((id) => id !== card.id);
      } else {
        // Auto update default claim rank to selected card rank if single selection
        if (prev.length === 0) {
          setChosenClaimRank(card.rank);
        }
        return [...prev, card.id];
      }
    });
  };

  const handlePlayCards = () => {
    if (!isMyTurn || selectedCardIds.length === 0) return;
    triggerHaptic(hapticPatterns.success);
    audio.playSelect();

    sendGameAction('menteur_play_cards', {
      cardIds: selectedCardIds,
      claimedRank: chosenClaimRank,
    });

    setSelectedCardIds([]);
  };

  const handleCallLiar = () => {
    if (!gameState.lastPlay || gameState.lastPlay.playerId === localPlayer.id) return;
    triggerHaptic(hapticPatterns.error);
    audio.playCustomBuzzer(localPlayer.buzzerSound || 'arcade');

    sendGameAction('menteur_call_liar', {});
  };

  const canCallLiar = gameState.lastPlay && gameState.lastPlay.playerId !== localPlayer.id;

  return (
    <div className="min-h-screen flex flex-col justify-between bg-background text-white select-none">
      <MobileHeader />

      <main className="p-3 flex-1 flex flex-col justify-between space-y-3">
        {/* Turn Status Banner */}
        <div
          className={`p-3 rounded-2xl text-center border transition-all ${
            isMyTurn
              ? 'bg-amber-500/20 border-brand-gold shadow-glow-gold'
              : 'bg-surface-card border-white/10 text-gray-400'
          }`}
        >
          <div className="flex items-center justify-between px-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-brand-gold">
              {isMyTurn ? '🌟 VOTRE TOUR DE POSER' : 'TOUR ADVERSE'}
            </span>
            <span className="font-mono font-bold text-xs text-white">
              {myHand.length} cartes en main
            </span>
          </div>

          {gameState.lastPlay && (
            <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between text-xs">
              <span className="text-gray-300">
                {gameState.lastPlay.playerName} a posé {gameState.lastPlay.cardCount} carte(s)
              </span>
              <span className="font-mono font-black text-amber-400 text-sm px-2 py-0.5 rounded bg-surface-dark border border-white/10">
                "{gameState.lastPlay.claimedRank}"
              </span>
            </div>
          )}
        </div>

        {/* Tactical Buzzer MENTEUR ! Button */}
        {canCallLiar && (
          <button
            onClick={handleCallLiar}
            className="w-full py-4 rounded-3xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white font-black text-xl tracking-wider shadow-[0_0_35px_rgba(225,29,72,0.7)] border-2 border-white/40 active:scale-95 transition-all animate-pulse flex items-center justify-center space-x-3"
          >
            <AlertTriangle className="w-6 h-6 text-yellow-300 animate-bounce" />
            <span>🚨 C’EST UN MENTEUR !</span>
          </button>
        )}

        {/* Claim Rank Picker */}
        {isMyTurn && (
          <div className="p-3 rounded-2xl bg-surface-card border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-gray-300">
                ANNONCE DÉCLARÉE À LA TABLE :
              </span>
              <span className="font-mono font-black text-brand-gold text-base">
                "{chosenClaimRank}"
              </span>
            </div>

            <div className="flex items-center space-x-1.5 overflow-x-auto pb-1">
              {RANKS.map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    triggerHaptic(hapticPatterns.tap);
                    setChosenClaimRank(r);
                  }}
                  className={`px-3 py-1.5 rounded-xl font-mono font-black text-xs transition-all flex-shrink-0 ${
                    chosenClaimRank === r
                      ? 'bg-brand-gold text-gray-900 shadow-md scale-110'
                      : 'bg-surface-dark border border-white/10 text-gray-300 hover:bg-surface-light'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Private Cards Hand */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-gray-300">
              VOTRE MAIN PRIVÉE (TOUCHEZ POUR SÉLECTIONNER)
            </span>
            <span className="text-[11px] font-bold text-amber-400">
              {selectedCardIds.length} sélectionnée(s)
            </span>
          </div>

          <div className="p-2.5 rounded-3xl bg-[#121824] border-2 border-white/10 min-h-[160px] flex items-center overflow-x-auto space-x-2 shadow-inner">
            {myHand.length === 0 ? (
              <span className="text-xs text-gray-500 mx-auto">Vous n'avez plus de cartes !</span>
            ) : (
              myHand.map((card) => {
                const isSelected = selectedCardIds.includes(card.id);
                const suitCfg = SUIT_ICONS[card.suit] || { symbol: '♠', color: 'text-gray-900' };

                return (
                  <button
                    key={card.id}
                    onClick={() => handleToggleSelectCard(card)}
                    className={`w-16 h-28 rounded-2xl bg-white border-2 flex flex-col justify-between p-2 transform transition-all duration-200 flex-shrink-0 shadow-lg ${
                      isSelected
                        ? '-translate-y-4 border-amber-400 ring-4 ring-amber-400/50 shadow-glow-gold scale-105'
                        : 'border-gray-200 hover:-translate-y-1'
                    }`}
                  >
                    <div className={`text-sm font-black font-mono leading-none ${suitCfg.color}`}>
                      {card.rank}
                      <span className="block text-[10px]">{suitCfg.symbol}</span>
                    </div>

                    <div className={`text-2xl font-black self-center ${suitCfg.color}`}>
                      {suitCfg.symbol}
                    </div>

                    <div className={`text-sm font-black font-mono leading-none self-end rotate-180 ${suitCfg.color}`}>
                      {card.rank}
                      <span className="block text-[10px]">{suitCfg.symbol}</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Action Button: Play Cards */}
        <button
          disabled={!isMyTurn || selectedCardIds.length === 0}
          onClick={handlePlayCards}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-base shadow-glow-emerald disabled:opacity-40 flex items-center justify-center space-x-2 active:scale-95 transition-all border border-white/20"
        >
          <Check className="w-5 h-5" />
          <span>
            {selectedCardIds.length > 0
              ? `POSER ${selectedCardIds.length} CARTE(S) (ANNONCE "${chosenClaimRank}")`
              : 'SÉLECTIONNEZ VOS CARTES À POSER'}
          </span>
        </button>

        <ReactionFlinger />
      </main>
    </div>
  );
};
