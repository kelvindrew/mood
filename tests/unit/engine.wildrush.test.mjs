import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { WildRushEngine, WILD_RUSH_ENVIRONMENTS } from '../../server/games/wildRushEngine.js';

describe('WildRushEngine (Course 3D Multijoueur)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('initialise la course avec 4 coureurs et 8 environnements naturels', () => {
    const players = [
      { id: 'p1', name: 'Alex', color: 'red' },
      { id: 'p2', name: 'Sarah', color: 'blue' },
    ];
    const onStateChange = vi.fn();
    const onGameOver = vi.fn();

    const engine = new WildRushEngine(players, onStateChange, onGameOver);
    const state = engine.getState();

    expect(state.players.length).toBe(4); // auto-complète jusqu'à 4 coureurs
    expect(state.environments.length).toBe(8);
    expect(state.totalTrackLength).toBe(1000);
    expect(state.phase).toBe('countdown');
    expect(state.countdown).toBe(3);

    engine.destroy();
  });

  it('démarre la course après le compte à rebours et fait progresser les coureurs', () => {
    const players = [{ id: 'p1', name: 'Alex', color: 'red' }];
    const onStateChange = vi.fn();
    const onGameOver = vi.fn();

    const engine = new WildRushEngine(players, onStateChange, onGameOver);

    // Avance le chrono de 3 secondes pour lancer la course
    vi.advanceTimersByTime(3000);
    expect(engine.phase).toBe('racing');

    // Simulation de 1 seconde de course (10 ticks de 100ms)
    vi.advanceTimersByTime(1000);
    const state = engine.getState();
    const runner = state.players.find(p => p.id === 'p1');

    expect(runner.distance).toBeGreaterThan(10);
    expect(runner.progressPercent).toBeGreaterThan(0);

    engine.destroy();
  });

  it('traite les choix d’animaux avec boosts, combos et pénalités', () => {
    const players = [
      { id: 'p1', name: 'Alex', color: 'red' },
      { id: 'p2', name: 'Sarah', color: 'blue' },
    ];
    const onStateChange = vi.fn();
    const onGameOver = vi.fn();

    const engine = new WildRushEngine(players, onStateChange, onGameOver);
    vi.advanceTimersByTime(3000); // go racing

    // Forcer la phase de défi rivière
    const riverEnv = WILD_RUSH_ENVIRONMENTS[0];
    engine.triggerChallenge(riverEnv);
    expect(engine.phase).toBe('challenge');

    // Joueur 1 fait un choix OPTIMAL (Crocodile)
    engine.submitChoice('p1', 'crocodile');
    const p1 = engine.runners.find(p => p.id === 'p1');
    expect(p1.score).toBe(200);
    expect(p1.boostActive).toBe(true);
    expect(p1.comboCount).toBe(1);
    expect(p1.activeAnimal).toBe('Crocodile');

    // Joueur 2 fait un choix INADAPTÉ (Guépard paniqué dans l'eau)
    engine.submitChoice('p2', 'cheetah');
    const p2 = engine.runners.find(p => p.id === 'p2');
    expect(p2.score).toBe(0); // ne descend pas sous 0
    expect(p2.comboCount).toBe(0);
    expect(p2.currentSpeed).toBeLessThan(p1.currentSpeed);

    engine.destroy();
  });

  it('gère l’action d’encouragement/cheer du smartphone', () => {
    const players = [{ id: 'p1', name: 'Alex', color: 'red' }];
    const onStateChange = vi.fn();
    const onGameOver = vi.fn();

    const engine = new WildRushEngine(players, onStateChange, onGameOver);
    vi.advanceTimersByTime(3000);

    const initialSpeed = engine.runners[0].currentSpeed;
    engine.cheer('p1');
    expect(engine.runners[0].currentSpeed).toBeGreaterThan(initialSpeed);

    engine.destroy();
  });

  it('déclare le premier coureur qui franchit 1000m vainqueur', () => {
    const players = [{ id: 'p1', name: 'Alex', color: 'red' }];
    const onStateChange = vi.fn();
    const onGameOver = vi.fn();

    const engine = new WildRushEngine(players, onStateChange, onGameOver);
    vi.advanceTimersByTime(3000);

    // On avance artificiellement le coureur à 1000m
    engine.runners[0].distance = 1000;
    engine.updatePhysics(0.1);

    expect(engine.runners[0].isFinished).toBe(true);
    expect(engine.runners[0].finishRank).toBe(1);
    expect(engine.winnerId).toBe('p1');

    engine.finishRace();
    expect(engine.phase).toBe('finished');
    expect(onGameOver).toHaveBeenCalledWith('p1');

    engine.destroy();
  });
});
