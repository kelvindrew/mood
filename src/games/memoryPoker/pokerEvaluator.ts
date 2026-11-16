// Poker Hand Evaluator (10 standard poker combinations with exact kickers)
// Evaluates any 5-card hand and provides accurate comparative scoring and tie-breaking

import { PlayingCard, RANK_DISPLAYS, SUIT_SYMBOLS } from './deck';

export enum PokerHandTier {
  HIGH_CARD = 1,
  ONE_PAIR = 2,
  TWO_PAIR = 3,
  THREE_OF_A_KIND = 4,
  STRAIGHT = 5,
  FLUSH = 6,
  FULL_HOUSE = 7,
  FOUR_OF_A_KIND = 8,
  STRAIGHT_FLUSH = 9,
  ROYAL_FLUSH = 10,
}

export interface PokerEvaluation {
  tier: PokerHandTier;
  name: string;
  frenchName: string;
  scoreValue: number;          // Unique numerical score for sorting & tie-breaking
  primaryRank: number;         // e.g. Quad rank, Trips rank, Pair rank, or highest straight card
  secondaryRank: number;       // e.g. Pair rank in Full House or second pair
  kickers: number[];           // Ordered list of remaining kickers in descending order
  cards: PlayingCard[];        // The 5 evaluated cards, sorted by hand priority
}

/**
 * Checks if 5 ranks form a straight.
 * Returns { isStraight: boolean, highestRank: number }
 * Note: A-2-3-4-5 (The Wheel) is a valid straight where the highest rank is 5 (Ace acts as 1).
 */
export function checkStraight(ranksDescending: number[]): { isStraight: boolean; highestRank: number } {
  if (ranksDescending.length !== 5) return { isStraight: false, highestRank: 0 };

  // Standard straight check: consecutive ranks
  const isNormalStraight =
    ranksDescending[0] - ranksDescending[1] === 1 &&
    ranksDescending[1] - ranksDescending[2] === 1 &&
    ranksDescending[2] - ranksDescending[3] === 1 &&
    ranksDescending[3] - ranksDescending[4] === 1;

  if (isNormalStraight) {
    return { isStraight: true, highestRank: ranksDescending[0] };
  }

  // Wheel check: Ace (14) + 5 + 4 + 3 + 2
  if (
    ranksDescending[0] === 14 &&
    ranksDescending[1] === 5 &&
    ranksDescending[2] === 4 &&
    ranksDescending[3] === 3 &&
    ranksDescending[4] === 2
  ) {
    return { isStraight: true, highestRank: 5 }; // In a wheel, the straight is 5-high
  }

  return { isStraight: false, highestRank: 0 };
}

/**
 * Encodes kickers into a comparable integer base-15.
 */
function encodeKickers(kickers: number[]): number {
  let val = 0;
  for (const k of kickers) {
    val = val * 15 + k;
  }
  return val;
}

/**
 * Evaluates any 5-card poker hand according to official standard rules.
 */
