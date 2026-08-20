import React, { useRef, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { MiniRacingGameState } from '../../types/game';
import { Flag, Trophy, Zap, Gauge, Flame, Sparkles, Clock, Crown } from 'lucide-react';
import { playSoundFX } from '../../engine/PlaySoundFX';

export const MiniRacingBoardTV: React.FC = () => {
  const { room } = useGame();
  const gameState = room?.gameState as MiniRacingGameState | undefined;
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const prevCountdownRef = useRef<number | null>(null);

  // Sound triggers
  useEffect(() => {
    if (!gameState) return;

    if (gameState.status === 'countdown' && gameState.countdown !== prevCountdownRef.current) {
      prevCountdownRef.current = gameState.countdown;
      if (gameState.countdown > 0) {
        playSoundFX.playCountdownBeep(false);
      } else if (gameState.countdown === 0) {
        playSoundFX.playCountdownBeep(true);
      }
    }
  }, [gameState?.status, gameState?.countdown]);

  // 60 FPS HTML5 Canvas Track Renderer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !gameState) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      const w = canvas.width;
      const h = canvas.height;

      // 1. Draw Asphalt Track Background with 2.5D Perspective
      ctx.fillStyle = '#080C16';
      ctx.fillRect(0, 0, w, h);

      // Grass / Verge Borders
      ctx.fillStyle = '#0E2918';
      ctx.fillRect(0, 0, w * 0.12, h);
      ctx.fillRect(w * 0.88, 0, w * 0.12, h);

      // Curbs (Red & White striped borders)
      const curbSize = 30;
      const offset = (Date.now() / 20) % curbSize;
      for (let y = -curbSize; y < h + curbSize; y += curbSize) {
        const isRed = Math.floor((y + offset) / curbSize) % 2 === 0;
        ctx.fillStyle = isRed ? '#EF4444' : '#FFFFFF';
        ctx.fillRect(w * 0.12, y + offset, 12, curbSize);
        ctx.fillRect(w * 0.88 - 12, y + offset, 12, curbSize);
      }

      // Asphalt Track Center
      ctx.fillStyle = '#141824';
      ctx.fillRect(w * 0.12 + 12, 0, w * 0.76 - 24, h);

      // Dashed Track Lanes
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 4;
      ctx.setLineDash([25, 25]);
      ctx.lineDashOffset = -(Date.now() / 8) % 50;

      ctx.beginPath();
      ctx.moveTo(w * 0.38, 0);
      ctx.lineTo(w * 0.38, h);
      ctx.moveTo(w * 0.62, 0);
      ctx.lineTo(w * 0.62, h);
      ctx.stroke();
      ctx.setLineDash([]);

      // Finish / Start Line Checkered Pattern
      const finishY = h * 0.82;
      ctx.fillStyle = '#FFFFFF';
      for (let x = w * 0.14; x < w * 0.86; x += 18) {
        ctx.fillStyle = (Math.floor(x / 18) % 2 === 0) ? '#FFFFFF' : '#000000';
        ctx.fillRect(x, finishY, 18, 14);
      }

      // 2. Draw Player Vehicles
      const players = gameState.players || [];
      players.forEach((p, idx) => {
        const trackX = w * (0.16 + p.x * 0.68);
        // Vertical position based on progress in current lap
        const lapProgress = (p.progress % gameState.trackLength) / gameState.trackLength;
        const carY = h * 0.8 - (lapProgress * (h * 0.7));

        ctx.save();
        ctx.translate(trackX, carY);

        // Tire Smoke / Nitro Trail
        if (p.isNitroActive) {
          ctx.fillStyle = 'rgba(0, 210, 255, 0.7)';
          ctx.beginPath();
          ctx.arc(-8, 30, 8 + Math.random() * 6, 0, Math.PI * 2);
          ctx.arc(8, 30, 8 + Math.random() * 6, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.speed > 5) {
          ctx.fillStyle = 'rgba(200, 200, 200, 0.3)';
          ctx.beginPath();
          ctx.arc(-6, 26, 4 + Math.random() * 3, 0, Math.PI * 2);
          ctx.arc(6, 26, 4 + Math.random() * 3, 0, Math.PI * 2);
          ctx.fill();
        }

        // Car Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.beginPath();
        ctx.ellipse(0, 10, 18, 32, 0, 0, Math.PI * 2);
        ctx.fill();

        // 3D Cartoon Car Chassis
        const colorMap: Record<string, string> = {
          red: '#EF4444',
          blue: '#3B82F6',
          green: '#10B981',
          yellow: '#F59E0B',
          purple: '#8B5CF6',
          cyan: '#06B6D4',
        };
        const carColor = colorMap[p.color] || '#EF4444';

        ctx.fillStyle = carColor;
        ctx.beginPath();
        ctx.roundRect(-16, -26, 32, 52, 10);
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Windshield Glass
        ctx.fillStyle = '#1E293B';
        ctx.beginPath();
        ctx.roundRect(-11, -12, 22, 16, 4);
        ctx.fill();

        // Pilot Name Tag
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(p.name.slice(0, 10), 0, -32);

        ctx.restore();
      });

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [gameState]);

  if (!gameState) {
    return <div className="p-10 text-white">Chargement du circuit Mini Racing...</div>;
  }

  return (
    <div className="relative w-full h-full flex items-center justify-between px-10 py-3 select-none overflow-hidden bg-[#07090E]">
      {/* Left HUD: Live Rankings & Speed Leaderboard */}
      <div className="w-[300px] flex flex-col justify-between h-[86vh] py-2 z-20">
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 rounded-full bg-gradient-to-r from-red-600 to-amber-500 text-white text-xs font-black uppercase tracking-wider shadow-glow-red flex items-center space-x-1.5">
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>MINI RACING 3D</span>
            </span>
          </div>

          <h1 className="text-3xl font-black font-display text-white tracking-tight leading-none">
            CLASSEMENT EN DIRECT
          </h1>

          {/* Player Live Ranking Cards */}
          <div className="space-y-2">
            {gameState.players.map((p, idx) => (
              <div
                key={p.id}
                className={`p-3.5 rounded-2xl border-2 transition-all flex items-center justify-between ${
                  idx === 0
                    ? 'bg-amber-950/40 border-amber-400 shadow-glow-gold scale-105'
                    : 'bg-surface-card border-white/10'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-xl font-black text-sm flex items-center justify-center ${
                    idx === 0 ? 'bg-amber-400 text-gray-950' : 'bg-surface-light text-gray-300'
                  }`}>
                    {idx + 1}
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-white">{p.name}</h3>
                    <span className="text-[11px] font-bold text-gray-400">
                      Tour {p.lap} / {gameState.totalLaps}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-mono font-black text-base text-brand-gold">
                    {p.speed} <span className="text-[10px] text-gray-400">km/h</span>
                  </div>
                  {p.isNitroActive && (
                    <span className="px-1.5 py-0.5 rounded bg-cyan-500 text-gray-950 font-black text-[9px] uppercase animate-pulse">
                      NITRO ⚡
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Steering Instructions for Smart TV Viewers */}
        <div className="p-4 rounded-3xl bg-surface-card border border-white/10 text-xs text-gray-300 space-y-1">
          <div className="flex items-center space-x-1.5 text-brand-gold font-bold">
            <Gauge className="w-4 h-4" />
            <span>CONTRÔLE MOBILE</span>
          </div>
          <p className="text-[11px] text-gray-400 leading-relaxed">
            Inclinez votre smartphone pour tourner, accélérez avec la pédale et déclenchez votre Nitro !
          </p>
        </div>
      </div>

      {/* Center 2.5D Canvas Racing Track */}
      <div className="relative w-[720px] h-[720px] max-w-[55vw] max-h-[86vh] aspect-square rounded-3xl overflow-hidden border-4 border-[#242A38] shadow-2xl flex items-center justify-center">
        <canvas ref={canvasRef} width={600} height={600} className="w-full h-full" />

        {/* 3-2-1 Countdown Overlay */}
        {gameState.status === 'countdown' && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md flex flex-col items-center justify-center animate-scale-in z-30">
            <span className="text-xs font-black uppercase tracking-widest text-brand-gold mb-2">DÉPART DANS</span>
            <div className="w-28 h-28 rounded-full bg-brand-red border-4 border-white flex items-center justify-center font-display font-black text-6xl text-white shadow-glow-red animate-bounce">
              {gameState.countdown}
            </div>
          </div>
        )}

        {/* Finished / Winner Overlay */}
        {gameState.status === 'finished' && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-xl flex flex-col items-center justify-center animate-scale-in z-30 p-8 text-center space-y-4">
            <Crown className="w-14 h-14 text-brand-gold animate-bounce" />
            <h2 className="text-4xl font-black font-display text-white">DRAPEAU À DAMIER !</h2>
            <p className="text-xl font-bold text-brand-gold uppercase tracking-wider">
              🏆 {gameState.winner} REMPORTE LE GRAND PRIX !
            </p>
          </div>
        )}
      </div>

      {/* Right HUD: Race Lap Progress Gauge */}
      <div className="w-[280px] flex flex-col justify-between h-[86vh] py-2 z-20">
        <div className="p-5 rounded-3xl bg-surface-card border border-white/10 backdrop-blur-xl space-y-4">
          <div className="flex items-center space-x-2 text-xs font-black uppercase tracking-wider text-brand-gold">
            <Flag className="w-4 h-4" />
            <span>PROGRESSION DU CIRCUIT</span>
          </div>

          <div className="space-y-3">
            {gameState.players.map((p) => {
              const progressPct = Math.min(100, (p.progress / (gameState.trackLength * gameState.totalLaps)) * 100);
              return (
                <div key={p.id} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-gray-300">
                    <span>{p.name}</span>
                    <span className="font-mono text-brand-gold">{Math.round(progressPct)}%</span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-surface-dark overflow-hidden border border-white/10">
                    <div
                      className="h-full bg-gradient-to-r from-brand-red to-amber-400 rounded-full transition-all duration-200"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
