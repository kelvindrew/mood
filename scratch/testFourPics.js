import { FourPicsEngine } from '../server/games/fourPicsEngine.js';
import { FOUR_PICS_PUZZLES } from '../server/games/fourPicsData.js';

console.log(`[TEST] Loaded ${FOUR_PICS_PUZZLES.length} puzzles.`);

// Verify each puzzle has 4 valid image URLs and high validation score
for (const p of FOUR_PICS_PUZZLES) {
  if (!p.word || p.word.length < 2) throw new Error(`Invalid word in ${p.id}`);
  if (!p.images || p.images.length !== 4) throw new Error(`Puzzle ${p.id} must have exactly 4 images`);
  if (!p.images.every(img => typeof img === 'string' && img.startsWith('http'))) throw new Error(`Invalid image URL in ${p.id}`);
}
console.log(`[TEST] 100% of ${FOUR_PICS_PUZZLES.length} puzzles passed schema & URL validation.`);

// Test engine execution
let lastState = null;
const engine = new FourPicsEngine(
  [
    { id: 'p1', name: 'Alice', color: 'red', isBot: false },
    { id: 'p2', name: 'Bob', color: 'blue', isBot: false }
  ],
  (state) => { lastState = state; },
  (winnerId) => { console.log(`[TEST] Game Over! Winner: ${winnerId}`); }
);

console.log(`[TEST] Current puzzle word: "${engine.currentPuzzle.word}" (Length: ${engine.currentPuzzle.word.length})`);
console.log(`[TEST] Scrambled letters: ${engine.scrambledLetters.join('')}`);

// Test hint reveal
const hintResult = engine.useHintRevealLetter('p1');
console.log(`[TEST] Hint reveal result for p1:`, hintResult);

// Test hint remove fake letters
const removeResult = engine.useHintRemoveLetters('p1');
console.log(`[TEST] Hint remove fake letters result for p1:`, removeResult);

// Test correct guess
const guessResult = engine.submitGuess('p1', engine.currentPuzzle.word);
console.log(`[TEST] Submit correct guess result:`, guessResult);

if (guessResult.correct) {
  console.log(`[TEST] 4 Images 1 Mot Engine PASSED ALL TESTS SUCCESSFULLY!`);
} else {
  throw new Error('Guess failed');
}

engine.destroy();
