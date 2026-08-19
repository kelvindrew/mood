import React from 'react';
import { useGame } from '../../context/GameContext';
import { LudoGameState, LudoPawn } from '../../types/game';
import { Clock, Trophy, Sparkles, Shield, Award, Users, Play, Crown } from 'lucide-react';

const COLOR_CONFIG: Record<string, { bg: string; border: string; glow: string; text: string; name: string; fill: string; accent: string }> = {
  red: { bg: 'bg-[#EA2B2B]', border: 'border-[#EA2B2B]', glow: 'shadow-[0_0_20px_rgba(234,43,43,0.5)]', text: 'text-red-400', name: 'Rouge', fill: 'url(#red-pawn-gradient)', accent: '#EA2B2B' },
  green: { bg: 'bg-[#00A859]', border: 'border-[#00A859]', glow: 'shadow-[0_0_20px_rgba(0,168,89,0.5)]', text: 'text-emerald-400', name: 'Vert', fill: 'url(#green-pawn-gradient)', accent: '#00A859' },
  yellow: { bg: 'bg-[#FFD100]', border: 'border-[#FFD100]', glow: 'shadow-[0_0_20px_rgba(255,209,0,0.5)]', text: 'text-amber-400', name: 'Jaune', fill: 'url(#yellow-pawn-gradient)', accent: '#FFD100' },
  blue: { bg: 'bg-[#00AEEF]', border: 'border-[#00AEEF]', glow: 'shadow-[0_0_20px_rgba(0,174,239,0.5)]', text: 'text-blue-400', name: 'Bleu', fill: 'url(#blue-pawn-gradient)', accent: '#00AEEF' },
};

// 15x15 Grid cell size in SVG (15 * 40 = 600px)
const CELL_SIZE = 40;

function cellToPx(col: number, row: number): { x: number; y: number } {
  return {
    x: col * CELL_SIZE + CELL_SIZE / 2,
    y: row * CELL_SIZE + CELL_SIZE / 2,
  };
}

// 52 Main Circuit Track Coordinates (Standard clockwise Ludo track matching authentic board)
const TRACK_COORDS: { x: number; y: number }[] = [
  // Red Arm: Top-Left going right then up (indices 0..12)
  cellToPx(1, 6),  // 0: Red Start ★
  cellToPx(2, 6),  // 1
  cellToPx(3, 6),  // 2
  cellToPx(4, 6),  // 3
  cellToPx(5, 6),  // 4
  cellToPx(6, 5),  // 5
  cellToPx(6, 4),  // 6
  cellToPx(6, 3),  // 7
  cellToPx(6, 2),  // 8 ★ Safe star
  cellToPx(6, 1),  // 9
  cellToPx(6, 0),  // 10
  cellToPx(7, 0),  // 11
  cellToPx(8, 0),  // 12

  // Green Arm: Top-Right going down then right (indices 13..25)
  cellToPx(8, 1),  // 13: Green Start ★
  cellToPx(8, 2),  // 14
  cellToPx(8, 3),  // 15
  cellToPx(8, 4),  // 16
  cellToPx(8, 5),  // 17
  cellToPx(9, 6),  // 18
  cellToPx(10, 6), // 19
  cellToPx(11, 6), // 20
  cellToPx(12, 6), // 21 ★ Safe star
  cellToPx(13, 6), // 22
  cellToPx(14, 6), // 23
  cellToPx(14, 7), // 24
  cellToPx(14, 8), // 25

  // Yellow Arm: Bottom-Right going left then down (indices 26..38)
  cellToPx(13, 8), // 26: Yellow Start ★
  cellToPx(12, 8), // 27
  cellToPx(11, 8), // 28
  cellToPx(10, 8), // 29
  cellToPx(9, 8),  // 30
  cellToPx(8, 9),  // 31
  cellToPx(8, 10), // 32
  cellToPx(8, 11), // 33
  cellToPx(8, 12), // 34 ★ Safe star
  cellToPx(8, 13), // 35
  cellToPx(8, 14), // 36
  cellToPx(7, 14), // 37
  cellToPx(6, 14), // 38

  // Blue Arm: Bottom-Left going up then left (indices 39..51)
  cellToPx(6, 13), // 39: Blue Start ★
  cellToPx(6, 12), // 40
  cellToPx(6, 11), // 41
  cellToPx(6, 10), // 42
  cellToPx(6, 9),  // 43
  cellToPx(5, 8),  // 44
  cellToPx(4, 8),  // 45
  cellToPx(3, 8),  // 46
  cellToPx(2, 8),  // 47 ★ Safe star
  cellToPx(1, 8),  // 48
  cellToPx(0, 8),  // 49
  cellToPx(0, 7),  // 50
  cellToPx(0, 6),  // 51
];

