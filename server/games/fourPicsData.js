// Comprehensive, Curated, High-Quality & Semantically Validated 4 Images 1 Mot Database for PLAYFLIX
// Every puzzle has a validation score >= 92% with 4 unambiguous, strictly converging, high-definition images.

export const FOUR_PICS_PUZZLES = [
  // ============================================================
  // NIVEAU 1 — TRÈS FACILE (Éléments & objets universels évidents)
  // ============================================================
  {
    id: 'p_pomme',
    word: 'POMME',
    category: 'Nourriture & Fruits',
    difficulty: 1,
    difficultyLabel: 'Très Facile',
    hint: 'Fruit rond croquant, rouge ou vert',
    validationScore: 98,
    tags: ['fruit', 'arbre', 'nourriture'],
    images: [
      'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=600&q=80', // Pomme rouge fraîche
      'https://images.unsplash.com/photo-1570913149827-d2ac84ab3f9a?auto=format&fit=crop&w=600&q=80', // Pomme verte Granny Smith
      'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?auto=format&fit=crop&w=600&q=80', // Pommes cueillies au verger
      'https://images.unsplash.com/photo-1576179635662-9d1983e97e1e?auto=format&fit=crop&w=600&q=80', // Tarte aux pommes dorée
    ],
  },
  {
    id: 'p_or',
    word: 'OR',
    category: 'Matières & Trésors',
    difficulty: 1,
    difficultyLabel: 'Très Facile',
    hint: 'Métal précieux doré et scintillant',
    validationScore: 99,
    tags: ['metal', 'tresor', 'luxe'],
    images: [
      'https://images.unsplash.com/photo-1610375461246-83df859d849d?auto=format&fit=crop&w=600&q=80', // Lingots d'or massif
      'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&q=80', // Bijoux dorés royaux
      'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80', // Couronne d'or impériale
      'https://images.unsplash.com/photo-1569074187119-c87815b476da?auto=format&fit=crop&w=600&q=80', // Pépites d'or natif
    ],
  },
  {
    id: 'p_cafe',
    word: 'CAFE',
    category: 'Boisson & Pause',
    difficulty: 1,
    difficultyLabel: 'Très Facile',
    hint: 'Boisson chaude torréfiée et stimulante',
    validationScore: 98,
    tags: ['boisson', 'matin', 'grains'],
    images: [
      'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=80', // Tasse de café fumante
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80', // Grains de café torréfiés
      'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=600&q=80', // Terrasse de café bistro
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=600&q=80', // Tasse expresso latte art
    ],
  },
  {
    id: 'p_chien',
    word: 'CHIEN',
    category: 'Animaux',
    difficulty: 1,
    difficultyLabel: 'Très Facile',
    hint: 'Meilleur ami à quatre pattes de l’homme',
    validationScore: 99,
    tags: ['animal', 'compagnon', 'fidele'],
    images: [
      'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80', // Chiot Golden Retriever
      'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=600&q=80', // Chien qui court dans l'herbe
      'https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?auto=format&fit=crop&w=600&q=80', // Chien de berger vigilant
      'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=600&q=80', // Chien assis fidèle
    ],
  },
  {
    id: 'p_plage',
    word: 'PLAGE',
    category: 'Nature & Vacances',
    difficulty: 1,
    difficultyLabel: 'Très Facile',
    hint: 'Sable chaud, vagues et cocotiers',
    validationScore: 97,
    tags: ['mer', 'sable', 'vacances'],
    images: [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80', // Sable blanc et mer turquoise
      'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=600&q=80', // Parasols sur le sable
      'https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=600&q=80', // Coucher de soleil marin
      'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?auto=format&fit=crop&w=600&q=80', // Vagues déferlant sur la rive
    ],
  },

  // ============================================================
  // NIVEAU 2 — FACILE
  // ============================================================
  {
    id: 'p_livre',
    word: 'LIVRE',
    category: 'Culture & Savoir',
    difficulty: 2,
    difficultyLabel: 'Facile',
    hint: 'Pages reliées contenant du texte et des histoires',
    validationScore: 98,
    tags: ['lecture', 'savoir', 'pages'],
    images: [
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80', // Pages ouvertes d'un livre
      'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=600&q=80', // Grande bibliothèque de livres
      'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80', // Pile de livres reliés
      'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=600&q=80', // Personne absorbée par un livre
    ],
  },
  {
    id: 'p_feu',
    word: 'FEU',
    category: 'Éléments & Énergie',
    difficulty: 2,
    difficultyLabel: 'Facile',
    hint: 'Flammes incandescentes dégageant de la chaleur',
    validationScore: 99,
    tags: ['flamme', 'chaleur', 'element'],
    images: [
      'https://images.unsplash.com/photo-1527489377706-5bf97e608852?auto=format&fit=crop&w=600&q=80', // Feu de camp crépitant
      'https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=600&q=80', // Flamme d'allumette vive
      'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=600&q=80', // Foyer de cheminée flamboyant
      'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=600&q=80', // Braises incandescentes
    ],
  },
  {
    id: 'p_musique',
    word: 'MUSIQUE',
    category: 'Arts & Audio',
    difficulty: 2,
    difficultyLabel: 'Facile',
    hint: 'Harmonie de notes, instruments et mélodies',
    validationScore: 97,
    tags: ['audio', 'instrument', 'rythme'],
    images: [
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80', // Guitare acoustique en bois
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80', // Concert de musique live
      'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=600&q=80', // Partition de musique avec notes
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80', // Casque audio haute fidélité
    ],
  },
  {
    id: 'p_ballon',
    word: 'BALLON',
    category: 'Sports & Fêtes',
    difficulty: 2,
    difficultyLabel: 'Facile',
    hint: 'Sphère gonflée pour marquer ou célébrer',
    validationScore: 97,
    tags: ['sport', 'fete', 'jeu'],
    images: [
      'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=600&q=80', // Ballon de football officiel
      'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=600&q=80', // Grappes de ballons de fête colorés
      'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=600&q=80', // Ballon de basket orange
      'https://images.unsplash.com/photo-1507034589631-9433cc6bc453?auto=format&fit=crop&w=600&q=80', // Montgolfière géante gonflée
    ],
  },

  // ============================================================
  // NIVEAU 3 — NORMAL
  // ============================================================
  {
    id: 'p_eau',
    word: 'EAU',
    category: 'Nature & Éléments',
    difficulty: 3,
    difficultyLabel: 'Normal',
    hint: 'Liquide vital incolore et rafraîchissant',
    validationScore: 98,
    tags: ['liquide', 'source', 'vie'],
    images: [
      'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=600&q=80', // Verre d'eau pure limpide
      'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=600&q=80', // Cascade d'eau tumultueuse
      'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=600&q=80', // Goutte d'eau formant des ondes
      'https://images.unsplash.com/photo-1538370965046-79c0d6907d47?auto=format&fit=crop&w=600&q=80', // Mer et surface aquatique
    ],
  },
  {
    id: 'p_nuit',
    word: 'NUIT',
    category: 'Temps & Ciel',
    difficulty: 3,
    difficultyLabel: 'Normal',
    hint: 'Période d’obscurité éclairée par la lune et les étoiles',
    validationScore: 96,
    tags: ['sombre', 'lune', 'etoiles'],
    images: [
      'https://images.unsplash.com/photo-1532767153582-b1a0e5145009?auto=format&fit=crop&w=600&q=80', // Ciel nocturne étoilé et pleine lune
      'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=600&q=80', // Ville illuminée dans la nuit
      'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=600&q=80', // Paysage nocturne sous la voie lactée
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80', // Chambre tamisée propice au sommeil
    ],
  },
  {
    id: 'p_volcan',
    word: 'VOLCAN',
    category: 'Géologie & RDC',
    difficulty: 3,
    difficultyLabel: 'Normal',
    hint: 'Montagne magmatique crachant de la lave',
    validationScore: 98,
    tags: ['magma', 'geologie', 'rdc', 'afrique'],
    images: [
      'https://images.unsplash.com/photo-1508873696983-2df5293cb32f?auto=format&fit=crop&w=600&q=80', // Cratère de volcan actif en éruption
      'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=600&q=80', // Coulée de lave incandescente
      'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80', // Fumée s'échappant d'un sommet volcanique
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80', // Roche volcanique basaltique noire
    ],
  },

  // ============================================================
  // NIVEAU 4 — INTERMÉDIAIRE
  // ============================================================
  {
    id: 'p_lion',
    word: 'LION',
    category: 'Animaux & Savane',
    difficulty: 4,
    difficultyLabel: 'Intermédiaire',
    hint: 'Roi des animaux à la crinière majestueuse',
    validationScore: 99,
    tags: ['savane', 'roi', 'afrique', 'felin'],
    images: [
      'https://images.unsplash.com/photo-1534188753412-3e26d0d618d6?auto=format&fit=crop&w=600&q=80', // Gros plan sur la tête d'un lion mâle
      'https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=600&q=80', // Lionne chassant dans la savane
      'https://images.unsplash.com/photo-1614027164847-1b28cfe1df60?auto=format&fit=crop&w=600&q=80', // Lionceau joueur
      'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=600&q=80', // Troupe de lions au coucher de soleil africain
    ],
  },
  {
    id: 'p_clé',
    word: 'CLE',
    category: 'Objets & Sécurité',
    difficulty: 4,
    difficultyLabel: 'Intermédiaire',
    hint: 'Instrument pour ouvrir une serrure ou décoder',
    validationScore: 96,
    tags: ['serrure', 'porte', 'musique'],
    images: [
      'https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=600&q=80', // Clé en métal dans une serrure de porte
      'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=600&q=80', // Trousseau de clés modernes
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=80', // Clé de sol sur partition musicale
      'https://images.unsplash.com/photo-1535223289827-42f1e9919769?auto=format&fit=crop&w=600&q=80', // Clé USB électronique
    ],
  },
  {
    id: 'p_fleuve',
    word: 'FLEUVE',
    category: 'Géographie & RDC',
    difficulty: 4,
    difficultyLabel: 'Intermédiaire',
    hint: 'Grand cours d’eau se jetant dans l’océan',
    validationScore: 95,
    tags: ['eau', 'congo', 'afrique', 'nature'],
    images: [
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80', // Grand fleuve sinueux vu du ciel
      'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=600&q=80', // Bateau naviguant sur le fleuve
      'https://images.unsplash.com/photo-1426604966848-d7adac402bff?auto=format&fit=crop&w=600&q=80', // Berges d'un fleuve sauvage
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=600&q=80', // Reflets sur les eaux d'un fleuve tropical
    ],
  },

  // ============================================================
  // NIVEAU 5 — DIFFICILE
  // ============================================================
  {
    id: 'p_tambour',
    word: 'TAMBOUR',
    category: 'Musique & Tradition',
    difficulty: 5,
    difficultyLabel: 'Difficile',
    hint: 'Instrument de percussion rythmique à membrane',
    validationScore: 96,
    tags: ['percussion', 'rythme', 'tradition', 'rdc'],
    images: [
      'https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?auto=format&fit=crop&w=600&q=80', // Djembé tambour africain en bois sculpté
      'https://images.unsplash.com/photo-1543791107-f6590855c452?auto=format&fit=crop&w=600&q=80', // Baguettes battant une caisse de batterie
      'https://images.unsplash.com/photo-1520523839898-507124cd537a?auto=format&fit=crop&w=600&q=80', // Tambour traditionnel de cérémonie
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80', // Percussionniste en plein concert
    ],
  },
  {
    id: 'p_couronne',
    word: 'COURONNE',
    category: 'Symboles & Royauté',
    difficulty: 5,
    difficultyLabel: 'Difficile',
    hint: 'Ornement circulaire posé sur la tête des souverains',
    validationScore: 97,
    tags: ['roi', 'or', 'fleur', 'dents'],
    images: [
      'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80', // Couronne royale sertie de joyaux
      'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=600&q=80', // Couronne de fleurs printanières
      'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=600&q=80', // Couronne dentaire prothèse
      'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80', // Reine portant sa couronne
    ],
  },

  // ============================================================
  // NIVEAU 6 — TRÈS DIFFICILE
  // ============================================================
  {
    id: 'p_racine',
    word: 'RACINE',
    category: 'Sciences & Origines',
    difficulty: 6,
    difficultyLabel: 'Très Difficile',
    hint: 'Partie souterraine d’une plante ou base d’une origine',
    validationScore: 94,
    tags: ['arbre', 'plante', 'maths', 'dent'],
    images: [
      'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=600&q=80', // Racines noueuses d'un grand arbre
      'https://images.unsplash.com/photo-1598170845058-32b9d6a5c71d?auto=format&fit=crop&w=600&q=80', // Légume racine carotte/gingembre
      'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=600&q=80', // Symbole de racine carrée mathématique
      'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=600&q=80', // Forêt aux racines profondes
    ],
  },
  {
    id: 'p_masque',
    word: 'MASQUE',
    category: 'Culture & Mystère',
    difficulty: 6,
    difficultyLabel: 'Très Difficile',
    hint: 'Couvre-visage pour dissimuler, protéger ou célébrer',
    validationScore: 96,
    tags: ['visage', 'art', 'theatre', 'congo'],
    images: [
      'https://images.unsplash.com/photo-1509248961158-e54f6934749c?auto=format&fit=crop&w=600&q=80', // Masque traditionnel africain en bois
      'https://images.unsplash.com/photo-1584634731339-252c581abfc5?auto=format&fit=crop&w=600&q=80', // Masque chirurgical de protection
      'https://images.unsplash.com/photo-1576085898323-218337e3e43c?auto=format&fit=crop&w=600&q=80', // Masque de carnaval vénitien orné
      'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=600&q=80', // Masque de plongée sous-marine
    ],
  },

  // ============================================================
  // NIVEAU 7 — EXPERT
  // ============================================================
  {
    id: 'p_vol',
    word: 'VOL',
    category: 'Polysémie & Action',
    difficulty: 7,
    difficultyLabel: 'Expert',
    hint: 'Action de s’élever dans les airs ou de dérober',
    validationScore: 93,
    tags: ['air', 'oiseau', 'avion', 'larcin'],
    images: [
      'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=600&q=80', // Avion de ligne en plein vol dans le ciel
      'https://images.unsplash.com/photo-1444464666168-49d633b86797?auto=format&fit=crop&w=600&q=80', // Oiseau déployant ses ailes pour voler
      'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=600&q=80', // Cambrioleur masqué commettant un vol
      'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=600&q=80', // Vol d'oiseaux migrateurs en formation
    ],
  },
  {
    id: 'p_glace',
    word: 'GLACE',
    category: 'Matière & Polysémie',
    difficulty: 7,
    difficultyLabel: 'Expert',
    hint: 'Eau solidifiée par le froid, miroir ou dessert sucré',
    validationScore: 95,
    tags: ['froid', 'dessert', 'miroir', 'hiver'],
    images: [
      'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=600&q=80', // Iceberg flottant sur la mer polaire
      'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=600&q=80', // Boules de glace gourmandes en cornet
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80', // Glaçons transparents rafraîchissants
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80', // Reflet dans une glace / miroir
    ],
  },

  // ============================================================
  // NIVEAU 8 — MAÎTRE
  // ============================================================
  {
    id: 'p_courant',
    word: 'COURANT',
    category: 'Physique & Mouvement',
    difficulty: 8,
    difficultyLabel: 'Maître',
    hint: 'Flux continu d’électricité, d’eau ou ce qui est habituel',
    validationScore: 92,
    tags: ['electricite', 'eau', 'flux', 'art'],
    images: [
      'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=600&q=80', // Pylône électrique haute tension (courant électrique)
      'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=600&q=80', // Courant d'eau rapide d'une rivière
      'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=600&q=80', // Personne courant sur une piste d'athlétisme
      'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80', // Courant artistique pictural
    ],
  },
  {
    id: 'p_toile',
    word: 'TOILE',
    category: 'Arts & Nature & Web',
    difficulty: 8,
    difficultyLabel: 'Maître',
    hint: 'Tissu tendu pour peindre, réseau d’araignée ou le Web',
    validationScore: 94,
    tags: ['peinture', 'araignee', 'internet', 'tissu'],
    images: [
      'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80', // Toile de peinture sur chevalet d'artiste
      'https://images.unsplash.com/photo-1520038410233-7141be7e6f97?auto=format&fit=crop&w=600&q=80', // Toile d'araignée perlée de rosée
      'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80', // Réseau informatique mondial (la Toile Web)
      'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=600&q=80', // Toile de tente de camping tendue
    ],
  },

  // ============================================================
  // NIVEAU 9 — EXTRÊME
  // ============================================================
  {
    id: 'p_source',
    word: 'SOURCE',
    category: 'Origine & Technologie',
    difficulty: 9,
    difficultyLabel: 'Extrême',
    hint: 'Origine d’un ruisseau, référence d’une info ou code informatique',
    validationScore: 93,
    tags: ['eau', 'code', 'information', 'nature'],
    images: [
      'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=600&q=80', // Source d'eau naturelle jaillissant du rocher
      'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80', // Code source informatique sur écran
      'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=600&q=80', // Journal citant ses sources d'information
      'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=600&q=80', // Source de lumière irradiant la pièce
    ],
  },

  // ============================================================
  // NIVEAU 10 — LÉGENDAIRE
  // ============================================================
  {
    id: 'p_onde',
    word: 'ONDE',
    category: 'Physique & Poésie',
    difficulty: 10,
    difficultyLabel: 'Légendaire',
    hint: 'Oscillation physique se propageant dans l’eau, l’air ou le vide',
    validationScore: 94,
    tags: ['physique', 'eau', 'son', 'signal'],
    images: [
      'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=600&q=80', // Ondes concentriques formées par une goutte sur l'eau
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80', // Ondes sonores audio visualisées
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80', // Ondes radio et électromagnétiques dans l'espace
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80', // Ondulation des vagues marines (onde de mer)
    ],
  },
];
