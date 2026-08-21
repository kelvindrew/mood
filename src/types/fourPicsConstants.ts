// 4 Images 1 Mot — Constants and Level Definitions for Frontend & Backend

export interface LevelDefinition {
  level: number;
  name: string;
  badge: string;
  color: string;
  minLetters: number;
  maxLetters: number;
}

export const LEVEL_DEFINITIONS: LevelDefinition[] = [
  { level: 1, name: 'Très Facile', badge: 'DÉCOUVERTE', color: '#10B981', minLetters: 3, maxLetters: 5 },
  { level: 2, name: 'Facile', badge: 'INITIÉ', color: '#34D399', minLetters: 4, maxLetters: 6 },
  { level: 3, name: 'Normal', badge: 'APPRENTI', color: '#FBBF24', minLetters: 4, maxLetters: 6 },
  { level: 4, name: 'Intermédiaire', badge: 'EXPLORATEUR', color: '#F59E0B', minLetters: 5, maxLetters: 7 },
  { level: 5, name: 'Difficile', badge: 'STRATÈGE', color: '#F97316', minLetters: 5, maxLetters: 7 },
  { level: 6, name: 'Très Difficile', badge: 'TACTICIEN', color: '#EA580C', minLetters: 5, maxLetters: 8 },
  { level: 7, name: 'Expert', badge: 'EXPERT', color: '#EF4444', minLetters: 5, maxLetters: 8 },
  { level: 8, name: 'Maître', badge: 'MAÎTRE', color: '#DC2626', minLetters: 6, maxLetters: 9 },
  { level: 9, name: 'Extrême', badge: 'GRAND MAÎTRE', color: '#9333EA', minLetters: 6, maxLetters: 10 },
  { level: 10, name: 'Légendaire', badge: 'LÉGENDAIRE', color: '#7E22CE', minLetters: 4, maxLetters: 10 },
];
