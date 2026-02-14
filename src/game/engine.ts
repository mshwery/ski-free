import {
  DESPAWN_BEHIND_DISTANCE,
  SKIER_COLLISION_RADIUS,
  SPAWN_AHEAD_DISTANCE,
  SPAWN_ROW_DISTANCE,
  STEER_ACCELERATION,
  STEER_FRICTION,
} from './constants';
import { createObstacleRow } from './obstacles';
import { clamp, circleOverlap, momentumToDirection, movementFromMomentum } from './physics';
import { SeededRandom } from './random';
import type { GameState, Obstacle } from './types';

const MAX_TIMESTEP_MS = 48;

export interface SkiGameEngineOptions {
  viewportWidth: number;
  bestScore?: number;
  seed?: number;
}

export class SkiGameEngine {
  private readonly random: SeededRandom;
  private viewportWidth: number;
  private nextSpawnY = 0;
  private state: GameState;

  constructor(options: SkiGameEngineOptions) {
    this.viewportWidth = options.viewportWidth;
    this.random = new SeededRandom(options.seed ?? Math.trunc(Math.random() * 2 ** 31));
    this.state = this.createInitialState(options.bestScore ?? 0);
    this.nextSpawnY = 100;
    this.spawnUntil(this.state.skierPosition.y + SPAWN_AHEAD_DISTANCE);
  }

  private createInitialState(bestScore: number): GameState {
    return {
      skierPosition: { x: 0, y: 0 },
      skierMomentum: 0,
      skierDirection: 0,
      skierCrashed: false,
      score: 0,
      bestScore,
      elapsedMs: 0,
      gameOver: false,
      obstacles: [],
    };
  }

  restart(): void {
    const currentBest = Math.max(this.state.bestScore, this.state.score);
    this.state = this.createInitialState(currentBest);
    this.nextSpawnY = 100;
    this.spawnUntil(this.state.skierPosition.y + SPAWN_AHEAD_DISTANCE);
  }

  setViewportWidth(nextWidth: number): void {
    this.viewportWidth = nextWidth;
  }

  update(deltaMs: number, steeringAxis: number): void {
    if (this.state.gameOver) {
      return;
    }

    const cappedDeltaMs = Math.min(MAX_TIMESTEP_MS, Math.max(0, deltaMs));
    const dt = cappedDeltaMs / 1000;
    this.state.elapsedMs += cappedDeltaMs;

    this.state.skierMomentum = clamp(
      this.state.skierMomentum + steeringAxis * STEER_ACCELERATION * dt,
      -2,
      2,
    );
    this.state.skierMomentum *= Math.exp(-STEER_FRICTION * dt);
    if (Math.abs(this.state.skierMomentum) < 0.01) {
      this.state.skierMomentum = 0;
    }

    this.state.skierDirection = momentumToDirection(this.state.skierMomentum);

    const movement = movementFromMomentum(this.state.skierMomentum);
    this.state.skierPosition.x += movement.vx * dt;
    this.state.skierPosition.y += movement.vy * dt;

    this.state.score = Math.max(this.state.score, Math.floor(this.state.skierPosition.y));
    this.state.bestScore = Math.max(this.state.bestScore, this.state.score);

    this.spawnUntil(this.state.skierPosition.y + SPAWN_AHEAD_DISTANCE);
    this.state.obstacles = this.state.obstacles.filter(
      (obstacle) => obstacle.position.y >= this.state.skierPosition.y - DESPAWN_BEHIND_DISTANCE,
    );

    if (this.detectCollision()) {
      this.state.skierCrashed = true;
      this.state.gameOver = true;
    }
  }

  private spawnUntil(targetY: number): void {
    while (this.nextSpawnY < targetY) {
      const row = createObstacleRow(this.random, this.nextSpawnY, this.viewportWidth);
      this.state.obstacles.push(...row);
      this.nextSpawnY += SPAWN_ROW_DISTANCE;
    }
  }

  private detectCollision(): boolean {
    for (const obstacle of this.state.obstacles) {
      const dy = obstacle.position.y - this.state.skierPosition.y;
      if (Math.abs(dy) > 70) {
        continue;
      }

      const dx = obstacle.position.x - this.state.skierPosition.x;
      if (Math.abs(dx) > 70) {
        continue;
      }

      if (
        circleOverlap(
          obstacle.position.x,
          obstacle.position.y,
          obstacle.radius,
          this.state.skierPosition.x,
          this.state.skierPosition.y,
          SKIER_COLLISION_RADIUS,
        )
      ) {
        return true;
      }
    }

    return false;
  }

  getState(): Readonly<GameState> {
    return this.state;
  }

  setObstaclesForTests(obstacles: Obstacle[]): void {
    this.state.obstacles = obstacles;
  }
}
