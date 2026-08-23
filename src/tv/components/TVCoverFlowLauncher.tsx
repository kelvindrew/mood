import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameCatalogItem } from '../../types/game';
import { Play, Info, Sparkles, Users, Clock, Flame, ChevronLeft, ChevronRight, Smartphone } from 'lucide-react';
import { audio } from '../../services/audio';

interface TVCoverFlowLauncherProps {
  games: GameCatalogItem[];
  activeIndex: number;
  onIndexChange: (index: number) => void;
  onPlayGame: (game: GameCatalogItem) => void;
  onMoreInfo: (game: GameCatalogItem) => void;
}

export const TVCoverFlowLauncher: React.FC<TVCoverFlowLauncherProps> = ({
  games,
  activeIndex,
  onIndexChange,
  onPlayGame,
  onMoreInfo,
}) => {
  const activeGame = games[activeIndex] || games[0];
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);

  const handlePrev = useCallback(() => {
    if (activeIndex > 0) {
      audio.playSelect();
      onIndexChange(activeIndex - 1);
    } else {
      audio.playSelect();
      onIndexChange(games.length - 1); // Loop around
    }
  }, [activeIndex, games.length, onIndexChange]);

  const handleNext = useCallback(() => {
    if (activeIndex < games.length - 1) {
      audio.playSelect();
      onIndexChange(activeIndex + 1);
    } else {
      audio.playSelect();
      onIndexChange(0); // Loop around
    }
  }, [activeIndex, games.length, onIndexChange]);

  // Keyboard navigation for TV D-Pad & Desktop
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'Enter' || e.key === ' ') {
        // If Enter is pressed on container, launch active game
        if (document.activeElement === containerRef.current) {
          e.preventDefault();
          onPlayGame(activeGame);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePrev, handleNext, activeGame, onPlayGame]);

  // Touch Swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    const endX = e.changedTouches[0].clientX;
    const diff = endX - startX;
    if (diff > 45) {
      handlePrev();
    } else if (diff < -45) {
      handleNext();
    }
  };

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      data-tv-focus
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="relative w-full h-[62vh] min-h-[460px] flex items-center justify-center overflow-hidden select-none outline-none focus:outline-none"
    >
      {/* 1. Dynamic Ambient Background Glow (VisionOS / Apple Music Style) */}
      <div className="absolute inset-0 z-0 pointer-events-none transition-all duration-700">
        <img
          src={activeGame.heroImage || activeGame.coverImage}
          alt={activeGame.title}
          className="w-full h-full object-cover object-center filter blur-3xl opacity-35 scale-125 transition-opacity duration-700"
        />
        {/* Multi-directional soft gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#070D0B] via-[#070D0B]/60 to-transparent" />
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-[#070D0B]/40 to-[#070D0B]" />
      </div>

      {/* 2. Navigation Chevrons */}
      <button
        onClick={handlePrev}
        className="absolute left-6 z-40 w-14 h-14 rounded-full glass-pill-bar text-white/80 hover:text-white hover:scale-110 active:scale-95 flex items-center justify-center transition-all shadow-xl"
        title="Jeu Précédent (Flèche Gauche)"
      >
        <ChevronLeft className="w-8 h-8" />
      </button>

      <button
        onClick={handleNext}
        className="absolute right-6 z-40 w-14 h-14 rounded-full glass-pill-bar text-white/80 hover:text-white hover:scale-110 active:scale-95 flex items-center justify-center transition-all shadow-xl"
        title="Jeu Suivant (Flèche Droite)"
      >
        <ChevronRight className="w-8 h-8" />
      </button>

      {/* 3. 3D Perspective Cover Flow Stage */}
      <div className="relative w-full max-w-6xl h-full flex items-center justify-center coverflow-stage z-20">
        {games.map((game, idx) => {
          const diff = idx - activeIndex;
          // Render only visible items around active item (-3 to +3)
          if (Math.abs(diff) > 3) return null;

          const isCenter = diff === 0;

          // Calculate 3D transforms
          let translateX = 0;
          let translateZ = 0;
          let rotateY = 0;
          let scale = 1;
          let opacity = 1;
          let zIndex = 20;

          if (isCenter) {
            translateX = 0;
            translateZ = 120;
            rotateY = 0;
            scale = 1.05;
            opacity = 1;
            zIndex = 35;
          } else if (diff < 0) {
            // Left items
            translateX = diff * 230 - 80;
            translateZ = -Math.abs(diff) * 140;
            rotateY = 32;
            scale = Math.max(0.65, 1 - Math.abs(diff) * 0.14);
            opacity = Math.max(0.3, 1 - Math.abs(diff) * 0.32);
            zIndex = 30 - Math.abs(diff);
          } else {
            // Right items
            translateX = diff * 230 + 80;
            translateZ = -Math.abs(diff) * 140;
            rotateY = -32;
            scale = Math.max(0.65, 1 - Math.abs(diff) * 0.14);
            opacity = Math.max(0.3, 1 - Math.abs(diff) * 0.32);
            zIndex = 30 - Math.abs(diff);
          }

          return (
            <div
              key={game.id}
              onClick={() => {
                if (isCenter) {
                  audio.playSelect();
                  onPlayGame(game);
                } else {
                  audio.playSelect();
                  onIndexChange(idx);
                }
              }}
              style={{
                transform: `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
                zIndex,
                opacity,
              }}
              className={`coverflow-item absolute w-[300px] sm:w-[340px] md:w-[380px] h-[430px] sm:h-[460px] rounded-3xl overflow-hidden cursor-pointer ${
                isCenter
                  ? 'border-2 border-[#FBBF24] shadow-[0_25px_60px_rgba(0,0,0,0.85),0_0_40px_rgba(251,191,36,0.45)] ring-2 ring-[#FBBF24]/60'
                  : 'border border-white/20 shadow-[0_15px_35px_rgba(0,0,0,0.7)] hover:opacity-90'
              }`}
            >
              {/* Game Artwork */}
              <img
                src={game.heroImage || game.coverImage}
                alt={game.title}
                className="w-full h-full object-cover object-center filter brightness-95 contrast-105"
              />

              {/* Top Gradient & Badge */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#070D0B] via-[#070D0B]/40 to-transparent" />
              
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
                <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[#FBBF24] font-mono text-[10px] font-black uppercase tracking-wider flex items-center space-x-1 shadow-md">
                  <Sparkles className="w-3 h-3 text-[#FBBF24] fill-current" />
                  <span>{game.badge || 'PLAYFLIX AAA'}</span>
                </span>

                <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-[#34D399] font-bold text-[10px]">
                  {game.category}
                </span>
              </div>

              {/* Bottom Information Card Layer (Inspired by Reference Poster Cover Flow) */}
              <div className="absolute bottom-0 left-0 right-0 p-6 z-10 flex flex-col space-y-2.5 bg-gradient-to-t from-[#070D0B] via-[#070D0B]/90 to-transparent">
                <div className="space-y-0.5">
                  <h3 className="text-3xl font-black font-display text-white tracking-wide leading-tight drop-shadow-md truncate">
                    {game.title}
                  </h3>
                  <p className="text-xs font-bold text-[#FBBF24] tracking-wide truncate">
                    {game.tagline || 'Expérience Multijoueur TV'}
                  </p>
                </div>

                {isCenter && (
                  <div className="flex items-center space-x-3 text-xs font-bold text-gray-300 pt-1">
                    <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-white/10 border border-white/15 text-white">
                      <Users className="w-3.5 h-3.5 text-[#34D399]" />
                      <span>{game.minPlayers}–{game.maxPlayers}</span>
                    </div>
                    <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-white/10 border border-white/15 text-[#FBBF24]">
                      <Clock className="w-3.5 h-3.5 text-[#FBBF24]" />
                      <span>{game.durationMinutes}</span>
                    </div>
                    <div className="px-2.5 py-1 rounded-lg bg-white/10 border border-white/15 text-[#38BDF8]">
                      {game.difficulty}
                    </div>
                  </div>
                )}

                {/* Direct Action CTAs for Center Item */}
                {isCenter && (
                  <div className="flex items-center space-x-3 pt-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        audio.playSelect();
                        onPlayGame(game);
                      }}
                      className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-[#10B981] via-[#059669] to-[#F59E0B] text-white font-black text-xs uppercase tracking-wider shadow-[0_0_25px_rgba(16,185,129,0.6)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center space-x-1.5"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      <span>LANCER LE SALON</span>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        audio.playSelect();
                        onMoreInfo(game);
                      }}
                      className="px-4 py-3 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/20 text-white font-bold text-xs tracking-wide transition-all"
                    >
                      <Info className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
