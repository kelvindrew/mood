import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '../../../context/GameContext';
import { JeuDePaysGameState } from '../../../types/game';
import { MobileHeader } from '../../components/MobileHeader';
import { ReactionFlinger } from '../../components/ReactionFlinger';
import { triggerHaptic, hapticPatterns } from '../../components/HapticFeedback';
import { audio } from '../../../services/audio';
import {
  Check,
  X,
  RotateCcw,
  Crown,
  Trophy,
  Send,
  Sparkles,
  Clock,
  Zap,
  Globe2,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

export const JeuDePaysController: React.FC = () => {
  const { room, localPlayer, sendGameAction } = useGame();
  const gameState = room?.gameState as JeuDePaysGameState | undefined;

  const [inputAnswer, setInputAnswer] = useState<string>('');
  const [hasSubmittedLocally, setHasSubmittedLocally] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // When category changes, reset input and autofocus
  useEffect(() => {
    setInputAnswer('');
    setHasSubmittedLocally(false);
    if (gameState?.phase === 'category_running') {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [gameState?.currentCategoryIndex, gameState?.currentRound, gameState?.phase]);

  if (!gameState || !localPlayer) return null;

  const {
    phase,
    currentRound,
    totalRounds,
    timer,
    categoryDuration,
    currentLetter,
    roundCategories,
    currentCategory,
    currentCategoryIndex,
    votingCategory,
    votingCategoryIndex,
    answers,
    validationVotes,
    scores,
    roundBreakdowns,
    finalPodium,
    isGameOver,
    players,
  } = gameState;

  const myPodiumInfo = finalPodium?.find((p) => p.id === localPlayer.id);
  const hasAlreadyAnswered = gameState.answeredPlayerIds?.includes(localPlayer.id) || hasSubmittedLocally;

  const handleSendAnswer = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputAnswer.trim() || hasAlreadyAnswered || phase !== 'category_running') return;

    triggerHaptic(hapticPatterns.success);
    audio.playSelect();
    setHasSubmittedLocally(true);

    sendGameAction('jdp_submit_answer', {
      text: inputAnswer.trim(),
    });
  };

  const handleCastVote = (targetPlayerId: string, categoryId: string, isValid: boolean) => {
    triggerHaptic(hapticPatterns.tap);
    audio.playFocus();
    sendGameAction('jdp_cast_vote', {
      targetPlayerId,
      categoryId,
      isValid,
    });
  };

  // GAMEOVER VIEW
  if (isGameOver) {
    const isWinner = myPodiumInfo?.isWinner;
    return (
      <div className="min-h-screen flex flex-col justify-between bg-[#0A0F1D] text-white select-none">
        <MobileHeader />

        <main className="p-4 flex-1 flex flex-col justify-center items-center text-center space-y-5 max-w-sm mx-auto w-full animate-scale-in">
          <div className="p-5 rounded-full bg-amber-400/20 border-2 border-amber-400 text-amber-300 shadow-[0_0_50px_rgba(245,158,11,0.3)]">
            {isWinner ? <Crown className="w-16 h-16 fill-current animate-bounce" /> : <Trophy className="w-16 h-16" />}
          </div>

          <div className="space-y-1">
            <span className="text-xs font-black uppercase tracking-widest text-amber-400">PARTIE TERMINÉE</span>
            <h1 className="text-3xl font-black font-display text-white">
              {isWinner ? '🎉 VICTOIRE !' : 'FIN DE PARTIE'}
            </h1>
            <p className="text-xs text-slate-400">
              {isWinner
                ? 'Félicitations, vous êtes le champion de Jeu de Pays !'
                : `Vous terminez au rang #${myPodiumInfo?.rank || '-'} avec ${scores[localPlayer.id] || 0} points.`}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-700/80 w-full space-y-2">
            <div className="text-xs font-bold text-slate-400 uppercase">Votre score final</div>
            <div className="font-mono text-4xl font-black text-cyan-400">
              {scores[localPlayer.id] || 0} pts
            </div>
          </div>

          {localPlayer.isHost && (
            <button
              onClick={() => {
                triggerHaptic(hapticPatterns.success);
                audio.playSelect();
                sendGameAction('jdp_restart', {});
              }}
              className="w-full py-4 rounded-2xl bg-cyan-400 hover:bg-cyan-300 active:scale-95 text-slate-950 font-black text-sm uppercase tracking-wider flex items-center justify-center space-x-2 shadow-lg transition-all"
            >
              <RotateCcw className="w-5 h-5 stroke-[2.5]" />
              <span>Rejouer une partie</span>
            </button>
          )}
        </main>

        <ReactionFlinger />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#0A0F1D] text-white select-none">
      <MobileHeader />

      {/* Top Game Bar */}
      <div className="bg-slate-900/95 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white text-xs font-black shadow">
            <Globe2 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] font-mono text-slate-400 uppercase leading-none">
              Manche {currentRound}/{totalRounds}
            </div>
            <div className="text-xs font-black text-white">
              Lettre : <span className="text-amber-400 font-mono text-sm">{currentLetter}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-slate-800 border border-slate-700">
            <Clock className={`w-3.5 h-3.5 ${timer <= 3 ? 'text-rose-400 animate-spin' : 'text-cyan-400'}`} />
            <span className={`font-mono text-sm font-black ${timer <= 3 ? 'text-rose-400' : 'text-white'}`}>
              {timer}s
            </span>
          </div>

          <div className="px-2.5 py-1 rounded-xl bg-cyan-500/15 border border-cyan-400/30 font-mono font-bold text-xs text-cyan-300">
            {scores[localPlayer.id] || 0} pts
          </div>
        </div>
      </div>

      {/* Main Body */}
      <main className="flex-1 p-4 max-w-md mx-auto w-full flex flex-col justify-between">
        {/* PHASE 1: WHEEL / ROULETTE */}
        {phase === 'wheel' && (
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 animate-scale-in">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-cyan-500 to-amber-500 border-4 border-amber-400/80 flex items-center justify-center shadow-[0_0_40px_rgba(6,182,212,0.3)] animate-pulse">
              <span className="font-display font-black text-5xl text-white font-mono">
                {currentLetter}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-widest">
                LETTRE DU SALON
              </span>
              <h2 className="text-2xl font-black text-white mt-0.5">
                La lettre est le « {currentLetter} » !
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                La première catégorie démarre dans {timer} secondes. Soyez rapide pour le bonus de vitesse !
              </p>
            </div>
          </div>
        )}

        {/* PHASE 2: ACTIVE CATEGORY (WRITING) */}
        {phase === 'category_running' && currentCategory && (
          <div className="flex-1 flex flex-col justify-between space-y-4 animate-scale-in py-2">
            {/* Category Banner */}
            <div className="p-4 rounded-3xl bg-slate-900/90 border border-slate-700/80 text-center space-y-2 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase">
                  Catégorie {currentCategoryIndex + 1} / {roundCategories.length}
                </span>
                <span className="text-xs font-mono font-black text-amber-400">
                  Lettre « {currentLetter} »
                </span>
              </div>

              <div className="text-4xl">{currentCategory.icon}</div>
              <h2 className="text-2xl font-black font-display uppercase tracking-tight text-white">
                {currentCategory.label}
              </h2>

              {/* Progress bar */}
              <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                <div
                  className={`h-full transition-all duration-1000 ${
                    timer <= 3 ? 'bg-rose-500' : 'bg-cyan-400'
                  }`}
                  style={{ width: `${(timer / categoryDuration) * 100}%` }}
                />
              </div>
            </div>

            {/* Answer Input or Submitted Card */}
            {hasAlreadyAnswered ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 rounded-3xl bg-emerald-500/10 border-2 border-emerald-400/40 space-y-3 animate-scale-in">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center">
                  <Check className="w-8 h-8 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">Réponse Enregistrée !</h3>
                  <div className="font-mono font-bold text-xl text-emerald-300 mt-1">
                    « {inputAnswer || 'Validé'} »
                  </div>
                  <p className="text-xs text-slate-400 mt-2">
                    En attente de la fin du compte à rebours ({timer}s)...
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSendAnswer} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 block">
                    Votre mot commençant par <strong className="text-amber-400 font-mono">« {currentLetter} »</strong> :
                  </label>
                  <div className="relative">
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputAnswer}
                      onChange={(e) => setInputAnswer(e.target.value)}
                      placeholder={`Ex: un ${currentCategory.label.toLowerCase()} avec ${currentLetter}...`}
                      autoFocus
                      autoComplete="off"
                      autoCorrect="off"
                      spellCheck="false"
                      className="w-full px-4 py-4 rounded-2xl bg-slate-950 border-2 border-cyan-500/50 text-white font-bold text-lg focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/30 outline-none transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!inputAnswer.trim()}
                  className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-wider flex items-center justify-center space-x-2 transition-all shadow-lg active:scale-95 ${
                    inputAnswer.trim()
                      ? 'bg-cyan-400 hover:bg-cyan-300 text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.4)]'
                      : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                  }`}
                >
                  <Send className="w-4 h-4" />
                  <span>Valider la réponse</span>
                </button>
              </form>
            )}
          </div>
        )}

        {/* PHASE 2.5: INTERMISSION */}
        {phase === 'category_intermission' && (
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-3 animate-scale-in">
            <Zap className="w-12 h-12 text-cyan-400 animate-bounce" />
            <h3 className="text-xl font-black text-white">Catégorie Terminée !</h3>
            <p className="text-xs text-cyan-300">
              Préparez-vous : Catégorie suivante dans {timer}s...
            </p>
          </div>
        )}

        {/* PHASE 3: VOTING & VALIDATION */}
        {phase === 'voting' && votingCategory && (
          <div className="flex-1 flex flex-col justify-between space-y-3 animate-scale-in py-1">
            <div className="text-center space-y-0.5">
              <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase">
                Vote • {votingCategoryIndex + 1} / {roundCategories.length}
              </span>
              <h3 className="text-base font-black text-white flex items-center justify-center space-x-2">
                <span>{votingCategory.icon}</span>
                <span>{votingCategory.label}</span>
                <span className="text-amber-400 font-mono">(« {currentLetter} »)</span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Votez pour contester les erreurs ou valider les bonnes réponses :
              </p>
            </div>

            {/* List of answers to vote on */}
            <div className="space-y-2.5 overflow-y-auto max-h-[55vh] pr-1 scrollbar-none">
              {players.map((p) => {
                const answer = (answers[p.id]?.[votingCategory.id] || '').trim();
                const key = `${p.id}_${votingCategory.id}`;
                const myVote = validationVotes[key]?.[localPlayer.id];
                const isMe = p.id === localPlayer.id;

                return (
                  <div
                    key={p.id}
                    className="p-3 rounded-2xl bg-slate-900/90 border border-slate-700/80 flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-2 min-w-0 pr-2">
                      <span className="text-xl">{p.avatar || '👤'}</span>
                      <div className="min-w-0">
                        <div className="text-[11px] font-bold text-slate-400 truncate">
                          {p.name} {isMe && '(Vous)'}
                        </div>
                        <div className="text-sm font-black text-amber-300 truncate">
                          {answer ? `« ${answer} »` : <span className="text-slate-600 italic">Vide</span>}
                        </div>
                      </div>
                    </div>

                    {!isMe && answer && (
                      <div className="flex items-center space-x-1.5 flex-shrink-0">
                        <button
                          onClick={() => handleCastVote(p.id, votingCategory.id, true)}
                          className={`p-2 rounded-xl border text-xs font-bold transition-all active:scale-90 ${
                            myVote === true
                              ? 'bg-emerald-500 text-white border-emerald-400 shadow-md'
                              : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                          }`}
                          title="Valide"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleCastVote(p.id, votingCategory.id, false)}
                          className={`p-2 rounded-xl border text-xs font-bold transition-all active:scale-90 ${
                            myVote === false
                              ? 'bg-rose-600 text-white border-rose-500 shadow-md'
                              : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                          }`}
                          title="Invalide"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="text-center text-[11px] text-slate-500 font-mono">
              Fin du vote dans {timer}s...
            </div>
          </div>
        )}

        {/* PHASE 4: ROUND RECAP */}
        {phase === 'round_recap' && (
          <div className="flex-1 flex flex-col justify-center text-center space-y-4 animate-scale-in">
            <div className="space-y-1">
              <span className="text-xs font-mono font-bold text-cyan-400 uppercase">
                Fin de la manche {currentRound}
              </span>
              <h2 className="text-2xl font-black text-white">Résultats de la Manche</h2>
            </div>

            <div className="p-4 rounded-3xl bg-slate-900/90 border border-slate-700/80 space-y-2">
              <div className="text-xs text-slate-400">Vos points sur cette manche :</div>
              <div className="space-y-1.5 text-left pt-1">
                {(roundBreakdowns[localPlayer.id] || []).map((b, i) => (
                  <div key={i} className="flex items-center justify-between text-xs py-1 border-b border-slate-800/80">
                    <span className="text-slate-300 truncate">
                      {b.categoryIcon} {b.rawText || '—'}
                    </span>
                    <span className={`font-mono font-bold ${b.totalPoints > 0 ? 'text-emerald-400' : 'text-slate-500'}`}>
                      +{b.totalPoints} pts
                      {b.speedBonus > 0 && <span className="text-amber-400 ml-1">⚡+{b.speedBonus}</span>}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-xs font-mono text-slate-400">
              Manche suivante dans {timer}s...
            </div>
          </div>
        )}
      </main>

      <ReactionFlinger />
    </div>
  );
};
