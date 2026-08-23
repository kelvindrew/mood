import { findBestBotMove } from './botScrabbleAi.js';
import { isValidScrabbleWord } from './scrabbleDictionary.js';
import { getFrenchDefinition } from './frenchDefinitions.js';

export const LETTER_POINTS = {
  A: 1, E: 1, I: 1, L: 1, N: 1, O: 1, R: 1, S: 1, T: 1, U: 1,
  D: 2, G: 2, M: 2,
  B: 3, C: 3, P: 3,
  F: 4, H: 4, V: 4,
  J: 8, Q: 8,
  K: 10, W: 10, X: 10, Y: 10, Z: 10,
};

// Official French Scrabble 102-letter distribution
export const FRENCH_LETTER_DISTRIBUTION = [
  ...'AAAAAAAAA', // 9 A
  ...'BB',        // 2 B
  ...'CC',        // 2 C
  ...'DDD',       // 3 D
  ...'EEEEEEEEEEEEEEE', // 15 E
  ...'FF',        // 2 F
  ...'GG',        // 2 G
  ...'HH',        // 2 H
  ...'IIIIIIII',  // 8 I
  ...'J',         // 1 J
  ...'K',         // 1 K
  ...'LLLLL',     // 5 L
  ...'MMM',       // 3 M
  ...'NNNNNN',    // 6 N
  ...'OOOOOO',    // 6 O
  ...'PPP',       // 3 P
  ...'Q',         // 1 Q
  ...'RRRRRR',    // 6 R
  ...'SSSSSS',    // 6 S
  ...'TTTTTT',    // 6 T
  ...'UUUUUU',    // 6 U
  ...'VV',        // 2 V
  ...'W',         // 1 W
  ...'X',         // 1 X
  ...'Y',         // 1 Y
  ...'Z'          // 1 Z
];

/**
 * Multiplier map for standard 15x15 French Scrabble board
 */
export function getMultiplier(r, c) {
  if (r === 7 && c === 7) return 'CENTER'; // Case centrale (MD x2)
  if ((r === 0 || r === 7 || r === 14) && (c === 0 || c === 7 || c === 14) && !(r === 7 && c === 7)) return 'TW'; // Mot Triple (x3)
  if ((r === c || r + c === 14) && ((r >= 1 && r <= 4) || (r >= 10 && r <= 13))) return 'DW'; // Mot Double (x2)
  if ((r === 1 || r === 5 || r === 9 || r === 13) && (c === 5 || c === 9) ||
      (r === 5 || r === 9) && (c === 1 || c === 13)) return 'TL'; // Lettre Triple (x3)
  if (
    (r === 0 || r === 14) && (c === 3 || c === 11) ||
    (r === 2 || r === 12) && (c === 6 || c === 8) ||
    (r === 3 || r === 11) && (c === 0 || c === 7 || c === 14) ||
    (r === 6 || r === 8) && (c === 2 || c === 6 || c === 8 || c === 12) ||
    (r === 7) && (c === 3 || c === 11)
  ) return 'DL'; // Lettre Double (x2)
  return 'NONE';
}

