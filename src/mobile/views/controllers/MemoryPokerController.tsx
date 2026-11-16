import React, { useState } from 'react';
import { useGame } from '../../../context/GameContext';
import { triggerHaptic, hapticPatterns } from '../../components/HapticFeedback';
import { Clock, CheckCircle2, Shield, Sparkles, Trophy } from 'lucide-react';

export const MemoryPokerController: React.FC = () => {
  const { room, sendGameAction, localPlayer } = useGame();

  const gameState = (room?.gameState || {}) as Record<string, any>;
  const subState = (gameState.subState || gameState || {}) as Record<string, any>;

  const phase = subState.phase || 'memorize';
  const timeLeft = subState.timeLeft || 0;
  const communityCards = subState.communityCards || [];
  const selectedCards = (localPlayer && subState.selectedCards && subState.selectedCards[localPlayer.id]) || [];
  const isConfirmed = Boolean(localPlayer && subState.confirmedPlayers && subState.confirmedPlayers[localPlayer.id]);

  const [localSelection, setLocalSelection] = useState<number[]>([]);

  const activeSelection = selectedCards.length > 0 ? selectedCards : localSelection;

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

  const myHand = localPlayer && subState.playerHands ? subState.playerHands[localPlayer.id] : null;

  return (
    <div className="flex flex-col min-h-screen bg-[#07090E] text-white p-5 select-none justify-between font-sans">
      {/* Barre supérieure : chrono et phase */}
      <header className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#D4AF37] flex items-center justify-center text-black font-black text-xs">
            MP
          </div>
          <div>
            <span className="font-display font-black text-sm text-white tracking-wider block">MEMORY POKER</span>
            <span className="text-[10px] text-white/50 uppercase tracking-widest">
              {phase === 'memorize' && 'Phase 1 : Mémorisation'}
              {phase === 'selection' && 'Phase 2 : Choisissez 2 cartes'}
              {(phase === 'showdown' || phase === 'ended') && 'Phase 3 : Showdown'}
            </span>
          </div>
        </div>

        <div
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-mono text-sm font-bold ${
            timeLeft <= 5 ? 'bg-red-500/20 border-red-500 text-red-400 animate-pulse' : 'bg-white/5 border-white/10 text-[#D4AF37]'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>{timeLeft}s</span>
        </div>
      </header>

      {/* PHASE 1 : MÉMORISATION SUR SMARTPHONE */}
      {phase === 'memorize' && (
        <div className="flex-1 flex flex-col items-center justify-center text-center my-6 space-y-5">
          <div className="w-20 h-20 rounded-3xl bg-[#D4AF37]/15 border border-[#D4AF37]/40 flex items-center justify-center shadow-[0_0_25px_rgba(212,175,55,0.25)] animate-pulse">
            <Sparkles className="w-10 h-10 text-[#D4AF37]" />
          </div>

          <div>
            <h3 className="text-xl font-black font-display text-white mb-2">Regardez l'écran TV !</h3>
            <p className="text-xs text-white/60 max-w-xs leading-relaxed">
              Mémorisez bien la position des cartes sur la grille. Elles vont bientôt se retourner face cachée.
            </p>
          </div>

          <button
            onClick={handleReady}
            className="w-full max-w-xs py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold text-xs uppercase tracking-wider active:scale-95 transition-all"
          >
            Je suis prêt (Passer)
          </button>
        </div>
      )}

      {/* PHASE 2 : SÉLECTION TACTILE DES 2 CARTES */}
      {phase === 'selection' && (
        <div className="flex-1 flex flex-col justify-between my-2 space-y-4">
          {/* Les 3 Cartes Communes de la table */}
          <div className="p-3 rounded-2xl bg-[#0E131C] border border-white/10 text-center">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37] block mb-2">
              Cartes Communes (Table)
            </span>
            <div className="flex justify-center gap-2.5">
              {communityCards.map((c: any, idx: number) => (
                <div
                  key={idx}
                  className="w-12 h-16 rounded-xl bg-gradient-to-br from-white to-slate-200 text-black border border-white flex flex-col justify-between p-1 shadow"
                >
                  <span className="text-[9px] font-black font-mono self-start">{c.display}</span>
                  <span className={`text-lg self-center ${c.color === 'red' ? 'text-red-600' : 'text-slate-900'}`}>
                    {c.symbol}
                  </span>
                  <span className="text-[9px] font-black font-mono self-end">{c.display}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Grille Tactile 4x4 */}
          <div className="grid grid-cols-4 gap-2.5 p-3 rounded-2xl bg-[#0B0F16] border border-white/10">
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
                    <span className="text-[9px] font-bold tracking-tight">Carte {slotNumber}</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Bouton de Validation */}
          <button
            disabled={activeSelection.length !== 2 || isConfirmed}
            onClick={handleConfirm}
            className={`w-full py-4 rounded-2xl font-black uppercase text-xs tracking-wider transition-all shadow-lg active:scale-95 ${
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

      {/* PHASE 3 : SHOWDOWN & RÉSULTATS */}
      {(phase === 'showdown' || phase === 'ended') && (
        <div className="flex-1 flex flex-col items-center justify-center text-center my-6 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-[#D4AF37]/20 border border-[#D4AF37] flex items-center justify-center">
            <Trophy className="w-8 h-8 text-[#D4AF37]" />
          </div>

          {myHand ? (
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37] block mb-1">
                Votre Combinaison
              </span>
              <h3 className="text-2xl font-black font-display text-white mb-2">
                {myHand.evaluation?.frenchName}
              </h3>
              <div className="font-mono text-xl font-black text-[#D4AF37]">
                +{myHand.totalRoundScore} points
              </div>
            </div>
          ) : (
            <div>
              <h3 className="text-lg font-bold text-white mb-1">Résultats affichés sur la TV</h3>
              <p className="text-xs text-white/50">Regardez l'écran pour découvrir le classement !</p>
            </div>
          )}
        </div>
      )}

      <footer className="pt-2 text-center border-t border-white/10">
        <span className="text-[10px] text-white/40 font-semibold">
          MOOD TV • Manette Smartphone Interactive
        </span>
      </footer>
    </div>
  );
};
