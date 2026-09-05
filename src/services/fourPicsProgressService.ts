// 4 Images 1 Mot — 1 000 Stages Progression, Stars & Reward Service
// Manages unlocked levels, stages (1 to 100 per level), 0-3 golden stars, and milestone rewards

export interface StageProgress {
  stars: number; // 0 to 3
  bestScore: number;
  completed: boolean;
  bestTimeSeconds: number;
}

export interface MilestoneReward {
  id: string;
  stageThreshold: number;
  title: string;
  description: string;
  icon: string;
  rewardType: 'avatar' | 'badge' | 'frame' | 'theme' | 'title';
  rewardValue: string;
  unlocked: boolean;
}

export interface FourPicsProgressState {
  currentLevel: number; // 1 to 10
  currentStage: number; // 1 to 100
  unlockedLevel: number;
  unlockedStage: number; // In the highest unlocked level
  stages: Record<string, StageProgress>; // key: "lvl_X_stg_Y"
  totalStars: number;
  totalCompleted: number;
  totalScore: number;
  unlockedRewards: string[];
}

const STORAGE_KEY = 'playflix_four_pics_progression_v2';

const MILESTONES: MilestoneReward[] = [
  {
    id: 'm_10',
    stageThreshold: 10,
    title: 'Découvreur Novice',
    description: 'A réussi 10 énigmes 4 Images 1 Mot',
    icon: '🥉',
    rewardType: 'badge',
    rewardValue: 'Badge Bronze',
    unlocked: false,
  },
  {
    id: 'm_25',
    stageThreshold: 25,
    title: 'Avatar Phénix Doré',
    description: 'A réussi 25 énigmes',
    icon: '🦅',
    rewardType: 'avatar',
    rewardValue: 'phoenix_gold',
    unlocked: false,
  },
  {
    id: 'm_50',
    stageThreshold: 50,
    title: 'Cadre Néon Impérial',
    description: 'A réussi 50 énigmes',
    icon: '⚡',
    rewardType: 'frame',
    rewardValue: 'frame_neon_imperial',
    unlocked: false,
  },
  {
    id: 'm_100',
    stageThreshold: 100,
    title: 'Médaille Niveau 1 — Très Facile',
    description: 'A complété les 100 stages du Niveau 1 !',
    icon: '🏅',
    rewardType: 'badge',
    rewardValue: 'Medal_Level_1',
    unlocked: false,
  },
  {
    id: 'm_200',
    stageThreshold: 200,
    title: 'Médaille Niveau 2 — Facile',
    description: 'A complété les 100 stages du Niveau 2 !',
    icon: '🥈',
    rewardType: 'theme',
    rewardValue: 'theme_emerald_forest',
    unlocked: false,
  },
  {
    id: 'm_500',
    stageThreshold: 500,
    title: 'Trophée Diamant du Congo',
    description: 'A franchi la barre des 500 stages résolus !',
    icon: '💎',
    rewardType: 'badge',
    rewardValue: 'trophy_diamond',
    unlocked: false,
  },
  {
    id: 'm_1000',
    stageThreshold: 1000,
    title: 'MASTER 4 IMAGES 1 MOT',
    description: 'A terminé les 1 000 stages légendaires !',
    icon: '👑',
    rewardType: 'title',
    rewardValue: 'MASTER 4 IMAGES 1 MOT',
    unlocked: false,
  },
];

class FourPicsProgressService {
  private state: FourPicsProgressState;

  constructor() {
    this.state = this.loadState();
  }

  private loadState(): FourPicsProgressState {
    if (typeof window === 'undefined') {
      return this.getDefaultState();
    }

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Could not load 4 Images 1 Mot progress from storage', e);
    }

