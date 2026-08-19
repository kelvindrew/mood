import React from 'react';
import { useGame } from '../../context/GameContext';
import { LudoGameState, LudoPawn } from '../../types/game';
import { Clock, Trophy, Sparkles, Shield, Award, Users, Play, Crown } from 'lucide-react';

const COLOR_CONFIG: Record<string, { bg: string; border: string; glow: string; text: string; name: string; fill: string; accent: string }> = {
  red: { bg: 'bg-red-600', border: 'border-red-500', glow: 'shadow-glow-red', text: 'text-red-400', name: 'Rouge', fill: 'url(#red-pawn-gradient)', accent: '#EF4444' },
  blue: { bg: 'bg-blue-600', border: 'border-blue-500', glow: 'shadow-glow-blue', text: 'text-blue-400', name: 'Bleu', fill: 'url(#blue-pawn-gradient)', accent: '#3B82F6' },
  green: { bg: 'bg-emerald-600', border: 'border-emerald-500', glow: 'shadow-glow-emerald', text: 'text-emerald-400', name: 'Vert', fill: 'url(#green-pawn-gradient)', accent: '#10B981' },
  yellow: { bg: 'bg-amber-500', border: 'border-amber-500', glow: 'shadow-glow-gold', text: 'text-amber-400', name: 'Jaune', fill: 'url(#yellow-pawn-gradient)', accent: '#F59E0B' },
};

// 15x15 Grid cell coordinates (0-14, 0-14) mapped to SVG 600x600 coordinate system (cell size = 40px)
const CELL_SIZE = 40;

function cellToPx(col: number, row: number): { x: number; y: number } {
  return {
    x: col * CELL_SIZE + CELL_SIZE / 2,
    y: row * CELL_SIZE + CELL_SIZE / 2,
  };
}

// 52 Main Circuit Track Coordinates (Clockwise standard Ludo board layout)
const TRACK_COORDS: { x: number; y: number }[] = [
  // Red side (Bottom to left)
  cellToPx(6, 13), // 0: Red Start ★
  cellToPx(6, 12), // 1
  cellToPx(6, 11), // 2
  cellToPx(6, 10), // 3
  cellToPx(6, 9),  // 4
  cellToPx(5, 8),  // 5
  cellToPx(4, 8),  // 6
  cellToPx(3, 8),  // 7
  cellToPx(2, 8),  // 8 ★
  cellToPx(1, 8),  // 9
  cellToPx(0, 8),  // 10
  cellToPx(0, 7),  // 11
  cellToPx(0, 6),  // 12

  // Blue side (Left to top)
  cellToPx(1, 6),  // 13: Blue Start ★
  cellToPx(2, 6),  // 14
  cellToPx(3, 6),  // 15
  cellToPx(4, 6),  // 16
  cellToPx(5, 6),  // 17
  cellToPx(6, 5),  // 18
  cellToPx(6, 4),  // 19
  cellToPx(6, 3),  // 20
  cellToPx(6, 2),  // 21 ★
  cellToPx(6, 1),  // 22
  cellToPx(6, 0),  // 23
  cellToPx(7, 0),  // 24
  cellToPx(8, 0),  // 25

  // Green side (Top to right)
  cellToPx(8, 1),  // 26: Green Start ★
  cellToPx(8, 2),  // 27
  cellToPx(8, 3),  // 28
  cellToPx(8, 4),  // 29
  cellToPx(8, 5),  // 30
  cellToPx(9, 6),  // 31
  cellToPx(10, 6), // 32
  cellToPx(11, 6), // 33
  cellToPx(12, 6), // 34 ★
  cellToPx(13, 6), // 35
  cellToPx(14, 6), // 36
  cellToPx(14, 7), // 37
  cellToPx(14, 8), // 38

  // Yellow side (Right to bottom)
  cellToPx(13, 8), // 39: Yellow Start ★
  cellToPx(12, 8), // 40
  cellToPx(11, 8), // 41
  cellToPx(10, 8), // 42
  cellToPx(9, 8),  // 43
  cellToPx(8, 9),  // 44
  cellToPx(8, 10), // 45
  cellToPx(8, 11), // 46
  cellToPx(8, 12), // 47 ★
  cellToPx(8, 13), // 48
  cellToPx(8, 14), // 49
  cellToPx(7, 14), // 50
  cellToPx(6, 14), // 51
];

