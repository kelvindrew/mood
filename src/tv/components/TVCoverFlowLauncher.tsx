import React, { useEffect, useRef, useCallback } from 'react';
import { GameCatalogItem } from '../../types/game';
import { Sparkles, Users, Clock, ChevronLeft, ChevronRight, Play } from 'lucide-react';

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
    onIndexChange(activeIndex > 0 ? activeIndex - 1 : games.length - 1);
  }, [activeIndex, games.length, onIndexChange]);

  const handleNext = useCallback(() => {
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
      className="relative w-full h-full flex items-center justify-center select-none outline-none focus:outline-none"
    >
      {/* Navigation Arrow Left (Ultra Fast, No Sound Delay) */}
      <button
        onClick={handlePrev}
        className="absolute left-2 lg:left-8 z-40 w-12 h-12 rounded-full bg-black/70 border border-white/20 text-white/70 hover:text-white hover:scale-105 active:scale-95 flex items-center justify-center transition-all shadow-xl"
        title="Jeu Précédent"
      >
        <ChevronLeft className="w-7 h-7" />
      </button>

      {/* Navigation Arrow Right (Ultra Fast, No Sound Delay) */}
      <button
        onClick={handleNext}
        className="absolute right-2 lg:right-8 z-40 w-12 h-12 rounded-full bg-black/70 border border-white/20 text-white/70 hover:text-white hover:scale-105 active:scale-95 flex items-center justify-center transition-all shadow-xl"
        title="Jeu Suivant"
      >
        <ChevronRight className="w-7 h-7" />
      </button>

      {/* Hardware-Accelerated Widescreen Carousel (Zero Blur, Zero Lag) */}
      <div className="relative w-full h-full flex items-center justify-center z-20 py-2">
        {games.map((game, idx) => {
          const diff = idx - activeIndex;
          // Render only active ± 1 for maximum 60 FPS performance on TV
          if (Math.abs(diff) > 1) return null;

          const isCenter = diff === 0;

          // Pure 2D/3D hardware transforms for instantaneous response
          const translateX = diff === 0 ? 0 : diff < 0 ? -480 : 480;
          const scale = isCenter ? 1 : 0.82;
          const opacity = isCenter ? 1 : 0.45;
          const zIndex = isCenter ? 30 : 10;

          return (
            <div
              key={game.id}
              onClick={() => {
                if (isCenter) {
                  onPlayGame(game);
                } else {
                  onIndexChange(idx);
                }
              }}
              style={{
                transform: `translate3d(${translateX}px, 0, 0) scale(${scale})`,
                zIndex,
                opacity,
              }}
              className={`coverflow-item absolute w-[460px] sm:w-[540px] md:w-[620px] lg:w-[680px] h-[280px] sm:h-[320px] md:h-[370px] lg:h-[400px] rounded-3xl overflow-hidden cursor-pointer transition-transform duration-250 ease-out will-change-transform ${
                isCenter
                  ? 'border-2 border-emerald-400/80 shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_30px_rgba(16,185,129,0.3)] ring-1 ring-white/20'
                  : 'border border-white/10 shadow-[0_15px_35px_rgba(0,0,0,0.8)] filter brightness-70 hover:brightness-100'
              }`}
            >
              {/* Poster Artwork (Widescreen 16:9 / 16:10 format) */}
              <img
                src={game.heroImage || game.coverImage}
                alt={game.title}
                loading="eager"
                decoding="async"
                className="w-full h-full object-cover object-center filter brightness-95 contrast-105"
              />

              {/* Lightweight Gradient Vignette Overlay (No blur filters) */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-transparent pointer-events-none" />

              {/* Top Tag Header */}
              <div className="absolute top-4 left-5 right-5 flex items-center justify-between z-10">
                <span className="px-3 py-1 rounded-full bg-black/80 border border-white/20 text-[#FBBF24] font-mono text-[10px] sm:text-[11px] font-black uppercase tracking-wider flex items-center space-x-1.5 shadow-md">
                  <Sparkles className="w-3 h-3 text-[#FBBF24] fill-current" />
                  <span>{game.badge || 'PLAYFLIX TV'}</span>
                </span>

                <span className="px-2.5 py-0.5 rounded-full bg-black/80 border border-white/15 text-[#34D399] font-bold text-[10px] sm:text-[11px]">
                  {game.category}
                </span>
              </div>

              {/* Bottom Poster Typography (Full untruncated title & metadata) */}
              <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6 z-10 flex flex-col space-y-1.5 bg-gradient-to-t from-black via-black/90 to-transparent">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl sm:text-2xl lg:text-3xl font-black font-display text-white tracking-tight leading-tight uppercase line-clamp-2 max-w-[85%] drop-shadow">
                    {game.title}
                  </h3>

                  {isCenter && (
                    <div className="w-10 h-10 rounded-xl bg-[#10B981] text-white flex items-center justify-center shadow-lg transform hover:scale-105 flex-shrink-0">
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                    </div>
                  )}
                </div>

                <p className="text-xs sm:text-sm font-semibold text-gray-300 line-clamp-1">
                  {game.tagline || 'Expérience Multijoueur TV & Smartphones'}
                </p>

                {isCenter && (
                  <div className="flex items-center space-x-2 text-xs font-bold text-gray-400 pt-0.5">
                    <div className="flex items-center space-x-1 px-2.5 py-0.5 rounded-lg bg-white/10 border border-white/15 text-white text-[11px]">
                      <Users className="w-3 h-3 text-[#34D399]" />
                      <span>{game.minPlayers}–{game.maxPlayers} Joueurs</span>
                    </div>
                    <div className="flex items-center space-x-1 px-2.5 py-0.5 rounded-lg bg-white/10 border border-white/15 text-[#FBBF24] text-[11px]">
                      <Clock className="w-3 h-3 text-[#FBBF24]" />
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
