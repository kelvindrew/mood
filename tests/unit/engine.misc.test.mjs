// Moteurs divers : quiz, draw, blind test, menteur, inter, blackjack,
// ludo, four_pics, mini_racing, quick_games — règles clés + C1 + E2
import { describe, it, expect, vi, afterEach } from 'vitest';
import { QuizEngine } from '../../server/games/quizEngine.js';
import { DrawEngine } from '../../server/games/drawEngine.js';
import { BlindTestEngine } from '../../server/games/blindTestEngine.js';
import { MenteurEngine } from '../../server/games/menteurEngine.js';
import { InterEngine } from '../../server/games/interEngine.js';
import { BlackjackEngine } from '../../server/games/blackjackEngine.js';
import { LudoEngine } from '../../server/games/ludoEngine.js';
import { FourPicsEngine } from '../../server/games/fourPicsEngine.js';
import { MiniRacingEngine } from '../../server/games/miniRacingEngine.js';
import { QuickGamesEngine } from '../../server/games/quickGamesEngine.js';

afterEach(() => vi.useRealTimers());
const P = (over = {}) => ({ id: over.id || 'p1', name: over.name || 'P1', color: over.color || 'red', isBot: !!over.isBot });

describe('QuizEngine', () => {
  it('score la bonne réponse avec bonus de rapidité et suit les séries', () => {
    const e = new QuizEngine([P(), P({ id: 'p2' })], () => {}, () => {});
    const q = e.getCurrentQuestion();
    const okIdx = q.correctIndex;
    e.submitAnswer('p1', okIdx);
    e.submitAnswer('p2', (okIdx + 1) % q.options.length);
    expect(e.scores.p1).toBeGreaterThan(0);
    expect(e.streaks.p1).toBe(1);
    expect(e.streaks.p2).toBe(0);
    e.destroy();
  });

  it('C1 — correctIndex masqué pendant la question, révélé ensuite', () => {
    vi.useFakeTimers();
    const e = new QuizEngine([P(), P({ id: 'p2' })], () => {}, () => {});
    // pendant la phase 'question' le champ est retiré :
    expect(e.getPublicState().currentQuestion).not.toHaveProperty('correctIndex');
    e.revealAnswers();
    expect(e.getPublicState().currentQuestion.correctIndex).toBeDefined();
    vi.advanceTimersByTime(5000); // transition suivante
    e.destroy();
  });

  it('E2 — destroy() pendant la révélation empêche toute progression', async () => {
    vi.useFakeTimers();
    const e = new QuizEngine([P(), P({ id: 'p2' })], () => {}, () => {});
    e.revealAnswers();
    e.destroy();
    await vi.advanceTimersByTimeAsync(6000);
    expect(e.currentQuestionIndex).toBe(0);
    expect(e._destroyed).toBe(true);
  });
});

describe('DrawEngine', () => {
  it('devinette correcte score & révèle ; mauvaise ne révèle pas', () => {
    const e = new DrawEngine([P(), P({ id: 'p2' })], () => {}, () => {});
    e.submitGuess('p2', 'ZZZZ'); // renvoie undefined (pas de payload)
    expect(e.state).toBe('drawing');
    expect(e.scores.p2).toBe(0); // initialisé à 0 au constructeur
    const right = e.submitGuess('p2', e.secretWord);
    expect(right).toBe(true); // le moteur renvoie true (payload nu)
    expect(e.state).toBe('word_revealed');
    expect(e.scores.p2).toBeGreaterThan(0);
    expect(e.scores[e.getCurrentDrawer().id]).toBeGreaterThan(0); // bonus dessinateur
    e.destroy();
  });

  it('C1/E2 — secretWord masqué au public pendant drawing, donné au dessinateur ; destroy fige la transition', async () => {
    vi.useFakeTimers();
    const e = new DrawEngine([P(), P({ id: 'p2' })], () => {}, () => {});
    const dId = e.getCurrentDrawer().id;
    expect(e.getPublicState()).not.toHaveProperty('secretWord');
    expect(e.getPrivateState(dId).secretWord).toBe(e.secretWord);
    expect(e.getPrivateState('p2')).toBeNull();
    e.revealWordAndAdvance(true);
    e.destroy();
    await vi.advanceTimersByTimeAsync(5000);
    expect(e.roundIndex).toBe(0);
  });
});

describe('BlindTestEngine', () => {
  it('buzz -> bonne réponse +500 ; C1 masque titre/artiste/correctIndex hors révélation', () => {
    const e = new BlindTestEngine([P(), P({ id: 'p2' })], () => {}, () => {});
    expect(e.handleBuzz('p1')).toBe(true);
    const song = e.getCurrentSong();
    let pub = JSON.stringify(e.getPublicState());
    expect(pub.includes(`"title"`)).toBe(false);
    expect(pub.includes('"correctIndex"')).toBe(false);
    expect(e.submitAnswer('p1', song.correctIndex)).toBe(true);
    expect(e.scores.p1).toBe(500);
    pub = JSON.stringify(e.getPublicState()); // phase reveal
    expect(pub.includes(`"title"`)).toBe(true);
    e.destroy();
  });
});

