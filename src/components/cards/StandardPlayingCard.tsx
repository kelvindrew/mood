import React from 'react';
import { PlayingCard, StandardRank, StandardSuit } from '../../types/game';
import {
  SuitPip,
  KingArtwork,
  QueenArtwork,
  JackArtwork,
  JokerArtwork,
  AceOfDiamondsArtwork,
  AceHeroArtwork,
  PipGrid,
  CardBackPattern,
} from './cardVectors';

export interface StandardPlayingCardProps {
  card?: PlayingCard | { rank: StandardRank; suit: StandardSuit; id?: string };
  isFacedown?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  isSelected?: boolean;
  isPlayable?: boolean;
  rotation?: number;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  disabled?: boolean;
}

const SIZE_CONFIGS = {
  xs: {
    container: 'w-12 h-16 rounded-lg p-1',
    rankText: 'text-[10px] font-black',
    miniPip: 8,
    centerPip: 10,
    hasArtwork: false, // For very tiny previews, use simplified pip
  },
  sm: {
    container: 'w-16 h-24 rounded-xl p-1.5',
    rankText: 'text-xs font-black',
    miniPip: 10,
    centerPip: 14,
    hasArtwork: true,
  },
  md: {
    container: 'w-20 h-28 rounded-2xl p-2',
    rankText: 'text-sm font-black',
    miniPip: 12,
    centerPip: 16,
    hasArtwork: true,
  },
  lg: {
    container: 'w-24 h-36 rounded-2xl p-2.5',
    rankText: 'text-base font-black',
    miniPip: 14,
    centerPip: 18,
    hasArtwork: true,
  },
  xl: {
    container: 'w-32 h-48 rounded-3xl p-3',
    rankText: 'text-xl font-black',
    miniPip: 18,
    centerPip: 22,
    hasArtwork: true,
  },
};

export const StandardPlayingCard: React.FC<StandardPlayingCardProps> = ({
  card,
  isFacedown = false,
  size = 'md',
  isSelected = false,
  isPlayable = true,
  rotation = 0,
  className = '',
  style = {},
  onClick,
  disabled = false,
}) => {
  const config = SIZE_CONFIGS[size] || SIZE_CONFIGS.md;

  if (isFacedown || !card) {
    return (
      <div
        onClick={!disabled ? onClick : undefined}
        style={{
          transform: rotation ? `rotate(${rotation}deg)` : undefined,
          ...style,
        }}
        className={`relative ${config.container} shadow-xl border-2 border-white/20 select-none transition-transform flex-shrink-0 ${
          onClick && !disabled ? 'cursor-pointer hover:scale-105 active:scale-95' : ''
        } ${className}`}
      >
        <CardBackPattern />
      </div>
    );
  }

  const { rank, suit } = card;
  const isRed = suit === 'hearts' || suit === 'diamonds';
  const rankColor = isRed ? 'text-[#E03E3E]' : 'text-[#1E2229]';

  // Center Artwork or Pip Display
  const renderCenterContent = () => {
    if (!config.hasArtwork) {
      return (
        <div className="flex items-center justify-center h-full">
          <SuitPip suit={suit} size={config.centerPip} />
        </div>
      );
    }

    if (rank === 'JOKER') {
      return <JokerArtwork width={size === 'xl' ? 96 : size === 'lg' ? 72 : 56} />;
    }

    if (rank === 'K') {
      return <KingArtwork suit={suit} width={size === 'xl' ? 96 : size === 'lg' ? 72 : 56} />;
    }

    if (rank === 'Q') {
      return <QueenArtwork suit={suit} width={size === 'xl' ? 96 : size === 'lg' ? 72 : 56} />;
    }

    if (rank === 'J') {
      return <JackArtwork suit={suit} width={size === 'xl' ? 96 : size === 'lg' ? 72 : 56} />;
    }

    if (rank === 'A') {
      if (suit === 'diamonds') {
        return <AceOfDiamondsArtwork width={size === 'xl' ? 96 : size === 'lg' ? 72 : 56} />;
      }
      return <AceHeroArtwork suit={suit} width={size === 'xl' ? 96 : size === 'lg' ? 72 : 56} />;
    }

    // Number cards 2 to 10
    return <PipGrid rank={rank} suit={suit} pipSize={config.centerPip} />;
  };

  return (
    <div
      onClick={!disabled ? onClick : undefined}
      style={{
        transform: rotation ? `rotate(${rotation}deg)` : undefined,
        ...style,
      }}
      className={`relative ${config.container} bg-[#FCFBF9] border border-[#E5E7EB] shadow-xl flex flex-col justify-between select-none transition-all flex-shrink-0 ${
        isSelected
          ? '-translate-y-2 ring-4 ring-brand-gold border-brand-gold shadow-[0_12px_30px_rgba(234,179,8,0.45)] scale-105 z-20'
          : 'hover:-translate-y-1'
      } ${!isPlayable ? 'opacity-40 grayscale-[40%]' : ''} ${
        onClick && !disabled ? 'cursor-pointer active:scale-95' : ''
      } ${className}`}
    >
      {/* Top Left Index */}
      <div className="flex flex-col items-center leading-none self-start">
        <span className={`${config.rankText} ${rankColor} font-sans tracking-tighter`}>{rank}</span>
        <SuitPip suit={suit} size={config.miniPip} className="mt-0.5" />
      </div>

      {/* Central Illustration or Pip Grid */}
      <div className="flex-1 flex items-center justify-center my-0.5 overflow-hidden">
        {renderCenterContent()}
      </div>

      {/* Bottom Right Index (Inverted) */}
      <div className="flex flex-col items-center leading-none self-end rotate-180">
        <span className={`${config.rankText} ${rankColor} font-sans tracking-tighter`}>{rank}</span>
        <SuitPip suit={suit} size={config.miniPip} className="mt-0.5" />
      </div>
    </div>
  );
};

export default StandardPlayingCard;
