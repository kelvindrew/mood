import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { LudoGameState, LudoPawn } from '../../types/game';
import { GameThemeId } from '../../engine/PlayThemes';
import { playSoundFX } from '../../engine/PlaySoundFX';
import { RotateCw, Sparkles, ZoomIn, ZoomOut, Compass, Eye, Trophy } from 'lucide-react';

interface LudoBoard3DProps {
  gameState: LudoGameState;
  currentTheme: GameThemeId;
  isRollingAnimation: boolean;
  animatedDiceVal: number | null;
  selectedPawnId?: number | null;
  onSelectPawn: (pawnId: number) => void;
  onRollDice?: () => void;
}

// 15x15 Grid - Cell size in 3D world units
const CELL_SIZE = 1.0;
const HALF_GRID = 7; // (15 - 1) / 2

// Helper: Convert (col, row) in [0..14] to 3D world (x, z)
function gridToWorld(col: number, row: number): { x: number; z: number } {
  return {
    x: (col - HALF_GRID) * CELL_SIZE,
    z: (row - HALF_GRID) * CELL_SIZE,
  };
}

// 52 Main Circuit Track Coordinates (Matching 2D exactly)
const TRACK_GRID: { col: number; row: number }[] = [
  // Red Arm (0..12)
  { col: 1, row: 6 }, { col: 2, row: 6 }, { col: 3, row: 6 }, { col: 4, row: 6 }, { col: 5, row: 6 },
  { col: 6, row: 5 }, { col: 6, row: 4 }, { col: 6, row: 3 }, { col: 6, row: 2 }, { col: 6, row: 1 }, { col: 6, row: 0 },
  { col: 7, row: 0 }, { col: 8, row: 0 },

  // Green Arm (13..25)
  { col: 8, row: 1 }, { col: 8, row: 2 }, { col: 8, row: 3 }, { col: 8, row: 4 }, { col: 8, row: 5 },
  { col: 9, row: 6 }, { col: 10, row: 6 }, { col: 11, row: 6 }, { col: 12, row: 6 }, { col: 13, row: 6 }, { col: 14, row: 6 },
  { col: 14, row: 7 }, { col: 14, row: 8 },

  // Yellow Arm (26..38)
  { col: 13, row: 8 }, { col: 12, row: 8 }, { col: 11, row: 8 }, { col: 10, row: 8 }, { col: 9, row: 8 },
  { col: 8, row: 9 }, { col: 8, row: 10 }, { col: 8, row: 11 }, { col: 8, row: 12 }, { col: 8, row: 13 }, { col: 8, row: 14 },
  { col: 7, row: 14 }, { col: 6, row: 14 },

  // Blue Arm (39..51)
  { col: 6, row: 13 }, { col: 6, row: 12 }, { col: 6, row: 11 }, { col: 6, row: 10 }, { col: 6, row: 9 },
  { col: 5, row: 8 }, { col: 4, row: 8 }, { col: 3, row: 8 }, { col: 2, row: 8 }, { col: 1, row: 8 }, { col: 0, row: 8 },
  { col: 0, row: 7 }, { col: 0, row: 6 },
];

const HOME_STRETCH_GRID: Record<string, { col: number; row: number }[]> = {
  red: [
    { col: 1, row: 7 }, { col: 2, row: 7 }, { col: 3, row: 7 }, { col: 4, row: 7 }, { col: 5, row: 7 },
  ],
  green: [
    { col: 7, row: 1 }, { col: 7, row: 2 }, { col: 7, row: 3 }, { col: 7, row: 4 }, { col: 7, row: 5 },
  ],
  yellow: [
    { col: 13, row: 7 }, { col: 12, row: 7 }, { col: 11, row: 7 }, { col: 10, row: 7 }, { col: 9, row: 7 },
  ],
  blue: [
    { col: 7, row: 13 }, { col: 7, row: 12 }, { col: 7, row: 11 }, { col: 7, row: 10 }, { col: 7, row: 9 },
  ],
};

const BASE_NESTS_GRID: Record<string, { col: number; row: number }[]> = {
  red: [{ col: 2, row: 2 }, { col: 4, row: 2 }, { col: 2, row: 4 }, { col: 4, row: 4 }],
  green: [{ col: 11, row: 2 }, { col: 13, row: 2 }, { col: 11, row: 4 }, { col: 13, row: 4 }],
  yellow: [{ col: 11, row: 11 }, { col: 13, row: 11 }, { col: 11, row: 13 }, { col: 13, row: 13 }],
  blue: [{ col: 2, row: 11 }, { col: 4, row: 11 }, { col: 2, row: 13 }, { col: 4, row: 13 }],
};

const SAFE_INDICES = [0, 8, 13, 21, 26, 34, 39, 47];

// Rich, jewel-toned palette with luminous metallic accents
const COLOR_HEX: Record<string, {
  main: number;
  light: number;
  dark: number;
  emissive: number;
  gold: number;
  str: string;
}> = {
  red: { main: 0xef233c, light: 0xff6b81, dark: 0x8d021f, emissive: 0x500110, gold: 0xf59e0b, str: '#ef233c' },
  green: { main: 0x10b981, light: 0x34d399, dark: 0x064e3b, emissive: 0x022c22, gold: 0xf59e0b, str: '#10b981' },
  yellow: { main: 0xf59e0b, light: 0xfcd34d, dark: 0xb45309, emissive: 0x78350f, gold: 0xffd700, str: '#f59e0b' },
  blue: { main: 0x2563eb, light: 0x60a5fa, dark: 0x1e3a8a, emissive: 0x0f172a, gold: 0xf59e0b, str: '#2563eb' },
};

// 24K Gold / Brass Metallic Presets
const GOLD_COLOR = 0xf5b041;
const GOLD_SPECULAR = 0xffe6aa;

// Create 5-pointed 2D star shape for 3D extrusion
function createStarShape(outerRadius: number, innerRadius: number, points = 5): THREE.Shape {
  const shape = new THREE.Shape();
  const step = Math.PI / points;
  let rot = (Math.PI / 2) * 3;

  shape.moveTo(Math.cos(rot) * outerRadius, Math.sin(rot) * outerRadius);
  for (let i = 0; i < points; i++) {
    rot += step;
    shape.lineTo(Math.cos(rot) * innerRadius, Math.sin(rot) * innerRadius);
    rot += step;
    shape.lineTo(Math.cos(rot) * outerRadius, Math.sin(rot) * outerRadius);
  }
  shape.closePath();
  return shape;
}