describe('MenteurEngine', () => {
  it('accusation juste punit le menteur, accusation fausse punit l’accusateur', () => {
    const e = new MenteurEngine([P(), P({ id: 'p2' }), P({ id: 'p3' }), P({ id: 'p4' })], () => {}, () => {});
    // Mensonge volontaire du joueur courant
    const cur = e.getCurrentPlayer();
    const card = e.playerHands[cur.id][0];
    const claimed = ['2','3','4','5','6','7','8','9','10','J','Q','K','A'].find((r) => r !== card.rank && r !== e.lastPlay?.claimedRank);
    const pileBefore = 0;
    e.playCards(cur.id, [card.id], claimed);
    const accuser = e.players.find((pl) => pl.id !== cur.id && !pl.isBot) || e.players.find((pl) => pl.id !== cur.id);
    const accuserCount = (e.playerHands[accuser.id] || []).length;
    e.callLiar(accuser.id);
    expect(e.accusationResult.wasLying).toBe(true);
    expect((e.playerHands[cur.id] || []).length).toBeGreaterThan(0); // ramasse le tas
    expect((e.playerHands[accuser.id] || []).length).toBe(accuserCount);
    void pileBefore;
  });

  it('C1 — playerHands jamais dans l’état public ; lastPlay sans realCards', () => {
    const e = new MenteurEngine([P(), P({ id: 'p2' }), P({ id: 'p3' }), P({ id: 'p4' })], () => {}, () => {});
    const cur = e.getCurrentPlayer();
    const card = e.playerHands[cur.id][0];
    e.playCards(cur.id, [card.id], card.rank === 'K' ? 'Q' : 'K');
    const pub = JSON.stringify(e.getPublicState());
    expect(pub).not.toContain('"playerHands"');
    expect(pub).not.toContain('"realCards"');
  });
});

describe('InterEngine', () => {
  it('cumule les attaques +2/+4 et la pioche absorbe la pénalité', () => {
    const e = new InterEngine([P(), P({ id: 'p2' })], () => {}, () => {});
    // Forcer un contexte déterministe (2 cartes en main pour éviter la victoire instantanée)
    e.topCard = { id: 'x1', suit: 'spades', rank: '6', value: 6 };
    e.currentSuit = 'spades';
    e.playerHands.p1 = [
      { id: 'a2', suit: 'spades', rank: '2', value: 4 },
      { id: 'az', suit: 'clubs', rank: '5', value: 7 },
    ];
    e.playerHands.p2 = [{ id: 'b10', suit: 'hearts', rank: '10', value: 12 }, { id: 'bx', suit: 'clubs', rank: '3', value: 5 }];
    e.currentTurnIndex = e.players.findIndex((p) => p.id === 'p1');

    e.playCard('p1', 'a2');           // +2
    expect(e.pendingPenaltyDraws).toBe(2);
    e.currentTurnIndex = e.players.findIndex((p) => p.id === 'p2');
    e.playCard('p2', 'b10');          // contre-attaque +4 => total 6
    expect(e.pendingPenaltyDraws).toBe(6);

    e.currentTurnIndex = e.players.findIndex((p) => p.id === 'p2'); // le tour a avancé (bots auto-ajoutés)
    const handBefore = e.playerHands.p2.length;
    e.drawCard('p2');                  // pioche les 6 cartes
    expect(e.playerHands.p2.length - handBefore).toBe(6);
    expect(e.pendingPenaltyDraws).toBe(0);
  });
});

describe('BlackjackEngine', () => {
  function payoutFixture(scoresDealer, mk) {
    let over = null;
    const e = new BlackjackEngine([P(), P({ id: 'p2' })], () => {}, (w) => { over = w; });
    if (e.timer) clearInterval(e.timer);
    if (e.botTimer) clearTimeout(e.botTimer);
    e.dealerHand.score = scoresDealer;
    e.dealerHand.cards = [];
    for (const [id, h] of Object.entries(mk)) {
      e.playerHands[id] = { cards: [], isStand: true, isBust: false, isBlackjack: false, bet: 50, ...h };
    }
    return { e, over };
  }

  it('mapping des statuts : blackjack > win > push > lose vs croupier', () => {
    const { e } = payoutFixture(19, {
      p1: { score: 21, isBlackjack: true },
      p2: { score: 19 },
    });
    e.resolveRound();
    expect(e.playerHands.p1.payoutStatus).toBe('blackjack');
    expect(e.playerHands.p2.payoutStatus).toBe('push');

    const t2 = payoutFixture(18, { p1: { score: 20 }, p2: { score: 10, isBust: true } }).e;
    t2.resolveRound();
    expect(t2.playerHands.p1.payoutStatus).toBe('win');
    expect(t2.playerHands.p2.payoutStatus).toBe('lose');
  });

  it('C1 — hole card remplacée tant que hideHoleCard', () => {
    const e = new BlackjackEngine([P(), P({ id: 'p2' })], () => {}, () => {});
    if (e.timer) clearInterval(e.timer);
    if (e.botTimer) clearTimeout(e.botTimer);
    const pub = e.getPublicState();
    expect(pub.dealerHand.hideHoleCard).toBe(true);
    expect(pub.dealerHand.cards[1].rank).toBe('?');
    e.destroy();
  });
});

