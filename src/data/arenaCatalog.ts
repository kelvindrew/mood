import { ArenaGameItem } from '../types/arena';

export const ARENA_GAMES_CATALOG: ArenaGameItem[] = [
  // ====================================================================
  // A. MÉMOIRE ET OBSERVATION
  // ====================================================================
  {
    id: 'memory_poker',
    title: 'MEMORY POKER',
    tagline: 'Mémorisez la grille cachée et assemblez la main royale suprême',
    description: 'Une grille de cartes secrètes s’illumine pendant quelques secondes puis s’obscurcit. Faites appel à votre mémoire photographique pour sélectionner 5 cartes cachées et forger la combinaison de poker la plus dévastatrice.',
    category: 'memory',
    minPlayers: 1,
    maxPlayers: 6,
    durationMinutes: '15 min',
    difficulty: 'Moyen',
    badge: 'PHASE 2 • JOUABLE',
    isPlayable: true,
    accentColor: '#D4AF37', // Or
    supportedModes: ['solo', 'duel', 'party', 'tournament'],
    features: [
      'Grilles dynamiques : 3x3 (Débutant), 4x4 (Intermédiaire) ou 5x5 (Expert)',
      'Compte à rebours de mémorisation sous tension cinématographique',
      'Moteur d’arbitrage des combinaisons de poker officielles (Quinte Flush, Carré, Full, etc.)',
      'Intelligence artificielle adverse adaptative avec rétention cognitive réaliste'
    ],
    rules: [
      'Une grille de cartes à jouer est révélée brièvement sur le téléviseur.',
      'Les cartes sont ensuite retournées face cachée.',
      'Sur votre smartphone ou manette, sélectionnez jusqu’à 5 cases selon vos souvenirs.',
      'Les mains sélectionnées sont dévoilées simultanément lors du Showdown.',
      'La combinaison la plus forte remporte les Pièces du Démon de la manche.'
    ]
  },
  {
    id: 'fragments_of_memory',
    title: 'FRAGMENTS OF MEMORY',
    tagline: 'Scrutatez chaque détail de la scène avant qu’elle ne disparaisse',
    description: 'Une fresque complexe et détaillée de l’Arène s’affiche à l’écran. Objets dérobés, codes chiffrés, personnages énigmatiques et cadrans temporels. Lorsque la scène s’éteint, répondez avec une précision chirurgicale aux questions pièges.',
    category: 'memory',
    minPlayers: 1,
    maxPlayers: 8,
    durationMinutes: '10 min',
    difficulty: 'Facile',
    badge: 'PHASE 2 • JOUABLE',
    isPlayable: true,
    accentColor: '#38BDF8', // Cyan glacial
    supportedModes: ['solo', 'duel', 'party', 'tournament'],
    features: [
      'Scènes visuelles ultra-détaillées créées pour le salon',
      'Jauge de temps d’observation haute intensité',
      'Questions chrono à choix multiples en direct sur téléphones',
      'Bonus de vitesse pour les réponses fulgurantes'
    ],
    rules: [
      'La scène est projetée pendant 20 secondes sur la TV.',
      'Mémorisez les moindres détails : couleurs, chiffres, positions, vêtements.',
      'La scène s’efface et une série de 4 questions s’enchaîne.',
      'Validez votre réponse sur smartphone le plus vite possible.',
      'Le joueur totalisant le plus de points de justesse et de rapidité gagne.'
    ]
  },
  {
    id: 'montage',
    title: 'MONTAGE',
    tagline: 'Détectez le visage récurrent dans un défilé sous cadence infernale',
    description: 'Une suite rapide de portraits et d’emblèmes défile sur le grand écran. Ouvrez l’œil : dès qu’un portrait déjà aperçu plus tôt réapparaît, buzzez sans hésiter. La moindre erreur vous coûtera cher.',
    category: 'memory',
    minPlayers: 1,
    maxPlayers: 8,
    durationMinutes: '10 min',
    difficulty: 'Facile',
    badge: 'MÉMOIRE',
    isPlayable: true,
    accentColor: '#A855F7',
    supportedModes: ['solo', 'party', 'tournament'],
    features: [
      'Flux continu d’images haute résolution',
      'Système de buzzer réactif sur smartphone',
      'Pénalité immédiate en cas de faux positif'
    ],
    rules: [
      'Les portraits défilent à intervalle régulier.',
      'Mémorisez chaque visage au fil de leur passage.',
      'Appuyez sur BUZZER dès qu’un visage est présenté pour la deuxième fois.',
      'Une bonne détection rapporte des points, un faux buzzer vous élimine temporairement.'
    ]
  },
  {
    id: 'blind_gomoku',
    title: 'BLIND GOMOKU',
    tagline: 'Alignez cinq pierres invisibles dans les ténèbres de votre esprit',
    description: 'Le célèbre jeu de Morpion géant (aligner 5 pions) où chaque pièce posée devient instantanément invisible. Vous et votre adversaire devez cartographier mentalement l’ensemble du plateau pour triompher.',
    category: 'memory',
    minPlayers: 2,
    maxPlayers: 2,
    durationMinutes: '15 min',
    difficulty: 'Difficile',
    badge: 'THE DEVIL’S PLAN',
    isPlayable: false,
    accentColor: '#94A3B8',
    supportedModes: ['solo', 'duel', 'tournament'],
    features: [
      'Grille 15x15 avec pierres fantômes évanescentes',
      'Mode vérification arbitre automatique sur TV',
      'Pression psychologique intense pour joueurs d’échecs'
    ],
    rules: [
      'Les joueurs placent alternativement une pierre noire ou blanche.',
      'Dès qu’une pierre est jouée, elle s’efface du plateau TV.',
      'Il est interdit de jouer sur une intersection déjà occupée.',
      'Le premier joueur qui déclare avoir aligné 5 pierres lance la vérification arbitrale.'
    ]
  },
  {
    id: 'cooperative_puzzle',
    title: 'COOPERATIVE PUZZLE',
    tagline: 'Reconstituez la matrice géométrique sacrée en synergie absolue',
    description: 'Chaque joueur détient des fragments géométriques incomplets sur son smartphone. En échangeant des directives verbales sans voir les pièces des autres, reconstituez la forme cible sur le téléviseur.',
    category: 'memory',
    minPlayers: 2,
    maxPlayers: 4,
    durationMinutes: '15 min',
    difficulty: 'Moyen',
    badge: 'COOPÉRATION',
    isPlayable: false,
    accentColor: '#10B981',
    supportedModes: ['party'],
    features: [
      'Communication verbale asymétrique pure',
      'Rotation et imbrication de polygones complexes',
      'Chronomètre global d’Arène'
    ],
    rules: [
      'La forme géométrique globale est projetée sur la TV.',
      'Chaque joueur possède une partie des polygones sur son téléphone.',
      'Guidez vos coéquipiers pour positionner et orienter les pièces à la perfection.'
    ]
  },

  // ====================================================================
  // B. LOGIQUE ET MATHÉMATIQUES
  // ====================================================================
  {
    id: 'secret_number',
    title: 'SECRET NUMBER',
    tagline: 'Percez le code secret de vos adversaires par pure déduction',
    description: 'Chaque participant enferme un code secret dans son coffre d’Arène. À tour de rôle, lancez des attaques chiffrées pour recueillir le nombre de "Strikes" et de "Balls", achetez des indices de parité et démasquez le nombre secret.',
    category: 'logic',
    minPlayers: 2,
    maxPlayers: 6,
    durationMinutes: '20 min',
    difficulty: 'Moyen',
    badge: 'PHASE 2 • JOUABLE',
    isPlayable: true,
    accentColor: '#F59E0B', // Ambre doré
    supportedModes: ['solo', 'duel', 'party', 'tournament'],
    features: [
      'Génération ou composition secrète de codes 3 ou 4 chiffres',
      'Calcul instantané des correspondances Strikes & Balls',
      'Boutique d’indices stratégiques (Parité, Somme, Comparaison)',
      'Pénalité pour accusation prématurée erronée'
    ],
    rules: [
      'Chaque joueur définit secrètement une combinaison de chiffres distincts.',
      'À votre tour, proposez un nombre ou achetez un indice secret.',
      'L’arbitre vous indique le nombre de chiffres bien placés (Strikes) et mal placés (Balls).',
      'Le premier joueur qui devine exactement le code adverse remporte la couronne de la logique.'
    ]
  },
  {
    id: 'equation_high_low',
    title: 'EQUATION HIGH-LOW',
    tagline: 'Manipulez les opérateurs arithmétiques pour atteindre la cible',
    description: 'Des cartes chiffrées et des opérateurs (+, -, ×, ÷) sont distribués. Un résultat cible apparaît : composez l’équation exacte la plus élégante avant l’épuisement du sablier.',
    category: 'logic',
    minPlayers: 1,
    maxPlayers: 4,
    durationMinutes: '15 min',
    difficulty: 'Moyen',
    badge: 'CALCUL',
    isPlayable: false,
    accentColor: '#6366F1',
    supportedModes: ['solo', 'duel', 'party'],
    features: [
      'Générateur d’équations dynamiques à solution garantie',
      'Contrôle de priorité des opérations (PEMDAS)',
      'Duels mathématiques en temps réel'
    ],
    rules: [
      'Un nombre cible est affiché au centre de la TV.',
      'Utilisez vos cartes chiffres et opérateurs pour concevoir une équation valide.',
      'Le joueur qui atteint la valeur exacte ou la plus proche marque des points d’Arène.'
    ]
  },
  {
    id: 'equation_pyramid',
    title: 'EQUATION PYRAMID',
    tagline: 'Construisez les fondations mathématiques de la pyramide céleste',
    description: 'Une pyramide géométrique à plusieurs étages se dresse devant vous. Chaque bloc est le résultat arithmétique des deux blocs qui le soutiennent. Complétez les étages manquants pour concorder avec le sommet.',
    category: 'logic',
    minPlayers: 1,
    maxPlayers: 4,
    durationMinutes: '15 min',
    difficulty: 'Difficile',
    badge: 'PHASE 2 • JOUABLE',
    isPlayable: true,
    accentColor: '#EC4899', // Rose fuchsia
    supportedModes: ['solo', 'duel', 'party', 'tournament'],
    features: [
      'Pyramides à 3, 4 ou 5 étages selon le niveau sélectionné',
      'Opérations combinées (+, -, ×) avec contraintes d’unicité des tuiles',
      'Calculateur de validité en temps réel sur TV et manette mobile',
      'Algorithme de résolution IA ultra-rapide'
    ],
    rules: [
      'Le sommet de la pyramide impose un nombre cible définitif.',
      'Insérez des tuiles numériques dans les blocs de la base et des étages intermédiaires.',
      'Chaque case doit être égale à l’opération de ses deux enfants directs.',
      'Le joueur le plus rapide à stabiliser une pyramide complète et exacte gagne la manche.'
    ]
  },
  {
    id: 'scale_game',
    title: 'SCALE GAME',
    tagline: 'Pesez, déduisez et trouvez le poids exact des cubes mystères',
    description: 'Une balance de Roberval virtuelle et plusieurs cubes de densités inconnues. En un nombre minimal de pesées comparatives, déterminez avec exactitude la masse de chaque cube.',
    category: 'logic',
    minPlayers: 1,
    maxPlayers: 4,
    durationMinutes: '15 min',
    difficulty: 'Moyen',
    badge: 'LOGIQUE PURE',
    isPlayable: true,
    accentColor: '#14B8A6',
    supportedModes: ['solo', 'duel'],
    features: [
      'Animation de bascule physique réaliste sur TV',
      'Système d’inconnues à résolution par équations linéaires',
      'Classement basé sur le nombre de pesées économisées'
    ],
    rules: [
      'Placez des cubes de couleurs différentes sur les deux plateaux de la balance.',
      'Notez les équilibres et inclinaisons pour en déduire les relations de masse.',
      'Entrez le poids exact de chaque couleur avant la fin du temps imparti.'
    ]
  },
  {
    id: 'knights_tour',
    title: 'KNIGHT’S TOUR',
    tagline: 'Le défi millénaire du cavalier d’échecs : visitez chaque case sans faillir',
    description: 'Sur un échiquier gravé d’obsidienne, déplacez le Cavalier royal selon son pas légendaire en "L". Chaque case foulée s’effondre à jamais. Parviendrez-vous à parcourir tout l’échiquier ou à piéger votre rival en duel ?',
    category: 'logic',
    minPlayers: 1,
    maxPlayers: 2,
    durationMinutes: '15 min',
    difficulty: 'Difficile',
    badge: 'PHASE 2 • JOUABLE',
    isPlayable: true,
    accentColor: '#E2E8F0', // Platine
    supportedModes: ['solo', 'duel', 'tournament'],
    features: [
      'Plateaux 5x5 (Standard) ou 6x6 (Grand Maître)',
      'Mode Solo Warnsdorff : battre le record mondial de parcours complet',
      'Mode Duel Tactique : le premier joueur bloqué sans issue perd la partie',
      'Moteur d’échecs temps réel avec prévisualisation des sauts valides'
    ],
    rules: [
      'Le Cavalier se déplace strictement en L (2 cases dans une direction puis 1 perpendiculaire).',
      'Une case déjà visitée est verrouillée et ne peut plus jamais être empruntée.',
      'En Solo : maximisez votre score en visitant le plus de cases possibles.',
      'En Duel : forcez votre adversaire dans une impasse où aucun mouvement légal n’existe.'
    ]
  },
  {
    id: 'question_and_truth',
    title: 'QUESTION AND TRUTH',
    tagline: 'Posez la bonne question pour percer l’ordre des cartes secrètes',
    description: 'Un duel cérébral où chaque joueur dissimule un agencement de 4 cartes. Formulez des questions binaires précises ("La carte 2 est-elle supérieure à la carte 3 ?") pour reconstituer le puzzle avant votre rival.',
    category: 'logic',
    minPlayers: 2,
    maxPlayers: 4,
    durationMinutes: '20 min',
    difficulty: 'Moyen',
    badge: 'DÉDUCTION',
    isPlayable: false,
    accentColor: '#8B5CF6',
    supportedModes: ['duel', 'party'],
    features: [
      'Arbre de questions conditionnelles configurables',
      'Tableau de bord de déduction interactif',
      'Mode bluff avec une question piège autorisée'
    ],
    rules: [
      'Disposez vos cartes secrètement dans l’ordre de votre choix.',
      'À chaque tour, choisissez une question logique autorisée.',
      'L’adversaire est contraint de répondre en toute vérité.',
      'Déclarez l’ordre exact adverse dès que vos déductions convergent.'
    ]
  },

  // ====================================================================
  // C. STRATÉGIE ET PLATEAUX
  // ====================================================================
  {
    id: 'rules_race',
    title: 'RULES RACE',
    tagline: 'Une course de plateau où les règles du jeu changent à chaque case',
    description: 'Les lois de déplacement ne sont jamais figées. Chaque case franchie impose une nouvelle règle : inverser les directions, doubler les pas, échanger les positions. Adaptez votre esprit plus vite que les autres.',
    category: 'strategy',
    minPlayers: 2,
    maxPlayers: 4,
    durationMinutes: '25 min',
    difficulty: 'Difficile',
    badge: 'THE DEVIL’S PLAN',
    isPlayable: false,
    accentColor: '#EF4444',
    supportedModes: ['party', 'tournament'],
    features: [
      'Plateau modulaire généré procéduralement',
      'Cartes de règles impériales à effet immédiat',
      'Coups fourbes et sabotages légaux'
    ],
    rules: [
      'Lancez votre jeton sur la piste de l’Arène.',
      'Appliquez la règle inscrite sur la case d’atterrissage.',
      'Exploitez les contradictions du règlement pour dépasser vos concurrents.'
    ]
  },
  {
    id: 'zoo',
    title: 'ZOO',
    tagline: 'Dominez la chaîne alimentaire dans un enclos de haute stratégie',
    description: 'Chaque animal placé sur la grille possède un prédateur et une proie. Optimisez vos territoires, protégez vos espèces rares et encerclez les meutes adverses.',
    category: 'strategy',
    minPlayers: 1,
    maxPlayers: 4,
    durationMinutes: '20 min',
    difficulty: 'Moyen',
    badge: 'STRATÉGIE',
    isPlayable: false,
    accentColor: '#84CC16',
    supportedModes: ['solo', 'duel', 'party'],
    features: [
      'Hiérarchie animale originale (Éléphant > Lion > Chien > Chat > Souris > Éléphant)',
      'Contrôle territorial sur grille 6x6',
      'Points d’équilibre écologique'
    ],
    rules: [
      'Posez une tuile animal de votre réserve sur le plateau.',
      'Capturez les animaux adjacents de rang inférieur.',
      'Contrôlez les zones clés du parc pour engranger des dividendes d’Arène.'
    ]
  },
  {
    id: 'laying_grass',
    title: 'LAYING GRASS',
    tagline: 'Conquérez le territoire avec des polyominos impitoyables',
    description: 'Inspiré des plus grands jeux de conquête géométrique : tirez des dés pour obtenir la dimension de vos parcelles et étendez votre domaine sans laisser le moindre espace à vos rivaux.',
    category: 'strategy',
    minPlayers: 2,
    maxPlayers: 4,
    durationMinutes: '25 min',
    difficulty: 'Moyen',
    badge: 'CONQUÊTE',
    isPlayable: false,
    accentColor: '#22C55E',
    supportedModes: ['duel', 'party'],
    features: [
      'Placement de polyominos rotatifs en temps réel',
      'Points bonus pour les domaines continus',
      'Blocages agressifs de frontières'
    ],
    rules: [
      'Lancez les dés pour connaître les dimensions de votre parcelle.',
      'Placez votre forme géométrique adjacente à votre territoire existant.',
      'Le joueur occupant la plus grande surface d’un seul tenant gagne.'
    ]
  },
  {
    id: 'nine_mens_morris',
    title: 'NINE MEN’S MORRIS (JEU DU MOULIN)',
    tagline: 'Le jeu millénaire des bâtisseurs d’empires : alignez 3 pions et anéantissez l’ennemi',
    description: 'Sur un tracé mythique de 3 carrés concentriques reliés par leurs milieux (24 intersections), deux maîtres s’affrontent. Posez vos 9 pions, créez des alignements de trois ("Moulins") pour capturer les pièces adverses une à une.',
    category: 'strategy',
    minPlayers: 2,
    maxPlayers: 2,
    durationMinutes: '15 min',
    difficulty: 'Moyen',
    badge: 'PHASE 2 • JOUABLE',
    isPlayable: true,
    accentColor: '#F59E0B', // Or ambré
    supportedModes: ['solo', 'duel', 'tournament'],
    features: [
      'Plateau classique 24 points haute fidélité style bois sombre et marbre',
      '3 phases complètes : Pose initiale, Déplacement orthogonal et Saut libre (Flying)',
      'Détection automatique de moulins et protection des pions en moulin',
      'Moteur IA Minimax avec élagage Alpha-Bêta de niveau Maître'
    ],
    rules: [
      'Phase 1 : Les deux joueurs placent alternativement leurs 9 pions sur les intersections libres.',
      'Former un moulin (3 pions de même couleur alignés) permet de retirer un pion adverse.',
      'Phase 2 : Déplacez un pion vers une intersection adjacente reliée par une ligne.',
      'Phase 3 : Lorsqu’un joueur n’a plus que 3 pions, il peut sauter librement sur n’importe quel point.',
      'La partie s’achève lorsqu’un joueur est réduit à 2 pions ou ne peut plus bouger.'
    ]
  },
  {
    id: 'hex',
    title: 'HEX',
    tagline: 'Bâtissez un pont infranchissable reliant les deux rivages du monde',
    description: 'Sur une grille en losange pavée d’hexagones, deux joueurs s’affrontent pour relier leurs deux côtés opposés. Pas de match nul possible : chaque coup est décisif.',
    category: 'strategy',
    minPlayers: 2,
    maxPlayers: 2,
    durationMinutes: '20 min',
    difficulty: 'Difficile',
    badge: 'STRATÉGIE PURE',
    isPlayable: false,
    accentColor: '#0EA5E9',
    supportedModes: ['solo', 'duel', 'tournament'],
    features: [
      'Plateau hexagonal géométrique 11x11',
      'Calculateur de chaînes continues',
      'Jeu sans hasard à équité parfaite'
    ],
    rules: [
      'Posez un pion à chaque tour sur une alvéole inoccupée.',
      'Créez une chaîne ininterrompue reliant les deux bords de votre couleur.',
      'Bloquez les percées adverses avant qu’elles ne deviennent irréversibles.'
    ]
  },
  {
    id: 'wall_go',
    title: 'WALL GO',
    tagline: 'Érigez des remparts pour cerner les trésors et emprisonner vos rivaux',
    description: 'Inspiré du Go et des jeux d’encerclement : déplacez vos architectes et dressez des murs de pierre pour enclaver les territoires les plus riches.',
    category: 'strategy',
    minPlayers: 2,
    maxPlayers: 4,
    durationMinutes: '25 min',
    difficulty: 'Difficile',
    badge: 'TACTIQUE',
    isPlayable: false,
    accentColor: '#78716C',
    supportedModes: ['duel', 'party'],
    features: [
      'Placement de barrières physiques 3D sur TV',
      'Calcul d’enclavement d’espaces fermés',
      'Sabotage de routes commerciales'
    ],
    rules: [
      'Déplacez votre pion ou posez une section de mur.',
      'Toute zone complètement fermée revient au joueur qui y possède la majorité.',
      'Celui qui totalise le plus de cellules fortifiées remporte la manche.'
    ]
  },
  {
    id: 'bagh_chal',
    title: 'BAGH-CHAL',
    tagline: 'Le duel asymétrique légendaire : 4 Tigres traqueurs contre 20 Chèvres unies',
    description: 'Jeu traditionnel de stratégie asymétrique pure : le joueur des Tigres doit bondir et capturer 5 chèvres, tandis que le joueur des Chèvres doit coordonner son troupeau pour immobiliser totalement les fauves.',
    category: 'strategy',
    minPlayers: 2,
    maxPlayers: 2,
    durationMinutes: '20 min',
    difficulty: 'Difficile',
    badge: 'ASYMÉTRIQUE',
    isPlayable: false,
    accentColor: '#D97706',
    supportedModes: ['solo', 'duel', 'tournament'],
    features: [
      'Gameplay asymétrique complet : Tigres puissants vs Troupeau en surnombre',
      'Plateau sacré 5x5 avec diagonales',
      'Tension psychologique permanente'
    ],
    rules: [
      'Les Tigres capturent une chèvre en sautant par-dessus vers une case vide.',
      'Les Chèvres ne capturent pas mais se déplacent pour encercler les tigres.',
      'Victoire des Tigres : 5 chèvres capturées. Victoire des Chèvres : tous les tigres bloqués.'
    ]
  },
  {
    id: 'treasure_island',
    title: 'TREASURE ISLAND',
    tagline: 'Explorez la grille de l’île oubliée et anticipez les pièges des rivaux',
    description: 'Une île quadrillée dissimule des coffres de pièces d’or, des indices énigmatiques et des gouffres sans fond. Sondez le terrain, décodez les balises et fuyez avec le pactole.',
    category: 'strategy',
    minPlayers: 2,
    maxPlayers: 6,
    durationMinutes: '30 min',
    difficulty: 'Moyen',
    badge: 'EXPLORATION',
    isPlayable: false,
    accentColor: '#CA8A04',
    supportedModes: ['party', 'tournament'],
    features: [
      'Carte au trésor avec brouillard de guerre',
      'Indices boussole et coordonnées cartésiennes',
      'Pillage de coffres entre joueurs'
    ],
    rules: [
      'Déplacez votre explorateur de case en case sur la carte.',
      'Rassemblez des fragments d’indices indiquant la longitude et la latitude du trésor.',
      'Le premier à creuser sur la case exacte du grand coffre gagne la partie.'
    ]
  },

  // ====================================================================
  // D. BLUFF, DÉDUCTION ET PSYCHOLOGIE
  // ====================================================================
  {
    id: 'the_virus_game',
    title: 'THE VIRUS GAME',
    tagline: 'Qui propage le fléau dans l’ombre ? Débattez, votez et isolez le traître',
    description: 'Un jeu de rôles secrets haute tension directement inspiré de The Devil’s Plan. L’Arène est infiltrée par un virus mutant. La nuit, les contaminateurs frappent en secret. Le jour, débattez férocement devant la TV et votez pour placer les suspects en quarantaine.',
    category: 'bluff',
    minPlayers: 3,
    maxPlayers: 10,
    durationMinutes: '25 min',
    difficulty: 'Difficile',
    badge: 'PHASE 2 • JOUABLE',
    isPlayable: true,
    accentColor: '#10B981', // Vert mutant / biohazard
    supportedModes: ['party', 'tournament'],
    features: [
      'Rôles secrets asymétriques : Médecin, Porteur du Virus, Citoyen Immunisé, Infiltré',
      'Phase de Nuit secrète sur smartphones (Infection, Soin, Diagnostic)',
      'Phase de Jour cinématique sur TV avec tribune d’accusation et vote en direct',
      'Gestion des quarantaines et révélations dramatiques de fin de cycle'
    ],
    rules: [
      'Chaque joueur reçoit son identité secrète sur son smartphone.',
      'Phase Nuit : Les porteurs du virus choisissent une cible ; le médecin tente de protéger un citoyen.',
      'Phase Jour : La TV annonce les nouveaux contaminés. Débattez de vive voix pour identifier le coupable.',
      'Votez sur mobile : le joueur obtenant la majorité des voix est placé en quarantaine définitive.',
      'Les Citoyens gagnent s’ils isolent tous les porteurs ; le Virus gagne s’il contamine la majorité.'
    ]
  },
  {
    id: 'crooked_cops',
    title: 'CROOKED COPS',
    tagline: 'Policiers intègres contre ripoux corrompus dans les bas-fonds de la ville',
    description: 'Une enquête policière nocturne où certains enquêteurs détournent les scellés pour leur propre compte. Observez les déplacements sur la carte de la ville et démasquez les ripoux.',
    category: 'bluff',
    minPlayers: 4,
    maxPlayers: 8,
    durationMinutes: '25 min',
    difficulty: 'Difficile',
    badge: 'PSYCHOLOGIE',
    isPlayable: false,
    accentColor: '#3B82F6',
    supportedModes: ['party'],
    features: [
      'Plan de ville interactif avec lieux d’investigation',
      'Partage d’indices secrets entre téléphones',
      'Système de menottes et arrestations formelles'
    ],
    rules: [
      'Déplacez-vous sur les scènes de crime pour collecter des pièces à conviction.',
      'Les ripoux s’emparent discrètement des preuves pour innocenter le cartel.',
      'Déposez une motion de censure pour suspendre un collègue soupçonné de trahison.'
    ]
  },
  {
    id: 'doubt_and_bet',
    title: 'DOUBT AND BET',
    tagline: 'Annoncez vos certitudes, poussez les enchères ou criez « DOUTE ! »',
    description: 'Le grand jeu de bluff de The Devil’s Plan ! Chaque joueur tient en main un lot secret de cartes de couleur. Les enchères collectives s’envolent ("Au moins 7 cartes Or sur la table !"). Surenchérissez avec audace ou stoppez votre rival en criant « DOUTE ! ».',
    category: 'bluff',
    minPlayers: 2,
    maxPlayers: 8,
    durationMinutes: '20 min',
    difficulty: 'Moyen',
    badge: 'PHASE 2 • JOUABLE',
    isPlayable: true,
    accentColor: '#DC2626', // Rouge critique
    supportedModes: ['solo', 'duel', 'party', 'tournament'],
    features: [
      'Mains secrètes de cartes couleur (Noir, Or, Rouge, Platine) sur smartphone',
      'Tableau d’enchères commun en direct sur grand écran TV',
      'Bouton d’urgence "DOUTE !" avec alerte sonore haute tension',
      'Révélation cinématographique théâtrale de toutes les cartes de la table'
    ],
    rules: [
      'Chaque joueur reçoit 5 cartes secrètes de couleur.',
      'À votre tour, augmentez la quantité d’une couleur présumée présente sur la table entière.',
      'Si vous pensez que l’annonce précédente est un mensonge éhonté, appuyez sur « DOUTE ! ».',
      'Toutes les cartes sont retournées : si l’annonce était vraie, le douteur perd des jetons. Sinon, le menteur est puni !'
    ]
  },
  {
    id: 'halloween_monster',
    title: 'HALLOWEEN MONSTER',
    tagline: 'Alliez-vous contre les créatures de l’ombre avant de vous trahir pour le trésor',
    description: 'Une horde de monstres légendaires attaque l’Arène. Jouez vos cartes de ressources pour terrasser la bête en équipe... mais attention : le joueur qui porte le coup de grâce s’approprie tout le butin.',
    category: 'bluff',
    minPlayers: 3,
    maxPlayers: 6,
    durationMinutes: '25 min',
    difficulty: 'Moyen',
    badge: 'SEMI-COOPÉRATIF',
    isPlayable: false,
    accentColor: '#EA580C',
    supportedModes: ['party'],
    features: [
      'Boss de raid avec jauges de points de vie sur TV',
      'Négociations d’alliances orales et pactes secrets',
      'Cartes de traîtrise de dernière seconde'
    ],
    rules: [
      'Un monstre avec des résistances spécifiques apparaît sur la TV.',
      'Les joueurs doivent combiner leurs attaques pour infliger les dégâts requis.',
      'Négociez qui sacrifie ses cartes et qui récolte les récompenses du donjon.'
    ]
  },

  // ====================================================================
  // E. CARTES, DÉS ET ENCHÈRES
  // ====================================================================
  {
    id: 'remove_one',
    title: 'REMOVE ONE',
    tagline: 'Le plus petit nombre UNIQUE l’emporte : évitez la meute à tout prix',
    description: 'Chaque joueur choisit secrètement une carte numérotée dans sa main. La règle d’or : tout nombre joué en doublon par deux personnes ou plus est instantanément anéanti ! Le vainqueur est celui qui a posé le plus petit chiffre resté strictement UNIQUE.',
    category: 'cards',
    minPlayers: 2,
    maxPlayers: 8,
    durationMinutes: '15 min',
    difficulty: 'Facile',
    badge: 'THE DEVIL’S PLAN',
    isPlayable: false,
    accentColor: '#06B6D4',
    supportedModes: ['party', 'tournament'],
    features: [
      'Sélection secrète simultanée sur smartphones',
      'Animation de collision et destruction des doublons sur TV',
      'Dilemme psychologique récurrent entre sécurité et risque'
    ],
    rules: [
      'Choisissez secrètement un chiffre de 1 à 15 dans votre main.',
      'Les choix sont dévoilés tous en même temps.',
      'Si deux joueurs ont choisi le même chiffre, ils sont tous deux éliminés de la manche !',
      'Le joueur qui a joué le chiffre le plus faible parmi les uniques gagne les points.'
    ]
  },
  {
    id: 'time_auction',
    title: 'TIME AUCTION',
    tagline: 'Votre temps de vie est votre seule monnaie : dosez chaque milliseconde',
    description: 'Chaque participant dispose d’une jauge de 60 secondes pour toute la partie. Pour remporter les lots d’Arène, maintenez le buzzer enfoncé sur votre smartphone. Le joueur le plus endurant l’emporte... mais son chrono fond irrémédiablement.',
    category: 'cards',
    minPlayers: 3,
    maxPlayers: 8,
    durationMinutes: '20 min',
    difficulty: 'Difficile',
    badge: 'ENCHÈRES VIVES',
    isPlayable: false,
    accentColor: '#EAB308',
    supportedModes: ['party', 'tournament'],
    features: [
      'Buzzer à pression continue avec retour haptique',
      'Affichage spectaculaire des barres de temps sur TV',
      'Élimination soudaine par épuisement temporel'
    ],
    rules: [
      'Un lot d’Arène est mis aux enchères.',
      'Enfoncez le bouton pour enchérir : chaque dixième de seconde consomme votre temps vital.',
      'Le dernier à relâcher remporte le lot mais voit sa réserve définitivement diminuée.'
    ]
  },
  {
    id: 'sniper_holdem',
    title: 'SNIPER HOLD’EM',
    tagline: 'Du Texas Hold’em où vous pouvez neutraliser une carte du tableau adverse',
    description: 'La variante suprême du poker tactique de The Devil’s Plan ! Constituez votre main avec les cartes communes, mais utilisez vos jetons Sniper pour abattre une carte spécifique convoitée par votre rival.',
    category: 'cards',
    minPlayers: 2,
    maxPlayers: 8,
    durationMinutes: '25 min',
    difficulty: 'Difficile',
    badge: 'POKER EXPERT',
    isPlayable: false,
    accentColor: '#B91C1C',
    supportedModes: ['duel', 'party', 'tournament'],
    features: [
      'Moteur complet de Texas Hold’em (Flop, Turn, River)',
      'Action spéciale "Sniper Shot" pour invalider une carte',
      'Table de poker de luxe feutrée noir et or'
    ],
    rules: [
      'Recevez deux cartes privées et partagez le board de 5 cartes.',
      'Misez et relancez selon vos combinaisons.',
      'Au moment du Sniper Shot, ciblez une carte pour empêcher vos rivaux de l’exploiter.'
    ]
  },
  {
    id: 'triple_dice',
    title: 'TRIPLE DICE',
    tagline: 'Pariez sur la constellation des trois dés et bravez les probabilités',
    description: 'Trois dés sacrés d’Arène sont secoués sous une cloche de verre. Anticipez les sommes, les suites, les brelans ou les parités et gérez vos jetons d’or avec rigueur.',
    category: 'cards',
    minPlayers: 2,
    maxPlayers: 6,
    durationMinutes: '15 min',
    difficulty: 'Facile',
    badge: 'HASARD & PARIS',
    isPlayable: false,
    accentColor: '#64748B',
    supportedModes: ['party'],
    features: [
      'Physique de lancer 3D avec dés texturés or et ivoire',
      'Tapis de mise interactif sur mobile',
      'Multiplicateurs de gain jusqu’à x30'
    ],
    rules: [
      'Placez vos jetons sur les cases de prédiction du tapis.',
      'Les trois dés sont projetés sur le téléviseur.',
      'Les gains sont redistribués selon la cote des combinaisons obtenues.'
    ]
  },
  {
    id: 'balance_mancala',
    title: 'BALANCE MANCALA',
    tagline: 'L’art de semer les graines de l’harmonie : l’équilibre parfait surpasse la force',
    description: 'Une adaptation révolutionnaire du traditionnel jeu d’Awalé/Mancala : votre score final n’est pas la somme de vos graines, mais la valeur de votre fosse la plus faible ! L’équilibre absolu est la clé de la victoire.',
    category: 'cards',
    minPlayers: 2,
    maxPlayers: 2,
    durationMinutes: '20 min',
    difficulty: 'Moyen',
    badge: 'STRATÉGIE PROFONDE',
    isPlayable: false,
    accentColor: '#A16207',
    supportedModes: ['solo', 'duel'],
    features: [
      'Plateau en bois sculpté avec 12 fosses',
      'Mécanique d’égrenage circulaire fluide',
      'Calculateur de score d’harmonie minimale'
    ],
    rules: [
      'Prenez les billes d’une fosse et semez-les une à une dans les fosses suivantes.',
      'Capturez les billes dans le camp adverse selon les conditions de prise.',
      'Votre score final est déterminé par la fosse ayant le moins de billes : ne négligez aucun grenier !'
    ]
  },
  {
    id: 'big_small',
    title: 'BIG SMALL',
    tagline: 'La carte cachée sera-t-elle plus haute ou plus basse ? La roulette russe des cartes',
    description: 'Une carte de référence est visible. La suivante est cachée. Pariez : Plus Haute (Big) ou Plus Basse (Small). Enchaînez les victoires pour multiplier vos Pièces du Démon, mais une mauvaise prédiction vous renvoie au point de départ.',
    category: 'cards',
    minPlayers: 1,
    maxPlayers: 8,
    durationMinutes: '10 min',
    difficulty: 'Facile',
    badge: 'SENSATION FORTE',
    isPlayable: false,
    accentColor: '#059669',
    supportedModes: ['solo', 'party'],
    features: [
      'Mécanique de quitte ou double addictif',
      'Calculateur des probabilités restantes du sabot',
      'Duel en face à face avec relance d’enchère'
    ],
    rules: [
      'Consultez la carte dévoilée sur la table.',
      'Pariez sur la valeur de la carte suivante par rapport à la carte active.',
      'Chaque bonne réponse augmente le multiplicateur de récompense.'
    ]
  },
  {
    id: 'four_player_three_in_a_row',
    title: 'FOUR PLAYER THREE IN A ROW',
    tagline: 'Alignement à 4 joueurs avec objectifs secrets croisés',
    description: 'Une grille 5x5 où 4 stratèges déposent leurs pions. Chacun possède un objectif d’alignement secret différent (diagonale, colonne spécifique, motif en croix). Interceptez les plans rivaux sans révéler le vôtre.',
    category: 'cards',
    minPlayers: 4,
    maxPlayers: 4,
    durationMinutes: '20 min',
    difficulty: 'Moyen',
    badge: 'OBJECTIF SECRET',
    isPlayable: false,
    accentColor: '#9333EA',
    supportedModes: ['party', 'tournament'],
    features: [
      'Objectifs secrets distribués uniquement sur smartphones',
      'Interactions croisées à 4 factions',
      'Plateau interactif avec surbrillance tactique'
    ],
    rules: [
      'Découvrez votre motif de victoire secret sur votre mobile.',
      'Déposez un pion de votre couleur sur la grille à chaque tour.',
      'Le premier joueur qui valide discrètement son motif remporte la victoire instantanée.'
    ]
  },

  // ====================================================================
  // F. JEUX SUPPLÉMENTAIRES ET ÉPREUVES SECRÈTES
  // ====================================================================
  {
    id: 'find_the_key',
    title: 'FIND THE KEY',
    tagline: 'Déchiffrez le labyrinthe de symboles pour forcer le verrou final',
    description: 'Une énigme de salle d’évasion de haut vol. Des indices dispersés entre l’écran TV et les téléphones des joueurs révèlent la combinaison séquentielle d’un coffre scellé renfermant la Clé de l’Arène.',
    category: 'secret',
    minPlayers: 1,
    maxPlayers: 4,
    durationMinutes: '15 min',
    difficulty: 'Difficile',
    badge: 'ESCAPE PUZZLE',
    isPlayable: false,
    accentColor: '#FBBF24',
    supportedModes: ['solo', 'party'],
    features: [
      'Coffre-fort mécanique 3D interactif',
      'Indices chiffrés en stéganographie visuelle',
      'Chronomètre d’autodestruction'
    ],
    rules: [
      'Analysez les runes et symboles projetés sur l’écran.',
      'Combinez les indices partiels reçus par les membres du groupe.',
      'Entrez le code secret à 4 rouleaux pour libérer la Clé de l’Arène.'
    ]
  },
  {
    id: 'third_final_challenge',
    title: 'THIRD FINAL CHALLENGE',
    tagline: 'L’épreuve finale des maîtres : le duel suprême d’esprit et de sang-froid',
    description: 'L’affrontement final entre les deux meilleurs stratèges de l’Arène. Une suite d’épreuves chronométrées combinant mémoire pure, calcul mental sous stress et bluff à découvert. Seul un champion en sortira.',
    category: 'secret',
    minPlayers: 2,
    maxPlayers: 2,
    durationMinutes: '30 min',
    difficulty: 'Expert',
    badge: 'FINALE DES MAÎTRES',
    isPlayable: false,
    accentColor: '#DC2626',
    supportedModes: ['duel', 'tournament'],
    features: [
      'Scénographie d’arène nocturne style Grand Débat',
      'Enchaînement de 3 mini-jeux décisifs sans pause',
      'Affichage solennel du vainqueur de la saison'
    ],
    rules: [
      'Deux finalistes s’affrontent sur 3 manches éliminatoires.',
      'Manche 1 : Mémorisation éclair. Manche 2 : Équations croisées. Manche 3 : Duel du Doute.',
      'Le premier à remporter 2 épreuves est sacré Maître Absolu de MOOD ARENA.'
    ]
  },
  {
    id: 'prison_challenges',
    title: 'PRISON CHALLENGES',
    tagline: 'Les épreuves des condamnés : survivez aux éliminations directes',
    description: 'Inspiré des cellules secrètes de The Devil’s Plan : les joueurs en bas de classement sont envoyés dans la Prison de l’Arène. Pour échapper à l’élimination définitive, résolvez des énigmes de survie sous haute pression.',
    category: 'secret',
    minPlayers: 2,
    maxPlayers: 6,
    durationMinutes: '20 min',
    difficulty: 'Difficile',
    badge: 'SURVIE',
    isPlayable: false,
    accentColor: '#475569',
    supportedModes: ['party', 'tournament'],
    features: [
      'Ambiance de cachot sombre et mystérieux',
      'Élimination soudaine du dernier à chaque épreuve',
      'Possibilité de voler des Pièces du Démon aux gardiens'
    ],
    rules: [
      'Les joueurs en danger s’affrontent sur une série d’épreuves courtes d’élimination.',
      'Chaque échec retranche des jetons de survie.',
      'Le dernier survivant de la prison réintègre la compétition principale.'
    ]
  }
];

export const ARENA_CATEGORIES: { id: string; label: string; icon: string }[] = [
  { id: 'all', label: 'Tous les Jeux', icon: 'Sparkles' },
  { id: 'memory', label: 'Mémoire & Observation', icon: 'Brain' },
  { id: 'logic', label: 'Logique & Maths', icon: 'Binary' },
  { id: 'strategy', label: 'Stratégie & Plateaux', icon: 'Compass' },
  { id: 'bluff', label: 'Bluff & Psychologie', icon: 'Eye' },
  { id: 'cards', label: 'Cartes, Dés & Enchères', icon: 'Layers' },
  { id: 'secret', label: 'Épreuves Secrètes', icon: 'Key' },
];
