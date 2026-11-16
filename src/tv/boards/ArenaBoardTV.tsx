import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useGame } from '../../context/GameContext';
import { tvNav } from '../../services/tvNavigation';
import { audio } from '../../services/audio';
import { arenaLeagueService } from '../../services/arenaLeagueService';
import {
  Shield,
  Trophy,
  Clock,
  Sparkles,
  Users,
  Flame,
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  HelpCircle,
  BookOpen,
  Volume2,
} from 'lucide-react';

export const ArenaBoardTV: React.FC = () => {
  const { room, returnToLobby, sendGameAction, localPlayer } = useGame();

  const gameState = (room?.gameState || {}) as Record<string, any>;
  const subGameId = gameState.subGameId || 'memory_poker';
  const subState = (gameState.subState || {}) as Record<string, any>;

  // État de navigation au D-Pad pour la jouabilité solo directe à la télécommande
  const [tvCursor, setTvCursor] = useState<number>(0);
  const [tvSelectedPoker, setTvSelectedPoker] = useState<number[]>([]);
  const [tvGuessInput, setTvGuessInput] = useState<string>('');
  const [isRulesOverlayOpen, setIsRulesOverlayOpen] = useState<boolean>(false);
  const [hasPlayedEndAudio, setHasPlayedEndAudio] = useState<boolean>(false);
  const [hasRecordedScore, setHasRecordedScore] = useState<boolean>(false);

  const prevPhaseRef = useRef<string>('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Détection des changements de phases pour déclencher les effets sonores
  useEffect(() => {
    if (subState.phase && subState.phase !== prevPhaseRef.current) {
      if (subState.phase === 'memorize' || subState.phase === 'observe' || subState.phase === 'bidding') {
        audio.playArenaGong();
      } else if (subState.phase === 'doubt_called') {
        audio.playDoubtAlert();
      } else if (subState.phase === 'ended' && !hasPlayedEndAudio) {
        setHasPlayedEndAudio(true);
        audio.playRoyalFanfare();

        // Enregistrement des statistiques MOOD LEAGUE
        if (!hasRecordedScore && localPlayer) {
          const isWinner = subState.winnerId === localPlayer.id;
          const categoryMap: Record<string, any> = {
            memory_poker: 'memory',
            fragments_of_memory: 'memory',
            secret_number: 'logic',
            equation_pyramid: 'logic',
            knights_tour: 'logic',
            nine_mens_morris: 'strategy',
            the_virus_game: 'bluff',
            doubt_and_bet: 'bluff',
          };
          arenaLeagueService.recordMatchResult(categoryMap[subGameId] || 'strategy', isWinner, isWinner ? 50 : -20);
          setHasRecordedScore(true);
        }
      }
      prevPhaseRef.current = subState.phase;
    }

    if (subState.mustRemovePiece) {
      audio.playMillAlert();
    }
  }, [subState.phase, subState.mustRemovePiece, subGameId, localPlayer, hasPlayedEndAudio, hasRecordedScore]);

  // Battement de cœur sonore sous tension (< 5s)
  useEffect(() => {
    const timer = subState.timer || subState.revealTimeLeft || subState.observeTimeLeft || subState.questionTimeLeft;
    if (typeof timer === 'number' && timer > 0 && timer <= 4) {
      audio.playHeartbeat();
    }
  }, [subState.timer, subState.revealTimeLeft, subState.observeTimeLeft, subState.questionTimeLeft]);

  // Animation Canvas 60 FPS de pluie de Pièces du Démon en cas de victoire
  useEffect(() => {
    if (subState.phase === 'ended' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      const coins: { x: number; y: number; r: number; vx: number; vy: number; rot: number; vrot: number }[] = [];
      for (let i = 0; i < 45; i++) {
        coins.push({
          x: Math.random() * canvas.width,
          y: Math.random() * -canvas.height,
          r: 12 + Math.random() * 8,
          vx: (Math.random() - 0.5) * 2,
          vy: 3 + Math.random() * 5,
          rot: Math.random() * Math.PI,
          vrot: (Math.random() - 0.5) * 0.1,
        });
      }

      let animId: number;
      const render = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (const c of coins) {
          c.x += c.vx;
          c.y += c.vy;
          c.rot += c.vrot;
          if (c.y > canvas.height + 30) {
            c.y = -30;
            c.x = Math.random() * canvas.width;
          }

          ctx.save();
          ctx.translate(c.x, c.y);
          ctx.rotate(c.rot);

          // Dessin d'une pièce d'or du démon brillante
          ctx.beginPath();
          ctx.arc(0, 0, c.r, 0, Math.PI * 2);
          ctx.fillStyle = '#D4AF37';
          ctx.fill();
          ctx.lineWidth = 2;
          ctx.strokeStyle = '#FFE082';
          ctx.stroke();

          ctx.fillStyle = '#07090E';
          ctx.font = 'bold 12px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('🪙', 0, 0);

          ctx.restore();
        }
        animId = requestAnimationFrame(render);
      };
      render();

      return () => cancelAnimationFrame(animId);
    }
  }, [subState.phase]);

  // Contrôles Télécommande Hisense (D-Pad, Chiffres, Touches Couleur)
  const handleTvKeyDown = useCallback((e: KeyboardEvent) => {
    if (subState.phase === 'ended') return;

    // Touche Jaune ou 'h' / 'H' : bascule de l'aide-mémoire
    if (e.key === 'Yellow' || e.key === 'y' || e.key === 'Y' || e.key === 'F3') {
      audio.playSelect();
      setIsRulesOverlayOpen(prev => !prev);
      return;
    }

    // Gestion du D-Pad selon le jeu actif
    if (subGameId === 'memory_poker' && subState.phase === 'selection') {
      if (e.key === 'ArrowRight') setTvCursor(c => (c + 1) % 16);
      else if (e.key === 'ArrowLeft') setTvCursor(c => (c - 1 + 16) % 16);
      else if (e.key === 'ArrowDown') setTvCursor(c => (c + 4) % 16);
      else if (e.key === 'ArrowUp') setTvCursor(c => (c - 4 + 16) % 16);
      else if (e.key === 'Enter') {
        audio.playSelect();
        setTvSelectedPoker(prev => {
          const next = prev.includes(tvCursor)
            ? prev.filter(i => i !== tvCursor)
            : prev.length < 2
            ? [...prev, tvCursor]
            : [prev[0], tvCursor];
          sendGameAction('select_cards', { cardIndices: next });
          return next;
        });
      }
    } else if (subGameId === 'knights_tour' && subState.phase === 'playing') {
      const bSize = subState.boardSize || 5;
      if (e.key === 'ArrowRight') setTvCursor(c => (c + 1) % (bSize * bSize));
      else if (e.key === 'ArrowLeft') setTvCursor(c => (c - 1 + bSize * bSize) % (bSize * bSize));
      else if (e.key === 'ArrowDown') setTvCursor(c => (c + bSize) % (bSize * bSize));
      else if (e.key === 'ArrowUp') setTvCursor(c => (c - bSize + bSize * bSize) % (bSize * bSize));
      else if (e.key === 'Enter') {
        const row = Math.floor(tvCursor / bSize);
        const col = tvCursor % bSize;
        audio.playSelect();
        sendGameAction('move_knight', { row, col });
      }
    } else if (subGameId === 'nine_mens_morris' && subState.phase !== 'ended') {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') setTvCursor(c => (c + 1) % 24);
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') setTvCursor(c => (c - 1 + 24) % 24);
      else if (e.key === 'Enter') {
        audio.playSelect();
        if (subState.mustRemovePiece) {
          sendGameAction('remove_piece', { pointIndex: tvCursor });
        } else if (subState.phase === 'placement') {
          sendGameAction('place_piece', { pointIndex: tvCursor });
        }
      }
    } else if (subGameId === 'secret_number' && subState.phase === 'playing') {
      // Saisie directe des chiffres 0-9 sur la télécommande
      if (/^[0-9]$/.test(e.key)) {
        audio.playFocus();
        setTvGuessInput(prev => {
          if (prev.length < 3 && !prev.includes(e.key)) {
            const next = prev + e.key;
            if (next.length === 3) {
              sendGameAction('submit_guess', { guess: next });
              return '';
            }
            return next;
          }
          return prev;
        });
      }
    } else if (subGameId === 'fragments_of_memory' && subState.phase === 'question') {
      // Touches 1, 2, 3, 4 pour répondre A, B, C, D
      if (['1', '2', '3', '4'].includes(e.key)) {
        audio.playSelect();
        sendGameAction('submit_answer', { optionIndex: Number(e.key) - 1 });
      }
    }
  }, [subGameId, subState.phase, subState.boardSize, subState.mustRemovePiece, tvCursor, sendGameAction]);

  useEffect(() => {
    window.addEventListener('keydown', handleTvKeyDown);
    return () => window.removeEventListener('keydown', handleTvKeyDown);
  }, [handleTvKeyDown]);

  useEffect(() => {
    const unregisterKeys = tvNav.registerKeyHandler((key) => {
      if (key === 'red') {
        audio.playBack();
        returnToLobby();
        return true;
      } else if (key === 'green') {
        audio.playSelect();
        if (subGameId === 'doubt_and_bet') {
          sendGameAction('submit_bid', { color: 'gold', quantity: (subState.currentBid?.quantity || 2) + 1 });
          return true;
        } else if (subGameId === 'memory_poker' && tvSelectedPoker.length === 2) {
          sendGameAction('select_cards', { cardIndices: tvSelectedPoker });
          return true;
        }
      } else if (key === 'yellow') {
        audio.playSelect();
        setIsRulesOverlayOpen(prev => !prev);
        return true;
      } else if (key === 'blue') {
        if (subGameId === 'doubt_and_bet') {
          audio.playDoubtAlert();
          sendGameAction('call_doubt');
          return true;
        }
      }
      return false;
    });

    return () => unregisterKeys();
  }, [subGameId, subState.currentBid, tvSelectedPoker, returnToLobby, sendGameAction]);

  const activeTurnPlayer = room?.players.find(p => p.id === subState.turnPlayerId);

  return (
    <div className="relative min-h-screen bg-[#07090E] text-white flex flex-col justify-between p-6 md:p-8 select-none overflow-hidden font-sans">
      {/* Halo d'ambiance The Devil's Plan */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[1000px] h-[600px] rounded-full bg-gradient-to-b from-[#D4AF37]/10 via-[#DC2626]/5 to-transparent blur-[160px]" />
      </div>

      {/* Canvas pour feux d'artifice de Pièces du Démon 🪙 */}
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-40" />

      {/* HEADER DE MATCH ARENA */}
      <header className="relative z-10 flex items-center justify-between pb-4 border-b border-white/10">
        <div className="flex items-center gap-4">
          <button
            data-tv-focus
            tabIndex={0}
            onClick={() => {
              audio.playSelect();
              returnToLobby();
            }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-all outline-none"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Quitter</span>
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-black text-2xl tracking-tight text-white uppercase">
                {subGameId.replace(/_/g, ' ')}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37]">
                ARENA
              </span>
            </div>
            <p className="text-xs text-white/50">
              Salon #{room?.code} • {room?.players.length} Joueur(s) • D-Pad & Manettes Mobiles Actifs
            </p>
          </div>
        </div>

        {/* Bouton Aide-Mémoire & Panneau de joueurs */}
        <div className="flex items-center gap-3">
          <button
            data-tv-focus
            tabIndex={0}
            onClick={() => {
              audio.playSelect();
              setIsRulesOverlayOpen(prev => !prev);
            }}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37]/25 text-xs font-black uppercase tracking-wider outline-none transition-all shadow-[0_0_12px_rgba(212,175,55,0.15)]"
          >
            <BookOpen className="w-4 h-4" />
            <span>Règles (Touche Jaune)</span>
          </button>

          {room?.players.map(p => {
            const isTurn = p.id === subState.turnPlayerId;
            return (
              <div
                key={p.id}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all ${
                  isTurn
                    ? 'bg-[#D4AF37]/20 border-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.3)] animate-pulse'
                    : 'bg-white/5 border-white/10'
                }`}
              >
                <span className="text-base">{p.avatar || '👤'}</span>
                <div>
                  <span className="block text-xs font-bold text-white leading-tight">
                    {p.name}
                  </span>
                  <span className="font-mono text-[10px] font-bold text-[#D4AF37]">
                    {p.score || 0} pts
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </header>

      {/* ZONE CENTRALE DU PLATEAU DE JEU ACTIF */}
      <main className="relative z-10 flex-1 flex items-center justify-center my-4">
        {/* ========================================================= */}
        {/* 1. MEMORY POKER */}
        {/* ========================================================= */}
        {subGameId === 'memory_poker' && (
          <div className="w-full max-w-4xl flex flex-col items-center">
            <div className="mb-4 text-center">
              <span className="text-xs font-black uppercase tracking-widest text-[#D4AF37] block mb-1">
                {subState.phase === 'memorize' && 'Phase 1 : Mémorisation de la Grille !'}
                {subState.phase === 'selection' && `Phase 2 : Choisissez 2 cartes secrètes (Sélection TV : ${tvSelectedPoker.length}/2) - D-Pad + OK`}
                {subState.phase === 'showdown' && 'Phase Finale : Dévoilement des Mains !'}
                {subState.phase === 'ended' && 'Partie Terminée !'}
              </span>
              {subState.phase === 'memorize' && (
                <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-red-600/20 border border-red-500/40 text-red-400 font-mono text-base font-black animate-pulse">
                  <Clock className="w-4 h-4" /> {subState.revealTimeLeft || subState.timeLeft}s restantes
                </div>
              )}
              {subState.phase === 'selection' && subState.communityCards && subState.communityCards.length > 0 && (
                <div className="mt-3 flex flex-col items-center">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#D4AF37] mb-1.5 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" /> 3 Cartes Communes au Centre
                  </span>
                  <div className="flex items-center gap-3 p-2.5 px-4 rounded-2xl bg-black/60 border border-[#D4AF37]/50 shadow-[0_0_20px_rgba(212,175,55,0.2)]">
                    {subState.communityCards.map((c: any, cIdx: number) => (
                      <div
                        key={cIdx}
                        className="w-14 h-20 md:w-16 md:h-24 rounded-xl bg-gradient-to-br from-white to-slate-200 border-2 border-white shadow-xl flex flex-col items-center justify-between p-1.5 text-black"
                      >
                        <span className="text-xs font-black self-start font-mono leading-none">{c.display}</span>
                        <span className={`text-2xl ${c.suit === 'heart' || c.suit === 'diamond' ? 'text-red-600' : 'text-slate-900'}`}>
                          {c.suit === 'spade' && '♠'}
                          {c.suit === 'heart' && '♥'}
                          {c.suit === 'diamond' && '♦'}
                          {c.suit === 'club' && '♣'}
                        </span>
                        <span className="text-xs font-black self-end font-mono leading-none">{c.display}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {subState.phase === 'selection' && tvSelectedPoker.length === 2 && (
                <button
                  data-tv-focus
                  tabIndex={0}
                  onClick={() => sendGameAction('confirm_selection', { cardIndices: tvSelectedPoker })}
                  className="mt-3 inline-flex items-center gap-2 px-6 py-2 rounded-xl bg-[#D4AF37] text-black font-black uppercase text-xs tracking-wider shadow-lg hover:brightness-110 active:scale-95 transition-all outline-none"
                >
                  <CheckCircle2 className="w-4 h-4" /> Confirmer ma sélection (2 cartes)
                </button>
              )}
            </div>

            {/* Grille de cartes 4x4 navigable au D-Pad */}
            <div className="grid grid-cols-4 gap-3.5 p-5 rounded-3xl bg-[#0E131C] border border-white/15 shadow-2xl">
              {(subState.grid || Array(16).fill(null)).map((card: any, idx: number) => {
                const isRevealed = Boolean(card);
                const isSelectedOnTv = tvSelectedPoker.includes(idx);
                const isCursorHere = tvCursor === idx && subState.phase === 'selection';

                return (
                  <div
                    key={idx}
                    className={`w-24 h-32 md:w-28 md:h-36 rounded-2xl flex flex-col items-center justify-between p-3 border transition-all duration-300 ${
                      isCursorHere ? 'ring-4 ring-[#D4AF37] scale-105 z-20' : ''
                    } ${
                      isSelectedOnTv ? 'bg-[#D4AF37]/30 border-[#D4AF37] shadow-lg' :
                      isRevealed
                        ? 'bg-gradient-to-br from-white to-slate-200 text-black border-white shadow-xl scale-100'
                        : 'bg-[#151B27] border-white/10 shadow-inner scale-95'
                    }`}
                  >
                    {isRevealed ? (
                      <>
                        <span className="text-xs font-black self-start font-mono">{card.display}</span>
                        <span className={`text-4xl ${card.suit === 'heart' || card.suit === 'diamond' ? 'text-red-600' : 'text-slate-900'}`}>
                          {card.suit === 'spade' && '♠'}
                          {card.suit === 'heart' && '♥'}
                          {card.suit === 'diamond' && '♦'}
                          {card.suit === 'club' && '♣'}
                        </span>
                        <span className="text-xs font-black self-end font-mono">{card.display}</span>
                      </>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                        <div className={`w-12 h-16 rounded-xl border flex items-center justify-center font-mono text-sm font-bold ${
                          isSelectedOnTv ? 'bg-[#D4AF37] text-black border-white' : 'border-white/20 bg-white/5 text-white/40'
                        }`}>
                          #{idx + 1}
                        </div>
                        {isSelectedOnTv && <span className="text-[9px] font-black text-[#D4AF37]">COCHER</span>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Résultats du Showdown */}
            {subState.playerHands && Object.keys(subState.playerHands).length > 0 && (
              <div className="mt-6 flex flex-wrap gap-4 justify-center w-full">
                {Object.entries(subState.playerHands).map(([pid, hand]: [string, any]) => {
                  const player = room?.players.find(p => p.id === pid);
                  const isWinner = pid === subState.winnerId;
                  return (
                    <div
                      key={pid}
                      className={`p-3.5 px-5 rounded-2xl border flex items-center gap-4 ${
                        isWinner
                          ? 'bg-[#D4AF37]/20 border-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.4)]'
                          : 'bg-white/5 border-white/10'
                      }`}
                    >
                      <span className="text-2xl">{player?.avatar || '👤'}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">{player?.name}</span>
                          {isWinner && <span className="text-xs text-[#D4AF37] font-black">👑 VAINQUEUR</span>}
                        </div>
                        <span className="font-mono text-xs font-black text-[#D4AF37]">
                          {hand.handName || hand.evaluation?.frenchName} ({hand.score || 0} pts)
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* 2. FRAGMENTS OF MEMORY */}
        {/* ========================================================= */}
        {subGameId === 'fragments_of_memory' && (
          <div className="w-full max-w-4xl flex flex-col items-center">
            {subState.phase === 'observe' && (
              <div className="w-full flex flex-col items-center animate-fade-in">
                <div className="mb-3 inline-flex items-center gap-2 px-5 py-1.5 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 font-mono text-base font-black animate-pulse">
                  <Clock className="w-4 h-4" /> Observation : {subState.observeTimeLeft}s
                </div>

                <div className="w-full p-8 rounded-3xl bg-gradient-to-br from-[#0F172A] to-[#020617] border border-cyan-500/30 shadow-[0_0_40px_rgba(6,182,212,0.15)] relative overflow-hidden">
                  <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">
                        {subState.scene?.theme}
                      </span>
                      <h3 className="text-2xl font-black font-display text-white">
                        {subState.scene?.title}
                      </h3>
                    </div>
                    <span className="text-xs text-white/50">{subState.scene?.description}</span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {subState.scene?.visualData && Object.entries(subState.scene.visualData).map(([key, val]: [string, any]) => (
                      <div key={key} className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
                        <span className="block text-[10px] text-white/40 uppercase font-bold mb-1">
                          {key.replace(/([A-Z])/g, ' $1')}
                        </span>
                        <span className="text-base font-black text-cyan-300 font-mono">{String(val)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {subState.phase === 'question' && (
              <div className="w-full flex flex-col items-center animate-fade-in">
                <div className="mb-3 inline-flex items-center gap-2 px-5 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 font-mono text-sm font-black">
                  Question {subState.currentQuestionIndex + 1} / {subState.totalQuestions} • {subState.questionTimeLeft}s (Touches 1-4)
                </div>

                <div className="w-full p-6 rounded-3xl bg-[#0E131C] border border-white/15 text-center mb-4">
                  <h3 className="text-2xl md:text-3xl font-black font-display text-white leading-snug">
                    {subState.currentQuestion?.text}
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-3.5 w-full">
                  {subState.currentQuestion?.options.map((opt: string, i: number) => (
                    <div
                      key={i}
                      className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-4 text-left"
                    >
                      <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-black text-xs text-white font-mono">
                        {i + 1}
                      </span>
                      <span className="font-bold text-white text-base">{opt}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* 3. SECRET NUMBER */}
        {/* ========================================================= */}
        {subGameId === 'secret_number' && (
          <div className="w-full max-w-3xl flex flex-col items-center">
            <div className="mb-4 text-center">
              <span className="text-xs font-black uppercase tracking-widest text-[#D4AF37] block mb-1">
                Tour Actif : {activeTurnPlayer?.name || 'En attente...'}
              </span>
              <p className="text-xs text-white/50">
                Tapez les chiffres 0-9 sur votre télécommande pour saisir une hypothèse directe !
              </p>
              {tvGuessInput && (
                <div className="mt-2 inline-flex items-center gap-2 px-4 py-1 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37] font-mono text-xl font-black text-[#D4AF37]">
                  Saisie Télécommande : {tvGuessInput}
                </div>
              )}
            </div>

            {/* Registre des hypothèses passées */}
            <div className="w-full p-5 rounded-3xl bg-[#0E131C] border border-white/15 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
                <span className="text-xs font-black uppercase tracking-wider text-white/60">
                  Historique des Tentatives
                </span>
                <span className="text-xs text-[#D4AF37] font-semibold">
                  🟢 Strikes = Bien placé • 🟡 Balls = Mal placé
                </span>
              </div>

              <div className="space-y-2 max-h-[260px] overflow-y-auto pr-2 scrollbar-none">
                {subState.history && subState.history.length > 0 ? (
                  subState.history.map((entry: any, i: number) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-sm text-white">{entry.playerName}</span>
                        <span className="text-xs text-white/40">a deviné :</span>
                        <span className="font-mono text-lg font-black text-white px-2 py-0.5 rounded bg-white/10">
                          {entry.guess}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 font-mono text-xs font-bold">
                          {entry.strikes} Strike{entry.strikes > 1 ? 's' : ''}
                        </span>
                        <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-400 font-mono text-xs font-bold">
                          {entry.balls} Ball{entry.balls > 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-white/30 text-xs font-semibold">
                    Aucune tentative formulée pour le moment. En attente du premier coup...
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 4. THE VIRUS GAME */}
        {/* ========================================================= */}
        {subGameId === 'the_virus_game' && (
          <div className="w-full max-w-4xl flex flex-col items-center">
            <div className="mb-4 text-center">
              <span className={`text-xs font-black uppercase tracking-widest block mb-1 ${
                subState.phase === 'night' ? 'text-indigo-400' : 'text-emerald-400'
              }`}>
                {subState.phase === 'night' && '🌙 Phase de Nuit : Les contaminateurs et soignants agissent en secret...'}
                {subState.phase === 'day_discussion' && '☀️ Phase de Jour : Débattez pour identifier les porteurs du virus !'}
                {subState.phase === 'day_voting' && '🗳️ Phase de Vote : Votez sur mobile pour isoler un suspect !'}
                {subState.phase === 'quarantine_reveal' && '🚨 Délibération de Quarantaine !'}
              </span>
              <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-white/10 text-white font-mono text-sm font-bold">
                <Clock className="w-4 h-4" /> {subState.timer}s
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full">
              {room?.players.map(p => {
                const isQuarantined = subState.quarantinedPlayers?.includes(p.id);
                return (
                  <div
                    key={p.id}
                    className={`p-6 rounded-2xl border text-center transition-all ${
                      isQuarantined
                        ? 'bg-red-950/30 border-red-500/40 opacity-60'
                        : 'bg-[#0E131C] border-white/15'
                    }`}
                  >
                    <span className="text-4xl block mb-2">{p.avatar || '👤'}</span>
                    <h4 className="font-bold text-white text-sm mb-1">{p.name}</h4>
                    {isQuarantined ? (
                      <span className="px-2 py-0.5 rounded bg-red-600/30 text-red-400 text-[10px] font-black uppercase tracking-wider">
                        En Quarantaine
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                        En Jeu
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 5. DOUBT AND BET */}
        {/* ========================================================= */}
        {subGameId === 'doubt_and_bet' && (
          <div className="w-full max-w-3xl flex flex-col items-center">
            <div className="mb-4 text-center">
              <span className="text-xs font-black uppercase tracking-widest text-[#D4AF37] block mb-1">
                Tour Actif : {activeTurnPlayer?.name || 'En attente...'}
              </span>
            </div>

            {/* Bannière de l'enchère active */}
            <div className="w-full p-8 rounded-3xl bg-gradient-to-r from-[#151A25] via-[#1A2232] to-[#151A25] border border-[#D4AF37]/40 shadow-2xl text-center mb-6">
              <span className="text-xs text-white/50 uppercase font-bold tracking-widest block mb-2">
                Enchère Courante sur la Table
              </span>

              {subState.currentBid ? (
                <div className="space-y-2">
                  <div className="text-4xl md:text-5xl font-black font-display text-white">
                    {subState.currentBid.quantity} Cartes {subState.currentBid.colorName}
                  </div>
                  <p className="text-xs text-[#D4AF37] font-semibold">
                    Annoncé par {subState.currentBid.playerName}
                  </p>
                </div>
              ) : (
                <div className="text-xl font-bold text-white/40">
                  En attente de la première enchère... (Touche Verte : Relancer)
                </div>
              )}
            </div>

            {/* Alerte Doute */}
            {subState.phase === 'doubt_called' && (
              <div className="p-4 rounded-2xl bg-red-600/20 border border-red-500 text-red-400 text-center animate-bounce font-black text-xl tracking-wider">
                🚨 {subState.callerName} A CRIÉ « DOUTE ! » — VÉRIFICATION EN COURS !
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* 6. EQUATION PYRAMID */}
        {/* ========================================================= */}
        {subGameId === 'equation_pyramid' && (
          <div className="w-full max-w-3xl flex flex-col items-center">
            <div className="mb-4 text-center">
              <span className="text-xs font-black uppercase tracking-widest text-pink-400 block mb-1">
                Objectif Céleste : Atteindre le sommet !
              </span>
              <div className="inline-flex items-center gap-2 px-5 py-1.5 rounded-full bg-pink-500/20 border border-pink-400/40 text-pink-300 font-mono text-2xl font-black">
                Sommet Cible : {subState.targetSum}
              </div>
            </div>

            <div className="flex flex-col items-center gap-4 p-6 rounded-3xl bg-[#0E131C] border border-white/15">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-3xl font-black font-mono shadow-xl">
                {subState.targetSum}
              </div>

              <div className="flex items-center gap-6">
                <div className="w-18 h-18 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center font-mono text-xl font-bold">
                  ?
                </div>
                <div className="w-18 h-18 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center font-mono text-xl font-bold">
                  ?
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-mono text-lg font-bold">
                  ?
                </div>
                <div className="w-14 h-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-mono text-lg font-bold">
                  ?
                </div>
                <div className="w-14 h-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-mono text-lg font-bold">
                  ?
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 7. KNIGHT'S TOUR */}
        {/* ========================================================= */}
        {subGameId === 'knights_tour' && (
          <div className="flex flex-col items-center">
            <div className="mb-3 text-center">
              <span className="text-xs font-black uppercase tracking-widest text-[#D4AF37] block mb-1">
                Tour Actif : {activeTurnPlayer?.name || 'En attente...'} (Contrôle D-Pad TV + OK)
              </span>
              <p className="text-xs text-white/50">
                Déplacez le Cavalier royal en "L". Évitez de vous faire piéger !
              </p>
            </div>

            <div className="p-4 rounded-3xl bg-[#0E131C] border border-white/20 shadow-2xl">
              <div
                className="grid gap-2"
                style={{ gridTemplateColumns: `repeat(${subState.boardSize || 5}, minmax(0, 1fr))` }}
              >
                {(subState.visited || []).map((row: boolean[], rIdx: number) =>
                  row.map((isVisited: boolean, cIdx: number) => {
                    const isKnight = subState.currentPosition?.row === rIdx && subState.currentPosition?.col === cIdx;
                    const isValidMove = (subState.validMoves || []).some((m: any) => m.row === rIdx && m.col === cIdx);
                    const bSize = subState.boardSize || 5;
                    const isCursor = tvCursor === (rIdx * bSize + cIdx);

                    return (
                      <div
                        key={`${rIdx}-${cIdx}`}
                        className={`w-14 h-14 md:w-16 md:h-16 rounded-xl border flex items-center justify-center text-xl font-black transition-all ${
                          isCursor ? 'ring-4 ring-amber-400 z-20 scale-105' : ''
                        } ${
                          isKnight
                            ? 'bg-[#D4AF37] text-black border-white shadow-[0_0_20px_rgba(212,175,55,0.6)]'
                            : isVisited
                            ? 'bg-slate-900 border-white/5 text-white/20'
                            : isValidMove
                            ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-400 animate-pulse'
                            : 'bg-white/5 border-white/10'
                        }`}
                      >
                        {isKnight ? '♞' : isVisited ? '✕' : ''}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 8. NINE MEN'S MORRIS */}
        {/* ========================================================= */}
        {subGameId === 'nine_mens_morris' && (
          <div className="flex flex-col items-center">
            <div className="mb-3 text-center">
              <div className="flex items-center gap-3 justify-center mb-1">
                <span className={`w-3.5 h-3.5 rounded-full ${
                  subState.turnColor === 'white' ? 'bg-white shadow-[0_0_10px_white]' : 'bg-slate-800 border border-white/40'
                }`} />
                <span className="text-xs font-black uppercase tracking-widest text-[#D4AF37]">
                  Tour des {subState.turnColor === 'white' ? 'Blancs' : 'Noirs'} ({activeTurnPlayer?.name}) • D-Pad: point #{tvCursor}
                </span>
              </div>
              <p className="text-xs text-white/50">
                Phase : {subState.phase === 'placement' ? 'Pose des 9 pions' : subState.phase === 'movement' ? 'Déplacement' : 'Vol libre'}
                {subState.mustRemovePiece && ' • ⚔️ MOULIN ! Capturez un pion adverse !'}
              </p>
            </div>

            <div className="relative w-[340px] h-[340px] md:w-[420px] md:h-[420px] rounded-3xl bg-[#0E131C] border border-white/20 p-6 shadow-2xl flex items-center justify-center">
              <div className="absolute inset-8 border-2 border-white/30 rounded-lg pointer-events-none" />
              <div className="absolute inset-16 md:inset-20 border-2 border-white/30 rounded-lg pointer-events-none" />
              <div className="absolute inset-24 md:inset-32 border-2 border-white/30 rounded-lg pointer-events-none" />

              <div className="absolute top-8 bottom-8 left-1/2 w-0.5 bg-white/30 -translate-x-1/2 pointer-events-none" />
              <div className="absolute left-8 right-8 top-1/2 h-0.5 bg-white/30 -translate-y-1/2 pointer-events-none" />
              <div className="absolute inset-28 md:inset-36 bg-[#0E131C] z-0" />

              <div className="relative z-10 w-full h-full">
                {(subState.board || Array(24).fill(null)).map((color: any, idx: number) => {
                  const isCursor = tvCursor === idx;
                  return (
                    <div
                      key={idx}
                      className={`absolute w-7 h-7 md:w-8 md:h-8 rounded-full -translate-x-1/2 -translate-y-1/2 flex items-center justify-center border transition-all ${
                        isCursor ? 'ring-4 ring-[#D4AF37] scale-125 z-30' : ''
                      } ${
                        color === 'white'
                          ? 'bg-white border-slate-300 shadow-[0_0_12px_rgba(255,255,255,0.8)]'
                          : color === 'black'
                          ? 'bg-slate-900 border-white/40 shadow-inner'
                          : 'bg-[#151B27] border-white/20 hover:border-white/60'
                      }`}
                      style={getMorrisCoordinates(idx)}
                    >
                      <span className="text-[9px] font-mono text-white/30">{idx}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* FOOTER & RACCOURCIS TÉLÉCOMMANDE TV */}
      <footer className="relative z-10 flex items-center justify-between pt-3 border-t border-white/10 text-xs text-white/60">
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-600 font-bold" />
            <strong className="text-white">Rouge</strong> : Quitter
          </span>
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 font-bold" />
            <strong className="text-white">Vert</strong> : Action / Valider
          </span>
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-400 font-bold" />
            <strong className="text-white">Jaune</strong> : Règles & Aide
          </span>
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-500 font-bold" />
            <strong className="text-white">Bleu</strong> : Doute
          </span>
        </div>

        <span className="text-xs text-[#D4AF37] font-semibold">
          🎮 Jouable au D-Pad & Télécommande TV Hisense ou Manette Mobile
        </span>
      </footer>

      {/* MODAL TRANSLUCIDE D'AIDE-MÉMOIRE EN COURS DE JEU (TOUCHE JAUNE) */}
      {isRulesOverlayOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-8 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-2xl rounded-3xl bg-[#0E131C] border border-[#D4AF37]/50 p-8 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
              <div className="flex items-center gap-3">
                <BookOpen className="w-6 h-6 text-[#D4AF37]" />
                <h3 className="text-xl font-black font-display text-white uppercase">
                  Aide & Règles : {subGameId.replace(/_/g, ' ')}
                </h3>
              </div>
              <button
                onClick={() => setIsRulesOverlayOpen(false)}
                className="px-4 py-1.5 rounded-xl bg-white/10 text-white font-bold text-xs uppercase"
              >
                Fermer (Touche Jaune)
              </button>
            </div>

            <div className="space-y-4 text-sm text-white/80 leading-relaxed max-h-[50vh] overflow-y-auto pr-2">
              {subGameId === 'memory_poker' && (
                <div>
                  <h4 className="font-bold text-[#D4AF37] mb-2">Hiérarchie des Mains de Poker :</h4>
                  <p>1. Quinte Flush Royale (As à 10 même couleur)<br />
                  2. Quinte Flush (5 cartes consécutives même couleur)<br />
                  3. Carré (4 cartes de même rang)<br />
                  4. Full House (3 cartes d'un rang + 2 d'un autre)<br />
                  5. Couleur (5 cartes même couleur)<br />
                  6. Quinte (5 cartes consécutives)<br />
                  7. Brelan • 8. Deux Paires • 9. Paire • 10. Carte Haute</p>
                </div>
              )}

              {subGameId === 'secret_number' && (
                <div>
                  <h4 className="font-bold text-[#D4AF37] mb-2">Comprendre les Réponses :</h4>
                  <p>• <strong>Strike (🟢)</strong> : Le chiffre est exact et se trouve à la bonne place.<br />
                  • <strong>Ball (🟡)</strong> : Le chiffre fait partie du nombre secret adverse, mais se situe à une position différente.<br />
                  • <strong>3 Strikes</strong> = Victoire immédiate !</p>
                </div>
              )}

              {subGameId === 'nine_mens_morris' && (
                <div>
                  <h4 className="font-bold text-[#D4AF37] mb-2">Règles du Jeu du Moulin :</h4>
                  <p>• <strong>Phase 1</strong> : Posez vos 9 pions sur les intersections libres.<br />
                  • <strong>Moulin (3 pions alignés)</strong> : Vous autorise à retirer un pion adverse qui n'est pas déjà dans un moulin.<br />
                  • <strong>Phase 2</strong> : Déplacez un pion vers une case voisine reliée.<br />
                  • <strong>Phase 3 (3 pions restants)</strong> : Vous pouvez voler vers n'importe quelle case libre.</p>
                </div>
              )}

              {subGameId === 'doubt_and_bet' && (
                <div>
                  <h4 className="font-bold text-[#D4AF37] mb-2">Règles du Doute & Enchères :</h4>
                  <p>• Annoncez une quantité d'une couleur présente sur la table entière.<br />
                  • La hiérarchie des couleurs : Noir &lt; Rouge &lt; Platine &lt; Or Impérial.<br />
                  • Criez <strong>« DOUTE ! »</strong> si vous estimez que l'annonce précédente est surévaluée.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function getMorrisCoordinates(idx: number): React.CSSProperties {
  const coords: Record<number, { top: string; left: string }> = {
    0: { top: '0%', left: '0%' },
    1: { top: '0%', left: '50%' },
    2: { top: '0%', left: '100%' },
    3: { top: '50%', left: '100%' },
    4: { top: '100%', left: '100%' },
    5: { top: '100%', left: '50%' },
    6: { top: '100%', left: '0%' },
    7: { top: '50%', left: '0%' },

    8: { top: '16.6%', left: '16.6%' },
    9: { top: '16.6%', left: '50%' },
    10: { top: '16.6%', left: '83.3%' },
    11: { top: '50%', left: '83.3%' },
    12: { top: '83.3%', left: '83.3%' },
    13: { top: '83.3%', left: '50%' },
    14: { top: '83.3%', left: '16.6%' },
    15: { top: '50%', left: '16.6%' },

    16: { top: '33.3%', left: '33.3%' },
    17: { top: '33.3%', left: '50%' },
    18: { top: '33.3%', left: '66.6%' },
    19: { top: '50%', left: '66.6%' },
    20: { top: '66.6%', left: '66.6%' },
    21: { top: '66.6%', left: '50%' },
    22: { top: '66.6%', left: '33.3%' },
    23: { top: '50%', left: '33.3%' },
  };

  return coords[idx] || { top: '50%', left: '50%' };
}
