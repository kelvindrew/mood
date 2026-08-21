// Room State & Game Session Manager for PLAYFLIX
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
import { MiniRacingEngine } from './games/miniRacingEngine.js';
import { QuickGamesEngine } from './games/quickGamesEngine.js';

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

  createRoom(hostSocketId, gameId = 'ludo', settings = {}) {
    const code = this.generateRoomCode();
    const room = {
      code,
      gameId,
      status: 'lobby',
      hostId: hostSocketId,
      settings: {
        maxPlayers: settings.maxPlayers || 6,
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
      createdAt: Date.now(),
    };

    this.rooms.set(code, room);
    return room;
  }

  getRoom(code) {
    if (!code) return null;
    return this.rooms.get(code.toString().trim());
  }

  joinRoom(code, socketId, playerData = {}, isSpectator = false) {
    const room = this.getRoom(code);
    if (!room) {
      return { success: false, error: 'Salon introuvable. Vérifiez le code à 4 chiffres.' };
    }

    if (isSpectator) {
      const spectator = {
        id: playerData.id || socketId,
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
      return { success: true, room: this.getPublicRoomState(room), player: spectator };
    }

    // Reconnection of an existing player
    const existingPlayer = room.players.find(p => p.id === playerData.id);
    if (existingPlayer) {
      existingPlayer.socketId = socketId;
      existingPlayer.connected = true;
      if (playerData.selfieImage) existingPlayer.selfieImage = playerData.selfieImage;
      this.broadcastRoomUpdate(room);
      return { success: true, room: this.getPublicRoomState(room), player: existingPlayer };
    }

    if (room.players.length >= room.settings.maxPlayers) {
      return { success: false, error: 'Le salon est complet !' };
    }

    const takenColors = room.players.map(p => p.color);
    const assignedColor = AVAILABLE_COLORS.find(c => !takenColors.includes(c)) || 'red';

    const newPlayer = {
      id: playerData.id || `p_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
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
    return { success: true, room: this.getPublicRoomState(room), player: newPlayer };
  }

  reconnectPlayer(code, socketId, playerId, playerData = {}) {
    const room = this.getRoom(code);
    if (!room) return null;

    let player = room.players.find(p => p.id === playerId);
    if (player) {
      player.socketId = socketId;
      player.connected = true;
    } else {
      const res = this.joinRoom(code, socketId, { ...playerData, id: playerId });
      if (res.success) player = res.player;
    }

    this.broadcastRoomUpdate(room);
    if (room.gameState) {
      this.io.to(socketId).emit('game_state_update', room.gameState);
    }
    return player;
  }

  addBot(code, difficulty = 'medium') {
    const room = this.getRoom(code);
    if (!room) return;
    if (room.players.length >= room.settings.maxPlayers) return;

    const takenColors = room.players.map(p => p.color);
    const assignedColor = AVAILABLE_COLORS.find(c => !takenColors.includes(c)) || 'red';
    const botCount = room.players.filter(p => p.isBot).length;

    const bot = {
      id: `bot_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
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
  }

  removeBot(code, botId) {
    const room = this.getRoom(code);
    if (!room) return;

    if (botId) {
      const idx = room.players.findIndex(p => p.id === botId && p.isBot);
      if (idx !== -1) room.players.splice(idx, 1);
    } else {
      const lastBotIdx = room.players.map(p => p.isBot).lastIndexOf(true);
      if (lastBotIdx !== -1) room.players.splice(lastBotIdx, 1);
    }

    this.broadcastRoomUpdate(room);
  }

  toggleReady(code, socketId) {
    const room = this.getRoom(code);
    if (!room) return;
    const player = room.players.find(p => p.socketId === socketId);
    if (player) {
      player.isReady = !player.isReady;
      this.broadcastRoomUpdate(room);
    }
  }

  setSelfieImage(code, socketId, selfieImage) {
    const room = this.getRoom(code);
    if (!room) return;
    const player = room.players.find(p => p.socketId === socketId);
    if (player) {
      player.selfieImage = selfieImage;
      this.broadcastRoomUpdate(room);
    }
  }

  setBuzzerSound(code, socketId, sound) {
    const room = this.getRoom(code);
    if (!room) return;
    const player = room.players.find(p => p.socketId === socketId);
    if (player) {
      player.buzzerSound = sound;
      this.broadcastRoomUpdate(room);
    }
  }

  updatePlayerColor(code, socketId, newColor) {
    const room = this.getRoom(code);
    if (!room) return;
    const player = room.players.find(p => p.socketId === socketId);
    if (player && !room.players.some(p => p.socketId !== socketId && p.color === newColor)) {
      player.color = newColor;
      this.broadcastRoomUpdate(room);
    }
  }

  updateSettings(code, newSettings) {
    const room = this.getRoom(code);
    if (!room) return;
    room.settings = { ...room.settings, ...newSettings };
    this.broadcastRoomUpdate(room);
  }

  selectGame(code, gameId) {
    const room = this.getRoom(code);
    if (!room) return;
    room.gameId = gameId;
    this.broadcastRoomUpdate(room);
  }

  startGame(code) {
    const room = this.getRoom(code);
    if (!room) return { success: false, error: 'Salon introuvable' };
    if (room.players.length === 0) return { success: false, error: 'Aucun joueur dans le salon' };

    room.status = 'playing';

    const onStateChange = (gameState) => {
      room.gameState = gameState;
      this.io.to(code).emit('game_state_update', gameState);
    };

    const onGameOver = (winnerIdOrColor) => {
      room.status = 'game_over';

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
        room.gameEngine = new FourPicsEngine(room.players, onStateChange, onGameOver);
        break;
      }
      case 'mini_racing': {
        room.gameEngine = new MiniRacingEngine(room.players, onStateChange, onGameOver);
        break;
      }
      case 'quick_games': {
        room.gameEngine = new QuickGamesEngine(room.players, onStateChange, onGameOver);
        break;
      }
      default: {
        room.gameEngine = new LudoEngine(room.players, onStateChange, onGameOver);
        break;
      }
    }

    room.gameState = room.gameEngine.getState();
    this.broadcastRoomUpdate(room);
    return { success: true };
  }

  handleGameAction(code, socketId, action, payload = {}) {
    const room = this.getRoom(code);
    if (!room || !room.gameEngine) return;

    // Resilient player resolution: by socketId OR by persistent playerId in payload
    const player = room.players.find(p => p.socketId === socketId || (payload?.playerId && p.id === payload.playerId));
    if (!player) return;

    // Make sure socket is bound to latest socketId
    if (player.socketId !== socketId) {
      player.socketId = socketId;
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
      case 'four_pics_rematch':
        if (room.gameId === 'four_pics' && room.gameEngine) room.gameEngine.startRound();
        break;
      case 'racing_action':
        if (room.gameId === 'mini_racing' && room.gameEngine) {
          room.gameEngine.handlePlayerInput(player.id, payload.action, payload);
        }
        break;
      case 'quick_game_action':
        if (room.gameId === 'quick_games' && room.gameEngine) {
          room.gameEngine.handlePlayerAction(player.id, payload.action, payload);
        }
        break;
      default:
        break;
    }
  }

  sendReaction(code, socketId, emoji) {
    const room = this.getRoom(code);
    if (!room) return;
    const player = room.players.find(p => p.socketId === socketId) || room.spectators.find(s => s.socketId === socketId);
    const reaction = {
      id: Math.random().toString(36).substring(2, 9),
      emoji: emoji || '🔥',
      playerName: player ? player.name : 'Spectateur',
      timestamp: Date.now(),
    };
    room.reactions.push(reaction);
    if (room.reactions.length > 20) room.reactions.shift();

    this.io.to(code).emit('reaction_received', reaction);
  }

  replayGame(code) {
    const room = this.getRoom(code);
    if (!room) return;
    this.startGame(code);
  }

  returnToLobby(code) {
    const room = this.getRoom(code);
    if (!room) return;
    if (room.gameEngine) room.gameEngine.destroy();
    room.status = 'lobby';
    room.gameState = null;
    room.activeGage = null;
    for (const p of room.players) {
      if (!p.isBot) p.isReady = false;
    }
    this.broadcastRoomUpdate(room);
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

  getPublicRoomState(room) {
    return {
      code: room.code,
      gameId: room.gameId,
      status: room.status,
      hostId: room.hostId,
      serverLanIp: this.localIp,
      settings: room.settings,
      players: room.players,
      spectators: room.spectators,
      gameState: room.gameState,
      reactions: room.reactions,
      activeGage: room.activeGage,
      tournamentScores: room.tournamentScores,
    };
  }

  broadcastRoomUpdate(room) {
    this.io.to(room.code).emit('room_state_update', this.getPublicRoomState(room));
  }
}
