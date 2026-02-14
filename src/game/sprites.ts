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
  createSprite(86, 92, 43, 71, (ctx) => {
    const lean = direction * 7.5;
    const stride = frame === 0 ? -2.2 : 2.2;
    const torsoY = 26;

    ctx.fillStyle = 'rgb(30 43 62 / 26%)';
    ctx.beginPath();
    ctx.ellipse(43, 76, 22, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#313d54';
    ctx.lineWidth = 4.2;
    ctx.beginPath();
    ctx.moveTo(22 + lean, 47);
    ctx.lineTo(17 + lean - direction * 6, 84);
    ctx.moveTo(63 + lean, 47);
    ctx.lineTo(68 + lean - direction * 6, 84);
    ctx.stroke();

    ctx.strokeStyle = '#545f74';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(43 + lean - 7, 52);
    ctx.lineTo(41 + lean - 8, 58 + stride);
    ctx.moveTo(43 + lean + 7, 52);
    ctx.lineTo(45 + lean + 8, 58 - stride);
    ctx.stroke();

    ctx.fillStyle = '#e13f2f';
    ctx.fillRect(33 + lean, torsoY, 20, 19);
    ctx.fillStyle = '#f06b4d';
    ctx.fillRect(35 + lean, torsoY + 2, 7, 7);

    ctx.fillStyle = '#1f63ad';
    ctx.fillRect(31 + lean, torsoY + 18, 24, 19);
    ctx.fillStyle = '#2f7fd3';
    ctx.fillRect(35 + lean, torsoY + 22, 7, 8);

    ctx.strokeStyle = '#4f5d74';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(42 + lean, torsoY + 7);
    ctx.lineTo(31 + lean - direction * 5, torsoY + 19 + stride);
    ctx.moveTo(44 + lean, torsoY + 8);
    ctx.lineTo(55 + lean - direction * 5, torsoY + 19 - stride);
    ctx.stroke();

    ctx.fillStyle = '#f5debf';
    ctx.beginPath();
    ctx.arc(43 + lean, 21, 6.6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#121f39';
    ctx.fillRect(36 + lean, 12, 14, 4.4);
    ctx.fillStyle = '#55b8ea';
    ctx.fillRect(37 + lean, 16, 12, 3.6);

    ctx.fillStyle = '#e65245';
    ctx.beginPath();
    ctx.moveTo(36 + lean, 26);
    ctx.lineTo(30 + lean + direction * 3, 29);
    ctx.lineTo(25 + lean + direction * 7, 31 + stride * 0.4);
    ctx.lineTo(30 + lean + direction * 6, 34 + stride * 0.4);
    ctx.closePath();
    ctx.fill();
  });

const createSkierCrashSprite = (): Sprite =>
  createSprite(90, 92, 45, 71, (ctx) => {
    ctx.fillStyle = 'rgb(30 43 62 / 26%)';
    ctx.beginPath();
    ctx.ellipse(45, 77, 24, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#313d54';
    ctx.lineWidth = 4.4;
    ctx.beginPath();
    ctx.moveTo(16, 52);
    ctx.lineTo(8, 86);
    ctx.moveTo(74, 50);
    ctx.lineTo(83, 86);
    ctx.stroke();

    ctx.fillStyle = '#932f2f';
    ctx.fillRect(34, 28, 22, 17);
    ctx.fillStyle = '#1f63ad';
    ctx.fillRect(31, 44, 25, 18);
    ctx.fillStyle = '#f5debf';
    ctx.beginPath();
    ctx.arc(49, 24, 6.7, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#121f39';
    ctx.fillRect(42, 15, 14, 4.4);
    ctx.fillStyle = '#55b8ea';
    ctx.fillRect(43, 19, 12, 3.6);

    ctx.fillStyle = '#5a6579';
    ctx.fillRect(36, 55, 4, 9);
    ctx.fillRect(48, 56, 4, 9);
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

    ctx.fillStyle = 'rgb(30 43 28 / 26%)';
    ctx.beginPath();
    ctx.ellipse(55, 81, 30, 9, 0, 0, Math.PI * 2);
    ctx.fill();

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
