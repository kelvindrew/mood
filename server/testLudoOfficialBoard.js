import { LudoEngine } from './games/ludoEngine.js';

async function testLudoBoard() {
  console.log('=== Test Ludo Board Match Official Layout ===\n');

  let state = null;
  const engine = new LudoEngine(
    [{ id: 'p1', name: 'Alice', color: 'red', isBot: false }],
    (st) => { state = st; },
    (winner) => { console.log('Winner:', winner); }
  );

  state = engine.getState();
  console.log('Colors and players:', engine.playersList.map(p => `${p.color}: ${p.name}`));
  console.log('Starting color:', state.currentTurnColor);

  // Roll a 6 for Red
  engine.diceValue = 6;
  engine.canRollDice = false;
  const { movableIds, options } = engine.calculateMovableOptions('red', 6);
  engine.movablePawns = movableIds;
  console.log('Red movable pawn IDs with 6:', movableIds);
  console.log('First option (exit to start pos 0):', options[0]);

  if (!movableIds.includes(0)) throw new Error('Expected pawn 0 to be movable with 6');
  if (options[0].targetPosition !== 0) throw new Error('Expected red start position to be 0');

  // Move pawn 0
  engine.movePawn('red', 0);
  console.log('Pawn 0 after exiting home:', engine.pawns.red[0]);
  if (engine.pawns.red[0].position !== 0) throw new Error('Expected position 0');

  // Roll a 4 for Red (moves from 0 to 4)
  engine.diceValue = 4;
  engine.canRollDice = false;
  const moveRes = engine.calculateMovableOptions('red', 4);
  console.log('Red movable pawn with 4:', moveRes.options[0]);
  if (moveRes.options[0].targetPosition !== 4) throw new Error('Expected target position 4');

  engine.destroy();
  console.log('\n🎉 LUDO OFFICIAL BOARD ENGINE TEST PASSED 100%!');
  process.exit(0);
}

testLudoBoard().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
