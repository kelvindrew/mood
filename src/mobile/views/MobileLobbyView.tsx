import React from 'react';
import { useGame } from '../../context/GameContext';
import { MobileHeader } from '../components/MobileHeader';
import { ReactionFlinger } from '../components/ReactionFlinger';
import { CheckCircle2, Play, Palette, Bot, Sparkles } from 'lucide-react';
import { triggerHaptic, hapticPatterns } from '../components/HapticFeedback';
import { audio } from '../../services/audio';
import { socketService } from '../../services/socket';
import { PlayerColor } from '../../types/game';
import { MoodAtmosphereBackground } from '../../components/MoodAtmosphereBackground';

const COLORS: { id: PlayerColor; bg: string; name: string }[] = [
  { id: 'red', bg: 'bg-red-600', name: 'Rouge' },
  { id: 'blue', bg: 'bg-blue-600', name: 'Bleu' },
  { id: 'green', bg: 'bg-emerald-600', name: 'Vert' },
  { id: 'yellow', bg: 'bg-amber-500', name: 'Jaune' },
  { id: 'purple', bg: 'bg-purple-600', name: 'Violet' },
  { id: 'cyan', bg: 'bg-cyan-600', name: 'Cyan' },
];

export const MobileLobbyView: React.FC = () => {
  const { room, localPlayer, selectedGame, startGame } = useGame();

  if (!room || !localPlayer) return null;

  const handleToggleReady = () => {
    triggerHaptic(hapticPatterns.tap);
    audio.playSelect();
    socketService.toggleReady(room.code);
  };

  const handleSelectColor = (color: PlayerColor) => {
    triggerHaptic(hapticPatterns.tap);
    audio.playFocus();
    socketService.setPlayerColor(room.code, color);
  };

  const handleStartGame = () => {
    triggerHaptic(hapticPatterns.success);
    audio.playSelect();
    startGame();
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-between bg-transparent text-white select-none overflow-x-hidden">
      {/* Background Visual Artwork Atmosphere */}
      <MoodAtmosphereBackground showOverlays={true} />

      <div className="relative z-10 flex flex-col justify-between min-h-screen">
        <MobileHeader />

        <main className="p-4 flex-1 flex flex-col justify-between space-y-4 animate-scale-in">
        {/* Game Badge */}
        <div className="text-center space-y-1">
          <span className="px-3.5 py-1 rounded-full bg-cyan-950/80 border border-cyan-400/40 text-cyan-300 text-[10px] font-black uppercase tracking-wider shadow-md">
            SALON DU JEU
          </span>
          <h1 className="text-2xl font-black font-display text-white">{selectedGame.title}</h1>
          <p className="text-xs text-slate-400 font-medium">Regardez l'écran Smart TV pour voir les joueurs</p>
        </div>

        {/* Color / Team Selector */}
        <div className="p-4 rounded-3xl bg-[#0E1626]/95 border border-slate-700/60 space-y-3 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Palette className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-black uppercase tracking-wider text-slate-300">
                Couleur de Pion / Équipe
              </span>
            </div>
            <span className="text-[10px] font-bold text-slate-400 capitalize">{localPlayer.color}</span>
          </div>

          <div className="grid grid-cols-6 gap-2">
            {COLORS.map((c) => {
              const isSelected = localPlayer.color === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => handleSelectColor(c.id)}
                  className={`w-11 h-11 rounded-2xl ${c.bg} flex items-center justify-center transition-all ${
                    isSelected ? 'scale-110 ring-4 ring-white shadow-lg z-10' : 'opacity-65 hover:opacity-100'
                  }`}
                >
                  {isSelected && <CheckCircle2 className="w-5 h-5 text-white" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Ready Toggle Button */}
        <div className="space-y-3">
          <button
            onClick={handleToggleReady}
            className={`w-full py-5 rounded-3xl font-black text-xl flex items-center justify-center space-x-3 transition-all active:scale-95 shadow-xl ${
              localPlayer.isReady
                ? 'bg-emerald-400 text-slate-950 shadow-[0_4px_25px_rgba(16,185,129,0.35)] border-2 border-emerald-300'
                : 'bg-slate-900/90 border-2 border-slate-700 text-slate-200 hover:border-cyan-400'
            }`}
          >
            <CheckCircle2 className="w-6 h-6" />
            <span>{localPlayer.isReady ? 'VOUS ÊTES PRÊT' : 'CLIQUER QUAND PRÊT'}</span>
          </button>

          {/* If host, allow adding bot and launching game directly from mobile */}
          {localPlayer.isHost && (
            <div className="space-y-2">
              <button
                onClick={() => {
                  triggerHaptic(hapticPatterns.tap);
                  audio.playSelect();
                  socketService.addBot(room.code);
                }}
                className="w-full py-3 rounded-2xl bg-indigo-900/60 border border-indigo-500/40 text-indigo-200 font-black text-xs shadow-md flex items-center justify-center space-x-2 active:scale-95"
              >
                <Bot className="w-4 h-4" />
                <span>+ AJOUTER UN BOT IA</span>
              </button>

              <button
                onClick={handleStartGame}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-300 hover:to-cyan-400 text-slate-950 font-black text-sm shadow-[0_4px_25px_rgba(6,182,212,0.35)] active:scale-95 transition-all flex items-center justify-center space-x-2 border border-cyan-300/40"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>LANCER DEPUIS LE TÉLÉPHONE</span>
              </button>
            </div>
          )}
        </div>

        {/* Reaction Flinger Bar */}
        <ReactionFlinger />
      </main>
      </div>
    </div>
  );
};
