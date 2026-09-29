import { describe, it, expect, beforeEach } from 'vitest';

// Test mock for localStorage when testing in NodeJS environment
class MockLocalStorage {
  constructor() {
    this.store = {};
  }
  getItem(key) {
    return this.store[key] || null;
  }
  setItem(key, value) {
    this.store[key] = String(value);
  }
  removeItem(key) {
    delete this.store[key];
  }
  clear() {
    this.store = {};
  }
}

global.localStorage = new MockLocalStorage();
global.window = {};

describe('Admin CMS & Search Bar Secret Access', () => {
  let adminCms;

  beforeEach(async () => {
    global.localStorage.clear();
    const mod = await import('../../src/services/adminCmsService.ts');
    adminCms = mod.adminCms;
    adminCms.logout();
  });

  it('authenticates with default password "admin"', () => {
    expect(adminCms.isAuthenticated()).toBe(false);
    const success = adminCms.login('admin');
    expect(success).toBe(true);
    expect(adminCms.isAuthenticated()).toBe(true);
  });

  it('authenticates with fallback master password "mood2026"', () => {
    expect(adminCms.isAuthenticated()).toBe(false);
    const success = adminCms.login('mood2026');
    expect(success).toBe(true);
    expect(adminCms.isAuthenticated()).toBe(true);
  });

  it('rejects invalid password', () => {
    expect(adminCms.isAuthenticated()).toBe(false);
    const success = adminCms.login('wrong_password_123');
    expect(success).toBe(false);
    expect(adminCms.isAuthenticated()).toBe(false);
  });

  it('allows changing admin password and authenticating with new password', () => {
    const changed = adminCms.setAdminPassword('secret2027');
    expect(changed).toBe(true);
    expect(adminCms.getAdminPassword()).toBe('secret2027');

    expect(adminCms.login('secret2027')).toBe(true);
    expect(adminCms.isAuthenticated()).toBe(true);
  });

  it('allows manual game editing and updates catalog in real-time', () => {
    const catalog = adminCms.getGamesCatalog();
    expect(catalog.length).toBeGreaterThan(0);

    const firstGame = catalog[0];
    const updatedGame = {
      ...firstGame,
      title: 'MODIFIED GAME TITLE',
      coverImage: '/games/custom_cover.jpg',
      heroImage: '/games/custom_hero.jpg',
    };

    adminCms.saveGame(updatedGame);

    const freshCatalog = adminCms.getGamesCatalog();
    const found = freshCatalog.find((g) => g.id === firstGame.id);
    expect(found.title).toBe('MODIFIED GAME TITLE');
    expect(found.coverImage).toBe('/games/custom_cover.jpg');
    expect(found.heroImage).toBe('/games/custom_hero.jpg');
  });

  it('supports resetting catalog back to default', () => {
    const catalog = adminCms.getGamesCatalog();
    const firstGame = catalog[0];
    adminCms.saveGame({ ...firstGame, title: 'TEMP' });

    adminCms.resetGamesCatalog();
    const defaultCatalog = adminCms.getGamesCatalog();
    expect(defaultCatalog[0].title).not.toBe('TEMP');
  });
});
