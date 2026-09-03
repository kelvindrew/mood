import React, { useState } from 'react';
import { GameCatalogItem } from '../../types/game';
import {
  Play,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  MessageSquareQuote,
  Layers,
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
  };

  return (
    <div className="fixed bottom-6 left-0 right-0 z-40 flex items-center justify-center pointer-events-auto select-none animate-scale-in">
      {/* Sleek Centered Floating Bar */}
      <div
        className="flex items-center justify-center max-w-4xl w-full px-4"
        style={{ gap: 'clamp(14px, 2.2vw, 36px)' }}
      >
        {/* 1. Left Action Controls */}
        <div className="flex items-center space-x-2">
          {/* Skip Previous Button */}
          <button
            data-tv-focus
            tabIndex={0}
            onClick={onPrev}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center text-white/75 hover:text-white transition-all active:scale-90 outline-none focus:scale-125 focus:border-white focus:bg-white/30"
            title="Jeu Précédent"
          >
            <SkipBack className="w-4 h-4 fill-current" />
          </button>

          {/* Sleek Magnetic Play Button */}
          <button
            data-tv-focus
            tabIndex={0}
            onClick={() => {
              audio.playSelect();
              onPlay(activeGame);
            }}
            className="flex items-center space-x-2 px-5 py-2 rounded-full bg-gradient-to-r from-[#10B981] to-[#059669] hover:from-[#059669] hover:to-[#047857] text-white font-display font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(16,185,129,0.45)] transition-all hover:scale-105 active:scale-95 outline-none focus:scale-115 focus:ring-4 focus:ring-emerald-400/50"
            title="Lancer le Salon"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>JOUER</span>
          </button>

          {/* Skip Next Button */}
          <button
            data-tv-focus
            tabIndex={0}
            onClick={onNext}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center text-white/75 hover:text-white transition-all active:scale-90 outline-none focus:scale-125 focus:border-white focus:bg-white/30"
            title="Jeu Suivant"
          >
            <SkipForward className="w-4 h-4 fill-current" />
          </button>
        </div>

        {/* 2. Center Active Game Track Info */}
        <div
          onClick={() => onMoreInfo(activeGame)}
          className="flex items-center space-x-3 cursor-pointer transition-transform hover:scale-102 max-w-md truncate"
        >
          {/* Square Thumbnail */}
          <div className="flex flex-col items-center space-y-1 flex-shrink-0">
            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg relative border border-white/15">
              <img
                src={activeGame.coverImage || activeGame.heroImage}
                alt={activeGame.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="w-8 h-1 rounded-full bg-white/20 overflow-hidden">
              <div className="w-2/3 h-full bg-[#10B981] rounded-full" />
            </div>
          </div>

          <div className="flex flex-col truncate">
            <span className="font-display font-black text-sm text-white truncate drop-shadow">
              {activeGame.title}
            </span>
            <span className="text-[11px] text-gray-400 font-medium truncate">
              {activeGame.tagline || `${activeGame.category} • ${activeGame.minPlayers}-${activeGame.maxPlayers} Joueurs`}
            </span>
          </div>

          {/* Sound Wave Indicator Dots */}
          <div className="hidden sm:flex items-center space-x-1 pl-2">
            <span className="w-1 h-3 rounded-full bg-[#10B981] animate-pulse" />
            <span className="w-1 h-4.5 rounded-full bg-[#10B981]/80 animate-pulse delay-75" />
            <span className="w-1 h-2 rounded-full bg-[#10B981]/60 animate-pulse delay-150" />
          </div>
        </div>

        {/* 3. Right Icons */}
        <div className="flex items-center space-x-2 text-white/70">
          <button
            data-tv-focus
            tabIndex={0}
            onClick={() => {
              audio.playSelect();
              onMoreInfo(activeGame);
            }}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center text-white/75 hover:text-white transition-all active:scale-90 outline-none focus:scale-125 focus:border-white focus:bg-white/30"
            title="Détails & Règles"
          >
            <MessageSquareQuote className="w-4 h-4" />
          </button>

          <button
            data-tv-focus
            tabIndex={0}
            onClick={() => {
              audio.playSelect();
              setTvView('categories');
            }}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center text-white/75 hover:text-white transition-all active:scale-90 outline-none focus:scale-125 focus:border-white focus:bg-white/30"
            title="Catalogue de Tous les Jeux"
          >
            <Layers className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
