// Room State & Game Session Manager for PLAYFLIX
import crypto from 'crypto';
import { LudoEngine } from './games/ludoEngine.js';
import { WordEngine } from './games/wordEngine.js';
import { CardEngine } from './games/cardEngine.js';
import { QuizEngine } from './games/quizEngine.js';
import { DrawEngine } from './games/drawEngine.js';
import { WerewolfEngine } from './games/werewolfEngine.js';
import { BlindTestEngine } from './games/blindTestEngine.js';
import { PresidentEngine } from './games/presidentEngine.js';
import { PokerEngine } from './games/pokerEngine.js';
import { BlackjackEngine } from './games/blackjackEngine.js';
import { MenteurEngine } from './games/menteurEngine.js';
import { InterEngine } from './games/interEngine.js';
import { FourPicsEngine } from './games/fourPicsEngine.js';
import { QuickGamesEngine } from './games/quickGamesEngine.js';
import { SpyEngine } from './games/spyEngine.js';
import { PetitBacEngine } from './games/petitBacEngine.js';
import { FakeNewsEngine } from './games/fakeNewsEngine.js';
import { BombPartyEngine } from './games/bombPartyEngine.js';
import { NavalBattleEngine } from './games/navalBattleEngine.js';
import { MemeFactoryEngine } from './games/memeFactoryEngine.js';
import { ConnectFourEngine } from './games/connectFourEngine.js';
import { WildRushEngine } from './games/wildRushEngine.js';

const AVAILABLE_COLORS = ['red', 'blue', 'green', 'yellow', 'purple', 'cyan', 'orange', 'pink'];

const BOT_NAMES = ['🤖 Jarvis AI', '🤖 Cyber Bot', '🤖 Alpha Neo', '🤖 Sophia AI', '🤖 Turing Bot', '🤖 DeepMind'];
const BOT_AVATARS = ['🤖', '🦾', '👾', '🚀', '⚡', '🛸'];

const PARTY_GAGES = [
  { title: 'Chanteur d’un soir', challenge: 'Chante le refrain de ta chanson préférée pendant 20 secondes !' },
  { title: 'Imitation Culte', challenge: 'Fais une imitation d’un animal ou d’une célébrité choisie par le groupe.' },
  { title: 'Danse du Robot', challenge: 'Fais une danse du robot pendant 15 secondes devant la TV !' },
  { title: 'Compliment Forcé', challenge: 'Fais un compliment très sincère à ton voisin de droite.' },
  { title: 'Mode Statut', challenge: 'Reste totalement immobile comme une statue pendant tout le prochain tour !' },
];

export const GAME_PLAYER_CONSTRAINTS = {
  ludo: { min: 2, max: 4 },
  connect_four: { min: 2, max: 2 },
  naval_battle: { min: 2, max: 2 },
  scrabble: { min: 2, max: 4 },
  president: { min: 3, max: 6 },
  werewolf: { min: 3, max: 12 },
  spy: { min: 3, max: 10 },
  petit_bac: { min: 1, max: 12 },
  fake_news: { min: 2, max: 12 },
  bomb_party: { min: 2, max: 12 },
  meme_factory: { min: 2, max: 12 },
  quick_games: { min: 1, max: 12 },
  four_pics: { min: 1, max: 12 },
  menteur: { min: 2, max: 8 },
  inter: { min: 2, max: 8 },
  card_party: { min: 2, max: 8 },
  quiz: { min: 1, max: 10 },
  draw_and_guess: { min: 2, max: 10 },
  blind_test: { min: 1, max: 10 },
  poker: { min: 2, max: 8 },
  blackjack: { min: 1, max: 7 },
  wild_rush: { min: 2, max: 4 },
};

export class RoomManager {
  constructor(io, localIp = 'localhost') {
    this.io = io;
    this.localIp = localIp;
    this.rooms = new Map();
  }

  generateRoomCode() {
    let code;
    do {
      code = Math.floor(1000 + Math.random() * 9000).toString();
    } while (this.rooms.has(code));
    return code;
  }

  generateSessionToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  sanitizePlayer(p) {
    if (!p) return null;
    const { sessionToken, ...safe } = p;
    return safe;
  }

  isHostAuthorized(room, socketId, hostToken = null) {
    if (!room) return false;
    if (hostToken && room.hostToken && hostToken === room.hostToken) return true;
    if (socketId && socketId === room.hostId) return true;
    const player = room.players.find(p => p.socketId === socketId && p.connected && !p.isBot);
    if (player && player.isHost) return true;
    return false;
  }

  createRoom(hostSocketId, gameId = 'ludo', settings = {}) {
    const code = this.generateRoomCode();
    const hostToken = this.generateSessionToken();
    const constraints = GAME_PLAYER_CONSTRAINTS[gameId] || { min: 1, max: 6 };
    const rawMax = Number(settings.maxPlayers);
    const maxPlayers = (!isNaN(rawMax) && rawMax > 0)
      ? Math.min(rawMax, constraints.max)
      : constraints.max;

    const room = {
      code,
      gameId,
      status: 'lobby',
      hostId: hostSocketId,
      hostToken,
      settings: {
        maxPlayers,
        gameMode: settings.gameMode || 'standard',
        turnDuration: settings.turnDuration || 30,
        difficulty: settings.difficulty || 'normal',
        isPrivate: settings.isPrivate || false,
        enableVoiceAnnouncer: settings.enableVoiceAnnouncer ?? true,
        enableGages: settings.enableGages ?? true,
        isTournament: settings.isTournament ?? false,
      },
      players: [],
      spectators: [],
      gameEngine: null,
      gameState: null,
      reactions: [],
      activeGage: null,
      tournamentScores: {},
      finalRanking: null,
      resultLabel: null,
      createdAt: Date.now(),
    };

    this.rooms.set(code, room);
    return room;
  }