export class WordEngine {
  constructor(players, onStateChange, onGameOver) {
    this.players = players.map(p => (typeof p === 'string' ? { id: p, name: p, color: 'red', isBot: false } : { ...p }));

    // If only 1 player, add an AI bot companion
    if (this.players.length === 1) {
      this.players.push({
        id: 'bot_scrabble_ai',
        name: 'Dictionnaire IA',
        color: 'blue',
        avatar: 'IA',
        isBot: true,
        botDifficulty: 'medium',
      });
    }

    this.currentTurnIndex = 0;
    this.letterBag = [...FRENCH_LETTER_DISTRIBUTION].sort(() => Math.random() - 0.5);
    this.playerRacks = {};
    this.playerScores = {};
    this.playerStats = {};
    this.winner = null;
    this.winnerName = null;
    this.finisherPlayerName = null;
    this.endGameReason = null;
    this.finalPodium = null;
    this.isGameOver = false;
    this.turnTimeLeft = 45;
    this.lastWordPlayed = null;
    this.lastPlacedTileCoords = [];
    this.playedWordsHistory = [];
    this.consecutivePasses = 0;
    this.startTime = Date.now();
    this.totalDuration = '00:00';
    this.totalDurationSeconds = 0;
    this.lastActionLog = 'La partie de Scrabble commence ! Placez le premier mot sur la case centrale ★.';
    this.onStateChange = onStateChange;
    this.onGameOver = onGameOver;

    // Initialize 15x15 clean board
    this.board = Array(15).fill(null).map(() => Array(15).fill(null));

    // Distribute 7 letters to each player
    for (const player of this.players) {
      this.playerRacks[player.id] = this.drawLetters(7);
      this.playerScores[player.id] = 0;
      this.playerStats[player.id] = {
        wordsCount: 0,
        scrabbleCount: 0,
        bestWord: null,
        bestWordPoints: 0,
        maxTurnScore: 0,
        rawScore: 0,
        finalScore: 0,
        malusDeducted: 0,
        bonusReceived: 0,
        remainingTilesCount: 0,
        remainingTilesValue: 0,
        averageTurnScore: 0,
      };
    }

    this.timer = null;
    this.botTimer = null;
    this.startTurnTimer();
    this.checkBotTurn();
  }

  isBoardEmpty() {
    for (let r = 0; r < 15; r++) {
      for (let c = 0; c < 15; c++) {
        if (this.board[r][c] !== null) return false;
      }
    }
    return true;
  }

  drawLetters(count) {
    const letters = [];
    for (let i = 0; i < count; i++) {
      if (this.letterBag.length === 0) break;
      const letter = this.letterBag.pop();
      letters.push({
        id: Math.random().toString(36).substring(2, 9),
        letter,
        points: LETTER_POINTS[letter] || 1,
      });
    }
    return letters;
  }

  getCurrentPlayer() {
    return this.players[this.currentTurnIndex];
  }

  isCurrentPlayerBot() {
    const p = this.getCurrentPlayer();
    return p ? !!p.isBot : false;
  }

  startTurnTimer() {
    if (this.isGameOver) return;
    if (this.timer) clearInterval(this.timer);
    this.turnTimeLeft = 45;
    this.timer = setInterval(() => {
      if (this.isGameOver) {
        clearInterval(this.timer);
        return;
      }
      this.turnTimeLeft--;
      if (this.turnTimeLeft <= 0) {
        this.passTurn(this.getCurrentPlayer()?.id);
      }
      this.notify();
    }, 1000);
  }

  checkBotTurn() {
    if (this.isGameOver || this.winner) return;
    if (this.botTimer) clearTimeout(this.botTimer);

    if (this.isCurrentPlayerBot()) {
      this.botTimer = setTimeout(() => {
        if (this.isCurrentPlayerBot() && !this.isGameOver && !this.winner) {
          this.playBotMove();
        }
      }, 3800);
    }
  }

  playBotMove() {
    if (this.isGameOver) return;
    const bot = this.getCurrentPlayer();
    if (!bot) return;

    const rack = this.playerRacks[bot.id] || [];
    if (rack.length === 0) return;

    // Use smart Scrabble search
    const candidates = findBestBotMove(this.board, rack, bot.botDifficulty || 'medium');

    if (candidates && candidates.length > 0) {
      for (const cand of candidates) {
        const res = this.playWord(bot.id, cand.tilesPlaced);
        if (res.success && res.isValid) {
          return; // Successfully placed word!
        }
      }
    }

    // If no word can be formed on board, attempt letter exchange if bag has >= 7 letters
    if (this.letterBag.length >= 7 && rack.length > 0) {
      const countToSwap = Math.min(3, rack.length);
      const tilesToSwap = rack.slice(0, countToSwap).map(t => t.id);
      const resSwap = this.swapLetters(bot.id, tilesToSwap);
      if (resSwap.success) return;
    }

    // Fallback: pass turn if no moves possible and cannot exchange
    this.passTurn(bot.id);
  }

