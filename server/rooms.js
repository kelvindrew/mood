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
    if (room.gameState && room.gameEngine) {
      // C1 — Reconnexion : état public + fragment privé ciblé (jamais l'état brut)
      this.io.to(socketId).emit(
        'game_state_update',
        typeof room.gameEngine.getPublicState === 'function'
          ? room.gameEngine.getPublicState()
          : room.gameState
      );
      if (player && typeof room.gameEngine.getPrivateState === 'function') {
        const privateFragment = room.gameEngine.getPrivateState(player.id);
        if (privateFragment) {
          this.io.to(socketId).emit('private_state', privateFragment);
        }
      }
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
    if (room.players.length === 0) {
      // Auto-création d'un joueur hôte pour permettre le lancement immédiat sur PC/TV sans attendre de smartphone
      const defaultHostPlayer = {
        id: `p_host_${Date.now()}`,
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
        room.gameEngine = new FourPicsEngine(room.players, onStateChange, onGameOver);
        break;
      }
      case 'mini_racing': {
        room.gameEngine = new MiniRacingEngine(room.players, onStateChange, onGameOver);
        break;
      }
      case 'quick_games': {
        room.gameEngine = new QuickGamesEngine(room.players, onStateChange, onGameOver, room.settings);
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
    if (!room || !room.gameEngine) return;

    // Resilient player resolution: by socketId OR by persistent playerId in payload OR host fallback
    let player = room.players.find(p => p.socketId === socketId || (payload?.playerId && p.id === payload.playerId));
    if (!player && (socketId === room.hostId || action.startsWith('four_pics_') || action.startsWith('quick_game_') || action === 'return_to_lobby')) {
      player = room.players.find(p => p.isHost) || room.players[0];
    }
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
    // C3 — plus de classement résiduel d'une partie précédente
    room.finalRanking = null;
    room.resultLabel = null;
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
   *  - pions / parcours : ludo (pions rentrés + avance), mini_racing (finishOrder)
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
      case 'scrabble': {
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

      case 'mini_racing': {
        tieByScore = false; // le résultat EST l'ordre de franchissement
        const finishIds = Array.isArray(gs.finishOrder) ? gs.finishOrder : [];
        const progressOf = (id) =>
          Number((gs.players || []).find((r) => r.id === id)?.progress) || 0;
        const rest = idsInRoom
          .filter((id) => !finishIds.includes(id))
          .map((id) => ({ id, progress: progressOf(id) }))
          .sort((a, b) => b.progress - a.progress)
          .map((x) => x.id);
        ordered = [...finishIds.filter((id) => idsInRoom.includes(id)), ...rest]
          .map((id) => ({ id, score: 0 }));
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
    return null;
  }

  getPublicRoomState(room) {
    // C1 — Seul l'état PUBLIC du jeu circule dans room_state_update.
    // L'état complet (room.gameState) ne quitte jamais le serveur.
    // Les moteurs sans données secrètes (ludo, four_pics, mini_racing) n'exposent
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
      players: room.players,
      spectators: room.spectators,
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

    // Les moteurs sans secrets (ludo, four_pics, mini_racing) n'ont pas
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