// Generate luxury dice faces with deep glossy insets and gold pips
function createDiceFaceTexture(value: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Smooth ivory / ceramic resin gradient
  const bgGrad = ctx.createRadialGradient(256, 256, 40, 256, 256, 360);
  bgGrad.addColorStop(0, '#ffffff');
  bgGrad.addColorStop(0.7, '#f8fafc');
  bgGrad.addColorStop(1, '#e2e8f0');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 512, 512);

  // Outer gold rim inlay
  ctx.lineWidth = 22;
  const rimGrad = ctx.createLinearGradient(0, 0, 512, 512);
  rimGrad.addColorStop(0, '#d97706');
  rimGrad.addColorStop(0.5, '#fbbf24');
  rimGrad.addColorStop(1, '#b45309');
  ctx.strokeStyle = rimGrad;
  ctx.strokeRect(14, 14, 484, 484);

  // Soft corner vignettes
  ctx.lineWidth = 6;
  ctx.strokeStyle = 'rgba(15, 23, 42, 0.08)';
  ctx.strokeRect(32, 32, 448, 448);

  // Draw royal pip
  const drawPip = (x: number, y: number, r = 44, isAce = false) => {
    ctx.save();
    if (isAce) {
      // Ace: Royal Ruby Seal with Gold Laurels
      const rubyGrad = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, 4, x, y, r * 1.2);
      rubyGrad.addColorStop(0, '#ff6b81');
      rubyGrad.addColorStop(0.5, '#ef233c');
      rubyGrad.addColorStop(1, '#8d021f');

      // Outer gold ring
      ctx.beginPath();
      ctx.arc(x, y, r * 1.25, 0, Math.PI * 2);
      ctx.fillStyle = '#f59e0b';
      ctx.fill();

      // Inner ruby gem
      ctx.beginPath();
      ctx.arc(x, y, r * 1.05, 0, Math.PI * 2);
      ctx.fillStyle = rubyGrad;
      ctx.fill();

      // Specular shine
      ctx.beginPath();
      ctx.arc(x - r * 0.35, y - r * 0.35, r * 0.4, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.fill();

      // Small star in center of Ace
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(x, y, r * 0.25, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Standard Onyx & Gold Pip
      ctx.beginPath();
      ctx.arc(x, y, r * 1.15, 0, Math.PI * 2);
      ctx.fillStyle = '#b45309';
      ctx.fill();

      // Deep recessed onyx core
      const onyxGrad = ctx.createRadialGradient(x - r * 0.25, y - r * 0.25, 2, x, y, r);
      onyxGrad.addColorStop(0, '#334155');
      onyxGrad.addColorStop(0.6, '#0f172a');
      onyxGrad.addColorStop(1, '#020617');

      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = onyxGrad;
      ctx.fill();

      // Soft white reflection
      ctx.beginPath();
      ctx.arc(x - r * 0.32, y - r * 0.32, r * 0.32, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
      ctx.fill();
    }
    ctx.restore();
  };

  const c = 256;
  const l = 136;
  const r = 376;

  if (value === 1) {
    drawPip(c, c, 68, true);
  } else if (value === 2) {
    drawPip(l, l);
    drawPip(r, r);
  } else if (value === 3) {
    drawPip(l, l);
    drawPip(c, c);
    drawPip(r, r);
  } else if (value === 4) {
    drawPip(l, l);
    drawPip(r, l);
    drawPip(l, r);
    drawPip(r, r);
  } else if (value === 5) {
    drawPip(l, l);
    drawPip(r, l);
    drawPip(c, c);
    drawPip(l, r);
    drawPip(r, r);
  } else if (value === 6) {
    drawPip(l, 116);
    drawPip(l, 256);
    drawPip(l, 396);
    drawPip(r, 116);
    drawPip(r, 256);
    drawPip(r, 396);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 8;
  return texture;
}

// Procedural Carrara marble / porcelain courtyard tile texture
function createMarbleCourtyardTexture(colorHex: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Smooth pure alabaster base
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, 512, 512);

  // Subtle translucent marble veining
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = 'rgba(203, 213, 225, 0.35)';
  for (let i = 0; i < 7; i++) {
    ctx.beginPath();
    ctx.moveTo(Math.random() * 512, 0);
    ctx.bezierCurveTo(
      Math.random() * 512, 170,
      Math.random() * 512, 340,
      Math.random() * 512, 512
    );
    ctx.stroke();
  }

  // Central Ornate Rosette / Team Watermark
  ctx.save();
  ctx.translate(256, 256);
  ctx.strokeStyle = colorHex;
  ctx.lineWidth = 4;
  ctx.globalAlpha = 0.28;

  // Concentric compass rings
  ctx.beginPath();
  ctx.arc(0, 0, 140, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(0, 0, 100, 0, Math.PI * 2);
  ctx.stroke();

  // 8-point compass star
  for (let i = 0; i < 8; i++) {
    ctx.rotate((Math.PI * 2) / 8);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -90);
    ctx.stroke();
  }
  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 4;
  return texture;
}

export const LudoBoard3D: React.FC<LudoBoard3DProps> = ({
  gameState,
  currentTheme,
  isRollingAnimation,
  animatedDiceVal,
  selectedPawnId,
  onSelectPawn,
  onRollDice,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [cameraPreset, setCameraPreset] = useState<'isometric' | 'top' | 'follow'>('isometric');

  const threeRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    pawnMeshes: Map<string, THREE.Group>;
    haloMeshes: Map<string, THREE.Group>;
    diceMesh: THREE.Mesh;
    diceGlowPad: THREE.Mesh;
    selectionBeaconMesh: THREE.Group;
    targetMarkerMesh: THREE.Group;
    targetDiceRot: THREE.Euler;
    targetCamPos: THREE.Vector3;
    targetCamLookAt: THREE.Vector3;
    camPos: THREE.Vector3;
    camLookAt: THREE.Vector3;
    raycaster: THREE.Raycaster;
    mouse: THREE.Vector2;
    animFrameId: number | null;
    isDragging: boolean;
    prevMousePos: { x: number; y: number };
    orbitAngle: { theta: number; phi: number; radius: number };
    activePointLight: THREE.PointLight;
    particlesGroup: THREE.Points;
    floatingTrophyGroup: THREE.Group;
  } | null>(null);

  const diceTextures = useMemo(() => [
    createDiceFaceTexture(1), // +X
    createDiceFaceTexture(6), // -X
    createDiceFaceTexture(2), // +Y
    createDiceFaceTexture(5), // -Y
    createDiceFaceTexture(3), // +Z
    createDiceFaceTexture(4), // -Z
  ], []);

  // Compute 3D target coordinates for a pawn
  const getPawnWorldPos = (pawn: LudoPawn): { x: number; y: number; z: number } => {
    const baseY = 0.36;
    if (pawn.isFinished) {
      // Victory Pedestal in the center
      const angle = (pawn.id / 4) * Math.PI * 2;
      return {
        x: Math.cos(angle) * 1.05,
        y: baseY + 0.72,
        z: Math.sin(angle) * 1.05,
      };
    }

    if (pawn.isHome) {
      const nests = BASE_NESTS_GRID[pawn.color];
      const nest = nests[pawn.id] || { col: 7, row: 7 };
      const w = gridToWorld(nest.col, nest.row);
      return { x: w.x, y: baseY + 0.14, z: w.z };
    }

    if (pawn.position >= 100) {
      const stretchIdx = Math.min(4, Math.max(0, pawn.position - 100));
      const coords = HOME_STRETCH_GRID[pawn.color];
      const pt = coords?.[stretchIdx] || { col: 7, row: 7 };
      const w = gridToWorld(pt.col, pt.row);
      return { x: w.x, y: baseY + 0.16 + stretchIdx * 0.05, z: w.z };
    }

    const trackPt = TRACK_GRID[pawn.position % 52] || { col: 7, row: 7 };
    const w = gridToWorld(trackPt.col, trackPt.row);
    return { x: w.x, y: baseY, z: w.z };
  };

  // Compute destination 3D coordinates for a selected pawn move
  const getDestinationWorldPos = (
    targetPos: number | undefined,
    isExitingHome: boolean | undefined,
    isWinning: boolean | undefined,
    playerColor: string
  ): { x: number; y: number; z: number } | null => {
    if (isWinning) {
      return { x: 0, y: 0.92, z: 0 };
    }
    const baseY = 0.38;
    if (isExitingHome) {
      const startIndices: Record<string, number> = { red: 0, green: 13, yellow: 26, blue: 39 };
      const startIdx = startIndices[playerColor] ?? 0;
      const trackPt = TRACK_GRID[startIdx];
      const w = gridToWorld(trackPt.col, trackPt.row);
      return { x: w.x, y: baseY, z: w.z };
    }
    if (targetPos === undefined || targetPos < 0) return null;
    if (targetPos >= 100) {
      const stretchIdx = Math.min(4, Math.max(0, targetPos - 100));
      const coords = HOME_STRETCH_GRID[playerColor];
      const pt = coords?.[stretchIdx] || { col: 7, row: 7 };
      const w = gridToWorld(pt.col, pt.row);
      return { x: w.x, y: baseY + 0.16 + stretchIdx * 0.05, z: w.z };
    }
    const trackPt = TRACK_GRID[targetPos % 52] || { col: 7, row: 7 };
    const w = gridToWorld(trackPt.col, trackPt.row);
    return { x: w.x, y: baseY, z: w.z };
  };

  // Setup Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // 1. Scene
    const scene = new THREE.Scene();

    // Dark luxury atmosphere matching the theme
    const themeBgColors: Record<GameThemeId, number> = {
      volcano: 0x120507,
      ice: 0x050e1c,
      galaxy: 0x040514,
      jungle_congo: 0x031209,
      desert: 0x140e06,
      classic_royal: 0x090c16,
    };
    scene.background = new THREE.Color(themeBgColors[currentTheme] || 0x07090e);
    scene.fog = new THREE.FogExp2(scene.background.getHex(), 0.014);

    // 2. Camera: Balanced cinematic tabletop framing
    const camera = new THREE.PerspectiveCamera(44, width / height, 0.1, 100);
    const initialCamPos = new THREE.Vector3(0, 10.5, 14.8);
    const initialLookAt = new THREE.Vector3(0, 0, 0);
    camera.position.copy(initialCamPos);
    camera.lookAt(initialLookAt);

    // 3. Renderer with high-end tone mapping & soft shadows
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.16;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. Studio Cinematic Tabletop Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.82);
    scene.add(ambientLight);

    // Key Light: Warm golden sunlight casting crisp contact shadows
    const dirLight = new THREE.DirectionalLight(0xfffaea, 2.4);
    dirLight.position.set(12, 24, 10);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 50;
    dirLight.shadow.camera.left = -11.5;
    dirLight.shadow.camera.right = 11.5;
    dirLight.shadow.camera.top = 11.5;
    dirLight.shadow.camera.bottom = -11.5;
    dirLight.shadow.radius = 2.4;
    scene.add(dirLight);

    // Rim / Backlight: Crisp azure fill light highlighting piece edges
    const rimLight = new THREE.DirectionalLight(0x70a5ff, 1.15);
    rimLight.position.set(-13, 16, -11);
    scene.add(rimLight);

    // Dynamic player accent light
    const activePointLight = new THREE.PointLight(0xef233c, 3.2, 22, 1.2);
    activePointLight.position.set(0, 4.8, 0);
    scene.add(activePointLight);

    // Under-board soft table glow
    const underglowLight = new THREE.PointLight(0xf59e0b, 1.5, 18, 1.8);
    underglowLight.position.set(0, -0.6, 0);
    scene.add(underglowLight);

    // 5. Build Masterpiece 3D Board
    const boardGroup = new THREE.Group();
    scene.add(boardGroup);

    // --- Tabletop Base Surface (Vast dark velvet / slate table beneath) ---
    const tableMat = new THREE.MeshStandardMaterial({
      color: 0x070a12,
      roughness: 0.85,
      metalness: 0.1,
    });
    const tableGeo = new THREE.CylinderGeometry(18, 18, 0.2, 48);
    const tableMesh = new THREE.Mesh(tableGeo, tableMat);
    tableMesh.position.y = -0.7;
    tableMesh.receiveShadow = true;
    boardGroup.add(tableMesh);

    // --- Tier 1 Plinth: Deep Obsidian / Ebony Wood Beveled Base ---
    const plinthMat = new THREE.MeshStandardMaterial({
      color: 0x111622,
      roughness: 0.25,
      metalness: 0.35,
    });
    const plinthGeo = new THREE.BoxGeometry(17.2, 0.5, 17.2);
    const plinthMesh = new THREE.Mesh(plinthGeo, plinthMat);
    plinthMesh.position.y = -0.4;
    plinthMesh.receiveShadow = true;
    boardGroup.add(plinthMesh);

    // --- Tier 2 Bevel: 24K Polished Gold Trim Inlay ---
    const goldRimMat = new THREE.MeshStandardMaterial({
      color: GOLD_COLOR,
      roughness: 0.15,
      metalness: 0.92,
    });
    const goldRimGeo = new THREE.BoxGeometry(16.9, 0.14, 16.9);
    const goldRimMesh = new THREE.Mesh(goldRimGeo, goldRimMat);
    goldRimMesh.position.y = -0.12;
    boardGroup.add(goldRimMesh);

    // Corner luxury brass brackets with decorative rivets
    const bracketMat = new THREE.MeshStandardMaterial({
      color: GOLD_COLOR,
      roughness: 0.2,
      metalness: 0.9,
    });
    const cornerPositions = [
      { x: -8.1, z: -8.1 },
      { x: 8.1, z: -8.1 },
      { x: 8.1, z: 8.1 },
      { x: -8.1, z: 8.1 },
    ];
    cornerPositions.forEach((pos) => {
      const bracketGeo = new THREE.BoxGeometry(0.9, 0.22, 0.9);
      const bracketMesh = new THREE.Mesh(bracketGeo, bracketMat);
      bracketMesh.position.set(pos.x, -0.1, pos.z);
      boardGroup.add(bracketMesh);

      const rivetGeo = new THREE.SphereGeometry(0.1, 16, 16);
      const rivetMesh = new THREE.Mesh(rivetGeo, bracketMat);
      rivetMesh.position.set(pos.x, 0.05, pos.z);
      boardGroup.add(rivetMesh);
    });

    // --- Tier 3 Slab: High-Gloss Polished Lacquer Playing Field ---
    const surfaceMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.14,
      metalness: 0.08,
    });
    const surfaceGeo = new THREE.BoxGeometry(15.5, 0.16, 15.5);
    const surfaceMesh = new THREE.Mesh(surfaceGeo, surfaceMat);
    surfaceMesh.position.y = 0.06;
    surfaceMesh.receiveShadow = true;
    boardGroup.add(surfaceMesh);

    // --- 4 Base Quadrants (Houses / Sanctuaries) ---
    const basesConfig: { color: string; cx: number; cz: number }[] = [
      { color: 'red', cx: -4.5, cz: -4.5 },
      { color: 'green', cx: 4.5, cz: -4.5 },
      { color: 'yellow', cx: 4.5, cz: 4.5 },
      { color: 'blue', cx: -4.5, cz: 4.5 },
    ];

    basesConfig.forEach(({ color, cx, cz }) => {
      const cfg = COLOR_HEX[color];

      // 1. Raised Sanctuary Outer Wall & Molded Border
      const baseOuterMat = new THREE.MeshStandardMaterial({
        color: cfg.main,
        roughness: 0.16,
        metalness: 0.25,
      });
      const baseOuterGeo = new THREE.BoxGeometry(5.9, 0.2, 5.9);
      const baseOuterMesh = new THREE.Mesh(baseOuterGeo, baseOuterMat);
      baseOuterMesh.position.set(cx, 0.16, cz);
      baseOuterMesh.receiveShadow = true;
      boardGroup.add(baseOuterMesh);

      // 2. Beveled Gold Inner Trim
      const courtGoldRimGeo = new THREE.BoxGeometry(4.7, 0.22, 4.7);
      const courtGoldRimMesh = new THREE.Mesh(courtGoldRimGeo, goldRimMat);
      courtGoldRimMesh.position.set(cx, 0.17, cz);
      boardGroup.add(courtGoldRimMesh);

      // 3. Sunken Marble Courtyard with Procedural Team Watermark
      const marbleTex = createMarbleCourtyardTexture(cfg.str);
      const courtMarbleMat = new THREE.MeshStandardMaterial({
        map: marbleTex,
        roughness: 0.12,
        metalness: 0.05,
      });
      const courtMarbleGeo = new THREE.BoxGeometry(4.35, 0.23, 4.35);
      const courtMarbleMesh = new THREE.Mesh(courtMarbleGeo, courtMarbleMat);
      courtMarbleMesh.position.set(cx, 0.18, cz);
      courtMarbleMesh.receiveShadow = true;
      boardGroup.add(courtMarbleMesh);

      // 4. 4 Masterpiece Nesting Altars for Pawns
      const nests = BASE_NESTS_GRID[color];
      nests.forEach((nest) => {
        const w = gridToWorld(nest.col, nest.row);

        // Tiered Altar Base
        const nestBaseGeo = new THREE.CylinderGeometry(0.56, 0.62, 0.12, 32);
        const nestBaseMat = new THREE.MeshStandardMaterial({
          color: GOLD_COLOR,
          roughness: 0.18,
          metalness: 0.88,
        });
        const nestBaseMesh = new THREE.Mesh(nestBaseGeo, nestBaseMat);
        nestBaseMesh.position.set(w.x, 0.24, w.z);
        nestBaseMesh.receiveShadow = true;
        boardGroup.add(nestBaseMesh);

        // Raised Team Color Rim
        const nestLipGeo = new THREE.CylinderGeometry(0.48, 0.48, 0.08, 32);
        const nestLipMat = new THREE.MeshStandardMaterial({
          color: cfg.main,
          roughness: 0.2,
          metalness: 0.3,
        });
        const nestLipMesh = new THREE.Mesh(nestLipGeo, nestLipMat);
        nestLipMesh.position.set(w.x, 0.28, w.z);
        boardGroup.add(nestLipMesh);

        // Sunken Gemstone Cup (Indentation holding pawn)
        const nestGemGeo = new THREE.CylinderGeometry(0.36, 0.36, 0.06, 32);
        const nestGemMat = new THREE.MeshStandardMaterial({
          color: cfg.light,
          emissive: cfg.emissive,
          roughness: 0.1,
          metalness: 0.5,
        });
        const nestGemMesh = new THREE.Mesh(nestGemGeo, nestGemMat);
        nestGemMesh.position.set(w.x, 0.3, w.z);
        boardGroup.add(nestGemMesh);
      });
    });

    // --- 52 Track Tiles (Glossy Beveled Acrylic Blocks with Recessed Channels) ---
    const tileGeo = new THREE.BoxGeometry(0.94, 0.16, 0.94);
    const regularTileMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.22,
      metalness: 0.05,
    });

    // Shared 3D Extruded Star Geometry for all Safe Tiles
    const starShape = createStarShape(0.32, 0.14, 5);
    const starExtrudeGeo = new THREE.ExtrudeGeometry(starShape, {
      depth: 0.06,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 1,
      bevelSize: 0.02,
      bevelThickness: 0.02,
    });
    starExtrudeGeo.rotateX(-Math.PI / 2);
    const starGoldMat = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      roughness: 0.12,
      metalness: 0.95,
      emissive: 0x452200,
    });

    TRACK_GRID.forEach((pt, idx) => {
      const w = gridToWorld(pt.col, pt.row);
      let mat = regularTileMat;

      // Color Start Tiles (Vibrant elevated launchpads)
      if (idx === 0) {
        mat = new THREE.MeshStandardMaterial({ color: COLOR_HEX.red.main, roughness: 0.15, metalness: 0.3 });
      } else if (idx === 13) {
        mat = new THREE.MeshStandardMaterial({ color: COLOR_HEX.green.main, roughness: 0.15, metalness: 0.3 });
      } else if (idx === 26) {
        mat = new THREE.MeshStandardMaterial({ color: COLOR_HEX.yellow.main, roughness: 0.15, metalness: 0.3 });
      } else if (idx === 39) {
        mat = new THREE.MeshStandardMaterial({ color: COLOR_HEX.blue.main, roughness: 0.15, metalness: 0.3 });
      }

      const tileMesh = new THREE.Mesh(tileGeo, mat);
      tileMesh.position.set(w.x, 0.14, w.z);
      tileMesh.receiveShadow = true;
      boardGroup.add(tileMesh);

      // Safe Tiles: Embossed 3D Golden Star Medallion
      if (SAFE_INDICES.includes(idx)) {
        const starMesh = new THREE.Mesh(starExtrudeGeo, starGoldMat);
        starMesh.position.set(w.x, 0.22, w.z);
        starMesh.castShadow = true;
        boardGroup.add(starMesh);
      }
    });

    // --- Home Stretch Steps (Tiered Crystal / Gemstone Stairway) ---
    Object.entries(HOME_STRETCH_GRID).forEach(([color, coords]) => {
      const cfg = COLOR_HEX[color];
      const stretchMat = new THREE.MeshStandardMaterial({
        color: cfg.main,
        roughness: 0.12,
        metalness: 0.35,
        emissive: cfg.emissive,
      });

      coords.forEach((pt, idx) => {
        const w = gridToWorld(pt.col, pt.row);
        const elevation = 0.16 + idx * 0.04;
        const stepTileMesh = new THREE.Mesh(tileGeo, stretchMat);
        stepTileMesh.position.set(w.x, elevation, w.z);
        stepTileMesh.receiveShadow = true;
        boardGroup.add(stepTileMesh);

        // Gold Step Edge Inlay
        const stepEdgeGeo = new THREE.BoxGeometry(0.96, 0.04, 0.08);
        const stepEdgeMesh = new THREE.Mesh(stepEdgeGeo, goldRimMat);
        stepEdgeMesh.position.set(w.x, elevation + 0.08, w.z);
        boardGroup.add(stepEdgeMesh);
      });
    });

    // --- Center Sanctuary & Grand Victory Dais ---
    const goalCenterMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.18,
      metalness: 0.45,
    });
    const centerPodiumGeo = new THREE.CylinderGeometry(1.6, 1.85, 0.32, 48);
    const centerPodium = new THREE.Mesh(centerPodiumGeo, goalCenterMat);
    centerPodium.position.set(0, 0.26, 0);
    centerPodium.receiveShadow = true;
    boardGroup.add(centerPodium);

    // Golden Stepped Dais Collar
    const centerRimGeo = new THREE.CylinderGeometry(1.68, 1.72, 0.08, 48);
    const centerRimMesh = new THREE.Mesh(centerRimGeo, goldRimMat);
    centerRimMesh.position.set(0, 0.38, 0);
    boardGroup.add(centerRimMesh);

    // 4 Converging Color Petals in Center
    const petalColors = [COLOR_HEX.red.main, COLOR_HEX.green.main, COLOR_HEX.yellow.main, COLOR_HEX.blue.main];
    petalColors.forEach((col, idx) => {
      const petalGeo = new THREE.CylinderGeometry(1.3, 1.3, 0.06, 12, 1, false, (idx * Math.PI) / 2, Math.PI / 2);
      const petalMat = new THREE.MeshStandardMaterial({
        color: col,
        roughness: 0.15,
        metalness: 0.4,
      });
      const petalMesh = new THREE.Mesh(petalGeo, petalMat);
      petalMesh.position.set(0, 0.42, 0);
      boardGroup.add(petalMesh);
    });

    // Floating Royal Crown / Trophy
    const floatingTrophyGroup = new THREE.Group();
    floatingTrophyGroup.position.set(0, 0.72, 0);

    // Golden Chalice Base
    const trophyBaseGeo = new THREE.CylinderGeometry(0.34, 0.46, 0.24, 24);
    const trophyBaseMesh = new THREE.Mesh(trophyBaseGeo, goldRimMat);
    trophyBaseMesh.castShadow = true;
    floatingTrophyGroup.add(trophyBaseMesh);

    // Crown Body
    const crownGeo = new THREE.CylinderGeometry(0.52, 0.32, 0.45, 8);
    const crownMat = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      roughness: 0.1,
      metalness: 0.95,
      emissive: 0x452a00,
    });
    const crownMesh = new THREE.Mesh(crownGeo, crownMat);
    crownMesh.position.y = 0.32;
    crownMesh.castShadow = true;
    floatingTrophyGroup.add(crownMesh);

    // Floating Celestial Jewel in Center
    const jewelGeo = new THREE.OctahedronGeometry(0.2, 0);
    const jewelMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      roughness: 0.05,
      metalness: 0.8,
    });
    const jewelMesh = new THREE.Mesh(jewelGeo, jewelMat);
    jewelMesh.position.y = 0.7;
    floatingTrophyGroup.add(jewelMesh);

    // Celestial Golden Orbit Ring
    const orbitRingGeo = new THREE.TorusGeometry(0.68, 0.025, 12, 32);
    const orbitRingMesh = new THREE.Mesh(orbitRingGeo, goldRimMat);
    orbitRingMesh.rotation.x = Math.PI / 3;
    orbitRingMesh.position.y = 0.45;
    floatingTrophyGroup.add(orbitRingMesh);

    boardGroup.add(floatingTrophyGroup);

    // 6. Interactive 3D Dice with Ivory & Gold Shaders
    const diceGeo = new THREE.BoxGeometry(1.24, 1.24, 1.24);
    const diceMaterials = diceTextures.map((tex) =>
      new THREE.MeshStandardMaterial({
        map: tex,
        roughness: 0.12,
        metalness: 0.08,
      })
    );
    const diceMesh = new THREE.Mesh(diceGeo, diceMaterials);
    diceMesh.position.set(0, 0.92, 0);
    diceMesh.castShadow = true;
    scene.add(diceMesh);

    // Dice Glow Launchpad (Under dice on table)
    const diceGlowPadGeo = new THREE.RingGeometry(0.8, 1.45, 36);
    diceGlowPadGeo.rotateX(-Math.PI / 2);
    const diceGlowPadMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.0,
    });
    const diceGlowPad = new THREE.Mesh(diceGlowPadGeo, diceGlowPadMat);
    diceGlowPad.position.set(0, 0.44, 0);
    scene.add(diceGlowPad);

    // 7. TV Selection Beacon (Polished Golden Floating Diamond pointing to selected pawn)
    const selectionBeaconMesh = new THREE.Group();

    // 3D Diamond
    const beaconDiamondGeo = new THREE.OctahedronGeometry(0.26, 0);
    const beaconDiamondMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      emissive: 0xd97706,
      roughness: 0.1,
      metalness: 0.9,
    });
    const beaconDiamond = new THREE.Mesh(beaconDiamondGeo, beaconDiamondMat);
    beaconDiamond.position.y = 0.6;
    selectionBeaconMesh.add(beaconDiamond);

    // Downward Golden Pointer Cone
    const pointerConeGeo = new THREE.ConeGeometry(0.18, 0.4, 16);
    pointerConeGeo.rotateX(Math.PI);
    const pointerCone = new THREE.Mesh(pointerConeGeo, beaconDiamondMat);
    pointerCone.position.y = 0.22;
    selectionBeaconMesh.add(pointerCone);

    // Pulsing Light Column
    const beamGeo = new THREE.CylinderGeometry(0.04, 0.25, 0.7, 16, 1, true);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0xfde047,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide,
    });
    const beamMesh = new THREE.Mesh(beamGeo, beamMat);
    beamMesh.position.y = 0.35;
    selectionBeaconMesh.add(beamMesh);

    selectionBeaconMesh.visible = false;
    scene.add(selectionBeaconMesh);

    // 8. Target Destination Landing Marker (Holographic Concentric Ripple)
    const targetMarkerMesh = new THREE.Group();
    const targetRing1Geo = new THREE.RingGeometry(0.25, 0.42, 36);
    targetRing1Geo.rotateX(-Math.PI / 2);
    const targetRing1Mat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.92,
    });
    const targetRing1 = new THREE.Mesh(targetRing1Geo, targetRing1Mat);
    targetMarkerMesh.add(targetRing1);

    const targetRing2Geo = new THREE.RingGeometry(0.08, 0.16, 24);
    targetRing2Geo.rotateX(-Math.PI / 2);
    const targetRing2 = new THREE.Mesh(targetRing2Geo, targetRing1Mat);
    targetRing2.position.y = 0.02;
    targetMarkerMesh.add(targetRing2);

    targetMarkerMesh.position.set(0, 0.42, 0);
    targetMarkerMesh.visible = false;
    scene.add(targetMarkerMesh);

    // 9. Ambient Floating Stardust (Micro-particles drifting in the light)
    const particleCount = 75;
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 16;
      particlePositions[i + 1] = Math.random() * 7 + 0.5;
      particlePositions[i + 2] = (Math.random() - 0.5) * 16;
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.Float32BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xfef08a,
      size: 0.18,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
    });
    const particlesGroup = new THREE.Points(particleGeo, particleMat);
    scene.add(particlesGroup);

    // 10. Pawns map & Halos map
    const pawnMeshes = new Map<string, THREE.Group>();
    const haloMeshes = new Map<string, THREE.Group>();

    // 11. Raycasting & Mouse Controls: Balanced tabletop framing (radius: 17.5)
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const orbitAngle = { theta: 0, phi: 0.96, radius: 17.5 };

    threeRef.current = {
      scene,
      camera,
      renderer,
      pawnMeshes,
      haloMeshes,
      diceMesh,
      diceGlowPad,
      selectionBeaconMesh,
      targetMarkerMesh,
      targetDiceRot: new THREE.Euler(),
      targetCamPos: initialCamPos.clone(),
      targetCamLookAt: initialLookAt.clone(),
      camPos: initialCamPos.clone(),
      camLookAt: initialLookAt.clone(),
      raycaster,
      mouse,
      animFrameId: null,
      isDragging: false,
      prevMousePos: { x: 0, y: 0 },
      orbitAngle,
      activePointLight,
      particlesGroup,
      floatingTrophyGroup,
    };

    // Mouse drag orbit controls
    const onMouseDown = (e: MouseEvent) => {
      if (!threeRef.current) return;
      threeRef.current.isDragging = true;
      threeRef.current.prevMousePos = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!threeRef.current) return;
      const rect = renderer.domElement.getBoundingClientRect();
      threeRef.current.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      threeRef.current.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      if (threeRef.current.isDragging) {
        const dx = e.clientX - threeRef.current.prevMousePos.x;
        const dy = e.clientY - threeRef.current.prevMousePos.y;
        threeRef.current.prevMousePos = { x: e.clientX, y: e.clientY };

        threeRef.current.orbitAngle.theta -= dx * 0.007;
        threeRef.current.orbitAngle.phi = Math.max(
          0.3,
          Math.min(1.4, threeRef.current.orbitAngle.phi + dy * 0.007)
        );
      } else {
        // Interactive cursor detection on hover
        threeRef.current.raycaster.setFromCamera(threeRef.current.mouse, camera);
        const allPawnGroups = Array.from(threeRef.current.pawnMeshes.values());
        const hits = threeRef.current.raycaster.intersectObjects(allPawnGroups, true);
        let isHoveringInteractive = false;
        if (hits.length > 0) {
          let cur: THREE.Object3D | null = hits[0].object;
          while (cur && !cur.userData?.pawnId && cur.parent) {
            cur = cur.parent;
          }
          if (cur && cur.userData?.isMovable) {
            isHoveringInteractive = true;
          }
        }
        if (!isHoveringInteractive && gameState.canRollDice) {
          const diceHit = threeRef.current.raycaster.intersectObject(threeRef.current.diceMesh, true);
          if (diceHit.length > 0) isHoveringInteractive = true;
        }
        renderer.domElement.style.cursor = isHoveringInteractive
          ? 'pointer'
          : threeRef.current.isDragging
          ? 'grabbing'
          : 'grab';
      }
    };

    const onMouseUp = () => {
      if (!threeRef.current) return;
      threeRef.current.isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (!threeRef.current) return;
      threeRef.current.orbitAngle.radius = Math.max(
        11.0,
        Math.min(26.0, threeRef.current.orbitAngle.radius + e.deltaY * 0.012)
      );
    };

    const onClick = (e: MouseEvent) => {
      if (!threeRef.current) return;
      const rect = renderer.domElement.getBoundingClientRect();
      const clickMouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );

      threeRef.current.raycaster.setFromCamera(clickMouse, camera);

      // 1. Check movable pawns click
      const allPawnGroups = Array.from(threeRef.current.pawnMeshes.values());
      const intersects = threeRef.current.raycaster.intersectObjects(allPawnGroups, true);

      if (intersects.length > 0) {
        let cur: THREE.Object3D | null = intersects[0].object;
        while (cur && !cur.userData?.pawnId && cur.parent) {
          cur = cur.parent;
        }
        if (cur && cur.userData?.pawnId !== undefined) {
          const { pawnId, isMovable } = cur.userData;
          if (isMovable) {
            playSoundFX.playHop();
            onSelectPawn(pawnId);
            return;
          }
        }
      }

      // 2. Check 3D dice click to roll
      if (gameState.canRollDice && onRollDice) {
        const diceIntersects = threeRef.current.raycaster.intersectObject(threeRef.current.diceMesh, true);
        if (diceIntersects.length > 0) {
          playSoundFX.playDiceRoll();
          onRollDice();
        }
      }
    };

    const domEl = renderer.domElement;
    domEl.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    domEl.addEventListener('wheel', onWheel, { passive: false });
    domEl.addEventListener('click', onClick);

    // Resize Handler
    const handleResize = () => {
      if (!containerRef.current || !threeRef.current) return;
      const w = containerRef.current.clientWidth || window.innerWidth;
      const h = containerRef.current.clientHeight || window.innerHeight;
      threeRef.current.camera.aspect = w / h;
      threeRef.current.camera.updateProjectionMatrix();
      threeRef.current.renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // Animation Render Loop
    let clock = new THREE.Clock();
    const animate = () => {
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();
      if (!threeRef.current) return;

      const {
        scene,
        camera,
        renderer,
        pawnMeshes,
        haloMeshes,
        diceMesh,
        diceGlowPad,
        targetDiceRot,
        orbitAngle,
        camPos,
        camLookAt,
        targetCamPos,
        targetCamLookAt,
        selectionBeaconMesh,
        targetMarkerMesh,
        floatingTrophyGroup,
        particlesGroup,
      } = threeRef.current;

      // Rotate center victory trophy & floating jewel
      floatingTrophyGroup.rotation.y = elapsed * 0.65;
      floatingTrophyGroup.position.y = 0.72 + Math.sin(elapsed * 2.2) * 0.05;

      // Ambient Stardust gentle drift
      const positions = particlesGroup.geometry.attributes.position.array as Float32Array;
      for (let i = 1; i < positions.length; i += 3) {
        positions[i] += delta * 0.18;
        if (positions[i] > 8.0) {
          positions[i] = 0.5;
        }
      }
      particlesGroup.geometry.attributes.position.needsUpdate = true;
      particlesGroup.rotation.y = elapsed * 0.04;

      // Rotate movable pawn halos and prominent bounce animation
      haloMeshes.forEach((haloGroup, key) => {
        haloGroup.rotation.y = elapsed * 3.2;
        const parentPawn = pawnMeshes.get(key);
        if (parentPawn && parentPawn.userData?.isMovable) {
          // Energetic rhythmic hop pulse
          parentPawn.position.y = (parentPawn.userData.baseY || 0.36) + Math.abs(Math.sin(elapsed * 4.8)) * 0.24;
        }
      });

      // Smooth camera interpolation based on preset
      if (cameraPreset === 'top') {
        targetCamPos.set(0, 15.2, 0.01);
        targetCamLookAt.set(0, 0, 0);
      } else if (cameraPreset === 'isometric') {
        const sinPhi = Math.sin(orbitAngle.phi);
        const cosPhi = Math.cos(orbitAngle.phi);
        targetCamPos.set(
          orbitAngle.radius * sinPhi * Math.sin(orbitAngle.theta),
          orbitAngle.radius * cosPhi,
          orbitAngle.radius * sinPhi * Math.cos(orbitAngle.theta)
        );
        targetCamLookAt.set(0, 0, 0);
      }

      camPos.lerp(targetCamPos, 0.07);
      camLookAt.lerp(targetCamLookAt, 0.07);
      camera.position.copy(camPos);
      camera.lookAt(camLookAt);

      // Smooth dice rotation and roll physics
      if (isRollingAnimation) {
        diceMesh.rotation.x += delta * 22;
        diceMesh.rotation.y += delta * 26;
        diceMesh.rotation.z += delta * 18;
        diceMesh.position.y = 1.3 + Math.abs(Math.sin(elapsed * 12)) * 1.6;
        (diceGlowPad.material as THREE.MeshBasicMaterial).opacity = 0.85;
      } else {
        diceMesh.rotation.x = THREE.MathUtils.lerp(diceMesh.rotation.x, targetDiceRot.x, 0.12);
        diceMesh.rotation.y = THREE.MathUtils.lerp(diceMesh.rotation.y, targetDiceRot.y, 0.12);
        diceMesh.rotation.z = THREE.MathUtils.lerp(diceMesh.rotation.z, targetDiceRot.z, 0.12);
        const diceTargetY = gameState.canRollDice ? 0.98 + Math.sin(elapsed * 3.5) * 0.08 : 0.90;
        diceMesh.position.y = THREE.MathUtils.lerp(diceMesh.position.y, diceTargetY, 0.12);

        // Pulsing glow when player can roll
        const glowOpacity = gameState.canRollDice ? 0.45 + Math.sin(elapsed * 4.0) * 0.35 : 0.0;
        (diceGlowPad.material as THREE.MeshBasicMaterial).opacity = THREE.MathUtils.lerp(
          (diceGlowPad.material as THREE.MeshBasicMaterial).opacity,
          glowOpacity,
          0.1
        );
      }

      // Rotate selection beacon & target destination marker
      if (selectionBeaconMesh.visible) {
        selectionBeaconMesh.rotation.y += delta * 2.8;
      }
      if (targetMarkerMesh.visible) {
        targetMarkerMesh.rotation.y += delta * 2.0;
      }

      // Smooth pawn position transitions (parabolic hops with arc)
      pawnMeshes.forEach((mesh) => {
        const target = mesh.userData.targetPos;
        if (target) {
          const dx = target.x - mesh.position.x;
          const dz = target.z - mesh.position.z;
          const distHoriz = Math.hypot(dx, dz);

          if (distHoriz > 0.04) {
            mesh.position.x = THREE.MathUtils.lerp(mesh.position.x, target.x, 0.18);
            mesh.position.z = THREE.MathUtils.lerp(mesh.position.z, target.z, 0.18);
            const hopHeight = Math.sin(Math.min(1, distHoriz * 1.8) * Math.PI) * 0.9;
            mesh.position.y = (mesh.userData.baseY || 0.36) + hopHeight;
          } else {
            mesh.position.x = target.x;
            mesh.position.z = target.z;
            if (!mesh.userData?.isMovable) {
              mesh.position.y = THREE.MathUtils.lerp(mesh.position.y, mesh.userData.baseY || 0.36, 0.2);
            }
          }
        }
      });

      renderer.render(scene, camera);
      threeRef.current.animFrameId = requestAnimationFrame(animate);
    };

    threeRef.current.animFrameId = requestAnimationFrame(animate);

    return () => {
      domEl.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      domEl.removeEventListener('wheel', onWheel);
      domEl.removeEventListener('click', onClick);
      window.removeEventListener('resize', handleResize);

      if (threeRef.current?.animFrameId) {
        cancelAnimationFrame(threeRef.current.animFrameId);
      }
      renderer.dispose();
      threeRef.current = null;
    };
  }, []);

  // Sync theme background and lights
  useEffect(() => {
    if (!threeRef.current) return;
    const { scene, activePointLight } = threeRef.current;
    const themeBgColors: Record<GameThemeId, number> = {
      volcano: 0x120507,
      ice: 0x050e1c,
      galaxy: 0x040514,
      jungle_congo: 0x031209,
      desert: 0x140e06,
      classic_royal: 0x090c16,
    };
    scene.background = new THREE.Color(themeBgColors[currentTheme] || 0x07090e);
    if (scene.fog) {
      scene.fog.color = new THREE.Color(themeBgColors[currentTheme] || 0x07090e);
    }

    const activeColor = gameState?.currentTurnColor || 'red';
    activePointLight.color.setHex(COLOR_HEX[activeColor]?.main || 0xef233c);
  }, [currentTheme, gameState?.currentTurnColor]);

  // Sync Dice Face
  useEffect(() => {
    if (!threeRef.current) return;
    const { targetDiceRot } = threeRef.current;
    const diceVal = animatedDiceVal !== null ? animatedDiceVal : gameState.diceValue;

    switch (diceVal) {
      case 2:
        targetDiceRot.set(0, 0, 0); // 2 on +Y
        break;
      case 5:
        targetDiceRot.set(Math.PI, 0, 0); // 5 on -Y
        break;
      case 1:
        targetDiceRot.set(0, 0, Math.PI / 2); // 1 on +X
        break;
      case 6:
        targetDiceRot.set(0, 0, -Math.PI / 2); // 6 on -X
        break;
      case 3:
        targetDiceRot.set(-Math.PI / 2, 0, 0); // 3 on +Z
        break;
      case 4:
        targetDiceRot.set(Math.PI / 2, 0, 0); // 4 on -Z
        break;
      default:
        targetDiceRot.set(0, 0, 0);
    }
  }, [animatedDiceVal, gameState.diceValue]);

  // Sync 3D Pawns from GameState (Collection-Grade Sculpted Figurines)
  useEffect(() => {
    if (!threeRef.current) return;
    const { scene, pawnMeshes, haloMeshes } = threeRef.current;
    const allPawns: LudoPawn[] = Object.values(gameState.pawns || {}).flat();
    const activeColor = gameState.currentTurnColor || 'red';

    allPawns.forEach((pawn) => {
      const key = `${pawn.color}_${pawn.id}`;
      const targetPos = getPawnWorldPos(pawn);
      const isMovable = gameState.movablePawns?.includes(pawn.id) && pawn.color === activeColor;

      let pawnGroup = pawnMeshes.get(key);

      if (!pawnGroup) {
        pawnGroup = new THREE.Group();
        const cfg = COLOR_HEX[pawn.color] || COLOR_HEX.red;

        // Rich Pearlescent Automotive Body Material
        const pawnBodyMat = new THREE.MeshStandardMaterial({
          color: cfg.main,
          roughness: 0.12,
          metalness: 0.28,
        });

        // 24K Polished Gold Ring Material
        const pawnGoldMat = new THREE.MeshStandardMaterial({
          color: GOLD_COLOR,
          roughness: 0.14,
          metalness: 0.94,
        });

        // 1. Dark Velvet Felt Base Cushion
        const feltGeo = new THREE.CylinderGeometry(0.38, 0.42, 0.04, 24);
        const feltMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.9 });
        const feltMesh = new THREE.Mesh(feltGeo, feltMat);
        feltMesh.position.y = 0.02;
        pawnGroup.add(feltMesh);

        // 2. Weighted Gold Base Plinth
        const baseGeo = new THREE.CylinderGeometry(0.35, 0.44, 0.12, 28);
        const baseMesh = new THREE.Mesh(baseGeo, pawnGoldMat);
        baseMesh.position.y = 0.08;
        baseMesh.castShadow = true;
        pawnGroup.add(baseMesh);

        // 3. Fluted Lower Body Chalice
        const lowerBodyGeo = new THREE.CylinderGeometry(0.24, 0.35, 0.26, 28);
        const lowerBodyMesh = new THREE.Mesh(lowerBodyGeo, pawnBodyMat);
        lowerBodyMesh.position.y = 0.24;
        lowerBodyMesh.castShadow = true;
        pawnGroup.add(lowerBodyMesh);

        // 4. Lower 24K Gold Ring Collar
        const lowerRingGeo = new THREE.TorusGeometry(0.25, 0.038, 12, 28);
        const lowerRingMesh = new THREE.Mesh(lowerRingGeo, pawnGoldMat);
        lowerRingMesh.rotation.x = Math.PI / 2;
        lowerRingMesh.position.y = 0.38;
        pawnGroup.add(lowerRingMesh);

        // 5. Tapered Waist Neck
        const neckGeo = new THREE.CylinderGeometry(0.18, 0.24, 0.24, 28);
        const neckMesh = new THREE.Mesh(neckGeo, pawnBodyMat);
        neckMesh.position.y = 0.50;
        neckMesh.castShadow = true;
        pawnGroup.add(neckMesh);

        // 6. Upper Gold Ring Collar
        const upperRingGeo = new THREE.TorusGeometry(0.19, 0.035, 12, 28);
        const upperRingMesh = new THREE.Mesh(upperRingGeo, pawnGoldMat);
        upperRingMesh.rotation.x = Math.PI / 2;
        upperRingMesh.position.y = 0.63;
        pawnGroup.add(upperRingMesh);

        // 7. Polished Jewel Head Knob
        const headGeo = new THREE.SphereGeometry(0.26, 28, 28);
        const headMat = new THREE.MeshStandardMaterial({
          color: cfg.light,
          emissive: cfg.emissive,
          roughness: 0.08,
          metalness: 0.35,
        });
        const headMesh = new THREE.Mesh(headGeo, headMat);
        headMesh.position.y = 0.84;
        headMesh.castShadow = true;
        pawnGroup.add(headMesh);

        // 8. Crown Finial Top
        const finialGeo = new THREE.ConeGeometry(0.08, 0.12, 8);
        const finialMesh = new THREE.Mesh(finialGeo, pawnGoldMat);
        finialMesh.position.y = 1.12;
        pawnGroup.add(finialMesh);

        // Floating Movable Halo with Orbiting Pearl Orbs
        const haloGroup = new THREE.Group();
        haloGroup.position.y = 1.34;

        const haloRingGeo = new THREE.TorusGeometry(0.48, 0.03, 12, 32);
        const haloRingMat = new THREE.MeshStandardMaterial({
          color: 0xfbbf24,
          emissive: 0xd97706,
          roughness: 0.1,
          metalness: 0.9,
        });
        const haloRingMesh = new THREE.Mesh(haloRingGeo, haloRingMat);
        haloRingMesh.rotation.x = Math.PI / 2;
        haloGroup.add(haloRingMesh);

        // 4 small orbiting jewels on the halo
        for (let i = 0; i < 4; i++) {
          const orbAngle = (i / 4) * Math.PI * 2;
          const orbGeo = new THREE.SphereGeometry(0.06, 12, 12);
          const orbMesh = new THREE.Mesh(orbGeo, haloRingMat);
          orbMesh.position.set(Math.cos(orbAngle) * 0.48, 0, Math.sin(orbAngle) * 0.48);
          haloGroup.add(orbMesh);
        }

        haloGroup.visible = false;
        pawnGroup.add(haloGroup);
        haloMeshes.set(key, haloGroup);

        pawnGroup.position.set(targetPos.x, targetPos.y, targetPos.z);
        scene.add(pawnGroup);
        pawnMeshes.set(key, pawnGroup);
      }

      pawnGroup.userData = {
        pawnId: pawn.id,
        color: pawn.color,
        isMovable,
        baseY: targetPos.y,
        targetPos,
      };

      const halo = haloMeshes.get(key);
      if (halo) {
        halo.visible = !!isMovable;
      }
    });
  }, [gameState.pawns, gameState.movablePawns, gameState.currentTurnColor]);

  // Update TV Selection Beacon & Destination Landing Marker in 3D
  useEffect(() => {
    if (!threeRef.current) return;
    const { selectionBeaconMesh, targetMarkerMesh, pawnMeshes } = threeRef.current;
    const activeColor = gameState.currentTurnColor || 'red';

    if (selectedPawnId !== null && selectedPawnId !== undefined) {
      const pawnKey = `${activeColor}_${selectedPawnId}`;
      const pawnGroup = pawnMeshes.get(pawnKey);
      if (pawnGroup) {
        selectionBeaconMesh.position.set(
          pawnGroup.position.x,
          (pawnGroup.userData?.baseY || 0.36) + 1.15,
          pawnGroup.position.z
        );
        selectionBeaconMesh.visible = true;
      } else {
        selectionBeaconMesh.visible = false;
      }

      const option = (gameState.movableOptions || []).find((o) => o.pawnId === selectedPawnId);
      const destPos = getDestinationWorldPos(
        option?.targetPosition,
        option?.isExitingHome,
        option?.isWinning,
        activeColor
      );
      if (destPos) {
        targetMarkerMesh.position.set(destPos.x, destPos.y + 0.02, destPos.z);
        targetMarkerMesh.visible = true;
      } else {
        targetMarkerMesh.visible = false;
      }
    } else {
      selectionBeaconMesh.visible = false;
      targetMarkerMesh.visible = false;
    }
  }, [selectedPawnId, gameState.movableOptions, gameState.currentTurnColor]);

  // Adjust camera to player corner when 'follow' preset is active
  useEffect(() => {
    if (cameraPreset !== 'follow' || !threeRef.current) return;
    const activeColor = gameState.currentTurnColor || 'red';
    const angleMap: Record<string, { theta: number; phi: number }> = {
      red: { theta: -Math.PI / 4, phi: 0.94 },
      green: { theta: Math.PI / 4, phi: 0.94 },
      yellow: { theta: (3 * Math.PI) / 4, phi: 0.94 },
      blue: { theta: (-3 * Math.PI) / 4, phi: 0.94 },
    };
    const targetAngle = angleMap[activeColor] || angleMap.red;
    threeRef.current.orbitAngle.theta = targetAngle.theta;
    threeRef.current.orbitAngle.phi = targetAngle.phi;
    threeRef.current.orbitAngle.radius = 16.5;
  }, [gameState.currentTurnColor, cameraPreset]);

  return (
    <div className="relative w-full h-full select-none overflow-hidden">
      {/* 3D Canvas Container */}
      <div
        ref={containerRef}
        className="w-full h-full cursor-grab active:cursor-grabbing absolute inset-0"
      />

      {/* Floating 3D Camera Controls Toolbar (discreet bottom luxury pill) */}
      <div className="absolute bottom-16 sm:bottom-20 left-1/2 -translate-x-1/2 z-20 flex items-center space-x-2 bg-slate-950/85 backdrop-blur-2xl px-4 py-1.5 rounded-full border border-amber-500/30 shadow-[0_12px_40px_rgba(0,0,0,0.85)]">
        <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 flex items-center space-x-1.5 mr-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>LUDO 3D ROYAL</span>
        </span>

        {/* Isometric Preset */}
        <button
          onClick={() => {
            playSoundFX.playHop();
            if (threeRef.current) {
              threeRef.current.orbitAngle.theta = 0;
              threeRef.current.orbitAngle.phi = 0.96;
              threeRef.current.orbitAngle.radius = 17.5;
            }
            setCameraPreset('isometric');
          }}
          className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
            cameraPreset === 'isometric'
              ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-neutral-950 shadow-md font-black scale-105'
              : 'text-slate-300 hover:text-white hover:bg-white/10'
          }`}
          title="Vue 3D Isométrique Cinématique"
        >
          <Compass className="w-3 h-3" />
          <span>Isométrique</span>
        </button>

        {/* Top-Down Preset */}
        <button
          onClick={() => {
            playSoundFX.playHop();
            if (threeRef.current) {
              threeRef.current.orbitAngle.theta = 0;
              threeRef.current.orbitAngle.phi = 0.08;
              threeRef.current.orbitAngle.radius = 20.0;
            }
            setCameraPreset('top');
          }}
          className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
            cameraPreset === 'top'
              ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-neutral-950 shadow-md font-black scale-105'
              : 'text-slate-300 hover:text-white hover:bg-white/10'
          }`}
          title="Vue Stratégique du Dessus"
        >
          <Eye className="w-3 h-3" />
          <span>Dessus</span>
        </button>

        {/* Follow Player Preset */}
        <button
          onClick={() => {
            playSoundFX.playHop();
            setCameraPreset('follow');
          }}
          className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
            cameraPreset === 'follow'
              ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-neutral-950 shadow-md font-black scale-105'
              : 'text-slate-300 hover:text-white hover:bg-white/10'
          }`}
          title="Caméra Dynamique Joueur Actif"
        >
          <Trophy className="w-3 h-3" />
          <span>Dynamique</span>
        </button>

        <div className="h-4 w-px bg-white/20 mx-1" />

        {/* Zoom In Button */}
        <button
          onClick={() => {
            playSoundFX.playHop();
            if (threeRef.current) {
              threeRef.current.orbitAngle.radius = Math.max(11.0, threeRef.current.orbitAngle.radius - 2.0);
            }
          }}
          className="w-7 h-7 rounded-full hover:bg-white/20 text-slate-200 hover:text-white flex items-center justify-center transition-all cursor-pointer"
          title="Agrandir (Zoom avant)"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>

        {/* Zoom Out Button */}
        <button
          onClick={() => {
            playSoundFX.playHop();
            if (threeRef.current) {
              threeRef.current.orbitAngle.radius = Math.min(26.0, threeRef.current.orbitAngle.radius + 2.0);
            }
          }}
          className="w-7 h-7 rounded-full hover:bg-white/20 text-slate-200 hover:text-white flex items-center justify-center transition-all cursor-pointer"
          title="Dézoomer (Zoom arrière)"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>

        {/* Reset Camera button */}
        <button
          onClick={() => {
            playSoundFX.playHop();
            if (threeRef.current) {
              threeRef.current.orbitAngle.theta = 0;
              threeRef.current.orbitAngle.phi = 0.96;
              threeRef.current.orbitAngle.radius = 17.5;
              setCameraPreset('isometric');
            }
          }}
          className="w-7 h-7 rounded-full hover:bg-white/20 text-slate-200 hover:text-white flex items-center justify-center transition-all cursor-pointer"
          title="Réinitialiser le cadrage"
        >
          <RotateCw className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
