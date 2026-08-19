import React, { useState, useEffect } from 'react';
import { useGame } from '../../../context/GameContext';
import { QuizGameState } from '../../../types/game';
import { MobileHeader } from '../../components/MobileHeader';
import { ReactionFlinger } from '../../components/ReactionFlinger';
import { triggerHaptic, hapticPatterns } from '../../components/HapticFeedback';
import { audio } from '../../../services/audio';
import { Clock, Flame } from 'lucide-react';

const BUZZER_STYLES = [
  { label: 'A', bg: 'bg-red-600 active:bg-red-700', shadow: 'shadow-glow-red', border: 'border-red-400' },
  { label: 'B', bg: 'bg-blue-600 active:bg-blue-700', shadow: 'shadow-glow-cyan', border: 'border-blue-400' },
  { label: 'C', bg: 'bg-amber-500 active:bg-amber-600', shadow: 'shadow-glow-gold', border: 'border-amber-300' },
  { label: 'D', bg: 'bg-emerald-600 active:bg-emerald-700', shadow: 'shadow-glow-emerald', border: 'border-emerald-400' },
];

export const QuizController: React.FC = () => {
  const { room, localPlayer, sendGameAction } = useGame();
  const gameState = room?.gameState as QuizGameState | undefined;

  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  useEffect(() => {
    setSelectedAnswer(null);
  }, [gameState?.currentQuestionIndex]);

  if (!gameState || !localPlayer) return null;

  const isQuestionPhase = gameState.state === 'question';
  const hasAnswered = selectedAnswer !== null || (gameState.answers && !!gameState.answers[localPlayer.id]);
  const myStreak = (gameState.streaks && gameState.streaks[localPlayer.id]) || 0;

  const handleAnswer = (optionIndex: number) => {
    if (!isQuestionPhase || hasAnswered) return;

    setSelectedAnswer(optionIndex);
    triggerHaptic(hapticPatterns.buzzer);
    audio.playCustomBuzzer(localPlayer.buzzerSound || 'arcade');
    sendGameAction('quiz_answer', { optionIndex });
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-background text-white select-none">
      <MobileHeader />

      <main className="p-4 flex-1 flex flex-col justify-between space-y-4">
        {/* Status Bar */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-surface-card border border-white/10">
          <div className="flex items-center space-x-2">
            <Clock className={`w-4 h-4 ${gameState.timeRemaining <= 5 ? 'text-rose-500 animate-spin' : 'text-brand-gold'}`} />
            <span className="font-mono font-black text-base text-white">{gameState.timeRemaining}s</span>
          </div>

          {myStreak > 0 && (
            <div className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-brand-gold/20 text-brand-gold text-xs font-black">
              <Flame className="w-3.5 h-3.5 fill-current" />
              <span>Série x{myStreak}</span>
            </div>
          )}

          <span className="text-xs text-gray-400 font-bold">
            Q{gameState.currentQuestionIndex + 1}/{gameState.totalQuestions}
          </span>
        </div>

        {/* Big Buzzers Grid */}
        <div className="my-auto space-y-3">
          <div className="text-center text-xs font-bold text-gray-400">
            {hasAnswered ? '✅ Réponse verrouillée ! Regardez la TV' : 'Appuyez vite sur le buzzer de votre choix :'}
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            {BUZZER_STYLES.map((buzzer, idx) => {
              const isSelected = selectedAnswer === idx;
              return (
                <button
                  key={buzzer.label}
                  disabled={!isQuestionPhase || hasAnswered}
                  onClick={() => handleAnswer(idx)}
                  className={`h-36 rounded-3xl ${buzzer.bg} border-4 ${buzzer.border} flex flex-col items-center justify-center transition-all ${
                    isSelected
                      ? 'scale-105 ring-4 ring-white shadow-2xl brightness-125'
                      : hasAnswered
                      ? 'opacity-40 grayscale'
                      : 'hover:scale-105 active:scale-90 shadow-xl'
                  }`}
                >
                  <span className="font-display font-black text-5xl text-white drop-shadow-md">
                    {buzzer.label}
                  </span>
                  {isSelected && (
                    <span className="text-[10px] font-black text-white uppercase tracking-wider mt-1 bg-black/40 px-2 py-0.5 rounded-full">
                      VERROUILLÉ
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Reaction Flinger */}
        <ReactionFlinger />
      </main>
    </div>
  );
};
