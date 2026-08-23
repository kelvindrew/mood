import React, { useState } from 'react';
import { GameCatalogItem } from '../../types/game';
import {
  Play,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  MessageSquareQuote,
  ListFilter,
  Radio,
} from 'lucide-react';
import { audio } from '../../services/audio';
import { useGame } from '../../context/GameContext';

interface TVFloatingControlBarProps {
  activeGame: GameCatalogItem;
  onPrev: () => void;
  onNext: () => void;
  onPlay: (game: GameCatalogItem) => void;
  onMoreInfo: (game: GameCatalogItem) => void;
}

export const TVFloatingControlBar: React.FC<TVFloatingControlBarProps> = ({
  activeGame,
  onPrev,
  onNext,
  onPlay,
  onMoreInfo,
}) => {
  const { setTvView } = useGame();
  const [isMuted, setIsMuted] = useState(false);

  const toggleMute = () => {
    setIsMuted(!isMuted);
    audio.playSelect();
  };

  return (
    <div className="fixed bottom-7 left-1/2 transform -translate-x-1/2 z-40 w-full max-w-4xl px-4 pointer-events-auto select-none animate-scale-in">
      {/* Floating VisionOS Glass Pill Bar (Exact 1:1 match of Reference Image) */}
      <div className="px-8 py-3.5 rounded-full bg-white/[0.07] backdrop-blur-2xl border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.7),inset_0_1px_1.5px_rgba(255,255,255,0.35)] flex items-center justify-between">
        {/* 1. Left Navigation Playback Controls */}
        <div className="flex items-center space-x-4">
          <button
            data-tv-focus
            tabIndex={0}
            onClick={onPrev}
            className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center transition-transform active:scale-90 outline-none focus:ring-2 focus:ring-white"
            title="Précédent"
          >
            <SkipBack className="w-5 h-5 fill-current" />
          </button>

          <button
            data-tv-focus
            tabIndex={0}
            onClick={() => {
              audio.playSelect();
              onPlay(activeGame);
            }}
            className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center shadow-[0_0_25px_rgba(255,255,255,0.7)] transition-all hover:scale-110 active:scale-95 outline-none focus:ring-4 focus:ring-[#10B981]"
            title="Lancer le Salon"
          >
            <Play className="w-5 h-5 fill-current ml-0.5" />
          </button>

          <button
            data-tv-focus
            tabIndex={0}
            onClick={onNext}
            className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center transition-transform active:scale-90 outline-none focus:ring-2 focus:ring-white"
            title="Suivant"
          >
            <SkipForward className="w-5 h-5 fill-current" />
          </button>
        </div>

        {/* 2. Center Active Game Track Info with Progress Bar */}
        <div
          onClick={() => onMoreInfo(activeGame)}
          className="flex items-center space-x-4 px-4 py-1.5 rounded-2xl hover:bg-white/5 cursor-pointer transition-colors max-w-md truncate"
        >
          {/* Square Thumbnail with subtle progress line */}
          <div className="flex flex-col items-center space-y-1 flex-shrink-0">
            <div className="w-11 h-11 rounded-xl overflow-hidden border border-white/25 shadow-md relative">
              <img
                src={activeGame.coverImage || activeGame.heroImage}
                alt={activeGame.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/20" />
            </div>
            {/* White playback progress bar underneath thumbnail (like reference image) */}
            <div className="w-9 h-1 rounded-full bg-white/20 overflow-hidden">
              <div className="w-2/3 h-full bg-white rounded-full" />
            </div>
          </div>

          <div className="flex flex-col truncate">
            <span className="font-display font-black text-sm text-white truncate drop-shadow">
              {activeGame.title}
            </span>
            <span className="text-xs text-[#9CA3AF] font-medium truncate">
              {activeGame.tagline || `${activeGame.category} • ${activeGame.minPlayers}-${activeGame.maxPlayers} Joueurs`}
            </span>
          </div>

          {/* Sound Wave Indicator Dots */}
          <div className="hidden sm:flex items-center space-x-1 pl-2">
            <span className="w-1 h-3.5 rounded-full bg-white animate-pulse" />
            <span className="w-1 h-5 rounded-full bg-white/80 animate-pulse delay-75" />
            <span className="w-1 h-2.5 rounded-full bg-white/60 animate-pulse delay-150" />
          </div>
        </div>

        {/* 3. Right Icons (Quote / List / Volume matching reference image) */}
        <div className="flex items-center space-x-3 text-white/80">
          {/* Rules / Info (Quote icon like reference) */}
          <button
            data-tv-focus
            tabIndex={0}
            onClick={() => {
              audio.playSelect();
              onMoreInfo(activeGame);
            }}
            className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center transition-all outline-none focus:ring-2 focus:ring-white"
            title="Détails & Règles"
          >
            <MessageSquareQuote className="w-4 h-4" />
          </button>

          {/* Categories List (Menu icon like reference) */}
          <button
            data-tv-focus
            tabIndex={0}
            onClick={() => {
              audio.playSelect();
              setTvView('categories');
            }}
            className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center transition-all outline-none focus:ring-2 focus:ring-white"
            title="Tous les Jeux"
          >
            <ListFilter className="w-4 h-4" />
          </button>

          {/* Volume Toggle */}
          <button
            data-tv-focus
            tabIndex={0}
            onClick={toggleMute}
            className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center transition-all outline-none focus:ring-2 focus:ring-white"
            title={isMuted ? 'Activer le son' : 'Couper le son'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};
