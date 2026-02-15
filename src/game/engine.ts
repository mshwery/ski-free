import {
  BASE_FORWARD_SPEED,
  BUFO_ACTIVATION_SCORE,
  BUFO_BASE_DISTANCE,
  BUFO_CATCH_DISTANCE,
  BUFO_CATCH_X_RANGE,
  BUFO_HORIZONTAL_TRACK_RATE,
  BUFO_LUNGE_OFFSET,
  BUFO_LUNGE_TRACK_RATE,
  BUFO_LUNGE_TRIGGER_DISTANCE,
  BUFO_STALK_DURATION_MS,
  BUFO_STALK_OFFSET_MAX,
  BUFO_STALK_OFFSET_MIN,
  BUFO_SURGE_DURATION_MS,
  BUFO_SURGE_OFFSET,
  BUFO_SURGE_TRIGGER_DISTANCE,
  BUFO_WEAVE_AMPLITUDE,
  BUFO_WEAVE_FREQUENCY,
  DESPAWN_BEHIND_DISTANCE,
  DIFFICULTY_RAMP_DISTANCE,
  MAX_SPEED_BOOST,
  SKIER_COLLISION_RADIUS,
  SPEED_RAMP_DISTANCE,
  SPAWN_AHEAD_DISTANCE,
  SPAWN_ROW_DISTANCE,
  STEER_ACCELERATION,
  STEER_FRICTION,
} from './constants';
import { createObstacleRow } from './obstacles';
import { clamp, circleOverlap, momentumToDirection, movementFromMomentum } from './physics';
import { SeededRandom } from './random';
import type { GameOverReason, GameState, Obstacle } from './types';

const MAX_TIMESTEP_MS = 48;
const progressFromDistance = (distance: number, rampDistance: number): number =>
  clamp(distance / rampDistance, 0, 1);
const easeInSpeedRamp = (progress: number): number => Math.pow(progress, 1.65);

export interface SkiGameEngineOptions {
  viewportWidth: number;
  bestScore?: number;
  seed?: number;
  disableObstacles?: boolean;
}

export class SkiGameEngine {
  private readonly random: SeededRandom;
  private readonly disableObstacles: boolean;
  private viewportWidth: number;
  private nextSpawnY = 0;
  private state: GameState;

  constructor(options: SkiGameEngineOptions) {
    this.viewportWidth = options.viewportWidth;
    this.disableObstacles = options.disableObstacles ?? false;
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
      speed: BASE_FORWARD_SPEED,
      difficulty: 0,
      elapsedMs: 0,
      gameOver: false,
      gameOverReason: null,
      bufo: {
        active: false,
        phase: 'waiting',
        position: { x: 0, y: -BUFO_BASE_DISTANCE },
        speed: BASE_FORWARD_SPEED + BUFO_STALK_OFFSET_MIN,
        distanceBehind: BUFO_BASE_DISTANCE,
        chaseElapsedMs: 0,
      },
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
    const speedRamp = progressFromDistance(this.state.score, SPEED_RAMP_DISTANCE);
    const forwardSpeed = BASE_FORWARD_SPEED + MAX_SPEED_BOOST * easeInSpeedRamp(speedRamp);
    const movement = movementFromMomentum(this.state.skierMomentum, forwardSpeed);

    this.state.skierPosition.x += movement.vx * dt;
    this.state.skierPosition.y += movement.vy * dt;

    this.state.speed = movement.vy;
    this.state.score = Math.max(this.state.score, Math.floor(this.state.skierPosition.y));
    this.state.bestScore = Math.max(this.state.bestScore, this.state.score);
    this.state.difficulty = progressFromDistance(this.state.score, DIFFICULTY_RAMP_DISTANCE);

    this.spawnUntil(this.state.skierPosition.y + SPAWN_AHEAD_DISTANCE);
    this.state.obstacles = this.state.obstacles.filter(
      (obstacle) => obstacle.position.y >= this.state.skierPosition.y - DESPAWN_BEHIND_DISTANCE,
    );

    if (this.detectCollision()) {
      this.endRun('obstacle');
      return;
    }

    this.updateBufo(dt);
  }

  private spawnUntil(targetY: number): void {
    if (this.disableObstacles) {
      return;
    }

    while (this.nextSpawnY < targetY) {
      const row = createObstacleRow(
        this.random,
        this.nextSpawnY,
        this.viewportWidth,
        this.state.difficulty,
      );
      this.state.obstacles.push(...row);
      this.nextSpawnY += SPAWN_ROW_DISTANCE;
    }
  }

