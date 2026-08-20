// Admin CMS & Live Platform Configuration Service for PLAYFLIX
// Allows full manual customization of Games Catalog, 4 Images 1 Mot Puzzles, Platform Branding & Settings
import { GAMES_CATALOG } from '../data/gamesCatalog';
import { GameCatalogItem } from '../types/game';
// @ts-ignore
import { FOUR_PICS_PUZZLES } from '../../server/games/fourPicsData.js';

export interface PlatformBranding {
  platformName: string;
  platformSubtitle: string;
  announcementTicker: string;
  enableAnnouncement: boolean;
  themeColorPrimary: string;
  themeColorSecondary: string;
  customLogoUrl: string;
  defaultTurnDuration: number;
  defaultMaxPlayers: number;
}

export interface FourPicsPuzzleItem {
  id: string;
  word: string;
  category: string;
  difficulty: string;
  hint?: string;
  images: [string, string, string, string];
}

const STORAGE_KEYS = {
  ADMIN_AUTH: 'playflix_admin_auth',
  ADMIN_PASSWORD: 'playflix_admin_password',
  GAMES_CATALOG: 'playflix_cms_games_catalog',
  FOUR_PICS_PUZZLES: 'playflix_cms_four_pics',
  PLATFORM_BRANDING: 'playflix_cms_branding',
};

const DEFAULT_ADMIN_PASSWORD = 'admin';

const DEFAULT_BRANDING: PlatformBranding = {
  platformName: 'PLAYFLIX',
  platformSubtitle: 'SMART TV CONSOLE',
  announcementTicker: '🎉 Bienvenue sur PLAYFLIX ! Nouveaux jeux 2.5D et mode course arcade disponibles !',
  enableAnnouncement: true,
  themeColorPrimary: '#EF4444',
  themeColorSecondary: '#F59E0B',
  customLogoUrl: '',
  defaultTurnDuration: 30,
  defaultMaxPlayers: 6,
};

class AdminCmsService {
  private listeners: (() => void)[] = [];

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((fn) => {
      try {
        fn();
      } catch {}
    });
  }

  // 1. Authentication
  public isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(STORAGE_KEYS.ADMIN_AUTH) === 'true';
  }

  public login(password: string): boolean {
    const currentPass = this.getAdminPassword();
    if (password === currentPass) {
      localStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, 'true');
      this.notify();
      return true;
    }
    return false;
  }

  public logout() {
    localStorage.removeItem(STORAGE_KEYS.ADMIN_AUTH);
    this.notify();
  }

  public getAdminPassword(): string {
    if (typeof window === 'undefined') return DEFAULT_ADMIN_PASSWORD;
    return localStorage.getItem(STORAGE_KEYS.ADMIN_PASSWORD) || DEFAULT_ADMIN_PASSWORD;
  }

  public setAdminPassword(newPassword: string) {
    if (!newPassword || newPassword.trim().length < 3) return false;
    localStorage.setItem(STORAGE_KEYS.ADMIN_PASSWORD, newPassword.trim());
    this.notify();
    return true;
  }

  // 2. Games Catalog Management
  public getGamesCatalog(): GameCatalogItem[] {
    if (typeof window === 'undefined') return GAMES_CATALOG;
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.GAMES_CATALOG);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {}
    return GAMES_CATALOG;
  }

  public saveGame(game: GameCatalogItem) {
    const catalog = this.getGamesCatalog();
    const existingIndex = catalog.findIndex((g) => g.id === game.id);
    let updated: GameCatalogItem[];

    if (existingIndex >= 0) {
      updated = [...catalog];
      updated[existingIndex] = { ...game };
    } else {
      updated = [game, ...catalog];
    }

    localStorage.setItem(STORAGE_KEYS.GAMES_CATALOG, JSON.stringify(updated));
    this.notify();
  }

  public deleteGame(gameId: string) {
    const catalog = this.getGamesCatalog();
    const updated = catalog.filter((g) => g.id !== gameId);
    localStorage.setItem(STORAGE_KEYS.GAMES_CATALOG, JSON.stringify(updated));
    this.notify();
  }

  public resetGamesCatalog() {
    localStorage.removeItem(STORAGE_KEYS.GAMES_CATALOG);
    this.notify();
  }

  // 3. 4 Images 1 Mot Puzzles Management
  public getFourPicsPuzzles(): FourPicsPuzzleItem[] {
    if (typeof window === 'undefined') return FOUR_PICS_PUZZLES as FourPicsPuzzleItem[];
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.FOUR_PICS_PUZZLES);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {}
    return FOUR_PICS_PUZZLES as FourPicsPuzzleItem[];
  }

  public saveFourPicsPuzzle(puzzle: FourPicsPuzzleItem) {
    const puzzles = this.getFourPicsPuzzles();
    const existingIdx = puzzles.findIndex((p) => p.id === puzzle.id);
    let updated: FourPicsPuzzleItem[];

    if (existingIdx >= 0) {
      updated = [...puzzles];
      updated[existingIdx] = { ...puzzle };
    } else {
      updated = [puzzle, ...puzzles];
    }

    localStorage.setItem(STORAGE_KEYS.FOUR_PICS_PUZZLES, JSON.stringify(updated));
    this.notify();
  }

  public deleteFourPicsPuzzle(puzzleId: string) {
    const puzzles = this.getFourPicsPuzzles();
    const updated = puzzles.filter((p) => p.id !== puzzleId);
    localStorage.setItem(STORAGE_KEYS.FOUR_PICS_PUZZLES, JSON.stringify(updated));
    this.notify();
  }

  public resetFourPicsPuzzles() {
    localStorage.removeItem(STORAGE_KEYS.FOUR_PICS_PUZZLES);
    this.notify();
  }

  // 4. Platform Branding & Settings
  public getPlatformBranding(): PlatformBranding {
    if (typeof window === 'undefined') return DEFAULT_BRANDING;
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PLATFORM_BRANDING);
      if (stored) {
        return { ...DEFAULT_BRANDING, ...JSON.parse(stored) };
      }
    } catch {}
    return DEFAULT_BRANDING;
  }

  public savePlatformBranding(branding: Partial<PlatformBranding>) {
    const current = this.getPlatformBranding();
    const updated = { ...current, ...branding };
    localStorage.setItem(STORAGE_KEYS.PLATFORM_BRANDING, JSON.stringify(updated));
    this.notify();
  }

  public resetPlatformBranding() {
    localStorage.removeItem(STORAGE_KEYS.PLATFORM_BRANDING);
    this.notify();
  }

  // 5. Full Backup Export & Import
  public exportFullBackup(): string {
    const data = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      branding: this.getPlatformBranding(),
      gamesCatalog: this.getGamesCatalog(),
      fourPicsPuzzles: this.getFourPicsPuzzles(),
    };
    return JSON.stringify(data, null, 2);
  }

  public importFullBackup(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (data.branding) localStorage.setItem(STORAGE_KEYS.PLATFORM_BRANDING, JSON.stringify(data.branding));
      if (data.gamesCatalog) localStorage.setItem(STORAGE_KEYS.GAMES_CATALOG, JSON.stringify(data.gamesCatalog));
      if (data.fourPicsPuzzles) localStorage.setItem(STORAGE_KEYS.FOUR_PICS_PUZZLES, JSON.stringify(data.fourPicsPuzzles));
      this.notify();
      return true;
    } catch {
      return false;
    }
  }
}

export const adminCms = new AdminCmsService();
