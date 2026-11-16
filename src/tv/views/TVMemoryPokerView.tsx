import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useGame } from '../../context/GameContext';
import { tvNav, TVNavAction } from '../../services/tvNavigation';
import { audio } from '../../services/audio';
import { QRCodeSVG } from 'qrcode.react';
import { PlayingCard, dealMemoryPokerCards, SUIT_SYMBOLS } from '../../games/memoryPoker/deck';
import { evaluatePokerHand, PokerEvaluation, PokerHandTier } from '../../games/memoryPoker/pokerEvaluator';
import {
  calculateRoundScore,
  DIFFICULTY_CONFIGS,
  MemoryPokerDifficulty,
  ScoreBreakdown,
} from '../../games/memoryPoker/scoring';
import { MemoryPokerStorage, MemoryPokerStats } from '../../games/memoryPoker/storage';
import {
  Play,
  BookOpen,
  Clock,
  Sparkles,
  Trophy,
  ArrowLeft,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Shield,
  Flame,
  Volume2,
  VolumeX,
  Smartphone,
  Users,
  QrCode,
  X,
  Radio,
} from 'lucide-react';

type GamePhase = 'idle' | 'memorize' | 'selection' | 'showdown' | 'results';

export const TVMemoryPokerView: React.FC = () => {
  const { setTvView, sendGameAction, room, createRoom, selectGame, startGame, serverLanIp } = useGame();

  // Difficulté sélectionnée
  const [difficulty, setDifficulty] = useState<MemoryPokerDifficulty>('normal');
  const [phase, setPhase] = useState<GamePhase>('idle');
  const [isQrModalOpen, setIsQrModalOpen] = useState<boolean>(false);

  // Assurer la présence d'un salon multijoueur pour que les téléphones puissent se connecter
  useEffect(() => {
    if (!room) {
      createRoom('memory_poker', { maxPlayers: 8, difficulty });
    } else if (room.gameId !== 'memory_poker') {
      selectGame('memory_poker');
    }
  }, [room, createRoom, selectGame, difficulty]);

  const isLocalHost = typeof window !== 'undefined' && (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1'
  );

  let mobileJoinUrl = '';
  if (typeof window !== 'undefined' && room?.code) {
    if (isLocalHost) {
      const lanIp = (room.serverLanIp && room.serverLanIp !== 'localhost') ? room.serverLanIp : serverLanIp;
      const port = window.location.port ? `:${window.location.port}` : '';
      mobileJoinUrl = `${window.location.protocol}//${lanIp !== 'localhost' ? lanIp : window.location.hostname}${port}/?room=${room.code}`;
    } else {
      mobileJoinUrl = `${window.location.origin}/?room=${room.code}`;
    }
  }

  const connectedPhones = room?.players || [];
  const serverGameState = (room?.gameState || {}) as Record<string, any>;
  const serverSubState = (serverGameState.subState || serverGameState || {}) as Record<string, any>;

  // Données de cartes
  const [grid, setGrid] = useState<PlayingCard[]>([]);
  const [communityCards, setCommunityCards] = useState<PlayingCard[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [cursorIndex, setCursorIndex] = useState<number>(0);

  // Chronomètres
  const [timeLeft, setTimeLeft] = useState<number>(20);
  const [decisionTimeUsed, setDecisionTimeUsed] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const selectionStartRef = useRef<number>(0);

  // Résultat et statistiques
  const [evaluation, setEvaluation] = useState<PokerEvaluation | null>(null);
  const [scoreBreakdown, setScoreBreakdown] = useState<ScoreBreakdown | null>(null);
  const [stats, setStats] = useState<MemoryPokerStats>(() => MemoryPokerStorage.getStats());
  const [isRulesModalOpen, setIsRulesModalOpen] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Animation Canvas
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentConfig = DIFFICULTY_CONFIGS[difficulty];

  // Nettoyage du chronomètre
  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  // Initialisation et focus D-Pad
  useEffect(() => {
    tvNav.setInitialFocus('button', containerRef.current);
  }, [phase, isRulesModalOpen]);

  // Démarrer une nouvelle manche
  const startNewGame = useCallback((diff: MemoryPokerDifficulty = difficulty) => {
    clearTimer();
    audio.playArenaGong();

    const deal = dealMemoryPokerCards();
    const config = DIFFICULTY_CONFIGS[diff];

    setGrid(deal.grid);
    setCommunityCards(deal.community);
    setSelectedIndices([]);
    setCursorIndex(0);
    setEvaluation(null);
    setScoreBreakdown(null);
    setPhase('memorize');
    setTimeLeft(config.memoSeconds);

    // Démarrage du compte à rebours de mémorisation
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 5 && prev > 1 && !isMuted) {
          audio.playHeartbeat();
        }
        if (prev <= 1) {
          clearTimer();
          transitionToSelection(config.decisionSeconds);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [clearTimer, difficulty, isMuted]);

  // Transition vers la phase de sélection
  const transitionToSelection = useCallback((decisionSeconds: number) => {
    clearTimer();
    audio.playCardSwoosh();
    setPhase('selection');
    setTimeLeft(decisionSeconds);
    selectionStartRef.current = Date.now();

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 5 && prev > 1 && !isMuted) {
          audio.playHeartbeat();
        }
        if (prev <= 1) {
          clearTimer();
          // Fin du temps : validation automatique
          confirmSelection();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [clearTimer, isMuted]);

  // Basculer la sélection d'une carte (max 2)
  const handleToggleCard = useCallback((index: number) => {
    if (phase !== 'selection') return;
    audio.playSelect();

    setSelectedIndices((prev) => {
      if (prev.includes(index)) {
        return prev.filter((i) => i !== index);
      }
      if (prev.length < 2) {
        return [...prev, index];
      }
      // Si 2 cartes sont déjà cochées, remplacer la deuxième
      return [prev[0], index];
    });
  }, [phase]);

  // Confirmer les 2 cartes et passer au résultat
  const confirmSelection = useCallback(() => {
    clearTimer();
    const elapsedSeconds = Math.max(1, Math.round((Date.now() - selectionStartRef.current) / 1000));
    setDecisionTimeUsed(elapsedSeconds);

    // Si moins de 2 cartes choisies par expiration de temps, compléter aléatoirement
    let finalIndices = [...selectedIndices];
    if (finalIndices.length < 2) {
      for (let i = 0; i < 16; i++) {
        if (!finalIndices.includes(i)) {
          finalIndices.push(i);
          if (finalIndices.length === 2) break;
        }
      }
    }

    const chosenCards = finalIndices.map((idx) => grid[idx]).filter(Boolean);
    const fiveCards = [...chosenCards, ...communityCards];
    const evalResult = evaluatePokerHand(fiveCards);
    const scoreResult = calculateRoundScore(evalResult.tier, elapsedSeconds, difficulty);

    setEvaluation(evalResult);
    setScoreBreakdown(scoreResult);
    setPhase('showdown');

    // Sauvegarde statistique
    const updatedStats = MemoryPokerStorage.recordGame({
      difficulty,
      tier: evalResult.tier,
      combinationName: evalResult.frenchName,
      totalScore: scoreResult.totalPoints,
      timeUsedSeconds: elapsedSeconds,
      communityCards: communityCards.map((c) => `${c.display}${c.symbol}`),
      chosenCards: chosenCards.map((c) => `${c.display}${c.symbol}`),
    });
    setStats(updatedStats);

    // Effet sonore dramatique
    if (evalResult.tier >= PokerHandTier.FLUSH) {
      audio.playRoyalFanfare();
    } else {
      audio.playVictory();
    }

    // Déclencher la pluie de pièces dorées si résultat honorable
    if (evalResult.tier >= PokerHandTier.STRAIGHT) {
      triggerVictoryParticles();
    }

    // Passage aux résultats complets
    setTimeout(() => {
      setPhase('results');
    }, 2800);
  }, [clearTimer, selectedIndices, grid, communityCards, difficulty]);

  // Lancement synchronisé local + serveur
  const handleStartGame = useCallback((diff: MemoryPokerDifficulty = difficulty) => {
    if (room?.code) {
      startGame();
    }
    startNewGame(diff);
  }, [room, startGame, startNewGame, difficulty]);

  // Pluie de particules dorées Canvas
  const triggerVictoryParticles = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const coins: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      rotation: number;
      vRot: number;
    }> = [];

    for (let i = 0; i < 75; i++) {
      coins.push({
        x: Math.random() * canvas.width,
        y: -30 - Math.random() * 200,
        vx: (Math.random() - 0.5) * 4,
        vy: 3 + Math.random() * 6,
        radius: 10 + Math.random() * 12,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.15,
      });
    }

    let frameCount = 0;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();

      for (const coin of coins) {
        coin.x += coin.vx;
        coin.y += coin.vy;
        coin.rotation += coin.vRot;

        ctx.save();
        ctx.translate(coin.x, coin.y);
        ctx.rotate(coin.rotation);

        // Pièce d'or Devil's Plan
        ctx.beginPath();
        ctx.arc(0, 0, coin.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#D4AF37';
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#FFF8DC';
        ctx.stroke();

        ctx.fillStyle = '#785410';
        ctx.font = `bold ${Math.round(coin.radius * 0.9)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🪙', 0, 0);

        ctx.restore();
      }

      ctx.restore();
      frameCount++;
      if (frameCount < 160) {
        requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };
    animate();
  };

  // Navigation D-Pad Télécommande TV
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isQrModalOpen) {
        if (e.key === 'Escape' || e.key === 'Backspace' || e.key === 'Yellow' || e.key === 'Blue' || e.keyCode === 405 || e.keyCode === 406) {
          setIsQrModalOpen(false);
          e.preventDefault();
        }
        return;
      }

      if (isRulesModalOpen) {
        if (e.key === 'Escape' || e.key === 'Backspace' || e.key === 'Yellow' || e.keyCode === 405) {
          setIsRulesModalOpen(false);
          e.preventDefault();
        }
        return;
      }

      // Touche Bleue ou 'b' : afficher QR Code Manettes Smartphones
      if (e.key === 'Blue' || e.keyCode === 406 || e.key === 'b' || e.key === 'B') {
        setIsQrModalOpen((prev) => !prev);
        e.preventDefault();
        return;
      }

      // Touches de couleur télécommande TV Hisense/Android
      if (e.key === 'Yellow' || e.keyCode === 405) {
        setIsRulesModalOpen((prev) => !prev);
        e.preventDefault();
        return;
      }
      if (e.key === 'Red' || e.keyCode === 403) {
        setTvView('home');
        e.preventDefault();
        return;
      }

      if (phase === 'selection') {
        const row = Math.floor(cursorIndex / 4);
        const col = cursorIndex % 4;

        if (e.key === 'ArrowRight') {
          e.preventDefault();
          audio.playFocus();
          setCursorIndex(row * 4 + ((col + 1) % 4));
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          audio.playFocus();
          setCursorIndex(row * 4 + ((col + 3) % 4));
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          audio.playFocus();
          setCursorIndex(((row + 1) % 4) * 4 + col);
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          audio.playFocus();
          setCursorIndex(((row + 3) % 4) * 4 + col);
        } else if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleToggleCard(cursorIndex);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase, cursorIndex, isRulesModalOpen, handleToggleCard, setTvView]);

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen bg-[#07090E] text-white selection:bg-[#D4AF37]/30 pb-16 select-none overflow-x-hidden font-sans"
    >
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-50" />

      {/* Halo d'ambiance The Devil's Plan */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[20%] w-[900px] h-[550px] rounded-full bg-gradient-to-b from-[#D4AF37]/12 via-[#B8860B]/5 to-transparent blur-[160px]" />
        <div className="absolute bottom-[-15%] right-[15%] w-[700px] h-[700px] rounded-full bg-blue-900/10 blur-[180px]" />
      </div>

      {/* Barre supérieure universelle TV */}
      <header className="sticky top-0 z-40 flex items-center justify-between px-8 py-4 bg-[#07090E]/90 backdrop-blur-xl border-b border-white/10">
        <div className="flex items-center gap-4">
          <button
            data-tv-focus
            tabIndex={0}
            onClick={() => {
              clearTimer();
              audio.playBack();
              setTvView('home');
            }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-all outline-none focus:ring-2 focus:ring-[#D4AF37]"
            title="Quitter vers l'accueil"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Accueil</span>
          </button>

          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#8C6D23] shadow-[0_0_20px_rgba(212,175,55,0.35)]">
              <Shield className="w-5 h-5 text-black" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-black text-2xl tracking-tight text-white">MEMORY POKER</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37]">
                  THE DEVIL'S ARENA
                </span>
              </div>
              <p className="text-[11px] font-semibold text-white/40 tracking-wider">
                MÉMORISEZ • ASSOCIEZ • MAÎTRISEZ LE POKER
              </p>
            </div>
          </div>
        </div>

        {/* Contrôles droits */}
        <div className="flex items-center gap-3">
          <button
            data-tv-focus
            tabIndex={0}
            onClick={() => {
              audio.playSelect();
              setIsQrModalOpen(true);
            }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500/15 border border-amber-500/35 text-amber-300 hover:bg-amber-500/25 text-xs font-black uppercase tracking-wider outline-none transition-all shadow-[0_0_12px_rgba(245,158,11,0.2)]"
            title="Afficher le QR code pour connecter les téléphones"
          >
            <Smartphone className="w-4 h-4 text-amber-400" />
            <span>📱 Manette : <strong className="font-mono text-white">{room?.code || '...'}</strong></span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
              {connectedPhones.length} en ligne
            </span>
          </button>

          <button
            data-tv-focus
            tabIndex={0}
            onClick={() => {
              audio.playSelect();
              setIsRulesModalOpen(true);
            }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/35 text-[#D4AF37] hover:bg-[#D4AF37]/25 text-xs font-black uppercase tracking-wider outline-none transition-all shadow-[0_0_12px_rgba(212,175,55,0.15)]"
          >
            <BookOpen className="w-4 h-4" />
            <span>Règles & Mains (Touche Jaune)</span>
          </button>

          <button
            data-tv-focus
            tabIndex={0}
            onClick={() => setIsMuted((prev) => !prev)}
            className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white"
            title="Activer/Couper le son"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-[#D4AF37]" />}
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 1. ÉCRAN D'ACCUEIL / HERO LANDING PAGE */}
      {/* ========================================================================= */}
      {phase === 'idle' && (
        <main className="max-w-[1600px] mx-auto px-8 py-8 animate-fade-in">
          {/* Section Hero Cinématique */}
          <section className="relative overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-r from-[#0B0F17] via-[#121824] to-[#0A0D15] p-8 md:p-12 shadow-2xl mb-10">
            <div className="absolute right-[-5%] top-[-20%] bottom-[-20%] w-1/2 bg-radial from-[#D4AF37]/15 to-transparent pointer-events-none" />

            <div className="relative z-10 grid grid-cols-1 xl:grid-cols-12 gap-8 items-center">
              <div className="xl:col-span-8">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/35 text-[#D4AF37] text-xs font-black uppercase tracking-widest mb-4">
                  <Flame className="w-4 h-4 fill-current" />
                  Épreuve d'Élite • The Devil's Plan
                </div>

                <h1 className="text-4xl md:text-7xl font-black font-display tracking-tight text-white mb-4 leading-none">
                  MEMORY POKER
                </h1>

                <p className="text-xl md:text-2xl font-semibold text-white/80 mb-3 leading-snug">
                  Test your memory. Master the cards. Outsmart your opponents.
                </p>

                <p className="text-sm md:text-base text-white/60 mb-8 max-w-2xl leading-relaxed">
                  Mémorisez 16 cartes réparties sur une grille secrète de 4x4 cases. Dès qu'elles se retournent face
                  cachée, observez les 3 cartes communes au centre de la table et sélectionnez exactement 2 cartes
                  cachées pour forger la meilleure combinaison de poker possible !
                </p>

                {/* Sélecteur de Difficulté */}
                <div className="mb-8">
                  <label className="block text-xs font-black uppercase tracking-widest text-[#D4AF37] mb-3">
                    Niveau de Difficulté & Chronomètre :
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {(['easy', 'normal', 'hard', 'practice'] as MemoryPokerDifficulty[]).map((diff) => {
                      const cfg = DIFFICULTY_CONFIGS[diff];
                      const isSelected = difficulty === diff;
                      return (
                        <button
                          key={diff}
                          data-tv-focus
                          tabIndex={0}
                          onClick={() => {
                            audio.playSelect();
                            setDifficulty(diff);
                          }}
                          className={`px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider border transition-all ${
                            isSelected
                              ? 'bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-black border-white shadow-[0_0_20px_rgba(212,175,55,0.4)] scale-105'
                              : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                          }`}
                        >
                          <div>{cfg.label}</div>
                          <span className={`text-[10px] font-mono block mt-0.5 ${isSelected ? 'text-black/80' : 'text-white/40'}`}>
                            {cfg.memoSeconds}s mémo • {cfg.decisionSeconds}s choix (x{cfg.multiplier})
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Boutons d'Action Principaux */}
                <div className="flex flex-wrap items-center gap-4">
                  <button
                    data-tv-focus
                    tabIndex={0}
                    onClick={() => handleStartGame(difficulty)}
                    className="inline-flex items-center gap-3 px-10 py-4 rounded-2xl bg-gradient-to-r from-[#D4AF37] to-[#B38728] text-black font-black uppercase text-sm tracking-wider shadow-lg shadow-[#D4AF37]/30 hover:brightness-110 active:scale-95 transition-all outline-none focus:ring-4 focus:ring-[#D4AF37]/60"
                  >
                    <Play className="w-5 h-5 fill-current" />
                    Lancer la Partie (OK)
                  </button>

                  <button
                    data-tv-focus
                    tabIndex={0}
                    onClick={() => {
                      audio.playSelect();
                      setIsRulesModalOpen(true);
                    }}
                    className="inline-flex items-center gap-2.5 px-6 py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/15 text-white font-bold text-sm tracking-wider transition-all outline-none focus:ring-2 focus:ring-white"
                  >
                    <BookOpen className="w-4 h-4 text-white/70" />
                    Comment Jouer
                  </button>

                  <button
                    data-tv-focus
                    tabIndex={0}
                    onClick={() => {
                      audio.playSelect();
                      setIsQrModalOpen(true);
                    }}
                    className="inline-flex items-center gap-2.5 px-6 py-4 rounded-2xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/35 text-amber-300 font-bold text-sm tracking-wider transition-all outline-none focus:ring-2 focus:ring-amber-400"
                  >
                    <Smartphone className="w-4 h-4 text-amber-400" />
                    Scanner Manette Smartphone
                  </button>
                </div>
              </div>

              {/* Colonne Droite : Scène QR Code Authentique MOOD TV */}
              <div className="xl:col-span-4 flex flex-col items-center justify-center p-6 sm:p-7 rounded-3xl liquid-glass shadow-2xl space-y-4">
                <div className="text-center">
                  <span className="text-slate-300 text-xs font-bold tracking-widest uppercase flex items-center justify-center space-x-1.5">
                    <Smartphone className="w-4 h-4 text-slate-300" />
                    <span>SCANNEZ AVEC VOTRE APPAREIL PHOTO</span>
                  </span>
                  <h2 className="text-lg sm:text-xl font-black font-display text-white mt-1">
                    Aucune application requise
                  </h2>
                </div>

                {/* Scannable White QR Code Container (Liquid glass effects MUST NOT cover the QR SVG) */}
                <div className="p-3.5 rounded-2xl bg-white shadow-[0_15px_40px_rgba(0,0,0,0.8)] border-4 border-white">
                  <QRCodeSVG
                    value={mobileJoinUrl || 'https://mood.tv'}
                    size={175}
                    level="M"
                    includeMargin={true}
                    fgColor="#07090E"
                    bgColor="#FFFFFF"
                  />
                </div>

                {/* Code du Salon Badge (Style Mood TV officiel) */}
                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase mb-1">
                    CODE DU SALON
                  </span>
                  <div className="px-6 py-1.5 rounded-2xl liquid-glass-elevated border border-amber-400/30 text-amber-400 font-mono font-black text-2xl tracking-widest shadow-[0_0_25px_rgba(245,158,11,0.2)]">
                    {room?.code || 'CHARGEMENT'}
                  </div>
                </div>

                {/* Quick 3-Step Guide (Identique à tous les jeux) */}
                <div className="w-full grid grid-cols-3 gap-2 pt-1 text-center">
                  <div className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                    <span className="block text-[9px] font-mono font-bold text-slate-400">1. SCANNEZ</span>
                    <span className="text-[10px] text-slate-200 font-medium">le QR Code</span>
                  </div>
                  <div className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                    <span className="block text-[9px] font-mono font-bold text-slate-400">2. PSEUDO</span>
                    <span className="text-[10px] text-slate-200 font-medium">choisissez</span>
                  </div>
                  <div className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                    <span className="block text-[9px] font-mono font-bold text-slate-400">3. JOUEZ</span>
                    <span className="text-[10px] text-slate-200 font-medium">sur la TV</span>
                  </div>
                </div>

                {/* Téléphones connectés & Fallback URL */}
                <div className="w-full pt-2 border-t border-white/[0.08] text-center">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 mb-2">
                    <span className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-slate-300" />
                      Joueurs connectés :
                    </span>
                    <span className="text-emerald-400 font-mono font-bold">{connectedPhones.length} en ligne</span>
                  </div>

                  {connectedPhones.length === 0 ? (
                    <div className="py-2 px-3 rounded-xl bg-white/[0.02] border border-dashed border-white/10 text-[10px] text-slate-400 italic">
                      En attente de connexion... Scannez pour rejoindre
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-1.5 justify-center max-h-20 overflow-y-auto">
                      {connectedPhones.map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center space-x-1.5 px-2.5 py-1 rounded-xl liquid-glass border border-white/[0.08] shadow-sm text-xs"
                        >
                          <span>{p.avatar || '🦊'}</span>
                          <span className="font-bold text-white text-[11px]">{p.name}</span>
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="pt-2 text-[10px] text-slate-400">
                    <span>Ou rendez-vous sur : </span>
                    <span className="font-mono text-slate-200 font-bold underline">
                      {typeof window !== 'undefined' ? (window.location.host + (room?.code ? `/?room=${room.code}` : '')) : 'mood.tv'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Grille de Statistiques & Performance Récente */}
          <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-6 rounded-3xl bg-[#0E131C] border border-white/10 shadow-xl">
              <span className="text-xs font-bold text-white/50 uppercase tracking-widest block mb-2">
                Parties Jouées
              </span>
              <div className="text-4xl font-black font-display text-white">{stats.gamesPlayed}</div>
              <span className="text-xs text-[#D4AF37] font-semibold mt-2 block">
                {stats.totalPointsAccumulated.toLocaleString()} pts accumulés
              </span>
            </div>

            <div className="p-6 rounded-3xl bg-[#0E131C] border border-white/10 shadow-xl">
              <span className="text-xs font-bold text-white/50 uppercase tracking-widest block mb-2">
                Meilleur Score
              </span>
              <div className="text-4xl font-black font-display text-[#D4AF37]">
                {stats.bestScore.toLocaleString()}
              </div>
              <span className="text-xs text-white/60 font-semibold mt-2 block">Record personnel</span>
            </div>

            <div className="p-6 rounded-3xl bg-[#0E131C] border border-white/10 shadow-xl">
              <span className="text-xs font-bold text-white/50 uppercase tracking-widest block mb-2">
                Meilleure Combinaison
              </span>
              <div className="text-xl font-black font-display text-white truncate">
                {stats.highestHandName || 'Aucune'}
              </div>
              <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider mt-2 block">
                Niveau {stats.highestTier}/10
              </span>
            </div>

            <div className="p-6 rounded-3xl bg-[#0E131C] border border-white/10 shadow-xl">
              <span className="text-xs font-bold text-white/50 uppercase tracking-widest block mb-2">
                Dernières Mains
              </span>
              {stats.history.length === 0 ? (
                <div className="text-xs text-white/40 italic">Aucune partie encore jouée</div>
              ) : (
                <div className="space-y-1.5 max-h-24 overflow-y-auto">
                  {stats.history.slice(0, 3).map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-xs">
                      <span className="text-white/80 font-semibold truncate max-w-[130px]">
                        {item.combinationName}
                      </span>
                      <span className="font-mono text-[#D4AF37] font-bold">+{item.totalScore}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </main>
      )}

      {/* ========================================================================= */}
      {/* 2. PHASES DE JEU ACTIVES (MÉMORISATION & SÉLECTION & SHOWDOWN) */}
      {/* ========================================================================= */}
      {(phase === 'memorize' || phase === 'selection' || phase === 'showdown') && (
        <main className="max-w-[1500px] mx-auto px-8 py-4 flex flex-col items-center justify-between min-h-[82vh]">
          {/* En-tête de manche avec statut et chronomètre */}
          <div className="w-full flex items-center justify-between py-2 border-b border-white/10 mb-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-black uppercase tracking-widest text-[#D4AF37]">
                Mode : {currentConfig.label}
              </span>
              <span className="text-white/30">•</span>
              <span className="text-xs font-semibold text-white/70">
                {phase === 'memorize' && 'Phase 1 : Mémorisation des 16 cartes'}
                {phase === 'selection' && 'Phase 2 : Choisissez 2 cartes pour compléter les communes'}
                {phase === 'showdown' && 'Phase 3 : Évaluation finale de la main'}
              </span>
            </div>

            {/* Compte à rebours animé */}
            <div className="flex items-center gap-3">
              <div
                className={`flex items-center gap-2 px-5 py-2 rounded-2xl border font-mono text-xl font-black ${
                  timeLeft <= 5
                    ? 'bg-red-600/20 border-red-500 text-red-400 animate-pulse'
                    : 'bg-[#151B27] border-[#D4AF37]/40 text-[#D4AF37]'
                }`}
              >
                <Clock className="w-5 h-5" />
                <span>{timeLeft}s</span>
              </div>

              {phase === 'memorize' && (
                <button
                  data-tv-focus
                  tabIndex={0}
                  onClick={() => transitionToSelection(currentConfig.decisionSeconds)}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold uppercase tracking-wider"
                >
                  Je suis prêt (Passer)
                </button>
              )}
            </div>
          </div>

          {/* Bandeau des Joueurs et Manettes Smartphones en Jeu */}
          {connectedPhones.length > 0 && (
            <div className="w-full max-w-4xl flex flex-wrap items-center justify-center gap-3 py-2 px-4 rounded-2xl bg-black/50 border border-white/10 mb-4 shadow-lg">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37] flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5" /> Manettes ({connectedPhones.length}) :
              </span>
              {connectedPhones.map((p) => {
                const isConfirmed = Boolean(serverSubState.confirmedPlayers && serverSubState.confirmedPlayers[p.id]);
                const pSelected = (serverSubState.selectedCards && serverSubState.selectedCards[p.id]) || [];

                return (
                  <div
                    key={p.id}
                    className={`flex items-center gap-2 px-3 py-1 rounded-xl border text-xs font-bold transition-all ${
                      isConfirmed
                        ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.25)]'
                        : pSelected.length > 0
                        ? 'bg-[#D4AF37]/20 border-[#D4AF37]/40 text-[#D4AF37]'
                        : 'bg-white/5 border-white/10 text-white/70'
                    }`}
                  >
                    <span>{p.avatar || '🦊'}</span>
                    <span>{p.name}</span>
                    <span className="text-[10px] font-mono">
                      {phase === 'memorize' && (p.isReady ? '✓ Prêt' : 'Mémorise...')}
                      {phase === 'selection' && (isConfirmed ? '✓ Validé (2/2)' : `${pSelected.length}/2 choisies`)}
                      {phase === 'showdown' && (
                        serverSubState.playerHands?.[p.id]?.evaluation?.frenchName ? `✓ ${serverSubState.playerHands[p.id].evaluation.frenchName}` : 'Terminé'
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* ZONE 1 : LES 3 CARTES COMMUNES (RÉVÉLÉES EN PHASE SÉLECTION) */}
          <div className="w-full max-w-4xl py-3 px-6 rounded-3xl bg-[#0D121B] border border-white/15 mb-4 shadow-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37] block">
                Cartes Communes de la Table (3)
              </span>
              <p className="text-xs text-white/60">
                {phase === 'memorize'
                  ? 'Sera dévoilé à la fin du compte à rebours de mémorisation.'
                  : 'Associez 2 cartes secrètes de la grille à ces 3 cartes pour former la main de poker.'}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {phase === 'memorize' ? (
                <>
                  <div className="w-16 h-22 rounded-xl border border-dashed border-white/20 bg-white/5 flex items-center justify-center text-white/30 text-xs font-bold">
                    ?
                  </div>
                  <div className="w-16 h-22 rounded-xl border border-dashed border-white/20 bg-white/5 flex items-center justify-center text-white/30 text-xs font-bold">
                    ?
                  </div>
                  <div className="w-16 h-22 rounded-xl border border-dashed border-white/20 bg-white/5 flex items-center justify-center text-white/30 text-xs font-bold">
                    ?
                  </div>
                </>
              ) : (
                communityCards.map((card) => (
                  <div
                    key={card.id}
                    className="w-16 h-22 rounded-xl bg-gradient-to-br from-white to-slate-200 text-black border border-white shadow-lg flex flex-col justify-between p-2 transform scale-100 transition-all"
                  >
                    <span className="text-[11px] font-black font-mono leading-none">{card.display}</span>
                    <span className={`text-2xl self-center ${card.color === 'red' ? 'text-red-600' : 'text-slate-900'}`}>
                      {card.symbol}
                    </span>
                    <span className="text-[11px] font-black font-mono leading-none self-end">{card.display}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* ZONE 2 : LA GRILLE DE 16 CARTES 4x4 */}
          <div className="grid grid-cols-4 gap-4 p-6 rounded-3xl bg-[#0E131C] border border-[#D4AF37]/30 shadow-2xl max-w-2xl w-full">
            {grid.map((card, idx) => {
              const isFaceUp = phase === 'memorize' || phase === 'showdown';
              const isSelected = selectedIndices.includes(idx);
              const isCursorHere = cursorIndex === idx && phase === 'selection';

              return (
                <button
                  key={idx}
                  data-tv-focus
                  tabIndex={0}
                  disabled={phase !== 'selection'}
                  onClick={() => handleToggleCard(idx)}
                  className={`relative aspect-[3/4] rounded-2xl p-2.5 flex flex-col items-center justify-between border transition-all duration-300 outline-none ${
                    isCursorHere ? 'ring-4 ring-[#D4AF37] scale-105 z-20' : ''
                  } ${
                    isSelected
                      ? 'bg-[#D4AF37]/35 border-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.4)] scale-105'
                      : isFaceUp
                      ? 'bg-gradient-to-br from-white to-slate-200 text-black border-white shadow-lg'
                      : 'bg-[#141A26] border-white/15 hover:border-[#D4AF37]/60 shadow-inner'
                  }`}
                >
                  {isFaceUp ? (
                    <>
                      <span className="text-xs font-black self-start font-mono leading-none">{card.display}</span>
                      <span className={`text-4xl ${card.color === 'red' ? 'text-red-600' : 'text-slate-900'}`}>
                        {card.symbol}
                      </span>
                      <span className="text-xs font-black self-end font-mono leading-none">{card.display}</span>
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-1.5">
                      <div
                        className={`w-10 h-14 rounded-xl border flex items-center justify-center font-mono text-sm font-black ${
                          isSelected
                            ? 'bg-[#D4AF37] text-black border-white shadow-md'
                            : 'border-white/20 bg-white/5 text-white/50'
                        }`}
                      >
                        #{idx + 1}
                      </div>
                      {isSelected ? (
                        <span className="text-[9px] font-black uppercase text-[#D4AF37] tracking-wider">CHOISI</span>
                      ) : (
                        <span className="text-[9px] font-semibold text-white/30">D-Pad</span>
                      )}
                    </div>
                  )}

                  {/* Numéro de slot choisi */}
                  {isSelected && (
                    <span className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-[#D4AF37] text-black font-black text-[10px] flex items-center justify-center shadow">
                      {selectedIndices.indexOf(idx) + 1}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* ZONE 3 : BARRE DE VALIDATION ET CHOIX DU JOUEUR */}
          <div className="w-full max-w-3xl flex items-center justify-between py-4 px-6 rounded-2xl bg-[#0B0F17] border border-white/10 mt-4">
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold uppercase tracking-wider text-white/60">Vos 2 Cartes Choisies :</span>
              <div className="flex items-center gap-3">
                {[0, 1].map((slotIdx) => {
                  const cardIdx = selectedIndices[slotIdx];
                  const hasChoice = cardIdx !== undefined;
                  const card = hasChoice ? grid[cardIdx] : null;

                  return (
                    <div
                      key={slotIdx}
                      className={`w-14 h-18 rounded-xl border flex flex-col items-center justify-center font-mono text-xs font-bold ${
                        hasChoice
                          ? 'bg-[#D4AF37]/25 border-[#D4AF37] text-[#D4AF37]'
                          : 'border-dashed border-white/20 text-white/30'
                      }`}
                    >
                      {hasChoice ? `#${cardIdx + 1}` : 'Vide'}
                    </div>
                  );
                })}
              </div>
            </div>

            {phase === 'selection' && (
              <button
                data-tv-focus
                tabIndex={0}
                disabled={selectedIndices.length !== 2}
                onClick={confirmSelection}
                className={`px-8 py-3.5 rounded-2xl font-black uppercase text-xs tracking-wider transition-all outline-none ${
                  selectedIndices.length === 2
                    ? 'bg-gradient-to-r from-[#D4AF37] to-[#B38728] text-black shadow-lg shadow-[#D4AF37]/30 hover:brightness-110 focus:ring-4 focus:ring-[#D4AF37]'
                    : 'bg-white/5 border border-white/10 text-white/30 cursor-not-allowed'
                }`}
              >
                Confirmer la Main (2/2)
              </button>
            )}
          </div>
        </main>
      )}

      {/* ========================================================================= */}
      {/* 3. ÉCRAN DE RÉSULTATS / BILAN DU TOUR */}
      {/* ========================================================================= */}
      {phase === 'results' && evaluation && scoreBreakdown && (
        <main className="max-w-[1200px] mx-auto px-8 py-10 flex flex-col items-center animate-fade-in">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/35 text-[#D4AF37] text-xs font-black uppercase tracking-widest mb-3">
              <Trophy className="w-4 h-4 fill-current" />
              Résultat de l'Épreuve • Showdown
            </div>
            <h2 className="text-4xl md:text-6xl font-black font-display text-white mb-2">
              {evaluation.frenchName}
            </h2>
            <p className="text-sm md:text-base text-white/60 font-semibold">
              Combinaison de Rang {evaluation.tier}/10 ({evaluation.name})
            </p>
          </div>

          {/* Présentation des 5 cartes de la main finale */}
          <div className="flex items-center gap-4 mb-10 p-6 rounded-3xl bg-[#0D121B] border border-[#D4AF37]/40 shadow-2xl">
            {evaluation.cards.map((card, i) => (
              <div
                key={i}
                className="w-24 h-34 rounded-2xl bg-gradient-to-br from-white to-slate-200 text-black border-2 border-white shadow-xl flex flex-col justify-between p-3 transform transition-transform hover:scale-105"
              >
                <span className="text-sm font-black font-mono">{card.display}</span>
                <span className={`text-4xl self-center ${card.color === 'red' ? 'text-red-600' : 'text-slate-900'}`}>
                  {card.symbol}
                </span>
                <span className="text-sm font-black font-mono self-end">{card.display}</span>
              </div>
            ))}
          </div>

          {/* Décomposition des Points Gagnés */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full max-w-3xl mb-10 text-center">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-[11px] font-bold text-white/50 uppercase tracking-widest block mb-1">
                Points Combinaison
              </span>
              <span className="font-mono text-2xl font-black text-white">
                +{scoreBreakdown.handPoints}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-[11px] font-bold text-white/50 uppercase tracking-widest block mb-1">
                Bonus de Vitesse
              </span>
              <span className="font-mono text-2xl font-black text-emerald-400">
                +{scoreBreakdown.speedBonus}
              </span>
              <span className="text-[10px] text-white/40 block mt-0.5">{decisionTimeUsed}s utilisées</span>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-[11px] font-bold text-white/50 uppercase tracking-widest block mb-1">
                Multiplicateur
              </span>
              <span className="font-mono text-2xl font-black text-white">
                x{scoreBreakdown.multiplier}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-[#D4AF37]/20 border border-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.3)]">
              <span className="text-[11px] font-black text-[#D4AF37] uppercase tracking-widest block mb-1">
                Score Total
              </span>
              <span className="font-mono text-3xl font-black text-[#D4AF37]">
                {scoreBreakdown.totalPoints}
              </span>
            </div>
          </div>

          {/* Boutons d'Action Post-Partie */}
          <div className="flex items-center gap-4">
            <button
              data-tv-focus
              tabIndex={0}
              onClick={() => handleStartGame(difficulty)}
              className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-[#D4AF37] to-[#B38728] text-black font-black uppercase text-sm tracking-wider shadow-lg shadow-[#D4AF37]/30 hover:brightness-110 outline-none focus:ring-4 focus:ring-[#D4AF37]"
            >
              <RotateCcw className="w-5 h-5" />
              Rejouer (Touche Verte)
            </button>

            <button
              data-tv-focus
              tabIndex={0}
              onClick={() => setPhase('idle')}
              className="inline-flex items-center gap-2 px-6 py-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold text-sm tracking-wider outline-none"
            >
              Retour à l'Accueil
            </button>
          </div>
        </main>
      )}

      {/* ========================================================================= */}
      {/* 4. MODAL DU QR CODE ET CONNEXION MANETTE SMARTPHONE (DESIGN OFFICIEL MOOD TV) */}
      {/* ========================================================================= */}
      {isQrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl animate-fade-in">
          <div className="relative w-full max-w-2xl rounded-3xl liquid-glass border border-white/[0.12] p-8 shadow-2xl text-white">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl liquid-glass flex items-center justify-center text-slate-300">
                  <Smartphone className="w-5 h-5 text-slate-200" />
                </div>
                <div>
                  <h3 className="text-xl font-black font-display text-white uppercase tracking-tight">
                    Connectez vos Smartphones
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">Scannez avec votre appareil photo pour rejoindre</p>
                </div>
              </div>

              <div className="flex flex-col items-end">
                <span className="text-[9px] font-black text-slate-400 tracking-widest uppercase">CODE DU SALON</span>
                <div className="px-5 py-1 rounded-xl liquid-glass-elevated border border-amber-400/30 text-amber-400 font-mono font-black text-2xl tracking-widest shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                  {room?.code || 'CHARGEMENT'}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6 mb-6">
              {/* Scannable White QR Code Container (Liquid glass effects MUST NOT cover the QR SVG) */}
              <div className="p-3.5 rounded-2xl bg-white shadow-[0_15px_40px_rgba(0,0,0,0.8)] border-4 border-white flex-shrink-0">
                <QRCodeSVG
                  value={mobileJoinUrl || 'https://mood.tv'}
                  size={195}
                  level="M"
                  includeMargin={true}
                  fgColor="#07090E"
                  bgColor="#FFFFFF"
                />
              </div>

              <div className="space-y-3 text-center sm:text-left flex-1 w-full">
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Aucune application requise
                </div>

                {/* Quick 3-Step Guide (Identique à tous les jeux) */}
                <div className="w-full grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                    <span className="block text-[9px] font-mono font-bold text-slate-400">1. SCANNEZ</span>
                    <span className="text-[10px] text-slate-200 font-medium">le QR Code</span>
                  </div>
                  <div className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                    <span className="block text-[9px] font-mono font-bold text-slate-400">2. PSEUDO</span>
                    <span className="text-[10px] text-slate-200 font-medium">choisissez</span>
                  </div>
                  <div className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                    <span className="block text-[9px] font-mono font-bold text-slate-400">3. JOUEZ</span>
                    <span className="text-[10px] text-slate-200 font-medium">sur la TV</span>
                  </div>
                </div>

                {/* Direct URL Fallback */}
                <div className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center text-xs text-slate-400">
                  <span>Ou rendez-vous sur : </span>
                  <span className="font-mono text-slate-200 font-bold underline">
                    {typeof window !== 'undefined' ? (window.location.host + (room?.code ? `/?room=${room.code}` : '')) : 'mood.tv'}
                  </span>
                </div>
              </div>
            </div>

            {/* Liste des Joueurs Connectés */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-2">
                <span className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-slate-300" />
                  Joueurs Connectés ({connectedPhones.length}) :
                </span>
                <span className="text-emerald-400 font-mono">{connectedPhones.length} en ligne</span>
              </div>

              {connectedPhones.length === 0 ? (
                <div className="p-3 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] text-xs text-slate-400 text-center italic">
                  En attente de connexion... Scannez le QR Code pour rejoindre la partie avec votre manette !
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto pr-1">
                  {connectedPhones.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center space-x-2.5 p-2 rounded-xl liquid-glass border border-white/[0.08]"
                    >
                      <span className="text-base">{p.avatar || '🦊'}</span>
                      <span className="font-bold text-white text-xs truncate flex-1">{p.name}</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-6 flex items-center justify-between pt-4 border-t border-white/[0.08]">
              <button
                data-tv-focus
                tabIndex={0}
                onClick={() => {
                  audio.playSelect();
                  setTvView('lobby');
                }}
                className="px-5 py-2.5 rounded-xl liquid-glass hover:bg-white/10 text-slate-200 font-bold text-xs uppercase tracking-wider transition-all outline-none focus:ring-2 focus:ring-white"
              >
                Ouvrir le Salon / Lobby Complet
              </button>

              <button
                data-tv-focus
                tabIndex={0}
                onClick={() => setIsQrModalOpen(false)}
                className="px-6 py-2.5 rounded-xl bg-white hover:bg-neutral-200 text-neutral-950 font-display font-black text-xs uppercase tracking-wider shadow outline-none focus:ring-2 focus:ring-white"
              >
                Fermer (Retour)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. MODAL DES RÈGLES DU JEU ET HIÉRARCHIE POKER (TOUCHE JAUNE) */}
      {/* ========================================================================= */}
      {isRulesModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-8 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-3xl rounded-3xl bg-[#0E131C] border border-[#D4AF37]/60 p-8 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
              <div className="flex items-center gap-3">
                <BookOpen className="w-6 h-6 text-[#D4AF37]" />
                <h3 className="text-2xl font-black font-display text-white uppercase">
                  Règles & Stratégie : Memory Poker
                </h3>
              </div>
              <button
                data-tv-focus
                tabIndex={0}
                onClick={() => setIsRulesModalOpen(false)}
                className="px-4 py-1.5 rounded-xl bg-white/10 text-white font-bold text-xs uppercase hover:bg-white/20"
              >
                Fermer (Touche Jaune / Retour)
              </button>
            </div>

            <div className="space-y-6 text-sm text-white/80 leading-relaxed max-h-[60vh] overflow-y-auto pr-3">
              <div>
                <h4 className="font-bold text-[#D4AF37] text-base mb-2">1. Principe de l'Épreuve :</h4>
                <p>
                  Un jeu standard de 52 cartes est mélangé. 16 cartes sont disposées sur une grille de 4x4 cases.
                  Vous disposez d'un temps limité (12 à 30 secondes selon la difficulté) pour mémoriser l'emplacement
                  des valeurs et des couleurs.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-[#D4AF37] text-base mb-2">2. Les Cartes Communes & Votre Choix :</h4>
                <p>
                  Lorsque les cartes se retournent face cachée, <strong>3 cartes communes</strong> sont dévoilées.
                  Vous devez sélectionner <strong>exactement 2 cartes</strong> parmi les 16 cartes cachées pour
                  former la combinaison de 5 cartes la plus puissante possible.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-[#D4AF37] text-base mb-2">3. Hiérarchie Officielle des 10 Mains :</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded bg-white/5 border border-white/5">
                    <strong>1. Quinte Flush Royale</strong> (As à 10 même couleur)
                  </div>
                  <div className="p-2 rounded bg-white/5 border border-white/5">
                    <strong>2. Quinte Flush</strong> (5 cartes consécutives même couleur)
                  </div>
                  <div className="p-2 rounded bg-white/5 border border-white/5">
                    <strong>3. Carré</strong> (4 cartes de même rang)
                  </div>
                  <div className="p-2 rounded bg-white/5 border border-white/5">
                    <strong>4. Full House</strong> (3 cartes d'un rang + 2 d'un autre)
                  </div>
                  <div className="p-2 rounded bg-white/5 border border-white/5">
                    <strong>5. Couleur (Flush)</strong> (5 cartes de même couleur)
                  </div>
                  <div className="p-2 rounded bg-white/5 border border-white/5">
                    <strong>6. Quinte</strong> (5 cartes consécutives, A-2-3-4-5 inclus)
                  </div>
                  <div className="p-2 rounded bg-white/5 border border-white/5">
                    <strong>7. Brelan</strong> (3 cartes de même rang)
                  </div>
                  <div className="p-2 rounded bg-white/5 border border-white/5">
                    <strong>8. Deux Paires</strong> (2 paires différentes)
                  </div>
                  <div className="p-2 rounded bg-white/5 border border-white/5">
                    <strong>9. Une Paire</strong> (2 cartes de même rang)
                  </div>
                  <div className="p-2 rounded bg-white/5 border border-white/5">
                    <strong>10. Carte Haute</strong> (carte la plus élevée)
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
