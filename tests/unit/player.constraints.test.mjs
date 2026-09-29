import { describe, it, expect } from 'vitest';
import { RoomManager, GAME_PLAYER_CONSTRAINTS } from '../../server/rooms.js';

describe('Player constraints rules enforcement per game', () => {
  it('GAME_PLAYER_CONSTRAINTS contains correct constraints for key games', () => {
    expect(GAME_PLAYER_CONSTRAINTS.ludo).toEqual({ min: 2, max: 4 });
    expect(GAME_PLAYER_CONSTRAINTS.connect_four).toEqual({ min: 2, max: 2 });
    expect(GAME_PLAYER_CONSTRAINTS.naval_battle).toEqual({ min: 2, max: 2 });
    expect(GAME_PLAYER_CONSTRAINTS.scrabble).toEqual({ min: 2, max: 4 });
  });

  it('createRoom clamps maxPlayers to game limits', () => {
    const mockIo = { to: () => ({ emit: () => {} }), emit: () => {} };
    const rm = new RoomManager(mockIo);

    // Ludo created without settings defaults to 4 max
    const ludoRoom = rm.createRoom('host1', 'ludo');
    expect(ludoRoom.settings.maxPlayers).toBe(4);

    // Ludo created with illegal 8 players is clamped to 4
    const ludoRoomCapped = rm.createRoom('host2', 'ludo', { maxPlayers: 8 });
    expect(ludoRoomCapped.settings.maxPlayers).toBe(4);

    // Connect Four defaults to 2 max
    const c4Room = rm.createRoom('host3', 'connect_four');
    expect(c4Room.settings.maxPlayers).toBe(2);
  });

  it('addBot cannot exceed game max players', () => {
    const mockIo = { to: () => ({ emit: () => {} }), emit: () => {} };
    const rm = new RoomManager(mockIo);
    const room = rm.createRoom('host1', 'connect_four');

    rm.addBot(room.code);
    rm.addBot(room.code);
    expect(room.players.length).toBe(2);

    // Attempting 3rd bot must be blocked
    rm.addBot(room.code);
    expect(room.players.length).toBe(2);
  });

  it('joinRoom refuses entry when game maximum is reached', () => {
    const mockIo = { to: () => ({ emit: () => {} }), emit: () => {} };
    const rm = new RoomManager(mockIo);
    const room = rm.createRoom('host1', 'ludo'); // max 4

    const p1 = rm.joinRoom(room.code, 's1', { name: 'P1' });
    const p2 = rm.joinRoom(room.code, 's2', { name: 'P2' });
    const p3 = rm.joinRoom(room.code, 's3', { name: 'P3' });
    const p4 = rm.joinRoom(room.code, 's4', { name: 'P4' });

    expect(p1.success).toBe(true);
    expect(p4.success).toBe(true);
    expect(room.players.length).toBe(4);

    // 5th player in Ludo must be rejected
    const p5 = rm.joinRoom(room.code, 's5', { name: 'P5' });
    expect(p5.success).toBe(false);
    expect(p5.error).toMatch(/complet/i);
    expect(room.players.length).toBe(4);
  });

  it('startGame auto-fills bots up to minPlayers when starting with fewer players', () => {
    const mockIo = { to: () => ({ emit: () => {} }), emit: () => {} };
    const rm = new RoomManager(mockIo);
    const room = rm.createRoom('host1', 'ludo'); // min 2

    rm.joinRoom(room.code, 's1', { name: 'Solo Player' });
    expect(room.players.length).toBe(1);

    // Starting Ludo with 1 player auto-adds 1 bot so that game can run with 2 players
    rm.startGame(room.code);
    expect(room.players.length).toBe(2);
    expect(room.players.some(p => p.isBot)).toBe(true);
  });
});
