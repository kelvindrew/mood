// Unit tests for PetitBacEngine (Le Petit Bac / Scattergories)
import { describe, it, expect } from 'vitest';
import { PetitBacEngine } from '../../server/games/petitBacEngine.js';

describe('PetitBacEngine (Le Petit Bac)', () => {
  it('initialise une partie avec 5 catégories et une lettre jouable', () => {
    const players = [
      { id: 'p1', name: 'Alice' },
      { id: 'p2', name: 'Bob' },
    ];
    const engine = new PetitBacEngine(players, () => {}, () => {});
    const state = engine.getPublicState();

    expect(state.phase).toBe('wheel');
    expect(state.currentRound).toBe(1);
    expect(state.currentLetter).toBeDefined();
    expect(state.currentCategories).toHaveLength(5);
    expect(state.players).toHaveLength(2);

    engine.destroy();
  });

  it('permet la soumission de réponses et le déclenchement du STOP', () => {
    const players = [
      { id: 'p1', name: 'Alice' },
      { id: 'p2', name: 'Bob' },
    ];
    const engine = new PetitBacEngine(players, () => {}, () => {});
    engine.startWritingPhase();

    expect(engine.phase).toBe('writing');
    expect(engine.timer).toBe(60);

    const letter = engine.currentLetter;
    const catId = engine.currentCategories[0].id;

    // Alice soumet et déclenche le STOP
    const res = engine.handleAction('p1', 'bac_submit_answers', {
      answers: { [catId]: `${letter}aris` },
      triggerStop: true,
    });

    expect(res.success).toBe(true);
    expect(engine.hasStopBeenTriggered).toBe(true);
    expect(engine.timer).toBeLessThanOrEqual(10); // Rushed countdown

    engine.destroy();
  });

  it('calcule les points avec bonus d\'unicité (+10) et doublon (+5)', () => {
    const players = [
      { id: 'p1', name: 'Alice' },
      { id: 'p2', name: 'Bob' },
    ];
    const engine = new PetitBacEngine(players, () => {}, () => {});
    engine.currentLetter = 'P';
    engine.startWritingPhase();

    const cat0 = engine.currentCategories[0].id;
    const cat1 = engine.currentCategories[1].id;

    // Alice et Bob mettent la même réponse sur cat0 (Doublon -> +5 pts chacun)
    // Alice met une réponse unique sur cat1 (+10 pts)
    engine.submitAnswers('p1', { [cat0]: 'Paris', [cat1]: 'Pierre' });
    engine.submitAnswers('p2', { [cat0]: 'Paris', [cat1]: 'Paul' });

    engine.computeRoundScores();

    // Alice : 5 (Paris) + 10 (Pierre) = 15 pts
    // Bob : 5 (Paris) + 10 (Paul) = 15 pts
    expect(engine.scores.p1).toBe(15);
    expect(engine.scores.p2).toBe(15);

    engine.destroy();
  });
});
