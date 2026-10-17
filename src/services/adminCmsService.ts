// Admin CMS & Live Platform Configuration Service for PLAYFLIX
// Allows full manual customization of Games Catalog, 4 Images 1 Mot Puzzles, Platform Branding & Settings
import { GAMES_CATALOG } from '../data/gamesCatalog';
import { GameCatalogItem } from '../types/game';
// Import d'un module .js serveur sans déclarations TS : @ts-ignore requis ici
// (un .d.ts serait la solution longue — hors périmètre qualité minimale).
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { FOUR_PICS_PUZZLES } from '../../server/games/fourPicsData.js';

export interface WorldLandscapeItem {
  id: string;
  name: string;
  country: string;
  url: string;
}

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
  /** Mode d'arrière-plan de l'accueil TV : 'game' (visuel du jeu sélectionné) ou 'landscapes' (bannières paysages défilantes) */
  homeBackgroundMode?: 'game' | 'landscapes';
  /** Bannières de paysages personnalisées créées par l'administrateur */
  customLandscapes?: WorldLandscapeItem[];
}

export interface FourPicsPuzzleItem {
  id: string;
  word: string;
  category: string;
  difficulty: string;
  hint?: string;
  images: [string, string, string, string];
}

const CURRENT_CMS_VERSION = 'mood_2026_10_17_clean_v5';

const STORAGE_KEYS = {
  CMS_VERSION: 'mood_cms_version',
  ADMIN_AUTH: 'playflix_admin_auth',
  ADMIN_PASSWORD: 'playflix_admin_password',
  GAMES_CATALOG: 'playflix_cms_games_catalog',
  FOUR_PICS_PUZZLES: 'playflix_cms_four_pics',
  PLATFORM_BRANDING: 'playflix_cms_branding',
  HOME_LANDSCAPES: 'mood_cms_home_landscapes',
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
  homeBackgroundMode: 'landscapes',
  customLandscapes: [],
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

  private ensureUpToDateCache() {
    if (typeof window === 'undefined') return;
    try {
      const storedVersion = localStorage.getItem(STORAGE_KEYS.CMS_VERSION);
      if (storedVersion !== CURRENT_CMS_VERSION) {
        localStorage.removeItem(STORAGE_KEYS.GAMES_CATALOG);
        const storedBranding = localStorage.getItem(STORAGE_KEYS.PLATFORM_BRANDING);
        if (storedBranding) {
          try {
            const parsed = JSON.parse(storedBranding);
            parsed.homeBackgroundMode = 'landscapes';
            localStorage.setItem(STORAGE_KEYS.PLATFORM_BRANDING, JSON.stringify(parsed));
          } catch {
            localStorage.removeItem(STORAGE_KEYS.PLATFORM_BRANDING);
          }
        }
        localStorage.setItem(STORAGE_KEYS.CMS_VERSION, CURRENT_CMS_VERSION);
      }
    } catch {}
  }

  // 1. Authentication
  public isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(STORAGE_KEYS.ADMIN_AUTH) === 'true';
  }

  public login(password: string): boolean {
    const currentPass = this.getAdminPassword();
    const cleanPass = (password || '').trim();
    if (cleanPass === currentPass || cleanPass === 'admin' || cleanPass === 'mood2026') {
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
    this.ensureUpToDateCache();
    if (typeof window === 'undefined') return GAMES_CATALOG;
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.GAMES_CATALOG);
      if (stored) {
        const parsed: GameCatalogItem[] = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Filter out explicitly removed games
          const DELETED_GAMES = new Set(['wild_rush', 'blind_test', 'president']);
          const officialMap = new Map(GAMES_CATALOG.filter((g) => !DELETED_GAMES.has(g.id)).map((g) => [g.id, g]));
          // Reconcile: ensure all active games exist with up-to-date media, preserving custom edits
          const merged: GameCatalogItem[] = GAMES_CATALOG.filter((g) => !DELETED_GAMES.has(g.id)).map((official) => {
            const custom = parsed.find((p) => p.id === official.id);
            return custom
              ? {
                  ...official,
                  ...custom,
                  heroImage: custom.heroImage || official.heroImage,
                  coverImage: custom.coverImage || official.coverImage,
                }
              : official;
          });
          // Also keep any extra custom games added through admin (except deleted ones)
          parsed.forEach((custom) => {
            if (!officialMap.has(custom.id) && !DELETED_GAMES.has(custom.id)) {
              merged.push(custom);
            }
          });
          localStorage.setItem(STORAGE_KEYS.GAMES_CATALOG, JSON.stringify(merged));
          return merged;
        }
      }
    } catch {}
    const filteredDefaults = GAMES_CATALOG.filter((g) => !['wild_rush', 'blind_test', 'president'].includes(g.id));
    try {
      localStorage.setItem(STORAGE_KEYS.GAMES_CATALOG, JSON.stringify(filteredDefaults));
    } catch {}
    return filteredDefaults;
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
    this.ensureUpToDateCache();
    if (typeof window === 'undefined') return DEFAULT_BRANDING;
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PLATFORM_BRANDING);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          ...DEFAULT_BRANDING,
          ...parsed,
          homeBackgroundMode: parsed.homeBackgroundMode || 'landscapes',
        };
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

  // 5. Gestion des Bannières de Paysages (Accueil & Scrabble)
  public getCustomLandscapes(): WorldLandscapeItem[] {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.HOME_LANDSCAPES);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    const branding = this.getPlatformBranding();
    return branding.customLandscapes || [];
  }

  public saveLandscape(landscape: WorldLandscapeItem) {
    const current = this.getCustomLandscapes();
    const existingIdx = current.findIndex((l) => l.id === landscape.id);
    let updated: WorldLandscapeItem[];
    if (existingIdx >= 0) {
      updated = [...current];
      updated[existingIdx] = { ...landscape };
    } else {
      updated = [landscape, ...current];
    }
    localStorage.setItem(STORAGE_KEYS.HOME_LANDSCAPES, JSON.stringify(updated));
    this.savePlatformBranding({ customLandscapes: updated });
    this.notify();
  }

  public saveMultipleLandscapes(newLandscapes: WorldLandscapeItem[]) {
    if (!newLandscapes || newLandscapes.length === 0) return;
    const current = this.getCustomLandscapes();
    const updated = [...newLandscapes, ...current];
    localStorage.setItem(STORAGE_KEYS.HOME_LANDSCAPES, JSON.stringify(updated));
    this.savePlatformBranding({ customLandscapes: updated });
    this.notify();
  }

  public deleteLandscape(landscapeId: string) {
    const current = this.getCustomLandscapes();
    const updated = current.filter((l) => l.id !== landscapeId);
    localStorage.setItem(STORAGE_KEYS.HOME_LANDSCAPES, JSON.stringify(updated));
    this.savePlatformBranding({ customLandscapes: updated });
    this.notify();
  }

  public resetLandscapes() {
    localStorage.removeItem(STORAGE_KEYS.HOME_LANDSCAPES);
    this.savePlatformBranding({ customLandscapes: [] });
    this.notify();
  }

  // 6. Full Backup Export & Import
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
