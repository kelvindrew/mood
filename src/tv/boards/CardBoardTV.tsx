import React from 'react';
import { useGame } from '../../context/GameContext';
import { CardGameState, CardColor, UnoCard } from '../../types/game';
import { Clock, Layers, Sparkles, AlertCircle, Volume2 } from 'lucide-react';

const CARD_COLOR_STYLES: Record<CardColor, { bg: string; border: string; glow: string; text: string; name: string }> = {
  red: { bg: 'bg-red-600', border: 'border-red-500', glow: 'shadow-glow-red', text: 'text-red-400', name: 'Rouge' },
  blue: { bg: 'bg-blue-600', border: 'border-blue-500', glow: 'shadow-blue-500/50', text: 'text-blue-400', name: 'Bleu' },
  green: { bg: 'bg-emerald-600', border: 'border-emerald-500', glow: 'shadow-emerald-500/50', text: 'text-emerald-400', name: 'Vert' },
  yellow: { bg: 'bg-amber-500', border: 'border-amber-400', glow: 'shadow-glow-gold', text: 'text-amber-400', name: 'Jaune' },
  wild: { bg: 'bg-gradient-to-tr from-purple-600 via-pink-600 to-amber-500', border: 'border-white', glow: 'shadow-glow-purple', text: 'text-purple-400', name: 'Joker' },
};

export const CardBoardTV: React.FC = () => {
  const { room } = useGame();
  const gameState = room?.gameState as CardGameState | undefined;

  if (!gameState) {
    return <div className="p-10 text-white">Chargement de la table de cartes...</div>;
  }

  const currentPlayer = room?.players.find((p) => p.id === gameState.currentPlayerId);
  const currentColorConfig = CARD_COLOR_STYLES[gameState.currentColor] || CARD_COLOR_STYLES.red;
  const topCard = gameState.discardPileTop;

  return (
    <div className="w-full h-full flex flex-col justify-between px-12 py-6 select-none relative overflow-hidden">
      {/* Background Animated Color Aura matching current game color */}
      <div
        className={`absolute inset-0 opacity-20 filter blur-3xl pointer-events-none transition-colors duration-1000 ${
          gameState.currentColor === 'red' ? 'bg-red-600' :
          gameState.currentColor === 'blue' ? 'bg-blue-600' :
          gameState.currentColor === 'green' ? 'bg-emerald-600' : 'bg-amber-500'
        }`}
      />

      {/* Top Header: Active Player Banner & Direction */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="p-3.5 rounded-2xl bg-surface-card border border-white/10 flex items-center space-x-3 backdrop-blur-md">
            <div className="text-3xl">{currentPlayer?.avatar || '🦊'}</div>
            <div>
              <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider">TOUR DU JOUEUR</span>
              <h2 className="text-xl font-black font-display text-white">{currentPlayer?.name || 'Joueur'}</h2>
            </div>
          </div>

          <div className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-surface-card border border-white/10">
            <Clock className="w-4 h-4 text-brand-gold" />
            <span className="font-mono font-bold text-sm text-brand-gold">{gameState.turnTimeLeft}s</span>
          </div>
        </div>

        {/* Current Active Color & Direction Indicator */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 px-5 py-2.5 rounded-2xl bg-surface-card border-2 border-white/20 backdrop-blur-md">
            <span className="text-xs font-bold text-gray-300">Couleur demandée :</span>
            <div className="flex items-center space-x-1.5">
              <span className={`w-4 h-4 rounded-full ${currentColorConfig.bg} shadow-md`} />
              <span className={`font-black text-sm uppercase ${currentColorConfig.text}`}>{currentColorConfig.name}</span>
            </div>
          </div>

          <div className="px-4 py-2.5 rounded-2xl bg-surface-card border border-white/10 text-xs font-bold text-gray-300">
            {gameState.direction === 1 ? 'Sens horaire ↻' : 'Sens anti-horaire ↺'}
          </div>
        </div>
      </div>

      {/* Center Table: Discard Pile & Draw Deck */}
      <div className="relative z-10 flex items-center justify-center space-x-16 my-auto py-4">
        {/* Draw Pile */}
        <div className="flex flex-col items-center space-y-2">
          <div className="relative w-40 h-60 rounded-3xl bg-gradient-to-br from-[#1E2438] to-[#121624] border-4 border-white/20 shadow-2xl flex flex-col items-center justify-center transform hover:scale-105 transition-transform">
            {/* Uno Back Logo */}
            <div className="w-24 h-16 rounded-full bg-brand-red border-2 border-brand-gold flex items-center justify-center transform -rotate-12 shadow-lg">
              <span className="font-display font-black text-white text-lg tracking-wider">PARTY</span>
            </div>
            <div className="absolute bottom-3 text-center text-xs font-mono font-bold text-gray-400">
              {gameState.drawPileCount} cartes
            </div>
          </div>
          <span className="text-xs font-bold text-gray-400">PIOCHE</span>
        </div>

        {/* Discard Pile (Top Card on Table) */}
        <div className="flex flex-col items-center space-y-2">
          <div className="relative">
            {topCard && (
              <div
                className={`w-44 h-64 rounded-3xl ${
                  CARD_COLOR_STYLES[topCard.color]?.bg || 'bg-red-600'
                } border-4 border-white shadow-2xl p-4 flex flex-col justify-between transform -rotate-3 transition-all duration-500 animate-scale-in`}
              >
                <div className="flex items-center justify-between text-white font-black text-2xl">
                  <span>{topCard.value}</span>
                  <span>{topCard.value}</span>
                </div>

                <div className="my-auto text-center">
                  <div className="w-28 h-20 mx-auto rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/40 flex items-center justify-center transform -rotate-12 shadow-inner">
                    <span className="font-display font-black text-white text-4xl drop-shadow-md">
                      {topCard.value}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-white font-black text-2xl transform rotate-180">
                  <span>{topCard.value}</span>
                  <span>{topCard.value}</span>
                </div>
              </div>
            )}
          </div>
          <span className="text-xs font-bold text-white tracking-wider uppercase">TALON CENTRAL</span>
        </div>
      </div>

      {/* Bottom Circle: Connected Players Hand Counts */}
      <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-4">
        {room?.players.map((p) => {
          const cardCount = (gameState.playerCardCounts && gameState.playerCardCounts[p.id]) ?? 7;
          const isTurn = p.id === gameState.currentPlayerId;
          const hasUno = gameState.unoCalledBy && gameState.unoCalledBy[p.id];

          return (
            <div
              key={p.id}
              className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
                isTurn
                  ? 'bg-brand-red/20 border-brand-red text-white shadow-glow-red scale-105'
                  : 'bg-surface-card/90 border-white/10 text-gray-300'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-3xl">{p.avatar}</span>
                <div>
                  <div className="font-bold text-sm text-white truncate">{p.name}</div>
                  <div className="text-[11px] text-gray-400">
                    {hasUno && (
                      <span className="px-2 py-0.5 rounded bg-brand-gold text-background font-black text-[10px] uppercase">
                        UNO !
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="flex items-center space-x-1 justify-end">
                  <Layers className="w-4 h-4 text-brand-gold" />
                  <span className="font-mono font-black text-xl text-white">{cardCount}</span>
                </div>
                <span className="text-[9px] text-gray-400 uppercase">CARTES</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
