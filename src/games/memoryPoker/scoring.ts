// Scoring Calculations for Memory Poker
// Evaluates points based on poker combination, decision speed, and difficulty multiplier

import { PokerHandTier } from './pokerEvaluator';

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
  timeUsedSeconds: number;
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
      timeUsedSeconds,
    };
  }

  // Speed bonus up to 200 points based on unused decision time
  const remainingTime = Math.max(0, config.decisionSeconds - timeUsedSeconds);
  const speedBonusRatio = config.decisionSeconds > 0 ? remainingTime / config.decisionSeconds : 0;
  const speedBonus = Math.round(speedBonusRatio * 200);

  const rawScore = handPoints + speedBonus;
  const totalPoints = Math.round(rawScore * config.multiplier);

  return {
    handPoints,
    speedBonus,
    multiplier: config.multiplier,
    totalPoints,
    timeUsedSeconds,
  };
}
