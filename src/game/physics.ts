import { BASE_FORWARD_SPEED, FORWARD_SPEED_PENALTY, SIDE_SPEED } from './constants';

export const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));

export const momentumToDirection = (momentum: number): -2 | -1 | 0 | 1 | 2 =>
  clamp(Math.round(momentum), -2, 2) as -2 | -1 | 0 | 1 | 2;

export const movementFromMomentum = (
  momentum: number,
  forwardSpeed = BASE_FORWARD_SPEED,
): { vx: number; vy: number } => {
  const normalized = clamp(momentum, -2, 2) / 2;
  return {
    vx: normalized * SIDE_SPEED,
    vy: forwardSpeed - Math.abs(normalized) * FORWARD_SPEED_PENALTY,
  };
};

export const circleOverlap = (
  ax: number,
  ay: number,
  ar: number,
  bx: number,
  by: number,
  br: number,
): boolean => {
  const dx = ax - bx;
  const dy = ay - by;
  const r = ar + br;
  return dx * dx + dy * dy <= r * r;
};
