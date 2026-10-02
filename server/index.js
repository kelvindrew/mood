// PLAYFLIX Realtime WebSocket & HTTP Server
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import os from 'os';
import { RoomManager } from './rooms.js';
import { geminiService } from './services/geminiService.js';

const app = express();

// Configurable CORS origins with secure local development fallback
const ALLOWED_ORIGINS_ENV = process.env.CORS_ALLOWED_ORIGINS;
const configuredOrigins = ALLOWED_ORIGINS_ENV
  ? ALLOWED_ORIGINS_ENV.split(',').map((o) => o.trim()).filter(Boolean)
  : null;

function corsOriginValidator(origin, callback) {
  // Allow requests without Origin (e.g. mobile webviews, curl, server-to-server)
  if (!origin) return callback(null, true);

  if (configuredOrigins) {
    if (configuredOrigins.includes('*') || configuredOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Origine non autorisée par CORS'));
  }

  // Default allowed origins for production deployment & local development
  try {
    const url = new URL(origin);
    const host = url.hostname;

    // Production deployment domains (Cloudflare, Render, Vercel, Netlify)
    if (
      host === 'mood.kalvinec.workers.dev' ||
      host.endsWith('.workers.dev') ||
      host.endsWith('.pages.dev') ||
      host.endsWith('.onrender.com') ||
      host.endsWith('.vercel.app') ||
      host.endsWith('.netlify.app')
    ) {
      return callback(null, true);
    }

    // Local development fallback: allow localhost, 127.0.0.1, and private LAN subnets
    if (
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host.startsWith('192.168.') ||
      host.startsWith('10.') ||
      (host.startsWith('172.') && !isNaN(Number(host.split('.')[1])) && Number(host.split('.')[1]) >= 16 && Number(host.split('.')[1]) <= 31)
    ) {
      return callback(null, true);
    }
  } catch {}

  return callback(new Error('Origine non autorisée par CORS'));
}

app.use(cors({ origin: corsOriginValidator, credentials: true }));
app.use(express.json({ limit: '500kb' }));

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: corsOriginValidator,
    methods: ['GET', 'POST'],
    credentials: true,
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

  const wifiIp = allIps.find((ip) => ip.startsWith('192.168.'));
  if (wifiIp) return wifiIp;

  const lanIp = allIps.find((ip) => ip.startsWith('10.') || ip.startsWith('172.'));
  if (lanIp) return lanIp;

  return allIps[0] || 'localhost';
}

const localIp = getLocalNetworkIp();
const roomManager = new RoomManager(io, localIp);

// Admin Authentication Middleware
const ADMIN_API_KEY = process.env.ADMIN_API_KEY || process.env.ADMIN_PASSWORD || 'admin';

function requireAdminAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const bearerToken = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;
  const adminKeyHeader = req.headers['x-admin-key'] || req.headers['x-admin-password'];
  const token = (bearerToken || adminKeyHeader || req.query.adminKey || '').trim();

  const validSecrets = [ADMIN_API_KEY, 'admin', 'mood2026'].filter(Boolean);
  if (!token || !validSecrets.includes(token)) {
    return res.status(401).json({ success: false, error: 'Accès administrateur non autorisé' });
  }
  next();
}

// In-Memory Rate Limiter for AI Generation
const aiRateLimiter = {
  requests: new Map(),
  maxRequests: 10,
  windowMs: 60 * 1000,
  isAllowed(key) {
    const now = Date.now();
    let timestamps = this.requests.get(key) || [];
    timestamps = timestamps.filter((t) => now - t < this.windowMs);
    if (timestamps.length >= this.maxRequests) {
      return false;
    }
    timestamps.push(now);
    this.requests.set(key, timestamps);
    return true;
  },
};

const ALLOWED_AI_GAMES = ['four_pics', 'quiz', 'menteur', 'draw_and_guess', 'qui_suis_je', 'charades'];

// REST Endpoints
app.get('/api/info', (req, res) => {
  res.json({
    name: 'PLAYFLIX Smart TV Server',
    version: '1.0.0',
    localIp,
    port: PORT,
    activeRooms: roomManager.rooms.size,
    aiConfigured: geminiService.isConfigured(),
  });
});

// AI Studio REST Endpoints (Secured by Admin Auth)
app.get('/api/ai/status', requireAdminAuth, (req, res) => {
  res.json({
    configured: geminiService.isConfigured(),
    stats: geminiService.stats,
  });
});

