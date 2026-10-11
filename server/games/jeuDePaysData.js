// Dictionnaires de référence pour « JEU DE PAYS »
// Permet aux bots de jouer de vrais mots et d'évaluer la validité des réponses

export const COUNTRIES_DATABASE = [
  // A
  'Afghanistan', 'Afrique du Sud', 'Albanie', 'Algérie', 'Allemagne', 'Andorre', 'Angola', 
  'Antigua-et-Barbuda', 'Arabie saoudite', 'Argentine', 'Arménie', 'Australie', 'Autriche', 'Azerbaïdjan',
  // B
  'Bahamas', 'Bahreïn', 'Bangladesh', 'Barbade', 'Belgique', 'Belize', 'Bénin', 'Bhoutan', 
  'Biélorussie', 'Birmanie', 'Myanmar', 'Bolivie', 'Bosnie-Herzégovine', 'Botswana', 'Brésil', 
  'Brunei', 'Bulgarie', 'Burkina Faso', 'Burundi',
  // C
  'Cambodge', 'Cameroun', 'Canada', 'Cap-Vert', 'Centrafrique', 'Chili', 'Chine', 'Chypre', 
  'Colombie', 'Comores', 'Congo', 'Corée du Nord', 'Corée du Sud', 'Costa Rica', "Côte d'Ivoire", 
  'Croatie', 'Cuba',
  // D
  'Danemark', 'Djibouti', 'Dominique',
  // E
  'Égypte', 'Émirats arabes unis', 'Équateur', 'Érythrée', 'Espagne', 'Estonie', 'Eswatini', 
  'États-Unis', 'Éthiopie',
  // F
  'Fidji', 'Finlande', 'France',
  // G
  'Gabon', 'Gambie', 'Géorgie', 'Ghana', 'Grèce', 'Grenade', 'Guatemala', 'Guinée', 
  'Guinée-Bissau', 'Guinée équatoriale', 'Guyana',
  // H
  'Haïti', 'Honduras', 'Hongrie',
  // I
  'Inde', 'Indonésie', 'Irak', 'Iran', 'Irlande', 'Islande', 'Israël', 'Italie',
  // J
  'Jamaïque', 'Japon', 'Jordanie',
  // K
  'Kazakhstan', 'Kenya', 'Kirghizistan', 'Kiribati', 'Koweït',
  // L
  'Laos', 'Lesotho', 'Lettonie', 'Liban', 'Libéria', 'Libye', 'Liechtenstein', 'Lituanie', 'Luxembourg',
  // M
  'Macédoine', 'Madagascar', 'Malaisie', 'Malawi', 'Maldives', 'Mali', 'Malte', 'Maroc', 
  'Maurice', 'Mauritanie', 'Mexique', 'Micronésie', 'Moldavie', 'Monaco', 'Mongolie', 
  'Monténégro', 'Mozambique',
  // N
  'Namibie', 'Nauru', 'Népal', 'Nicaragua', 'Niger', 'Nigéria', 'Norvège', 'Nouvelle-Zélande',
  // O
  'Oman', 'Ouganda', 'Ouzbékistan',
  // P
  'Pakistan', 'Palaos', 'Palestine', 'Panama', 'Papouasie-Nouvelle-Guinée', 'Paraguay', 
  'Pays-Bas', 'Pérou', 'Philippines', 'Pologne', 'Portugal',
  // Q
  'Qatar',
  // R
  'République centrafricaine', 'République démocratique du Congo', 'République dominicaine', 
  'République tchèque', 'Tchéquie', 'Roumanie', 'Royaume-Uni', 'Russie', 'Rwanda',
  // S
  'Saint-Christophe-et-Niévès', 'Sainte-Lucie', 'Saint-Marin', 'Saint-Vincent-et-les-Grenadines', 
  'Salomon', 'Salvador', 'Samoa', 'Sao Tomé-et-Principe', 'Sénégal', 'Serbie', 'Seychelles', 
  'Sierra Leone', 'Singapour', 'Slovaquie', 'Slovénie', 'Somalie', 'Soudan', 'Soudan du Sud', 
  'Sri Lanka', 'Suède', 'Suisse', 'Suriname', 'Syrie',
  // T
  'Tadjikistan', 'Taïwan', 'Tanzanie', 'Tchad', 'Thaïlande', 'Timor oriental', 'Togo', 'Tonga', 
  'Trinité-et-Tobago', 'Tunisie', 'Turkménistan', 'Turquie', 'Tuvalu',
  // U
  'Ukraine', 'Uruguay',
  // V
  'Vanuatu', 'Vatican', 'Venezuela', 'Viêt Nam', 'Vietnam',
  // Y
  'Yémen',
  // Z
  'Zambie', 'Zimbabwe'
];

