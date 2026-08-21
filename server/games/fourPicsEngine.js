// 4 Images 1 Mot (Four Pics One Word) Next-Gen Multiplayer Engine for PLAYFLIX
import { FOUR_PICS_PUZZLES } from './fourPicsData.js';

const DISTRACTOR_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

function generateScrambledLetters(targetWord) {
  const letters = targetWord.toUpperCase().split('');
  const totalLettersCount = Math.max(12, letters.length + 4);

  while (letters.length < totalLettersCount) {
    const randomChar = DISTRACTOR_LETTERS[Math.floor(Math.random() * DISTRACTOR_LETTERS.length)];
    letters.push(randomChar);
  }

  // Shuffle letters
  return letters.sort(() => Math.random() - 0.5);
}

export class FourPicsEngine {
  constructor(players, onStateChange, onGameOver, options = {}) {
    this.players = players.map(p => (typeof p === 'string' ? { id: p, name: p, color: 'red', isBot: false } : { ...p }));
    this.gameMode = options.gameMode || 'classic'; // 'classic' | 'random' | 'survival' | 'party'

    this.scores = {};
    this.combos = {}; // Consecutive correct guesses
    this.hintsUsed = {}; // Tracking hints per player
    for (const p of this.players) {
      this.scores[p.id] = 0;
      this.combos[p.id] = 0;
      this.hintsUsed[p.id] = { reveals: 0, removed: 0 };
    }

    // Pick & Order Puzzles based on gameMode
    if (this.gameMode === 'classic') {
      // Sort progressively by difficulty level (1 -> 10)
      this.puzzles = [...FOUR_PICS_PUZZLES].sort((a, b) => a.difficulty - b.difficulty);
    } else {
      // Full randomized shuffle without repeating
      this.puzzles = [...FOUR_PICS_PUZZLES].sort(() => Math.random() - 0.5);
    }

    this.currentRoundIndex = 0;
    this.totalRounds = Math.min(10, this.puzzles.length);

    this.currentPuzzle = null;
    this.scrambledLetters = [];
    this.timeLeft = 35;
    this.roundDuration = 35;
    this.roundStatus = 'guessing'; // 'guessing' | 'revealed' | 'game_over'
    this.roundResult = null;
    this.solvedPlayersThisRound = [];
    this.revealedLettersPositions = {}; // playerId -> [indices]
    this.removedLettersIndices = {}; // playerId -> [indices in scrambledLetters]
    this.zoomedImageIndex = null;
    this.winner = null;
    this.lastActionLog = 'La partie de 4 Images 1 Mot commence ! Observez les 4 indices.';
    this.onStateChange = onStateChange;
    this.onGameOver = onGameOver;

    this.timer = null;
    this.botTimer = null;
    this.transitionTimer = null;

    this.startRound();
  }

  startRound() {
    if (this.currentRoundIndex >= this.totalRounds) {
      this.endGame();
      return;
    }

    this.currentPuzzle = this.puzzles[this.currentRoundIndex];
    this.scrambledLetters = generateScrambledLetters(this.currentPuzzle.word);
    this.timeLeft = 35;
    this.roundStatus = 'guessing';
    this.roundResult = null;
    this.solvedPlayersThisRound = [];
    this.revealedLettersPositions = {};
    this.removedLettersIndices = {};
    this.zoomedImageIndex = null;
    this.lastActionLog = `Manche ${this.currentRoundIndex + 1}/${this.totalRounds} (${this.currentPuzzle.difficultyLabel}) : Mot en ${this.currentPuzzle.word.length} lettres !`;

    for (const p of this.players) {
      this.revealedLettersPositions[p.id] = [];
      this.removedLettersIndices[p.id] = [];
    }

    this.startTimer();
    this.scheduleBotGuesses();
    this.notify();
  }

  startTimer() {
    if (this.timer) clearInterval(this.timer);
    this.timer = setInterval(() => {
      if (this.roundStatus !== 'guessing') return;

      this.timeLeft--;
      if (this.timeLeft <= 0) {
        this.handleTimeExpired();
      }
      this.notify();
    }, 1000);
  }

