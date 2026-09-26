import React, { useEffect, useRef } from 'react';
import { useGame } from '../../context/GameContext';
import { NavalBattleGameState } from '../../types/game';
import { audio } from '../../services/audio';
import { Trophy, Shield, Crosshair, Flame, Waves, Skull, Anchor, CheckCircle2 } from 'lucide-react';

const ROWS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
const COLS = [1, 2, 3, 4, 5, 6, 7, 8];

export const NavalBattleBoardTV: React.FC = () => {
  const { room } = useGame();
  const gameState = room?.gameState as NavalBattleGameState | null;

  const phase = gameState?.phase || 'placement';
  const p1 = gameState?.p1;
  const p2 = gameState?.p2;
  const turnPlayerId = gameState?.turnPlayerId || '';
  const lastShot = gameState?.lastShot || null;
  const isGameOver = Boolean(gameState?.isGameOver);
  const podium = gameState?.finalPodium || null;

  const prevLastShotRef = useRef(lastShot);

  // Play audio on missile impact
  useEffect(() => {
    if (lastShot && lastShot !== prevLastShotRef.current) {
      prevLastShotRef.current = lastShot;
      if (lastShot.result === 'sunk') {
        audio.playCustomBuzzer('airhorn');
      } else if (lastShot.result === 'hit') {
        audio.playCustomBuzzer('laser');
      } else {
        audio.playCustomBuzzer('bell');
      }
    }
  }, [lastShot]);

  // VICTORY PODIUM
  if (isGameOver && podium) {
    const winner = podium[0];
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-gradient-to-br from-slate-950 via-blue-950/60 to-slate-950 text-white select-none">
        <div className="relative flex flex-col items-center max-w-4xl w-full bg-slate-900/80 border-2 border-amber-500/40 rounded-3xl p-10 shadow-2xl backdrop-blur-xl">
          <div className="w-24 h-24 rounded-full bg-amber-500/20 border-4 border-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/30 mb-4 animate-bounce">
            <Trophy className="w-12 h-12 text-amber-300" />
          </div>

          <span className="text-amber-400 font-black tracking-widest text-sm uppercase">
            ⚓ VICTOIRE NAVALE
          </span>
          <h1 className="text-5xl font-black font-display text-white mt-1 mb-6 text-center drop-shadow-lg">
            {winner?.name} CONQUIERT LES MERS !
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-xl mt-4">
            {podium.map((p, idx) => (
              <div
                key={p.id}
                className={`flex flex-col items-center p-6 rounded-2xl border-2 ${
                  idx === 0
                    ? 'border-amber-400 bg-amber-500/10 shadow-amber-500/30'
                    : 'border-slate-700 bg-slate-800/40'
                } shadow-xl`}
              >
                <span className="text-3xl mb-2">{idx === 0 ? '👑 AMIRAL EN CHEF' : '🥈 VAINCU'}</span>
                <div className="w-16 h-16 rounded-full bg-slate-800 border-2 border-white/20 flex items-center justify-center text-3xl mb-2">
                  {p.avatar || '⚓'}
                </div>
                <span className="font-bold text-2xl text-white truncate max-w-full">
                  {p.name}
                </span>
                <span className="text-base font-semibold text-emerald-400 mt-1">
                  {p.score} points
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // PLACEMENT PHASE
  if (phase === 'placement') {
    return (
      <div className="w-full h-full flex flex-col items-center justify-between p-10 bg-slate-950 text-white select-none">
        <div className="flex flex-col items-center text-center mt-8">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-3xl mb-3 shadow-lg shadow-cyan-500/20">
            🚢
          </div>
          <h1 className="text-4xl font-black font-display tracking-wider text-white">
            BATAILLE NAVALE LIVE
          </h1>
          <p className="text-cyan-400 text-sm font-semibold uppercase tracking-widest mt-1">
            Déploiement secret des flottes en cours
          </p>
        </div>

        {/* Both Admirals Preparation Status */}
        <div className="grid grid-cols-2 gap-8 w-full max-w-4xl my-auto">
          {/* Admiral 1 Card */}
          <div className={`flex flex-col items-center p-8 rounded-3xl border-2 backdrop-blur-md transition-all ${
            p1?.ready
              ? 'border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/20'
              : 'border-cyan-500/40 bg-slate-900/80 animate-pulse'
          }`}>
            <div className="w-20 h-20 rounded-full bg-slate-800 border-2 border-white/20 flex items-center justify-center text-4xl mb-3">
              {p1?.avatar || '⚓'}
            </div>
            <h3 className="text-2xl font-black font-display text-white">{p1?.name}</h3>
            <span className="text-xs uppercase tracking-widest text-gray-400 font-semibold mt-1">
              Flotte Alpha
            </span>
            <div className="mt-6 flex items-center gap-2">
              {p1?.ready ? (
                <div className="flex items-center gap-2 text-emerald-400 font-bold bg-emerald-500/20 px-4 py-2 rounded-xl border border-emerald-500/40">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>FLOTTE PRÊTE AU COMBAT</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-amber-300 font-bold bg-amber-500/10 px-4 py-2 rounded-xl border border-amber-500/30">
                  <Crosshair className="w-5 h-5 animate-spin" />
                  <span>Placement sur smartphone...</span>
                </div>
              )}
            </div>
          </div>

          {/* Admiral 2 Card */}
          <div className={`flex flex-col items-center p-8 rounded-3xl border-2 backdrop-blur-md transition-all ${
            p2?.ready
              ? 'border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/20'
              : 'border-red-500/40 bg-slate-900/80 animate-pulse'
          }`}>
            <div className="w-20 h-20 rounded-full bg-slate-800 border-2 border-white/20 flex items-center justify-center text-4xl mb-3">
              {p2?.avatar || '⚓'}
            </div>
            <h3 className="text-2xl font-black font-display text-white">{p2?.name}</h3>
            <span className="text-xs uppercase tracking-widest text-gray-400 font-semibold mt-1">
              Flotte Bravo
            </span>
            <div className="mt-6 flex items-center gap-2">
              {p2?.ready ? (
                <div className="flex items-center gap-2 text-emerald-400 font-bold bg-emerald-500/20 px-4 py-2 rounded-xl border border-emerald-500/40">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>FLOTTE PRÊTE AU COMBAT</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-amber-300 font-bold bg-amber-500/10 px-4 py-2 rounded-xl border border-amber-500/30">
                  <Crosshair className="w-5 h-5 animate-spin" />
                  <span>Placement sur smartphone...</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="text-xs text-gray-500 pb-4">
          Positionnez vos 4 navires sur votre mobile ou choisissez le placement automatique.
        </div>
      </div>
    );
  }

  // BATTLE PHASE: SATELLITE RADAR VIEW
  const renderRadarGrid = (player: typeof p1, isTargetOfTurn: boolean) => {
    if (!player) return null;

    return (
      <div className={`flex flex-col items-center p-5 rounded-3xl border-2 backdrop-blur-md transition-all ${
        isTargetOfTurn
          ? 'border-red-500 bg-red-950/20 shadow-2xl shadow-red-500/20'
          : 'border-cyan-500/30 bg-slate-900/70'
      }`}>
        {/* Admiral Header */}
        <div className="flex items-center justify-between w-full mb-3 px-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/20 flex items-center justify-center text-xl">
              {player.avatar || '⚓'}
            </div>
            <div>
              <span className="font-bold text-lg text-white font-display block leading-tight">
                {player.name}
              </span>
              <span className="text-[11px] font-semibold text-emerald-400">
                Score : {player.score} pts
              </span>
            </div>
          </div>
          {isTargetOfTurn && (
            <span className="text-[11px] font-black uppercase tracking-wider text-red-400 bg-red-500/20 border border-red-500/40 px-2.5 py-1 rounded-lg animate-pulse">
              🎯 Cible active
            </span>
          )}
        </div>

        {/* 8x8 Grid */}
        <div className="bg-slate-950/90 border border-cyan-500/40 rounded-2xl p-2 shadow-inner">
          {/* Column labels 1-8 */}
          <div className="grid grid-cols-9 gap-1 text-center mb-1">
            <span className="text-[10px] font-bold text-cyan-400"></span>
            {COLS.map((c) => (
              <span key={c} className="text-[11px] font-mono font-bold text-cyan-400 w-8">
                {c}
              </span>
            ))}
          </div>

          {/* Rows A-H */}
          {ROWS.map((r) => (
            <div key={r} className="grid grid-cols-9 gap-1 items-center mb-1">
              <span className="text-[11px] font-mono font-bold text-cyan-400 text-center w-5">
                {r}
              </span>
              {COLS.map((c) => {
                const coord = `${r}${c}`;
                const shotState = player.shotsReceived[coord]; // 'hit' | 'miss' | undefined
                const isLastFired = lastShot?.coord === coord;

                return (
                  <div
                    key={coord}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center border text-xs font-bold transition-all ${
                      shotState === 'hit'
                        ? 'bg-red-600/80 border-red-400 text-white shadow-md shadow-red-500/50 animate-pulse'
                        : shotState === 'miss'
                        ? 'bg-blue-900/40 border-blue-500/30 text-cyan-300'
                        : 'bg-slate-900/80 border-cyan-900/50 hover:border-cyan-500/50'
                    } ${isLastFired ? 'ring-2 ring-amber-400 scale-110 z-10' : ''}`}
                  >
                    {shotState === 'hit' ? (
                      <Flame className="w-4 h-4 text-amber-300 fill-amber-300" />
                    ) : shotState === 'miss' ? (
                      <Waves className="w-3.5 h-3.5 text-cyan-400 opacity-60" />
                    ) : null}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Sunk Ships Badges */}
        <div className="w-full mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
          <span className="text-gray-400 font-semibold">Navires coulés :</span>
          <div className="flex items-center gap-1.5">
            {player.sunkShips.length === 0 ? (
              <span className="text-gray-500 italic">Aucun navire coulé</span>
            ) : (
              player.sunkShips.map((name, i) => (
                <span
                  key={i}
                  className="bg-red-950/80 border border-red-500/40 text-red-300 text-[10px] font-bold px-2 py-0.5 rounded"
                >
                  💥 {name}
                </span>
              ))
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full h-full flex flex-col justify-between p-6 bg-slate-950 text-white select-none relative overflow-hidden">
      {/* Background Satellite Radar Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* TOP BAR: Turn Announcement & Battle Banner */}
      <div className="relative z-10 flex items-center justify-between bg-slate-900/80 border border-cyan-500/30 rounded-2xl px-8 py-3.5 backdrop-blur-md shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-xl">
            ⚓
          </div>
          <div>
            <h1 className="font-display font-black text-xl tracking-wider text-white">
              BATAILLE NAVALE LIVE
            </h1>
            <span className="text-xs text-cyan-300 font-semibold uppercase tracking-wider">
              Guerre tactique en haute mer
            </span>
          </div>
        </div>

        {/* Turn Commander Spotlight */}
        <div className="flex items-center gap-3 bg-red-950/60 border border-red-500/40 px-6 py-2 rounded-xl shadow-lg">
          <Crosshair className="w-5 h-5 text-red-400 animate-spin" />
          <span className="text-xs uppercase font-bold text-gray-300">Ordre de tir :</span>
          <span className="text-lg font-black font-display text-white">
            {gameState?.turnPlayerName}
          </span>
        </div>
      </div>

      {/* CENTER MISSILE IMPACT BANNER */}
      {lastShot && (
        <div className="relative z-10 flex items-center justify-center my-2">
          <div
            className={`flex items-center gap-3 px-8 py-2.5 rounded-2xl border-2 shadow-2xl backdrop-blur-xl animate-fade-in ${
              lastShot.result === 'sunk'
                ? 'bg-red-600/90 border-amber-400 text-white'
                : lastShot.result === 'hit'
                ? 'bg-amber-600/80 border-red-400 text-white'
                : 'bg-blue-900/70 border-cyan-400 text-cyan-200'
            }`}
          >
            {lastShot.result === 'sunk' ? (
              <>
                <Skull className="w-6 h-6 text-amber-300 animate-bounce" />
                <span className="font-display font-black text-lg">
                  💥 IMPACT EN {lastShot.coord} : TOUCHÉ ET COULÉ ! ({lastShot.sunkShipName})
                </span>
              </>
            ) : lastShot.result === 'hit' ? (
              <>
                <Flame className="w-6 h-6 text-amber-300 animate-pulse" />
                <span className="font-display font-black text-lg">
                  🔥 IMPACT EN {lastShot.coord} : TOUCHÉ !
                </span>
              </>
            ) : (
              <>
                <Waves className="w-6 h-6 text-cyan-300" />
                <span className="font-display font-black text-lg">
                  💦 TIR EN {lastShot.coord} : À L'EAU !
                </span>
              </>
            )}
          </div>
        </div>
      )}

      {/* RADAR GRIDS ARENA */}
      <div className="relative z-10 grid grid-cols-2 gap-8 w-full max-w-6xl mx-auto my-auto items-center">
        {/* Waters of Admiral 1 (Attacked when P2 shoots) */}
        {renderRadarGrid(p1, turnPlayerId === p2?.id)}

        {/* Waters of Admiral 2 (Attacked when P1 shoots) */}
        {renderRadarGrid(p2, turnPlayerId === p1?.id)}
      </div>

      {/* FOOTER */}
      <div className="relative z-10 flex items-center justify-between text-xs text-gray-500 pt-2 px-4">
        <span>Légende : 🔥 = Navire touché • 💦 = Tir à l'eau</span>
        <span>Visez les coordonnées adverses depuis votre smartphone</span>
      </div>
    </div>
  );
};
