export type SpriteId =
  | 'skier_center_a'
  | 'skier_center_b'
  | 'skier_left_a'
  | 'skier_left_b'
  | 'skier_right_a'
  | 'skier_right_b'
  | 'skier_crash'
  | 'tree_0'
  | 'tree_1'
  | 'tree_2'
  | 'rock_0'
  | 'rock_1'
  | 'rock_2'
  | 'gate_left'
  | 'gate_right'
  | 'bufo_a'
  | 'bufo_b';

export interface Sprite {
  canvas: HTMLCanvasElement;
  anchorX: number;
  anchorY: number;
}

const createSprite = (
  width: number,
  height: number,
  anchorX: number,
  anchorY: number,
  painter: (ctx: CanvasRenderingContext2D, width: number, height: number) => void,
): Sprite => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('2D context is required for sprite rendering');
  }

  painter(context, width, height);
  return { canvas, anchorX, anchorY };
};

const createSkierSprite = (direction: -1 | 0 | 1, frame: 0 | 1): Sprite =>
  createSprite(72, 84, 36, 68, (ctx) => {
    const pixel = 3;
    const stride = frame === 0 ? -1 : 1;
    const lean = direction * 2;
    const bodyX = 8 + lean;

    const put = (x: number, y: number, width: number, height: number, color: string): void => {
      ctx.fillStyle = color;
      ctx.fillRect(x * pixel, y * pixel, width * pixel, height * pixel);
    };

    const line = (x0: number, y0: number, x1: number, y1: number, color: string): void => {
      const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
      for (let index = 0; index <= steps; index += 1) {
        const x = Math.round(x0 + ((x1 - x0) * index) / Math.max(steps, 1));
        const y = Math.round(y0 + ((y1 - y0) * index) / Math.max(steps, 1));
        put(x, y, 1, 1, color);
      }
    };

    put(7, 25, 10, 1, 'rgb(29 43 62 / 32%)');
    put(8, 26, 8, 1, 'rgb(29 43 62 / 22%)');

    line(bodyX - 3, 18, bodyX - 4 - direction, 27, '#2a3448');
    line(bodyX + 10, 18, bodyX + 11 - direction, 27, '#2a3448');
    line(bodyX - 2, 19, bodyX - 3 - direction, 27, '#4f5d76');
    line(bodyX + 9, 19, bodyX + 10 - direction, 27, '#4f5d76');
    put(bodyX - 5 - direction, 27, 3, 1, '#2a3448');
    put(bodyX + 10 - direction, 27, 3, 1, '#2a3448');

    put(bodyX + 1, 16, 2, 2, '#59657d');
    put(bodyX + 5, 16, 2, 2, '#59657d');
    put(bodyX, 12, 8, 5, '#1f64b1');
    put(bodyX + 1, 13, 2, 2, '#2f80d6');
    put(bodyX + 5, 13, 2, 2, '#2f80d6');

    put(bodyX, 7, 8, 5, '#d33f32');
    put(bodyX + 1, 8, 3, 2, '#ef7150');
    if (frame === 0) {
      put(bodyX - 1 + Math.max(direction, 0), 8, 2, 1, '#e9584a');
    } else {
      put(bodyX - 2 + Math.max(direction, 0), 8, 3, 1, '#e9584a');
    }

    line(bodyX + 1, 9, bodyX - 3 - direction, 14 + stride, '#343d52');
    line(bodyX + 7, 9, bodyX + 11 - direction, 14 - stride, '#343d52');
    line(bodyX - 3 - direction, 14 + stride, bodyX - 5 - direction, 20 + stride, '#343d52');
    line(bodyX + 11 - direction, 14 - stride, bodyX + 13 - direction, 20 - stride, '#343d52');

    put(bodyX + 2, 3, 4, 3, '#f3dbbc');
    put(bodyX + 1, 1, 6, 2, '#111f39');
    put(bodyX + 2, 2, 4, 1, '#62c2ec');
  });