// Final Stretch Coordinates (5 colored cells leading straight into the center triangle)
const HOME_STRETCH_COORDS: Record<string, { x: number; y: number }[]> = {
  red: [cellToPx(1, 7), cellToPx(2, 7), cellToPx(3, 7), cellToPx(4, 7), cellToPx(5, 7)],
  green: [cellToPx(7, 1), cellToPx(7, 2), cellToPx(7, 3), cellToPx(7, 4), cellToPx(7, 5)],
  yellow: [cellToPx(13, 7), cellToPx(12, 7), cellToPx(11, 7), cellToPx(10, 7), cellToPx(9, 7)],
  blue: [cellToPx(7, 13), cellToPx(7, 12), cellToPx(7, 11), cellToPx(7, 10), cellToPx(7, 9)],
};

// Base Nest Coordinates for the 4 starting bases (Pixel-perfect centered in each 160x160 white base square)
const BASE_NESTS: Record<string, { x: number; y: number }[]> = {
  red: [
    { x: 80, y: 80 },
    { x: 160, y: 80 },
    { x: 80, y: 160 },
    { x: 160, y: 160 },
  ],
  green: [
    { x: 440, y: 80 },
    { x: 520, y: 80 },
    { x: 440, y: 160 },
    { x: 520, y: 160 },
  ],
  yellow: [
    { x: 440, y: 440 },
    { x: 520, y: 440 },
    { x: 440, y: 520 },
    { x: 520, y: 520 },
  ],
  blue: [
    { x: 80, y: 440 },
    { x: 160, y: 440 },
    { x: 80, y: 520 },
    { x: 160, y: 520 },
  ],
};

// Safe star indices
const SAFE_STAR_INDICES = [0, 8, 13, 21, 26, 34, 39, 47];

