import React, { useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { tvNav } from '../../services/tvNavigation';
import { audio } from '../../services/audio';
import {
  Shield,
  Trophy,
  Clock,
  Sparkles,
  Users,
  Flame,
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  HelpCircle,
} from 'lucide-react';

export const ArenaBoardTV: React.FC = () => {
  const { room, returnToLobby, sendGameAction, localPlayer } = useGame();

  const gameState = (room?.gameState || {}) as Record<string, any>;
  const subGameId = gameState.subGameId || 'memory_poker';
  const subState = (gameState.subState || {}) as Record<string, any>;

  useEffect(() => {
    // Raccourcis couleur télécommande TV
    const unregisterKeys = tvNav.registerKeyHandler((key) => {
      if (key === 'red') {
        returnToLobby();
        return true;
      } else if (key === 'green') {
        if (subGameId === 'doubt_and_bet') {
          sendGameAction('call_doubt');
          return true;
        }
      }
      return false;
    });

    return () => {
      unregisterKeys();
    };
  }, [subGameId, returnToLobby, sendGameAction]);

  const activeTurnPlayer = room?.players.find(p => p.id === subState.turnPlayerId);

  return (
    <div className="relative min-h-screen bg-[#07090E] text-white flex flex-col justify-between p-6 md:p-10 select-none overflow-hidden font-sans">
      {/* Halo d'ambiance The Devil's Plan */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[1000px] h-[600px] rounded-full bg-gradient-to-b from-[#D4AF37]/10 via-[#DC2626]/5 to-transparent blur-[160px]" />
      </div>

      {/* HEADER DE MATCH ARENA */}
      <header className="relative z-10 flex items-center justify-between pb-6 border-b border-white/10">
        <div className="flex items-center gap-4">
          <button
            data-tv-focus
            tabIndex={0}
            onClick={() => {
              audio.playSelect();
              returnToLobby();
            }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-all outline-none"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Quitter</span>
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-black text-2xl tracking-tight text-white uppercase">
                {subGameId.replace(/_/g, ' ')}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37]">
                ARENA
              </span>
            </div>
            <p className="text-xs text-white/50">
              Salon #{room?.code} • {room?.players.length} Joueur(s) en compétition
            </p>
          </div>
        </div>

        {/* Panneau de joueurs et scores */}
        <div className="flex items-center gap-3">
          {room?.players.map(p => {
            const isTurn = p.id === subState.turnPlayerId;
            return (
              <div
                key={p.id}
                className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl border transition-all ${
                  isTurn
                    ? 'bg-[#D4AF37]/20 border-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.3)] animate-pulse'
                    : 'bg-white/5 border-white/10'
                }`}
              >
                <span className="text-lg">{p.avatar || '👤'}</span>
                <div>
                  <span className="block text-xs font-bold text-white leading-tight">
                    {p.name}
                  </span>
                  <span className="font-mono text-[11px] font-bold text-[#D4AF37]">
                    {p.score || 0} pts
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </header>

      {/* ZONE CENTRALE DU PLATEAU DE JEU ACTIF */}
      <main className="relative z-10 flex-1 flex items-center justify-center my-6">
        {/* ========================================================= */}
        {/* 1. MEMORY POKER */}
        {/* ========================================================= */}
        {subGameId === 'memory_poker' && (
          <div className="w-full max-w-4xl flex flex-col items-center">
            <div className="mb-6 text-center">
              <span className="text-xs font-black uppercase tracking-widest text-[#D4AF37] block mb-1">
                {subState.phase === 'memorize' && 'Phase 1 : Mémorisation de la Grille !'}
                {subState.phase === 'selection' && 'Phase 2 : Choisissez 5 cartes de mémoire sur mobile !'}
                {subState.phase === 'showdown' && 'Phase Finale : Dévoilement des Mains !'}
                {subState.phase === 'ended' && 'Partie Terminée !'}
              </span>
              {subState.phase === 'memorize' && (
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-600/20 border border-red-500/40 text-red-400 font-mono text-lg font-black animate-pulse">
                  <Clock className="w-4 h-4" /> {subState.revealTimeLeft}s restantes
                </div>
              )}
            </div>

            {/* Grille de cartes 4x4 */}
            <div className="grid grid-cols-4 gap-4 p-6 rounded-3xl bg-[#0E131C] border border-white/15 shadow-2xl">
              {(subState.grid || Array(16).fill(null)).map((card: any, idx: number) => {
                const isRevealed = Boolean(card);
                return (
                  <div
                    key={idx}
                    className={`w-24 h-32 md:w-28 md:h-36 rounded-2xl flex flex-col items-center justify-between p-3 border transition-all duration-500 ${
                      isRevealed
                        ? 'bg-gradient-to-br from-white to-slate-200 text-black border-white shadow-xl scale-100'
                        : 'bg-[#151B27] border-white/10 shadow-inner scale-95'
                    }`}
                  >
                    {isRevealed ? (
                      <>
                        <span className="text-xs font-black self-start font-mono">{card.display}</span>
                        <span className={`text-4xl ${card.suit === 'heart' || card.suit === 'diamond' ? 'text-red-600' : 'text-slate-900'}`}>
                          {card.suit === 'spade' && '♠'}
                          {card.suit === 'heart' && '♥'}
                          {card.suit === 'diamond' && '♦'}
                          {card.suit === 'club' && '♣'}
                        </span>
                        <span className="text-xs font-black self-end font-mono">{card.display}</span>
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="w-12 h-16 rounded-xl border border-white/20 bg-white/5 flex items-center justify-center font-mono text-sm font-bold text-white/30">
                          #{idx + 1}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Résultats du Showdown */}
            {subState.playerHands && Object.keys(subState.playerHands).length > 0 && (
              <div className="mt-8 flex flex-wrap gap-4 justify-center w-full">
                {Object.entries(subState.playerHands).map(([pid, hand]: [string, any]) => {
                  const player = room?.players.find(p => p.id === pid);
                  const isWinner = pid === subState.winnerId;
                  return (
                    <div
                      key={pid}
                      className={`p-4 rounded-2xl border flex items-center gap-4 ${
                        isWinner
                          ? 'bg-[#D4AF37]/20 border-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.4)]'
                          : 'bg-white/5 border-white/10'
                      }`}
                    >
                      <span className="text-2xl">{player?.avatar || '👤'}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">{player?.name}</span>
                          {isWinner && <span className="text-xs text-[#D4AF37] font-black">👑 VAINQUEUR</span>}
                        </div>
                        <span className="font-mono text-xs font-black text-[#D4AF37]">
                          {hand.handName}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* 2. FRAGMENTS OF MEMORY */}
        {/* ========================================================= */}
        {subGameId === 'fragments_of_memory' && (
          <div className="w-full max-w-4xl flex flex-col items-center">
            {subState.phase === 'observe' && (
              <div className="w-full flex flex-col items-center animate-fade-in">
                <div className="mb-4 inline-flex items-center gap-2 px-5 py-2 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 font-mono text-lg font-black animate-pulse">
                  <Clock className="w-5 h-5" /> Observation : {subState.observeTimeLeft}s
                </div>

                <div className="w-full p-8 rounded-3xl bg-gradient-to-br from-[#0F172A] to-[#020617] border border-cyan-500/30 shadow-[0_0_40px_rgba(6,182,212,0.15)] relative overflow-hidden">
                  <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">
                        {subState.scene?.theme}
                      </span>
                      <h3 className="text-2xl font-black font-display text-white">
                        {subState.scene?.title}
                      </h3>
                    </div>
                    <span className="text-xs text-white/50">{subState.scene?.description}</span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {subState.scene?.visualData && Object.entries(subState.scene.visualData).map(([key, val]: [string, any]) => (
                      <div key={key} className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
                        <span className="block text-[10px] text-white/40 uppercase font-bold mb-1">
                          {key.replace(/([A-Z])/g, ' $1')}
                        </span>
                        <span className="text-base font-black text-cyan-300 font-mono">{String(val)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {subState.phase === 'question' && (
              <div className="w-full flex flex-col items-center animate-fade-in">
                <div className="mb-4 inline-flex items-center gap-2 px-5 py-2 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 font-mono text-base font-black">
                  Question {subState.currentQuestionIndex + 1} / {subState.totalQuestions} • {subState.questionTimeLeft}s
                </div>

                <div className="w-full p-8 rounded-3xl bg-[#0E131C] border border-white/15 text-center mb-6">
                  <h3 className="text-2xl md:text-3xl font-black font-display text-white leading-snug">
                    {subState.currentQuestion?.text}
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-4 w-full">
                  {subState.currentQuestion?.options.map((opt: string, i: number) => (
                    <div
                      key={i}
                      className="p-5 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-4 text-left"
                    >
                      <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-black text-xs">
                        {String.fromCharCode(65 + i)}
                      </span>
                      <span className="font-bold text-white text-base">{opt}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* 3. SECRET NUMBER */}
        {/* ========================================================= */}
        {subGameId === 'secret_number' && (
          <div className="w-full max-w-3xl flex flex-col items-center">
            <div className="mb-6 text-center">
              <span className="text-xs font-black uppercase tracking-widest text-[#D4AF37] block mb-1">
                Tour Actif : {activeTurnPlayer?.name || 'En attente...'}
              </span>
              <p className="text-xs text-white/50">
                Formulez votre hypothèse ou achetez un indice secret sur votre manette
              </p>
            </div>

            {/* Registre des hypothèses passées */}
            <div className="w-full p-6 rounded-3xl bg-[#0E131C] border border-white/15 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
                <span className="text-xs font-black uppercase tracking-wider text-white/60">
                  Historique des Tentatives
                </span>
                <span className="text-xs text-[#D4AF37] font-semibold">
                  🟢 Strikes = Bien placé • 🟡 Balls = Mal placé
                </span>
              </div>

              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 scrollbar-none">
                {subState.history && subState.history.length > 0 ? (
                  subState.history.map((entry: any, i: number) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3.5 rounded-xl bg-white/5 border border-white/5"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-sm text-white">{entry.playerName}</span>
                        <span className="text-xs text-white/40">a deviné :</span>
                        <span className="font-mono text-lg font-black text-white px-2 py-0.5 rounded bg-white/10">
                          {entry.guess}
                        </span>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 font-mono text-xs font-bold">
                          {entry.strikes} Strike{entry.strikes > 1 ? 's' : ''}
                        </span>
                        <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-400 font-mono text-xs font-bold">
                          {entry.balls} Ball{entry.balls > 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 text-white/30 text-xs font-semibold">
                    Aucune tentative formulée pour le moment. En attente du premier coup...
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 4. THE VIRUS GAME */}
        {/* ========================================================= */}
        {subGameId === 'the_virus_game' && (
          <div className="w-full max-w-4xl flex flex-col items-center">
            <div className="mb-6 text-center">
              <span className={`text-xs font-black uppercase tracking-widest block mb-1 ${
                subState.phase === 'night' ? 'text-indigo-400' : 'text-emerald-400'
              }`}>
                {subState.phase === 'night' && '🌙 Phase de Nuit : Les contaminateurs et soignants agissent en secret...'}
                {subState.phase === 'day_discussion' && '☀️ Phase de Jour : Débattez pour identifier les porteurs du virus !'}
                {subState.phase === 'day_voting' && '🗳️ Phase de Vote : Votez sur mobile pour isoler un suspect !'}
                {subState.phase === 'quarantine_reveal' && '🚨 Délibération de Quarantaine !'}
              </span>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-white font-mono text-sm font-bold">
                <Clock className="w-4 h-4" /> {subState.timer}s
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full">
              {room?.players.map(p => {
                const isQuarantined = subState.quarantinedPlayers?.includes(p.id);
                return (
                  <div
                    key={p.id}
                    className={`p-6 rounded-2xl border text-center transition-all ${
                      isQuarantined
                        ? 'bg-red-950/30 border-red-500/40 opacity-60'
                        : 'bg-[#0E131C] border-white/15'
                    }`}
                  >
                    <span className="text-4xl block mb-2">{p.avatar || '👤'}</span>
                    <h4 className="font-bold text-white text-sm mb-1">{p.name}</h4>
                    {isQuarantined ? (
                      <span className="px-2 py-0.5 rounded bg-red-600/30 text-red-400 text-[10px] font-black uppercase tracking-wider">
                        En Quarantaine
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                        En Jeu
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 5. DOUBT AND BET */}
        {/* ========================================================= */}
        {subGameId === 'doubt_and_bet' && (
          <div className="w-full max-w-3xl flex flex-col items-center">
            <div className="mb-6 text-center">
              <span className="text-xs font-black uppercase tracking-widest text-[#D4AF37] block mb-1">
                Tour Actif : {activeTurnPlayer?.name || 'En attente...'}
              </span>
            </div>

            {/* Bannière de l'enchère active */}
            <div className="w-full p-8 rounded-3xl bg-gradient-to-r from-[#151A25] via-[#1A2232] to-[#151A25] border border-[#D4AF37]/40 shadow-2xl text-center mb-8">
              <span className="text-xs text-white/50 uppercase font-bold tracking-widest block mb-2">
                Enchère Courante sur la Table
              </span>

              {subState.currentBid ? (
                <div className="space-y-2">
                  <div className="text-4xl md:text-5xl font-black font-display text-white">
                    {subState.currentBid.quantity} Cartes {subState.currentBid.colorName}
                  </div>
                  <p className="text-xs text-[#D4AF37] font-semibold">
                    Annoncé par {subState.currentBid.playerName}
                  </p>
                </div>
              ) : (
                <div className="text-xl font-bold text-white/40">
                  En attente de la première enchère...
                </div>
              )}
            </div>

            {/* Alerte Doute */}
            {subState.phase === 'doubt_called' && (
              <div className="p-4 rounded-2xl bg-red-600/20 border border-red-500 text-red-400 text-center animate-bounce font-black text-xl tracking-wider">
                🚨 {subState.callerName} A CRIÉ « DOUTE ! » — VÉRIFICATION EN COURS !
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* 6. EQUATION PYRAMID */}
        {/* ========================================================= */}
        {subGameId === 'equation_pyramid' && (
          <div className="w-full max-w-3xl flex flex-col items-center">
            <div className="mb-6 text-center">
              <span className="text-xs font-black uppercase tracking-widest text-pink-400 block mb-1">
                Objectif Céleste : Atteindre le sommet !
              </span>
              <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-pink-500/20 border border-pink-400/40 text-pink-300 font-mono text-2xl font-black">
                Sommet Cible : {subState.targetSum}
              </div>
            </div>

            <div className="flex flex-col items-center gap-4 p-8 rounded-3xl bg-[#0E131C] border border-white/15">
              {/* Étage 1 : Sommet */}
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-3xl font-black font-mono shadow-xl">
                {subState.targetSum}
              </div>

              {/* Étage 2 : Milieu */}
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center font-mono text-xl font-bold">
                  ?
                </div>
                <div className="w-20 h-20 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center font-mono text-xl font-bold">
                  ?
                </div>
              </div>

              {/* Étage 3 : Base */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-mono text-lg font-bold">
                  ?
                </div>
                <div className="w-16 h-16 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-mono text-lg font-bold">
                  ?
                </div>
                <div className="w-16 h-16 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-mono text-lg font-bold">
                  ?
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 7. KNIGHT'S TOUR */}
        {/* ========================================================= */}
        {subGameId === 'knights_tour' && (
          <div className="flex flex-col items-center">
            <div className="mb-4 text-center">
              <span className="text-xs font-black uppercase tracking-widest text-[#D4AF37] block mb-1">
                Tour Actif : {activeTurnPlayer?.name || 'En attente...'}
              </span>
              <p className="text-xs text-white/50">
                Déplacez le Cavalier royal en "L". Évitez de vous faire piéger !
              </p>
            </div>

            <div className="p-4 rounded-3xl bg-[#0E131C] border border-white/20 shadow-2xl">
              <div
                className="grid gap-2"
                style={{ gridTemplateColumns: `repeat(${subState.boardSize || 5}, minmax(0, 1fr))` }}
              >
                {(subState.visited || []).map((row: boolean[], rIdx: number) =>
                  row.map((isVisited: boolean, cIdx: number) => {
                    const isKnight = subState.currentPosition?.row === rIdx && subState.currentPosition?.col === cIdx;
                    const isValidMove = (subState.validMoves || []).some((m: any) => m.row === rIdx && m.col === cIdx);

                    return (
                      <div
                        key={`${rIdx}-${cIdx}`}
                        className={`w-14 h-14 md:w-16 md:h-16 rounded-xl border flex items-center justify-center text-xl font-black transition-all ${
                          isKnight
                            ? 'bg-[#D4AF37] text-black border-white shadow-[0_0_20px_rgba(212,175,55,0.6)] scale-105'
                            : isVisited
                            ? 'bg-slate-900 border-white/5 text-white/20'
                            : isValidMove
                            ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-400 animate-pulse'
                            : 'bg-white/5 border-white/10'
                        }`}
                      >
                        {isKnight ? '♞' : isVisited ? '✕' : ''}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 8. NINE MEN'S MORRIS */}
        {/* ========================================================= */}
        {subGameId === 'nine_mens_morris' && (
          <div className="flex flex-col items-center">
            <div className="mb-4 text-center">
              <div className="flex items-center gap-3 justify-center mb-1">
                <span className={`w-3.5 h-3.5 rounded-full ${
                  subState.turnColor === 'white' ? 'bg-white shadow-[0_0_10px_white]' : 'bg-slate-800 border border-white/40'
                }`} />
                <span className="text-xs font-black uppercase tracking-widest text-[#D4AF37]">
                  Tour des {subState.turnColor === 'white' ? 'Blancs' : 'Noirs'} ({activeTurnPlayer?.name})
                </span>
              </div>
              <p className="text-xs text-white/50">
                Phase : {subState.phase === 'placement' ? 'Pose des 9 pions' : subState.phase === 'movement' ? 'Déplacement' : 'Vol libre'}
                {subState.mustRemovePiece && ' • ⚔️ MOULIN ! Capturez un pion adverse !'}
              </p>
            </div>

            {/* Plateau 24 intersections classique */}
            <div className="relative w-[340px] h-[340px] md:w-[420px] md:h-[420px] rounded-3xl bg-[#0E131C] border border-white/20 p-6 shadow-2xl flex items-center justify-center">
              {/* Carré Extérieur */}
              <div className="absolute inset-8 border-2 border-white/30 rounded-lg pointer-events-none" />
              {/* Carré Intermédiaire */}
              <div className="absolute inset-16 md:inset-20 border-2 border-white/30 rounded-lg pointer-events-none" />
              {/* Carré Intérieur */}
              <div className="absolute inset-24 md:inset-32 border-2 border-white/30 rounded-lg pointer-events-none" />

              {/* Lignes transversales (haut, bas, gauche, droite) */}
              <div className="absolute top-8 bottom-8 left-1/2 w-0.5 bg-white/30 -translate-x-1/2 pointer-events-none" />
              <div className="absolute left-8 right-8 top-1/2 h-0.5 bg-white/30 -translate-y-1/2 pointer-events-none" />
              {/* Masque central */}
              <div className="absolute inset-28 md:inset-36 bg-[#0E131C] z-0" />

              {/* Les 24 intersections */}
              <div className="relative z-10 w-full h-full">
                {(subState.board || Array(24).fill(null)).map((color: any, idx: number) => {
                  return (
                    <div
                      key={idx}
                      className={`absolute w-7 h-7 md:w-8 md:h-8 rounded-full -translate-x-1/2 -translate-y-1/2 flex items-center justify-center border transition-all ${
                        color === 'white'
                          ? 'bg-white border-slate-300 shadow-[0_0_12px_rgba(255,255,255,0.8)]'
                          : color === 'black'
                          ? 'bg-slate-900 border-white/40 shadow-inner'
                          : 'bg-[#151B27] border-white/20 hover:border-white/60'
                      }`}
                      style={getMorrisCoordinates(idx)}
                    >
                      <span className="text-[9px] font-mono text-white/30">{idx}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* FOOTER & RACCOURCIS TÉLÉCOMMANDE TV */}
      <footer className="relative z-10 flex items-center justify-between pt-4 border-t border-white/10 text-xs text-white/60">
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-600 font-bold" />
            <strong className="text-white">Rouge</strong> : Quitter / Abandonner
          </span>
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 font-bold" />
            <strong className="text-white">Vert</strong> : Doute / Action
          </span>
        </div>

        <span className="text-xs text-white/40 font-semibold">
          MOOD ARENA • Synchronisation Manette Temps Réel 60 FPS
        </span>
      </footer>
    </div>
  );
};

// Coordonnées pour placer les 24 intersections du Moulin en pourcentage
function getMorrisCoordinates(idx: number): React.CSSProperties {
  const coords: Record<number, { top: string; left: string }> = {
    // Extérieur
    0: { top: '0%', left: '0%' },
    1: { top: '0%', left: '50%' },
    2: { top: '0%', left: '100%' },
    3: { top: '50%', left: '100%' },
    4: { top: '100%', left: '100%' },
    5: { top: '100%', left: '50%' },
    6: { top: '100%', left: '0%' },
    7: { top: '50%', left: '0%' },

    // Milieu
    8: { top: '16.6%', left: '16.6%' },
    9: { top: '16.6%', left: '50%' },
    10: { top: '16.6%', left: '83.3%' },
    11: { top: '50%', left: '83.3%' },
    12: { top: '83.3%', left: '83.3%' },
    13: { top: '83.3%', left: '50%' },
    14: { top: '83.3%', left: '16.6%' },
    15: { top: '50%', left: '16.6%' },

    // Intérieur
    16: { top: '33.3%', left: '33.3%' },
    17: { top: '33.3%', left: '50%' },
    18: { top: '33.3%', left: '66.6%' },
    19: { top: '50%', left: '66.6%' },
    20: { top: '66.6%', left: '66.6%' },
    21: { top: '66.6%', left: '50%' },
    22: { top: '66.6%', left: '33.3%' },
    23: { top: '50%', left: '33.3%' },
  };

  return coords[idx] || { top: '50%', left: '50%' };
}
