import { describe, it, expect } from 'vitest';
import { evaluatePokerHand } from '../../server/games/arena/memoryPokerEngine.js';
import { calculateStrikesAndBalls, generateDistinctCode } from '../../server/games/arena/secretNumberEngine.js';
import { isPartOfMill, MORRIS_MILLS } from '../../server/games/arena/nineMensMorrisEngine.js';
import { getValidKnightMoves } from '../../server/games/arena/knightsTourEngine.js';
import { solvePyramid } from '../../server/games/arena/equationPyramidEngine.js';
import { ArenaCoordinatorEngine } from '../../server/games/arena/arenaCoordinatorEngine.js';

describe('MOOD ARENA Engine - Phase 2 Games', () => {
  describe('Memory Poker Engine', () => {
    it('correctly ranks a Royal Flush', () => {
      const cards = [
        { rank: 14, suit: 'spade' },
        { rank: 13, suit: 'spade' },
        { rank: 12, suit: 'spade' },
        { rank: 11, suit: 'spade' },
        { rank: 10, suit: 'spade' },
      ];
      const res = evaluatePokerHand(cards);
      expect(res.rankScore).toBe(9000);
      expect(res.name).toContain('Royale');
    });

    it('correctly ranks a Full House', () => {
      const cards = [
        { rank: 10, suit: 'spade' },
        { rank: 10, suit: 'heart' },
        { rank: 10, suit: 'diamond' },
        { rank: 7, suit: 'club' },
        { rank: 7, suit: 'heart' },
      ];
      const res = evaluatePokerHand(cards);
      expect(res.rankScore).toBeGreaterThanOrEqual(6000);
      expect(res.name).toContain('Full House');
    });

    it('correctly ranks a Pair vs High Card', () => {
      const pairHand = [
        { rank: 8, suit: 'spade' },
        { rank: 8, suit: 'heart' },
        { rank: 12, suit: 'diamond' },
        { rank: 4, suit: 'club' },
        { rank: 2, suit: 'heart' },
      ];
      const highCardHand = [
        { rank: 14, suit: 'spade' },
        { rank: 10, suit: 'heart' },
        { rank: 7, suit: 'diamond' },
        { rank: 5, suit: 'club' },
        { rank: 2, suit: 'heart' },
      ];
      const pairRes = evaluatePokerHand(pairHand);
      const highRes = evaluatePokerHand(highCardHand);
      expect(pairRes.rankScore).toBeGreaterThan(highRes.rankScore);
    });
  });

  describe('Secret Number Engine', () => {
    it('calculates 3 strikes for exact match', () => {
      const { strikes, balls } = calculateStrikesAndBalls('749', '749');
      expect(strikes).toBe(3);
      expect(balls).toBe(0);
    });

    it('calculates strikes and balls correctly for partial and swapped digits', () => {
      const { strikes, balls } = calculateStrikesAndBalls('749', '794');
      expect(strikes).toBe(1); // '7' is in place
      expect(balls).toBe(2);   // '9' and '4' are present but swapped
    });

    it('generates distinct 3-digit codes', () => {
      const code = generateDistinctCode(3);
      expect(code.length).toBe(3);
      const uniqueDigits = new Set(code.split(''));
      expect(uniqueDigits.size).toBe(3);
    });
  });

  describe('Nine Men’s Morris Engine', () => {
    it('detects a completed horizontal mill on the outer square', () => {
      const board = Array(24).fill(null);
      board[0] = 'white';
      board[1] = 'white';
      board[2] = 'white';

      expect(isPartOfMill(0, board, 'white')).toBe(true);
      expect(isPartOfMill(1, board, 'white')).toBe(true);
      expect(isPartOfMill(2, board, 'white')).toBe(true);
      expect(isPartOfMill(3, board, 'white')).toBe(false);
    });

    it('detects a cross-linking vertical mill across concentric squares', () => {
      const board = Array(24).fill(null);
      // Mill [1, 9, 17]
      board[1] = 'black';
      board[9] = 'black';
      board[17] = 'black';

      expect(isPartOfMill(1, board, 'black')).toBe(true);
      expect(isPartOfMill(9, board, 'black')).toBe(true);
      expect(isPartOfMill(17, board, 'black')).toBe(true);
    });
  });

  describe('Knight’s Tour Engine', () => {
    it('calculates valid L-moves on a 5x5 board from center', () => {
      const visited = Array.from({ length: 5 }, () => Array(5).fill(false));
      visited[2][2] = true;
      const moves = getValidKnightMoves(2, 2, 5, visited);
      // From (2,2) on a 5x5 board, all 8 knight moves are on-board
      expect(moves.length).toBe(8);
    });

    it('excludes already visited squares', () => {
      const visited = Array.from({ length: 5 }, () => Array(5).fill(false));
      visited[2][2] = true;
      visited[0][1] = true; // One of the 8 targets
      const moves = getValidKnightMoves(2, 2, 5, visited);
      expect(moves.length).toBe(7);
      expect(moves.some(m => m.row === 0 && m.col === 1)).toBe(false);
    });
  });

  describe('Equation Pyramid Engine', () => {
    it('computes correct intermediate and top numbers', () => {
      // base = [3, 4, 2], ops = ['+', '+', '*']
      // mid1 = 3 + 4 = 7
      // mid2 = 4 + 2 = 6
      // top = 7 * 6 = 42
      const res = solvePyramid([3, 4, 2], ['+', '+', '*']);
      expect(res.mid1).toBe(7);
      expect(res.mid2).toBe(6);
      expect(res.top).toBe(42);
    });
  });

  describe('Arena Coordinator Engine', () => {
    it('instantiates and switches subgames properly', () => {
      const players = [{ id: 'p1', name: 'Alice', color: 'red' }];
      let lastState = null;
      const onStateChange = (st) => { lastState = st; };
      const onGameOver = () => {};

      const coordinator = new ArenaCoordinatorEngine(players, onStateChange, onGameOver, {
        arenaGameId: 'memory_poker'
      });

      expect(coordinator.subGameId).toBe('memory_poker');
      expect(coordinator.getPublicState().isArena).toBe(true);

      coordinator.handleAction(players[0], 'switch_arena_game', { arenaGameId: 'secret_number' });
      expect(coordinator.subGameId).toBe('secret_number');
      coordinator.destroy();
    });
  });
});
