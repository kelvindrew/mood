import React from 'react';
import { useGame } from '../../context/GameContext';
import { FakeNewsGameState } from '../../types/game';
import {
  Clock,
  Sparkles,
  Trophy,
  Crown,
  RotateCcw,
  Newspaper,
  CheckCircle2,
  XCircle,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

export const FakeNewsBoardTV: React.FC = () => {
  const { room, sendGameAction } = useGame();
  const gameState = room?.gameState as FakeNewsGameState | undefined;

  if (!gameState) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0E0714] text-white">
        <span className="font-mono text-sm text-gray-400">Chargement de Fake News...</span>
      </div>
    );
  }

  const {
    phase,
    currentRound,
    totalRounds,
    timer,
    prompt,
    truth,
    votingChoices,
    lastRoundStats,
    scores,
    finalPodium,
    players,
  } = gameState;

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-gradient-to-br from-[#12081C] via-[#1B0D29] to-[#0A0410] text-white flex flex-col justify-between p-8 select-none font-sans">
      {/* Background Neon Grid */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(#E879F9_1px,transparent_1px)] [background-size:28px_28px]" />

      {/* Top Header */}
      <header className="relative z-10 flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-fuchsia-500/20 border-2 border-fuchsia-400/50 flex items-center justify-center shadow-[0_0_30px_rgba(232,121,249,0.3)]">
            <Newspaper className="w-7 h-7 text-fuchsia-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full bg-fuchsia-400/20 border border-fuchsia-400/40 text-fuchsia-300 text-[10px] font-black uppercase tracking-widest">
                FAKE NEWS • QUI A DIT VRAI ?
              </span>
              <span className="text-xs font-mono text-gray-400">
                QUESTION {currentRound} / {totalRounds}
              </span>
            </div>
            <h1 className="text-2xl font-black font-display tracking-wide uppercase text-white">
              CULTURE INSOLITE & BLUFF
            </h1>
          </div>
        </div>

        {/* Global Timer Ring */}
        <div className="flex items-center space-x-3 bg-black/50 border border-white/10 px-5 py-2.5 rounded-2xl shadow-xl">
          <Clock className={`w-6 h-6 ${timer <= 5 ? 'text-rose-500 animate-spin' : 'text-fuchsia-400'}`} />
          <span
            className={`font-mono text-3xl font-black ${
              timer <= 5 ? 'text-rose-400 animate-pulse' : 'text-white'
            }`}
          >
            {timer}s
          </span>
        </div>
      </header>

      {/* Main Center Stage by Phase */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center my-4 max-w-6xl mx-auto w-full">
        {/* PHASE 1: WRITING (Inventer un mensonge) */}
        {phase === 'writing' && (
          <div className="w-full max-w-4xl space-y-8 text-center animate-scale-in">
            {/* The Question Card */}
            <div className="p-8 rounded-3xl bg-black/60 border-2 border-fuchsia-500/40 shadow-2xl space-y-4">
              <span className="text-xs font-mono font-bold tracking-widest text-fuchsia-400 uppercase">
                COMPLÉTEZ LA VÉRITÉ
              </span>
              <h2 className="text-3xl md:text-4xl font-black font-display leading-tight text-white max-w-3xl mx-auto">
                « {prompt} <span className="inline-block px-4 py-1 rounded-xl bg-fuchsia-500/30 border border-fuchsia-400 text-fuchsia-300 font-mono text-2xl font-black">? ? ?</span> »
              </h2>
            </div>

            <p className="text-sm text-gray-300">
              Sur votre smartphone, inventez un <strong className="text-fuchsia-300">mensonge crédible</strong> pour tromper vos amis !
            </p>

            {/* Players Status Pills */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {players.map((p) => (
                <div
                  key={p.id}
                  className={`p-3 rounded-2xl border transition-all flex items-center justify-between ${
                    p.hasSubmittedLie
                      ? 'bg-emerald-500/20 border-emerald-400 shadow-lg'
                      : 'bg-black/40 border-white/10'
                  }`}
                >
                  <div className="flex items-center space-x-2 truncate">
                    <span className="text-xl">{p.avatar || '👤'}</span>
                    <span className="font-bold text-xs truncate text-white">{p.name}</span>
                  </div>
                  {p.hasSubmittedLie ? (
                    <span className="text-[10px] font-mono font-bold text-emerald-400 flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Prêt</span>
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-gray-500 animate-pulse">Invente...</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PHASE 2: VOTING (Trouver la vérité parmi les mensonges) */}
        {phase === 'voting' && (
          <div className="w-full max-w-5xl space-y-6 text-center animate-scale-in">
            <div className="p-5 rounded-3xl bg-black/60 border border-white/15 space-y-1">
              <span className="text-xs font-mono font-bold text-fuchsia-400 uppercase">
                « {prompt} »
              </span>
              <h2 className="text-2xl font-black font-display text-white">
                OÙ SE CACHE LA VÉRITÉ ?
              </h2>
              <p className="text-xs text-gray-400">
                Votez sur votre smartphone pour l’affirmation qui est selon vous la vraie réponse !
              </p>
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pt-2">
              {votingChoices.map((choice, idx) => (
                <div
                  key={choice.id}
                  className="p-5 rounded-3xl bg-gradient-to-b from-white/10 to-white/5 border-2 border-white/20 shadow-xl flex flex-col items-center justify-center min-h-[100px] text-center space-y-1"
                >
                  <span className="text-xs font-mono font-bold text-gray-400 uppercase">
                    Proposition {idx + 1}
                  </span>
                  <div className="font-black text-lg text-white font-display">
                    « {choice.text} »
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PHASE 3: REVEAL (Qui s'est fait avoir ?) */}
        {phase === 'reveal' && (
          <div className="w-full max-w-5xl space-y-6 text-center animate-scale-in">
            <div className="space-y-1">
              <span className="text-xs font-mono font-bold text-fuchsia-400 uppercase">
                RÉVÉLATION DU CONSEIL
              </span>
              <h2 className="text-3xl font-black font-display text-white">
                LE VERDICT DES FAITS
              </h2>
            </div>

            {/* Cards with Author & Victims Reveal */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {lastRoundStats.map((stat) => (
                <div
                  key={stat.id}
                  className={`p-5 rounded-3xl border-2 flex flex-col justify-between space-y-3 shadow-2xl transition-all ${
                    stat.isCorrect
                      ? 'bg-gradient-to-b from-emerald-500/30 to-emerald-950/60 border-emerald-400 ring-4 ring-emerald-400/40 scale-105'
                      : stat.voters.length > 0
                      ? 'bg-gradient-to-b from-rose-500/20 to-rose-950/40 border-rose-400'
                      : 'bg-black/40 border-white/10 opacity-70'
                  }`}
                >
                  <div className="space-y-1">
                    <div
                      className={`text-xs font-mono font-bold uppercase ${
                        stat.isCorrect ? 'text-emerald-300' : 'text-rose-300'
                      }`}
                    >
                      {stat.isCorrect
                        ? '🌟 LA VRAIE RÉPONSE (+200)'
                        : stat.authorName
                        ? `🤥 MENSONGE DE ${stat.authorName.toUpperCase()}`
                        : '🤖 MENSONGE DU JEU'}
                    </div>

                    <div className="font-black text-xl text-white font-display">
                      « {stat.text} »
                    </div>
                  </div>

                  {/* Voters list */}
                  <div className="pt-2 border-t border-white/10 text-xs">
                    {stat.voters.length > 0 ? (
                      <div className="space-y-0.5">
                        <span className="text-gray-400 text-[10px] font-mono">
                          {stat.isCorrect ? 'Ont trouvé la vérité :' : 'Sont tombés dans le piège :'}
                        </span>
                        <div className="font-bold text-amber-300 text-xs truncate">
                          {stat.voters.join(', ')}
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-500 text-[10px] italic">Aucun vote</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PHASE 4: ROUND RECAP */}
        {phase === 'round_recap' && (
          <div className="w-full max-w-3xl text-center space-y-6 animate-scale-in">
            <div className="space-y-1">
              <span className="text-xs font-mono font-bold tracking-widest text-fuchsia-400 uppercase">
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
                      <span className="font-mono text-base font-black text-fuchsia-400">#{idx + 1}</span>
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
              Prochaine question insolite dans {timer}s...
            </div>
          </div>
        )}

        {/* PHASE 5: GAMEOVER */}
        {phase === 'gameover' && (
          <div className="w-full max-w-4xl text-center space-y-6 animate-scale-in">
            <div className="w-24 h-24 mx-auto rounded-full bg-fuchsia-500/20 border-2 border-fuchsia-400 flex items-center justify-center shadow-[0_0_60px_rgba(232,121,249,0.5)]">
              <Crown className="w-14 h-14 text-fuchsia-400 fill-current animate-bounce" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-mono font-bold tracking-widest text-fuchsia-400 uppercase">
                PARTIE TERMINÉE
              </span>
              <h2 className="text-5xl font-black font-display uppercase tracking-tight text-white">
                MAÎTRE DU BLUFF ET DE LA VÉRITÉ !
              </h2>
            </div>

            {/* Final Podium */}
            <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto pt-2">
              {finalPodium?.slice(0, 3).map((entry, idx) => (
                <div
                  key={entry.id}
                  className={`p-5 rounded-3xl border text-center space-y-2 shadow-2xl ${
                    idx === 0
                      ? 'bg-fuchsia-500/20 border-fuchsia-400 ring-2 ring-fuchsia-400 scale-105'
                      : 'bg-black/50 border-white/10'
                  }`}
                >
                  <div className="text-3xl">{entry.avatar || '👤'}</div>
                  <div className="font-mono font-bold text-xs text-fuchsia-300">
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
                onClick={() => sendGameAction('fn_restart')}
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-fuchsia-500 to-purple-600 hover:from-fuchsia-400 hover:to-purple-500 text-white font-black text-sm uppercase tracking-wider shadow-xl flex items-center justify-center space-x-2 mx-auto active:scale-95 transition-all"
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
        <span>Playflix TV Salon • Fake News</span>
        <span>+200 pts Vérité trouvée • +100 pts par ami piégé</span>
      </footer>
    </div>
  );
};
