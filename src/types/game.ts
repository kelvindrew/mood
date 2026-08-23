// Type definitions for PLAYFLIX Platform

export type GameId =
  | 'ludo'
  | 'scrabble'
  | 'card_party'
  | 'quiz'
  | 'draw_and_guess'
  | 'werewolf'
  | 'blind_test'
  | 'president'
  | 'poker'
  | 'blackjack'
  | 'menteur'
  | 'inter'
  | 'four_pics'
  | 'mini_racing'
  | 'quick_games';

export type PlayerColor = 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'cyan' | 'orange' | 'pink';

export type BuzzerSoundType = 'klaxon' | 'laser' | 'airhorn' | 'bell' | 'gong' | 'arcade';

export interface Player {
  id: string;
  socketId: string;
  name: string;
  avatar: string;
  selfieImage?: string;
  color: PlayerColor;
  buzzerSound?: BuzzerSoundType;
  isHost: boolean;
  isReady: boolean;
  isBot?: boolean;
  botDifficulty?: 'easy' | 'medium' | 'hard';
  score: number;
  chips?: number; // For casino/poker games
  isSpectator?: boolean;
  connected: boolean;
}

export type RoomStatus = 'lobby' | 'playing' | 'game_over';

export interface RoomSettings {
  maxPlayers: number;
  gameMode: string;
  turnDuration: number;
  difficulty: 'easy' | 'normal' | 'hard';
  isPrivate: boolean;
  enableVoiceAnnouncer?: boolean;
  enableGages?: boolean;
  isTournament?: boolean;
}

export interface GameCatalogItem {
  id: GameId;
  title: string;
  tagline: string;
  description: string;
  category: 'popular' | 'family' | 'fast' | 'reflexion' | 'cards' | 'party';
  minPlayers: number;
  maxPlayers: number;
  durationMinutes: string;
  difficulty: 'Facile' | 'Moyen' | 'Difficile';
  coverImage: string;
  heroImage: string;
  badge?: string;
  rules: string[];
  features: string[];
}

// ----------------------------------------------------
// LUDO TYPES
// ----------------------------------------------------
export interface LudoPawn {
  id: number;
  color: PlayerColor;
  position: number; // -1 = Home, 0-51 = Main Track, 100-105 = Final Stretch, 200 = Finished
  isHome: boolean;
  isFinished: boolean;
}

export interface LudoMovableOption {
  pawnId: number;
  fromPosition: number;
  targetPosition: number;
  isExitingHome: boolean;
  isEnteringHomeStretch: boolean;
  isWinning: boolean;
  willCapture: boolean;
}

export interface LudoGameState {
  players: PlayerColor[];
  pawns: Record<string, LudoPawn[]>;
  currentTurnColor: PlayerColor;
  diceValue: number | null;
  canRollDice: boolean;
  movablePawns: number[];
  movableOptions?: LudoMovableOption[];
  winner: PlayerColor | null;
  turnTimeLeft: number;
  lastActionLog: string;
}

// ----------------------------------------------------
// STANDARD CARD SUITE (POKER, PRESIDENT, BLACKJACK, UNO)
// ----------------------------------------------------
export type StandardSuit = 'spades' | 'hearts' | 'diamonds' | 'clubs';
export type StandardRank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A' | 'JOKER';

export interface PlayingCard {
  id: string;
  suit: StandardSuit;
  rank: StandardRank;
  value: number;
}

// 1. PRESIDENT (TROUDUC)
export type PresidentRankType = 'president' | 'vice_president' | 'neutral' | 'vice_trouduc' | 'trouduc';

export interface PresidentGameState {
  currentTrick: PlayingCard[];
  lastPlayPlayerId: string | null;
  currentTurnPlayerId: string;
  passedPlayers: string[];
  playerCardCounts: Record<string, number>;
  playerHands: Record<string, PlayingCard[]>; // Secret on mobile
  finishedPlayers: { playerId: string; name: string; rankTitle: PresidentRankType }[];
  isRevolution: boolean; // 4 cards of same rank reverses hierarchy
  turnTimeLeft: number;
  lastActionLog: string;
}