export const LudoBoardTV: React.FC = () => {
  const { room, sendGameAction } = useGame();
  const gameState = room?.gameState as LudoGameState | undefined;

  if (!gameState) {
    return <div className="p-10 text-white">Chargement du plateau de Ludo...</div>;
  }

  const activeColor = gameState.currentTurnColor || 'red';
  const activeConfig = COLOR_CONFIG[activeColor] || COLOR_CONFIG.red;
  const activePlayer = room?.players.find((p) => p.color === activeColor);

  // Position resolver for pawns
  const getPawnPixelPosition = (pawn: LudoPawn): { x: number; y: number } => {
    if (pawn.isFinished) {
      return { x: 300, y: 300 };
    }
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

  // Stack calculation for multiple pawns sharing the exact same cell
  const allPawns: LudoPawn[] = Object.values(gameState.pawns).flat();
  const cellOccupancy: Record<string, LudoPawn[]> = {};

  allPawns.forEach((pawn) => {
    if (!pawn.isHome && !pawn.isFinished) {
      const key = `${pawn.position}_${pawn.position >= 100 ? pawn.color : 'shared'}`;
      if (!cellOccupancy[key]) cellOccupancy[key] = [];
      cellOccupancy[key].push(pawn);
    }
  });

  const renderedPawns = allPawns.map((pawn) => {
    const basePos = getPawnPixelPosition(pawn);
    let finalX = basePos.x;
    let finalY = basePos.y;

    if (!pawn.isHome && !pawn.isFinished) {
      const key = `${pawn.position}_${pawn.position >= 100 ? pawn.color : 'shared'}`;
      const occupants = cellOccupancy[key] || [];
      if (occupants.length > 1) {
        const occIndex = occupants.findIndex((p) => p.color === pawn.color && p.id === pawn.id);
        const angle = (occIndex / occupants.length) * 2 * Math.PI;
        finalX += Math.cos(angle) * 9;
        finalY += Math.sin(angle) * 9;
      }
    }

    const isMovable = gameState.movablePawns.includes(pawn.id) && pawn.color === activeColor;

    return {
      pawn,
      x: finalX,
      y: finalY,
      isMovable,
    };
  });

  return (
    <div className="relative w-full h-full flex items-center justify-between px-10 py-3 select-none overflow-hidden">
      {/* Left Panel: Active Player HUD & Game Info */}
      <div className="w-[280px] flex flex-col justify-between h-[86vh] py-2 z-20">
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 rounded-full bg-gradient-to-r from-brand-red to-brand-accent text-white text-[10px] font-black uppercase tracking-wider shadow-glow-red">
              LUDO CLASSIQUE
            </span>
          </div>

          <h1 className="text-3xl font-black font-display text-white tracking-tight leading-none">
            TOUR DE :
          </h1>

          {/* Active Player Card */}
          <div
            className={`p-4 rounded-3xl border-2 transition-all ${activeConfig.bg}/25 ${activeConfig.border} ${activeConfig.glow} flex items-center space-x-4 bg-surface-card/90 backdrop-blur-md`}
          >
            <div className={`w-12 h-12 rounded-2xl ${activeConfig.bg} flex items-center justify-center font-black text-white text-lg shadow-lg border-2 border-white/40`}>
              {activePlayer?.name?.charAt(0) || activeConfig.name.charAt(0)}
            </div>
            <div className="flex-1 overflow-hidden">
              <span className={`text-xs font-black uppercase tracking-wider ${activeConfig.text}`}>
                JOUEUR {activeConfig.name.toUpperCase()}
              </span>
              <h2 className="text-lg font-black text-white truncate">
                {activePlayer?.name || `Joueur ${activeConfig.name}`}
              </h2>
            </div>
          </div>

          {/* Dice Result Display */}
          <div className="p-4 rounded-3xl bg-surface-card/80 border border-white/10 flex flex-col items-center justify-center space-y-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-gray-400">RÉSULTAT DU DÉ</span>
            <div className="w-16 h-16 rounded-2xl bg-white text-gray-900 font-display font-black text-4xl flex items-center justify-center shadow-2xl border-4 border-gray-200">
              {gameState.diceValue !== null ? gameState.diceValue : '?'}
            </div>
            <div className="flex items-center space-x-1.5 text-xs text-gray-400">
              <Clock className="w-3.5 h-3.5 text-brand-gold" />
              <span>Temps : <strong className="text-white font-mono">{gameState.turnTimeLeft}s</strong></span>
            </div>
          </div>
        </div>

        {/* Players Progress Summary */}
        <div className="p-3.5 rounded-3xl bg-surface-card/80 border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-gray-400">
            <span>AVANCEMENT</span>
            <Trophy className="w-4 h-4 text-brand-gold" />
          </div>

          <div className="space-y-1.5">
            {gameState.players.map((col) => {
              const cfg = COLOR_CONFIG[col] || COLOR_CONFIG.red;
              const pawns = gameState.pawns[col] || [];
              const finishedCount = pawns.filter((p) => p.isFinished).length;
              const isCurrent = col === activeColor;

              return (
                <div
                  key={col}
                  className={`flex items-center justify-between p-2.5 rounded-2xl border transition-all ${
                    isCurrent
                      ? `bg-surface-light border-2 ${cfg.border} ${cfg.glow} scale-105`
                      : 'bg-surface-dark/60 border-white/5 opacity-80'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <div className={`w-3.5 h-3.5 rounded-full ${cfg.bg} border-2 border-white shadow-md`} />
                    <span className="text-xs font-black text-white capitalize">{cfg.name}</span>
                  </div>

                  <div className="flex items-center space-x-1">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div
                        key={i}
                        className={`w-3 h-3 rounded-full border ${
                          i < finishedCount
                            ? `${cfg.bg} border-white shadow-glow-gold`
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

        {/* Live Game Log Box */}
        <div className="p-3 rounded-2xl bg-surface-card/70 border border-white/10 text-xs">
          <div className="flex items-center space-x-1.5 text-brand-gold font-bold mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span className="text-[11px] font-black uppercase">ÉVÉNEMENTS DU JEU</span>
          </div>
          <p className="text-gray-300 text-xs font-medium italic truncate">
            "{gameState.lastActionLog || 'La partie commence !'}"
          </p>
        </div>
      </div>

      {/* Center: Authentic Classic Ludo Board (600x600 SVG with crisp borders) */}
      <div className="relative w-[720px] h-[720px] max-w-[55vw] max-h-[86vh] aspect-square rounded-3xl overflow-hidden bg-[#0A0D14] border-4 border-[#242A38] shadow-2xl p-2 flex items-center justify-center">
        <svg
          viewBox="0 0 600 600"
          className="w-full h-full rounded-2xl overflow-visible bg-white"
        >
          <defs>
            {/* 3D Pawn Radial Gradients */}
            <radialGradient id="red-pawn-gradient" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#FFA0A0" />
              <stop offset="45%" stopColor="#EA2B2B" />
              <stop offset="100%" stopColor="#8A0C0C" />
            </radialGradient>

            <radialGradient id="green-pawn-gradient" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#85FFA8" />
              <stop offset="45%" stopColor="#00A859" />
              <stop offset="100%" stopColor="#004D28" />
            </radialGradient>

            <radialGradient id="yellow-pawn-gradient" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#FFF4A0" />
              <stop offset="45%" stopColor="#FFD100" />
              <stop offset="100%" stopColor="#8F7500" />
            </radialGradient>

            <radialGradient id="blue-pawn-gradient" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#9DE4FF" />
              <stop offset="45%" stopColor="#00AEEF" />
              <stop offset="100%" stopColor="#00587A" />
            </radialGradient>

            {/* Drop Shadow Filters */}
            <filter id="pawn-shadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="5" stdDeviation="3.5" floodColor="#000000" floodOpacity="0.75" />
            </filter>
          </defs>

          {/* White Base Board Grid Background */}
          <rect x="0" y="0" width="600" height="600" fill="#FFFFFF" />

          {/* 1. Four Bases */}
          {/* Red Base (Top-Left: 0..240, 0..240) */}
          <rect x="0" y="0" width="240" height="240" fill="#EA2B2B" stroke="#000000" strokeWidth="2" />
          <rect x="40" y="40" width="160" height="160" fill="#FFFFFF" stroke="#000000" strokeWidth="2" />
          {BASE_NESTS.red.map((nest, i) => (
            <circle key={`red_nest_${i}`} cx={nest.x} cy={nest.y} r="22" fill="#EA2B2B" stroke="#000000" strokeWidth="2" />
          ))}

          {/* Green Base (Top-Right: 360..600, 0..240) */}
          <rect x="360" y="0" width="240" height="240" fill="#00A859" stroke="#000000" strokeWidth="2" />
          <rect x="400" y="40" width="160" height="160" fill="#FFFFFF" stroke="#000000" strokeWidth="2" />
          {BASE_NESTS.green.map((nest, i) => (
            <circle key={`green_nest_${i}`} cx={nest.x} cy={nest.y} r="22" fill="#00A859" stroke="#000000" strokeWidth="2" />
          ))}

          {/* Blue Base (Bottom-Left: 0..240, 360..600) */}
          <rect x="0" y="360" width="240" height="240" fill="#00AEEF" stroke="#000000" strokeWidth="2" />
          <rect x="40" y="400" width="160" height="160" fill="#FFFFFF" stroke="#000000" strokeWidth="2" />
          {BASE_NESTS.blue.map((nest, i) => (
            <circle key={`blue_nest_${i}`} cx={nest.x} cy={nest.y} r="22" fill="#00AEEF" stroke="#000000" strokeWidth="2" />
          ))}

          {/* Yellow Base (Bottom-Right: 360..600, 360..600) */}
          <rect x="360" y="360" width="240" height="240" fill="#FFD100" stroke="#000000" strokeWidth="2" />
          <rect x="400" y="400" width="160" height="160" fill="#FFFFFF" stroke="#000000" strokeWidth="2" />
          {BASE_NESTS.yellow.map((nest, i) => (
            <circle key={`yellow_nest_${i}`} cx={nest.x} cy={nest.y} r="22" fill="#FFD100" stroke="#000000" strokeWidth="2" />
          ))}

          {/* 2. Track Grid Cells */}
          {TRACK_COORDS.map((coord, idx) => {
            let cellBg = '#FFFFFF';

            if (idx === 0) cellBg = '#EA2B2B'; // Red Start
            else if (idx === 13) cellBg = '#00A859'; // Green Start
            else if (idx === 26) cellBg = '#FFD100'; // Yellow Start
            else if (idx === 39) cellBg = '#00AEEF'; // Blue Start

            return (
              <g key={`track_cell_${idx}`}>
                <rect
                  x={coord.x - CELL_SIZE / 2}
                  y={coord.y - CELL_SIZE / 2}
                  width={CELL_SIZE}
                  height={CELL_SIZE}
                  fill={cellBg}
                  stroke="#000000"
                  strokeWidth="1.5"
                />
              </g>
            );
          })}

          {/* 3. Home Stretch Columns */}
          {Object.entries(HOME_STRETCH_COORDS).map(([color, coords]) => {
            const fillMap: Record<string, string> = {
              red: '#EA2B2B',
              green: '#00A859',
              yellow: '#FFD100',
              blue: '#00AEEF',
            };
            return (
              <g key={`stretch_${color}`}>
                {coords.map((coord, idx) => (
                  <rect
                    key={`stretch_${color}_${idx}`}
                    x={coord.x - CELL_SIZE / 2}
                    y={coord.y - CELL_SIZE / 2}
                    width={CELL_SIZE}
                    height={CELL_SIZE}
                    fill={fillMap[color]}
                    stroke="#000000"
                    strokeWidth="1.5"
                  />
                ))}
              </g>
            );
          })}

          {/* 4. Central Goal Triangles */}
          <polygon points="240,240 300,300 240,360" fill="#EA2B2B" stroke="#000000" strokeWidth="1.5" />
          <polygon points="240,240 360,240 300,300" fill="#00A859" stroke="#000000" strokeWidth="1.5" />
          <polygon points="360,240 360,360 300,300" fill="#FFD100" stroke="#000000" strokeWidth="1.5" />
          <polygon points="240,360 360,360 300,300" fill="#00AEEF" stroke="#000000" strokeWidth="1.5" />

          {/* 5. Render All 3D Glossy Pawns with Smooth Kinetic Hop Transitions */}
          {renderedPawns.map(({ pawn, x, y, isMovable }) => {
            const cfg = COLOR_CONFIG[pawn.color] || COLOR_CONFIG.red;
            return (
              <g
                key={`pawn_${pawn.color}_${pawn.id}`}
                style={{
                  transform: `translate(${x}px, ${y}px)`,
                  transition: 'transform 0.6s cubic-bezier(0.34, 1.45, 0.64, 1)',
                }}
                filter="url(#pawn-shadow)"
                className="cursor-pointer"
                onClick={() => {
                  if (isMovable) {
                    sendGameAction('ludo_move_pawn', { pawnId: pawn.id });
                  }
                }}
              >
                {/* Pawn Shadow on ground */}
                <ellipse cx="0" cy="10" rx="14" ry="5" fill="#000000" opacity="0.5" />

                {/* Pulsing selection aura if movable */}
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

                {/* 3D Glossy Pawn Body */}
                <circle
                  cx="0"
                  cy="0"
                  r="15"
                  fill={cfg.fill}
                  stroke="#FFFFFF"
                  strokeWidth="2"
                />

                {/* Pawn Specular Light Accent */}
                <circle cx="-4" cy="-5" r="4.5" fill="#FFFFFF" opacity="0.65" />

                {/* Pawn Identifier Number */}
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

      {/* Right Panel: Rules & Quick Status */}
      <div className="w-[280px] flex flex-col justify-between h-[86vh] py-2 z-20">
        <div className="p-5 rounded-3xl bg-surface-card/85 border border-white/10 backdrop-blur-xl space-y-3">
          <div className="flex items-center space-x-2 text-xs font-black uppercase tracking-wider text-brand-cyan">
            <Shield className="w-4 h-4" />
            <span>RÈGLES DU CIRCUIT</span>
          </div>
          <ul className="text-xs text-gray-300 space-y-2 leading-relaxed">
            <li className="flex items-start space-x-2">
              <span className="text-brand-gold font-bold">•</span>
              <span>Faites un <strong>6</strong> pour sortir un pion de votre base.</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-brand-gold font-bold">•</span>
              <span>Parcourez les <strong>52 cases</strong> du circuit dans le sens horaire.</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-brand-gold font-bold">•</span>
              <span>Atterrir sur un pion adverse le renvoie directement dans sa base !</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-brand-gold font-bold">•</span>
              <span>Le premier à rentrer ses <strong>4 pions</strong> au centre gagne !</span>
            </li>
          </ul>
        </div>

        {/* Grand Winner Overlay Card if Game Over */}
        {gameState.winner && (
          <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-500 to-yellow-600 text-gray-900 shadow-2xl flex flex-col items-center text-center space-y-3 animate-scale-in">
            <Crown className="w-10 h-10 text-white" />
            <h3 className="text-2xl font-black font-display">VICTOIRE !</h3>
            <p className="text-xs font-bold uppercase tracking-wider">
              {gameState.winner.toUpperCase()} A GAGNÉ LA PARTIE !
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
