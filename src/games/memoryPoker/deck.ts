// Memory Poker Deck & Card Management
// Generates standard 52-card deck, Fisher-Yates shuffling, deal 16 grid cards + 3 community cards

export type CardSuit = 'spade' | 'heart' | 'diamond' | 'club';

export interface PlayingCard {
  id: string;
  suit: CardSuit;
  rank: number; // 2..14 (11=J, 12=Q, 13=K, 14=A)
  display: string;
  symbol: string;
  color: 'red' | 'black';
}

export const SUITS: CardSuit[] = ['spade', 'heart', 'diamond', 'club'];

export const SUIT_SYMBOLS: Record<CardSuit, string> = {
  spade: '♠',
  heart: '♥',
  diamond: '♦',
  club: '♣',
};

export const SUIT_NAMES: Record<CardSuit, string> = {
  spade: 'Pique',
  heart: 'Cœur',
  diamond: 'Carreau',
  club: 'Trèfle',
};

export const RANK_DISPLAYS: Record<number, string> = {
  14: 'A',
  13: 'K',
  12: 'Q',
  11: 'J',
  10: '10',
  9: '9',
  8: '8',
  7: '7',
  6: '6',
  5: '5',
  4: '4',
  3: '3',
  2: '2',
};

/**
 * Creates a standard 52-card deck
 */
export function createDeck(): PlayingCard[] {
  const deck: PlayingCard[] = [];
  for (const suit of SUITS) {
    const isRed = suit === 'heart' || suit === 'diamond';
    for (let rank = 2; rank <= 14; rank++) {
      deck.push({
        id: `${suit}_${rank}`,
        suit,
        rank,
        display: RANK_DISPLAYS[rank],
        symbol: SUIT_SYMBOLS[suit],
        color: isRed ? 'red' : 'black',
      });
    }
  }
  return deck;
}

/**
 * Shuffles an array in-place using Fisher-Yates algorithm
 */
export function shuffleDeck<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export interface MemoryPokerDeal {
  grid: PlayingCard[];       // 16 cards on 4x4 grid (positions 0..15)
  community: PlayingCard[];  // 3 community cards exposed during selection
  remainingDeck: PlayingCard[]; // 33 remaining cards
}

/**
 * Deals 16 grid cards and 3 community cards without replacement
 */
export function dealMemoryPokerCards(): MemoryPokerDeal {
  const deck = shuffleDeck(createDeck());
  const grid = deck.slice(0, 16);
  const community = deck.slice(16, 19);
  const remainingDeck = deck.slice(19);

  return {
    grid,
    community,
    remainingDeck,
  };
}
