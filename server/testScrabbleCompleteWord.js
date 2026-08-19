import { WordEngine } from './games/wordEngine.js';

async function testCompleteWordReconstruction() {
  console.log('=== Starting Test: Scrabble Complete Word Reconstruction on Board ===');

  let state = null;
  const engine = new WordEngine(
    [{ id: 'player_1', name: 'Alice', color: 'red', isBot: false }],
    (st) => { state = st; },
    (winner) => { console.log('Game Over! Winner:', winner); }
  );

  // Board has "SALON" at row 7, col 5 to 9
  console.log('Initial starter word on board: "SALON" at row 7, cols 5..9');

  const rack = engine.playerRacks['player_1'];
  rack[0].letter = 'S'; // Player has letter 'S'

  // Test 1: Extend "SALON" by placing 'S' at row 7, col 10 to form "SALONS"
  const tileToPlace = [{
    row: 7,
    col: 10,
    letter: 'S',
    tileId: rack[0].id,
  }];

  const res = engine.playWord('player_1', tileToPlace);
  console.log('Result of playing single "S" at row 7 col 10:', res);

  if (!res.success || !res.isValid) {
    throw new Error('Expected "SALONS" to be reconstructed as complete word and accepted!');
  }
  if (res.word !== 'SALONS') {
    throw new Error(`Expected word formed to be "SALONS", got "${res.word}"`);
  }

  console.log(`✔ SUCCESS: Single tile "S" successfully connected to "SALON" to form complete word "${res.word}" (+${res.score} pts)!`);

  engine.destroy();
  console.log('\n🎉 COMPLETE WORD RECONSTRUCTION TEST PASSED 100%!');
  process.exit(0);
}

testCompleteWordReconstruction().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
