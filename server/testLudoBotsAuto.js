import { io } from 'socket.io-client';

async function testLudoBotAutoPlay() {
  console.log('=== Starting Full Ludo Auto-Bot Multi-Turn Test ===');
  const serverUrl = 'http://localhost:3001';

  const tv = io(serverUrl);
  const phone = io(serverUrl);

  await Promise.all([
    new Promise(r => tv.on('connect', r)),
    new Promise(r => phone.on('connect', r)),
  ]);

  const roomRes = await new Promise(r => tv.emit('create_room', { gameId: 'ludo' }, r));
  const code = roomRes.room.code;
  console.log('✔ Ludo room created:', code);

  // Phone joins as Red
  await new Promise(r => phone.emit('join_room', { code, playerData: { name: 'Player Red', color: 'red' } }, r));
  console.log('✔ Player Red joined');

  // Start game directly (Engine will auto-fill remaining 3 colors with Bots)
  await new Promise(r => tv.emit('start_game', { code }, r));
  console.log('✔ Ludo started! Checking active players...');

  let botTurnCount = 0;
  const turnsPromise = new Promise((resolve) => {
    tv.on('game_state_update', (st) => {
      console.log(`[State Update] Turn: ${st.currentTurnColor} | Dice: ${st.diceValue} | Log: ${st.lastActionLog}`);
      if (['blue', 'green', 'yellow'].includes(st.currentTurnColor)) {
        botTurnCount++;
      }
      if (botTurnCount >= 3) {
        resolve();
      }
    });
  });

  // Human player Red rolls dice
  phone.emit('game_action', { code, action: 'ludo_roll_dice' });
  console.log('✔ Human Red rolled dice. Waiting for Bots (Blue, Green, Yellow) to play autonomously...');

  await turnsPromise;

  tv.disconnect();
  phone.disconnect();

  console.log('\n🎉 ALL AI BOTS PLAYED THEIR TURNS AUTONOMOUSLY AND SEAMLESSLY!');
  process.exit(0);
}

testLudoBotAutoPlay().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
