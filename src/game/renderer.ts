import { CANVAS_MIN_HEIGHT, CANVAS_MIN_WIDTH, SKIER_SCREEN_Y_RATIO } from './constants';
import { SpriteLibrary, type SpriteId } from './sprites';
import type { GameState, Obstacle } from './types';

export class CanvasRenderer {
  private readonly context: CanvasRenderingContext2D;
  private readonly sprites: SpriteLibrary;
  private width = CANVAS_MIN_WIDTH;
  private height = CANVAS_MIN_HEIGHT;

  constructor(private readonly canvas: HTMLCanvasElement) {
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('2D canvas context is required');
    }
    this.context = context;
    this.sprites = new SpriteLibrary();
  }

  resize(width: number, height: number): void {
    this.width = Math.max(CANVAS_MIN_WIDTH, Math.floor(width));
    this.height = Math.max(CANVAS_MIN_HEIGHT, Math.floor(height));

    const dpr = Math.max(window.devicePixelRatio || 1, 1);
    this.canvas.width = Math.floor(this.width * dpr);
    this.canvas.height = Math.floor(this.height * dpr);
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;
    this.context.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.context.imageSmoothingEnabled = true;
  }

  getViewportWidth(): number {
    return this.width;
  }

  render(state: Readonly<GameState>): void {
    const backgroundGradient = this.context.createLinearGradient(0, 0, 0, this.height);
    backgroundGradient.addColorStop(0, '#f8fbff');
    backgroundGradient.addColorStop(1, '#e4efff');
    this.context.fillStyle = backgroundGradient;
    this.context.fillRect(0, 0, this.width, this.height);

    this.drawSnowTexture(state.skierPosition.y, state.speed);

    const skierScreenX = this.width / 2;
    const skierScreenY = this.height * SKIER_SCREEN_Y_RATIO;

    const sortedVisibleObstacles = state.obstacles
      .filter((obstacle) => {
        const sy = skierScreenY + (obstacle.position.y - state.skierPosition.y);
        return sy >= -120 && sy <= this.height + 120;
      })
      .sort((a, b) => a.position.y - b.position.y);

    for (const obstacle of sortedVisibleObstacles) {
      const sx = skierScreenX + (obstacle.position.x - state.skierPosition.x);
      const sy = skierScreenY + (obstacle.position.y - state.skierPosition.y);
      this.drawObstacleSprite(obstacle, sx, sy);
    }

    if (state.bufo.active) {
      const bufoX = skierScreenX + (state.bufo.position.x - state.skierPosition.x);
      const bufoY = skierScreenY + (state.bufo.position.y - state.skierPosition.y);
      this.drawBufoSprite(state, bufoX, bufoY);
    }

    this.drawSkierSprite(state, skierScreenX, skierScreenY);
  }

  private drawSnowTexture(cameraY: number, speed: number): void {
    this.context.fillStyle = '#d3e6ff';
    const density = 95;
    for (let index = 0; index < density; index += 1) {
      const seed = index * 73.13 + cameraY * 0.045;
      const x = ((Math.sin(seed) + 1) * 0.5) * this.width;
      const y = ((Math.cos(seed * 1.87) + 1) * 0.5) * this.height;
      this.context.fillRect(x, y, 2, 2);
    }

    this.context.strokeStyle = 'rgb(199 221 255 / 45%)';
    this.context.lineWidth = 1;
    const streakCount = Math.floor(14 + (speed / 420) * 24);
    for (let index = 0; index < streakCount; index += 1) {
      const seed = index * 64.77 + cameraY * 0.035;
      const x = ((Math.sin(seed * 0.76) + 1) * 0.5) * this.width;
      const y = ((Math.cos(seed * 1.41) + 1) * 0.5) * this.height;
      const length = 8 + (speed / 360) * 12;
      this.context.beginPath();
      this.context.moveTo(x, y);
      this.context.lineTo(x, y + length);
      this.context.stroke();
    }
  }

  private drawObstacleSprite(obstacle: Obstacle, x: number, y: number): void {
    const spriteId = this.getObstacleSpriteId(obstacle);
    const scale = this.getObstacleScale(obstacle);
    this.drawSprite(spriteId, x, y, scale);
  }

  private getObstacleSpriteId(obstacle: Obstacle): SpriteId {
    if (obstacle.type === 'tree') {
      const treeVariant = obstacle.id % 3;
      return treeVariant === 0 ? 'tree_0' : treeVariant === 1 ? 'tree_1' : 'tree_2';
    }

    if (obstacle.type === 'rock') {
      const rockVariant = obstacle.id % 3;
      return rockVariant === 0 ? 'rock_0' : rockVariant === 1 ? 'rock_1' : 'rock_2';
    }

    return obstacle.type === 'gateLeft' ? 'gate_left' : 'gate_right';
  }

  private getObstacleScale(obstacle: Obstacle): number {
    switch (obstacle.type) {
      case 'tree':
        return (obstacle.size * 2.1) / 94;
      case 'rock':
        return (obstacle.size * 1.6) / 58;
      case 'gateLeft':
      case 'gateRight':
        return (obstacle.size * 2.2) / 76;
      default:
        return 1;
    }
  }

  private drawSkierSprite(state: Readonly<GameState>, x: number, y: number): void {
    const cadenceMs = Math.max(92, 196 - state.speed * 0.18);
    const animationFrame = Math.floor(state.elapsedMs / cadenceMs) % 2 === 0 ? 'a' : 'b';
    const bob = state.skierCrashed ? 0 : Math.sin(state.elapsedMs * 0.02) * 0.8;
    let spriteId: SpriteId;

    if (state.skierCrashed) {
      spriteId = 'skier_crash';
    } else if (state.skierDirection < 0) {
      spriteId = animationFrame === 'a' ? 'skier_left_a' : 'skier_left_b';
    } else if (state.skierDirection > 0) {
      spriteId = animationFrame === 'a' ? 'skier_right_a' : 'skier_right_b';
    } else {
      spriteId = animationFrame === 'a' ? 'skier_center_a' : 'skier_center_b';
    }

    this.drawSprite(spriteId, x, y + bob, 1.04);
  }

  private drawBufoSprite(state: Readonly<GameState>, x: number, y: number): void {
    const frameMs =
      state.bufo.phase === 'lunge' ? 96 : state.bufo.phase === 'surge' ? 126 : 176;
    const spriteId: SpriteId = Math.floor(state.elapsedMs / frameMs) % 2 === 0 ? 'bufo_a' : 'bufo_b';
    const phaseScale =
      state.bufo.phase === 'lunge' ? 1.24 : state.bufo.phase === 'surge' ? 1.08 : 0.96;
    const bob = Math.sin(state.elapsedMs * 0.015) * (state.bufo.phase === 'lunge' ? 3.5 : 2);
    this.drawSprite(spriteId, x, y + bob, phaseScale);
  }

  private drawSprite(spriteId: SpriteId, x: number, y: number, scale: number): void {
    const sprite = this.sprites.get(spriteId);
    const width = sprite.canvas.width * scale;
    const height = sprite.canvas.height * scale;
    this.context.drawImage(
      sprite.canvas,
      x - sprite.anchorX * scale,
      y - sprite.anchorY * scale,
      width,
      height,
    );
  }
}
