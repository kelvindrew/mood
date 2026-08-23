import React, { useEffect, useRef, useCallback } from 'react';
import { GameCatalogItem } from '../../types/game';
import { Sparkles, Users, Clock, ChevronLeft, ChevronRight, Play } from 'lucide-react';
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

  const handlePrev = useCallback(() => {
    audio.playSelect();
    onIndexChange(activeIndex > 0 ? activeIndex - 1 : games.length - 1);
  }, [activeIndex, games.length, onIndexChange]);

  const handleNext = useCallback(() => {
    audio.playSelect();
    onIndexChange(activeIndex < games.length - 1 ? activeIndex + 1 : 0);
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
        if (document.activeElement === containerRef.current) {
          e.preventDefault();
          onPlayGame(activeGame);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePrev, handleNext, activeGame, onPlayGame]);

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      data-tv-focus
      className="relative w-full h-full min-h-[60vh] flex items-center justify-center select-none outline-none focus:outline-none"
    >
      {/* Navigation Arrow Left */}
      <button
        onClick={handlePrev}
        className="absolute left-4 lg:left-8 z-40 w-14 h-14 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white/70 hover:text-white hover:scale-110 active:scale-95 flex items-center justify-center transition-all shadow-2xl"
        title="Jeu Précédent"
      >
        <ChevronLeft className="w-8 h-8" />
      </button>

      {/* Navigation Arrow Right */}
      <button
        onClick={handleNext}
        className="absolute right-4 lg:right-8 z-40 w-14 h-14 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white/70 hover:text-white hover:scale-110 active:scale-95 flex items-center justify-center transition-all shadow-2xl"
        title="Jeu Suivant"
      >
        <ChevronRight className="w-8 h-8" />
      </button>

      {/* 3D Perspective Widescreen Cover Flow Stage */}
      <div className="relative w-full h-full flex items-center justify-center coverflow-stage z-20 py-4">
        {games.map((game, idx) => {
          const diff = idx - activeIndex;
          if (Math.abs(diff) > 2) return null;

          const isCenter = diff === 0;

          // Smooth 3D perspective transforms tailored for 16:9 Smart TV screens
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
            zIndex = 40;
          } else if (diff < 0) {
            // Left angled posters (spacious spacing)
            translateX = diff * 340 - 100;
            translateZ = -Math.abs(diff) * 140;
            rotateY = 28;
            scale = Math.max(0.75, 1 - Math.abs(diff) * 0.12);
            opacity = Math.max(0.35, 1 - Math.abs(diff) * 0.28);
            zIndex = 30 - Math.abs(diff);
          } else {
            // Right angled posters (spacious spacing)
            translateX = diff * 340 + 100;
            translateZ = -Math.abs(diff) * 140;
            rotateY = -28;
            scale = Math.max(0.75, 1 - Math.abs(diff) * 0.12);
            opacity = Math.max(0.35, 1 - Math.abs(diff) * 0.28);
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
              className={`coverflow-item absolute w-[460px] sm:w-[540px] md:w-[620px] lg:w-[680px] h-[290px] sm:h-[340px] md:h-[390px] lg:h-[420px] rounded-3xl overflow-hidden cursor-pointer transition-all duration-300 ${
                isCenter
                  ? 'border-2 border-white/40 shadow-[0_25px_60px_rgba(0,0,0,0.85),0_0_35px_rgba(16,185,129,0.3)] ring-2 ring-[#10B981]/50'
                  : 'border border-white/15 shadow-[0_20px_45px_rgba(0,0,0,0.75)] filter brightness-75 hover:brightness-100'
              }`}
            >
              {/* Poster Artwork (Widescreen 16:9 / 16:10 format) */}
              <img
                src={game.heroImage || game.coverImage}
                alt={game.title}
                className="w-full h-full object-cover object-center filter brightness-95 contrast-105"
              />

              {/* Cinematic Vignette Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-transparent" />

              {/* Top Tag Header */}
              <div className="absolute top-5 left-6 right-6 flex items-center justify-between z-10">
                <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[#FBBF24] font-mono text-[11px] font-black uppercase tracking-wider flex items-center space-x-1.5 shadow-lg">
                  <Sparkles className="w-3.5 h-3.5 text-[#FBBF24] fill-current" />
                  <span>{game.badge || 'PLAYFLIX SMART TV'}</span>
                </span>

                <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-[#34D399] font-bold text-[11px]">
                  {game.category}
                </span>
              </div>

              {/* Bottom Poster Typography (Full untruncated title & metadata) */}
              <div className="absolute bottom-0 left-0 right-0 p-6 z-10 flex flex-col space-y-2 bg-gradient-to-t from-black via-black/85 to-transparent">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black font-display text-white tracking-tight leading-tight drop-shadow-lg uppercase line-clamp-2 max-w-[85%]">
                    {game.title}
                  </h3>

                  {isCenter && (
                    <div className="w-11 h-11 rounded-2xl bg-[#10B981] text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 flex-shrink-0">
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    </div>
                  )}
                </div>

                <p className="text-xs sm:text-sm font-semibold text-gray-300 line-clamp-1">
                  {game.tagline || 'Expérience Multijoueur TV & Smartphones'}
                </p>

                {isCenter && (
                  <div className="flex items-center space-x-3 text-xs font-bold text-gray-400 pt-1">
                    <div className="flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-white/10 border border-white/15 text-white">
                      <Users className="w-3.5 h-3.5 text-[#34D399]" />
                      <span>{game.minPlayers}–{game.maxPlayers} Joueurs</span>
                    </div>
                    <div className="flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-white/10 border border-white/15 text-[#FBBF24]">
                      <Clock className="w-3.5 h-3.5 text-[#FBBF24]" />
                      <span>{game.durationMinutes}</span>
                    </div>
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
