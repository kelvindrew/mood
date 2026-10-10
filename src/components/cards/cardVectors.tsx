import React from 'react';
import { StandardSuit, StandardRank } from '../../types/game';

// ============================================================================
// 1. FACETED SUIT ICONS (Exact isometric / split-lighting from reference)
// ============================================================================

export interface SuitIconProps {
  className?: string;
  size?: number;
}

export const FacetedDiamond: React.FC<SuitIconProps> = ({ className = '', size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 28"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block flex-shrink-0 ${className}`}
  >
    {/* Left facet - darker coral/red */}
    <path d="M12 2L2.5 14L12 26V2Z" fill="#CE3520" />
    {/* Right facet - brighter orange/red highlight */}
    <path d="M12 2L21.5 14L12 26V2Z" fill="#F46238" />
  </svg>
);

export const FacetedHeart: React.FC<SuitIconProps> = ({ className = '', size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block flex-shrink-0 ${className}`}
  >
    {/* Left half - deep crimson red */}
    <path
      d="M12 21.5L4 13.5C2 11.5 1.5 8.5 3 6C4.5 3.5 7.5 3 10 4.5L12 6.5V21.5Z"
      fill="#C42127"
    />
    {/* Right half - vibrant poppy red */}
    <path
      d="M12 21.5L20 13.5C22 11.5 22.5 8.5 21 6C19.5 3.5 16.5 3 14 4.5L12 6.5V21.5Z"
      fill="#F04349"
    />
  </svg>
);

export const FacetedSpade: React.FC<SuitIconProps> = ({ className = '', size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 28"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block flex-shrink-0 ${className}`}
  >
    {/* Left spade lobe - deep obsidian/black */}
    <path
      d="M12 2C10.5 5.5 3 11 3 16C3 19 5.5 20.5 8.5 19.5C10.5 18.8 11.5 17 12 16V2Z"
      fill="#1A1C23"
    />
    {/* Right spade lobe - graphite / charcoal highlight */}
    <path
      d="M12 2C13.5 5.5 21 11 21 16C21 19 18.5 20.5 15.5 19.5C13.5 18.8 12.5 17 12 16V2Z"
      fill="#393F4D"
    />
    {/* Stem left */}
    <path d="M12 16L9.5 25H12V16Z" fill="#13151B" />
    {/* Stem right */}
    <path d="M12 16L14.5 25H12V16Z" fill="#2E333F" />
  </svg>
);

export const FacetedClub: React.FC<SuitIconProps> = ({ className = '', size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 28"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block flex-shrink-0 ${className}`}
  >
    {/* Top disc */}
    <path d="M12 2A5 5 0 0 0 7 7C7 9.5 8.8 11.5 11.2 11.9L12 12V2Z" fill="#1A1C23" />
    <path d="M12 2A5 5 0 0 1 17 7C17 9.5 15.2 11.5 12.8 11.9L12 12V2Z" fill="#393F4D" />
    {/* Bottom-left disc */}
    <path d="M7 9A5 5 0 0 0 2 14C2 16.8 4.2 19 7 19C8.5 19 9.8 18.3 10.7 17.2L11 15L7 9Z" fill="#1A1C23" />
    <path d="M7 9L11 15C11.6 14.2 12 13.2 12 12C12 11 11.5 10 10.8 9.3L7 9Z" fill="#393F4D" />
    {/* Bottom-right disc */}
    <path d="M17 9L13 15C12.4 14.2 12 13.2 12 12C12 11 12.5 10 13.2 9.3L17 9Z" fill="#1A1C23" />
    <path d="M17 9A5 5 0 0 1 22 14C22 16.8 19.8 19 17 19C15.5 19 14.2 18.3 13.3 17.2L13 15L17 9Z" fill="#393F4D" />
    {/* Stem */}
    <path d="M12 14L9 25H12V14Z" fill="#13151B" />
    <path d="M12 14L15 25H12V14Z" fill="#2E333F" />
  </svg>
);

export const SuitPip: React.FC<{ suit: StandardSuit; size?: number; className?: string }> = ({
  suit,
  size = 18,
  className = '',
}) => {
  switch (suit) {
    case 'diamonds':
      return <FacetedDiamond size={size} className={className} />;
    case 'hearts':
      return <FacetedHeart size={size} className={className} />;
    case 'spades':
      return <FacetedSpade size={size} className={className} />;
    case 'clubs':
      return <FacetedClub size={size} className={className} />;
    default:
      return <FacetedSpade size={size} className={className} />;
  }
};

// ============================================================================
// 2. ROYAL COURT ARTWORKS (Mirrored Kings, Queens, Jacks, Joker, Ace of Diamonds)
// ============================================================================

interface CourtProps {
  suit: StandardSuit;
  width?: number;
  height?: number;
}

/**
 * KING ARTWORK
 * Features specific suit hair/beard, crowns, diagonal staff/sword, striped doublet.
 */
export const KingArtwork: React.FC<CourtProps> = ({ suit, width = 120, height = 180 }) => {
  // Suit specific color themes from reference:
  // Diamonds: Orange hair/beard, teal & orange tunic, gold scepter
  // Hearts: Brown hair/mustache, red & blue tunic, silver sword
  // Spades: Black hair/mustache, b&w stripes, black baton
  // Clubs: Pink bouffant hair/beard, teal & pink tunic, pink staff
  const theme = {
    diamonds: {
      hair: '#F36F21',
      beard: '#F36F21',
      sleevePuff: '#0EA5E9',
      sleeveSecondary: '#F97316',
      stripe1: '#0284C7',
      stripe2: '#FFFFFF',
      staff: '#EAB308',
      staffFinial: '#FACC15',
    },
    hearts: {
      hair: '#8C532B',
      beard: '#8C532B',
      sleevePuff: '#E11D48',
      sleeveSecondary: '#FB7185',
      stripe1: '#E11D48',
      stripe2: '#60A5FA',
      staff: '#CBD5E1',
      staffFinial: '#94A3B8',
    },
    spades: {
      hair: '#1E2229',
      beard: '#1E2229',
      sleevePuff: '#2D3342',
      sleeveSecondary: '#475569',
      stripe1: '#1E2229',
      stripe2: '#F8FAFC',
      staff: '#0F172A',
      staffFinial: '#64748B',
    },
    clubs: {
      hair: '#EC4899',
      beard: '#EC4899',
      sleevePuff: '#EC4899',
      sleeveSecondary: '#14B8A6',
      stripe1: '#0D9488',
      stripe2: '#F472B6',
      staff: '#F43F5E',
      staffFinial: '#FBBF24',
    },
  }[suit] || {
    hair: '#1E2229',
    beard: '#1E2229',
    sleevePuff: '#2D3342',
    sleeveSecondary: '#475569',
    stripe1: '#1E2229',
    stripe2: '#F8FAFC',
    staff: '#0F172A',
    staffFinial: '#64748B',
  };

  const HalfFigure = () => (
    <g>
      {/* Crown */}
      <polygon points="46,16 54,8 60,14 66,8 74,16 70,22 50,22" fill="#FBBF24" />
      <circle cx="54" cy="8" r="1.5" fill="#EF4444" />
      <circle cx="66" cy="8" r="1.5" fill="#EF4444" />

      {/* Hair (Bouffant / Crown curls) */}
      <circle cx="44" cy="28" r="10" fill={theme.hair} />
      <circle cx="76" cy="28" r="10" fill={theme.hair} />

      {/* Head */}
      <rect x="47" y="20" width="26" height="24" rx="6" fill="#FEE5D4" />

      {/* Eyes & Eyebrows */}
      <circle cx="53" cy="27" r="1.8" fill="#1E293B" />
      <circle cx="67" cy="27" r="1.8" fill="#1E293B" />

      {/* Characteristic Orange/Coral Nose */}
      <ellipse cx="60" cy="30" rx="3.5" ry="2.5" fill="#EF4444" />

      {/* Royal Mustache & Beard */}
      <path d="M51 34 Q60 38 69 34 Q64 41 60 41 Q56 41 51 34 Z" fill={theme.beard} />
      <path d="M46 36 Q60 48 74 36 Q60 52 46 36 Z" fill={theme.beard} />

      {/* Neck Collar */}
      <polygon points="50,44 60,49 70,44 60,43" fill="#FFFFFF" />

      {/* Puffy Shoulders */}
      <circle cx="34" cy="56" r="12" fill={theme.sleevePuff} />
      <circle cx="86" cy="56" r="12" fill={theme.sleevePuff} />
      <circle cx="36" cy="58" r="8" fill={theme.sleeveSecondary} />
      <circle cx="84" cy="58" r="8" fill={theme.sleeveSecondary} />

      {/* Striped Torso */}
      <rect x="44" y="47" width="32" height="38" fill={theme.stripe1} />
      <rect x="49" y="47" width="5" height="38" fill={theme.stripe2} />
      <rect x="59" y="47" width="5" height="38" fill={theme.stripe2} />
      <rect x="69" y="47" width="3" height="38" fill={theme.stripe2} />

      {/* Arms & Hands */}
      <rect x="30" y="64" width="12" height="18" rx="4" fill="#FEE5D4" />
      <rect x="78" y="64" width="12" height="18" rx="4" fill="#FEE5D4" />

      {/* Diagonal Scepter / Weapon */}
      <line x1="22" y1="84" x2="98" y2="38" stroke={theme.staff} strokeWidth="4" strokeLinecap="round" />
      <circle cx="22" cy="84" r="5" fill={theme.staffFinial} />
      <circle cx="98" cy="38" r="4" fill={theme.staffFinial} />
    </g>
  );

  return (
    <svg width={width} height={height} viewBox="0 0 120 170" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Top half */}
      <HalfFigure />
      {/* Dividing waist belt */}
      <line x1="20" y1="85" x2="100" y2="85" stroke="#E2E8F0" strokeWidth="2" strokeDasharray="3 3" />
      {/* Mirrored bottom half (180deg) */}
      <g transform="rotate(180 60 85)">
        <HalfFigure />
      </g>
    </svg>
  );
};

/**
 * QUEEN ARTWORK
 * Features crown, serene profile, stemmed wine glass in one hand and long rose in other.
 */
export const QueenArtwork: React.FC<CourtProps> = ({ suit, width = 120, height = 180 }) => {
  const theme = {
    diamonds: {
      hair: '#F59E0B',
      tunic: '#0D9488',
      rose: '#EF4444',
      roseStem: '#10B981',
      wineColor: '#E11D48',
    },
    hearts: {
      hair: '#8C532B',
      tunic: '#E11D48',
      rose: '#F43F5E',
      roseStem: '#10B981',
      wineColor: '#BE123C',
    },
    spades: {
      hair: '#1E2229',
      tunic: '#334155',
      rose: '#1E293B',
      roseStem: '#475569',
      wineColor: '#991B1B',
    },
    clubs: {
      hair: '#EC4899',
      tunic: '#06B6D4',
      rose: '#E11D48',
      roseStem: '#10B981',
      wineColor: '#BE123C',
    },
  }[suit] || {
    hair: '#1E2229',
    tunic: '#334155',
    rose: '#1E293B',
    roseStem: '#475569',
    wineColor: '#991B1B',
  };

  const HalfFigure = () => (
    <g>
      {/* Queen Crown */}
      <polygon points="48,16 54,10 60,15 66,10 72,16 68,21 52,21" fill="#FBBF24" />

      {/* Hair (flowing royal waves) */}
      <circle cx="43" cy="27" r="9" fill={theme.hair} />
      <circle cx="77" cy="27" r="9" fill={theme.hair} />
      <path d="M40 32 C40 45 46 50 48 52" stroke={theme.hair} strokeWidth="6" strokeLinecap="round" />
      <path d="M80 32 C80 45 74 50 72 52" stroke={theme.hair} strokeWidth="6" strokeLinecap="round" />

      {/* Head */}
      <rect x="48" y="20" width="24" height="23" rx="7" fill="#FEE5D4" />
      {/* Serene Queen Eye */}
      <path d="M53 28 Q56 26 59 28" stroke="#1E293B" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <path d="M63 28 Q66 26 69 28" stroke="#1E293B" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      {/* Coral Nose & Lips */}
      <circle cx="61" cy="32" r="2.2" fill="#EF4444" />
      <path d="M58 37 Q61 39 64 37" stroke="#E11D48" strokeWidth="1.6" strokeLinecap="round" fill="none" />

      {/* White ruffled collar */}
      <path d="M46 44 Q60 50 74 44" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1" />

      {/* Puffy Sleeves */}
      <circle cx="34" cy="56" r="10" fill={theme.tunic} />
      <circle cx="86" cy="56" r="10" fill={theme.tunic} />

      {/* Striped Bodice */}
      <rect x="44" y="46" width="32" height="39" fill={theme.tunic} />
      <rect x="52" y="46" width="4" height="39" fill="#FFFFFF" />
      <rect x="64" y="46" width="4" height="39" fill="#FFFFFF" />

      {/* Left Hand: Holding Wine Goblet */}
      <path d="M22 68 Q28 68 28 60 Q28 52 22 52 Z" fill="#E2E8F0" opacity="0.9" />
      <path d="M23 66 Q27 66 27 60 Q27 57 23 57 Z" fill={theme.wineColor} />
      <line x1="25" y1="68" x2="25" y2="76" stroke="#94A3B8" strokeWidth="2" />
      <line x1="21" y1="76" x2="29" y2="76" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
      {/* Hand holding glass */}
      <circle cx="28" cy="70" r="3.5" fill="#FEE5D4" />

      {/* Right Hand: Holding Tilted Rose */}
      <line x1="86" y1="76" x2="100" y2="40" stroke={theme.roseStem} strokeWidth="2.5" strokeLinecap="round" />
      {/* Rose Bloom */}
      <circle cx="100" cy="40" r="6" fill={theme.rose} />
      <path d="M96 38 Q100 34 104 38 Q100 44 96 38 Z" fill="#FFFFFF" opacity="0.3" />
      {/* Hand holding rose stem */}
      <circle cx="88" cy="70" r="3.5" fill="#FEE5D4" />
    </g>
  );

  return (
    <svg width={width} height={height} viewBox="0 0 120 170" fill="none" xmlns="http://www.w3.org/2000/svg">
      <HalfFigure />
      <line x1="20" y1="85" x2="100" y2="85" stroke="#E2E8F0" strokeWidth="2" strokeDasharray="3 3" />
      <g transform="rotate(180 60 85)">
        <HalfFigure />
      </g>
    </svg>
  );
};

/**
 * JACK ARTWORK
 * Features the signature mechanical/steampunk wheel chestplate, diagonal weapon, cap/hair.
 */
export const JackArtwork: React.FC<CourtProps> = ({ suit, width = 120, height = 180 }) => {
  const theme = {
    diamonds: {
      hair: '#F97316',
      hatColor: '#0284C7',
      weapon: '#EAB308',
      accents: '#FB923C',
    },
    hearts: {
      hair: '#8C532B',
      hatColor: '#E11D48',
      weapon: '#CBD5E1',
      accents: '#F43F5E',
    },
    spades: {
      hair: '#1E2229',
      hatColor: '#334155',
      weapon: '#0F172A',
      accents: '#64748B',
    },
    clubs: {
      hair: '#EC4899',
      hatColor: '#0D9488',
      weapon: '#F43F5E',
      accents: '#F472B6',
    },
  }[suit] || {
    hair: '#1E2229',
    hatColor: '#334155',
    weapon: '#0F172A',
    accents: '#64748B',
  };

  const HalfFigure = () => (
    <g>
      {/* Feathered / Angled Jack Beret/Cap */}
      <polygon points="40,24 50,14 74,16 82,24 64,22" fill={theme.hatColor} />
      <path d="M72 16 Q84 10 90 14" stroke="#FBBF24" strokeWidth="3" strokeLinecap="round" />

      {/* Hair */}
      <circle cx="42" cy="28" r="7" fill={theme.hair} />
      <circle cx="78" cy="28" r="7" fill={theme.hair} />

      {/* Head */}
      <rect x="47" y="21" width="26" height="23" rx="6" fill="#FEE5D4" />

      {/* Eyes & Mustache */}
      <circle cx="53" cy="28" r="1.8" fill="#1E293B" />
      <circle cx="67" cy="28" r="1.8" fill="#1E293B" />
      <ellipse cx="60" cy="32" rx="3.5" ry="2.2" fill="#EF4444" />
      <path d="M52 36 Q60 39 68 36" stroke={theme.hair} strokeWidth="2.5" strokeLinecap="round" />

      {/* Collar */}
      <polygon points="52,44 60,49 68,44 60,43" fill="#FFFFFF" />

      {/* Sleeves */}
      <circle cx="34" cy="58" r="11" fill={theme.accents} />
      <circle cx="86" cy="58" r="11" fill={theme.accents} />

      {/* JACK SIGNATURE: Mechanical / Steampunk Cog Wheel Chestplate */}
      <rect x="42" y="47" width="36" height="38" rx="4" fill="#0F172A" />
      {/* Left Steampunk Wheel/Gear */}
      <circle cx="52" cy="62" r="9" fill="#475569" stroke="#94A3B8" strokeWidth="1.5" />
      <circle cx="52" cy="62" r="5" fill="#1E293B" />
      <circle cx="52" cy="62" r="2" fill="#CBD5E1" />
      <line x1="52" y1="53" x2="52" y2="71" stroke="#94A3B8" strokeWidth="1.2" />
      <line x1="43" y1="62" x2="61" y2="62" stroke="#94A3B8" strokeWidth="1.2" />

      {/* Right Steampunk Wheel/Gear */}
      <circle cx="68" cy="74" r="9" fill="#475569" stroke="#94A3B8" strokeWidth="1.5" />
      <circle cx="68" cy="74" r="5" fill="#1E293B" />
      <circle cx="68" cy="74" r="2" fill="#CBD5E1" />
      <line x1="68" y1="65" x2="68" y2="83" stroke="#94A3B8" strokeWidth="1.2" />
      <line x1="59" y1="74" x2="77" y2="74" stroke="#94A3B8" strokeWidth="1.2" />

      {/* Diagonal Weapon / Baton */}
      <line x1="24" y1="84" x2="96" y2="40" stroke={theme.weapon} strokeWidth="4" strokeLinecap="round" />
      <circle cx="24" cy="84" r="4.5" fill="#FBBF24" />
      <circle cx="96" cy="40" r="3.5" fill="#FBBF24" />
    </g>
  );

  return (
    <svg width={width} height={height} viewBox="0 0 120 170" fill="none" xmlns="http://www.w3.org/2000/svg">
      <HalfFigure />
      <line x1="20" y1="85" x2="100" y2="85" stroke="#E2E8F0" strokeWidth="2" strokeDasharray="3 3" />
      <g transform="rotate(180 60 85)">
        <HalfFigure />
      </g>
    </svg>
  );
};

/**
 * JOKER ARTWORK
 * Exact harlequin cat mask, diamond checkerboard tunic, peacock ruff, vertical JOKER text.
 */
export const JokerArtwork: React.FC<{ width?: number; height?: number }> = ({ width = 120, height = 180 }) => {
  const HalfFigure = () => (
    <g>
      {/* Peacock / Fan Feather Ruff behind head */}
      <path
        d="M36 34 C32 18 48 8 60 12 C72 8 88 18 84 34 Z"
        fill="#94A3B8"
        stroke="#CBD5E1"
        strokeWidth="1.5"
      />
      <path d="M42 28 Q60 18 78 28" stroke="#0D9488" strokeWidth="2" fill="none" />

      {/* Cat / Fox Ears */}
      <polygon points="46,18 42,6 52,14" fill="#334155" />
      <polygon points="74,18 78,6 68,14" fill="#334155" />
      <polygon points="47,17 44,8 51,14" fill="#F472B6" />
      <polygon points="73,17 76,8 69,14" fill="#F472B6" />

      {/* Harlequin Mask / Face */}
      <rect x="46" y="16" width="28" height="24" rx="8" fill="#F8FAFC" stroke="#334155" strokeWidth="1.5" />
      <circle cx="53" cy="24" r="2.5" fill="#0D9488" />
      <circle cx="67" cy="24" r="2.5" fill="#0D9488" />
      <circle cx="53" cy="24" r="1.2" fill="#FFFFFF" />
      <circle cx="67" cy="24" r="1.2" fill="#FFFFFF" />
      {/* Whiskers & Coral Snout */}
      <ellipse cx="60" cy="29" rx="3" ry="2" fill="#F43F5E" />
      <line x1="43" y1="28" x2="48" y2="29" stroke="#64748B" strokeWidth="1" />
      <line x1="77" y1="28" x2="72" y2="29" stroke="#64748B" strokeWidth="1" />

      {/* Diamond Checkerboard Harlequin Torso */}
      <g>
        <polygon points="60,42 70,52 60,62 50,52" fill="#0F172A" />
        <polygon points="50,52 60,62 50,72 40,62" fill="#0D9488" />
        <polygon points="70,52 80,62 70,72 60,62" fill="#0D9488" />
        <polygon points="60,62 70,72 60,82 50,72" fill="#F8FAFC" />
        <polygon points="50,72 60,82 50,85 42,76" fill="#0F172A" />
        <polygon points="70,72 80,76 72,85 60,82" fill="#0F172A" />
      </g>

      {/* Diagonal Harlequin Staff */}
      <line x1="22" y1="80" x2="98" y2="44" stroke="#14B8A6" strokeWidth="4" strokeLinecap="round" />
      <circle cx="22" cy="80" r="4.5" fill="#F59E0B" />
      <circle cx="98" cy="44" r="4.5" fill="#F59E0B" />
    </g>
  );

  return (
    <svg width={width} height={height} viewBox="0 0 120 170" fill="none" xmlns="http://www.w3.org/2000/svg">
      <HalfFigure />
      <line x1="20" y1="85" x2="100" y2="85" stroke="#E2E8F0" strokeWidth="2" strokeDasharray="3 3" />
      <g transform="rotate(180 60 85)">
        <HalfFigure />
      </g>
      {/* Vertical Joker Text */}
      <text
        x="10"
        y="30"
        fill="#64748B"
        fontSize="10"
        fontWeight="900"
        fontFamily="sans-serif"
        letterSpacing="2"
      >
        J
      </text>
      <text
        x="10"
        y="42"
        fill="#64748B"
        fontSize="10"
        fontWeight="900"
        fontFamily="sans-serif"
        letterSpacing="2"
      >
        O
      </text>
      <text
        x="10"
        y="54"
        fill="#64748B"
        fontSize="10"
        fontWeight="900"
        fontFamily="sans-serif"
        letterSpacing="2"
      >
        K
      </text>
      <text
        x="10"
        y="66"
        fill="#64748B"
        fontSize="10"
        fontWeight="900"
        fontFamily="sans-serif"
        letterSpacing="2"
      >
        E
      </text>
      <text
        x="10"
        y="78"
        fill="#64748B"
        fontSize="10"
        fontWeight="900"
        fontFamily="sans-serif"
        letterSpacing="2"
      >
        R
      </text>
    </svg>
  );
};

/**
 * ACE OF DIAMONDS ARTWORK
 * Features the signature crescent sun/moon face with mustache & stars + 5-dot color spectrum!
 */
export const AceOfDiamondsArtwork: React.FC<{ width?: number; height?: number }> = ({
  width = 120,
  height = 180,
}) => {
  return (
    <svg width={width} height={height} viewBox="0 0 120 170" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Top-Right Spectrum Dots */}
      <g transform="translate(102, 16)">
        <circle cx="0" cy="0" r="3" fill="#F97316" />
        <circle cx="0" cy="8" r="3" fill="#FBBF24" />
        <circle cx="0" cy="16" r="3" fill="#EF4444" />
        <circle cx="0" cy="24" r="3" fill="#10B981" />
        <circle cx="0" cy="32" r="3" fill="#06B6D4" />
      </g>

      {/* Bottom-Left Spectrum Dots */}
      <g transform="translate(18, 116)">
        <circle cx="0" cy="0" r="3" fill="#06B6D4" />
        <circle cx="0" cy="8" r="3" fill="#10B981" />
        <circle cx="0" cy="16" r="3" fill="#EF4444" />
        <circle cx="0" cy="24" r="3" fill="#FBBF24" />
        <circle cx="0" cy="32" r="3" fill="#F97316" />
      </g>

      {/* Center Celestial Sphere / Moon Halo */}
      <circle cx="60" cy="85" r="36" fill="#E2E8F0" opacity="0.6" />
      {/* Decorative Stars */}
      <polygon points="80,68 82,73 87,74 83,78 84,83 80,80 76,83 77,78 73,74 78,73" fill="#CBD5E1" />
      <circle cx="40" cy="66" r="2.5" fill="#CBD5E1" />
      <circle cx="82" cy="102" r="2.5" fill="#CBD5E1" />

      {/* Yellow Golden Crescent Face */}
      <path
        d="M60 52 C78 52 88 68 88 85 C88 102 78 118 60 118 C72 108 74 94 74 85 C74 76 72 62 60 52 Z"
        fill="#FACC15"
      />
      {/* Moon Nose & Eye */}
      <circle cx="70" cy="78" r="2" fill="#1E293B" />
      <circle cx="76" cy="85" r="3.5" fill="#EF4444" />
      {/* Mustache on the Moon */}
      <path d="M68 93 Q76 96 82 92 Q77 98 70 95 Z" fill="#8C532B" />
      {/* Cheerful Blushing Cheek */}
      <ellipse cx="66" cy="88" rx="4" ry="2.5" fill="#F87171" opacity="0.7" />
    </svg>
  );
};