// 2. POKER TEXAS HOLD'EM
export type PokerStage = 'preflop' | 'flop' | 'turn' | 'river' | 'showdown';

export interface PokerGameState {
  stage: PokerStage;
  communityCards: PlayingCard[];
  pot: number;
  currentBet: number;
  dealerIndex: number;
  currentTurnPlayerId: string;
  playerChips: Record<string, number>;
  playerBets: Record<string, number>;
  playerHands: Record<string, PlayingCard[]>; // Secret 2 hole cards
  foldedPlayers: string[];
  allInPlayers: string[];
  turnTimeLeft: number;
  lastActionLog: string;
  winnerId: string | null;
  winningHandName?: string;
}

// 3. BLACKJACK 21 VIP CASINO
export interface BlackjackHand {
  cards: PlayingCard[];
  score: number;
  isBust: boolean;
  isBlackjack: boolean;
  isStand: boolean;
  bet: number;
  payoutStatus?: 'win' | 'lose' | 'push' | 'blackjack';
}

export interface BlackjackGameState {
  dealerHand: {
    cards: PlayingCard[];
    score: number;
    isBust: boolean;
    isBlackjack: boolean;
    hideHoleCard: boolean;
  };
  playerHands: Record<string, BlackjackHand>;
  currentPlayerId: string | null; // null when dealer's turn
  gamePhase: 'betting' | 'player_turns' | 'dealer_turn' | 'round_over';
  timeRemaining: number;
  roundCount: number;
}

// 4. SCRABBLE / WORD GAME TYPES
export interface BoardTile {
  letter: string;
  points: number;
  placedBy?: string;
  isLocked?: boolean;
}

export interface ScrabblePlayerStats {
  wordsCount: number;
  scrabbleCount: number;
  bestWord: string | null;
  bestWordPoints: number;
  maxTurnScore: number;
  rawScore?: number;
  finalScore?: number;
  malusDeducted?: number;
  bonusReceived?: number;
  remainingTilesCount?: number;
  remainingTilesValue?: number;
  averageTurnScore?: number;
}

export interface ScrabblePodiumItem {
  id: string;
  name: string;
  rank: number;
  score: number;
  rawScore?: number;
  malusDeducted?: number;
  bonusReceived?: number;
  stats: ScrabblePlayerStats;
}

export interface ScrabbleWordHistoryItem {
  word: string;
  points: number;
  player: string;
  nature?: string;
  definition?: string;
  turn?: number;
  timestamp?: number;
}

export interface ScrabbleGameState {
  board: (BoardTile | null)[][];
  letterBagCount: number;
  currentPlayerId: string;
  playerRacks: Record<string, { letter: string; points: number; id: string }[]>;
  playerScores?: Record<string, number>;
  playerStats?: Record<string, ScrabblePlayerStats>;
  turnTimeLeft: number;
  lastWordPlayed?: {
    word: string;
    allWords?: string[];
    points: number;
    player: string;
    isValid?: boolean;
    reason?: string;
    isScrabble?: boolean;
    nature?: string;
    definition?: string;
  };
  playedWordsHistory?: ScrabbleWordHistoryItem[];
  lastActionLog?: string;
  winner: string | null;
  winnerName?: string | null;
  finisherPlayerName?: string | null;
  endGameReason?: 'rack_empty' | 'consecutive_passes' | string | null;
  finalPodium?: ScrabblePodiumItem[] | null;
  isGameOver?: boolean;
  totalDuration?: string;
  totalDurationSeconds?: number;
}

// 5. CARD PARTY (UNO-STYLE)
export type CardColor = 'red' | 'blue' | 'green' | 'yellow' | 'wild';
export type CardValue = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '+2' | 'skip' | 'reverse' | 'wild' | '+4';

export interface UnoCard {
  id: string;
  color: CardColor;
  value: CardValue;
}