const createSkierCrashSprite = (): Sprite =>
  createSprite(78, 84, 39, 68, (ctx) => {
    const pixel = 3;

    const put = (x: number, y: number, width: number, height: number, color: string): void => {
      ctx.fillStyle = color;
      ctx.fillRect(x * pixel, y * pixel, width * pixel, height * pixel);
    };

    const line = (x0: number, y0: number, x1: number, y1: number, color: string): void => {
      const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
      for (let index = 0; index <= steps; index += 1) {
        const x = Math.round(x0 + ((x1 - x0) * index) / Math.max(steps, 1));
        const y = Math.round(y0 + ((y1 - y0) * index) / Math.max(steps, 1));
        put(x, y, 1, 1, color);
      }
    };

    put(7, 25, 12, 1, 'rgb(29 43 62 / 32%)');
    put(8, 26, 10, 1, 'rgb(29 43 62 / 22%)');

    line(5, 18, 19, 27, '#2a3448');
    line(20, 18, 7, 27, '#2a3448');
    put(4, 27, 4, 1, '#2a3448');
    put(18, 27, 4, 1, '#2a3448');

    line(4, 10, 2, 17, '#343d52');
    line(21, 9, 24, 16, '#343d52');
    put(2, 17, 2, 1, '#343d52');
    put(23, 16, 2, 1, '#343d52');

    put(10, 11, 8, 5, '#8f3030');
    put(9, 15, 10, 4, '#1f64b1');
    put(11, 16, 3, 2, '#2f80d6');

    put(13, 8, 4, 3, '#f3dbbc');
    put(12, 6, 6, 2, '#111f39');
    put(13, 7, 4, 1, '#62c2ec');
  });