/**
 * ACE HERO EMBLEM (For Spades, Hearts, Clubs)
 * Giant faceted suit pip with delicate ray flourishes
 */
export const AceHeroArtwork: React.FC<{ suit: StandardSuit; width?: number; height?: number }> = ({
  suit,
  width = 120,
  height = 180,
}) => {
  return (
    <div
      style={{ width, height }}
      className="flex flex-col items-center justify-center relative select-none"
    >
      {/* Subtle radiating lines */}
      <div className="absolute inset-4 rounded-full border border-gray-200/60 pointer-events-none" />
      <div className="transform scale-[2.2] drop-shadow-md">
        <SuitPip suit={suit} size={38} />
      </div>
    </div>
  );
};

// ============================================================================
// 3. PIP GRID LAYOUT (Exact card numbers 2 through 10)
// ============================================================================

export const PipGrid: React.FC<{
  rank: StandardRank;
  suit: StandardSuit;
  pipSize?: number;
}> = ({ rank, suit, pipSize = 18 }) => {
  const num = parseInt(rank, 10);
  if (isNaN(num) || num < 2 || num > 10) return null;

  // Grid layouts for 2-10 cards
  const renderPips = () => {
    switch (num) {
      case 2:
        return (
          <div className="w-full h-full flex flex-col justify-between items-center py-2">
            <SuitPip suit={suit} size={pipSize} />
            <div className="rotate-180">
              <SuitPip suit={suit} size={pipSize} />
            </div>
          </div>
        );
      case 3:
        return (
          <div className="w-full h-full flex flex-col justify-between items-center py-2">
            <SuitPip suit={suit} size={pipSize} />
            <SuitPip suit={suit} size={pipSize} />
            <div className="rotate-180">
              <SuitPip suit={suit} size={pipSize} />
            </div>
          </div>
        );
      case 4:
        return (
          <div className="w-full h-full grid grid-cols-2 justify-items-center content-between py-2 px-1">
            <SuitPip suit={suit} size={pipSize} />
            <SuitPip suit={suit} size={pipSize} />
            <div className="rotate-180"><SuitPip suit={suit} size={pipSize} /></div>
            <div className="rotate-180"><SuitPip suit={suit} size={pipSize} /></div>
          </div>
        );
      case 5:
        return (
          <div className="w-full h-full flex flex-col justify-between py-2 px-1">
            <div className="flex justify-between">
              <SuitPip suit={suit} size={pipSize} />
              <SuitPip suit={suit} size={pipSize} />
            </div>
            <div className="flex justify-center">
              <SuitPip suit={suit} size={pipSize} />
            </div>
            <div className="flex justify-between rotate-180">
              <SuitPip suit={suit} size={pipSize} />
              <SuitPip suit={suit} size={pipSize} />
            </div>
          </div>
        );
      case 6:
        return (
          <div className="w-full h-full grid grid-cols-2 justify-items-center content-between py-2 px-1">
            <SuitPip suit={suit} size={pipSize} />
            <SuitPip suit={suit} size={pipSize} />
            <SuitPip suit={suit} size={pipSize} />
            <SuitPip suit={suit} size={pipSize} />
            <div className="rotate-180"><SuitPip suit={suit} size={pipSize} /></div>
            <div className="rotate-180"><SuitPip suit={suit} size={pipSize} /></div>
          </div>
        );
      case 7:
        return (
          <div className="w-full h-full flex flex-col justify-between py-2 px-1 relative">
            <div className="flex justify-between">
              <SuitPip suit={suit} size={pipSize} />
              <SuitPip suit={suit} size={pipSize} />
            </div>
            <div className="flex justify-center -my-1">
              <SuitPip suit={suit} size={pipSize} />
            </div>
            <div className="flex justify-between">
              <SuitPip suit={suit} size={pipSize} />
              <SuitPip suit={suit} size={pipSize} />
            </div>
            <div className="flex justify-between rotate-180">
              <SuitPip suit={suit} size={pipSize} />
              <SuitPip suit={suit} size={pipSize} />
            </div>
          </div>
        );
      case 8:
        return (
          <div className="w-full h-full flex flex-col justify-between py-2 px-1">
            <div className="flex justify-between">
              <SuitPip suit={suit} size={pipSize} />
              <SuitPip suit={suit} size={pipSize} />
            </div>
            <div className="flex justify-center -my-0.5">
              <SuitPip suit={suit} size={pipSize} />
            </div>
            <div className="flex justify-between">
              <SuitPip suit={suit} size={pipSize} />
              <SuitPip suit={suit} size={pipSize} />
            </div>
            <div className="flex justify-center -my-0.5 rotate-180">
              <SuitPip suit={suit} size={pipSize} />
            </div>
            <div className="flex justify-between rotate-180">
              <SuitPip suit={suit} size={pipSize} />
              <SuitPip suit={suit} size={pipSize} />
            </div>
          </div>
        );
      case 9:
        return (
          <div className="w-full h-full flex flex-col justify-between py-1.5 px-1">
            <div className="flex justify-between">
              <SuitPip suit={suit} size={pipSize} />
              <SuitPip suit={suit} size={pipSize} />
            </div>
            <div className="flex justify-between">
              <SuitPip suit={suit} size={pipSize} />
              <SuitPip suit={suit} size={pipSize} />
            </div>
            <div className="flex justify-center -my-1">
              <SuitPip suit={suit} size={pipSize} />
            </div>
            <div className="flex justify-between rotate-180">
              <SuitPip suit={suit} size={pipSize} />
              <SuitPip suit={suit} size={pipSize} />
            </div>
            <div className="flex justify-between rotate-180">
              <SuitPip suit={suit} size={pipSize} />
              <SuitPip suit={suit} size={pipSize} />
            </div>
          </div>
        );
      case 10:
        return (
          <div className="w-full h-full flex flex-col justify-between py-1.5 px-1">
            <div className="flex justify-between">
              <SuitPip suit={suit} size={pipSize} />
              <SuitPip suit={suit} size={pipSize} />
            </div>
            <div className="flex justify-center -my-1">
              <SuitPip suit={suit} size={pipSize} />
            </div>
            <div className="flex justify-between">
              <SuitPip suit={suit} size={pipSize} />
              <SuitPip suit={suit} size={pipSize} />
            </div>
            <div className="flex justify-center -my-1 rotate-180">
              <SuitPip suit={suit} size={pipSize} />
            </div>
            <div className="flex justify-between rotate-180">
              <SuitPip suit={suit} size={pipSize} />
              <SuitPip suit={suit} size={pipSize} />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return <div className="w-full h-full flex items-center justify-center">{renderPips()}</div>;
};

// ============================================================================
// 4. STYLIZED CARD BACK (Geometric diamonds & isometric lattice)
// ============================================================================

export const CardBackPattern: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`w-full h-full rounded-2xl bg-[#0F1424] p-1.5 relative overflow-hidden flex items-center justify-center ${className}`}>
    {/* Inner frame */}
    <div className="w-full h-full rounded-xl border-2 border-[#38BDF8]/30 bg-[#0B0F1D] relative overflow-hidden flex items-center justify-center p-2">
      {/* Geometric Diamond Pattern */}
      <svg width="100%" height="100%" viewBox="0 0 80 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="cardBackGrid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M10 0L20 10L10 20L0 10Z" fill="none" stroke="#1E293B" strokeWidth="1" />
            <circle cx="10" cy="10" r="1.5" fill="#38BDF8" opacity="0.4" />
          </pattern>
        </defs>
        <rect width="80" height="120" fill="url(#cardBackGrid)" />
        {/* Center Golden Medallion */}
        <circle cx="40" cy="60" r="16" fill="#0F172A" stroke="#F59E0B" strokeWidth="2" />
        <polygon points="40,48 48,60 40,72 32,60" fill="#F59E0B" opacity="0.8" />
        <circle cx="40" cy="60" r="3" fill="#FFFFFF" />
      </svg>
    </div>
  </div>
);
