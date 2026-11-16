import React, { useState } from 'react';
import { useGame } from '../../../context/GameContext';
import { MobileHeader } from '../../components/MobileHeader';
import { triggerHaptic, hapticPatterns } from '../../components/HapticFeedback';
import {
  Shield,
  Eye,
  Brain,
  Binary,
  Layers,
  Sparkles,
  Flame,
  AlertTriangle,
  HelpCircle,
  Check,
  Send,
  Lock,
} from 'lucide-react';

export const ArenaController: React.FC = () => {
  const { room, localPlayer, sendGameAction } = useGame();

  const gameState = (room?.gameState || {}) as Record<string, any>;
  const subGameId = gameState.subGameId || 'memory_poker';
  const subState = (gameState.subState || {}) as Record<string, any>;
  const subPrivate = (gameState.subPrivate || {}) as Record<string, any>;

  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [guessInput, setGuessInput] = useState<string>('');
  const [selectedBidColor, setSelectedBidColor] = useState<string>('gold');
  const [selectedBidQty, setSelectedBidQty] = useState<number>(3);
  const [pyramidBase, setPyramidBase] = useState<(number | null)[]>([null, null, null]);
  const [pyramidOps, setPyramidOps] = useState<('+' | '-' | '*')[]>(['+', '+', '*']);
  const [selectedMorrisFrom, setSelectedMorrisFrom] = useState<number | null>(null);

  const isMyTurn = subState.turnPlayerId === localPlayer?.id;

  // 1. MEMORY POKER ACTION
  const handleToggleCard = (idx: number) => {
    triggerHaptic(hapticPatterns.tap);
    if (selectedCards.includes(idx)) {
      setSelectedCards(prev => prev.filter(i => i !== idx));
    } else if (selectedCards.length < 5) {
      setSelectedCards(prev => [...prev, idx]);
    }
  };

  const handleSubmitPokerCards = () => {
    if (selectedCards.length !== 5) return;
    triggerHaptic(hapticPatterns.success);
    sendGameAction('select_cards', { cardIndices: selectedCards });
  };

  // 2. FRAGMENTS OF MEMORY ACTION
  const handleAnswerQuestion = (optionIndex: number) => {
    triggerHaptic(hapticPatterns.cardPlay);
    sendGameAction('submit_answer', { optionIndex });
  };

  // 3. SECRET NUMBER ACTION
  const handleNumberInput = (digit: string) => {
    triggerHaptic(hapticPatterns.tap);
    if (guessInput.length < 3 && !guessInput.includes(digit)) {
      setGuessInput(prev => prev + digit);
    }
  };

  const handleBackspaceNumber = () => {
    triggerHaptic(hapticPatterns.tap);
    setGuessInput(prev => prev.slice(0, -1));
  };

  const handleSubmitGuess = () => {
    if (guessInput.length !== 3) return;
    triggerHaptic(hapticPatterns.cardPlay);
    sendGameAction('submit_guess', { guess: guessInput });
    setGuessInput('');
  };

  const handleBuyClue = (clueType: 'sum' | 'parity') => {
    triggerHaptic(hapticPatterns.tap);
    sendGameAction('buy_clue', { clueType });
  };

  // 4. THE VIRUS GAME ACTION
  const handleVirusTarget = (targetId: string) => {
    triggerHaptic(hapticPatterns.cardPlay);
    if (subState.phase === 'night') {
      sendGameAction('night_action', { targetId });
    } else if (subState.phase === 'day_voting') {
      sendGameAction('cast_vote', { targetId });
    }
  };

  // 5. DOUBT AND BET ACTION
  const handleSubmitBid = () => {
    triggerHaptic(hapticPatterns.cardPlay);
    sendGameAction('submit_bid', { color: selectedBidColor, quantity: selectedBidQty });
  };

  const handleCallDoubt = () => {
    triggerHaptic(hapticPatterns.buzzer);
    sendGameAction('call_doubt');
  };

  // 6. EQUATION PYRAMID ACTION
  const handleSubmitPyramid = () => {
    if (pyramidBase.some(n => n === null)) return;
    triggerHaptic(hapticPatterns.success);
    sendGameAction('submit_pyramid', { base: pyramidBase, ops: pyramidOps });
  };

  // 7. KNIGHT'S TOUR ACTION
  const handleMoveKnight = (row: number, col: number) => {
    triggerHaptic(hapticPatterns.cardPlay);
    sendGameAction('move_knight', { row, col });
  };

  // 8. NINE MEN'S MORRIS ACTION
  const handleMorrisPointClick = (idx: number) => {
    triggerHaptic(hapticPatterns.cardPlay);
    if (subState.mustRemovePiece) {
      sendGameAction('remove_piece', { pointIndex: idx });
      return;
    }

    if (subState.phase === 'placement') {
      sendGameAction('place_piece', { pointIndex: idx });
    } else {
      // Phase déplacement
      if (selectedMorrisFrom === null) {
        if (subState.board && subState.board[idx] === subPrivate.myMorrisColor) {
          setSelectedMorrisFrom(idx);
        }
      } else {
        sendGameAction('move_piece', { fromIndex: selectedMorrisFrom, toIndex: idx });
        setSelectedMorrisFrom(null);
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#07090E] text-white p-4 select-none font-sans overflow-x-hidden">
      <MobileHeader />

      {/* BANNIÈRE SUPÉRIEURE ÉPREUVE ACTIVES */}
      <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#0E131C] border border-white/10 mb-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#D4AF37] flex items-center justify-center text-black font-black">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37]">
              MOOD ARENA
            </span>
            <h2 className="font-black text-sm text-white uppercase tracking-tight">
              {subGameId.replace(/_/g, ' ')}
            </h2>
          </div>
        </div>

        {isMyTurn && (
          <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 text-xs font-black uppercase tracking-wider animate-pulse">
            À vous de jouer !
          </span>
        )}
      </div>

      {/* ========================================================= */}
      {/* 1. MANETTE : MEMORY POKER */}
      {/* ========================================================= */}
      {subGameId === 'memory_poker' && (
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <div className="text-center mb-4">
              <span className="text-xs font-bold text-white/60">
                Sélectionnez 5 cartes de mémoire ({selectedCards.length}/5) :
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2.5">
              {Array.from({ length: 16 }).map((_, i) => {
                const isSelected = selectedCards.includes(i);
                return (
                  <button
                    key={i}
                    onClick={() => handleToggleCard(i)}
                    className={`h-16 rounded-xl border font-mono font-black text-base transition-all ${
                      isSelected
                        ? 'bg-[#D4AF37] text-black border-white shadow-lg shadow-[#D4AF37]/30 scale-95'
                        : 'bg-[#121722] border-white/10 text-white/50 hover:bg-[#161D2B]'
                    }`}
                  >
                    #{i + 1}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={handleSubmitPokerCards}
            disabled={selectedCards.length !== 5}
            className={`w-full py-4 rounded-2xl font-black uppercase text-sm tracking-wider shadow-xl transition-all mt-6 ${
              selectedCards.length === 5
                ? 'bg-gradient-to-r from-[#D4AF37] to-[#B38728] text-black shadow-[#D4AF37]/25 active:scale-95'
                : 'bg-white/10 text-white/30 cursor-not-allowed'
            }`}
          >
            Valider ma main ({selectedCards.length}/5)
          </button>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. MANETTE : FRAGMENTS OF MEMORY */}
      {/* ========================================================= */}
      {subGameId === 'fragments_of_memory' && (
        <div className="flex-1 flex flex-col justify-center">
          {subState.phase === 'observe' && (
            <div className="text-center space-y-4 py-12">
              <div className="w-20 h-20 rounded-full bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center mx-auto text-cyan-400 animate-pulse">
                <Eye className="w-10 h-10" />
              </div>
              <h3 className="font-display font-black text-xl text-white">
                OBSERVEZ L'ÉCRAN TV !
              </h3>
              <p className="text-xs text-white/50 max-w-xs mx-auto">
                Chaque détail compte. Les questions vont apparaître dans un instant.
              </p>
            </div>
          )}

          {subState.phase === 'question' && (
            <div className="space-y-3">
              <span className="text-xs font-bold text-center block text-white/60 mb-2">
                Choisissez la bonne réponse :
              </span>
              {['A', 'B', 'C', 'D'].map((letter, idx) => (
                <button
                  key={letter}
                  onClick={() => handleAnswerQuestion(idx)}
                  className="w-full py-4 px-6 rounded-2xl bg-[#121722] hover:bg-[#1A2232] border border-white/10 active:border-[#D4AF37] active:bg-[#D4AF37]/20 flex items-center gap-4 transition-all text-left"
                >
                  <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-black text-xs text-white">
                    {letter}
                  </span>
                  <span className="font-bold text-sm text-white">Option {letter}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. MANETTE : SECRET NUMBER */}
      {/* ========================================================= */}
      {subGameId === 'secret_number' && (
        <div className="flex-1 flex flex-col justify-between">
          {/* Badge de code secret personnel */}
          <div className="p-4 rounded-2xl bg-[#131722] border border-[#D4AF37]/40 mb-4 flex items-center justify-between">
            <span className="text-xs font-bold text-white/60 uppercase">Mon Code Secret :</span>
            <span className="font-mono text-xl font-black text-[#D4AF37] tracking-widest px-3 py-1 rounded bg-black/40">
              {subPrivate.mySecretNumber || '???'}
            </span>
          </div>

          {/* Affichage de la saisie */}
          <div className="p-4 rounded-2xl bg-[#0E131C] border border-white/10 text-center mb-4">
            <span className="text-[10px] text-white/40 uppercase font-bold block mb-1">
              Votre Hypothèse (3 chiffres distincts) :
            </span>
            <div className="font-mono text-3xl font-black tracking-[0.3em] text-white h-10 flex items-center justify-center">
              {guessInput.padEnd(3, '•')}
            </div>
          </div>

          {/* Pavé numérique tactile */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map(btn => (
              <button
                key={btn}
                onClick={() => {
                  if (btn === 'C') setGuessInput('');
                  else if (btn === '⌫') handleBackspaceNumber();
                  else handleNumberInput(btn);
                }}
                className="h-13 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 font-mono text-lg font-black active:bg-white/20 transition-all"
              >
                {btn}
              </button>
            ))}
          </div>

          {/* Boutons d'actions */}
          <div className="space-y-2">
            <button
              onClick={handleSubmitGuess}
              disabled={guessInput.length !== 3 || !isMyTurn}
              className={`w-full py-3.5 rounded-xl font-black uppercase text-xs tracking-wider transition-all ${
                guessInput.length === 3 && isMyTurn
                  ? 'bg-[#D4AF37] text-black shadow-lg shadow-[#D4AF37]/20'
                  : 'bg-white/10 text-white/30 cursor-not-allowed'
              }`}
            >
              Proposer ce Nombre
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleBuyClue('sum')}
                className="py-2.5 rounded-xl bg-white/5 border border-white/10 text-[11px] font-bold text-white/70 hover:text-white"
              >
                💡 Indice Somme
              </button>
              <button
                onClick={() => handleBuyClue('parity')}
                className="py-2.5 rounded-xl bg-white/5 border border-white/10 text-[11px] font-bold text-white/70 hover:text-white"
              >
                ⚖️ Indice Parité
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. MANETTE : THE VIRUS GAME */}
      {/* ========================================================= */}
      {subGameId === 'the_virus_game' && (
        <div className="flex-1 flex flex-col justify-between">
          {/* Rôle secret */}
          <div className="p-5 rounded-2xl bg-[#0E131C] border border-white/15 text-center mb-6">
            <span className="text-[10px] uppercase font-black tracking-widest text-[#D4AF37] block mb-1">
              Votre Identité Secrète
            </span>
            <h3 className="font-display font-black text-2xl text-white uppercase">
              {subPrivate.myVirusRole || 'Citoyen'}
            </h3>
            <p className="text-xs text-white/50 mt-1">
              {subPrivate.myVirusRole === 'infected' && 'Contaminez un joueur chaque nuit en secret.'}
              {subPrivate.myVirusRole === 'doctor' && 'Vaccinez un joueur chaque nuit pour le protéger.'}
              {subPrivate.myVirusRole === 'immune' && 'Vous possédez des anticorps naturels. Votez bien !'}
            </p>
          </div>

          {/* Cibles sélectionnables */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-white/60 block mb-2">
              {subState.phase === 'night' ? 'Cible de nuit :' : 'Voter contre un suspect :'}
            </span>
            {room?.players.filter(p => p.id !== localPlayer?.id).map(p => (
              <button
                key={p.id}
                onClick={() => handleVirusTarget(p.id)}
                className="w-full p-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-between text-left transition-all active:scale-98"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{p.avatar || '👤'}</span>
                  <span className="font-bold text-sm text-white">{p.name}</span>
                </div>
                <span className="text-xs text-[#D4AF37] font-bold">Sélectionner →</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. MANETTE : DOUBT AND BET */}
      {/* ========================================================= */}
      {subGameId === 'doubt_and_bet' && (
        <div className="flex-1 flex flex-col justify-between">
          {/* Main secrète de cartes de couleur */}
          <div>
            <span className="text-xs font-bold text-white/60 block mb-2">
              Votre main secrète (5 cartes) :
            </span>
            <div className="grid grid-cols-5 gap-2 mb-6">
              {(subPrivate.myDoubtCards || []).map((card: any) => (
                <div
                  key={card.id}
                  className={`h-20 rounded-xl border flex flex-col items-center justify-center p-2 text-center font-bold ${
                    card.color === 'gold' ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-[#D4AF37]' :
                    card.color === 'red' ? 'bg-red-950/40 border-red-500 text-red-400' :
                    card.color === 'platinum' ? 'bg-slate-300/20 border-slate-300 text-slate-200' :
                    'bg-slate-900 border-white/20 text-white'
                  }`}
                >
                  <span className="text-[10px] uppercase font-black">{card.color}</span>
                  <span className="font-mono text-xl">{card.value}</span>
                </div>
              ))}
            </div>

            {/* Surenchère */}
            <div className="p-4 rounded-2xl bg-[#0E131C] border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white/60 uppercase">Couleur :</span>
                <div className="flex gap-2">
                  {['black', 'red', 'platinum', 'gold'].map(c => (
                    <button
                      key={c}
                      onClick={() => setSelectedBidColor(c)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase ${
                        selectedBidColor === c ? 'bg-[#D4AF37] text-black' : 'bg-white/5 text-white/50'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white/60 uppercase">Quantité :</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSelectedBidQty(Math.max(1, selectedBidQty - 1))}
                    className="w-8 h-8 rounded-lg bg-white/10 font-bold"
                  >
                    -
                  </button>
                  <span className="font-mono text-lg font-black text-white">{selectedBidQty}</span>
                  <button
                    onClick={() => setSelectedBidQty(selectedBidQty + 1)}
                    className="w-8 h-8 rounded-lg bg-white/10 font-bold"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3 mt-6">
            <button
              onClick={handleSubmitBid}
              disabled={!isMyTurn}
              className={`w-full py-4 rounded-2xl font-black uppercase text-sm tracking-wider ${
                isMyTurn ? 'bg-[#D4AF37] text-black shadow-lg shadow-[#D4AF37]/20' : 'bg-white/10 text-white/30'
              }`}
            >
              Surenchérir ({selectedBidQty} {selectedBidColor})
            </button>

            <button
              onClick={handleCallDoubt}
              className="w-full py-4 rounded-2xl bg-red-600 hover:bg-red-500 font-black uppercase text-sm tracking-wider text-white shadow-lg shadow-red-600/30 active:scale-95"
            >
              🚨 CRIER « DOUTE ! »
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 6. MANETTE : EQUATION PYRAMID */}
      {/* ========================================================= */}
      {subGameId === 'equation_pyramid' && (
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <div className="text-center mb-4">
              <span className="text-xs font-bold text-pink-400 uppercase tracking-wider">
                Objectif Sommet : {subState.targetSum}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-[#0E131C] border border-white/10 space-y-4">
              <span className="text-xs font-bold text-white/60 block">Saisissez les 3 tuiles de base :</span>
              <div className="grid grid-cols-3 gap-3">
                {[0, 1, 2].map(slotIdx => (
                  <input
                    key={slotIdx}
                    type="number"
                    value={pyramidBase[slotIdx] ?? ''}
                    onChange={(e) => {
                      const val = e.target.value === '' ? null : Number(e.target.value);
                      setPyramidBase(prev => {
                        const copy = [...prev];
                        copy[slotIdx] = val;
                        return copy;
                      });
                    }}
                    placeholder={`Bloc ${slotIdx + 1}`}
                    className="h-14 rounded-xl bg-white/5 border border-white/15 text-center font-mono text-xl font-bold text-white outline-none focus:border-pink-500"
                  />
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={handleSubmitPyramid}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-600 text-white font-black uppercase text-sm tracking-wider shadow-lg shadow-pink-500/20 active:scale-95"
          >
            Valider la Pyramide
          </button>
        </div>
      )}

      {/* ========================================================= */}
      {/* 7. MANETTE : KNIGHT'S TOUR */}
      {/* ========================================================= */}
      {subGameId === 'knights_tour' && (
        <div className="flex-1 flex flex-col justify-between">
          <div className="text-center mb-4">
            <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider">
              {isMyTurn ? 'Choisissez votre saut de Cavalier :' : 'Tour de votre adversaire...'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {(subState.validMoves || []).map((m: any, i: number) => (
              <button
                key={i}
                onClick={() => handleMoveKnight(m.row, m.col)}
                disabled={!isMyTurn}
                className="py-4 rounded-xl bg-[#121722] border border-emerald-500/40 text-emerald-400 font-mono font-bold text-base active:bg-emerald-500/20"
              >
                Ligne {m.row + 1}, Col {m.col + 1}
              </button>
            ))}
          </div>

          {subState.validMoves?.length === 0 && (
            <div className="text-center py-8 text-red-400 font-bold text-sm">
              Aucun mouvement légal disponible !
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* 8. MANETTE : NINE MEN'S MORRIS */}
      {/* ========================================================= */}
      {subGameId === 'nine_mens_morris' && (
        <div className="flex-1 flex flex-col justify-between">
          <div className="p-4 rounded-2xl bg-[#0E131C] border border-white/10 text-center mb-4">
            <span className="text-xs font-black uppercase tracking-wider text-[#D4AF37] block">
              {subState.mustRemovePiece
                ? '⚔️ MOULIN ! Tapez sur un pion adverse à éliminer'
                : subState.phase === 'placement'
                ? 'Tapez sur une case libre (0 à 23) pour poser un pion'
                : 'Sélectionnez votre pion puis sa destination'}
            </span>
          </div>

          <div className="grid grid-cols-6 gap-2">
            {Array.from({ length: 24 }).map((_, idx) => {
              const color = subState.board?.[idx];
              const isSelected = selectedMorrisFrom === idx;
              return (
                <button
                  key={idx}
                  onClick={() => handleMorrisPointClick(idx)}
                  className={`h-11 rounded-lg border font-mono text-xs font-bold transition-all ${
                    isSelected
                      ? 'bg-[#D4AF37] text-black border-white ring-2 ring-[#D4AF37]'
                      : color === 'white'
                      ? 'bg-white text-black border-slate-300'
                      : color === 'black'
                      ? 'bg-slate-900 text-white border-white/40'
                      : 'bg-[#121722] text-white/30 border-white/10'
                  }`}
                >
                  {idx}
                </button>
              );
            })}
          </div>

          <div className="text-[11px] text-white/40 text-center mt-4">
            Blanc : {subState.piecesOnBoard?.white || 0} sur plateau • Noir : {subState.piecesOnBoard?.black || 0} sur plateau
          </div>
        </div>
      )}
    </div>
  );
};
