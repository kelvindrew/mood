import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useGame } from '../../../context/GameContext';
import { BombPartyGameState } from '../../../types/game';
import { audio } from '../../../services/audio';
import { triggerHaptic, hapticPatterns } from '../../components/HapticFeedback';
import { Flame, Heart, Send, Sparkles, Trophy, AlertTriangle, ShieldAlert } from 'lucide-react';

export const BombPartyController: React.FC = () => {
  const { room, localPlayer, sendGameAction } = useGame();

  const [inputWord, setInputWord] = useState('');
  const [localError, setLocalError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const gameState = room?.gameState as BombPartyGameState | null;

  const phase = gameState?.phase || 'playing';
  const syllable = gameState?.currentSyllable || 'TR';
  const activePlayerId = gameState?.activePlayerId || '';
  const timeRemaining = gameState?.turnTimeRemaining ?? 15;
  const combo = gameState?.combo || 0;
  const players = gameState?.players || [];
  const isGameOver = Boolean(gameState?.isGameOver);
  const podium = gameState?.finalPodium || null;

  const myId = localPlayer?.id || '';
  const isMyTurn = activePlayerId === myId && phase === 'playing';

  const myPlayer = useMemo(
    () => players.find((p) => p.id === myId),
    [players, myId]
  );
  const myLives = myPlayer?.lives ?? 3;
  const isAlive = myPlayer?.isAlive ?? true;

  const activePlayer = useMemo(
    () => players.find((p) => p.id === activePlayerId),
    [players, activePlayerId]
  );

  const prevTurnRef = useRef(isMyTurn);
  const prevTimeRef = useRef(timeRemaining);

  // Focus input and trigger buzz when bomb is passed to user
  useEffect(() => {
    if (isMyTurn && !prevTurnRef.current) {
      triggerHaptic(hapticPatterns.error);
      audio.playSelect();
      setInputWord('');
      setLocalError('');
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
    prevTurnRef.current = isMyTurn;
  }, [isMyTurn]);

  // Haptic alert when time is critical on my turn
  useEffect(() => {
    if (isMyTurn && timeRemaining <= 5 && timeRemaining > 0 && timeRemaining !== prevTimeRef.current) {
      prevTimeRef.current = timeRemaining;
      triggerHaptic(hapticPatterns.buzzer);
    }
  }, [isMyTurn, timeRemaining]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!isMyTurn || !inputWord.trim()) return;

    const clean = inputWord
      .trim()
      .toUpperCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^A-Z]/g, '');

    if (clean.length < 3) {
      setLocalError('Le mot doit faire au moins 3 lettres !');
      triggerHaptic(hapticPatterns.error);
      return;
    }

    if (!clean.includes(syllable)) {
      setLocalError(`Le mot doit contenir "${syllable}" !`);
      triggerHaptic(hapticPatterns.error);
      return;
    }

    setLocalError('');
    triggerHaptic(hapticPatterns.success);
    audio.playSelect();

    sendGameAction('bp_submit_word', { word: clean });
    setInputWord('');
  };

  // GAMEOVER VIEW
  if (isGameOver && podium) {
    const winner = podium[0];
    const myRank = podium.find((p) => p.id === myId)?.rank ?? 1;

    return (
      <div className="flex flex-col items-center justify-between min-h-screen bg-slate-950 text-white p-6 select-none">
        <div className="flex flex-col items-center text-center mt-8">
          <div className="w-20 h-20 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center mb-4">
            <Trophy className="w-10 h-10 text-amber-300 animate-bounce" />
          </div>
          <span className="text-amber-400 font-black uppercase tracking-widest text-xs">
            FIN DE LA PARTIE
          </span>
          <h1 className="text-3xl font-black font-display text-white mt-1">
            {winner?.name} a survécu !
          </h1>
          <p className="text-sm text-gray-400 mt-2">
            Tu termines au rang <strong className="text-white">#{myRank}</strong> avec{' '}
            <strong className="text-emerald-400">{myPlayer?.score ?? 0} pts</strong>.
          </p>
        </div>

        <div className="w-full bg-slate-900 border border-white/10 rounded-2xl p-4 my-auto">
          <span className="text-xs uppercase tracking-wider text-gray-400 font-bold block mb-3 text-center">
            Classement Final
          </span>
          <div className="space-y-2">
            {podium.slice(0, 4).map((p) => (
              <div
                key={p.id}
                className={`flex items-center justify-between p-3 rounded-xl border ${
                  p.id === myId
                    ? 'border-emerald-500 bg-emerald-500/10'
                    : 'border-white/5 bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-bold text-amber-400">#{p.rank}</span>
                  <span className="font-bold text-white truncate max-w-[140px]">
                    {p.name}
                  </span>
                </div>
                <span className="font-mono font-bold text-emerald-400 text-sm">
                  {p.score} pts
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="w-full text-center text-xs text-gray-500 pb-4">
          Regarde la Smart TV pour la suite de la soirée !
        </div>
      </div>
    );
  }

  // ELIMINATED SPECTATOR VIEW
  if (!isAlive || myLives <= 0) {
    return (
      <div className="flex flex-col items-center justify-between min-h-screen bg-slate-950 text-white p-6 select-none">
        <div className="flex flex-col items-center text-center mt-12">
          <div className="w-20 h-20 rounded-full bg-red-950/60 border-2 border-red-500/40 flex items-center justify-center text-4xl mb-4">
            💀
          </div>
          <span className="text-red-400 font-black uppercase tracking-widest text-xs">
            ÉLIMINÉ
          </span>
          <h2 className="text-2xl font-black font-display text-white mt-1">
            Tu n'as plus de vies !
          </h2>
          <p className="text-sm text-gray-400 mt-2">
            La bombe a eu raison de toi. Regarde le duel final sur la télévision !
          </p>
        </div>

        <div className="w-full bg-slate-900 border border-white/10 rounded-2xl p-5 my-auto text-center">
          <AlertTriangle className="w-6 h-6 text-amber-400 mx-auto mb-2 animate-pulse" />
          <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block mb-1">
            Bombe en cours chez
          </span>
          <span className="text-xl font-black font-display text-white">
            {activePlayer?.name || '...'}
          </span>
        </div>

        <div className="w-full text-center text-xs text-gray-500 pb-4">
          Mode Spectateur
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col justify-between min-h-screen p-5 text-white select-none transition-colors duration-300 ${
        isMyTurn
          ? 'bg-gradient-to-b from-red-950 via-slate-950 to-slate-950'
          : 'bg-slate-950'
      }`}
    >
      {/* HEADER: Lives & Combo */}
      <div className="flex items-center justify-between bg-slate-900/80 border border-white/10 rounded-2xl px-4 py-3 backdrop-blur-md">
        {/* Lives */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold text-gray-400 uppercase mr-1">Vies :</span>
          {[...Array(3)].map((_, i) => (
            <Heart
              key={i}
              className={`w-5 h-5 ${
                i < myLives
                  ? 'text-red-500 fill-red-500 animate-pulse'
                  : 'text-slate-700 fill-slate-800'
              }`}
            />
          ))}
        </div>

        {/* Combo */}
        <div className="flex items-center gap-1 bg-amber-500/20 border border-amber-500/30 px-3 py-1 rounded-xl">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-xs font-black font-display text-amber-300">
            ×{combo}
          </span>
        </div>
      </div>

      {/* CENTER CONTENT */}
      {isMyTurn ? (
        /* MY TURN: URGENT ACTIVE BOMB */
        <div className="flex flex-col items-center my-auto w-full">
          {/* Emergency Alert Banner */}
          <div className="flex items-center gap-2 bg-red-600 text-white font-black text-xs uppercase tracking-widest px-4 py-1.5 rounded-full mb-4 shadow-lg animate-bounce">
            <Flame className="w-4 h-4 fill-white" />
            TU AS LA BOMBE ! DÉPÊCHE-TOI !
          </div>

          {/* Syllable Container */}
          <div className="w-full bg-slate-900 border-2 border-red-500/80 rounded-3xl p-6 text-center shadow-2xl relative overflow-hidden">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-400 block mb-1">
              MOT CONTENANT LA SYLLABE
            </span>

            {/* Giant Syllable */}
            <div className="text-6xl font-black font-mono tracking-widest text-white drop-shadow-[0_0_25px_rgba(239,68,68,0.7)] py-2">
              {syllable}
            </div>

            {/* Countdown Badge */}
            <div className="inline-flex items-center gap-1.5 bg-black/60 border border-white/20 px-4 py-1.5 rounded-full mt-2">
              <Flame className="w-4 h-4 text-red-400 animate-pulse" />
              <span className="font-mono font-black text-lg text-red-400">
                {timeRemaining}s
              </span>
            </div>
          </div>

          {/* Form Input */}
          <form onSubmit={handleSubmit} className="w-full mt-6 space-y-3">
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={inputWord}
                onChange={(e) => {
                  setInputWord(e.target.value.toUpperCase());
                  setLocalError('');
                }}
                placeholder={`Tape un mot avec "${syllable}"...`}
                maxLength={20}
                autoFocus
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                className="w-full bg-slate-900 border-2 border-amber-400 text-white font-mono font-black text-2xl text-center uppercase tracking-wider py-4 px-4 rounded-2xl focus:outline-none focus:ring-4 focus:ring-red-500/50 placeholder:text-slate-600 placeholder:text-base placeholder:font-sans placeholder:font-normal shadow-inner"
              />
            </div>

            {localError && (
              <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-red-400 bg-red-950/60 border border-red-500/40 p-2.5 rounded-xl text-center">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{localError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={!inputWord.trim()}
              className={`w-full py-4 rounded-2xl font-black font-display text-lg uppercase tracking-wider flex items-center justify-center gap-2 shadow-2xl transition-all ${
                inputWord.trim()
                  ? 'bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white shadow-red-500/40 active:scale-95'
                  : 'bg-slate-800 text-gray-500 cursor-not-allowed border border-white/5'
              }`}
            >
              <span>💣 PASSER LA BOMBE !</span>
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      ) : (
        /* OTHER PLAYER'S TURN: WATCH & PREPARE */
        <div className="flex flex-col items-center justify-center my-auto w-full text-center">
          <div className="w-20 h-20 rounded-full bg-slate-900 border-2 border-white/10 flex items-center justify-center text-4xl mb-4 shadow-xl">
            💣
          </div>

          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">
            BOMBE ACTUELLE
          </span>

          <div className="bg-slate-900/90 border border-white/10 rounded-2xl p-6 w-full max-w-sm mb-4">
            <span className="text-xs text-amber-400 font-semibold uppercase block mb-1">
              Dans les mains de
            </span>
            <h3 className="text-2xl font-black font-display text-white truncate mb-3">
              {activePlayer?.name || 'Un adversaire'}
            </h3>

            <div className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 py-2 px-4 rounded-xl">
              <span className="text-xs text-gray-400 font-semibold">Syllabe :</span>
              <span className="text-xl font-black font-mono text-white tracking-widest">
                {syllable}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-amber-300/80 bg-amber-500/10 border border-amber-500/20 px-4 py-2 rounded-xl">
            <ShieldAlert className="w-4 h-4 shrink-0 text-amber-400" />
            <span>Tiens-toi prêt... la bombe peut t'arriver d'une seconde à l'autre !</span>
          </div>
        </div>
      )}

      {/* FOOTER: Player status bar */}
      <div className="w-full text-center text-xs text-gray-500 pt-2">
        {localPlayer?.name} • Score : {myPlayer?.score ?? 0} pts
      </div>
    </div>
  );
};
