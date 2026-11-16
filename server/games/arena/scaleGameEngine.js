// Server Game Engine for ARENA: SCALE GAME
// Deductive logic & balance weighing game inspired by The Devil's Plan
// Players use a 2-pan balance to compare unknown blocks and deduce their true weights/ranking.

export const BLOCK_LETTERS = ['A', 'B', 'C', 'D', 'E'];
export const BLOCK_COLORS = {
  A: '#EF4444', // Rouge
  B: '#3B82F6', // Bleu
  C: '#10B981', // Émeraude
  D: '#F59E0B', // Ambre
  E: '#8B5CF6', // Violet
};

export class ScaleGameEngine {
  constructor(players, onStateChange, onGameOver, settings = {}) {
    this.players = players.map(p => ({ ...p, score: p.score || 0 }));
    this.onStateChange = onStateChange;
    this.onGameOver = onGameOver;
    this.settings = settings;

    if (this.players.length === 1) {
      this.players.push({
        id: 'bot_ai_orbit',
        name: '🤖 Orbit AI',
        color: 'purple',
        avatar: '🧠',
        score: 0,
        isBot: true,
      });
    }

    this.maxWeighings = 5;
    this.remainingWeighings = this.maxWeighings;

    // Secret weights: randomly assign distinct weights 1 to 5 to blocks A..E
    this.secretWeights = {};
    const weights = [1, 2, 3, 4, 5].sort(() => Math.random() - 0.5);
    BLOCK_LETTERS.forEach((letter, i) => {
      this.secretWeights[letter] = weights[i];
    });

    // Current pan contents
    this.leftPan = [];
    this.rightPan = [];

    // History of past weighings
    this.history = []; // Array of { id, left: string[], right: string[], result: 'left' | 'right' | 'equal' }

    // Last weighing animation state
    this.lastTilt = 'neutral'; // 'left' | 'right' | 'equal' | 'neutral'

    // Final player submissions: { [playerId]: string[] } (ordered from lightest to heaviest)
    this.submissions = {};
    this.playerResults = {}; // { [playerId]: { score, correctCount, ranking } }

    this.phase = 'weighing'; // 'weighing' | 'submitting' | 'showdown' | 'ended'
    this.winnerId = null;

    this.initTurn();
  }

  initTurn() {
    this.broadcast();
  }

  executeWeigh() {
    if (this.phase !== 'weighing') return;
    if (this.leftPan.length === 0 && this.rightPan.length === 0) return;
    if (this.remainingWeighings <= 0) return;

    let leftMass = 0;
    for (const b of this.leftPan) leftMass += this.secretWeights[b] || 0;

    let rightMass = 0;
    for (const b of this.rightPan) rightMass += this.secretWeights[b] || 0;

    let tilt = 'equal';
    if (leftMass > rightMass) tilt = 'left';
    else if (rightMass > leftMass) tilt = 'right';

    this.lastTilt = tilt;
    this.remainingWeighings -= 1;

    this.history.unshift({
      id: `w_${Date.now()}_${Math.random()}`,
      left: [...this.leftPan],
      right: [...this.rightPan],
      tilt,
      step: this.maxWeighings - this.remainingWeighings,
    });

    // If remaining weighings hit 0, automatically move to submitting
    if (this.remainingWeighings === 0) {
      this.phase = 'submitting';
    }

    this.broadcast();
  }

  submitOrdering(playerId, orderedBlocks) {
    if (!Array.isArray(orderedBlocks) || orderedBlocks.length !== 5) return;
    this.submissions[playerId] = orderedBlocks;

    // Calculate actual true order from lightest to heaviest
    const trueOrder = [...BLOCK_LETTERS].sort((a, b) => this.secretWeights[a] - this.secretWeights[b]);

    let correctPositions = 0;
    orderedBlocks.forEach((letter, idx) => {
      if (trueOrder[idx] === letter) correctPositions += 1;
    });

    let points = 0;
    if (correctPositions === 5) points = 1000;
    else if (correctPositions === 4) points = 650;
    else if (correctPositions === 3) points = 450;
    else if (correctPositions === 2) points = 250;
    else if (correctPositions === 1) points = 100;

    this.playerResults[playerId] = {
      playerId,
      orderedBlocks,
      trueOrder,
      correctPositions,
      points,
    };

    // Check if all players submitted
    const allSubmitted = this.players.every(p => Boolean(this.submissions[p.id]));
    if (allSubmitted || Object.keys(this.submissions).length >= this.players.filter(p => !p.isBot).length) {
      this.endGame();
    } else {
      this.broadcast();
    }
  }

