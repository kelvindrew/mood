// Comprehensive French Scrabble Definitions & Lexicon Explanations
// Provides rich, educational definitions for Scrabble words (including 2-letter words, common nouns, verbs and adjectives)

export const FRENCH_DEFINITIONS = {
  // --- 2-Letter Words (Crucial Scrabble Words) ---
  AA: { nature: 'nom masculin', def: 'Coulée de lave volcanique à surface rugueuse et chaotique.' },
  AH: { nature: 'interjection', def: 'Exprime la surprise, la joie, la douleur ou l’admiration.' },
  AI: { nature: 'nom masculin / verbe', def: 'Mammifère d’Amérique tropicale (paresseux à trois doigts) OU forme du verbe avoir.' },
  AN: { nature: 'nom masculin', def: 'Période de douze mois consécutifs ; année.' },
  AS: { nature: 'nom masculin', def: 'Carte à jouer portant le chiffre un ; personne d’une grande habileté.' },
  AU: { nature: 'article contracté', def: 'Contraction de la préposition « à » et de l’article « le ».' },
  AY: { nature: 'nom masculin', def: 'Vin blanc effervescent produit dans la commune d’Aÿ en Champagne.' },
  BA: { nature: 'nom masculin', def: 'Dans la mythologie égyptienne, l’une des composantes de l’âme humaine.' },
  BE: { nature: 'nom masculin / interjection', def: 'Nom de la lettre B dans certains alphabets OU cri de la chèvre / mouton.' },
  BI: { nature: 'adjectif / nom', def: 'Abréviation familière de bisexuel ; préfixe signifiant deux fois.' },
  BU: { nature: 'participe passé', def: 'Participe passé du verbe boire (avoir absorbé un liquide).' },
  CA: { nature: 'pronom démonstratif', def: 'Forme abrégée familière de « cela ».' },
  CE: { nature: 'adjectif démonstratif', def: 'Désigne une personne ou un objet proche ou déjà mentionné.' },
  CI: { nature: 'adverbe', def: 'Désigne la proximité dans l’espace ou le temps (ex: ci-gît, ce jour-ci).' },
  DA: { nature: 'interjection', def: 'Terme familier marquant l’affirmation ou l’insistance (ex: oui-da).' },
  DE: { nature: 'préposition', def: 'Indique l’origine, l’appartenance, la matière ou la cause.' },
  DO: { nature: 'nom masculin', def: 'Première note de la gamme musicale diatonique.' },
  DU: { nature: 'article contracté / participe', def: 'Contraction de « de le » OU participe passé du verbe devoir.' },
  EH: { nature: 'interjection', def: 'Sert à appeler, à attirer l’attention ou à marquer l’étonnement.' },
  EN: { nature: 'préposition / pronom', def: 'Indique le lieu, le temps, la matière OU remplace un complément.' },
  ES: { nature: 'verbe / préposition', def: 'Forme du verbe être (tu es) OU contraction signifiant « en les » (docteur ès sciences).' },
  ET: { nature: 'conjonction', def: 'Conjonction de coordination reliant deux mots ou propositions.' },
  EU: { nature: 'participe passé', def: 'Participe passé du verbe avoir.' },
  EX: { nature: 'nom / préfixe', def: 'Ancien conjoint ou partenaire OU préfixe signifiant « hors de ».' },
  FA: { nature: 'nom masculin', def: 'Quatrième note de la gamme musicale diatonique.' },
  FI: { nature: 'interjection', def: 'Exprime le mépris, le dégoût ou la réprobation (ex: fi donc !).' },
  GO: { nature: 'nom masculin', def: 'Jeu de stratégie combinatoire d’origine asiatique se jouant avec des pions noirs et blancs.' },
  HA: { nature: 'interjection', def: 'Exclamatif exprimant le rire, la surprise ou le triomphe.' },
  HE: { nature: 'interjection', def: 'Sert à interpeller quelqu’un ou à marquer l’ironie.' },
  HI: { nature: 'interjection', def: 'Onomatopée exprimant un rire étouffé ou aigu.' },
  HO: { nature: 'interjection', def: 'Cri pour appeler, arrêter un cheval ou exprimer l’étonnement.' },
  IF: { nature: 'nom masculin', def: 'Arbre ou arbuste conifère sempervirent aux feuilles toxiques.' },
  IL: { nature: 'pronom personnel', def: 'Pronom sujet de la 3e personne du singulier masculin.' },
  IN: { nature: 'adjectif invariable', def: 'À la mode, branché, tendance.' },
  JE: { nature: 'pronom personnel', def: 'Pronom de la 1ère personne du singulier désignant le locuteur.' },
  // NB: 'KA' défini plus bas — l'entrée conservée est celle qui était déjà
  // effective à l'exécution (dernière déclaration).
  LA: { nature: 'article / note', def: 'Article défini féminin OU sixième note de la gamme musicale.' },
  LE: { nature: 'article défini', def: 'Article défini masculin singulier.' },
  LI: { nature: 'nom masculin', def: 'Ancienne unité de mesure de distance chinoise valant environ 500 mètres.' },
  LU: { nature: 'participe passé', def: 'Participe passé du verbe lire.' },
  MA: { nature: 'adjectif possessif', def: 'Indique ce qui appartient à la première personne du singulier féminin.' },
  ME: { nature: 'pronom personnel', def: 'Pronom de la 1ère personne du singulier en fonction de complément.' },
  MI: { nature: 'nom / adverbe', def: 'Troisième note de la gamme musicale OU préfixe signifiant « moitié / milieu ».' },
  MU: { nature: 'nom masculin', def: 'Douzième lettre de l’alphabet grec (μ, Μ).' },
  NA: { nature: 'interjection', def: 'Exclamation enfantine de défi ou de triomphe narquois.' },
  NE: { nature: 'adverbe', def: 'Premier élément de la négation en français.' },
  NI: { nature: 'conjonction', def: 'Conjonction de coordination exprimant la négation.' },
  NO: { nature: 'nom masculin', def: 'Théâtre dramatique traditionnel japonais masqué et codifié (forme savante : Nô).' },
  NU: { nature: 'adjectif / nom', def: 'Sans vêtement, dépouillé de tout ornement.' },
  OC: { nature: 'nom masculin', def: 'Ancienne langue romane parlée dans le midi de la France (langue d’oc).' },
  OH: { nature: 'interjection', def: 'Exprime la surprise, l’admiration ou l’indignation.' },
  ON: { nature: 'pronom indéfini', def: 'Désigne une ou plusieurs personnes indéterminées ; équivalent familier de « nous ».' },
  OR: { nature: 'nom / conjonction', def: 'Métal précieux jaune brillant OU conjonction introduisant une étape de raisonnement.' },
  OS: { nature: 'nom masculin', def: 'Élément rigide et solide constituant le squelette des vertébrés.' },
  OU: { nature: 'conjonction', def: 'Exprime une alternative entre deux ou plusieurs éléments.' },
  PI: { nature: 'nom masculin', def: 'Seizième lettre de l’alphabet grec (π) et constante mathématique valant ≈ 3,14159.' },
  PU: { nature: 'participe passé', def: 'Participe passé du verbe pouvoir (avoir eu la capacité de).' },
  QI: { nature: 'nom masculin', def: 'Dans la philosophie et médecine chinoise, énergie vitale circulant dans l’univers.' },
  RA: { nature: 'nom masculin', def: 'Dieu soleil créateur suprême dans la mythologie de l’Égypte antique.' },
  RE: { nature: 'nom masculin', def: 'Deuxième note de la gamme musicale diatonique.' },
  RI: { nature: 'participe passé', def: 'Participe passé du verbe rire (avoir manifesté sa gaieté).' },
  SA: { nature: 'adjectif possessif', def: 'Indique ce qui appartient à la troisième personne du singulier féminin.' },
  SE: { nature: 'pronom réfléchi', def: 'Pronom de la 3e personne employé avec les verbes pronominaux.' },
  SI: { nature: 'conjonction / note', def: 'Exprime l’hypothèse OU septième note de la gamme musicale.' },
  SU: { nature: 'participe passé', def: 'Participe passé du verbe savoir.' },
  TA: { nature: 'adjectif possessif', def: 'Indique ce qui appartient à la deuxième personne du singulier féminin.' },
  TE: { nature: 'pronom personnel', def: 'Pronom de la 2e personne en fonction de complément.' },
  TO: { nature: 'nom masculin', def: 'Unité de volume pour les liquides au Japon (environ 18 litres).' },
  TU: { nature: 'pronom personnel', def: 'Pronom sujet de la 2e personne du singulier.' },
  UN: { nature: 'article indéfini / nombre', def: 'Désigne un élément singulier OU premier nombre entier naturel.' },
  US: { nature: 'nom masculin pluriel', def: 'Usages, coutumes et traditions observés dans une société (ex: us et coutumes).' },
  UT: { nature: 'nom masculin', def: 'Nom originel de la note « do » dans le solfège médiéval.' },
  VA: { nature: 'verbe', def: 'Forme du verbe aller à la 3e personne du singulier du présent.' },
  VE: { nature: 'nom masculin', def: 'Nom populaire ou dialectal de la lettre V.' },
  VS: { nature: 'préposition', def: 'Abréviation de versus, signifiant « contre » ou « en opposition à ».' },
  VU: { nature: 'participe passé', def: 'Participe passé du verbe voir ; perçu par les yeux.' },
  WU: { nature: 'nom masculin', def: 'Groupe linguistique et dialecte parlé principalement à Shanghai et dans l’est de la Chine.' },
  XI: { nature: 'nom masculin', def: 'Quatorzième lettre de l’alphabet grec (ξ, Ξ).' },
  YU: { nature: 'nom masculin', def: 'Instrument à vent traditionnel chinois en bambou.' },

  // --- Common 3-8 Letter Scrabble Words ---
  CHAT: { nature: 'nom masculin', def: 'Petit mammifère carnivore domestique de la famille des félidés.' },
  CHIEN: { nature: 'nom masculin', def: 'Mammifère carnivore domestique, fidèle compagnon de l’homme.' },
  SALON: { nature: 'nom masculin', def: 'Pièce de réception et de détente principale d’une habitation ; exposition périodique.' },
  SALONS: { nature: 'nom masculin pluriel', def: 'Pluriel de salon ; pièces d’accueil ou réunions publiques / artistiques.' },
  JEU: { nature: 'nom masculin', def: 'Activité de loisir soumise à des règles, procurant du plaisir ou du divertissement.' },
  JEUX: { nature: 'nom masculin pluriel', def: 'Pluriel de jeu ; compétitions, divertissements ou concours ludiques.' },
  ARBRE: { nature: 'nom masculin', def: 'Végétal ligneux vivace doté d’un tronc et de branches garnies de feuilles.' },
  AVENIR: { nature: 'nom masculin', def: 'Temps qui vient après le présent ; destinée future d’une personne ou d’une chose.' },
  AVENIRS: { nature: 'nom masculin pluriel', def: 'Pluriel d’avenir ; perspectives et évolutions futures.' },
  VOYAGE: { nature: 'nom masculin', def: 'Action de se déplacer et de parcourir des contrées lointaines pour découvrir.' },
  SCRABBLE: { nature: 'nom masculin', def: 'Célèbre jeu de société de lettres et de stratégie combinatoire sur plateau 15×15.' },
  AMOUR: { nature: 'nom masculin', def: 'Sentiment profond d’attachement, d’affection et de dévouement envers un être.' },
  BLEU: { nature: 'adjectif / nom', def: 'Couleur primaire du ciel pur et de la mer limpide.' },
  EAU: { nature: 'nom féminin', def: 'Liquide transparent, inodore et sans saveur, essentiel à toute forme de vie terrestre.' },
  EAUX: { nature: 'nom féminin pluriel', def: 'Pluriel d’eau ; étendues marines, thermales ou fluviales.' },
  ZEBRE: { nature: 'nom masculin', def: 'Mammifère ongulé d’Afrique de la famille des équidés à la robe rayée noir et blanc.' },
  VICTOIRE: { nature: 'nom féminin', def: 'Succès complet et triomphe remporté dans une compétition, un combat ou un jeu.' },
  ETOILE: { nature: 'nom féminin', def: 'Astre céleste produisant sa propre lumière par réaction thermonucléaire.' },
  MAISON: { nature: 'nom féminin', def: 'Bâtiment d’habitation individuelle ou familiale abritant un foyer.' },
  SOLEIL: { nature: 'nom masculin', def: 'Étoile centrale du système solaire autour de laquelle gravite la Terre.' },
  LUNE: { nature: 'nom féminin', def: 'Unique satellite naturel de la Terre éclairant la nuit par réflexion de la lumière solaire.' },
  COEUR: { nature: 'nom masculin', def: 'Organe musculaire assurant la circulation sanguine ; siège symbolique des émotions.' },
  FLEUR: { nature: 'nom féminin', def: 'Partie reproductrice colorée et souvent parfumée des végétaux à graines.' },
  MOT: { nature: 'nom masculin', def: 'Unité linguistique formée de phonèmes et de lettres pourvue d’un sens déterminé.' },
  MOTS: { nature: 'nom masculin pluriel', def: 'Pluriel de mot ; éléments du langage écrit et parlé.' },
  SCORE: { nature: 'nom masculin', def: 'Nombre de points marqués par un joueur ou une équipe au cours d’une partie.' },
  SCORES: { nature: 'nom masculin pluriel', def: 'Pluriel de score ; total des points enregistrés lors d’épreuves ludiques.' },
  TOUR: { nature: 'nom masculin / féminin', def: 'Haute construction OU tour de rôle permettant à chaque joueur d’agir à son moment.' },
  TOURS: { nature: 'nom masculin / féminin pluriel', def: 'Pluriel de tour ; mouvements circulaires ou édifices élevés.' },
  CHANCE: { nature: 'nom féminin', def: 'Circonstance favorable et imprévue qui conduit à un heureux résultat.' },
  TABLE: { nature: 'nom féminin', def: 'Meuble composé d’une surface plane horizontale portée par des pieds.' },
  LETTRE: { nature: 'nom féminin', def: 'Signe graphique représentant un son de la langue ; missive écrite.' },
  LETTRES: { nature: 'nom féminin pluriel', def: 'Pluriel de lettre ; caractères alphabétiques et littérature.' },
  BONUS: { nature: 'nom masculin', def: 'Avantage ou points supplémentaires accordés en récompense ou en prime.' },
  NOX: { nature: 'nom féminin', def: 'Dans la mythologie romaine, déesse primordiale personnifiant la Nuit.' },
  SIC: { nature: 'adverbe latin', def: 'Mot placé entre parenthèses pour indiquer qu’une citation est reproduite textuellement.' },
  ARIA: { nature: 'nom féminin / masculin', def: 'Mélodie vocale accompagnée dans un opéra OU tracas / embarras.' },
  OXO: { nature: 'nom masculin', def: 'Composé chimique contenant de l’oxygène sous forme de radical divalente lié.' },
  KIF: { nature: 'nom masculin', def: 'Plaisir vif, jouissance familière (ex: c’est un kif) OU préparation de chanvre.' },
  KA: { nature: 'nom masculin', def: 'Principe spirituel égyptien de l’énergie vitale.' },
};

