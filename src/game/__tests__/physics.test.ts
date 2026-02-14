import { describe, expect, it } from 'vitest';

import { circleOverlap, momentumToDirection, movementFromMomentum } from '../physics';

describe('physics', () => {
  it('maps momentum into bounded direction indices', () => {
    expect(momentumToDirection(-9)).toBe(-2);
    expect(momentumToDirection(-1.1)).toBe(-1);
    expect(momentumToDirection(0)).toBe(0);
    expect(momentumToDirection(1.2)).toBe(1);
    expect(momentumToDirection(7)).toBe(2);
  });

  it('moves slower forward when turning hard', () => {
    const straight = movementFromMomentum(0);
    const hardTurn = movementFromMomentum(2);
    expect(straight.vy).toBeGreaterThan(hardTurn.vy);
    expect(Math.abs(hardTurn.vx)).toBeGreaterThan(Math.abs(straight.vx));
  });

  it('detects circle overlap for collisions', () => {
    expect(circleOverlap(0, 0, 10, 12, 0, 3)).toBe(true);
    expect(circleOverlap(0, 0, 10, 25, 0, 3)).toBe(false);
  });
});
