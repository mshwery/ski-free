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
      this.drawObstacle(obstacle, sx, sy);
    }

    if (state.bufo.active) {
      const bufoX = skierScreenX + (state.bufo.position.x - state.skierPosition.x);
      const bufoY = skierScreenY + (state.bufo.position.y - state.skierPosition.y);
      this.drawBufo(bufoX, bufoY, state.bufo.distanceBehind <= 120);
    }

    this.drawSkier(skierScreenX, skierScreenY, state.skierDirection, state.skierCrashed);
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

  private drawObstacle(obstacle: Obstacle, x: number, y: number): void {
    switch (obstacle.type) {
      case 'tree':
        this.drawTree(x, y, obstacle.size);
        return;
      case 'rock':
        this.drawRock(x, y, obstacle.size);
        return;
      case 'gateLeft':
        this.drawSlalomPole(x, y, obstacle.size, true);
        return;
      case 'gateRight':
        this.drawSlalomPole(x, y, obstacle.size, false);
        return;
      default:
        return;
    }
  }

  private drawTree(x: number, y: number, size: number): void {
    const trunkHeight = size * 0.25;
    const trunkWidth = size * 0.18;
    this.context.fillStyle = 'rgb(64 78 40 / 28%)';
    this.context.beginPath();
    this.context.ellipse(x + 2, y + size * 0.43, size * 0.42, size * 0.18, 0, 0, Math.PI * 2);
    this.context.fill();

    this.context.fillStyle = '#765232';
    this.context.fillRect(x - trunkWidth / 2, y + size * 0.13, trunkWidth, trunkHeight);

    this.context.fillStyle = '#176434';
    this.context.beginPath();
    this.context.moveTo(x, y - size * 0.62);
    this.context.lineTo(x - size * 0.5, y + size * 0.03);
    this.context.lineTo(x + size * 0.5, y + size * 0.03);
    this.context.closePath();
    this.context.fill();

    this.context.fillStyle = '#27a357';
    this.context.beginPath();
    this.context.moveTo(x, y - size * 0.32);
    this.context.lineTo(x - size * 0.4, y + size * 0.33);
    this.context.lineTo(x + size * 0.4, y + size * 0.33);
    this.context.closePath();
    this.context.fill();

    this.context.fillStyle = 'rgb(242 249 255 / 80%)';
    this.context.beginPath();
    this.context.moveTo(x, y - size * 0.53);
    this.context.lineTo(x - size * 0.2, y - size * 0.27);
    this.context.lineTo(x + size * 0.2, y - size * 0.27);
    this.context.closePath();
    this.context.fill();
  }

  private drawRock(x: number, y: number, size: number): void {
    const half = size * 0.45;
    this.context.fillStyle = '#6e7a8d';
    this.context.beginPath();
    this.context.ellipse(x + 1, y + size * 0.28, size * 0.47, size * 0.16, 0, 0, Math.PI * 2);
    this.context.fill();

    this.context.fillStyle = '#7c8aa1';
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
    const lean = direction * 4.4;
    const skiSpread = crashed ? 26 : 18;
    const skiLength = 40;

    this.context.strokeStyle = '#2f3848';
    this.context.lineWidth = 4;
    this.context.beginPath();
    this.context.moveTo(x - skiSpread + lean - 2, y + 11);
    this.context.lineTo(x - skiSpread + lean - direction * 5, y + 11 + skiLength);
    this.context.moveTo(x + skiSpread + lean + 2, y + 11);
    this.context.lineTo(x + skiSpread + lean - direction * 5, y + 11 + skiLength);
    this.context.stroke();

    this.context.strokeStyle = '#4d5767';
    this.context.lineWidth = 2;
    this.context.beginPath();
    this.context.moveTo(x + lean, y + 2);
    this.context.lineTo(x - 10 + lean - direction * 6, y + 12);
    this.context.moveTo(x + lean, y + 2);
    this.context.lineTo(x + 10 + lean - direction * 6, y + 12);
    this.context.stroke();

    this.context.fillStyle = crashed ? '#8c2424' : '#df3a2a';
    this.context.fillRect(x - 9 + lean, y - 9, 18, 16);

    this.context.fillStyle = '#1f5fa4';
    this.context.fillRect(x - 8 + lean, y + 5, 16, 16);

    this.context.fillStyle = '#f2dbbe';
    this.context.beginPath();
    this.context.arc(x + lean, y - 12, 6, 0, Math.PI * 2);
    this.context.fill();

    this.context.fillStyle = '#0f223f';
    this.context.fillRect(x - 6 + lean, y - 19, 12, 4);
    this.context.fillStyle = '#4ba3d4';
    this.context.fillRect(x - 5 + lean, y - 14, 10, 3);
  }

  private drawSlalomPole(x: number, y: number, size: number, isLeft: boolean): void {
    const poleHeight = size;
    this.context.fillStyle = '#f8faff';
    this.context.fillRect(x - 2, y - poleHeight, 4, poleHeight);

    this.context.fillStyle = isLeft ? '#db3045' : '#1e6fd8';
    this.context.fillRect(x - 3.5, y - poleHeight, 7, 8);
    this.context.fillRect(x - 3.5, y - poleHeight + 12, 7, 8);

    this.context.fillStyle = 'rgb(42 54 75 / 35%)';
    this.context.beginPath();
    this.context.ellipse(x + 2, y + 5, 7, 3, 0, 0, Math.PI * 2);
    this.context.fill();

    this.context.fillStyle = isLeft ? '#ef476f' : '#3a86ff';
    this.context.beginPath();
    if (isLeft) {
      this.context.moveTo(x + 2, y - poleHeight + 5);
      this.context.lineTo(x + 24, y - poleHeight + 8);
      this.context.lineTo(x + 2, y - poleHeight + 14);
    } else {
      this.context.moveTo(x - 2, y - poleHeight + 5);
      this.context.lineTo(x - 24, y - poleHeight + 8);
      this.context.lineTo(x - 2, y - poleHeight + 14);
    }
    this.context.closePath();
    this.context.fill();
  }

  private drawBufo(x: number, y: number, closeBehind: boolean): void {
    const size = closeBehind ? 1.05 : 0.96;
    this.context.fillStyle = 'rgb(40 55 32 / 24%)';
    this.context.beginPath();
    this.context.ellipse(x, y + 22 * size, 26 * size, 8 * size, 0, 0, Math.PI * 2);
    this.context.fill();

    this.context.fillStyle = '#5a9d37';
    this.context.beginPath();
    this.context.ellipse(x, y + 7 * size, 25 * size, 20 * size, 0, 0, Math.PI * 2);
    this.context.fill();

    this.context.fillStyle = '#76bd4d';
    this.context.beginPath();
    this.context.ellipse(x, y + 3 * size, 17 * size, 11 * size, 0, 0, Math.PI * 2);
    this.context.fill();

    this.context.fillStyle = '#5a9d37';
    this.context.beginPath();
    this.context.arc(x - 11 * size, y - 8 * size, 7 * size, 0, Math.PI * 2);
    this.context.arc(x + 11 * size, y - 8 * size, 7 * size, 0, Math.PI * 2);
    this.context.fill();

    this.context.fillStyle = '#f9fdf4';
    this.context.beginPath();
    this.context.arc(x - 11 * size, y - 8 * size, 3.5 * size, 0, Math.PI * 2);
    this.context.arc(x + 11 * size, y - 8 * size, 3.5 * size, 0, Math.PI * 2);
    this.context.fill();

    this.context.fillStyle = '#152410';
    this.context.beginPath();
    this.context.arc(x - 11 * size, y - 8 * size, 1.8 * size, 0, Math.PI * 2);
    this.context.arc(x + 11 * size, y - 8 * size, 1.8 * size, 0, Math.PI * 2);
    this.context.fill();

    this.context.fillStyle = '#f17f92';
    this.context.beginPath();
    this.context.ellipse(x, y + 10 * size, 10 * size, 4 * size, 0, 0, Math.PI);
    this.context.fill();
  }
}
