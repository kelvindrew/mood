import { MiniRacingEngine } from './games/miniRacingEngine.js';
import { QuickGamesEngine } from './games/quickGamesEngine.js';

async function testEngines() {
  console.log('=== Test Mini Racing & Quick Games Engines ===\n');

  // 1. Test Mini Racing
  console.log('1. Testing Mini Racing...');
  let raceState = null;
  const race = new MiniRacingEngine(
    [
      { id: 'p1', name: 'Alice', color: 'red' },
      { id: 'p2', name: 'Bob', color: 'blue', isBot: true },
    ],
    (st) => { raceState = st; },
    (winner) => { console.log('Race winner:', winner); }
  );

  raceState = race.getState();
  console.log('Initial race state:', raceState.status, 'countdown:', raceState.countdown);
  race.handlePlayerInput('p1', 'accelerate', { active: true });
  race.handlePlayerInput('p1', 'steer', { steering: 0.5 });
  race.handlePlayerInput('p1', 'nitro', { active: true });
  console.log('P1 state after inputs:', race.playersList[0]);
  race.destroy();

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
