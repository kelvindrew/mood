import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '../../context/GameContext';
import { LudoGameState, LudoPawn } from '../../types/game';
import { Clock, Trophy, Sparkles, Shield, Crown, Box, Layers } from 'lucide-react';
import { playCamera, CameraState } from '../../engine/PlayCamera';
import { playParticles } from '../../engine/PlayParticleEngine';
import { playSoundFX } from '../../engine/PlaySoundFX';
import { GAME_THEMES, GameThemeId } from '../../engine/PlayThemes';
import { LudoBoard3D } from './LudoBoard3D';

const CELL_SIZE = 40;

function cellToPx(col: number, row: number): { x: number; y: number } {
  return {
    x: col * CELL_SIZE + CELL_SIZE / 2,
    y: row * CELL_SIZE + CELL_SIZE / 2,
  };
}

// 52 Main Circuit Track Coordinates
const TRACK_COORDS: { x: number; y: number }[] = [
  // Red Arm (0..12)
  cellToPx(1, 6), cellToPx(2, 6), cellToPx(3, 6), cellToPx(4, 6), cellToPx(5, 6),
  cellToPx(6, 5), cellToPx(6, 4), cellToPx(6, 3), cellToPx(6, 2), cellToPx(6, 1), cellToPx(6, 0),
  cellToPx(7, 0), cellToPx(8, 0),

  // Green Arm (13..25)
  cellToPx(8, 1), cellToPx(8, 2), cellToPx(8, 3), cellToPx(8, 4), cellToPx(8, 5),
  cellToPx(9, 6), cellToPx(10, 6), cellToPx(11, 6), cellToPx(12, 6), cellToPx(13, 6), cellToPx(14, 6),
  cellToPx(14, 7), cellToPx(14, 8),

  // Yellow Arm (26..38)
  cellToPx(13, 8), cellToPx(12, 8), cellToPx(11, 8), cellToPx(10, 8), cellToPx(9, 8),
  cellToPx(8, 9), cellToPx(8, 10), cellToPx(8, 11), cellToPx(8, 12), cellToPx(8, 13), cellToPx(8, 14),
  cellToPx(7, 14), cellToPx(6, 14),

  // Blue Arm (39..51)
  cellToPx(6, 13), cellToPx(6, 12), cellToPx(6, 11), cellToPx(6, 10), cellToPx(6, 9),
  cellToPx(5, 8), cellToPx(4, 8), cellToPx(3, 8), cellToPx(2, 8), cellToPx(1, 8), cellToPx(0, 8),
  cellToPx(0, 7), cellToPx(0, 6),
];

const HOME_STRETCH_COORDS: Record<string, { x: number; y: number }[]> = {
  red: [cellToPx(1, 7), cellToPx(2, 7), cellToPx(3, 7), cellToPx(4, 7), cellToPx(5, 7)],
  green: [cellToPx(7, 1), cellToPx(7, 2), cellToPx(7, 3), cellToPx(7, 4), cellToPx(7, 5)],
  yellow: [cellToPx(13, 7), cellToPx(12, 7), cellToPx(11, 7), cellToPx(10, 7), cellToPx(9, 7)],
  blue: [cellToPx(7, 13), cellToPx(7, 12), cellToPx(7, 11), cellToPx(7, 10), cellToPx(7, 9)],
};

const BASE_NESTS: Record<string, { x: number; y: number }[]> = {
  red: [{ x: 80, y: 80 }, { x: 160, y: 80 }, { x: 80, y: 160 }, { x: 160, y: 160 }],
  green: [{ x: 440, y: 80 }, { x: 520, y: 80 }, { x: 440, y: 160 }, { x: 520, y: 160 }],
  yellow: [{ x: 440, y: 440 }, { x: 520, y: 440 }, { x: 440, y: 520 }, { x: 520, y: 520 }],
  blue: [{ x: 80, y: 440 }, { x: 160, y: 440 }, { x: 80, y: 520 }, { x: 160, y: 520 }],
};

