import { CANVAS_MIN_HEIGHT, CANVAS_MIN_WIDTH, SKIER_SCREEN_Y_RATIO } from './constants';
import type { GameState, Obstacle } from './types';

export class CanvasRenderer {
  private readonly context: CanvasRenderingContext2D;
  private width = CANVAS_MIN_WIDTH;
  private height = CANVAS_MIN_HEIGHT;

  constructor(private readonly canvas: HTMLCanvasElement) {
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('2D canvas context is required');
    }
    this.context = context;
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
  }

  getViewportWidth(): number {
    return this.width;
  }

  render(state: Readonly<GameState>): void {
    this.context.fillStyle = '#f3f7ff';
    this.context.fillRect(0, 0, this.width, this.height);

    this.drawSnowTexture(state.skierPosition.y);

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
      this.drawObstacle(obstacle, sx, sy);
    }

    this.drawSkier(skierScreenX, skierScreenY, state.skierDirection, state.skierCrashed);
  }

  private drawSnowTexture(cameraY: number): void {
    this.context.fillStyle = '#e0ecff';
    const density = 85;
    for (let index = 0; index < density; index += 1) {
      const seed = index * 73.13 + cameraY * 0.045;
      const x = ((Math.sin(seed) + 1) * 0.5) * this.width;
      const y = ((Math.cos(seed * 1.87) + 1) * 0.5) * this.height;
      this.context.fillRect(x, y, 2, 2);
    }
  }

  private drawObstacle(obstacle: Obstacle, x: number, y: number): void {
    if (obstacle.type === 'tree') {
      this.drawTree(x, y, obstacle.size);
      return;
    }

    this.drawRock(x, y, obstacle.size);
  }

  private drawTree(x: number, y: number, size: number): void {
    const trunkHeight = size * 0.22;
    const trunkWidth = size * 0.16;
    this.context.fillStyle = '#6f5232';
    this.context.fillRect(x - trunkWidth / 2, y + size * 0.1, trunkWidth, trunkHeight);

    this.context.fillStyle = '#195d35';
    this.context.beginPath();
    this.context.moveTo(x, y - size * 0.55);
    this.context.lineTo(x - size * 0.48, y + size * 0.05);
    this.context.lineTo(x + size * 0.48, y + size * 0.05);
    this.context.closePath();
    this.context.fill();

    this.context.fillStyle = '#258c4e';
    this.context.beginPath();
    this.context.moveTo(x, y - size * 0.28);
    this.context.lineTo(x - size * 0.38, y + size * 0.28);
    this.context.lineTo(x + size * 0.38, y + size * 0.28);
    this.context.closePath();
    this.context.fill();
  }

  private drawRock(x: number, y: number, size: number): void {
    const half = size * 0.45;
    this.context.fillStyle = '#7e8797';
    this.context.beginPath();
    this.context.moveTo(x - half, y + size * 0.1);
    this.context.lineTo(x - size * 0.2, y - half);
    this.context.lineTo(x + size * 0.28, y - size * 0.32);
    this.context.lineTo(x + half, y + size * 0.1);
    this.context.lineTo(x + size * 0.18, y + size * 0.36);
    this.context.lineTo(x - size * 0.3, y + size * 0.33);
    this.context.closePath();
    this.context.fill();

    this.context.fillStyle = '#a8afbb';
    this.context.beginPath();
    this.context.moveTo(x - size * 0.08, y - size * 0.2);
    this.context.lineTo(x + size * 0.14, y - size * 0.1);
    this.context.lineTo(x + size * 0.08, y + size * 0.06);
    this.context.lineTo(x - size * 0.13, y - size * 0.02);
    this.context.closePath();
    this.context.fill();
  }

  private drawSkier(
    x: number,
    y: number,
    direction: -2 | -1 | 0 | 1 | 2,
    crashed: boolean,
  ): void {
    const lean = direction * 4;
    const skiSpread = crashed ? 26 : 18;
    const skiLength = 40;

    this.context.strokeStyle = '#2d3746';
    this.context.lineWidth = 3;
    this.context.beginPath();
    this.context.moveTo(x - skiSpread + lean, y + 12);
    this.context.lineTo(x - skiSpread + lean - direction * 3, y + 12 + skiLength);
    this.context.moveTo(x + skiSpread + lean, y + 12);
    this.context.lineTo(x + skiSpread + lean - direction * 3, y + 12 + skiLength);
    this.context.stroke();

    this.context.fillStyle = crashed ? '#7f1d1d' : '#cb3126';
    this.context.fillRect(x - 8 + lean, y - 8, 16, 14);

    this.context.fillStyle = '#194f8c';
    this.context.fillRect(x - 7 + lean, y + 6, 14, 14);

    this.context.fillStyle = '#f0d6ba';
    this.context.beginPath();
    this.context.arc(x + lean, y - 11, 6, 0, Math.PI * 2);
    this.context.fill();

    this.context.strokeStyle = '#111827';
    this.context.lineWidth = 2;
    this.context.beginPath();
    this.context.moveTo(x + lean, y - 2);
    this.context.lineTo(x + lean - direction * 12, y + 6);
    this.context.stroke();
  }
}
