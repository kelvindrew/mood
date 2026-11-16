// Memory Poker Local Storage & Persistent Statistics
// Manages games played, high scores, hand tier records and recent history

import { PokerHandTier } from './pokerEvaluator';
import { MemoryPokerDifficulty } from './scoring';

export interface MemoryPokerRecord {
  id: string;
  timestamp: number;
  difficulty: MemoryPokerDifficulty;
  tier: PokerHandTier;
  combinationName: string;
  totalScore: number;
  timeUsedSeconds: number;
  communityCards: string[];
  chosenCards: string[];
}

export interface MemoryPokerStats {
  gamesPlayed: number;
  bestScore: number;
  highestTier: PokerHandTier;
  highestHandName: string;
  totalPointsAccumulated: number;
  history: MemoryPokerRecord[];
}

const STORAGE_KEY = 'mood_memory_poker_stats_v1';

const DEFAULT_STATS: MemoryPokerStats = {
  gamesPlayed: 0,
  bestScore: 0,
  highestTier: PokerHandTier.HIGH_CARD,
  highestHandName: 'Carte Haute',
  totalPointsAccumulated: 0,
  history: [],
};

export class MemoryPokerStorage {
  public static getStats(): MemoryPokerStats {
    if (typeof window === 'undefined') return DEFAULT_STATS;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          ...DEFAULT_STATS,
          ...parsed,
          history: Array.isArray(parsed.history) ? parsed.history : [],
        };
      }
    } catch {}
    return DEFAULT_STATS;
  }

  public static recordGame(entry: Omit<MemoryPokerRecord, 'id' | 'timestamp'>): MemoryPokerStats {
    const stats = this.getStats();
    const newRecord: MemoryPokerRecord = {
      ...entry,
      id: `mp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      timestamp: Date.now(),
    };

    const isNewBestScore = entry.totalScore > stats.bestScore;
    const isNewHighestTier = entry.tier > stats.highestTier;

    const updated: MemoryPokerStats = {
      gamesPlayed: stats.gamesPlayed + 1,
      bestScore: isNewBestScore ? entry.totalScore : stats.bestScore,
      highestTier: isNewHighestTier ? entry.tier : stats.highestTier,
      highestHandName: isNewHighestTier ? entry.combinationName : stats.highestHandName,
      totalPointsAccumulated: stats.totalPointsAccumulated + entry.totalScore,
      history: [newRecord, ...stats.history].slice(0, 15), // Keep last 15 games
    };

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {}
    }

    return updated;
  }

  public static resetStats(): void {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {}
    }
  }
}
