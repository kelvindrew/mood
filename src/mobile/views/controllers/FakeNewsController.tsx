import React, { useState, useEffect } from 'react';
import { useGame } from '../../../context/GameContext';
import { FakeNewsGameState } from '../../../types/game';
import { MobileHeader } from '../../components/MobileHeader';
import { ReactionFlinger } from '../../components/ReactionFlinger';
import { triggerHaptic, hapticPatterns } from '../../components/HapticFeedback';
import { audio } from '../../../services/audio';
import {
  Send,
  RotateCcw,
  Crown,
  Trophy,
  CheckCircle2,
  Newspaper,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

export const FakeNewsController: React.FC = () => {
  const { room, localPlayer, sendGameAction } = useGame();
  const gameState = room?.gameState as FakeNewsGameState | undefined;

  // C2: All hooks before early returns
  const [lieInput, setLieInput] = useState<string>('');
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string>('');
  const [hasSubmittedLieLocally, setHasSubmittedLieLocally] = useState<boolean>(false);

  useEffect(() => {
    setLieInput('');
    setSelectedChoiceId(null);
    setLocalError('');
    setHasSubmittedLieLocally(false);
  }, [gameState?.currentRound]);

  if (!gameState || !localPlayer) return null;

  const {
    phase,
    currentRound,
    totalRounds,
    timer,
    prompt,
    votingChoices,
    scores,
    finalPodium,
    isGameOver,
    myLie,
    myVote,
    myOwnChoiceId,
  } = gameState;

  const myPodiumInfo = finalPodium?.find((p) => p.id === localPlayer.id);

  const handleSubmitLie = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!lieInput.trim()) return;

    triggerHaptic(hapticPatterns.success);
    audio.playSelect();
    setLocalError('');

    sendGameAction('fn_submit_lie', { lie: lieInput.trim() });
    setHasSubmittedLieLocally(true);
  };

  const handleCastVote = () => {
    if (!selectedChoiceId || phase !== 'voting' || myVote) return;

    triggerHaptic(hapticPatterns.success);
    audio.playSelect();
    sendGameAction('fn_cast_vote', { choiceId: selectedChoiceId });
  };

  // GAMEOVER VIEW
  if (isGameOver) {
    const isWinner = myPodiumInfo?.isWinner;
    return (
      <div className="min-h-screen flex flex-col justify-between bg-[#0A0410] text-white select-none">
        <MobileHeader />

        <main className="p-4 flex-1 flex flex-col justify-center items-center text-center space-y-5 max-w-sm mx-auto w-full animate-scale-in">
          <div className="p-5 rounded-full bg-fuchsia-500/20 border-2 border-fuchsia-400 text-fuchsia-300 shadow-[0_0_50px_rgba(232,121,249,0.4)]">
            {isWinner ? <Crown className="w-16 h-16 fill-current animate-bounce" /> : <Trophy className="w-16 h-16" />}
          </div>

          <div className="space-y-1">
            <span className="text-xs font-black uppercase tracking-widest text-fuchsia-400">PARTIE TERMINÉE</span>
            <h1 className="text-3xl font-black font-display text-white">
              {isWinner ? '🎉 VICTOIRE !' : 'FIN DE PARTIE'}
            </h1>
            <p className="text-xs text-gray-400">
              Rang final : {myPodiumInfo?.rank === 1 ? '1er' : `${myPodiumInfo?.rank}ème`} place
            </p>
          </div>

          <div className="w-full p-4 rounded-3xl bg-white/[0.07] border border-white/15 space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-300 font-bold uppercase">Score Final</span>
              <span className="font-mono font-black text-3xl text-emerald-400">
                {scores[localPlayer.id] || 0} pts
              </span>
            </div>
          </div>

          <button
            onClick={() => sendGameAction('fn_restart')}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white font-black text-sm uppercase tracking-wider shadow-lg flex items-center justify-center space-x-2 active:scale-95 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span>REJOUER UNE PARTIE</span>
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#0A0410] text-white select-none relative overflow-x-hidden">
      <MobileHeader />

      <main className="p-3.5 flex-1 flex flex-col justify-between space-y-3.5 max-w-md mx-auto w-full pb-6">
        {/* Top Header Card */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.06] border border-white/10 text-xs">
          <div className="flex items-center space-x-2">
            <Newspaper className="w-4 h-4 text-fuchsia-400" />
            <div>
              <div className="font-bold text-white text-[11px]">Question {currentRound} / {totalRounds}</div>
              <div className="text-[10px] text-gray-400">Culture & Bluff</div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="font-mono font-bold text-emerald-400">
              {scores[localPlayer.id] || 0} pts
            </span>
            <span className="text-gray-500">|</span>
            <span className="font-mono font-black text-fuchsia-400">
              {timer}s
            </span>
          </div>
        </div>

        {/* PHASE 1: WRITING A LIE */}
        {phase === 'writing' && (
          <div className="space-y-4 animate-scale-in flex-1 flex flex-col justify-between">
            <div className="p-4 rounded-3xl bg-black/50 border-2 border-fuchsia-500/30 space-y-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-fuchsia-400">
                QUESTION À COMPLÉTER
              </span>
              <p className="text-sm font-bold text-white leading-snug">
                « {prompt} ... »
              </p>
            </div>

            {localError && (
              <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-200 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>{localError}</span>
              </div>
            )}

            {hasSubmittedLieLocally || myLie ? (
              <div className="p-6 rounded-3xl bg-black/40 border border-emerald-400/40 text-center space-y-2 my-auto">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="font-black text-base text-white">Votre mensonge est prêt !</div>
                <div className="text-sm font-serif italic text-fuchsia-300">
                  « {myLie || lieInput} »
                </div>
                <p className="text-xs text-gray-400 pt-1">
                  En attente des autres joueurs...
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitLie} className="space-y-3 my-auto">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-300">
                    Inventez une fausse réponse crédible :
                  </label>
                  <input
                    type="text"
                    maxLength={40}
                    value={lieInput}
                    onChange={(e) => setLieInput(e.target.value)}
                    placeholder="Votre mensonge..."
                    className="w-full px-3.5 py-3 rounded-2xl bg-black/60 border border-white/20 text-white font-bold text-sm focus:outline-none focus:border-fuchsia-400"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!lieInput.trim()}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white font-black text-xs uppercase tracking-wider shadow-lg flex items-center justify-center space-x-2 disabled:opacity-30 active:scale-95 transition-all"
                >
                  <Send className="w-4 h-4" />
                  <span>ENVOYER MON MENSONGE</span>
                </button>
              </form>
            )}
          </div>
        )}

        {/* PHASE 2: VOTING (SPOT THE TRUTH) */}
        {phase === 'voting' && (
          <div className="space-y-3 animate-scale-in flex-1 flex flex-col justify-between">
            <div className="text-center space-y-0.5">
              <span className="text-xs font-black uppercase text-fuchsia-400 tracking-wider">
                TROUVEZ LA VÉRITÉ
              </span>
              <p className="text-[11px] text-gray-400">
                Touchez la réponse qui est selon vous la vraie information :
              </p>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-0.5">
              {votingChoices.map((choice) => {
                const isMyOwnLie = choice.id === myOwnChoiceId;
                const isSelected = selectedChoiceId === choice.id;
                const hasVotedForThis = myVote === choice.id;

                return (
                  <button
                    key={choice.id}
                    disabled={isMyOwnLie || !!myVote}
                    onClick={() => {
                      triggerHaptic(hapticPatterns.tap);
                      setSelectedChoiceId(choice.id);
                    }}
                    className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                      isMyOwnLie
                        ? 'bg-black/30 border-dashed border-white/10 opacity-40 cursor-not-allowed'
                        : isSelected || hasVotedForThis
                        ? 'bg-fuchsia-600 text-white ring-2 ring-fuchsia-300 shadow-xl scale-101'
                        : 'bg-black/50 border-white/10 text-gray-200 hover:bg-white/10'
                    }`}
                  >
                    <span className="font-bold text-sm">« {choice.text} »</span>
                    {isMyOwnLie && (
                      <span className="text-[10px] font-mono text-gray-400 uppercase">Votre mensonge</span>
                    )}
                  </button>
                );
              })}
            </div>

            <button
              disabled={!selectedChoiceId || !!myVote}
              onClick={handleCastVote}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white font-black text-xs uppercase tracking-wider shadow-lg disabled:opacity-30 active:scale-95 transition-all"
            >
              {myVote ? 'VOTE ENREGISTRÉ ✓' : 'VALIDER MON VOTE'}
            </button>
          </div>
        )}

        {/* PHASE 3: REVEAL & ROUND RECAP */}
        {(phase === 'reveal' || phase === 'round_recap') && (
          <div className="p-6 rounded-3xl bg-black/40 border border-white/10 text-center space-y-3 animate-scale-in my-auto">
            <span className="text-xs font-mono font-bold text-fuchsia-400 uppercase">
              RÉVÉLATION EN COURS
            </span>
            <h2 className="text-xl font-black text-white">Regardez l’écran TV !</h2>
            <p className="text-xs text-gray-300">
              Découvrez qui a trouvé la vérité et qui s’est fait piéger par les mensonges !
            </p>
          </div>
        )}

        <ReactionFlinger />
      </main>
    </div>
  );
};
