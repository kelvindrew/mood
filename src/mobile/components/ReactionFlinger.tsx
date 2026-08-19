import React from 'react';
import { useGame } from '../../context/GameContext';
import { triggerHaptic, hapticPatterns } from './HapticFeedback';
import { audio } from '../../services/audio';

const EMOJIS = ['🔥', '😂', '👏', '😱', '💣', '🎉', '💩', '❤️'];

export const ReactionFlinger: React.FC = () => {
  const { sendReaction } = useGame();

  const handleFling = (emoji: string) => {
    triggerHaptic(hapticPatterns.tap);
    audio.playFocus();
    sendReaction(emoji);
  };

  return (
    <div className="flex items-center space-x-2 overflow-x-auto py-2 px-3 bg-surface-card/90 rounded-2xl border border-white/10 backdrop-blur-md">
      <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider flex-shrink-0">
        Réagir TV :
      </span>
      {EMOJIS.map((emoji) => (
        <button
          key={emoji}
          onClick={() => handleFling(emoji)}
          className="w-10 h-10 rounded-xl bg-surface-light hover:bg-white/20 active:scale-125 flex items-center justify-center text-xl transition-transform flex-shrink-0"
        >
          {emoji}
        </button>
      ))}
    </div>
  );
};
