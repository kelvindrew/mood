import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { useGame } from '../../context/GameContext';
import { WildRushGameState, WildRushPlayerState } from '../../types/game';
import { Trophy, Zap, Flame, Crown, Flag, AlertTriangle, ArrowRight, RotateCcw, Home } from 'lucide-react';
import { audio } from '../../services/audio';

export const WildRushBoardTV: React.FC = () => {
  const { room, replayGame, returnToLobby } = useGame();
  const mountRef = useRef<HTMLDivElement>(null);
  const gameState = room?.gameState as WildRushGameState | undefined;

  // Scene references
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const runnersMeshesRef = useRef<Map<string, THREE.Group>>(new Map());
  const particlesRef = useRef<THREE.Points | null>(null);
  const waterMeshRef = useRef<THREE.Mesh | null>(null);
  const finishArchRef = useRef<THREE.Group | null>(null);
  const reqIdRef = useRef<number | null>(null);

  const [activeTab, setActiveTab] = useState<'live' | 'stats'>('live');

  // Runners & Environments
  const runners: WildRushPlayerState[] = useMemo(() => {
    return gameState?.players || [];
  }, [gameState?.players]);

  const currentEnv = gameState?.currentEnvironment;
  const phase = gameState?.phase || 'countdown';
  const countdown = gameState?.countdown ?? 3;

  // ----------------------------------------------------
  // THREE.JS INITIALIZATION & LIFECYCLE
  // ----------------------------------------------------
  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // 1. Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a);
    scene.fog = new THREE.FogExp2(0x0f172a, 0.007);
    sceneRef.current = scene;

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(58, width / height, 0.1, 1000);
    camera.position.set(0, 8, -14);
    camera.lookAt(0, 2, 20);
    cameraRef.current = camera;

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff7ed, 1.2);
    sunLight.position.set(20, 40, 20);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 150;
    sunLight.shadow.camera.left = -30;
    sunLight.shadow.camera.right = 30;
    sunLight.shadow.camera.top = 30;
    sunLight.shadow.camera.bottom = -30;
    scene.add(sunLight);

    // 5. Track Geometry (1000m long track with 4 lanes)
    const TRACK_LENGTH = 1100;
    const TRACK_WIDTH = 14;

    const trackGeo = new THREE.PlaneGeometry(TRACK_WIDTH, TRACK_LENGTH, 16, 200);
    const trackMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.8,
      metalness: 0.1,
    });
    const track = new THREE.Mesh(trackGeo, trackMat);
    track.rotation.x = -Math.PI / 2;
    track.position.set(0, 0, TRACK_LENGTH / 2 - 20);
    track.receiveShadow = true;
    scene.add(track);

    // Lane dividing lines
    const laneLinesGroup = new THREE.Group();
    [-3.5, 0, 3.5].forEach((xOffset) => {
      const lineGeo = new THREE.PlaneGeometry(0.2, TRACK_LENGTH);
      const lineMat = new THREE.MeshBasicMaterial({ color: 0xffffff, opacity: 0.6, transparent: true });
      const lineMesh = new THREE.Mesh(lineGeo, lineMat);
      lineMesh.rotation.x = -Math.PI / 2;
      lineMesh.position.set(xOffset, 0.02, TRACK_LENGTH / 2 - 20);
      laneLinesGroup.add(lineMesh);
    });
    scene.add(laneLinesGroup);

    // Track Borders
    const borderMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.5 });
    const borderGeo = new THREE.BoxGeometry(0.8, 0.6, TRACK_LENGTH);
    const leftBorder = new THREE.Mesh(borderGeo, borderMat);
    leftBorder.position.set(-TRACK_WIDTH / 2 - 0.4, 0.3, TRACK_LENGTH / 2 - 20);
    scene.add(leftBorder);

    const rightBorder = new THREE.Mesh(borderGeo, borderMat);
    rightBorder.position.set(TRACK_WIDTH / 2 + 0.4, 0.3, TRACK_LENGTH / 2 - 20);
    scene.add(rightBorder);

    // 6. Terrain & Environment Props
    const terrainGeo = new THREE.PlaneGeometry(300, TRACK_LENGTH + 200, 32, 100);
    const terrainMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.9,
    });
    const terrain = new THREE.Mesh(terrainGeo, terrainMat);
    terrain.rotation.x = -Math.PI / 2;
    terrain.position.set(0, -0.1, TRACK_LENGTH / 2 - 20);
    terrain.receiveShadow = true;
    scene.add(terrain);

    // 7. Scenic landmarks along the 8 sections
    // (a) Section 1: River (0 - 125m) -> River water plane crossing track
    const riverGeo = new THREE.PlaneGeometry(60, 40);
    const riverMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.1,
      metalness: 0.8,
      transparent: true,
      opacity: 0.85,
    });
    const riverMesh = new THREE.Mesh(riverGeo, riverMat);
    riverMesh.rotation.x = -Math.PI / 2;
    riverMesh.position.set(0, 0.05, 75);
    scene.add(riverMesh);
    waterMeshRef.current = riverMesh;

    // (b) Section 4: Arctic Ice (375 - 500m) -> Icebergs
    for (let i = 0; i < 12; i++) {
      const icebergGeo = new THREE.ConeGeometry(5 + Math.random() * 4, 8 + Math.random() * 6, 6);
      const icebergMat = new THREE.MeshStandardMaterial({ color: 0xe0f2fe, roughness: 0.2, flatShading: true });
      const iceberg = new THREE.Mesh(icebergGeo, icebergMat);
      iceberg.position.set((Math.random() > 0.5 ? 1 : -1) * (15 + Math.random() * 25), 4, 380 + i * 10);
      scene.add(iceberg);
    }

    // (c) Section 5: Volcano (500 - 625m) -> Lava fissures
    for (let i = 0; i < 8; i++) {
      const lavaGeo = new THREE.PlaneGeometry(8, 6);
      const lavaMat = new THREE.MeshBasicMaterial({ color: 0xf97316 });
      const lava = new THREE.Mesh(lavaGeo, lavaMat);
      lava.rotation.x = -Math.PI / 2;
      lava.position.set((Math.random() > 0.5 ? 1 : -1) * (12 + Math.random() * 8), 0.03, 520 + i * 15);
      scene.add(lava);
    }

    // (d) Start Archway (at Z = 0)
    const startArch = new THREE.Group();
    const pillarMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.5 });
    const p1 = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 7), pillarMat);
    p1.position.set(-TRACK_WIDTH / 2, 3.5, 0);
    const p2 = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 7), pillarMat);
    p2.position.set(TRACK_WIDTH / 2, 3.5, 0);
    const crossbar = new THREE.Mesh(new THREE.BoxGeometry(TRACK_WIDTH + 1, 1, 1), new THREE.MeshStandardMaterial({ color: 0x22c55e }));
    crossbar.position.set(0, 7, 0);
    startArch.add(p1, p2, crossbar);
    scene.add(startArch);

    // (e) Grand Finish Line Archway (at Z = 1000m)
    const finishArch = new THREE.Group();
    finishArch.position.set(0, 0, 1000);
    const f1 = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 10), new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.8 }));
    f1.position.set(-TRACK_WIDTH / 2 - 1, 5, 0);
    const f2 = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 10), new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.8 }));
    f2.position.set(TRACK_WIDTH / 2 + 1, 5, 0);
    const finishBanner = new THREE.Mesh(
      new THREE.BoxGeometry(TRACK_WIDTH + 3, 2, 1),
      new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.2 })
    );
    finishBanner.position.set(0, 9.5, 0);
    finishArch.add(f1, f2, finishBanner);
    scene.add(finishArch);
    finishArchRef.current = finishArch;

    // 8. Particle System (speed trails / dust)
    const particleCount = 200;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePos[i] = (Math.random() - 0.5) * TRACK_WIDTH;
      particlePos[i + 1] = Math.random() * 4;
      particlePos[i + 2] = Math.random() * 50;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xf59e0b,
      size: 0.35,
      transparent: true,
      opacity: 0.7,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);
    particlesRef.current = particles;

    // 9. Resize listener
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // 10. Animation Loop
    let clock = new THREE.Clock();

    const animate = () => {
      reqIdRef.current = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Subtle water shimmer
      if (waterMeshRef.current) {
        waterMeshRef.current.position.y = 0.05 + Math.sin(time * 3) * 0.02;
      }

      // Animate particles relative to camera
      if (particlesRef.current && cameraRef.current) {
        const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
        for (let i = 2; i < positions.length; i += 3) {
          positions[i] += delta * 15;
          if (positions[i] > cameraRef.current.position.z + 40) {
            positions[i] = cameraRef.current.position.z - 20;
          }
        }
        particlesRef.current.geometry.attributes.position.needsUpdate = true;
      }

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      if (reqIdRef.current) cancelAnimationFrame(reqIdRef.current);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // ----------------------------------------------------
  // RUNNERS 3D AVATAR RECONCILIATION & POSITIONING
  // ----------------------------------------------------
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    const colorHexMap: Record<string, number> = {
      red: 0xef4444,
      blue: 0x3b82f6,
      green: 0x10b981,
      yellow: 0xf59e0b,
      purple: 0x8b5cf6,
      cyan: 0x06b6d4,
      orange: 0xf97316,
      pink: 0xec4899,
    };

    runners.forEach((runner, idx) => {
      let runnerGroup = runnersMeshesRef.current.get(runner.id);

      if (!runnerGroup) {
        runnerGroup = new THREE.Group();
        const baseColor = colorHexMap[runner.color] || 0xef4444;

        // Runner body: Stylized low-poly runner
        const torso = new THREE.Mesh(
          new THREE.BoxGeometry(0.9, 1.2, 0.6),
          new THREE.MeshStandardMaterial({ color: baseColor, roughness: 0.4 })
        );
        torso.position.y = 1.3;
        torso.castShadow = true;
        runnerGroup.add(torso);

        // Head
        const head = new THREE.Mesh(
          new THREE.SphereGeometry(0.4, 16, 16),
          new THREE.MeshStandardMaterial({ color: 0xffedd5, roughness: 0.3 })
        );
        head.position.y = 2.2;
        head.castShadow = true;
        runnerGroup.add(head);

        // Headband matching color
        const headband = new THREE.Mesh(
          new THREE.CylinderGeometry(0.42, 0.42, 0.15, 16),
          new THREE.MeshBasicMaterial({ color: baseColor })
        );
        headband.position.y = 2.3;
        runnerGroup.add(headband);

        // Legs
        const legMat = new THREE.MeshStandardMaterial({ color: 0x1e293b });
        const leftLeg = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.9, 0.3), legMat);
        leftLeg.position.set(-0.25, 0.45, 0);
        leftLeg.name = 'leftLeg';
        runnerGroup.add(leftLeg);

        const rightLeg = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.9, 0.3), legMat);
        rightLeg.position.set(0.25, 0.45, 0);
        rightLeg.name = 'rightLeg';
        runnerGroup.add(rightLeg);

        // Glowing Boost Aura Ring (at runner's feet)
        const auraGeo = new THREE.RingGeometry(0.8, 1.3, 24);
        const auraMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b, side: THREE.DoubleSide, transparent: true, opacity: 0 });
        const aura = new THREE.Mesh(auraGeo, auraMat);
        aura.rotation.x = -Math.PI / 2;
        aura.position.y = 0.05;
        aura.name = 'aura';
        runnerGroup.add(aura);

        scene.add(runnerGroup);
        runnersMeshesRef.current.set(runner.id, runnerGroup);
      }

      // Update position along track
      const laneX = [-4.2, -1.4, 1.4, 4.2][idx % 4];
      const targetZ = Math.min(1000, runner.distance);

      runnerGroup.position.x = laneX;
      runnerGroup.position.z = THREE.MathUtils.lerp(runnerGroup.position.z, targetZ, 0.25);

      // Running animation: bobbing & leg swing
      const runSpeedFactor = runner.currentSpeed / 18.0;
      const legAngle = Math.sin(Date.now() * 0.015 * runSpeedFactor) * 0.7;
      const leftLeg = runnerGroup.getObjectByName('leftLeg');
      const rightLeg = runnerGroup.getObjectByName('rightLeg');
      if (leftLeg && rightLeg) {
        leftLeg.rotation.x = legAngle;
        rightLeg.rotation.x = -legAngle;
      }
      runnerGroup.position.y = Math.abs(Math.sin(Date.now() * 0.02 * runSpeedFactor)) * 0.25;

      // Boost Aura visualization
      const aura = runnerGroup.getObjectByName('aura') as THREE.Mesh | undefined;
      if (aura && aura.material) {
        (aura.material as THREE.MeshBasicMaterial).opacity = runner.boostActive ? 0.85 : 0;
      }
    });

    // Camera dynamic follow logic: smoothly track leader or cluster center
    const camera = cameraRef.current;
    if (camera && runners.length > 0) {
      const leaderZ = Math.max(...runners.map(r => r.distance));
      const targetCamZ = leaderZ - 14;
      const targetCamY = phase === 'challenge' ? 12 : 7.5;

      camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetCamZ, 0.1);
      camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetCamY, 0.1);
      camera.lookAt(0, 2.5, camera.position.z + 24);
    }
  }, [runners, phase]);

  // Environment Sky & Lighting updates
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene || !currentEnv) return;

    const skyHex = parseInt(currentEnv.skyColor.replace('#', '0x'), 16) || 0x38bdf8;
    scene.background = new THREE.Color(skyHex);
    if (scene.fog) {
      (scene.fog as THREE.FogExp2).color.setHex(skyHex);
    }
  }, [currentEnv]);

  // Audio effects on countdown & challenge events
  useEffect(() => {
    if (phase === 'challenge') {
      audio.playSelect();
    } else if (phase === 'finished') {
      audio.playVictory();
    }
  }, [phase]);

  return (
    <div className="relative w-screen h-screen overflow-hidden select-none bg-black text-white">
      {/* 1. Real-time 3D Three.js Canvas Container */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full z-0 cursor-none" />

      {/* 2. Top Smart TV HUD Header */}
      <div className="absolute top-0 inset-x-0 z-20 px-8 py-5 bg-gradient-to-b from-black/85 via-black/40 to-transparent flex items-center justify-between pointer-events-none">
        {/* Left: Game Title & Environment Pill */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-400/40 backdrop-blur-md shadow-lg">
            <Zap className="w-5 h-5 text-emerald-400 animate-pulse" />
            <span className="font-display font-black text-xl tracking-wider text-white">WILD RUSH 3D</span>
          </div>

          {currentEnv && (
            <div className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-white/10 border border-white/15 backdrop-blur-md">
              <span className="text-xs font-black uppercase text-amber-300 tracking-wider">
                {currentEnv.name}
              </span>
              <span className="text-[11px] text-gray-300 font-bold">
                ({currentEnv.trackStartDist}m – {currentEnv.trackEndDist}m)
              </span>
            </div>
          )}
        </div>

        {/* Center: Live 1000m Race Track Progress Bar */}
        <div className="flex-1 max-w-xl mx-8 flex flex-col space-y-1">
          <div className="flex justify-between text-[11px] font-black uppercase tracking-wider text-gray-300">
            <span>DÉPART</span>
            <span className="text-amber-400 font-mono font-bold">ARRIVÉE (1000M)</span>
          </div>
          <div className="relative w-full h-3.5 bg-black/60 rounded-full border border-white/20 overflow-hidden shadow-inner">
            {/* Environment milestones */}
            <div className="absolute inset-0 flex justify-between px-2 pointer-events-none opacity-30">
              {[125, 250, 375, 500, 625, 750, 875].map(dist => (
                <div key={dist} className="w-0.5 h-full bg-white/50" />
              ))}
            </div>
            {/* Runner icons on the track bar */}
            {runners.map(runner => {
              const colorBg = {
                red: 'bg-red-500',
                blue: 'bg-blue-500',
                green: 'bg-emerald-500',
                yellow: 'bg-amber-400',
              }[runner.color] || 'bg-white';

              return (
                <div
                  key={runner.id}
                  style={{ left: `${Math.min(97, runner.progressPercent)}%` }}
                  className={`absolute top-0 bottom-0 w-3 rounded-full ${colorBg} shadow-[0_0_10px_currentColor] transition-all duration-150 transform -translate-x-1/2`}
                  title={`${runner.name}: ${Math.round(runner.distance)}m`}
                />
              );
            })}
          </div>
        </div>

        {/* Right: Live Leaderboard Podiums (1 to 4) */}
        <div className="flex items-center space-x-2">
          {runners
            .slice()
            .sort((a, b) => a.rank - b.rank)
            .map(runner => (
              <div
                key={runner.id}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border backdrop-blur-md shadow-md ${
                  runner.rank === 1
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                    : 'bg-black/50 border-white/10 text-gray-300'
                }`}
              >
                <span className="font-mono font-black text-xs">#{runner.rank}</span>
                <span className="font-bold text-xs truncate max-w-[80px] text-white">{runner.name}</span>
                <span className="font-mono text-[11px] font-bold text-gray-300">{Math.round(runner.distance)}m</span>
                {runner.comboCount >= 2 && (
                  <span className="flex items-center text-[10px] font-black text-amber-400">
                    <Flame className="w-3 h-3 fill-current" />
                    {runner.comboCount}
                  </span>
                )}
              </div>
            ))}
        </div>
      </div>

      {/* 3. Countdown Overlay Before Start */}
      {phase === 'countdown' && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 backdrop-blur-sm pointer-events-none">
          <div className="flex flex-col items-center space-y-4 animate-scale-in text-center">
            <span className="text-2xl font-display font-black tracking-widest text-amber-400 uppercase">
              LA COURSE COMMENCE DANS
            </span>
            <span className="text-9xl font-display font-black text-white animate-pulse drop-shadow-[0_0_60px_rgba(245,158,11,0.9)]">
              {countdown > 0 ? countdown : 'GO !'}
            </span>
            <span className="text-sm font-bold text-gray-300 tracking-wider">
              Observez la TV & Préparez vos smartphones !
            </span>
          </div>
        </div>
      )}

      {/* 4. Active Challenge Modal / Alert Banner */}
      {phase === 'challenge' && currentEnv && (
        <div className="absolute top-28 inset-x-0 z-30 flex flex-col items-center px-6 pointer-events-none animate-slide-down">
          <div className="max-w-3xl w-full p-6 rounded-3xl bg-[#0F172A]/95 border-2 border-amber-400/80 shadow-[0_0_50px_rgba(245,158,11,0.4)] backdrop-blur-xl flex flex-col items-center text-center space-y-4">
            <div className="flex items-center space-x-3">
              <span className="px-3 py-1 rounded-full bg-rose-500 text-white font-black text-xs uppercase tracking-wider animate-pulse flex items-center space-x-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>OBSTACLE EN VUE</span>
              </span>
              <h2 className="text-3xl font-display font-black text-white tracking-wide">
                {currentEnv.obstacleTitle}
              </h2>
            </div>

            <p className="text-base text-gray-200 font-medium max-w-xl leading-relaxed">
              {currentEnv.obstacleDescription}
            </p>

            {/* Circular 8s countdown */}
            <div className="flex items-center space-x-6 pt-2">
              <div className="w-16 h-16 rounded-full border-4 border-amber-400 flex items-center justify-center font-display font-black text-3xl text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.6)] animate-pulse">
                {gameState?.challengeTimeLeft ?? 8}s
              </div>
              <div className="text-left">
                <div className="font-display font-black text-base text-white">📱 CHOISISSEZ SUR SMARTPHONE !</div>
                <div className="text-xs text-emerald-400 font-bold">Sélectionnez l'animal le plus adapté à la situation</div>
              </div>
            </div>

            {/* Real-time answers submission status */}
            <div className="flex items-center space-x-3 pt-2">
              {runners.map(r => (
                <div
                  key={r.id}
                  className={`px-3 py-1 rounded-xl text-xs font-bold border transition-all ${
                    r.hasChosenCurrent
                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-md'
                      : 'bg-white/5 border-white/10 text-gray-400'
                  }`}
                >
                  {r.name} : {r.hasChosenCurrent ? '✅ Prêt' : '⏳ Réfléchit...'}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. Obstacle Reaction Phase / Decision Reveals */}
      {phase === 'obstacle_reaction' && currentEnv && (
        <div className="absolute top-28 inset-x-0 z-30 flex flex-col items-center px-6 pointer-events-none animate-scale-in">
          <div className="max-w-4xl w-full p-6 rounded-3xl bg-[#0F172A]/95 border-2 border-emerald-400/80 shadow-[0_0_50px_rgba(16,185,129,0.4)] backdrop-blur-xl">
            <h3 className="text-center font-display font-black text-2xl text-white mb-4">
              RÉSULTATS DE L'OBSTACLE !
            </h3>
            <div className="grid grid-cols-4 gap-4">
              {runners.map(runner => {
                const dec = runner.lastDecision;
                const effColor = {
                  optimal: 'border-emerald-400 bg-emerald-950/40 text-emerald-300',
                  adapted: 'border-blue-400 bg-blue-950/40 text-blue-300',
                  risky: 'border-amber-400 bg-amber-950/40 text-amber-300',
                  bad: 'border-rose-500 bg-rose-950/40 text-rose-300',
                }[dec?.efficiency || 'risky'];

                return (
                  <div key={runner.id} className={`p-4 rounded-2xl border-2 ${effColor} flex flex-col items-center text-center space-y-2`}>
                    <span className="font-bold text-xs text-white truncate max-w-full">{runner.name}</span>
                    <span className="text-2xl font-black">{dec?.animalName || runner.activeAnimal}</span>
                    <span className="text-[11px] font-black uppercase tracking-wider">{dec?.bonusText || 'Choix validé'}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 6. Grand Finish & Victory Podium Screen */}
      {phase === 'finished' && (
        <div className="absolute inset-0 z-40 flex items-center justify-center p-8 bg-black/85 backdrop-blur-lg animate-scale-in">
          <div className="max-w-4xl w-full p-8 rounded-3xl bg-[#0F172A] border-2 border-amber-400/70 shadow-[0_0_60px_rgba(245,158,11,0.5)] flex flex-col items-center text-center space-y-6">
            <div className="flex flex-col items-center space-y-2">
              <div className="w-16 h-16 rounded-3xl bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-amber-300 shadow-lg">
                <Crown className="w-9 h-9" />
              </div>
              <h1 className="text-4xl font-display font-black text-white tracking-tight">
                PODIUM DE LA COURSE WILD RUSH !
              </h1>
              <p className="text-sm text-gray-300 font-medium">
                {gameState?.winnerId
                  ? `${runners.find(r => r.id === gameState.winnerId)?.name} remporte la victoire !`
                  : 'Félicitations à tous les coureurs !'}
              </p>
            </div>

            {/* Podium cards 1st, 2nd, 3rd, 4th */}
            <div className="grid grid-cols-4 gap-4 w-full pt-4">
              {runners
                .slice()
                .sort((a, b) => a.rank - b.rank)
                .map((r, i) => {
                  const medal = ['🥇 1er', '🥈 2e', '🥉 3e', '4e'][i];
                  const border = i === 0 ? 'border-amber-400 bg-amber-950/40' : 'border-white/15 bg-white/5';
                  return (
                    <div key={r.id} className={`p-5 rounded-2xl border-2 ${border} flex flex-col items-center space-y-2 shadow-lg`}>
                      <span className="text-xl font-display font-black text-amber-300">{medal}</span>
                      <span className="font-display font-black text-lg text-white truncate max-w-full">{r.name}</span>
                      <span className="text-xs text-gray-400 font-bold">Dernier animal : {r.activeAnimal}</span>
                      <div className="pt-2 text-left w-full border-t border-white/10 space-y-1 text-xs">
                        <div className="flex justify-between text-gray-300">
                          <span>Distance :</span>
                          <span className="font-mono font-bold text-white">{Math.round(r.distance)}m</span>
                        </div>
                        <div className="flex justify-between text-gray-300">
                          <span>Top Combos :</span>
                          <span className="font-mono font-bold text-amber-400">{r.optimalChoicesCount} optimaux</span>
                        </div>
                        <div className="flex justify-between text-gray-300">
                          <span>Score :</span>
                          <span className="font-mono font-black text-emerald-400">+{r.score} pts</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* TV Actions: Replay or return to library */}
            <div className="flex items-center space-x-4 pt-4">
              <button
                data-tv-focus
                tabIndex={0}
                onClick={() => {
                  audio.playSelect();
                  replayGame();
                }}
                className="flex items-center space-x-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-display font-black text-sm uppercase tracking-wider shadow-lg hover:scale-105 transition-all outline-none focus:ring-4 focus:ring-emerald-400"
              >
                <RotateCcw className="w-5 h-5" />
                <span>Rejouer la course</span>
              </button>

              <button
                data-tv-focus
                tabIndex={0}
                onClick={() => {
                  audio.playBack();
                  returnToLobby();
                }}
                className="flex items-center space-x-2 px-8 py-3.5 rounded-2xl bg-white/10 border border-white/20 text-white font-display font-black text-sm uppercase tracking-wider shadow-md hover:bg-white/20 transition-all outline-none focus:ring-4 focus:ring-white"
              >
                <Home className="w-5 h-5" />
                <span>Retour au salon</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
