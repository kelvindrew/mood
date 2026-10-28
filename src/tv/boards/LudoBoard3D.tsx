import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { LudoGameState, LudoPawn } from '../../types/game';
import { GameThemeId } from '../../engine/PlayThemes';
import { playSoundFX } from '../../engine/PlaySoundFX';
import { RotateCw, Sparkles, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

interface LudoBoard3DProps {
  gameState: LudoGameState;
  currentTheme: GameThemeId;
  isRollingAnimation: boolean;
  animatedDiceVal: number | null;
  onSelectPawn: (pawnId: number) => void;
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

const COLOR_HEX: Record<string, { main: number; light: number; emissive: number; str: string }> = {
  red: { main: 0xef4444, light: 0xfca5a5, emissive: 0x7f1d1d, str: '#ef4444' },
  green: { main: 0x10b981, light: 0x6ee7b7, emissive: 0x064e3b, str: '#10b981' },
  yellow: { main: 0xf59e0b, light: 0xfde047, emissive: 0x78350f, str: '#f59e0b' },
  blue: { main: 0x3b82f6, light: 0x93c5fd, emissive: 0x1e3a8a, str: '#3b82f6' },
};

// Texture generator for dice faces with round pips
function createDiceFaceTexture(value: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Background rounded white/ivory
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(0, 0, 256, 256);

  // Border gradient
  ctx.lineWidth = 14;
  ctx.strokeStyle = '#e2e8f0';
  ctx.strokeRect(7, 7, 242, 242);

  // Soft inner shadow vignette
  const grad = ctx.createRadialGradient(128, 128, 70, 128, 128, 140);
  grad.addColorStop(0, 'rgba(255,255,255,0)');
  grad.addColorStop(1, 'rgba(203,213,225,0.4)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);

  // Pip dots
  const pipColor = value === 1 ? '#ef4444' : '#0f172a';
  ctx.fillStyle = pipColor;

  const pip = (x: number, y: number, r = 26) => {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();

    // Dot specular highlight
    ctx.beginPath();
    ctx.arc(x - r * 0.3, y - r * 0.3, r * 0.35, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.65)';
    ctx.fill();
    ctx.fillStyle = pipColor;
  };

  const c = 128;
  const l = 68;
  const r = 188;

  if (value === 1) {
    pip(c, c, 38);
  } else if (value === 2) {
    pip(l, l);
    pip(r, r);
  } else if (value === 3) {
    pip(l, l);
    pip(c, c);
    pip(r, r);
  } else if (value === 4) {
    pip(l, l);
    pip(r, l);
    pip(l, r);
    pip(r, r);
  } else if (value === 5) {
    pip(l, l);
    pip(r, l);
    pip(c, c);
    pip(l, r);
    pip(r, r);
  } else if (value === 6) {
    pip(l, 58);
    pip(l, 128);
    pip(l, 198);
    pip(r, 58);
    pip(r, 128);
    pip(r, 198);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 4;
  return texture;
}

// Generate star texture for safe tiles
function createStarTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  ctx.clearRect(0, 0, 128, 128);
  ctx.fillStyle = '#fbbf24';
  ctx.strokeStyle = '#b45309';
  ctx.lineWidth = 5;

  const cx = 64;
  const cy = 64;
  const spikes = 5;
  const outer = 46;
  const inner = 20;

  let rot = (Math.PI / 2) * 3;
  let x = cx;
  let y = cy;
  const step = Math.PI / spikes;

  ctx.beginPath();
  ctx.moveTo(cx, cy - outer);
  for (let i = 0; i < spikes; i++) {
    x = cx + Math.cos(rot) * outer;
    y = cy + Math.sin(rot) * outer;
    ctx.lineTo(x, y);
    rot += step;

    x = cx + Math.cos(rot) * inner;
    y = cy + Math.sin(rot) * inner;
    ctx.lineTo(x, y);
    rot += step;
  }
  ctx.lineTo(cx, cy - outer);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

export const LudoBoard3D: React.FC<LudoBoard3DProps> = ({
  gameState,
  currentTheme,
  isRollingAnimation,
  animatedDiceVal,
  onSelectPawn,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [cameraPreset, setCameraPreset] = useState<'isometric' | 'top' | 'follow'>('isometric');

  const threeRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    pawnMeshes: Map<string, THREE.Group>;
    haloMeshes: Map<string, THREE.Mesh>;
    diceMesh: THREE.Mesh;
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
  } | null>(null);

  const starTexture = useMemo(() => createStarTexture(), []);
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
    const baseY = 0.35;
    if (pawn.isFinished) {
      // Pedestal in the center
      const angle = (pawn.id / 4) * Math.PI * 2;
      return {
        x: Math.cos(angle) * 0.9,
        y: baseY + 0.65,
        z: Math.sin(angle) * 0.9,
      };
    }

    if (pawn.isHome) {
      const nests = BASE_NESTS_GRID[pawn.color];
      const nest = nests[pawn.id] || { col: 7, row: 7 };
      const w = gridToWorld(nest.col, nest.row);
      return { x: w.x, y: baseY + 0.1, z: w.z };
    }

    if (pawn.position >= 100) {
      const stretchIdx = Math.min(4, Math.max(0, pawn.position - 100));
      const coords = HOME_STRETCH_GRID[pawn.color];
      const pt = coords?.[stretchIdx] || { col: 7, row: 7 };
      const w = gridToWorld(pt.col, pt.row);
      return { x: w.x, y: baseY + 0.15 + stretchIdx * 0.05, z: w.z };
    }

    const trackPt = TRACK_GRID[pawn.position % 52] || { col: 7, row: 7 };
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

    // Dark luxury background
    const themeBgColors: Record<GameThemeId, number> = {
      volcano: 0x0f0709,
      ice: 0x050c18,
      galaxy: 0x03040e,
      jungle_congo: 0x031008,
      desert: 0x110c05,
      classic_royal: 0x080a12,
    };
    scene.background = new THREE.Color(themeBgColors[currentTheme] || 0x07090e);
    scene.fog = new THREE.FogExp2(scene.background.getHex(), 0.012);

    // 2. Camera: Optimized closer distance (radius: 13.5) for MAXIMAL visibility!
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    const initialCamPos = new THREE.Vector3(0, 10.8, 9.2);
    const initialLookAt = new THREE.Vector3(0, 0, 0);
    camera.position.copy(initialCamPos);
    camera.lookAt(initialLookAt);

    // 3. Renderer
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
    renderer.toneMappingExposure = 1.18;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. Lights: Vibrant Studio Tabletop Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xfffaea, 2.0);
    dirLight.position.set(12, 22, 10);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 50;
    dirLight.shadow.camera.left = -11;
    dirLight.shadow.camera.right = 11;
    dirLight.shadow.camera.top = 11;
    dirLight.shadow.camera.bottom = -11;
    dirLight.shadow.radius = 2.2;
    scene.add(dirLight);

    // Fill rim light
    const fillLight = new THREE.DirectionalLight(0xa5c9ff, 0.8);
    fillLight.position.set(-12, 14, -10);
    scene.add(fillLight);

    // Dynamic player point light
    const activePointLight = new THREE.PointLight(0xef4444, 2.8, 20, 1.2);
    activePointLight.position.set(0, 4.5, 0);
    scene.add(activePointLight);

    // 5. Build 3D Board
    const boardGroup = new THREE.Group();
    scene.add(boardGroup);

    // --- Table Plinth / Slab (Walnut / Carbon finish) ---
    const plinthMat = new THREE.MeshStandardMaterial({
      color: 0x161922,
      roughness: 0.22,
      metalness: 0.2,
    });
    const plinthGeo = new THREE.BoxGeometry(16.6, 0.7, 16.6);
    const plinthMesh = new THREE.Mesh(plinthGeo, plinthMat);
    plinthMesh.position.y = -0.35;
    plinthMesh.receiveShadow = true;
    boardGroup.add(plinthMesh);

    // Golden / Brass Board Rim Inlay
    const rimMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      roughness: 0.25,
      metalness: 0.85,
    });
    const rimGeo = new THREE.BoxGeometry(16.9, 0.16, 16.9);
    const rimMesh = new THREE.Mesh(rimGeo, rimMat);
    rimMesh.position.y = -0.05;
    boardGroup.add(rimMesh);

    // Board Surface
    const surfaceMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.18,
      metalness: 0.05,
    });
    const surfaceGeo = new THREE.BoxGeometry(15.2, 0.1, 15.2);
    const surfaceMesh = new THREE.Mesh(surfaceGeo, surfaceMat);
    surfaceMesh.position.y = 0.05;
    surfaceMesh.receiveShadow = true;
    boardGroup.add(surfaceMesh);

    // --- 4 Base Quadrants ---
    const basesConfig: { color: string; cx: number; cz: number }[] = [
      { color: 'red', cx: -4.5, cz: -4.5 },
      { color: 'green', cx: 4.5, cz: -4.5 },
      { color: 'yellow', cx: 4.5, cz: 4.5 },
      { color: 'blue', cx: -4.5, cz: 4.5 },
    ];

    basesConfig.forEach(({ color, cx, cz }) => {
      const cfg = COLOR_HEX[color];

      // Base Platform
      const baseMat = new THREE.MeshStandardMaterial({
        color: cfg.main,
        roughness: 0.18,
        metalness: 0.15,
      });
      const baseGeo = new THREE.BoxGeometry(5.8, 0.15, 5.8);
      const baseMesh = new THREE.Mesh(baseGeo, baseMat);
      baseMesh.position.set(cx, 0.13, cz);
      baseMesh.receiveShadow = true;
      boardGroup.add(baseMesh);

      // Inner White Courtyard
      const courtMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.25,
      });
      const courtGeo = new THREE.BoxGeometry(4.2, 0.16, 4.2);
      const courtMesh = new THREE.Mesh(courtGeo, courtMat);
      courtMesh.position.set(cx, 0.14, cz);
      courtMesh.receiveShadow = true;
      boardGroup.add(courtMesh);

      // 4 Nests in courtyard
      const nests = BASE_NESTS_GRID[color];
      nests.forEach((nest) => {
        const w = gridToWorld(nest.col, nest.row);

        // Nest rim
        const nestRimGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.09, 24);
        const nestRimMat = new THREE.MeshStandardMaterial({
          color: cfg.main,
          roughness: 0.25,
          metalness: 0.3,
        });
        const nestRimMesh = new THREE.Mesh(nestRimGeo, nestRimMat);
        nestRimMesh.position.set(w.x, 0.21, w.z);
        nestRimMesh.receiveShadow = true;
        boardGroup.add(nestRimMesh);

        // Nest center indentation
        const nestCupGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.1, 24);
        const nestCupMat = new THREE.MeshStandardMaterial({
          color: 0xffffff,
          roughness: 0.2,
        });
        const nestCupMesh = new THREE.Mesh(nestCupGeo, nestCupMat);
        nestCupMesh.position.set(w.x, 0.22, w.z);
        boardGroup.add(nestCupMesh);
      });
    });

    // --- 52 Track Tiles (Glossy Acrylic with Chamfer) ---
    const tileGeo = new THREE.BoxGeometry(0.94, 0.15, 0.94);
    const regularTileMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.3,
      metalness: 0.05,
    });

    TRACK_GRID.forEach((pt, idx) => {
      const w = gridToWorld(pt.col, pt.row);
      let mat = regularTileMat;

      // Color Start Tiles
      if (idx === 0) {
        mat = new THREE.MeshStandardMaterial({ color: COLOR_HEX.red.main, roughness: 0.18 });
      } else if (idx === 13) {
        mat = new THREE.MeshStandardMaterial({ color: COLOR_HEX.green.main, roughness: 0.18 });
      } else if (idx === 26) {
        mat = new THREE.MeshStandardMaterial({ color: COLOR_HEX.yellow.main, roughness: 0.18 });
      } else if (idx === 39) {
        mat = new THREE.MeshStandardMaterial({ color: COLOR_HEX.blue.main, roughness: 0.18 });
      }

      const tileMesh = new THREE.Mesh(tileGeo, mat);
      tileMesh.position.set(w.x, 0.13, w.z);
      tileMesh.receiveShadow = true;
      boardGroup.add(tileMesh);

      // Safe Star Tile Overlay
      if (SAFE_INDICES.includes(idx)) {
        const starGeo = new THREE.PlaneGeometry(0.72, 0.72);
        const starMat = new THREE.MeshBasicMaterial({
          map: starTexture,
          transparent: true,
          depthWrite: false,
        });
        const starMesh = new THREE.Mesh(starGeo, starMat);
        starMesh.rotation.x = -Math.PI / 2;
        starMesh.position.set(w.x, 0.21, w.z);
        boardGroup.add(starMesh);
      }
    });

    // --- Home Stretch Tiles (Elevated Steps) ---
    Object.entries(HOME_STRETCH_GRID).forEach(([color, coords]) => {
      const cfg = COLOR_HEX[color];
      const stretchMat = new THREE.MeshStandardMaterial({
        color: cfg.main,
        roughness: 0.2,
        metalness: 0.25,
      });

      coords.forEach((pt, idx) => {
        const w = gridToWorld(pt.col, pt.row);
        const stepTileMesh = new THREE.Mesh(tileGeo, stretchMat);
        stepTileMesh.position.set(w.x, 0.15 + idx * 0.02, w.z);
        stepTileMesh.receiveShadow = true;
        boardGroup.add(stepTileMesh);
      });
    });

    // --- Center Goal Triangles & Victory Dais ---
    const goalCenterMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.2,
      metalness: 0.35,
    });
    const centerPodiumGeo = new THREE.CylinderGeometry(1.5, 1.7, 0.28, 32);
    const centerPodium = new THREE.Mesh(centerPodiumGeo, goalCenterMat);
    centerPodium.position.set(0, 0.24, 0);
    centerPodium.receiveShadow = true;
    boardGroup.add(centerPodium);

    // Center Gold Crown / Trophy
    const crownMat = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      roughness: 0.12,
      metalness: 0.95,
    });
    const crownGeo = new THREE.CylinderGeometry(0.38, 0.22, 0.48, 6);
    const crownMesh = new THREE.Mesh(crownGeo, crownMat);
    crownMesh.position.set(0, 0.54, 0);
    crownMesh.castShadow = true;
    boardGroup.add(crownMesh);

    // 6. Dice in 3D Space
    const diceGeo = new THREE.BoxGeometry(1.25, 1.25, 1.25);
    const diceMaterials = diceTextures.map((tex) =>
      new THREE.MeshStandardMaterial({
        map: tex,
        roughness: 0.15,
        metalness: 0.05,
      })
    );
    const diceMesh = new THREE.Mesh(diceGeo, diceMaterials);
    diceMesh.position.set(0, 0.9, 0);
    diceMesh.castShadow = true;
    scene.add(diceMesh);

    // 7. Pawns map & Halos map
    const pawnMeshes = new Map<string, THREE.Group>();
    const haloMeshes = new Map<string, THREE.Mesh>();

    // 8. Raycasting & Mouse Controls: Closer default radius (13.5) for MAX board size!
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const orbitAngle = { theta: 0, phi: 0.95, radius: 13.5 };

    threeRef.current = {
      scene,
      camera,
      renderer,
      pawnMeshes,
      haloMeshes,
      diceMesh,
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
        7.5,
        Math.min(19, threeRef.current.orbitAngle.radius + e.deltaY * 0.012)
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
          }
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
        targetDiceRot,
        orbitAngle,
        camPos,
        camLookAt,
        targetCamPos,
        targetCamLookAt,
      } = threeRef.current;

      // Rotate crown in center
      crownMesh.rotation.y = elapsed * 0.8;

      // Rotate movable pawn halos and prominent bounce animation
      haloMeshes.forEach((halo, key) => {
        halo.rotation.z = elapsed * 3.0;
        const parentPawn = pawnMeshes.get(key);
        if (parentPawn && parentPawn.userData?.isMovable) {
          // Energetic hop pulse
          parentPawn.position.y = (parentPawn.userData.baseY || 0.35) + Math.abs(Math.sin(elapsed * 5)) * 0.22;
        }
      });

      // Smooth camera interpolation based on preset
      if (cameraPreset === 'top') {
        targetCamPos.set(0, 14.5, 0.01);
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
        diceMesh.rotation.x += delta * 20;
        diceMesh.rotation.y += delta * 24;
        diceMesh.rotation.z += delta * 16;
        diceMesh.position.y = 1.2 + Math.abs(Math.sin(elapsed * 12)) * 1.5;
      } else {
        diceMesh.rotation.x = THREE.MathUtils.lerp(diceMesh.rotation.x, targetDiceRot.x, 0.12);
        diceMesh.rotation.y = THREE.MathUtils.lerp(diceMesh.rotation.y, targetDiceRot.y, 0.12);
        diceMesh.rotation.z = THREE.MathUtils.lerp(diceMesh.rotation.z, targetDiceRot.z, 0.12);
        diceMesh.position.y = THREE.MathUtils.lerp(diceMesh.position.y, 0.88, 0.12);
      }

      // Smooth pawn position transitions (hops)
      pawnMeshes.forEach((mesh) => {
        const target = mesh.userData.targetPos;
        if (target) {
          mesh.position.x = THREE.MathUtils.lerp(mesh.position.x, target.x, 0.16);
          mesh.position.z = THREE.MathUtils.lerp(mesh.position.z, target.z, 0.16);
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
      volcano: 0x0f0709,
      ice: 0x050c18,
      galaxy: 0x03040e,
      jungle_congo: 0x031008,
      desert: 0x110c05,
      classic_royal: 0x080a12,
    };
    scene.background = new THREE.Color(themeBgColors[currentTheme] || 0x07090e);
    if (scene.fog) {
      scene.fog.color = new THREE.Color(themeBgColors[currentTheme] || 0x07090e);
    }

    const activeColor = gameState?.currentTurnColor || 'red';
    activePointLight.color.setHex(COLOR_HEX[activeColor]?.main || 0xef4444);
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

        // Turned Chess/Ludo Pawn Geometry
        const pawnMat = new THREE.MeshStandardMaterial({
          color: cfg.main,
          roughness: 0.15,
          metalness: 0.18,
        });

        // Base Flange
        const baseGeo = new THREE.CylinderGeometry(0.35, 0.44, 0.15, 24);
        const baseMesh = new THREE.Mesh(baseGeo, pawnMat);
        baseMesh.position.y = 0.075;
        baseMesh.castShadow = true;
        pawnGroup.add(baseMesh);

        // Body Waist
        const waistGeo = new THREE.CylinderGeometry(0.19, 0.35, 0.4, 24);
        const waistMesh = new THREE.Mesh(waistGeo, pawnMat);
        waistMesh.position.y = 0.34;
        waistMesh.castShadow = true;
        pawnGroup.add(waistMesh);

        // Gold Ring Collar
        const collarMat = new THREE.MeshStandardMaterial({
          color: 0xffffff,
          roughness: 0.18,
          metalness: 0.85,
        });
        const collarGeo = new THREE.TorusGeometry(0.21, 0.045, 12, 24);
        const collarMesh = new THREE.Mesh(collarGeo, collarMat);
        collarMesh.rotation.x = Math.PI / 2;
        collarMesh.position.y = 0.54;
        pawnGroup.add(collarMesh);

        // Spherical Head Knob
        const headGeo = new THREE.SphereGeometry(0.28, 24, 24);
        const headMesh = new THREE.Mesh(headGeo, pawnMat);
        headMesh.position.y = 0.76;
        headMesh.castShadow = true;
        pawnGroup.add(headMesh);

        // Floating Movable Halo
        const haloMat = new THREE.MeshBasicMaterial({
          color: 0xffd700,
          wireframe: true,
        });
        const haloGeo = new THREE.TorusGeometry(0.5, 0.045, 8, 24);
        const haloMesh = new THREE.Mesh(haloGeo, haloMat);
        haloMesh.rotation.x = Math.PI / 2;
        haloMesh.position.y = 1.2;
        pawnGroup.add(haloMesh);
        haloMeshes.set(key, haloMesh);

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

  // Adjust camera to player corner when 'follow' preset is active
  useEffect(() => {
    if (cameraPreset !== 'follow' || !threeRef.current) return;
    const activeColor = gameState.currentTurnColor || 'red';
    const angleMap: Record<string, { theta: number; phi: number }> = {
      red: { theta: -Math.PI / 4, phi: 0.95 },
      green: { theta: Math.PI / 4, phi: 0.95 },
      yellow: { theta: (3 * Math.PI) / 4, phi: 0.95 },
      blue: { theta: (-3 * Math.PI) / 4, phi: 0.95 },
    };
    const targetAngle = angleMap[activeColor] || angleMap.red;
    threeRef.current.orbitAngle.theta = targetAngle.theta;
    threeRef.current.orbitAngle.phi = targetAngle.phi;
    threeRef.current.orbitAngle.radius = 12.2; // Dramatic close-up on the active corner!
  }, [gameState.currentTurnColor, cameraPreset]);

  return (
    <div className="relative w-full h-full select-none overflow-hidden">
      {/* 3D Canvas Container */}
      <div
        ref={containerRef}
        className="w-full h-full cursor-grab active:cursor-grabbing absolute inset-0"
      />

      {/* Floating 3D Camera Controls Toolbar (discreet bottom toolbar) */}
      <div className="absolute bottom-16 sm:bottom-20 left-1/2 -translate-x-1/2 z-20 flex items-center space-x-2 bg-black/75 backdrop-blur-xl px-4 py-1.5 rounded-full border border-white/20 shadow-2xl">
        <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 flex items-center space-x-1 mr-1">
          <Sparkles className="w-3 h-3" />
          <span>VUE 3D</span>
        </span>

        {/* Isometric Preset */}
        <button
          onClick={() => {
            playSoundFX.playHop();
            if (threeRef.current) {
              threeRef.current.orbitAngle.radius = 13.5;
            }
            setCameraPreset('isometric');
          }}
          className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
            cameraPreset === 'isometric'
              ? 'bg-amber-400 text-neutral-950 shadow-md font-black'
              : 'text-slate-300 hover:text-white hover:bg-white/10'
          }`}
          title="Vue 3D Isométrique Plein Écran"
        >
          Isométrique
        </button>

        {/* Top-Down Preset */}
        <button
          onClick={() => {
            playSoundFX.playHop();
            setCameraPreset('top');
          }}
          className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
            cameraPreset === 'top'
              ? 'bg-amber-400 text-neutral-950 shadow-md font-black'
              : 'text-slate-300 hover:text-white hover:bg-white/10'
          }`}
          title="Vue du Dessus Plein Écran"
        >
          Dessus
        </button>

        {/* Follow Player Preset */}
        <button
          onClick={() => {
            playSoundFX.playHop();
            setCameraPreset('follow');
          }}
          className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
            cameraPreset === 'follow'
              ? 'bg-amber-400 text-neutral-950 shadow-md font-black'
              : 'text-slate-300 hover:text-white hover:bg-white/10'
          }`}
          title="Suivre le Joueur Actif au plus près"
        >
          Dynamique
        </button>

        <div className="h-4 w-px bg-white/20 mx-1" />

        {/* Zoom In Button */}
        <button
          onClick={() => {
            playSoundFX.playHop();
            if (threeRef.current) {
              threeRef.current.orbitAngle.radius = Math.max(7.5, threeRef.current.orbitAngle.radius - 1.8);
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
              threeRef.current.orbitAngle.radius = Math.min(19, threeRef.current.orbitAngle.radius + 1.8);
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
              threeRef.current.orbitAngle.phi = 0.95;
              threeRef.current.orbitAngle.radius = 13.5;
              setCameraPreset('isometric');
            }
          }}
          className="w-7 h-7 rounded-full hover:bg-white/20 text-slate-200 hover:text-white flex items-center justify-center transition-all cursor-pointer"
          title="Réinitialiser la vue et le zoom"
        >
          <RotateCw className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