// Final Stretch Coordinates (5 steps towards center for each color)
const HOME_STRETCH_COORDS: Record<string, { x: number; y: number }[]> = {
  red: [cellToPx(7, 13), cellToPx(7, 12), cellToPx(7, 11), cellToPx(7, 10), cellToPx(7, 9)],
  blue: [cellToPx(1, 7), cellToPx(2, 7), cellToPx(3, 7), cellToPx(4, 7), cellToPx(5, 7)],
  green: [cellToPx(7, 1), cellToPx(7, 2), cellToPx(7, 3), cellToPx(7, 4), cellToPx(7, 5)],
  yellow: [cellToPx(13, 7), cellToPx(12, 7), cellToPx(11, 7), cellToPx(10, 7), cellToPx(9, 7)],
};

// Base Nest Coordinates for the 4 starting bases
const BASE_NESTS: Record<string, { x: number; y: number }[]> = {
  red: [cellToPx(1.8, 10.8), cellToPx(3.8, 10.8), cellToPx(1.8, 12.8), cellToPx(3.8, 12.8)],
  blue: [cellToPx(1.8, 1.8), cellToPx(3.8, 1.8), cellToPx(1.8, 3.8), cellToPx(3.8, 3.8)],
  green: [cellToPx(10.8, 1.8), cellToPx(12.8, 1.8), cellToPx(10.8, 3.8), cellToPx(12.8, 3.8)],
  yellow: [cellToPx(10.8, 10.8), cellToPx(12.8, 10.8), cellToPx(10.8, 12.8), cellToPx(12.8, 12.8)],
};

// Center Goal coordinates
const CENTER_COORDS: Record<string, { x: number; y: number }> = {
  red: { x: 300, y: 340 },
  blue: { x: 260, y: 300 },
  green: { x: 300, y: 260 },
  yellow: { x: 340, y: 300 },
};

const SAFE_STAR_INDICES = [0, 8, 13, 21, 26, 34, 39, 47];

