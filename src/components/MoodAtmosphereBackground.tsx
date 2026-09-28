import React from 'react';
import { useGame } from '../context/GameContext';
import { MOOD_THEMES } from '../theme/moodTheme';

export interface MoodAtmosphereBackgroundProps {
  showOverlays?: boolean;
}

export const MoodAtmosphereBackground: React.FC<MoodAtmosphereBackgroundProps> = ({ showOverlays = true }) => {
  const { moodTheme } = useGame();
  const currentTheme = MOOD_THEMES[moodTheme] || MOOD_THEMES.canyon;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden select-none z-0">
      {/* 1. Base Dark Tone */}
      <div className="absolute inset-0 bg-[#060810]" />

      {/* 2. Visual Landscape Artwork Layer (Full Height & Width with Parallax Feel) */}
      <div className="absolute inset-0 transition-opacity duration-700">
        <img
          key={currentTheme.id}
          src={currentTheme.bgImage}
          alt={currentTheme.name}
          className="w-full h-full object-cover object-center filter brightness-[0.72] contrast-[1.10] transition-all duration-700"
        />
      </div>

      {showOverlays && (
        <>
          {/* Top darkening for high-contrast Navbar */}
          <div className="absolute top-0 left-0 right-0 h-44 bg-gradient-to-b from-[#060810]/95 via-[#060810]/60 to-transparent" />

          {/* Bottom darkening for high-contrast Game Rows & Cards */}
          <div className="absolute bottom-0 left-0 right-0 h-[60vh] bg-gradient-to-t from-[#060810] via-[#060810]/75 to-transparent" />

          {/* Side Vignettes for cinematic widescreen 16:9 immersion */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#060810]/60 via-transparent to-[#060810]/60" />

          {/* Dynamic Theme Gradient Tint */}
          <div className={`absolute inset-0 bg-gradient-to-b ${currentTheme.overlayGradient} opacity-35`} />

          {/* Ambient Radial Glow tinted with Theme Colors */}
          <div
            className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vw] h-[50vh] rounded-full blur-[140px] pointer-events-none transition-all duration-700 opacity-40"
            style={{ backgroundColor: currentTheme.primaryColor }}
          />
          <div
            className="absolute bottom-1/3 right-1/4 w-[50vw] h-[40vh] rounded-full blur-[120px] pointer-events-none transition-all duration-700 opacity-30"
            style={{ backgroundColor: currentTheme.secondaryColor }}
          />
        </>
      )}
    </div>
  );
};