export function evaluatePokerHand(cards: PlayingCard[]): PokerEvaluation {
  if (!cards || cards.length !== 5) {
    throw new Error('Memory Poker evaluation requires exactly 5 cards.');
  }

  // Sort descending by rank (14 down to 2)
  const sorted = [...cards].sort((a, b) => b.rank - a.rank);
  const ranks = sorted.map((c) => c.rank);
  const suits = sorted.map((c) => c.suit);

  const isFlush = suits.every((s) => s === suits[0]);
  const straightCheck = checkStraight(ranks);
  const isStraight = straightCheck.isStraight;
  const straightHighRank = straightCheck.highestRank;

  // Rank frequency analysis
  const countMap: Record<number, number> = {};
  for (const r of ranks) {
    countMap[r] = (countMap[r] || 0) + 1;
  }

  const rankCounts = Object.entries(countMap).map(([rankStr, count]) => ({
    rank: Number(rankStr),
    count,
  }));

  // Sort groups by count descending, then by rank descending
  rankCounts.sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count;
    return b.rank - a.rank;
  });

  const suitSymbol = SUIT_SYMBOLS[suits[0]];

  // 1. Royal Flush: A-K-Q-J-10 of same suit
  if (isFlush && isStraight && straightHighRank === 14) {
    const scoreValue = 10 * 10000000;
    return {
      tier: PokerHandTier.ROYAL_FLUSH,
      name: 'Royal Flush',
      frenchName: `Quinte Flush Royale (${suitSymbol})`,
      scoreValue,
      primaryRank: 14,
      secondaryRank: 0,
      kickers: [],
      cards: sorted,
    };
  }

  // 2. Straight Flush: 5 consecutive cards of same suit
  if (isFlush && isStraight) {
    const scoreValue = 9 * 10000000 + straightHighRank * 100000;
    return {
      tier: PokerHandTier.STRAIGHT_FLUSH,
      name: 'Straight Flush',
      frenchName: `Quinte Flush ${RANK_DISPLAYS[straightHighRank]} (${suitSymbol})`,
      scoreValue,
      primaryRank: straightHighRank,
      secondaryRank: 0,
      kickers: [],
      cards: sorted,
    };
  }

  // 3. Four of a Kind (Carré)
  if (rankCounts[0].count === 4) {
    const quadRank = rankCounts[0].rank;
    const kicker = rankCounts[1].rank;
    const scoreValue = 8 * 10000000 + quadRank * 100000 + kicker;
    const sortedHand = sorted.filter((c) => c.rank === quadRank).concat(sorted.filter((c) => c.rank !== quadRank));
    return {
      tier: PokerHandTier.FOUR_OF_A_KIND,
      name: 'Four of a Kind',
      frenchName: `Carré de ${RANK_DISPLAYS[quadRank]}`,
      scoreValue,
      primaryRank: quadRank,
      secondaryRank: 0,
      kickers: [kicker],
      cards: sortedHand,
    };
  }

  // 4. Full House (Main Pleine)
  if (rankCounts[0].count === 3 && rankCounts[1].count === 2) {
    const tripsRank = rankCounts[0].rank;
    const pairRank = rankCounts[1].rank;
    const scoreValue = 7 * 10000000 + tripsRank * 100000 + pairRank * 1000;
    const sortedHand = sorted.filter((c) => c.rank === tripsRank).concat(sorted.filter((c) => c.rank === pairRank));
    return {
      tier: PokerHandTier.FULL_HOUSE,
      name: 'Full House',
      frenchName: `Full House aux ${RANK_DISPLAYS[tripsRank]} par les ${RANK_DISPLAYS[pairRank]}`,
      scoreValue,
      primaryRank: tripsRank,
      secondaryRank: pairRank,
      kickers: [],
      cards: sortedHand,
    };
  }

  // 5. Flush (Couleur)
  if (isFlush) {
    const scoreValue = 6 * 10000000 + encodeKickers(ranks);
    return {
      tier: PokerHandTier.FLUSH,
      name: 'Flush',
      frenchName: `Couleur ${suitSymbol} (Hauteur ${RANK_DISPLAYS[ranks[0]]})`,
      scoreValue,
      primaryRank: ranks[0],
      secondaryRank: 0,
      kickers: ranks.slice(1),
      cards: sorted,
    };
  }

  // 6. Straight (Quinte)
  if (isStraight) {
    const scoreValue = 5 * 10000000 + straightHighRank * 100000;
    return {
      tier: PokerHandTier.STRAIGHT,
      name: 'Straight',
      frenchName: `Quinte à hauteur ${RANK_DISPLAYS[straightHighRank]}`,
      scoreValue,
      primaryRank: straightHighRank,
      secondaryRank: 0,
      kickers: [],
      cards: sorted,
    };
  }

  // 7. Three of a Kind (Brelan)
  if (rankCounts[0].count === 3) {
    const tripsRank = rankCounts[0].rank;
    const kickers = [rankCounts[1].rank, rankCounts[2].rank];
    const scoreValue = 4 * 10000000 + tripsRank * 100000 + encodeKickers(kickers);
    const sortedHand = sorted.filter((c) => c.rank === tripsRank).concat(sorted.filter((c) => c.rank !== tripsRank));
    return {
      tier: PokerHandTier.THREE_OF_A_KIND,
      name: 'Three of a Kind',
      frenchName: `Brelan de ${RANK_DISPLAYS[tripsRank]}`,
      scoreValue,
      primaryRank: tripsRank,
      secondaryRank: 0,
      kickers,
      cards: sortedHand,
    };
  }

  // 8. Two Pair (Deux Paires)
  if (rankCounts[0].count === 2 && rankCounts[1].count === 2) {
    const highPair = Math.max(rankCounts[0].rank, rankCounts[1].rank);
    const lowPair = Math.min(rankCounts[0].rank, rankCounts[1].rank);
    const kicker = rankCounts[2].rank;
    const scoreValue = 3 * 10000000 + highPair * 100000 + lowPair * 1000 + kicker;
    const sortedHand = sorted
      .filter((c) => c.rank === highPair)
      .concat(sorted.filter((c) => c.rank === lowPair))
      .concat(sorted.filter((c) => c.rank !== highPair && c.rank !== lowPair));
    return {
      tier: PokerHandTier.TWO_PAIR,
      name: 'Two Pair',
      frenchName: `Deux Paires (${RANK_DISPLAYS[highPair]} et ${RANK_DISPLAYS[lowPair]})`,
      scoreValue,
      primaryRank: highPair,
      secondaryRank: lowPair,
      kickers: [kicker],
      cards: sortedHand,
    };
  }

  // 9. One Pair (Une Paire)
  if (rankCounts[0].count === 2) {
    const pairRank = rankCounts[0].rank;
    const kickers = [rankCounts[1].rank, rankCounts[2].rank, rankCounts[3].rank];
    const scoreValue = 2 * 10000000 + pairRank * 100000 + encodeKickers(kickers);
    const sortedHand = sorted.filter((c) => c.rank === pairRank).concat(sorted.filter((c) => c.rank !== pairRank));
    return {
      tier: PokerHandTier.ONE_PAIR,
      name: 'One Pair',
      frenchName: `Paire de ${RANK_DISPLAYS[pairRank]}`,
      scoreValue,
      primaryRank: pairRank,
      secondaryRank: 0,
      kickers,
      cards: sortedHand,
    };
  }

  // 10. High Card (Carte Haute)
  const scoreValue = 1 * 10000000 + encodeKickers(ranks);
  return {
    tier: PokerHandTier.HIGH_CARD,
    name: 'High Card',
    frenchName: `Carte Haute (${RANK_DISPLAYS[ranks[0]]})`,
    scoreValue,
    primaryRank: ranks[0],
    secondaryRank: 0,
    kickers: ranks.slice(1),
    cards: sorted,
  };
}

/**
 * Compares two poker hands.
 * Returns > 0 if hand A beats hand B, < 0 if hand B beats hand A, and 0 for tie.
 */
export function comparePokerHands(handA: PlayingCard[], handB: PlayingCard[]): number {
  const evalA = evaluatePokerHand(handA);
  const evalB = evaluatePokerHand(handB);
  return evalA.scoreValue - evalB.scoreValue;
}
