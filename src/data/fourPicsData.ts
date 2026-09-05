// 4 Images 1 Mot — Frontend Database & Catalog Synchronization
import { LEVEL_DEFINITIONS } from '../types/fourPicsConstants';

export interface FourPicsPuzzleItem {
  id: string;
  level: number;
  stageNumber: number;
  word: string;
  category: string;
  difficultyLabel: string;
  hint: string;
  validationScore: number;
  tags: string[];
  images: [string, string, string, string];
}

export const DEDICATED_STAGES: FourPicsPuzzleItem[] = [
  // NIVEAU 1 — TRÈS FACILE
  {
    id: 'lvl_1_stg_1',
    level: 1,
    stageNumber: 1,
    word: 'CHAT',
    category: 'Animaux de Compagnie',
    difficultyLabel: 'Très Facile',
    hint: 'Félin domestique à moustaches qui ronronne',
    validationScore: 99,
    tags: ['animal', 'compagnon', 'ronronner'],
    images: [
      'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1543852786-1cf6624b9987?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=600&q=80',
    ],
  },
  {
    id: 'lvl_1_stg_2',
    level: 1,
    stageNumber: 2,
    word: 'EAU',
    category: 'Éléments & Nature',
    difficultyLabel: 'Très Facile',
    hint: 'Liquide vital, incolore et rafraîchissant',
    validationScore: 99,
    tags: ['liquide', 'source', 'vie', 'nature'],
    images: [
      'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
    ],
  },
  {
    id: 'lvl_1_stg_3',
    level: 1,
    stageNumber: 3,
    word: 'FEU',
    category: 'Éléments & Énergie',
    difficultyLabel: 'Très Facile',
    hint: 'Flammes chaudes, crépitantes et lumineuses',
    validationScore: 99,
    tags: ['flamme', 'chaleur', 'element'],
    images: [
      'https://images.unsplash.com/photo-1527489377706-5bf97e608852?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=600&q=80',
    ],
  },
  {
    id: 'lvl_1_stg_4',
    level: 1,
    stageNumber: 4,
    word: 'POMME',
    category: 'Nourriture & Fruits',
    difficultyLabel: 'Très Facile',
    hint: 'Fruit rond croquant, rouge ou vert',
    validationScore: 99,
    tags: ['fruit', 'arbre', 'nourriture'],
    images: [
      'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1570913149827-d2ac84ab3f9a?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1576179635662-9d1983e97e1e?auto=format&fit=crop&w=600&q=80',
    ],
  },
  {
    id: 'lvl_1_stg_5',
    level: 1,
    stageNumber: 5,
    word: 'PAIN',
    category: 'Alimentation & Boulangerie',
    difficultyLabel: 'Très Facile',
    hint: 'Aliment de base cuit à base de farine et levure',
    validationScore: 99,
    tags: ['boulangerie', 'farine', 'croûte'],
    images: [
      'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1517433670267-08bbd4be890f?auto=format&fit=crop&w=600&q=80',
    ],
  },
  {
    id: 'lvl_1_stg_6',
    level: 1,
    stageNumber: 6,
    word: 'ROSE',
    category: 'Fleurs & Couleurs',
    difficultyLabel: 'Très Facile',
    hint: 'Fleur parfumée à épines ou couleur douce',
    validationScore: 98,
    tags: ['fleur', 'couleur', 'amour'],
    images: [
      'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1559563458-527698bf5295?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1508615039623-a25605d2b022?auto=format&fit=crop&w=600&q=80',
    ],
  },
  {
    id: 'lvl_1_stg_7',
    level: 1,
    stageNumber: 7,
    word: 'LION',
    category: 'Animaux & Savane',
    difficultyLabel: 'Très Facile',
    hint: 'Fier félin à crinière, surnommé roi des animaux',
    validationScore: 99,
    tags: ['animal', 'savane', 'roi', 'criniere'],
    images: [
      'https://images.unsplash.com/photo-1534188753412-3e26d0d618d6?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1614027164847-1b28cfe1df60?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=600&q=80',
    ],
  },
  {
    id: 'lvl_1_stg_8',
    level: 1,
    stageNumber: 8,
    word: 'CAFE',
    category: 'Boisson & Pause',
    difficultyLabel: 'Très Facile',
    hint: 'Boisson chaude torréfiée du matin',
    validationScore: 99,
    tags: ['boisson', 'matin', 'grains'],
    images: [
      'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=600&q=80',
    ],
  },
  {
    id: 'lvl_1_stg_9',
    level: 1,
    stageNumber: 9,
    word: 'MAIN',
    category: 'Corps Humain',
    difficultyLabel: 'Très Facile',
    hint: 'Membre supérieur doté de cinq doigts',
    validationScore: 99,
    tags: ['corps', 'doigts', 'toucher'],
    images: [
      'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1516542076529-1ea3854896f2?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=600&q=80',
    ],
  },
  {
    id: 'lvl_1_stg_10',
    level: 1,
    stageNumber: 10,
    word: 'LUNE',
    category: 'Espace & Nuit',
    difficultyLabel: 'Très Facile',
    hint: 'Satellite naturel de la Terre illuminant la nuit',
    validationScore: 99,
    tags: ['nuit', 'espace', 'satellite'],
    images: [
      'https://images.unsplash.com/photo-1532693322450-2cb5c511067d?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1522030299830-16b8d3d049fe?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80',
    ],
  },
];

export function build1000StagesFrontend(): FourPicsPuzzleItem[] {
  const catalog: FourPicsPuzzleItem[] = [];

  for (let lvl = 1; lvl <= 10; lvl++) {
    const levelDef = LEVEL_DEFINITIONS.find((d) => d.level === lvl) || LEVEL_DEFINITIONS[0];
    const dedicatedForLevel = DEDICATED_STAGES.filter((s) => s.level === lvl);
    const pool = dedicatedForLevel.length > 0 ? dedicatedForLevel : DEDICATED_STAGES;

    for (let stg = 1; stg <= 100; stg++) {
      let template = pool.find((s) => s.stageNumber === stg);
      if (!template) {
        template = pool[(stg - 1) % pool.length];
      }

      catalog.push({
        id: `lvl_${lvl}_stg_${stg}`,
        level: lvl,
        stageNumber: stg,
        word: template.word,
        category: template.category,
        difficultyLabel: levelDef.name,
        hint: template.hint,
        validationScore: template.validationScore,
        tags: [...template.tags, `niveau_${lvl}`],
        images: [...template.images] as [string, string, string, string],
      });
    }
  }

  return catalog;
}

export const FOUR_PICS_PUZZLES = build1000StagesFrontend();
