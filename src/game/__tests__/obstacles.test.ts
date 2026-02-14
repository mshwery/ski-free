import { describe, expect, it } from 'vitest';

import { createObstacleRow, resetObstacleIdsForTests } from '../obstacles';
import { SeededRandom } from '../random';

describe('obstacle generation', () => {
  it('scales obstacle and slalom density with difficulty', () => {
    resetObstacleIdsForTests();
    const easyRandom = new SeededRandom(17);
    const hardRandom = new SeededRandom(17);
    let easyObstacleCount = 0;
    let hardObstacleCount = 0;
    let easyGateCount = 0;
    let hardGateCount = 0;

    for (let index = 0; index < 90; index += 1) {
      const rowY = 1100 + index * 120;
      const easyRow = createObstacleRow(easyRandom, rowY, 900, 0);
      const hardRow = createObstacleRow(hardRandom, rowY, 900, 1);

      easyObstacleCount += easyRow.length;
      hardObstacleCount += hardRow.length;
      easyGateCount += easyRow.filter((obstacle) => obstacle.type.includes('gate')).length;
      hardGateCount += hardRow.filter((obstacle) => obstacle.type.includes('gate')).length;
    }

    expect(hardObstacleCount).toBeGreaterThan(easyObstacleCount);
    expect(hardGateCount).toBeGreaterThan(easyGateCount);
  });
});
