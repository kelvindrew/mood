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
    <div className="fixed bottom-7 left-0 right-0 z-40 flex items-center justify-center pointer-events-auto select-none animate-scale-in">
      {/* Floating Free-Floating Control Elements (Strictly Centered, Without Surrounding Container) */}
      <div className="flex items-center justify-center space-x-8 max-w-4xl w-full px-6">
        {/* 1. Left Navigation Playback Controls */}
        <div className="flex items-center space-x-3">
          <button
            data-tv-focus
            tabIndex={0}
            onClick={onPrev}
            className="w-11 h-11 rounded-full text-white/80 hover:text-white hover:bg-white/10 flex items-center justify-center transition-transform active:scale-90 outline-none focus:scale-115 focus:ring-2 focus:ring-white"
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
            className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.85)] transition-all hover:scale-110 active:scale-95 outline-none focus:scale-120 focus:ring-4 focus:ring-[#10B981]"
            title="Lancer le Salon"
          >
            <Play className="w-6 h-6 fill-current ml-0.5" />
          </button>

          <button
            data-tv-focus
            tabIndex={0}
            onClick={onNext}
            className="w-11 h-11 rounded-full text-white/80 hover:text-white hover:bg-white/10 flex items-center justify-center transition-transform active:scale-90 outline-none focus:scale-115 focus:ring-2 focus:ring-white"
            title="Suivant"
          >
            <SkipForward className="w-5 h-5 fill-current" />
          </button>
        </div>

        {/* 2. Center Active Game Track Info with Progress Line */}
        <div
          onClick={() => onMoreInfo(activeGame)}
          className="flex items-center space-x-4 px-3 py-1 cursor-pointer transition-colors max-w-md truncate"
        >
          {/* Square Thumbnail with subtle progress line underneath */}
          <div className="flex flex-col items-center space-y-1 flex-shrink-0">
            <div className="w-12 h-12 rounded-2xl overflow-hidden border border-white/30 shadow-lg relative">
              <img
                src={activeGame.coverImage || activeGame.heroImage}
                alt={activeGame.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="w-10 h-1 rounded-full bg-white/25 overflow-hidden">
              <div className="w-2/3 h-full bg-white rounded-full" />
            </div>
          </div>

          <div className="flex flex-col truncate">
            <span className="font-display font-black text-base text-white truncate drop-shadow-md">
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

        {/* 3. Right Icons */}
        <div className="flex items-center space-x-2 text-white/80">
          <button
            data-tv-focus
            tabIndex={0}
            onClick={() => {
              audio.playSelect();
              onMoreInfo(activeGame);
            }}
            className="w-10 h-10 rounded-full text-white/80 hover:text-white hover:bg-white/10 flex items-center justify-center transition-all outline-none focus:scale-115 focus:ring-2 focus:ring-white"
            title="Détails & Règles"
          >
            <MessageSquareQuote className="w-5 h-5" />
          </button>

          <button
            data-tv-focus
            tabIndex={0}
            onClick={() => {
              audio.playSelect();
              setTvView('categories');
            }}
            className="w-10 h-10 rounded-full text-white/80 hover:text-white hover:bg-white/10 flex items-center justify-center transition-all outline-none focus:scale-115 focus:ring-2 focus:ring-white"
            title="Tous les Jeux"
          >
            <ListFilter className="w-5 h-5" />
          </button>

          <button
            data-tv-focus
            tabIndex={0}
            onClick={toggleMute}
            className="w-10 h-10 rounded-full text-white/80 hover:text-white hover:bg-white/10 flex items-center justify-center transition-all outline-none focus:scale-115 focus:ring-2 focus:ring-white"
            title={isMuted ? 'Activer le son' : 'Couper le son'}
          >
            {isMuted ? <VolumeX className="w-5 h-5 text-rose-400" /> : <Volume2 className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
};
