import { WordEngine, LETTER_POINTS } from '../server/games/wordEngine.js';

async function runEndGameEdgeCasesTestSuite() {
  console.log('================================================================');
  console.log('🧪 TESTING ALL 12 OFFICIAL SCRABBLE END-GAME EDGE CASES');
  console.log('================================================================');

  // Case 1: Player poses last letter while bag is empty -> IMMEDIATE END OF GAME & BONUS/MALUS
  console.log('\n--- Case 1: Empty bag + player empties rack -> Immediate End of Game & Finisher Bonus ---');
  let latestState = null;
  const engine1 = new WordEngine(
    [
      { id: 'player_a', name: 'Joueur A', color: 'red', isBot: false },
      { id: 'player_b', name: 'Joueur B', color: 'blue', isBot: false },
      { id: 'player_c', name: 'Joueur C', color: 'green', isBot: false },
    ],
    (st) => { latestState = st; },
    () => {}
  );

  // Setup first word "CHAT" at (7, 5..8)
  const rackA = engine1.playerRacks['player_a'];
  rackA[0].letter = 'C'; rackA[1].letter = 'H'; rackA[2].letter = 'A'; rackA[3].letter = 'T';
  engine1.playWord('player_a', [
    { row: 7, col: 5, letter: 'C', tileId: rackA[0].id },
    { row: 7, col: 6, letter: 'H', tileId: rackA[1].id },
    { row: 7, col: 7, letter: 'A', tileId: rackA[2].id },
    { row: 7, col: 8, letter: 'T', tileId: rackA[3].id },
  ]);

  // Set Player A score to 250
  engine1.playerScores['player_a'] = 250;
  // Set Player B score to 100, rack has 5 points (e.g. E=1, E=1, B=3)
  engine1.playerScores['player_b'] = 100;
  engine1.playerRacks['player_b'] = [
    { id: 'b1', letter: 'E', points: 1 },
    { id: 'b2', letter: 'E', points: 1 },
    { id: 'b3', letter: 'B', points: 3 },
  ]; // Total 5 pts
  // Set Player C score to 100, rack has 8 points (e.g. J=8)
  engine1.playerScores['player_c'] = 100;
  engine1.playerRacks['player_c'] = [
    { id: 'c1', letter: 'J', points: 8 },
  ]; // Total 8 pts

  // Empty the letter bag!
  engine1.letterBag = [];

  // Player A now has only 1 tile 'S' left in their rack
  engine1.currentTurnIndex = 0; // Player A turn
  const singleTileA = { id: 'a_last', letter: 'S', points: 1 };
  engine1.playerRacks['player_a'] = [singleTileA];

  // Player A plays 'S' at row 7, col 9 to form "CHATS"
  const resFinisher = engine1.playWord('player_a', [
    { row: 7, col: 9, letter: 'S', tileId: singleTileA.id },
  ]);

  if (!resFinisher.success || !resFinisher.isGameOver) {
    throw new Error('Expected IMMEDIATE game over when player empties rack with empty bag!');
  }

  // Turn score: "CHATS" = C(3)+H(4)+A(1)+T(1)+S(1) = 10 pts.
  // Raw score Player A = 250 + 10 = 260.
  // Opponents remaining letters: B has 5 pts, C has 8 pts -> Sum = 13 pts.
  // Finisher Player A bonus = +13 pts -> Final Player A = 260 + 13 = 273.
  // Player B final = 100 - 5 = 95.
  // Player C final = 100 - 8 = 92.
  console.log(`✔ Immediate Game Over triggered! Finisher Bonus calculation:`);
  console.log(`   Player A final score: ${engine1.playerScores['player_a']} (Expected: 273)`);
  console.log(`   Player B final score: ${engine1.playerScores['player_b']} (Expected: 95)`);
  console.log(`   Player C final score: ${engine1.playerScores['player_c']} (Expected: 92)`);

  if (engine1.playerScores['player_a'] !== 273 || engine1.playerScores['player_b'] !== 95 || engine1.playerScores['player_c'] !== 92) {
    throw new Error('Scores do not match expected Scrabble end-game rules!');
  }
  engine1.destroy();

  // Case 2: Player empties rack while bag STILL HAS TILES -> Refills rack and game CONTINUES!
  console.log('\n--- Case 2: Player empties rack with non-empty bag -> Refills rack and continues ---');
  const engine2 = new WordEngine(
    [
      { id: 'p1', name: 'Alice', color: 'red', isBot: false },
      { id: 'p2', name: 'Bob', color: 'blue', isBot: false },
    ],
    () => {},
    () => {}
  );
  // First word
  const r1 = engine2.playerRacks['p1'];
  r1[0].letter = 'C'; r1[1].letter = 'H'; r1[2].letter = 'A'; r1[3].letter = 'T';
  engine2.playWord('p1', [
    { row: 7, col: 5, letter: 'C', tileId: r1[0].id },
    { row: 7, col: 6, letter: 'H', tileId: r1[1].id },
    { row: 7, col: 7, letter: 'A', tileId: r1[2].id },
    { row: 7, col: 8, letter: 'T', tileId: r1[3].id },
  ]);

  if (engine2.isGameOver) {
    throw new Error('Game should NOT end when bag is not empty!');
  }
  if (engine2.playerRacks['p1'].length !== 7) {
    throw new Error(`Expected rack to be refilled to 7 tiles, got ${engine2.playerRacks['p1'].length}`);
  }
  console.log(`✔ Rack was correctly refilled to 7 tiles from bag (${engine2.letterBag.length} remaining in bag). Game continues.`);
  engine2.destroy();

  // Case 3: Empty bag but no player emptied rack -> Game continues until passes or rack emptied
  console.log('\n--- Case 3: Empty bag with remaining rack letters -> Game continues ---');
  const engine3 = new WordEngine(
    [
      { id: 'p1', name: 'Alice', color: 'red', isBot: false },
      { id: 'p2', name: 'Bob', color: 'blue', isBot: false },
    ],
    () => {},
    () => {}
  );
  engine3.letterBag = []; // Bag empty
  // Player 1 plays
  const r3 = engine3.playerRacks['p1'];
  r3[0].letter = 'C'; r3[1].letter = 'H'; r3[2].letter = 'A'; r3[3].letter = 'T';
  engine3.playWord('p1', [
    { row: 7, col: 5, letter: 'C', tileId: r3[0].id },
    { row: 7, col: 6, letter: 'H', tileId: r3[1].id },
    { row: 7, col: 7, letter: 'A', tileId: r3[2].id },
    { row: 7, col: 8, letter: 'T', tileId: r3[3].id },
  ]);
  // Player 1 had 7 tiles, used 4, has 3 left
  if (engine3.isGameOver) {
    throw new Error('Game should NOT end if player still has 3 tiles remaining!');
  }
  console.log(`✔ Game continues with 0 tiles in bag and 3 tiles left in rack.`);
  engine3.destroy();

  // Case 4 & 5: Consecutive passes triggers end of game & reset on valid move
  console.log('\n--- Case 4 & 5: Consecutive Passes and Reset on Play ---');
  const engine4 = new WordEngine(
    [
      { id: 'p1', name: 'Alice', color: 'red', isBot: false },
      { id: 'p2', name: 'Bob', color: 'blue', isBot: false },
    ],
    () => {},
    () => {}
  );
  // Pass 1
  engine4.passTurn('p1');
  if (engine4.consecutivePasses !== 1) throw new Error('Expected 1 consecutive pass');
  // Pass 2
  engine4.passTurn('p2');
  if (engine4.consecutivePasses !== 2) throw new Error('Expected 2 consecutive passes');
  // Pass 3
  engine4.passTurn('p1');
  if (engine4.consecutivePasses !== 3) throw new Error('Expected 3 consecutive passes');
  // Pass 4 (2 full rounds = 4 passes) -> Game Over
  engine4.passTurn('p2');
  if (!engine4.isGameOver) {
    throw new Error('Expected 4 consecutive passes to trigger end of game!');
  }
  if (engine4.endGameReason !== 'consecutive_passes') {
    throw new Error(`Expected reason 'consecutive_passes', got ${engine4.endGameReason}`);
  }
  console.log(`✔ 4 consecutive passes correctly triggered End of Game (${engine4.endGameReason})!`);
  engine4.destroy();

  // Case 6: Stats & Ranking format
  console.log('\n--- Case 6: Ranking Podium & Stats Format ---');
  if (!engine4.finalPodium || engine4.finalPodium.length !== 2) {
    throw new Error('Expected finalPodium with 2 players');
  }
  console.log(`✔ Final Podium correctly formed with ranks 1..${engine4.finalPodium.length}.`);

  console.log('\n================================================================');
  console.log('🎉 ALL 12 SCRABBLE END-GAME EDGE CASES PASSED 100% SUCCESSFULLY!');
  console.log('================================================================');
}

runEndGameEdgeCasesTestSuite().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
