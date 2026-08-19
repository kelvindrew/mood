import React, { useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { InterGameState, PlayingCard, StandardSuit } from '../../types/game';
import { Clock, Shield, RotateCw, RotateCcw, Zap, Sparkles, Trophy, AlertTriangle, Target, Flame } from 'lucide-react';
import { audio } from '../../services/audio';

const SUIT_CONFIG: Record<StandardSuit, { symbol: string; name: string; color: string; bg: string }> = {
  spades: { symbol: '♠', name: 'Pique', color: 'text-gray-900', bg: 'bg-slate-900' },
  hearts: { symbol: '♥', name: 'Cœur', color: 'text-rose-600', bg: 'bg-rose-950' },
  diamonds: { symbol: '♦', name: 'Carreau', color: 'text-rose-600', bg: 'bg-rose-950' },
  clubs: { symbol: '♣', name: 'Trèfle', color: 'text-gray-900', bg: 'bg-slate-900' },
};

export const InterBoardTV: React.FC = () => {
  const { room } = useGame();
  const gameState = room?.gameState as InterGameState | undefined;

  useEffect(() => {
    if (gameState?.lastSpecialEffect) {
      audio.playSelect();
    }
  }, [gameState?.lastSpecialEffect?.message]);

  if (!gameState) {
    return <div className="p-10 text-white">Chargement de la table Inter...</div>;
  }

  const currentTurnPlayer = room?.players.find((p) => p.id === gameState.currentTurnPlayerId);
  const suitCfg = SUIT_CONFIG[gameState.currentSuit] || SUIT_CONFIG.spades;

  return (
    <div className="relative w-full h-full flex flex-col justify-between px-10 py-4 select-none overflow-hidden">
      {/* Top Bar: Title, Direction of Play, Penalty Counter and Timer */}
      <div className="flex items-center justify-between z-20 border-b border-white/10 pb-3">
        <div className="flex items-center space-x-4">
          <div className="px-3 py-1 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-black uppercase tracking-wider shadow-glow-blue">
            INTER
          </div>
          <h1 className="text-2xl font-black font-display text-white tracking-wide">
            TABLE D'ATTAQUE CUMULÉE
          </h1>
        </div>

        {/* Direction & Attack Status */}
        <div className="flex items-center space-x-3">
          {gameState.pendingPenaltyDraws > 0 && (
            <div className="flex items-center space-x-2 px-5 py-2 rounded-2xl bg-rose-600 text-white font-black text-xs shadow-glow-red border border-white/20 animate-pulse">
              <Flame className="w-4 h-4" />
              <span>ATTAQUE CUMULÉE : +{gameState.pendingPenaltyDraws} CARTES !</span>
            </div>
          )}

          {gameState.activeDemandRank && (
            <div className="flex items-center space-x-2 px-4 py-2 rounded-2xl bg-amber-500 text-gray-900 font-black text-xs shadow-glow-gold">
              <Target className="w-4 h-4" />
              <span>VALEUR IMPOSÉE : {gameState.activeDemandRank}</span>
            </div>
          )}

          <div className="flex items-center space-x-2 px-4 py-2 rounded-2xl bg-surface-card border border-white/10 text-xs font-bold text-gray-200">
            {gameState.direction === 1 ? (
              <>
                <RotateCw className="w-4 h-4 text-emerald-400 animate-spin" style={{ animationDuration: '8s' }} />
                <span>Sens Horaire</span>
              </>
            ) : (
              <>
                <RotateCcw className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '8s' }} />
                <span>Sens Anti-Horaire (Inversé)</span>
              </>
            )}
          </div>
        </div>

        {/* Turn Timer */}
        <div className="flex items-center space-x-2 px-4 py-2 rounded-2xl bg-surface-card border border-white/10 shadow-md">
          <Clock className="w-4 h-4 text-brand-gold" />
          <span className="text-xs font-bold text-gray-300">Temps :</span>
          <span className="font-mono font-black text-lg text-white">{gameState.turnTimeLeft}s</span>
        </div>
      </div>

      {/* Main Dynamic Table Arena */}
      <div className="relative flex-1 flex items-center justify-center my-4">
        {/* Table Neon Arena Border */}
        <div className="relative w-[900px] h-[500px] max-w-[86vw] max-h-[64vh] rounded-[260px] bg-gradient-to-b from-[#0A1024] via-[#060A17] to-[#03050B] border-[14px] border-[#162040] shadow-[0_0_90px_rgba(37,99,235,0.4),inset_0_0_80px_rgba(0,0,0,0.9)] flex items-center justify-center">
          {/* Neon Ring */}
          <div className="absolute inset-5 rounded-[240px] border border-blue-500/20 pointer-events-none" />

          {/* Center Play Zone: Draw Deck & Active Top Discard Card */}
          <div className="relative flex items-center space-x-12 z-10">
            {/* Draw Deck */}
            <div className="flex flex-col items-center space-y-2">
              <div className="relative w-32 h-48 rounded-2xl bg-gradient-to-br from-indigo-900 to-blue-950 border-4 border-indigo-400/40 shadow-2xl flex items-center justify-center transform -rotate-3 hover:scale-105 transition-transform">
                <div className="w-24 h-36 rounded-xl border border-white/20 flex flex-col items-center justify-center space-y-1 bg-surface-dark/40">
                  <Sparkles className="w-6 h-6 text-brand-cyan" />
                  <span className="font-mono font-black text-white text-lg">{gameState.drawDeckCount}</span>
                  <span className="text-[9px] font-bold text-gray-400 uppercase">Pioche</span>
                </div>
              </div>
            </div>

            {/* Active Discard Top Card */}
            <div className="flex flex-col items-center space-y-2">
              {gameState.topCard ? (
                <div className="relative w-36 h-52 rounded-2xl bg-white border-4 border-brand-cyan shadow-[0_0_50px_rgba(6,182,212,0.6)] flex flex-col justify-between p-3 transform scale-105 animate-scale-in">
                  <div className={`text-2xl font-black font-mono leading-none ${suitCfg.color}`}>
                    {gameState.topCard.rank}
                    <span className="block text-sm">{suitCfg.symbol}</span>
                  </div>

                  <div className={`text-5xl font-black self-center ${suitCfg.color} animate-pulse`}>
                    {gameState.topCard.rank === 'JOKER' ? '🃏' : suitCfg.symbol}
                  </div>

                  <div className={`text-2xl font-black font-mono leading-none self-end rotate-180 ${suitCfg.color}`}>
                    {gameState.topCard.rank}
                    <span className="block text-sm">{suitCfg.symbol}</span>
                  </div>
                </div>
              ) : null}
              <span className="text-xs font-black text-brand-cyan tracking-wider uppercase">
                DÉFAUSSE CENTRALE
              </span>
            </div>
          </div>

          {/* Players Distributed Around The Table */}
          {room?.players.map((player, idx) => {
            const totalPlayers = room.players.length;
            const angle = (idx / totalPlayers) * 2 * Math.PI - Math.PI / 2;
            const radiusX = 430;
            const radiusY = 230;
            const posX = Math.cos(angle) * radiusX;
            const posY = Math.sin(angle) * radiusY;

            const isCurrentTurn = player.id === gameState.currentTurnPlayerId;
            const cardCount = gameState.playerCardCounts[player.id] ?? 0;
            const score = gameState.scores[player.id] ?? 0;

            return (
              <div
                key={player.id}
                className="absolute z-20 flex flex-col items-center transform -translate-x-1/2 -translate-y-1/2 transition-all duration-500"
                style={{
                  left: `calc(50% + ${posX}px)`,
                  top: `calc(50% + ${posY}px)`,
                }}
              >
                {/* Player Card Pod */}
                <div
                  className={`p-3 rounded-2xl border-2 flex items-center space-x-3 transition-all backdrop-blur-xl ${
                    isCurrentTurn
                      ? 'bg-blue-950/95 border-brand-cyan shadow-glow-cyan scale-110'
                      : 'bg-surface-card/90 border-white/15 shadow-xl opacity-90'
                  }`}
                >
                  {player.selfieImage ? (
                    <img
                      src={player.selfieImage}
                      alt={player.name}
                      className="w-11 h-11 rounded-xl object-cover border-2 border-white shadow-md"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-xl bg-surface-light border border-white/20 flex items-center justify-center text-white font-bold text-base shadow-inner">
                      {player.name.charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div>
                    <div className="flex items-center space-x-1.5">
                      <span className="font-black text-white text-xs truncate max-w-[90px]">{player.name}</span>
                      {isCurrentTurn && (
                        <span className="w-2 h-2 rounded-full bg-brand-cyan animate-ping" />
                      )}
                    </div>
                    <div className="flex items-center space-x-2 text-[10px] font-bold text-gray-300 mt-0.5">
                      <span className="px-1.5 py-0.2 rounded bg-surface-dark border border-white/10 text-brand-cyan font-mono">
                        {cardCount} cartes
                      </span>
                      <span className="text-brand-gold font-mono">{score} pts</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Action Special Feedback Bar */}
      <div className="flex items-center justify-between z-20 border-t border-white/10 pt-3 text-xs">
        <div className="flex items-center space-x-2 text-gray-200">
          <Zap className="w-4 h-4 text-brand-cyan" />
          <span className="font-semibold italic truncate">"{gameState.lastActionLog}"</span>
        </div>
        <div className="text-gray-400">
          Cartes spéciales : <strong className="text-white">A (STOP)</strong>, <strong className="text-emerald-400">2 (+2)</strong>, <strong className="text-amber-400">8 (Demande)</strong>, <strong className="text-rose-400">10 (+4)</strong>, <strong className="text-indigo-400">J (Retour)</strong>, <strong className="text-purple-400">Joker (+5)</strong>.
        </div>
      </div>
    </div>
  );
};