  /**
   * Main Word Placement & Multi-Word Verification (French ODS Scrabble Rules)
   * @param {string} playerId 
   * @param {Array<{ row: number, col: number, letter: string, tileId: string }>} tilesPlaced 
   */
  playWord(playerId, tilesPlaced) {
    if (this.isGameOver || this.winner) return { success: false, error: 'Partie terminée' };
    const currentPlayer = this.getCurrentPlayer();
    if (!currentPlayer || currentPlayer.id !== playerId) {
      return { success: false, error: "Ce n'est pas votre tour" };
    }

    if (!tilesPlaced || tilesPlaced.length === 0) {
      return { success: false, error: 'Aucune lettre placée' };
    }

    const rack = this.playerRacks[playerId] || [];

    // 1. Verify player possesses all placed tiles and target squares are empty
    const usedTileIds = new Set();
    for (const t of tilesPlaced) {
      if (t.row < 0 || t.row >= 15 || t.col < 0 || t.col >= 15) {
        return { success: false, error: 'Coordonnées en dehors du plateau 15x15' };
      }
      if (this.board[t.row][t.col] !== null) {
        return { success: false, error: `La case (${t.row + 1}, ${t.col + 1}) est déjà occupée` };
      }
      const rackIndex = rack.findIndex(r => r.id === t.tileId && r.letter === t.letter && !usedTileIds.has(r.id));
      if (rackIndex === -1) {
        return { success: false, error: `Lettre '${t.letter}' non possédée dans le chevalet` };
      }
      usedTileIds.add(t.tileId);
    }

    // 2. Verify Line Alignment (Single Row OR Single Col)
    const isHorizontal = tilesPlaced.every(t => t.row === tilesPlaced[0].row);
    const isVertical = tilesPlaced.every(t => t.col === tilesPlaced[0].col);

    if (!isHorizontal && !isVertical) {
      return { success: false, error: 'Toutes les lettres d’un coup doivent être alignées sur une seule ligne ou colonne' };
    }

    // 3. First Move Rule: Must cover center square (7, 7)
    const emptyBoard = this.isBoardEmpty();
    if (emptyBoard) {
      const coversCenter = tilesPlaced.some(t => t.row === 7 && t.col === 7);
      if (!coversCenter) {
        return { success: false, error: 'Le premier mot doit obligatoirement passer par la case centrale ★ (Ligne 8, Colonne 8)' };
      }
      if (tilesPlaced.length < 2) {
        return { success: false, error: 'Le premier mot doit comporter au moins 2 lettres' };
      }
    }

    // 4. Build Simulation Board to test word formation and continuity
    const simBoard = this.board.map(row => row.map(cell => cell ? { ...cell, isNew: false } : null));
    for (const t of tilesPlaced) {
      simBoard[t.row][t.col] = {
        letter: t.letter,
        points: LETTER_POINTS[t.letter] || 1,
        placedBy: currentPlayer.name,
        isNew: true,
        tileId: t.tileId,
        row: t.row,
        col: t.col,
      };
    }

    // Check continuity along the main placement line (no empty gap between min & max)
    if (isHorizontal) {
      const r = tilesPlaced[0].row;
      const cols = tilesPlaced.map(t => t.col);
      const minCol = Math.min(...cols);
      const maxCol = Math.max(...cols);
      for (let c = minCol; c <= maxCol; c++) {
        if (simBoard[r][c] === null) {
          return { success: false, error: 'Les lettres doivent être continues sans case vide' };
        }
      }
    } else {
      const c = tilesPlaced[0].col;
      const rows = tilesPlaced.map(t => t.row);
      const minRow = Math.min(...rows);
      const maxRow = Math.max(...rows);
      for (let r = minRow; r <= maxRow; r++) {
        if (simBoard[r][c] === null) {
          return { success: false, error: 'Les lettres doivent être continues sans case vide' };
        }
      }
    }

    // 5. Subsequent Moves: Must connect to at least one existing tile on the board
    if (!emptyBoard) {
      let isConnected = false;
      for (const t of tilesPlaced) {
        const neighbors = [
          [t.row - 1, t.col],
          [t.row + 1, t.col],
          [t.row, t.col - 1],
          [t.row, t.col + 1],
        ];
        for (const [nr, nc] of neighbors) {
          if (nr >= 0 && nr < 15 && nc >= 0 && nc < 15) {
            if (this.board[nr][nc] !== null) {
              isConnected = true;
              break;
            }
          }
        }
        if (isConnected) break;
      }

      if (!isConnected) {
        return { success: false, error: 'Le nouveau mot doit être connecté aux lettres déjà posées sur le plateau' };
      }
    }

    // 6. Extract ALL Formed Words (Main Word + All Perpendicular Cross Words)
    const allFormedWords = [];

    // 6A. Extract Main Word
    if (isHorizontal) {
      const r = tilesPlaced[0].row;
      let minCol = Math.min(...tilesPlaced.map(t => t.col));
      let maxCol = Math.max(...tilesPlaced.map(t => t.col));
      while (minCol > 0 && simBoard[r][minCol - 1] !== null) minCol--;
      while (maxCol < 14 && simBoard[r][maxCol + 1] !== null) maxCol++;

      const tiles = [];
      let str = '';
      for (let c = minCol; c <= maxCol; c++) {
        const cell = simBoard[r][c];
        tiles.push({ ...cell, row: r, col: c });
        str += cell.letter;
      }
      if (str.length >= 2 || (emptyBoard && str.length >= 2)) {
        allFormedWords.push({ word: str.toUpperCase(), tiles, isMain: true });
      }
    } else {
      const c = tilesPlaced[0].col;
      let minRow = Math.min(...tilesPlaced.map(t => t.row));
      let maxRow = Math.max(...tilesPlaced.map(t => t.row));
      while (minRow > 0 && simBoard[minRow - 1][c] !== null) minRow--;
      while (maxRow < 14 && simBoard[maxRow + 1][c] !== null) maxRow++;

      const tiles = [];
      let str = '';
      for (let r = minRow; r <= maxRow; r++) {
        const cell = simBoard[r][c];
        tiles.push({ ...cell, row: r, col: c });
        str += cell.letter;
      }
      if (str.length >= 2 || (emptyBoard && str.length >= 2)) {
        allFormedWords.push({ word: str.toUpperCase(), tiles, isMain: true });
      }
    }

    // 6B. Extract Cross Words (perpendicular to each newly placed tile)
    for (const t of tilesPlaced) {
      if (isHorizontal) {
        let minR = t.row;
        let maxR = t.row;
        while (minR > 0 && simBoard[minR - 1][t.col] !== null) minR--;
        while (maxR < 14 && simBoard[maxR + 1][t.col] !== null) maxR++;

        if (minR !== maxR) {
          const crossTiles = [];
          let crossStr = '';
          for (let r = minR; r <= maxR; r++) {
            const cell = simBoard[r][t.col];
            crossTiles.push({ ...cell, row: r, col: t.col });
            crossStr += cell.letter;
          }
          allFormedWords.push({ word: crossStr.toUpperCase(), tiles: crossTiles, isMain: false });
        }
      } else {
        let minC = t.col;
        let maxC = t.col;
        while (minC > 0 && simBoard[t.row][minC - 1] !== null) minC--;
        while (maxC < 14 && simBoard[t.row][maxC + 1] !== null) maxC++;

        if (minC !== maxC) {
          const crossTiles = [];
          let crossStr = '';
          for (let c = minC; c <= maxC; c++) {
            const cell = simBoard[t.row][c];
            crossTiles.push({ ...cell, row: t.row, col: c });
            crossStr += cell.letter;
          }
          allFormedWords.push({ word: crossStr.toUpperCase(), tiles: crossTiles, isMain: false });
        }
      }
    }

    if (allFormedWords.length === 0) {
      return { success: false, error: 'Le placement ne forme aucun mot de 2 lettres ou plus' };
    }

    // 7. Verify Every Word Against the French Scrabble ODS Dictionary
    for (const fw of allFormedWords) {
      if (!isValidScrabbleWord(fw.word)) {
        return {
          success: false,
          isValid: false,
          word: fw.word,
          error: `Le mot "${fw.word}" n'est pas présent dans le dictionnaire officiel Scrabble. Vous pouvez corriger votre coup.`,
        };
      }
    }

    // 8. Calculate Scores for all formed words (with single-use multipliers on new tiles only)
    let totalScore = 0;
    const wordDetails = [];

    for (const fw of allFormedWords) {
      let wordMultiplier = 1;
      let wordLetterSum = 0;

      for (const t of fw.tiles) {
        const basePts = LETTER_POINTS[t.letter] || 1;
        let tilePts = basePts;

        if (t.isNew) {
          const mult = getMultiplier(t.row, t.col);
          if (mult === 'TL') tilePts *= 3;
          else if (mult === 'DL') tilePts *= 2;
          else if (mult === 'TW') wordMultiplier *= 3;
          else if (mult === 'DW' || mult === 'CENTER') wordMultiplier *= 2;
        }

        wordLetterSum += tilePts;
      }

      const currentWordScore = wordLetterSum * wordMultiplier;
      totalScore += currentWordScore;
      wordDetails.push(`${fw.word} (+${currentWordScore})`);
    }

    // 9. Scrabble Bonus (+50 points for placing all 7 tiles)
    const isScrabble = tilesPlaced.length === 7;
    if (isScrabble) {
      totalScore += 50;
      wordDetails.push('SCRABBLE (+50)');
    }

    // 10. Commit new tiles to official board
    for (const t of tilesPlaced) {
      const basePts = LETTER_POINTS[t.letter] || 1;
      this.board[t.row][t.col] = {
        letter: t.letter,
        points: basePts,
        placedBy: currentPlayer.name,
        isLocked: true,
      };
    }

    // 11. Remove placed tiles from player's rack
    for (const t of tilesPlaced) {
      const idx = rack.findIndex(r => r.id === t.tileId);
      if (idx !== -1) rack.splice(idx, 1);
    }

    // 12. Refill player's rack from letter bag (if bag still has letters)
    const needed = 7 - rack.length;
    const newTiles = this.drawLetters(needed);
    this.playerRacks[playerId] = [...rack, ...newTiles];

    // 13. Update player's score & statistics
    this.playerScores[playerId] = (this.playerScores[playerId] || 0) + totalScore;
    const stats = this.playerStats[playerId];
    stats.wordsCount += allFormedWords.length;
    if (isScrabble) stats.scrabbleCount++;
    stats.maxTurnScore = Math.max(stats.maxTurnScore, totalScore);

    const mainWordStr = allFormedWords[0]?.word || '';
    if (!stats.bestWord || totalScore > stats.bestWordPoints) {
      stats.bestWord = mainWordStr;
      stats.bestWordPoints = totalScore;
    }

    this.consecutivePasses = 0; // Reset consecutive pass counter

    const defItem = getFrenchDefinition(mainWordStr);
    this.lastPlacedTileCoords = tilesPlaced.map(t => ({ row: t.row, col: t.col }));

    this.lastWordPlayed = {
      word: mainWordStr,
      allWords: allFormedWords.map(f => f.word),
      points: totalScore,
      player: currentPlayer.name,
      isValid: true,
      isScrabble,
      nature: defItem.nature,
      definition: defItem.def,
      coords: this.lastPlacedTileCoords,
      timestamp: Date.now(),
    };

    this.playedWordsHistory = [
      {
        word: mainWordStr,
        points: totalScore,
        player: currentPlayer.name,
        nature: defItem.nature,
        definition: defItem.def,
        turn: this.currentTurnIndex + 1,
        timestamp: Date.now(),
      },
      ...this.playedWordsHistory,
    ].slice(0, 100);

    this.lastActionLog = `🎉 ${currentPlayer.name} a posé "${mainWordStr}" (+${totalScore} pts)${isScrabble ? ' ✨ SCRABBLE +50 !' : ''}`;

    // 14. Check IMMEDIATE Game Over condition:
    // "Si le sac de lettres est vide ET qu'un joueur pose sa dernière lettre sur le plateau, la partie doit se terminer immédiatement."
    if (this.letterBag.length === 0 && this.playerRacks[playerId].length === 0) {
      this.endGame(playerId, 'rack_empty');
      return { success: true, isValid: true, word: mainWordStr, score: totalScore, isGameOver: true };
    }

    this.nextTurn();
    return { success: true, isValid: true, word: mainWordStr, score: totalScore };
  }

