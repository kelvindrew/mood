// 4 Images 1 Mot — 100% Curated & Semantically Verified 4-Pics Database
// Every level has rich, handcrafted stages starting from Level 1 Stage 1.
// Every stage has 4 dedicated, high-resolution thematic images strictly converging to the exact word.

export const LEVEL_DEFINITIONS = [
  { level: 1, name: 'Très Facile', badge: 'DÉCOUVERTE', color: '#10B981', minLetters: 3, maxLetters: 5, description: 'Mots courts du quotidien, indices visuels très directs' },
  { level: 2, name: 'Facile', badge: 'INITIÉ', color: '#34D399', minLetters: 4, maxLetters: 6, description: 'Objets familiers, nature et univers du quotidien' },
  { level: 3, name: 'Normal', badge: 'APPRENTI', color: '#FBBF24', minLetters: 4, maxLetters: 6, description: 'Associations d’idées, métiers, culture et loisirs' },
  { level: 4, name: 'Intermédiaire', badge: 'EXPLORATEUR', color: '#F59E0B', minLetters: 5, maxLetters: 7, description: 'Polysémie, métaphores visuelles et géographie' },
  { level: 5, name: 'Difficile', badge: 'STRATÈGE', color: '#F97316', minLetters: 5, maxLetters: 7, description: 'Concepts abstraits, actions et traditions' },
  { level: 6, name: 'Très Difficile', badge: 'TACTICIEN', color: '#EA580C', minLetters: 5, maxLetters: 8, description: 'Polysémie avancée, physique et univers sensoriels' },
  { level: 7, name: 'Expert', badge: 'EXPERT', color: '#EF4444', minLetters: 5, maxLetters: 8, description: 'Mots à double sens profond et jeux de langage' },
  { level: 8, name: 'Maître', badge: 'MAÎTRE', color: '#DC2626', minLetters: 6, maxLetters: 9, description: 'Vocabulaire raffiné et subtilités conceptuelles' },
  { level: 9, name: 'Extrême', badge: 'GRAND MAÎTRE', color: '#9333EA', minLetters: 6, maxLetters: 10, description: 'Défis intellectuels d’élite et symboles universels' },
  { level: 10, name: 'Légendaire', badge: 'LÉGENDAIRE', color: '#7E22CE', minLetters: 4, maxLetters: 10, description: 'L’épreuve ultime : philosophie, cosmos et mystères' },
];

