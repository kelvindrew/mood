import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BombPartyEngine } from '../../server/games/bombPartyEngine.js';

describe('BombPartyEngine', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('initializes with 3 lives per player and a valid syllable', () => {
    const players = [
      { id: 'p1', name: 'Alice', color: 'blue' },
      { id: 'p2', name: 'Bob', color: 'green' },
    ];
    let state = null;
    const engine = new BombPartyEngine(players, (s) => { state = s; }, () => {});

    expect(state).not.toBeNull();
    expect(state.phase).toBe('playing');
    expect(state.currentSyllable.length).toBeGreaterThanOrEqual(2);
    expect(state.players).toHaveLength(2);
    expect(state.players[0].lives).toBe(3);
    expect(state.players[1].lives).toBe(3);

    engine.destroy();
  });

  it('rejects invalid words and accepts valid words containing the syllable', () => {
    const players = [
      { id: 'p1', name: 'Alice', color: 'blue' },
      { id: 'p2', name: 'Bob', color: 'green' },
    ];
    let state = null;
    const engine = new BombPartyEngine(players, (s) => { state = s; }, () => {});
    engine.activePlayerIndex = 0; // force p1 turn
    engine.currentSyllable = 'TR';

    // Word that does not contain TR
    const resNoSyl = engine.handleAction('bp_submit_word', { word: 'MAISON' }, null, 'p1');
    expect(resNoSyl.success).toBe(false);
    expect(resNoSyl.error).toContain('doit contenir la syllabe');

    // Non-dictionary word containing TR
    const resNonDict = engine.handleAction('bp_submit_word', { word: 'XYZTRQ' }, null, 'p1');
    expect(resNonDict.success).toBe(false);

    // Valid French word containing TR (e.g. TRAIN)
    const resValid = engine.handleAction('bp_submit_word', { word: 'TRAIN' }, null, 'p1');
    expect(resValid.success).toBe(true);
    expect(state.combo).toBe(1);
    expect(state.usedWords).toContain('TRAIN');

    // Duplicate submission of TRAIN in same round
    engine.currentSyllable = 'TR';
    const activeId = engine.getActivePlayer().id;
    const resDup = engine.handleAction('bp_submit_word', { word: 'TRAIN' }, null, activeId);
    expect(resDup.success).toBe(false);
    expect(resDup.error).toContain('déjà été utilisé');

    engine.destroy();
  });

  it('deducts a life on explosion timeout and triggers gameover when 1 player survives', () => {
    const players = [
      { id: 'p1', name: 'Alice', color: 'blue' },
      { id: 'p2', name: 'Bob', color: 'green' },
    ];
    let gameOverResult = null;
    const engine = new BombPartyEngine(players, () => {}, (podium) => { gameOverResult = podium; });

    // Set p1 to 1 life and force p1 turn
    engine.players[0].lives = 1;
    engine.activePlayerIndex = 0;

    // Fast-forward turn time remaining
    vi.advanceTimersByTime(20000);

    expect(engine.players[0].lives).toBe(0);
    expect(engine.players[0].isAlive).toBe(false);
    expect(engine.isGameOver).toBe(true);
    expect(gameOverResult).not.toBeNull();
    expect(gameOverResult[0].id).toBe('p2'); // survivor Bob won!

    engine.destroy();
  });
});
