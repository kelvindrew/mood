// Server Game Engine for ARENA: EQUATION PYRAMID
// Hierarchical mathematical calculations & target sum convergence

export function solvePyramid(baseNumbers, operators) {
  // baseNumbers: [a, b, c]
  // operators: [op1, op2, topOp]
  if (baseNumbers.length !== 3 || operators.length !== 3) return null;

  const apply = (x, y, op) => {
    if (op === '+') return x + y;
    if (op === '-') return x - y;
    if (op === '*') return x * y;
    return 0;
  };

  const mid1 = apply(baseNumbers[0], baseNumbers[1], operators[0]);
  const mid2 = apply(baseNumbers[1], baseNumbers[2], operators[1]);
  const top = apply(mid1, mid2, operators[2]);
  return { mid1, mid2, top };
}

export class EquationPyramidEngine {
  constructor(players, onStateChange, onGameOver, settings = {}) {
    this.players = players.map(p => ({ ...p, score: p.score || 0 }));
    this.onStateChange = onStateChange;
    this.onGameOver = onGameOver;
    this.settings = settings;

    if (this.players.length === 1) {
      this.players.push({
        id: 'bot_pyramid_orbit',
        name: '🤖 Orbit (IA)',
        color: 'cyan',
        avatar: '🔬',
        isBot: true,
        score: 0,
      });
    }

    // Générer une pyramide valide
    const sampleBases = [
      [3, 4, 2],
      [5, 2, 6],
      [4, 3, 5],
      [6, 2, 4],
      [3, 5, 2],
    ];
    const base = sampleBases[Math.floor(Math.random() * sampleBases.length)];
    const ops = ['+', '+', '*'];
    const solution = solvePyramid(base, ops);

    this.targetSum = solution.top;
    this.solution = { base, ops, ...solution };

    // Tuiles fournies aux joueurs (incluant des leurres)
    this.availableNumbers = [...base, Math.floor(Math.random() * 8) + 1, Math.floor(Math.random() * 8) + 1].sort(() => Math.random() - 0.5);
    this.availableOps = ['+', '-', '*'];

    this.submissions = {}; // playerId -> { base: [n1, n2, n3], ops: [op1, op2, opTop], isValid: bool }
    this.timer = 30;
    this.timerInterval = null;
    this.phase = 'playing'; // 'playing' | 'evaluating' | 'ended'
    this.winnerId = null;

    this.startTimer();
    this.broadcast();
    this.runBotSolver();
  }

  startTimer() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      this.timer--;
      if (this.timer <= 0) {
        clearInterval(this.timerInterval);
        this.resolveGame();
      } else {
        this.broadcast();
      }
    }, 1000);
  }

  handleAction(player, action, payload = {}) {
    if (this.phase !== 'playing') return;

    if (action === 'submit_pyramid') {
      const { base, ops } = payload;
      if (!Array.isArray(base) || base.length !== 3 || !Array.isArray(ops) || ops.length !== 3) return;

      const evalRes = solvePyramid(base.map(Number), ops);
      const isCorrect = evalRes && evalRes.top === this.targetSum;

      this.submissions[player.id] = {
        base,
        ops,
        result: evalRes?.top,
        isValid: Boolean(isCorrect),
      };

      this.broadcast();

      if (isCorrect) {
        // Premier à réussir gagne immédiatement !
        if (this.timerInterval) clearInterval(this.timerInterval);
        this.winnerId = player.id;
        player.score += 200;
        this.resolveGame();
      }
    }
  }

  runBotSolver() {
    for (const p of this.players) {
      if (p.isBot) {
        setTimeout(() => {
          if (this.phase === 'playing' && !this.winnerId) {
            // IA résout avec succès après un délai réaliste
            this.handleAction(p, 'submit_pyramid', {
              base: this.solution.base,
              ops: this.solution.ops,
            });
          }
        }, 12000 + Math.random() * 8000);
      }
    }
  }

  resolveGame() {
    this.phase = 'ended';
    if (!this.winnerId) {
      // Trouver celui qui s'en approche le plus
      let bestDiff = Infinity;
      let closestId = null;
      for (const [pid, sub] of Object.entries(this.submissions)) {
        if (sub.result !== undefined) {
          const diff = Math.abs(sub.result - this.targetSum);
          if (diff < bestDiff) {
            bestDiff = diff;
            closestId = pid;
          }
        }
      }
      this.winnerId = closestId;
      if (closestId) {
        const winner = this.players.find(p => p.id === closestId);
        if (winner) winner.score += 100;
      }
    }

    this.broadcast();
    if (typeof this.onGameOver === 'function') {
      this.onGameOver(this.winnerId);
    }
  }

  getState() {
    return {
      targetSum: this.targetSum,
      availableNumbers: this.availableNumbers,
      availableOps: this.availableOps,
      timer: this.timer,
      submissions: this.submissions,
      phase: this.phase,
      winnerId: this.winnerId,
      solution: this.phase === 'ended' ? this.solution : null,
    };
  }

  getPublicState() {
    return {
      arenaGameId: 'equation_pyramid',
      ...this.getState(),
    };
  }

  getPrivateState(playerId) {
    return {
      mySubmission: this.submissions[playerId] || null,
    };
  }

  broadcast() {
    if (typeof this.onStateChange === 'function') {
      this.onStateChange(this.getState());
    }
  }

  destroy() {
    if (this.timerInterval) clearInterval(this.timerInterval);
  }
}
