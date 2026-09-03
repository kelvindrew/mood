import React, { useState } from 'react';
import { useGame } from '../../../context/GameContext';
import { QuickGamesGameState } from '../../../types/game';
import { MobileHeader } from '../../components/MobileHeader';
import { ReactionFlinger } from '../../components/ReactionFlinger';
import { triggerHaptic, hapticPatterns } from '../../components/HapticFeedback';
import { playSoundFX } from '../../../engine/PlaySoundFX';
import { Zap, Flame, CheckCircle2, AlertTriangle, Smartphone } from 'lucide-react';

export const QuickGamesController: React.FC = () => {
  const { room, localPlayer, sendGameAction } = useGame();
  const gameState = room?.gameState as QuickGamesGameState | undefined;
  const [tapCount, setTapCount] = useState(0);

  if (!gameState || !localPlayer) return null;

  const currentMini = gameState.currentMiniGame;
  const isRoundActive = gameState.roundStatus === 'active';

  // 1. Reaction Speed Buzzer Tap
  const handleReactionTap = () => {
    if (!isRoundActive) return;
    triggerHaptic(hapticPatterns.tap);
    sendGameAction('quick_game_action', { action: 'reaction_tap' });
  };

  // 2. Choice Selection (Color match & Math flash)
  const handleSelectChoice = (choice: string | number) => {
    if (!isRoundActive) return;
    triggerHaptic(hapticPatterns.tap);
    sendGameAction('quick_game_action', { action: 'submit_choice', choice });
  };

  // 3. Tap Rush
  const handleTapRush = () => {
    if (!isRoundActive) return;
    triggerHaptic(hapticPatterns.tap);
    setTapCount((prev) => prev + 1);
    sendGameAction('quick_game_action', { action: 'tap_rush_click' });
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-background text-white select-none">
      <MobileHeader />

      <main className="p-4 flex-1 flex flex-col justify-between space-y-4">
        {/* Top Mini Game Title */}
        <div className="p-3.5 rounded-2xl bg-surface-card border border-white/10 text-center">
          <span className="text-[10px] font-black uppercase tracking-widest text-brand-gold">
            MANCHE {gameState.roundNumber} / {gameState.totalRounds}
          </span>
          <h2 className="text-lg font-black font-display text-white mt-0.5">
            {gameState.miniGameState?.title || 'QUICK GAMES'}
          </h2>
        </div>

        {/* Dynamic Controls based on current mini game */}
        {gameState.roundStatus === 'intro' ? (
          <div className="my-auto p-8 rounded-3xl bg-surface-card border-2 border-brand-gold text-center space-y-3 animate-scale-in">
            <Zap className="w-12 h-12 mx-auto text-brand-gold animate-bounce" />
            <h3 className="text-xl font-black text-white">Préparez-vous !</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              {gameState.miniGameState?.instructions}
            </p>
          </div>
        ) : currentMini === 'reaction_speed' ? (
          <div className="my-auto flex flex-col items-center">
            <button
              onClick={handleReactionTap}
              className="w-56 h-56 rounded-full bg-gradient-to-tr from-brand-red to-brand-accent border-4 border-white shadow-glow-red active:scale-90 transition-all flex flex-col items-center justify-center space-y-2"
            >
              <Zap className="w-16 h-16 text-white animate-pulse" />
              <span className="font-display font-black text-2xl text-white tracking-wider">
                BUZZER !
              </span>
            </button>
          </div>
        ) : currentMini === 'color_match' ? (
          <div className="my-auto grid grid-cols-2 gap-3">
            {[
              { name: 'ROUGE', bg: 'bg-red-600', border: 'border-red-400' },
              { name: 'BLEU', bg: 'bg-blue-600', border: 'border-blue-400' },
              { name: 'VERT', bg: 'bg-emerald-600', border: 'border-emerald-400' },
              { name: 'JAUNE', bg: 'bg-amber-500', border: 'border-amber-400' },
            ].map((col) => (
              <button
                key={col.name}
                onClick={() => handleSelectChoice(col.name)}
                className={`py-8 rounded-2xl ${col.bg} border-2 ${col.border} text-white font-display font-black text-xl shadow-lg active:scale-95 transition-all`}
              >
                {col.name}
              </button>
            ))}
          </div>
        ) : currentMini === 'tap_rush' ? (
          <div className="my-auto flex flex-col items-center space-y-3">
            <button
              onClick={handleTapRush}
              className="w-56 h-56 rounded-3xl bg-gradient-to-tr from-amber-500 to-yellow-600 border-4 border-white shadow-glow-gold active:scale-90 transition-all flex flex-col items-center justify-center space-y-2"
            >
              <Flame className="w-16 h-16 text-white animate-bounce" />
              <span className="font-display font-black text-4xl text-white">
                TAP !
              </span>
            </button>
            <span className="text-sm font-bold text-gray-300">
              Touchez le plus vite possible !
            </span>
          </div>
        ) : gameState.miniGameState?.options ? (
          <div className={`my-auto grid ${gameState.miniGameState.options.length === 2 ? 'grid-cols-2 gap-4' : 'grid-cols-2 gap-3'}`}>
            {gameState.miniGameState.options.map((opt: string | number, i: number) => {
              let btnStyle = "bg-surface-card border-white/20 active:bg-brand-red text-white";
              if (opt === 'PAIR' || opt === 'VRAI') {
                btnStyle = "bg-emerald-600 border-emerald-400 active:bg-emerald-700 text-white";
              } else if (opt === 'IMPAIR' || opt === 'FAUX') {
                btnStyle = "bg-rose-600 border-rose-400 active:bg-rose-700 text-white";
              }
              return (
                <button
                  key={i}
                  onClick={() => handleSelectChoice(opt)}
                  className={`py-8 rounded-2xl border-2 font-display font-black text-2xl shadow-lg active:scale-95 transition-all ${btnStyle}`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="my-auto p-6 rounded-3xl bg-surface-card text-center text-gray-400">
            Regardez la TV
          </div>
        )}

        <ReactionFlinger />
      </main>
    </div>
  );
};
