// Scoring Calculations for Memory Poker
// Evaluates points based on poker combination, decision speed, difficulty multiplier, and Garnets (🪙)

import { PokerHandTier, PokerEvaluation, evaluatePokerHand } from './pokerEvaluator';
import { PlayingCard } from './deck';

export type MemoryPokerDifficulty = 'easy' | 'normal' | 'hard' | 'practice';

export interface DifficultyConfig {
  id: MemoryPokerDifficulty;
  label: string;
  memoSeconds: number;
  decisionSeconds: number;
  multiplier: number;
  hasHints: boolean;
  description: string;
}

export const DIFFICULTY_CONFIGS: Record<MemoryPokerDifficulty, DifficultyConfig> = {
  easy: {
    id: 'easy',
    label: 'Facile (Apprenti)',
    memoSeconds: 30,
    decisionSeconds: 90,
    multiplier: 1.0,
    hasHints: true,
    description: '30s de mémorisation, 90s pour choisir. Entraînement visuel idéal.',
  },
  normal: {
    id: 'normal',
    label: 'Standard (Compétiteur)',
    memoSeconds: 20,
    decisionSeconds: 60,
    multiplier: 1.5,
    hasHints: false,
    description: '20s de mémorisation, 60s pour choisir. Règles officielles Devil’s Plan.',
  },
  hard: {
    id: 'hard',
    label: 'Expert (Grand Maître)',
    memoSeconds: 12,
    decisionSeconds: 35,
    multiplier: 2.2,
    hasHints: false,
    description: '12s éclair, 35s de décision. Multiplicateur score x2.2.',
  },
  practice: {
    id: 'practice',
    label: 'Entraînement Libre',
    memoSeconds: 45,
    decisionSeconds: 180,
    multiplier: 0,
    hasHints: true,
    description: 'Prenez tout votre temps pour perfectionner votre mémoire sans pression.',
  },
};

export const TIER_BASE_POINTS: Record<PokerHandTier, number> = {
  [PokerHandTier.ROYAL_FLUSH]: 2500,
  [PokerHandTier.STRAIGHT_FLUSH]: 1500,
  [PokerHandTier.FOUR_OF_A_KIND]: 1000,
  [PokerHandTier.FULL_HOUSE]: 750,
  [PokerHandTier.FLUSH]: 500,
  [PokerHandTier.STRAIGHT]: 400,
  [PokerHandTier.THREE_OF_A_KIND]: 250,
  [PokerHandTier.TWO_PAIR]: 150,
  [PokerHandTier.ONE_PAIR]: 75,
  [PokerHandTier.HIGH_CARD]: 25,
};

export interface ScoreBreakdown {
  handPoints: number;
  speedBonus: number;
  multiplier: number;
  totalPoints: number;
  garnetsEarned: number;
  timeUsedSeconds: number;
}

/**
 * Calculates Pièces du Démon (Garnets 🪙) earned in a round
 */
export function calculateRoundGarnets(tier: PokerHandTier, speedBonus: number): number {
  let garnets = 1;
  if (tier >= PokerHandTier.ROYAL_FLUSH) garnets = 10;
  else if (tier >= PokerHandTier.STRAIGHT_FLUSH) garnets = 8;
  else if (tier >= PokerHandTier.FOUR_OF_A_KIND) garnets = 6;
  else if (tier >= PokerHandTier.FULL_HOUSE) garnets = 5;
  else if (tier >= PokerHandTier.FLUSH) garnets = 4;
  else if (tier >= PokerHandTier.STRAIGHT) garnets = 3;
  else if (tier >= PokerHandTier.THREE_OF_A_KIND) garnets = 2;
  else if (tier >= PokerHandTier.TWO_PAIR) garnets = 2;
  else if (tier >= PokerHandTier.ONE_PAIR) garnets = 1;

  // Bonus rapidité extrême (+1 Garnet)
  if (speedBonus >= 140) garnets += 1;
  return garnets;
}

/**
 * Calculates detailed score breakdown for a completed Memory Poker round
 */
export function calculateRoundScore(
  tier: PokerHandTier,
  timeUsedSeconds: number,
  difficulty: MemoryPokerDifficulty = 'normal'
): ScoreBreakdown {
  const config = DIFFICULTY_CONFIGS[difficulty];
  const handPoints = TIER_BASE_POINTS[tier] || 25;

  if (difficulty === 'practice') {
    return {
      handPoints,
      speedBonus: 0,
      multiplier: 0,
      totalPoints: handPoints,
      garnetsEarned: 1,
      timeUsedSeconds,
    };
  }

  // Speed bonus up to 200 points based on unused decision time
  const remainingTime = Math.max(0, config.decisionSeconds - timeUsedSeconds);
  const speedBonusRatio = config.decisionSeconds > 0 ? remainingTime / config.decisionSeconds : 0;
  const speedBonus = Math.round(speedBonusRatio * 200);

  const rawScore = handPoints + speedBonus;
  const totalPoints = Math.round(rawScore * config.multiplier);
  const garnetsEarned = calculateRoundGarnets(tier, speedBonus);

  return {
    handPoints,
    speedBonus,
    multiplier: config.multiplier,
    totalPoints,
    garnetsEarned,
    timeUsedSeconds,
  };
}

export interface BestPossibleHandResult {
  indices: [number, number];
  cards: [PlayingCard, PlayingCard];
  evaluation: PokerEvaluation;
}

/**
 * Scans all 120 possible card pairs from the 16-card grid combined with the 3 community cards
 * to find the absolute strongest poker hand achievable on the board.
 */
export function findBestPossibleHand(
  grid: PlayingCard[],
  community: PlayingCard[]
): BestPossibleHandResult {
  let bestEval: PokerEvaluation | null = null;
  let bestIndices: [number, number] = [0, 1];
  let bestCards: [PlayingCard, PlayingCard] = [grid[0] || ({} as any), grid[1] || ({} as any)];

  if (grid.length >= 2 && community.length >= 3) {
    for (let i = 0; i < grid.length; i++) {
      for (let j = i + 1; j < grid.length; j++) {
        const candidate = [grid[i], grid[j], ...community];
        const ev = evaluatePokerHand(candidate);
        if (!bestEval || ev.scoreValue > bestEval.scoreValue) {
          bestEval = ev;
          bestIndices = [i, j];
          bestCards = [grid[i], grid[j]];
        }
      }
    }
  }

  return {
    indices: bestIndices,
    cards: bestCards,
    evaluation: bestEval || evaluatePokerHand([grid[0], grid[1], ...community]),
  };
}