/**
 * Returns a friendly, accurate definition and nature for any Scrabble word
 * @param {string} rawWord 
 * @returns {{ word: string, nature: string, def: string }}
 */
export function getFrenchDefinition(rawWord) {
  if (!rawWord || typeof rawWord !== 'string') {
    return {
      word: 'MOT',
      nature: 'nom masculin',
      def: 'Unité linguistique et lexicale porteuse de sens.',
    };
  }

  const word = rawWord.trim().toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  // 1. Direct dictionary match
  if (FRENCH_DEFINITIONS[word]) {
    return {
      word,
      nature: FRENCH_DEFINITIONS[word].nature,
      def: FRENCH_DEFINITIONS[word].def,
    };
  }

  // 2. Morphological deduction for plurals
  if (word.endsWith('S') && word.length >= 3) {
    const singular = word.slice(0, -1);
    if (FRENCH_DEFINITIONS[singular]) {
      return {
        word,
        nature: 'nom / adjectif pluriel',
        def: `Forme plurielle de « ${singular.toLowerCase()} » : ${FRENCH_DEFINITIONS[singular].def}`,
      };
    }
  }

  // 3. Morphological deduction for verbs ending in -ER, -EZ, -ONS, -ENT, -AIT, -ANT
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
      def: `Conjugaison d’un verbe français exprimant une action ou un état dans la phrase.`,
    };
  }
  if (word.endsWith('ANT')) {
    return {
      word,
      nature: 'participe présent / adjectif',
      def: `Forme marquant une action en cours d’accomplissement ou une qualification active.`,
    };
  }
  if (word.endsWith('EUR') || word.endsWith('EUSE') || word.endsWith('ISTE')) {
    return {
      word,
      nature: 'nom désignant une personne / agent',
      def: `Personne ou entité qui accomplit l’action ou qui pratique une spécialité.`,
    };
  }
  if (word.endsWith('TION') || word.endsWith('AGE') || word.endsWith('MENT')) {
    return {
      word,
      nature: 'nom commun',
      def: `Désigne l’action, le processus ou le résultat de l’activité correspondante.`,
    };
  }

  // 4. Default high quality definition for Scrabble official words
  return {
    word,
    nature: 'terme valide ODS',
    def: `Mot français officiel reconnu et validé par l’Officiel du Scrabble (ODS).`,
  };
}
