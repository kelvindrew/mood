import { FourPicsEngine } from './games/fourPicsEngine.js';

async function testFourPics() {
  console.log('=== Starting Test: 4 Images 1 Mot Game Engine ===\n');

  let state = null;
  const engine = new FourPicsEngine(
    [{ id: 'player_1', name: 'Alice', color: 'red', isBot: false }],
    (st) => { state = st; },
    (winner) => { console.log('Four Pics Winner:', winner); }
  );

  console.log('Players in 4 Images 1 Mot:', engine.players.map(p => `${p.name} (${p.isBot ? 'Bot' : 'Human'})`));
  console.log(`Current round: ${state.roundNumber}/${state.totalRounds}`);
  console.log(`Target word to guess: "${engine.currentPuzzle.word}" (Length: ${engine.currentPuzzle.word.length})`);
  console.log(`Scrambled letters pool:`, state.scrambledLetters);

  // 1. Test incorrect submission
  const wrongRes = engine.submitWord('player_1', 'FAUXMOT');
  console.log('Result for incorrect word "FAUXMOT":', wrongRes);
  if (wrongRes.correct) throw new Error('Expected incorrect word to be rejected');

  // 2. Test correct submission
  const targetWord = engine.currentPuzzle.word;
  const correctRes = engine.submitWord('player_1', targetWord);
  console.log(`Result for correct word "${targetWord}":`, correctRes);

  if (!correctRes.correct) throw new Error('Expected correct word to be accepted');
  if (engine.scores['player_1'] <= 0) throw new Error('Expected Alice to receive points');
  if (engine.roundStatus !== 'revealed') throw new Error('Expected roundStatus to be revealed');

  console.log(`✔ Alice successfully solved round 1 and earned ${correctRes.points} points!`);

  engine.destroy();
  console.log('\n🎉 4 IMAGES 1 MOT ENGINE TEST PASSED 100%!');
  process.exit(0);
}

testFourPics().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
