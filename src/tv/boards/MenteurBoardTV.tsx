import React, { useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { MenteurGameState, PlayingCard, StandardSuit } from '../../types/game';
import { Clock, Shield, AlertTriangle, CheckCircle2, User, Sparkles, Trophy, Flame } from 'lucide-react';
import { audio } from '../../services/audio';

const SUIT_ICONS: Record<StandardSuit, { symbol: string; color: string }> = {
  spades: { symbol: '♠', color: 'text-gray-900' },
  hearts: { symbol: '♥', color: 'text-red-600' },
  diamonds: { symbol: '♦', color: 'text-red-600' },
  clubs: { symbol: '♣', color: 'text-gray-900' },
};

export const MenteurBoardTV: React.FC = () => {
  const { room } = useGame();
  const gameState = room?.gameState as MenteurGameState | undefined;

  useEffect(() => {
    if (gameState?.accusationResult) {
      if (gameState.accusationResult.wasLying) {
        audio.playCustomBuzzer('klaxon');
      } else {
        audio.playSelect();
      }
    }
  }, [gameState?.accusationResult?.timestamp]);

  if (!gameState) {
    return <div className="p-10 text-white">Chargement de la table de Menteur...</div>;
  }

  const currentTurnPlayer = room?.players.find((p) => p.id === gameState.currentTurnPlayerId);

  return (
    <div className="relative w-full h-full flex flex-col justify-between px-10 py-4 select-none overflow-hidden">
      {/* Top Bar: Game Title, Last Play Banner, and Turn Timer */}
      <div className="flex items-center justify-between z-20 border-b border-white/10 pb-3">
        <div className="flex items-center space-x-4">
          <div className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-red-600 text-white text-xs font-black uppercase tracking-wider shadow-glow-red">
            LE MENTEUR
          </div>
          <h1 className="text-2xl font-black font-display text-white tracking-wide">
            TABLE CENTRALE DE BLUFF
          </h1>
        </div>

        {/* Active Claim Announcement */}
        {gameState.lastPlay ? (
          <div className="flex items-center space-x-3 px-6 py-2 rounded-2xl bg-surface-card border-2 border-brand-gold/60 shadow-glow-gold animate-scale-in">
            <span className="text-xs font-black text-gray-300 uppercase">DERNIÈRE ANNONCE :</span>
            <span className="text-sm font-bold text-white">
              {gameState.lastPlay.playerName} a posé {gameState.lastPlay.cardCount} carte(s) :
            </span>
            <span className="text-xl font-black text-brand-gold font-mono tracking-widest px-3 py-0.5 rounded-lg bg-brand-gold/20 border border-brand-gold/40">
              "{gameState.lastPlay.claimedRank}"
            </span>
          </div>
        ) : (
          <div className="px-5 py-2 rounded-2xl bg-surface-card border border-white/10 text-xs font-bold text-gray-400">
            En attente de la première pose de cartes...
          </div>
        )}

        {/* Turn Timer */}
        <div className="flex items-center space-x-2 px-4 py-2 rounded-2xl bg-surface-card border border-white/10 shadow-md">
          <Clock className="w-4 h-4 text-brand-gold" />
          <span className="text-xs font-bold text-gray-300">Temps :</span>
          <span className="font-mono font-black text-lg text-white">{gameState.turnTimeLeft}s</span>
        </div>
      </div>

      {/* Center 3D Luxurious Oval Poker/Bluff Table */}
      <div className="relative flex-1 flex items-center justify-center my-4">
        {/* Table Felt Surface */}
        <div className="relative w-[880px] h-[480px] max-w-[85vw] max-h-[62vh] rounded-[240px] bg-gradient-to-b from-[#0F3826] via-[#0A261A] to-[#05170F] border-[14px] border-[#3D2616] shadow-[0_0_90px_rgba(0,0,0,0.9),inset_0_0_80px_rgba(0,0,0,0.8)] flex items-center justify-center">
          {/* Inner Golden Felt Line */}
          <div className="absolute inset-4 rounded-[220px] border-2 border-amber-400/25 pointer-events-none" />

          {/* Central Face-Down Card Pile */}
          <div className="relative flex flex-col items-center justify-center z-10">
            {gameState.centralPileCount > 0 ? (
              <div className="relative w-32 h-44 flex items-center justify-center">
                {/* 3D Stacked Cards depth layers */}
                {Array.from({ length: Math.min(10, gameState.centralPileCount) }).map((_, idx) => {
                  const rot = (idx * 7) % 25 - 12;
                  const offset = idx * -3;
                  return (
                    <div
                      key={`stack_${idx}`}
                      className="absolute w-28 h-40 rounded-xl bg-gradient-to-tr from-red-900 via-red-800 to-rose-950 border-2 border-amber-300/40 shadow-2xl transition-all duration-300"
                      style={{
                        transform: `translateY(${offset}px) rotate(${rot}deg)`,
                      }}
                    >
                      <div className="w-full h-full rounded-lg border border-white/10 p-2 flex items-center justify-center">
                        <div className="w-12 h-16 rounded-lg border border-amber-400/30 flex items-center justify-center text-amber-300 font-display font-black text-xl">
                          ♠
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Pile Counter Badge */}
                <div className="absolute -bottom-5 px-5 py-1.5 rounded-full bg-surface-dark border-2 border-brand-gold text-white font-mono font-black text-sm shadow-glow-gold z-20">
                  {gameState.centralPileCount} CARTES AU TAS
                </div>
              </div>
            ) : (
              <div className="w-32 h-44 rounded-2xl border-2 border-dashed border-white/20 flex flex-col items-center justify-center text-gray-500 space-y-1">
                <Shield className="w-8 h-8 opacity-40 text-brand-gold" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Tas Vide</span>
              </div>
            )}
          </div>

          {/* Players Around The Table */}
          {room?.players.map((player, idx) => {
            const totalPlayers = room.players.length;
            const angle = (idx / totalPlayers) * 2 * Math.PI - Math.PI / 2;
            const radiusX = 420;
            const radiusY = 220;
            const posX = Math.cos(angle) * radiusX;
            const posY = Math.sin(angle) * radiusY;

            const isCurrentTurn = player.id === gameState.currentTurnPlayerId;
            const cardCount = gameState.playerCardCounts[player.id] ?? 0;

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
                      ? 'bg-amber-950/90 border-brand-gold shadow-glow-gold scale-110'
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
                        <span className="w-2 h-2 rounded-full bg-brand-gold animate-ping" />
                      )}
                    </div>
                    <div className="flex items-center space-x-1 text-[11px] font-bold text-amber-400 mt-0.5">
                      <span className="px-2 py-0.2 rounded bg-surface-dark border border-white/10 font-mono">
                        {cardCount} cartes
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Accusation Cinematic Reveal Overlay Modal */}
      {gameState.accusationResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-2xl animate-scale-in">
          <div className="max-w-xl w-full p-8 rounded-3xl bg-surface-card border-4 border-brand-red/80 shadow-[0_0_80px_rgba(239,68,68,0.5)] flex flex-col items-center text-center space-y-6">
            {/* Header Alert */}
            <div className="flex items-center space-x-2 text-rose-400 font-black text-sm uppercase tracking-widest animate-pulse">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
              <span>ACCUSATION : MENTEUR !</span>
            </div>

            <div>
              <h2 className="text-3xl font-black font-display text-white">
                {gameState.accusationResult.accuserName} a accusé {gameState.accusationResult.targetName} !
              </h2>
              <p className="text-sm text-gray-300 mt-1">
                Annonce déclarée : <strong className="text-brand-gold font-mono text-base">"{gameState.accusationResult.claimedRank}"</strong>
              </p>
            </div>

            {/* Revealed Cards Fan */}
            <div className="flex items-center justify-center space-x-3 py-2">
              {gameState.accusationResult.realCards.map((card: PlayingCard, idx: number) => {
                const suitCfg = SUIT_ICONS[card.suit] || { symbol: '♠', color: 'text-gray-900' };
                const isMatch = card.rank === gameState.accusationResult?.claimedRank;

                return (
                  <div
                    key={`reveal_${card.id}_${idx}`}
                    className={`w-24 h-36 rounded-2xl bg-white border-4 shadow-2xl flex flex-col justify-between p-2 transform transition-transform hover:scale-105 ${
                      isMatch ? 'border-emerald-500 ring-4 ring-emerald-400/40' : 'border-rose-600 ring-4 ring-rose-500/50 animate-bounce'
                    }`}
                  >
                    <div className={`text-lg font-black font-mono leading-none ${suitCfg.color}`}>
                      {card.rank}
                      <span className="block text-xs">{suitCfg.symbol}</span>
                    </div>
                    <div className={`text-3xl font-black self-center ${suitCfg.color}`}>
                      {suitCfg.symbol}
                    </div>
                    <div className={`text-lg font-black font-mono leading-none self-end rotate-180 ${suitCfg.color}`}>
                      {card.rank}
                      <span className="block text-xs">{suitCfg.symbol}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Verdict Box */}
            <div
              className={`w-full py-4 px-6 rounded-2xl border-2 flex items-center justify-center space-x-3 ${
                gameState.accusationResult.wasLying
                  ? 'bg-rose-950/80 border-rose-500 shadow-glow-red text-rose-300'
                  : 'bg-emerald-950/80 border-emerald-500 shadow-glow-emerald text-emerald-300'
              }`}
            >
              {gameState.accusationResult.wasLying ? (
                <>
                  <AlertTriangle className="w-7 h-7 text-rose-400" />
                  <div className="text-left">
                    <div className="font-black text-lg tracking-wider text-white uppercase">MENSONGE DÉMASQUÉ !</div>
                    <div className="text-xs">
                      {gameState.accusationResult.targetName} a menti et ramasse les {gameState.accusationResult.pileCountTaken} cartes !
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-7 h-7 text-emerald-400" />
                  <div className="text-left">
                    <div className="font-black text-lg tracking-wider text-white uppercase">VÉRITÉ ABSOLUE !</div>
                    <div className="text-xs">
                      {gameState.accusationResult.targetName} disait vrai. {gameState.accusationResult.accuserName} ramasse les {gameState.accusationResult.pileCountTaken} cartes !
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Action Logs */}
      <div className="flex items-center justify-between z-20 border-t border-white/10 pt-3 text-xs">
        <div className="flex items-center space-x-2 text-gray-300">
          <Sparkles className="w-4 h-4 text-brand-gold" />
          <span className="font-semibold italic truncate">"{gameState.lastActionLog}"</span>
        </div>
        <div className="text-gray-400">
          Appuyez sur <strong className="text-rose-400">MENTEUR !</strong> sur votre smartphone si vous suspectez un bluff.
        </div>
      </div>
    </div>
  );
};
