export type ObstacleType = 'tree' | 'rock' | 'gateLeft' | 'gateRight';

export type GameOverReason = 'obstacle' | 'bufo' | null;
export type BufoPhase = 'waiting' | 'stalk' | 'surge' | 'lunge';

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

export interface BufoState {
  active: boolean;
  phase: BufoPhase;
  position: Vec2;
  speed: number;
  distanceBehind: number;
  chaseElapsedMs: number;
}

export interface GameState {
  skierPosition: Vec2;
  skierMomentum: number;
  skierDirection: -2 | -1 | 0 | 1 | 2;
  skierCrashed: boolean;
  score: number;
  bestScore: number;
  speed: number;
  difficulty: number;
  elapsedMs: number;
  gameOver: boolean;
  gameOverReason: GameOverReason;
  bufo: BufoState;
  obstacles: Obstacle[];
}