  private updateBufo(dt: number): void {
    if (!this.state.bufo.active && this.state.score >= BUFO_ACTIVATION_SCORE) {
      this.state.bufo.active = true;
      this.state.bufo.phase = 'stalk';
      this.state.bufo.position = {
        x: this.state.skierPosition.x,
        y: this.state.skierPosition.y - BUFO_BASE_DISTANCE,
      };
      this.state.bufo.distanceBehind = BUFO_BASE_DISTANCE;
      this.state.bufo.chaseElapsedMs = 0;
    }

    if (!this.state.bufo.active) {
      this.state.bufo.phase = 'waiting';
      this.state.bufo.position.x = this.state.skierPosition.x;
      this.state.bufo.position.y = this.state.skierPosition.y - BUFO_BASE_DISTANCE;
      this.state.bufo.distanceBehind = BUFO_BASE_DISTANCE;
      this.state.bufo.speed = this.state.speed + BUFO_STALK_OFFSET_MIN;
      this.state.bufo.chaseElapsedMs = 0;
      return;
    }

    this.state.bufo.chaseElapsedMs += dt * 1000;
    const inStalkWindow = this.state.bufo.chaseElapsedMs < BUFO_STALK_DURATION_MS;
    const inSurgeWindow =
      this.state.bufo.chaseElapsedMs < BUFO_STALK_DURATION_MS + BUFO_SURGE_DURATION_MS;

    if (
      this.state.bufo.distanceBehind <= BUFO_LUNGE_TRIGGER_DISTANCE ||
      !inSurgeWindow
    ) {
      this.state.bufo.phase = 'lunge';
    } else if (this.state.bufo.distanceBehind <= BUFO_SURGE_TRIGGER_DISTANCE || !inStalkWindow) {
      this.state.bufo.phase = 'surge';
    } else {
      this.state.bufo.phase = 'stalk';
    }

    let speedOffset = BUFO_STALK_OFFSET_MIN;
    let weaveScale = 1;
    let trackRate = BUFO_HORIZONTAL_TRACK_RATE;

    if (this.state.bufo.phase === 'stalk') {
      speedOffset =
        BUFO_STALK_OFFSET_MIN + (BUFO_STALK_OFFSET_MAX - BUFO_STALK_OFFSET_MIN) * this.state.difficulty;
      weaveScale = 1;
      trackRate = BUFO_HORIZONTAL_TRACK_RATE;
    } else if (this.state.bufo.phase === 'surge') {
      speedOffset = BUFO_SURGE_OFFSET + this.state.difficulty * 48;
      weaveScale = 0.46;
      trackRate = BUFO_HORIZONTAL_TRACK_RATE * 1.35;
    } else {
      speedOffset = BUFO_LUNGE_OFFSET + this.state.difficulty * 62;
      weaveScale = 0.14;
      trackRate = BUFO_LUNGE_TRACK_RATE;
    }

    const weave =
      Math.sin(this.state.elapsedMs * 0.001 * BUFO_WEAVE_FREQUENCY + this.state.score * 0.0042) *
      BUFO_WEAVE_AMPLITUDE *
      weaveScale;
    const targetX = this.state.skierPosition.x + weave;
    const trackingBlend = Math.min(1, trackRate * dt);
    this.state.bufo.position.x += (targetX - this.state.bufo.position.x) * trackingBlend;

    this.state.bufo.speed = this.state.speed + speedOffset;
    this.state.bufo.position.y += this.state.bufo.speed * dt;
    this.state.bufo.distanceBehind = this.state.skierPosition.y - this.state.bufo.position.y;

    const catchXRange =
      this.state.bufo.phase === 'lunge' ? BUFO_CATCH_X_RANGE * 1.3 : BUFO_CATCH_X_RANGE;
    if (
      this.state.bufo.distanceBehind <= BUFO_CATCH_DISTANCE &&
      Math.abs(this.state.skierPosition.x - this.state.bufo.position.x) <= catchXRange
    ) {
      this.endRun('bufo');
    }
  }

  private endRun(reason: GameOverReason): void {
    this.state.skierCrashed = true;
    this.state.gameOver = true;
    this.state.gameOverReason = reason;
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
