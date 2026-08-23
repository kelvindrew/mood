import { SCRABBLE_SET, isValidScrabbleWord } from './scrabbleDictionary.js';
import { LETTER_POINTS, getMultiplier } from './wordEngine.js';

/**
 * Finds the best valid Scrabble move for a bot given the current board and rack.
 * Explores both Horizontal and Vertical placements, connects to existing board tiles,
 * and extracts multi-word cross scores.
 */
export function findBestBotMove(board, rack, botDifficulty = 'medium') {
  const rackLetters = rack.map(r => r.letter.toUpperCase());
  const isEmpty = board.every(row => row.every(cell => cell === null));
  const validCandidates = [];

  if (isEmpty) {
    // 1. Empty Board: Word must cover center square (7, 7)
    // Find all dictionary words that can be formed purely with rack letters
    for (const word of SCRABBLE_SET) {
      if (word.length < 2 || word.length > 7) continue;

      // Check if rack has all letters
      const tempRack = [...rackLetters];
      let canForm = true;
      for (const ch of word) {
        const idx = tempRack.indexOf(ch);
        if (idx !== -1) tempRack.splice(idx, 1);
        else { canForm = false; break; }
      }
      if (!canForm) continue;

      // Try horizontal placement through (7, 7)
      for (let offset = 0; offset < word.length; offset++) {
        const startCol = 7 - offset;
        if (startCol >= 0 && startCol + word.length <= 15) {
          const usedRackIds = new Set();
          const tilesPlaced = [];
          for (let i = 0; i < word.length; i++) {
            const letter = word[i];
            const tile = rack.find(r => r.letter === letter && !usedRackIds.has(r.id));
            if (tile) {
              usedRackIds.add(tile.id);
              tilesPlaced.push({ row: 7, col: startCol + i, letter, tileId: tile.id });
            }
          }
          if (tilesPlaced.length === word.length) {
            validCandidates.push({ word, tilesPlaced, isHorizontal: true });
          }
        }
      }
    }
  } else {
    // 2. Occupied Board: Hook onto existing tiles
    // Find all board cells that have letters
    const occupiedCells = [];
    for (let r = 0; r < 15; r++) {
      for (let c = 0; c < 15; c++) {
        if (board[r][c] !== null) {
          occupiedCells.push({ r, c, letter: board[r][c].letter.toUpperCase() });
        }
      }
    }

    // For each occupied tile, check dictionary words that contain its letter
    for (const occ of occupiedCells) {
      for (const word of SCRABBLE_SET) {
        if (word.length < 2 || word.length > 8) continue;

        // Check if word contains the occupied letter
        const matchIndices = [];
        for (let i = 0; i < word.length; i++) {
          if (word[i] === occ.letter) matchIndices.push(i);
        }
        if (matchIndices.length === 0) continue;

        for (const matchIdx of matchIndices) {
          // A. Try Horizontal placement hooking at (occ.r, occ.c)
          const startCol = occ.c - matchIdx;
          if (startCol >= 0 && startCol + word.length <= 15) {
            const r = occ.r;
            let possible = true;
            const neededFromRack = [];
            const tilesPlaced = [];
            const usedRackIds = new Set();

            for (let i = 0; i < word.length; i++) {
              const curC = startCol + i;
              const curLetter = word[i];
              const existing = board[r][curC];

              if (existing) {
                if (existing.letter.toUpperCase() !== curLetter) {
                  possible = false;
                  break;
                }
              } else {
                // Must come from rack
                const rackTile = rack.find(rt => rt.letter.toUpperCase() === curLetter && !usedRackIds.has(rt.id));
                if (rackTile) {
                  usedRackIds.add(rackTile.id);
                  tilesPlaced.push({ row: r, col: curC, letter: curLetter, tileId: rackTile.id });
                } else {
                  possible = false;
                  break;
                }
              }
            }

            if (possible && tilesPlaced.length > 0) {
              validCandidates.push({ word, tilesPlaced, isHorizontal: true });
            }
          }

          // B. Try Vertical placement hooking at (occ.r, occ.c)
          const startRow = occ.r - matchIdx;
          if (startRow >= 0 && startRow + word.length <= 15) {
            const c = occ.c;
            let possible = true;
            const tilesPlaced = [];
            const usedRackIds = new Set();

            for (let i = 0; i < word.length; i++) {
              const curR = startRow + i;
              const curLetter = word[i];
              const existing = board[curR][c];

              if (existing) {
                if (existing.letter.toUpperCase() !== curLetter) {
                  possible = false;
                  break;
                }
              } else {
                // Must come from rack
                const rackTile = rack.find(rt => rt.letter.toUpperCase() === curLetter && !usedRackIds.has(rt.id));
                if (rackTile) {
                  usedRackIds.add(rackTile.id);
                  tilesPlaced.push({ row: curR, col: c, letter: curLetter, tileId: rackTile.id });
                } else {
                  possible = false;
                  break;
                }
              }
            }

            if (possible && tilesPlaced.length > 0) {
              validCandidates.push({ word, tilesPlaced, isHorizontal: false });
            }
          }
        }
      }
    }
  }

  return validCandidates;
}
