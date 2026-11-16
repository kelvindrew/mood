// Type definitions for MOOD ARENA — THE DEVIL'S ARENA
// Strategy, Memory, Logic and Psychological Competition Universe

export type ArenaGameId =
  // A. MÉMOIRE ET OBSERVATION
  | 'memory_poker'
  | 'fragments_of_memory'
  | 'montage'
  | 'blind_gomoku'
  | 'cooperative_puzzle'
  // B. LOGIQUE ET MATHÉMATIQUES
  | 'secret_number'
  | 'equation_high_low'
  | 'equation_pyramid'
  | 'scale_game'
  | 'knights_tour'
  | 'question_and_truth'
  // C. STRATÉGIE ET PLATEAUX
  | 'rules_race'
  | 'zoo'
  | 'laying_grass'
  | 'nine_mens_morris'
  | 'hex'
  | 'wall_go'
  | 'bagh_chal'
  | 'treasure_island'
  // D. BLUFF, DÉDUCTION ET PSYCHOLOGIE
  | 'the_virus_game'
  | 'crooked_cops'
  | 'doubt_and_bet'
  | 'halloween_monster'
  // E. CARTES, DÉS ET ENCHÈRES
  | 'remove_one'
  | 'time_auction'
  | 'sniper_holdem'
  | 'triple_dice'
  | 'balance_mancala'
  | 'big_small'
  | 'four_player_three_in_a_row'
  // F. JEUX SUPPLÉMENTAIRES ET ÉPREUVES SECRÈTES
  | 'find_the_key'
  | 'third_final_challenge'
  | 'prison_challenges';

export type ArenaCategory =
  | 'popular'
  | 'memory'
  | 'logic'
  | 'strategy'
  | 'bluff'
  | 'cards'
  | 'secret';

export type ArenaDifficulty = 'Facile' | 'Moyen' | 'Difficile' | 'Expert';

export type ArenaPlayMode = 'solo' | 'duel' | 'party' | 'tournament';

export interface ArenaGameItem {
  id: ArenaGameId;
  title: string;
  tagline: string;
  description: string;
  category: ArenaCategory;
  minPlayers: number;
  maxPlayers: number;
  durationMinutes: string;
  difficulty: ArenaDifficulty;
  badge?: string;
  isPlayable: boolean; // true pour les 8 jeux de la phase 2
  accentColor: string; // Ex: '#D4AF37' (or), '#DC2626' (rouge), '#38BDF8' (glace)
  features: string[];
  rules: string[];
  supportedModes: ArenaPlayMode[];
  coverSvgKey?: string;
}

// ----------------------------------------------------
// MOOD LEAGUE & PROFILS
// ----------------------------------------------------
export interface ArenaPlayerStats {
  totalMatches: number;
  victories: number;
  losses: number;
  devilsPieces: number; // Pièces du Démon accumulées
  xp: number;
  level: number;
  title: string;
  categoryStats: {
    memory: { played: number; won: number };
    logic: { played: number; won: number };
    strategy: { played: number; won: number };
    bluff: { played: number; won: number };
    cards: { played: number; won: number };
  };
  badges: string[];
}

export interface TournamentBracketMatch {
  id: string;
  round: 'quarter' | 'semi' | 'final';
  player1: { id: string; name: string; avatar: string; score?: number } | null;
  player2: { id: string; name: string; avatar: string; score?: number } | null;
  winnerId?: string;
  status: 'pending' | 'in_progress' | 'completed';
}

// ----------------------------------------------------
// ÉTATS DES 8 JEUX JOUABLES (PHASE 2)
// ----------------------------------------------------

// 1. MEMORY POKER
export interface MemoryPokerCard {
  id: number;
  suit: 'spade' | 'heart' | 'diamond' | 'club';
  rank: number; // 2..14 (14 = As)
  display: string;
}

export interface MemoryPokerState {
  grid: (MemoryPokerCard | null)[];
  gridSize: number; // 9, 16 ou 25
  phase: 'memorize' | 'selection' | 'showdown' | 'ended';
  revealTimeLeft: number;
  revealedCards: number[]; // indices visibles
  selectedCards: Record<string, number[]>; // playerId -> list of grid indices (up to 5)
  playerHands: Record<string, { handName: string; scoreRank: number; cards: MemoryPokerCard[] }>;
  winnerId: string | null;
}

// 2. FRAGMENTS OF MEMORY
export interface MemorySceneDetail {
  id: string;
  title: string;
  theme: string;
  svgSceneId: string;
  description: string;
}

export interface MemoryQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
}

export interface FragmentsOfMemoryState {
  scene: MemorySceneDetail;
  phase: 'observe' | 'question' | 'scoring' | 'ended';
  observeTimeLeft: number;
  currentQuestionIndex: number;
  totalQuestions: number;
  currentQuestion: {
    id: string;
    text: string;
    options: string[];
  } | null;
  playerAnswers: Record<string, { answerIndex: number; timeTakenMs: number; isCorrect?: boolean }>;
  scores: Record<string, number>;
  winnerId: string | null;
}

