// Memory Poker Local Storage, Statistics & Achievements
// Manages games played, tournaments, high scores, Garnets (🪙), badges and history

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
  garnetsEarned: number;
  communityCards: string[];
  chosenCards: string[];
}

export interface MemoryPokerAchievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: number;
}

export const MEMORY_POKER_ACHIEVEMENTS: MemoryPokerAchievement[] = [
  {
    id: 'photo_memo',
    title: 'Mémoire Photographique',
    description: 'Obtenir une Quinte ou mieux en difficulté Normale ou Expert',
    icon: '🧠',
    unlocked: false,
  },
  {
    id: 'speed_demon',
    title: 'Speed Demon',
    description: 'Valider votre sélection en moins de 10 secondes',
    icon: '⚡',
    unlocked: false,
  },
  {
    id: 'perfect_vision',
    title: 'Vision Parfaite',
    description: 'Dénicher la combinaison maximale théorique de toute la table',
    icon: '🎯',
    unlocked: false,
  },
  {
    id: 'garnet_hoarder',
    title: 'Seigneur des Garnets',
    description: 'Accumuler un trésor de 25 Pièces du Démon (Garnets 🪙)',
    icon: '🪙',
    unlocked: false,
  },
  {
    id: 'devil_grandmaster',
    title: "Maître du Démon",
    description: 'Remporter un tournoi 3 manches avec plus de 2500 points',
    icon: '👑',
    unlocked: false,
  },
  {
    id: 'royal_legend',
    title: 'Légende Royale',
    description: 'Réaliser une Quinte Flush ou Quinte Flush Royale',
    icon: '🏆',
    unlocked: false,
  },
];

export interface MemoryPokerStats {
  gamesPlayed: number;
  tournamentsCompleted: number;
  bestScore: number;
  highestTier: PokerHandTier;
  highestHandName: string;
  totalPointsAccumulated: number;
  totalGarnets: number;
  unlockedAchievements: string[];
  history: MemoryPokerRecord[];
}

const STORAGE_KEY = 'mood_memory_poker_stats_v1';

const DEFAULT_STATS: MemoryPokerStats = {
  gamesPlayed: 0,
  tournamentsCompleted: 0,
  bestScore: 0,
  highestTier: PokerHandTier.HIGH_CARD,
  highestHandName: 'Carte Haute',
  totalPointsAccumulated: 0,
  totalGarnets: 0,
  unlockedAchievements: [],
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
          unlockedAchievements: Array.isArray(parsed.unlockedAchievements)
            ? parsed.unlockedAchievements
            : [],
          history: Array.isArray(parsed.history) ? parsed.history : [],
        };
      }
    } catch {}
    return DEFAULT_STATS;
  }

  public static recordGame(entry: Omit<MemoryPokerRecord, 'id' | 'timestamp'>): {
    stats: MemoryPokerStats;
    newlyUnlocked: MemoryPokerAchievement[];
  } {
    const stats = this.getStats();
    const newRecord: MemoryPokerRecord = {
      ...entry,
      id: `mp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      timestamp: Date.now(),
    };

    const isNewBestScore = entry.totalScore > stats.bestScore;
    const isNewHighestTier = entry.tier > stats.highestTier;
    const updatedGarnets = stats.totalGarnets + (entry.garnetsEarned || 1);

    const newlyUnlocked: MemoryPokerAchievement[] = [];
    const currentUnlocked = new Set(stats.unlockedAchievements);

    // Vérification des Succès
    if (!currentUnlocked.has('speed_demon') && entry.timeUsedSeconds < 10) {
      currentUnlocked.add('speed_demon');
      const ach = MEMORY_POKER_ACHIEVEMENTS.find((a) => a.id === 'speed_demon');
      if (ach) newlyUnlocked.push({ ...ach, unlocked: true, unlockedAt: Date.now() });
    }

    if (
      !currentUnlocked.has('photo_memo') &&
      entry.tier >= PokerHandTier.STRAIGHT &&
      (entry.difficulty === 'normal' || entry.difficulty === 'hard')
    ) {
      currentUnlocked.add('photo_memo');
      const ach = MEMORY_POKER_ACHIEVEMENTS.find((a) => a.id === 'photo_memo');
      if (ach) newlyUnlocked.push({ ...ach, unlocked: true, unlockedAt: Date.now() });
    }

    if (!currentUnlocked.has('royal_legend') && entry.tier >= PokerHandTier.STRAIGHT_FLUSH) {
      currentUnlocked.add('royal_legend');
      const ach = MEMORY_POKER_ACHIEVEMENTS.find((a) => a.id === 'royal_legend');
      if (ach) newlyUnlocked.push({ ...ach, unlocked: true, unlockedAt: Date.now() });
    }

    if (!currentUnlocked.has('garnet_hoarder') && updatedGarnets >= 25) {
      currentUnlocked.add('garnet_hoarder');
      const ach = MEMORY_POKER_ACHIEVEMENTS.find((a) => a.id === 'garnet_hoarder');
      if (ach) newlyUnlocked.push({ ...ach, unlocked: true, unlockedAt: Date.now() });
    }

    const updated: MemoryPokerStats = {
      gamesPlayed: stats.gamesPlayed + 1,
      tournamentsCompleted: stats.tournamentsCompleted,
      bestScore: isNewBestScore ? entry.totalScore : stats.bestScore,
      highestTier: isNewHighestTier ? entry.tier : stats.highestTier,
      highestHandName: isNewHighestTier ? entry.combinationName : stats.highestHandName,
      totalPointsAccumulated: stats.totalPointsAccumulated + entry.totalScore,
      totalGarnets: updatedGarnets,
      unlockedAchievements: Array.from(currentUnlocked),
      history: [newRecord, ...stats.history].slice(0, 20), // Garde les 20 dernières
    };

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {}
    }

    return { stats: updated, newlyUnlocked };
  }

  public static unlockSpecificAchievement(id: string): MemoryPokerAchievement | null {
    const stats = this.getStats();
    if (stats.unlockedAchievements.includes(id)) return null;

    const ach = MEMORY_POKER_ACHIEVEMENTS.find((a) => a.id === id);
    if (!ach) return null;

    stats.unlockedAchievements.push(id);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
      } catch {}
    }
    return { ...ach, unlocked: true, unlockedAt: Date.now() };
  }

  public static recordTournamentComplete(totalScore: number): {
    stats: MemoryPokerStats;
    newlyUnlocked: MemoryPokerAchievement[];
  } {
    const stats = this.getStats();
    stats.tournamentsCompleted += 1;
    const newlyUnlocked: MemoryPokerAchievement[] = [];

    if (!stats.unlockedAchievements.includes('devil_grandmaster') && totalScore >= 2500) {
      stats.unlockedAchievements.push('devil_grandmaster');
      const ach = MEMORY_POKER_ACHIEVEMENTS.find((a) => a.id === 'devil_grandmaster');
      if (ach) newlyUnlocked.push({ ...ach, unlocked: true, unlockedAt: Date.now() });
    }

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
      } catch {}
    }

    return { stats, newlyUnlocked };
  }

  public static getAchievements(): MemoryPokerAchievement[] {
    const stats = this.getStats();
    const unlockedSet = new Set(stats.unlockedAchievements);
    return MEMORY_POKER_ACHIEVEMENTS.map((ach) => ({
      ...ach,
      unlocked: unlockedSet.has(ach.id),
    }));
  }

  public static resetStats(): void {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {}
    }
  }
}