  handleAction(playerOrId, action, payload = {}) {
    const playerId = typeof playerOrId === 'object' && playerOrId !== null
      ? playerOrId.id
      : String(playerOrId);

    if (action === 'add_left') {
      const block = String(payload.block).toUpperCase();
      if (BLOCK_LETTERS.includes(block) && !this.leftPan.includes(block) && !this.rightPan.includes(block)) {
        this.leftPan.push(block);
        this.broadcast();
      }
    } else if (action === 'add_right') {
      const block = String(payload.block).toUpperCase();
      if (BLOCK_LETTERS.includes(block) && !this.leftPan.includes(block) && !this.rightPan.includes(block)) {
        this.rightPan.push(block);
        this.broadcast();
      }
    } else if (action === 'remove_block') {
      const block = String(payload.block).toUpperCase();
      this.leftPan = this.leftPan.filter(b => b !== block);
      this.rightPan = this.rightPan.filter(b => b !== block);
      this.broadcast();
    } else if (action === 'clear_pans') {
      this.leftPan = [];
      this.rightPan = [];
      this.lastTilt = 'neutral';
      this.broadcast();
    } else if (action === 'execute_weigh') {
      this.executeWeigh();
    } else if (action === 'go_to_submitting') {
      this.phase = 'submitting';
      this.broadcast();
    } else if (action === 'submit_ordering') {
      this.submitOrdering(playerId, payload.orderedBlocks);
    } else if (action === 'restart' || action === 'reset_round') {
      this.remainingWeighings = this.maxWeighings;
      this.leftPan = [];
      this.rightPan = [];
      this.history = [];
      this.lastTilt = 'neutral';
      this.submissions = {};
      this.playerResults = {};
      this.phase = 'weighing';
      this.winnerId = null;

      const weights = [1, 2, 3, 4, 5].sort(() => Math.random() - 0.5);
      BLOCK_LETTERS.forEach((letter, i) => {
        this.secretWeights[letter] = weights[i];
      });
      this.broadcast();
    }
  }

  endGame() {
    this.phase = 'ended';

    // True order
    const trueOrder = [...BLOCK_LETTERS].sort((a, b) => this.secretWeights[a] - this.secretWeights[b]);

    let topScore = -1;
    let winnerId = null;
    for (const [pid, res] of Object.entries(this.playerResults)) {
      if (res.points > topScore) {
        topScore = res.points;
        winnerId = pid;
      }
    }

    this.winnerId = winnerId;
    this.broadcast();

    if (typeof this.onGameOver === 'function') {
      this.onGameOver(winnerId);
    }
  }

  getState() {
    const trueOrder = this.phase === 'ended'
      ? [...BLOCK_LETTERS].sort((a, b) => this.secretWeights[a] - this.secretWeights[b])
      : null;

    return {
      arenaGameId: 'scale_game',
      phase: this.phase,
      remainingWeighings: this.remainingWeighings,
      maxWeighings: this.maxWeighings,
      leftPan: this.leftPan,
      rightPan: this.rightPan,
      lastTilt: this.lastTilt,
      history: this.history,
      submissions: this.submissions,
      playerResults: this.playerResults,
      trueOrder,
      secretWeights: this.phase === 'ended' ? this.secretWeights : undefined,
      winnerId: this.winnerId,
    };
  }

  broadcast() {
    if (typeof this.onStateChange === 'function') {
      this.onStateChange(this.getState());
    }
  }

  destroy() {}
}