const createTreeSprite = (variant: 0 | 1 | 2): Sprite =>
  createSprite(84, 94, 42, 74, (ctx) => {
    const paletteByVariant = [
      { deep: '#155d34', light: '#30a45d' },
      { deep: '#1a6a36', light: '#3fb56a' },
      { deep: '#1b5d3f', light: '#3a9f73' },
    ] as const;
    const palette = paletteByVariant[variant];

    ctx.fillStyle = 'rgb(64 78 40 / 30%)';
    ctx.beginPath();
    ctx.ellipse(43, 78, 18, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#7a5634';
    ctx.fillRect(38, 56, 10, 20);

    ctx.fillStyle = palette.deep;
    ctx.beginPath();
    ctx.moveTo(42, 9);
    ctx.lineTo(16, 49);
    ctx.lineTo(68, 49);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = palette.light;
    ctx.beginPath();
    ctx.moveTo(42, 24);
    ctx.lineTo(20, 63);
    ctx.lineTo(64, 63);
    ctx.closePath();
    ctx.fill();

    const snowCapOffset = variant * 2;
    ctx.fillStyle = 'rgb(244 250 255 / 90%)';
    ctx.beginPath();
    ctx.moveTo(42, 15 + snowCapOffset);
    ctx.lineTo(31, 30 + snowCapOffset);
    ctx.lineTo(53, 30 + snowCapOffset);
    ctx.closePath();
    ctx.fill();
  });

const createRockSprite = (variant: 0 | 1 | 2): Sprite =>
  createSprite(74, 58, 37, 42, (ctx) => {
    const tint = ['#7f8da1', '#72859e', '#7a8a94'][variant];
    const highlight = ['#b2bbca', '#aab8cf', '#b7bec8'][variant];
    const shift = variant - 1;

    ctx.fillStyle = 'rgb(50 61 79 / 30%)';
    ctx.beginPath();
    ctx.ellipse(38 + shift * 1.5, 48, 18, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = tint;
    ctx.beginPath();
    ctx.moveTo(13 + shift, 36);
    ctx.lineTo(23 + shift, 11);
    ctx.lineTo(47 + shift, 8);
    ctx.lineTo(62 + shift, 30);
    ctx.lineTo(54 + shift, 43);
    ctx.lineTo(25 + shift, 45);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = highlight;
    ctx.beginPath();
    ctx.moveTo(29 + shift, 16);
    ctx.lineTo(44 + shift, 13);
    ctx.lineTo(50 + shift, 23);
    ctx.lineTo(34 + shift, 25);
    ctx.closePath();
    ctx.fill();
  });

const createGateSprite = (side: 'left' | 'right'): Sprite =>
  createSprite(70, 76, 35, 60, (ctx) => {
    ctx.fillStyle = 'rgb(45 56 73 / 30%)';
    ctx.beginPath();
    ctx.ellipse(36, 64, 10, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#f8faff';
    ctx.fillRect(33, 8, 4, 56);

    const flagColor = side === 'left' ? '#e73a55' : '#2d79e6';
    const stripeColor = side === 'left' ? '#ff7890' : '#6ca4ff';
    ctx.fillStyle = flagColor;
    ctx.beginPath();
    if (side === 'left') {
      ctx.moveTo(37, 12);
      ctx.lineTo(62, 16);
      ctx.lineTo(37, 24);
    } else {
      ctx.moveTo(33, 12);
      ctx.lineTo(8, 16);
      ctx.lineTo(33, 24);
    }
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = stripeColor;
    ctx.fillRect(31.5, 29, 7, 8);
    ctx.fillRect(31.5, 44, 7, 8);
  });

const createBufoSprite = (frame: 0 | 1): Sprite =>
  createSprite(108, 96, 54, 77, (ctx) => {
    const tongueOffset = frame === 0 ? -2 : 2;
    const pupilOffset = frame === 0 ? -0.6 : 0.6;
    const armsUp = frame === 1;

    ctx.fillStyle = 'rgb(30 43 28 / 26%)';
    ctx.beginPath();
    ctx.ellipse(55, 81, 30, 9, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#4d8337';
    if (armsUp) {
      ctx.beginPath();
      ctx.moveTo(38, 52);
      ctx.lineTo(24, 27);
      ctx.lineTo(31, 23);
      ctx.lineTo(44, 48);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(70, 52);
      ctx.lineTo(84, 27);
      ctx.lineTo(77, 23);
      ctx.lineTo(64, 48);
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.moveTo(34, 56);
      ctx.lineTo(12, 58);
      ctx.lineTo(14, 66);
      ctx.lineTo(36, 63);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(74, 56);
      ctx.lineTo(96, 58);
      ctx.lineTo(94, 66);
      ctx.lineTo(72, 63);
      ctx.closePath();
      ctx.fill();
    }

    ctx.fillStyle = '#578f3f';
    ctx.beginPath();
    ctx.ellipse(54, 52, 30, 25, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#72b753';
    ctx.beginPath();
    ctx.ellipse(54, 47, 21, 15, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#578f3f';
    ctx.beginPath();
    ctx.arc(40, 33, 9, 0, Math.PI * 2);
    ctx.arc(68, 33, 9, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fbfff7';
    ctx.beginPath();
    ctx.arc(40, 33, 4.5, 0, Math.PI * 2);
    ctx.arc(68, 33, 4.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#12240e';
    ctx.beginPath();
    ctx.arc(40 + pupilOffset, 33, 2, 0, Math.PI * 2);
    ctx.arc(68 + pupilOffset, 33, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#f08598';
    ctx.beginPath();
    ctx.ellipse(54 + tongueOffset, 58, 11, 4, 0, 0, Math.PI);
    ctx.fill();

    ctx.fillStyle = '#f7fff0';
    if (armsUp) {
      ctx.fillRect(24, 24, 2, 3);
      ctx.fillRect(27, 22, 2, 3);
      ctx.fillRect(82, 24, 2, 3);
      ctx.fillRect(79, 22, 2, 3);
    } else {
      ctx.fillRect(12, 59, 2, 3);
      ctx.fillRect(15, 58, 2, 3);
      ctx.fillRect(94, 59, 2, 3);
      ctx.fillRect(91, 58, 2, 3);
    }
  });

export class SpriteLibrary {
  private readonly sprites: Record<SpriteId, Sprite> = {
    skier_center_a: createSkierSprite(0, 0),
    skier_center_b: createSkierSprite(0, 1),
    skier_left_a: createSkierSprite(-1, 0),
    skier_left_b: createSkierSprite(-1, 1),
    skier_right_a: createSkierSprite(1, 0),
    skier_right_b: createSkierSprite(1, 1),
    skier_crash: createSkierCrashSprite(),
    tree_0: createTreeSprite(0),
    tree_1: createTreeSprite(1),
    tree_2: createTreeSprite(2),
    rock_0: createRockSprite(0),
    rock_1: createRockSprite(1),
    rock_2: createRockSprite(2),
    gate_left: createGateSprite('left'),
    gate_right: createGateSprite('right'),
    bufo_a: createBufoSprite(0),
    bufo_b: createBufoSprite(1),
  };

  get(spriteId: SpriteId): Sprite {
    return this.sprites[spriteId];
  }
}