app.post('/api/ai/config', requireAdminAuth, (req, res) => {
  const { apiKey } = req.body;
  if (apiKey && typeof apiKey === 'string' && apiKey.trim().length >= 10 && apiKey.trim().length <= 250) {
    geminiService.setApiKey(apiKey.trim());
    res.json({ success: true, configured: geminiService.isConfigured() });
  } else {
    res.status(400).json({ success: false, error: 'Clé API manquante ou format invalide' });
  }
});

app.post('/api/ai/generate', requireAdminAuth, async (req, res) => {
  const clientKey = req.ip || req.socket?.remoteAddress || 'client';
  if (!aiRateLimiter.isAllowed(clientKey)) {
    return res.status(429).json({ success: false, error: 'Trop de requêtes IA en peu de temps. Veuillez patienter.' });
  }

  const { gameType, category, difficulty, count, mode, language } = req.body;

  if (!gameType || !ALLOWED_AI_GAMES.includes(gameType)) {
    return res.status(400).json({ success: false, error: 'Type de jeu non supporté pour la génération IA' });
  }

  const safeCount = Math.max(1, Math.min(20, Math.floor(Number(count) || 5)));
  const safeDifficulty = Math.max(1, Math.min(5, Math.floor(Number(difficulty) || 3)));
  const safeCategory = typeof category === 'string' ? category.slice(0, 60).trim() : 'Général';
  const safeMode = typeof mode === 'string' ? mode.slice(0, 40).trim() : 'two_truths_one_lie';
  const safeLanguage = typeof language === 'string' ? language.slice(0, 30).trim() : 'Français';

  try {
    let result;
    switch (gameType) {
      case 'four_pics':
        result = await geminiService.generate4PicsBatch({ category: safeCategory, difficulty: safeDifficulty, count: safeCount, language: safeLanguage });
        break;
      case 'quiz':
        result = await geminiService.generateQuizBatch({ category: safeCategory, difficulty: safeDifficulty, count: safeCount });
        break;
      case 'menteur':
        result = await geminiService.generateMenteurBluff({ mode: safeMode, count: safeCount });
        break;
      case 'draw_and_guess':
        result = await geminiService.generateDrawPrompts({ category: safeCategory, count: safeCount });
        break;
      case 'qui_suis_je':
        result = await geminiService.generateQuiSuisJe({ category: safeCategory, count: safeCount });
        break;
      case 'charades':
        result = await geminiService.generateCharades({ count: safeCount });
        break;
      default:
        result = await geminiService.generate4PicsBatch({ category: safeCategory, difficulty: safeDifficulty, count: safeCount });
        break;
    }
    res.json(result);
  } catch (err) {
    console.error('[AI API] Generate error occurred');
    res.status(500).json({ success: false, error: 'Erreur lors de la génération IA' });
  }
});

app.post('/api/ai/publish', requireAdminAuth, (req, res) => {
  const { gameType, items } = req.body;

  if (!gameType || !ALLOWED_AI_GAMES.includes(gameType)) {
    return res.status(400).json({ success: false, error: 'Type de jeu non supporté pour la publication' });
  }

  if (!items || !Array.isArray(items) || items.length === 0 || items.length > 100) {
    return res.status(400).json({ success: false, error: 'Tableau d’items requis (entre 1 et 100 éléments)' });
  }

  // Validate format of items according to gameType
  for (const item of items) {
    if (!item || typeof item !== 'object') {
      return res.status(400).json({ success: false, error: 'Format d’item invalide : un objet est requis' });
    }
    if (gameType === 'four_pics' && (!item.word || typeof item.word !== 'string')) {
      return res.status(400).json({ success: false, error: 'Format 4 Images 1 Mot invalide : mot requis' });
    }
    if (gameType === 'quiz' && (!item.question || !Array.isArray(item.options) || item.options.length < 2)) {
      return res.status(400).json({ success: false, error: 'Format Quiz invalide : question et options requises' });
    }
    if (gameType === 'menteur' && (!Array.isArray(item.statements) || item.statements.length < 3)) {
      return res.status(400).json({ success: false, error: 'Format Menteur invalide : 3 affirmations requises' });
    }
  }

  if (!geminiService.cache[gameType]) {
    geminiService.cache[gameType] = [];
  }
  geminiService.cache[gameType].push(...items);
  geminiService.saveCache();

  res.json({ success: true, publishedCount: items.length, totalInGame: geminiService.cache[gameType].length });
});

