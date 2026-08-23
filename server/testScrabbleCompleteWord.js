import { WordEngine } from './games/wordEngine.js';

async function testCompleteWordReconstruction() {
  console.log('=== Starting Test: Scrabble Complete Word Reconstruction on Board ===');

  let state = null;
  const engine = new WordEngine(
    [{ id: 'player_1', name: 'Alice', color: 'red', isBot: false }],
    (st) => { state = st; },
    (winner) => { console.log('Game Over! Winner:', winner); }
  );

  // Play first move "SALON" across center (7, 5..9)
  const rack = engine.playerRacks['player_1'];
  const salonLetters = ['S', 'A', 'L', 'O', 'N'];
  for (let i = 0; i < 5; i++) {
    rack[i].letter = salonLetters[i];
  }

  const salonMove = [
    { row: 7, col: 5, letter: 'S', tileId: rack[0].id },
    { row: 7, col: 6, letter: 'A', tileId: rack[1].id },
    { row: 7, col: 7, letter: 'L', tileId: rack[2].id }, // Center star ★
    { row: 7, col: 8, letter: 'O', tileId: rack[3].id },
    { row: 7, col: 9, letter: 'N', tileId: rack[4].id },
  ];

  const res1 = engine.playWord('player_1', salonMove);
  console.log('First move "SALON":', res1);
  if (!res1.success || !res1.isValid) {
    throw new Error(`Failed to play initial word "SALON": ${res1.error}`);
  }

  // Next turn (or bot turn): Player 1 gets letter 'S' to extend to "SALONS"
  // If bot is current player, let's switch to player 1
  engine.currentTurnIndex = 0;
  const rackNext = engine.playerRacks['player_1'];
  rackNext[0].letter = 'S';

  // Test: Extend "SALON" by placing 'S' at row 7, col 10 to form "SALONS"
  const tileToPlace = [{
    row: 7,
    col: 10,
    letter: 'S',
    tileId: rackNext[0].id,
  }];

  const res2 = engine.playWord('player_1', tileToPlace);
  console.log('Result of playing single "S" at row 7 col 10:', res2);

  if (!res2.success || !res2.isValid) {
    throw new Error(`Expected "SALONS" to be reconstructed as complete word and accepted! Error: ${res2.error}`);
  }
  if (res2.word !== 'SALONS') {
    throw new Error(`Expected word formed to be "SALONS", got "${res2.word}"`);
  }

  console.log(`✔ SUCCESS: Single tile "S" successfully connected to "SALON" to form complete word "${res2.word}" (+${res2.score} pts)!`);

  engine.destroy();
  console.log('\n🎉 COMPLETE WORD RECONSTRUCTION TEST PASSED 100%!');
  process.exit(0);
}

testCompleteWordReconstruction().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
