// Scrabble & Word Master Game Engine for PLAYFLIX
// 15x15 standard board with dynamic bonus multipliers, French letter distribution and Complete Word ODS Verification

import { isValidScrabbleWord, findPossibleWordsFromRack } from './scrabbleDictionary.js';

const LETTER_POINTS = {
  A: 1, E: 1, I: 1, L: 1, N: 1, O: 1, R: 1, S: 1, T: 1, U: 1,
  D: 2, G: 2, M: 2,
  B: 3, C: 3, P: 3,
  F: 4, H: 4, V: 4,
  J: 8, Q: 8,
  K: 10, W: 10, X: 10, Y: 10, Z: 10,
};

const FRENCH_LETTER_DISTRIBUTION = [
  ...'AAAAAAAAA', ...'BB', ...'CC', ...'DDD', ...'EEEEEEEEEEEEEEE',
  ...'FF', ...'GG', ...'HH', ...'IIIIIIII', ...'J', ...'K',
  ...'LLLLL', ...'MMM', ...'NNNNNN', ...'OOOOOO', ...'PPP', ...'Q',
  ...'RRRRRR', ...'SSSSSS', ...'TTTTTT', ...'UUUUUU', ...'VV', ...'W',
  ...'X', ...'Y', ...'Z'
];

function getMultiplier(r, c) {
  if (r === 7 && c === 7) return 'CENTER'; // MD (x2)
  if ((r === 0 || r === 7 || r === 14) && (c === 0 || c === 7 || c === 14) && !(r === 7 && c === 7)) return 'TW'; // Mot Triple (x3)
  if ((r === c || r + c === 14) && ((r >= 1 && r <= 4) || (r >= 10 && r <= 13))) return 'DW'; // Mot Double (x2)
  if ((r === 1 || r === 5 || r === 9 || r === 13) && (c === 1 || c === 5 || c === 9 || c === 13)) return 'TL'; // Lettre Triple (x3)
  if ((r === 0 || r === 14) && (c === 3 || c === 11) || (r === 2 || r === 12) && (c === 6 || c === 8) || (r === 3 || r === 11) && (c === 0 || c === 7 || c === 14) || (r === 6 || r === 8) && (c === 2 || c === 6 || c === 8 || c === 12) || (r === 7) && (c === 3 || c === 11)) return 'DL'; // Lettre Double (x2)
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
    this.winner = null;
    this.turnTimeLeft = 45;
    this.lastWordPlayed = null;
    this.lastActionLog = 'La partie de Scrabble commence ! Placez vos mots.';
    this.onStateChange = onStateChange;
    this.onGameOver = onGameOver;

    // Initialize 15x15 board
    this.board = Array(15).fill(null).map(() => Array(15).fill(null));

    // Seed starter word in center
    this.seedInitialBoard();

    // Distribute 7 letters to each player
    for (const player of this.players) {
      this.playerRacks[player.id] = this.drawLetters(7);
      this.playerScores[player.id] = 0;
    }

    this.timer = null;
    this.botTimer = null;
    this.startTurnTimer();
    this.checkBotTurn();
  }

  seedInitialBoard() {
    const starterWord = "SALON";
    const startRow = 7;
    const startCol = 5;
    for (let i = 0; i < starterWord.length; i++) {
      const letter = starterWord[i];
      this.board[startRow][startCol + i] = {
        letter,
        points: LETTER_POINTS[letter] || 1,
        placedBy: 'PLAYFLIX',
        isLocked: true,
      };
    }
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
    if (this.timer) clearInterval(this.timer);
    this.turnTimeLeft = 45;
    this.timer = setInterval(() => {
      this.turnTimeLeft--;
      if (this.turnTimeLeft <= 0) {
        this.passTurn(this.getCurrentPlayer()?.id);
      }
      this.notify();
    }, 1000);
  }

  checkBotTurn() {
    if (this.winner) return;
    if (this.botTimer) clearTimeout(this.botTimer);

    if (this.isCurrentPlayerBot()) {
      this.botTimer = setTimeout(() => {
        if (this.isCurrentPlayerBot() && !this.winner) {
          this.playBotMove();
        }
      }, 1500);
    }
  }

  playBotMove() {
    const bot = this.getCurrentPlayer();
    if (!bot) return;

    const rack = this.playerRacks[bot.id] || [];
    const rackLetters = rack.map(r => r.letter);
    const possibleWords = findPossibleWordsFromRack(rackLetters, 3, 6);

    if (possibleWords.length > 0) {
      const wordToPlay = possibleWords[0];
      // Find empty row or col
      const row = Math.floor(Math.random() * 4) + 3; // rows 3 to 6
      const col = Math.floor(Math.random() * (15 - wordToPlay.length));

      const tilesPlaced = [];
      for (let i = 0; i < wordToPlay.length; i++) {
        const letter = wordToPlay[i];
        const rackTile = rack.find(r => r.letter === letter && !tilesPlaced.some(t => t.tileId === r.id));
        if (rackTile) {
          tilesPlaced.push({
            row,
            col: col + i,
            letter,
            tileId: rackTile.id,
          });
        }
      }

      if (tilesPlaced.length === wordToPlay.length) {
        this.playWord(bot.id, tilesPlaced);
        return;
      }
    }

    // Fallback: pass turn if no words
    this.passTurn(bot.id);
  }

  /**
   * Main Word Placement & Complete Word Verification
   * @param {string} playerId 
   * @param {Array<{ row: number, col: number, letter: string, tileId: string }>} tilesPlaced 
   */
  playWord(playerId, tilesPlaced) {
    if (this.winner) return { success: false, error: 'Partie terminée' };
    const currentPlayer = this.getCurrentPlayer();
    if (!currentPlayer || currentPlayer.id !== playerId) {
      return { success: false, error: "Ce n'est pas votre tour" };
    }

    if (!tilesPlaced || tilesPlaced.length === 0) {
      return { success: false, error: 'Aucune lettre placée' };
    }

    const rack = this.playerRacks[playerId] || [];

    // 1. Verify player actually possesses the tiles placed
    for (const t of tilesPlaced) {
      const rackIndex = rack.findIndex(r => r.id === t.tileId && r.letter === t.letter);
      if (rackIndex === -1) {
        return { success: false, error: 'Lettre non possédée dans le chevalet' };
      }
      if (this.board[t.row][t.col] !== null) {
        return { success: false, error: 'Case déjà occupée sur le plateau' };
      }
    }

    // 2. Build Virtual Simulation Board containing existing tiles + new tiles
    const simBoard = this.board.map(row => row.map(cell => cell ? { ...cell } : null));
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

    // 3. Determine Word Orientation (Horizontal or Vertical)
    const isHorizontal = tilesPlaced.length === 1
      ? (tilesPlaced[0].col > 0 && simBoard[tilesPlaced[0].row][tilesPlaced[0].col - 1] !== null) ||
        (tilesPlaced[0].col < 14 && simBoard[tilesPlaced[0].row][tilesPlaced[0].col + 1] !== null)
      : tilesPlaced.every(t => t.row === tilesPlaced[0].row);

    // 4. Extract the COMPLETE CONTIGUOUS WORD formed on the board
    let fullWordTiles = [];
    let wordFormed = '';

    if (isHorizontal) {
      const r = tilesPlaced[0].row;
      const cols = tilesPlaced.map(t => t.col);
      let minCol = Math.min(...cols);
      let maxCol = Math.max(...cols);

      // Walk left to find the exact start of the word on the board
      while (minCol > 0 && simBoard[r][minCol - 1] !== null) {
        minCol--;
      }
      // Walk right to find the exact end of the word on the board
      while (maxCol < 14 && simBoard[r][maxCol + 1] !== null) {
        maxCol++;
      }

      for (let c = minCol; c <= maxCol; c++) {
        const cell = simBoard[r][c];
        if (cell) {
          fullWordTiles.push({ ...cell, row: r, col: c });
          wordFormed += cell.letter;
        }
      }
    } else {
      const c = tilesPlaced[0].col;
      const rows = tilesPlaced.map(t => t.row);
      let minRow = Math.min(...rows);
      let maxRow = Math.max(...rows);

      // Walk up to find the exact start of the word on the board
      while (minRow > 0 && simBoard[minRow - 1][c] !== null) {
        minRow--;
      }
      // Walk down to find the exact end of the word on the board
      while (maxRow < 14 && simBoard[maxRow + 1][c] !== null) {
        maxRow++;
      }

      for (let r = minRow; r <= maxRow; r++) {
        const cell = simBoard[r][c];
        if (cell) {
          fullWordTiles.push({ ...cell, row: r, col: c });
          wordFormed += cell.letter;
        }
      }
    }

    wordFormed = wordFormed.toUpperCase();

    // 5. Verify the COMPLETE word against the Official French Scrabble Dictionary
    const isValid = isValidScrabbleWord(wordFormed);

    if (!isValid) {
      // ❌ WORD REJECTED BY DICTIONARY : 0 Points & Pass Turn (penalized!)
      this.lastWordPlayed = {
        word: wordFormed,
        points: 0,
        player: currentPlayer.name,
        isValid: false,
        reason: 'Mot absent du dictionnaire officiel Scrabble',
      };
      this.lastActionLog = `❌ "${wordFormed}" REFUSÉ par le dictionnaire ! 0 point. Tour passé pour ${currentPlayer.name}.`;

      // Player keeps letters in rack, but loses their turn as requested
      this.nextTurn();
      return {
        success: false,
        isValid: false,
        word: wordFormed,
        score: 0,
        error: `Le mot complet "${wordFormed}" n'est pas reconnu dans le dictionnaire officiel.`,
      };
    }

    // ✅ WORD VALIDATED BY DICTIONARY : Calculate Score with Board Multipliers
    let wordMultiplier = 1;
    let letterScoreSum = 0;

    for (const t of fullWordTiles) {
      const basePts = LETTER_POINTS[t.letter] || 1;
      let tilePts = basePts;

      if (t.isNew) {
        // Multipliers only apply to newly placed tiles
        const mult = getMultiplier(t.row, t.col);
        if (mult === 'TL') tilePts *= 3;
        else if (mult === 'DL') tilePts *= 2;
        else if (mult === 'TW') wordMultiplier *= 3;
        else if (mult === 'DW' || mult === 'CENTER') wordMultiplier *= 2;
      }

      letterScoreSum += tilePts;

      // Lock tile on the actual board
      this.board[t.row][t.col] = {
        letter: t.letter,
        points: basePts,
        placedBy: currentPlayer.name,
        isLocked: true,
      };
    }

    let totalScore = letterScoreSum * wordMultiplier;

    // Scrabble 7-letter bonus!
    if (tilesPlaced.length === 7) {
      totalScore += 50;
    }

    // Remove only the newly placed tiles from player's rack
    for (const t of tilesPlaced) {
      const idx = rack.findIndex(r => r.id === t.tileId);
      if (idx !== -1) rack.splice(idx, 1);
    }

    this.playerScores[playerId] = (this.playerScores[playerId] || 0) + totalScore;

    // Refill rack up to 7 letters
    const needed = 7 - rack.length;
    const newTiles = this.drawLetters(needed);
    this.playerRacks[playerId] = [...rack, ...newTiles];

    this.lastWordPlayed = {
      word: wordFormed,
      points: totalScore,
      player: currentPlayer.name,
      isValid: true,
    };
    this.lastActionLog = `🎉 "${wordFormed}" est VALIDE (+${totalScore} pts) pour ${currentPlayer.name} !`;

    // Check game over
    if (this.letterBag.length === 0 && this.playerRacks[playerId].length === 0) {
      this.endGame();
      return { success: true, isValid: true, word: wordFormed, score: totalScore };
    }

    this.nextTurn();
    return { success: true, isValid: true, word: wordFormed, score: totalScore };
  }

  swapLetters(playerId, tileIdsToSwap) {
    if (this.getCurrentPlayer()?.id !== playerId) return false;
    const rack = this.playerRacks[playerId] || [];
    const swapped = [];

    for (const id of tileIdsToSwap) {
      const idx = rack.findIndex(r => r.id === id);
      if (idx !== -1) {
        swapped.push(rack.splice(idx, 1)[0].letter);
      }
    }

    // Put swapped letters back in bag
    this.letterBag.push(...swapped);
    this.letterBag.sort(() => Math.random() - 0.5);

    // Draw new ones
    const newTiles = this.drawLetters(swapped.length);
    this.playerRacks[playerId] = [...rack, ...newTiles];

    this.lastActionLog = `${this.getCurrentPlayer()?.name} a échangé ${swapped.length} lettre(s).`;
    this.nextTurn();
    return true;
  }

  passTurn(playerId) {
    if (this.getCurrentPlayer()?.id !== playerId) return;
    this.lastActionLog = `${this.getCurrentPlayer()?.name} passe son tour.`;
    this.nextTurn();
  }

  nextTurn() {
    if (this.botTimer) clearTimeout(this.botTimer);
    this.currentTurnIndex = (this.currentTurnIndex + 1) % this.players.length;
    this.startTurnTimer();
    this.checkBotTurn();
    this.notify();
  }

  endGame() {
    if (this.timer) clearInterval(this.timer);
    if (this.botTimer) clearTimeout(this.botTimer);
    let highestScore = -1;
    let winnerId = null;
    for (const [pId, score] of Object.entries(this.playerScores)) {
      if (score > highestScore) {
        highestScore = score;
        winnerId = pId;
      }
    }
    this.winner = winnerId;
    this.notify();
    if (this.onGameOver) this.onGameOver(winnerId);
  }

  getState() {
    return {
      board: this.board,
      letterBagCount: this.letterBag.length,
      currentPlayerId: this.getCurrentPlayer()?.id || '',
      playerRacks: this.playerRacks,
      playerScores: this.playerScores,
      turnTimeLeft: this.turnTimeLeft,
      lastWordPlayed: this.lastWordPlayed,
      lastActionLog: this.lastActionLog,
      winner: this.winner,
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
