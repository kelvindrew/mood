import React, { useState } from 'react';
import { useGame } from '../../../context/GameContext';
import { MemeFactoryGameState } from '../../../types/game';
import { audio } from '../../../services/audio';
import { triggerHaptic, hapticPatterns } from '../../components/HapticFeedback';
import { Send, ThumbsUp, Sparkles, Trophy, CheckCircle2, MessageSquare, AlertCircle } from 'lucide-react';

export const MemeFactoryController: React.FC = () => {
  const { room, localPlayer, sendGameAction } = useGame();
  const [captionInput, setCaptionInput] = useState('');
  const [selectedSubId, setSelectedSubId] = useState<string | null>(null);

  const gameState = room?.gameState as MemeFactoryGameState | null;

  const phase = gameState?.phase || 'captioning';
  const currentMeme = gameState?.currentMeme || null;
  const submissions = gameState?.submissions || [];
  const hasSubmitted = Boolean(gameState?.hasSubmitted);
  const hasVoted = Boolean(gameState?.hasVoted);
  const myCaption = gameState?.myCaption || '';
  const myVotedSubId = gameState?.myVotedSubmissionId || null;
  const isGameOver = Boolean(gameState?.isGameOver);
  const podium = gameState?.finalPodium || null;

  const handleSubmitCaption = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!captionInput.trim()) return;

    triggerHaptic(hapticPatterns.success);
    audio.playSelect();

    sendGameAction('mf_submit_caption', { caption: captionInput.trim() });
  };

  const handleCastVote = (subId: string) => {
    if (hasVoted) return;

    triggerHaptic(hapticPatterns.tap);
    audio.playSelect();
    setSelectedSubId(subId);
  };

  const handleConfirmVote = () => {
    if (!selectedSubId || hasVoted) return;

    triggerHaptic(hapticPatterns.success);
    audio.playSelect();
    sendGameAction('mf_cast_vote', { submissionId: selectedSubId });
  };

  // GAMEOVER VIEW
  if (isGameOver && podium) {
    const winner = podium[0];
    const myRank = podium.find((p) => p.id === localPlayer?.id)?.rank ?? 1;

    return (
      <div className="flex flex-col items-center justify-between min-h-screen bg-slate-950 text-white p-6 select-none">
        <div className="flex flex-col items-center text-center mt-12">
          <div className="w-20 h-20 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center mb-4">
            <Trophy className="w-10 h-10 text-amber-300 animate-bounce" />
          </div>
          <span className="text-amber-400 font-black uppercase tracking-widest text-xs">
            FIN DE LA PARTIE
          </span>
          <h1 className="text-3xl font-black font-display text-white mt-1">
            {winner?.name} l'emporte !
          </h1>
          <p className="text-sm text-gray-400 mt-2">
            Tu termines au rang <strong className="text-white">#{myRank}</strong> de la Meme Factory !
          </p>
        </div>

        <div className="w-full bg-slate-900 border border-white/10 rounded-2xl p-4 my-auto space-y-2">
          <span className="text-xs uppercase tracking-wider text-gray-400 font-bold block text-center mb-2">
            Classement de l'humour
          </span>
          {podium.slice(0, 4).map((p) => (
            <div
              key={p.id}
              className={`flex items-center justify-between p-3 rounded-xl border ${
                p.id === localPlayer?.id
                  ? 'border-purple-400 bg-purple-500/10'
                  : 'border-white/5 bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="font-bold text-amber-400">#{p.rank}</span>
                <span className="font-bold text-white truncate max-w-[140px]">{p.name}</span>
              </div>
              <span className="font-mono font-bold text-emerald-400 text-sm">
                {p.score} pts
              </span>
            </div>
          ))}
        </div>

        <div className="w-full text-center text-xs text-gray-500 pb-4">
          Regarde la Smart TV pour la cérémonie finale !
        </div>
      </div>
    );
  }

  // PHASE 1: CAPTIONING
  if (phase === 'captioning') {
    return (
      <div className="flex flex-col justify-between min-h-screen bg-slate-950 text-white p-5 select-none">
        <div className="flex flex-col items-center text-center mt-2">
          <span className="text-[11px] font-bold uppercase tracking-widest text-purple-400 block mb-1">
            Meme Factory • Manche {gameState?.currentRound || 1}
          </span>
          <h2 className="text-2xl font-black font-display text-white">
            {hasSubmitted ? 'Meme Enregistré !' : 'Invente ta punchline'}
          </h2>
        </div>

        {/* Prompt Card */}
        <div className="bg-slate-900 border border-purple-500/30 rounded-2xl p-4 my-3">
          <span className="text-[10px] uppercase font-bold text-amber-400 block mb-1">
            Situation :
          </span>
          <p className="text-base font-bold text-white leading-snug">
            "{currentMeme?.situation}"
          </p>
        </div>

        {/* Form or Submitted State */}
        {hasSubmitted ? (
          <div className="bg-purple-950/40 border border-purple-500/40 rounded-2xl p-5 my-auto text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
            <span className="text-xs uppercase font-bold text-gray-400 block">
              Ta punchline pour cette manche :
            </span>
            <p className="text-lg font-black text-white font-display">
              "{myCaption}"
            </p>
            <span className="text-xs text-purple-300 block pt-2">
              En attente que tout le monde termine...
            </span>
          </div>
        ) : (
          <form onSubmit={handleSubmitCaption} className="space-y-4 my-auto">
            <textarea
              value={captionInput}
              onChange={(e) => setCaptionInput(e.target.value)}
              placeholder="Tape ta meilleure légende ici..."
              maxLength={120}
              rows={3}
              autoFocus
              className="w-full bg-slate-900 border-2 border-purple-500/60 text-white text-base p-4 rounded-2xl focus:outline-none focus:ring-4 focus:ring-purple-500/40 placeholder:text-gray-600 shadow-inner resize-none font-medium"
            />

            <div className="flex items-center justify-between text-xs text-gray-400 px-1">
              <span>{captionInput.length} / 120 caractères</span>
              <button
                type="button"
                onClick={() => {
                  const joke = currentMeme?.defaultJokes[0] || 'Moi quand je réalise...';
                  setCaptionInput(joke);
                }}
                className="text-purple-400 hover:text-purple-300 underline font-semibold"
              >
                💡 Idée rapide
              </button>
            </div>

            <button
              type="submit"
              disabled={!captionInput.trim()}
              className={`w-full py-4 rounded-2xl font-black font-display text-base uppercase tracking-wider flex items-center justify-center gap-2 shadow-2xl transition-all ${
                captionInput.trim()
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-purple-500/30 active:scale-95'
                  : 'bg-slate-900 text-gray-600 border border-white/5 cursor-not-allowed'
              }`}
            >
              <span>🚀 VALIDER MON MEME</span>
              <Send className="w-4 h-4" />
            </button>
          </form>
        )}

        <div className="w-full text-center text-xs text-gray-500 pb-2">
          {localPlayer?.name} • Score : {room?.players.find((p) => p.id === localPlayer?.id)?.score ?? 0} pts
        </div>
      </div>
    );
  }

  // PHASE 2 & 3: VOTING & REVEAL
  return (
    <div className="flex flex-col justify-between min-h-screen bg-slate-950 text-white p-5 select-none">
      <div className="flex flex-col items-center text-center mt-2">
        <span className="text-[11px] font-bold uppercase tracking-widest text-purple-400 block mb-1">
          {phase === 'voting' ? 'Vote pour le meilleur' : 'Résultats de la manche'}
        </span>
        <h2 className="text-2xl font-black font-display text-white">
          {phase === 'voting' ? 'Quel meme te fait le plus rire ?' : 'Regarde la télévision !'}
        </h2>
      </div>

      {/* Submissions List */}
      <div className="space-y-3 my-4 overflow-y-auto max-h-[60vh] pr-1">
        {submissions.map((sub) => {
          const isSelected = selectedSubId === sub.id;
          const isMine = sub.isMine;
          const isVoted = myVotedSubId === sub.id;

          return (
            <button
              key={sub.id}
              onClick={() => !isMine && handleCastVote(sub.id)}
              disabled={isMine || hasVoted || phase !== 'voting'}
              className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${
                isVoted || isSelected
                  ? 'border-purple-400 bg-purple-500/20 shadow-lg shadow-purple-500/30 scale-[1.01]'
                  : isMine
                  ? 'border-white/5 bg-white/5 opacity-50 cursor-not-allowed'
                  : 'border-white/10 bg-slate-900/90 active:scale-95'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <p className="font-bold text-white text-base leading-snug">
                  "{sub.text}"
                </p>
                {isMine && (
                  <span className="shrink-0 text-[10px] font-bold bg-white/10 text-gray-400 px-2 py-0.5 rounded-full">
                    Ton meme
                  </span>
                )}
                {isVoted && (
                  <ThumbsUp className="w-5 h-5 text-purple-400 shrink-0 fill-purple-400" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Confirm Vote Button */}
      {phase === 'voting' && (
        <div className="w-full space-y-2">
          {hasVoted ? (
            <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-center">
              <span className="text-sm font-bold text-emerald-400">
                ✅ Vote confirmé ! Attente des autres joueurs...
              </span>
            </div>
          ) : (
            <button
              onClick={handleConfirmVote}
              disabled={!selectedSubId}
              className={`w-full py-4 rounded-2xl font-black font-display text-base uppercase tracking-wider flex items-center justify-center gap-2 shadow-2xl transition-all ${
                selectedSubId
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-purple-500/30 active:scale-95'
                  : 'bg-slate-900 text-gray-600 border border-white/5 cursor-not-allowed'
              }`}
            >
              <ThumbsUp className="w-4 h-4" />
              <span>CONFIRMER MON VOTE</span>
            </button>
          )}
        </div>
      )}

      <div className="w-full text-center text-xs text-gray-500 pb-2">
        Tu ne peux pas voter pour ton propre meme.
      </div>
    </div>
  );
};
