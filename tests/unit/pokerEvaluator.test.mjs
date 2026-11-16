import { describe, it, expect } from 'vitest';
import { evaluatePokerHand, comparePokerHands, PokerHandTier } from '../../src/games/memoryPoker/pokerEvaluator';
import { findBestPossibleHand, calculateRoundGarnets } from '../../src/games/memoryPoker/scoring';

const c = (suit, rank) => ({
  id: `${suit}_${rank}`,
  suit,
  rank,
  display: String(rank),
  symbol: suit === 'heart' ? '♥' : suit === 'spade' ? '♠' : suit === 'diamond' ? '♦' : '♣',
  color: suit === 'heart' || suit === 'diamond' ? 'red' : 'black',
});

describe('Memory Poker — Évaluateur des 10 combinaisons officielles', () => {
  it('1. Détecte une Quinte Flush Royale (Royal Flush)', () => {
    const hand = [c('spade', 14), c('spade', 13), c('spade', 12), c('spade', 11), c('spade', 10)];
    const res = evaluatePokerHand(hand);
    expect(res.tier).toBe(PokerHandTier.ROYAL_FLUSH);
    expect(res.name).toBe('Royal Flush');
    expect(res.primaryRank).toBe(14);
  });

  it('2. Détecte une Quinte Flush standard (Straight Flush)', () => {
    const hand = [c('heart', 9), c('heart', 8), c('heart', 7), c('heart', 6), c('heart', 5)];
    const res = evaluatePokerHand(hand);
    expect(res.tier).toBe(PokerHandTier.STRAIGHT_FLUSH);
    expect(res.primaryRank).toBe(9);
  });

  it('3. Détecte une Quinte Flush As-basse / Roue (Steel Wheel : 5-4-3-2-A même couleur)', () => {
    const hand = [c('diamond', 14), c('diamond', 2), c('diamond', 3), c('diamond', 4), c('diamond', 5)];
    const res = evaluatePokerHand(hand);
    expect(res.tier).toBe(PokerHandTier.STRAIGHT_FLUSH);
    expect(res.primaryRank).toBe(5); // Hauteur 5
  });

  it('4. Détecte un Carré (Four of a Kind) avec kicker', () => {
    const hand = [c('club', 10), c('spade', 10), c('heart', 10), c('diamond', 10), c('heart', 14)];
    const res = evaluatePokerHand(hand);
    expect(res.tier).toBe(PokerHandTier.FOUR_OF_A_KIND);
    expect(res.primaryRank).toBe(10);
    expect(res.kickers).toEqual([14]);
  });

  it('5. Détecte un Full House (Brelan + Paire)', () => {
    const hand = [c('spade', 13), c('heart', 13), c('diamond', 13), c('club', 8), c('spade', 8)];
    const res = evaluatePokerHand(hand);
    expect(res.tier).toBe(PokerHandTier.FULL_HOUSE);
    expect(res.primaryRank).toBe(13);
    expect(res.secondaryRank).toBe(8);
  });

  it('6. Détecte une Couleur (Flush)', () => {
    const hand = [c('club', 14), c('club', 11), c('club', 9), c('club', 7), c('club', 2)];
    const res = evaluatePokerHand(hand);
    expect(res.tier).toBe(PokerHandTier.FLUSH);
    expect(res.primaryRank).toBe(14);
    expect(res.kickers).toEqual([11, 9, 7, 2]);
  });

  it('7. Détecte une Quinte Broadway (A-K-Q-J-10 dépareillée)', () => {
    const hand = [c('heart', 14), c('spade', 13), c('diamond', 12), c('club', 11), c('heart', 10)];
    const res = evaluatePokerHand(hand);
    expect(res.tier).toBe(PokerHandTier.STRAIGHT);
    expect(res.primaryRank).toBe(14);
  });

  it('8. Détecte une Quinte Basse / Roue (5-4-3-2-A dépareillée)', () => {
    const hand = [c('spade', 14), c('heart', 5), c('diamond', 4), c('club', 3), c('heart', 2)];
    const res = evaluatePokerHand(hand);
    expect(res.tier).toBe(PokerHandTier.STRAIGHT);
    expect(res.primaryRank).toBe(5);
  });

  it('9. Détecte un Brelan (Three of a Kind) avec 2 kickers', () => {
    const hand = [c('spade', 7), c('heart', 7), c('club', 7), c('diamond', 14), c('spade', 11)];
    const res = evaluatePokerHand(hand);
    expect(res.tier).toBe(PokerHandTier.THREE_OF_A_KIND);
    expect(res.primaryRank).toBe(7);
    expect(res.kickers).toEqual([14, 11]);
  });

  it('10. Détecte Deux Paires (Two Pair) avec kicker', () => {
    const hand = [c('spade', 12), c('heart', 12), c('diamond', 6), c('club', 6), c('heart', 14)];
    const res = evaluatePokerHand(hand);
    expect(res.tier).toBe(PokerHandTier.TWO_PAIR);
    expect(res.primaryRank).toBe(12);
    expect(res.secondaryRank).toBe(6);
    expect(res.kickers).toEqual([14]);
  });

  it('11. Détecte Une Paire (One Pair) avec 3 kickers', () => {
    const hand = [c('spade', 8), c('heart', 8), c('diamond', 14), c('club', 13), c('heart', 4)];
    const res = evaluatePokerHand(hand);
    expect(res.tier).toBe(PokerHandTier.ONE_PAIR);
    expect(res.primaryRank).toBe(8);
    expect(res.kickers).toEqual([14, 13, 4]);
  });

  it('12. Détecte Carte Haute (High Card) ordonnée', () => {
    const hand = [c('spade', 14), c('heart', 12), c('diamond', 9), c('club', 7), c('heart', 3)];
    const res = evaluatePokerHand(hand);
    expect(res.tier).toBe(PokerHandTier.HIGH_CARD);
    expect(res.primaryRank).toBe(14);
    expect(res.kickers).toEqual([12, 9, 7, 3]);
  });

  it('13. Départage correctement deux mains de même combinaison par leurs kickers', () => {
    // Deux paires de Dames et 6 : Kicker As vs Kicker Roi
    const handWithAce = [c('spade', 12), c('heart', 12), c('diamond', 6), c('club', 6), c('heart', 14)];
    const handWithKing = [c('spade', 12), c('heart', 12), c('diamond', 6), c('club', 6), c('heart', 13)];
    expect(comparePokerHands(handWithAce, handWithKing)).toBeGreaterThan(0);
    expect(comparePokerHands(handWithKing, handWithAce)).toBeLessThan(0);

    // Égalité parfaite (Split pot)
    const cloneHand = [c('club', 12), c('diamond', 12), c('spade', 6), c('heart', 6), c('spade', 14)];
    expect(comparePokerHands(handWithAce, cloneHand)).toBe(0);
  });

  it('14. Trouve la meilleure main théorique possible sur une grille de 16 cartes', () => {
    // 3 communes : 10♠, J♠, Q♠
    const community = [c('spade', 10), c('spade', 11), c('spade', 12)];

    // Grille contenant A♠ et K♠ parmi d'autres cartes
    const grid = [
      c('heart', 2), c('diamond', 3), c('club', 4), c('heart', 5),
      c('diamond', 6), c('club', 7), c('heart', 8), c('diamond', 9),
      c('spade', 13), // Roi de pique (index 8)
      c('spade', 14), // As de pique (index 9)
      c('heart', 10), c('diamond', 11),
      c('club', 12), c('heart', 13), c('diamond', 14), c('club', 2),
    ];

    const best = findBestPossibleHand(grid, community);
    expect(best.evaluation.tier).toBe(PokerHandTier.ROYAL_FLUSH);
    expect(best.indices).toEqual([8, 9]);
  });

  it('15. Calcule correctement les Pièces du Démon (Garnets 🪙)', () => {
    expect(calculateRoundGarnets(PokerHandTier.ROYAL_FLUSH, 150)).toBe(11); // 10 + 1 bonus vitesse
    expect(calculateRoundGarnets(PokerHandTier.FULL_HOUSE, 50)).toBe(5);
    expect(calculateRoundGarnets(PokerHandTier.ONE_PAIR, 0)).toBe(1);
  });
});
