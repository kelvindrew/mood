import { WordEngine } from '../server/games/wordEngine.js';

async function simulateBots() {
  console.log('=== Simulating 2 Bots Playing Scrabble Until Full Game End ===');
  let moveCount = 0;
  const engine = new WordEngine(
    [
      { id: 'bot_1', name: 'IA Alpha', color: 'red', isBot: true },
      { id: 'bot_2', name: 'IA Beta', color: 'blue', isBot: true },
    ],
    (st) => {},
    (winner, podium) => {}
  );

  // Run up to 100 turns until game over
  for (let turn = 0; turn < 100 && !engine.isGameOver; turn++) {
    const curP = engine.getCurrentPlayer();
    const rackBefore = engine.playerRacks[curP.id]?.map(r => r.letter).join('');
    engine.playBotMove();
    moveCount++;
    if (engine.lastWordPlayed) {
      console.log(`[Turn ${turn + 1}] ${curP.name} played "${engine.lastWordPlayed.word}" (+${engine.lastWordPlayed.points} pts) | Bag: ${engine.letterBag.length} left | Scores: Alpha=${engine.playerScores['bot_1']}, Beta=${engine.playerScores['bot_2']}`);
    }
  }

  console.log(`\n🏁 SIMULATION COMPLETE in ${moveCount} turns!`);
  console.log(`Is Game Over: ${engine.isGameOver}, Reason: ${engine.endGameReason}`);
  console.log(`Winner: ${engine.winnerName} (${engine.winner})`);
  console.log('Final Podium Rankings:', JSON.stringify(engine.finalPodium, null, 2));

  engine.destroy();
}

simulateBots().catch(console.error);
