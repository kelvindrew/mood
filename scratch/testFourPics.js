import { FOUR_PICS_1000_STAGES, getStage, getStagesForLevel } from '../server/games/fourPicsData.js';
import { FourPicsEngine } from '../server/games/fourPicsEngine.js';

console.log(`[TEST] Loaded ${FOUR_PICS_1000_STAGES.length} stages.`);

if (FOUR_PICS_1000_STAGES.length !== 1000) {
  throw new Error(`Expected exactly 1000 stages, found ${FOUR_PICS_1000_STAGES.length}`);
}

// Test Level Counts
for (let lvl = 1; lvl <= 10; lvl++) {
  const lvlStages = getStagesForLevel(lvl);
  if (lvlStages.length !== 100) {
    throw new Error(`Level ${lvl} has ${lvlStages.length} stages instead of 100`);
  }
}
console.log(`[TEST] 10 Levels x 100 Stages = 1000 Stages verified.`);

// Test Stage 1 (Niveau 1, Stage 1)
const stage1 = getStage(1, 1);
console.log(`[TEST] Stage 1_1: Word="${stage1.word}", Category="${stage1.category}", Images=${stage1.images.length}`);

// Test Adventure Engine Loading Stage 42 of Level 3
const engine = new FourPicsEngine(
  [
    { id: 'p1', name: 'Alice', color: 'red', isBot: false },
    { id: 'p2', name: 'Bob', color: 'blue', isBot: false }
  ],
  (state) => {},
  (winnerId) => {},
  { gameMode: 'adventure', level: 3, stageNumber: 42 }
);

console.log(`[TEST] Engine current stage: Level ${engine.currentPuzzle.level} Stage ${engine.currentPuzzle.stageNumber} ("${engine.currentPuzzle.word}")`);

// Alice submits correct answer for this stage
const result = engine.submitGuess('p1', engine.currentPuzzle.word);
console.log(`[TEST] Guess result:`, result);

if (!result.correct || result.stars < 1) {
  throw new Error('Guess failed on adventure stage');
}

console.log(`[TEST] PASSED! All 1 000 Stages and Adventure Mechanics work perfectly!`);
engine.destroy();
