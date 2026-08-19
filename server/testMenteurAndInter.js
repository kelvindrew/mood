import { MenteurEngine } from './games/menteurEngine.js';
import { InterEngine } from './games/interEngine.js';

async function testMenteurAndInter() {
  console.log('=== Starting Test: Menteur & Inter Game Engines ===\n');

  // --- 1. MENTEUR ENGINE TEST ---
  console.log('--- 1. Testing Menteur Bluff Arena ---');
  let menteurState = null;
  const menteur = new MenteurEngine(
    [{ id: 'player_1', name: 'Alice', color: 'red', isBot: false }],
    (st) => { menteurState = st; },
    (winner) => { console.log('Menteur Winner:', winner); }
  );

  console.log('Menteur players:', menteur.players.map(p => `${p.name} (${p.isBot ? 'Bot' : 'Human'})`));
  const aliceCards = menteur.playerHands['player_1'];
  console.log(`Alice received ${aliceCards.length} cards.`);

  // Alice plays 2 cards claiming "A"
  const cardsToPlay = [aliceCards[0].id, aliceCards[1].id];
  const playRes = menteur.playCards('player_1', cardsToPlay, 'A');
  console.log('Alice plays 2 cards with claim "A":', playRes);

  if (!playRes.success) throw new Error('Menteur playCards failed');
  if (menteur.centralPile.length !== 2) throw new Error('Expected 2 cards in central pile');

  // Bot Jarvis calls liar
  const accuseRes = menteur.callLiar('bot_menteur_1');
  console.log('Accusation result from Jarvis:', accuseRes);
  if (!accuseRes.success) throw new Error('Menteur callLiar failed');

  console.log(`✔ Menteur verified: Was lying? ${accuseRes.result.wasLying}. Pile of ${accuseRes.result.pileCountTaken} cards resolved.`);
  menteur.destroy();

  // --- 2. INTER ENGINE TEST ---
  console.log('\n--- 2. Testing Inter Action Arena ---');
  let interState = null;
  const inter = new InterEngine(
    [{ id: 'player_1', name: 'Alice', color: 'red', isBot: false }],
    (st) => { interState = st; },
    (winner) => { console.log('Inter Winner:', winner); }
  );

  console.log('Inter players:', inter.players.map(p => `${p.name} (${p.isBot ? 'Bot' : 'Human'})`));
  console.log(`Starter top card on table: ${inter.topCard.rank} of ${inter.topCard.suit}`);

  // Test special cards mechanics
  // Inject a 2 (+2) into Alice's hand and force match suit
  const hand = inter.playerHands['player_1'];
  hand[0] = { id: 'test_two', suit: inter.currentSuit, rank: '2', value: 2 };

  const playTwoRes = inter.playCard('player_1', 'test_two');
  console.log('Alice plays 2 (+2):', playTwoRes);
  if (!playTwoRes.success) throw new Error('Inter playCard 2 failed');
  if (inter.pendingPenaltyDraws !== 2) throw new Error(`Expected penalty 2, got ${inter.pendingPenaltyDraws}`);

  // Counter with 10 (+4) by next player
  const nextPlayer = inter.getCurrentPlayer();
  const nextHand = inter.playerHands[nextPlayer.id];
  nextHand[0] = { id: 'test_ten', suit: 'hearts', rank: '10', value: 10 };

  const playTenRes = inter.playCard(nextPlayer.id, 'test_ten');
  console.log(`${nextPlayer.name} counters with 10 (+4):`, playTenRes);
  if (!playTenRes.success) throw new Error('Inter counter play failed');
  if (inter.pendingPenaltyDraws !== 6) throw new Error(`Expected stacked penalty 6, got ${inter.pendingPenaltyDraws}`);

  console.log(`✔ Inter verified: Stacked attacks reached +${inter.pendingPenaltyDraws} cards!`);
  inter.destroy();

  console.log('\n🎉 ALL TESTS FOR MENTEUR AND INTER PASSED 100%!');
  process.exit(0);
}

testMenteurAndInter().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
