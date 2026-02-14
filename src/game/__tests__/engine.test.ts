import { describe, expect, it } from 'vitest';

import { SkiGameEngine } from '../engine';
import type { Obstacle } from '../types';

const runFrames = (engine: SkiGameEngine, frameCount: number, steering = 0): void => {
  for (let index = 0; index < frameCount; index += 1) {
    engine.update(16, steering);
  }
};

describe('SkiGameEngine', () => {
  it('moves downhill and increases score over time', () => {
    const engine = new SkiGameEngine({ viewportWidth: 700, seed: 5 });
    runFrames(engine, 90);

    const state = engine.getState();
    expect(state.score).toBeGreaterThan(200);
    expect(state.elapsedMs).toBeGreaterThan(0);
    expect(state.obstacles.length).toBeGreaterThan(0);
  });

  it('ends the run when an obstacle overlaps skier position', () => {
    const engine = new SkiGameEngine({ viewportWidth: 700, seed: 5, disableObstacles: true });
    const obstacle: Obstacle = {
      id: 1,
      type: 'rock',
      position: { x: 0, y: 14 },
      radius: 30,
      size: 30,
    };

    engine.setObstaclesForTests([obstacle]);
    engine.update(16, 0);

    const state = engine.getState();
    expect(state.gameOver).toBe(true);
    expect(state.skierCrashed).toBe(true);
  });

  it('keeps best score after restarting', () => {
    const engine = new SkiGameEngine({ viewportWidth: 700, seed: 5, disableObstacles: true });
    runFrames(engine, 80);
    const bestBeforeRestart = engine.getState().bestScore;

    engine.restart();

    const state = engine.getState();
    expect(state.score).toBe(0);
    expect(state.bestScore).toBe(bestBeforeRestart);
    expect(state.gameOver).toBe(false);
  });

  it('increases base downhill speed as score rises', () => {
    const engine = new SkiGameEngine({ viewportWidth: 700, seed: 5, disableObstacles: true });
    runFrames(engine, 40);
    const earlySpeed = engine.getState().speed;

    runFrames(engine, 1200);
    const lateState = engine.getState();
    expect(lateState.speed).toBeGreaterThan(earlySpeed + 38);
    expect(lateState.difficulty).toBeGreaterThan(0.3);
  });

  it('activates bufo chase and eventually ends run by capture', () => {
    const engine = new SkiGameEngine({ viewportWidth: 700, seed: 4, disableObstacles: true });
    const phasesSeen = new Set<string>();

    for (let frame = 0; frame < 4800; frame += 1) {
      engine.update(16, 0);
      const state = engine.getState();
      if (state.bufo.active) {
        phasesSeen.add(state.bufo.phase);
      }
      if (state.gameOver) {
        break;
      }
    }

    const state = engine.getState();
    expect(phasesSeen.has('stalk')).toBe(true);
    expect(phasesSeen.has('surge')).toBe(true);
    expect(phasesSeen.has('lunge')).toBe(true);
    expect(state.gameOver).toBe(true);
    expect(state.gameOverReason).toBe('bufo');
  });
});
