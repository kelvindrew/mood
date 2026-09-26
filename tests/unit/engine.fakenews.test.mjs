// Unit tests for FakeNewsEngine (Fake News / Fibbage)
import { describe, it, expect } from 'vitest';
import { FakeNewsEngine } from '../../server/games/fakeNewsEngine.js';

describe('FakeNewsEngine (Fake News : Qui a dit vrai ?)', () => {
  it('initialise une question insolite avec prompt et phase d\'écriture', () => {
    const players = [
      { id: 'p1', name: 'Alice' },
      { id: 'p2', name: 'Bob' },
    ];
    const engine = new FakeNewsEngine(players, () => {}, () => {});
    const state = engine.getPublicState();

    expect(state.phase).toBe('writing');
    expect(state.currentRound).toBe(1);
    expect(state.prompt).toBeDefined();
    expect(state.truth).toBeUndefined(); // Masqué aux joueurs

    engine.destroy();
  });

  it('collecte les mensonges des joueurs et les mélange avec la vérité', () => {
    const players = [
      { id: 'p1', name: 'Alice' },
      { id: 'p2', name: 'Bob' },
    ];
    const engine = new FakeNewsEngine(players, () => {}, () => {});

    // Soumission de mensonges
    engine.handleAction('p1', 'fn_submit_lie', { lie: 'Très énervés' });
    engine.handleAction('p2', 'fn_submit_lie', { lie: 'Affamés' });

    expect(engine.phase).toBe('voting');
    expect(engine.votingChoices.length).toBeGreaterThanOrEqual(3);

    // Contient le mensonge d'Alice, celui de Bob et la vraie réponse
    const texts = engine.votingChoices.map((c) => c.text);
    expect(texts).toContain('Très énervés');
    expect(texts).toContain('Affamés');
    expect(texts).toContain(engine.currentQuestion.answer);

    engine.destroy();
  });

  it('attribue +200 pts pour la vérité et +100 pts par joueur piégé', () => {
    const players = [
      { id: 'p1', name: 'Alice' },
      { id: 'p2', name: 'Bob' },
    ];
    const engine = new FakeNewsEngine(players, () => {}, () => {});

    engine.handleAction('p1', 'fn_submit_lie', { lie: 'MonSuperMensonge' });
    engine.handleAction('p2', 'fn_submit_lie', { lie: 'AutreMensonge' });

    // Trouve l'ID du choix vérité et du mensonge d'Alice
    const truthChoice = engine.votingChoices.find((c) => c.isCorrect);
    const aliceLieChoice = engine.votingChoices.find((c) => c.authorPlayerId === 'p1');

    // Alice vote pour la vérité (+200 pts)
    engine.handleAction('p1', 'fn_cast_vote', { choiceId: truthChoice.id });
    // Bob se fait piéger et vote pour le mensonge d'Alice (+100 pts pour Alice)
    engine.handleAction('p2', 'fn_cast_vote', { choiceId: aliceLieChoice.id });

    // Alice doit avoir 200 (vérité) + 100 (Bob dupé) = 300 pts
    // Bob doit avoir 0 pt
    expect(engine.scores.p1).toBe(300);
    expect(engine.scores.p2).toBe(0);
    expect(engine.phase).toBe('reveal');

    engine.destroy();
  });
});