export const CATEGORIES_LEXICON = {
  pays: COUNTRIES_DATABASE,
  animal: [
    'Aigle', 'Albatros', 'Alligator', 'Alpaga', 'Âne', 'Anguille', 'Antilope', 'Araignée', 'Autruche',
    'Babouin', 'Baleine', 'Barracuda', 'Blaireau', 'Bœuf', 'Bouquetin', 'Buffle',
    'Caméléon', 'Canard', 'Castor', 'Cerf', 'Chacal', 'Chameau', 'Chat', 'Cheval', 'Chèvre', 'Chien', 'Chimpanzé', 'Chouette', 'Cochon', 'Colibri', 'Coyote', 'Crabe', 'Crocodile',
    'Dauphin', 'Dinde', 'Dromadaire',
    'Écureuil', 'Éléphant', 'Élan', 'Escargot', 'Espadon',
    'Faucon', 'Fennec', 'Flamant rose', 'Fouine', 'Fourmi', 'Furet',
    'Gazelle', 'Girafe', 'Gorille', 'Grenouille', 'Guépard',
    'Hamster', 'Hérisson', 'Héron', 'Hibou', 'Hippopotame', 'Hirondelle', 'Hyène',
    'Iguane', 'Impala',
    'Jaguar',
    'Kangourou', 'Koala',
    'Lamantin', 'Lama', 'Lapin', 'Léopard', 'Lémurien', 'Lézard', 'Lion', 'Loir', 'Loutre', 'Loup', 'Lynx',
    'Mammouth', 'Mandrill', 'Manchot', 'Marmotte', 'Marsouin', 'Merle', 'Moineau', 'Morue', 'Mouette', 'Mouton', 'Moustique',
    'Narval',
    'Oie', 'Opossum', 'Orang-outan', 'Orque', 'Oryx', 'Otarie', 'Ours',
    'Panda', 'Panthère', 'Paon', 'Pélican', 'Perroquet', 'Phoque', 'Pigeon', 'Piranha', 'Poney', 'Porc-épic', 'Poulpe', 'Puma',
    'Ragondin', 'Raton laveur', 'Renard', 'Requin', 'Rhinocéros', 'Rossignol',
    'Salamandre', 'Sanglier', 'Sardine', 'Saumon', 'Scorpion', 'Serpent', 'Singe', 'Souris', 'Suricate',
    'Tapir', 'Taupe', 'Taureau', 'Tigre', 'Tortue', 'Toucan',
    'Vache', 'Vautour', 'Vipère',
    'Zèbre', 'Zébu'
  ],
  marque_voiture: [
    'Alfa Romeo', 'Alpine', 'Aston Martin', 'Audi', 'Austin',
    'Bentley', 'BMW', 'Bugatti', 'Buick', 'BYD',
    'Cadillac', 'Chevrolet', 'Chrysler', 'Citroën', 'Cupra',
    'Dacia', 'Daewoo', 'Daihatsu', 'Dodge', 'DS',
    'Ferrari', 'Fiat', 'Ford',
    'Genesis', 'GMC',
    'Honda', 'Hummer', 'Hyundai',
    'Infiniti', 'Isuzu', 'Iveco',
    'Jaguar', 'Jeep',
    'Kia', 'Koenigsegg',
    'Lada', 'Lamborghini', 'Lancia', 'Land Rover', 'Lexus', 'Lotus',
    'Maserati', 'Maybach', 'Mazda', 'McLaren', 'Mercedes', 'MG', 'Mini', 'Mitsubishi',
    'Nissan',
    'Opel',
    'Pagani', 'Peugeot', 'Polestar', 'Pontiac', 'Porsche',
    'Renault', 'Rolls-Royce', 'Rover',
    'Saab', 'Seat', 'Skoda', 'Smart', 'Subaru', 'Suzuki',
    'Tesla', 'Toyota', 'Triumph',
    'Vauxhall', 'Volkswagen', 'Volvo'
  ],
  prenom: [
    'Adam', 'Adrien', 'Agathe', 'Alexandre', 'Alice', 'Ambre', 'Antoine', 'Arthur', 'Axel',
    'Baptiste', 'Benjamin', 'Bastien', 'Béatrice', 'Benoît',
    'Camille', 'Chloé', 'Clara', 'Clément', 'Cyril',
    'Damien', 'David', 'Denis', 'Diane', 'Dylan',
    'Éléonore', 'Élise', 'Émilie', 'Emma', 'Enzo', 'Esteban', 'Ethan',
    'Fabien', 'Félix', 'Florent', 'Florian', 'François',
    'Gabriel', 'Gaspard', 'Gauthier', 'Guillaume',
    'Hugo', 'Hélène', 'Henri',
    'Inès', 'Iris', 'Isabelle',
    'Jade', 'Jean', 'Jérémy', 'Jordan', 'Jules', 'Julien', 'Juliette',
    'Kévin', 'Kylian',
    'Léa', 'Léo', 'Liam', 'Louis', 'Louise', 'Lucas', 'Lucie',
    'Manon', 'Marc', 'Marie', 'Mathis', 'Maxime', 'Mehdi', 'Mélanie', 'Mia', 'Michel',
    'Nathan', 'Nicolas', 'Nina', 'Noé', 'Nolan',
    'Océane', 'Olivier', 'Olivia',
    'Paul', 'Pauline', 'Pierre', 'Priscille',
    'Raphaël', 'Renaud', 'Robin', 'Romain', 'Rose',
    'Samuel', 'Sarah', 'Sébastien', 'Simon', 'Sofia',
    'Théo', 'Thomas', 'Tom',
    'Valentin', 'Victor', 'Victoria', 'Vincent',
    'William',
    'Yanis', 'Youssef',
    'Zoé'
  ],
  aliment: [
    'Abricot', 'Agneau', 'Ail', 'Amande', 'Ananas', 'Artichaut', 'Asperge', 'Avocat',
    'Bacon', 'Baguette', 'Banane', 'Basilic', 'Bœuf', 'Brioche', 'Brocoli', 'Burger',
    'Cacao', 'Café', 'Canard', 'Carotte', 'Cerise', 'Champignon', 'Chocolat', 'Citron', 'Clémentine', 'Concombre', 'Courgette', 'Crêpe', 'Croissant',
    'Datte', 'Dinde',
    'Éclair', 'Épinard',
    'Farine', 'Figue', 'Foie gras', 'Fraise', 'Framboise', 'Frites', 'Fromage',
    'Gâteau', 'Gaufre', 'Gingembre', 'Grenade', 'Groseille',
    'Haricot', 'Huile', 'Huître',
    'Jambon',
    'Kaki', 'Kiwi',
    'Lait', 'Laitue', 'Lentilles', 'Lasagne',
    'Maïs', 'Mandarine', 'Mangue', 'Melon', 'Miel', 'Moutarde', 'Mousse au chocolat',
    'Navet', 'Noisette', 'Noix', 'Nouilles',
    'Oignon', 'Olive', 'Omelette', 'Orange',
    'Pain', 'Pamplemousse', 'Pastèque', 'Pâtes', 'Pêche', 'Pizza', 'Poire', 'Poireau', 'Pois', 'Poivron', 'Pomme', 'Poulet',
    'Quiche',
    'Radis', 'Raisin', 'Ravioli', 'Riz', 'Rôti',
    'Salade', 'Sandwich', 'Saucisse', 'Saumon', 'Soupe', 'Spaghetti', 'Steak', 'Sushi',
    'Tacos', 'Tarte', 'Thé', 'Thon', 'Tomate', 'Truite',
    'Vanille', 'Veau',
    'Yaourt'
  ],
  metier: [
    'Acteur', 'Agriculteur', 'Architecte', 'Artiste', 'Avocat',
    'Banquier', 'Barbier', 'Barman', 'Boucher', 'Boulanger',
    'Chanteur', 'Charpentier', 'Chauffeur', 'Chef cuisinier', 'Chirurgien', 'Coiffeur', 'Comptable', 'Cordonnier',
    'Danseur', 'Dentiste', 'Détective', 'Designer', 'Docteur',
    'Électricien', 'Écrivain', 'Éducateur', 'Enseignant', 'Épicier',
    'Facteur', 'Fleuriste', 'Forgeron',
    'Garagiste', 'Gendarme', 'Guide touristique',
    'Horloger', 'Hôtelier',
    'Infirmier', 'Ingénieur', 'Inspecteur',
    'Jardinier', 'Journaliste', 'Juge',
    'Kinésithérapeute',
    'Libraire', 'Livreur',
    'Maçon', 'Magasinier', 'Magistrat', 'Manager', 'Marin', 'Mécanicien', 'Médecin', 'Menuisier', 'Militaire', 'Musicien',
    'Notaire', 'Nounou', 'Nutritionniste',
    'Opticien', 'Orthophoniste',
    'Pâtissier', 'Paysagiste', 'Peintre', 'Pharmacien', 'Photographe', 'Pilote', 'Plombier', 'Policier', 'Pompier', 'Professeur', 'Psychologue',
    'Radiologue', 'Réalisateur',
    'Sage-femme', 'Secrétaire', 'Serveur', 'Soudeur',
    'Tailleur', 'Taxi', 'Technicien', 'Traducteur',
    'Vendeur', 'Vétérinaire', 'Vigneron',
    'Webmestre', 'Webdesigner',
    'Zoologiste'
  ],
  ville: [
    'Abidjan', 'Alger', 'Amsterdam', 'Athènes',
    'Barcelone', 'Berlin', 'Bogota', 'Bordeaux', 'Bruxelles', 'Buenos Aires',
    'Casablanca', 'Chicago', 'Copenhague',
    'Dakar', 'Dubaï', 'Dublin',
    'Florence', 'Francfort',
    'Genève',
    'Hanoï', 'Helsinki',
    'Istanbul',
    'Jakarta', 'Jérusalem',
    'Le Caire', 'Lille', 'Lisbonne', 'Londres', 'Los Angeles', 'Lyon',
    'Madrid', 'Manchester', 'Marrakech', 'Marseille', 'Mexico', 'Milan', 'Monaco', 'Montréal', 'Moscou', 'Munich',
    'Nairobi', 'Nantes', 'Naples', 'New York', 'Nice',
    'Oslo', 'Ottawa',
    'Paris', 'Pékin', 'Prague',
    'Rabat', 'Rio de Janeiro', 'Rome',
    'Séoul', 'Séville', 'Strasbourg', 'Sydney',
    'Tokyo', 'Toronto', 'Toulouse', 'Tunis',
    'Venise', 'Vienne',
    'Washington',
    'Yaoundé',
    'Zurich'
  ]
};
