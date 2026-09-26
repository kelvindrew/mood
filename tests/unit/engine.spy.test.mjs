// Tests unitaires pour SpyEngine (L'Espion / Undercover)
import { describe, it, expect, vi } from 'vitest';
import { SpyEngine } from '../../server/games/spyEngine.js';

describe('SpyEngine (L\'Espion)', () => {
  it('crée une partie avec 3 joueurs et distribue les rôles (au moins 1 espion)', () => {
    const players = [
      { id: 'p1', name: 'Alice' },
      { id: 'p2', name: 'Bob' },
      { id: 'p3', name: 'Charlie' },
    ];
    const engine = new SpyEngine(players, () => {}, () => {});
    const state = engine.getPublicState();

    expect(state.phase).toBe('reveal');
    expect(state.round).toBe(1);
    expect(state.players).toHaveLength(3);

    // Vérifie qu'il y a 1 espion et des civils
    const roles = Object.values(engine.roles).map((r) => r.role);
    expect(roles).toContain('spy');
    expect(roles).toContain('civil');

    // Vérifie la séparation des informations privées (C1)
    const p1Private = engine.getPrivateState('p1');
    expect(p1Private.myWord).toBeDefined();
    expect(state.civilWord).toBeUndefined(); // Masqué au public avant la fin
    expect(state.spyWord).toBeUndefined();

    engine.destroy();
  });

  it('gère le tour de parole et les indices', () => {
    const players = [
      { id: 'p1', name: 'Alice' },
      { id: 'p2', name: 'Bob' },
      { id: 'p3', name: 'Charlie' },
    ];
    const engine = new SpyEngine(players, () => {}, () => {});
    engine.startCluePhase();

    expect(engine.phase).toBe('clue');
    const speakerId = engine.turnOrder[0];
    const res = engine.handleAction(speakerId, 'spy_submit_clue', { clue: 'Délicieux et sucré' });
    expect(res.success).toBe(true);
    expect(engine.clues[speakerId]).toBe('Délicieux et sucré');

    engine.destroy();
  });

  it('élimine le joueur le plus voté et déclenche la victoire des citoyens si l\'espion meurt', () => {
    let winner = null;
    const players = [
      { id: 'p1', name: 'Alice' },
      { id: 'p2', name: 'Bob' },
      { id: 'p3', name: 'Charlie' },
    ];
    const engine = new SpyEngine(players, () => {}, (w) => {
      winner = w;
    });

    // Trouve qui est l'espion
    const spyId = Object.entries(engine.roles).find(([, r]) => r.role === 'spy')[0];

    engine.startVotePhase();
    // Tout le monde vote contre l'espion
    players.forEach((p) => {
      engine.handleAction(p.id, 'spy_vote', { targetPlayerId: spyId });
    });

    // L'espion est éliminé -> phase de devinette ou fin
    if (engine.phase === 'guess') {
      // Échoue la devinette
      engine.handleAction(spyId, 'spy_guess_word', { word: 'MauvaiseReponse123' });
    }

    expect(engine.roles[spyId].alive).toBe(false);
    expect(engine.winner).toBe('civils');
    expect(engine.phase).toBe('gameover');

    engine.destroy();
  });
});
