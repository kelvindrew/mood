import { io } from 'socket.io-client';

async function testReconnectionReliability() {
  console.log('=== Starting Controller Reconnection & Action Resilience Test ===');
  const serverUrl = 'http://localhost:3001';

  const tv = io(serverUrl);
  await new Promise(r => tv.on('connect', r));

  const roomRes = await new Promise(r => tv.emit('create_room', { gameId: 'ludo' }, r));
  const code = roomRes.room.code;
  console.log('✔ Room created:', code);

  // Phone 1 connects & joins
  const phone1 = io(serverUrl);
  await new Promise(r => phone1.on('connect', r));
  const joinRes = await new Promise(r => phone1.emit('join_room', { code, playerData: { name: 'Player One', color: 'red' } }, r));
  const playerId = joinRes.player.id;
  console.log('✔ Phone 1 joined, Player ID:', playerId);

  // Start game
  await new Promise(r => tv.emit('start_game', { code }, r));
  console.log('✔ Game started');

  // Simulate network disconnection
  phone1.disconnect();
  console.log('✔ Phone 1 disconnected (simulated network switch / sleep mode)');

  await new Promise(r => setTimeout(r, 400));

  // Phone 1 reconnects with a completely new Socket ID
  const phone1Reconnected = io(serverUrl);
  await new Promise(r => phone1Reconnected.on('connect', r));
  console.log('✔ Phone 1 reconnected with new socket ID:', phone1Reconnected.id);

  // Send reconnect handshake
  phone1Reconnected.emit('reconnect_player', { code, playerId, playerData: joinRes.player });
  await new Promise(r => setTimeout(r, 200));

  // Send a game action with playerId
  phone1Reconnected.emit('game_action', {
    code,
    action: 'ludo_roll_dice',
    payload: { playerId },
  });

  const updatedState = await new Promise(r => tv.once('game_state_update', r));
  console.log('✔ Action successfully executed by reconnected controller! Dice value:', updatedState.diceValue);

  tv.disconnect();
  phone1Reconnected.disconnect();

  console.log('\n🎉 CONTROLLER RECONNECTION & ACTION PERSISTENCE VERIFIED 100% SUCCESSFUL!');
  process.exit(0);
}

testReconnectionReliability().catch(err => {
  console.error('Reconnect test failed:', err);
  process.exit(1);
});
