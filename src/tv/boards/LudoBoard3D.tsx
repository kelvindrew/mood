import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { LudoGameState, LudoPawn } from '../../types/game';
import { GameThemeId } from '../../engine/PlayThemes';
import { playSoundFX } from '../../engine/PlaySoundFX';
import { RotateCw, Sparkles, ZoomIn, ZoomOut, Compass, Eye, Trophy, Zap } from 'lucide-react';

interface LudoBoard3DProps {
  gameState: LudoGameState;
  currentTheme: GameThemeId;
  isRollingAnimation: boolean;
  animatedDiceVal: number | null;
  selectedPawnId?: number | null;
  onSelectPawn: (pawnId: number) => void;
  onRollDice?: () => void;
  isTurboMode?: boolean;
  onToggleTurbo?: () => void;
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

// Detect Smart TV / Hisense environment
const isSmartTVEnvironment = (): boolean => {
  if (typeof document === 'undefined') return false;
  return (
    document.documentElement.classList.contains('tv-ui') ||
    /Hisense|VIDAA|SmartTV|HbbTV|Tizen|webOS|GoogleTV|Android.*TV/i.test(navigator.userAgent || '')
  );
};

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

// Palette with luminous metallic accents
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

const GOLD_COLOR = 0xf5b041;

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

// Generate luxury dice faces (optimized 256x256 canvas for high TV fillrate)
function createDiceFaceTexture(value: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Smooth ivory / ceramic resin gradient
  const bgGrad = ctx.createRadialGradient(128, 128, 20, 128, 128, 180);
  bgGrad.addColorStop(0, '#ffffff');
  bgGrad.addColorStop(0.7, '#f8fafc');
  bgGrad.addColorStop(1, '#e2e8f0');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 256, 256);

  // Outer gold rim inlay
  ctx.lineWidth = 12;
  ctx.strokeStyle = '#d97706';
  ctx.strokeRect(7, 7, 242, 242);

