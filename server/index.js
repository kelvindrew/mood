// PLAYFLIX Realtime WebSocket & HTTP Server
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import os from 'os';
import { RoomManager } from './rooms.js';

const app = express();
app.use(cors());
app.use(express.json());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

const PORT = process.env.PORT || 3001;

// Function to find the machine's local Wi-Fi / Ethernet IPv4 address (e.g. 192.168.x.x)
function getLocalNetworkIp() {
  const interfaces = os.networkInterfaces();
  const allIps = [];
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] || []) {
      if (iface.family === 'IPv4' && !iface.internal) {
        allIps.push(iface.address);
      }
    }
  }

  // 1. Prioritize typical home Wi-Fi subnet (192.168.x.x)
  const wifiIp = allIps.find(ip => ip.startsWith('192.168.'));
  if (wifiIp) return wifiIp;

  // 2. Then other private LAN subnets (10.x.x.x or 172.x.x.x)
  const lanIp = allIps.find(ip => ip.startsWith('10.') || ip.startsWith('172.'));
  if (lanIp) return lanIp;

  return allIps[0] || 'localhost';
}

const localIp = getLocalNetworkIp();
const roomManager = new RoomManager(io, localIp);

// REST Endpoints
app.get('/api/info', (req, res) => {
  res.json({
    name: 'PLAYFLIX Smart TV Server',
    version: '1.0.0',
    localIp,
    port: PORT,
    activeRooms: roomManager.rooms.size,
  });
});

// WebSocket Event Handling
io.on('connection', (socket) => {
  console.log(`[Socket] Device connected: ${socket.id}`);

  // Immediately send Wi-Fi LAN IP to connected client
  socket.emit('server_info', { lanIp: localIp });

  // Create Room (Host on TV)
  socket.on('create_room', ({ gameId, settings }, callback) => {
    try {
      const room = roomManager.createRoom(socket.id, gameId, settings);
      socket.join(room.code);
      console.log(`[Room] Created room ${room.code} for game: ${gameId} (LAN IP: ${localIp})`);
      if (typeof callback === 'function') {
        callback({
          success: true,
          room: roomManager.getPublicRoomState(room),
          localIp,
        });
      }
    } catch (err) {
      console.error('[Room] Create error:', err);
      if (typeof callback === 'function') callback({ success: false, error: err.message });
    }
  });

  // Join Room (Smartphones / Controller / Spectator)
  socket.on('join_room', ({ code, playerData, isSpectator }, callback) => {
    try {
      const result = roomManager.joinRoom(code, socket.id, playerData, isSpectator);
      if (result.success) {
        socket.join(code);
        console.log(`[Room ${code}] Player ${playerData?.name || 'Unknown'} joined as ${isSpectator ? 'Spectator' : 'Player'}`);
      }
      if (typeof callback === 'function') {
        callback(result);
      }
    } catch (err) {
      console.error('[Room] Join error:', err);
      if (typeof callback === 'function') callback({ success: false, error: err.message });
    }
  });

  // Reconnect Player Handshake
  socket.on('reconnect_player', ({ code, playerId, playerData }) => {
    try {
      const player = roomManager.reconnectPlayer(code, socket.id, playerId, playerData);
      if (player) {
        socket.join(code);
        console.log(`[Room ${code}] Player ${player.name} successfully reconnected (socket: ${socket.id})`);
      }
    } catch (err) {
      console.error('[Room] Reconnect error:', err);
    }
  });

  // Toggle Ready State
  socket.on('toggle_ready', ({ code }) => {
    roomManager.toggleReady(code, socket.id);
  });

  // Add AI Bot
  socket.on('add_bot', ({ code, difficulty }) => {
    roomManager.addBot(code, difficulty);
  });

  // Remove AI Bot
  socket.on('remove_bot', ({ code, botId }) => {
    roomManager.removeBot(code, botId);
  });

  // Update Player Color
  socket.on('set_player_color', ({ code, color }) => {
    roomManager.updatePlayerColor(code, socket.id, color);
  });

  // Update Settings
  socket.on('update_settings', ({ code, settings }) => {
    roomManager.updateSettings(code, settings);
  });

  // Select Game
  socket.on('select_game', ({ code, gameId }) => {
    roomManager.selectGame(code, gameId);
  });

  // Start Game
  socket.on('start_game', ({ code }, callback) => {
    const result = roomManager.startGame(code);
    if (typeof callback === 'function') callback(result);
  });

  // Game Action (From Mobile Controllers)
  socket.on('game_action', ({ code, action, payload }) => {
    roomManager.handleGameAction(code, socket.id, action, payload);
  });

  // Reactions (Emoji flinger)
  socket.on('send_reaction', ({ code, emoji }) => {
    roomManager.sendReaction(code, socket.id, emoji);
  });

  // Replay Game
  socket.on('replay_game', ({ code }) => {
    roomManager.replayGame(code);
  });

  // Return to Lobby
  socket.on('return_to_lobby', ({ code }) => {
    roomManager.returnToLobby(code);
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log(`[Socket] Device disconnected: ${socket.id}`);
    roomManager.handleDisconnect(socket.id);
  });
});

httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`=======================================================`);
  console.log(`🎮 PLAYFLIX Realtime Smart TV Server Running!`);
  console.log(`📺 TV URL:      http://${localIp}:5173`);
  console.log(`📱 Mobile URL:  http://${localIp}:5173/?room=XXXX`);
  console.log(`🔌 Backend API: http://${localIp}:${PORT}`);
  console.log(`=======================================================`);
});
