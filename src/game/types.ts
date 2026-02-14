export type ObstacleType = 'tree' | 'rock';

export interface Vec2 {
  x: number;
  y: number;
}

export interface Obstacle {
  id: number;
  type: ObstacleType;
  position: Vec2;
  radius: number;
  size: number;
}

export interface GameState {
  skierPosition: Vec2;
  skierMomentum: number;
  skierDirection: -2 | -1 | 0 | 1 | 2;
  skierCrashed: boolean;
  score: number;
  bestScore: number;
  elapsedMs: number;
  gameOver: boolean;
  obstacles: Obstacle[];
}
