import React, { useEffect, useState, useRef } from 'react';
import { useGame } from '../../../context/GameContext';
import { MiniRacingGameState } from '../../../types/game';
import { MobileHeader } from '../../components/MobileHeader';
import { ReactionFlinger } from '../../components/ReactionFlinger';
import { triggerHaptic, hapticPatterns } from '../../components/HapticFeedback';
import { playSoundFX } from '../../../engine/PlaySoundFX';
import { Zap, Gauge, Flame, ArrowLeft, ArrowRight, Smartphone } from 'lucide-react';

export const MiniRacingController: React.FC = () => {
  const { room, localPlayer, sendGameAction } = useGame();
  const gameState = room?.gameState as MiniRacingGameState | undefined;

  const [isAccelerating, setIsAccelerating] = useState(false);
  const [isBraking, setIsBraking] = useState(false);
  const [isNitro, setIsNitro] = useState(false);
  const [steeringVal, setSteeringVal] = useState(0);

  const lastSentSteering = useRef(0);

  const myStatus = gameState?.players.find((p) => p.id === localPlayer?.id);

  // Setup Gyroscope Motion Controls (Tilt phone left/right to steer)
  useEffect(() => {
    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma !== null) {
        // gamma is left-to-right tilt in degrees (-90 to 90)
        const normalized = Math.max(-1, Math.min(1, e.gamma / 30));
        setSteeringVal(normalized);

        // Throttle WebSocket messages
        if (Math.abs(normalized - lastSentSteering.current) > 0.08) {
          lastSentSteering.current = normalized;
          sendGameAction('racing_action', { action: 'steer', steering: normalized });
        }
      }
    };

    if (typeof window !== 'undefined' && window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleOrientation);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('deviceorientation', handleOrientation);
      }
    };
  }, []);

  const handleGasStart = () => {
    setIsAccelerating(true);
    triggerHaptic(hapticPatterns.tap);
    sendGameAction('racing_action', { action: 'accelerate', active: true });
  };

  const handleGasEnd = () => {
    setIsAccelerating(false);
    sendGameAction('racing_action', { action: 'accelerate', active: false });
  };

  const handleBrakeStart = () => {
    setIsBraking(true);
    triggerHaptic(hapticPatterns.tap);
    sendGameAction('racing_action', { action: 'brake', active: true });
  };

  const handleBrakeEnd = () => {
    setIsBraking(false);
    sendGameAction('racing_action', { action: 'brake', active: false });
  };

  const handleNitroStart = () => {
    setIsNitro(true);
    triggerHaptic(hapticPatterns.success);
    playSoundFX.playNitroBoost();
    sendGameAction('racing_action', { action: 'nitro', active: true });
  };

  const handleNitroEnd = () => {
    setIsNitro(false);
    sendGameAction('racing_action', { action: 'nitro', active: false });
  };

  const handleManualSteer = (dir: number) => {
    setSteeringVal(dir);
    triggerHaptic(hapticPatterns.tap);
    sendGameAction('racing_action', { action: 'steer', steering: dir });
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-background text-white select-none">
      <MobileHeader />

      <main className="p-4 flex-1 flex flex-col justify-between space-y-4">
        {/* Speed & Nitro HUD Dashboard */}
        <div className="p-4 rounded-3xl bg-surface-card border-2 border-white/10 flex items-center justify-between shadow-2xl">
          <div>
            <span className="text-[10px] font-black uppercase text-gray-400">VITESSE</span>
            <div className="font-mono font-black text-3xl text-white">
              {myStatus?.speed || 0} <span className="text-xs text-brand-gold">KM/H</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Smartphone className="w-5 h-5 text-brand-cyan animate-pulse" />
            <span className="text-[11px] font-bold text-gray-300">Inclinez le téléphone pour tourner</span>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-black uppercase text-gray-400">NITRO</span>
            <div className="font-mono font-black text-2xl text-cyan-400">
              {myStatus?.nitro || 100}%
            </div>
          </div>
        </div>

        {/* Tactile Manual Steer Buttons (Fallback if orientation unavailable) */}
        <div className="flex items-center justify-between px-2">
          <button
            onTouchStart={() => handleManualSteer(-0.8)}
            onTouchEnd={() => handleManualSteer(0)}
            onMouseDown={() => handleManualSteer(-0.8)}
            onMouseUp={() => handleManualSteer(0)}
            className="w-20 h-20 rounded-2xl bg-surface-card border-2 border-white/20 active:bg-brand-red flex items-center justify-center text-white shadow-lg"
          >
            <ArrowLeft className="w-8 h-8" />
          </button>

          <span className="text-xs font-black text-gray-400 uppercase tracking-widest">
            {steeringVal < -0.2 ? '◀ GAUCHE' : steeringVal > 0.2 ? 'DROITE ▶' : 'TOUT DROIT'}
          </span>

          <button
            onTouchStart={() => handleManualSteer(0.8)}
            onTouchEnd={() => handleManualSteer(0)}
            onMouseDown={() => handleManualSteer(0.8)}
            onMouseUp={() => handleManualSteer(0)}
            className="w-20 h-20 rounded-2xl bg-surface-card border-2 border-white/20 active:bg-brand-red flex items-center justify-center text-white shadow-lg"
          >
            <ArrowRight className="w-8 h-8" />
          </button>
        </div>

        {/* Large Pedals: Accelerator & Nitro */}
        <div className="grid grid-cols-3 gap-3">
          {/* Brake Button */}
          <button
            onTouchStart={handleBrakeStart}
            onTouchEnd={handleGasEnd}
            onMouseDown={handleBrakeStart}
            onMouseUp={handleBrakeEnd}
            className={`py-7 rounded-3xl font-black text-sm uppercase tracking-wider transition-all border-2 ${
              isBraking
                ? 'bg-rose-600 border-white shadow-glow-red scale-95'
                : 'bg-surface-card border-white/15 text-rose-400'
            }`}
          >
            🛑 FREIN
          </button>

          {/* Nitro Boost Button */}
          <button
            onTouchStart={handleNitroStart}
            onTouchEnd={handleNitroEnd}
            onMouseDown={handleNitroStart}
            onMouseUp={handleNitroEnd}
            className={`py-7 rounded-3xl font-black text-sm uppercase tracking-wider transition-all border-2 flex flex-col items-center justify-center ${
              isNitro
                ? 'bg-cyan-500 text-gray-950 border-white shadow-[0_0_30px_rgba(6,182,212,0.8)] scale-95 animate-pulse'
                : 'bg-cyan-950/60 border-cyan-500/40 text-cyan-300'
            }`}
          >
            <Flame className="w-5 h-5 mb-0.5" />
            <span>NITRO</span>
          </button>

          {/* Gas Accelerator Pedal */}
          <button
            onTouchStart={handleGasStart}
            onTouchEnd={handleGasEnd}
            onMouseDown={handleGasStart}
            onMouseUp={handleGasEnd}
            className={`py-7 rounded-3xl font-black text-sm uppercase tracking-wider transition-all border-2 ${
              isAccelerating
                ? 'bg-emerald-500 text-gray-950 border-white shadow-glow-emerald scale-95'
                : 'bg-emerald-950/70 border-emerald-500/40 text-emerald-300'
            }`}
          >
            ⚡ GAZ !
          </button>
        </div>

        <ReactionFlinger />
      </main>
    </div>
  );
};
