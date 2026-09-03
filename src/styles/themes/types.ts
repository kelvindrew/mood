// PLAYFLIX Visual Theme System — Core Token Types
export type ThemeId = 'kawaii' | 'japanese' | 'isometric' | 'futuristic' | 'luxury';
export type ThemeMode = 'dark' | 'light';

export interface ThemeColorTokens {
  bg: string;
  bgGradient?: string;
  surface: string;
  surfaceCard: string;
  surfaceHover: string;
  surfaceGlass: string;
  primary: string;
  primaryHover: string;
  primaryText: string;
  secondary: string;
  accent: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  borderActive: string;
  badgeBg: string;
  badgeText: string;
  glow: string;
  success: string;
  warning: string;
  error: string;
}

export interface ThemeShapeTokens {
  smRadius: string;
  mdRadius: string;
  lgRadius: string;
  cardRadius: string;
  btnRadius: string;
  pillRadius: string;
  borderWidth: string;
}

export interface ThemeShadowTokens {
  card: string;
  cardHover: string;
  btn: string;
  btnActive: string;
  glow: string;
  dropdown: string;
}

export interface ThemeTypographyTokens {
  fontDisplay: string;
  fontBody: string;
  fontMono: string;
  letterSpacingHeadings: string;
  textTransformHeadings: 'none' | 'uppercase' | 'capitalize';
  fontWeightBold: string;
}

export interface ThemeMotionTokens {
  speedFast: string;
  speedNormal: string;
  speedSlow: string;
  timing: string;
  bounce: boolean;
}

export interface ThemeDecorationTokens {
  hasSubtleGrid?: boolean;
  hasScanlines?: boolean;
  hasIsometricBorder?: boolean;
  hasPaperTexture?: boolean;
  hasSoftGlow?: boolean;
  customOverlayClass?: string;
}

export interface ThemeDefinition {
  id: ThemeId;
  name: string;
  tagline: string;
  emoji: string;
  description: string;
  dark: {
    colors: ThemeColorTokens;
    shapes: ThemeShapeTokens;
    shadows: ThemeShadowTokens;
    typography: ThemeTypographyTokens;
    motion: ThemeMotionTokens;
    decorations: ThemeDecorationTokens;
  };
  light: {
    colors: ThemeColorTokens;
    shapes: ThemeShapeTokens;
    shadows: ThemeShadowTokens;
    typography: ThemeTypographyTokens;
    motion: ThemeMotionTokens;
    decorations: ThemeDecorationTokens;
  };
  preview: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    bgPreview: string;
    cardPreview: string;
    textPreview: string;
  };
}
