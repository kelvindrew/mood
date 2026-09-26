import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ConnectFourEngine } from '../../server/games/connectFourEngine.js';

describe('ConnectFourEngine', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('initializes with a 7x6 empty grid and 2 dueling players', () => {
    const players = [
      { id: 'p1', name: 'Alice', color: 'red' },
      { id: 'p2', name: 'Bob', color: 'yellow' },
    ];
    let state = null;
    const engine = new ConnectFourEngine(players, (s) => { state = s; }, () => {});

    expect(state).not.toBeNull();
    expect(state.phase).toBe('playing');
    expect(state.board).toHaveLength(6);
    expect(state.board[0]).toHaveLength(7);
    expect(state.p1.chipColor).toBe('red');
    expect(state.p2.chipColor).toBe('yellow');

    engine.destroy();
  });

  it('drops chip to the lowest available row in the selected column', () => {
    const players = [
      { id: 'p1', name: 'Alice', color: 'red' },
      { id: 'p2', name: 'Bob', color: 'yellow' },
    ];
    let state = null;
    const engine = new ConnectFourEngine(players, (s) => { state = s; }, () => {});

    // P1 drops chip in col 3 -> should land at bottom row 5
    const res1 = engine.handleAction('c4_drop_chip', { col: 3 }, null, 'p1');
    expect(res1.success).toBe(true);
    expect(engine.board[5][3]).toBe('red');
    expect(state.currentTurnPlayerId).toBe('p2');

    // P2 drops chip in col 3 -> should land at row 4
    const res2 = engine.handleAction('c4_drop_chip', { col: 3 }, null, 'p2');
    expect(res2.success).toBe(true);
    expect(engine.board[4][3]).toBe('yellow');

    engine.destroy();
  });

  it('detects 4-in-a-row horizontal win and handles victory', () => {
    const players = [
      { id: 'p1', name: 'Alice', color: 'red' },
      { id: 'p2', name: 'Bob', color: 'yellow' },
    ];
    let gameOverWinner = null;
    const engine = new ConnectFourEngine(players, () => {}, (p) => { gameOverWinner = p; }, { targetWins: 1 });

    // P1 plays 0, P2 plays 0
    engine.handleAction('c4_drop_chip', { col: 0 }, null, 'p1');
    engine.handleAction('c4_drop_chip', { col: 0 }, null, 'p2');

    // P1 plays 1, P2 plays 1
    engine.handleAction('c4_drop_chip', { col: 1 }, null, 'p1');
    engine.handleAction('c4_drop_chip', { col: 1 }, null, 'p2');

    // P1 plays 2, P2 plays 2
    engine.handleAction('c4_drop_chip', { col: 2 }, null, 'p1');
    engine.handleAction('c4_drop_chip', { col: 2 }, null, 'p2');

    // P1 plays 3 -> 4 in a row horizontal at row 5!
    const winRes = engine.handleAction('c4_drop_chip', { col: 3 }, null, 'p1');
    expect(winRes.success).toBe(true);
    expect(winRes.isWin).toBe(true);
    expect(engine.winningCells).not.toBeNull();
    expect(engine.winningCells.length).toBeGreaterThanOrEqual(4);
    expect(engine.isGameOver).toBe(true);
    expect(gameOverWinner[0].id).toBe('p1');

    engine.destroy();
  });
});
