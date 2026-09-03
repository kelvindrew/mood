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
    /* E9-layout TV : la barre vit DANS la rangée basse réservée par la grille
       de TVHomeView (plus de position:fixed => zéro superposition possible) */
    <div className="relative w-full flex items-center justify-center pointer-events-auto select-none">
      {/* Pure Naked Floating Controls (Strictly Centered, Without Any Surrounding Capsule or Circle Wrappers) */}
      <div
        className="flex items-center justify-center max-w-5xl w-full px-4"
        style={{ gap: 'clamp(16px, 2.6vw, 48px)' }}
      >
        {/* 1. Left Navigation Controls (Pure Icons) */}
        <div className="flex items-center space-x-4">
          <button
            data-tv-focus
            tabIndex={0}
            onClick={onPrev}
            className="text-white/70 hover:text-white p-2 transition-transform active:scale-90 outline-none focus:scale-125 focus:text-[#FBBF24]"
            title="Précédent"
          >
            <SkipBack className="w-6 h-6 fill-current drop-shadow-md" />
          </button>

          <button
            data-tv-focus
            tabIndex={0}
            onClick={() => {
              audio.playSelect();
              onPlay(activeGame);
            }}
            className="w-13 h-13 rounded-full bg-white text-black flex items-center justify-center shadow-[0_0_35px_rgba(255,255,255,0.9)] transition-all hover:scale-110 active:scale-95 outline-none focus:scale-125 focus:ring-4 focus:ring-[#10B981]"
            title="Lancer le Salon"
          >
            <Play className="w-6 h-6 fill-current ml-0.5" />
          </button>

          <button
            data-tv-focus
            tabIndex={0}
            onClick={onNext}
            className="text-white/70 hover:text-white p-2 transition-transform active:scale-90 outline-none focus:scale-125 focus:text-[#FBBF24]"
            title="Suivant"
          >
            <SkipForward className="w-6 h-6 fill-current drop-shadow-md" />
          </button>
        </div>

        {/* 2. Center Active Game Track Info */}
        <div
          onClick={() => onMoreInfo(activeGame)}
          className="flex items-center space-x-4 cursor-pointer transition-transform hover:scale-105 max-w-md truncate"
        >
          {/* Square Thumbnail with subtle progress line underneath */}
          <div className="flex flex-col items-center space-y-1 flex-shrink-0">
            <div className="w-12 h-12 rounded-xl overflow-hidden shadow-lg relative">
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
            <span className="font-display font-black text-base text-white truncate drop-shadow-lg">
              {activeGame.title}
            </span>
            <span className="text-xs text-gray-400 font-medium truncate">
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

        {/* 3. Right Icons (Pure Naked Icons) */}
        <div className="flex items-center space-x-3 text-white/70">
          <button
            data-tv-focus
            tabIndex={0}
            onClick={() => {
              audio.playSelect();
              onMoreInfo(activeGame);
            }}
            className="p-2 hover:text-white transition-transform outline-none focus:scale-125 focus:text-[#FBBF24]"
            title="Détails & Règles"
          >
            <MessageSquareQuote className="w-5 h-5 drop-shadow-md" />
          </button>

          <button
            data-tv-focus
            tabIndex={0}
            onClick={() => {
              audio.playSelect();
              setTvView('categories');
            }}
            className="p-2 hover:text-white transition-transform outline-none focus:scale-125 focus:text-[#FBBF24]"
            title="Tous les Jeux"
          >
            <ListFilter className="w-5 h-5 drop-shadow-md" />
          </button>

          <button
            data-tv-focus
            tabIndex={0}
            onClick={toggleMute}
            className="p-2 hover:text-white transition-transform outline-none focus:scale-125 focus:text-[#FBBF24]"
            title={isMuted ? 'Activer le son' : 'Couper le son'}
          >
            {isMuted ? <VolumeX className="w-5 h-5 text-rose-400" /> : <Volume2 className="w-5 h-5 drop-shadow-md" />}
          </button>
        </div>
      </div>
    </div>
  );
};