  swapLetters(playerId, tileIdsToSwap) {
    if (this.isGameOver || this.winner) return { success: false, error: 'Partie terminée' };
    const currentPlayer = this.getCurrentPlayer();
    if (!currentPlayer || currentPlayer.id !== playerId) {
      return { success: false, error: "Ce n'est pas votre tour" };
    }

    if (this.letterBag.length < 7) {
      return { success: false, error: 'Échange impossible : il reste moins de 7 lettres dans le sac' };
    }

    if (!tileIdsToSwap || tileIdsToSwap.length === 0) {
      return { success: false, error: 'Aucune lettre sélectionnée pour l’échange' };
    }

    const rack = this.playerRacks[playerId] || [];
    const swappedLetters = [];

    for (const id of tileIdsToSwap) {
      const idx = rack.findIndex(r => r.id === id);
      if (idx !== -1) {
        swappedLetters.push(rack.splice(idx, 1)[0].letter);
      }
    }

    // Put swapped letters back in bag and reshuffle
    this.letterBag.push(...swappedLetters);
    this.letterBag.sort(() => Math.random() - 0.5);

    // Draw new tiles
    const newTiles = this.drawLetters(swappedLetters.length);
    this.playerRacks[playerId] = [...rack, ...newTiles];

    this.consecutivePasses = 0;
    this.lastActionLog = `🔄 ${currentPlayer.name} a échangé ${swappedLetters.length} lettre(s).`;
    this.nextTurn();
    return { success: true, count: swappedLetters.length };
  }