  scheduleBotGuesses() {
    if (this.botTimer) clearTimeout(this.botTimer);

    const bots = this.players.filter(p => p.isBot);
    if (bots.length === 0 || this.roundStatus !== 'guessing') return;

    // Bots answer with delay depending on difficulty
    const delay = Math.max(8, 22 - (this.currentPuzzle.difficulty * 1.5)) * 1000 + Math.random() * 5000;

    this.botTimer = setTimeout(() => {
      if (this.roundStatus !== 'guessing') return;
      const luckyBot = bots[Math.floor(Math.random() * bots.length)];
      if (luckyBot && !this.solvedPlayersThisRound.includes(luckyBot.id)) {
        this.submitGuess(luckyBot.id, this.currentPuzzle.word);
      }
    }, delay);
  }

  handleTimeExpired() {
    if (this.roundStatus !== 'guessing') return;

    this.roundStatus = 'revealed';
    this.roundResult = {
      word: this.currentPuzzle.word,
      winnerName: null,
      winnerId: null,
      message: `Temps écoulé ! Le mot recherché était : ${this.currentPuzzle.word}`,
      timestamp: Date.now(),
    };

    // Reset combos for players who didn't solve
    for (const p of this.players) {
      if (!this.solvedPlayersThisRound.includes(p.id)) {
        this.combos[p.id] = 0;
      }
    }

    this.notify();
    this.scheduleNextRound();
  }

  submitGuess(playerId, guess) {
    if (this.roundStatus !== 'guessing') return { success: false, error: 'Manche terminée' };
    if (!guess) return { success: false, error: 'Mot vide' };

    const player = this.players.find(p => p.id === playerId);
    if (!player) return { success: false, error: 'Joueur introuvable' };

    const cleanGuess = guess.trim().toUpperCase();
    const targetWord = this.currentPuzzle.word.toUpperCase();

    if (cleanGuess === targetWord) {
      if (this.solvedPlayersThisRound.includes(playerId)) {
        return { success: true, message: 'Déjà trouvé !' };
      }

      this.solvedPlayersThisRound.push(playerId);

      // Multiplayer Speed & Rank Scoring
      const rank = this.solvedPlayersThisRound.length;
      let basePoints = rank === 1 ? 100 : rank === 2 ? 75 : 50;

      // Speed bonus (up to +30 pts if fast)
      const speedBonus = Math.round((this.timeLeft / this.roundDuration) * 30);

      // Combo bonus
      this.combos[playerId] = (this.combos[playerId] || 0) + 1;
      const comboMultiplier = this.combos[playerId] >= 3 ? 1.5 : 1;

      const totalEarned = Math.round((basePoints + speedBonus) * comboMultiplier);
      this.scores[playerId] = (this.scores[playerId] || 0) + totalEarned;

      this.lastActionLog = `🎉 ${player.name} a trouvé "${targetWord}" (+${totalEarned} pts, Combo x${this.combos[playerId]}) !`;

      // If first human solver or all solved, trigger round victory
      const humanCount = this.players.filter(p => !p.isBot).length;
      const humanSolvedCount = this.solvedPlayersThisRound.filter(id => {
        const p = this.players.find(x => x.id === id);
        return p && !p.isBot;
      }).length;

      if (rank === 1 || (humanCount > 0 && humanSolvedCount >= humanCount)) {
        this.roundStatus = 'revealed';
        this.roundResult = {
          word: targetWord,
          winnerName: player.name,
          winnerId: player.id,
          pointsEarned: totalEarned,
          combo: this.combos[playerId],
          message: `Bravo à ${player.name} qui trouve le mot "${targetWord}" !`,
          timestamp: Date.now(),
        };

        this.notify();
        this.scheduleNextRound();
      } else {
        this.notify();
      }

      return { success: true, correct: true, points: totalEarned };
    } else {
      // Wrong guess: reset combo
      this.combos[playerId] = 0;
      this.notify();
      return { success: false, correct: false, error: 'Mot incorrect' };
    }
  }

