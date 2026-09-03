import { describe, it, expect } from 'vitest';
import {
  AVAILABLE_THEMES,
  THEME_MAP,
  getTheme,
  kawaiiTheme,
  japaneseTheme,
  isometricTheme,
  futuristicTheme,
  luxuryTheme,
} from '../../src/styles/themes/index';

describe('PLAYFLIX Theme System', () => {
  it('contient exactement les 5 thèmes requis avec des identités complètes', () => {
    expect(AVAILABLE_THEMES).toHaveLength(5);
    const themeIds = AVAILABLE_THEMES.map((t) => t.id);
    expect(themeIds).toEqual(['kawaii', 'japanese', 'isometric', 'futuristic', 'luxury']);
  });

  it('chaque thème possède une définition Dark et Light complète', () => {
    for (const t of AVAILABLE_THEMES) {
      expect(t.name).toBeDefined();
      expect(t.emoji).toBeDefined();
      expect(t.tagline).toBeDefined();
      expect(t.preview).toBeDefined();
      expect(t.preview.primaryColor).toMatch(/^#[0-9a-fA-F]{6}$/);

      // Dark mode tokens
      expect(t.dark.colors.bg).toBeDefined();
      expect(t.dark.colors.primary).toBeDefined();
      expect(t.dark.shapes.cardRadius).toBeDefined();
      expect(t.dark.shadows.card).toBeDefined();
      expect(t.dark.typography.fontDisplay).toBeDefined();

      // Light mode tokens
      expect(t.light.colors.bg).toBeDefined();
      expect(t.light.colors.primary).toBeDefined();
      expect(t.light.shapes.cardRadius).toBeDefined();
      expect(t.light.shadows.card).toBeDefined();
      expect(t.light.typography.fontDisplay).toBeDefined();
    }
  });

  it('Kawaii possède des formes ultra-arrondies et des ombres douces', () => {
    expect(kawaiiTheme.id).toBe('kawaii');
    expect(kawaiiTheme.emoji).toBe('🌸');
    expect(kawaiiTheme.dark.shapes.cardRadius).toBe('32px');
    expect(kawaiiTheme.dark.motion.bounce).toBe(true);
  });

  it('Japanese possède des lignes fines 1px et un style calme', () => {
    expect(japaneseTheme.id).toBe('japanese');
    expect(japaneseTheme.emoji).toBe('🎌');
    expect(japaneseTheme.dark.shapes.borderWidth).toBe('1px');
    expect(japaneseTheme.dark.motion.bounce).toBe(false);
  });

  it('Isometric possède des ombres directionnelles 3D et des blocs en relief', () => {
    expect(isometricTheme.id).toBe('isometric');
    expect(isometricTheme.emoji).toBe('🔷');
    expect(isometricTheme.dark.shadows.card).toContain('0 8px 0');
  });

  it('Futuristic possède des bordures néon et une ambiance cyber', () => {
    expect(futuristicTheme.id).toBe('futuristic');
    expect(futuristicTheme.emoji).toBe('🚀');
    expect(futuristicTheme.dark.colors.primary).toBe('#00F2FE');
  });

  it('Luxury possède des finitions or champagne et des bordures nobles', () => {
    expect(luxuryTheme.id).toBe('luxury');
    expect(luxuryTheme.emoji).toBe('💎');
    expect(luxuryTheme.dark.colors.primary).toBe('#D4AF37');
    expect(luxuryTheme.dark.typography.fontDisplay).toContain('Playfair Display');
  });

  it('getTheme retourne le thème demandé ou futuristic par défaut', () => {
    expect(getTheme('kawaii').id).toBe('kawaii');
    expect(getTheme('japanese').id).toBe('japanese');
    expect(getTheme('isometric').id).toBe('isometric');
    expect(getTheme('futuristic').id).toBe('futuristic');
    expect(getTheme('luxury').id).toBe('luxury');
    // @ts-expect-error test fallback
    expect(getTheme('unknown_theme').id).toBe('futuristic');
  });
});
