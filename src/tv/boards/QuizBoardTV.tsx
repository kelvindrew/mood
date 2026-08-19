import React from 'react';
import { useGame } from '../../context/GameContext';
import { QuizGameState } from '../../types/game';
import { Clock, Trophy, Flame, CheckCircle, XCircle, Sparkles } from 'lucide-react';

const OPTION_STYLES = [
  { bg: 'bg-red-600', border: 'border-red-500', label: 'A', letterBg: 'bg-red-700' },
  { bg: 'bg-blue-600', border: 'border-blue-500', label: 'B', letterBg: 'bg-blue-700' },
  { bg: 'bg-amber-500', border: 'border-amber-400', label: 'C', letterBg: 'bg-amber-600' },
  { bg: 'bg-emerald-600', border: 'border-emerald-500', label: 'D', letterBg: 'bg-emerald-700' },
];

export const QuizBoardTV: React.FC = () => {
  const { room } = useGame();
  const gameState = room?.gameState as QuizGameState | undefined;

  if (!gameState || !gameState.currentQuestion) {
    return <div className="p-10 text-white">Chargement du plateau Quiz...</div>;
  }

  const question = gameState.currentQuestion;
  const isReveal = gameState.state === 'reveal' || gameState.state === 'round_summary';
  const totalAnswered = Object.keys(gameState.answers || {}).length;
  const totalPlayers = room?.players.length || 1;

  return (
    <div className="w-full h-full flex flex-col justify-between px-12 py-6 select-none">
      {/* Top Bar: Category, Question Number & Timer */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center space-x-3">
          <span className="px-3.5 py-1 rounded-full bg-brand-purple text-white font-black text-xs uppercase tracking-wider shadow-glow-purple">
            {question.category}
          </span>
          <span className="text-gray-400 text-sm font-bold">
            QUESTION {gameState.currentQuestionIndex + 1} / {gameState.totalQuestions}
          </span>
        </div>

        {/* Circular / Box Countdown Timer */}
        <div className="flex items-center space-x-2 px-5 py-2 rounded-2xl bg-surface-card border border-white/10 shadow-lg">
          <Clock className={`w-5 h-5 ${gameState.timeRemaining <= 5 ? 'text-rose-500 animate-spin' : 'text-brand-gold'}`} />
          <span className={`font-mono font-black text-2xl ${gameState.timeRemaining <= 5 ? 'text-rose-500 animate-pulse' : 'text-white'}`}>
            {gameState.timeRemaining}s
          </span>
        </div>
      </div>

      {/* Center Question Box */}
      <div className="my-auto max-w-4xl mx-auto w-full flex flex-col space-y-6">
        <div className="p-8 rounded-3xl bg-surface-card/95 border-2 border-white/15 backdrop-blur-2xl shadow-2xl text-center animate-scale-in">
          <h2 className="text-3xl lg:text-4xl font-black font-display text-white leading-tight tracking-tight">
            {question.question}
          </h2>

          {/* Answers Status Counter */}
          <div className="mt-4 flex items-center justify-center space-x-2 text-xs text-gray-400 font-semibold">
            <span className="w-2 h-2 rounded-full bg-brand-cyan animate-pulse" />
            <span>{totalAnswered} / {totalPlayers} joueur(s) ont répondu sur smartphone</span>
          </div>
        </div>

        {/* 4 Choices Grid (A, B, C, D) */}
        <div className="grid grid-cols-2 gap-4">
          {question.options.map((opt, idx) => {
            const style = OPTION_STYLES[idx];
            const isCorrect = idx === question.correctIndex;

            let cardStyle = `${style.bg} border-2 ${style.border} text-white shadow-lg`;
            if (isReveal) {
              if (isCorrect) {
                cardStyle = 'bg-emerald-600 border-4 border-white text-white shadow-glow-emerald scale-105 animate-pulse';
              } else {
                cardStyle = 'bg-surface-dark/60 border border-white/10 text-gray-500 opacity-40';
              }
            }

            return (
              <div
                key={idx}
                className={`flex items-center space-x-4 p-5 rounded-2xl transition-all duration-500 ${cardStyle}`}
              >
                <div className={`w-10 h-10 rounded-xl ${style.letterBg} flex items-center justify-center font-display font-black text-xl text-white shadow-md flex-shrink-0`}>
                  {style.label}
                </div>
                <span className="font-bold text-lg leading-snug flex-1">{opt}</span>

                {isReveal && isCorrect && (
                  <CheckCircle className="w-7 h-7 text-white flex-shrink-0" />
                )}
              </div>
            );
          })}
        </div>

        {/* Explanation Banner on Reveal */}
        {isReveal && question.explanation && (
          <div className="p-4 rounded-2xl bg-surface-dark border border-brand-purple/40 text-center animate-scale-in">
            <span className="text-xs font-bold text-purple-300">💡 Le saviez-vous ?</span>
            <p className="text-sm font-medium text-gray-200 mt-1">{question.explanation}</p>
          </div>
        )}
      </div>

      {/* Bottom Live Scores Ticker */}
      <div className="border-t border-white/10 pt-4 flex items-center justify-between">
        <span className="text-xs font-black uppercase tracking-wider text-gray-400">SCORES EN DIRECT</span>
        <div className="flex items-center space-x-6">
          {gameState.leaderboard.map((item, idx) => (
            <div key={item.playerId} className="flex items-center space-x-2">
              <span className="text-xl">{item.avatar}</span>
              <div>
                <div className="text-xs font-bold text-white">{item.name}</div>
                <div className="font-mono font-black text-brand-gold text-xs">{item.score} pts</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