  // Hint 1: Reveal a correct letter in the mystery slots (Costs 30 points)
  useHintRevealLetter(playerId) {
    if (this.roundStatus !== 'guessing') return false;
    const targetWord = this.currentPuzzle.word.toUpperCase();
    const alreadyRevealed = this.revealedLettersPositions[playerId] || [];

    if (alreadyRevealed.length >= targetWord.length - 1) return false;

    // Pick unrevealed position
    const availableIndices = [];
    for (let i = 0; i < targetWord.length; i++) {
      if (!alreadyRevealed.includes(i)) availableIndices.push(i);
    }

    if (availableIndices.length === 0) return false;
    const chosenIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];

    alreadyRevealed.push(chosenIndex);
    this.revealedLettersPositions[playerId] = alreadyRevealed;
    this.scores[playerId] = Math.max(0, (this.scores[playerId] || 0) - 30);
    this.hintsUsed[playerId].reveals++;

    this.notify();
    return { success: true, position: chosenIndex, char: targetWord[chosenIndex] };
  }

  // Hint 2: Remove 3 fake distractor letters from keyboard (Costs 20 points)
  useHintRemoveLetters(playerId) {
    if (this.roundStatus !== 'guessing') return false;
    const targetWord = this.currentPuzzle.word.toUpperCase();
    const alreadyRemoved = this.removedLettersIndices[playerId] || [];

    const fakeIndices = [];
    this.scrambledLetters.forEach((char, idx) => {
      if (!alreadyRemoved.includes(idx) && !targetWord.includes(char)) {
        fakeIndices.push(idx);
      }
    });

    if (fakeIndices.length === 0) return false;

    const toRemove = fakeIndices.slice(0, 3);
    this.removedLettersIndices[playerId] = [...alreadyRemoved, ...toRemove];
    this.scores[playerId] = Math.max(0, (this.scores[playerId] || 0) - 20);
    this.hintsUsed[playerId].removed++;

    this.notify();
    return { success: true, removedIndices: toRemove };
  }

  // Zoom on an image
  zoomImage(imageIndex) {
    this.zoomedImageIndex = imageIndex;
    this.notify();
  }

  scheduleNextRound() {
    if (this.transitionTimer) clearTimeout(this.transitionTimer);
    this.transitionTimer = setTimeout(() => {
      this.currentRoundIndex++;
      this.startRound();
    }, 4500);
  }

  endGame() {
    this.roundStatus = 'game_over';
    if (this.timer) clearInterval(this.timer);
    if (this.botTimer) clearTimeout(this.botTimer);

    // Find highest scorer
    let topScore = -1;
    let winnerId = null;

    for (const p of this.players) {
      const score = this.scores[p.id] || 0;
      if (score > topScore) {
        topScore = score;
        winnerId = p.id;
      }
    }

    this.winner = winnerId;
    this.notify();

    if (this.onGameOver) {
      this.onGameOver(winnerId);
    }
  }

  getState() {
    return {
      currentPuzzle: this.currentPuzzle
        ? {
            id: this.currentPuzzle.id,
            category: this.currentPuzzle.category,
            difficulty: this.currentPuzzle.difficulty,
            difficultyLabel: this.currentPuzzle.difficultyLabel,
            hint: this.currentPuzzle.hint,
            wordLength: this.currentPuzzle.word.length,
            images: this.currentPuzzle.images,
          }
        : null,
      scrambledLetters: this.scrambledLetters,
      roundNumber: this.currentRoundIndex + 1,
      totalRounds: this.totalRounds,
      timeLeft: this.timeLeft,
      roundStatus: this.roundStatus,
      roundResult: this.roundResult,
      solvedPlayersThisRound: this.solvedPlayersThisRound,
      revealedLettersPositions: this.revealedLettersPositions,
      removedLettersIndices: this.removedLettersIndices,
      zoomedImageIndex: this.zoomedImageIndex,
      scores: this.scores,
      combos: this.combos,
      winner: this.winner,
      lastActionLog: this.lastActionLog,
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
    if (this.transitionTimer) clearTimeout(this.transitionTimer);
  }
}
