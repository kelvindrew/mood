// C3 — buildFinalRanking : classement réel par système de victoire
import { describe, it, expect } from 'vitest';
import { RoomManager } from '../../server/rooms.js';

const fakeIo = { to: () => ({ emit: () => {} }) };
const mgr = new RoomManager(fakeIo, 'localhost');

// Ordre d'arrivée volontaire : Alice en premier => ne doit JAMAIS décider du podium
const mkPlayers = () => [
  { id: 'alice', name: 'Alice', avatar: 'A', color: 'red' },
  { id: 'bob', name: 'Bob', avatar: 'B', color: 'blue' },
  { id: 'carol', name: 'Carol', avatar: 'C', color: 'green' },
  { id: 'dave', name: 'Dave', avatar: 'D', color: 'yellow' },
];
const makeRoom = (gameId, gameState, players = mkPlayers()) => ({
  code: '1234', gameId, status: 'game_over',
  settings: { enableGages: false },
  players, spectators: [], activeGage: null,
  gameEngine: { getState: () => gameState },
});

describe('buildFinalRanking (C3)', () => {
  it('classe par scores réels (quiz multi-joueurs)', () => {
    const rk = mgr.buildFinalRanking(makeRoom('quiz', { scores: { alice: 100, bob: 1500, carol: 800, dave: 1200 } }));
    expect(rk.map((e) => e.playerId)).toEqual(['bob', 'dave', 'carol', 'alice']);
    expect(rk[0]).toMatchObject({ rank: 1, isWinner: true, score: 1500 });
  });

  it('gère les ex æquo (jeu à score)', () => {
    const rk = mgr.buildFinalRanking(makeRoom('blind_test', { scores: { alice: 500, bob: 350, carol: 500, dave: 100 } }));
    const tops = rk.filter((e) => e.rank === 1);
    expect(tops.map((e) => e.playerId).sort()).toEqual(['alice', 'carol']);
    expect(tops.every((e) => e.isWinner)).toBe(true);
    expect(rk.find((e) => e.playerId === 'bob').rank).toBe(3);
    expect(rk.find((e) => e.playerId === 'dave').rank).toBe(4);
  });

  it('fonctionne avec deux joueurs', () => {
    const rk = mgr.buildFinalRanking(
      makeRoom('four_pics', { scores: { alice: 50, bob: 300 } }, [mkPlayers()[0], mkPlayers()[1]]),
    );
    expect(rk.map((e) => e.playerId)).toEqual(['bob', 'alice']);
    expect(rk[0].isWinner).toBe(true);
    expect(rk[0].score).toBe(300);
  });

  it('respecte le podium officiel du Scrabble et conserve les points', () => {
    const rk = mgr.buildFinalRanking(makeRoom('scrabble', {
      finalPodium: [
        { id: 'carol', rank: 1, score: 87 },
        { id: 'alice', rank: 2, score: 42 },
        { id: 'bob', rank: 3, score: 31 },
        { id: 'dave', rank: 4, score: 12 },
      ],
    }));
    expect(rk.map((e) => e.playerId)).toEqual(['carol', 'alice', 'bob', 'dave']);
    expect(rk[0].score).toBe(87);
  });

  it("préserve l'ordre Président (président -> trouduc) malgré des scores nuls", () => {
    const rk = mgr.buildFinalRanking(makeRoom('president', {
      finishedPlayers: [
        { playerId: 'dave', name: 'Dave', rankTitle: 'president' },
        { playerId: 'bob', name: 'Bob', rankTitle: 'vice_president' },
        { playerId: 'carol', name: 'Carol', rankTitle: 'vice_trouduc' },
        { playerId: 'alice', name: 'Alice', rankTitle: 'trouduc' },
      ],
    }));
    expect(rk.map((e) => e.playerId)).toEqual(['dave', 'bob', 'carol', 'alice']);
    expect(rk[0].isWinner).toBe(true);
    expect(rk.filter((e) => e.isWinner)).toHaveLength(1);
  });

  it('ordonne le Blackjack par statut de paiement', () => {
    const rk = mgr.buildFinalRanking(makeRoom('blackjack', {
      playerHands: {
        alice: { payoutStatus: 'win' },
        bob: { payoutStatus: 'blackjack' },
        carol: { payoutStatus: 'lose' },
        dave: { payoutStatus: 'push' },
      },
    }));
    expect(rk.map((e) => e.playerId)).toEqual(['bob', 'alice', 'dave', 'carol']);
    expect(rk.filter((e) => e.isWinner).map((e) => e.playerId)).toEqual(['bob']);
  });

  it('promeut la couleur gagnante au Ludo et compte les pions', () => {
    const pawn = (over = {}) => ({ position: -1, isHome: true, isFinished: false, ...over });
    const rk = mgr.buildFinalRanking(makeRoom('ludo', {
      winner: 'yellow',
      pawns: {
        red: [pawn()],
        blue: [pawn({ position: 45, isHome: false }), pawn({ position: 44, isHome: false })],
        green: [pawn()],
        yellow: [pawn({ position: 200, isFinished: true }), pawn({ position: 200, isFinished: true })],
      },
    }));
    expect(rk[0].playerId).toBe('dave'); // jaune = gagnant réel
    expect(rk[0].isWinner).toBe(true);
    expect(rk[0].score).toBe(50); // 2 pions rentrés × 25
    expect(rk[1].playerId).toBe('bob'); // meilleure progression ensuite
  });

  it('utilise finishOrder puis la progression pour la course', () => {
    const rk = mgr.buildFinalRanking(makeRoom('mini_racing', {
      status: 'finished',
      finishOrder: ['carol', 'alice'],
      players: [
        { id: 'carol', progress: 3000, finishedRank: 1 },
        { id: 'alice', progress: 3000, finishedRank: 2 },
        { id: 'bob', progress: 2400, finishedRank: null },
        { id: 'dave', progress: 900, finishedRank: null },
      ],
    }));
    expect(rk.map((e) => e.playerId)).toEqual(['carol', 'alice', 'bob', 'dave']);
  });

  it('place le gagnant Uno/Menteur devant puis tri par cartes restantes', () => {
    const rk = mgr.buildFinalRanking(makeRoom('card_party', {
      winner: 'alice',
      playerCardCounts: { alice: 0, bob: 1, carol: 7, dave: 2 },
    }));
    expect(rk.map((e) => e.playerId)).toEqual(['alice', 'bob', 'dave', 'carol']);
  });

  it('marque toute la meute gagnante au Loup-Garou sans exposer les rôles', () => {
    const rk = mgr.buildFinalRanking(makeRoom('werewolf', {
      winnerTeam: 'werewolves',
      players: {
        alice: { role: 'villager', isAlive: true },
        bob: { role: 'werewolf', isAlive: true },
        carol: { role: 'seer', isAlive: false },
        dave: { role: 'werewolf', isAlive: false },
      },
    }));
    const winners = rk.filter((e) => e.isWinner).map((e) => e.playerId).sort();
    expect(winners).toEqual(['bob', 'dave']);
    expect(rk.find((e) => e.playerId === 'bob').team).toBe('werewolves');
    expect(JSON.stringify(rk)).not.toContain('"role"');
    expect(mgr.buildResultLabel(makeRoom('werewolf', { winnerTeam: 'villagers', players: {} }))).toContain('Village');
  });

  it('garantit le gagnant Poker en tête tout en conservant les jetons', () => {
    const rk = mgr.buildFinalRanking(makeRoom('poker', {
      winnerId: 'alice',
      playerChips: { alice: 1030, bob: 980, carol: 1100, dave: 900 },
    }));
    expect(rk[0].playerId).toBe('alice');
    expect(rk[0].isWinner).toBe(true);
    expect(rk.map((e) => e.score)).toEqual([1030, 1100, 980, 900]);
  });
});