    return this.getDefaultState();
  }

  private getDefaultState(): FourPicsProgressState {
    return {
      currentLevel: 1,
      currentStage: 1,
      unlockedLevel: 1,
      unlockedStage: 1,
      stages: {},
      totalStars: 0,
      totalCompleted: 0,
      totalScore: 0,
      unlockedRewards: [],
    };
  }

  public saveState(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.warn('Could not save progress to localStorage', e);
    }
  }

  public getState(): FourPicsProgressState {
    return { ...this.state };
  }

  public isStageUnlocked(level: number, stageNumber: number): boolean {
    if (level < this.state.unlockedLevel) return true;
    if (level === this.state.unlockedLevel) {
      return stageNumber <= this.state.unlockedStage;
    }
    return false;
  }

  public getStageProgress(level: number, stageNumber: number): StageProgress {
    const key = `lvl_${level}_stg_${stageNumber}`;
    return this.state.stages[key] || { stars: 0, bestScore: 0, completed: false, bestTimeSeconds: 0 };
  }

  public getLevelStats(level: number) {
    let completedCount = 0;
    let starsCount = 0;
    let threeStarsCount = 0;
    let twoStarsCount = 0;
    let oneStarCount = 0;

    for (let s = 1; s <= 100; s++) {
      const key = `lvl_${level}_stg_${s}`;
      const stg = this.state.stages[key];
      if (stg && stg.completed) {
        completedCount++;
        starsCount += stg.stars;
        if (stg.stars === 3) threeStarsCount++;
        else if (stg.stars === 2) twoStarsCount++;
        else if (stg.stars === 1) oneStarCount++;
      }
    }

    return {
      level,
      completedCount,
      totalStages: 100,
      percent: Math.round((completedCount / 100) * 100),
      starsCount,
      maxStars: 300,
      threeStarsCount,
      twoStarsCount,
      oneStarCount,
      isCompleted: completedCount >= 100,
    };
  }

  public getGlobalStats() {
    return {
      totalCompleted: this.state.totalCompleted,
      totalStages: 1000,
      percent: ((this.state.totalCompleted / 1000) * 100).toFixed(1),
      totalStars: this.state.totalStars,
      maxStars: 3000,
      unlockedLevel: this.state.unlockedLevel,
      unlockedStage: this.state.unlockedStage,
      totalScore: this.state.totalScore,
      milestones: MILESTONES.map((m) => ({
        ...m,
        unlocked: this.state.totalCompleted >= m.stageThreshold,
      })),
    };
  }

  public recordStageVictory(
    level: number,
    stageNumber: number,
    timeElapsedSeconds: number,
    hintsUsedCount: number,
    earnedScore: number
  ): { starsAwarded: number; newMilestoneUnlocked: MilestoneReward | null; nextStage: { level: number; stage: number } } {
    // 0 to 3 Stars calculation rules:
    // ⭐⭐⭐ (3 stars): Answered fast (< 15s) and ZERO hints used
    // ⭐⭐ (2 stars): Answered in < 30s OR max 1 hint used
    // ⭐ (1 star): Completed with > 1 hint or > 30s
    let stars = 1;
    if (hintsUsedCount === 0 && timeElapsedSeconds <= 15) {
      stars = 3;
    } else if (hintsUsedCount <= 1 && timeElapsedSeconds <= 30) {
      stars = 2;
    }

    const key = `lvl_${level}_stg_${stageNumber}`;
    const previous = this.state.stages[key];
    const isFirstTime = !previous || !previous.completed;

    const bestStars = Math.max(previous?.stars || 0, stars);
    const bestScore = Math.max(previous?.bestScore || 0, earnedScore);

    this.state.stages[key] = {
      stars: bestStars,
      bestScore,
      completed: true,
      bestTimeSeconds: previous?.bestTimeSeconds
        ? Math.min(previous.bestTimeSeconds, timeElapsedSeconds)
        : timeElapsedSeconds,
    };

    // Recalculate totals
    this.recalculateTotals();

    // Advance unlocked stage and level
    if (level === this.state.unlockedLevel && stageNumber === this.state.unlockedStage) {
      if (stageNumber < 100) {
        this.state.unlockedStage = stageNumber + 1;
      } else if (stageNumber === 100 && level < 10) {
        this.state.unlockedLevel = level + 1;
        this.state.unlockedStage = 1;
      }
    }

    // Check newly unlocked milestones
    let newMilestone: MilestoneReward | null = null;
    for (const m of MILESTONES) {
      if (this.state.totalCompleted >= m.stageThreshold && !this.state.unlockedRewards.includes(m.id)) {
        this.state.unlockedRewards.push(m.id);
        newMilestone = m;
      }
    }

    this.saveState();

    // Calculate next stage coordinates
    let nextLevel = level;
    let nextStage = stageNumber + 1;
    if (nextStage > 100) {
      if (nextLevel < 10) {
        nextLevel++;
        nextStage = 1;
      } else {
        nextStage = 100;
      }
    }

    return {
      starsAwarded: stars,
      newMilestoneUnlocked: newMilestone,
      nextStage: { level: nextLevel, stage: nextStage },
    };
  }

  private recalculateTotals(): void {
    let completed = 0;
    let stars = 0;
    let score = 0;

    for (const key in this.state.stages) {
      const stg = this.state.stages[key];
      if (stg.completed) {
        completed++;
        stars += stg.stars;
        score += stg.bestScore;
      }
    }

    this.state.totalCompleted = completed;
    this.state.totalStars = stars;
    this.state.totalScore = score;
  }

  public resetProgress(): void {
    this.state = this.getDefaultState();
    this.saveState();
  }
}

export const fourPicsProgress = new FourPicsProgressService();
