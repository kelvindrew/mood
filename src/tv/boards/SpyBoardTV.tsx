import React, { useMemo } from 'react';
import { useGame } from '../../context/GameContext';
import { SpyGameState } from '../../types/game';
import {
  ShieldAlert,
  Clock,
  UserCheck,
  Eye,
  Vote,
  Trophy,
  Crown,
  RotateCcw,
  Sparkles,
  HelpCircle,
  AlertTriangle,
  Fingerprint,
} from 'lucide-react';

export const SpyBoardTV: React.FC = () => {
  const { room, sendGameAction } = useGame();
  const gameState = room?.gameState as SpyGameState | undefined;

  const currentSpeaker = useMemo(() => {
    if (!gameState || !gameState.currentSpeakerId) return null;
    return gameState.players.find((p) => p.id === gameState.currentSpeakerId);
  }, [gameState]);

  if (!gameState) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#07090F] text-white">
        <span className="font-mono text-sm text-gray-400">Initialisation de l’Espion...</span>
      </div>
    );
  }

  const { phase, round, timer, category, players, clues, votes, lastEliminated, winner, finalPodium } =
    gameState;

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-gradient-to-br from-[#07090F] via-[#0E131F] to-[#07090F] text-white flex flex-col justify-between p-8 select-none font-sans">
      {/* Background Ambience Lines */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(#38BDF8_1px,transparent_1px)] [background-size:24px_24px]" />

      {/* Top Header */}
      <header className="relative z-10 flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border-2 border-amber-400/50 flex items-center justify-center shadow-[0_0_20px_rgba(251,191,36,0.3)]">
            <ShieldAlert className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-[10px] font-black uppercase tracking-widest">
                L’ESPION • UNDERCOVER
              </span>
              <span className="text-xs font-mono text-gray-400">MANCHE {round}</span>
            </div>
            <h1 className="text-2xl font-black font-display tracking-wide uppercase text-white">
              THÈME : <span className="text-amber-400">{category}</span>
            </h1>
          </div>
        </div>

        {/* Global Timer Ring */}
        <div className="flex items-center space-x-3 bg-black/40 border border-white/10 px-5 py-2.5 rounded-2xl shadow-xl">
          <Clock className={`w-5 h-5 ${timer <= 5 ? 'text-rose-500 animate-spin' : 'text-amber-400'}`} />
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
        {/* PHASE 1: REVEAL */}
        {phase === 'reveal' && (
          <div className="text-center space-y-6 max-w-2xl animate-scale-in">
            <div className="w-24 h-24 mx-auto rounded-3xl bg-amber-500/10 border-2 border-amber-400/40 flex items-center justify-center shadow-[0_0_50px_rgba(251,191,36,0.25)]">
              <Fingerprint className="w-14 h-14 text-amber-400 animate-pulse" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-mono font-bold tracking-widest text-amber-400 uppercase">
                DOSSIER CLASSIFIÉ
              </span>
              <h2 className="text-4xl font-black font-display tracking-tight text-white">
                DÉCOUVERTE SECRÈTE DES RÔLES
              </h2>
              <p className="text-base text-gray-300 leading-relaxed max-w-lg mx-auto">
                Chaque joueur doit regarder discrètement l’écran de son smartphone. Maintenez le bouton
                pour révéler votre mot secret sans attirer les regards !
              </p>
            </div>

            <div className="flex items-center justify-center space-x-2 text-xs font-mono text-gray-400 bg-white/5 border border-white/10 px-4 py-2 rounded-xl w-fit mx-auto">
              <Eye className="w-4 h-4 text-cyan-400" />
              <span>La partie démarre dans quelques secondes...</span>
            </div>
          </div>
        )}

        {/* PHASE 2: CLUE */}
        {phase === 'clue' && (
          <div className="w-full space-y-6 animate-scale-in">
            {/* Current Active Speaker Spotlight */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-500/15 via-black/60 to-cyan-500/15 border-2 border-amber-400/50 shadow-2xl text-center space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-center space-x-2 text-amber-400">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                <span className="text-xs font-black uppercase tracking-widest">
                  TOUR DE PAROLE ACTIF
                </span>
              </div>

              <div className="flex items-center justify-center space-x-4">
                <div className="w-16 h-16 rounded-2xl bg-amber-400 text-gray-950 font-black text-3xl flex items-center justify-center shadow-lg">
                  {currentSpeaker?.avatar || '🕵️'}
                </div>
                <div className="text-left">
                  <div className="text-3xl font-black font-display text-white">
                    {currentSpeaker?.name || 'Agent mystère'}
                  </div>
                  <div className="text-xs font-mono text-gray-300">
                    Donnez UN mot ou un indice court sans trop en dire !
                  </div>
                </div>
              </div>

              {/* Clue text if submitted */}
              {currentSpeaker && clues[currentSpeaker.id] ? (
                <div className="p-3 rounded-2xl bg-black/60 border border-white/15 max-w-md mx-auto">
                  <span className="text-xl font-serif italic text-amber-300 font-bold">
                    « {clues[currentSpeaker.id]} »
                  </span>
                </div>
              ) : null}
            </div>

            {/* Turn order grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {players.map((p) => {
                const isCurrent = p.id === currentSpeaker?.id;
                const clue = clues[p.id];
                return (
                  <div
                    key={p.id}
                    className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between space-y-2 ${
                      !p.alive
                        ? 'bg-black/30 border-white/5 opacity-40'
                        : isCurrent
                        ? 'bg-amber-400/20 border-amber-400 ring-2 ring-amber-400 shadow-lg scale-105'
                        : clue
                        ? 'bg-white/10 border-white/20'
                        : 'bg-black/40 border-white/10'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-xl">{p.avatar || '👤'}</span>
                      <span className="font-bold text-xs truncate">{p.name}</span>
                    </div>

                    <div className="min-h-[32px] flex items-center">
                      {!p.alive ? (
                        <span className="text-[10px] font-mono text-rose-400 uppercase">Éliminé</span>
                      ) : clue ? (
                        <span className="text-xs font-serif italic text-amber-200 line-clamp-2">
                          « {clue} »
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-gray-500">En attente...</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* PHASE 3: VOTE */}
        {phase === 'vote' && (
          <div className="w-full space-y-6 text-center animate-scale-in">
            <div className="space-y-2">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold uppercase tracking-wider">
                <Vote className="w-4 h-4" />
                <span>PHASE DE VOTE EN COURS</span>
              </div>
              <h2 className="text-4xl font-black font-display uppercase tracking-tight text-white">
                QUI EST L’ESPION DU SALON ?
              </h2>
              <p className="text-sm text-gray-300 max-w-lg mx-auto">
                Débattez ensemble et votez sur votre smartphone contre le joueur dont l'indice vous
                semble suspect ou hors sujet !
              </p>
            </div>

            {/* Voting Cards Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3.5 max-w-5xl mx-auto w-full">
              {players
                .filter((p) => p.alive)
                .map((p) => {
                  const votesAgainst = Object.values(votes).filter((v) => v === p.id).length;
                  return (
                    <div
                      key={p.id}
                      className="p-4 rounded-3xl bg-black/60 border-2 border-white/15 space-y-2 shadow-xl flex flex-col justify-between"
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">{p.avatar || '👤'}</span>
                        <div className="text-left truncate">
                          <div className="font-black text-sm text-white truncate">{p.name}</div>
                          {clues[p.id] && (
                            <div className="text-[10px] text-amber-300 italic truncate font-serif">
                              « {clues[p.id]} »
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
                        <span className="text-gray-400 font-mono">Suffrages</span>
                        <span className="font-mono font-black text-rose-400 text-lg">
                          {votesAgainst}
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* PHASE 4: ELIMINATION REVEAL */}
        {phase === 'elimination' && lastEliminated && (
          <div className="text-center space-y-6 max-w-xl animate-scale-in">
            <div className="w-24 h-24 mx-auto rounded-3xl bg-rose-500/20 border-2 border-rose-500 flex items-center justify-center shadow-[0_0_50px_rgba(244,63,94,0.4)]">
              <AlertTriangle className="w-14 h-14 text-rose-400 animate-bounce" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-mono font-bold tracking-widest text-rose-400 uppercase">
                VERDICT DU CONSEIL
              </span>
              <h2 className="text-5xl font-black font-display uppercase tracking-tight text-white">
                {lastEliminated.name}
              </h2>
              <p className="text-sm text-gray-300">A reçu le plus grand nombre de votes.</p>
            </div>

            <div className="p-5 rounded-3xl bg-white/10 border-2 border-white/20 space-y-2 max-w-sm mx-auto shadow-2xl">
              <div className="text-xs font-mono uppercase text-gray-400">RÔLE RÉVÉLÉ</div>
              <div
                className={`text-2xl font-black uppercase tracking-wider ${
                  lastEliminated.role === 'spy'
                    ? 'text-rose-400'
                    : lastEliminated.role === 'white'
                    ? 'text-cyan-400'
                    : 'text-emerald-400'
                }`}
              >
                {lastEliminated.role === 'spy'
                  ? '🕵️ ESPION DÉMASQUÉ !'
                  : lastEliminated.role === 'white'
                  ? '👻 MR. BLANC DÉMASQUÉ !'
                  : '👤 SIMPLE CITOYEN INNOCENT'}
              </div>
            </div>
          </div>
        )}

        {/* PHASE 5: GUESS (SPY LAST CHANCE) */}
        {phase === 'guess' && (
          <div className="text-center space-y-5 max-w-lg animate-scale-in">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-cyan-500/20 border-2 border-cyan-400 flex items-center justify-center shadow-[0_0_40px_rgba(56,189,248,0.4)]">
              <HelpCircle className="w-12 h-12 text-cyan-400 animate-pulse" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase">
                DERNIÈRE CHANCE DE L’ESPION
              </span>
              <h2 className="text-3xl font-black font-display uppercase text-white">
                DEVINETTE DU MOT SECRET
              </h2>
              <p className="text-sm text-gray-300">
                L'espion éliminé a 25 secondes pour taper le mot secret des citoyens sur son smartphone
                et tenter de renverser la victoire !
              </p>
            </div>
          </div>
        )}

        {/* PHASE 6: GAMEOVER */}
        {phase === 'gameover' && (
          <div className="w-full max-w-4xl text-center space-y-6 animate-scale-in">
            <div className="w-24 h-24 mx-auto rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center shadow-[0_0_60px_rgba(251,191,36,0.4)]">
              <Crown className="w-14 h-14 text-amber-400 fill-current animate-bounce" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-mono font-bold tracking-widest text-amber-400 uppercase">
                FIN DE PARTIE
              </span>
              <h2 className="text-5xl font-black font-display uppercase tracking-tight text-white">
                {winner === 'civils' ? '🎉 VICTOIRE DES CITOYENS !' : '🕵️ VICTOIRE DES ESPIONS !'}
              </h2>
            </div>

            {/* Revealed Secret Words */}
            <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto">
              <div className="p-4 rounded-2xl bg-emerald-500/15 border-2 border-emerald-400/40 space-y-1">
                <div className="text-[10px] font-mono uppercase text-emerald-300">Mot des Citoyens</div>
                <div className="text-2xl font-black font-display text-white">
                  "{gameState.civilWord}"
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-rose-500/15 border-2 border-rose-400/40 space-y-1">
                <div className="text-[10px] font-mono uppercase text-rose-300">Mot de l’Espion</div>
                <div className="text-2xl font-black font-display text-white">
                  "{gameState.spyWord}"
                </div>
              </div>
            </div>

            {/* Final Podium Table */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto pt-2">
              {finalPodium?.map((entry, idx) => (
                <div
                  key={entry.id}
                  className={`p-3.5 rounded-2xl border text-center space-y-1.5 ${
                    entry.isWinner
                      ? 'bg-amber-400/20 border-amber-400 shadow-lg'
                      : 'bg-black/40 border-white/10'
                  }`}
                >
                  <div className="text-2xl">{entry.avatar || '👤'}</div>
                  <div className="font-bold text-sm text-white truncate">{entry.name}</div>
                  <div className="text-[10px] font-mono uppercase font-bold text-gray-400">
                    {entry.role === 'spy'
                      ? '🕵️ Espion'
                      : entry.role === 'white'
                      ? '👻 Infiltré'
                      : '👤 Citoyen'}
                  </div>
                  <div className="font-mono font-black text-amber-300 text-sm">+{entry.score} pts</div>
                </div>
              ))}
            </div>

            <div className="pt-4">
              <button
                onClick={() => sendGameAction('spy_restart')}
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-sm uppercase tracking-wider shadow-xl flex items-center justify-center space-x-2 mx-auto active:scale-95 transition-all"
              >
                <RotateCcw className="w-5 h-5" />
                <span>REJOUER UNE MANCHE</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer Info */}
      <footer className="relative z-10 flex items-center justify-between text-xs font-mono text-gray-400 border-t border-white/10 pt-3">
        <span>Playflix TV Salon • Social Deduction</span>
        <span>{players.filter((p) => p.alive).length} agents en vie</span>
      </footer>
    </div>
  );
};