export const LudoBoardTV: React.FC = () => {
  const { room } = useGame();
  const gameState = room?.gameState as LudoGameState | undefined;

  if (!gameState) {
    return <div className="p-10 text-white">Chargement du plateau Ludo...</div>;
  }

  const activeColor = gameState.currentTurnColor;
  const activeCfg = COLOR_CONFIG[activeColor] || COLOR_CONFIG.red;

  // Compute exact pixel positions for all pawns
  const renderedPawns: { pawn: LudoPawn; x: number; y: number; isMovable: boolean }[] = [];
  const cellPawnCounters: Record<string, number> = {};

  Object.entries(gameState.pawns || {}).forEach(([color, pawns]) => {
    pawns.forEach((pawn) => {
      let x = 0;
      let y = 0;
      let cellKey = '';

      if (pawn.isFinished) {
        const c = CENTER_COORDS[color] || { x: 300, y: 300 };
        x = c.x;
        y = c.y;
        cellKey = `finished_${color}`;
      } else if (pawn.isHome) {
        const nests = BASE_NESTS[color] || BASE_NESTS.red;
        const nest = nests[pawn.id] || nests[0];
        x = nest.x;
        y = nest.y;
        cellKey = `home_${color}_${pawn.id}`;
      } else if (pawn.position >= 100) {
        const stretch = HOME_STRETCH_COORDS[color] || HOME_STRETCH_COORDS.red;
        const idx = Math.min(4, pawn.position - 100);
        const pt = stretch[idx] || stretch[0];
        x = pt.x;
        y = pt.y;
        cellKey = `stretch_${color}_${idx}`;
      } else {
        const pt = TRACK_COORDS[pawn.position] || TRACK_COORDS[0];
        x = pt.x;
        y = pt.y;
        cellKey = `track_${pawn.position}`;
      }

      const offsetIndex = cellPawnCounters[cellKey] || 0;
      cellPawnCounters[cellKey] = offsetIndex + 1;

      if (offsetIndex > 0 && !pawn.isHome) {
        x += (offsetIndex % 2 === 1 ? 7 : -7);
        y += (offsetIndex >= 2 ? 7 : -7);
      }

      const isMovable = color === activeColor && (gameState.movablePawns || []).includes(pawn.id);
      renderedPawns.push({ pawn, x, y, isMovable });
    });
  });

  return (
    <div className="w-full min-h-screen flex items-center justify-between px-8 py-2 select-none">
      {/* Left Sidebar: Active Player & 3D Dice Display */}
      <div className="w-72 flex flex-col space-y-3.5">
        {/* Active Player Card */}
        <div className={`p-5 rounded-3xl bg-surface-card border-2 ${activeCfg.border} ${activeCfg.glow} shadow-2xl backdrop-blur-xl transition-all`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-brand-gold">TOUR DU JOUEUR</span>
            <div className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-surface-light border border-white/10">
              <Clock className="w-3 h-3 text-brand-gold" />
              <span className="font-mono font-bold text-xs text-white">{gameState.turnTimeLeft}s</span>
            </div>
          </div>

          <div className="flex items-center space-x-3.5 my-3">
            <div className={`w-12 h-12 rounded-2xl ${activeCfg.bg} flex items-center justify-center text-white font-bold text-lg shadow-lg border-2 border-white/40 animate-pulse`}>
              {activeCfg.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-xl font-black font-display text-white capitalize">{activeCfg.name}</h2>
              <span className={`text-xs font-bold ${activeCfg.text}`}>
                {gameState.canRollDice ? 'En attente du lancer...' : 'Déplacement du pion...'}
              </span>
            </div>
          </div>

          {/* 3D Dice Box */}
          <div className="p-3 rounded-2xl bg-surface-dark border border-white/10 flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400">Résultat du dé :</span>
            <div className={`w-12 h-12 rounded-2xl bg-white text-gray-900 font-display font-black text-2xl flex items-center justify-center shadow-2xl border-4 border-brand-gold ${gameState.diceValue ? 'animate-bounce' : 'opacity-40'}`}>
              {gameState.diceValue ? gameState.diceValue : '-'}
            </div>
          </div>
        </div>

        {/* Players Standings */}
        <div className="p-4 rounded-3xl bg-surface-card/85 border border-white/10 backdrop-blur-md space-y-2.5">
          <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-gray-300">
            <span>PIONS AU CENTRE</span>
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

      {/* Center: Enormous Vector SVG Ludo Board (720px) */}
      <div className="relative w-[720px] h-[720px] max-w-[55vw] max-h-[86vh] aspect-square rounded-3xl overflow-hidden bg-[#0A0D14] border-4 border-[#242A38] shadow-2xl p-2 flex items-center justify-center">
        <svg
          viewBox="0 0 600 600"
          className="w-full h-full rounded-2xl overflow-visible"
        >
          <defs>
            {/* 3D Pawn Radial Gradients */}
            <radialGradient id="red-pawn-gradient" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#FCA5A5" />
              <stop offset="40%" stopColor="#EF4444" />
              <stop offset="100%" stopColor="#991B1B" />
            </radialGradient>

            <radialGradient id="blue-pawn-gradient" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#93C5FD" />
              <stop offset="40%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#1E3A8A" />
            </radialGradient>

            <radialGradient id="green-pawn-gradient" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#6EE7B7" />
              <stop offset="40%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#064E3B" />
            </radialGradient>

            <radialGradient id="yellow-pawn-gradient" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#FDE68A" />
              <stop offset="40%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#78350F" />
            </radialGradient>

            {/* Drop Shadow Filters */}
            <filter id="pawn-shadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="6" stdDeviation="4" floodColor="#000000" floodOpacity="0.8" />
            </filter>

            <filter id="star-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#FBBF24" floodOpacity="0.9" />
            </filter>
          </defs>

          {/* Board Outer Wooden Frame */}
          <rect x="0" y="0" width="600" height="600" fill="#141824" rx="16" />

          {/* 1. Four Bases */}
          {/* Blue Base (Top-Left) */}
          <rect x="0" y="0" width="240" height="240" fill="#1E3A8A" stroke="#3B82F6" strokeWidth="2" rx="12" />
          <rect x="30" y="30" width="180" height="180" fill="#0F172A" rx="20" stroke="#60A5FA" strokeWidth="2" />
          {BASE_NESTS.blue.map((nest, i) => (
            <circle key={`blue_nest_${i}`} cx={nest.x} cy={nest.y} r="22" fill="#1E293B" stroke="#3B82F6" strokeWidth="3" />
          ))}

          {/* Green Base (Top-Right) */}
          <rect x="360" y="0" width="240" height="240" fill="#064E3B" stroke="#10B981" strokeWidth="2" rx="12" />
          <rect x="390" y="30" width="180" height="180" fill="#0F172A" rx="20" stroke="#34D399" strokeWidth="2" />
          {BASE_NESTS.green.map((nest, i) => (
            <circle key={`green_nest_${i}`} cx={nest.x} cy={nest.y} r="22" fill="#1E293B" stroke="#10B981" strokeWidth="3" />
          ))}

          {/* Red Base (Bottom-Left) */}
          <rect x="0" y="360" width="240" height="240" fill="#7F1D1D" stroke="#EF4444" strokeWidth="2" rx="12" />
          <rect x="30" y="390" width="180" height="180" fill="#0F172A" rx="20" stroke="#F87171" strokeWidth="2" />
          {BASE_NESTS.red.map((nest, i) => (
            <circle key={`red_nest_${i}`} cx={nest.x} cy={nest.y} r="22" fill="#1E293B" stroke="#EF4444" strokeWidth="3" />
          ))}

          {/* Yellow Base (Bottom-Right) */}
          <rect x="360" y="360" width="240" height="240" fill="#78350F" stroke="#F59E0B" strokeWidth="2" rx="12" />
          <rect x="390" y="390" width="180" height="180" fill="#0F172A" rx="20" stroke="#FBBF24" strokeWidth="2" />
          {BASE_NESTS.yellow.map((nest, i) => (
            <circle key={`yellow_nest_${i}`} cx={nest.x} cy={nest.y} r="22" fill="#1E293B" stroke="#F59E0B" strokeWidth="3" />
          ))}

          {/* 2. Track Cells */}
          {TRACK_COORDS.map((coord, idx) => {
            const isSafeStar = SAFE_STAR_INDICES.includes(idx);
            let cellBg = '#1E293B';
            let strokeColor = '#334155';

            if (idx === 0) { cellBg = '#EF4444'; strokeColor = '#F87171'; } // Red Start
            else if (idx === 13) { cellBg = '#3B82F6'; strokeColor = '#60A5FA'; } // Blue Start
            else if (idx === 26) { cellBg = '#10B981'; strokeColor = '#34D399'; } // Green Start
            else if (idx === 39) { cellBg = '#F59E0B'; strokeColor = '#FCD34D'; } // Yellow Start

            return (
              <g key={`track_cell_${idx}`}>
                <rect
                  x={coord.x - CELL_SIZE / 2 + 1}
                  y={coord.y - CELL_SIZE / 2 + 1}
                  width={CELL_SIZE - 2}
                  height={CELL_SIZE - 2}
                  fill={cellBg}
                  stroke={strokeColor}
                  strokeWidth="1.5"
                  rx="6"
                />
                {isSafeStar && (
                  <text
                    x={coord.x}
                    y={coord.y + 6}
                    textAnchor="middle"
                    fill="#FBBF24"
                    fontSize="18"
                    fontWeight="bold"
                    filter="url(#star-glow)"
                  >
                    ★
                  </text>
                )}
              </g>
            );
          })}

          {/* 3. Home Stretch Columns */}
          {Object.entries(HOME_STRETCH_COORDS).map(([color, coords]) => (
            <g key={`stretch_${color}`}>
              {coords.map((coord, idx) => {
                const fillMap: Record<string, string> = {
                  red: '#DC2626',
                  blue: '#2563EB',
                  green: '#059669',
                  yellow: '#D97706',
                };
                return (
                  <rect
                    key={`stretch_${color}_${idx}`}
                    x={coord.x - CELL_SIZE / 2 + 1}
                    y={coord.y - CELL_SIZE / 2 + 1}
                    width={CELL_SIZE - 2}
                    height={CELL_SIZE - 2}
                    fill={fillMap[color]}
                    stroke="#FFFFFF"
                    strokeWidth="1"
                    rx="6"
                  />
                );
              })}
            </g>
          ))}

          {/* 4. Central Goal Triangles */}
          <polygon points="240,240 300,300 240,360" fill="#EF4444" stroke="#DC2626" strokeWidth="2" />
          <polygon points="240,240 360,240 300,300" fill="#3B82F6" stroke="#2563EB" strokeWidth="2" />
          <polygon points="360,240 360,360 300,300" fill="#10B981" stroke="#059669" strokeWidth="2" />
          <polygon points="240,360 360,360 300,300" fill="#F59E0B" stroke="#D97706" strokeWidth="2" />

          {/* Center Crown Emblem */}
          <circle cx="300" cy="300" r="18" fill="#111827" stroke="#FBBF24" strokeWidth="2.5" />
          <circle cx="300" cy="300" r="7" fill="#FBBF24" />

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
              >
                {/* Pawn Shadow on ground */}
                <ellipse cx="0" cy="10" rx="14" ry="5" fill="#000000" opacity="0.4" />

                {/* Pulsing selection aura if movable */}
                {isMovable && (
                  <circle
                    cx="0"
                    cy="0"
                    r="22"
                    fill="none"
                    stroke="#FBBF24"
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
                  strokeWidth="2.5"
                />

                {/* Inner Highlight Reflection */}
                <circle
                  cx="-4"
                  cy="-4"
                  r="5"
                  fill="#FFFFFF"
                  opacity="0.55"
                />

                {/* Pawn Number */}
                <text
                  x="0"
                  y="4.5"
                  textAnchor="middle"
                  fill="#FFFFFF"
                  fontSize="12"
                  fontWeight="900"
                >
                  {pawn.id + 1}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Right Column: Game Rules & Highlights */}
      <div className="w-72 flex flex-col space-y-3.5">
        <div className="p-4 rounded-3xl bg-surface-card/90 border border-white/10 backdrop-blur-xl shadow-2xl space-y-3">
          <div className="flex items-center space-x-2 text-xs font-black uppercase tracking-wider text-brand-cyan">
            <Shield className="w-4 h-4 text-brand-gold" />
            <span>RÈGLES DE JEU</span>
          </div>

          <div className="space-y-2.5 text-xs text-gray-300 leading-relaxed">
            <div className="flex items-start space-x-2">
              <span className="text-brand-gold font-bold text-sm">★</span>
              <span><strong>Cases Étoiles</strong> : Pions invulnérables et protégés.</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-rose-400 font-bold text-sm">⚔</span>
              <span><strong>Captures</strong> : Renvoie le pion adverse à sa base.</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-emerald-400 font-bold text-sm">✦</span>
              <span><strong>Dé 6</strong> : Rejouez immédiatement et sortez un pion.</span>
            </div>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-surface-card/70 border border-white/10 text-xs text-gray-400 flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-brand-gold flex-shrink-0" />
          <span>Plateau HD pour une visibilité optimale sur grand écran.</span>
        </div>
      </div>
    </div>
  );
};