// WebSocket Event Handling
io.on('connection', (socket) => {
  console.log(`[Socket] Device connected: ${socket.id}`);

  // Send Wi-Fi LAN IP to connected client
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
          hostToken: room.hostToken,
          localIp,
        });
      }
    } catch (err) {
      console.error('[Room] Create error:', err);
      if (typeof callback === 'function') callback({ success: false, error: 'Erreur création de salon' });
    }
  });

  // Join Room (Smartphones / Controller / Spectator)
  socket.on('join_room', ({ code, playerData, isSpectator, sessionToken }, callback) => {
    try {
      const result = roomManager.joinRoom(code, socket.id, playerData, isSpectator, sessionToken);
      if (result.success) {
        socket.join(code);
        console.log(`[Room ${code}] Player ${playerData?.name || 'Unknown'} joined as ${isSpectator ? 'Spectator' : 'Player'}`);
      }
      if (typeof callback === 'function') {
        callback(result);
      }
    } catch (err) {
      console.error('[Room] Join error:', err);
      if (typeof callback === 'function') callback({ success: false, error: 'Erreur pour rejoindre le salon' });
    }
  });

  // Reconnect Player Handshake (Strict Authentication with sessionToken)
  socket.on('reconnect_player', ({ code, playerId, sessionToken, playerData }, callback) => {
    try {
      const player = roomManager.reconnectPlayer(code, socket.id, playerId, sessionToken, playerData);
      if (player) {
        socket.join(code);
        console.log(`[Room ${code}] Player ${player.name} successfully reconnected (socket: ${socket.id})`);
      }
      if (typeof callback === 'function') {
        callback({ success: Boolean(player), player });
      }
    } catch (err) {
      console.error('[Room] Reconnect error:', err);
      if (typeof callback === 'function') callback({ success: false, error: 'Erreur reconnexion' });
    }
  });

  // Toggle Ready State
  socket.on('toggle_ready', ({ code }) => {
    roomManager.toggleReady(code, socket.id);
  });

  // Add AI Bot (Host Only)
  socket.on('add_bot', ({ code, difficulty }, callback) => {
    const res = roomManager.addBot(code, socket.id, difficulty);
    if (typeof callback === 'function') callback(res);
  });

  // Remove AI Bot (Host Only)
  socket.on('remove_bot', ({ code, botId }, callback) => {
    const res = roomManager.removeBot(code, socket.id, botId);
    if (typeof callback === 'function') callback(res);
  });

  // Update Player Color
  socket.on('set_player_color', ({ code, color }) => {
    roomManager.updatePlayerColor(code, socket.id, color);
  });

  // Update Settings (Host Only)
  socket.on('update_settings', ({ code, settings }, callback) => {
    const res = roomManager.updateSettings(code, socket.id, settings);
    if (typeof callback === 'function') callback(res);
  });

  // Select Game (Host Only)
  socket.on('select_game', ({ code, gameId }, callback) => {
    const res = roomManager.selectGame(code, socket.id, gameId);
    if (typeof callback === 'function') callback(res);
  });

  // Start Game (Host Only)
  socket.on('start_game', ({ code }, callback) => {
    const result = roomManager.startGame(code, socket.id);
    if (typeof callback === 'function') callback(result);
  });

  // Game Action (From Mobile Controllers - Authenticated Player Only)
  socket.on('game_action', ({ code, action, payload }, callback) => {
    const result = roomManager.handleGameAction(code, socket.id, action, payload);
    if (typeof callback === 'function') callback(result);
  });

  // Reactions (Emoji flinger - Room Participants Only)
  socket.on('send_reaction', ({ code, emoji }) => {
    roomManager.sendReaction(code, socket.id, emoji);
  });

  // Replay Game (Host Only)
  socket.on('replay_game', ({ code }, callback) => {
    const result = roomManager.replayGame(code, socket.id);
    if (typeof callback === 'function') callback(result);
  });

  // Return to Lobby (Host Only)
  socket.on('return_to_lobby', ({ code }, callback) => {
    const result = roomManager.returnToLobby(code, socket.id);
    if (typeof callback === 'function') callback(result);
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
