import React, { useState } from 'react';
import { GameCatalogItem } from '../../types/game';
import {
  Play,
  SkipBack,
  SkipForward,
  Info,
  Smartphone,
  Sparkles,
  Volume2,
  VolumeX,
  Layers,
  HelpCircle,
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
  const { isSimulatorOpen, setIsSimulatorOpen, setTvView } = useGame();
  const [isMuted, setIsMuted] = useState(false);

  const toggleMute = () => {
    setIsMuted(!isMuted);
    audio.playSelect();
  };

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40 w-full max-w-4xl px-4 pointer-events-auto select-none animate-scale-in">
      {/* Floating VisionOS Glass Pill Bar (Exact match of Reference Image) */}
      <div className="glass-pill-bar px-6 py-3.5 rounded-full flex items-center justify-between shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
        {/* 1. Playback / Slide Navigation Controls */}
        <div className="flex items-center space-x-3">
          <button
            data-tv-focus
            tabIndex={0}
            onClick={onPrev}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-transform active:scale-90 outline-none focus:ring-2 focus:ring-[#FBBF24]"
            title="Précédent (Flèche Gauche)"
          >
            <SkipBack className="w-4 h-4 fill-current" />
          </button>

          <button
            data-tv-focus
            tabIndex={0}
            onClick={() => {
              audio.playSelect();
              onPlay(activeGame);
            }}
            className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#10B981] via-[#059669] to-[#F59E0B] text-white flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.7)] transition-all hover:scale-110 active:scale-95 outline-none focus:ring-4 focus:ring-[#FBBF24]"
            title="Lancer le Salon (Entrée)"
          >
            <Play className="w-5 h-5 fill-current ml-0.5" />
          </button>

          <button
            data-tv-focus
            tabIndex={0}
            onClick={onNext}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-transform active:scale-90 outline-none focus:ring-2 focus:ring-[#FBBF24]"
            title="Suivant (Flèche Droite)"
          >
            <SkipForward className="w-4 h-4 fill-current" />
          </button>
        </div>

        {/* 2. Center Active Game Track Info */}
        <div
          onClick={() => onMoreInfo(activeGame)}
          className="flex items-center space-x-3 px-4 py-1.5 rounded-2xl hover:bg-white/5 cursor-pointer transition-colors max-w-sm truncate"
        >
          {/* Mini Glowing Cover Thumbnail */}
          <div className="w-11 h-11 rounded-xl overflow-hidden border border-white/20 shadow-md flex-shrink-0 relative">
            <img
              src={activeGame.coverImage || activeGame.heroImage}
              alt={activeGame.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/20" />
          </div>

          <div className="flex flex-col truncate">
            <span className="font-display font-black text-sm text-white truncate drop-shadow">
              {activeGame.title}
            </span>
            <span className="text-[11px] text-[#FBBF24] font-mono truncate">
              {activeGame.category} • {activeGame.minPlayers}–{activeGame.maxPlayers} Joueurs
            </span>
          </div>

          {/* Sound Wave Indicator Dots */}
          <div className="hidden sm:flex items-center space-x-1 pl-2">
            <span className="w-1 h-3 rounded-full bg-[#10B981] animate-pulse" />
            <span className="w-1 h-4 rounded-full bg-[#FBBF24] animate-pulse delay-75" />
            <span className="w-1 h-2 rounded-full bg-[#38BDF8] animate-pulse delay-150" />
          </div>
        </div>

        {/* 3. Right Action Shortcuts */}
        <div className="flex items-center space-x-2">
          {/* Rules / Info Modal */}
          <button
            data-tv-focus
            tabIndex={0}
            onClick={() => {
              audio.playSelect();
              onMoreInfo(activeGame);
            }}
            className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition-all outline-none focus:ring-2 focus:ring-white"
            title="Règles et Détails"
          >
            <Info className="w-4 h-4" />
          </button>

          {/* AI Content Studio Shortcut */}
          <button
            data-tv-focus
            tabIndex={0}
            onClick={() => {
              audio.playSelect();
              setTvView('admin');
            }}
            className="p-2.5 rounded-full bg-white/10 hover:bg-[#F59E0B]/20 text-[#FBBF24] transition-all outline-none focus:ring-2 focus:ring-[#FBBF24]"
            title="AI Content Studio (Gemini)"
          >
            <Sparkles className="w-4 h-4 fill-current" />
          </button>

          {/* Controller Simulator */}
          <button
            data-tv-focus
            tabIndex={0}
            onClick={() => {
              audio.playSelect();
              setIsSimulatorOpen(!isSimulatorOpen);
            }}
            className={`p-2.5 rounded-full transition-all outline-none focus:ring-2 focus:ring-white ${
              isSimulatorOpen
                ? 'bg-[#F59E0B] text-black font-black'
                : 'bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white'
            }`}
            title="Manette Smartphone / Simulateur"
          >
            <Smartphone className="w-4 h-4" />
          </button>

          {/* Audio Toggle */}
          <button
            data-tv-focus
            tabIndex={0}
            onClick={toggleMute}
            className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition-all outline-none focus:ring-2 focus:ring-white"
            title={isMuted ? 'Activer le son' : 'Couper le son'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-[#34D399]" />}
          </button>
        </div>
      </div>
    </div>
  );
};
