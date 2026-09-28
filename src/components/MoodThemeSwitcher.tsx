import React from 'react';
import { useGame } from '../context/GameContext';
import { MOOD_THEMES, MoodThemeId } from '../theme/moodTheme';
import { audio } from '../services/audio';

interface MoodThemeSwitcherProps {
  compact?: boolean;
}

export const MoodThemeSwitcher: React.FC<MoodThemeSwitcherProps> = ({ compact = false }) => {
  const { moodTheme, setMoodTheme } = useGame();

  const handleSelect = (id: MoodThemeId) => {
    audio.playSelect();
    setMoodTheme(id);
  };

  const themes: MoodThemeId[] = ['canyon', 'sunset', 'emerald'];

  return (
    <div className="flex items-center space-x-1.5 p-1 rounded-2xl bg-[#060810]/70 backdrop-blur-xl border border-white/10 shadow-lg">
      {themes.map((id) => {
        const theme = MOOD_THEMES[id];
        const isActive = moodTheme === id;

        return (
          <button
            key={id}
            data-tv-focus
            tabIndex={0}
            onClick={() => handleSelect(id)}
            title={theme.name}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 outline-none ${
              isActive
                ? 'bg-gradient-to-r from-mood-coral to-mood-amber text-white font-black shadow-[0_0_20px_rgba(255,71,87,0.5)] scale-105 ring-2 ring-white/50'
                : 'text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <span className="text-sm">{theme.icon}</span>
            {!compact && (
              <span className="hidden sm:inline font-display text-[11px] tracking-wide">
                {theme.name.split(' ')[0]}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
