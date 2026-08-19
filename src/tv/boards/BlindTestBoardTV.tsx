import React, { useEffect, useState } from 'react';
import { useGame } from '../../context/GameContext';
import { BlindTestGameState } from '../../types/game';
import { Music, Clock, Trophy, Flame, Disc3, Volume2 } from 'lucide-react';
import { audio } from '../../services/audio';

export const BlindTestBoardTV: React.FC = () => {
  const { room } = useGame();
  const gameState = room?.gameState as BlindTestGameState | undefined;
  const [eqBars, setEqBars] = useState<number[]>([40, 70, 90, 60, 30, 80, 50, 100, 75, 45, 85, 65]);

  // Play melody note sequence whenever a new song starts
  useEffect(() => {
    if (!gameState?.currentSong || gameState.state !== 'playing') return;
    audio.playMelody(gameState.currentSong.melodyNotes);
  }, [gameState?.currentSongIndex, gameState?.state]);

  // Animate audio equalizer bars during playback
  useEffect(() => {
    if (gameState?.state !== 'playing') return;
    const interval = setInterval(() => {
      setEqBars(Array.from({ length: 16 }, () => 20 + Math.floor(Math.random() * 80)));
    }, 120);
    return () => clearInterval(interval);
  }, [gameState?.state]);

  if (!gameState || !gameState.currentSong) {
    return <div className="p-10 text-white">Chargement du Blind Test...</div>;
  }

  const song = gameState.currentSong;
  const isReveal = gameState.state === 'reveal';
  const buzzedPlayer = room?.players.find((p) => p.id === gameState.buzzedPlayerId);

  return (
    <div className="w-full h-full flex flex-col justify-between px-12 py-6 select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center space-x-3">
          <span className="px-3.5 py-1 rounded-full bg-brand-gold text-background font-black text-xs uppercase tracking-wider shadow-glow-gold">
            {song.category}
          </span>
          <span className="text-gray-400 text-sm font-bold">
            EXTRAIT {gameState.currentSongIndex + 1} / {gameState.totalSongs}
          </span>
        </div>

        <div className="flex items-center space-x-2 px-5 py-2.5 rounded-2xl bg-surface-card border border-white/10 shadow-lg">
          <Clock className="w-4 h-4 text-brand-gold" />
          <span className="font-mono font-black text-2xl text-white">{gameState.timeRemaining}s</span>
        </div>
      </div>

      {/* Center Audio Arena & Visualizer */}
      <div className="my-auto max-w-3xl mx-auto w-full flex flex-col items-center space-y-6">
        {/* Animated Vinyl Disc with Glowing Aura */}
        <div className="relative">
          <div className="w-48 h-48 rounded-full bg-gradient-to-tr from-[#121624] via-[#1E2438] to-[#0A0D18] border-4 border-white/20 flex items-center justify-center shadow-2xl shadow-brand-gold/30 animate-spin-slow">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-brand-red to-brand-gold flex items-center justify-center shadow-md">
              <Disc3 className="w-10 h-10 text-white" />
            </div>
          </div>
        </div>

        {/* Audio Spectrum EQ Bars */}
        <div className="flex items-end space-x-1.5 h-20 py-2">
          {eqBars.map((height, i) => (
            <div
              key={i}
              className="w-4 rounded-full bg-gradient-to-t from-brand-red via-brand-gold to-brand-cyan transition-all duration-100 shadow-md"
              style={{ height: `${gameState.state === 'playing' ? height : 15}%` }}
            />
          ))}
        </div>

        {/* Buzzed Player Alert */}
        {gameState.state === 'buzzed' && buzzedPlayer && (
          <div className="px-8 py-4 rounded-3xl bg-brand-gold text-background font-black text-xl flex items-center space-x-3 shadow-glow-gold animate-bounce">
            <span>⚡ {buzzedPlayer.name} a buzzé ! Choix en cours...</span>
          </div>
        )}

        {/* Revealed Song Title & Artist */}
        {isReveal ? (
          <div className="p-6 rounded-3xl bg-surface-card/95 border-2 border-emerald-400 text-center shadow-glow-emerald animate-scale-in max-w-lg w-full">
            <span className="text-xs font-black uppercase tracking-widest text-emerald-400">RÉVÉLATION DU TITRE</span>
            <h2 className="text-3xl font-black font-display text-white mt-1">{song.title}</h2>
            <p className="text-lg text-brand-gold font-bold">{song.artist}</p>
          </div>
        ) : (
          <div className="text-center text-gray-400 text-sm font-semibold">
            Écoutez l'extrait et buzzez le plus vite possible sur votre smartphone !
          </div>
        )}
      </div>

      {/* Bottom Live Scores */}
      <div className="border-t border-white/10 pt-4 flex items-center justify-between">
        <span className="text-xs font-black uppercase tracking-wider text-gray-400">SCORES BLIND TEST</span>
        <div className="flex items-center space-x-6">
          {room?.players.map((p) => {
            const score = (gameState.scores && gameState.scores[p.id]) || 0;
            return (
              <div key={p.id} className="flex items-center space-x-2">
                <span className="text-xl">{p.avatar}</span>
                <div>
                  <div className="text-xs font-bold text-white">{p.name}</div>
                  <div className="font-mono font-black text-brand-gold text-xs">{score} pts</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