export interface CardGameState {
  discardPileTop: UnoCard;
  currentColor: CardColor;
  direction: 1 | -1;
  currentPlayerId: string;
  playerCardCounts: Record<string, number>;
  playerHands: Record<string, UnoCard[]>;
  drawPileCount: number;
  unoCalledBy: Record<string, boolean>;
  winner: string | null;
  turnTimeLeft: number;
}

// 6. QUIZ TYPES
export interface QuizQuestion {
  id: string;
  category: string;
  question: string;
  options: [string, string, string, string];
  correctIndex: number;
  explanation: string;
  image?: string;
}

export interface QuizPlayerAnswer {
  optionIndex: number;
  timeSpentMs: number;
  pointsAwarded: number;
}

export interface QuizGameState {
  currentQuestionIndex: number;
  totalQuestions: number;
  currentQuestion: QuizQuestion | null;
  state: 'question' | 'reveal' | 'round_summary' | 'game_over';
  timeRemaining: number;
  answers: Record<string, QuizPlayerAnswer>;
  streaks: Record<string, number>;
  leaderboard: { playerId: string; name: string; avatar: string; color: PlayerColor; score: number }[];
}

// 7. DRAW & GUESS
export interface DrawStroke {
  id: string;
  color: string;
  size: number;
  points: { x: number; y: number }[];
}

export interface DrawGuessMessage {
  id: string;
  playerId: string;
  playerName: string;
  guess: string;
  isCorrect: boolean;
  timestamp: number;
}

export interface DrawGameState {
  currentDrawerId: string;
  drawerName: string;
  secretWord: string;
  maskedWord: string;
  category: string;
  strokes: DrawStroke[];
  timeRemaining: number;
  guesses: DrawGuessMessage[];
  roundIndex: number;
  totalRounds: number;
  scores: Record<string, number>;
  state: 'drawing' | 'word_revealed' | 'game_over';
  winner: string | null;
}

// 8. WEREWOLF
export type WerewolfRole = 'werewolf' | 'villager' | 'seer' | 'witch' | 'hunter';

export interface WerewolfPlayerState {
  id: string;
  name: string;
  avatar: string;
  role: WerewolfRole;
  isAlive: boolean;
  targetId?: string;
}

export interface WerewolfGameState {
  phase: 'night_seer' | 'night_werewolves' | 'night_witch' | 'day_discussion' | 'day_voting' | 'game_over';
  dayNumber: number;
  timeRemaining: number;
  players: Record<string, WerewolfPlayerState>;
  lastNightVictimId: string | null;
  lastExecutedId: string | null;
  winnerTeam: 'villagers' | 'werewolves' | null;
  narratorLog: string;
}

// 9. BLIND TEST
export interface BlindTestSong {
  id: string;
  title: string;
  artist: string;
  category: string;
  melodyNotes: number[];
  options: [string, string, string, string];
  correctIndex: number;
}

export interface BlindTestGameState {
  currentSongIndex: number;
  totalSongs: number;
  currentSong: BlindTestSong | null;
  timeRemaining: number;
  state: 'playing' | 'buzzed' | 'reveal' | 'game_over';
  buzzedPlayerId: string | null;
  scores: Record<string, number>;
  winner: string | null;
}

// 10. MENTEUR (BLUFF / CHEAT)
export interface MenteurPlayedBatch {
  playerId: string;
  playerName: string;
  claimedRank: StandardRank;
  cardCount: number;
  realCards: PlayingCard[];
}

export interface MenteurAccusationResult {
  accuserId: string;
  accuserName: string;
  targetId: string;
  targetName: string;
  claimedRank: StandardRank;
  realCards: PlayingCard[];
  wasLying: boolean;
  pileCountTaken: number;
  timestamp: number;
}

export interface MenteurGameState {
  currentTurnPlayerId: string;
  currentClaimedRank: StandardRank | null;
  centralPileCount: number;
  lastPlay: MenteurPlayedBatch | null;
  accusationResult: MenteurAccusationResult | null;
  playerCardCounts: Record<string, number>;
  playerHands: Record<string, PlayingCard[]>; // Secret on mobile
  turnTimeLeft: number;
  lastActionLog: string;
  winner: string | null;
}

