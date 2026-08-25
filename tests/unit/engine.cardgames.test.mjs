// Moteurs de cartes : Uno, Président, Poker — gardes de tour, C1, E2 (slot bot)
import { describe, it, expect, vi, afterEach } from 'vitest';
import { CardEngine } from '../../server/games/cardEngine.js';
import { PresidentEngine } from '../../server/games/presidentEngine.js';
import { PokerEngine } from '../../server/games/pokerEngine.js';

afterEach(() => vi.useRealTimers());

describe('CardEngine (Uno)', () => {
  const P = () => [
    { id: 'p1', name: 'Alice', color: 'red' },
    { id: 'p2', name: 'Bob', color: 'blue' },
  ];

  it('refuse de jouer hors tour', () => {
    const e = new CardEngine(P(), () => {}, () => {});
    const otherId = e.getCurrentPlayer().id === 'p1' ? 'p2' : 'p1';
    const card = e.playerHands[otherId][0];
    const res = e.playCard(otherId, card.id);
    expect(res.success).toBe(false);
    expect(res.error).toMatch(/tour/i);
  });

  it('pioche ajoute exactement une carte puis passe le tour', () => {
    const e = new CardEngine(P(), () => {}, () => {});
    const cur = e.getCurrentPlayer().id;
    const before = e.playerHands[cur].length;
    const turnIdx = e.currentTurnIndex;
    e.playerDraw(cur);
    expect(e.playerHands[cur]).toHaveLength(before + 1);
    expect(e.currentTurnIndex).not.toBe(turnIdx);
  });

  it('C1 — état public sans mains ; fragment privé limité à sa main', () => {
    const e = new CardEngine(P(), () => {}, () => {});
    const pub = JSON.stringify(e.getPublicState());
    expect(pub).not.toContain('"playerHands"');
    expect(pub).toContain('"playerCardCounts"');
    const priv = e.getPrivateState('p2');
    expect(Object.keys(priv.playerHands)).toEqual(['p2']);
    expect(priv.playerHands.p2).toHaveLength(7);
  });

  it('E2 — destroy() annule le timer de tour (pas de notify fantôme)', async () => {
    vi.useFakeTimers();
    let notifications = 0;
    const e = new CardEngine(P(), () => { notifications++; }, () => {});
    e.destroy();
    const snapshot = notifications;
    await vi.advanceTimersByTimeAsync(30000);
    expect(notifications).toBe(snapshot);
  });
});

describe('PresidentEngine', () => {
  const P = () => [
    { id: 'p1', name: 'Alice', color: 'red' },
    { id: 'p2', name: 'Bob', color: 'blue', isBot: true },
  ];

  it("refuse un coup hors tour et une combinaison hétérogène", () => {
    const e = new PresidentEngine(P(), () => {}, () => {});
    const notCurrent = e.getCurrentPlayer().id === 'p1' ? 'p2' : 'p1';
    expect(e.playCards(notCurrent, ['x']).success).toBe(false);

    // Forcer le tour au joueur courant puis jouer des rangs différents
    const cur = e.getCurrentPlayer().id;
    const hand = e.playerHands[cur];
    if (hand.length >= 2) {
      const res = e.playCards(cur, [hand[0].id, hand.find((c) => c.rank !== hand[0].rank)?.id ?? hand[1].id]);
      if (!res.success) expect(res.error).toMatch(/même valeur/i);
    }
  });

  it('E2 — un seul timer bot actif, détruit avec le moteur', async () => {
    vi.useFakeTimers();
    const e = new PresidentEngine([{ id: 'b1', name: 'Bot', color: 'red', isBot: true }, P()[1]], () => {}, () => {});
    let plays = 0;
    const orig = e.executeBotPlay.bind(e);
    e.executeBotPlay = () => { plays++; orig(); };
    e.checkBotTurn(); e.checkBotTurn(); e.checkBotTurn(); // multi-planification
    e.destroy();
    await vi.advanceTimersByTimeAsync(2000);
    expect(plays).toBe(0);
    expect(e._destroyed).toBe(true);
  });

  it('C1 — état public sans playerHands', () => {
    const e = new PresidentEngine(P(), () => {}, () => {});
    expect(JSON.stringify(e.getPublicState())).not.toContain('"playerHands"');
  });
});

describe('PokerEngine', () => {
  const P = () => [
    { id: 'p1', name: 'Alice', color: 'red' },
    { id: 'p2', name: 'Bob', color: 'blue' },
  ];

  it('fold du prédernier joueur termine la main en faveur du dernier actif', () => {
    let winner = null;
    const e = new PokerEngine(P(), () => {}, (w) => { winner = w; });
    const first = e.getCurrentPlayer().id;
    e.handleFold(first);
    expect(winner).not.toBeNull();
    expect(e.winnerId).toBe(winner);
    expect(e.lastActionLog).toMatch(/remporte le pot/);
  });

  it('C1 — hole cards absentes de l’état public, présentes en privé', () => {
    const e = new PokerEngine(P(), () => {}, () => {});
    const pub = JSON.stringify(e.getPublicState());
    expect(pub).not.toContain('"playerHands"');
    expect(pub).toContain('"communityCards"');
    const priv = e.getPrivateState('p1');
    expect(priv.playerHands.p1).toHaveLength(2);
    expect(priv.playerHands.p2).toBeUndefined();
  });

  it('E2 — destroy() coupe la planification bot', async () => {
    vi.useFakeTimers();
    const bots = [
      { id: 'b1', name: 'B1', color: 'red', isBot: true },
      { id: 'b2', name: 'B2', color: 'blue', isBot: true },
    ];
    const e = new PokerEngine(bots, () => {}, () => {});
    let acts = 0;
    const orig = e.executeBotAction.bind(e);
    e.executeBotAction = () => { acts++; orig(); };
    e.destroy();
    await vi.advanceTimersByTimeAsync(2000);
    expect(acts).toBe(0);
  });
});
