// Unit tests for JeuDePaysEngine (« JEU DE PAYS »)
import { describe, it, expect } from 'vitest';
import {
  JeuDePaysEngine,
  normalizeAnswer,
  answerStartsWithLetter,
} from '../../server/games/jeuDePaysEngine.js';

describe('JeuDePaysEngine (« JEU DE PAYS »)', () => {
  it('normalise correctement les réponses et vérifie la lettre de départ', () => {
    // Test normalization with articles, accents, case, whitespace
    expect(normalizeAnswer('  Le Maroc  ')).toBe('maroc');
    expect(normalizeAnswer("L'Espagne")).toBe('espagne');
    expect(normalizeAnswer('Les Pays-Bas')).toBe('pays-bas');
    expect(normalizeAnswer('Éléphant')).toBe('elephant');
    expect(normalizeAnswer("Côte d'Ivoire")).toBe("cote d'ivoire");
    expect(normalizeAnswer('Mercedes-Benz')).toBe('mercedes-benz');

    // Test letter checks
    expect(answerStartsWithLetter('Maroc', 'M')).toBe(true);
    expect(answerStartsWithLetter('Le Maroc', 'M')).toBe(true);
    expect(answerStartsWithLetter("L'Espagne", 'E')).toBe(true);
    expect(answerStartsWithLetter('Éléphant', 'E')).toBe(true);
    expect(answerStartsWithLetter('France', 'M')).toBe(false);
    expect(answerStartsWithLetter('', 'M')).toBe(false);
  });

  it('initialise une partie avec 5 catégories en chaîne et le Pays en tête', () => {
    const players = [
      { id: 'p1', name: 'Alice' },
      { id: 'p2', name: 'Bob' },
    ];
    const engine = new JeuDePaysEngine(players, () => {}, () => {});
    const state = engine.getPublicState();

    expect(state.phase).toBe('wheel');
    expect(state.currentRound).toBe(1);
    expect(state.currentLetter).toBeDefined();
    expect(state.roundCategories).toHaveLength(5);
    // Le premier jeu en chaîne doit toujours être la catégorie "pays"
    expect(state.roundCategories[0].id).toBe('pays');
    expect(state.players).toHaveLength(2);

    engine.destroy();
  });

  it('gère la soumission des réponses et la protection contre double soumission', () => {
    const players = [
      { id: 'p1', name: 'Alice' },
      { id: 'p2', name: 'Bob' },
    ];
    const engine = new JeuDePaysEngine(players, () => {}, () => {});
    engine.currentLetter = 'M';
    engine.startCategory(0);

    expect(engine.phase).toBe('category_running');
    expect(engine.currentCategoryIndex).toBe(0);

    // Alice soumet une première réponse
    const res1 = engine.handleAction('p1', 'jdp_submit_answer', { text: 'Maroc' });
    expect(res1.success).toBe(true);
    expect(engine.answeredPlayersForCurrentCat.has('p1')).toBe(true);

    // Alice essaie de soumettre à nouveau pour la même catégorie -> rejeté
    const res2 = engine.handleAction('p1', 'jdp_submit_answer', { text: 'Madagascar' });
    expect(res2.success).toBe(false);

    // Réponse toujours 'Maroc'
    expect(engine.answers.p1.pays.text).toBe('Maroc');

    engine.destroy();
  });

  it('calcule les scores : unique (10 pts), doublon (5 pts) et bonus de vitesse (+3 pts)', () => {
    const players = [
      { id: 'p1', name: 'Alice' },
      { id: 'p2', name: 'Bob' },
    ];
    const engine = new JeuDePaysEngine(players, () => {}, () => {});
    engine.currentLetter = 'M';

    const cat0 = engine.roundCategories[0].id; // pays
    const cat1 = engine.roundCategories[1].id; // other

    // Simule réponses manuelles :
    // cat0: Alice et Bob mettent "Maroc" (doublon -> 5 pts chacun)
    // Alice a répondu très vite (timeLeft = 10s sur 12s -> >65% -> +3 pts bonus vitesse)
    // Bob a répondu lentement (timeLeft = 2s sur 12s -> <35% -> +1 pt bonus vitesse)
    engine.answers.p1[cat0] = { text: 'Maroc', submittedAtTimeLeft: 10 };
    engine.answers.p2[cat0] = { text: 'Le Maroc', submittedAtTimeLeft: 2 };

    // cat1: Alice met "Mouton" (unique -> 10 pts + 3 pts vitesse = 13 pts)
    // Bob met une mauvaise lettre "Chien" -> 0 pt
    engine.answers.p1[cat1] = { text: 'Mouton', submittedAtTimeLeft: 11 };
    engine.answers.p2[cat1] = { text: 'Chien', submittedAtTimeLeft: 10 };

    engine.computeRoundScores();

    // Alice cat0: 5 (doublon) + 3 (vitesse) = 8 pts
    // Alice cat1: 10 (unique) + 3 (vitesse) = 13 pts
    // Total Alice = 21 pts
    expect(engine.scores.p1).toBe(21);

    // Bob cat0: 5 (doublon) + 1 (vitesse) = 6 pts
    // Bob cat1: 0 (mauvaise lettre 'Chien') = 0 pt
    // Total Bob = 6 pts
    expect(engine.scores.p2).toBe(6);

    engine.destroy();
  });

  it('prend en compte le vote de rejet démocratique pour annuler une réponse', () => {
    const players = [
      { id: 'p1', name: 'Alice' },
      { id: 'p2', name: 'Bob' },
      { id: 'p3', name: 'Charlie' },
    ];
    const engine = new JeuDePaysEngine(players, () => {}, () => {});
    engine.currentLetter = 'M';

    const cat0 = engine.roundCategories[0].id;

    // Alice invente un faux pays qui commence par M ("Marsouinland")
    engine.answers.p1[cat0] = { text: 'Marsouinland', submittedAtTimeLeft: 10 };
    engine.answers.p2[cat0] = { text: 'Mexique', submittedAtTimeLeft: 9 };
    engine.answers.p3[cat0] = { text: 'Madagascar', submittedAtTimeLeft: 8 };

    // Passer en phase de vote
    engine.phase = 'voting';

    // Bob et Charlie votent contre Alice
    engine.castValidationVote('p2', 'p1', cat0, false);
    engine.castValidationVote('p3', 'p1', cat0, false);

    engine.computeRoundScores();

    // Alice doit avoir 0 point sur cat0 car rejetée par au moins 2 votes
    const aliceBreakdown = engine.roundBreakdowns.p1.find((b) => b.categoryId === cat0);
    expect(aliceBreakdown.rejected).toBe(true);
    expect(aliceBreakdown.totalPoints).toBe(0);

    // Bob et Charlie ont des réponses uniques valides (+10 pts + 3 pts vitesse = 13 pts)
    expect(engine.scores.p2).toBe(13);
    expect(engine.scores.p3).toBe(13);

    engine.destroy();
  });
});
