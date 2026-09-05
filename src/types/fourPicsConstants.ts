// 4 Images 1 Mot — Constants and Level Definitions for Frontend & Backend

export interface LevelDefinition {
  level: number;
  name: string;
  badge: string;
  color: string;
  minLetters: number;
  maxLetters: number;
  description?: string;
}

export const LEVEL_DEFINITIONS: LevelDefinition[] = [
  { level: 1, name: 'Très Facile', badge: 'DÉCOUVERTE', color: '#10B981', minLetters: 3, maxLetters: 5, description: 'Mots courts du quotidien, indices visuels très directs' },
  { level: 2, name: 'Facile', badge: 'INITIÉ', color: '#34D399', minLetters: 4, maxLetters: 6, description: 'Objets familiers, nature et univers du quotidien' },
  { level: 3, name: 'Normal', badge: 'APPRENTI', color: '#FBBF24', minLetters: 4, maxLetters: 6, description: 'Associations d’idées, métiers, culture et loisirs' },
  { level: 4, name: 'Intermédiaire', badge: 'EXPLORATEUR', color: '#F59E0B', minLetters: 5, maxLetters: 7, description: 'Polysémie, métaphores visuelles et géographie' },
  { level: 5, name: 'Difficile', badge: 'STRATÈGE', color: '#F97316', minLetters: 5, maxLetters: 7, description: 'Concepts abstraits, actions, musique et traditions' },
  { level: 6, name: 'Très Difficile', badge: 'TACTICIEN', color: '#EA580C', minLetters: 5, maxLetters: 8, description: 'Polysémie avancée, physique et univers sensoriels' },
  { level: 7, name: 'Expert', badge: 'EXPERT', color: '#EF4444', minLetters: 5, maxLetters: 8, description: 'Mots à double sens profond et jeux de langage' },
  { level: 8, name: 'Maître', badge: 'MAÎTRE', color: '#DC2626', minLetters: 6, maxLetters: 9, description: 'Sciences, philosophie, illusions et équilibres' },
  { level: 9, name: 'Extrême', badge: 'GRAND MAÎTRE', color: '#9333EA', minLetters: 6, maxLetters: 10, description: 'Défis intellectuels d’élite, cosmos et conscience' },
  { level: 10, name: 'Légendaire', badge: 'LÉGENDAIRE', color: '#7E22CE', minLetters: 6, maxLetters: 12, description: 'L’épreuve ultime : quintessence, existence et infini' },
];