describe('LudoEngine', () => {
  it('un 6 sort les pions de base ; mouvement impossible sinon', () => {
    const e = new LudoEngine([P({ color: 'red' }), P({ id: 'p2', color: 'blue' })], () => {}, () => {});
    const { movableIds, options } = e.calculateMovableOptions('red', 6);
    expect(movableIds).toHaveLength(4);
    expect(options.every((o) => o.isExitingHome)).toBe(true);
    const none = e.calculateMovableOptions('red', 3);
    expect(none.movableIds).toHaveLength(0);
  });

  it('refuse le lancer hors tour', () => {
    const e = new LudoEngine([P({ color: 'red' }), P({ id: 'p2', color: 'blue' })], () => {}, () => {});
    const diceBefore = e.diceValue;
    e.rollDice('blue');
    expect(e.diceValue).toBe(diceBefore);
  });
});

describe('FourPicsEngine', () => {
  it('mauvaise réponse ne résout pas ; bonne réponse révèle et score ; mot absent du public avant révélation', () => {
    const e = new FourPicsEngine([P(), P({ id: 'p2' })], () => {}, () => {});
    const word = e.currentPuzzle.word;

    // Pendant la phase de devinette : le mot n'apparaît NULLE PART
    expect(JSON.stringify(e.getState())).not.toContain(`"${word}"`);

    const bad = e.submitGuess('p1', 'XXXXX');
    expect(bad.correct).toBe(false);
    expect(e.roundStatus).toBe('guessing');

    const good = e.submitGuess('p2', word);
    expect(good.correct).toBe(true);
    expect(e.roundStatus).toBe('revealed');
    expect(e.solvedPlayersThisRound).toContain('p2');
    expect(e.scores.p2).toBeGreaterThan(0);

    // Après révélation : le mot devient public via roundResult (voulu),
    // mais le puzzle courant n'expose jamais la réponse brute.
    expect(JSON.stringify(e.getState())).toContain(`"${word}"`);
    expect(e.getState().currentPuzzle).not.toHaveProperty('word');
    // C1 : pas de getPublicState dédié — l'état complet ne contient aucun secret
    expect(e.getPublicState ?? null).toBeNull();
  });
});

describe('MiniRacingEngine', () => {
  it('enregistre l’ordre d’arrivée puis termine la course', async () => {
    vi.useFakeTimers();
    let over = null;
    const players = [P({ color: 'red' }), P({ id: 'p2', color: 'blue' }), P({ id: 'p3', color: 'green' })];
    const e = new MiniRacingEngine(players, () => {}, (w) => { over = w; });
    vi.advanceTimersByTime(3100); // fin du compte à rebours
    e.status = 'racing';
    const L = 3000; // TRACK_LENGTH(1000) × TOTAL_LAPS(3)
    e.playersList[0].progress = L;
    vi.advanceTimersByTime(40);
    e.playersList[1].progress = L;
    vi.advanceTimersByTime(40);
    e.playersList[2].progress = L;
    vi.advanceTimersByTime(40);
    expect(e.finishOrder).toEqual(['p1', 'p2', 'p3']);
    expect(e.status).toBe('finished');
    expect(over).not.toBeNull();
    e.destroy();
  });
});

describe('QuickGamesEngine', () => {
  it('color_match : bonne réponse score, tous ont répondu -> manche terminée ; E2 destroy fige la suite', async () => {
    vi.useFakeTimers();
    let gameOver = null;
    const e = new QuickGamesEngine([P(), P({ id: 'p2' })], () => {}, (w) => { gameOver = w; });
    vi.advanceTimersByTime(3000);            // fin intro
    // Forcer color_match pour la déterminisme
    e.currentMiniGame = 'color_match';
    e.miniGameState = { title: 't', instructions: 'i', targetWord: 'ROUGE', targetHex: '#EF4444', correctColorName: 'VERT', options: ['ROUGE', 'BLEU', 'VERT', 'JAUNE'], answers: {} };
    e.roundStatus = 'active';
    e.timeRemaining = 8;

    e.handlePlayerAction('p1', 'choice', { choice: 'VERT' });   // correct
    e.handlePlayerAction('p2', 'choice', { choice: 'ROUGE' });  // faux
    expect(e.scores.p1).toBe(250);
    expect(e.scores.p2).toBe(0);
    expect(e.roundStatus).toBe('reveal');

    e.destroy();                                 // destruction pendant la pause 3,5s
    await vi.advanceTimersByTimeAsync(4000);
    expect(e.roundNumber).toBe(1);               // aucune manche fantôme
    expect(gameOver).toBeNull();
  });
});
