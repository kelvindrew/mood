import React, { useState } from 'react';
import { useGame } from '../../../context/GameContext';
import { SpyGameState } from '../../../types/game';
import { MobileHeader } from '../../components/MobileHeader';
import { ReactionFlinger } from '../../components/ReactionFlinger';
import { triggerHaptic, hapticPatterns } from '../../components/HapticFeedback';
import { audio } from '../../../services/audio';
import {
  Eye,
  EyeOff,
  Fingerprint,
  Send,
  Vote,
  AlertTriangle,
  RotateCcw,
  Crown,
  Trophy,
  Shield,
  HelpCircle,
} from 'lucide-react';

export const SpyController: React.FC = () => {
  const { room, localPlayer, sendGameAction } = useGame();
  const gameState = room?.gameState as SpyGameState | undefined;

  // C2: All hooks before early returns
  const [showSecretWord, setShowSecretWord] = useState<boolean>(false);
  const [clueInput, setClueInput] = useState<string>('');
  const [selectedVoteTargetId, setSelectedVoteTargetId] = useState<string | null>(null);
  const [guessInput, setGuessInput] = useState<string>('');

  if (!gameState || !localPlayer) return null;

  const {
    phase,
    round,
    timer,
    category,
    players,
    myRole = 'civil',
    myWord = '???',
    isAlive = true,
    myClue = '',
    myVote = null,
    isMyTurnToSpeak = false,
    canGuessWord = false,
    winner,
    finalPodium,
    isGameOver,
  } = gameState;

  const currentSpeaker = players.find((p) => p.id === gameState.currentSpeakerId);
  const myPodiumInfo = finalPodium?.find((p) => p.id === localPlayer.id);

  const handleSubmitClue = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!clueInput.trim() || !isMyTurnToSpeak) return;

    triggerHaptic(hapticPatterns.success);
    audio.playSelect();
    sendGameAction('spy_submit_clue', { clue: clueInput.trim() });
    setClueInput('');
  };

  const handleSpokenAloud = () => {
    if (!isMyTurnToSpeak) return;
    triggerHaptic(hapticPatterns.tap);
    audio.playSelect();
    sendGameAction('spy_submit_clue', { clue: 'Indice donné à l’oral 🗣️' });
  };

  const handleConfirmVote = () => {
    if (!selectedVoteTargetId || !isAlive || phase !== 'vote') return;

    triggerHaptic(hapticPatterns.success);
    audio.playSelect();
    sendGameAction('spy_vote', { targetPlayerId: selectedVoteTargetId });
  };

  const handleSubmitGuess = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!guessInput.trim() || !canGuessWord) return;

    triggerHaptic(hapticPatterns.success);
    audio.playSelect();
    sendGameAction('spy_guess_word', { word: guessInput.trim() });
    setGuessInput('');
  };

  // GAMEOVER VIEW
  if (isGameOver) {
    const isWinner = myPodiumInfo?.isWinner;
    return (
      <div className="min-h-screen flex flex-col justify-between bg-[#07090F] text-white select-none">
        <MobileHeader />

        <main className="p-4 flex-1 flex flex-col justify-center items-center text-center space-y-5 max-w-sm mx-auto w-full animate-scale-in">
          <div className="p-5 rounded-full bg-amber-500/20 border-2 border-amber-400 text-amber-300 shadow-[0_0_50px_rgba(251,191,36,0.4)]">
            {isWinner ? <Crown className="w-16 h-16 fill-current animate-bounce" /> : <Trophy className="w-16 h-16" />}
          </div>

          <div className="space-y-1">
            <span className="text-xs font-black uppercase tracking-widest text-[#FBBF24]">PARTIE TERMINÉE</span>
            <h1 className="text-3xl font-black font-display text-white">
              {isWinner ? '🎉 VICTOIRE !' : 'DÉFAITE'}
            </h1>
            <p className="text-xs text-gray-400">
              {winner === 'civils' ? 'Les Citoyens ont triomphé !' : 'Les Espions ont pris le contrôle !'}
            </p>
          </div>

          <div className="w-full p-4 rounded-3xl bg-white/[0.07] border border-white/15 space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-300 font-bold uppercase">Votre rôle était</span>
              <span className="font-bold text-sm text-[#FBBF24] uppercase">
                {myRole === 'spy' ? '🕵️ Espion' : myRole === 'white' ? '👻 Infiltré' : '👤 Citoyen'}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-400 border-t border-white/10 pt-2">
              <span>Points gagnés</span>
              <span className="text-emerald-400 font-bold font-mono text-base">+{myPodiumInfo?.score || 0} pts</span>
            </div>
          </div>

          <button
            onClick={() => sendGameAction('spy_restart')}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-sm uppercase tracking-wider shadow-lg flex items-center justify-center space-x-2 active:scale-95 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span>REJOUER UNE MANCHE</span>
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#07090F] text-white select-none relative overflow-x-hidden">
      <MobileHeader />

      <main className="p-4 flex-1 flex flex-col justify-between space-y-3.5 max-w-md mx-auto w-full pb-6">
        {/* Top Status Bar */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.06] border border-white/10 text-xs">
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-amber-400" />
            <span className="font-bold text-gray-300 uppercase">Thème : {category}</span>
          </div>
          <span className="font-mono font-bold text-amber-400">
            {phase === 'vote' ? 'Vote' : phase === 'clue' ? 'Indices' : 'Briefing'} • {timer}s
          </span>
        </div>

        {/* SECRET WORD PEEK CARD (Tap & Hold to Reveal) */}
        <div className="p-4 rounded-3xl bg-gradient-to-b from-white/[0.08] to-white/[0.03] border-2 border-amber-400/40 shadow-2xl text-center space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
              MOT CONFIDENTIEL
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                myRole === 'spy'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-400/30'
                  : myRole === 'white'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
              }`}
            >
              {myRole === 'spy' ? 'Espion' : myRole === 'white' ? 'Infiltré' : 'Citoyen'}
            </span>
          </div>

          <div
            onPointerDown={() => {
              triggerHaptic(hapticPatterns.tap);
              setShowSecretWord(true);
            }}
            onPointerUp={() => setShowSecretWord(false)}
            onPointerLeave={() => setShowSecretWord(false)}
            className={`p-5 rounded-2xl border transition-all cursor-pointer select-none flex flex-col items-center justify-center min-h-[90px] ${
              showSecretWord
                ? 'bg-amber-400 text-gray-950 border-amber-300 shadow-[0_0_30px_rgba(251,191,36,0.4)] scale-102'
                : 'bg-black/50 border-white/15 text-gray-400 active:scale-98'
            }`}
          >
            {showSecretWord ? (
              <div className="space-y-0.5 animate-scale-in">
                <span className="text-2xl font-black font-display tracking-wide uppercase">
                  "{myWord}"
                </span>
                <div className="text-[10px] font-mono font-bold opacity-80">
                  {myRole === 'white' ? 'Vous ne connaissez pas le mot !' : 'Retenez bien ce mot'}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-1.5">
                <Fingerprint className="w-8 h-8 text-amber-400 animate-pulse" />
                <span className="text-xs font-bold text-gray-300">
                  Maintenez le doigt pour révéler
                </span>
              </div>
            )}
          </div>
        </div>

        {/* INTERACTIVE CONTROLS BY PHASE */}

        {/* Phase 1: Reveal briefing */}
        {phase === 'reveal' && (
          <div className="p-4 rounded-2xl bg-black/40 border border-white/10 text-center space-y-2">
            <span className="text-xs text-gray-300">
              Regardez votre mot en secret. La manche va bientôt débuter !
            </span>
          </div>
        )}

        {/* Phase 2: Clue Giving */}
        {phase === 'clue' && (
          <div className="space-y-3">
            {isMyTurnToSpeak ? (
              <div className="p-4 rounded-3xl bg-amber-400/15 border-2 border-amber-400 shadow-xl space-y-3 animate-scale-in">
                <div className="text-center space-y-0.5">
                  <span className="text-xs font-black uppercase text-amber-300 tracking-wider">
                    🌟 C'EST À VOUS DE PARLER !
                  </span>
                  <p className="text-xs text-gray-300">
                    Donnez un indice oral ou tapez un mot court ci-dessous :
                  </p>
                </div>

                <form onSubmit={handleSubmitClue} className="space-y-2">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      maxLength={35}
                      value={clueInput}
                      onChange={(e) => setClueInput(e.target.value)}
                      placeholder="Votre indice..."
                      className="flex-1 px-3.5 py-3 rounded-xl bg-black/60 border border-white/20 text-white font-bold text-sm focus:outline-none focus:border-amber-400"
                    />
                    <button
                      type="submit"
                      disabled={!clueInput.trim()}
                      className="px-4 py-3 rounded-xl bg-amber-400 text-gray-950 font-black text-xs uppercase disabled:opacity-30 shadow"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleSpokenAloud}
                    className="w-full py-2.5 rounded-xl bg-white/10 border border-white/15 text-xs text-gray-200 font-bold hover:bg-white/20 transition-all"
                  >
                    J’ai déjà parlé à voix haute 🗣️
                  </button>
                </form>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 text-center space-y-1">
                <span className="text-xs text-gray-400">Tour de parole en cours :</span>
                <div className="font-bold text-sm text-white">
                  {currentSpeaker?.name || 'Un joueur'} donne son indice...
                </div>
              </div>
            )}
          </div>
        )}

        {/* Phase 3: Voting */}
        {phase === 'vote' && (
          <div className="space-y-3 animate-scale-in">
            <div className="text-center space-y-0.5">
              <span className="text-xs font-black uppercase text-rose-400 tracking-wider">
                VOTE D'ÉLIMINATION
              </span>
              <p className="text-xs text-gray-400">
                Qui pensez-vous être l'Espion ? Touchez un joueur pour voter :
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-0.5">
              {players
                .filter((p) => p.alive && p.id !== localPlayer.id)
                .map((p) => {
                  const isSelected = selectedVoteTargetId === p.id;
                  const hasAlreadyVotedForHim = myVote === p.id;

                  return (
                    <button
                      key={p.id}
                      onClick={() => {
                        triggerHaptic(hapticPatterns.tap);
                        setSelectedVoteTargetId(p.id);
                      }}
                      className={`p-3 rounded-2xl border text-left flex items-center space-x-2.5 transition-all ${
                        isSelected || hasAlreadyVotedForHim
                          ? 'bg-rose-600 text-white ring-2 ring-rose-400 shadow-lg scale-102'
                          : 'bg-black/50 border-white/10 text-gray-300 hover:bg-white/10'
                      }`}
                    >
                      <span className="text-xl">{p.avatar || '👤'}</span>
                      <div className="truncate text-xs font-bold">{p.name}</div>
                    </button>
                  );
                })}
            </div>

            <button
              disabled={!selectedVoteTargetId || !!myVote}
              onClick={handleConfirmVote}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 to-red-600 text-white font-black text-xs uppercase tracking-wider shadow-lg disabled:opacity-30 active:scale-95 transition-all"
            >
              {myVote ? 'VOTE ENREGISTRÉ ✓' : 'CONFIRMER L’ÉLIMINATION'}
            </button>
          </div>
        )}

        {/* Phase 5: Guess Word Modal for Eliminated Spy */}
        {phase === 'guess' && canGuessWord && (
          <div className="p-4 rounded-3xl bg-cyan-500/15 border-2 border-cyan-400 shadow-2xl space-y-3 animate-scale-in">
            <div className="text-center space-y-1">
              <span className="text-xs font-black uppercase text-cyan-300 tracking-wider">
                DERNIÈRE CHANCE DE VICTOIRE !
              </span>
              <p className="text-xs text-gray-300">
                Devinez le mot secret des Citoyens pour voler la victoire :
              </p>
            </div>

            <form onSubmit={handleSubmitGuess} className="flex space-x-2">
              <input
                type="text"
                value={guessInput}
                onChange={(e) => setGuessInput(e.target.value)}
                placeholder="Votre supposition..."
                className="flex-1 px-3.5 py-3 rounded-xl bg-black/60 border border-white/20 text-white font-bold text-sm focus:outline-none focus:border-cyan-400"
              />
              <button
                type="submit"
                disabled={!guessInput.trim()}
                className="px-4 py-3 rounded-xl bg-cyan-400 text-gray-950 font-black text-xs uppercase disabled:opacity-30 shadow"
              >
                Deviner
              </button>
            </form>
          </div>
        )}

        <ReactionFlinger />
      </main>
    </div>
  );
};
