import { isValidScrabbleWord, findPossibleWordsFromRack } from './games/scrabbleDictionary.js';
import { WordEngine } from './games/wordEngine.js';

async function testScrabbleDictionaryAndEngine() {
  console.log('=== Starting Scrabble French Dictionary Validation & Gameplay Test ===');

  // 1. Test Dictionary Lookups
  const validWords = ['CHAT', 'MAISON', 'ARBRE', 'SALONS', 'JEUX', 'VOYAGE', 'AMOUR', 'BLEU', 'EAU', 'ZEBRE'];
  const invalidWords = ['XYZQ', 'FOOBAR', 'QWERTY', 'ZZZZ', 'ABCDE', 'KDJF'];

  for (const w of validWords) {
    const valid = isValidScrabbleWord(w);
    if (!valid) throw new Error(`Expected word "${w}" to be valid in Scrabble dictionary!`);
    console.log(`✔ Valid word "${w}" correctly recognized by ODS dictionary.`);
  }

  for (const w of invalidWords) {
    const valid = isValidScrabbleWord(w);
    if (valid) throw new Error(`Expected word "${w}" to be rejected!`);
    console.log(`✔ Invalid word "${w}" correctly rejected by ODS dictionary.`);
  }

  // 2. Test WordEngine with Valid Word vs Invalid Word
  console.log('\n--- 2. Testing WordEngine Gameplay & Turn Penalties ---');
  let state = null;
  const engine = new WordEngine(
    [{ id: 'player_1', name: 'Alice', color: 'red', isBot: false }],
    (st) => { state = st; },
    (winner) => { console.log('Game Over! Winner:', winner); }
  );

  const rack = engine.playerRacks['player_1'];
  console.log('Player 1 rack:', rack.map(r => r.letter).join(' '));

  // Case A: Test an invalid word attempt
  const fakeTiles = [
    { row: 7, col: 0, letter: 'Z', tileId: rack[0].id },
    { row: 7, col: 1, letter: 'Z', tileId: rack[1].id },
    { row: 7, col: 2, letter: 'Z', tileId: rack[2].id },
  ];
  // Force letter values for test
  rack[0].letter = 'Z';
  rack[1].letter = 'Z';
  rack[2].letter = 'Z';

  const resInvalid = engine.playWord('player_1', fakeTiles);
  console.log('Attempt invalid word "ZZZ":', resInvalid);
  if (resInvalid.isValid !== false || resInvalid.score !== 0) {
    throw new Error('Invalid word should have been rejected with 0 points!');
  }
  console.log('✔ Invalid word rejected, 0 points awarded, turn passed to next player!');

  // Case B: Test a valid word attempt
  rack[0].letter = 'E';
  rack[1].letter = 'A';
  rack[2].letter = 'U';

  const validTiles = [
    { row: 8, col: 5, letter: 'E', tileId: rack[0].id },
    { row: 8, col: 6, letter: 'A', tileId: rack[1].id },
    { row: 8, col: 7, letter: 'U', tileId: rack[2].id },
  ];

  // Set turn back to player 1
  engine.currentTurnIndex = 0;
  const resValid = engine.playWord('player_1', validTiles);
  console.log('Attempt valid word "EAU":', resValid);
  if (!resValid.isValid || resValid.score <= 0) {
    throw new Error('Valid word should have been accepted with points!');
  }
  console.log(`✔ Valid word "EAU" accepted! Points scored: ${resValid.score}`);

  engine.destroy();
  console.log('\n🎉 SCRABBLE DICTIONARY VALIDATION IS 100% OPERATIONAL!');
  process.exit(0);
}

testScrabbleDictionaryAndEngine().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