export const LudoBoardTV: React.FC = () => {
  const { room, sendGameAction } = useGame();
  const gameState = room?.gameState as LudoGameState | undefined;

  const [currentTheme, setCurrentTheme] = useState<GameThemeId>('volcano');
  const [cameraState, setCameraState] = useState<CameraState>(playCamera.getState());
  const [isRollingAnimation, setIsRollingAnimation] = useState(false);
  const [animatedDiceVal, setAnimatedDiceVal] = useState<number | null>(null);

  // 3D View Mode State
  const [is3DMode, setIs3DMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('mood_ludo_view_3d');
    return saved !== null ? saved === 'true' : true; // Default 3D mode enabled!
  });

  const particleCanvasRef = useRef<HTMLCanvasElement>(null);
  const prevActionLogRef = useRef<string>('');

  const theme = GAME_THEMES[currentTheme] || GAME_THEMES.classic_royal;

  // Sync with gameState viewMode3D if updated by a player
  useEffect(() => {
    if (gameState?.viewMode3D !== undefined && gameState.viewMode3D !== is3DMode) {
      setIs3DMode(gameState.viewMode3D);
    }
  }, [gameState?.viewMode3D]);

  const handleToggle3D = () => {
    playSoundFX.playHop();
    const nextVal = !is3DMode;
    setIs3DMode(nextVal);
    localStorage.setItem('mood_ludo_view_3d', String(nextVal));
    sendGameAction('ludo_toggle_3d', { enabled: nextVal });
  };

  // Subscribe to 2.5D Camera (used in 2D mode)
  useEffect(() => {
    const unsub = playCamera.subscribe((cam) => {
      setCameraState(cam);
    });
    return () => unsub();
  }, []);

  // Attach particle canvas engine safely
  useEffect(() => {
    if (!is3DMode && particleCanvasRef.current) {
      try {
        playParticles.attach(particleCanvasRef.current);
      } catch {}
    }
    return () => {
      try {
        playParticles.detach();
      } catch {}
    };
  }, [is3DMode]);

  // Dice roll & action sound/particle animations
  useEffect(() => {
    if (!gameState) return;

    // Detect new dice roll
    if (gameState.diceValue !== null && !gameState.canRollDice) {
      setIsRollingAnimation(true);
      playSoundFX.playDiceRoll();

      // Trigger 3D Dice roll camera focus
      playCamera.focusDice(300, 300);

      // Fast tumbling animation on TV
      let count = 0;
      const diceInterval = setInterval(() => {
        setAnimatedDiceVal(Math.floor(Math.random() * 6) + 1);
        count++;
        if (count > 6) {
          clearInterval(diceInterval);
          setAnimatedDiceVal(gameState.diceValue);
          setIsRollingAnimation(false);

          if (gameState.diceValue === 6) {
            playSoundFX.playDiceSixBonus();
            playCamera.shake(10);
            if (!is3DMode) {
              playParticles.emitExplosion(350, 350, '#FFD700', 30);
            }
          } else if (!is3DMode) {
            playParticles.emitDiceSparks(350, 350, 12);
          }

          setTimeout(() => {
            playCamera.reset();
          }, 800);
        }
      }, 70);
    }

    // Detect capture or home entrance in action logs
    if (gameState.lastActionLog && gameState.lastActionLog !== prevActionLogRef.current) {
      prevActionLogRef.current = gameState.lastActionLog;

      if (gameState.lastActionLog.includes('capturé')) {
        playSoundFX.playCaptureExplosion();
        playCamera.focusCapture(300, 300);
        if (!is3DMode) {
          playParticles.emitExplosion(350, 350, '#FF3B30', 40);
        }
      } else if (gameState.lastActionLog.includes('sort son pion')) {
        playSoundFX.playHop();
        if (!is3DMode) {
          playParticles.emitImpact(350, 350, '#34C759', 20);
        }
      } else if (gameState.lastActionLog.includes('maison centrale')) {
        playSoundFX.playDiceSixBonus();
        if (!is3DMode) {
          playParticles.emitExplosion(350, 350, '#FFD700', 45);
        }
      } else {
        playSoundFX.playHop();
      }
    }

    // Winner detection
    if (gameState.winner) {
      playCamera.victoryPanorama();
      if (!is3DMode) {
        playParticles.emitExplosion(350, 300, '#FFD700', 60);
      }
    }
  }, [gameState?.diceValue, gameState?.canRollDice, gameState?.lastActionLog, gameState?.winner, is3DMode]);

  if (!gameState) {
    return <div className="p-10 text-white">Chargement du Ludo 3D Deluxe...</div>;
  }

  const activeColor = gameState.currentTurnColor || 'red';
  const activeSkin = theme.pawnSkins[activeColor] || theme.pawnSkins.red;
  const activePlayer = room?.players.find((p) => p.color === activeColor);

  // Position resolver for 2D pawns
  const getPawnPixelPosition = (pawn: LudoPawn): { x: number; y: number } => {
    if (pawn.isFinished) return { x: 300, y: 300 };
    if (pawn.isHome) {
      const nests = BASE_NESTS[pawn.color];
      return nests[pawn.id] || { x: 300, y: 300 };
    }
    if (pawn.position >= 100) {
      const stretchIdx = Math.min(4, Math.max(0, pawn.position - 100));
      const stretch = HOME_STRETCH_COORDS[pawn.color];
      return stretch?.[stretchIdx] || { x: 300, y: 300 };
    }
    return TRACK_COORDS[pawn.position % 52] || { x: 300, y: 300 };
  };

  const allPawns: LudoPawn[] = Object.values(gameState.pawns).flat();
  const renderedPawns = allPawns.map((pawn) => {
    const basePos = getPawnPixelPosition(pawn);
    const isMovable = gameState.movablePawns.includes(pawn.id) && pawn.color === activeColor;

    return {
      pawn,
      x: basePos.x,
      y: basePos.y,
      isMovable,
    };
  });

  return (
    <div className={`relative w-full h-full flex items-center justify-between px-8 py-2 select-none overflow-hidden bg-gradient-to-br ${theme.bgGradient} transition-colors duration-1000`}>
      {/* Left HUD: Active Turn Card, 3D Toggle & Roll Box */}
      <div className="w-[280px] flex flex-col justify-between h-[88vh] py-2 z-20">
        <div className="space-y-3">
          {/* Header & Controls: 3D Toggle + Theme Switcher */}
          <div className="flex items-center justify-between">
            {/* 3D Mode Toggle Button */}
            <button
              onClick={handleToggle3D}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-black transition-all shadow-md active:scale-95 cursor-pointer ${
                is3DMode
                  ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-neutral-950 border-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.45)] scale-105'
                  : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
              }`}
              title="Basculer entre l'interface 3D et 2D"
            >
              <Box className="w-3.5 h-3.5" />
              <span>{is3DMode ? 'VUE 3D' : 'VUE 2D'}</span>
            </button>

            {/* Quick Theme Cycle Button */}
            <button
              onClick={() => {
                const themeKeys: GameThemeId[] = ['volcano', 'ice', 'galaxy', 'jungle_congo', 'desert', 'classic_royal'];
                const nextIdx = (themeKeys.indexOf(currentTheme) + 1) % themeKeys.length;
                setCurrentTheme(themeKeys[nextIdx]);
                playSoundFX.playHop();
              }}
              className="flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-brand-gold transition-all cursor-pointer"
            >
              <span>{theme.emoji}</span>
              <span className="text-[10px]">{theme.name}</span>
            </button>
          </div>

          <h1 className="text-2xl font-black font-display text-white tracking-tight leading-none">
            TOUR DE :
          </h1>

          {/* Active Player Card with 2.5D Glow */}
          <div className={`p-4 rounded-3xl border-2 transition-all bg-surface-card/90 backdrop-blur-xl ${activeSkin.glow} border-white/30 flex items-center space-x-3.5`}>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-white/20 to-white/5 border-2 border-white flex items-center justify-center font-black text-white text-lg shadow-lg">
              {activePlayer?.name?.charAt(0) || activeColor.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 overflow-hidden">
              <span className="text-[10px] font-black uppercase tracking-wider text-brand-gold">
                ÉLÉMENT {activeSkin.name.toUpperCase()}
              </span>
              <h2 className="text-base font-black text-white truncate">
                {activePlayer?.name || `Joueur ${activeColor.toUpperCase()}`}
              </h2>
            </div>
          </div>

          {/* Rolling Dice Showcase */}
          <div className="p-4 rounded-3xl bg-surface-card/85 border border-white/15 backdrop-blur-xl flex flex-col items-center justify-center space-y-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">DÉ DU JOUEUR</span>
            
            <div className={`relative w-20 h-20 rounded-3xl bg-gradient-to-br from-white via-gray-100 to-gray-300 text-gray-950 font-display font-black text-5xl flex items-center justify-center shadow-[0_15px_30px_rgba(0,0,0,0.6),inset_0_-4px_8px_rgba(0,0,0,0.2)] border-4 border-white transition-all transform ${
              isRollingAnimation ? 'animate-spin-slow scale-110' : ''
            }`}>
              {animatedDiceVal !== null ? animatedDiceVal : (gameState.diceValue !== null ? gameState.diceValue : '?')}

              {/* 6 Bonus Star Aura */}
              {(animatedDiceVal === 6 || gameState.diceValue === 6) && (
                <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-brand-gold text-gray-900 text-xs font-black flex items-center justify-center shadow-glow-gold animate-bounce">
                  ★
                </div>
              )}
            </div>

            <div className="flex items-center space-x-1 text-xs text-gray-400">
              <Clock className="w-3.5 h-3.5 text-brand-gold" />
              <span>Temps : <strong className="text-white font-mono">{gameState.turnTimeLeft}s</strong></span>
            </div>
          </div>
        </div>

        {/* Player Progress Summary */}
        <div className="p-3.5 rounded-3xl bg-surface-card/85 border border-white/15 space-y-2">
          <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-gray-400">
            <span>PIONS EN MAISON</span>
            <Trophy className="w-4 h-4 text-brand-gold" />
          </div>

          <div className="space-y-1.5">
            {gameState.players.map((col) => {
              const skin = theme.pawnSkins[col] || theme.pawnSkins.red;
              const pawns = gameState.pawns[col] || [];
              const finishedCount = pawns.filter((p) => p.isFinished).length;
              const isCurrent = col === activeColor;

              return (
                <div
                  key={col}
                  className={`flex items-center justify-between p-2 rounded-2xl border transition-all ${
                    isCurrent
                      ? `bg-surface-light border-2 border-white shadow-md scale-105`
                      : 'bg-surface-dark/60 border-white/5 opacity-80'
                  }`}
                >
                  <span className="text-xs font-black text-white capitalize">{skin.name}</span>
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div
                        key={i}
                        className={`w-3 h-3 rounded-full border ${
                          i < finishedCount
                            ? 'bg-brand-gold border-white shadow-glow-gold'
                            : 'bg-surface-light border-white/20'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Action Ticker */}
        <div className="p-3 rounded-2xl bg-surface-card/75 border border-white/10 text-xs">
          <div className="flex items-center space-x-1.5 text-brand-gold font-bold mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span className="text-[10px] font-black uppercase">ÉVÉNEMENTS DU JEU</span>
          </div>
          <p className="text-gray-300 text-xs font-medium italic truncate">
            "{gameState.lastActionLog || 'À vos marques !'}"
          </p>
        </div>
      </div>

      {/* Center High-Definition Board Stage (3D vs 2D) */}
      <div className="relative w-[700px] h-[700px] max-w-[55vw] max-h-[88vh] aspect-square flex items-center justify-center">
        {/* Floating Quick View Switcher at Top of Board */}
        <div className="absolute top-2 right-4 z-40 flex items-center space-x-1 bg-neutral-900/85 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/15 shadow-xl">
          <button
            onClick={handleToggle3D}
            className={`flex items-center space-x-1.5 text-xs font-black px-3 py-1 rounded-full transition-all cursor-pointer ${
              is3DMode
                ? 'bg-amber-400 text-neutral-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Activer la vue 3D"
          >
            <Box className="w-3.5 h-3.5" />
            <span>Mode 3D</span>
          </button>
          <button
            onClick={handleToggle3D}
            className={`flex items-center space-x-1.5 text-xs font-black px-3 py-1 rounded-full transition-all cursor-pointer ${
              !is3DMode
                ? 'bg-white text-neutral-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Activer la vue 2D"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Mode 2D</span>
          </button>
        </div>

        {is3DMode ? (
          /* 3D Realistic Three.js Interactive Board */
          <LudoBoard3D
            gameState={gameState}
            currentTheme={currentTheme}
            isRollingAnimation={isRollingAnimation}
            animatedDiceVal={animatedDiceVal}
            onSelectPawn={(pawnId) => {
              sendGameAction('ludo_move_pawn', { pawnId });
            }}
          />
        ) : (
          /* 2D Classic Vector Board */
          <>
            {/* Particle Canvas Overlay Layer */}
            <canvas
              ref={particleCanvasRef}
              width={700}
              height={700}
              className="absolute inset-0 w-full h-full pointer-events-none z-30"
            />

            {/* Solid 2D Board Stage */}
            <div className="relative w-[600px] h-[600px] rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] border-[10px] border-[#181D2E] bg-white">
              <svg viewBox="0 0 600 600" className="w-full h-full rounded-2xl overflow-visible bg-white">
                <defs>
                  {/* Radial 3D Pawn Gradients for each Theme */}
                  <radialGradient id="volcano-red" cx="35%" cy="35%" r="65%">
                    <stop offset="0%" stopColor="#FFA0A0" />
                    <stop offset="45%" stopColor="#FF3B30" />
                    <stop offset="100%" stopColor="#7A0B05" />
                  </radialGradient>
                  <radialGradient id="volcano-green" cx="35%" cy="35%" r="65%">
                    <stop offset="0%" stopColor="#85FFA8" />
                    <stop offset="45%" stopColor="#30D158" />
                    <stop offset="100%" stopColor="#0B5C20" />
                  </radialGradient>
                  <radialGradient id="volcano-yellow" cx="35%" cy="35%" r="65%">
                    <stop offset="0%" stopColor="#FFF4A0" />
                    <stop offset="45%" stopColor="#FFD60A" />
                    <stop offset="100%" stopColor="#7A6000" />
                  </radialGradient>
                  <radialGradient id="volcano-blue" cx="35%" cy="35%" r="65%">
                    <stop offset="0%" stopColor="#AEE9FF" />
                    <stop offset="45%" stopColor="#64D2FF" />
                    <stop offset="100%" stopColor="#0B4B6E" />
                  </radialGradient>
                </defs>

                {/* Board Background */}
                <rect x="0" y="0" width="600" height="600" fill="#FFFFFF" />

                {/* 1. Four Bases */}
                {/* Red Base (Top-Left) */}
                <rect x="0" y="0" width="240" height="240" fill={theme.pawnSkins.red.accent} stroke="#000000" strokeWidth="2" />
                <rect x="40" y="40" width="160" height="160" fill="#FFFFFF" stroke="#000000" strokeWidth="2" />
                {BASE_NESTS.red.map((nest, i) => (
                  <circle key={`red_nest_${i}`} cx={nest.x} cy={nest.y} r="20" fill={theme.pawnSkins.red.accent} stroke="#000000" strokeWidth="2" />
                ))}

                {/* Green Base (Top-Right) */}
                <rect x="360" y="0" width="240" height="240" fill={theme.pawnSkins.green.accent} stroke="#000000" strokeWidth="2" />
                <rect x="400" y="40" width="160" height="160" fill="#FFFFFF" stroke="#000000" strokeWidth="2" />
                {BASE_NESTS.green.map((nest, i) => (
                  <circle key={`green_nest_${i}`} cx={nest.x} cy={nest.y} r="20" fill={theme.pawnSkins.green.accent} stroke="#000000" strokeWidth="2" />
                ))}

                {/* Blue Base (Bottom-Left) */}
                <rect x="0" y="360" width="240" height="240" fill={theme.pawnSkins.blue.accent} stroke="#000000" strokeWidth="2" />
                <rect x="40" y="400" width="160" height="160" fill="#FFFFFF" stroke="#000000" strokeWidth="2" />
                {BASE_NESTS.blue.map((nest, i) => (
                  <circle key={`blue_nest_${i}`} cx={nest.x} cy={nest.y} r="20" fill={theme.pawnSkins.blue.accent} stroke="#000000" strokeWidth="2" />
                ))}

                {/* Yellow Base (Bottom-Right) */}
                <rect x="360" y="360" width="240" height="240" fill={theme.pawnSkins.yellow.accent} stroke="#000000" strokeWidth="2" />
                <rect x="400" y="400" width="160" height="160" fill="#FFFFFF" stroke="#000000" strokeWidth="2" />
                {BASE_NESTS.yellow.map((nest, i) => (
                  <circle key={`yellow_nest_${i}`} cx={nest.x} cy={nest.y} r="20" fill={theme.pawnSkins.yellow.accent} stroke="#000000" strokeWidth="2" />
                ))}

                {/* 2. Track Cells with Relief Borders */}
                {TRACK_COORDS.map((coord, idx) => {
                  let cellBg = '#FFFFFF';
                  if (idx === 0) cellBg = theme.pawnSkins.red.accent;
                  else if (idx === 13) cellBg = theme.pawnSkins.green.accent;
                  else if (idx === 26) cellBg = theme.pawnSkins.yellow.accent;
                  else if (idx === 39) cellBg = theme.pawnSkins.blue.accent;

                  return (
                    <rect
                      key={`track_cell_${idx}`}
                      x={coord.x - CELL_SIZE / 2}
                      y={coord.y - CELL_SIZE / 2}
                      width={CELL_SIZE}
                      height={CELL_SIZE}
                      fill={cellBg}
                      stroke="#000000"
                      strokeWidth="1.5"
                    />
                  );
                })}

                {/* 3. Home Stretch Columns */}
                {Object.entries(HOME_STRETCH_COORDS).map(([color, coords]) => {
                  const skin = theme.pawnSkins[color as keyof typeof theme.pawnSkins] || theme.pawnSkins.red;
                  return (
                    <g key={`stretch_${color}`}>
                      {coords.map((coord, idx) => (
                        <rect
                          key={`stretch_${color}_${idx}`}
                          x={coord.x - CELL_SIZE / 2}
                          y={coord.y - CELL_SIZE / 2}
                          width={CELL_SIZE}
                          height={CELL_SIZE}
                          fill={skin.accent}
                          stroke="#000000"
                          strokeWidth="1.5"
                        />
                      ))}
                    </g>
                  );
                })}

                {/* 4. Central Goal Triangles */}
                <polygon points="240,240 300,300 240,360" fill={theme.pawnSkins.red.accent} stroke="#000000" strokeWidth="1.5" />
                <polygon points="240,240 360,240 300,300" fill={theme.pawnSkins.green.accent} stroke="#000000" strokeWidth="1.5" />
                <polygon points="360,240 360,360 300,300" fill={theme.pawnSkins.yellow.accent} stroke="#000000" strokeWidth="1.5" />
                <polygon points="240,360 360,360 300,300" fill={theme.pawnSkins.blue.accent} stroke="#000000" strokeWidth="1.5" />

                {/* 5. 2D Pawns */}
                {renderedPawns.map(({ pawn, x, y, isMovable }) => {
                  const skin = theme.pawnSkins[pawn.color as keyof typeof theme.pawnSkins] || theme.pawnSkins.red;
                  return (
                    <g
                      key={`pawn_${pawn.color}_${pawn.id}`}
                      style={{
                        transform: `translate(${x}px, ${y}px)`,
                        transition: 'transform 0.55s cubic-bezier(0.34, 1.45, 0.64, 1)',
                      }}
                      className="cursor-pointer"
                      onClick={() => {
                        if (isMovable) {
                          playSoundFX.playHop();
                          sendGameAction('ludo_move_pawn', { pawnId: pawn.id });
                        }
                      }}
                    >
                      {/* Dynamic Shadow on Ground */}
                      <ellipse cx="0" cy="12" rx="15" ry="5.5" fill="#000000" opacity="0.6" />

                      {/* Pulsing Selection Aura if movable */}
                      {isMovable && (
                        <circle
                          cx="0"
                          cy="0"
                          r="22"
                          fill="none"
                          stroke="#FFD100"
                          strokeWidth="3.5"
                          strokeDasharray="5 3"
                          className="animate-spin"
                          style={{ animationDuration: '3s' }}
                        />
                      )}

                      {/* Glossy Pawn Body */}
                      <circle
                        cx="0"
                        cy="0"
                        r="15"
                        fill={skin.accent}
                        stroke="#FFFFFF"
                        strokeWidth="2.5"
                      />

                      {/* Specular Highlight */}
                      <circle cx="-4" cy="-5" r="4" fill="#FFFFFF" opacity="0.75" />

                      {/* Pawn Number */}
                      <text
                        x="0"
                        y="4"
                        textAnchor="middle"
                        fill="#FFFFFF"
                        fontSize="11"
                        fontWeight="900"
                        fontFamily="sans-serif"
                      >
                        {pawn.id + 1}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </>
        )}
      </div>

      {/* Right HUD: Rules & Victory Overlay */}
      <div className="w-[280px] flex flex-col justify-between h-[88vh] py-2 z-20">
        <div className="p-5 rounded-3xl bg-surface-card/85 border border-white/15 backdrop-blur-xl space-y-3">
          <div className="flex items-center space-x-2 text-xs font-black uppercase tracking-wider text-brand-cyan">
            <Shield className="w-4 h-4" />
            <span>RÈGLES OFFICIELLES</span>
          </div>
          <ul className="text-xs text-gray-300 space-y-2 leading-relaxed">
            <li className="flex items-start space-x-2">
              <span className="text-brand-gold font-bold">•</span>
              <span>Faites un <strong>6</strong> pour sortir un pion et rejouer.</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-brand-gold font-bold">•</span>
              <span>Parcourez les <strong>52 cases</strong> dans le sens horaire.</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-brand-gold font-bold">•</span>
              <span>Capturer un pion adverse vous donne un <strong>re-roll bonus</strong> !</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-brand-gold font-bold">•</span>
              <span>Rentrez vos <strong>4 pions</strong> au centre pour gagner !</span>
            </li>
          </ul>
        </div>

        {/* Victory Celebration Modal */}
        {gameState.winner && (
          <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-500 to-yellow-600 text-gray-900 shadow-2xl flex flex-col items-center text-center space-y-3 animate-scale-in">
            <Crown className="w-10 h-10 text-white animate-bounce" />
            <h3 className="text-2xl font-black font-display">VICTOIRE !</h3>
            <p className="text-xs font-bold uppercase tracking-wider">
              {gameState.winner.toUpperCase()} REMPORTE LA PARTIE !
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
