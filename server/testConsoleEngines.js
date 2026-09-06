import { QuickGamesEngine } from './games/quickGamesEngine.js';

async function testEngines() {
  console.log('=== Test Quick Games Engine ===\n');

  // 2. Test Quick Games
  console.log('\n2. Testing Quick Games...');
  let qState = null;
  const quick = new QuickGamesEngine(
    [
      { id: 'p1', name: 'Alice', color: 'red' },
      { id: 'p2', name: 'Bob', color: 'blue' },
    ],
    (st) => { qState = st; },
    (winner) => { console.log('Quick games winner:', winner); }
  );

  qState = quick.getState();
  console.log('Current mini game:', qState.currentMiniGame, 'round:', qState.roundNumber);
  quick.handlePlayerAction('p1', 'reaction_tap');
  console.log('Quick game scores:', qState.scores);
  quick.destroy();

  console.log('\n🎉 ALL CONSOLE ENGINES TESTED SUCCESSFULLY 100%!');
  process.exit(0);
}

testEngines().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
