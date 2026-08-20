// Environmental Themes & Visual Atmosphere System for Board & Arcade Games

export type GameThemeId = 'volcano' | 'ice' | 'galaxy' | 'jungle_congo' | 'desert' | 'classic_royal';

export interface GameTheme {
  id: GameThemeId;
  name: string;
  emoji: string;
  subtitle: string;
  bgGradient: string;
  boardBevelColor: string;
  boardSurfaceColor: string;
  gridLineColor: string;
  ambientParticle: 'fire' | 'ice' | 'star';
  glowColor: string;
  pawnSkins: Record<string, { fill: string; accent: string; glow: string; name: string }>;
}

export const GAME_THEMES: Record<GameThemeId, GameTheme> = {
  volcano: {
    id: 'volcano',
    name: 'Volcan Magma',
    emoji: '🌋',
    subtitle: 'Roches en fusion & braises ardentes',
    bgGradient: 'from-[#2B0808] via-[#150404] to-[#080202]',
    boardBevelColor: '#4A1208',
    boardSurfaceColor: '#1F0B0B',
    gridLineColor: '#6B1F1F',
    ambientParticle: 'fire',
    glowColor: 'rgba(255, 69, 0, 0.4)',
    pawnSkins: {
      red: { fill: 'url(#volcano-red)', accent: '#FF3B30', glow: 'shadow-[0_0_25px_rgba(255,59,48,0.8)]', name: 'Flamme' },
      green: { fill: 'url(#volcano-green)', accent: '#30D158', glow: 'shadow-[0_0_25px_rgba(48,209,88,0.8)]', name: 'Toxique' },
      yellow: { fill: 'url(#volcano-yellow)', accent: '#FFD60A', glow: 'shadow-[0_0_25px_rgba(255,214,10,0.8)]', name: 'Plasma' },
      blue: { fill: 'url(#volcano-blue)', accent: '#64D2FF', glow: 'shadow-[0_0_25px_rgba(100,210,255,0.8)]', name: 'Cyanure' },
    },
  },
  ice: {
    id: 'ice',
    name: 'Monde Glacé',
    emoji: '❄️',
    subtitle: 'Crystaux polaires & neige céleste',
    bgGradient: 'from-[#0A1A2F] via-[#050D1A] to-[#02060C]',
    boardBevelColor: '#16335C',
    boardSurfaceColor: '#0E223D',
    gridLineColor: '#2B578E',
    ambientParticle: 'ice',
    glowColor: 'rgba(0, 191, 255, 0.35)',
    pawnSkins: {
      red: { fill: 'url(#ice-red)', accent: '#FF453A', glow: 'shadow-[0_0_25px_rgba(255,69,58,0.8)]', name: 'Rubis Glacé' },
      green: { fill: 'url(#ice-green)', accent: '#32D74B', glow: 'shadow-[0_0_25px_rgba(50,215,75,0.8)]', name: 'Aurore' },
      yellow: { fill: 'url(#ice-yellow)', accent: '#FFD60A', glow: 'shadow-[0_0_25px_rgba(255,214,10,0.8)]', name: 'Soleil de Minuit' },
      blue: { fill: 'url(#ice-blue)', accent: '#0A84FF', glow: 'shadow-[0_0_25px_rgba(10,132,255,0.8)]', name: 'Glacier Pur' },
    },
  },
  galaxy: {
    id: 'galaxy',
    name: 'Galaxie Royale',
    emoji: '🌌',
    subtitle: 'Nébuleuses cosmiques & poussière d’étoiles',
    bgGradient: 'from-[#1E0E3E] via-[#0D061C] to-[#05020A]',
    boardBevelColor: '#3B1A75',
    boardSurfaceColor: '#190B33',
    gridLineColor: '#5B2B9D',
    ambientParticle: 'star',
    glowColor: 'rgba(186, 85, 211, 0.4)',
    pawnSkins: {
      red: { fill: 'url(#galaxy-red)', accent: '#FF2D55', glow: 'shadow-[0_0_25px_rgba(255,45,85,0.8)]', name: 'Supernova' },
      green: { fill: 'url(#galaxy-green)', accent: '#30D158', glow: 'shadow-[0_0_25px_rgba(48,209,88,0.8)]', name: 'Alien' },
      yellow: { fill: 'url(#galaxy-yellow)', accent: '#FFD60A', glow: 'shadow-[0_0_25px_rgba(255,214,10,0.8)]', name: 'Comète' },
      blue: { fill: 'url(#galaxy-blue)', accent: '#5E5CE6', glow: 'shadow-[0_0_25px_rgba(94,92,230,0.8)]', name: 'Cosmos' },
    },
  },
  jungle_congo: {
    id: 'jungle_congo',
    name: 'Jungle RDC Congo',
    emoji: '🌿',
    subtitle: 'Forêt tropicale luxuriante & soleil d’or',
    bgGradient: 'from-[#0D2818] via-[#05140B] to-[#020804]',
    boardBevelColor: '#1C4D2E',
    boardSurfaceColor: '#0E2918',
    gridLineColor: '#2B7043',
    ambientParticle: 'fire',
    glowColor: 'rgba(46, 204, 113, 0.35)',
    pawnSkins: {
      red: { fill: 'url(#congo-red)', accent: '#EA2B2B', glow: 'shadow-[0_0_25px_rgba(234,43,43,0.8)]', name: 'Flamboyant' },
      green: { fill: 'url(#congo-green)', accent: '#00A859', glow: 'shadow-[0_0_25px_rgba(0,168,89,0.8)]', name: 'Émeraude' },
      yellow: { fill: 'url(#congo-yellow)', accent: '#FFD100', glow: 'shadow-[0_0_25px_rgba(255,209,0,0.8)]', name: 'Or du Fleuve' },
      blue: { fill: 'url(#congo-blue)', accent: '#00AEEF', glow: 'shadow-[0_0_25px_rgba(0,174,239,0.8)]', name: 'Fleuve Congo' },
    },
  },
  desert: {
    id: 'desert',
    name: 'Désert Solaire',
    emoji: '🏜️',
    subtitle: 'Dunes dorées & soleil zénithal',
    bgGradient: 'from-[#331C08] via-[#1A0D03] to-[#0A0501]',
    boardBevelColor: '#613610',
    boardSurfaceColor: '#2B1707',
    gridLineColor: '#8C5019',
    ambientParticle: 'fire',
    glowColor: 'rgba(255, 170, 0, 0.4)',
    pawnSkins: {
      red: { fill: 'url(#desert-red)', accent: '#FF5722', glow: 'shadow-[0_0_25px_rgba(255,87,34,0.8)]', name: 'Scorpion' },
      green: { fill: 'url(#desert-green)', accent: '#8BC34A', glow: 'shadow-[0_0_25px_rgba(139,195,74,0.8)]', name: 'Oasis' },
      yellow: { fill: 'url(#desert-yellow)', accent: '#FFC107', glow: 'shadow-[0_0_25px_rgba(255,193,7,0.8)]', name: 'Dune d’Or' },
      blue: { fill: 'url(#desert-blue)', accent: '#00BCD4', glow: 'shadow-[0_0_25px_rgba(0,188,212,0.8)]', name: 'Mirage' },
    },
  },
  classic_royal: {
    id: 'classic_royal',
    name: 'Classique Royal',
    emoji: '👑',
    subtitle: 'Acajou verni & dorures prestigieuses',
    bgGradient: 'from-[#141824] via-[#090C14] to-[#040508]',
    boardBevelColor: '#2C344B',
    boardSurfaceColor: '#171B28',
    gridLineColor: '#404B6A',
    ambientParticle: 'star',
    glowColor: 'rgba(255, 215, 0, 0.35)',
    pawnSkins: {
      red: { fill: 'url(#classic-red)', accent: '#EA2B2B', glow: 'shadow-[0_0_25px_rgba(234,43,43,0.8)]', name: 'Feu Royal' },
      green: { fill: 'url(#classic-green)', accent: '#00A859', glow: 'shadow-[0_0_25px_rgba(0,168,89,0.8)]', name: 'Nature Royale' },
      yellow: { fill: 'url(#classic-yellow)', accent: '#FFD100', glow: 'shadow-[0_0_25px_rgba(255,209,0,0.8)]', name: 'Lumière Royale' },
      blue: { fill: 'url(#classic-blue)', accent: '#00AEEF', glow: 'shadow-[0_0_25px_rgba(0,174,239,0.8)]', name: 'Eau Royale' },
    },
  },
};