  passTurn(playerId) {
    if (this.isGameOver || this.winner) return;
    const currentPlayer = this.getCurrentPlayer();
    if (!currentPlayer || (playerId && currentPlayer.id !== playerId)) return;

    this.consecutivePasses++;
    this.lastActionLog = `⏭ ${currentPlayer.name} passe son tour.`;

    // If all players pass twice in a row, end game
    if (this.consecutivePasses >= this.players.length * 2) {
      this.endGame(null, 'consecutive_passes');
      return;
    }

    this.nextTurn();
  }

  nextTurn() {
    if (this.isGameOver) return;
    if (this.botTimer) clearTimeout(this.botTimer);
    this.currentTurnIndex = (this.currentTurnIndex + 1) % this.players.length;
    this.startTurnTimer();
    this.checkBotTurn();
    this.notify();
  }

  endGame(finisherPlayerId = null, reason = 'rack_empty') {
    if (this.isGameOver) return;
    this.isGameOver = true;

    if (this.timer) clearInterval(this.timer);
    if (this.botTimer) clearTimeout(this.botTimer);

    // Calculate game total duration
    const totalSecs = Math.max(1, Math.floor((Date.now() - this.startTime) / 1000));
    this.totalDurationSeconds = totalSecs;
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    this.totalDuration = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

    // 1. Calculate remaining tile values for every player
    let totalOpponentsRemainingPoints = 0;

    for (const player of this.players) {
      const rack = this.playerRacks[player.id] || [];
      const remainingPoints = rack.reduce((sum, t) => sum + (LETTER_POINTS[t.letter] || 1), 0);
      const rawScore = this.playerScores[player.id] || 0;
      const stats = this.playerStats[player.id];

      stats.rawScore = rawScore;
      stats.remainingTilesCount = rack.length;
      stats.remainingTilesValue = remainingPoints;

      if (player.id === finisherPlayerId) {
        stats.malusDeducted = 0;
        // Finisher does not lose points
      } else {
        stats.malusDeducted = remainingPoints;
        this.playerScores[player.id] = Math.max(0, rawScore - remainingPoints);
        totalOpponentsRemainingPoints += remainingPoints;
      }
    }

    // 2. Apply finisher bonus (sum of all opponents' remaining tiles)
    if (finisherPlayerId && totalOpponentsRemainingPoints > 0) {
      const finisherStats = this.playerStats[finisherPlayerId];
      finisherStats.bonusReceived = totalOpponentsRemainingPoints;
      this.playerScores[finisherPlayerId] = (this.playerScores[finisherPlayerId] || 0) + totalOpponentsRemainingPoints;
    }

    // 3. Finalize stats and build official ranking podium
    for (const player of this.players) {
      const stats = this.playerStats[player.id];
      stats.finalScore = this.playerScores[player.id] || 0;
      stats.averageTurnScore = stats.wordsCount > 0 ? Math.round(stats.rawScore / stats.wordsCount) : 0;
    }

    const rankedPlayers = [...this.players].map(p => ({
      id: p.id,
      name: p.name,
      score: this.playerScores[p.id] || 0,
      rawScore: this.playerStats[p.id]?.rawScore || 0,
      malusDeducted: this.playerStats[p.id]?.malusDeducted || 0,
      bonusReceived: this.playerStats[p.id]?.bonusReceived || 0,
      stats: this.playerStats[p.id] || {},
    })).sort((a, b) => b.score - a.score);

    this.winner = rankedPlayers[0]?.id || null;
    this.winnerName = rankedPlayers[0]?.name || 'Champion';
    this.finisherPlayerName = finisherPlayerId ? this.players.find(p => p.id === finisherPlayerId)?.name : null;
    this.endGameReason = reason;

    this.finalPodium = rankedPlayers.map((p, idx) => ({
      ...p,
      rank: idx + 1,
    }));

    if (finisherPlayerId) {
      this.lastActionLog = `🎉 PARTIE TERMINÉE ! 🏆 ${this.finisherPlayerName} a terminé toutes ses lettres (+${totalOpponentsRemainingPoints} pts bonus) !`;
    } else {
      this.lastActionLog = `🎉 PARTIE TERMINÉE ! Passes successives. Victoire de ${this.winnerName} (${this.finalPodium[0]?.score} pts) !`;
    }

    this.notify();

    if (this.onGameOver) {
      this.onGameOver(this.winner, this.finalPodium);
    }
  }

  getState() {
    return {
      board: this.board,
      letterBagCount: this.letterBag.length,
      currentPlayerId: this.getCurrentPlayer()?.id || '',
      playerRacks: this.playerRacks,
      playerScores: this.playerScores,
      playerStats: this.playerStats,
      turnTimeLeft: this.turnTimeLeft,
      lastWordPlayed: this.lastWordPlayed,
      lastPlacedTileCoords: this.lastPlacedTileCoords,
      playedWordsHistory: this.playedWordsHistory,
      lastActionLog: this.lastActionLog,
      winner: this.winner,
      winnerName: this.winnerName,
      finisherPlayerName: this.finisherPlayerName,
      endGameReason: this.endGameReason,
      finalPodium: this.finalPodium,
      isGameOver: this.isGameOver,
      totalDuration: this.totalDuration,
      totalDurationSeconds: this.totalDurationSeconds,
    };
  }

  notify() {
    if (this.onStateChange) {
      this.onStateChange(this.getState());
    }
  }

  destroy() {
    if (this.timer) clearInterval(this.timer);
    if (this.botTimer) clearTimeout(this.botTimer);
  }
}
