import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useGame } from '../../context/GameContext';
import { tvNav } from '../../services/tvNavigation';
import { audio } from '../../services/audio';
import { QRCodeSVG } from 'qrcode.react';
import { PlayingCard, dealMemoryPokerCards } from '../../games/memoryPoker/deck';
import { evaluatePokerHand, PokerEvaluation, PokerHandTier } from '../../games/memoryPoker/pokerEvaluator';
import {
  calculateRoundScore,
  DIFFICULTY_CONFIGS,
  MemoryPokerDifficulty,
  ScoreBreakdown,
  findBestPossibleHand,
  BestPossibleHandResult,
} from '../../games/memoryPoker/scoring';
import {
  MemoryPokerStorage,
  MemoryPokerStats,
  MemoryPokerAchievement,
  MEMORY_POKER_ACHIEVEMENTS,
} from '../../games/memoryPoker/storage';
import {
  Play,
  BookOpen,
  Clock,
  Trophy,
  ArrowLeft,
  RotateCcw,
  CheckCircle2,
  Shield,
  Flame,
  Volume2,
  VolumeX,
  Smartphone,
  Users,
  Award,
  Crown,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

type GamePhase = 'idle' | 'memorize' | 'selection' | 'showdown' | 'results' | 'podium';

export const TVMemoryPokerView: React.FC = () => {
  const { setTvView, sendGameAction, room, createRoom, selectGame, startGame, serverLanIp, returnToLobby } = useGame();

  // Configuration de la partie
  const [difficulty, setDifficulty] = useState<MemoryPokerDifficulty>('normal');
  const [totalRounds] = useState<number>(3); // Tournoi officiel The Devil's Plan en 3 manches
  const [currentRound, setCurrentRound] = useState<number>(1);

  // Si le salon est déjà lancé depuis le lobby officiel (status 'playing'), démarrer directement la manche
  const isRoomPlaying = room?.status === 'playing';
  const [phase, setPhase] = useState<GamePhase>(isRoomPlaying ? 'memorize' : 'idle');
  const [isQrModalOpen, setIsQrModalOpen] = useState<boolean>(false);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Historique et cumul du tournoi en cours
  const [tournamentRounds, setTournamentRounds] = useState<
    Array<{
      round: number;
      evaluation: PokerEvaluation;
      breakdown: ScoreBreakdown;
      garnets: number;
      theoreticalBest: BestPossibleHandResult;
      isOptimalChoice: boolean;
    }>
  >([]);
  const [totalTournamentScore, setTotalTournamentScore] = useState<number>(0);
  const [totalTournamentGarnets, setTotalTournamentGarnets] = useState<number>(0);

  // Toast de Succès / Achievement débloqué
  const [activeAchievementToast, setActiveAchievementToast] = useState<MemoryPokerAchievement | null>(null);

  // Assurer la présence d'un salon multijoueur pour que les téléphones puissent se connecter
  useEffect(() => {
    if (!room) {
      createRoom('memory_poker', { maxPlayers: 8, difficulty });
    } else if (room.gameId !== 'memory_poker') {
      selectGame('memory_poker');
    }
  }, [room, createRoom, selectGame, difficulty]);

  const isLocalHost =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  let mobileJoinUrl = '';
  if (typeof window !== 'undefined' && room?.code) {
    if (isLocalHost) {
      const lanIp = room.serverLanIp && room.serverLanIp !== 'localhost' ? room.serverLanIp : serverLanIp;
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

  // Résultat, analyse stratégique comparée et statistiques
  const [evaluation, setEvaluation] = useState<PokerEvaluation | null>(null);
  const [scoreBreakdown, setScoreBreakdown] = useState<ScoreBreakdown | null>(null);
  const [theoreticalBest, setTheoreticalBest] = useState<BestPossibleHandResult | null>(null);
  const [stats, setStats] = useState<MemoryPokerStats>(() => MemoryPokerStorage.getStats());

  // Animation Canvas (Pièces du Démon 🪙 & Confettis)
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentConfig = DIFFICULTY_CONFIGS[difficulty];

  // Déclencher un toast de succès
  const showAchievementToast = useCallback((ach: MemoryPokerAchievement) => {
    setActiveAchievementToast(ach);
    audio.playVictory();
    setTimeout(() => {
      setActiveAchievementToast((prev) => (prev?.id === ach.id ? null : prev));
    }, 4500);
  }, []);

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

  // Focus D-Pad automatique
  useEffect(() => {
    tvNav.setInitialFocus('button', containerRef.current);
  }, [phase, isRulesModalOpen, isQrModalOpen]);

  // Transition vers la phase de sélection
  const transitionToSelection = useCallback(
    (decisionSeconds: number, activeGrid?: PlayingCard[], activeCommunity?: PlayingCard[]) => {
      clearTimer();
      audio.playCardSwoosh();
      setPhase('selection');
      setTimeLeft(decisionSeconds);
      selectionStartRef.current = Date.now();

      const gridCards = activeGrid || grid;
      const commCards = activeCommunity || communityCards;

      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 5 && prev > 1 && !isMuted) {
            audio.playHeartbeat();
          }
          if (prev <= 1) {
            clearTimer();
            confirmSelection(gridCards, commCards);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    },
    [clearTimer, isMuted, grid, communityCards]
  );

  // Confirmer les 2 cartes et passer au résultat
  const confirmSelection = useCallback(
    (customGrid?: PlayingCard[], customCommunity?: PlayingCard[]) => {
      clearTimer();
      const currentGrid = customGrid || grid;
      const currentCommunity = customCommunity || communityCards;

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

      const chosenCards = finalIndices.map((idx) => currentGrid[idx]).filter(Boolean);
      const fiveCards = [...chosenCards, ...currentCommunity];
      const evalResult = evaluatePokerHand(fiveCards);
      const scoreResult = calculateRoundScore(evalResult.tier, elapsedSeconds, difficulty);

      // Calcul de la meilleure main théorique possible sur cette table (Comparatif Devil's Plan)
      const bestPossible = findBestPossibleHand(currentGrid, currentCommunity);
      const isOptimal = evalResult.scoreValue >= bestPossible.evaluation.scoreValue;

      setEvaluation(evalResult);
      setScoreBreakdown(scoreResult);
      setTheoreticalBest(bestPossible);
      setPhase('showdown');

      // Enregistrement de la manche dans le tournoi
      const roundEntry = {
        round: currentRound,
        evaluation: evalResult,
        breakdown: scoreResult,
        garnets: scoreResult.garnetsEarned,
        theoreticalBest: bestPossible,
        isOptimalChoice: isOptimal,
      };

      setTournamentRounds((prev) => [...prev, roundEntry]);
      setTotalTournamentScore((prev) => prev + scoreResult.totalPoints);
      setTotalTournamentGarnets((prev) => prev + scoreResult.garnetsEarned);

      // Sauvegarde statistique & vérification des succès
      const { stats: updatedStats, newlyUnlocked } = MemoryPokerStorage.recordGame({
        difficulty,
        tier: evalResult.tier,
        combinationName: evalResult.frenchName,
        totalScore: scoreResult.totalPoints,
        timeUsedSeconds: elapsedSeconds,
        garnetsEarned: scoreResult.garnetsEarned,
        communityCards: currentCommunity.map((c) => `${c.display}${c.symbol}`),
        chosenCards: chosenCards.map((c) => `${c.display}${c.symbol}`),
      });

      // Si le joueur a trouvé la main maximale théorique absolue de la table
      if (isOptimal) {
        const perfAch = MemoryPokerStorage.unlockSpecificAchievement('perfect_vision');
        if (perfAch) {
          newlyUnlocked.push(perfAch);
        }
      }

      setStats(updatedStats);

      // Déclencher les toasts de succès débloqués
      if (newlyUnlocked.length > 0) {
        newlyUnlocked.forEach((ach) => showAchievementToast(ach));
      }

      // Effet sonore
      if (evalResult.tier >= PokerHandTier.FLUSH) {
        audio.playRoyalFanfare();
      } else {
        audio.playVictory();
      }

      // Déclencher la pluie de pièces d'or si résultat remarquable
      if (evalResult.tier >= PokerHandTier.STRAIGHT) {
        triggerVictoryParticles();
      }

      // Passage aux résultats complets après l'animation de showdown
      setTimeout(() => {
        setPhase('results');
      }, 3200);
    },
    [clearTimer, selectedIndices, grid, communityCards, difficulty, currentRound, showAchievementToast]
  );

  // Démarrer une nouvelle manche
  const startNewGame = useCallback(
    (diff: MemoryPokerDifficulty = difficulty, roundNumber: number = 1) => {
      clearTimer();
      audio.playArenaGong();

      if (roundNumber === 1) {
        setTournamentRounds([]);
        setTotalTournamentScore(0);
        setTotalTournamentGarnets(0);
      }
      setCurrentRound(roundNumber);

      const deal = dealMemoryPokerCards();
      const config = DIFFICULTY_CONFIGS[diff];

      setGrid(deal.grid);
      setCommunityCards(deal.community);
      setSelectedIndices([]);
      setCursorIndex(0);
      setEvaluation(null);
      setScoreBreakdown(null);
      setTheoreticalBest(null);
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
            transitionToSelection(config.decisionSeconds, deal.grid, deal.community);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    },
    [clearTimer, difficulty, isMuted, transitionToSelection]
  );

  // DÉMARRAGE IMMÉDIAT SANS PASSAGE PAR L'ÉCRAN IDLE LORS DU LANCEMENT DEPUIS LE LOBBY
  const hasAutoStartedRef = useRef(false);
  useEffect(() => {
    if (room?.status === 'playing' && !hasAutoStartedRef.current) {
      hasAutoStartedRef.current = true;
      startNewGame(difficulty, 1);
    }
  }, [room?.status, difficulty, startNewGame]);

  // Basculer la sélection d'une carte (max 2)
  const handleToggleCard = useCallback(
    (index: number) => {
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
    },
    [phase]
  );

  // Lancement synchronisé local + serveur
  const handleStartGame = useCallback(
    (diff: MemoryPokerDifficulty = difficulty, roundNumber: number = 1) => {
      if (room?.code && room.status !== 'playing') {
        startGame();
      }
      startNewGame(diff, roundNumber);
    },
    [room, startGame, startNewGame, difficulty]
  );

  // Passer à la manche suivante du tournoi
  const handleNextRound = useCallback(() => {
    if (currentRound < totalRounds) {
      handleStartGame(difficulty, currentRound + 1);
    } else {
      // Fin du tournoi -> Cérémonie finale sur le podium !
      const { stats: updatedStats, newlyUnlocked } = MemoryPokerStorage.recordTournamentComplete(
        totalTournamentScore
      );
      setStats(updatedStats);
      if (newlyUnlocked.length > 0) {
        newlyUnlocked.forEach((ach) => showAchievementToast(ach));
      }
      audio.playRoyalFanfare();
      triggerVictoryParticles();
      setPhase('podium');
    }
  }, [
    currentRound,
    totalRounds,
    difficulty,
    handleStartGame,
    totalTournamentScore,
    showAchievementToast,
  ]);

  // Pluie de particules dorées Canvas (Pièces du Démon 🪙 60 FPS)
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

    for (let i = 0; i < 90; i++) {
      coins.push({
        x: Math.random() * canvas.width,
        y: -30 - Math.random() * 250,
        vx: (Math.random() - 0.5) * 4.5,
        vy: 3 + Math.random() * 6.5,
        radius: 12 + Math.random() * 12,
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

        // Pièce de Garnet du Démon
        ctx.beginPath();
        ctx.arc(0, 0, coin.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#D4AF37';
        ctx.fill();
        ctx.lineWidth = 2.5;
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
      if (frameCount < 180) {
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
        if (
          e.key === 'Escape' ||
          e.key === 'Backspace' ||
          e.key === 'Yellow' ||
          e.key === 'Blue' ||
          e.keyCode === 405 ||
          e.keyCode === 406
        ) {
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
  }, [phase, cursorIndex, isRulesModalOpen, isQrModalOpen, handleToggleCard, setTvView]);

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen bg-[#07090E] text-white selection:bg-[#D4AF37]/30 pb-16 select-none overflow-x-hidden font-sans"
    >
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-50" />

      {/* Toast Animé de Succès / Achievement Débloqué */}
      {activeAchievementToast && (
        <aside
          role="status"
          aria-live="polite"
          className="fixed top-20 right-8 z-50 flex items-center gap-3.5 px-5 py-3.5 rounded-2xl bg-[#0D121B]/95 border-2 border-[#D4AF37] shadow-[0_0_35px_rgba(212,175,55,0.45)] backdrop-blur-xl animate-fade-in"
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#8C6D23] flex items-center justify-center text-2xl shadow-inner">
            {activeAchievementToast.icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37]">
                🏆 SUCCÈS DÉBLOQUÉ !
              </span>
            </div>
            <h4 className="text-sm font-black font-display text-white">{activeAchievementToast.title}</h4>
            <p className="text-[11px] text-white/70 max-w-xs">{activeAchievementToast.description}</p>
          </div>
        </aside>
      )}

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
              if (room?.status === 'playing') {
                returnToLobby();
              } else {
                setTvView('home');
              }
            }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-all outline-none focus:ring-2 focus:ring-[#D4AF37]"
            title="Quitter la partie"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">
              {room?.status === 'playing' ? 'Salon / Lobby' : 'Accueil'}
            </span>
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
                {phase !== 'idle' && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-amber-500/20 border border-amber-500/40 text-amber-300">
                    MANCHE {currentRound}/{totalRounds}
                  </span>
                )}
              </div>
              <p className="text-[11px] font-semibold text-white/40 tracking-wider">
                MÉMORISEZ • ASSOCIEZ • MAÎTRISEZ LE POKER
              </p>
            </div>
          </div>
        </div>

        {/* Contrôles droits */}
        <div className="flex items-center gap-3">
          {/* Indicateur de Garnets accumulés */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-amber-300 text-xs font-black">
            <span>🪙</span>
            <span>{totalTournamentGarnets > 0 ? totalTournamentGarnets : stats.totalGarnets} Garnets</span>
          </div>

          <button
            data-tv-focus
            tabIndex={0}
            onClick={() => {
              audio.playSelect();
              setIsQrModalOpen(true);
            }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500/15 border border-amber-500/35 text-amber-300 hover:bg-amber-500/25 text-xs font-black uppercase tracking-wider outline-none transition-all shadow-[0_0_12px_rgba(245,158,11,0.2)]"
            title="Afficher les informations de manette smartphone"
          >
            <Smartphone className="w-4 h-4 text-amber-400" />
            <span>
              📱 Salon : <strong className="font-mono text-white">{room?.code || '...'}</strong>
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
              {connectedPhones.length} joueur{connectedPhones.length > 1 ? 's' : ''}
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
            <span>Règles (Touche Jaune)</span>
          </button>

          <button
            data-tv-focus
            tabIndex={0}
            onClick={() => setIsMuted((prev) => !prev)}
            className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white"
            title="Activer/Couper les effets sonores"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-[#D4AF37]" />}
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 1. ÉCRAN D'ACCUEIL / HERO LANDING PAGE (SANS CODE QR EN DOUBLE) */}
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
                  Format Tournoi 3 Manches • The Devil's Plan
                </div>

                <h1 className="text-4xl md:text-7xl font-black font-display tracking-tight text-white mb-4 leading-none">
                  MEMORY POKER
                </h1>

                <p className="text-xl md:text-2xl font-semibold text-white/80 mb-3 leading-snug">
                  Test your memory. Master the cards. Outsmart your opponents.
                </p>

                <p className="text-sm md:text-base text-white/60 mb-8 max-w-2xl leading-relaxed">
                  Mémorisez 16 cartes réparties sur une grille secrète de 4x4 cases. Dès qu'elles se retournent en 3D
                  face cachée, observez les 3 cartes communes au centre de la table et sélectionnez exactement 2 cartes
                  pour forger la main de poker suprême.
                </p>

                {/* Sélecteurs de difficulté et de mode */}
                <div className="mb-8">
                  <span className="text-xs font-bold uppercase tracking-wider text-white/50 block mb-3">
                    Niveau de Difficulté :
                  </span>
                  <div className="flex flex-wrap gap-3">
                    {(Object.keys(DIFFICULTY_CONFIGS) as MemoryPokerDifficulty[]).map((key) => {
                      const cfg = DIFFICULTY_CONFIGS[key];
                      const isSelected = difficulty === key;
                      return (
                        <button
                          key={key}
                          data-tv-focus
                          tabIndex={0}
                          onClick={() => {
                            audio.playFocus();
                            setDifficulty(key);
                          }}
                          className={`px-4 py-2.5 rounded-2xl border text-xs font-bold uppercase tracking-wider transition-all outline-none focus:ring-2 focus:ring-[#D4AF37] ${
                            isSelected
                              ? 'bg-[#D4AF37] text-black border-white shadow-[0_0_15px_rgba(212,175,55,0.4)] scale-105'
                              : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                          }`}
                        >
                          {cfg.label}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-xs text-[#D4AF37] font-semibold mt-2.5">{currentConfig.description}</p>
                </div>

                {/* Boutons d'Action Principaux */}
                <div className="flex flex-wrap items-center gap-4">
                  <button
                    data-tv-focus
                    tabIndex={0}
                    onClick={() => handleStartGame(difficulty, 1)}
                    className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-[#D4AF37] via-[#DFBF58] to-[#B38728] text-black font-black uppercase text-base tracking-wider shadow-[0_0_30px_rgba(212,175,55,0.4)] hover:brightness-110 active:scale-95 transition-all outline-none focus:ring-4 focus:ring-[#D4AF37]"
                  >
                    <Play className="w-5 h-5 fill-current" />
                    <span>Lancer la Partie (3 Manches)</span>
                  </button>

                  <button
                    data-tv-focus
                    tabIndex={0}
                    onClick={() => {
                      audio.playSelect();
                      setIsRulesModalOpen(true);
                    }}
                    className="inline-flex items-center gap-2 px-6 py-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold text-sm uppercase tracking-wider transition-all outline-none focus:ring-2 focus:ring-white"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Comment Jouer</span>
                  </button>

                  <button
                    data-tv-focus
                    tabIndex={0}
                    onClick={() => {
                      audio.playSelect();
                      setTvView('lobby');
                    }}
                    className="inline-flex items-center gap-2 px-6 py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/15 text-white/70 hover:text-white font-bold text-sm uppercase tracking-wider transition-all outline-none focus:ring-2 focus:ring-white"
                  >
                    <Users className="w-4 h-4" />
                    <span>Salon / Lobby</span>
                  </button>
                </div>
              </div>

              {/* Colonne Droite : Panneau des Joueurs Connectés & Paramètres de Table (SANS QR CODE DUPLIQUÉ) */}
              <div className="xl:col-span-4 flex flex-col justify-between p-6 rounded-3xl liquid-glass border border-white/[0.12] space-y-5">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
                    <span className="text-[11px] font-black uppercase tracking-widest text-[#D4AF37] flex items-center gap-2">
                      <span>🪙</span>
                      <span>Table The Devil's Plan</span>
                    </span>
                    <span className="font-mono text-xs font-black text-amber-400 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                      Code : {room?.code || '...'}
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2 mb-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-white/60">Format :</span>
                      <span className="font-bold text-white">Tournoi 3 Manches</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-white/60">Cartes :</span>
                      <span className="font-bold text-white">16 Grille (4x4) + 3 Communes</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-white/60">Mode de jeu :</span>
                      <span className="font-bold text-amber-300">{currentConfig.label}</span>
                    </div>
                  </div>

                  {/* Liste des Joueurs à la Table */}
                  <div>
                    <div className="flex items-center justify-between text-xs font-bold text-slate-300 mb-2">
                      <span className="flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-[#D4AF37]" />
                        Joueurs Prêts ({connectedPhones.length}) :
                      </span>
                      <span className="text-emerald-400 font-mono text-[11px]">
                        {connectedPhones.length > 0 ? 'En ligne' : 'Solo / IA'}
                      </span>
                    </div>

                    {connectedPhones.length === 0 ? (
                      <div className="p-3.5 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] text-xs text-slate-400 text-center space-y-1">
                        <p className="font-semibold text-white/70">Partie Solo contre IA ou Multijoueur</p>
                        <p className="text-[11px] text-white/40">
                          Connectez vos smartphones à tout moment pour jouer à plusieurs.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                        {connectedPhones.map((p) => (
                          <div
                            key={p.id}
                            className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/10 text-xs"
                          >
                            <div className="flex items-center gap-2">
                              <span>{p.avatar || '🦊'}</span>
                              <span className="font-bold text-white">{p.name}</span>
                            </div>
                            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                              <CheckCircle2 className="w-3 h-3" /> Prêt
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2">
                  <button
                    data-tv-focus
                    tabIndex={0}
                    onClick={() => {
                      audio.playSelect();
                      setIsQrModalOpen(true);
                    }}
                    className="flex-1 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-bold transition-all text-center"
                  >
                    📱 Afficher QR Code
                  </button>

                  <button
                    data-tv-focus
                    tabIndex={0}
                    onClick={() => {
                      audio.playSelect();
                      setTvView('lobby');
                    }}
                    className="flex-1 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs font-bold transition-all text-center"
                  >
                    👥 Gérer le Salon
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Grille de Statistiques & Performance Récente */}
          <section className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
            <div className="p-6 rounded-3xl bg-[#0E131C] border border-white/10 shadow-xl">
              <span className="text-xs font-bold text-white/50 uppercase tracking-widest block mb-2">
                Parties & Tournois
              </span>
              <div className="text-4xl font-black font-display text-white">{stats.gamesPlayed}</div>
              <span className="text-xs text-[#D4AF37] font-semibold mt-2 block">
                {stats.tournamentsCompleted} tournois complétés
              </span>
            </div>

            <div className="p-6 rounded-3xl bg-[#0E131C] border border-white/10 shadow-xl">
              <span className="text-xs font-bold text-white/50 uppercase tracking-widest block mb-2">
                Trésor de Garnets (🪙)
              </span>
              <div className="text-4xl font-black font-display text-[#D4AF37] flex items-center gap-2">
                <span>🪙</span>
                <span>{stats.totalGarnets}</span>
              </div>
              <span className="text-xs text-white/60 font-semibold mt-2 block">Pièces du Démon accumulées</span>
            </div>

            <div className="p-6 rounded-3xl bg-[#0E131C] border border-white/10 shadow-xl">
              <span className="text-xs font-bold text-white/50 uppercase tracking-widest block mb-2">
                Meilleure Combinaison
              </span>
              <div className="text-xl font-black font-display text-white truncate">
                {stats.highestHandName || 'Aucune'}
              </div>
              <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider mt-2 block">
                Rang {stats.highestTier}/10 • Record : {stats.bestScore} pts
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

          {/* Section Badges et Succès Débloqués */}
          <section className="p-8 rounded-3xl bg-[#0C1018] border border-white/10 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Award className="w-6 h-6 text-[#D4AF37]" />
                <h3 className="text-xl font-black font-display text-white uppercase tracking-tight">
                  Trophées & Badges de l'Arène ({MemoryPokerStorage.getAchievements().filter((a) => a.unlocked).length}/
                  {MEMORY_POKER_ACHIEVEMENTS.length})
                </h3>
              </div>
              <span className="text-xs text-white/50 uppercase tracking-wider">
                Débloquez tous les trophées du Maître du Jeu
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4">
              {MemoryPokerStorage.getAchievements().map((ach) => (
                <div
                  key={ach.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                    ach.unlocked
                      ? 'bg-[#151D2A] border-[#D4AF37]/50 shadow-[0_0_15px_rgba(212,175,55,0.15)]'
                      : 'bg-white/[0.02] border-white/5 opacity-40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{ach.icon}</span>
                    {ach.unlocked ? (
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                        Acquis
                      </span>
                    ) : (
                      <span className="text-[9px] font-bold text-white/40">Verrouillé</span>
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white mb-1">{ach.title}</h4>
                    <p className="text-[10px] text-white/60 leading-tight">{ach.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>
      )}

      {/* ========================================================================= */}
      {/* 2. PHASES DE JEU ACTIVES (MÉMORISATION & SÉLECTION & SHOWDOWN) */}
      {/* ========================================================================= */}
      {(phase === 'memorize' || phase === 'selection' || phase === 'showdown') && (
        <main className="max-w-[1500px] mx-auto px-8 py-4 flex flex-col items-center justify-between min-h-[82vh]">
          {/* En-tête de manche avec statut, manche et chronomètre */}
          <div className="w-full flex items-center justify-between py-2 border-b border-white/10 mb-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-black uppercase tracking-widest px-3 py-1 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/35 text-[#D4AF37]">
                MANCHE {currentRound} / {totalRounds}
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-white/60">
                Mode : {currentConfig.label}
              </span>
              <span className="text-white/30">•</span>
              <span className="text-xs font-semibold text-white/80">
                {phase === 'memorize' && 'Phase 1 : Mémorisation des 16 cartes'}
                {phase === 'selection' && 'Phase 2 : Choisissez 2 cartes pour compléter les communes'}
                {phase === 'showdown' && 'Phase 3 : Showdown et évaluation en direct'}
              </span>
            </div>

            {/* Compte à rebours animé */}
            <div className="flex items-center gap-3">
              <div
                className={`flex items-center gap-2 px-5 py-2 rounded-2xl border font-mono text-xl font-black ${
                  timeLeft <= 5
                    ? 'bg-red-600/20 border-red-500 text-red-400 animate-pulse scale-105'
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
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold uppercase tracking-wider transition-all"
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
                      {phase === 'showdown' &&
                        (serverSubState.playerHands?.[p.id]?.evaluation?.frenchName
                          ? `✓ ${serverSubState.playerHands[p.id].evaluation.frenchName}`
                          : 'Terminé')}
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

          {/* ZONE 2 : LA GRILLE DE 16 CARTES 4x4 AVEC CARD FLIP 3D RÉALISTE */}
          <div className="grid grid-cols-4 gap-4 p-6 rounded-3xl bg-[#0E131C] border border-[#D4AF37]/30 shadow-2xl max-w-2xl w-full">
            {grid.map((card, idx) => {
              const isSelected = selectedIndices.includes(idx);
              const isCursorHere = cursorIndex === idx && phase === 'selection';
              // En showdown, on ne révèle que les 2 cartes choisies par le joueur (effet spectaculaire !)
              const isFaceUp = phase === 'memorize' || (phase === 'showdown' && isSelected);

              return (
                <div
                  key={idx}
                  className="relative aspect-[3/4] [perspective:1000px] cursor-pointer"
                  onClick={() => handleToggleCard(idx)}
                >
                  <button
                    data-tv-focus
                    tabIndex={0}
                    disabled={phase !== 'selection'}
                    className={`w-full h-full relative rounded-2xl transition-transform duration-700 [transform-style:preserve-3d] outline-none ${
                      isCursorHere ? 'ring-4 ring-[#D4AF37] scale-105 z-20' : ''
                    } ${!isFaceUp ? '[transform:rotateY(180deg)]' : ''}`}
                    style={{
                      transitionDelay: phase === 'selection' ? `${idx * 30}ms` : '0ms',
                    }}
                  >
                    {/* FACE AVANT (Carte Visible) */}
                    <div className="absolute inset-0 [backface-visibility:hidden] rounded-2xl p-2.5 flex flex-col items-center justify-between bg-gradient-to-br from-white to-slate-200 text-black border-2 border-white shadow-xl">
                      <span className="text-xs font-black self-start font-mono leading-none">{card.display}</span>
                      <span className={`text-4xl ${card.color === 'red' ? 'text-red-600' : 'text-slate-900'}`}>
                        {card.symbol}
                      </span>
                      <span className="text-xs font-black self-end font-mono leading-none">{card.display}</span>

                      {/* Badge doré si la carte est choisie */}
                      {isSelected && (
                        <span className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-[#D4AF37] text-black font-black text-[10px] flex items-center justify-center shadow">
                          {selectedIndices.indexOf(idx) + 1}
                        </span>
                      )}
                    </div>

                    {/* FACE ARRIÈRE (Dos de carte The Devil's Plan luxueux) */}
                    <div
                      className={`absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-2xl p-2 flex flex-col items-center justify-between border-2 transition-colors ${
                        isSelected
                          ? 'bg-[#1E190D] border-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.45)]'
                          : 'bg-[#0E131C] border-white/15'
                      }`}
                    >
                      <div className="w-full flex items-center justify-between text-[10px] font-mono text-white/40">
                        <span>#{idx + 1}</span>
                        {isSelected && <span className="text-[#D4AF37] font-bold">CHOISI</span>}
                      </div>

                      {/* Motif de sceau Devil's Plan */}
                      <div
                        className={`w-12 h-16 rounded-xl border flex flex-col items-center justify-center transition-all ${
                          isSelected
                            ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-amber-300 scale-105'
                            : 'border-white/10 bg-white/5 text-white/30'
                        }`}
                      >
                        <span className="text-xl">🪙</span>
                        <span className="text-[8px] font-black uppercase tracking-wider text-white/50 mt-1">DEVIL</span>
                      </div>

                      <div className="w-full text-center">
                        <span className="text-[9px] font-mono text-white/40">#{idx + 1}</span>
                      </div>
                    </div>
                  </button>
                </div>
              );
            })}
          </div>

          {/* ZONE 3 : BARRE DE VALIDATION ET CHOIX DU JOUEUR */}
          <div className="w-full max-w-3xl flex items-center justify-between py-4 px-6 rounded-2xl bg-[#0B0F17] border border-white/10 mt-4 shadow-xl">
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold uppercase tracking-wider text-white/60">Vos 2 Cartes Choisies :</span>
              <div className="flex items-center gap-3">
                {[0, 1].map((slotIdx) => {
                  const cardIdx = selectedIndices[slotIdx];
                  const hasChoice = cardIdx !== undefined;

                  return (
                    <div
                      key={slotIdx}
                      className={`w-14 h-18 rounded-xl border flex flex-col items-center justify-center font-mono text-xs font-bold transition-all ${
                        hasChoice
                          ? 'bg-[#D4AF37]/25 border-[#D4AF37] text-[#D4AF37] shadow-[0_0_12px_rgba(212,175,55,0.3)]'
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
                onClick={() => confirmSelection()}
                className={`px-8 py-3.5 rounded-2xl font-black uppercase text-xs tracking-wider transition-all outline-none ${
                  selectedIndices.length === 2
                    ? 'bg-gradient-to-r from-[#D4AF37] to-[#B38728] text-black shadow-lg shadow-[#D4AF37]/30 hover:brightness-110 focus:ring-4 focus:ring-[#D4AF37] scale-105'
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
      {/* 3. ÉCRAN DE RÉSULTATS / BILAN DU TOUR & DÉVOILEMENT COMPARATIF */}
      {/* ========================================================================= */}
      {phase === 'results' && evaluation && scoreBreakdown && (
        <main className="max-w-[1300px] mx-auto px-8 py-8 flex flex-col items-center animate-fade-in">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/35 text-[#D4AF37] text-xs font-black uppercase tracking-widest mb-3">
              <Trophy className="w-4 h-4 fill-current" />
              Manche {currentRound} / {totalRounds} • Résultats Officiels
            </div>
            <h2 className="text-4xl md:text-6xl font-black font-display text-white mb-2">{evaluation.frenchName}</h2>
            <p className="text-sm md:text-base text-white/60 font-semibold">
              Combinaison de Rang {evaluation.tier}/10 ({evaluation.name})
            </p>
          </div>

          {/* Présentation des 5 cartes de la main finale */}
          <div className="flex items-center gap-4 mb-8 p-6 rounded-3xl bg-[#0D121B] border border-[#D4AF37]/40 shadow-2xl">
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

          {/* DÉVOILEMENT COMPARATIF : CE QUE VOUS AVEZ FAIT VS MEILLEURE MAIN THÉORIQUE */}
          {theoreticalBest && (
            <div className="w-full max-w-4xl p-6 rounded-3xl bg-[#0B0F17] border border-white/10 mb-8 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
                <span className="text-xs font-black uppercase tracking-widest text-[#D4AF37] flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" /> Analyse Stratégique The Devil's Plan
                </span>
                {evaluation.scoreValue >= theoreticalBest.evaluation.scoreValue ? (
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                    <Crown className="w-3.5 h-3.5 text-amber-400" /> 100% Optimale • Vision Parfaite !
                  </span>
                ) : (
                  <span className="text-xs text-amber-400 font-bold">
                    Meilleure combinaison théorique disponible sur cette table :
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Choix réel du joueur */}
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                  <span className="text-[11px] font-bold text-white/50 uppercase tracking-widest block mb-1">
                    Votre Choix Réel
                  </span>
                  <div className="text-lg font-black text-white mb-2">{evaluation.frenchName}</div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-white/60">Cartes :</span>
                    {selectedIndices.map((idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded bg-white/10 text-white font-mono text-xs font-bold"
                      >
                        #{idx + 1}
                      </span>
                    ))}
                    <span className="text-xs text-[#D4AF37] font-bold ml-auto">+{scoreBreakdown.totalPoints} pts</span>
                  </div>
                </div>

                {/* Combinaison théorique optimale de la table */}
                <div className="p-4 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/30">
                  <span className="text-[11px] font-bold text-amber-300 uppercase tracking-widest block mb-1">
                    Combinaison Maximale Théorique
                  </span>
                  <div className="text-lg font-black text-amber-300 mb-2">
                    {theoreticalBest.evaluation.frenchName}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-white/60">Cartes Clés :</span>
                    {theoreticalBest.indices.map((idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded bg-[#D4AF37]/20 text-[#D4AF37] font-mono text-xs font-bold"
                      >
                        #{idx + 1}
                      </span>
                    ))}
                    <span className="text-xs text-emerald-400 font-bold ml-auto">
                      Rang {theoreticalBest.evaluation.tier}/10
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Décomposition des Points & Garnets Gagnés */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 w-full max-w-4xl mb-8 text-center">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-[11px] font-bold text-white/50 uppercase tracking-widest block mb-1">
                Points Main
              </span>
              <span className="font-mono text-2xl font-black text-white">+{scoreBreakdown.handPoints}</span>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-[11px] font-bold text-white/50 uppercase tracking-widest block mb-1">
                Bonus Vitesse
              </span>
              <span className="font-mono text-2xl font-black text-emerald-400">+{scoreBreakdown.speedBonus}</span>
              <span className="text-[10px] text-white/40 block mt-0.5">{decisionTimeUsed}s utilisées</span>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-[11px] font-bold text-white/50 uppercase tracking-widest block mb-1">
                Multiplicateur
              </span>
              <span className="font-mono text-2xl font-black text-white">x{scoreBreakdown.multiplier}</span>
            </div>

            <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/35">
              <span className="text-[11px] font-black text-amber-300 uppercase tracking-widest block mb-1">
                Pièces du Démon
              </span>
              <span className="font-mono text-2xl font-black text-amber-300">+{scoreBreakdown.garnetsEarned} 🪙</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#D4AF37]/20 border border-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.3)]">
              <span className="text-[11px] font-black text-[#D4AF37] uppercase tracking-widest block mb-1">
                Score Manche
              </span>
              <span className="font-mono text-3xl font-black text-[#D4AF37]">{scoreBreakdown.totalPoints}</span>
            </div>
          </div>

          {/* Boutons d'Action de Transition */}
          <div className="flex items-center gap-4">
            <button
              data-tv-focus
              tabIndex={0}
              onClick={handleNextRound}
              className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-[#D4AF37] to-[#B38728] text-black font-black uppercase text-sm tracking-wider shadow-lg shadow-[#D4AF37]/30 hover:brightness-110 outline-none focus:ring-4 focus:ring-[#D4AF37]"
            >
              {currentRound < totalRounds ? (
                <>
                  <span>Passer à la Manche {currentRound + 1} / {totalRounds}</span>
                  <ChevronRight className="w-5 h-5" />
                </>
              ) : (
                <>
                  <Crown className="w-5 h-5" />
                  <span>Cérémonie Finale du Podium</span>
                </>
              )}
            </button>

            <button
              data-tv-focus
              tabIndex={0}
              onClick={() => {
                if (room?.status === 'playing') {
                  returnToLobby();
                } else {
                  setPhase('idle');
                }
              }}
              className="inline-flex items-center gap-2 px-6 py-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold text-sm tracking-wider outline-none"
            >
              {room?.status === 'playing' ? 'Retour au Lobby' : "Retour à l'Accueil"}
            </button>
          </div>
        </main>
      )}

      {/* ========================================================================= */}
      {/* 4. CÉRÉMONIE FINALE SUR LE PODIUM THE DEVIL'S PLAN */}
      {/* ========================================================================= */}
      {phase === 'podium' && (
        <main className="max-w-[1200px] mx-auto px-8 py-8 flex flex-col items-center animate-fade-in text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/50 text-[#D4AF37] text-xs font-black uppercase tracking-widest mb-4">
            <Crown className="w-4 h-4 fill-current" />
            GRAND TOURNOI THE DEVIL'S PLAN • PODIUM
          </div>

          <h2 className="text-4xl md:text-6xl font-black font-display text-white mb-2">
            COURONNEMENT DES CHAMPIONS
          </h2>
          <p className="text-base text-white/70 max-w-xl mx-auto mb-10">
            Félicitations à tous les stratèges de l'Arène. Voici le classement officiel après les 3 manches de
            mémorisation !
          </p>

          {/* Podium Visuel 3D */}
          <div className="flex items-end justify-center gap-6 w-full max-w-3xl mb-12">
            {/* 2ème Place */}
            <div className="flex-1 flex flex-col items-center">
              <div className="text-3xl mb-2">🥈</div>
              <div className="font-bold text-sm text-slate-300 mb-1">
                {connectedPhones[1]?.name || '🤖 Orbit AI'}
              </div>
              <div className="w-full h-32 rounded-t-3xl bg-slate-700/50 border border-slate-500/30 flex flex-col items-center justify-center p-4">
                <span className="text-xs font-bold text-slate-400 uppercase">2ème Place</span>
                <span className="font-mono text-xl font-black text-white">
                  {Math.round(totalTournamentScore * 0.72)} pts
                </span>
              </div>
            </div>

            {/* 1ère Place (Vainqueur Doré) */}
            <div className="flex-1 flex flex-col items-center scale-110">
              <div className="text-4xl mb-2 animate-bounce">👑</div>
              <div className="font-black text-base text-[#D4AF37] mb-1">
                {connectedPhones[0]?.name || 'Maître de l’Arène'}
              </div>
              <div className="w-full h-44 rounded-t-3xl bg-gradient-to-t from-[#B38728] to-[#D4AF37] text-black shadow-[0_0_35px_rgba(212,175,55,0.4)] flex flex-col items-center justify-center p-4">
                <span className="text-xs font-black uppercase tracking-widest text-black/70">CHAMPION</span>
                <span className="font-mono text-3xl font-black text-black">{totalTournamentScore} pts</span>
                <span className="text-xs font-bold text-black/80 mt-1">🪙 {totalTournamentGarnets} Garnets</span>
              </div>
            </div>

            {/* 3ème Place */}
            <div className="flex-1 flex flex-col items-center">
              <div className="text-3xl mb-2">🥉</div>
              <div className="font-bold text-sm text-amber-600 mb-1">
                {connectedPhones[2]?.name || '🤖 DeepMind Bot'}
              </div>
              <div className="w-full h-24 rounded-t-3xl bg-amber-900/30 border border-amber-800/30 flex flex-col items-center justify-center p-4">
                <span className="text-xs font-bold text-amber-500 uppercase">3ème Place</span>
                <span className="font-mono text-lg font-black text-white">
                  {Math.round(totalTournamentScore * 0.45)} pts
                </span>
              </div>
            </div>
          </div>

          {/* Tableau Récapitulatif des 3 Manches */}
          <div className="w-full max-w-3xl rounded-3xl bg-[#0D121B] border border-white/10 p-6 mb-8 text-left">
            <h3 className="text-sm font-black uppercase tracking-wider text-[#D4AF37] mb-4">
              Bilan des 3 Manches du Tournoi
            </h3>
            <div className="space-y-3">
              {tournamentRounds.map((r) => (
                <div
                  key={r.round}
                  className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] border border-white/5"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-[#D4AF37]/20 text-[#D4AF37] font-black text-xs flex items-center justify-center">
                      M{r.round}
                    </span>
                    <div>
                      <span className="font-bold text-sm text-white">{r.evaluation.frenchName}</span>
                      <span className="text-xs text-white/50 block">Rang {r.evaluation.tier}/10</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-sm text-amber-300 font-bold">+{r.garnets} 🪙</span>
                    <span className="font-mono text-base font-black text-[#D4AF37]">
                      +{r.breakdown.totalPoints} pts
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              data-tv-focus
              tabIndex={0}
              onClick={() => handleStartGame(difficulty, 1)}
              className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-[#D4AF37] to-[#B38728] text-black font-black uppercase text-sm tracking-wider shadow-lg shadow-[#D4AF37]/30 hover:brightness-110 outline-none focus:ring-4 focus:ring-[#D4AF37]"
            >
              <RotateCcw className="w-5 h-5" />
              Nouveau Tournoi (3 Manches)
            </button>

            <button
              data-tv-focus
              tabIndex={0}
              onClick={() => {
                if (room?.status === 'playing') {
                  returnToLobby();
                } else {
                  setPhase('idle');
                }
              }}
              className="inline-flex items-center gap-2 px-6 py-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold text-sm tracking-wider outline-none"
            >
              {room?.status === 'playing' ? 'Retour au Lobby' : "Retour à l'Accueil"}
            </button>
          </div>
        </main>
      )}

      {/* ========================================================================= */}
      {/* 5. MODAL D'AIDE ET QR CODE TÉLÉPHONE (ACCESSIBLE SUR DEMANDE VIA TOUCHE BLEUE) */}
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
                    Rejoindre la partie
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">Scannez pour connecter une manette smartphone</p>
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

                <div className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center text-xs text-slate-400">
                  <span>Ou rendez-vous sur : </span>
                  <span className="font-mono text-slate-200 font-bold underline">
                    {typeof window !== 'undefined'
                      ? window.location.host + (room?.code ? `/?room=${room.code}` : '')
                      : 'mood.tv'}
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
      {/* 6. MODAL DES RÈGLES DU JEU ET HIÉRARCHIE POKER (TOUCHE JAUNE) */}
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
                <h4 className="font-bold text-[#D4AF37] text-base mb-2">1. Format Tournoi en 3 Manches :</h4>
                <p>
                  Chaque match officiel The Devil's Plan se déroule en 3 manches consécutives. Vos points de combinaison,
                  vos bonus de rapidité et vos <strong>Pièces du Démon (Garnets 🪙)</strong> s'accumulent pour établir le
                  classement final sur le podium.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-[#D4AF37] text-base mb-2">2. Déroulement d'une Manche :</h4>
                <p>
                  16 cartes sont disposées sur une grille de 4x4 cases. Vous disposez d'un temps limité (12 à 30 secondes
                  selon la difficulté) pour mémoriser l'emplacement des valeurs et des couleurs. Dès que le temps est
                  écoulé, les cartes se retournent face cachée et <strong>3 cartes communes</strong> apparaissent au centre.
                  Vous devez sélectionner <strong>exactement 2 cartes</strong> parmi les 16 cartes cachées.
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