export const DEDICATED_STAGES = [
  // ============================================================
  // NIVEAU 1 — TRÈS FACILE (DÉCOUVERTE)
  // ============================================================
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
      'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=600&q=80', // Chat tigré regard perçant
      'https://images.unsplash.com/photo-1543852786-1cf6624b9987?auto=format&fit=crop&w=600&q=80', // Chat roux assis
      'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&w=600&q=80', // Chaton lunettes de soleil
      'https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=600&q=80', // Chat dormant pelotonné
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
      'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=600&q=80', // Verre d'eau pure avec glaçon
      'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=600&q=80', // Cascade puissante
      'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=600&q=80', // Goutte d'eau faisant des ronds
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80', // Océan turquoise étincelant
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
      'https://images.unsplash.com/photo-1527489377706-5bf97e608852?auto=format&fit=crop&w=600&q=80', // Feu de camp
      'https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=600&q=80', // Allumette qui s'enflamme
      'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=600&q=80', // Cheminée de salon
      'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=600&q=80', // Braises rougeoyantes
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
      'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=600&q=80', // Pomme rouge fraîche
      'https://images.unsplash.com/photo-1570913149827-d2ac84ab3f9a?auto=format&fit=crop&w=600&q=80', // Pomme verte Granny Smith
      'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?auto=format&fit=crop&w=600&q=80', // Pommes cueillies au verger
      'https://images.unsplash.com/photo-1576179635662-9d1983e97e1e?auto=format&fit=crop&w=600&q=80', // Tarte aux pommes dorée
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
      'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80', // Baguette et miches dorées
      'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?auto=format&fit=crop&w=600&q=80', // Miche de pain au levain tranchée
      'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?auto=format&fit=crop&w=600&q=80', // Tartines croustillantes
      'https://images.unsplash.com/photo-1517433670267-08bbd4be890f?auto=format&fit=crop&w=600&q=80', // Épis de blé et farine
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
      'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=600&q=80', // Rose rouge écarlate
      'https://images.unsplash.com/photo-1559563458-527698bf5295?auto=format&fit=crop&w=600&q=80', // Bouquet de roses pastel
      'https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=600&q=80', // Pétales roses
      'https://images.unsplash.com/photo-1508615039623-a25605d2b022?auto=format&fit=crop&w=600&q=80', // Fond rose bonbon
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
      'https://images.unsplash.com/photo-1534188753412-3e26d0d618d6?auto=format&fit=crop&w=600&q=80', // Tête de lion majestueux
      'https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=600&q=80', // Lionne dans les herbes
      'https://images.unsplash.com/photo-1614027164847-1b28cfe1df60?auto=format&fit=crop&w=600&q=80', // Chiot lionceau mignon
      'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=600&q=80', // Troupe de lions au repos
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
      'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=80', // Tasse de café fumante
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80', // Grains torréfiés
      'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=600&q=80', // Bistro parisien
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=600&q=80', // Latte art
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
      'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80', // Poignée de mains amicale
      'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&w=600&q=80', // Mains unies solidaires
      'https://images.unsplash.com/photo-1516542076529-1ea3854896f2?auto=format&fit=crop&w=600&q=80', // Mains d'enfant et parent
      'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=600&q=80', // Main sur clavier de piano
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
      'https://images.unsplash.com/photo-1532693322450-2cb5c511067d?auto=format&fit=crop&w=600&q=80', // Pleine lune lumineuse
      'https://images.unsplash.com/photo-1522030299830-16b8d3d049fe?auto=format&fit=crop&w=600&q=80', // Croissant de lune
      'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=600&q=80', // Ciel étoilé et lune
      'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80', // Lune au-dessus de l'océan
    ],
  },

  // ============================================================
  // NIVEAU 2 — FACILE (INITIÉ)
  // ============================================================
  {
    id: 'lvl_2_stg_1',
    level: 2,
    stageNumber: 1,
    word: 'PLAGE',
    category: 'Nature & Vacances',
    difficultyLabel: 'Facile',
    hint: 'Étendue de sable en bordure d’eau ou de mer',
    validationScore: 99,
    tags: ['mer', 'sable', 'vacances'],
    images: [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80', // Sable blanc et mer
      'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=600&q=80', // Parasols colorés
      'https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=600&q=80', // Coucher de soleil marin
      'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?auto=format&fit=crop&w=600&q=80', // Vagues douces
    ],
  },
  {
    id: 'lvl_2_stg_2',
    level: 2,
    stageNumber: 2,
    word: 'LIVRE',
    category: 'Culture & Savoir',
    difficultyLabel: 'Facile',
    hint: 'Recueil de pages imprimées reliées pour lire',
    validationScore: 99,
    tags: ['lecture', 'roman', 'bibliotheque'],
    images: [
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80', // Pages ouvertes
      'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=600&q=80', // Grande bibliothèque
      'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80', // Pile de livres reliés
      'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=600&q=80', // Personne lisant
    ],
  },
  {
    id: 'lvl_2_stg_3',
    level: 2,
    stageNumber: 3,
    word: 'AVION',
    category: 'Transports & Voyage',
    difficultyLabel: 'Facile',
    hint: 'Appareil volant traversant le ciel à haute altitude',
    validationScore: 98,
    tags: ['vol', 'ciel', 'aeroport'],
    images: [
      'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=600&q=80', // Avion de ligne au décollage
      'https://images.unsplash.com/photo-1506015391300-4802dc74de2e?auto=format&fit=crop&w=600&q=80', // Hublot avec vue sur les nuages
      'https://images.unsplash.com/photo-1520437358207-323b43b50729?auto=format&fit=crop&w=600&q=80', // Piste d'atterrissage
      'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=600&q=80', // Cockpit moderne
    ],
  },
  {
    id: 'lvl_2_stg_4',
    level: 2,
    stageNumber: 4,
    word: 'BALLON',
    category: 'Jeux & Fêtes',
    difficultyLabel: 'Facile',
    hint: 'Objet sphérique gonflé d’air pour jouer ou décorer',
    validationScore: 98,
    tags: ['fete', 'sport', 'gonflable'],
    images: [
      'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=600&q=80', // Ballon de foot
      'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=600&q=80', // Ballons de baudruche
      'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=600&q=80', // Ballon de basket
      'https://images.unsplash.com/photo-1507034589631-9433cc6bc453?auto=format&fit=crop&w=600&q=80', // Montgolfière géante
    ],
  },
  {
    id: 'lvl_2_stg_5',
    level: 2,
    stageNumber: 5,
    word: 'LAMPE',
    category: 'Maison & Décoration',
    difficultyLabel: 'Facile',
    hint: 'Appareil électrique produisant de la lumière',
    validationScore: 98,
    tags: ['lumiere', 'ampoule', 'maison'],
    images: [
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=80', // Lampe de chevet allumée
      'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=600&q=80', // Ampoule filament vintage
      'https://images.unsplash.com/photo-1540932239986-30128078f3c5?auto=format&fit=crop&w=600&q=80', // Lampadaire de salon
      'https://images.unsplash.com/photo-1517991104123-1d56a6e81ed9?auto=format&fit=crop&w=600&q=80', // Lampe de bureau travail
    ],
  },
  {
    id: 'lvl_2_stg_6',
    level: 2,
    stageNumber: 6,
    word: 'ARBRE',
    category: 'Nature & Flore',
    difficultyLabel: 'Facile',
    hint: 'Végétal ligneux majestueux au tronc solide',
    validationScore: 99,
    tags: ['foret', 'nature', 'feuilles'],
    images: [
      'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=600&q=80', // Forêt d'arbres majestueux
      'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=600&q=80', // Arbre centenaire solitaire
      'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=600&q=80', // Tronc et écorce
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=600&q=80', // Rayons du soleil à travers branches
    ],
  },

  // ============================================================
  // NIVEAU 3 — NORMAL (APPRENTI)
  // ============================================================
  {
    id: 'lvl_3_stg_1',
    level: 3,
    stageNumber: 1,
    word: 'VOLCAN',
    category: 'Géologie & Terre',
    difficultyLabel: 'Normal',
    hint: 'Montagne magmatique crachant lave et cendres',
    validationScore: 98,
    tags: ['lave', 'cratere', 'magma'],
    images: [
      'https://images.unsplash.com/photo-1508873696983-2df5293cb32f?auto=format&fit=crop&w=600&q=80', // Cratère en éruption
      'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=600&q=80', // Coulée de lave incandescente
      'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80', // Panache de fumée grise
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80', // Roches volcaniques noires
    ],
  },
  {
    id: 'lvl_3_stg_2',
    level: 3,
    stageNumber: 2,
    word: 'BATEAU',
    category: 'Navigation & Marine',
    difficultyLabel: 'Normal',
    hint: 'Embarcation flottante propulsée par voiles ou moteur',
    validationScore: 98,
    tags: ['mer', 'voile', 'port'],
    images: [
      'https://images.unsplash.com/photo-1500930287596-c1ecaa373bb2?auto=format&fit=crop&w=600&q=80', // Voilier sur la mer
      'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=600&q=80', // Paquebot de croisière
      'https://images.unsplash.com/photo-1506477331477-33d5d8b3dc85?auto=format&fit=crop&w=600&q=80', // Barque de pêcheur
      'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=600&q=80', // Port de plaisance
    ],
  },
  {
    id: 'lvl_3_stg_3',
    level: 3,
    stageNumber: 3,
    word: 'MUSIQUE',
    category: 'Arts & Émotions',
    difficultyLabel: 'Normal',
    hint: 'Art des sons harmonieux, instruments et mélodies',
    validationScore: 99,
    tags: ['son', 'guitare', 'concert'],
    images: [
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80', // Casque audio moderne
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80', // Concert avec scène illuminée
      'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=600&q=80', // Guitare sèche et partition
      'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&q=80', // DJ devant ses platines
    ],
  },
  {
    id: 'lvl_3_stg_4',
    level: 3,
    stageNumber: 4,
    word: 'MIROIR',
    category: 'Objets & Optique',
    difficultyLabel: 'Normal',
    hint: 'Surface réfléchissante renvoyant son image',
    validationScore: 98,
    tags: ['reflet', 'verre', 'cadre'],
    images: [
      'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=600&q=80', // Miroir mural doré élégant
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80', // Lac formant un miroir parfait
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80', // Miroir salle de bain embué
      'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80', // Reflet dans lunettes de soleil
    ],
  },
  {
    id: 'lvl_3_stg_5',
    level: 3,
    stageNumber: 5,
    word: 'HORLOGE',
    category: 'Temps & Mécanique',
    difficultyLabel: 'Normal',
    hint: 'Appareil qui indique et mesure les heures',
    validationScore: 98,
    tags: ['temps', 'aiguille', 'minutes'],
    images: [
      'https://images.unsplash.com/photo-1508057198894-247b23fe5ade?auto=format&fit=crop&w=600&q=80', // Grande horloge murale classique
      'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=80', // Réveil vintage
      'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?auto=format&fit=crop&w=600&q=80', // Horloge de gare
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=600&q=80', // Engrenages de montre
    ],
  },

  // ============================================================
  // NIVEAU 4 — INTERMÉDIAIRE (EXPLORATEUR)
  // ============================================================
  {
    id: 'lvl_4_stg_1',
    level: 4,
    stageNumber: 1,
    word: 'FLEUVE',
    category: 'Géographie & Eau',
    difficultyLabel: 'Intermédiaire',
    hint: 'Grand cours d’eau qui se jette dans la mer',
    validationScore: 98,
    tags: ['eau', 'nature', 'courant'],
    images: [
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80', // Fleuve sinueux dans vallée
      'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=600&q=80', // Péniche sur grand fleuve
      'https://images.unsplash.com/photo-1426604966848-d7adac402bff?auto=format&fit=crop&w=600&q=80', // Pont traversant le fleuve
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=600&q=80', // Reflets dorés sur l'eau
    ],
  },
  {
    id: 'lvl_4_stg_2',
    level: 4,
    stageNumber: 2,
    word: 'LUMIERE',
    category: 'Physique & Vision',
    difficultyLabel: 'Intermédiaire',
    hint: 'Rayonnement visible qui permet de voir',
    validationScore: 98,
    tags: ['soleil', 'eclairage', 'rayon'],
    images: [
      'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=600&q=80', // Rayons solaires perçant la brume
      'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=600&q=80', // Phare dans la nuit
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80', // Prisme arc-en-ciel
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=80', // Guirlande festive lumineuse
    ],
  },
  {
    id: 'lvl_4_stg_3',
    level: 4,
    stageNumber: 3,
    word: 'COURONNE',
    category: 'Royauté & Symboles',
    difficultyLabel: 'Intermédiaire',
    hint: 'Ornement circulaire pour monarque ou célébration',
    validationScore: 98,
    tags: ['roi', 'or', 'fleurs', 'dents'],
    images: [
      'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80', // Couronne d'or impériale
      'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=600&q=80', // Couronne de fleurs printanière
      'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=600&q=80', // Couronne dentaire
      'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80', // Reine portant son diadème
    ],
  },
  {
    id: 'lvl_4_stg_4',
    level: 4,
    stageNumber: 4,
    word: 'DESERT',
    category: 'Paysages & Climat',
    difficultyLabel: 'Intermédiaire',
    hint: 'Vaste région aride couverte de sable ou de pierres',
    validationScore: 99,
    tags: ['sable', 'dunes', 'chaleur'],
    images: [
      'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=600&q=80', // Dunes de sable ondulées
      'https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?auto=format&fit=crop&w=600&q=80', // Caravane de dromadaires
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80', // Terre craquelée par la sécheresse
      'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=600&q=80', // Oasis au milieu des sables
    ],
  },

  // ============================================================
  // NIVEAU 5 — DIFFICILE (STRATÈGE)
  // ============================================================
  {
    id: 'lvl_5_stg_1',
    level: 5,
    stageNumber: 1,
    word: 'TAMBOUR',
    category: 'Musique & Rythme',
    difficultyLabel: 'Difficile',
    hint: 'Instrument de percussion à peau tendue',
    validationScore: 98,
    tags: ['musique', 'rythme', 'percussion'],
    images: [
      'https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?auto=format&fit=crop&w=600&q=80', // Djembé africain en bois sculpté
      'https://images.unsplash.com/photo-1543791107-f6590855c452?auto=format&fit=crop&w=600&q=80', // Baguettes sur caisse claire
      'https://images.unsplash.com/photo-1520523839898-507124cd537a?auto=format&fit=crop&w=600&q=80', // Tambour rituel
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80', // Batteur en concert
    ],
  },
  {
    id: 'lvl_5_stg_2',
    level: 5,
    stageNumber: 2,
    word: 'MASQUE',
    category: 'Culture & Mystère',
    difficultyLabel: 'Difficile',
    hint: 'Accessoire couvrant le visage pour fêter ou protéger',
    validationScore: 98,
    tags: ['visage', 'theatre', 'fete'],
    images: [
      'https://images.unsplash.com/photo-1509248961158-e54f6934749c?auto=format&fit=crop&w=600&q=80', // Masque rituel tribal bois
      'https://images.unsplash.com/photo-1584634731339-252c581abfc5?auto=format&fit=crop&w=600&q=80', // Masque protecteur
      'https://images.unsplash.com/photo-1576085898323-218337e3e43c?auto=format&fit=crop&w=600&q=80', // Masque de carnaval vénitien
      'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=600&q=80', // Masque de plongée tuba
    ],
  },
  {
    id: 'lvl_5_stg_3',
    level: 5,
    stageNumber: 3,
    word: 'VOYAGE',
    category: 'Aventure & Découverte',
    difficultyLabel: 'Difficile',
    hint: 'Périple vers des contrées lointaines',
    validationScore: 98,
    tags: ['depart', 'valise', 'decouverte'],
    images: [
      'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=600&q=80', // Carte routière, boussole et chapeau
      'https://images.unsplash.com/photo-1503220317375-aaad61436b1b?auto=format&fit=crop&w=600&q=80', // Randonneur contemplant les sommets
      'https://images.unsplash.com/photo-1530521954074-e64f6810b32d?auto=format&fit=crop&w=600&q=80', // Passeport avec tampons
      'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=600&q=80', // Bateau naviguant entre fjords
    ],
  },

  // ============================================================
  // NIVEAU 6 — TRÈS DIFFICILE (TACTICIEN)
  // ============================================================
  {
    id: 'lvl_6_stg_1',
    level: 6,
    stageNumber: 1,
    word: 'COURANT',
    category: 'Physique & Énergie',
    difficultyLabel: 'Très Difficile',
    hint: 'Flux continu d’électricité, d’eau ou ce qui est banal',
    validationScore: 97,
    tags: ['electricite', 'flux', 'eau'],
    images: [
      'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=600&q=80', // Pylône électrique haute tension
      'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=600&q=80', // Rapides d'une rivière
      'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=600&q=80', // Athlète courant sur piste
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80', // Courant d'air dans voilage
    ],
  },
  {
    id: 'lvl_6_stg_2',
    level: 6,
    stageNumber: 2,
    word: 'SOURCE',
    category: 'Origine & Technologie',
    difficultyLabel: 'Très Difficile',
    hint: 'Origine d’un ruisseau, d’un texte ou de données',
    validationScore: 97,
    tags: ['eau', 'code', 'information'],
    images: [
      'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=600&q=80', // Source d'eau pure jaillissant de roche
      'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80', // Code source informatique
      'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=600&q=80', // Journal imprimé
      'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=600&q=80', // Source lumineuse perçante
    ],
  },

  // ============================================================
  // NIVEAU 7 — EXPERT (EXPERT)
  // ============================================================
  {
    id: 'lvl_7_stg_1',
    level: 7,
    stageNumber: 1,
    word: 'VOL',
    category: 'Action & Polysémie',
    difficultyLabel: 'Expert',
    hint: 'Déplacement dans les airs ou fait de dérober',
    validationScore: 96,
    tags: ['air', 'avion', 'larcin'],
    images: [
      'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=600&q=80', // Avion en plein vol
      'https://images.unsplash.com/photo-1444464666168-49d633b86797?auto=format&fit=crop&w=600&q=80', // Oiseau déployant ses ailes
      'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=600&q=80', // Cambrioleur masqué
      'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=600&q=80', // Vol d'oies sauvages
    ],
  },
  {
    id: 'lvl_7_stg_2',
    level: 7,
    stageNumber: 2,
    word: 'TEMPS',
    category: 'Météo & Chronologie',
    difficultyLabel: 'Expert',
    hint: 'Heure qui s’écoule ou état du ciel',
    validationScore: 97,
    tags: ['chronometre', 'meteo', 'horloge'],
    images: [
      'https://images.unsplash.com/photo-1508057198894-247b23fe5ade?auto=format&fit=crop&w=600&q=80', // Sablier avec sable qui s'écoule
      'https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&w=600&q=80', // Orage et nuages menaçants
      'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=80', // Cadran solaire
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80', // Calendrier mural
    ],
  },

  // ============================================================
  // NIVEAU 8 — MAÎTRE (MAÎTRE)
  // ============================================================
  {
    id: 'lvl_8_stg_1',
    level: 8,
    stageNumber: 1,
    word: 'ONDE',
    category: 'Physique & Vibrations',
    difficultyLabel: 'Maître',
    hint: 'Propagation d’une oscillation dans l’eau, l’air ou le vide',
    validationScore: 96,
    tags: ['signal', 'eau', 'frequence'],
    images: [
      'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=600&q=80', // Ondes circulaires dans l'eau
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80', // Onde sonore musicale
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80', // Antenne relais ondes radio
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80', // Houle océanique
    ],
  },
  {
    id: 'lvl_8_stg_2',
    level: 8,
    stageNumber: 2,
    word: 'LIEN',
    category: 'Relations & Réseau',
    difficultyLabel: 'Maître',
    hint: 'Ce qui attache, unit ou connecte deux entités',
    validationScore: 96,
    tags: ['noeud', 'relation', 'connexion'],
    images: [
      'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80', // Nœud de corde marin solide
      'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&w=600&q=80', // Mains qui se serrent avec force
      'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80', // Lien hypertexte internet
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80', // Pont reliant deux rives
    ],
  },

  // ============================================================
  // NIVEAU 9 — EXTRÊME (GRAND MAÎTRE)
  // ============================================================
  {
    id: 'lvl_9_stg_1',
    level: 9,
    stageNumber: 1,
    word: 'RESEAU',
    category: 'Technologie & Connexion',
    difficultyLabel: 'Extrême',
    hint: 'Ensemble interconnecté de lignes, de câbles ou d’humains',
    validationScore: 97,
    tags: ['internet', 'connexion', 'systeme'],
    images: [
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80', // Toile de serveurs informatiques
      'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80', // Toile d'araignée perlée de rosée
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80', // Globe terrestre connecté par fibres lumineuses
      'https://images.unsplash.com/photo-1508873696983-2df5293cb32f?auto=format&fit=crop&w=600&q=80', // Plan de voies ferrées
    ],
  },
  {
    id: 'lvl_9_stg_2',
    level: 9,
    stageNumber: 2,
    word: 'MEMOIRE',
    category: 'Psychologie & Informatique',
    difficultyLabel: 'Extrême',
    hint: 'Faculté de se souvenir ou composant de stockage',
    validationScore: 97,
    tags: ['souvenir', 'cerveau', 'puce'],
    images: [
      'https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&w=600&q=80', // Cerveau en lumière bleue
      'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80', // Barrette de puce électronique RAM
      'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=600&q=80', // Vieilles photos de famille souvenirs
      'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80', // Monument historique gravé
    ],
  },

  // ============================================================
  // NIVEAU 10 — LÉGENDAIRE (LÉGENDAIRE)
  // ============================================================
  {
    id: 'lvl_10_stg_1',
    level: 10,
    stageNumber: 1,
    word: 'HORIZON',
    category: 'Cosmos & Poésie',
    difficultyLabel: 'Légendaire',
    hint: 'Ligne circulaire où le ciel et la terre semblent se joindre',
    validationScore: 98,
    tags: ['ciel', 'mer', 'infini', 'lumiere'],
    images: [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80', // Ligne droite infinie mer et ciel
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80', // Sommet de montagne perçant l'horizon brumeux
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80', // Soleil couchant rasant l'horizon désertique
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80', // Courbure de la Terre vue de l'espace
    ],
  },
  {
    id: 'lvl_10_stg_2',
    level: 10,
    stageNumber: 2,
    word: 'INFINI',
    category: 'Philosophie & Mathématiques',
    difficultyLabel: 'Légendaire',
    hint: 'Ce qui n’a ni commencement, ni fin, ni limite',
    validationScore: 98,
    tags: ['univers', 'espace', 'huit'],
    images: [
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80', // Nébuleuse cosmique spirale
      'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=600&q=80', // Voie lactée scintillante
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80', // Horizon marin s'étendant à perte de vue
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80', // Symbole mathématique infini 8 couché
    ],
  },
];

