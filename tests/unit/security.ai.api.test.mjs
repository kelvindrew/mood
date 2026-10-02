// Tests de sécurité et validation de l'API IA (/api/ai/*)
// Couvre l'authentification admin, les limites d'entrée, les formats et la politique CORS
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { spawn } from 'node:child_process';

const PORT = 3989;
const URL = `http://127.0.0.1:${PORT}`;
let serverProcess = null;

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function waitForServer(timeoutMs = 15000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`${URL}/api/info`);
      if (res.ok) return true;
    } catch {}
    await wait(200);
  }
  throw new Error('Serveur de test non disponible');
}

beforeAll(async () => {
  serverProcess = spawn(process.execPath, ['server/index.js'], {
    env: {
      ...process.env,
      PORT: String(PORT),
      ADMIN_API_KEY: 'test_admin_secret_key_12345',
      CORS_ALLOWED_ORIGINS: 'http://localhost:5173,https://authorized-domain.com',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  await waitForServer();
}, 30000);

afterAll(() => {
  serverProcess?.kill();
});

describe('Sécurité de l’API IA', () => {
  it('refus des appels non authentifiés sur /api/ai/config, /api/ai/generate et /api/ai/publish (401)', async () => {
    // 1. /api/ai/config sans credentials
    const rConfig = await fetch(`${URL}/api/ai/config`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey: 'dummy_key' }),
    });
    expect(rConfig.status).toBe(401);
    const dConfig = await rConfig.json();
    expect(dConfig.success).toBe(false);

    // 2. /api/ai/generate sans credentials
    const rGen = await fetch(`${URL}/api/ai/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameType: 'quiz', count: 5 }),
    });
    expect(rGen.status).toBe(401);

    // 3. /api/ai/publish sans credentials
    const rPub = await fetch(`${URL}/api/ai/publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameType: 'quiz', items: [] }),
    });
    expect(rPub.status).toBe(401);

    // 4. Appel avec un mauvais mot de passe admin
    const rBadAuth = await fetch(`${URL}/api/ai/config`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-key': 'wrong_password' },
      body: JSON.stringify({ apiKey: 'dummy_key' }),
    });
    expect(rBadAuth.status).toBe(401);
  });

  it('ne renvoie jamais la clé API dans la réponse de configuration', async () => {
    const testSecretKey = 'AIzaSySecretKeyNeverExposed987654321';
    const res = await fetch(`${URL}/api/ai/config`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': 'test_admin_secret_key_12345',
      },
      body: JSON.stringify({ apiKey: testSecretKey }),
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(JSON.stringify(data)).not.toContain(testSecretKey);
  });

  it('validation des limites et formats de /api/ai/generate', async () => {
    // 1. gameType invalide
    const rBadGame = await fetch(`${URL}/api/ai/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': 'test_admin_secret_key_12345',
      },
      body: JSON.stringify({ gameType: 'unsupported_game_type', count: 5 }),
    });
    expect(rBadGame.status).toBe(400);
    const dBadGame = await rBadGame.json();
    expect(dBadGame.error).toMatch(/non supporté|invalide/i);
  });

  it('validation stricte des formats lors de la publication (/api/ai/publish)', async () => {
    const authHeaders = {
      'Content-Type': 'application/json',
      'x-admin-key': 'test_admin_secret_key_12345',
    };

    // 1. Tableau d'items vide
    const rEmpty = await fetch(`${URL}/api/ai/publish`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ gameType: 'quiz', items: [] }),
    });
    expect(rEmpty.status).toBe(400);

    // 2. Format incorrect pour un quiz (pas d'options)
    const rBadQuiz = await fetch(`${URL}/api/ai/publish`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        gameType: 'quiz',
        items: [{ question: 'Combien de continents ?' }],
      }),
    });
    expect(rBadQuiz.status).toBe(400);
    expect((await rBadQuiz.json()).error).toMatch(/format/i);

    // 3. Format valide accepté
    const rGood = await fetch(`${URL}/api/ai/publish`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        gameType: 'quiz',
        items: [{ question: 'Capitale ?', options: ['A', 'B'], correctIndex: 0 }],
      }),
    });
    expect(rGood.status).toBe(200);
    expect((await rGood.json()).success).toBe(true);
  });

  it('politique CORS : autorise les origines configurées et bloque les origines inconnues', async () => {
    // Origine autorisée
    const rAllowed = await fetch(`${URL}/api/info`, {
      headers: { Origin: 'https://authorized-domain.com' },
    });
    expect(rAllowed.headers.get('access-control-allow-origin')).toBe('https://authorized-domain.com');

    // Origine externe non autorisée
    const rBlocked = await fetch(`${URL}/api/info`, {
      headers: { Origin: 'https://malicious-external-site.evil' },
    });
    // CORS bloque en ne retournant pas de header Access-Control-Allow-Origin ou une erreur
    const acao = rBlocked.headers.get('access-control-allow-origin');
    expect(acao).not.toBe('https://malicious-external-site.evil');
  });
});
