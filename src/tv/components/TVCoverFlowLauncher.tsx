import React, { useEffect, useRef, useCallback } from 'react';
import { GameCatalogItem } from '../../types/game';
import { Sparkles, Users, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
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
      className="relative w-full h-full min-h-[68vh] flex items-center justify-center select-none outline-none focus:outline-none"
    >
      {/* Navigation Arrow Left */}
      <button
        onClick={handlePrev}
        className="absolute left-6 lg:left-12 z-40 w-14 h-14 rounded-full glass-pill-bar text-white/70 hover:text-white hover:scale-110 active:scale-95 flex items-center justify-center transition-all shadow-2xl"
        title="Jeu Précédent"
      >
        <ChevronLeft className="w-8 h-8" />
      </button>

      {/* Navigation Arrow Right */}
      <button
        onClick={handleNext}
        className="absolute right-6 lg:right-12 z-40 w-14 h-14 rounded-full glass-pill-bar text-white/70 hover:text-white hover:scale-110 active:scale-95 flex items-center justify-center transition-all shadow-2xl"
        title="Jeu Suivant"
      >
        <ChevronRight className="w-8 h-8" />
      </button>

      {/* 3D Perspective Cover Flow Stage */}
      <div className="relative w-full h-full flex items-center justify-center coverflow-stage z-20 py-8">
        {games.map((game, idx) => {
          const diff = idx - activeIndex;
          if (Math.abs(diff) > 3) return null;

          const isCenter = diff === 0;

          // Smooth 3D perspective transforms matching reference image
          let translateX = 0;
          let translateZ = 0;
          let rotateY = 0;
          let scale = 1;
          let opacity = 1;
          let zIndex = 20;

          if (isCenter) {
            translateX = 0;
            translateZ = 160;
            rotateY = 0;
            scale = 1.08;
            opacity = 1;
            zIndex = 40;
          } else if (diff < 0) {
            // Left angled posters
            translateX = diff * 260 - 90;
            translateZ = -Math.abs(diff) * 160;
            rotateY = 36;
            scale = Math.max(0.7, 1 - Math.abs(diff) * 0.12);
            opacity = Math.max(0.25, 1 - Math.abs(diff) * 0.28);
            zIndex = 30 - Math.abs(diff);
          } else {
            // Right angled posters
            translateX = diff * 260 + 90;
            translateZ = -Math.abs(diff) * 160;
            rotateY = -36;
            scale = Math.max(0.7, 1 - Math.abs(diff) * 0.12);
            opacity = Math.max(0.25, 1 - Math.abs(diff) * 0.28);
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
              className={`coverflow-item absolute w-[320px] sm:w-[360px] md:w-[400px] lg:w-[440px] h-[480px] sm:h-[530px] md:h-[580px] lg:h-[620px] rounded-[36px] overflow-hidden cursor-pointer transition-all duration-300 ${
                isCenter
                  ? 'border-2 border-white/40 shadow-[0_30px_70px_rgba(0,0,0,0.9),0_0_50px_rgba(251,191,36,0.35)] ring-1 ring-white/30'
                  : 'border border-white/15 shadow-[0_20px_45px_rgba(0,0,0,0.75)] filter brightness-90 hover:brightness-100'
              }`}
            >
              {/* Poster Artwork */}
              <img
                src={game.heroImage || game.coverImage}
                alt={game.title}
                className="w-full h-full object-cover object-center filter brightness-95 contrast-105"
              />

              {/* Cinematic Vignette Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent" />

              {/* Top Tag Header */}
              <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-10">
                <span className="px-3.5 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-[#FBBF24] font-mono text-[11px] font-black uppercase tracking-wider flex items-center space-x-1.5 shadow-lg">
                  <Sparkles className="w-3.5 h-3.5 text-[#FBBF24] fill-current" />
                  <span>{game.badge || 'PLAYFLIX AAA'}</span>
                </span>

                <span className="px-3 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/15 text-[#34D399] font-bold text-[11px]">
                  {game.category}
                </span>
              </div>

              {/* Bottom Poster Typography (Exact match of Reference: Title in large clean font + Subtitle) */}
              <div className="absolute bottom-0 left-0 right-0 p-8 z-10 flex flex-col space-y-1.5 bg-gradient-to-t from-black via-black/85 to-transparent">
                <h3 className="text-4xl lg:text-5xl font-black font-display text-white tracking-tight leading-none drop-shadow-lg uppercase truncate">
                  {game.title}
                </h3>
                
                <p className="text-sm font-bold text-gray-300 truncate">
                  {game.tagline || 'Expérience Multijoueur TV'}
                </p>

                {isCenter && (
                  <div className="flex items-center space-x-3 text-xs font-bold text-gray-400 pt-2">
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
