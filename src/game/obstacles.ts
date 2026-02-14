import {
  OBSTACLE_DENSITY_MAX,
  OBSTACLE_DENSITY_MIN,
  ROCK_SIZE_MAX,
  ROCK_SIZE_MIN,
  SLALOM_GAP_MAX,
  SLALOM_GAP_MIN,
  SLALOM_POLE_SIZE,
  SLALOM_ROW_CHANCE_MAX,
  SLALOM_ROW_CHANCE_MIN,
  START_SAFE_ZONE_HALF_WIDTH,
  START_SAFE_ZONE_Y,
  TREE_CHANCE,
  TREE_SIZE_MAX,
  TREE_SIZE_MIN,
} from './constants';
import type { SeededRandom } from './random';
import type { Obstacle } from './types';

let obstacleId = 1;

const lerp = (start: number, end: number, amount: number): number =>
  start + (end - start) * Math.max(0, Math.min(amount, 1));

const pickObstacleShape = (random: SeededRandom): Pick<Obstacle, 'type' | 'size' | 'radius'> => {
  if (random.next() <= TREE_CHANCE) {
    const size = random.range(TREE_SIZE_MIN, TREE_SIZE_MAX);
    return { type: 'tree', size, radius: size * 0.34 };
  }

  const size = random.range(ROCK_SIZE_MIN, ROCK_SIZE_MAX);
  return { type: 'rock', size, radius: size * 0.4 };
};

const createSlalomGate = (
  random: SeededRandom,
  rowY: number,
  rowHalfWidth: number,
  difficulty: number,
): { poles: Obstacle[]; gateCenter: number; gateGap: number } | null => {
  const gateGap = lerp(SLALOM_GAP_MAX, SLALOM_GAP_MIN, difficulty);
  const horizontalPadding = gateGap / 2 + 45;
  const centerLimit = Math.max(horizontalPadding + 20, rowHalfWidth - horizontalPadding);
  const gateCenter = random.range(-centerLimit, centerLimit);

  if (
    rowY < START_SAFE_ZONE_Y &&
    Math.abs(gateCenter) < START_SAFE_ZONE_HALF_WIDTH + gateGap * 0.5 + 10
  ) {
    return null;
  }

  const poleYOffset = random.range(-8, 8);
  const leftPoleX = gateCenter - gateGap / 2;
  const rightPoleX = gateCenter + gateGap / 2;
  const poleRadius = SLALOM_POLE_SIZE * 0.34;
  const poleY = rowY + poleYOffset;

  const poles: Obstacle[] = [
    {
      id: obstacleId,
      type: 'gateLeft',
      size: SLALOM_POLE_SIZE,
      radius: poleRadius,
      position: { x: leftPoleX, y: poleY },
    },
    {
      id: obstacleId + 1,
      type: 'gateRight',
      size: SLALOM_POLE_SIZE,
      radius: poleRadius,
      position: { x: rightPoleX, y: poleY },
    },
  ];
  obstacleId += 2;

  return { poles, gateCenter, gateGap };
};

export const createObstacleRow = (
  random: SeededRandom,
  rowY: number,
  viewportWidth: number,
  difficulty: number,
): Obstacle[] => {
  const rowHalfWidth = Math.max(420, viewportWidth * 0.95);
  const slots = Math.max(7, Math.round((rowHalfWidth * 2) / 110));
  const slotWidth = (rowHalfWidth * 2) / slots;
  const obstacles: Obstacle[] = [];
  const obstacleDensity = lerp(OBSTACLE_DENSITY_MIN, OBSTACLE_DENSITY_MAX, difficulty);
  const gateChance = lerp(SLALOM_ROW_CHANCE_MIN, SLALOM_ROW_CHANCE_MAX, difficulty);
  const slalomGate = random.next() <= gateChance
    ? createSlalomGate(random, rowY, rowHalfWidth, difficulty)
    : null;

  if (slalomGate) {
    obstacles.push(...slalomGate.poles);
  }

  for (let index = 0; index < slots; index += 1) {
    if (random.next() > obstacleDensity) {
      continue;
    }

    const slotCenter = -rowHalfWidth + slotWidth * index + slotWidth / 2;
    const jitter = random.range(-slotWidth * 0.35, slotWidth * 0.35);
    const x = slotCenter + jitter;

    if (rowY < START_SAFE_ZONE_Y && Math.abs(x) < START_SAFE_ZONE_HALF_WIDTH) {
      continue;
    }

    if (slalomGate && Math.abs(x - slalomGate.gateCenter) < slalomGate.gateGap * 0.72) {
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