// 11. INTER (SPECIAL ACTION CARDS)
export interface InterSpecialEffect {
  type: 'stop' | 'plus2' | 'plus4' | 'plus5' | 'reverse' | 'demand';
  message: string;
  targetPlayerId?: string;
}

export interface InterGameState {
  topCard: PlayingCard;
  currentSuit: StandardSuit;
  activeDemandRank: StandardRank | null;
  pendingPenaltyDraws: number;
  direction: 1 | -1;
  currentTurnPlayerId: string;
  playerCardCounts: Record<string, number>;
  playerHands: Record<string, PlayingCard[]>; // Secret on mobile
  drawDeckCount: number;
  lastSpecialEffect: InterSpecialEffect | null;
  scores: Record<string, number>;
  roundNumber: number;
  turnTimeLeft: number;
  lastActionLog: string;
  winner: string | null;
}

// 12. 4 IMAGES 1 MOT (FOUR PICS ONE WORD)
export interface FourPicsRoundResult {
  winnerId: string | null;
  winnerName: string | null;
  word: string;
  pointsEarned?: number;
  starsEarned?: number;
  timeElapsedSeconds?: number;
  hintsUsed?: number;
  combo?: number;
  level?: number;
  stageNumber?: number;
  message?: string;
  timestamp: number;
}

export interface FourPicsGameState {
  roundNumber: number;
  totalRounds: number;
  currentPuzzle: {
    id: string;
    level?: number;
    stageNumber?: number;
    wordLength: number;
    category: string;
    difficulty: number;
    difficultyLabel: string;
    hint: string;
    images: [string, string, string, string];
  };
  scrambledLetters: string[]; // Distractor letters + target word letters
  timeLeft: number;
  roundStatus: 'guessing' | 'revealed' | 'game_over';
  roundResult: FourPicsRoundResult | null;
  scores: Record<string, number>;
  combos?: Record<string, number>;
  solvedPlayersThisRound: string[];
  revealedLettersPositions?: Record<string, number[]>;
  removedLettersIndices?: Record<string, number[]>;
  zoomedImageIndex?: number | null;
  winner: string | null;
  lastActionLog: string;
}

// 14. MINI RACING (ARCADE RACER)
export interface RacingPlayerStatus {
  id: string;
  name: string;
  color: PlayerColor;
  progress: number;
  lap: number;
  speed: number;
  nitro: number;
  isNitroActive: boolean;
  finishedRank: number | null;
  x: number;
}

export interface MiniRacingGameState {
  status: 'countdown' | 'racing' | 'finished';
  countdown: number;
  totalLaps: number;
  trackLength: number;
  players: RacingPlayerStatus[];
  winner: string | null;
  finishOrder: string[];
}

// 15. QUICK GAMES (MICRO-PARTY PACK)
export interface QuickGamesGameState {
  roundNumber: number;
  totalRounds: number;
  currentMiniGame: string;
  miniGameState: any;
  roundStatus: 'intro' | 'active' | 'reveal' | 'finished';
  timeRemaining: number;
  scores: Record<string, number>;
  winner: string | null;
}

// ----------------------------------------------------
// ROOM STATE
// ----------------------------------------------------
export interface RoomState {
  code: string;
  gameId: GameId;
  status: RoomStatus;
  hostId: string;
  settings: RoomSettings;
  players: Player[];
  spectators: Player[];
  gameState:
    | LudoGameState
    | ScrabbleGameState
    | CardGameState
    | QuizGameState
    | DrawGameState
    | WerewolfGameState
    | BlindTestGameState
    | PresidentGameState
    | PokerGameState
    | BlackjackGameState
    | MenteurGameState
    | InterGameState
    | FourPicsGameState
    | MiniRacingGameState
    | QuickGamesGameState
    | null;
  serverLanIp?: string;
  serverPort?: number;
  reactions: { id: string; emoji: string; playerName: string; timestamp: number }[];
  activeGage?: { title: string; challenge: string; targetPlayerName: string } | null;
  tournamentScores?: Record<string, number>;
}
