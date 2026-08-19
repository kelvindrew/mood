export interface FourPicsPuzzle {
  id: string;
  word: string; // Target uppercase French word (without accents)
  category: string;
  difficulty: 'facile' | 'moyen' | 'difficile';
  images: [string, string, string, string];
}

export const FOUR_PICS_PUZZLES: FourPicsPuzzle[] = [
  {
    id: 'p1',
    word: 'PLAGE',
    category: 'Nature & Vacances',
    difficulty: 'facile',
    images: [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80', // Mer & sable
      'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=600&q=80', // Transats & parasol
      'https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=600&q=80', // Vagues turquoise
      'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?auto=format&fit=crop&w=600&q=80', // Soleil couchant sur le sable
    ],
  },
  {
    id: 'p2',
    word: 'CAFE',
    category: 'Nourriture & Boisson',
    difficulty: 'facile',
    images: [
      'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=80', // Tasse de café fumante
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80', // Grains de café
      'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=600&q=80', // Terrasse de bistrot
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=600&q=80', // Machine expresso
    ],
  },
  {
    id: 'p3',
    word: 'LIVRE',
    category: 'Culture & Objets',
    difficulty: 'facile',
    images: [
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80', // Ouvrage ouvert
      'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=600&q=80', // Bibliothèque
      'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80', // Pile de romans
      'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=600&q=80', // Personne lisant
    ],
  },
  {
    id: 'p4',
    word: 'MUSIQUE',
    category: 'Arts & Loisirs',
    difficulty: 'moyen',
    images: [
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80', // Casque audio
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80', // Concert en live
      'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=600&q=80', // Guitare et partition
      'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&q=80', // DJ mix platines
    ],
  },
  {
    id: 'p5',
    word: 'BALLON',
    category: 'Sport & Fête',
    difficulty: 'facile',
    images: [
      'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=600&q=80', // Ballon de football
      'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=600&q=80', // Ballons baudruche fête
      'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=600&q=80', // Ballon de basket
      'https://images.unsplash.com/photo-1507034589631-9433cc6bc453?auto=format&fit=crop&w=600&q=80', // Montgolfière géante
    ],
  },
  {
    id: 'p6',
    word: 'FLEUR',
    category: 'Nature & Botanique',
    difficulty: 'facile',
    images: [
      'https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=600&q=80', // Bouquet de tulipes
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80', // Abeille butinant
      'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=600&q=80', // Rose rouge
      'https://images.unsplash.com/photo-1470240731273-7821a6eeb6bd?auto=format&fit=crop&w=600&q=80', // Champ fleuri
    ],
  },
  {
    id: 'p7',
    word: 'VOITURE',
    category: 'Transport',
    difficulty: 'facile',
    images: [
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80', // Supercar sur route
      'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=600&q=80', // Phares de nuit
      'https://images.unsplash.com/photo-1489824904134-891ab64532f1?auto=format&fit=crop&w=600&q=80', // Volant et tableau de bord
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=600&q=80', // Roue jante alliage
    ],
  },
  {
    id: 'p8',
    word: 'CHEF',
    category: 'Métiers & Cuisine',
    difficulty: 'facile',
    images: [
      'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=600&q=80', // Cuisinier en toque
      'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=600&q=80', // Plat gastronomique
      'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=600&q=80', // Cuisine de restaurant
      'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=80', // Couteau de découpe
    ],
  },
  {
    id: 'p9',
    word: 'EAU',
    category: 'Éléments & Nature',
    difficulty: 'facile',
    images: [
      'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=600&q=80', // Goutte d'eau macro
      'https://images.unsplash.com/photo-1437482078695-73f5ca6c96e2?auto=format&fit=crop&w=600&q=80', // Cascade torrentielle
      'https://images.unsplash.com/photo-1559827291-72ee739d0d9a?auto=format&fit=crop&w=600&q=80', // Verre d'eau pure
      'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=600&q=80', // Océan infini
    ],
  },
  {
    id: 'p10',
    word: 'NUIT',
    category: 'Temps & Ciel',
    difficulty: 'facile',
    images: [
      'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80', // Ciel étoilé & Voie lactée
      'https://images.unsplash.com/photo-1532767153582-b1a0e5145009?auto=format&fit=crop&w=600&q=80', // Pleine lune
      'https://images.unsplash.com/photo-1477959858617-67f30bc75b82?auto=format&fit=crop&w=600&q=80', // Ville illuminée
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80', // Chouette dans l'obscurité
    ],
  },
  {
    id: 'p11',
    word: 'OR',
    category: 'Matières & Trésors',
    difficulty: 'facile',
    images: [
      'https://images.unsplash.com/photo-1610375461246-83df859d849d?auto=format&fit=crop&w=600&q=80', // Lingots empilés
      'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&q=80', // Bague alliance dorée
      'https://images.unsplash.com/photo-1589487391730-58f20eb2c308?auto=format&fit=crop&w=600&q=80', // Médaille de vainqueur
      'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=600&q=80', // Montre de luxe
    ],
  },
  {
    id: 'p12',
    word: 'CINEMA',
    category: 'Culture & Médias',
    difficulty: 'moyen',
    images: [
      'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80', // Salle avec sièges rouges
      'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=600&q=80', // Pop-corn & soda
      'https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=600&q=80', // Caméra de tournage
      'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=600&q=80', // Clap de cinéma
    ],
  },
  {
    id: 'p13',
    word: 'FLEUVE',
    category: 'Géographie & Nature',
    difficulty: 'moyen',
    images: [
      'https://images.unsplash.com/photo-1508873696983-2df57046475a?auto=format&fit=crop&w=600&q=80', // Pont traversant les eaux
      'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80', // Pirogue naviguant
      'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=600&q=80', // Berges verdoyantes
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80', // Courant d'eau serpentant
    ],
  },
  {
    id: 'p14',
    word: 'LION',
    category: 'Animaux & Faune',
    difficulty: 'facile',
    images: [
      'https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=600&q=80', // Mâle à crinière majestueuse
      'https://images.unsplash.com/photo-1534188753412-3e26d0d618d6?auto=format&fit=crop&w=600&q=80', // Lionne chassant
      'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=600&q=80', // Lionceau joueur
      'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=600&q=80', // Savane africaine
    ],
  },
  {
    id: 'p15',
    word: 'AVION',
    category: 'Voyage & Transport',
    difficulty: 'facile',
    images: [
      'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=600&q=80', // Appareil dans les nuages
      'https://images.unsplash.com/photo-1506015391300-4802dc74de2e?auto=format&fit=crop&w=600&q=80', // Piste d'atterrissage
      'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&w=600&q=80', // Hublot avec vue sur l'aile
      'https://images.unsplash.com/photo-1542296332-2e4473faf563?auto=format&fit=crop&w=600&q=80', // Tour de contrôle
    ],
  },
];
