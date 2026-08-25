import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { GameId, GameCatalogItem, RoomState, Player, PlayerColor } from '../types/game';
import { GAMES_CATALOG } from '../data/gamesCatalog';
import { socketService } from '../services/socket';
import { audio } from '../services/audio';

export type AppMode = 'tv' | 'mobile';
export type TVView = 'home' | 'game_detail' | 'detail' | 'categories' | 'lobby' | 'gameplay' | 'playing' | 'results' | 'profile' | 'profiles' | 'settings' | 'admin';
export type MobileView = 'join' | 'lobby' | 'controller' | 'spectator';

// E9 — état de connexion Socket.IO exposé à l'interface
export type ConnectionState = 'connecting' | 'connected' | 'disconnected' | 'reconnecting';

interface GameContextType {
  appMode: AppMode;
  setAppMode: (mode: AppMode) => void;
  tvView: TVView;
  setTvView: (view: TVView) => void;
  mobileView: MobileView;
  setMobileView: (view: MobileView) => void;
  selectedGame: GameCatalogItem;
  setSelectedGame: (game: GameCatalogItem) => void;
  room: RoomState | null;
  localPlayer: Player | null;
  serverLanIp: string;
  connectionState: ConnectionState; // E9
  createRoom: (gameId: GameId, settings?: unknown) => Promise<{ success: boolean; code?: string; error?: string }>;
  joinRoom: (code: string, name: string, avatar: string, isSpectator?: boolean, selfieImage?: string) => Promise<{ success: boolean; error?: string }>;
  toggleReady: () => void;
  addBot: (difficulty?: string) => void;
  removeBot: (botId?: string) => void;
  setPlayerColor: (color: PlayerColor) => void;
  startGame: () => void;
  sendGameAction: (action: string, payload?: Record<string, unknown>) => void;
  sendReaction: (emoji: string) => void;
  replayGame: () => void;
  returnToLobby: () => void;
  returnToHome: () => void;
  isSimulatorOpen: boolean;
  setIsSimulatorOpen: (open: boolean) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [appMode, setAppMode] = useState<AppMode>('tv');
  const [tvView, setTvView] = useState<TVView>('home');
  const [mobileView, setMobileView] = useState<MobileView>('join');
  const [selectedGame, setSelectedGame] = useState<GameCatalogItem>(GAMES_CATALOG[0]);
  const [room, setRoom] = useState<RoomState | null>(null);
  const [localPlayer, setLocalPlayer] = useState<Player | null>(null);
  const [serverLanIp, setServerLanIp] = useState<string>('localhost');
  const [isSimulatorOpen, setIsSimulatorOpen] = useState<boolean>(false);
  // E9 — la reconnexion automatique reste gérée par socketService
  const [connectionState, setConnectionState] = useState<ConnectionState>('connecting');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const modeParam = params.get('mode');
      if (modeParam === 'tv') {
        setAppMode('tv');
      } else if (modeParam === 'mobile') {
        setAppMode('mobile');
      } else {
        const isMobile = params.has('room') || window.innerWidth <= 768;
        setAppMode(isMobile ? 'mobile' : 'tv');
      }

      if (params.get('admin') === 'true' || params.get('view') === 'admin') {
        setTvView('admin');
      }

