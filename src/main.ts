import './style.css';
import { SkiGameEngine } from './game/engine';
import { InputController } from './game/input';
import { CanvasRenderer } from './game/renderer';

const BEST_SCORE_KEY = 'skifree-modern-best-score';

const createLabelValue = (label: string): { wrapper: HTMLDivElement; value: HTMLSpanElement } => {
  const wrapper = document.createElement('div');
  wrapper.className = 'hud-item';

  const labelElement = document.createElement('span');
  labelElement.className = 'hud-label';
  labelElement.textContent = label;

  const value = document.createElement('span');
  value.className = 'hud-value';
  value.textContent = '0';

  wrapper.append(labelElement, value);
  return { wrapper, value };
};

const readBestScore = (): number => {
  try {
    const rawValue = Number(localStorage.getItem(BEST_SCORE_KEY));
    if (!Number.isFinite(rawValue) || rawValue < 0) {
      return 0;
    }
    return Math.floor(rawValue);
  } catch {
    return 0;
  }
};

const writeBestScore = (value: number): void => {
  try {
    localStorage.setItem(BEST_SCORE_KEY, String(Math.max(0, Math.floor(value))));
  } catch {
    // Ignore localStorage write errors in private browsing contexts.
  }
};

const app = document.querySelector<HTMLDivElement>('#app');
if (!app) {
  throw new Error('Missing #app root element');
}

const page = document.createElement('div');
page.className = 'page';

const title = document.createElement('h1');
title.className = 'title';
title.textContent = 'SkiFree Modern Clone';

const subtitle = document.createElement('p');
subtitle.className = 'subtitle';
subtitle.textContent = 'Classic downhill chaos rebuilt for modern browsers and touch screens.';

const gameShell = document.createElement('section');
gameShell.className = 'game-shell';

const canvas = document.createElement('canvas');
canvas.className = 'game-canvas';
canvas.setAttribute('aria-label', 'Ski game canvas');

const hud = document.createElement('div');
hud.className = 'hud';

const score = createLabelValue('Score');
const best = createLabelValue('Best');
hud.append(score.wrapper, best.wrapper);

const gameOver = document.createElement('div');
gameOver.className = 'game-over';

const gameOverTitle = document.createElement('h2');
gameOverTitle.textContent = 'You crashed!';
gameOver.appendChild(gameOverTitle);

const gameOverHint = document.createElement('p');
gameOverHint.textContent = 'Tap restart or press Space to try again.';
gameOver.appendChild(gameOverHint);

const restartButton = document.createElement('button');
restartButton.className = 'restart-button';
restartButton.type = 'button';
restartButton.textContent = 'Restart run';
gameOver.appendChild(restartButton);

const touchControls = document.createElement('div');
touchControls.className = 'touch-controls';

const touchLeftButton = document.createElement('button');
touchLeftButton.type = 'button';
touchLeftButton.className = 'touch-button';
touchLeftButton.textContent = '←';
touchLeftButton.setAttribute('aria-label', 'Steer left');

const touchRightButton = document.createElement('button');
touchRightButton.type = 'button';
touchRightButton.className = 'touch-button';
touchRightButton.textContent = '→';
touchRightButton.setAttribute('aria-label', 'Steer right');

touchControls.append(touchLeftButton, touchRightButton);

const help = document.createElement('p');
help.className = 'help';
help.textContent = 'Desktop: Arrow keys / A-D. Touch: drag on slope or use left-right buttons.';

gameShell.append(canvas, hud, gameOver, touchControls);
page.append(title, subtitle, gameShell, help);
app.appendChild(page);

const bestScore = readBestScore();
const renderer = new CanvasRenderer(canvas);
const engine = new SkiGameEngine({
  viewportWidth: gameShell.clientWidth,
  bestScore,
});
const input = new InputController({
  steeringSurface: canvas,
  touchLeftButton,
  touchRightButton,
});

const resize = (): void => {
  const bounds = gameShell.getBoundingClientRect();
  renderer.resize(bounds.width, bounds.height);
  engine.setViewportWidth(renderer.getViewportWidth());
};
window.addEventListener('resize', resize);
resize();

const restartRun = (): void => {
  engine.restart();
  gameOver.classList.remove('is-visible');
};

restartButton.addEventListener('click', restartRun);

window.addEventListener('keydown', (event) => {
  if (event.code !== 'Space') {
    return;
  }

  if (!engine.getState().gameOver) {
    return;
  }

  event.preventDefault();
  restartRun();
});

let lastFrameTime = performance.now();
const frame = (now: number): void => {
  const delta = now - lastFrameTime;
  lastFrameTime = now;

  engine.update(delta, input.getSteeringAxis());
  const state = engine.getState();
  renderer.render(state);

  score.value.textContent = String(state.score);
  best.value.textContent = String(state.bestScore);
  writeBestScore(state.bestScore);

  if (state.gameOver) {
    gameOver.classList.add('is-visible');
  } else {
    gameOver.classList.remove('is-visible');
  }

  window.requestAnimationFrame(frame);
};

window.requestAnimationFrame(frame);

window.addEventListener('beforeunload', () => {
  input.dispose();
});
