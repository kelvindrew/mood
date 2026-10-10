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
    expect(priv.playerRacks.p2).toBeUndefined();
  });

  it('reconnaît le mot ERE et permet de placer un mot multi-directionnel / croisé', () => {
    const e = new WordEngine(P(), () => {}, () => {});
    // Coup 1 : Alice pose ERE au centre horizontalement (7, 7), (7, 8), (7, 9)
    withRack(e, 'p1', ['E', 'R', 'E', 'A', 'B', 'C', 'D']);
    const tiles1 = [
      { row: 7, col: 7, letter: 'E', tileId: e.playerRacks.p1[0].id },
      { row: 7, col: 8, letter: 'R', tileId: e.playerRacks.p1[1].id },
      { row: 7, col: 9, letter: 'E', tileId: e.playerRacks.p1[2].id },
    ];
    const res1 = e.playWord('p1', tiles1);
    expect(res1.success).toBe(true);
    expect(res1.word).toBe('ERE');

    // Coup 2 : Bob pose 2 lettres pour croiser verticalement sur le 'R' en (7, 8)
    // Par exemple en posant 'T' au-dessus en (6, 8) et 'I' en dessous en (8, 8) pour former TRI
    withRack(e, 'p2', ['T', 'I', 'X', 'Y', 'Z', 'K', 'M']);
    const tiles2 = [
      { row: 6, col: 8, letter: 'T', tileId: e.playerRacks.p2[0].id },
      { row: 8, col: 8, letter: 'I', tileId: e.playerRacks.p2[1].id },
    ];
    const res2 = e.playWord('p2', tiles2);
    expect(res2.success).toBe(true);
    expect(res2.word).toBe('TRI');
  });

  it('valide le placement d’une seule lettre croisant un mot existant', () => {
    const e = new WordEngine(P(), () => {}, () => {});
    // Coup 1 : poser ERE en (7, 7)-(7, 9)
    withRack(e, 'p1', ['E', 'R', 'E', 'A', 'B', 'C', 'D']);
    const tiles1 = [
      { row: 7, col: 7, letter: 'E', tileId: e.playerRacks.p1[0].id },
      { row: 7, col: 8, letter: 'R', tileId: e.playerRacks.p1[1].id },
      { row: 7, col: 9, letter: 'E', tileId: e.playerRacks.p1[2].id },
    ];
    e.playWord('p1', tiles1);

    // Coup 2 : Bob pose 'S' en (7, 10) pour former ERES horizontalement
    withRack(e, 'p2', ['S', 'B', 'C', 'D', 'F', 'G', 'H']);
    const tiles2 = [
      { row: 7, col: 10, letter: 'S', tileId: e.playerRacks.p2[0].id },
    ];
    const res2 = e.playWord('p2', tiles2);
    expect(res2.success).toBe(true);
    expect(res2.word).toBe('ERES');
  });
});

