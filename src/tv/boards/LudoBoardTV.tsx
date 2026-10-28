import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '../../context/GameContext';
import { LudoGameState, LudoPawn } from '../../types/game';
import { Clock, Trophy, Sparkles, Shield, Crown, Box, Layers, Palette, X } from 'lucide-react';
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
  const [showRulesModal, setShowRulesModal] = useState<boolean>(false);

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

    if (gameState.diceValue !== null && !gameState.canRollDice) {
      setIsRollingAnimation(true);
      playSoundFX.playDiceRoll();
      playCamera.focusDice(300, 300);

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
    <div className={`relative w-full h-screen select-none overflow-hidden bg-gradient-to-br ${theme.bgGradient} transition-colors duration-1000`}>
      {/* ── 1. GRANDE ZONE DE JEU PLEIN ÉCRAN (3D ou 2D) ── */}
      {is3DMode ? (
        /* 3D Realistic Three.js Interactive Full-Screen Board */
        <div className="absolute inset-0 w-full h-full z-0">
          <LudoBoard3D
            gameState={gameState}
            currentTheme={currentTheme}
            isRollingAnimation={isRollingAnimation}
            animatedDiceVal={animatedDiceVal}
            onSelectPawn={(pawnId) => {
              sendGameAction('ludo_move_pawn', { pawnId });
            }}
          />
        </div>
      ) : (
        /* 2D Classic Vector Board Grand Format */
        <div className="absolute inset-0 w-full h-full flex items-center justify-center z-0 pt-8 pb-10">
          <canvas
            ref={particleCanvasRef}
            width={720}
            height={720}
            className="absolute inset-0 w-full h-full pointer-events-none z-30"
          />

          <div className="relative w-[680px] h-[680px] max-w-[85vw] max-h-[82vh] aspect-square rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.85)] border-[10px] border-[#181D2E] bg-white">
            <svg viewBox="0 0 600 600" className="w-full h-full rounded-2xl overflow-visible bg-white">
              <defs>
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

              <rect x="0" y="0" width="600" height="600" fill="#FFFFFF" />

              {/* Red Base */}
              <rect x="0" y="0" width="240" height="240" fill={theme.pawnSkins.red.accent} stroke="#000000" strokeWidth="2" />
              <rect x="40" y="40" width="160" height="160" fill="#FFFFFF" stroke="#000000" strokeWidth="2" />
              {BASE_NESTS.red.map((nest, i) => (
                <circle key={`red_nest_${i}`} cx={nest.x} cy={nest.y} r="20" fill={theme.pawnSkins.red.accent} stroke="#000000" strokeWidth="2" />
              ))}

              {/* Green Base */}
              <rect x="360" y="0" width="240" height="240" fill={theme.pawnSkins.green.accent} stroke="#000000" strokeWidth="2" />
              <rect x="400" y="40" width="160" height="160" fill="#FFFFFF" stroke="#000000" strokeWidth="2" />
              {BASE_NESTS.green.map((nest, i) => (
                <circle key={`green_nest_${i}`} cx={nest.x} cy={nest.y} r="20" fill={theme.pawnSkins.green.accent} stroke="#000000" strokeWidth="2" />
              ))}

              {/* Blue Base */}
              <rect x="0" y="360" width="240" height="240" fill={theme.pawnSkins.blue.accent} stroke="#000000" strokeWidth="2" />
              <rect x="40" y="400" width="160" height="160" fill="#FFFFFF" stroke="#000000" strokeWidth="2" />
              {BASE_NESTS.blue.map((nest, i) => (
                <circle key={`blue_nest_${i}`} cx={nest.x} cy={nest.y} r="20" fill={theme.pawnSkins.blue.accent} stroke="#000000" strokeWidth="2" />
              ))}

              {/* Yellow Base */}
              <rect x="360" y="360" width="240" height="240" fill={theme.pawnSkins.yellow.accent} stroke="#000000" strokeWidth="2" />
              <rect x="400" y="400" width="160" height="160" fill="#FFFFFF" stroke="#000000" strokeWidth="2" />
              {BASE_NESTS.yellow.map((nest, i) => (
                <circle key={`yellow_nest_${i}`} cx={nest.x} cy={nest.y} r="20" fill={theme.pawnSkins.yellow.accent} stroke="#000000" strokeWidth="2" />
              ))}

              {/* Track Cells */}
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

              {/* Home Stretch Columns */}
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

              {/* Central Goal Triangles */}
              <polygon points="240,240 300,300 240,360" fill={theme.pawnSkins.red.accent} stroke="#000000" strokeWidth="1.5" />
              <polygon points="240,240 360,240 300,300" fill={theme.pawnSkins.green.accent} stroke="#000000" strokeWidth="1.5" />
              <polygon points="360,240 360,360 300,300" fill={theme.pawnSkins.yellow.accent} stroke="#000000" strokeWidth="1.5" />
              <polygon points="240,360 360,360 300,300" fill={theme.pawnSkins.blue.accent} stroke="#000000" strokeWidth="1.5" />

              {/* 2D Pawns */}
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
                    <ellipse cx="0" cy="12" rx="15" ry="5.5" fill="#000000" opacity="0.6" />
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
                    <circle cx="0" cy="0" r="15" fill={skin.accent} stroke="#FFFFFF" strokeWidth="2.5" />
                    <circle cx="-4" cy="-5" r="4" fill="#FFFFFF" opacity="0.75" />
                    <text x="0" y="4" textAnchor="middle" fill="#FFFFFF" fontSize="11" fontWeight="900" fontFamily="sans-serif">
                      {pawn.id + 1}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      )}

      {/* ── 2. BARRE SUPÉRIEURE FLOTTANTE MODERNE (GLASSMORPHISM CONSOLE) ── */}
      <header className="fixed top-3 left-4 right-4 z-30 flex items-center justify-between pointer-events-none gap-3">
        {/* Left: Active Player Banner + Turn Countdown */}
        <div className="pointer-events-auto flex items-center space-x-3 bg-black/70 backdrop-blur-xl border border-white/20 px-4 py-2.5 rounded-2xl shadow-2xl">
          <div className="relative">
            <div className={`w-11 h-11 rounded-xl bg-gradient-to-tr from-white/20 to-white/5 border-2 border-white flex items-center justify-center font-black text-white text-base shadow-md ${activeSkin.glow}`}>
              {activePlayer?.name?.charAt(0) || activeColor.charAt(0).toUpperCase()}
            </div>
            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-black animate-pulse" />
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                TOUR DE :
              </span>
              <span className="text-xs font-mono font-bold text-amber-300 flex items-center space-x-1">
                <Clock className="w-3 h-3 inline text-amber-400" />
                <span>{gameState.turnTimeLeft}s</span>
              </span>
            </div>
            <h2 className="text-sm sm:text-base font-black text-white truncate max-w-[140px] sm:max-w-[200px]">
              {activePlayer?.name || `Joueur ${activeColor.toUpperCase()}`}
            </h2>
          </div>
        </div>

        {/* Center: Live Action Ticker & Dice Preview */}
        <div className="pointer-events-auto hidden md:flex items-center space-x-3 bg-black/70 backdrop-blur-xl border border-white/20 px-4 py-2 rounded-2xl shadow-2xl max-w-md">
          {/* 3D Dice Showcase */}
          <div className="relative shrink-0">
            <div className={`w-10 h-10 rounded-xl bg-white text-neutral-950 font-display font-black text-2xl flex items-center justify-center border-2 border-amber-300 shadow-lg ${
              isRollingAnimation ? 'animate-spin-slow' : ''
            }`}>
              {animatedDiceVal !== null ? animatedDiceVal : (gameState.diceValue !== null ? gameState.diceValue : '?')}
            </div>
            {(animatedDiceVal === 6 || gameState.diceValue === 6) && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-amber-400 text-neutral-950 text-[10px] font-black flex items-center justify-center shadow-md animate-bounce">
                ★
              </span>
            )}
          </div>

          <div className="truncate text-xs">
            <span className="text-[10px] font-black uppercase text-amber-400 block mb-0.5">
              ACTION EN COURS
            </span>
            <p className="text-slate-200 font-medium truncate">
              {gameState.lastActionLog || 'À vos marques !'}
            </p>
          </div>
        </div>

        {/* Right: Controls Capsule (3D/2D Toggle, Theme, Rules) */}
        <div className="pointer-events-auto flex items-center space-x-2 bg-black/70 backdrop-blur-xl border border-white/20 p-1.5 px-2.5 rounded-2xl shadow-2xl">
          {/* Mode 3D / 2D Button */}
          <button
            onClick={handleToggle3D}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-black transition-all shadow-md active:scale-95 cursor-pointer ${
              is3DMode
                ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-neutral-950 border-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.5)] font-black scale-102'
                : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
            }`}
            title="Basculer entre l'interface 3D et 2D"
          >
            {is3DMode ? <Box className="w-4 h-4" /> : <Layers className="w-4 h-4" />}
            <span>{is3DMode ? '3D' : '2D'}</span>
          </button>

          {/* Theme Cycler */}
          <button
            onClick={() => {
              const themeKeys: GameThemeId[] = ['volcano', 'ice', 'galaxy', 'jungle_congo', 'desert', 'classic_royal'];
              const nextIdx = (themeKeys.indexOf(currentTheme) + 1) % themeKeys.length;
              setCurrentTheme(themeKeys[nextIdx]);
              playSoundFX.playHop();
            }}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-amber-300 transition-all cursor-pointer"
            title="Changer de thème"
          >
            <span>{theme.emoji}</span>
            <span className="hidden sm:inline text-[11px]">{theme.name}</span>
          </button>

          {/* Rules Button */}
          <button
            onClick={() => setShowRulesModal(!showRulesModal)}
            className="p-1.5 rounded-xl hover:bg-white/20 text-slate-300 hover:text-white transition-all cursor-pointer border border-transparent hover:border-white/20"
            title="Afficher les règles"
          >
            <Shield className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ── 3. PODIUMS JOUEURS FLOTTANTS EN BAS (MINI-CHIPS) ── */}
      <footer className="fixed bottom-3 left-4 right-4 z-20 pointer-events-none flex items-center justify-between gap-2 overflow-x-auto pb-1">
        <div className="pointer-events-auto flex items-center space-x-2 bg-black/75 backdrop-blur-xl border border-white/15 p-2 rounded-2xl shadow-2xl mx-auto">
          {gameState.players.map((col) => {
            const skin = theme.pawnSkins[col] || theme.pawnSkins.red;
            const pawns = gameState.pawns[col] || [];
            const finishedCount = pawns.filter((p) => p.isFinished).length;
            const isCurrent = col === activeColor;
            const pl = room?.players.find((p) => p.color === col);

            return (
              <div
                key={col}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border transition-all ${
                  isCurrent
                    ? 'bg-white/15 border-amber-400 text-white shadow-[0_0_15px_rgba(245,158,11,0.35)] scale-105'
                    : 'bg-black/40 border-white/10 text-slate-400'
                }`}
              >
                <div
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: skin.accent }}
                />
                <span className="text-xs font-black truncate max-w-[90px]">
                  {pl?.name || skin.name}
                </span>

                <div className="flex items-center space-x-1 pl-1">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-2.5 h-2.5 rounded-full border ${
                        i < finishedCount
                          ? 'bg-amber-400 border-white shadow-md'
                          : 'bg-white/10 border-white/20'
                      }`}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </footer>

      {/* ── 4. TIROIR MODAL DES RÈGLES OFFICIELLES (À LA DEMANDE) ── */}
      {showRulesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md p-6 rounded-3xl bg-neutral-900 border-2 border-white/20 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center space-x-2 text-amber-400 font-display font-black text-lg">
                <Shield className="w-5 h-5" />
                <span>RÈGLES DU LUDO</span>
              </div>
              <button
                onClick={() => setShowRulesModal(false)}
                className="w-8 h-8 rounded-full hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <ul className="text-sm text-slate-200 space-y-3 leading-relaxed">
              <li className="flex items-start space-x-2.5">
                <span className="text-amber-400 font-black">•</span>
                <span>Faites un <strong>6</strong> au dé pour sortir un pion de votre base et rejouer immédiatement.</span>
              </li>
              <li className="flex items-start space-x-2.5">
                <span className="text-amber-400 font-black">•</span>
                <span>Parcourez les <strong>52 cases</strong> dans le sens des aiguilles d'une montre.</span>
              </li>
              <li className="flex items-start space-x-2.5">
                <span className="text-amber-400 font-black">•</span>
                <span>Atterrissez sur un pion adverse pour le <strong>capturer</strong> et l'envoyer à sa base (+1 lancer bonus !).</span>
              </li>
              <li className="flex items-start space-x-2.5">
                <span className="text-amber-400 font-black">•</span>
                <span>Rentrez vos <strong>4 pions</strong> au centre du plateau pour remporter la partie !</span>
              </li>
            </ul>

            <button
              onClick={() => setShowRulesModal(false)}
              className="w-full py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-display font-black text-sm uppercase tracking-wider transition-all shadow-lg cursor-pointer"
            >
              Compris !
            </button>
          </div>
        </div>
      )}

      {/* ── 5. MODALE DE VICTOIRE MONUMENTALE ── */}
      {gameState.winner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="p-8 rounded-3xl bg-gradient-to-br from-amber-500 via-amber-400 to-yellow-600 text-neutral-950 shadow-2xl flex flex-col items-center text-center space-y-4 max-w-md border-4 border-white animate-scale-in">
            <Crown className="w-16 h-16 text-neutral-950 animate-bounce" />
            <h3 className="text-4xl font-black font-display tracking-tight">VICTOIRE !</h3>
            <p className="text-base font-black uppercase tracking-wider">
              {gameState.winner.toUpperCase()} REMPORTE LA PARTIE !
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
