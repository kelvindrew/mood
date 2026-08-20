import React from 'react';
import { CardColor, UnoCard } from '../../types/game';
import { CardThemeId, CARD_THEMES } from '../boards/cardThemes';
import { Ban, Repeat, Plus, Sparkles } from 'lucide-react';

interface Card3DProps {
  card?: UnoCard;
  isFacedown?: boolean;
  themeId?: CardThemeId;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isSelected?: boolean;
  isPlayable?: boolean;
  rotation?: number; // In degrees
  onClick?: () => void;
  className?: string;
}

const COLOR_CONFIGS: Record<CardColor, { bg: string; border: string; glow: string; text: string; lightAccent: string }> = {
  red: {
    bg: 'bg-gradient-to-br from-rose-500 via-red-600 to-red-800',
    border: 'border-red-400',
    glow: 'shadow-[0_8px_25px_rgba(239,68,68,0.45)]',
    text: 'text-red-600',
    lightAccent: '#fca5a5',
  },
  blue: {
    bg: 'bg-gradient-to-br from-sky-500 via-blue-600 to-blue-800',
    border: 'border-sky-400',
    glow: 'shadow-[0_8px_25px_rgba(59,130,246,0.45)]',
    text: 'text-blue-600',
    lightAccent: '#93c5fd',
  },
  green: {
    bg: 'bg-gradient-to-br from-emerald-400 via-emerald-600 to-green-800',
    border: 'border-emerald-300',
    glow: 'shadow-[0_8px_25px_rgba(16,185,129,0.45)]',
    text: 'text-emerald-600',
    lightAccent: '#86efac',
  },
  yellow: {
    bg: 'bg-gradient-to-br from-amber-300 via-amber-500 to-yellow-700',
    border: 'border-amber-200',
    glow: 'shadow-[0_8px_25px_rgba(245,158,11,0.45)]',
    text: 'text-amber-600',
    lightAccent: '#fde047',
  },
  wild: {
    bg: 'bg-gradient-to-br from-purple-600 via-pink-600 to-amber-500',
    border: 'border-white',
    glow: 'shadow-[0_8px_30px_rgba(217,70,239,0.55)]',
    text: 'text-purple-600',
    lightAccent: '#ffffff',
  },
};

export const Card3D: React.FC<Card3DProps> = ({
  card,
  isFacedown = false,
  themeId = 'congo',
  size = 'md',
  isSelected = false,
  isPlayable = false,
  rotation = 0,
  onClick,
  className = '',
}) => {
  const theme = CARD_THEMES[themeId] || CARD_THEMES.congo;

  // Size Dimensions
  const sizeClasses = {
    sm: 'w-12 h-18 text-xs rounded-xl border-2',
    md: 'w-24 h-36 text-sm rounded-2xl border-[3px]',
    lg: 'w-36 h-54 text-lg rounded-3xl border-4',
    xl: 'w-48 h-72 text-2xl rounded-3xl border-4',
  }[size];

  // If Facedown (Card Back)
  if (isFacedown || !card) {
    return (
      <div
        onClick={onClick}
        style={{
          transform: `rotate(${rotation}deg) ${isSelected ? 'translateY(-16px) scale(1.08)' : ''}`,
          transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
        className={`relative ${sizeClasses} ${theme.cardBackBg} ${theme.cardBackBorder} shadow-2xl p-2 flex flex-col items-center justify-between cursor-pointer select-none overflow-hidden group ${
          isSelected ? 'ring-4 ring-white shadow-glow-gold' : ''
        } ${className}`}
      >
        {/* Subtle patterned overlay */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{ backgroundImage: theme.cardBackPattern, backgroundSize: '12px 12px' }}
        />

        {/* Card Back Inner Border Frame */}
        <div className="w-full h-full rounded-xl border border-white/20 flex flex-col items-center justify-center relative z-10 bg-black/20">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-400 to-amber-600 flex items-center justify-center text-xl shadow-lg border border-white/40 group-hover:scale-110 transition-transform">
            <span>{theme.cardBackEmblem}</span>
          </div>
          <span className="text-[8px] font-black tracking-widest text-amber-200 uppercase mt-1">PLAYFLIX</span>
        </div>

        {/* Glass reflection */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/15 via-transparent to-black/20 pointer-events-none" />
      </div>
    );
  }

  const colorConfig = COLOR_CONFIGS[card.color] || COLOR_CONFIGS.red;

  // Render Card Action Symbol
  const renderCardContent = () => {
    switch (card.value) {
      case 'skip':
        return <Ban className="w-10 h-10 text-white drop-shadow-md animate-pulse" />;
      case 'reverse':
        return <Repeat className="w-10 h-10 text-white drop-shadow-md" />;
      case '+2':
        return (
          <span className="font-display font-black text-3xl text-white tracking-tighter drop-shadow-md">
            +2
          </span>
        );
      case '+4':
        return (
          <div className="flex flex-col items-center">
            <span className="font-display font-black text-3xl text-white tracking-tighter drop-shadow-md">
              +4
            </span>
            <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
          </div>
        );
      case 'wild':
        return (
          <div className="w-12 h-12 rounded-full bg-conic-gradient flex items-center justify-center shadow-lg border-2 border-white">
            <span className="font-display font-black text-xs text-white tracking-wider">WILD</span>
          </div>
        );
      default:
        return (
          <span className="font-display font-black text-4xl text-white tracking-tight drop-shadow-lg">
            {card.value}
          </span>
        );
    }
  };

  return (
    <div
      onClick={onClick}
      style={{
        transform: `rotate(${rotation}deg) ${isSelected ? 'translateY(-20px) scale(1.08)' : ''}`,
        transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}
      className={`relative ${sizeClasses} ${colorConfig.bg} ${colorConfig.border} ${colorConfig.glow} p-2 flex flex-col justify-between cursor-pointer select-none overflow-hidden transform hover:scale-105 active:scale-95 ${
        isPlayable ? 'ring-4 ring-amber-300 ring-offset-2 ring-offset-black/50 animate-pulse' : ''
      } ${isSelected ? 'ring-4 ring-white shadow-2xl scale-110 z-30' : ''} ${className}`}
    >
      {/* Top Left Micro Index */}
      <div className="flex items-center justify-between text-white font-black text-xs tracking-tighter leading-none z-10">
        <span>{card.value}</span>
      </div>

      {/* Center Oval Emblem with 3D Depth */}
      <div className="relative my-auto flex items-center justify-center">
        {/* White Rotated Center Pill */}
        <div className="w-[85%] h-14 rounded-full bg-white/20 backdrop-blur-sm border border-white/40 flex items-center justify-center transform -rotate-12 shadow-inner">
          {renderCardContent()}
        </div>
      </div>

      {/* Bottom Right Micro Index (Rotated 180) */}
      <div className="flex items-center justify-end text-white font-black text-xs tracking-tighter leading-none transform rotate-180 z-10">
        <span>{card.value}</span>
      </div>

      {/* 3D Glass Light Reflection Sheen */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/30 via-transparent to-black/30 pointer-events-none" />
      {/* 2.5D Bottom Edge Thickness */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/30 pointer-events-none" />
    </div>
  );
};
