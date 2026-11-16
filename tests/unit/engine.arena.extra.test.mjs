import { describe, it, expect } from 'vitest';
import { MontageEngine } from '../../server/games/arena/montageEngine.js';
import { ScaleGameEngine } from '../../server/games/arena/scaleGameEngine.js';

describe('MOOD ARENA Engine - Additional Games (Montage & Scale Game)', () => {
  describe('Montage Engine', () => {
    it('initializes sequence with 24 cards and distinct items', () => {
      const players = [{ id: 'p1', name: 'Alice', score: 0 }];
      const engine = new MontageEngine(players, () => {}, () => {}, { difficulty: 'normal' });

      expect(engine.sequence.length).toBe(24);
      expect(engine.phase).toBe('countdown');
      expect(engine.sequence[0]).toBeDefined();
      expect(engine.sequence[0].name).toBeDefined();
      engine.destroy();
    });

    it('correctly scores a repeat detection and penalizes false alarm', () => {
      const players = [
        { id: 'p1', name: 'Alice', score: 0 },
        { id: 'p2', name: 'Bob', score: 0 }
      ];
      const engine = new MontageEngine(players, () => {}, () => {});
      engine.phase = 'showing';
      engine.cardStartTime = Date.now();

      // Case 1: Item is a repeat -> +100 pts
      engine.currentCard = { id: 'mask_gold', name: "Le Masque d'Or", isRepeat: true };
      engine.handleAction('p1', 'buzz');
      expect(engine.playerScores['p1']).toBeGreaterThanOrEqual(100);

      // Case 2: Item is new -> -50 pts penalty
      engine.buzzedPlayersForCurrentCard.clear();
      engine.currentCard = { id: 'astral_compass', name: 'La Boussole Astrale', isRepeat: false };
      engine.handleAction('p2', 'buzz');
      expect(engine.playerScores['p2']).toBe(0); // Clamped at 0 min
      engine.destroy();
    });
  });

  describe('Scale Game Engine', () => {
    it('initializes with 5 secret weights for blocks A..E and 5 weighings', () => {
      const players = [{ id: 'p1', name: 'Alice', score: 0 }];
      const engine = new ScaleGameEngine(players, () => {}, () => {});

      expect(engine.remainingWeighings).toBe(5);
      expect(Object.keys(engine.secretWeights).length).toBe(5);
      const values = Object.values(engine.secretWeights).sort();
      expect(values).toEqual([1, 2, 3, 4, 5]);
      engine.destroy();
    });

    it('correctly compares pans and updates history and tilt', () => {
      const players = [{ id: 'p1', name: 'Alice', score: 0 }];
      const engine = new ScaleGameEngine(players, () => {}, () => {});

      // For test determinism, force weights: A=1, B=2, C=3, D=4, E=5
      engine.secretWeights = { A: 1, B: 2, C: 3, D: 4, E: 5 };

      // Place E (5) on left, A+B (1+2=3) on right -> left should be heavier
      engine.handleAction('p1', 'add_left', { block: 'E' });
      engine.handleAction('p1', 'add_right', { block: 'A' });
      engine.handleAction('p1', 'add_right', { block: 'B' });
      engine.handleAction('p1', 'execute_weigh');

      expect(engine.lastTilt).toBe('left');
      expect(engine.remainingWeighings).toBe(4);
      expect(engine.history.length).toBe(1);
      expect(engine.history[0].tilt).toBe('left');
      engine.destroy();
    });

    it('evaluates final ordering accuracy with points', () => {
      const players = [{ id: 'p1', name: 'Alice', score: 0 }];
      const engine = new ScaleGameEngine(players, () => {}, () => {});

      engine.secretWeights = { A: 1, B: 2, C: 3, D: 4, E: 5 };
      // Perfect submission: A, B, C, D, E (1 < 2 < 3 < 4 < 5)
      engine.handleAction('p1', 'submit_ordering', { orderedBlocks: ['A', 'B', 'C', 'D', 'E'] });

      expect(engine.playerResults['p1'].correctPositions).toBe(5);
      expect(engine.playerResults['p1'].points).toBe(1000);
      expect(engine.phase).toBe('ended');
      engine.destroy();
    });
  });
});
