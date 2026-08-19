// 4 Images 1 Mot (Four Pics One Word) Multiplayer Engine for PLAYFLIX
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
  constructor(players, onStateChange, onGameOver) {
    this.players = players.map(p => (typeof p === 'string' ? { id: p, name: p, color: 'red', isBot: false } : { ...p }));

    // Auto-fill bots if only 1 human
    if (this.players.length === 1) {
      this.players.push(
        { id: 'bot_fourpics_1', name: 'Jarvis', color: 'blue', isBot: true, avatar: 'B1' },
        { id: 'bot_fourpics_2', name: 'Cyber Bot', color: 'green', isBot: true, avatar: 'B2' },
        { id: 'bot_fourpics_3', name: 'Sophia', color: 'yellow', isBot: true, avatar: 'B3' }
      );
    } else if (this.players.length === 2) {
      this.players.push(
        { id: 'bot_fourpics_1', name: 'Jarvis', color: 'green', isBot: true, avatar: 'B1' },
        { id: 'bot_fourpics_2', name: 'Sophia', color: 'yellow', isBot: true, avatar: 'B2' }
      );
    }

    this.scores = {};
    for (const p of this.players) {
      this.scores[p.id] = 0;
    }

    // Shuffle and pick 10 puzzles for the match
    this.puzzles = [...FOUR_PICS_PUZZLES].sort(() => Math.random() - 0.5).slice(0, 10);
    this.currentRoundIndex = 0;
    this.totalRounds = this.puzzles.length;

    this.currentPuzzle = null;
    this.scrambledLetters = [];
    this.timeLeft = 30;
    this.roundStatus = 'guessing'; // 'guessing' | 'revealed' | 'game_over'
    this.roundResult = null;
    this.solvedPlayersThisRound = [];
    this.winner = null;
    this.lastActionLog = 'La partie de 4 Images 1 Mot commence ! Trouvez le mot commun.';
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
    this.timeLeft = 30;
    this.roundStatus = 'guessing';
    this.roundResult = null;
    this.solvedPlayersThisRound = [];
    this.lastActionLog = `Manche ${this.currentRoundIndex + 1}/${this.totalRounds} : Trouvez le mot en ${this.currentPuzzle.word.length} lettres !`;

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
    if (bots.length === 0) return;

    // Pick 1 bot to potentially find the word after a realistic thinking delay
    const luckyBot = bots[Math.floor(Math.random() * bots.length)];
    const thinkingDelay = 7000 + Math.random() * 14000; // 7 to 21 seconds

    this.botTimer = setTimeout(() => {
      if (this.roundStatus === 'guessing' && this.currentPuzzle) {
        this.submitWord(luckyBot.id, this.currentPuzzle.word);
      }
    }, thinkingDelay);
  }

  submitWord(playerId, wordGuess) {
    if (this.roundStatus !== 'guessing' || !this.currentPuzzle) {
      return { success: false, error: 'Manche non active' };
    }

    const player = this.players.find(p => p.id === playerId);
    if (!player) return { success: false, error: 'Joueur introuvable' };

    const cleanGuess = (wordGuess || '').trim().toUpperCase();
    const target = this.currentPuzzle.word.toUpperCase();

    if (cleanGuess === target) {
      // Correct!
      const points = 100 + Math.floor(this.timeLeft * 1.5);
      this.scores[player.id] = (this.scores[player.id] || 0) + points;
      this.solvedPlayersThisRound.push(player.id);

      this.roundStatus = 'revealed';
      this.roundResult = {
        winnerId: player.id,
        winnerName: player.name,
        word: target,
        pointsAwarded: points,
        timestamp: Date.now(),
      };

      this.lastActionLog = `Victoire de ${player.name} qui a trouvé "${target}" (+${points} pts) !`;

      if (this.timer) clearInterval(this.timer);
      if (this.botTimer) clearTimeout(this.botTimer);

      this.notify();

      // Swift automatic 3.5s transition to next round
      this.transitionTimer = setTimeout(() => {
        this.currentRoundIndex++;
        this.startRound();
      }, 3500);

      return { success: true, correct: true, points };
    } else {
      // Incorrect
      return { success: false, correct: false, error: 'Mot incorrect' };
    }
  }

  handleTimeExpired() {
    if (this.roundStatus !== 'guessing' || !this.currentPuzzle) return;

    this.roundStatus = 'revealed';
    this.roundResult = {
      winnerId: null,
      winnerName: null,
      word: this.currentPuzzle.word,
      pointsAwarded: 0,
      timestamp: Date.now(),
    };

    this.lastActionLog = `Temps écoulé ! Le mot à trouver était "${this.currentPuzzle.word}".`;

    if (this.timer) clearInterval(this.timer);
    if (this.botTimer) clearTimeout(this.botTimer);

    this.notify();

    // Auto transition to next round
    this.transitionTimer = setTimeout(() => {
      this.currentRoundIndex++;
      this.startRound();
    }, 3500);
  }

  endGame() {
    this.roundStatus = 'game_over';
    if (this.timer) clearInterval(this.timer);
    if (this.botTimer) clearTimeout(this.botTimer);

    // Find highest scoring player
    let maxScore = -1;
    let winningPlayer = null;

    for (const p of this.players) {
      const s = this.scores[p.id] || 0;
      if (s > maxScore) {
        maxScore = s;
        winningPlayer = p;
      }
    }

    this.winner = winningPlayer ? winningPlayer.id : null;
    this.lastActionLog = `Partie terminée ! Vainqueur : ${winningPlayer?.name || 'Égalité'} avec ${maxScore} points !`;

    this.notify();
    if (this.onGameOver && winningPlayer) {
      this.onGameOver(winningPlayer.id);
    }
  }

  rematch() {
    this.puzzles = [...FOUR_PICS_PUZZLES].sort(() => Math.random() - 0.5).slice(0, 10);
    this.currentRoundIndex = 0;
    this.totalRounds = this.puzzles.length;
    this.winner = null;
    for (const p of this.players) {
      this.scores[p.id] = 0;
    }
    this.startRound();
  }

  getState() {
    return {
      roundNumber: this.currentRoundIndex + 1,
      totalRounds: this.totalRounds,
      currentPuzzle: this.currentPuzzle ? {
        id: this.currentPuzzle.id,
        wordLength: this.currentPuzzle.word.length,
        category: this.currentPuzzle.category,
        difficulty: this.currentPuzzle.difficulty,
        images: this.currentPuzzle.images,
      } : null,
      scrambledLetters: this.scrambledLetters,
      timeLeft: this.timeLeft,
      roundStatus: this.roundStatus,
      roundResult: this.roundResult,
      scores: this.scores,
      solvedPlayersThisRound: this.solvedPlayersThisRound,
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
