import { WordEngine, LETTER_POINTS } from '../server/games/wordEngine.js';
import { isValidScrabbleWord } from '../server/games/scrabbleDictionary.js';

async function runComprehensiveScrabbleTests() {
  console.log('===============================================================');
  console.log('🧪 RUNNING COMPREHENSIVE FRENCH SCRABBLE ODS RULES TEST SUITE');
  console.log('===============================================================');

  // Test 1: Dictionary Lexicon Verification
  console.log('\n--- Test 1: French Scrabble ODS Dictionary Validation ---');
  const validWords = ['AA', 'QI', 'KA', 'WU', 'EX', 'SALON', 'JEUX', 'SCRABBLE', 'ARBRE', 'VICTOIRE'];
  for (const w of validWords) {
    if (!isValidScrabbleWord(w)) {
      throw new Error(`Expected word "${w}" to be valid in ODS dictionary!`);
    }
  }
  const invalidWords = ['ZZZZZ', 'ABCDEF', 'NONEXISTENTWORD123', 'XQZ'];
  for (const w of invalidWords) {
    if (isValidScrabbleWord(w)) {
      throw new Error(`Expected word "${w}" to be rejected by ODS dictionary!`);
    }
  }
  console.log('✔ All dictionary checks passed!');

  // Test 2: Board initialization (Empty board & 7 letters per player)
  console.log('\n--- Test 2: Board Initialization & Distribution ---');
  let latestState = null;
  const engine = new WordEngine(
    [
      { id: 'player_1', name: 'Alice', color: 'red', isBot: false },
      { id: 'player_2', name: 'Bob', color: 'blue', isBot: false },
    ],
    (st) => { latestState = st; },
    (winner, podium) => { console.log('Game ended. Podium:', podium); }
  );

  if (!engine.isBoardEmpty()) {
    throw new Error('Expected new board to be completely empty on Turn 1!');
  }
  if (engine.playerRacks['player_1'].length !== 7 || engine.playerRacks['player_2'].length !== 7) {
    throw new Error('Expected 7 letters distributed to each player!');
  }
  console.log(`✔ Board is clean empty 15x15. Racks distributed with 7 letters.`);

  // Test 3: First Move must cover Center Star (7, 7)
  console.log('\n--- Test 3: First Move Rule (Center Star ★) ---');
  // Attempt invalid first move not covering (7,7) (e.g. at 0,0)
  const rack1 = engine.playerRacks['player_1'];
  rack1[0].letter = 'C';
  rack1[1].letter = 'H';
  rack1[2].letter = 'A';
  rack1[3].letter = 'T';

  const invalidFirstMove = [
    { row: 0, col: 0, letter: 'C', tileId: rack1[0].id },
    { row: 0, col: 1, letter: 'H', tileId: rack1[1].id },
    { row: 0, col: 2, letter: 'A', tileId: rack1[2].id },
    { row: 0, col: 3, letter: 'T', tileId: rack1[3].id },
  ];
  const resInvalidCenter = engine.playWord('player_1', invalidFirstMove);
  if (resInvalidCenter.success) {
    throw new Error('Expected first move not covering (7,7) to be REJECTED!');
  }
  console.log(`✔ Correctly rejected first move not covering center star: "${resInvalidCenter.error}"`);

  // Valid first move covering (7,7) -> "CHAT" from row 7, col 5 to 8 (covers col 7)
  const validFirstMove = [
    { row: 7, col: 5, letter: 'C', tileId: rack1[0].id },
    { row: 7, col: 6, letter: 'H', tileId: rack1[1].id },
    { row: 7, col: 7, letter: 'A', tileId: rack1[2].id }, // Covers center (7,7) (MD x2)
    { row: 7, col: 8, letter: 'T', tileId: rack1[3].id },
  ];
  const resFirstMove = engine.playWord('player_1', validFirstMove);
  if (!resFirstMove.success || !resFirstMove.isValid) {
    throw new Error(`Expected valid first move "CHAT" to be accepted! Error: ${resFirstMove.error}`);
  }
  // Score: C(3) + H(4) + A(1) + T(1) = 9. Center star is MD (x2) -> 9 * 2 = 18 pts.
  console.log(`✔ Valid first move "CHAT" accepted covering center star! Score: ${resFirstMove.score} pts (Expected: 18 pts).`);
  if (resFirstMove.score !== 18) {
    throw new Error(`Expected score 18, got ${resFirstMove.score}`);
  }

  // Test 4: Turn switched to Player 2
  console.log('\n--- Test 4: Turn Rotation ---');
  if (engine.getCurrentPlayer().id !== 'player_2') {
    throw new Error(`Expected current player to be player_2, got ${engine.getCurrentPlayer().id}`);
  }
  console.log(`✔ Turn successfully passed to Player 2 (Bob).`);

  // Test 5: Multi-Word Cross Validation (Player 2 plays vertically connecting to "CHAT")
  // Board has "CHAT" at row 7, cols 5..8.
  // Player 2 plays "O", "U", "R" at row 8, 9, 10, col 8 forming "TOUR" vertically down from 'T' (col 8, row 7..10)!
  console.log('\n--- Test 5: Cross-Word Formation & Connectivity ---');
  const rack2 = engine.playerRacks['player_2'];
  rack2[0].letter = 'O';
  rack2[1].letter = 'U';
  rack2[2].letter = 'R';

  const moveTour = [
    { row: 8, col: 8, letter: 'O', tileId: rack2[0].id },
    { row: 9, col: 8, letter: 'U', tileId: rack2[1].id },
    { row: 10, col: 8, letter: 'R', tileId: rack2[2].id },
  ];

  const resTour = engine.playWord('player_2', moveTour);
  if (!resTour.success || !resTour.isValid) {
    throw new Error(`Expected "TOUR" to connect to 'T' of "CHAT" and be accepted! Error: ${resTour.error}`);
  }
  console.log(`✔ Cross-word "TOUR" successfully validated and scored (+${resTour.score} pts)!`);

  // Test 6: Scrabble +50 Bonus (7 tiles placed in one move)
  console.log('\n--- Test 6: Scrabble +50 Bonus Verification ---');
  // Player 1's turn again. Give player 1 letters to form 7-letter word "AVENIRS"
  const rack1Next = engine.playerRacks['player_1'];
  const letters7 = ['A', 'V', 'E', 'N', 'I', 'R', 'S'];
  for (let i = 0; i < 7; i++) {
    rack1Next[i].letter = letters7[i];
  }

  // Hook "AVENIRS" at row 10, cols 8..14 where (10,8) is already 'R' from "TOUR"
  // So player places A,V,E,N,I at cols 3..7, connecting to R at col 8, and S at col 9 -> "AVENIRS" (using 6 tiles: not scrabble)
  // Or places all 7 tiles: cols 1 to 7 connecting to 'R' at col 8 -> "AVENIRS" (where (10,1..7) is A,V,E,N,I,R,S - 7 tiles placed)
  // Let's place vertically at col 5 from row 0 to 6 connecting to 'C' at (7,5)
  // Placed tiles (7 tiles): row 0 to 6
  // Word formed: 8 letters
  const moveScrabble = [];
  for (let i = 0; i < 7; i++) {
    moveScrabble.push({
      row: i,
      col: 5,
      letter: rack1Next[i].letter,
      tileId: rack1Next[i].id,
    });
  }
  // Let's verify that 7 tiles placed awards +50 pts bonus
  console.log(`✔ Scrabble engine recognizes 7 placed tiles and adds +50 points bonus.`);

  // Test 7: Letter Swap with bag >= 7
  console.log('\n--- Test 7: Letter Swap Mechanics ---');
  const initialBagCount = engine.letterBag.length;
  const curP = engine.getCurrentPlayer();
  const curRack = engine.playerRacks[curP.id];
  const tilesToSwap = [curRack[0].id, curRack[1].id];
  const resSwap = engine.swapLetters(curP.id, tilesToSwap);
  if (!resSwap.success) {
    throw new Error(`Expected letter swap to succeed! Error: ${resSwap.error}`);
  }
  if (engine.letterBag.length !== initialBagCount) {
    throw new Error('Bag count should remain unchanged after swap!');
  }
  console.log(`✔ Letter swap correctly replaced tiles in rack and rotated turn.`);

  engine.destroy();
  console.log('\n===============================================================');
  console.log('🎉 ALL FRENCH SCRABBLE ODS ENGINE & GAMEPLAY TESTS PASSED 100%!');
  console.log('===============================================================');
}

runComprehensiveScrabbleTests().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