// 3. SECRET NUMBER
export interface SecretNumberHistoryEntry {
  playerId: string;
  guess: string;
  strikes: number;
  balls: number;
  timestamp: number;
}

export interface SecretNumberState {
  phase: 'setup' | 'playing' | 'ended';
  turnPlayerId: string;
  round: number;
  timeLimit: number;
  history: SecretNumberHistoryEntry[];
  cluesUsed: Record<string, string[]>;
  winnerId: string | null;
  // Les nombres secrets réels sont dans privateState uniquement !
}

// 4. THE VIRUS GAME
export type VirusRole = 'doctor' | 'infected' | 'immune' | 'infiltrator';

export interface VirusGameState {
  phase: 'night' | 'day_discussion' | 'day_voting' | 'quarantine_reveal' | 'ended';
  round: number;
  timer: number;
  quarantinedPlayers: string[]; // List of playerIds
  infectedCountKnown: number;
  votes: Record<string, string>; // voterId -> targetId
  lastQuarantined: { id: string; role: VirusRole } | null;
  winnerTeam: 'civils' | 'virus' | null;
}

// 5. DOUBT AND BET
export type DoubtCardColor = 'black' | 'gold' | 'red' | 'platinum';

export interface DoubtCard {
  id: string;
  color: DoubtCardColor;
  value: number; // 1 to 5
}

export interface DoubtBid {
  playerId: string;
  color: DoubtCardColor;
  quantity: number;
}

export interface DoubtAndBetState {
  phase: 'bidding' | 'doubt_called' | 'reveal' | 'ended';
  currentBid: DoubtBid | null;
  turnPlayerId: string;
  callerId: string | null; // joueur qui a crié "Doute !"
  doubtSuccess: boolean | null;
  totalColorCount: Record<DoubtCardColor, number>;
  chips: Record<string, number>;
  winnerId: string | null;
}

// 6. EQUATION PYRAMID
export interface EquationPyramidTier {
  tierIndex: number;
  cells: { id: string; value: number | null; isTarget?: boolean; operation?: '+' | '-' | '*' }[];
}

export interface EquationPyramidState {
  phase: 'playing' | 'evaluating' | 'ended';
  targetSum: number;
  tiers: EquationPyramidTier[];
  availableNumbers: number[];
  availableOps: ('+' | '-' | '*')[];
  timer: number;
  playerSubmissions: Record<string, { isValid: boolean; points: number }>;
  winnerId: string | null;
}

// 7. KNIGHT'S TOUR
export interface KnightsTourMove {
  row: number;
  col: number;
  stepNumber: number;
  playerId: string;
}

export interface KnightsTourState {
  boardSize: number; // 5 ou 6
  visited: boolean[][]; // [row][col]
  currentPosition: { row: number; col: number } | null;
  moveHistory: KnightsTourMove[];
  turnPlayerId: string;
  score: Record<string, number>;
  validMoves: { row: number; col: number }[];
  phase: 'playing' | 'blocked' | 'ended';
  winnerId: string | null;
}

// 8. NINE MEN'S MORRIS
export type MorrisPlayerColor = 'white' | 'black';

export interface MorrisMill {
  points: [number, number, number];
}

export interface NineMensMorrisState {
  phase: 'placement' | 'movement' | 'flying' | 'ended';
  board: (MorrisPlayerColor | null)[]; // 24 intersections (0..23)
  piecesRemainingToPlace: Record<MorrisPlayerColor, number>; // initial 9 each
  piecesOnBoard: Record<MorrisPlayerColor, number>;
  turnColor: MorrisPlayerColor;
  isMillFormed: boolean; // active player must remove an opponent piece
  selectedPieceIndex: number | null;
  winnerColor: MorrisPlayerColor | null;
  history: string[];
}

// ----------------------------------------------------
// CONTENEUR PUBLIC / PRIVÉ D'ARENA
// ----------------------------------------------------
export interface ArenaPublicGameState {
  arenaGameId: ArenaGameId;
  gameMode: ArenaPlayMode;
  aiDifficulty: 'easy' | 'normal' | 'hard' | 'expert';
  isSolo: boolean;
  status: 'intro' | 'playing' | 'round_end' | 'game_over';
  memoryPoker?: MemoryPokerState;
  fragmentsOfMemory?: FragmentsOfMemoryState;
  secretNumber?: SecretNumberState;
  virusGame?: VirusGameState;
  doubtAndBet?: DoubtAndBetState;
  equationPyramid?: EquationPyramidState;
  knightsTour?: KnightsTourState;
  nineMensMorris?: NineMensMorrisState;
  devilsPiecesStakes: number;
  winnerId?: string | null;
  leaderboard?: { playerId: string; name: string; score: number; piecesWon: number }[];
}

export interface ArenaPrivatePlayerState {
  mySecretNumber?: string;
  myVirusRole?: VirusRole;
  myDoubtCards?: DoubtCard[];
  myPrivateClues?: string[];
  myTargetEquations?: number[];
}
