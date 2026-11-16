import { ArenaPlayerStats, TournamentBracketMatch } from '../types/arena';

const STORAGE_KEY = 'mood_arena_profile';

export const ARENA_TITLES = [
  { minXp: 0, title: 'Initié de l’Arène', badge: 'Novice' },
  { minXp: 300, title: 'Calculateur d’Élite', badge: 'Bronze' },
  { minXp: 800, title: 'Stratège des Ombres', badge: 'Argent' },
  { minXp: 1800, title: 'Maître du Bluff', badge: 'Or' },
  { minXp: 3500, title: 'Grand Maître Émérite', badge: 'Platine' },
  { minXp: 6000, title: 'Le Génie Démoniaque', badge: 'Diadème' },
];

export const MOCK_LEADERBOARD = [
  { rank: 1, name: 'Guillaume (Dr. Logic)', avatar: '👑', title: 'Le Génie Démoniaque', pieces: 1450, winRate: '88%' },
  { rank: 2, name: 'Si-won (Mastermind)', avatar: '🦊', title: 'Grand Maître Émérite', pieces: 1280, winRate: '82%' },
  { rank: 3, name: 'Dong-joo (Lawyer)', avatar: '⚖️', title: 'Maître du Bluff', pieces: 1120, winRate: '79%' },
  { rank: 4, name: 'Seok-jin (Actor)', avatar: '🎭', title: 'Stratège des Ombres', pieces: 950, winRate: '74%' },
  { rank: 5, name: 'Orbit (Science)', avatar: '🔬', title: 'Calculateur d’Élite', pieces: 890, winRate: '71%' },
  { rank: 6, name: 'Kyeong-rim (Comedian)', avatar: '🎪', title: 'Initié de l’Arène', pieces: 740, winRate: '65%' },
];

class ArenaLeagueService {
  private profile: ArenaPlayerStats;

  constructor() {
    this.profile = this.loadProfile();
  }

  private loadProfile(): ArenaPlayerStats {
    if (typeof window === 'undefined') {
      return this.getDefaultProfile();
    }
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {}
    return this.getDefaultProfile();
  }

  private getDefaultProfile(): ArenaPlayerStats {
    return {
      totalMatches: 0,
      victories: 0,
      losses: 0,
      devilsPieces: 100, // Dotation initiale de 100 Pièces du Démon
      xp: 0,
      level: 1,
      title: 'Initié de l’Arène',
      categoryStats: {
        memory: { played: 0, won: 0 },
        logic: { played: 0, won: 0 },
        strategy: { played: 0, won: 0 },
        bluff: { played: 0, won: 0 },
        cards: { played: 0, won: 0 },
      },
      badges: ['Bienvenue dans l’Arène'],
    };
  }

  public getProfile(): ArenaPlayerStats {
    return { ...this.profile };
  }

  public saveProfile() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.profile));
      } catch {}
    }
  }

  public recordMatchResult(category: keyof ArenaPlayerStats['categoryStats'], won: boolean, piecesEarned: number) {
    this.profile.totalMatches++;
    if (won) {
      this.profile.victories++;
      this.profile.xp += 120;
      this.profile.devilsPieces += Math.max(10, piecesEarned);
      if (this.profile.categoryStats[category]) {
        this.profile.categoryStats[category].won++;
      }
    } else {
      this.profile.losses++;
      this.profile.xp += 30;
      this.profile.devilsPieces = Math.max(0, this.profile.devilsPieces - Math.abs(piecesEarned));
    }

    if (this.profile.categoryStats[category]) {
      this.profile.categoryStats[category].played++;
    }

    // Calcul du titre et niveau
    this.profile.level = Math.floor(this.profile.xp / 200) + 1;
    const currentTitle = [...ARENA_TITLES].reverse().find(t => this.profile.xp >= t.minXp);
    if (currentTitle) {
      this.profile.title = currentTitle.title;
      if (!this.profile.badges.includes(currentTitle.badge)) {
        this.profile.badges.push(currentTitle.badge);
      }
    }

    this.saveProfile();
  }

  public generateTournamentBracket(playerNames: string[] = []): TournamentBracketMatch[] {
    const defaultBots = ['🤖 Orbit (IA)', '🤖 Si-won (IA)', '🤖 Dong-joo (IA)', '🤖 Seok-jin (IA)'];
    const p1 = playerNames[0] || 'Vous';
    const p2 = playerNames[1] || defaultBots[0];
    const p3 = playerNames[2] || defaultBots[1];
    const p4 = playerNames[3] || defaultBots[2];

    return [
      {
        id: 'semi_1',
        round: 'semi',
        player1: { id: 'p1', name: p1, avatar: '👑' },
        player2: { id: 'p2', name: p2, avatar: '🔬' },
        winnerId: undefined,
        status: 'in_progress',
      },
      {
        id: 'semi_2',
        round: 'semi',
        player1: { id: 'p3', name: p3, avatar: '🦊' },
        player2: { id: 'p4', name: p4, avatar: '⚖️' },
        winnerId: undefined,
        status: 'pending',
      },
      {
        id: 'grand_final',
        round: 'final',
        player1: null,
        player2: null,
        winnerId: undefined,
        status: 'pending',
      },
    ];
  }
}

export const arenaLeagueService = new ArenaLeagueService();
