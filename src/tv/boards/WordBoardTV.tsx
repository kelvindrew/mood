import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '../../context/GameContext';
import { ScrabbleGameState, ScrabbleWordHistoryItem } from '../../types/game';
import { getFrenchDefinition, WordDefinitionItem } from '../../data/frenchDefinitions';
import {
  Clock,
  Trophy,
  Award,
  Sparkles,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Flame,
  Crown,
  RotateCcw,
  Home,
  Bookmark,
  Search,
  History,
  GraduationCap,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Star,
  Zap,
} from 'lucide-react';

function getMultiplier(r: number, c: number): string {
  if (r === 7 && c === 7) return 'CENTER';
  if ((r === 0 || r === 7 || r === 14) && (c === 0 || c === 7 || c === 14) && !(r === 7 && c === 7)) return 'TW';
  if ((r === c || r + c === 14) && ((r >= 1 && r <= 4) || (r >= 10 && r <= 13))) return 'DW';
  if ((r === 1 || r === 5 || r === 9 || r === 13) && (c === 5 || c === 9) ||
      (r === 5 || r === 9) && (c === 1 || c === 13)) return 'TL';
  if (
    (r === 0 || r === 14) && (c === 3 || c === 11) ||
    (r === 2 || r === 12) && (c === 6 || c === 8) ||
    (r === 3 || r === 11) && (c === 0 || c === 7 || c === 14) ||
    (r === 6 || r === 8) && (c === 2 || c === 6 || c === 8 || c === 12) ||
    (r === 7) && (c === 3 || c === 11)
  ) return 'DL';
  return 'NONE';
}

const MULTIPLIERS_MAP: Record<string, { label: string; bg: string; text: string; full: string }> = {
  TW: { label: 'MT', bg: 'bg-rose-600', text: 'text-white', full: 'Mot Triple (x3)' },
  DW: { label: 'MD', bg: 'bg-pink-500', text: 'text-white', full: 'Mot Double (x2)' },
  TL: { label: 'LT', bg: 'bg-blue-600', text: 'text-white', full: 'Lettre Triple (x3)' },
  DL: { label: 'LD', bg: 'bg-sky-500', text: 'text-white', full: 'Lettre Double (x2)' },
  CENTER: { label: '★', bg: 'bg-gradient-to-tr from-amber-500 to-amber-300', text: 'text-black', full: 'Case Départ (MD x2)' },
};

