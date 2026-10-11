import React from 'react';
import { useGame } from '../../context/GameContext';
import { JeuDePaysGameState } from '../../types/game';
import {
  Clock,
  Sparkles,
  Trophy,
  Crown,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Zap,
  Globe2,
  Award,
  ChevronRight,
  Home,
} from 'lucide-react';
import { audio } from '../../services/audio';

export const JeuDePaysBoardTV: React.FC = () => {
  const { room, sendGameAction, returnToHome } = useGame();
  const gameState = room?.gameState as JeuDePaysGameState | undefined;

  if (!gameState) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0A0F1D] text-white">
        <span className="font-mono text-sm text-slate-400">Chargement de Jeu de Pays...</span>
      </div>
    );
  }

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
    answeredPlayerIds,
    answers,
    validationVotes,
    scores,
    roundBreakdowns,
    finalPodium,
    players,
  } = gameState;

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-gradient-to-br from-[#0A0F1D] via-[#0F172A] to-[#131C35] text-white flex flex-col justify-between p-8 select-none font-sans">
      {/* Subtle Grid Pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-15 bg-[radial-gradient(#06B6D4_1px,transparent_1px)] [background-size:32px_32px]" />

      {/* Top Header */}
      <header className="relative z-10 flex items-center justify-between border-b border-slate-700/60 pb-4">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-[0_0_25px_rgba(6,182,212,0.35)] border border-cyan-400/40">
            <Globe2 className="w-7 h-7 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-400/40 text-cyan-300 text-[10px] font-black uppercase tracking-widest">
                JEU DE PAYS
              </span>
              <span className="text-xs font-mono text-slate-400">
                MANCHE {currentRound} / {totalRounds}
              </span>
            </div>
            <h1 className="text-xl font-black font-display tracking-tight text-white mt-0.5">
              RÉPONSES RAPIDES EN CHAÎNE
            </h1>
          </div>
        </div>

        {/* Big Letter Capsule + Countdown */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-slate-900/90 border border-amber-400/40 px-4 py-2 rounded-2xl shadow-lg">
            <span className="text-[10px] font-mono font-bold text-amber-300 uppercase tracking-widest">
              LETTRE :
            </span>
            <span className="font-display font-black text-3xl text-amber-400 font-mono">
              {currentLetter}
            </span>
          </div>

          <div
            className={`flex items-center space-x-3 bg-slate-900/90 border px-5 py-2.5 rounded-2xl shadow-xl transition-all ${
              timer <= 3
                ? 'border-rose-500/80 bg-rose-950/40 animate-pulse'
                : 'border-slate-700/80'
            }`}
          >
            <Clock
              className={`w-6 h-6 ${
                timer <= 3 ? 'text-rose-400 animate-spin' : 'text-cyan-400'
              }`}
            />
            <span
              className={`font-mono text-3xl font-black ${
                timer <= 3 ? 'text-rose-400' : 'text-white'
              }`}
            >
              {timer}s
            </span>
          </div>
        </div>
      </header>

      {/* Main Center Stage by Phase */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center my-4 max-w-6xl mx-auto w-full">
        {/* PHASE 1: WHEEL / LETTER REVEAL */}
        {phase === 'wheel' && (
          <div className="text-center space-y-6 max-w-2xl animate-scale-in">
            <div className="relative w-36 h-36 mx-auto rounded-3xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-amber-500 border-4 border-amber-400/80 flex items-center justify-center shadow-[0_0_70px_rgba(6,182,212,0.4)] animate-pulse">
              <span className="font-display font-black text-7xl text-white font-mono drop-shadow-lg">
                {currentLetter}
              </span>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase">
                TIRAGE DE LA LETTRE POUR LA MANCHE
              </span>
              <h2 className="text-4xl font-black font-display tracking-tight text-white">
                TOUT LE MONDE JOUE AVEC LE « {currentLetter} » !
              </h2>
              <p className="text-sm text-slate-300">
                Chaque catégorie va s'enchaîner très rapidement (12s). Tenez-vous prêts sur vos téléphones !
              </p>
            </div>

            {/* Categories Chain Preview */}
            <div className="flex items-center justify-center gap-2 pt-3 flex-wrap">
              {roundCategories.map((cat, idx) => (
                <div
                  key={cat.id}
                  className="px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-700/70 text-center flex items-center space-x-2"
                >
                  <span className="text-lg">{cat.icon}</span>
                  <span className="text-xs font-bold text-slate-200">
                    {idx + 1}. {cat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PHASE 2: CATEGORY RUNNING */}
        {phase === 'category_running' && currentCategory && (
          <div className="w-full space-y-8 animate-scale-in max-w-4xl mx-auto text-center">
            {/* Category Progress Stepper */}
            <div className="flex items-center justify-center space-x-2">
              <span className="px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-xs font-mono font-bold uppercase tracking-wider">
                CATÉGORIE {currentCategoryIndex + 1} SUR {roundCategories.length}
              </span>
            </div>

            {/* Giant Category Card */}
            <div className="p-8 rounded-3xl bg-slate-900/90 border-2 border-cyan-500/40 shadow-[0_0_50px_rgba(6,182,212,0.2)] space-y-4">
              <div className="text-6xl animate-bounce">{currentCategory.icon}</div>
              <h2 className="text-5xl font-black font-display uppercase tracking-tight text-white">
                {currentCategory.label}
              </h2>

              <div className="inline-flex items-center space-x-2 px-5 py-2 rounded-2xl bg-amber-400/15 border border-amber-400/40 text-amber-300 text-base font-bold">
                <span>DOIT COMMENCER PAR LA LETTRE :</span>
                <strong className="text-2xl font-mono text-amber-400 font-black">
                  « {currentLetter} »
                </strong>
              </div>

              {/* Progress bar timer */}
              <div className="w-full max-w-md mx-auto h-3 rounded-full bg-slate-950 overflow-hidden border border-slate-800 mt-4">
                <div
                  className={`h-full transition-all duration-1000 rounded-full ${
                    timer <= 3
                      ? 'bg-rose-500'
                      : timer <= 6
                      ? 'bg-amber-400'
                      : 'bg-cyan-400'
                  }`}
                  style={{ width: `${(timer / categoryDuration) * 100}%` }}
                />
              </div>
            </div>

            {/* Connected players answer status */}
            <div className="space-y-2">
              <div className="text-xs font-mono uppercase tracking-widest text-slate-400">
                JOUEURS AYANT VALIDÉ ({answeredPlayerIds.length} / {players.length})
              </div>
              <div className="flex items-center justify-center gap-3 flex-wrap">
                {players.map((p) => {
                  const hasAnswered = answeredPlayerIds.includes(p.id);
                  return (
                    <div
                      key={p.id}
                      className={`px-4 py-2.5 rounded-2xl border transition-all flex items-center space-x-2.5 ${
                        hasAnswered
                          ? 'bg-emerald-500/15 border-emerald-400/60 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                          : 'bg-slate-900/80 border-slate-700/60 opacity-80'
                      }`}
                    >
                      <span className="text-xl">{p.avatar || '👤'}</span>
                      <span className="font-bold text-xs text-white">{p.name}</span>
                      {hasAnswered ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <span className="text-[10px] font-mono text-slate-400 animate-pulse">
                          Écrit...
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* PHASE 2.5: INTERMISSION BETWEEN CATEGORIES */}
        {phase === 'category_intermission' && (
          <div className="text-center space-y-4 animate-scale-in">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center shadow-lg">
              <Zap className="w-10 h-10 text-cyan-400 animate-bounce" />
            </div>
            <h3 className="text-3xl font-black font-display text-white">
              TEMPS ÉCOULÉ POUR CETTE CATÉGORIE !
            </h3>
            <p className="text-base text-cyan-300 font-bold">
              Préparez-vous : Catégorie suivante dans {timer}s...
            </p>
          </div>
        )}

        {/* PHASE 3: VOTING & VALIDATION */}
        {phase === 'voting' && votingCategory && (
          <div className="w-full space-y-6 animate-scale-in">
            <div className="text-center space-y-1">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-xs font-bold uppercase tracking-wider">
                <span>VOTE COLLECTIF • CATÉGORIE {votingCategoryIndex + 1} / {roundCategories.length}</span>
              </div>
              <h2 className="text-4xl font-black font-display uppercase tracking-tight text-white flex items-center justify-center space-x-3">
                <span>{votingCategory.icon}</span>
                <span>{votingCategory.label}</span>
                <span className="text-amber-400 font-mono">(Lettre « {currentLetter} »)</span>
              </h2>
              <p className="text-xs text-slate-300">
                Votez sur vos smartphones pour approuver 👍 ou contester 👎 les réponses !
              </p>
            </div>

            {/* Player Answers Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-5xl mx-auto w-full">
              {players.map((p) => {
                const answer = (answers[p.id]?.[votingCategory.id] || '').trim();
                const key = `${p.id}_${votingCategory.id}`;
                const votesObj = validationVotes[key] || {};
                const votesArr = Object.values(votesObj);
                const accepts = votesArr.filter((v) => v === true).length;
                const rejects = votesArr.filter((v) => v === false).length;

                // Detect duplicate
                const otherSameAnswers = players.filter(
                  (other) =>
                    other.id !== p.id &&
                    (answers[other.id]?.[votingCategory.id] || '').trim().toLowerCase() ===
                      answer.toLowerCase() &&
                    answer.length > 0
                );
                const isDuplicate = otherSameAnswers.length > 0;

                return (
                  <div
                    key={p.id}
                    className="p-4 rounded-3xl bg-slate-900/90 border border-slate-700/80 space-y-3 shadow-xl flex flex-col justify-between"
                  >
                    <div className="flex items-center space-x-2.5">
                      <span className="text-2xl">{p.avatar || '👤'}</span>
                      <div className="font-bold text-xs text-white truncate">{p.name}</div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-center min-h-[64px] flex flex-col items-center justify-center">
                      {answer ? (
                        <div className="space-y-1">
                          <span className="font-black text-xl text-amber-300 font-display">
                            « {answer} »
                          </span>
                          {isDuplicate && (
                            <div className="text-[10px] font-mono text-cyan-300 font-bold uppercase">
                              Doublon (+5 pts)
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500 italic">Pas de réponse (0 pt)</span>
                      )}
                    </div>

                    {/* Votes status */}
                    <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800">
                      <span className="text-emerald-400 font-bold flex items-center space-x-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{accepts} Valide</span>
                      </span>
                      <span className="text-rose-400 font-bold flex items-center space-x-1">
                        <XCircle className="w-3.5 h-3.5" />
                        <span>{rejects} Rejet</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* PHASE 4: ROUND RECAP */}
        {phase === 'round_recap' && (
          <div className="w-full max-w-4xl text-center space-y-6 animate-scale-in">
            <div className="space-y-2">
              <span className="text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase">
                CLASSEMENT DE LA MANCHE {currentRound}
              </span>
              <h2 className="text-4xl font-black font-display uppercase tracking-tight text-white">
                RÉSULTATS DE LA MANCHE
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {[...players]
                .sort((a, b) => (scores[b.id] || 0) - (scores[a.id] || 0))
                .map((p, idx) => {
                  const breakdowns = roundBreakdowns[p.id] || [];
                  return (
                    <div
                      key={p.id}
                      className="p-4 rounded-3xl bg-slate-900/90 border border-slate-700/80 shadow-xl space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2.5">
                          <span className="font-mono text-base font-black text-amber-400">
                            #{idx + 1}
                          </span>
                          <span className="text-xl">{p.avatar || '👤'}</span>
                          <span className="font-bold text-sm text-white">{p.name}</span>
                        </div>
                        <span className="font-mono font-black text-lg text-cyan-400">
                          {scores[p.id] || 0} pts
                        </span>
                      </div>

                      {/* Small breakdown pills */}
                      <div className="space-y-1.5 pt-1 border-t border-slate-800 text-left">
                        {breakdowns.map((b, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between text-xs py-0.5"
                          >
                            <span className="text-slate-400 truncate max-w-[140px]">
                              {b.categoryIcon} {b.rawText || '—'}
                            </span>
                            <span
                              className={`font-mono font-bold text-[11px] ${
                                b.totalPoints > 0 ? 'text-emerald-400' : 'text-slate-600'
                              }`}
                            >
                              +{b.totalPoints} pts
                              {b.speedBonus > 0 && (
                                <span className="text-amber-400 text-[10px] ml-1">
                                  (+{b.speedBonus}⚡)
                                </span>
                              )}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* PHASE 5: GAME OVER */}
        {phase === 'gameover' && (
          <div className="w-full max-w-3xl text-center space-y-6 animate-scale-in">
            <div className="space-y-2">
              <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-amber-400/15 border border-amber-400/40 text-amber-300 text-xs font-black uppercase tracking-widest">
                <Sparkles className="w-4 h-4 fill-current text-amber-400" />
                <span>PARTIE TERMINÉE • PODIUM DU SALON</span>
              </div>
              <h2 className="text-5xl font-black font-display uppercase tracking-tight text-white">
                VICTOIRE ÉCLATANTE !
              </h2>
            </div>

            {/* Podium */}
            <div className="flex items-end justify-center space-x-6 pt-4">
              {finalPodium?.slice(0, 3).map((pod, idx) => {
                const heights = ['h-44', 'h-32', 'h-24'];
                return (
                  <div key={pod.id} className="flex flex-col items-center">
                    <div className="text-5xl mb-2">{pod.avatar || '👑'}</div>
                    <div className="font-bold text-sm text-white">{pod.name}</div>
                    <div className="text-xs text-amber-400 font-mono mb-2">
                      {pod.score} pts
                    </div>
                    <div
                      className={`w-40 ${heights[idx]} rounded-t-3xl flex flex-col items-center justify-center p-4 border-t-4 shadow-xl ${
                        idx === 0
                          ? 'bg-gradient-to-t from-cyan-950/80 via-slate-800 to-amber-500/25 border-amber-400'
                          : 'bg-slate-800/90 border-slate-400'
                      }`}
                    >
                      <span className="font-display font-black text-5xl text-white">
                        {pod.rank}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Remote action buttons */}
            <div className="flex items-center justify-center space-x-4 pt-4">
              <button
                data-tv-focus
                tabIndex={0}
                onClick={() => {
                  audio.playSelect();
                  sendGameAction('jdp_restart', {});
                }}
                className="flex items-center space-x-3 px-8 py-3.5 rounded-2xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black text-base shadow-[0_0_20px_rgba(6,182,212,0.4)] focus:scale-105 focus:ring-4 focus:ring-cyan-300 transition-all outline-none"
              >
                <RotateCcw className="w-5 h-5" />
                <span>REJOUER UNE PARTIE</span>
              </button>

              <button
                data-tv-focus
                tabIndex={0}
                onClick={() => {
                  audio.playSelect();
                  returnToHome();
                }}
                className="flex items-center space-x-3 px-6 py-3.5 rounded-2xl bg-slate-800/90 hover:bg-slate-700 border border-slate-600/70 text-slate-200 font-bold text-base focus:scale-105 focus:bg-white focus:text-slate-950 focus:ring-4 focus:ring-cyan-400 transition-all outline-none"
              >
                <Home className="w-5 h-5" />
                <span>ACCUEIL</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer bar */}
      <footer className="relative z-10 flex items-center justify-between border-t border-slate-700/60 pt-3 text-xs text-slate-400 font-mono">
        <div>
          Catégorie active : <span className="text-white font-bold">{currentCategory?.label || '—'}</span>
        </div>
        <div className="flex items-center space-x-4">
          <span>Unicité : +10 pts</span>
          <span>•</span>
          <span>Doublon : +5 pts</span>
          <span>•</span>
          <span>Bonus Vitesse : jusqu'à +3⚡</span>
        </div>
      </footer>
    </div>
  );
};
