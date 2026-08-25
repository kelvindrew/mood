// WordEngine (Scrabble) : règles, fin de partie, séparation public/privé (C1)
import { describe, it, expect } from 'vitest';
import { WordEngine } from '../../server/games/wordEngine.js';

const P = () => [
  { id: 'p1', name: 'Alice', color: 'red' },
  { id: 'p2', name: 'Bob', color: 'blue' },
];

const tile = (letter) => ({
  id: `t_${letter}_${Math.random().toString(36).slice(2, 6)}`,
  letter,
  points: 1,
});

function playAtCenter(e, playerId, letters) {
  const ls = Array.isArray(letters) ? letters : [...String(letters).toUpperCase()];
  const tiles = ls.map((L, i) => ({ row: 7, col: 7 + i, letter: L.toUpperCase(), tileId: e.playerRacks[playerId][i].id }));
  return e.playWord(playerId, tiles);
}

function withRack(e, playerId, letters) {
  e.playerRacks[playerId] = letters.map(tile);
}

describe('WordEngine', () => {
  it('accepte un mot valide au centre et score > 0, rack re-rempli à 7', () => {
    const e = new WordEngine(P(), () => {}, () => {});
    withRack(e, 'p1', ['S', 'A', 'L', 'O', 'N', 'X', 'Q']);
    const res = playAtCenter(e, 'p1', 'salon');
    expect(res.success).toBe(true);
    expect(res.isValid).toBe(true);
    expect(res.word).toBe('SALON');
    expect(res.score).toBeGreaterThan(0);
    expect(e.playerRacks.p1).toHaveLength(7); // 5 posées + 2 piochées
  });

  it('refuse un mot absent du dictionnaire sans perdre le tour', () => {
    const e = new WordEngine(P(), () => {}, () => {});
    withRack(e, 'p1', ['X', 'Y', 'Z', 'Q', 'W', 'K', 'J']);
    const before = e.currentTurnIndex;
    const res = playAtCenter(e, 'p1', 'XYZQW');
    expect(res.success).toBe(false);
    expect(res.isValid).toBe(false);
    expect(e.currentTurnIndex).toBe(before);
  });

  it("exige la case centrale au premier coup", () => {
    const e = new WordEngine(P(), () => {}, () => {});
    withRack(e, 'p1', ['S', 'A', 'L', 'O', 'N', 'X', 'Q']);
    const tiles = [0, 1].map((i) => ({ row: 3, col: 3 + i, letter: 'SA'[i], tileId: e.playerRacks.p1[i].id }));
    const res = e.playWord('p1', tiles);
    expect(res.success).toBe(false);
    expect(res.error).toMatch(/centrale/i);
  });

  it('termine après passes successives de tous les joueurs ×2', () => {
    let over = null;
    const e = new WordEngine(P(), () => {}, (w) => { over = w; });
    for (let i = 0; i < 4; i++) e.passTurn(e.getCurrentPlayer().id);
    expect(e.isGameOver).toBe(true);
    expect(over).toBe(e.winner);
    expect(Array.isArray(e.finalPodium)).toBe(true);
    expect(e.endGameReason).toBe('consecutive_passes');
  });

  it('C1 — getPublicState ne contient JAMAIS les chevalets ; getPrivateState ne donne que son rack', () => {
    const e = new WordEngine(P(), () => {}, () => {});
    const pub = e.getPublicState();
    expect(pub).not.toHaveProperty('playerRacks');
    const priv = e.getPrivateState('p1');
    expect(Object.keys(priv.playerRacks)).toEqual(['p1']);
    expect(priv.playerRacks.p1.length).toBe(7);
    expect(priv.playerRacks.p2).toBeUndefined();
  });
});
