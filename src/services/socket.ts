import { io, Socket } from 'socket.io-client';
import { RoomState, Player } from '../types/game';

class SocketService {
  private socket: Socket | null = null;
  private serverUrl: string = '';

  constructor() {
    this.detectServerUrl();
  }

  private detectServerUrl() {
    const envUrl = import.meta.env.VITE_SOCKET_URL;
    if (envUrl) {
      this.serverUrl = envUrl;
      return;
    }

    if (typeof window !== 'undefined') {
      // Connect to origin (Vite dev proxy forwards /socket.io to backend 3001)
      this.serverUrl = window.location.origin;
    } else {
      this.serverUrl = 'http://localhost:3001';
    }
  }

  public connect(): Socket {
    if (!this.socket) {
      this.detectServerUrl();
      this.socket = io(this.serverUrl, {
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 500,
        reconnectionDelayMax: 2000,
        timeout: 10000,
        transports: ['websocket', 'polling'],
      });

      this.socket.on('connect', () => {
        console.log('[PLAYFLIX Socket] Connected successfully, socket ID:', this.socket?.id);
        this.performHandshake();
      });

      this.socket.on('connect_error', (error) => {
        console.warn('[PLAYFLIX Socket] Connection error:', error.message);
        if (typeof window !== 'undefined' && this.serverUrl === window.location.origin) {
          const directUrl = `http://${window.location.hostname}:3001`;
          if (this.serverUrl !== directUrl) {
            console.log('[PLAYFLIX Socket] Fallback to direct port 3001:', directUrl);
            this.serverUrl = directUrl;
          }
        }
      });
    }
    return this.socket;
  }

  private performHandshake() {
    if (typeof window === 'undefined') return;
    try {
      const savedSession = localStorage.getItem('playflix_session');
      if (savedSession) {
        const { code, player } = JSON.parse(savedSession);
        if (code && player?.id) {
          this.socket?.emit('reconnect_player', { code, playerId: player.id, playerData: player });
        }
      }
    } catch {}
  }

  public getSocket(): Socket | null {
    return this.socket;
  }

  // Room Actions
  public createRoom(gameId: string, settings: unknown): Promise<{ success: boolean; room: RoomState; localIp?: string; error?: string }> {
    return new Promise((resolve) => {
      const socket = this.connect();
      socket.emit('create_room', { gameId, settings }, (res: { success: boolean; room: RoomState; localIp?: string; error?: string }) => {
        resolve(res);
      });
    });
  }

  public joinRoom(code: string, playerData: Partial<Player>, isSpectator = false): Promise<{ success: boolean; room?: RoomState; player?: Player; error?: string }> {
    return new Promise((resolve) => {
      const socket = this.connect();
      socket.emit('join_room', { code, playerData, isSpectator }, (res: { success: boolean; room?: RoomState; player?: Player; error?: string }) => {
        if (res.success && res.player) {
          try {
            localStorage.setItem('playflix_session', JSON.stringify({ code, player: res.player }));
          } catch {}
        }
        resolve(res);
      });
    });
  }

  public toggleReady(code: string) {
    this.socket?.emit('toggle_ready', { code });
  }

  public addBot(code: string, difficulty = 'medium') {
    this.socket?.emit('add_bot', { code, difficulty });
  }

  public removeBot(code: string, botId?: string) {
    this.socket?.emit('remove_bot', { code, botId });
  }

  public setPlayerColor(code: string, color: string) {
    this.socket?.emit('set_player_color', { code, color });
  }

  public updateSettings(code: string, settings: unknown) {
    this.socket?.emit('update_settings', { code, settings });
  }

  public selectGame(code: string, gameId: string) {
    this.socket?.emit('select_game', { code, gameId });
  }

  public startGame(code: string) {
    this.socket?.emit('start_game', { code });
  }

  public sendGameAction(code: string, action: string, payload?: unknown) {
    this.socket?.emit('game_action', { code, action, payload });
  }

  public sendReaction(code: string, emoji: string) {
    this.socket?.emit('send_reaction', { code, emoji });
  }

  public replayGame(code: string) {
    this.socket?.emit('replay_game', { code });
  }

  public returnToLobby(code: string) {
    this.socket?.emit('return_to_lobby', { code });
  }
}

export const socketService = new SocketService();
