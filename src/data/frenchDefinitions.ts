// Comprehensive French Scrabble Definitions & Lexicon Explanations (Client-side & TV UI)
// Provides rich definitions, grammatical nature and explanations for validated Scrabble words.

export interface WordDefinitionItem {
  word: string;
  nature: string;
  def: string;
}

export const FRENCH_DEFINITIONS: Record<string, { nature: string; def: string }> = {
  // --- 2-Letter Words (Crucial Scrabble Words) ---
  AA: { nature: 'nom masculin', def: 'Coulée de lave volcanique à surface rugueuse et chaotique.' },
  AH: { nature: 'interjection', def: 'Exprime la surprise, la joie, la douleur ou l’admiration.' },
  AI: { nature: 'nom masculin / verbe', def: 'Mammifère d’Amérique tropicale (paresseux à 3 doigts) OU verbe avoir.' },
  AN: { nature: 'nom masculin', def: 'Période de douze mois consécutifs ; année.' },
  AS: { nature: 'nom masculin', def: 'Carte à jouer portant le chiffre 1 ; personne très douée.' },
  AU: { nature: 'article contracté', def: 'Contraction de « à » et « le ».' },
  AY: { nature: 'nom masculin', def: 'Vin blanc effervescent produit à Aÿ en Champagne.' },
  BA: { nature: 'nom masculin', def: 'Dans la mythologie égyptienne, composante spirituelle de l’âme.' },
  BE: { nature: 'nom masculin / cri', def: 'Nom de la lettre B OU bêlement de la chèvre / brebis.' },
  BI: { nature: 'adjectif / nom', def: 'Abréviation de bisexuel ; préfixe signifiant deux fois.' },
  BU: { nature: 'participe passé', def: 'Participe passé du verbe boire.' },
  CA: { nature: 'pronom démonstratif', def: 'Forme abrégée familière de « cela ».' },
  CE: { nature: 'adjectif démonstratif', def: 'Désigne un être ou objet proche ou déjà mentionné.' },
  CI: { nature: 'adverbe', def: 'Désigne la proximité dans l’espace ou le temps (ex: ci-joint).' },
  DA: { nature: 'interjection', def: 'Terme familier marquant l’insistance ou l’affirmation (ex: oui-da).' },
  DE: { nature: 'préposition', def: 'Indique l’origine, l’appartenance, la matière ou la cause.' },
  DO: { nature: 'nom masculin', def: 'Première note de la gamme musicale diatonique.' },
  DU: { nature: 'article contracté / participe', def: 'Contraction de « de le » OU participe passé de devoir.' },
  EH: { nature: 'interjection', def: 'Sert à appeler, à attirer l’attention ou à marquer l’étonnement.' },
  EN: { nature: 'préposition / pronom', def: 'Indique le lieu, le temps, la matière OU remplace un complément.' },
  ES: { nature: 'verbe / préposition', def: 'Forme du verbe être (tu es) OU « en les » (docteur ès sciences).' },
  ET: { nature: 'conjonction', def: 'Conjonction de coordination reliant deux mots ou propositions.' },
  EU: { nature: 'participe passé', def: 'Participe passé du verbe avoir.' },
  EX: { nature: 'nom / préfixe', def: 'Ancien conjoint OU préfixe marquant l’antériorité ou l’extraction.' },
  FA: { nature: 'nom masculin', def: 'Quatrième note de la gamme musicale diatonique.' },
  FI: { nature: 'interjection', def: 'Exprime le dédain, le dégoût ou la réprobation (fi donc !).' },
  GO: { nature: 'nom masculin', def: 'Jeu de stratégie combinatoire asiatique avec pions noirs et blancs.' },
  HA: { nature: 'interjection', def: 'Exclamation de rire, de surprise ou de satisfaction.' },
  HE: { nature: 'interjection', def: 'Sert à héler ou à marquer l’ironie.' },
  HI: { nature: 'interjection', def: 'Onomatopée exprimant un rire étouffé.' },
  HO: { nature: 'interjection', def: 'Cri pour appeler, arrêter un cheval ou marquer la surprise.' },
  IF: { nature: 'nom masculin', def: 'Arbre conifère sempervirent aux feuilles linéaires et toxiques.' },
  IL: { nature: 'pronom personnel', def: 'Pronom sujet de la 3e personne du masculin singulier.' },
  IN: { nature: 'adjectif invariable', def: 'À la mode, branché, tendance.' },
  JE: { nature: 'pronom personnel', def: 'Pronom de la 1ère personne du singulier.' },
  KA: { nature: 'nom masculin', def: 'Double spirituel de l’individu dans l’Égypte antique.' },
  LA: { nature: 'article / note', def: 'Article défini féminin OU 6e note de la gamme musicale.' },
  LE: { nature: 'article défini', def: 'Article défini masculin singulier.' },
  LI: { nature: 'nom masculin', def: 'Ancienne unité de mesure de distance chinoise (≈ 500 mètres).' },
  LU: { nature: 'participe passé', def: 'Participe passé du verbe lire.' },
  MA: { nature: 'adjectif possessif', def: 'Indique ce qui appartient à la première personne féminine.' },
  ME: { nature: 'pronom personnel', def: 'Pronom de la 1ère personne du singulier en complément.' },
  MI: { nature: 'nom / adverbe', def: '3e note de musique OU préfixe signifiant « moitié / milieu ».' },
  MU: { nature: 'nom masculin', def: 'Douzième lettre de l’alphabet grec (μ, Μ).' },
  NA: { nature: 'interjection', def: 'Exclamation enfantine marquant le défi ou la provocation.' },
  NE: { nature: 'adverbe', def: 'Premier élément de la négation en français.' },
  NI: { nature: 'conjonction', def: 'Conjonction de coordination exprimant la négation.' },
  NO: { nature: 'nom masculin', def: 'Drame lyrique traditionnel japonais masqué (forme savante : Nô).' },
  NU: { nature: 'adjectif / nom', def: 'Dépourvu de vêtement, dépouillé.' },
  OC: { nature: 'nom masculin', def: 'Ancienne langue romane parlée dans le sud de la France.' },
  OH: { nature: 'interjection', def: 'Exprime la surprise, l’admiration ou l’indignation.' },
  ON: { nature: 'pronom indéfini', def: 'Désigne une personne indéterminée ; équivalent familier de « nous ».' },
  OR: { nature: 'nom / conjonction', def: 'Métal précieux jaune OU conjonction de coordination de raisonnement.' },
  OS: { nature: 'nom masculin', def: 'Élément rigide formant la charpente du squelette des vertébrés.' },
  OU: { nature: 'conjonction', def: 'Exprime une alternative ou un choix.' },
  PI: { nature: 'nom masculin', def: '16e lettre grecque (π) et constante géométrique (≈ 3,14159).' },
  PU: { nature: 'participe passé', def: 'Participe passé du verbe pouvoir.' },
  QI: { nature: 'nom masculin', def: 'Dans la pensée chinoise, souffle vital universel.' },
  RA: { nature: 'nom masculin', def: 'Dieu soleil créateur dans l’Égypte antique.' },
  RE: { nature: 'nom masculin', def: 'Deuxième note de la gamme musicale diatonique.' },
  RI: { nature: 'participe passé', def: 'Participe passé du verbe rire.' },
  SA: { nature: 'adjectif possessif', def: 'Indique ce qui appartient à la 3e personne féminine.' },
  SE: { nature: 'pronom réfléchi', def: 'Pronom personnel employé avec les verbes pronominaux.' },
  SI: { nature: 'conjonction / note', def: 'Exprime la condition OU 7e note de musique.' },
  SU: { nature: 'participe passé', def: 'Participe passé du verbe savoir.' },
  TA: { nature: 'adjectif possessif', def: 'Indique ce qui appartient à la 2e personne féminine.' },
  TE: { nature: 'pronom personnel', def: 'Pronom complément de la 2e personne.' },
  TO: { nature: 'nom masculin', def: 'Unité de capacité pour les liquides au Japon (≈ 18 L).' },
  TU: { nature: 'pronom personnel', def: 'Pronom sujet de la 2e personne du singulier.' },
  UN: { nature: 'article / nombre', def: 'Désigne un élément singulier OU premier entier naturel.' },
  US: { nature: 'nom masculin pluriel', def: 'Usages, coutumes et traditions (ex: us et coutumes).' },
  UT: { nature: 'nom masculin', def: 'Nom originel de la note « do » dans la notation musicale ancienne.' },
  VA: { nature: 'verbe', def: 'Forme du verbe aller à la 3e personne du singulier.' },
  VE: { nature: 'nom masculin', def: 'Nom traditionnel de la lettre V.' },
  VS: { nature: 'préposition', def: 'Abréviation de versus (« contre », « face à »).' },
  VU: { nature: 'participe passé', def: 'Participe passé du verbe voir.' },
  WU: { nature: 'nom masculin', def: 'Groupe de dialectes chinois parlé notamment à Shanghai.' },
  XI: { nature: 'nom masculin', def: 'Quatorzième lettre de l’alphabet grec (ξ, Ξ).' },
  YU: { nature: 'nom masculin', def: 'Instrument à vent traditionnel chinois en bambou.' },

  // --- Common 3-8 Letter Scrabble Words ---
  CHAT: { nature: 'nom masculin', def: 'Petit félin domestique carnivore réputé pour son agilité.' },
  CHIEN: { nature: 'nom masculin', def: 'Mammifère carnivore domestique, fidèle compagnon de l’homme.' },
  SALON: { nature: 'nom masculin', def: 'Pièce principale de détente d’une maison ; exposition thématique.' },
  SALONS: { nature: 'nom masculin pluriel', def: 'Pluriel de salon ; pièces de vie ou expositions.' },
  JEU: { nature: 'nom masculin', def: 'Activité de loisir ludique régie par des règles précises.' },
  JEUX: { nature: 'nom masculin pluriel', def: 'Pluriel de jeu ; divertissements, concours et compétitions.' },
  ARBRE: { nature: 'nom masculin', def: 'Végétal ligneux pourvu d’un tronc dressé et de branches garnies de feuilles.' },
  AVENIR: { nature: 'nom masculin', def: 'Période qui suit le moment présent ; destinée future.' },
  AVENIRS: { nature: 'nom masculin pluriel', def: 'Pluriel d’avenir ; perspectives futures.' },
  VOYAGE: { nature: 'nom masculin', def: 'Action de se déplacer sur de longues distances pour découvrir ou visiter.' },
  SCRABBLE: { nature: 'nom masculin', def: 'Jeu de société de lettres et de stratégie combinatoire sur plateau 15×15.' },
  AMOUR: { nature: 'nom masculin', def: 'Sentiment d’affection intense, d’attachement et de dévouement.' },
  BLEU: { nature: 'adjectif / nom', def: 'Couleur primaire évoquant le ciel limpide et les océans.' },
  EAU: { nature: 'nom féminin', def: 'Liquide transparent incolore et inodore vital pour tout être vivant.' },
  EAUX: { nature: 'nom féminin pluriel', def: 'Pluriel d’eau ; étendues marines ou thermales.' },
  ZEBRE: { nature: 'nom masculin', def: 'Mammifère ongulé d’Afrique à la robe rayée noir et blanc.' },
  VICTOIRE: { nature: 'nom féminin', def: 'Succès complet et triomphe dans une partie, un tournoi ou un jeu.' },
  ETOILE: { nature: 'nom féminin', def: 'Corps céleste gazeux rayonnant sa propre lumière par fusion nucléaire.' },
  MAISON: { nature: 'nom féminin', def: 'Bâtiment d’habitation abritant une famille ou un foyer.' },
  SOLEIL: { nature: 'nom masculin', def: 'Étoile centrale du système solaire éclairant notre planète.' },
  LUNE: { nature: 'nom féminin', def: 'Satellite naturel de la Terre illuminant la nuit.' },
  COEUR: { nature: 'nom masculin', def: 'Organe musculaire propulseur du sang ; symbole des sentiments.' },
  FLEUR: { nature: 'nom féminin', def: 'Partie reproductrice parée de pétales des plantes angiospermes.' },
  MOT: { nature: 'nom masculin', def: 'Unité lexicale douée de sens formée de lettres et sons.' },
  MOTS: { nature: 'nom masculin pluriel', def: 'Pluriel de mot ; éléments essentiels du vocabulaire.' },
  SCORE: { nature: 'nom masculin', def: 'Nombre de points cumulés au cours d’une partie.' },
  SCORES: { nature: 'nom masculin pluriel', def: 'Pluriel de score ; total des points de jeu.' },
  TOUR: { nature: 'nom masculin / féminin', def: 'Tour de rôle permettant d’agir OU haute construction.' },
  TOURS: { nature: 'nom masculin / féminin pluriel', def: 'Pluriel de tour ; mouvements circulaires ou édifices.' },
  CHANCE: { nature: 'nom féminin', def: 'Circonstance favorable et heureuse facilitant le succès.' },
  TABLE: { nature: 'nom féminin', def: 'Meuble avec plateau horizontal monté sur pieds.' },
  LETTRE: { nature: 'nom féminin', def: 'Caractère de l’alphabet OU message écrit envoyé à un destinataire.' },
  LETTRES: { nature: 'nom féminin pluriel', def: 'Pluriel de lettre ; caractères alphabétiques.' },
  BONUS: { nature: 'nom masculin', def: 'Avantage ou points additionnels accordés en récompense.' },
  NOX: { nature: 'nom féminin', def: 'Dans la mythologie romaine, déesse primordiale de la Nuit.' },
  SIC: { nature: 'adverbe latin', def: 'Indique qu’une citation ou un mot est retranscrit textuellement.' },
  ARIA: { nature: 'nom féminin / masculin', def: 'Air mélodique d’opéra OU tracas / embarras.' },
  OXO: { nature: 'nom masculin', def: 'Composé chimique renfermant de l’oxygène lié par double liaison.' },
  KIF: { nature: 'nom masculin', def: 'Moment de plaisir vif OU substance résineuse aromatique.' },
};

