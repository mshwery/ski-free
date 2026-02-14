import {
  OBSTACLE_DENSITY,
  ROCK_SIZE_MAX,
  ROCK_SIZE_MIN,
  START_SAFE_ZONE_HALF_WIDTH,
  START_SAFE_ZONE_Y,
  TREE_CHANCE,
  TREE_SIZE_MAX,
  TREE_SIZE_MIN,
} from './constants';
import type { SeededRandom } from './random';
import type { Obstacle } from './types';

let obstacleId = 1;

const pickObstacleShape = (random: SeededRandom): Pick<Obstacle, 'type' | 'size' | 'radius'> => {
  if (random.next() <= TREE_CHANCE) {
    const size = random.range(TREE_SIZE_MIN, TREE_SIZE_MAX);
    return { type: 'tree', size, radius: size * 0.34 };
  }

  const size = random.range(ROCK_SIZE_MIN, ROCK_SIZE_MAX);
  return { type: 'rock', size, radius: size * 0.4 };
};

export const createObstacleRow = (
  random: SeededRandom,
  rowY: number,
  viewportWidth: number,
): Obstacle[] => {
  const rowHalfWidth = Math.max(420, viewportWidth * 0.95);
  const slots = Math.max(6, Math.round((rowHalfWidth * 2) / 120));
  const slotWidth = (rowHalfWidth * 2) / slots;
  const obstacles: Obstacle[] = [];

  for (let index = 0; index < slots; index += 1) {
    if (random.next() > OBSTACLE_DENSITY) {
      continue;
    }

    const slotCenter = -rowHalfWidth + slotWidth * index + slotWidth / 2;
    const jitter = random.range(-slotWidth * 0.35, slotWidth * 0.35);
    const x = slotCenter + jitter;

    if (rowY < START_SAFE_ZONE_Y && Math.abs(x) < START_SAFE_ZONE_HALF_WIDTH) {
      continue;
    }

    obstacles.push({
      id: obstacleId,
      ...pickObstacleShape(random),
      position: { x, y: rowY + random.range(-25, 25) },
    });
    obstacleId += 1;
  }

  return obstacles;
};

export const resetObstacleIdsForTests = (): void => {
  obstacleId = 1;
};
