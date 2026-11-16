import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '../../../context/GameContext';
import { triggerHaptic, hapticPatterns } from '../../components/HapticFeedback';
import { Clock, CheckCircle2, Trophy, Sparkles } from 'lucide-react';

const DEVIL_EMOJIS = ['🤯', '😱', '🪙', '🃏', '👑', '💀'];

export const MemoryPokerController: React.FC = () => {
  const { room, sendGameAction, sendReaction, localPlayer } = useGame();

  const gameState = (room?.gameState || {}) as Record<string, any>;
  const subState = (gameState.subState || gameState || {}) as Record<string, any>;

  const phase = subState.phase || 'memorize';
  const timeLeft = typeof subState.timeLeft === 'number' ? subState.timeLeft : 0;
  const currentRound = subState.currentRound || 1;
  const totalRounds = subState.totalRounds || 3;
  const communityCards = subState.communityCards || [];
  const selectedCards = (localPlayer && subState.selectedCards && subState.selectedCards[localPlayer.id]) || [];
  const isConfirmed = Boolean(localPlayer && subState.confirmedPlayers && subState.confirmedPlayers[localPlayer.id]);

  const [localSelection, setLocalSelection] = useState<number[]>([]);
  const [lastSentEmoji, setLastSentEmoji] = useState<string | null>(null);

  const activeSelection = selectedCards.length > 0 ? selectedCards : localSelection;

  // Effet Haptique Battement de Cœur lors des 5 dernières secondes
  const prevTimeLeftRef = useRef<number>(timeLeft);
  useEffect(() => {
    if (timeLeft <= 5 && timeLeft > 0 && timeLeft !== prevTimeLeftRef.current) {
      triggerHaptic([60, 130, 60]);
    }
    prevTimeLeftRef.current = timeLeft;
  }, [timeLeft]);

  // Haptic lors du passage au Showdown
  useEffect(() => {
    if (phase === 'showdown') {
      triggerHaptic(hapticPatterns.win);
    }
  }, [phase]);

  const handleToggleCard = (index: number) => {
    if (phase !== 'selection' || isConfirmed) return;
    triggerHaptic(hapticPatterns.tap);

    let nextSelection: number[];
    if (activeSelection.includes(index)) {
      nextSelection = activeSelection.filter((i: number) => i !== index);
    } else if (activeSelection.length < 2) {
      nextSelection = [...activeSelection, index];
    } else {
      nextSelection = [activeSelection[0], index];
    }

    setLocalSelection(nextSelection);
    sendGameAction('toggle_card', { cardIndex: index });
  };

  const handleConfirm = () => {
    if (activeSelection.length !== 2 || isConfirmed) return;
    triggerHaptic(hapticPatterns.success);
    sendGameAction('confirm_selection', { cardIndices: activeSelection });
  };

  const handleReady = () => {
    if (phase !== 'memorize') return;
    triggerHaptic(hapticPatterns.cardPlay);
    sendGameAction('confirm_ready', {});
  };

  const handleSendReaction = (emoji: string) => {
    triggerHaptic(hapticPatterns.tap);
    setLastSentEmoji(emoji);
    sendReaction(emoji);
    setTimeout(() => setLastSentEmoji(null), 800);
  };

  const myHand = localPlayer && subState.playerHands ? subState.playerHands[localPlayer.id] : null;

  return (
    <div className="flex flex-col min-h-screen bg-[#07090E] text-white p-4 select-none justify-between font-sans">
      {/* Barre supérieure : Manche, Chronomètre et Phase */}
      <header className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#8C6D23] flex items-center justify-center text-black font-black text-xs shadow-md">
            🪙
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-display font-black text-sm text-white tracking-wider">MEMORY POKER</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#D4AF37]/20 border border-[#D4AF37]/35 text-[#D4AF37]">
                M.{currentRound}/{totalRounds}
              </span>
            </div>
            <span className="text-[10px] text-white/50 uppercase tracking-widest">
              {phase === 'memorize' && 'Phase 1 : Mémorisation'}
              {phase === 'selection' && 'Phase 2 : Choisissez 2 cartes'}
              {(phase === 'showdown' || phase === 'ended') && 'Phase 3 : Showdown'}
            </span>
          </div>
        </div>

        <div
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-mono text-sm font-bold transition-colors ${
            timeLeft <= 5 && timeLeft > 0
              ? 'bg-red-500/25 border-red-500 text-red-400 animate-pulse scale-105'
              : 'bg-white/5 border-white/10 text-[#D4AF37]'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>{timeLeft}s</span>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* PHASE 1 : MÉMORISATION SUR SMARTPHONE */}
      {/* ========================================================================= */}
      {phase === 'memorize' && (
        <div className="flex-1 flex flex-col items-center justify-center text-center my-4 space-y-5">
          <div className="w-20 h-20 rounded-3xl bg-[#D4AF37]/15 border border-[#D4AF37]/40 flex items-center justify-center shadow-[0_0_30px_rgba(212,175,55,0.25)] animate-pulse">
            <Sparkles className="w-10 h-10 text-[#D4AF37]" />
          </div>

          <div>
            <h3 className="text-xl font-black font-display text-white mb-2">Regardez l'écran TV !</h3>
            <p className="text-xs text-white/60 max-w-xs leading-relaxed">
              Mémorisez l'emplacement des 16 cartes sur la grille TV. Elles vont bientôt se retourner face cachée.
            </p>
          </div>

          <button
            onClick={handleReady}
            className="w-full max-w-xs py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold text-xs uppercase tracking-wider active:scale-95 transition-all shadow-md"
          >
            Je suis prêt (Passer)
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PHASE 2 : SÉLECTION TACTILE DES 2 CARTES */}
      {/* ========================================================================= */}
      {phase === 'selection' && (
        <div className="flex-1 flex flex-col justify-between my-2 space-y-3">
          {/* Les 3 Cartes Communes de la table */}
          <div className="p-3 rounded-2xl bg-[#0E131C] border border-white/10 text-center shadow-lg">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37] block mb-1.5">
              Cartes Communes (Table)
            </span>
            <div className="flex justify-center gap-2">
              {communityCards.map((c: any, idx: number) => (
                <div
                  key={idx}
                  className="w-12 h-16 rounded-xl bg-gradient-to-br from-white to-slate-200 text-black border border-white flex flex-col justify-between p-1 shadow"
                >
                  <span className="text-[9px] font-black font-mono self-start leading-none">{c.display}</span>
                  <span className={`text-lg self-center ${c.color === 'red' ? 'text-red-600' : 'text-slate-900'}`}>
                    {c.symbol}
                  </span>
                  <span className="text-[9px] font-black font-mono self-end leading-none">{c.display}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Grille Tactile 4x4 */}
          <div className="grid grid-cols-4 gap-2 p-2.5 rounded-2xl bg-[#0B0F16] border border-white/10 shadow-inner">
            {Array.from({ length: 16 }).map((_, idx) => {
              const isSelected = activeSelection.includes(idx);
              const slotNumber = activeSelection.indexOf(idx) + 1;

              return (
                <button
                  key={idx}
                  disabled={isConfirmed}
                  onClick={() => handleToggleCard(idx)}
                  className={`aspect-[3/4] rounded-xl flex flex-col items-center justify-center font-mono text-sm font-black border transition-all active:scale-95 ${
                    isSelected
                      ? 'bg-[#D4AF37] text-black border-white shadow-[0_0_15px_rgba(212,175,55,0.4)] scale-105'
                      : 'bg-white/5 border-white/15 text-white/50 hover:border-white/30'
                  }`}
                >
                  <span>#{idx + 1}</span>
                  {isSelected && (
                    <span className="text-[8px] font-bold tracking-tight uppercase">Carte {slotNumber}</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Bouton de Validation */}
          <button
            disabled={activeSelection.length !== 2 || isConfirmed}
            onClick={handleConfirm}
            className={`w-full py-3.5 rounded-2xl font-black uppercase text-xs tracking-wider transition-all shadow-lg active:scale-95 ${
              isConfirmed
                ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
                : activeSelection.length === 2
                ? 'bg-gradient-to-r from-[#D4AF37] to-[#B38728] text-black shadow-[#D4AF37]/30'
                : 'bg-white/5 border border-white/10 text-white/30 cursor-not-allowed'
            }`}
          >
            {isConfirmed ? (
              <span className="flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Main Enregistrée ! En attente…
              </span>
            ) : (
              `Valider mes 2 Cartes (${activeSelection.length}/2)`
            )}
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PHASE 3 : SHOWDOWN & RÉSULTATS */}
      {/* ========================================================================= */}
      {(phase === 'showdown' || phase === 'ended') && (
        <div className="flex-1 flex flex-col items-center justify-center text-center my-4 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-[#D4AF37]/20 border border-[#D4AF37] flex items-center justify-center shadow-[0_0_25px_rgba(212,175,55,0.3)]">
            <Trophy className="w-8 h-8 text-[#D4AF37]" />
          </div>

          {myHand ? (
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37] block">
                Votre Combinaison
              </span>
              <h3 className="text-2xl font-black font-display text-white">
                {myHand.evaluation?.frenchName}
              </h3>
              <div className="flex items-center justify-center gap-3">
                <span className="font-mono text-xl font-black text-[#D4AF37]">
                  +{myHand.totalRoundScore} pts
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  🪙 +{Math.max(1, Math.floor(myHand.evaluation?.tier || 1))} Garnets
                </span>
              </div>
            </div>
          ) : (
            <div>
              <h3 className="text-lg font-bold text-white mb-1">Révélation en direct sur la TV</h3>
              <p className="text-xs text-white/50">Regardez l'écran pour découvrir les résultats et le classement !</p>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* BARRE D'ÉMOJIS FLOTTANTS THE DEVIL'S PLAN */}
      {/* ========================================================================= */}
      <footer className="pt-3 border-t border-white/10 space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-white/40">
            Réagir en direct TV :
          </span>
          {lastSentEmoji && (
            <span className="text-xs font-bold text-[#D4AF37] animate-bounce">
              Envoyé {lastSentEmoji} !
            </span>
          )}
        </div>

        <div className="flex items-center justify-between gap-1.5 p-1.5 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md">
          {DEVIL_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => handleSendReaction(emoji)}
              className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/15 active:scale-125 text-xl flex items-center justify-center transition-transform"
              title={`Envoyer ${emoji}`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </footer>
    </div>
  );
};