/**
 * Returns a definition object for any Scrabble word
 */
export function getFrenchDefinition(rawWord: string): WordDefinitionItem {
  if (!rawWord || typeof rawWord !== 'string') {
    return {
      word: 'MOT',
      nature: 'nom masculin',
      def: 'Unité linguistique et lexicale porteuse de sens.',
    };
  }

  const word = rawWord.trim().toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  if (FRENCH_DEFINITIONS[word]) {
    return {
      word,
      nature: FRENCH_DEFINITIONS[word].nature,
      def: FRENCH_DEFINITIONS[word].def,
    };
  }

  // Morphological plurals
  if (word.endsWith('S') && word.length >= 3) {
    const singular = word.slice(0, -1);
    if (FRENCH_DEFINITIONS[singular]) {
      return {
        word,
        nature: 'nom / adjectif pluriel',
        def: `Pluriel de « ${singular.toLowerCase()} » : ${FRENCH_DEFINITIONS[singular].def}`,
      };
    }
  }

  // Morphological verbs
  if (word.endsWith('ER')) {
    return {
      word,
      nature: 'verbe à l’infinitif',
      def: `Action verbale du 1er groupe désignant le fait de ${word.toLowerCase()}.`,
    };
  }
  if (word.endsWith('EZ') || word.endsWith('ONS') || word.endsWith('ENT') || word.endsWith('AIT')) {
    return {
      word,
      nature: 'forme verbale conjuguée',
      def: `Conjugaison d’un verbe français exprimant une action ou un état.`,
    };
  }
  if (word.endsWith('ANT')) {
    return {
      word,
      nature: 'participe présent',
      def: `Forme verbale marquant une action en cours d’accomplissement.`,
    };
  }
  if (word.endsWith('TION') || word.endsWith('AGE') || word.endsWith('MENT')) {
    return {
      word,
      nature: 'nom commun',
      def: `Désigne l’action, le processus ou le résultat de l’activité correspondante.`,
    };
  }

  return {
    word,
    nature: 'terme officiel ODS',
    def: `Mot français officiel reconnu et validé par l’Officiel du Scrabble (ODS).`,
  };
}
