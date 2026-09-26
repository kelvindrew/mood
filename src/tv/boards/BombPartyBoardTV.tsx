import React, { useEffect, useMemo, useRef } from 'react';
import { useGame } from '../../context/GameContext';
import { BombPartyGameState } from '../../types/game';
import { audio } from '../../services/audio';
import { Flame, Heart, Sparkles, Trophy, Zap, AlertTriangle } from 'lucide-react';

export const BombPartyBoardTV: React.FC = () => {
  const { room } = useGame();

  const gameState = room?.gameState as BombPartyGameState | null;

  // Safe defaults
  const phase = gameState?.phase || 'playing';
  const syllable = gameState?.currentSyllable || 'TR';
  const activePlayerId = gameState?.activePlayerId || '';
  const timeRemaining = gameState?.turnTimeRemaining ?? 15;
  const turnDuration = gameState?.turnDuration || 15;
  const combo = gameState?.combo || 0;
  const usedWords = gameState?.usedWords || [];
  const lastWord = gameState?.lastWord || null;
  const players = gameState?.players || [];
  const isGameOver = Boolean(gameState?.isGameOver);
  const podium = gameState?.finalPodium || null;

  const activePlayer = useMemo(
    () => players.find((p) => p.id === activePlayerId) || players[0],
    [players, activePlayerId]
  );

  const prevActiveIdRef = useRef(activePlayerId);
  const prevTimeRef = useRef(timeRemaining);
  const prevPhaseRef = useRef(phase);

  // Sound effects on pass and tick
  useEffect(() => {
    if (activePlayerId && activePlayerId !== prevActiveIdRef.current) {
      prevActiveIdRef.current = activePlayerId;
      audio.playSelect();
    }
  }, [activePlayerId, audio]);

  // Audio ticks when under 5s
  useEffect(() => {
    if (phase === 'playing' && timeRemaining <= 5 && timeRemaining > 0 && timeRemaining !== prevTimeRef.current) {
      prevTimeRef.current = timeRemaining;
      audio.playCustomBuzzer('bell');
    }
  }, [phase, timeRemaining]);

  // Explosion audio
  useEffect(() => {
    if (phase === 'exploding' && prevPhaseRef.current !== 'exploding') {
      audio.playCustomBuzzer('airhorn');
    }
    prevPhaseRef.current = phase;
  }, [phase]);

  // Timer percentage
  const timerPercent = Math.max(0, Math.min(100, (timeRemaining / turnDuration) * 100));
  const isCritical = timeRemaining <= 5;

  // Winner podium
  if (isGameOver && podium) {
    const winner = podium[0];
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-gradient-to-br from-slate-950 via-red-950/40 to-slate-950 text-white select-none">
        <div className="relative flex flex-col items-center max-w-4xl w-full bg-slate-900/80 border-2 border-amber-500/40 rounded-3xl p-10 shadow-2xl backdrop-blur-xl">
          <div className="w-24 h-24 rounded-full bg-amber-500/20 border-4 border-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/30 mb-4 animate-bounce">
            <Trophy className="w-12 h-12 text-amber-300" />
          </div>

          <span className="text-amber-400 font-black tracking-widest text-sm uppercase">
            💣 SURVIVANT ULTIME
          </span>
          <h1 className="text-5xl font-black font-display text-white mt-1 mb-6 text-center drop-shadow-lg">
            {winner?.name} REMPORTE LA PARTIE !
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full mt-4">
            {podium.slice(0, 3).map((p, idx) => {
              const medals = ['🥇', '🥈', '🥉'];
              const borders = [
                'border-amber-400 bg-amber-500/10 shadow-amber-500/30',
                'border-slate-300 bg-slate-400/10 shadow-slate-400/20',
                'border-amber-700 bg-amber-800/10 shadow-amber-800/20',
              ];
              return (
                <div
                  key={p.id}
                  className={`flex flex-col items-center p-6 rounded-2xl border-2 ${borders[idx]} shadow-xl`}
                >
                  <span className="text-3xl mb-2">{medals[idx]}</span>
                  <div className="w-16 h-16 rounded-full bg-slate-800 border-2 border-white/20 flex items-center justify-center text-3xl mb-2">
                    {p.avatar || '👤'}
                  </div>
                  <span className="font-bold text-xl text-white truncate max-w-full">
                    {p.name}
                  </span>
                  <span className="text-sm font-semibold text-emerald-400 mt-1">
                    {p.score} pts
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full h-full flex flex-col justify-between p-8 bg-slate-950 text-white select-none relative overflow-hidden transition-all duration-300 ${isCritical ? 'bg-red-950/30' : ''}`}>
      {/* Background ambient glowing orbs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
      {isCritical && (
        <div className="absolute inset-0 bg-red-600/10 pointer-events-none animate-pulse" />
      )}

      {/* TOP BAR: Title, Round & Combo */}
      <div className="relative z-10 flex items-center justify-between bg-slate-900/70 border border-white/10 rounded-2xl px-8 py-4 backdrop-blur-md shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-2xl shadow-inner">
            💣
          </div>
          <div>
            <h1 className="font-display font-black text-2xl tracking-wider text-white">
              TIC-TAC BOOM
            </h1>
            <span className="text-xs text-red-300 font-semibold tracking-wider uppercase">
              Passe la bombe avant l'explosion !
            </span>
          </div>
        </div>

        {/* Combo Multiplier */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-gradient-to-r from-amber-500/20 to-red-500/20 border border-amber-400/30 px-5 py-2 rounded-xl">
            <Zap className="w-5 h-5 text-amber-400 animate-pulse" />
            <span className="font-display font-black text-amber-300 text-lg">
              COMBO ×{combo}
            </span>
          </div>
          <div className="text-sm font-semibold bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-gray-300">
            Manche {gameState?.roundNumber || 1}
          </div>
        </div>
      </div>

      {/* CENTER ARENA: The Bomb & The Syllable */}
      <div className="relative z-10 flex flex-col items-center justify-center my-auto">
        {phase === 'exploding' ? (
          /* Explosion Visual State */
          <div className="flex flex-col items-center animate-bounce">
            <div className="text-8xl mb-4 drop-shadow-[0_0_50px_rgba(239,68,68,0.8)]">
              💥
            </div>
            <div className="bg-red-600 border-4 border-amber-400 px-10 py-5 rounded-3xl shadow-2xl text-center transform scale-110">
              <span className="text-amber-200 font-black text-xl tracking-widest uppercase block mb-1">
                BOOOOOOOOM !
              </span>
              <span className="text-3xl font-black font-display text-white">
                {activePlayer?.name} PERD UNE VIE !
              </span>
            </div>
          </div>
        ) : (
          /* Active Bomb with Burning Fuse & Syllable */
          <div className="flex flex-col items-center">
            {/* Active player indicator */}
            <div className="flex items-center gap-3 bg-slate-900/90 border-2 border-red-500/60 px-6 py-2.5 rounded-full mb-6 shadow-xl animate-pulse">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <span className="text-sm font-bold text-gray-300">
                La bombe est entre les mains de :
              </span>
              <span className="font-black text-lg text-white font-display">
                {activePlayer?.name}
              </span>
            </div>

            {/* Giant Bomb Circle Graphic */}
            <div className="relative flex items-center justify-center">
              {/* Circular countdown progress SVG */}
              <svg className="w-80 h-80 transform -rotate-90">
                <circle
                  cx="160"
                  cy="160"
                  r="140"
                  stroke="currentColor"
                  strokeWidth="10"
                  className="text-slate-800"
                  fill="transparent"
                />
                <circle
                  cx="160"
                  cy="160"
                  r="140"
                  stroke="currentColor"
                  strokeWidth="12"
                  strokeDasharray={2 * Math.PI * 140}
                  strokeDashoffset={2 * Math.PI * 140 * (1 - timerPercent / 100)}
                  strokeLinecap="round"
                  className={`transition-all duration-300 ${
                    isCritical ? 'text-red-500 animate-pulse' : 'text-amber-500'
                  }`}
                  fill="transparent"
                />
              </svg>

              {/* Bomb Body */}
              <div
                className={`absolute w-64 h-64 rounded-full bg-gradient-to-b from-slate-900 via-slate-950 to-black border-4 ${
                  isCritical ? 'border-red-500 shadow-red-500/50' : 'border-amber-500/60 shadow-amber-500/30'
                } shadow-2xl flex flex-col items-center justify-center p-6 text-center transition-transform ${
                  isCritical ? 'scale-105' : 'scale-100'
                }`}
              >
                {/* Fuse & Spark */}
                <div className="absolute -top-7 flex items-center justify-center">
                  <div className="w-3 h-8 bg-amber-800 rounded-sm" />
                  <div className="absolute -top-3 text-2xl animate-spin">
                    ✨
                  </div>
                </div>

                <span className="text-xs uppercase tracking-widest text-amber-400 font-bold mb-1">
                  CONTIENT LA SYLLABE
                </span>

                {/* THE SYLLABLE IN GIANT NEON LETTERS */}
                <div className="text-6xl font-black font-mono tracking-widest text-white drop-shadow-[0_0_20px_rgba(251,191,36,0.6)] bg-white/5 border border-white/10 px-6 py-2 rounded-2xl mb-2">
                  {syllable}
                </div>

                {/* Countdown display */}
                <div className="flex items-center gap-1.5 text-2xl font-black font-mono">
                  <Flame className={`w-6 h-6 ${isCritical ? 'text-red-500 animate-bounce' : 'text-amber-400'}`} />
                  <span className={isCritical ? 'text-red-400' : 'text-amber-300'}>
                    {timeRemaining}s
                  </span>
                </div>
              </div>
            </div>

            {/* Last word validated banner */}
            {lastWord && (
              <div className="mt-6 flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-5 py-2 rounded-xl text-emerald-300 font-medium text-sm animate-fade-in">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>
                  <strong>{lastWord.player}</strong> a validé{' '}
                  <strong className="text-white underline decoration-emerald-400">
                    {lastWord.word}
                  </strong>{' '}
                  !
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* BOTTOM ARENA: Players Status & Lives */}
      <div className="relative z-10 w-full">
        {/* Used words chip preview */}
        {usedWords.length > 0 && (
          <div className="flex items-center justify-center gap-2 overflow-x-auto py-2 mb-4 scrollbar-none opacity-80">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Mots trouvés :
            </span>
            {usedWords.slice(-6).map((w, idx) => (
              <span
                key={idx}
                className="text-xs font-mono font-bold bg-slate-900 border border-white/10 text-gray-300 px-2.5 py-1 rounded-md"
              >
                {w}
              </span>
            ))}
          </div>
        )}

        {/* Players Carousel with Hearts */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {players.map((p) => {
            const isActive = p.id === activePlayerId && phase === 'playing';
            const isDead = !p.isAlive || p.lives <= 0;

            return (
              <div
                key={p.id}
                className={`flex flex-col items-center p-3 rounded-2xl border-2 transition-all duration-300 backdrop-blur-md ${
                  isActive
                    ? 'border-red-500 bg-red-500/20 shadow-lg shadow-red-500/30 scale-105'
                    : isDead
                    ? 'border-slate-800 bg-slate-950/60 opacity-40'
                    : 'border-white/10 bg-slate-900/60'
                }`}
              >
                {/* Avatar with Bomb badge if active */}
                <div className="relative mb-2">
                  <div className="w-14 h-14 rounded-full bg-slate-800 border-2 border-white/20 flex items-center justify-center text-2xl shadow-inner">
                    {p.avatar || '👤'}
                  </div>
                  {isActive && (
                    <div className="absolute -top-1 -right-1 text-xl animate-bounce">
                      💣
                    </div>
                  )}
                  {isDead && (
                    <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center text-xl">
                      💀
                    </div>
                  )}
                </div>

                {/* Name */}
                <span className="font-bold text-sm text-white truncate max-w-full">
                  {p.name}
                </span>

                {/* Hearts / Lives */}
                <div className="flex items-center gap-1 mt-1.5">
                  {[...Array(3)].map((_, i) => (
                    <Heart
                      key={i}
                      className={`w-4 h-4 ${
                        i < p.lives
                          ? 'text-red-500 fill-red-500'
                          : 'text-slate-600 fill-slate-800'
                      }`}
                    />
                  ))}
                </div>

                {/* Score */}
                <span className="text-xs font-semibold text-emerald-400 mt-1">
                  {p.score} pts
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
