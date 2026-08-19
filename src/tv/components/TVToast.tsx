import React, { useEffect, useState } from 'react';
import { useGame } from '../../context/GameContext';

interface FloatingReaction {
  id: string;
  emoji: string;
  playerName: string;
  leftPercent: number;
}

export const TVToast: React.FC = () => {
  const { room } = useGame();
  const [floatingEmojis, setFloatingEmojis] = useState<FloatingReaction[]>([]);

  useEffect(() => {
    if (!room?.reactions || room.reactions.length === 0) return;
    const latest = room.reactions[room.reactions.length - 1];

    // Create floating animation instance
    const newEmoji: FloatingReaction = {
      id: `${latest.id}_${Date.now()}`,
      emoji: latest.emoji,
      playerName: latest.playerName,
      leftPercent: 15 + Math.random() * 70, // Random horizontal position across 70% of screen
    };

    setFloatingEmojis((prev) => [...prev, newEmoji]);

    const timer = setTimeout(() => {
      setFloatingEmojis((prev) => prev.filter((e) => e.id !== newEmoji.id));
    }, 3500);

    return () => clearTimeout(timer);
  }, [room?.reactions]);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {/* Floating Emojis from Mobile Controller Flingers */}
      {floatingEmojis.map((item) => (
        <div
          key={item.id}
          className="absolute bottom-10 flex flex-col items-center animate-float-up"
          style={{
            left: `${item.leftPercent}%`,
            animation: 'floatUp 3.2s cubic-bezier(0.2, 0.8, 0.2, 1) forwards',
          }}
        >
          <div className="text-6xl filter drop-shadow-2xl animate-bounce">
            {item.emoji}
          </div>
          <span className="px-3 py-1 mt-1 rounded-full bg-black/75 backdrop-blur-md text-white text-xs font-bold shadow-lg border border-white/20">
            {item.playerName}
          </span>
        </div>
      ))}
    </div>
  );
};