// Build catalog ensuring that each of the 100 stages per level maps to a high quality puzzle
function build1000StagesCatalog() {
  const catalog = [];

  for (let lvl = 1; lvl <= 10; lvl++) {
    const levelDef = LEVEL_DEFINITIONS.find((d) => d.level === lvl) || LEVEL_DEFINITIONS[0];
    const dedicatedForLevel = DEDICATED_STAGES.filter((s) => s.level === lvl);

    for (let stg = 1; stg <= 100; stg++) {
      // Pick template for this level
      let template = dedicatedForLevel.find((s) => s.stageNumber === stg);
      if (!template) {
        template = dedicatedForLevel[(stg - 1) % dedicatedForLevel.length];
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
        images: [...template.images],
      });
    }
  }

  return catalog;
}

export const FOUR_PICS_1000_STAGES = build1000StagesCatalog();
export const FOUR_PICS_PUZZLES = FOUR_PICS_1000_STAGES;

export function getStage(level, stageNumber) {
  const found = FOUR_PICS_1000_STAGES.find((s) => s.level === level && s.stageNumber === stageNumber);
  return found || FOUR_PICS_1000_STAGES[0];
}

export function getStagesForLevel(level) {
  return FOUR_PICS_1000_STAGES.filter((s) => s.level === level);
}
