import React from 'react';
import { useGame } from '../../../context/GameContext';
import { BlindTestGameState } from '../../../types/game';
import { MobileHeader } from '../../components/MobileHeader';
import { ReactionFlinger } from '../../components/ReactionFlinger';
import { triggerHaptic, hapticPatterns } from '../../components/HapticFeedback';
import { audio } from '../../../services/audio';
import { Disc3, Zap, Clock, Trophy } from 'lucide-react';

export const BlindTestController: React.FC = () => {
  const { room, localPlayer, sendGameAction } = useGame();
  const gameState = room?.gameState as BlindTestGameState | undefined;

  if (!gameState || !localPlayer) return null;

  const isPlaying = gameState.state === 'playing';
  const isMyBuzz = gameState.state === 'buzzed' && gameState.buzzedPlayerId === localPlayer.id;
  const isOtherBuzz = gameState.state === 'buzzed' && gameState.buzzedPlayerId !== localPlayer.id;
  const song = gameState.currentSong;

  const handleBuzz = () => {
    if (!isPlaying) return;
    triggerHaptic(hapticPatterns.buzzer);
    audio.playCustomBuzzer(localPlayer.buzzerSound || 'arcade');
    sendGameAction('blind_test_buzz');
  };

  const handleChooseOption = (idx: number) => {
    if (!isMyBuzz) return;
    triggerHaptic(hapticPatterns.tap);
    sendGameAction('blind_test_answer', { optionIndex: idx });
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-background text-white select-none">
      <MobileHeader />

      <main className="p-4 flex-1 flex flex-col justify-between space-y-4">
        {/* Status Bar */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-surface-card border border-white/10">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-brand-gold" />
            <span className="font-mono font-black text-sm text-white">{gameState.timeRemaining}s</span>
          </div>
          <span className="text-xs font-bold text-brand-gold">
            Extrait {gameState.currentSongIndex + 1} / {gameState.totalSongs}
          </span>
        </div>

        {/* Big Reflex Buzzer */}
        {isPlaying ? (
          <div className="my-auto flex flex-col items-center space-y-4">
            <button
              onClick={handleBuzz}
              className="w-48 h-48 rounded-full bg-gradient-to-tr from-brand-gold via-amber-500 to-brand-red border-4 border-white shadow-glow-gold flex flex-col items-center justify-center space-y-2 hover:scale-105 active:scale-95 transition-all group"
            >
              <Zap className="w-16 h-16 text-background fill-current group-hover:animate-bounce" />
              <span className="font-display font-black text-2xl text-background tracking-wider">
                BUZZER !
              </span>
            </button>
            <span className="text-xs text-gray-400 font-semibold">
              Appuyez dès que vous reconnaissez la musique
            </span>
          </div>
        ) : isMyBuzz && song ? (
          /* 4 Multiple Choice Options */
          <div className="space-y-3 my-auto">
            <div className="text-center text-xs font-black uppercase text-brand-gold">
              ⚡ VOUS AVEZ LE BUZZER ! CHOISISSEZ VITE :
            </div>
            <div className="grid grid-cols-1 gap-2.5">
              {song.options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleChooseOption(idx)}
                  className="py-4 px-5 rounded-2xl bg-surface-card border-2 border-white/20 text-left font-bold text-base text-white hover:border-brand-gold active:scale-95 transition-all flex items-center justify-between"
                >
                  <span>{opt}</span>
                  <span className="w-6 h-6 rounded-full bg-surface-light text-xs flex items-center justify-center font-black">
                    {idx + 1}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Waiting Screen while other player answers or during reveal */
          <div className="p-8 rounded-3xl bg-surface-card/60 border border-white/10 text-center space-y-3 my-auto">
            <Disc3 className="w-12 h-12 text-brand-cyan mx-auto animate-spin-slow" />
            <h3 className="text-base font-bold text-white">
              {isOtherBuzz ? 'Un autre joueur a buzzé !' : 'Révélation du morceau sur la TV'}
            </h3>
            <p className="text-xs text-gray-400">Regardez l'écran Smart TV pour voir la réponse</p>
          </div>
        )}

        <ReactionFlinger />
      </main>
    </div>
  );
};
