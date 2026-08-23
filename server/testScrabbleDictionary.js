import { isValidScrabbleWord, findPossibleWordsFromRack } from './games/scrabbleDictionary.js';
import { WordEngine } from './games/wordEngine.js';

async function testScrabbleDictionaryAndEngine() {
  console.log('=== Starting Scrabble French Dictionary Validation & Gameplay Test ===');

  // 1. Test official words recognition
  const sampleValidWords = ['CHAT', 'MAISON', 'ARBRE', 'SALONS', 'JEUX', 'VOYAGE', 'AMOUR', 'BLEU', 'EAU', 'ZEBRE'];
  for (const w of sampleValidWords) {
    const valid = isValidScrabbleWord(w);
    if (!valid) throw new Error(`Expected word "${w}" to be valid in Scrabble dictionary!`);
    console.log(`✔ Valid word "${w}" correctly recognized by ODS dictionary.`);
  }

  const sampleInvalidWords = ['XYZQ', 'FOOBAR', 'QWERTY', 'ZZZZ', 'ABCDE', 'KDJF'];
  for (const w of sampleInvalidWords) {
    const valid = isValidScrabbleWord(w);
    if (valid) throw new Error(`Expected word "${w}" to be rejected by Scrabble dictionary!`);
    console.log(`✔ Invalid word "${w}" correctly rejected by ODS dictionary.`);
  }

  // 2. Test WordEngine Gameplay & Validation
  console.log('\n--- 2. Testing WordEngine Gameplay & Validation ---');
  const engine = new WordEngine(
    [{ id: 'player_1', name: 'Alice', color: 'red', isBot: false }],
    () => {},
    () => {}
  );

  const rack = engine.playerRacks['player_1'];
  console.log('Player 1 rack:', rack.map(r => r.letter).join(' '));

  // Case A: Test an invalid word attempt covering center (7, 6..8) with "ZZZ"
  rack[0].letter = 'Z';
  rack[1].letter = 'Z';
  rack[2].letter = 'Z';

  const fakeTiles = [
    { row: 7, col: 6, letter: 'Z', tileId: rack[0].id },
    { row: 7, col: 7, letter: 'Z', tileId: rack[1].id }, // covers center (7,7)
    { row: 7, col: 8, letter: 'Z', tileId: rack[2].id },
  ];

  const resInvalid = engine.playWord('player_1', fakeTiles);
  console.log('Attempt invalid word "ZZZ":', resInvalid);
  if (resInvalid.success || resInvalid.isValid !== false) {
    throw new Error('Invalid word should have been rejected!');
  }
  console.log('✔ Invalid word rejected, player can adjust letters without losing turn!');

  // Case B: Test a valid word attempt covering center (7, 6..8) with "EAU"
  rack[0].letter = 'E';
  rack[1].letter = 'A';
  rack[2].letter = 'U';

  const validTiles = [
    { row: 7, col: 6, letter: 'E', tileId: rack[0].id },
    { row: 7, col: 7, letter: 'A', tileId: rack[1].id }, // covers center (7,7)
    { row: 7, col: 8, letter: 'U', tileId: rack[2].id },
  ];

  const resValid = engine.playWord('player_1', validTiles);
  console.log('Attempt valid word "EAU":', resValid);
  if (!resValid.success || !resValid.isValid || resValid.score <= 0) {
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
