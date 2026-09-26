import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NavalBattleEngine } from '../../server/games/navalBattleEngine.js';

describe('NavalBattleEngine', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('initializes duel in placement phase with auto-bot fleet if 1 human player', () => {
    const players = [{ id: 'p1', name: 'Alice', color: 'blue' }];
    let state = null;
    const engine = new NavalBattleEngine(players, (s) => { state = s; }, () => {});

    expect(state).not.toBeNull();
    expect(state.phase).toBe('placement');
    expect(engine.p2.isBot).toBe(true);
    expect(engine.p2.ready).toBe(true);
    expect(engine.p2.ships.length).toBe(4);

    engine.destroy();
  });

  it('transitions to battle after both players place their fleets', () => {
    const players = [
      { id: 'p1', name: 'Alice', color: 'blue' },
      { id: 'p2', name: 'Bob', color: 'red' },
    ];
    let state = null;
    const engine = new NavalBattleEngine(players, (s) => { state = s; }, () => {});

    // P1 auto places
    const resP1 = engine.handleAction('nb_auto_place', {}, null, 'p1');
    expect(resP1.success).toBe(true);
    expect(engine.p1.ready).toBe(true);
    expect(state.phase).toBe('placement'); // waiting for P2

    // P2 auto places
    const resP2 = engine.handleAction('nb_auto_place', {}, null, 'p2');
    expect(resP2.success).toBe(true);
    expect(engine.p2.ready).toBe(true);
    expect(state.phase).toBe('battle');

    engine.destroy();
  });

  it('registers hits and misses accurately and triggers game over when all ships sunk', () => {
    const players = [
      { id: 'p1', name: 'Alice', color: 'blue' },
      { id: 'p2', name: 'Bob', color: 'red' },
    ];
    let gameOverPodium = null;
    const engine = new NavalBattleEngine(players, () => {}, (p) => { gameOverPodium = p; });

    // Set custom predictable ships for P2
    engine.p2.ships = [
      { id: 'sub', name: 'Sous-marin', size: 1, coordinates: ['A1'], hits: [] },
    ];
    engine.p1.ready = true;
    engine.p2.ready = true;
    engine.phase = 'battle';
    engine.turnPlayerId = 'p1';

    // P1 fires at B1 (water / miss)
    const missRes = engine.handleAction('nb_fire', { coord: 'B1' }, null, 'p1');
    expect(missRes.success).toBe(true);
    expect(missRes.result).toBe('miss');
    expect(engine.p2.shotsReceived['B1']).toBe('miss');

    // Force P1 turn again
    engine.turnPlayerId = 'p1';

    // P1 fires at A1 (hit & sunk)
    const hitRes = engine.handleAction('nb_fire', { coord: 'A1' }, null, 'p1');
    expect(hitRes.success).toBe(true);
    expect(hitRes.result).toBe('sunk');
    expect(engine.isGameOver).toBe(true);
    expect(gameOverPodium).not.toBeNull();
    expect(gameOverPodium[0].id).toBe('p1');
    expect(gameOverPodium[0].isWinner).toBe(true);

    engine.destroy();
  });

  it('protects private fleet coordinates from public state (C1 privacy)', () => {
    const players = [
      { id: 'p1', name: 'Alice', color: 'blue' },
      { id: 'p2', name: 'Bob', color: 'red' },
    ];
    const engine = new NavalBattleEngine(players, () => {}, () => {});
    engine.handleAction('nb_auto_place', {}, null, 'p1');
    engine.handleAction('nb_auto_place', {}, null, 'p2');

    // Public state (no targetPlayerId)
    const publicState = engine.getState();
    expect(publicState.p1.ships).toBeUndefined();
    expect(publicState.p2.ships).toBeUndefined();

    // P1 private state
    const p1State = engine.getState('p1');
    expect(p1State.p1.ships).toBeDefined();
    expect(p1State.p2.ships).toBeUndefined(); // opponent fleet hidden!

    engine.destroy();
  });
});