  const drawPip = (x: number, y: number, r = 24, isAce = false) => {
    ctx.save();
    if (isAce) {
      // Ace: Royal Ruby Seal with Gold Rim
      ctx.beginPath();
      ctx.arc(x, y, r * 1.2, 0, Math.PI * 2);
      ctx.fillStyle = '#f59e0b';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = '#ef233c';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(x - r * 0.35, y - r * 0.35, r * 0.35, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.arc(x, y, r * 1.1, 0, Math.PI * 2);
      ctx.fillStyle = '#b45309';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = '#0f172a';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(x - r * 0.3, y - r * 0.3, r * 0.3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
      ctx.fill();
    }
    ctx.restore();
  };

  const c = 128;
  const l = 68;
  const r = 188;

  if (value === 1) {
    drawPip(c, c, 38, true);
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
    drawPip(l, 58);
    drawPip(l, 128);
    drawPip(l, 198);
    drawPip(r, 58);
    drawPip(r, 128);
    drawPip(r, 198);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 1; // 1 for TV performance
  return texture;
}

// Procedural Courtyard tile texture (256x256 for fast VRAM caching)
function createMarbleCourtyardTexture(colorHex: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, 256, 256);

  ctx.save();
  ctx.translate(128, 128);
  ctx.strokeStyle = colorHex;
  ctx.lineWidth = 3;
  ctx.globalAlpha = 0.28;

  ctx.beginPath();
  ctx.arc(0, 0, 70, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(0, 0, 48, 0, Math.PI * 2);
  ctx.stroke();

  for (let i = 0; i < 8; i++) {
    ctx.rotate((Math.PI * 2) / 8);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -45);
    ctx.stroke();
  }
  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 1;
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
  isTurboMode,
  onToggleTurbo,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [cameraPreset, setCameraPreset] = useState<'isometric' | 'top' | 'follow'>('isometric');

  const isSmartTV = useMemo(() => isSmartTVEnvironment(), []);

  // Internal turbo state if not controlled externally (Defaults to TRUE on Smart TV / Hisense!)
  const [internalTurbo, setInternalTurbo] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mood_tv_turbo_3d');
      if (saved !== null) return saved === 'true';
    }
    return isSmartTVEnvironment();
  });

  const activeTurbo = isTurboMode !== undefined ? isTurboMode : internalTurbo;

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
    dirLight: THREE.DirectionalLight;
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

    // 2. Camera: Balanced tabletop framing
    const camera = new THREE.PerspectiveCamera(44, width / height, 0.1, 100);
    const initialCamPos = new THREE.Vector3(0, 10.5, 14.8);
    const initialLookAt = new THREE.Vector3(0, 0, 0);
    camera.position.copy(initialCamPos);
    camera.lookAt(initialLookAt);

    // 3. Renderer calibrated for Hisense TV Hardware & 60 FPS
    const renderer = new THREE.WebGLRenderer({
      antialias: !activeTurbo,
      powerPreference: 'high-performance',
      alpha: true,
      stencil: false,
      depth: true,
    });
    renderer.setSize(width, height);

    // Resolution clamping: on Smart TV, max 1.0 (or 0.95) to prevent 4K GPU choke
    const targetPixelRatio = activeTurbo ? (isSmartTV ? 0.95 : 1.0) : Math.min(window.devicePixelRatio, 1.5);
    renderer.setPixelRatio(targetPixelRatio);

    renderer.shadowMap.enabled = !activeTurbo;
    if (!activeTurbo) {
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }
    renderer.toneMapping = activeTurbo ? THREE.LinearToneMapping : THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. Lighting Setup (Streamlined on Turbo TV for max FPS)
    const ambientLight = new THREE.AmbientLight(0xffffff, activeTurbo ? 1.05 : 0.82);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xfffaea, activeTurbo ? 1.8 : 2.4);
    dirLight.position.set(12, 24, 10);
    dirLight.castShadow = !activeTurbo;
    if (!activeTurbo) {
      dirLight.shadow.mapSize.width = 1024;
      dirLight.shadow.mapSize.height = 1024;
      dirLight.shadow.camera.near = 0.5;
      dirLight.shadow.camera.far = 45;
      dirLight.shadow.camera.left = -11;
      dirLight.shadow.camera.right = 11;
      dirLight.shadow.camera.top = 11;
      dirLight.shadow.camera.bottom = -11;
      dirLight.shadow.radius = 2.0;
    }
    scene.add(dirLight);

    // Rim light (for Quality mode)
    const rimLight = new THREE.DirectionalLight(0x70a5ff, activeTurbo ? 0.6 : 1.15);
    rimLight.position.set(-13, 16, -11);
    scene.add(rimLight);

    // Dynamic player point light (disabled in Turbo mode to save pixel shader cycles)
    const activePointLight = new THREE.PointLight(0xef233c, 2.5, 20, 1.2);
    activePointLight.position.set(0, 4.8, 0);
    activePointLight.visible = !activeTurbo;
    scene.add(activePointLight);

    // 5. Build Masterpiece 3D Board
    const boardGroup = new THREE.Group();
    scene.add(boardGroup);

    // Tabletop Base Surface
    const tableMat = new THREE.MeshStandardMaterial({
      color: 0x070a12,
      roughness: 0.85,
      metalness: 0.1,
    });
    const tableGeo = new THREE.CylinderGeometry(18, 18, 0.2, 32);
    const tableMesh = new THREE.Mesh(tableGeo, tableMat);
    tableMesh.position.y = -0.7;
    tableMesh.receiveShadow = !activeTurbo;
    boardGroup.add(tableMesh);

    // Tier 1 Plinth: Deep Obsidian Base
    const plinthMat = new THREE.MeshStandardMaterial({
      color: 0x111622,
      roughness: 0.25,
      metalness: 0.35,
    });
    const plinthGeo = new THREE.BoxGeometry(17.2, 0.5, 17.2);
    const plinthMesh = new THREE.Mesh(plinthGeo, plinthMat);
    plinthMesh.position.y = -0.4;
    plinthMesh.receiveShadow = !activeTurbo;
    boardGroup.add(plinthMesh);

    // Tier 2 Bevel: 24K Gold Trim Inlay
    const goldRimMat = new THREE.MeshStandardMaterial({
      color: GOLD_COLOR,
      roughness: 0.15,
      metalness: 0.92,
    });
    const goldRimGeo = new THREE.BoxGeometry(16.9, 0.14, 16.9);
    const goldRimMesh = new THREE.Mesh(goldRimGeo, goldRimMat);
    goldRimMesh.position.y = -0.12;
    boardGroup.add(goldRimMesh);

    // Corner luxury brass brackets
    const bracketPositions = [
      { x: -8.1, z: -8.1 },
      { x: 8.1, z: -8.1 },
      { x: 8.1, z: 8.1 },
      { x: -8.1, z: 8.1 },
    ];
    bracketPositions.forEach((pos) => {
      const bracketGeo = new THREE.BoxGeometry(0.9, 0.22, 0.9);
      const bracketMesh = new THREE.Mesh(bracketGeo, goldRimMat);
      bracketMesh.position.set(pos.x, -0.1, pos.z);
      boardGroup.add(bracketMesh);
    });

    // Tier 3 Slab: High-Gloss Polished Lacquer Playing Field
    const surfaceMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.14,
      metalness: 0.08,
    });
    const surfaceGeo = new THREE.BoxGeometry(15.5, 0.16, 15.5);
    const surfaceMesh = new THREE.Mesh(surfaceGeo, surfaceMat);
    surfaceMesh.position.y = 0.06;
    surfaceMesh.receiveShadow = !activeTurbo;
    boardGroup.add(surfaceMesh);

    // 4 Base Quadrants (Houses / Sanctuaries)
    const basesConfig: { color: string; cx: number; cz: number }[] = [
      { color: 'red', cx: -4.5, cz: -4.5 },
      { color: 'green', cx: 4.5, cz: -4.5 },
      { color: 'yellow', cx: 4.5, cz: 4.5 },
      { color: 'blue', cx: -4.5, cz: 4.5 },
    ];

    basesConfig.forEach(({ color, cx, cz }) => {
      const cfg = COLOR_HEX[color];

      // Raised Sanctuary Outer Wall
      const baseOuterMat = new THREE.MeshStandardMaterial({
        color: cfg.main,
        roughness: 0.16,
        metalness: 0.25,
      });
      const baseOuterGeo = new THREE.BoxGeometry(5.9, 0.2, 5.9);
      const baseOuterMesh = new THREE.Mesh(baseOuterGeo, baseOuterMat);
      baseOuterMesh.position.set(cx, 0.16, cz);
      baseOuterMesh.receiveShadow = !activeTurbo;
      boardGroup.add(baseOuterMesh);

      // Beveled Gold Inner Trim
      const courtGoldRimGeo = new THREE.BoxGeometry(4.7, 0.22, 4.7);
      const courtGoldRimMesh = new THREE.Mesh(courtGoldRimGeo, goldRimMat);
      courtGoldRimMesh.position.set(cx, 0.17, cz);
      boardGroup.add(courtGoldRimMesh);

      // Sunken Marble Courtyard
      const marbleTex = createMarbleCourtyardTexture(cfg.str);
      const courtMarbleMat = new THREE.MeshStandardMaterial({
        map: marbleTex,
        roughness: 0.12,
        metalness: 0.05,
      });
      const courtMarbleGeo = new THREE.BoxGeometry(4.35, 0.23, 4.35);
      const courtMarbleMesh = new THREE.Mesh(courtMarbleGeo, courtMarbleMat);
      courtMarbleMesh.position.set(cx, 0.18, cz);
      courtMarbleMesh.receiveShadow = !activeTurbo;
      boardGroup.add(courtMarbleMesh);

      // 4 Nesting Altars for Pawns
      const nests = BASE_NESTS_GRID[color];
      nests.forEach((nest) => {
        const w = gridToWorld(nest.col, nest.row);

        const nestBaseGeo = new THREE.CylinderGeometry(0.56, 0.62, 0.12, 24);
        const nestBaseMesh = new THREE.Mesh(nestBaseGeo, goldRimMat);
        nestBaseMesh.position.set(w.x, 0.24, w.z);
        nestBaseMesh.receiveShadow = !activeTurbo;
        boardGroup.add(nestBaseMesh);

        const nestLipGeo = new THREE.CylinderGeometry(0.48, 0.48, 0.08, 24);
        const nestLipMat = new THREE.MeshStandardMaterial({
          color: cfg.main,
          roughness: 0.2,
          metalness: 0.3,
        });
        const nestLipMesh = new THREE.Mesh(nestLipGeo, nestLipMat);
        nestLipMesh.position.set(w.x, 0.28, w.z);
        boardGroup.add(nestLipMesh);

        const nestGemGeo = new THREE.CylinderGeometry(0.36, 0.36, 0.06, 24);
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

    // 52 Track Tiles
    const tileGeo = new THREE.BoxGeometry(0.94, 0.16, 0.94);
    const regularTileMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.22,
      metalness: 0.05,
    });

    // 3D Extruded Star Geometry for Safe Tiles
    const starShape = createStarShape(0.32, 0.14, 5);
    const starExtrudeGeo = new THREE.ExtrudeGeometry(starShape, {
      depth: 0.06,
      bevelEnabled: true,
      bevelSegments: 1,
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
      tileMesh.receiveShadow = !activeTurbo;
      boardGroup.add(tileMesh);

      if (SAFE_INDICES.includes(idx)) {
        const starMesh = new THREE.Mesh(starExtrudeGeo, starGoldMat);
        starMesh.position.set(w.x, 0.22, w.z);
        starMesh.castShadow = !activeTurbo;
        boardGroup.add(starMesh);
      }
    });

    // Home Stretch Steps
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
        stepTileMesh.receiveShadow = !activeTurbo;
        boardGroup.add(stepTileMesh);

        const stepEdgeGeo = new THREE.BoxGeometry(0.96, 0.04, 0.08);
        const stepEdgeMesh = new THREE.Mesh(stepEdgeGeo, goldRimMat);
        stepEdgeMesh.position.set(w.x, elevation + 0.08, w.z);
        boardGroup.add(stepEdgeMesh);
      });
    });

    // Center Sanctuary & Victory Dais
    const goalCenterMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.18,
      metalness: 0.45,
    });
    const centerPodiumGeo = new THREE.CylinderGeometry(1.6, 1.85, 0.32, 32);
    const centerPodium = new THREE.Mesh(centerPodiumGeo, goalCenterMat);
    centerPodium.position.set(0, 0.26, 0);
    centerPodium.receiveShadow = !activeTurbo;
    boardGroup.add(centerPodium);

    const centerRimGeo = new THREE.CylinderGeometry(1.68, 1.72, 0.08, 32);
    const centerRimMesh = new THREE.Mesh(centerRimGeo, goldRimMat);
    centerRimMesh.position.set(0, 0.38, 0);
    boardGroup.add(centerRimMesh);

    // Converging Color Petals
    const petalColors = [COLOR_HEX.red.main, COLOR_HEX.green.main, COLOR_HEX.yellow.main, COLOR_HEX.blue.main];
    petalColors.forEach((col, idx) => {
      const petalGeo = new THREE.CylinderGeometry(1.3, 1.3, 0.06, 8, 1, false, (idx * Math.PI) / 2, Math.PI / 2);
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

    const trophyBaseGeo = new THREE.CylinderGeometry(0.34, 0.46, 0.24, 20);
    const trophyBaseMesh = new THREE.Mesh(trophyBaseGeo, goldRimMat);
    trophyBaseMesh.castShadow = !activeTurbo;
    floatingTrophyGroup.add(trophyBaseMesh);

    const crownGeo = new THREE.CylinderGeometry(0.52, 0.32, 0.45, 8);
    const crownMat = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      roughness: 0.1,
      metalness: 0.95,
      emissive: 0x452a00,
    });
    const crownMesh = new THREE.Mesh(crownGeo, crownMat);
    crownMesh.position.y = 0.32;
    crownMesh.castShadow = !activeTurbo;
    floatingTrophyGroup.add(crownMesh);

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

    const orbitRingGeo = new THREE.TorusGeometry(0.68, 0.025, 8, 24);
    const orbitRingMesh = new THREE.Mesh(orbitRingGeo, goldRimMat);
    orbitRingMesh.rotation.x = Math.PI / 3;
    orbitRingMesh.position.y = 0.45;
    floatingTrophyGroup.add(orbitRingMesh);

    boardGroup.add(floatingTrophyGroup);

    // 6. Interactive 3D Dice
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
    diceMesh.castShadow = !activeTurbo;
    scene.add(diceMesh);

    // Dice Glow Launchpad
    const diceGlowPadGeo = new THREE.RingGeometry(0.8, 1.45, 24);
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

    // 7. TV Selection Beacon (Diamond pointer)
    const selectionBeaconMesh = new THREE.Group();
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

    const pointerConeGeo = new THREE.ConeGeometry(0.18, 0.4, 16);
    pointerConeGeo.rotateX(Math.PI);
    const pointerCone = new THREE.Mesh(pointerConeGeo, beaconDiamondMat);
    pointerCone.position.y = 0.22;
    selectionBeaconMesh.add(pointerCone);

    selectionBeaconMesh.visible = false;
    scene.add(selectionBeaconMesh);

    // 8. Target Destination Landing Marker
    const targetMarkerMesh = new THREE.Group();
    const targetRing1Geo = new THREE.RingGeometry(0.25, 0.42, 24);
    targetRing1Geo.rotateX(-Math.PI / 2);
    const targetRing1Mat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.92,
    });
    const targetRing1 = new THREE.Mesh(targetRing1Geo, targetRing1Mat);
    targetMarkerMesh.add(targetRing1);

    targetMarkerMesh.position.set(0, 0.42, 0);
    targetMarkerMesh.visible = false;
    scene.add(targetMarkerMesh);

    // 9. Ambient Floating Stardust (Lightweight, 40 particles on TV, static buffer rotation)
    const particleCount = activeTurbo ? 35 : 70;
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 16;
      particlePositions[i + 1] = Math.random() * 6 + 0.5;
      particlePositions[i + 2] = (Math.random() - 0.5) * 16;
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.Float32BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xfef08a,
      size: 0.16,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });
    const particlesGroup = new THREE.Points(particleGeo, particleMat);
    scene.add(particlesGroup);

    // 10. Pawns map & Halos map
    const pawnMeshes = new Map<string, THREE.Group>();
    const haloMeshes = new Map<string, THREE.Group>();

    // 11. Raycasting & Controls
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
      dirLight,
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

      // Check movable pawns click
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

      // Check 3D dice click to roll
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

    // High-Efficiency Animation Render Loop
    let clock = new THREE.Clock();
    const animate = () => {
      if (!threeRef.current) return;

      // Pause rendering if tab/window is hidden to preserve TV CPU/GPU
      if (document.hidden) {
        threeRef.current.animFrameId = requestAnimationFrame(animate);
        return;
      }

      // Clamp delta to 0.05 to prevent physics explosion during TV frame drops
      const delta = Math.min(clock.getDelta(), 0.05);
      const elapsed = clock.getElapsedTime();

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

      // Rotate center victory trophy
      floatingTrophyGroup.rotation.y = elapsed * 0.65;
      floatingTrophyGroup.position.y = 0.72 + Math.sin(elapsed * 2.2) * 0.04;

      // Zero-allocation particle rotation (no buffer re-uploads over WebGL bus)
      particlesGroup.rotation.y = elapsed * 0.04;
      particlesGroup.position.y = Math.sin(elapsed * 0.5) * 0.12;

      // Rotate movable pawn halos and bounce
      haloMeshes.forEach((haloGroup, key) => {
        haloGroup.rotation.y = elapsed * 3.0;
        const parentPawn = pawnMeshes.get(key);
        if (parentPawn && parentPawn.userData?.isMovable) {
          parentPawn.position.y = (parentPawn.userData.baseY || 0.36) + Math.abs(Math.sin(elapsed * 4.8)) * 0.22;
        }
      });

      // Smooth camera interpolation
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

      camPos.lerp(targetCamPos, 0.08);
      camLookAt.lerp(targetCamLookAt, 0.08);
      camera.position.copy(camPos);
      camera.lookAt(camLookAt);

      // Smooth dice rotation
      if (isRollingAnimation) {
        diceMesh.rotation.x += delta * 22;
        diceMesh.rotation.y += delta * 26;
        diceMesh.rotation.z += delta * 18;
        diceMesh.position.y = 1.3 + Math.abs(Math.sin(elapsed * 12)) * 1.5;
        (diceGlowPad.material as THREE.MeshBasicMaterial).opacity = 0.85;
      } else {
        diceMesh.rotation.x = THREE.MathUtils.lerp(diceMesh.rotation.x, targetDiceRot.x, 0.14);
        diceMesh.rotation.y = THREE.MathUtils.lerp(diceMesh.rotation.y, targetDiceRot.y, 0.14);
        diceMesh.rotation.z = THREE.MathUtils.lerp(diceMesh.rotation.z, targetDiceRot.z, 0.14);
        const diceTargetY = gameState.canRollDice ? 0.98 + Math.sin(elapsed * 3.5) * 0.08 : 0.90;
        diceMesh.position.y = THREE.MathUtils.lerp(diceMesh.position.y, diceTargetY, 0.14);

        const glowOpacity = gameState.canRollDice ? 0.45 + Math.sin(elapsed * 4.0) * 0.35 : 0.0;
        (diceGlowPad.material as THREE.MeshBasicMaterial).opacity = THREE.MathUtils.lerp(
          (diceGlowPad.material as THREE.MeshBasicMaterial).opacity,
          glowOpacity,
          0.1
        );
      }

      // Rotate selection beacon & destination marker
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
            mesh.position.x = THREE.MathUtils.lerp(mesh.position.x, target.x, 0.2);
            mesh.position.z = THREE.MathUtils.lerp(mesh.position.z, target.z, 0.2);
            const hopHeight = Math.sin(Math.min(1, distHoriz * 1.8) * Math.PI) * 0.85;
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
  }, [activeTurbo]);

  // Dynamic Turbo / Quality renderer updates without rebuilding entire scene
  useEffect(() => {
    if (!threeRef.current) return;
    const { renderer, dirLight, activePointLight } = threeRef.current;
    const targetPixelRatio = activeTurbo ? (isSmartTV ? 0.95 : 1.0) : Math.min(window.devicePixelRatio, 1.5);
    renderer.setPixelRatio(targetPixelRatio);
    renderer.shadowMap.enabled = !activeTurbo;
    dirLight.castShadow = !activeTurbo;
    activePointLight.visible = !activeTurbo;
  }, [activeTurbo, isSmartTV]);

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

  // Sync 3D Pawns from GameState
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

        const pawnBodyMat = new THREE.MeshStandardMaterial({
          color: cfg.main,
          roughness: 0.12,
          metalness: 0.28,
        });

        const pawnGoldMat = new THREE.MeshStandardMaterial({
          color: GOLD_COLOR,
          roughness: 0.14,
          metalness: 0.94,
        });

        // 1. Dark Velvet Felt Base Cushion
        const feltGeo = new THREE.CylinderGeometry(0.38, 0.42, 0.04, 20);
        const feltMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.9 });
        const feltMesh = new THREE.Mesh(feltGeo, feltMat);
        feltMesh.position.y = 0.02;
        pawnGroup.add(feltMesh);

        // 2. Weighted Gold Base Plinth
        const baseGeo = new THREE.CylinderGeometry(0.35, 0.44, 0.12, 24);
        const baseMesh = new THREE.Mesh(baseGeo, pawnGoldMat);
        baseMesh.position.y = 0.08;
        baseMesh.castShadow = !activeTurbo;
        pawnGroup.add(baseMesh);

        // 3. Fluted Lower Body Chalice
        const lowerBodyGeo = new THREE.CylinderGeometry(0.24, 0.35, 0.26, 24);
        const lowerBodyMesh = new THREE.Mesh(lowerBodyGeo, pawnBodyMat);
        lowerBodyMesh.position.y = 0.24;
        lowerBodyMesh.castShadow = !activeTurbo;
        pawnGroup.add(lowerBodyMesh);

        // 4. Lower Gold Ring Collar
        const lowerRingGeo = new THREE.TorusGeometry(0.25, 0.038, 8, 24);
        const lowerRingMesh = new THREE.Mesh(lowerRingGeo, pawnGoldMat);
        lowerRingMesh.rotation.x = Math.PI / 2;
        lowerRingMesh.position.y = 0.38;
        pawnGroup.add(lowerRingMesh);

        // 5. Tapered Waist Neck
        const neckGeo = new THREE.CylinderGeometry(0.18, 0.24, 0.24, 24);
        const neckMesh = new THREE.Mesh(neckGeo, pawnBodyMat);
        neckMesh.position.y = 0.50;
        neckMesh.castShadow = !activeTurbo;
        pawnGroup.add(neckMesh);

        // 6. Upper Gold Ring Collar
        const upperRingGeo = new THREE.TorusGeometry(0.19, 0.035, 8, 24);
        const upperRingMesh = new THREE.Mesh(upperRingGeo, pawnGoldMat);
        upperRingMesh.rotation.x = Math.PI / 2;
        upperRingMesh.position.y = 0.63;
        pawnGroup.add(upperRingMesh);

        // 7. Polished Jewel Head Knob
        const headGeo = new THREE.SphereGeometry(0.26, 24, 24);
        const headMat = new THREE.MeshStandardMaterial({
          color: cfg.light,
          emissive: cfg.emissive,
          roughness: 0.08,
          metalness: 0.35,
        });
        const headMesh = new THREE.Mesh(headGeo, headMat);
        headMesh.position.y = 0.84;
        headMesh.castShadow = !activeTurbo;
        pawnGroup.add(headMesh);

        // 8. Crown Finial Top
        const finialGeo = new THREE.ConeGeometry(0.08, 0.12, 8);
        const finialMesh = new THREE.Mesh(finialGeo, pawnGoldMat);
        finialMesh.position.y = 1.12;
        pawnGroup.add(finialMesh);

        // Floating Movable Halo
        const haloGroup = new THREE.Group();
        haloGroup.position.y = 1.34;

        const haloRingGeo = new THREE.TorusGeometry(0.48, 0.03, 8, 24);
        const haloRingMat = new THREE.MeshStandardMaterial({
          color: 0xfbbf24,
          emissive: 0xd97706,
          roughness: 0.1,
          metalness: 0.9,
        });
        const haloRingMesh = new THREE.Mesh(haloRingGeo, haloRingMat);
        haloRingMesh.rotation.x = Math.PI / 2;
        haloGroup.add(haloRingMesh);

        // 4 small orbiting jewels
        for (let i = 0; i < 4; i++) {
          const orbAngle = (i / 4) * Math.PI * 2;
          const orbGeo = new THREE.SphereGeometry(0.06, 8, 8);
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
  }, [gameState.pawns, gameState.movablePawns, gameState.currentTurnColor, activeTurbo]);

  // Update TV Selection Beacon & Destination Landing Marker
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

      {/* Floating 3D Camera & Performance Toolbar */}
      <div className="absolute bottom-16 sm:bottom-20 left-1/2 -translate-x-1/2 z-20 flex items-center space-x-2 bg-slate-950/85 backdrop-blur-2xl px-4 py-1.5 rounded-full border border-amber-500/30 shadow-[0_12px_40px_rgba(0,0,0,0.85)] max-w-[95vw] overflow-x-auto scrollbar-none">
        <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 flex items-center space-x-1.5 mr-1 shrink-0">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>LUDO 3D</span>
        </span>

        {/* Turbo 60 FPS Toggle Button (Hisense / Smart TV Optimization) */}
        <button
          onClick={() => {
            playSoundFX.playHop();
            if (onToggleTurbo) {
              onToggleTurbo();
            } else {
              const next = !internalTurbo;
              setInternalTurbo(next);
              localStorage.setItem('mood_tv_turbo_3d', String(next));
            }
          }}
          className={`flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0 ${
            activeTurbo
              ? 'bg-emerald-400 text-neutral-950 font-black shadow-md'
              : 'text-amber-300 hover:text-white hover:bg-white/10'
          }`}
          title="Mode Turbo 60 FPS (Optimisé pour TV Hisense et écrans connectés)"
        >
          <Zap className="w-3 h-3 fill-current" />
          <span>{activeTurbo ? 'Turbo 60 FPS' : 'Ultra Détails'}</span>
        </button>

        <div className="h-4 w-px bg-white/20 mx-0.5 shrink-0" />

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
          className={`flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0 ${
            cameraPreset === 'isometric'
              ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-neutral-950 shadow-md font-black'
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
          className={`flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0 ${
            cameraPreset === 'top'
              ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-neutral-950 shadow-md font-black'
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
          className={`flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0 ${
            cameraPreset === 'follow'
              ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-neutral-950 shadow-md font-black'
              : 'text-slate-300 hover:text-white hover:bg-white/10'
          }`}
          title="Caméra Dynamique Joueur Actif"
        >
          <Trophy className="w-3 h-3" />
          <span>Dynamique</span>
        </button>

        <div className="h-4 w-px bg-white/20 mx-0.5 shrink-0" />

        {/* Zoom In Button */}
        <button
          onClick={() => {
            playSoundFX.playHop();
            if (threeRef.current) {
              threeRef.current.orbitAngle.radius = Math.max(11.0, threeRef.current.orbitAngle.radius - 2.0);
            }
          }}
          className="w-7 h-7 rounded-full hover:bg-white/20 text-slate-200 hover:text-white flex items-center justify-center transition-all cursor-pointer shrink-0"
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
          className="w-7 h-7 rounded-full hover:bg-white/20 text-slate-200 hover:text-white flex items-center justify-center transition-all cursor-pointer shrink-0"
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
          className="w-7 h-7 rounded-full hover:bg-white/20 text-slate-200 hover:text-white flex items-center justify-center transition-all cursor-pointer shrink-0"
          title="Réinitialiser le cadrage"
        >
          <RotateCw className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