  getRoom(code) {
    if (!code) return null;
    return this.rooms.get(code.toString().trim());
  }

  joinRoom(code, socketId, playerData = {}, isSpectator = false, sessionToken = null) {
    const room = this.getRoom(code);
    if (!room) {
      return { success: false, error: 'Salon introuvable. Vérifiez le code à 4 chiffres.' };
    }

    if (isSpectator) {
      const specToken = this.generateSessionToken();
      const spectator = {
        id: playerData.id || `spec_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        sessionToken: specToken,
        socketId,
        name: playerData.name || 'Spectateur',
        avatar: playerData.avatar || '👀',
        selfieImage: playerData.selfieImage,
        color: 'purple',
        buzzerSound: 'arcade',
        isHost: false,
        isReady: true,
        score: 0,
        isSpectator: true,
        connected: true,
      };
      room.spectators.push(spectator);
      this.broadcastRoomUpdate(room);
      return { success: true, room: this.getPublicRoomState(room), player: this.sanitizePlayer(spectator), sessionToken: specToken };
    }

    // Reconnexion éventuelle d'un joueur existant : vérification stricte du justificatif de session
    if (playerData?.id) {
      const existingPlayer = room.players.find(p => p.id === playerData.id);
      if (existingPlayer) {
        if (!sessionToken || sessionToken !== existingPlayer.sessionToken) {
          return { success: false, error: 'Usurpation refusée : justificatif de session manquant ou invalide' };
        }
        existingPlayer.socketId = socketId;
        existingPlayer.connected = true;
        if (playerData.selfieImage) existingPlayer.selfieImage = playerData.selfieImage;
        this.broadcastRoomUpdate(room);
        return { success: true, room: this.getPublicRoomState(room), player: this.sanitizePlayer(existingPlayer), sessionToken: existingPlayer.sessionToken };
      }
    }

    const constraints = GAME_PLAYER_CONSTRAINTS[room.gameId] || { min: 1, max: 6 };
    const maxAllowed = Math.min(room.settings.maxPlayers || constraints.max, constraints.max);

    if (room.players.length >= maxAllowed) {
      return { success: false, error: `Le salon est complet pour ce jeu ! (${room.players.length}/${maxAllowed} joueurs max)` };
    }

    const takenColors = room.players.map(p => p.color);
    const assignedColor = AVAILABLE_COLORS.find(c => !takenColors.includes(c)) || 'red';

    const playerToken = this.generateSessionToken();
    const newPlayer = {
      id: playerData.id || `p_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      sessionToken: playerToken,
      socketId,
      name: playerData.name || `Joueur ${room.players.length + 1}`,
      avatar: playerData.avatar || '🦊',
      selfieImage: playerData.selfieImage,
      color: assignedColor,
      buzzerSound: playerData.buzzerSound || 'arcade',
      isHost: room.players.length === 0,
      isReady: false,
      isBot: false,
      score: 0,
      chips: 1000,
      isSpectator: false,
      connected: true,
    };

    room.players.push(newPlayer);
    this.broadcastRoomUpdate(room);
    return { success: true, room: this.getPublicRoomState(room), player: this.sanitizePlayer(newPlayer), sessionToken: playerToken };
  }

  reconnectPlayer(code, socketId, playerId, sessionToken, playerData = {}) {
    const room = this.getRoom(code);
    if (!room) return null;

    if (!playerId || !sessionToken) {
      // Rejet : pas de sessionToken fourni
      return null;
    }

    const player = room.players.find(p => p.id === playerId);
    if (!player || !player.sessionToken || player.sessionToken !== sessionToken) {
      // Rejet : token manquant ou ne correspondant pas au joueur
      return null;
    }

    player.socketId = socketId;
    player.connected = true;
    if (playerData?.selfieImage) player.selfieImage = playerData.selfieImage;

    this.broadcastRoomUpdate(room);
    if (room.gameState && room.gameEngine) {
      // C1 — Reconnexion : état public + fragment privé ciblé UNIQUEMENT au joueur authentifié
      this.io.to(socketId).emit(
        'game_state_update',
        typeof room.gameEngine.getPublicState === 'function'
          ? room.gameEngine.getPublicState()
          : room.gameState
      );
      if (typeof room.gameEngine.getPrivateState === 'function') {
        const privateFragment = room.gameEngine.getPrivateState(player.id);
        if (privateFragment) {
          this.io.to(socketId).emit('private_state', privateFragment);
        }
      }
    }
    return this.sanitizePlayer(player);
  }

  addBot(code, socketId = null, difficulty = 'medium') {
    const room = this.getRoom(code);
    if (!room) return { success: false, error: 'Salon introuvable' };
    if (socketId && !this.isHostAuthorized(room, socketId)) {
      return { success: false, error: 'Action réservée à l’hôte' };
    }
    const constraints = GAME_PLAYER_CONSTRAINTS[room.gameId] || { min: 1, max: 6 };
    const maxAllowed = Math.min(room.settings.maxPlayers || constraints.max, constraints.max);
    if (room.players.length >= maxAllowed) return { success: false, error: 'Salon complet' };

    const takenColors = room.players.map(p => p.color);
    const assignedColor = AVAILABLE_COLORS.find(c => !takenColors.includes(c)) || 'red';
    const botCount = room.players.filter(p => p.isBot).length;

    const bot = {
      id: `bot_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      sessionToken: null,
      socketId: `bot_socket_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      name: BOT_NAMES[botCount % BOT_NAMES.length] || `🤖 Bot ${botCount + 1}`,
      avatar: BOT_AVATARS[botCount % BOT_AVATARS.length] || '🤖',
      color: assignedColor,
      buzzerSound: 'laser',
      isHost: false,
      isReady: true,
      isBot: true,
      botDifficulty: difficulty,
      score: 0,
      chips: 1000,
      isSpectator: false,
      connected: true,
    };

    room.players.push(bot);
    this.broadcastRoomUpdate(room);
    return { success: true };
  }

  removeBot(code, socketId = null, botId = null) {
    const room = this.getRoom(code);
    if (!room) return { success: false, error: 'Salon introuvable' };
    if (socketId && !this.isHostAuthorized(room, socketId)) {
      return { success: false, error: 'Action réservée à l’hôte' };
    }

    if (botId) {
      const idx = room.players.findIndex(p => p.id === botId && p.isBot);
      if (idx !== -1) room.players.splice(idx, 1);
    } else {
      const lastBotIdx = room.players.map(p => p.isBot).lastIndexOf(true);
      if (lastBotIdx !== -1) room.players.splice(lastBotIdx, 1);
    }

    this.broadcastRoomUpdate(room);
    return { success: true };
  }

  toggleReady(code, socketId) {
    const room = this.getRoom(code);
    if (!room) return;
    const player = room.players.find(p => p.socketId === socketId && p.connected && !p.isBot);
    if (player) {
      player.isReady = !player.isReady;
      this.broadcastRoomUpdate(room);
    }
  }

  setSelfieImage(code, socketId, selfieImage) {
    const room = this.getRoom(code);
    if (!room) return;
    const player = room.players.find(p => p.socketId === socketId && p.connected && !p.isBot);
    if (player) {
      player.selfieImage = selfieImage;
      this.broadcastRoomUpdate(room);
    }
  }

  setBuzzerSound(code, socketId, sound) {
    const room = this.getRoom(code);
    if (!room) return;
    const player = room.players.find(p => p.socketId === socketId && p.connected && !p.isBot);
    if (player) {
      player.buzzerSound = sound;
      this.broadcastRoomUpdate(room);
    }
  }

  updatePlayerColor(code, socketId, newColor) {
    const room = this.getRoom(code);
    if (!room) return;
    const player = room.players.find(p => p.socketId === socketId && p.connected && !p.isBot);
    if (player && !room.players.some(p => p.socketId !== socketId && p.color === newColor)) {
      player.color = newColor;
      this.broadcastRoomUpdate(room);
    }
  }

  updateSettings(code, socketId = null, newSettings = {}) {
    const room = this.getRoom(code);
    if (!room) return { success: false, error: 'Salon introuvable' };
    if (socketId && !this.isHostAuthorized(room, socketId)) {
      return { success: false, error: 'Action réservée à l’hôte' };
    }
    room.settings = { ...room.settings, ...newSettings };
    this.broadcastRoomUpdate(room);
    return { success: true };
  }

  selectGame(code, socketId = null, gameId = 'ludo') {
    const room = this.getRoom(code);
    if (!room) return { success: false, error: 'Salon introuvable' };
    if (socketId && !this.isHostAuthorized(room, socketId)) {
      return { success: false, error: 'Action réservée à l’hôte' };
    }
    room.gameId = gameId;
    const constraints = GAME_PLAYER_CONSTRAINTS[gameId] || { min: 1, max: 6 };
    if (!room.settings.maxPlayers || room.settings.maxPlayers > constraints.max) {
      room.settings.maxPlayers = constraints.max;
    }
    // Règle stricte : si le nombre actuel dépasse la limite du nouveau jeu
    if (room.players.length > room.settings.maxPlayers) {
      while (room.players.length > room.settings.maxPlayers && room.players.some(p => p.isBot)) {
        const lastBotIdx = room.players.map(p => p.isBot).lastIndexOf(true);
        if (lastBotIdx !== -1) room.players.splice(lastBotIdx, 1);
      }
      while (room.players.length > room.settings.maxPlayers) {
        const excess = room.players.pop();
        if (excess) {
          excess.isSpectator = true;
          room.spectators.push(excess);
        }
      }
    }
    this.broadcastRoomUpdate(room);
    return { success: true };
  }

  startGame(code, socketId = null) {
    const room = this.getRoom(code);
    if (!room) return { success: false, error: 'Salon introuvable' };
    if (socketId && !this.isHostAuthorized(room, socketId)) {
      return { success: false, error: 'Action réservée à l’hôte' };
    }

    const constraints = GAME_PLAYER_CONSTRAINTS[room.gameId] || { min: 1, max: 8 };
    const maxAllowed = Math.min(room.settings.maxPlayers || constraints.max, constraints.max);

    if (room.players.length === 0) {
      // Auto-création d'un joueur hôte pour permettre le lancement immédiat sur PC/TV sans attendre de smartphone
      const hostSessionToken = this.generateSessionToken();
      const defaultHostPlayer = {
        id: `p_host_${Date.now()}`,
        sessionToken: hostSessionToken,
        socketId: room.hostId,
        name: 'Joueur 1 (Hôte)',
        avatar: '🦊',
        color: 'red',
        buzzerSound: 'arcade',
        isHost: true,
        isReady: true,
        isBot: false,
        score: 0,
        chips: 1000,
        isSpectator: false,
        connected: true,
      };
      room.players.push(defaultHostPlayer);
      this.broadcastRoomUpdate(room);
    }

    // Règle stricte au lancement : éliminer tout dépassement de maxPlayers
    if (room.players.length > maxAllowed) {
      while (room.players.length > maxAllowed && room.players.some(p => p.isBot)) {
        const lastBotIdx = room.players.map(p => p.isBot).lastIndexOf(true);
        if (lastBotIdx !== -1) room.players.splice(lastBotIdx, 1);
      }
      while (room.players.length > maxAllowed) {
        const excess = room.players.pop();
        if (excess) {
          excess.isSpectator = true;
          room.spectators.push(excess);
        }
      }
      this.broadcastRoomUpdate(room);
    }

    // Règle stricte au lancement : compléter automatiquement avec des Bots IA si minPlayers non atteint
    while (room.players.length < constraints.min && room.players.length < maxAllowed) {
      const takenColors = room.players.map(p => p.color);
      const assignedColor = AVAILABLE_COLORS.find(c => !takenColors.includes(c)) || 'red';
      const botCount = room.players.filter(p => p.isBot).length;
      const bot = {
        id: `bot_${Date.now()}_${Math.floor(Math.random() * 1000)}_${botCount}`,
        socketId: `bot_socket_${Date.now()}_${Math.floor(Math.random() * 1000)}_${botCount}`,
        name: BOT_NAMES[botCount % BOT_NAMES.length] || `🤖 Bot ${botCount + 1}`,
        avatar: BOT_AVATARS[botCount % BOT_AVATARS.length] || '🤖',
        color: assignedColor,
        buzzerSound: 'laser',
        isHost: false,
        isReady: true,
        isBot: true,
        botDifficulty: room.settings.difficulty || 'medium',
        score: 0,
        chips: 1000,
        isSpectator: false,
        connected: true,
      };
      room.players.push(bot);
      this.broadcastRoomUpdate(room);
    }

    room.status = 'playing';
    // C3 — nouvelle partie : on efface le classement de la manche précédente
    room.finalRanking = null;
    room.resultLabel = null;

    // C1 — L'état complet (gameState) reste SUR LE SERVEUR uniquement.
    // La salle reçoit l'état public via game_state_update et chaque joueur
    // son fragment privé via private_state (voir broadcastGameState).
    const onStateChange = (gameState) => {
      room.gameState = gameState;
      this.broadcastGameState(room);
    };

    const onGameOver = (winnerIdOrColor) => {
      room.status = 'game_over';

      // C3 — Classement final explicite, dérivé du résultat RÉEL du moteur
      // (jamais de l'ordre d'arrivée des joueurs dans le salon).
      room.finalRanking = this.buildFinalRanking(room);
      room.resultLabel = this.buildResultLabel(room);

      if (room.settings.enableGages) {
        const sortedPlayers = [...room.players].sort((a, b) => a.score - b.score);
        const loser = sortedPlayers[0];
        const randomGage = PARTY_GAGES[Math.floor(Math.random() * PARTY_GAGES.length)];
        room.activeGage = {
          title: randomGage.title,
          challenge: randomGage.challenge,
          targetPlayerName: loser?.name || 'Le dernier joueur',
        };
      }

      this.broadcastRoomUpdate(room);
    };

    if (room.gameEngine) {
      room.gameEngine.destroy();
    }

    switch (room.gameId) {
      case 'ludo': {
        room.gameEngine = new LudoEngine(room.players, onStateChange, onGameOver);
        break;
      }
      case 'scrabble': {
        room.gameEngine = new WordEngine(room.players, onStateChange, onGameOver);
        break;
      }
      case 'card_party': {
        room.gameEngine = new CardEngine(room.players, onStateChange, onGameOver);
        break;
      }
      case 'quiz': {
        room.gameEngine = new QuizEngine(room.players, onStateChange, onGameOver);
        break;
      }
      case 'draw_and_guess': {
        room.gameEngine = new DrawEngine(room.players, onStateChange, onGameOver);
        break;
      }
      case 'werewolf': {
        room.gameEngine = new WerewolfEngine(room.players, onStateChange, onGameOver);
        break;
      }
      case 'blind_test': {
        room.gameEngine = new BlindTestEngine(room.players, onStateChange, onGameOver);
        break;
      }
      case 'president': {
        room.gameEngine = new PresidentEngine(room.players, onStateChange, onGameOver);
        break;
      }
      case 'poker': {
        room.gameEngine = new PokerEngine(room.players, onStateChange, onGameOver);
        break;
      }
      case 'blackjack': {
        room.gameEngine = new BlackjackEngine(room.players, onStateChange, onGameOver);
        break;
      }
      case 'menteur': {
        room.gameEngine = new MenteurEngine(room.players, onStateChange, onGameOver);
        break;
      }
      case 'inter': {
        room.gameEngine = new InterEngine(room.players, onStateChange, onGameOver);
        break;
      }
      case 'four_pics': {
        room.gameEngine = new FourPicsEngine(room.players, onStateChange, onGameOver, room.settings);
        break;
      }
      case 'quick_games': {
        room.gameEngine = new QuickGamesEngine(room.players, onStateChange, onGameOver, room.settings);
        break;
      }
      case 'spy': {
        room.gameEngine = new SpyEngine(room.players, onStateChange, onGameOver, room.settings);
        break;
      }
      case 'petit_bac': {
        room.gameEngine = new PetitBacEngine(room.players, onStateChange, onGameOver, room.settings);
        break;
      }
      case 'fake_news': {
        room.gameEngine = new FakeNewsEngine(room.players, onStateChange, onGameOver, room.settings);
        break;
      }
      case 'bomb_party': {
        room.gameEngine = new BombPartyEngine(room.players, onStateChange, onGameOver, room.settings);
        break;
      }
      case 'naval_battle': {
        room.gameEngine = new NavalBattleEngine(room.players, onStateChange, onGameOver, room.settings);
        break;
      }
      case 'meme_factory': {
        room.gameEngine = new MemeFactoryEngine(room.players, onStateChange, onGameOver, room.settings);
        break;
      }
      case 'connect_four': {
        room.gameEngine = new ConnectFourEngine(room.players, onStateChange, onGameOver, room.settings);
        break;
      }
      case 'wild_rush': {
        room.gameEngine = new WildRushEngine(room.players, onStateChange, onGameOver, room.settings);
        break;
      }
      default: {
        room.gameEngine = new LudoEngine(room.players, onStateChange, onGameOver);
        break;
      }
    }

    room.gameState = room.gameEngine.getState();
    this.broadcastRoomUpdate(room);
    this.broadcastGameState(room);
    return { success: true };
  }

  handleGameAction(code, socketId, action, payload = {}) {
    const room = this.getRoom(code);
    if (!room || !room.gameEngine) return { success: false, error: 'Salon ou partie introuvable' };

    // Les spectateurs ne doivent pas pouvoir envoyer d'actions de jeu
    if (room.spectators.some(s => s.socketId === socketId)) {
      return { success: false, error: 'Les spectateurs ne peuvent pas jouer' };
    }

    // Authentification stricte de l'acteur par son socket et son appartenance au salon
    // Aucun recours à payload.playerId ni repli usurpateur
    const player = room.players.find(p => p.socketId === socketId && p.connected && !p.isBot);
    if (!player) {
      return { success: false, error: 'Action refusée : joueur non authentifié dans le salon' };
    }

    switch (action) {
      case 'ludo_roll_dice':
        if (room.gameId === 'ludo') room.gameEngine.rollDice(player.color);
        break;
      case 'ludo_move_pawn':
        if (room.gameId === 'ludo') room.gameEngine.movePawn(player.color, payload.pawnId);
        break;
      case 'word_play_word':
        if (room.gameId === 'scrabble') room.gameEngine.playWord(player.id, payload.tilesPlaced);
        break;
      case 'word_swap_tiles':
        if (room.gameId === 'scrabble') room.gameEngine.swapLetters(player.id, payload.tileIds);
        break;
      case 'word_pass_turn':
        if (room.gameId === 'scrabble') room.gameEngine.passTurn(player.id);
        break;
      case 'word_restart':
      case 'word_replay':
        if (room.gameId === 'scrabble') this.startGame(code);
        break;
      case 'card_play_card':
        if (room.gameId === 'card_party') room.gameEngine.playCard(player.id, payload.cardId, payload.chosenColor);
        break;
      case 'card_draw':
        if (room.gameId === 'card_party') room.gameEngine.playerDraw(player.id);
        break;
      case 'card_uno':
        if (room.gameId === 'card_party') room.gameEngine.callUno(player.id);
        break;
      case 'quiz_answer':
        if (room.gameId === 'quiz') room.gameEngine.submitAnswer(player.id, payload.optionIndex);
        break;
      case 'draw_stroke':
        if (room.gameId === 'draw_and_guess') room.gameEngine.addStroke(player.id, payload.stroke);
        break;
      case 'draw_clear':
        if (room.gameId === 'draw_and_guess') room.gameEngine.clearCanvas(player.id);
        break;
      case 'guess_word':
        if (room.gameId === 'draw_and_guess') room.gameEngine.submitGuess(player.id, payload.guessText);
        break;
      case 'werewolf_action':
        if (room.gameId === 'werewolf') room.gameEngine.handleAction(player.id, payload.targetId);
        break;
      case 'blind_test_buzz':
        if (room.gameId === 'blind_test') {
          const buzzed = room.gameEngine.handleBuzz(player.id);
          if (buzzed) {
            this.io.to(code).emit('player_buzzed', { playerId: player.id, playerName: player.name, sound: player.buzzerSound || 'arcade' });
          }
        }
        break;
      case 'blind_test_answer':
        if (room.gameId === 'blind_test') room.gameEngine.submitAnswer(player.id, payload.optionIndex);
        break;
      case 'president_play':
        if (room.gameId === 'president') room.gameEngine.playCards(player.id, payload.cardIds);
        break;
      case 'president_pass':
        if (room.gameId === 'president') room.gameEngine.passTurn(player.id);
        break;
      case 'poker_check_call':
        if (room.gameId === 'poker') room.gameEngine.handleCheckCall(player.id);
        break;
      case 'poker_raise':
        if (room.gameId === 'poker') room.gameEngine.handleRaise(player.id, payload.amount || 40);
        break;
      case 'poker_fold':
        if (room.gameId === 'poker') room.gameEngine.handleFold(player.id);
        break;
      case 'blackjack_hit':
        if (room.gameId === 'blackjack') room.gameEngine.handleHit(player.id);
        break;
      case 'blackjack_stand':
        if (room.gameId === 'blackjack') room.gameEngine.handleStand(player.id);
        break;
      case 'blackjack_double':
        if (room.gameId === 'blackjack') room.gameEngine.handleDouble(player.id);
        break;
      case 'menteur_play_cards':
        if (room.gameId === 'menteur') room.gameEngine.playCards(player.id, payload.cardIds, payload.claimedRank);
        break;
      case 'menteur_call_liar':
        if (room.gameId === 'menteur') room.gameEngine.callLiar(player.id);
        break;
      case 'inter_play_card':
        if (room.gameId === 'inter') room.gameEngine.playCard(player.id, payload.cardId, payload.chosenDemandRank);
        break;
      case 'inter_draw_card':
        if (room.gameId === 'inter') room.gameEngine.drawCard(player.id);
        break;
      case 'four_pics_submit_word':
      case 'four_pics_guess':
        if (room.gameId === 'four_pics' && room.gameEngine) room.gameEngine.submitGuess(player.id, payload.word || payload.guess);
        break;
      case 'four_pics_hint_reveal':
        if (room.gameId === 'four_pics' && room.gameEngine) room.gameEngine.useHintRevealLetter(player.id);
        break;
      case 'four_pics_hint_remove':
        if (room.gameId === 'four_pics' && room.gameEngine) room.gameEngine.useHintRemoveLetters(player.id);
        break;
      case 'four_pics_zoom':
        if (room.gameId === 'four_pics' && room.gameEngine) room.gameEngine.zoomImage(payload.imageIndex);
        break;
      case 'four_pics_select_stage':
        if (room.gameId === 'four_pics' && room.gameEngine) {
          room.gameEngine.loadStage(payload.level || 1, payload.stageNumber || 1);
        }
        break;
      case 'four_pics_next_stage':
        if (room.gameId === 'four_pics' && room.gameEngine) {
          room.gameEngine.nextAdventureStage();
        }
        break;
      case 'four_pics_reset_adventure':
        if (room.gameId === 'four_pics' && room.gameEngine) {
          room.gameEngine.loadStage(1, 1);
        }
        break;
      case 'four_pics_rematch':
        if (room.gameId === 'four_pics' && room.gameEngine) room.gameEngine.startRound();
        break;
      case 'quick_game_action':
        if (room.gameId === 'quick_games' && room.gameEngine) {
          room.gameEngine.handlePlayerAction(player.id, payload.action, payload);
        }
        break;
      case 'wild_rush_choice':
        if (room.gameId === 'wild_rush' && room.gameEngine) {
          room.gameEngine.submitChoice(player.id, payload.choiceId);
        }
        break;
      case 'wild_rush_cheer':
        if (room.gameId === 'wild_rush' && room.gameEngine) {
          room.gameEngine.cheer(player.id);
        }
        break;
      case 'c4_drop_chip':
        if (room.gameId === 'connect_four' && room.gameEngine) {
          return room.gameEngine.handleAction(action, payload, socketId, player.id);
        }
        break;
      case 'bp_submit_word':
        if (room.gameId === 'bomb_party' && room.gameEngine) {
          return room.gameEngine.handleAction(action, payload, socketId, player.id);
        }
        break;
      case 'nb_place_fleet':
      case 'nb_auto_place':
      case 'nb_fire':
        if (room.gameId === 'naval_battle' && room.gameEngine) {
          return room.gameEngine.handleAction(action, payload, socketId, player.id);
        }
        break;
      case 'mf_submit_caption':
      case 'mf_cast_vote':
        if (room.gameId === 'meme_factory' && room.gameEngine) {
          return room.gameEngine.handleAction(action, payload, socketId, player.id);
        }
        break;
      case 'fn_submit_lie':
      case 'fn_cast_vote':
      case 'fn_restart':
        if (room.gameId === 'fake_news' && room.gameEngine) {
          return room.gameEngine.handleAction(player.id, action, payload);
        }
        break;
      case 'bac_submit_answers':
      case 'bac_cast_vote':
      case 'bac_restart':
        if (room.gameId === 'petit_bac' && room.gameEngine) {
          return room.gameEngine.handleAction(player.id, action, payload);
        }
        break;
      case 'spy_submit_clue':
      case 'spy_vote':
      case 'spy_guess_word':
      case 'spy_restart':
        if (room.gameId === 'spy' && room.gameEngine) {
          return room.gameEngine.handleAction(player.id, action, payload);
        }
        break;
      default:
        if (room.gameEngine && typeof room.gameEngine.handleAction === 'function') {
          if (room.gameEngine.handleAction.length >= 3) {
            return room.gameEngine.handleAction(action, payload, socketId, player.id);
          } else {
            return room.gameEngine.handleAction(player.id, action, payload);
          }
        }
        break;
    }
    return { success: true };
  }

  sendReaction(code, socketId, emoji) {
    const room = this.getRoom(code);
    if (!room) return;
    const player = room.players.find(p => p.socketId === socketId && p.connected) ||
                   room.spectators.find(s => s.socketId === socketId && s.connected);
    if (!player) return; // Seuls les participants authentifiés du salon peuvent réagir
    const reaction = {
      id: Math.random().toString(36).substring(2, 9),
      emoji: emoji || '🔥',
      playerName: player.name,
      timestamp: Date.now(),
    };
    room.reactions.push(reaction);
    if (room.reactions.length > 20) room.reactions.shift();

    this.io.to(code).emit('reaction_received', reaction);
  }

  replayGame(code, socketId = null) {
    const room = this.getRoom(code);
    if (!room) return { success: false, error: 'Salon introuvable' };
    if (socketId && !this.isHostAuthorized(room, socketId)) {
      return { success: false, error: 'Action réservée à l’hôte' };
    }
    return this.startGame(code, socketId);
  }

  returnToLobby(code, socketId = null) {
    const room = this.getRoom(code);
    if (!room) return { success: false, error: 'Salon introuvable' };
    if (socketId && !this.isHostAuthorized(room, socketId)) {
      return { success: false, error: 'Action réservée à l’hôte' };
    }
    if (room.gameEngine) room.gameEngine.destroy();
    room.status = 'lobby';
    room.gameState = null;
    room.activeGage = null;
    // C3 — plus de classement résiduel d'une partie précédente
    room.finalRanking = null;
    room.resultLabel = null;
    for (const p of room.players) {
      if (!p.isBot) p.isReady = false;
    }
    this.broadcastRoomUpdate(room);
    return { success: true };
  }

  handleDisconnect(socketId) {
    for (const [code, room] of this.rooms.entries()) {
      const player = room.players.find(p => p.socketId === socketId);
      if (player && !player.isBot) {
        player.connected = false;
        this.broadcastRoomUpdate(room);
      }
      const spectatorIndex = room.spectators.findIndex(s => s.socketId === socketId);
      if (spectatorIndex !== -1) {
        room.spectators.splice(spectatorIndex, 1);
        this.broadcastRoomUpdate(room);
      }
    }
  }

  /**
   * C3 — Construit le classement final à partir du résultat RÉEL de la partie,
   * lu dans l'état frais du moteur (getState()), jamais dans l'ordre du tableau
   * room.players (= ordre d'arrivée dans le salon).
   *
   * Chaque jeu possède son propre système de victoire :
   *  - scores           : quiz, blind_test, draw_and_guess, inter, four_pics, quick_games
   *  - podium officiel  : scrabble (finalPodium), president (ordre président->trouduc)
   *  - jetons           : poker (playerChips)
   *  - statuts de paiement: blackjack (payoutStatus: blackjack > win > push > lose)
   *  - pions / parcours : ludo (pions rentrés + avance)
   *  - cartes restantes : card_party/uno et menteur (le vainqueur a vidé sa main)
   *  - équipe           : werewolf (winnerTeam — pas de vainqueur individuel)
   *
   * Égalités : pour les jeux à score, deux joueurs ex æquo partagent le même rang
   * (classement « competition ranking »). Pour les jeux où LE RÉSULTAT est un
   * ordre (président, course, statuts...), les rangs restent strictement positionnels.
   */
  buildFinalRanking(room) {
    const engine = room.gameEngine;
    if (!engine || typeof engine.getState !== 'function') return null;
    const gs = engine.getState();

    const playerById = new Map(room.players.map((p) => [p.id, p]));
    const idsInRoom = room.players.map((p) => p.id);

    // Reordonne en plaçant un id donné en tête (vainqueur explicite)
    const promoteFirst = (ids, winnerId) => {
      if (!winnerId) return ids;
      return [winnerId, ...ids.filter((id) => id !== winnerId)];
    };

    let ordered = []; // [{ id, score }]
    let tieByScore = true; // égalités de score => rang partagé
    let winningTeam = null; // werewolf uniquement
    let teamMap = null; // playerId -> 'villagers' | 'werewolves'

    switch (room.gameId) {
      case 'scrabble':
      case 'connect_four':
      case 'naval_battle':
      case 'meme_factory': {
        if (Array.isArray(gs.finalPodium) && gs.finalPodium.length > 0) {
          ordered = gs.finalPodium.map((pl) => ({ id: pl.id, score: pl.score || 0 }));
        }
        break;
      }

      case 'quiz':
      case 'blind_test':
      case 'draw_and_guess':
      case 'inter':
      case 'four_pics':
      case 'quick_games': {
        const scores = gs.scores || {};
        ordered = idsInRoom
          .map((id) => ({ id, score: Number(scores[id]) || 0 }))
          .sort((a, b) => b.score - a.score);
        break;
      }

      case 'poker': {
        const chips = gs.playerChips || {};
        const rows = idsInRoom
          .map((id) => ({ id, score: Number(chips[id]) || 0 }))
          .sort((a, b) => b.score - a.score);
        // Le gagnant de la main est garanti 1er (il a remporté le pot)
        ordered = gs.winnerId
          ? [...rows.filter((r) => r.id === gs.winnerId), ...rows.filter((r) => r.id !== gs.winnerId)]
          : rows;
        break;
      }

      case 'president': {
        tieByScore = false; // le résultat EST l'ordre d'arrivée
        if (Array.isArray(gs.finishedPlayers) && gs.finishedPlayers.length > 0) {
          const known = gs.finishedPlayers.map((f) => f.playerId);
          const missing = idsInRoom.filter((id) => !known.includes(id));
          ordered = [...known, ...missing].map((id) => ({ id, score: 0 }));
        }
        break;
      }

      case 'blackjack': {
        tieByScore = false; // le résultat EST le statut de paiement
        const statusRank = { blackjack: 0, win: 1, push: 2, lose: 3 };
        ordered = idsInRoom
          .map((id) => ({ id, score: 0, st: statusRank[gs.playerHands?.[id]?.payoutStatus] ?? 3 }))
          .sort((a, b) => a.st - b.st)
          .map(({ id, score }) => ({ id, score }));
        break;
      }

      case 'ludo': {
        tieByScore = false; // vainqueur = premier à avoir rentré ses 4 pions
        const pawnStrength = (pawn) =>
          pawn.isFinished ? 1000
            : pawn.position >= 100 ? 500 + (pawn.position - 100) * 10
            : pawn.isHome ? 0
            : pawn.position;
        ordered = idsInRoom
          .map((id) => {
            const color = playerById.get(id)?.color;
            const pawns = (color && gs.pawns?.[color]) || [];
            const finished = pawns.filter((pw) => pw.isFinished).length;
            const strength = pawns.reduce((s, pw) => s + pawnStrength(pw), 0);
            return { id, score: finished * 25, strength };
          })
          .sort((a, b) => b.strength - a.strength)
          .map(({ id, score }) => ({ id, score }));
        // Le vrai vainqueur (couleur) est promu 1er
        const winnerColor = gs.winner;
        const winnerEntryIdx = ordered.findIndex(
          (e) => playerById.get(e.id)?.color === winnerColor
        );
        if (winnerEntryIdx > 0) {
          const [w] = ordered.splice(winnerEntryIdx, 1);
          ordered.unshift(w);
        }
        break;
      }

      case 'card_party':
      case 'menteur': {
        tieByScore = false; // le vainqueur est celui qui a vidé sa main
        const counts = gs.playerCardCounts || {};
        let ids = idsInRoom
          .slice()
          .sort((a, b) => Number(counts[a] ?? 99) - Number(counts[b] ?? 99));
        ids = promoteFirst(ids, gs.winner);
        ordered = ids.map((id) => ({ id, score: 0 }));
        break;
      }

      case 'werewolf': {
        tieByScore = false; // victoire d'ÉQUIPE, pas de score
        const wt = gs.winnerTeam;
        winningTeam = wt;
        const teamOfId = (id) =>
          gs.players?.[id]?.role === 'werewolf' ? 'werewolves' : 'villagers';
        const isAlive = (id) => !!gs.players?.[id]?.isAlive;
        const orderGroup = (list) => [
          ...list.filter((p) => isAlive(p.id)),
          ...list.filter((p) => !isAlive(p.id)),
        ];
        const winners = orderGroup(room.players.filter((p) => wt && teamOfId(p.id) === wt));
        const losers = orderGroup(room.players.filter((p) => !wt || teamOfId(p.id) !== wt));
        teamMap = Object.fromEntries(room.players.map((p) => [p.id, teamOfId(p.id)]));
        ordered = [...winners, ...losers].map((p) => ({ id: p.id, score: 0 }));
        break;
      }

      case 'wild_rush': {
        tieByScore = false;
        if (Array.isArray(gs.finishedPlayers) && gs.finishedPlayers.length > 0) {
          const finishedIds = gs.finishedPlayers.map((p) => p.id);
          const unfinished = (gs.players || [])
            .filter((p) => !finishedIds.includes(p.id))
            .sort((a, b) => (b.distance || 0) - (a.distance || 0))
            .map((p) => p.id);
          ordered = [...finishedIds, ...unfinished].map((id) => ({
            id,
            score: gs.players?.find((p) => p.id === id)?.score || 0,
          }));
        } else if (Array.isArray(gs.players)) {
          ordered = [...gs.players]
            .sort((a, b) => (b.distance || 0) - (a.distance || 0))
            .map((p) => ({ id: p.id, score: p.score || 0 }));
        }
        break;
      }

      default: {
        // Repli générique défensif : scores connus puis ordre du salon
        const scores = gs.scores || {};
        ordered = idsInRoom.map((id) => ({ id, score: Number(scores[id]) || 0 }));
        break;
      }
    }

    // Sécurité : tout joueur manquant est ajouté en fin de classement
    for (const id of idsInRoom) {
      if (!ordered.some((e) => e.id === id)) ordered.push({ id, score: 0 });
    }

    let lastScoreKey = null;
    let lastRank = 0;

    const ranking = ordered.map((e, idx) => {
      const p = playerById.get(e.id);
      const entryOut = {
        playerId: e.id,
        name: p ? p.name : 'Joueur',
        avatar: p ? p.avatar : '🎮',
        color: p ? p.color : 'red',
        score: Number.isFinite(e.score) ? Math.round(e.score) : 0,
        rank: idx + 1,
        isWinner: false,
      };
      if (tieByScore) {
        // Ex æquo : même score => même rang (competition ranking)
        if (lastScoreKey !== null && e.score === lastScoreKey) {
          entryOut.rank = lastRank;
        } else {
          lastRank = idx + 1;
          lastScoreKey = e.score;
          entryOut.rank = lastRank;
        }
      }
      if (teamMap && teamMap[e.id]) entryOut.team = teamMap[e.id];
      return entryOut;
    });

    // Vainqueur(s) : équipe entière pour werewolf, sinon tous les rangs 1 (ex æquo inclus)
    for (const e of ranking) {
      e.isWinner = winningTeam ? e.team === winningTeam : e.rank === 1;
    }

    return ranking;
  }

  /**
   * C3 — Libellé de résultat pour les systèmes de victoire non individuels.
   */
  buildResultLabel(room) {
    const engine = room.gameEngine;
    if (!engine || typeof engine.getState !== 'function') return null;
    const gs = engine.getState();

    if (room.gameId === 'werewolf') {
      if (gs.winnerTeam === 'werewolves') return 'Victoire des Loups-Garous 🐺';
      if (gs.winnerTeam === 'villagers') return 'Victoire du Village 👨‍🌾';
    }
    if (room.gameId === 'wild_rush') {
      const winner = room.players.find(p => p.id === gs.winnerId);
      return winner ? `${winner.name} franchit la ligne d'arrivée en tête ! 🏆` : 'Course Wild Rush terminée !';
    }
    if (room.gameId === 'connect_four') {
      const winner = gs.finalPodium?.[0];
      return winner ? `${winner.name} a aligné 4 pions victorieux ! 🔴🟡` : 'Match de Puissance 4 terminé !';
    }
    return null;
  }

  getPublicRoomState(room) {
    // C1 — Seul l'état PUBLIC du jeu circule dans room_state_update.
    // L'état complet (room.gameState) ne quitte jamais le serveur.
    // Les moteurs sans données secrètes (ludo, four_pics) n'exposent
    // pas getPublicState : leur état complet est déjà public.
    const publicGameState =
      room.gameEngine && room.gameState
        ? typeof room.gameEngine.getPublicState === 'function'
          ? room.gameEngine.getPublicState()
          : room.gameState
        : null;

    return {
      code: room.code,
      gameId: room.gameId,
      status: room.status,
      hostId: room.hostId,
      serverLanIp: this.localIp,
      settings: room.settings,
      players: room.players.map((p) => this.sanitizePlayer(p)),
      spectators: room.spectators.map((s) => this.sanitizePlayer(s)),
      gameState: publicGameState,
      reactions: room.reactions,
      activeGage: room.activeGage,
      tournamentScores: room.tournamentScores,
      // C3 — classement final explicite calculé par le serveur au game_over
      finalRanking: room.finalRanking || null,
      resultLabel: room.resultLabel || null,
    };
  }

  broadcastRoomUpdate(room) {
    this.io.to(room.code).emit('room_state_update', this.getPublicRoomState(room));
  }

  /**
   * C1 — Diffusion de l'état de jeu en deux flux :
   *  1. game_state_update (broadcast salle) : état PUBLIC assaini par le moteur
   *     (sans mains, rôles, mots secrets, réponses...).
   *  2. private_state (unicast par socket) : fragment PRIVÉ de chaque joueur
   *     humain connecté (sa main, son rôle, son mot...).
   * Les bots n'ont pas de socket et sont ignorés. La TV (socket hôte) ne
   * reçoit que l'état public.
   */
  broadcastGameState(room) {
    if (!room.gameEngine || !room.gameState) return;

    // Les moteurs sans secrets (ludo, four_pics) n'ont pas
    // getPublicState : leur état complet est public par nature.
    const publicState =
      typeof room.gameEngine.getPublicState === 'function'
        ? room.gameEngine.getPublicState()
        : room.gameState;

    this.io.to(room.code).emit('game_state_update', publicState);

    if (typeof room.gameEngine.getPrivateState === 'function') {
      for (const p of room.players) {
        if (p.isBot || !p.connected || !p.socketId) continue;
        const privateFragment = room.gameEngine.getPrivateState(p.id);
        if (privateFragment) {
          this.io.to(p.socketId).emit('private_state', privateFragment);
        }
      }
    }
  }
}
