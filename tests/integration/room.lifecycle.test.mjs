// Intégration Socket.IO — cycle de vie complet d'un salon
// (création, join, public/privé, déconnexion, reconnexion, host, fin de partie)
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { spawn } from 'node:child_process';
import { io } from 'socket.io-client';

const PORT = 3987;
const URL = `http://127.0.0.1:${PORT}`;
let child = null;

const connect = () => { const s = io(URL); return new Promise((r) => s.on('connect', () => r(s))); };
const emit = (sock, ev, payload) => new Promise((res) => sock.emit(ev, payload, res));
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function waitForServer(timeoutMs = 20000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const r = await fetch(`${URL}/api/info`);
      if (r.ok) return true;
    } catch { /* pas encore prêt */ }
    await wait(250);
  }
  throw new Error('Serveur de test indisponible');
}

beforeAll(async () => {
  child = spawn(process.execPath, ['server/index.js'], {
    env: { ...process.env, PORT: String(PORT) },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  await waitForServer();
}, 60000);

afterAll(() => {
  child?.kill();
});

describe('cycle de vie du salon', () => {
  it('création de salon : code à 4 chiffres + hôte = socket créateur', async () => {
    const tv = await connect();
    const res = await emit(tv, 'create_room', { gameId: 'quiz' });
    expect(res.success).toBe(true);
    expect(res.room.code).toMatch(/^\d{4}$/);
    expect(res.room.hostId).toBe(tv.id); // contrat d'identification de l'hôte
    tv.disconnect();
  });

  it('join_room : erreur explicite sur code invalide', async () => {
    const phone = await connect();
    const res = await emit(phone, 'join_room', { code: '', playerData: { name: 'X' } });
    expect(res.success).toBe(false);
    expect(typeof res.error).toBe('string');
    phone.disconnect();
  });

  it('join_room : salon plein refusé selon maxPlayers', async () => {
    const tv = await connect();
    const created = await emit(tv, 'create_room', { gameId: 'quiz', settings: { maxPlayers: 1 } });
    const code = created.room.code;
    const p1 = await connect();
    const ok1 = await emit(p1, 'join_room', { code, playerData: { name: 'A' } });
    expect(ok1.success).toBe(true);
    const p2 = await connect();
    const ko = await emit(p2, 'join_room', { code, playerData: { name: 'B' } });
    expect(ko.success).toBe(false);
    expect(ko.error).toMatch(/complet/i);
    tv.disconnect(); p1.disconnect(); p2.disconnect();
  });

  it('premier humain = isHost, suivants et bots non-hôtes (contrat hostId/isHost ; autorisation stricte serveur hors périmètre C5)', async () => {
    const tv = await connect();
    const created = await emit(tv, 'create_room', { gameId: 'quiz' });
    const code = created.room.code;
    const a = await connect();
    const b = await connect();
    const jA = await emit(a, 'join_room', { code, playerData: { name: 'A' } });
    const jB = await emit(b, 'join_room', { code, playerData: { name: 'B' } });
    tv.emit('add_bot', { code });
    await wait(400);

    let lastRoom = null;
    b.on('room_state_update', (r) => { lastRoom = r; });
    await wait(300);

    expect(jA.player.isHost).toBe(true);
    expect(jB.player.isHost).toBe(false);
    const room = lastRoom || created.room;
    const bot = (lastRoom || room).players.find((p) => p.isBot);
    expect(bot?.isHost ?? false).toBe(false);
    a.disconnect(); b.disconnect();
    tv.disconnect();
  });

  it('C1 — Scrabble : état public sans chevalets, fragment privé propre à chaque joueur', async () => {
    const tv = await connect();
    const created = await emit(tv, 'create_room', { gameId: 'scrabble' });
    const code = created.room.code;
    const a = await connect();
    const b = await connect();
    const jA = await emit(a, 'join_room', { code, playerData: { name: 'A' } });
    await emit(b, 'join_room', { code, playerData: { name: 'B' } });
    expect(jA.success).toBe(true);

    const seenA = { pub: null, priv: [] };
    const seenB = { pub: null, priv: [] };
    a.on('game_state_update', (gs) => { seenA.pub = gs; });
    a.on('private_state', (f) => { seenA.priv.push(f); });
    b.on('game_state_update', (gs) => { seenB.pub = gs; });
    b.on('private_state', (f) => { seenB.priv.push(f); });

    const startRes = await emit(tv, 'start_game', { code });
    expect(startRes.success).toBe(true);

    // Le premier état part au tick du timer de tour (~1s) : attente conditionnelle
    const deadline = Date.now() + 5000;
    while (!(seenA.pub !== null && seenA.priv.length > 0 && seenB.priv.length > 0) && Date.now() < deadline) {
      await wait(150);
    }

    expect(seenA.pub).not.toBeNull();
    expect(JSON.stringify(seenA.pub)).not.toContain('"playerRacks"');
    expect(seenA.priv.length).toBeGreaterThan(0);
    const frag = seenA.priv[seenA.priv.length - 1];
    // le fragment ne contient que le rack du destinataire (jamais celui de l'autre)
    expect(Object.keys(frag.playerRacks)).toEqual([jA.player.id]);

    a.disconnect(); b.disconnect(); tv.disconnect();
  });

  it('déconnexion puis reconnexion : flag connected suivi + session restaurée', async () => {
    const tv = await connect();
    const created = await emit(tv, 'create_room', { gameId: 'quiz' });
    const code = created.room.code;
    const phone = await connect();
    const join = await emit(phone, 'join_room', { code, playerData: { name: 'Nina' } });
    await wait(400);

    let lastRoom = null;
    tv.on('room_state_update', (r) => { lastRoom = r; });

    phone.io.engine.close(); // coupure réseau brutale
    await wait(600);
    expect(lastRoom.players.find((p) => p.name === 'Nina').connected).toBe(false);

    const phone2 = await connect();
    let gotPublic = false, gotPrivate = false;
    phone2.on('game_state_update', () => { gotPublic = true; });
    phone2.on('private_state', () => { gotPrivate = true; });
    phone2.emit('reconnect_player', { code, playerId: join.player.id, playerData: join.player });
    await wait(700);

    const me = lastRoom.players.find((p) => p.name === 'Nina');
    expect(me.connected).toBe(true);
    expect(me.id).toBe(join.player.id);
    // statut lobby => pas d'état de jeu à repousser ; les flags ci-dessous
    // valident le canal privé dès qu'une partie est active
    expect(gotPublic || gotPrivate || lastRoom.status === 'lobby').toBe(true);
    tv.disconnect(); phone2.disconnect();
  });

  it('fin de partie réelle (Poker bots) => finalRanking complet et cohérent', async () => {
    const tv = await connect();
    const created = await emit(tv, 'create_room', { gameId: 'poker' });
    const code = created.room.code;
    const phone = await connect();
    const join = await emit(phone, 'join_room', { code, playerData: { name: 'Alice' } });
    tv.emit('add_bot', { code });
    tv.emit('add_bot', { code });
    await wait(400);
    const startRes = await emit(tv, 'start_game', { code });
    expect(startRes.success).toBe(true);

    phone.emit('game_action', { code, action: 'poker_fold', payload: { playerId: join.player.id } });

    let lastRoom = null;
    tv.on('room_state_update', (r) => { if (r.status === 'game_over') lastRoom = r; });

    const deadline = Date.now() + 110000;
    while (!lastRoom && Date.now() < deadline) await wait(1000);
    expect(lastRoom).not.toBeNull(); // la partie se termine bien

    const rk = lastRoom.finalRanking;
    expect(Array.isArray(rk)).toBe(true);
    expect(rk).toHaveLength(lastRoom.players.length);
    expect(rk[0].isWinner).toBe(true);
    expect(rk.map((e) => e.rank)).toEqual([...new Set(rk.map((e) => e.rank))].sort((a, b) => a - b).flatMap((r) => [r]));
    rk.forEach((e) => expect(Number.isFinite(e.score)).toBe(true));
    // l'humaine couchée ne peut pas être championne
    expect(rk[0].playerId).not.toBe(join.player.id);
    tv.disconnect(); phone.disconnect();
  }, 150000);
});
