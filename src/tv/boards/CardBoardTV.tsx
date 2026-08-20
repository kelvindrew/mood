import React, { useState, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { CardGameState, CardColor, UnoCard } from '../../types/game';
import { Card3D } from '../components/Card3D';
import { CARD_THEMES, CardThemeId } from './cardThemes';
import { playSoundFX } from '../../engine/PlaySoundFX';
import {
  Clock,
  RotateCw,
  RotateCcw,
  Sparkles,
  Trophy,
  Flame,
  Volume2,
  Palette,
  Shield,
  Layers,
  ArrowRight,
} from 'lucide-react';

const COLOR_NAMES: Record<CardColor, { label: string; textClass: string; bgClass: string; ringColor: string }> = {
  red: { label: 'Rouge', textClass: 'text-rose-500', bgClass: 'bg-rose-600', ringColor: '#ef4444' },
  blue: { label: 'Bleu', textClass: 'text-sky-500', bgClass: 'bg-sky-600', ringColor: '#38bdf8' },
  green: { label: 'Vert', textClass: 'text-emerald-500', bgClass: 'bg-emerald-600', ringColor: '#10b981' },
  yellow: { label: 'Jaune', textClass: 'text-amber-400', bgClass: 'bg-amber-500', ringColor: '#f59e0b' },
  wild: { label: 'Joker Multi', textClass: 'text-purple-400', bgClass: 'bg-purple-600', ringColor: '#c084fc' },
};

export const CardBoardTV: React.FC = () => {
  const { room, replayGame, returnToLobby } = useGame();
  const gameState = room?.gameState as CardGameState | undefined;

  // Selected Theme (Defaults to Congo Majestueux or stored preference)
  const [currentThemeId, setCurrentThemeId] = useState<CardThemeId>('congo');
  const theme = CARD_THEMES[currentThemeId] || CARD_THEMES.congo;

  // Special Card Event Flash Banner
  const [bannerAlert, setBannerAlert] = useState<{ title: string; subtitle: string; color: string } | null>(null);

  // Play audio on active turn switch
  useEffect(() => {
    if (!gameState) return;
    if (gameState.winner) {
      playSoundFX.playDiceSixBonus();
    } else {
      playSoundFX.playCardSlap();
    }
  }, [gameState?.currentPlayerId, gameState?.winner]);

  if (!gameState) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#07090E] text-white select-none">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 border-4 border-brand-red border-t-transparent rounded-full animate-spin" />
          <span className="font-display font-black text-xl uppercase tracking-widest text-brand-gold">
            PRÉPARATION DU SALON DE CARTES...
          </span>
        </div>
      </div>
    );
  }

  const currentPlayer = room?.players.find((p) => p.id === gameState.currentPlayerId);
  const colorInfo = COLOR_NAMES[gameState.currentColor] || COLOR_NAMES.red;
  const topCard = gameState.discardPileTop;
  const allPlayers = room?.players || [];
  const isWinner = !!gameState.winner;
  const winnerPlayer = allPlayers.find((p) => p.id === gameState.winner);

  return (
    <div className="relative w-full min-h-screen flex flex-col justify-between px-10 py-6 select-none overflow-hidden bg-[#07090E]">
      {/* 1. Dynamic Ambient Light Aura */}
      <div
        className="absolute inset-0 opacity-25 filter blur-[120px] pointer-events-none transition-colors duration-1000"
        style={{ backgroundColor: colorInfo.ringColor }}
      />

      {/* 2. Top Header Bar: Game Color, Direction, Timer, Theme Selector */}
      <header className="relative z-20 flex items-center justify-between">
        {/* Left: Active Color Badge & Compass Direction */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3 px-5 py-2.5 rounded-2xl bg-surface-card/90 border-2 border-white/20 shadow-2xl backdrop-blur-md">
            <span className="text-xs font-bold text-gray-300 uppercase">COULEUR DEMANDÉE :</span>
            <div className="flex items-center space-x-2">
              <span className={`w-5 h-5 rounded-full ${colorInfo.bgClass} shadow-md ring-2 ring-white/50 animate-pulse`} />
              <span className={`font-display font-black text-base uppercase tracking-wider ${colorInfo.textClass}`}>
                {colorInfo.label}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2 px-4 py-2.5 rounded-2xl bg-surface-card/80 border border-white/10 text-xs font-black text-gray-300">
            {gameState.direction === 1 ? (
              <>
                <RotateCw className="w-4 h-4 text-emerald-400 animate-spin" style={{ animationDuration: '6s' }} />
                <span>SENS HORAIRE ↻</span>
              </>
            ) : (
              <>
                <RotateCcw className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
                <span>SENS ANTI-HORAIRE ↺</span>
              </>
            )}
          </div>
        </div>

        {/* Center: Turn Timer Countdown Radial Box */}
        <div className="flex items-center space-x-3 px-6 py-2 rounded-2xl bg-surface-card border-2 border-brand-gold/60 shadow-glow-gold">
          <Clock className={`w-5 h-5 ${gameState.turnTimeLeft <= 5 ? 'text-rose-500 animate-bounce' : 'text-brand-gold'}`} />
          <div className="flex flex-col">
            <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">TEMPS RESTANT</span>
            <span
              className={`font-mono font-black text-xl leading-none ${
                gameState.turnTimeLeft <= 5 ? 'text-rose-500 animate-pulse' : 'text-brand-gold'
              }`}
            >
              {gameState.turnTimeLeft}s
            </span>
          </div>
        </div>

        {/* Right: Theme Customizer Menu */}
        <div className="flex items-center space-x-2 bg-surface-card/80 p-1 rounded-2xl border border-white/10">
          <Palette className="w-4 h-4 text-brand-gold ml-2" />
          <span className="text-[10px] font-black uppercase text-gray-400 mr-1">THÈME :</span>
          {(Object.keys(CARD_THEMES) as CardThemeId[]).map((tId) => {
            const t = CARD_THEMES[tId];
            const isSelected = currentThemeId === tId;
            return (
              <button
                key={tId}
                onClick={() => {
                  playSoundFX.playHop();
                  setCurrentThemeId(tId);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center space-x-1 ${
                  isSelected
                    ? 'bg-gradient-to-r from-brand-red to-amber-500 text-white shadow-md scale-105 ring-1 ring-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
                title={t.name}
              >
                <span>{t.icon}</span>
                <span className="hidden xl:inline">{t.name}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* 3. Main Arena 3D Virtual Lounge Table */}
      <main className="relative z-10 my-auto flex flex-col items-center justify-center">
        {/* Virtual 3D Felt Oval Table */}
        <div
          style={{ background: theme.tableBg }}
          className={`relative w-[92vw] max-w-6xl h-[56vh] rounded-[80px] border-4 ${theme.tableBorder} ${theme.tableGlow} flex items-center justify-between px-16 shadow-2xl overflow-hidden`}
        >
          {/* Subtle Felt Texture & Concentric Rings */}
          <div
            className="absolute inset-0 pointer-events-none opacity-30"
            style={{ backgroundImage: theme.feltPattern }}
          />

          {/* Central Golden Brand Ring */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full border border-white/10 pointer-events-none flex items-center justify-center">
            <div className="w-56 h-56 rounded-full border-2 border-dashed border-white/15" />
          </div>

          {/* 3A. Draw Deck Stack (Pioche 3D) */}
          <div className="relative z-20 flex flex-col items-center space-y-3">
            <div className="relative group">
              {/* Stack depth bottom layers */}
              <div className="absolute -bottom-2 -right-2 w-28 h-42 rounded-2xl bg-black/50 border border-white/10 transform rotate-3 pointer-events-none" />
              <div className="absolute -bottom-1 -right-1 w-28 h-42 rounded-2xl bg-black/40 border border-white/10 transform -rotate-2 pointer-events-none" />

              <Card3D isFacedown themeId={currentThemeId} size="lg" className="transform group-hover:scale-105 transition-transform" />
            </div>

            <div className="px-4 py-1.5 rounded-full bg-surface-card/90 border border-white/20 text-center shadow-lg backdrop-blur-sm">
              <span className="text-xs font-mono font-black text-amber-300">{gameState.drawPileCount} CARTES</span>
            </div>
          </div>

          {/* 3B. Center Discard Pile (Talon 3D) */}
          <div className="relative z-20 flex flex-col items-center space-y-3">
            <div className="relative">
              {/* Shadow pile on table */}
              <div className="absolute -bottom-2 -left-3 w-36 h-54 rounded-3xl bg-black/60 border border-white/5 transform -rotate-12 pointer-events-none" />
              <div className="absolute -bottom-1 -right-2 w-36 h-54 rounded-3xl bg-black/40 border border-white/5 transform rotate-8 pointer-events-none" />

              {/* Active Top Card */}
              {topCard ? (
                <Card3D card={topCard} themeId={currentThemeId} size="xl" className="shadow-[0_20px_50px_rgba(0,0,0,0.8)]" />
              ) : (
                <Card3D isFacedown themeId={currentThemeId} size="xl" />
              )}
            </div>

            <div className="px-5 py-1.5 rounded-full bg-surface-card/90 border border-white/20 text-center shadow-lg backdrop-blur-sm">
              <span className="text-xs font-black uppercase tracking-wider text-white">TALON DE JEU</span>
            </div>
          </div>

          {/* 3C. Active Player Spotlight Info */}
          <div className="relative z-20 flex flex-col items-center space-y-3 max-w-[260px] text-center">
            <div className="p-5 rounded-3xl bg-surface-card/90 border-2 border-brand-gold/60 shadow-2xl backdrop-blur-md flex flex-col items-center space-y-2 animate-scale-in">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-red to-amber-500 flex items-center justify-center text-3xl shadow-glow-red border-2 border-white/40">
                  {currentPlayer?.avatar || '🦊'}
                </div>
                <span className="absolute -bottom-2 px-2 py-0.5 rounded-full bg-emerald-500 text-[9px] font-black text-gray-950 uppercase shadow-md animate-pulse">
                  EN JEU
                </span>
              </div>

              <div>
                <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider block">TOUR ACTIF :</span>
                <h3 className="font-display font-black text-lg text-white truncate">{currentPlayer?.name || 'Joueur'}</h3>
              </div>

              <div className="text-[11px] font-bold text-brand-gold">
                {gameState.playerCardCounts[gameState.currentPlayerId] || 0} cartes en main
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 4. Bottom Player Seats Orbit Ring (Fans of Cards & Status) */}
      <footer className="relative z-20 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 pt-2">
        {allPlayers.map((player) => {
          const isTurn = player.id === gameState.currentPlayerId;
          const cardCount = gameState.playerCardCounts[player.id] || 0;
          const hasUno = cardCount === 1;

          return (
            <div
              key={player.id}
              className={`p-3 rounded-2xl border-2 transition-all flex flex-col items-center justify-between space-y-2 ${
                isTurn
                  ? 'bg-gradient-to-b from-brand-red/30 to-surface-card border-brand-red shadow-glow-red scale-105 ring-2 ring-white/60'
                  : 'bg-surface-card/80 border-white/10 opacity-75'
              }`}
            >
              {/* Player Header */}
              <div className="flex items-center space-x-2 w-full">
                <div className="text-2xl flex-shrink-0">{player.avatar || '🦊'}</div>
                <div className="overflow-hidden flex-1">
                  <h4 className="font-black text-xs text-white truncate">{player.name}</h4>
                  <span className="text-[10px] font-bold text-gray-400 block">
                    {isTurn ? '🔥 À vous !' : 'En attente'}
                  </span>
                </div>

                {hasUno && (
                  <div className="px-1.5 py-0.5 rounded-lg bg-gradient-to-r from-red-600 to-amber-500 text-white font-black text-[9px] shadow-glow-red animate-bounce flex items-center space-x-0.5">
                    <Flame className="w-2.5 h-2.5" />
                    <span>UNO</span>
                  </div>
                )}
              </div>

              {/* 3D Mini Card Fan Representing Hand Size */}
              <div className="flex items-center justify-center -space-x-4 py-1">
                {Array.from({ length: Math.min(cardCount, 6) }).map((_, idx) => (
                  <div
                    key={idx}
                    style={{ transform: `rotate(${(idx - (Math.min(cardCount, 6) - 1) / 2) * 8}deg)` }}
                    className="transition-transform"
                  >
                    <Card3D isFacedown themeId={currentThemeId} size="sm" />
                  </div>
                ))}
              </div>

              <div className="text-[10px] font-mono font-black text-brand-gold">
                {cardCount} {cardCount > 1 ? 'cartes' : 'carte'}
              </div>
            </div>
          );
        })}
      </footer>

      {/* 5. VICTORY SCREEN OVERLAY */}
      {isWinner && (
        <div className="absolute inset-0 z-50 bg-[#07090E]/95 backdrop-blur-xl flex flex-col items-center justify-center p-8 select-none animate-scale-in">
          <div className="max-w-xl w-full p-8 rounded-3xl bg-surface-card border-2 border-brand-gold shadow-glow-gold text-center space-y-6">
            <div className="relative inline-block">
              <div className="w-28 h-28 rounded-3xl bg-gradient-to-tr from-amber-400 via-brand-red to-yellow-500 flex items-center justify-center text-6xl shadow-2xl border-4 border-white mx-auto animate-bounce">
                {winnerPlayer?.avatar || '👑'}
              </div>
              <div className="absolute -top-3 -right-3 p-2 rounded-full bg-brand-gold text-gray-950 shadow-lg">
                <Trophy className="w-6 h-6" />
              </div>
            </div>

            <div>
              <span className="text-xs font-black uppercase tracking-widest text-brand-gold block">
                VICTOIRE SPECTACULAIRE !
              </span>
              <h2 className="text-3xl font-black font-display text-white mt-1">
                {winnerPlayer?.name || 'Le Gagnant'} REMPORTE LA PARTIE !
              </h2>
              <p className="text-xs text-gray-400 mt-2">Toutes ses cartes ont été posées avec succès !</p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-center space-x-4 pt-2">
              <button
                onClick={() => {
                  playSoundFX.playHop();
                  replayGame();
                }}
                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-brand-red to-amber-500 text-white font-display font-black text-sm uppercase shadow-glow-red hover:scale-105 active:scale-95 transition-all"
              >
                Rejouer la Partie
              </button>

              <button
                onClick={() => {
                  playSoundFX.playHop();
                  returnToLobby();
                }}
                className="px-6 py-3.5 rounded-2xl bg-surface-dark border border-white/20 text-gray-300 font-bold text-sm hover:text-white hover:border-white transition-all"
              >
                Retour au Salon
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
