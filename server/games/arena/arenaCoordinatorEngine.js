// Arena Coordinator Engine for MOOD ARENA
// Instantiates and orchestrates the selected Arena subgame

import { MemoryPokerEngine } from './memoryPokerEngine.js';
import { FragmentsEngine } from './fragmentsEngine.js';
import { SecretNumberEngine } from './secretNumberEngine.js';
import { VirusGameEngine } from './virusGameEngine.js';
import { DoubtAndBetEngine } from './doubtAndBetEngine.js';
import { EquationPyramidEngine } from './equationPyramidEngine.js';
import { KnightsTourEngine } from './knightsTourEngine.js';
import { NineMensMorrisEngine } from './nineMensMorrisEngine.js';
import { MontageEngine } from './montageEngine.js';
import { ScaleGameEngine } from './scaleGameEngine.js';

export class ArenaCoordinatorEngine {
  constructor(players, onStateChange, onGameOver, settings = {}) {
    this.players = players;
    this.onStateChange = onStateChange;
    this.onGameOver = onGameOver;
    this.settings = settings;

    // Détermination du sous-jeu d'Arène
    this.subGameId = settings.arenaGameId || 'memory_poker';
    this.subEngine = null;

    this.initSubEngine();
  }

  initSubEngine() {
    if (this.subEngine && typeof this.subEngine.destroy === 'function') {
      this.subEngine.destroy();
    }

    const onSubStateChange = (subState) => {
      if (typeof this.onStateChange === 'function') {
        this.onStateChange(this.getState());
      }
    };

    const onSubGameOver = (winnerId) => {
      if (typeof this.onGameOver === 'function') {
        this.onGameOver(winnerId);
      }
    };

    switch (this.subGameId) {
      case 'memory_poker':
      case 'arena_memory_poker':
        this.subEngine = new MemoryPokerEngine(this.players, onSubStateChange, onSubGameOver, this.settings);
        break;
      case 'fragments_of_memory':
      case 'arena_fragments':
        this.subEngine = new FragmentsEngine(this.players, onSubStateChange, onSubGameOver, this.settings);
        break;
      case 'secret_number':
      case 'arena_secret_number':
        this.subEngine = new SecretNumberEngine(this.players, onSubStateChange, onSubGameOver, this.settings);
        break;
      case 'the_virus_game':
      case 'arena_virus':
        this.subEngine = new VirusGameEngine(this.players, onSubStateChange, onSubGameOver, this.settings);
        break;
      case 'doubt_and_bet':
      case 'arena_doubt_bet':
        this.subEngine = new DoubtAndBetEngine(this.players, onSubStateChange, onSubGameOver, this.settings);
        break;
      case 'equation_pyramid':
      case 'arena_equation_pyramid':
        this.subEngine = new EquationPyramidEngine(this.players, onSubStateChange, onSubGameOver, this.settings);
        break;
      case 'knights_tour':
      case 'arena_knights_tour':
        this.subEngine = new KnightsTourEngine(this.players, onSubStateChange, onSubGameOver, this.settings);
        break;
      case 'nine_mens_morris':
      case 'arena_nine_mens_morris':
        this.subEngine = new NineMensMorrisEngine(this.players, onSubStateChange, onSubGameOver, this.settings);
        break;
      case 'montage':
      case 'arena_montage':
        this.subEngine = new MontageEngine(this.players, onSubStateChange, onSubGameOver, this.settings);
        break;
      case 'scale_game':
      case 'arena_scale_game':
        this.subEngine = new ScaleGameEngine(this.players, onSubStateChange, onSubGameOver, this.settings);
        break;
      default:
        this.subEngine = new MemoryPokerEngine(this.players, onSubStateChange, onSubGameOver, this.settings);
        break;
    }
  }

  handleAction(player, action, payload = {}) {
    const playerObj = typeof player === 'object' && player !== null
      ? player
      : { id: String(player) };

    if (action === 'switch_arena_game') {
      if (payload.arenaGameId) {
        this.subGameId = payload.arenaGameId;
        this.initSubEngine();
        if (typeof this.onStateChange === 'function') {
          this.onStateChange(this.getState());
        }
      }
      return;
    }

    if (this.subEngine && typeof this.subEngine.handleAction === 'function') {
      this.subEngine.handleAction(playerObj, action, payload);
    }
  }

  getState() {
    return {
      isArena: true,
      subGameId: this.subGameId,
      subState: this.subEngine ? this.subEngine.getState() : {},
    };
  }

  getPublicState() {
    return {
      isArena: true,
      subGameId: this.subGameId,
      subState: this.subEngine && typeof this.subEngine.getPublicState === 'function'
        ? this.subEngine.getPublicState()
        : this.subEngine?.getState() || {},
    };
  }

  getPrivateState(playerId) {
    if (this.subEngine && typeof this.subEngine.getPrivateState === 'function') {
      return {
        isArena: true,
        subGameId: this.subGameId,
        subPrivate: this.subEngine.getPrivateState(playerId),
      };
    }
    return { isArena: true, subGameId: this.subGameId };
  }

  destroy() {
    if (this.subEngine && typeof this.subEngine.destroy === 'function') {
      this.subEngine.destroy();
    }
  }
}
