import React, { useState, useEffect } from 'react';
import { useGame } from '../../../context/GameContext';
import { PetitBacGameState } from '../../../types/game';
import { MobileHeader } from '../../components/MobileHeader';
import { ReactionFlinger } from '../../components/ReactionFlinger';
import { triggerHaptic, hapticPatterns } from '../../components/HapticFeedback';
import { audio } from '../../../services/audio';
import {
  Check,
  X,
  AlertOctagon,
  RotateCcw,
  Crown,
  Trophy,
  Send,
  Sparkles,
} from 'lucide-react';

export const PetitBacController: React.FC = () => {
  const { room, localPlayer, sendGameAction } = useGame();
  const gameState = room?.gameState as PetitBacGameState | undefined;

  // C2: All hooks before early returns
  const [localAnswers, setLocalAnswers] = useState<Record<string, string>>({});
  const [hasSubmittedLocally, setHasSubmittedLocally] = useState<boolean>(false);

  // Reset form when round or letter changes
  useEffect(() => {
    setLocalAnswers({});
    setHasSubmittedLocally(false);
  }, [gameState?.currentRound, gameState?.currentLetter]);

  if (!gameState || !localPlayer) return null;

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
    answers,
    validationVotes,
    scores,
    finalPodium,
    isGameOver,
    players,
  } = gameState;

  const myPodiumInfo = finalPodium?.find((p) => p.id === localPlayer.id);

  const handleInputChange = (categoryId: string, value: string) => {
    setLocalAnswers((prev) => ({
      ...prev,
      [categoryId]: value,
    }));
  };

  const handleSubmit = (triggerStop = false) => {
    triggerHaptic(hapticPatterns.success);
    audio.playSelect();
    setHasSubmittedLocally(true);

    sendGameAction('bac_submit_answers', {
      answers: localAnswers,
      triggerStop,
    });
  };

  const handleCastVote = (targetPlayerId: string, categoryId: string, isValid: boolean) => {
    triggerHaptic(hapticPatterns.tap);
    audio.playFocus();
    sendGameAction('bac_cast_vote', {
      targetPlayerId,
      categoryId,
      isValid,
    });
  };

  // GAMEOVER VIEW
  if (isGameOver) {
    const isWinner = myPodiumInfo?.isWinner;
    return (
      <div className="min-h-screen flex flex-col justify-between bg-[#0B0F19] text-white select-none">
        <MobileHeader />

        <main className="p-4 flex-1 flex flex-col justify-center items-center text-center space-y-5 max-w-sm mx-auto w-full animate-scale-in">
          <div className="p-5 rounded-full bg-amber-500/20 border-2 border-amber-400 text-amber-300 shadow-[0_0_50px_rgba(251,191,36,0.4)]">
            {isWinner ? <Crown className="w-16 h-16 fill-current animate-bounce" /> : <Trophy className="w-16 h-16" />}
          </div>

          <div className="space-y-1">
            <span className="text-xs font-black uppercase tracking-widest text-[#FBBF24]">PARTIE TERMINÉE</span>
            <h1 className="text-3xl font-black font-display text-white">
              {isWinner ? '🎉 VICTOIRE !' : 'FIN DE PARTIE'}
            </h1>
            <p className="text-xs text-gray-400">
              Rang final : {myPodiumInfo?.rank === 1 ? '1er' : `${myPodiumInfo?.rank}ème`} place
            </p>
          </div>

          <div className="w-full p-4 rounded-3xl bg-white/[0.07] border border-white/15 space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-300 font-bold uppercase">Score Total</span>
              <span className="font-mono font-black text-3xl text-emerald-400">
                {scores[localPlayer.id] || 0} pts
              </span>
            </div>
          </div>

          <button
            onClick={() => sendGameAction('bac_restart')}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-sm uppercase tracking-wider shadow-lg flex items-center justify-center space-x-2 active:scale-95 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span>REJOUER UNE PARTIE</span>
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#0B0F19] text-white select-none relative overflow-x-hidden">
      <MobileHeader />

      <main className="p-3.5 flex-1 flex flex-col justify-between space-y-3 max-w-md mx-auto w-full pb-6">
        {/* Top Header Card */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.06] border border-white/10 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-xl bg-amber-400 text-gray-950 font-black text-base flex items-center justify-center font-mono shadow">
              {currentLetter}
            </div>
            <div>
              <div className="font-bold text-white text-[11px]">Lettre « {currentLetter} »</div>
              <div className="text-[10px] text-gray-400">Manche {currentRound} / {totalRounds}</div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="font-mono font-bold text-emerald-400">
              {scores[localPlayer.id] || 0} pts
            </span>
            <span className="text-gray-500">|</span>
            <span
              className={`font-mono font-black ${
                timer <= 10 || hasStopBeenTriggered ? 'text-rose-400 animate-pulse' : 'text-amber-400'
              }`}
            >
              {timer}s
            </span>
          </div>
        </div>

        {/* PHASE: WHEEL (Tirage) */}
        {phase === 'wheel' && (
          <div className="p-6 rounded-3xl bg-black/40 border border-white/10 text-center space-y-4 animate-scale-in my-auto">
            <div className="w-20 h-20 mx-auto rounded-full bg-amber-400 text-gray-950 font-mono font-black text-5xl flex items-center justify-center shadow-[0_0_40px_rgba(251,191,36,0.5)] animate-bounce">
              {currentLetter}
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-black text-white">Lettre tirée : {currentLetter}</h2>
              <p className="text-xs text-gray-400">Préparez-vous à écrire vos 5 mots !</p>
            </div>
          </div>
        )}

        {/* PHASE: WRITING (Saisie des 5 catégories) */}
        {phase === 'writing' && (
          <div className="space-y-2.5 animate-scale-in flex-1 flex flex-col justify-between">
            {hasStopBeenTriggered && (
              <div className="p-2 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs flex items-center justify-center space-x-2 font-bold animate-pulse">
                <AlertOctagon className="w-4 h-4 text-rose-400" />
                <span>STOP ACTIVÉ ! Plus que 10 secondes !</span>
              </div>
            )}

            {/* 5 Input Fields */}
            <div className="space-y-2">
              {currentCategories.map((cat) => {
                const val = localAnswers[cat.id] || '';
                const isCorrectLetter = val.trim().toUpperCase().startsWith(currentLetter);

                return (
                  <div
                    key={cat.id}
                    className="p-2.5 rounded-2xl bg-black/40 border border-white/10 space-y-1 transition-all focus-within:border-amber-400"
                  >
                    <div className="flex items-center justify-between text-[11px] font-bold text-gray-300">
                      <div className="flex items-center space-x-1.5">
                        <span>{cat.icon}</span>
                        <span>{cat.label}</span>
                      </div>
                      {val.trim().length > 0 && (
                        <span
                          className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded ${
                            isCorrectLetter
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-rose-500/20 text-rose-300'
                          }`}
                        >
                          {isCorrectLetter ? '✓ Débute par ' + currentLetter : '⚠️ Doit débuter par ' + currentLetter}
                        </span>
                      )}
                    </div>

                    <input
                      type="text"
                      maxLength={30}
                      value={val}
                      onChange={(e) => handleInputChange(cat.id, e.target.value)}
                      placeholder={`Mot commençant par ${currentLetter}...`}
                      className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/15 text-white font-bold text-sm focus:outline-none focus:border-amber-400"
                    />
                  </div>
                );
              })}
            </div>

            {/* Action Buttons: STOP or Valider */}
            <div className="space-y-2 pt-1">
              <button
                onClick={() => handleSubmit(true)}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 text-white font-black text-xs uppercase tracking-wider shadow-lg flex items-center justify-center space-x-2 active:scale-95 transition-all"
              >
                <AlertOctagon className="w-4 h-4" />
                <span>🛑 STOP ! J'AI TOUT FINI !</span>
              </button>

              <button
                onClick={() => handleSubmit(false)}
                className="w-full py-2.5 rounded-xl bg-white/10 border border-white/15 text-xs text-gray-300 font-bold hover:bg-white/20 active:scale-95 transition-all"
              >
                {hasSubmittedLocally ? 'Réponses envoyées ✓' : 'Valider sans déclencher le STOP'}
              </button>
            </div>
          </div>
        )}

        {/* PHASE: VOTING (Validation des réponses des autres joueurs) */}
        {phase === 'voting' && votingCategory && (
          <div className="space-y-3 animate-scale-in flex-1 flex flex-col justify-between">
            <div className="text-center space-y-0.5">
              <div className="inline-flex items-center space-x-1.5 text-xs font-black uppercase text-cyan-300 tracking-wider">
                <span>{votingCategory.icon}</span>
                <span>{votingCategory.label}</span>
                <span className="text-amber-400 font-mono">(Lettre {currentLetter})</span>
              </div>
              <p className="text-[11px] text-gray-400">
                Votez pour valider ou refuser les réponses de vos amis :
              </p>
            </div>

            {/* List of other players to judge */}
            <div className="space-y-2 max-h-72 overflow-y-auto pr-0.5">
              {players
                .filter((p) => p.id !== localPlayer.id)
                .map((p) => {
                  const ans = (answers[p.id]?.[votingCategory.id] || '').trim();
                  const key = `${p.id}_${votingCategory.id}`;
                  const myVote = validationVotes[key]?.[localPlayer.id];

                  return (
                    <div
                      key={p.id}
                      className="p-3 rounded-2xl bg-black/50 border border-white/10 flex items-center justify-between space-x-2"
                    >
                      <div className="truncate flex-1">
                        <div className="text-[10px] text-gray-400 font-bold truncate">{p.name}</div>
                        <div className="text-sm font-black text-amber-300 truncate font-display">
                          {ans ? `« ${ans} »` : <span className="text-gray-500 italic">Vide</span>}
                        </div>
                      </div>

                      {/* Vote Buttons */}
                      <div className="flex items-center space-x-1.5 flex-shrink-0">
                        <button
                          onClick={() => handleCastVote(p.id, votingCategory.id, true)}
                          className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm transition-all ${
                            myVote === true
                              ? 'bg-emerald-500 text-white shadow-lg ring-2 ring-emerald-300'
                              : 'bg-white/10 text-emerald-400 hover:bg-emerald-500/20'
                          }`}
                          title="Valider la réponse"
                        >
                          <Check className="w-5 h-5" />
                        </button>

                        <button
                          onClick={() => handleCastVote(p.id, votingCategory.id, false)}
                          className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm transition-all ${
                            myVote === false
                              ? 'bg-rose-500 text-white shadow-lg ring-2 ring-rose-300'
                              : 'bg-white/10 text-rose-400 hover:bg-rose-500/20'
                          }`}
                          title="Refuser la réponse"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>

            <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-center text-[11px] text-gray-400 font-mono">
              Catégorie {votingCategoryIndex + 1} sur 5 • Suivant dans {timer}s
            </div>
          </div>
        )}

        {/* PHASE: ROUND RECAP */}
        {phase === 'round_recap' && (
          <div className="p-6 rounded-3xl bg-black/40 border border-white/10 text-center space-y-4 animate-scale-in my-auto">
            <span className="text-xs font-mono font-bold text-amber-400 uppercase">
              FIN DE LA MANCHE {currentRound}
            </span>
            <h2 className="text-2xl font-black text-white">Préparez la manche suivante !</h2>
            <div className="text-emerald-400 font-mono font-black text-xl">
              Votre score : {scores[localPlayer.id] || 0} pts
            </div>
          </div>
        )}

        <ReactionFlinger />
      </main>
    </div>
  );
};
