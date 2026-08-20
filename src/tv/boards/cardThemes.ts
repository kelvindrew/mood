// Card Party 3D Visual Themes & Styling System for PLAYFLIX
// Modern Casino Lounge × 3D Cartoon Premium × Glassmorphism × Futuristic Party Game

export type CardThemeId = 'cyber' | 'royal' | 'galaxy' | 'magma' | 'ice' | 'congo' | 'onyx' | 'nature';

export interface CardThemeConfig {
  id: CardThemeId;
  name: string;
  badge: string;
  icon: string;
  tableBg: string;
  tableBorder: string;
  tableGlow: string;
  feltPattern: string;
  cardBackBg: string;
  cardBackBorder: string;
  cardBackPattern: string;
  cardBackEmblem: string;
  ambientParticles: string;
}

export const CARD_THEMES: Record<CardThemeId, CardThemeConfig> = {
  cyber: {
    id: 'cyber',
    name: 'Cyber Neo',
    badge: 'HOLOGRAPHIC',
    icon: '🔮',
    tableBg: 'radial-gradient(ellipse at center, #0e1e38 0%, #060b14 70%, #020408 100%)',
    tableBorder: 'border-cyan-500/40',
    tableGlow: 'shadow-[0_0_80px_rgba(6,182,212,0.25)]',
    feltPattern: 'radial-gradient(circle at 50% 50%, rgba(6,182,212,0.1) 0%, transparent 60%)',
    cardBackBg: 'bg-gradient-to-br from-[#0c1c38] via-[#081224] to-[#040814]',
    cardBackBorder: 'border-cyan-400',
    cardBackPattern: 'radial-gradient(circle, rgba(6,182,212,0.4) 1px, transparent 1px)',
    cardBackEmblem: '🔮',
    ambientParticles: '#06b6d4',
  },
  royal: {
    id: 'royal',
    name: 'Royal Palace',
    badge: 'VELVET & GOLD',
    icon: '👑',
    tableBg: 'radial-gradient(ellipse at center, #1b3a2b 0%, #0d2218 70%, #050e09 100%)',
    tableBorder: 'border-amber-400/50',
    tableGlow: 'shadow-[0_0_80px_rgba(245,158,11,0.25)]',
    feltPattern: 'radial-gradient(circle at 50% 50%, rgba(245,158,11,0.12) 0%, transparent 65%)',
    cardBackBg: 'bg-gradient-to-br from-[#2a1b06] via-[#1a0f02] to-[#0d0700]',
    cardBackBorder: 'border-amber-400',
    cardBackPattern: 'radial-gradient(circle, rgba(245,158,11,0.4) 1px, transparent 1px)',
    cardBackEmblem: '👑',
    ambientParticles: '#f59e0b',
  },
  galaxy: {
    id: 'galaxy',
    name: 'Galaxy Nebula',
    badge: 'STELLAR 3D',
    icon: '🌌',
    tableBg: 'radial-gradient(ellipse at center, #241442 0%, #120924 70%, #07030e 100%)',
    tableBorder: 'border-purple-500/50',
    tableGlow: 'shadow-[0_0_80px_rgba(168,85,247,0.25)]',
    feltPattern: 'radial-gradient(circle at 50% 50%, rgba(168,85,247,0.12) 0%, transparent 60%)',
    cardBackBg: 'bg-gradient-to-br from-[#1d0b38] via-[#0e041c] to-[#06010d]',
    cardBackBorder: 'border-purple-400',
    cardBackPattern: 'radial-gradient(circle, rgba(168,85,247,0.4) 1px, transparent 1px)',
    cardBackEmblem: '🌌',
    ambientParticles: '#c084fc',
  },
  magma: {
    id: 'magma',
    name: 'Magma Flame',
    badge: 'INFERNO',
    icon: '🔥',
    tableBg: 'radial-gradient(ellipse at center, #38120e 0%, #200906 70%, #0d0302 100%)',
    tableBorder: 'border-red-500/50',
    tableGlow: 'shadow-[0_0_80px_rgba(239,68,68,0.25)]',
    feltPattern: 'radial-gradient(circle at 50% 50%, rgba(239,68,68,0.12) 0%, transparent 60%)',
    cardBackBg: 'bg-gradient-to-br from-[#380e0a] via-[#200705] to-[#0d0202]',
    cardBackBorder: 'border-red-500',
    cardBackPattern: 'radial-gradient(circle, rgba(239,68,68,0.4) 1px, transparent 1px)',
    cardBackEmblem: '🔥',
    ambientParticles: '#ef4444',
  },
  ice: {
    id: 'ice',
    name: 'Boreal Frost',
    badge: 'FROZEN CRISTAL',
    icon: '❄️',
    tableBg: 'radial-gradient(ellipse at center, #0c2b3d 0%, #061824 70%, #020a10 100%)',
    tableBorder: 'border-sky-400/50',
    tableGlow: 'shadow-[0_0_80px_rgba(56,189,248,0.25)]',
    feltPattern: 'radial-gradient(circle at 50% 50%, rgba(56,189,248,0.12) 0%, transparent 60%)',
    cardBackBg: 'bg-gradient-to-br from-[#0c2638] via-[#05141f] to-[#02080d]',
    cardBackBorder: 'border-sky-300',
    cardBackPattern: 'radial-gradient(circle, rgba(56,189,248,0.4) 1px, transparent 1px)',
    cardBackEmblem: '❄️',
    ambientParticles: '#38bdf8',
  },
  congo: {
    id: 'congo',
    name: 'Congo Majestueux',
    badge: 'RDC NOBLE',
    icon: '🇨🇩',
    tableBg: 'radial-gradient(ellipse at center, #0a2540 0%, #051424 60%, #1f1402 100%)',
    tableBorder: 'border-amber-400/60',
    tableGlow: 'shadow-[0_0_80px_rgba(245,158,11,0.3)]',
    feltPattern: 'radial-gradient(circle at 50% 50%, rgba(245,158,11,0.15) 0%, transparent 65%)',
    cardBackBg: 'bg-gradient-to-br from-[#0b2440] via-[#1c1404] to-[#061220]',
    cardBackBorder: 'border-amber-400',
    cardBackPattern: 'radial-gradient(circle, rgba(245,158,11,0.5) 1.2px, transparent 1.2px)',
    cardBackEmblem: '🇨🇩',
    ambientParticles: '#f59e0b',
  },
  onyx: {
    id: 'onyx',
    name: 'Onyx Black',
    badge: 'LUXURY MINIMAL',
    icon: '🖤',
    tableBg: 'radial-gradient(ellipse at center, #181c24 0%, #0f1218 70%, #06080c 100%)',
    tableBorder: 'border-white/20',
    tableGlow: 'shadow-[0_0_80px_rgba(255,255,255,0.08)]',
    feltPattern: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.06) 0%, transparent 60%)',
    cardBackBg: 'bg-gradient-to-br from-[#20242e] via-[#12141a] to-[#08090c]',
    cardBackBorder: 'border-white/40',
    cardBackPattern: 'radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)',
    cardBackEmblem: '♠️',
    ambientParticles: '#e2e8f0',
  },
  nature: {
    id: 'nature',
    name: 'Emerald Grove',
    badge: 'FOREST LOUNGE',
    icon: '🌿',
    tableBg: 'radial-gradient(ellipse at center, #102e1c 0%, #081a0f 70%, #030a06 100%)',
    tableBorder: 'border-emerald-400/50',
    tableGlow: 'shadow-[0_0_80px_rgba(52,211,153,0.25)]',
    feltPattern: 'radial-gradient(circle at 50% 50%, rgba(52,211,153,0.12) 0%, transparent 60%)',
    cardBackBg: 'bg-gradient-to-br from-[#122e1e] via-[#0a1c12] to-[#040c07]',
    cardBackBorder: 'border-emerald-400',
    cardBackPattern: 'radial-gradient(circle, rgba(52,211,153,0.4) 1px, transparent 1px)',
    cardBackEmblem: '🌿',
    ambientParticles: '#34d399',
  },
};
