import React, { useState, useMemo } from 'react';
import { useGame } from '../../../context/GameContext';
import { NavalBattleGameState } from '../../../types/game';
import { audio } from '../../../services/audio';
import { triggerHaptic, hapticPatterns } from '../../components/HapticFeedback';
import { Crosshair, Shield, Flame, Waves, Trophy, Zap, Lock, Eye, AlertCircle } from 'lucide-react';

const ROWS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
const COLS = [1, 2, 3, 4, 5, 6, 7, 8];

export const NavalBattleController: React.FC = () => {
  const { room, localPlayer, sendGameAction } = useGame();
  const [selectedCoord, setSelectedCoord] = useState<string | null>(null);
  const [showMyFleet, setShowMyFleet] = useState(false);

  const gameState = room?.gameState as NavalBattleGameState | null;

  const phase = gameState?.phase || 'placement';
  const myId = localPlayer?.id || '';
  const isP1 = gameState?.p1?.id === myId;
  const isP2 = gameState?.p2?.id === myId;
  const myRole = isP1 ? 'p1' : isP2 ? 'p2' : 'spectator';

  const myState = isP1 ? gameState?.p1 : gameState?.p2;
  const opponentState = isP1 ? gameState?.p2 : gameState?.p1;

  const isMyTurn = gameState?.turnPlayerId === myId && phase === 'battle';
  const isGameOver = Boolean(gameState?.isGameOver);
  const podium = gameState?.finalPodium || null;

  // Auto-placement trigger
  const handleAutoPlace = () => {
    triggerHaptic(hapticPatterns.success);
    audio.playSelect();
    sendGameAction('nb_auto_place', {});
  };

  // Cell selection on enemy radar
  const handleSelectCell = (coord: string) => {
    if (!isMyTurn) return;
    if (opponentState?.shotsReceived[coord]) return; // already fired

    triggerHaptic(hapticPatterns.tap);
    audio.playSelect();
    setSelectedCoord(coord);
  };

  // Fire missile
  const handleFire = () => {
    if (!isMyTurn || !selectedCoord) return;

    triggerHaptic(hapticPatterns.success);
    audio.playCustomBuzzer('laser');

    sendGameAction('nb_fire', { coord: selectedCoord });
    setSelectedCoord(null);
  };

  // GAMEOVER VIEW
  if (isGameOver && podium) {
    const winner = podium[0];
    const isWinner = winner.id === myId;

    return (
      <div className="flex flex-col items-center justify-between min-h-screen bg-slate-950 text-white p-6 select-none">
        <div className="flex flex-col items-center text-center mt-12">
          <div className="w-20 h-20 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center mb-4">
            <Trophy className="w-10 h-10 text-amber-300 animate-bounce" />
          </div>
          <span className="text-amber-400 font-black uppercase tracking-widest text-xs">
            FIN DE LA BATAILLE
          </span>
          <h1 className="text-3xl font-black font-display text-white mt-1">
            {isWinner ? 'VICTOIRE NAVALE ! 👑' : 'DÉFAITE NAVALE... ⚓'}
          </h1>
          <p className="text-sm text-gray-400 mt-2">
            {isWinner
              ? 'Toute la flotte ennemie a été envoyée par le fond !'
              : 'Tous tes navires ont été détruits au combat.'}
          </p>
        </div>

        <div className="w-full bg-slate-900 border border-white/10 rounded-2xl p-5 my-auto space-y-3">
          <span className="text-xs uppercase tracking-wider text-gray-400 font-bold block text-center">
            Tableau d'Honneur
          </span>
          {podium.map((p) => (
            <div
              key={p.id}
              className={`flex items-center justify-between p-3.5 rounded-xl border ${
                p.id === myId
                  ? 'border-amber-400 bg-amber-500/10'
                  : 'border-white/10 bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{p.avatar || '⚓'}</span>
                <div>
                  <span className="font-bold text-white block">{p.name}</span>
                  <span className="text-xs text-gray-400">
                    {p.isWinner ? 'Amiral Victorieux' : 'Commandant'}
                  </span>
                </div>
              </div>
              <span className="font-mono font-bold text-emerald-400">
                {p.score} pts
              </span>
            </div>
          ))}
        </div>

        <div className="w-full text-center text-xs text-gray-500 pb-4">
          Regarde la Smart TV pour célébrer l'amiral victorieux !
        </div>
      </div>
    );
  }

  // PLACEMENT PHASE VIEW
  if (phase === 'placement') {
    return (
      <div className="flex flex-col justify-between min-h-screen bg-slate-950 text-white p-6 select-none">
        <div className="flex flex-col items-center text-center mt-6">
          <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-3xl mb-3 shadow-lg shadow-cyan-500/20">
            🚢
          </div>
          <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">
            Phase 1 / 2
          </span>
          <h2 className="text-2xl font-black font-display text-white mt-1">
            Déploie ta flotte secrète
          </h2>
          <p className="text-xs text-gray-400 mt-1 max-w-xs">
            4 navires de guerre prêts à être postés sur ton quadrillage 8x8.
          </p>
        </div>

        {/* Fleet Roster */}
        <div className="bg-slate-900 border border-white/10 rounded-2xl p-4 my-auto space-y-2">
          <span className="text-xs uppercase font-bold text-gray-400 block mb-2 text-center">
            Tes Unités Navales
          </span>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2 bg-white/5 border border-white/5 p-2.5 rounded-xl">
              <span className="text-lg">🚢</span>
              <div>
                <strong className="block text-white">Porte-avions</strong>
                <span className="text-cyan-400">4 cases</span>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white/5 border border-white/5 p-2.5 rounded-xl">
              <span className="text-lg">🛥️</span>
              <div>
                <strong className="block text-white">Croiseur</strong>
                <span className="text-cyan-400">3 cases</span>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white/5 border border-white/5 p-2.5 rounded-xl">
              <span className="text-lg">🚤</span>
              <div>
                <strong className="block text-white">Torpilleur</strong>
                <span className="text-cyan-400">2 cases</span>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white/5 border border-white/5 p-2.5 rounded-xl">
              <span className="text-lg">⚓</span>
              <div>
                <strong className="block text-white">Sous-marin</strong>
                <span className="text-cyan-400">2 cases</span>
              </div>
            </div>
          </div>

          {/* If already ready */}
          {myState?.ready ? (
            <div className="mt-4 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-center">
              <span className="text-sm font-bold text-emerald-400 block mb-1">
                ✅ Flotte verrouillée !
              </span>
              <span className="text-xs text-gray-400">
                En attente du second amiral...
              </span>
            </div>
          ) : (
            <div className="mt-4 space-y-2">
              <button
                onClick={handleAutoPlace}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black font-display uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 active:scale-95 transition-all"
              >
                <Zap className="w-5 h-5" />
                <span>⚡ DÉPLOIEMENT RAPIDE</span>
              </button>
            </div>
          )}
        </div>

        <div className="w-full text-center text-xs text-gray-500 pb-2">
          Le placement est 100% confidentiel sur ton écran.
        </div>
      </div>
    );
  }

  // BATTLE CONTROLLER
  return (
    <div className="flex flex-col justify-between min-h-screen bg-slate-950 text-white p-4 select-none">
      {/* HEADER: Status & Toggle My Fleet */}
      <div className="flex items-center justify-between bg-slate-900/90 border border-white/10 rounded-2xl px-4 py-2.5">
        <div>
          <span className="text-[10px] uppercase font-bold text-cyan-400 block">
            {isMyTurn ? '🎯 À TOI DE TIRER' : '⏳ TIR ENNEMI EN COURS'}
          </span>
          <span className="text-sm font-black font-display text-white">
            {isMyTurn ? 'Choisis ta cible' : `Attente de ${gameState?.turnPlayerName}`}
          </span>
        </div>

        <button
          onClick={() => setShowMyFleet(!showMyFleet)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
            showMyFleet
              ? 'border-cyan-400 bg-cyan-500/20 text-cyan-300'
              : 'border-white/10 bg-white/5 text-gray-400'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>{showMyFleet ? 'Radar Ennemi' : 'Ma Flotte'}</span>
        </button>
      </div>

      {/* CENTER VIEW: EITHER ENEMY RADAR TARGETING OR OWN FLEET */}
      <div className="my-auto flex flex-col items-center">
        {showMyFleet ? (
          /* MY PRIVATE FLEET VIEW */
          <div className="w-full max-w-sm bg-slate-900/90 border border-cyan-500/30 rounded-3xl p-4 text-center">
            <span className="text-xs uppercase font-bold text-cyan-400 block mb-2">
              Statut de ta flotte
            </span>
            <div className="grid grid-cols-9 gap-1 mx-auto w-fit">
              <span className="w-7 h-7"></span>
              {COLS.map((c) => (
                <span key={c} className="w-7 h-7 text-[11px] font-mono font-bold text-cyan-400 flex items-center justify-center">
                  {c}
                </span>
              ))}
              {ROWS.map((r) => (
                <React.Fragment key={r}>
                  <span className="w-7 h-7 text-[11px] font-mono font-bold text-cyan-400 flex items-center justify-center">
                    {r}
                  </span>
                  {COLS.map((c) => {
                    const coord = `${r}${c}`;
                    const hasMyShip = myState?.ships?.some((s) => s.coordinates.includes(coord));
                    const shotOnMe = myState?.shotsReceived[coord]; // 'hit' | 'miss'

                    return (
                      <div
                        key={coord}
                        className={`w-7 h-7 rounded flex items-center justify-center border text-[10px] font-bold ${
                          shotOnMe === 'hit'
                            ? 'bg-red-600 border-red-400 text-white animate-pulse'
                            : shotOnMe === 'miss'
                            ? 'bg-blue-900/50 border-blue-500/30 text-cyan-300'
                            : hasMyShip
                            ? 'bg-cyan-700/80 border-cyan-400 text-white'
                            : 'bg-slate-950 border-white/5'
                        }`}
                      >
                        {shotOnMe === 'hit' ? (
                          <Flame className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                        ) : shotOnMe === 'miss' ? (
                          '•'
                        ) : hasMyShip ? (
                          '⚓'
                        ) : null}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
            <span className="text-[11px] text-gray-400 mt-3 block">
              Bleu = Tes navires • Rouge = Dégâts subis
            </span>
          </div>
        ) : (
          /* ENEMY TARGETING RADAR */
          <div className="w-full max-w-sm flex flex-col items-center">
            {/* Target coord badge */}
            <div className="mb-2 flex items-center gap-2">
              <span className="text-xs uppercase font-bold text-gray-400">Coordonnée :</span>
              <span className="text-xl font-mono font-black text-amber-300 bg-white/5 border border-white/10 px-3 py-0.5 rounded-lg">
                {selectedCoord || '--'}
              </span>
            </div>

            {/* Radar Grid */}
            <div className="bg-slate-900/90 border border-cyan-500/30 rounded-3xl p-3 shadow-xl">
              <div className="grid grid-cols-9 gap-1">
                <span className="w-8 h-8"></span>
                {COLS.map((c) => (
                  <span key={c} className="w-8 h-8 text-xs font-mono font-bold text-cyan-400 flex items-center justify-center">
                    {c}
                  </span>
                ))}
                {ROWS.map((r) => (
                  <React.Fragment key={r}>
                    <span className="w-8 h-8 text-xs font-mono font-bold text-cyan-400 flex items-center justify-center">
                      {r}
                    </span>
                    {COLS.map((c) => {
                      const coord = `${r}${c}`;
                      const shotState = opponentState?.shotsReceived[coord]; // 'hit' | 'miss'
                      const isSelected = selectedCoord === coord;

                      return (
                        <button
                          key={coord}
                          onClick={() => handleSelectCell(coord)}
                          disabled={!isMyTurn || Boolean(shotState)}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center border font-bold transition-all ${
                            isSelected
                              ? 'bg-amber-500 border-amber-300 text-black shadow-lg shadow-amber-500/50 scale-105'
                              : shotState === 'hit'
                              ? 'bg-red-600 border-red-400 text-white cursor-not-allowed opacity-90'
                              : shotState === 'miss'
                              ? 'bg-blue-900/40 border-blue-500/30 text-cyan-400 cursor-not-allowed opacity-50'
                              : isMyTurn
                              ? 'bg-slate-800/80 border-cyan-900/60 hover:border-cyan-400 active:scale-95'
                              : 'bg-slate-900/60 border-white/5 opacity-50 cursor-not-allowed'
                          }`}
                        >
                          {shotState === 'hit' ? (
                            <Flame className="w-4 h-4 text-amber-300 fill-amber-300" />
                          ) : shotState === 'miss' ? (
                            <Waves className="w-3.5 h-3.5 text-cyan-400" />
                          ) : isSelected ? (
                            <Crosshair className="w-4 h-4 animate-spin text-black" />
                          ) : null}
                        </button>
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* FOOTER: FIRE BUTTON */}
      <div className="w-full space-y-2">
        <button
          onClick={handleFire}
          disabled={!isMyTurn || !selectedCoord}
          className={`w-full py-4 rounded-2xl font-black font-display text-lg uppercase tracking-wider flex items-center justify-center gap-2 shadow-2xl transition-all ${
            isMyTurn && selectedCoord
              ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-red-500/40 active:scale-95'
              : 'bg-slate-900 text-gray-500 border border-white/5 cursor-not-allowed'
          }`}
        >
          <Crosshair className="w-5 h-5" />
          <span>
            {selectedCoord
              ? `🚀 FAIRE FEU SUR ${selectedCoord} !`
              : isMyTurn
              ? 'Sélectionne une case sur la grille'
              : "Attente du tour de l'amiral..."}
          </span>
        </button>

        <div className="flex items-center justify-between text-[11px] text-gray-500 px-2">
          <span>Ton score : {myState?.score ?? 0} pts</span>
          <span>Amiral adverse : {opponentState?.score ?? 0} pts</span>
        </div>
      </div>
    </div>
  );
};