export const WordBoardTV: React.FC = () => {
  const { room, setTvView, sendGameAction } = useGame();
  const gameState = room?.gameState as ScrabbleGameState | undefined;

  const [endStage, setEndStage] = useState<number>(1);
  const [selectedWordHistory, setSelectedWordHistory] = useState<ScrabbleWordHistoryItem | null>(null);
  const [showCelebrationBanner, setShowCelebrationBanner] = useState<boolean>(true);
  const historyScrollRef = useRef<HTMLDivElement>(null);

  const isGameOver = !!(gameState?.isGameOver || gameState?.winner);

  // Progressive animation sequence on Game Over
  useEffect(() => {
    if (isGameOver) {
      setEndStage(1);
      const t1 = setTimeout(() => setEndStage(2), 2200);
      const t2 = setTimeout(() => setEndStage(3), 4200);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    } else {
      setEndStage(1);
    }
  }, [isGameOver]);

  // Flash celebration banner on new word played
  useEffect(() => {
    if (gameState?.lastWordPlayed) {
      setShowCelebrationBanner(true);
    }
  }, [gameState?.lastWordPlayed?.timestamp, gameState?.lastWordPlayed?.word]);

  if (!gameState) {
    return <div className="p-10 text-white font-bold text-center">Chargement du plateau Scrabble...</div>;
  }

  const currentPlayer = room?.players.find((p) => p.id === gameState.currentPlayerId);
  const winnerPlayer = gameState.finalPodium?.[0];

  // Active word definition to display in the dictionary panel
  const currentWordToDefine: WordDefinitionItem = (() => {
    if (selectedWordHistory) {
      return {
        word: selectedWordHistory.word,
        nature: selectedWordHistory.nature || 'nom / mot ODS',
        def: selectedWordHistory.definition || getFrenchDefinition(selectedWordHistory.word).def,
      };
    }
    if (gameState.lastWordPlayed && gameState.lastWordPlayed.isValid !== false) {
      return {
        word: gameState.lastWordPlayed.word,
        nature: gameState.lastWordPlayed.nature || getFrenchDefinition(gameState.lastWordPlayed.word).nature,
        def: gameState.lastWordPlayed.definition || getFrenchDefinition(gameState.lastWordPlayed.word).def,
      };
    }
    return {
      word: 'SCRABBLE',
      nature: 'jeu de lettres officiel',
      def: 'Jeu de société de lettres et de stratégie combinatoire sur plateau 15×15 homologué ODS.',
    };
  })();

  const handleScrollHistory = (direction: 'up' | 'down') => {
    if (historyScrollRef.current) {
      const scrollAmount = direction === 'up' ? -120 : 120;
      historyScrollRef.current.scrollBy({ top: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleReplay = () => {
    sendGameAction('word_restart');
  };

  const lastPlacedSet = new Set(
    (gameState.lastPlacedTileCoords || []).map((coord) => `${coord.row}_${coord.col}`)
  );

  const totalWordsCount = gameState.playedWordsHistory?.length || (gameState.lastWordPlayed ? 1 : 0);

  return (
    <div className="w-full min-h-screen flex items-center justify-between px-8 py-3.5 select-none bg-[#070D0B] text-white relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-900/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-900/15 rounded-full blur-[140px] pointer-events-none" />

      {/* 1. Left Column: Turn info & Live Leaderboard */}
      <div className="w-72 flex flex-col justify-between h-[92vh] space-y-3 z-10 flex-shrink-0">
        {/* Active Player Card */}
        <div className="p-4 rounded-3xl bg-white/[0.06] border border-white/15 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#FBBF24]">TOUR DU JOUEUR</span>
            <div className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-black/40 border border-white/10">
              <Clock className="w-3.5 h-3.5 text-[#FBBF24]" />
              <span className="font-mono font-bold text-xs text-[#FBBF24]">{gameState.turnTimeLeft}s</span>
            </div>
          </div>

          <div className="flex items-center space-x-3 my-2">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#10B981] to-[#059669] border border-white/20 flex items-center justify-center text-white font-black text-lg shadow-lg">
              {currentPlayer?.name.charAt(0).toUpperCase() || 'J'}
            </div>
            <div className="truncate">
              <h2 className="text-base font-black font-display text-white truncate">{currentPlayer?.name || 'Joueur'}</h2>
              <span className="text-[10px] text-gray-400 font-semibold">Posez vos lettres</span>
            </div>
          </div>

          {/* Turn timer progress bar */}
          <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden mt-1">
            <div
              className={`h-full transition-all duration-1000 ${
                gameState.turnTimeLeft <= 10 ? 'bg-rose-500 animate-pulse' : 'bg-[#10B981]'
              }`}
              style={{ width: `${Math.max(0, Math.min(100, (gameState.turnTimeLeft / 45) * 100))}%` }}
            />
          </div>
        </div>

        {/* Players Leaderboard */}
        <div className="p-4 rounded-3xl bg-white/[0.06] border border-white/10 backdrop-blur-md space-y-2.5 flex-1 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-gray-300">
            <span>CLASSEMENT EN DIRECT</span>
            <Trophy className="w-4 h-4 text-[#FBBF24]" />
          </div>

          <div className="space-y-1.5 flex-1">
            {room?.players.map((p, idx) => {
              const score = (gameState.playerScores && gameState.playerScores[p.id]) || 0;
              const isCurrent = p.id === gameState.currentPlayerId;
              return (
                <div
                  key={p.id}
                  className={`flex items-center justify-between p-2.5 rounded-2xl border transition-all ${
                    isCurrent
                      ? 'bg-[#10B981]/25 border-[#10B981] text-white shadow-[0_0_20px_rgba(16,185,129,0.4)] scale-102'
                      : 'bg-black/30 border-white/5 text-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <div className="w-6 h-6 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-xs font-bold text-white">
                      {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-bold text-white truncate max-w-[95px]">{p.name}</div>
                      <div className="text-[9px] text-gray-400">Joueur {idx + 1}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-black text-base text-[#FBBF24]">{score}</div>
                    <div className="text-[8px] text-gray-400 uppercase">PTS</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Log pill */}
          <div className="p-2 rounded-xl bg-black/40 border border-white/10 text-center text-[11px] text-gray-300 font-medium truncate">
            {gameState.lastActionLog || 'La partie commence !'}
          </div>
        </div>
      </div>

      {/* 2. Center Column: Newly Placed Word Celebration Banner + 15x15 Official Grid */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 z-10 max-w-[690px] space-y-2">
        {/* Flash Newly Placed Word Celebration Banner */}
        {gameState.lastWordPlayed && showCelebrationBanner && (
          <div className="w-full px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-500/20 via-emerald-500/20 to-teal-500/20 border-2 border-[#FBBF24]/80 shadow-[0_0_25px_rgba(251,191,36,0.3)] backdrop-blur-xl flex items-center justify-between animate-scale-in">
            <div className="flex items-center space-x-3">
              <div className="p-1.5 rounded-xl bg-amber-400/20 text-[#FBBF24] border border-[#FBBF24]/40">
                <Sparkles className="w-5 h-5 animate-spin-slow" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-300">
                    DERNIER MOT VALIDÉ :
                  </span>
                  <span className="text-lg font-black font-mono tracking-widest text-[#FBBF24] drop-shadow-md">
                    "{gameState.lastWordPlayed.word}"
                  </span>
                  {gameState.lastWordPlayed.isScrabble && (
                    <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-rose-400 text-gray-950 font-black text-[9px] shadow animate-bounce">
                      ✨ SCRABBLE +50 !
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-gray-300 font-medium">
                  Posé par <strong className="text-white">{gameState.lastWordPlayed.player}</strong> •{' '}
                  <span className="italic text-emerald-300">{gameState.lastWordPlayed.nature}</span>
                </span>
              </div>
            </div>

            <div className="text-right pl-3 border-l border-white/15">
              <div className="font-mono font-black text-xl text-[#FBBF24]">+{gameState.lastWordPlayed.points}</div>
              <span className="text-[8px] text-gray-400 uppercase font-bold">POINTS</span>
            </div>
          </div>
        )}

        {/* Scrabble Board Container */}
        <div className="relative p-3 rounded-3xl bg-[#140F0A] border-4 border-[#3A2D23] shadow-[0_25px_60px_rgba(0,0,0,0.9)] w-full aspect-square">
          <div
            className="w-full h-full grid grid-cols-15 grid-rows-15 gap-0.5 bg-[#100C09] p-1 rounded-2xl border border-white/10"
            style={{ gridTemplateColumns: 'repeat(15, minmax(0, 1fr))', gridTemplateRows: 'repeat(15, minmax(0, 1fr))' }}
          >
            {gameState.board.map((row, r) =>
              row.map((tile, c) => {
                const mult = getMultiplier(r, c);
                const multConfig = MULTIPLIERS_MAP[mult];
                const isNewlyPlaced = lastPlacedSet.has(`${r}_${c}`);

                if (tile) {
                  return (
                    <div
                      key={`tile_${r}_${c}`}
                      className={`relative w-full h-full rounded-xs shadow-md flex items-center justify-center font-display font-black text-xs lg:text-sm select-none leading-none transition-all ${
                        isNewlyPlaced
                          ? 'bg-gradient-to-br from-[#FFFBEB] to-[#FDE68A] text-gray-950 border-2 border-[#FBBF24] ring-2 ring-[#FBBF24]/80 shadow-[0_0_14px_rgba(251,191,36,0.9)] z-20 scale-105'
                          : 'bg-[#FBF2DE] text-gray-950 border border-[#D5C29A]'
                      }`}
                    >
                      {isNewlyPlaced && (
                        <span className="absolute top-0.5 left-0.5 text-[6px] text-amber-700 leading-none">
                          ★
                        </span>
                      )}
                      <span>{tile.letter}</span>
                      <span className="absolute bottom-0.5 right-0.5 text-[7px] lg:text-[8px] font-sans font-bold text-gray-700 leading-none">
                        {tile.points}
                      </span>
                    </div>
                  );
                }

                if (multConfig) {
                  return (
                    <div
                      key={`cell_${r}_${c}`}
                      className={`w-full h-full rounded-xs flex flex-col items-center justify-center font-sans font-black text-[8px] lg:text-[9px] select-none leading-none ${multConfig.bg} ${multConfig.text} opacity-90 shadow-sm`}
                      title={multConfig.full}
                    >
                      <span>{multConfig.label}</span>
                    </div>
                  );
                }

                return (
                  <div
                    key={`cell_${r}_${c}`}
                    className="w-full h-full rounded-xs bg-[#251D17]/90 border border-white/[0.03]"
                  />
                );
              })
            )}
          </div>
        </div>

        {/* Multipliers Legend */}
        <div className="flex items-center space-x-5 mt-2 text-xs font-bold text-gray-300">
          <div className="flex items-center space-x-1.5">
            <span className="w-3.5 h-3.5 rounded bg-rose-600 flex items-center justify-center text-[8px] font-black text-white">MT</span>
            <span className="text-[11px]">Mot Triple (x3)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3.5 h-3.5 rounded bg-pink-500 flex items-center justify-center text-[8px] font-black text-white">MD</span>
            <span className="text-[11px]">Mot Double (x2)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3.5 h-3.5 rounded bg-blue-600 flex items-center justify-center text-[8px] font-black text-white">LT</span>
            <span className="text-[11px]">Lettre Triple (x3)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3.5 h-3.5 rounded bg-sky-500 flex items-center justify-center text-[8px] font-black text-white">LD</span>
            <span className="text-[11px]">Lettre Double (x2)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3.5 h-3.5 rounded bg-amber-400 border border-white flex items-center justify-center text-[8px] font-black text-black">★</span>
            <span className="text-[11px] text-amber-300">Nouveau mot</span>
          </div>
        </div>
      </div>

      {/* 3. Right Column: Tile Bag Card + Scrollable "Petit Dico Scrabble" & History */}
      <div className="w-84 flex flex-col justify-between h-[92vh] space-y-3 z-10 flex-shrink-0">
        {/* Remaining Tiles Bag Status Card */}
        <div className="p-3.5 rounded-3xl bg-white/[0.06] border border-white/15 shadow-xl backdrop-blur-xl space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-[#38BDF8]">
              <Layers className="w-4 h-4 text-sky-400" />
              <span className="text-xs font-black uppercase tracking-wider text-white">
                SAC DE TUILES
              </span>
            </div>
            <span className="px-2.5 py-0.5 rounded-xl bg-sky-500/20 border border-sky-500/40 text-sky-300 font-mono text-xs font-black shadow-sm">
              {gameState.letterBagCount} / 102
            </span>
          </div>

          {/* Progress bar of remaining tiles */}
          <div className="space-y-1">
            <div className="w-full h-2 rounded-full bg-black/40 border border-white/10 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  gameState.letterBagCount === 0
                    ? 'bg-rose-500'
                    : gameState.letterBagCount <= 15
                    ? 'bg-amber-400 animate-pulse'
                    : 'bg-gradient-to-r from-[#38BDF8] to-[#10B981]'
                }`}
                style={{ width: `${Math.max(0, Math.min(100, (gameState.letterBagCount / 102) * 100))}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-gray-400 font-bold">
              <span>
                {gameState.letterBagCount === 0
                  ? '⚠️ Sac vide (Sprint final !)'
                  : gameState.letterBagCount <= 15
                  ? '⚡ Dernières tuiles disponibles'
                  : '✨ Pioche active'}
              </span>
              <span className="font-mono text-gray-300">
                {Math.round((gameState.letterBagCount / 102) * 100)}%
              </span>
            </div>
          </div>
        </div>

        {/* Dictionary Card with Scrollable History */}
        <div className="p-4 rounded-3xl bg-gradient-to-b from-[#1C2826]/95 to-[#0F1715]/95 border-2 border-[#10B981]/50 shadow-2xl backdrop-blur-xl space-y-3 flex-1 flex flex-col justify-between overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-2 flex-shrink-0">
            <div className="flex items-center space-x-2 text-[#10B981]">
              <BookOpen className="w-5 h-5 text-emerald-400" />
              <span className="text-xs font-black uppercase tracking-wider text-white">
                LE PETIT DICO SCRABBLE
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-black font-mono">
              ODS
            </span>
          </div>

          {/* Featured Definition Box */}
          <div className="p-3.5 rounded-2xl bg-black/55 border border-white/15 space-y-1.5 shadow-inner flex-shrink-0 animate-scale-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bookmark className="w-4 h-4 text-[#FBBF24]" />
                <span className="text-lg font-black font-mono tracking-widest text-[#FBBF24]">
                  "{currentWordToDefine.word}"
                </span>
              </div>
              {selectedWordHistory ? (
                <button
                  onClick={() => setSelectedWordHistory(null)}
                  className="text-[10px] px-2 py-0.5 rounded-md bg-white/10 text-gray-300 hover:text-white flex items-center space-x-1"
                >
                  <RotateCcw className="w-2.5 h-2.5" />
                  <span>Dernier mot</span>
                </button>
              ) : gameState.lastWordPlayed ? (
                <span className="px-2 py-0.5 rounded bg-emerald-500/30 text-emerald-300 font-bold text-[10px]">
                  +{gameState.lastWordPlayed.points} pts
                </span>
              ) : null}
            </div>

            {/* Nature / Grammatical Category */}
            <div className="text-[11px] font-bold italic text-emerald-300 font-serif">
              — {currentWordToDefine.nature}
            </div>

            {/* Definition Text */}
            <p className="text-xs text-gray-200 leading-relaxed font-sans pt-1 border-t border-white/10 line-clamp-3">
              {currentWordToDefine.def}
            </p>
          </div>

          {/* Scrollable Words Found History Section */}
          <div className="flex-1 flex flex-col min-h-0 space-y-1.5 pt-1 border-t border-white/10">
            <div className="flex items-center justify-between text-[11px] font-bold text-gray-400 px-1 flex-shrink-0">
              <span className="flex items-center space-x-1 text-gray-300">
                <History className="w-3.5 h-3.5 text-[#38BDF8]" />
                <span>Mots trouvés ({totalWordsCount}) :</span>
              </span>

              {/* Scroll Controls for TV remote & click */}
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => handleScrollHistory('up')}
                  className="p-1 rounded-md bg-white/10 hover:bg-white/20 active:scale-90 text-gray-300 hover:text-white transition-all"
                  title="Défiler vers le haut"
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleScrollHistory('down')}
                  className="p-1 rounded-md bg-white/10 hover:bg-white/20 active:scale-90 text-gray-300 hover:text-white transition-all"
                  title="Défiler vers le bas"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Scrollable List of All Played Words */}
            <div
              ref={historyScrollRef}
              className="flex-1 overflow-y-auto pr-1 space-y-1.5 scroll-smooth custom-scrollbar"
              style={{ maxHeight: '180px' }}
            >
              {gameState.playedWordsHistory && gameState.playedWordsHistory.length > 0 ? (
                gameState.playedWordsHistory.map((item, idx) => {
                  const isSelected = selectedWordHistory?.word === item.word;
                  return (
                    <button
                      key={`hist_${idx}_${item.word}_${item.timestamp || idx}`}
                      onClick={() => setSelectedWordHistory(item)}
                      className={`w-full p-2 rounded-xl text-left flex items-center justify-between text-xs border transition-all ${
                        isSelected
                          ? 'bg-[#10B981]/30 border-[#10B981] text-white shadow-md scale-101'
                          : 'bg-black/35 border-white/5 text-gray-300 hover:bg-white/10 hover:border-white/15'
                      }`}
                    >
                      <div className="flex items-center space-x-2 truncate">
                        <span className="font-black font-mono text-[#FBBF24] text-xs">{item.word}</span>
                        <span className="text-[10px] text-gray-400 truncate">({item.player})</span>
                      </div>
                      <div className="flex items-center space-x-1.5 flex-shrink-0">
                        <span className="font-mono font-bold text-[10px] text-emerald-400">+{item.points}</span>
                        <ChevronRight className="w-3 h-3 text-gray-400" />
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="p-3 text-center text-xs text-gray-400 italic bg-black/20 rounded-xl">
                  Les mots joués s'afficheront ici au fil de la partie.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Game Over Stage 1 & 2 & 3: Full End-Game Experience Modal */}
      {isGameOver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/92 backdrop-blur-xl p-8 animate-fade-in">
          {/* Stage 1: "🎉 PARTIE TERMINÉE !" Splash */}
          {endStage === 1 && (
            <div className="text-center space-y-6 animate-scale-in">
              <div className="inline-flex p-6 rounded-full bg-amber-500/20 border-2 border-amber-400 text-amber-300 shadow-[0_0_60px_rgba(251,191,36,0.5)]">
                <Sparkles className="w-20 h-20 animate-spin-slow" />
              </div>
              <h1 className="text-6xl font-black font-display text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-100 to-amber-400 tracking-wider">
                🎉 PARTIE TERMINÉE !
              </h1>
              <p className="text-xl text-gray-300 font-medium">
                {gameState.finisherPlayerName
                  ? `Sac vide — ${gameState.finisherPlayerName} a posé sa dernière lettre !`
                  : 'Calcul final des scores et décompte des lettres...'}
              </p>
            </div>
          )}

          {/* Stage 2: Finisher Announcement */}
          {endStage === 2 && (
            <div className="text-center space-y-6 animate-scale-in max-w-xl">
              <div className="inline-flex p-6 rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-emerald-300 shadow-[0_0_60px_rgba(16,185,129,0.5)]">
                <Crown className="w-20 h-20 fill-current animate-bounce" />
              </div>
              {gameState.finisherPlayerName ? (
                <>
                  <h1 className="text-4xl font-black font-display text-white">
                    🏆 {gameState.finisherPlayerName} a terminé toutes ses lettres !
                  </h1>
                  <p className="text-emerald-300 font-mono text-xl font-bold">
                    + Bonus de clôture attribué avec les lettres des adversaires !
                  </p>
                </>
              ) : (
                <>
                  <h1 className="text-4xl font-black font-display text-white">
                    🏆 Fin de partie par absence de coups !
                  </h1>
                  <p className="text-amber-300 font-mono text-xl font-bold">
                    Déduction des valeurs des lettres restantes dans les chevalets.
                  </p>
                </>
              )}
            </div>
          )}

          {/* Stage 3: Full Official Results Podium & Comprehensive Statistics */}
          {endStage === 3 && (
            <div className="w-full max-w-5xl p-8 rounded-3xl bg-[#140F0A]/95 border-2 border-[#FBBF24]/80 shadow-[0_0_90px_rgba(251,191,36,0.5)] flex flex-col space-y-6 animate-scale-in">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center space-x-3 text-[#FBBF24]">
                  <Trophy className="w-9 h-9 fill-current" />
                  <div>
                    <h2 className="text-2xl font-black font-display uppercase tracking-widest text-white">
                      RÉSULTATS FINAUX & CLASSEMENT
                    </h2>
                    <span className="text-xs text-gray-400">
                      Temps de jeu total : <strong className="text-white font-mono">{gameState.totalDuration || '00:00'}</strong> • Règle Scrabble ODS
                    </span>
                  </div>
                </div>

                <div className="px-5 py-2 rounded-2xl bg-amber-400/20 border border-amber-400 text-amber-300 text-sm font-black flex items-center space-x-2">
                  <Crown className="w-4 h-4 fill-current" />
                  <span>VICTOIRE DE {winnerPlayer?.name || 'CHAMPION'}</span>
                </div>
              </div>

              {/* Podium & Rankings List */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {gameState.finalPodium?.map((item) => {
                  const is1st = item.rank === 1;
                  return (
                    <div
                      key={item.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        is1st
                          ? 'bg-gradient-to-r from-amber-500/25 to-amber-600/10 border-[#FBBF24] shadow-[0_0_30px_rgba(251,191,36,0.3)]'
                          : 'bg-white/5 border-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3.5">
                          <span className="text-3xl font-black font-mono">
                            {item.rank === 1 ? '🥇' : item.rank === 2 ? '🥈' : item.rank === 3 ? '🥉' : '4️⃣'}
                          </span>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h3 className="font-black text-lg text-white">{item.name}</h3>
                              {is1st && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-400 text-gray-950">
                                  GAGNANT
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-gray-400 flex items-center space-x-2 mt-0.5">
                              <span>Jeu : {item.rawScore} pts</span>
                              {item.malusDeducted && item.malusDeducted > 0 ? (
                                <span className="text-rose-400 font-bold">-{item.malusDeducted} malus</span>
                              ) : null}
                              {item.bonusReceived && item.bonusReceived > 0 ? (
                                <span className="text-emerald-400 font-bold">+{item.bonusReceived} bonus</span>
                              ) : null}
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="font-mono font-black text-3xl text-[#FBBF24]">{item.score}</div>
                          <span className="text-[10px] text-gray-400 uppercase font-bold">POINTS FINAUX</span>
                        </div>
                      </div>

                      {/* Stats Pills */}
                      <div className="grid grid-cols-4 gap-1.5 mt-3 pt-2.5 border-t border-white/10 text-center">
                        <div className="p-1.5 rounded-lg bg-black/40">
                          <div className="text-[9px] text-gray-400 uppercase">Meilleur Mot</div>
                          <div className="font-mono font-bold text-xs text-emerald-300 truncate">
                            {item.stats.bestWord || '—'}
                          </div>
                        </div>

                        <div className="p-1.5 rounded-lg bg-black/40">
                          <div className="text-[9px] text-gray-400 uppercase">Coup Max</div>
                          <div className="font-mono font-bold text-xs text-[#38BDF8]">
                            +{item.stats.maxTurnScore} pts
                          </div>
                        </div>

                        <div className="p-1.5 rounded-lg bg-black/40">
                          <div className="text-[9px] text-gray-400 uppercase">Mots Joués</div>
                          <div className="font-mono font-bold text-xs text-white">
                            {item.stats.wordsCount}
                          </div>
                        </div>

                        <div className="p-1.5 rounded-lg bg-black/40">
                          <div className="text-[9px] text-gray-400 uppercase">Scrabbles</div>
                          <div className="font-mono font-bold text-xs text-amber-300">
                            {item.stats.scrabbleCount > 0 ? `✨ ${item.stats.scrabbleCount}` : '0'}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center space-x-4 pt-2 border-t border-white/10">
                <button
                  onClick={handleReplay}
                  className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black text-base uppercase tracking-wider shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center space-x-2"
                >
                  <RotateCcw className="w-5 h-5" />
                  <span>REJOUER LA PARTIE</span>
                </button>

                <button
                  onClick={() => setTvView('home')}
                  className="px-8 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-gray-200 font-black text-base uppercase tracking-wider shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center space-x-2"
                >
                  <Home className="w-5 h-5" />
                  <span>RETOUR AUX JEUX</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
