import { GameCatalogItem } from '../types/game';

export const GAMES_CATALOG: GameCatalogItem[] = [
  {
    id: 'four_pics',
    title: '4 IMAGES 1 MOT',
    tagline: 'Le grand défi visuel et lexical sur la Smart TV',
    description: '4 images s’affichent sur le grand écran : trouvez le mot commun qui les unit ! Composez la réponse sur votre clavier tactile de smartphone avec les lettres disponibles. Le joueur le plus rapide remporte le jackpot de points de la manche !',
    category: 'reflexion',
    minPlayers: 1,
    maxPlayers: 12,
    durationMinutes: '10–20 min',
    difficulty: 'Facile',
    badge: 'POPULAIRE',
    coverImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    heroImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=85',
    features: [
      '4 grandes images en haute définition sur la TV',
      'Clavier tactile de lettres mélangées interactif sur smartphone',
      'Course de rapidité en direct entre tous les joueurs du salon',
      'Révélation et classement dynamique'
    ],
    rules: [
      'Observez les 4 images affichées sur l’écran de la Smart TV.',
      'Délivrez le mot commun grâce aux cases de lettres indiquées.',
      'Touchez les lettres sur votre smartphone pour composer votre proposition.',
      'Le premier joueur qui valide le mot correct gagne +100 points et des bonus de vitesse !',
      'Enchaînez les manches jusqu’au podium final du champion.'
    ]
  },
  {
    id: 'ludo',
    title: 'LUDO DELUXE 3D',
    tagline: 'Le grand classique mondial sublimé pour votre Smart TV',
    description: 'Affrontez vos amis dans une course vers le centre du plateau ! Pions luminescents, lancer de dé par secouage du smartphone et alertes de captures en direct.',
    category: 'popular',
    minPlayers: 2,
    maxPlayers: 4,
    durationMinutes: '15–30 min',
    difficulty: 'Facile',
    badge: 'POPULAIRE',
    coverImage: 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?auto=format&fit=crop&w=800&q=80',
    heroImage: 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?auto=format&fit=crop&w=1920&q=85',
    features: [
      'Plateau néon HD avec étoiles de sécurité',
      'Lancer de dé par secouage gyroscopique du smartphone',
      'Cartes de pions avec prévisualisation des cases cibles',
      'Animations et sons immersifs',
    ],
    rules: [
      'Chaque joueur dispose de 4 pions dans sa base de couleur.',
      'Faites un 6 pour sortir un pion sur la piste de départ.',
      'Parcourez les 52 cases du circuit sans vous faire capturer par un pion adverse.',
      'Les cases étoiles sont des zones protégées où les pions sont en sécurité.',
      'Le premier joueur qui amène ses 4 pions au centre du plateau remporte la partie !'
    ]
  },
  {
    id: 'menteur',
    title: 'LE MENTEUR',
    tagline: 'Le grand jeu de bluff et de déduction sur table centrale',
    description: 'Posez vos cartes face cachée et annoncez leur valeur avec assurance. Dites la vérité ou mentez ! Tout joueur peut buzzer "MENTEUR !" à tout moment : si l’accusation est juste, le menteur ramasse tout le tas central, sinon c’est l’accusateur qui prend tout !',
    category: 'cards',
    minPlayers: 2,
    maxPlayers: 8,
    durationMinutes: '15–25 min',
    difficulty: 'Facile',
    badge: 'BLUFF',
    coverImage: 'https://images.unsplash.com/photo-1541123437800-1bb1317badc2?auto=format&fit=crop&w=800&q=80',
    heroImage: 'https://images.unsplash.com/photo-1541123437800-1bb1317badc2?auto=format&fit=crop&w=1920&q=85',
    features: [
      'Table centrale avec tas de cartes empilées en temps réel',
      'Bouton buzzer tactile MENTEUR avec vibration',
      'Révélation VRAI ou MENSONGE sur la TV',
      'Multi-sélection de cartes privée sur smartphone'
    ],
    rules: [
      'Toutes les cartes du paquet sont distribuées entre les joueurs.',
      'À votre tour, posez 1 à 4 cartes face cachée sur le tas central et annoncez leur rang (ex: "Deux Rois").',
      'Vous pouvez dire la vérité ou mentir !',
      'N’importe quel joueur peut accepter l’annonce ou appuyer sur "MENTEUR !".',
      'Si le joueur a menti, il ramasse tout le tas central. S’il a dit la vérité, l’accusateur prend tout le tas !',
      'Le premier joueur qui n’a plus aucune carte remporte la victoire.'
    ]
  },
  {
    id: 'inter',
    title: 'INTER',
    tagline: 'Le jeu de cartes rapide aux attaques cumulables',
    description: 'Enchaînez les cartes de même couleur ou même valeur et déclenchez des attaques : As STOP, 2 (+2 cumulable), 8 Demande, 10 (+4 cumulable), Valet Retour et Joker (+5 cumulable) !',
    category: 'cards',
    minPlayers: 2,
    maxPlayers: 8,
    durationMinutes: '10–20 min',
    difficulty: 'Facile',
    badge: 'ACTION',
    coverImage: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=800&q=80',
    heroImage: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=1920&q=85',
    features: [
      'Attaques cumulables (+2, +4, +5)',
      'Cartes d’action : STOP (As), RETOUR (Valet), DEMANDE (8), JOKER (+5)',
      'Sens de jeu dynamique animé en direct sur la Smart TV',
      'Vibrations haptiques immédiates en cas d’attaque reçue'
    ],
    rules: [
      'Chaque joueur reçoit 7 cartes de départ.',
      'Jouez une carte correspondant à la valeur ou à la couleur de la défausse centrale.',
      'As = STOP : Bloque et saute le tour du joueur suivant.',
      '2 = +2 : Fait piocher 2 cartes au joueur suivant (cumulable !).',
      '8 = DEMANDE : Choisissez la valeur imposée pour le tour.',
      '10 = +4 : Fait piocher 4 cartes au joueur suivant (cumulable !).',
      'Valet (J) = RETOUR : Inverse le sens de rotation de la table.',
      'Joker = +5 : Fait piocher 5 cartes au joueur suivant (cumulable !).',
      'Le premier joueur à vider sa main remporte la manche.'
    ]
  },
  {
    id: 'scrabble',
    title: 'MOTS CROISÉS & SCRABBLE',
    tagline: 'Le défi des maîtres des lettres et de la stratégie',
    description: 'Placez vos lettres sur le plateau géant de la TV grâce à votre chevalet personnel sur smartphone. Exploitez les cases Mot Compte Triple et Lettre Compte Double pour exploser les compteurs !',
    category: 'reflexion',
    minPlayers: 2,
    maxPlayers: 4,
    durationMinutes: '20–40 min',
    difficulty: 'Difficile',
    badge: 'STRATÉGIE',
    coverImage: 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?auto=format&fit=crop&w=800&q=80',
    heroImage: 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?auto=format&fit=crop&w=1920&q=85',
    features: [
      'Chevalet de 7 lettres privé sur smartphone',
      'Vérification en direct par le Dictionnaire Officiel Scrabble',
      'Calcul automatique des bonus Mot Triple et Lettre Triple',
      'Bonus Scrabble de +50 points en posant ses 7 lettres'
    ],
    rules: [
      'Chaque joueur pioche 7 lettres conservées secrètement sur son mobile.',
      'Formez des mots valides qui croisent les lettres déjà posées sur le plateau TV.',
      'Chaque mot formé est vérifié par le dictionnaire officiel.',
      'Possibilité d’échanger des lettres ou de passer son tour.',
      'Le joueur totalisant le plus grand score à la fin de la partie l’emporte !'
    ]
  },
  {
    id: 'card_party',
    title: 'CARD PARTY : 8 AMÉRICAIN',
    tagline: 'La bataille de cartes avec mains secrètes sur mobile',
    description: 'Votre smartphone devient votre main secrète ! Débarrassez-vous de vos cartes en faisant correspondre couleur ou chiffre, enchaînez les +2 et +4 et buzzez UNO en premier !',
    category: 'cards',
    minPlayers: 2,
    maxPlayers: 8,
    durationMinutes: '10–20 min',
    difficulty: 'Facile',
    badge: 'POPULAIRE',
    coverImage: 'https://images.unsplash.com/photo-1541123437800-1bb1317badc2?auto=format&fit=crop&w=800&q=80',
    heroImage: 'https://images.unsplash.com/photo-1541123437800-1bb1317badc2?auto=format&fit=crop&w=1920&q=85',
    features: [
      'Main secrète privée sur votre smartphone',
      'Glissez votre carte vers le haut pour la jouer sur la TV',
      'Cartes spéciales : Inversion, Saut de tour, Joker +4',
      'Bouton buzzer UNO tactile d’urgence'
    ],
    rules: [
      'Chaque joueur reçoit 7 cartes secrètes au départ.',
      'Jouez une carte ayant la même couleur ou le même symbole que celle au centre de la TV.',
      'Les cartes +2 et +4 font piocher le joueur suivant.',
      'Lorsqu’il ne vous reste qu’une seule carte, appuyez sur le buzzer UNO !',
      'Le premier joueur à vider sa main gagne la manche.'
    ]
  },
  {
    id: 'quiz',
    title: 'QUIZ SHOW',
    tagline: 'Le grand jeu télévisé en direct dans votre salon',
    description: 'Questions à choix multiples, compte à rebours et buzzers tactiles sur smartphones pour devenir le champion.',
    category: 'party',
    minPlayers: 1,
    maxPlayers: 10,
    durationMinutes: '10–15 min',
    difficulty: 'Moyen',
    badge: 'AMBIANCE',
    coverImage: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
    heroImage: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1920&q=85',
    features: [
      'Questions affichées sur la TV',
      '4 buzzers tactiles colorés sur votre mobile',
      'Scores calculés selon la vitesse de réaction',
      'Questions variées : Culture générale, Cinéma, Sciences, Sport'
    ],
    rules: [
      'Une question et 4 propositions s’affichent sur la Smart TV.',
      'Vous disposez de 15 secondes pour sélectionner la bonne réponse sur votre téléphone.',
      'Plus vous répondez vite, plus vous remportez de points.',
      'À la fin des manches, le joueur en tête remporte la victoire !'
    ]
  },
  {
    id: 'draw_and_guess',
    title: 'DRAW & GUESS : PICTIONARY',
    tagline: 'Dessinez sur votre smartphone, devinez sur le grand écran TV',
    description: 'Un joueur reçoit un mot secret et dessine au doigt sur son écran. Le tracé apparaît en temps réel sur la TV pendant que les autres joueurs devinent sur leur mobile !',
    category: 'party',
    minPlayers: 2,
    maxPlayers: 10,
    durationMinutes: '15–25 min',
    difficulty: 'Facile',
    badge: 'NOUVEAU',
    coverImage: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=800&q=80',
    heroImage: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=1920&q=85',
    features: [
      'Toile tactile avec palette de couleurs',
      'Tracé vectoriel synchronisé en temps réel sur la TV',
      'Dictionnaire de mots français variés',
      'Points de rapidité pour le devineur et le dessinateur'
    ],
    rules: [
      'Le dessinateur reçoit un mot secret sur son mobile.',
      'Il a 60 secondes pour le faire deviner en dessinant sans écrire de lettres.',
      'Les autres joueurs tapent leurs propositions sur leurs téléphones.',
      'Le premier qui trouve remporte le maximum de points !'
    ]
  },
  {
    id: 'blind_test',
    title: 'BLIND TEST MUSICAL ARENA',
    tagline: 'Le défi musical avec buzzers ultra-réactifs',
    description: 'Testez votre culture musicale ! Des mélodies et thèmes cultes retentissent sur la TV avec visualiseur audio. Soyez le plus rapide à buzzer sur votre mobile !',
    category: 'party',
    minPlayers: 2,
    maxPlayers: 10,
    durationMinutes: '10–20 min',
    difficulty: 'Facile',
    badge: 'MUSIQUE',
    coverImage: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80',
    heroImage: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1920&q=85',
    features: [
      'Visualiseur audio spectral dynamique sur la TV',
      'Buzzer instantané avec son personnalisé',
      'Mélodies cultes : Cinéma, Séries, Pop, Rétro',
      'Classement en direct'
    ],
    rules: [
      'Un extrait musical retentit sur la Smart TV.',
      'Appuyez le plus vite possible sur le buzzer de votre smartphone.',
      'Vous disposez de 8 secondes pour choisir le bon titre.',
      'Le joueur totalisant le plus de points l’emporte !'
    ]
  },
  {
    id: 'werewolf',
    title: 'LOUP-GAROU DU SALON',
    tagline: 'Le jeu de bluff et de déduction sociale',
    description: 'La nuit tombe sur le village... Les Loups-Garous désignent une victime secrète, la Voyante sonde les âmes et la Sorcière agit. Au lever du jour, débattez et démasquez les suspects sur la TV !',
    category: 'party',
    minPlayers: 3,
    maxPlayers: 12,
    durationMinutes: '15–30 min',
    difficulty: 'Moyen',
    badge: 'BLUFF',
    coverImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    heroImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1920&q=85',
    features: [
      'Rôle secret sur smartphone',
      'Cycle Jour / Nuit animé sur la TV',
      'Vote nocturne et actions confidentielles',
      'Débats et vote du village en direct'
    ],
    rules: [
      'Chaque joueur reçoit un rôle secret (Loup, Voyante, Villageois, Sorcière).',
      'La nuit, chaque rôle effectue son action discrètement sur son mobile.',
      'Le jour, les joueurs débattent ensemble et votent pour éliminer un suspect.',
      'Les villageois gagnent s’ils éliminent tous les loups.'
    ]
  },
  {
    id: 'president',
    title: 'LE PRÉSIDENT (TROUDUC)',
    tagline: 'Le jeu de cartes de défausse et de hiérarchie',
    description: 'Débarrassez-vous de vos cartes en jouant des simples, des paires ou des combinaisons supérieures ! Atteignez le statut de Président et dominez la partie.',
    category: 'cards',
    minPlayers: 3,
    maxPlayers: 8,
    durationMinutes: '15–25 min',
    difficulty: 'Moyen',
    badge: 'CARTES',
    coverImage: 'https://images.unsplash.com/photo-1541123437800-1bb1317badc2?auto=format&fit=crop&w=800&q=80',
    heroImage: 'https://images.unsplash.com/photo-1541123437800-1bb1317badc2?auto=format&fit=crop&w=1920&q=85',
    features: [
      'Main secrète sur smartphone',
      'Combinaisons multiples (paires, brelans, carrés)',
      'Rangs de fin de manche : Président, Neutre, Trouduc',
      'Inversion de hiérarchie'
    ],
    rules: [
      'Les cartes sont classées du 3 (plus faible) au 2 (plus fort).',
      'Posez une combinaison supérieure à celle sur la table.',
      'Le premier joueur sans cartes devient le Président.'
    ]
  },
  {
    id: 'poker',
    title: 'POKER TEXAS HOLD’EM',
    tagline: 'La table de poker sur grand écran',
    description: 'Vos cartes privées restent secrètes sur votre mobile, les cartes communes et le pot s’affichent sur la TV.',
    category: 'cards',
    minPlayers: 2,
    maxPlayers: 8,
    durationMinutes: '20–45 min',
    difficulty: 'Moyen',
    badge: 'CARTES',
    coverImage: 'https://images.unsplash.com/photo-1511193311914-0346f16efe90?auto=format&fit=crop&w=800&q=80',
    heroImage: 'https://images.unsplash.com/photo-1511193311914-0346f16efe90?auto=format&fit=crop&w=1920&q=85',
    features: [
      'Cartes privées confidentielles sur mobile',
      'Flop, Turn et River animés sur la TV',
      'Curseur de relance tactile et gestion du pot',
      'Showdown final'
    ],
    rules: [
      'Chaque joueur reçoit 2 cartes privées.',
      '5 cartes communes sont révélées au centre.',
      'La meilleure main de 5 cartes remporte le pot.'
    ]
  },
  {
    id: 'blackjack',
    title: 'BLACKJACK 21',
    tagline: 'Affrontez la banque et visez 21',
    description: 'Tirez des cartes, restez ou doublez votre mise sur votre smartphone pour battre le croupier de la TV.',
    category: 'cards',
    minPlayers: 1,
    maxPlayers: 7,
    durationMinutes: '10–20 min',
    difficulty: 'Facile',
    badge: 'CARTES',
    coverImage: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=800&q=80',
    heroImage: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=1920&q=85',
    features: [
      'Croupier IA de la Smart TV',
      'Calcul automatique du score',
      'Boutons Tirer, Rester, Doubler',
      'Paiement Blackjack 3:2'
    ],
    rules: [
      'Obtenez un score plus élevé que le croupier sans dépasser 21.',
      'Les têtes valent 10, l’As vaut 1 ou 11.',
      'Le croupier tire jusqu’à 17.'
    ]
  }
];

export const CATEGORIES = [
  { id: 'all', name: 'Tous les Jeux', icon: 'Gamepad2' },
  { id: 'popular', name: 'Tendances & Hits', icon: 'Flame' },
  { id: 'cards', name: 'Jeux de Cartes', icon: 'Sparkles' },
  { id: 'party', name: 'Soirée & Ambiance', icon: 'Trophy' },
  { id: 'reflexion', name: 'Société & Réflexion', icon: 'Brain' },
];
