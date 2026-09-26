import React, { useMemo } from 'react';
import { useGame } from '../../context/GameContext';
import { PetitBacGameState } from '../../types/game';
import {
  Clock,
  Sparkles,
  Trophy,
  Crown,
  RotateCcw,
  CheckCircle2,
  XCircle,
  AlertOctagon,
  Flame,
  Award,
} from 'lucide-react';

export const PetitBacBoardTV: React.FC = () => {
  const { room, sendGameAction } = useGame();
  const gameState = room?.gameState as PetitBacGameState | undefined;

  if (!gameState) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0A0D14] text-white">
        <span className="font-mono text-sm text-gray-400">Chargement du Petit Bac...</span>
      </div>
    );
  }

  const {
    phase,
    currentRound,
    totalRounds,
    timer,
    currentLetter,
    currentCategories,
    votingCategory,
    votingCategoryIndex,
    hasStopBeenTriggered,
    finishedPlayerIds,
    answers,
    validationVotes,
    scores,
    finalPodium,
    players,
  } = gameState;

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-gradient-to-br from-[#0B0F19] via-[#121929] to-[#0A0D14] text-white flex flex-col justify-between p-8 select-none font-sans">
      {/* Dynamic Background Pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(#38BDF8_1px,transparent_1px)] [background-size:28px_28px]" />

      {/* Top Header */}
      <header className="relative z-10 flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border-2 border-amber-400/50 flex items-center justify-center shadow-[0_0_30px_rgba(251,191,36,0.3)]">
            <span className="font-display font-black text-3xl text-amber-300">
              {currentLetter}
            </span>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-[10px] font-black uppercase tracking-widest">
                LE PETIT BAC MULTIJOUEUR
              </span>
              <span className="text-xs font-mono text-gray-400">
                MANCHE {currentRound} / {totalRounds}
              </span>
            </div>
            <h1 className="text-2xl font-black font-display tracking-wide uppercase text-white">
              LETTRE IMPOSEE : <span className="text-amber-400 text-3xl font-mono">{currentLetter}</span>
            </h1>
          </div>
        </div>

        {/* Global Timer Ring */}
        <div className="flex items-center space-x-3 bg-black/50 border border-white/10 px-5 py-2.5 rounded-2xl shadow-xl">
          <Clock
            className={`w-6 h-6 ${
              timer <= 10 || hasStopBeenTriggered ? 'text-rose-500 animate-spin' : 'text-amber-400'
            }`}
          />
          <span
            className={`font-mono text-3xl font-black ${
              timer <= 10 || hasStopBeenTriggered ? 'text-rose-400 animate-pulse' : 'text-white'
            }`}
          >
            {timer}s
          </span>
        </div>
      </header>

      {/* Main Center Stage by Phase */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center my-4 max-w-6xl mx-auto w-full">
        {/* PHASE 1: WHEEL / ROULETTE */}
        {phase === 'wheel' && (
          <div className="text-center space-y-6 max-w-2xl animate-scale-in">
            <div className="relative w-36 h-36 mx-auto rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 border-4 border-amber-300 flex items-center justify-center shadow-[0_0_80px_rgba(251,191,36,0.6)] animate-pulse">
              <span className="font-display font-black text-7xl text-gray-950 font-mono">
                {currentLetter}
              </span>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-mono font-bold tracking-widest text-amber-400 uppercase">
                TIRAGE DE LA LETTRE
              </span>
              <h2 className="text-4xl font-black font-display tracking-tight text-white">
                LA LETTRE EST : « {currentLetter} » !
              </h2>
              <p className="text-sm text-gray-300">
                Préparez-vous à écrire sur vos téléphones ! Voici les 5 catégories de la manche :
              </p>
            </div>

            {/* 5 Categories preview */}
            <div className="grid grid-cols-5 gap-2.5 max-w-3xl mx-auto pt-2">
              {currentCategories.map((cat, i) => (
                <div
                  key={cat.id}
                  className="p-3 rounded-2xl bg-white/10 border border-white/15 text-center space-y-1 shadow-lg"
                >
                  <div className="text-2xl">{cat.icon}</div>
                  <div className="text-xs font-black truncate">{cat.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PHASE 2: WRITING */}
        {phase === 'writing' && (
          <div className="w-full space-y-6 animate-scale-in">
            {/* Rush STOP alert banner if triggered */}
            {hasStopBeenTriggered && (
              <div className="p-3.5 rounded-2xl bg-rose-600/30 border-2 border-rose-500 flex items-center justify-center space-x-3 text-rose-200 animate-bounce shadow-2xl">
                <AlertOctagon className="w-6 h-6 text-rose-400 flex-shrink-0" />
                <span className="font-black text-sm uppercase tracking-wide">
                  🚨 UN JOUEUR A APPUYÉ SUR « STOP ! » • PLUS QUE 10 SECONDES POUR VALIDER !
                </span>
              </div>
            )}

            {/* Categories Grid */}
            <div className="grid grid-cols-5 gap-3.5">
              {currentCategories.map((cat, idx) => (
                <div
                  key={cat.id}
                  className="p-5 rounded-3xl bg-black/40 border-2 border-white/15 space-y-3 shadow-xl flex flex-col items-center text-center"
                >
                  <span className="text-4xl">{cat.icon}</span>
                  <div>
                    <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider">
                      CATÉGORIE {idx + 1}
                    </span>
                    <h3 className="text-base font-black text-white">{cat.label}</h3>
                  </div>
                  <div className="text-[11px] font-mono text-gray-400">
                    Commence par : <strong className="text-amber-300 text-sm">« {currentLetter} »</strong>
                  </div>
                </div>
              ))}
            </div>

            {/* Players completion progress cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 pt-3">
              {players.map((p) => {
                const isDone = finishedPlayerIds.includes(p.id);
                return (
                  <div
                    key={p.id}
                    className={`p-3 rounded-2xl border transition-all flex items-center justify-between ${
                      isDone
                        ? 'bg-emerald-500/20 border-emerald-400 shadow-lg'
                        : 'bg-black/40 border-white/10'
                    }`}
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <span className="text-xl">{p.avatar || '👤'}</span>
                      <span className="font-bold text-xs truncate text-white">{p.name}</span>
                    </div>

                    {isDone ? (
                      <span className="text-[10px] font-mono font-bold text-emerald-400 flex items-center space-x-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Prêt</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-gray-500 animate-pulse">Écrit...</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* PHASE 3: VOTING */}
        {phase === 'voting' && votingCategory && (
          <div className="w-full space-y-6 animate-scale-in">
            <div className="text-center space-y-1">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-bold uppercase tracking-wider">
                <span>VOTE COLLECTIF • CATÉGORIE {votingCategoryIndex + 1} / 5</span>
              </div>
              <h2 className="text-4xl font-black font-display uppercase tracking-tight text-white flex items-center justify-center space-x-3">
                <span>{votingCategory.icon}</span>
                <span>{votingCategory.label}</span>
                <span className="text-amber-400 font-mono">(Lettre « {currentLetter} »)</span>
              </h2>
              <p className="text-xs text-gray-300">
                Votez sur vos smartphones pour valider ou rejeter les réponses de vos amis !
              </p>
            </div>

            {/* Player Answers Comparison Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-5xl mx-auto w-full">
              {players.map((p) => {
                const answer = (answers[p.id]?.[votingCategory.id] || '').trim();
                const key = `${p.id}_${votingCategory.id}`;
                const votesObj = validationVotes[key] || {};
                const votesArr = Object.values(votesObj);
                const accepts = votesArr.filter((v) => v === true).length;
                const rejects = votesArr.filter((v) => v === false).length;

                // Check duplicate
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
                    className="p-4 rounded-3xl bg-black/60 border-2 border-white/15 space-y-3 shadow-xl flex flex-col justify-between"
                  >
                    <div className="flex items-center space-x-2.5">
                      <span className="text-2xl">{p.avatar || '👤'}</span>
                      <div className="font-bold text-xs text-white truncate">{p.name}</div>
                    </div>

                    <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-center min-h-[56px] flex flex-col items-center justify-center">
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
                        <span className="text-xs text-gray-500 italic">Pas de réponse (0 pt)</span>
                      )}
                    </div>

                    {/* Votes status */}
                    <div className="flex items-center justify-between text-xs pt-1 border-t border-white/10">
                      <span className="text-emerald-400 font-bold flex items-center space-x-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{accepts} Oui</span>
                      </span>
                      <span className="text-rose-400 font-bold flex items-center space-x-1">
                        <XCircle className="w-3.5 h-3.5" />
                        <span>{rejects} Non</span>
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
          <div className="w-full max-w-3xl text-center space-y-6 animate-scale-in">
            <div className="space-y-2">
              <span className="text-xs font-mono font-bold tracking-widest text-amber-400 uppercase">
                CLASSEMENT DE LA MANCHE {currentRound}
              </span>
              <h2 className="text-4xl font-black font-display uppercase tracking-tight text-white">
                RÉSULTATS DE LA MANCHE
              </h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[...players]
                .sort((a, b) => (scores[b.id] || 0) - (scores[a.id] || 0))
                .map((p, idx) => (
                  <div
                    key={p.id}
                    className="p-4 rounded-3xl bg-black/60 border border-white/15 flex items-center justify-between shadow-xl"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="font-mono text-base font-black text-amber-400">#{idx + 1}</span>
                      <span className="text-2xl">{p.avatar || '👤'}</span>
                      <span className="font-bold text-sm text-white truncate">{p.name}</span>
                    </div>
                    <span className="font-mono font-black text-xl text-emerald-400">
                      {scores[p.id] || 0} pts
                    </span>
                  </div>
                ))}
            </div>

            <div className="text-xs font-mono text-gray-400 pt-2">
              Préparation de la manche suivante dans {timer}s...
            </div>
          </div>
        )}

        {/* PHASE 5: GAMEOVER */}
        {phase === 'gameover' && (
          <div className="w-full max-w-4xl text-center space-y-6 animate-scale-in">
            <div className="w-24 h-24 mx-auto rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center shadow-[0_0_60px_rgba(251,191,36,0.5)]">
              <Crown className="w-14 h-14 text-amber-400 fill-current animate-bounce" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-mono font-bold tracking-widest text-amber-400 uppercase">
                PARTIE TERMINÉE
              </span>
              <h2 className="text-5xl font-black font-display uppercase tracking-tight text-white">
                CHAMPION DU PETIT BAC !
              </h2>
            </div>

            {/* Final Podium */}
            <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto pt-2">
              {finalPodium?.slice(0, 3).map((entry, idx) => (
                <div
                  key={entry.id}
                  className={`p-5 rounded-3xl border text-center space-y-2 shadow-2xl ${
                    idx === 0
                      ? 'bg-amber-400/20 border-amber-400 ring-2 ring-amber-400 scale-105'
                      : 'bg-black/50 border-white/10'
                  }`}
                >
                  <div className="text-3xl">{entry.avatar || '👤'}</div>
                  <div className="font-mono font-bold text-xs text-amber-300">
                    {idx === 0 ? '🥇 1ère Place' : idx === 1 ? '🥈 2ème Place' : '🥉 3ème Place'}
                  </div>
                  <div className="font-black text-base text-white truncate">{entry.name}</div>
                  <div className="font-mono font-black text-2xl text-emerald-400">
                    {entry.score} pts
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4">
              <button
                onClick={() => sendGameAction('bac_restart')}
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-sm uppercase tracking-wider shadow-xl flex items-center justify-center space-x-2 mx-auto active:scale-95 transition-all"
              >
                <RotateCcw className="w-5 h-5" />
                <span>REJOUER UNE PARTIE</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer Info */}
      <footer className="relative z-10 flex items-center justify-between text-xs font-mono text-gray-400 border-t border-white/10 pt-3">
        <span>Playflix TV Salon • Petit Bac</span>
        <span>+10 pts Unique • +5 pts Doublon • 0 pt Refusé</span>
      </footer>
    </div>
  );
};
