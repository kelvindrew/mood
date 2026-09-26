import React, { useEffect, useRef } from 'react';
import { useGame } from '../../context/GameContext';
import { MemeFactoryGameState } from '../../types/game';
import { audio } from '../../services/audio';
import { Trophy, Sparkles, Clock, Flame, Heart, Crown, CheckCircle2, MessageSquare, ThumbsUp } from 'lucide-react';

export const MemeFactoryBoardTV: React.FC = () => {
  const { room } = useGame();
  const gameState = room?.gameState as MemeFactoryGameState | null;

  const phase = gameState?.phase || 'captioning';
  const currentRound = gameState?.currentRound || 1;
  const totalRounds = gameState?.totalRounds || 3;
  const timeRemaining = gameState?.timeRemaining ?? 30;
  const currentMeme = gameState?.currentMeme || null;
  const submissions = gameState?.submissions || [];
  const players = gameState?.players || [];
  const isGameOver = Boolean(gameState?.isGameOver);
  const podium = gameState?.finalPodium || null;

  const prevPhaseRef = useRef(phase);

  // Play audio on phase transition
  useEffect(() => {
    if (phase !== prevPhaseRef.current) {
      prevPhaseRef.current = phase;
      if (phase === 'reveal') {
        audio.playCustomBuzzer('airhorn');
      } else if (phase === 'voting') {
        audio.playCustomBuzzer('bell');
      } else {
        audio.playSelect();
      }
    }
  }, [phase]);

  // GAMEOVER PODIUM
  if (isGameOver && podium) {
    const winner = podium[0];
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-gradient-to-br from-slate-950 via-purple-950/60 to-slate-950 text-white select-none">
        <div className="relative flex flex-col items-center max-w-4xl w-full bg-slate-900/80 border-2 border-amber-500/40 rounded-3xl p-10 shadow-2xl backdrop-blur-xl">
          <div className="w-24 h-24 rounded-full bg-amber-500/20 border-4 border-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/30 mb-4 animate-bounce">
            <Trophy className="w-12 h-12 text-amber-300" />
          </div>

          <span className="text-amber-400 font-black tracking-widest text-sm uppercase">
            👑 ROI DU MEME & DE L'HUMOUR
          </span>
          <h1 className="text-5xl font-black font-display text-white mt-1 mb-6 text-center drop-shadow-lg">
            {winner?.name} EST LE MEME MASTER !
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-4">
            {podium.slice(0, 3).map((p, idx) => {
              const medals = ['🥇', '🥈', '🥉'];
              const borders = [
                'border-amber-400 bg-amber-500/10 shadow-amber-500/30',
                'border-slate-400 bg-slate-500/10 shadow-slate-400/20',
                'border-amber-800 bg-amber-900/10 shadow-amber-900/20',
              ];
              return (
                <div
                  key={p.id}
                  className={`flex flex-col items-center p-6 rounded-2xl border-2 ${borders[idx]} shadow-xl`}
                >
                  <span className="text-3xl mb-2">{medals[idx]}</span>
                  <div className="w-16 h-16 rounded-full bg-slate-800 border-2 border-white/20 flex items-center justify-center text-3xl mb-2">
                    {p.avatar || '😎'}
                  </div>
                  <span className="font-bold text-xl text-white truncate max-w-full">
                    {p.name}
                  </span>
                  <span className="text-sm font-semibold text-emerald-400 mt-1">
                    {p.score} points
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
    <div className="w-full h-full flex flex-col justify-between p-8 bg-slate-950 text-white select-none relative overflow-hidden">
      {/* Background Neon Orbs */}
      <div className="absolute top-1/3 left-1/4 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-pink-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* TOP BAR */}
      <div className="relative z-10 flex items-center justify-between bg-slate-900/80 border border-white/10 rounded-2xl px-8 py-3.5 backdrop-blur-md shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-2xl">
            💬
          </div>
          <div>
            <h1 className="font-display font-black text-xl tracking-wider text-white">
              MEME FACTORY
            </h1>
            <span className="text-xs text-purple-300 font-semibold uppercase tracking-wider">
              {phase === 'captioning'
                ? 'Phase de création • Écrivez votre punchline'
                : phase === 'voting'
                ? 'Phase de vote • Choisissez le meme le plus drôle'
                : 'Révélation des auteurs & des points !'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-purple-500/20 border border-purple-400/30 px-4 py-1.5 rounded-xl font-bold text-sm text-purple-300">
            <span>Manche {currentRound} / {totalRounds}</span>
          </div>

          <div className="flex items-center gap-2 bg-slate-800/80 border border-white/10 px-4 py-1.5 rounded-xl font-mono font-bold text-amber-300">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>{timeRemaining}s</span>
          </div>
        </div>
      </div>

      {/* MAIN STAGE */}
      <div className="relative z-10 grid grid-cols-12 gap-8 my-auto w-full max-w-7xl mx-auto items-center">
        {/* LEFT COLUMN: THE MEME IMAGE & SITUATION */}
        <div className="col-span-5 flex flex-col items-center">
          <div className="relative w-full bg-slate-900 border-2 border-purple-500/40 rounded-3xl overflow-hidden shadow-2xl p-4 flex flex-col items-center backdrop-blur-md">
            {/* Situation Banner */}
            <div className="w-full bg-purple-950/80 border border-purple-500/30 rounded-2xl p-4 mb-3 text-center">
              <span className="text-xs font-bold uppercase tracking-widest text-amber-400 block mb-1">
                LA SITUATION
              </span>
              <p className="font-display font-bold text-lg text-white leading-snug">
                "{currentMeme?.situation}"
              </p>
            </div>

            {/* Meme Photo */}
            <div className="relative w-full aspect-square max-h-[360px] rounded-2xl overflow-hidden border border-white/10 shadow-inner">
              <img
                src={currentMeme?.imageUrl}
                alt={currentMeme?.title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: DYNAMIC ACCORDING TO PHASE */}
        <div className="col-span-7 flex flex-col justify-center">
          {phase === 'captioning' ? (
            /* CAPTIONING PHASE: SHOW PLAYERS WRITING STATUS */
            <div className="bg-slate-900/80 border border-white/10 rounded-3xl p-8 backdrop-blur-md shadow-2xl">
              <h2 className="text-2xl font-black font-display text-white mb-2 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-purple-400" />
                <span>À vos smartphones !</span>
              </h2>
              <p className="text-sm text-gray-400 mb-6">
                Inventez la légende la plus drôle ou inattendue pour accompagner cette photo.
              </p>

              <div className="grid grid-cols-2 gap-4">
                {players.map((p) => (
                  <div
                    key={p.id}
                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                      p.hasSubmitted
                        ? 'border-emerald-500/60 bg-emerald-500/10'
                        : 'border-white/10 bg-white/5 animate-pulse'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-slate-800 border border-white/20 flex items-center justify-center text-2xl">
                        {p.avatar || '😎'}
                      </div>
                      <div>
                        <span className="font-bold text-base text-white block">
                          {p.name}
                        </span>
                        <span className="text-xs text-gray-400">
                          {p.hasSubmitted ? 'Meme prêt !' : 'En rédaction...'}
                        </span>
                      </div>
                    </div>
                    {p.hasSubmitted ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                    ) : (
                      <span className="text-xs font-mono font-bold text-amber-400">
                        ✍️...
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* VOTING & REVEAL PHASES: SHOW GALLERY OF PUNCHLINES */
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs uppercase font-bold text-purple-400 tracking-wider">
                  {phase === 'voting' ? '🗳️ Les propositions anonymes' : '🏆 Révélation des auteurs'}
                </span>
                <span className="text-xs text-gray-400">
                  {submissions.length} memes en compétition
                </span>
              </div>

              <div className="space-y-3 max-h-[460px] overflow-y-auto pr-2 scrollbar-none">
                {submissions.map((sub, idx) => {
                  const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
                  const isTopVoted = phase === 'reveal' && (sub.votesCount ?? 0) > 0 && Math.max(...submissions.map(s => s.votesCount ?? 0)) === sub.votesCount;

                  return (
                    <div
                      key={sub.id}
                      className={`flex flex-col p-5 rounded-2xl border-2 transition-all duration-300 ${
                        isTopVoted
                          ? 'border-amber-400 bg-amber-500/15 shadow-xl shadow-amber-500/20 scale-[1.02]'
                          : 'border-white/10 bg-slate-900/80'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <span className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-300 font-black font-mono flex items-center justify-center shrink-0">
                            {letters[idx] || idx + 1}
                          </span>
                          <p className="font-display font-bold text-lg text-white leading-snug">
                            "{sub.text}"
                          </p>
                        </div>

                        {phase === 'reveal' && (
                          <div className="flex items-center gap-2 shrink-0 bg-white/10 px-3 py-1.5 rounded-xl">
                            <ThumbsUp className="w-4 h-4 text-amber-400" />
                            <span className="font-black text-amber-300 font-display text-base">
                              {sub.votesCount ?? 0} {sub.votesCount === 1 ? 'vote' : 'votes'}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Author Reveal in Reveal Phase */}
                      {phase === 'reveal' && sub.authorName && (
                        <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{sub.authorAvatar || '😎'}</span>
                            <span className="text-sm font-bold text-gray-300">
                              Par <strong className="text-white">{sub.authorName}</strong>
                            </span>
                            {isTopVoted && (
                              <span className="bg-amber-500 text-black text-[10px] font-black uppercase px-2 py-0.5 rounded-md flex items-center gap-1">
                                <Crown className="w-3 h-3" /> BEST MEME
                              </span>
                            )}
                          </div>

                          {sub.voters && sub.voters.length > 0 && (
                            <span className="text-xs text-gray-400">
                              Voté par : {sub.voters.join(', ')}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* FOOTER */}
      <div className="relative z-10 flex items-center justify-between text-xs text-gray-500 pt-2 px-4">
        <span>+150 points par vote reçu • +100 points de bonus pour le meilleur meme</span>
        <span>Votez sur votre smartphone</span>
      </div>
    </div>
  );
};