      try {
        const saved = localStorage.getItem('playflix_session');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed?.player) {
            setLocalPlayer(parsed.player);
          }
        }
      } catch {}
    }
  }, []);

  useEffect(() => {
    const socket = socketService.connect();

    // C1 — Cache du dernier fragment privé reçu (main, rôle, mot secret...).
    // Keyé par gameId:code pour ne jamais fusionner un fragment périmé
    // d'un ancien jeu dans l'état d'un nouveau.
    let latestPrivateFragment: Record<string, unknown> | null = null;
    let latestPrivateKey = '';
    const stateKey = (r: { gameId: string; code: string } | null | undefined) =>
      r ? `${r.gameId}:${r.code}` : '';

    socket.on('connect', () => {
      console.log('[GameContext] Connected to socket server');
      setConnectionState('connected'); // E9
    });

    // E9 — machine à états de connexion (la reconnexion auto reste active)
    const handleDisconnect = (reason: string) => {
      if (reason === 'io client disconnect') {
        // Déconnexion volontaire du client : pas de reconnexion en cours
        setConnectionState('disconnected');
        return;
      }
      setConnectionState('reconnecting');
      // 'io server disconnect' : socket.io ne retente PAS seul -> on relance
      if (reason === 'io server disconnect' && typeof socket.connect === 'function') {
        socket.connect();
      }
    };
    const handleConnectError = () => {
      // Avant la première connexion réussie on reste en « connecting » ;
      // ensuite toute erreur signifie qu'on retente = « reconnecting ».
      setConnectionState((prev) => (prev === 'connecting' ? 'connecting' : prev === 'connected' ? 'reconnecting' : prev));
    };
    const handleReconnectAttempt = () => {
      setConnectionState((prev) => (prev === 'connected' ? prev : 'reconnecting'));
    };

    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleConnectError);
    if (socket.io && typeof socket.io.on === 'function') {
      socket.io.on('reconnect_attempt', handleReconnectAttempt);
    }

    socket.on('server_info', (data: { lanIp: string }) => {
      if (data?.lanIp && data.lanIp !== 'localhost') {
        console.log('[GameContext] Detected Server Wi-Fi IP:', data.lanIp);
        setServerLanIp(data.lanIp);
      }
    });

    socket.on('room_state_update', (updatedRoom: RoomState) => {
      // C1 — Invalide le fragment privé si on change de jeu/salon ou que la
      // partie n'est plus en cours (retour lobby, résultats, etc.)
      if (updatedRoom.status !== 'playing' || stateKey(updatedRoom) !== latestPrivateKey) {
        latestPrivateFragment = null;
        latestPrivateKey = '';
      }

      setRoom(updatedRoom);

      if (updatedRoom.serverLanIp && updatedRoom.serverLanIp !== 'localhost') {
        setServerLanIp(updatedRoom.serverLanIp);
      }

      if (updatedRoom.gameId) {
        const found = GAMES_CATALOG.find((g) => g.id === updatedRoom.gameId);
        if (found) setSelectedGame(found);
      }

      if (updatedRoom.status === 'playing') {
        setTvView('gameplay');
        setMobileView('controller');
      } else if (updatedRoom.status === 'game_over') {
        setTvView('results');
        setMobileView('controller');
      } else if (updatedRoom.status === 'lobby') {
        setTvView('lobby');
        setMobileView('lobby');
      }

      setLocalPlayer((prev) => {
        if (!prev) return null;
        const matching = updatedRoom.players.find((p) => p.id === prev.id) || updatedRoom.spectators.find((s) => s.id === prev.id);
        return matching || prev;
      });
    });

    // C1 — L'état public diffusé est enrichi à la réception avec notre
    // propre fragment privé déjà connu, pour éviter tout flash de contenu
    // manquant entre les deux flux.
    socket.on('game_state_update', (gameState: unknown) => {
      setRoom((prev) => {
        if (!prev) return null;
        const incoming = gameState as RoomState['gameState'];
        if (latestPrivateFragment && stateKey(prev) === latestPrivateKey && incoming) {
          return {
            ...prev,
            gameState: { ...incoming, ...latestPrivateFragment } as RoomState['gameState'],
          };
        }
        return {
          ...prev,
          gameState: incoming,
        };
      });
    });

    // C1 — Fragment PRIVÉ unicast : contient uniquement NOS données
    // (playerHands:{[monId]:...}, playerRacks:{[monId]:...}, myRole,
    // secretWord si dessinateur...). Fusion superficielle dans gameState.
    socket.on('private_state', (fragment: Record<string, unknown>) => {
      setRoom((prev) => {
        if (!prev || !fragment) return prev ?? null;
        latestPrivateFragment = fragment;
        latestPrivateKey = stateKey(prev);
        return {
          ...prev,
          gameState: {
            ...((prev.gameState ?? {}) as unknown as Record<string, unknown>),
            ...fragment,
          } as unknown as RoomState['gameState'],
        };
      });
    });

    socket.on('reaction_received', () => {
      audio.playFocus();
    });

    return () => {
      socket.off('room_state_update');
      socket.off('game_state_update');
      socket.off('private_state');
      socket.off('reaction_received');
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleConnectError);
      if (socket.io && typeof socket.io.off === 'function') {
        socket.io.off('reconnect_attempt', handleReconnectAttempt);
      }
    };
  }, []);

  const createRoom = async (gameId: GameId, settings: unknown = {}) => {
    const res = await socketService.createRoom(gameId, settings);
    if (res.success && res.room) {
      if (res.localIp && res.localIp !== 'localhost') {
        setServerLanIp(res.localIp);
      }
      setRoom(res.room);
      setTvView('lobby');
      return { success: true, code: res.room.code };
    }
    return { success: false, error: res.error || 'Erreur lors de la création du salon' };
  };

  const joinRoom = async (code: string, name: string, avatar: string, isSpectator = false, selfieImage?: string) => {
    // C4 — selfieImage est déjà compressée côté mobile (≤ ~150 Ko) avant émission
    const res = await socketService.joinRoom(code, { name, avatar, selfieImage }, isSpectator);
    if (res.success && res.room && res.player) {
      setRoom(res.room);
      setLocalPlayer(res.player);
      setMobileView(isSpectator ? 'spectator' : 'lobby');
      audio.playPlayerJoin();
      return { success: true };
    }
    return { success: false, error: res.error || 'Impossible de rejoindre le salon' };
  };

  // E9 — les actions de jeu sont ignorées tant qu'on n'est pas connecté ;
  // createRoom/joinRoom restent accessibles (elles affichent leurs propres erreurs).
  const canSend = connectionState === 'connected';

  const toggleReady = () => {
    if (!canSend || !room) return;
    socketService.toggleReady(room.code);
  };

  const addBot = (difficulty = 'medium') => {
    if (!canSend || !room) return;
    socketService.addBot(room.code, difficulty);
  };

  const removeBot = (botId?: string) => {
    if (!canSend || !room) return;
    socketService.removeBot(room.code, botId);
  };

  const setPlayerColor = (color: PlayerColor) => {
    if (!canSend || !room) return;
    socketService.setPlayerColor(room.code, color);
  };

  const startGame = () => {
    if (!canSend || !room) return;
    socketService.startGame(room.code);
  };

  const sendGameAction = (action: string, payload: Record<string, unknown> = {}) => {
    if (!canSend || !room) return;
    const actionPayload = {
      ...payload,
      playerId: localPlayer?.id,
    };
    socketService.sendGameAction(room.code, action, actionPayload);
  };

  const sendReaction = (emoji: string) => {
    if (!canSend || !room) return;
    socketService.sendReaction(room.code, emoji);
  };

  const replayGame = () => {
    if (!canSend || !room) return;
    socketService.replayGame(room.code);
  };

  const returnToLobby = () => {
    // Navigation locale toujours permise ; l'émission est protégée
    if (canSend && room) socketService.returnToLobby(room.code);
    setTvView('lobby');
    setMobileView('lobby');
  };

  const returnToHome = () => {
    setRoom(null);
    setTvView('home');
  };

  return (
    <GameContext.Provider
      value={{
        appMode,
        setAppMode,
        tvView,
        setTvView,
        mobileView,
        setMobileView,
        selectedGame,
        setSelectedGame,
        room,
        localPlayer,
        serverLanIp,
        connectionState,
        createRoom,
        joinRoom,
        toggleReady,
        addBot,
        removeBot,
        setPlayerColor,
        startGame,
        sendGameAction,
        sendReaction,
        replayGame,
        returnToLobby,
        returnToHome,
        isSimulatorOpen,
        setIsSimulatorOpen,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
