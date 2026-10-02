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

  it('prioritizes human player as p1 and red chip when playing against a bot', () => {
    // Bot was added first, human joined second
    const players = [
      { id: 'bot_1', name: 'Robo', color: 'yellow', isBot: true },
      { id: 'p_human', name: 'Landry', color: 'red', isBot: false },
    ];
    const engine = new ConnectFourEngine(players, () => {}, () => {});

    expect(engine.p1.id).toBe('p_human');
    expect(engine.p1.chipColor).toBe('red');
    expect(engine.p1.isBot).toBe(false);
    expect(engine.p2.id).toBe('bot_1');
    expect(engine.p2.chipColor).toBe('yellow');
    expect(engine.currentTurnPlayerId).toBe('p_human');

    engine.destroy();
  });

  it('drops chip through RoomManager.handleGameAction when mobile controller sends c4_drop_chip', async () => {
    const { RoomManager } = await import('../../server/rooms.js');
    const mockIo = {
      to: () => ({ emit: () => {} }),
    };
    const roomManager = new RoomManager(mockIo, '127.0.0.1');
    const room = roomManager.createRoom('socket_tv', 'connect_four');
    const joinRes = roomManager.joinRoom(room.code, 'socket_phone', { name: 'Player1' });

    expect(joinRes.success).toBe(true);

    // Start game (adds bot as second player, human is p1)
    const startRes = roomManager.startGame(room.code, 'socket_tv');
    expect(startRes.success).toBe(true);
    expect(room.gameEngine).toBeDefined();

    // Mobile player sends c4_drop_chip
    const actionRes = roomManager.handleGameAction(room.code, 'socket_phone', 'c4_drop_chip', { col: 3 });
    expect(actionRes.success).toBe(true);
    expect(room.gameEngine.board[5][3]).toBe('red');

    room.gameEngine.destroy();
  });
});
