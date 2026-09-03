import { ThemeDefinition, ThemeId } from './types';
import { kawaiiTheme } from './kawaii';
import { japaneseTheme } from './japanese';
import { isometricTheme } from './isometric';
import { futuristicTheme } from './futuristic';
import { luxuryTheme } from './luxury';

export * from './types';
export { kawaiiTheme, japaneseTheme, isometricTheme, futuristicTheme, luxuryTheme };

export const AVAILABLE_THEMES: ThemeDefinition[] = [
  kawaiiTheme,
  japaneseTheme,
  isometricTheme,
  futuristicTheme,
  luxuryTheme,
];

export const THEME_MAP: Record<ThemeId, ThemeDefinition> = {
  kawaii: kawaiiTheme,
  japanese: japaneseTheme,
  isometric: isometricTheme,
  futuristic: futuristicTheme,
  luxury: luxuryTheme,
};

export function getTheme(id: ThemeId): ThemeDefinition {
  return THEME_MAP[id] || futuristicTheme;
}
