export type MoodThemeId = 'canyon' | 'sunset' | 'emerald';

export interface MoodThemeConfig {
  id: MoodThemeId;
  name: string;
  tagline: string;
  icon: string;
  bgImage: string;
  overlayGradient: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  glowColor: string;
}

export const MOOD_THEMES: Record<MoodThemeId, MoodThemeConfig> = {
  canyon: {
    id: 'canyon',
    name: 'Canyon Nocturne',
    tagline: 'Falaises néon, ciel indigo & brume crépusculaire',
    icon: '🌌',
    bgImage: '/themes/canyon.png',
    overlayGradient: 'from-[#060810]/92 via-[#060810]/75 to-[#060810]/85',
    primaryColor: '#4F46E5', // Indigo
    secondaryColor: '#FF4757', // Coral
    accentColor: '#06B6D4', // Cyan
    glowColor: 'rgba(79, 70, 229, 0.55)',
  },
  sunset: {
    id: 'sunset',
    name: 'Dunes Crépuscule',
    tagline: 'Soleil couchant, teintes ambrées & silhouettes désertiques',
    icon: '🌅',
    bgImage: '/themes/sunset.png',
    overlayGradient: 'from-[#12050A]/92 via-[#180812]/75 to-[#0F0408]/85',
    primaryColor: '#F59E0B', // Amber
    secondaryColor: '#FF4757', // Coral
    accentColor: '#F43F5E', // Rose
    glowColor: 'rgba(245, 158, 11, 0.55)',
  },
  emerald: {
    id: 'emerald',
    name: 'Canopée Émeraude',
    tagline: 'Jungle tropicale, feuillages profonds & brume fraîche',
    icon: '🌿',
    bgImage: '/themes/emerald.png',
    overlayGradient: 'from-[#021A15]/92 via-[#04201A]/75 to-[#021511]/85',
    primaryColor: '#10B981', // Emerald
    secondaryColor: '#34D399', // Mint
    accentColor: '#06B6D4', // Cyan
    glowColor: 'rgba(16, 185, 129, 0.55)',
  },
};
