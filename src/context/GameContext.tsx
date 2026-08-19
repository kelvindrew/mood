import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { GameId, GameCatalogItem, RoomState, Player, PlayerColor } from '../types/game';
import { GAMES_CATALOG } from '../data/gamesCatalog';
import { socketService } from '../services/socket';
import { audio } from '../services/audio';

export type AppMode = 'tv' | 'mobile';
export type TVView = 'home' | 'game_detail' | 'detail' | 'categories' | 'lobby' | 'gameplay' | 'playing' | 'results' | 'profile' | 'profiles' | 'settings';
export type MobileView = 'join' | 'lobby' | 'controller' | 'spectator';

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
  createRoom: (gameId: GameId, settings?: unknown) => Promise<{ success: boolean; code?: string; error?: string }>;
  joinRoom: (code: string, name: string, avatar: string, isSpectator?: boolean) => Promise<{ success: boolean; error?: string }>;
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

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const isMobile = params.has('room') || window.innerWidth <= 768;
      setAppMode(isMobile ? 'mobile' : 'tv');

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

    socket.on('connect', () => {
      console.log('[GameContext] Connected to socket server');
    });

    socket.on('server_info', (data: { lanIp: string }) => {
      if (data?.lanIp && data.lanIp !== 'localhost') {
        console.log('[GameContext] Detected Server Wi-Fi IP:', data.lanIp);
        setServerLanIp(data.lanIp);
      }
    });

    socket.on('room_state_update', (updatedRoom: RoomState) => {
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

    socket.on('game_state_update', (gameState: unknown) => {
      setRoom((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          gameState: gameState as RoomState['gameState'],
        };
      });
    });

    socket.on('reaction_received', () => {
      audio.playFocus();
    });

    return () => {
      socket.off('room_state_update');
      socket.off('game_state_update');
      socket.off('reaction_received');
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

  const joinRoom = async (code: string, name: string, avatar: string, isSpectator = false) => {
    const res = await socketService.joinRoom(code, { name, avatar }, isSpectator);
    if (res.success && res.room && res.player) {
      setRoom(res.room);
      setLocalPlayer(res.player);
      setMobileView(isSpectator ? 'spectator' : 'lobby');
      audio.playPlayerJoin();
      return { success: true };
    }
    return { success: false, error: res.error || 'Impossible de rejoindre le salon' };
  };

  const toggleReady = () => {
    if (room) socketService.toggleReady(room.code);
  };

  const addBot = (difficulty = 'medium') => {
    if (room) socketService.addBot(room.code, difficulty);
  };

  const removeBot = (botId?: string) => {
    if (room) socketService.removeBot(room.code, botId);
  };

  const setPlayerColor = (color: PlayerColor) => {
    if (room) socketService.setPlayerColor(room.code, color);
  };

  const startGame = () => {
    if (room) socketService.startGame(room.code);
  };

  const sendGameAction = (action: string, payload: Record<string, unknown> = {}) => {
    if (room) {
      const actionPayload = {
        ...payload,
        playerId: localPlayer?.id,
      };
      socketService.sendGameAction(room.code, action, actionPayload);
    }
  };

  const sendReaction = (emoji: string) => {
    if (room) socketService.sendReaction(room.code, emoji);
  };

  const replayGame = () => {
    if (room) socketService.replayGame(room.code);
  };

  const returnToLobby = () => {
    if (room) {
      socketService.returnToLobby(room.code);
      setTvView('lobby');
      setMobileView('lobby');
    }
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
