import './gallery.css';
import { SpriteLibrary, type SpriteId } from './game/sprites';

interface VisualState {
  label: string;
  detail: string;
  spriteId: SpriteId;
  scale: number;
}

const app = document.querySelector<HTMLDivElement>('#app');
if (!app) {
  throw new Error('Missing #app root element');
}

const spriteLibrary = new SpriteLibrary();

const page = document.createElement('div');
page.className = 'gallery-page';

const header = document.createElement('header');
header.className = 'gallery-header';

const title = document.createElement('h1');
title.textContent = 'SkiFree Visual Gallery';

const subtitle = document.createElement('p');
subtitle.textContent =
  'Snapshot every sprite/state for quick visual QA without running full gameplay loops.';

const navRow = document.createElement('div');
navRow.className = 'gallery-nav-row';

const gameLink = document.createElement('a');
gameLink.href = '/';
gameLink.className = 'gallery-link';
gameLink.textContent = 'Back to game';

const refreshButton = document.createElement('button');
refreshButton.className = 'gallery-refresh';
refreshButton.type = 'button';
refreshButton.textContent = 'Refresh previews';
refreshButton.addEventListener('click', () => {
  drawAllCards();
});

navRow.append(gameLink, refreshButton);
header.append(title, subtitle, navRow);
page.appendChild(header);

const sectionsHost = document.createElement('main');
sectionsHost.className = 'gallery-sections';
page.appendChild(sectionsHost);

const cardsToDraw: Array<() => void> = [];

const createCard = (state: VisualState): HTMLElement => {
  const card = document.createElement('article');
  card.className = 'state-card';

  const cardTitle = document.createElement('h3');
  cardTitle.textContent = state.label;

  const cardDetail = document.createElement('p');
  cardDetail.textContent = state.detail;

  const preview = document.createElement('canvas');
  preview.width = 176;
  preview.height = 136;
  preview.className = 'state-preview';

  const draw = (): void => {
    const context = preview.getContext('2d');
    if (!context) {
      return;
    }

    context.clearRect(0, 0, preview.width, preview.height);
    context.fillStyle = '#f2f7ff';
    context.fillRect(0, 0, preview.width, preview.height);

    context.strokeStyle = '#d6e6ff';
    for (let x = 0; x < preview.width; x += 16) {
      context.beginPath();
      context.moveTo(x, 0);
      context.lineTo(x, preview.height);
      context.stroke();
    }
    for (let y = 0; y < preview.height; y += 16) {
      context.beginPath();
      context.moveTo(0, y);
      context.lineTo(preview.width, y);
      context.stroke();
    }

    const sprite = spriteLibrary.get(state.spriteId);
    const scaledWidth = sprite.canvas.width * state.scale;
    const scaledHeight = sprite.canvas.height * state.scale;
    const centerX = preview.width / 2;
    const centerY = preview.height * 0.78;
    context.imageSmoothingEnabled = false;
    context.drawImage(
      sprite.canvas,
      centerX - sprite.anchorX * state.scale,
      centerY - sprite.anchorY * state.scale,
      scaledWidth,
      scaledHeight,
    );
  };

  cardsToDraw.push(draw);
  draw();

  card.append(cardTitle, cardDetail, preview);
  return card;
};

const createSection = (
  heading: string,
  description: string,
  states: VisualState[],
): HTMLElement => {
  const section = document.createElement('section');
  section.className = 'gallery-section';

  const sectionHeading = document.createElement('h2');
  sectionHeading.textContent = heading;

  const sectionDescription = document.createElement('p');
  sectionDescription.textContent = description;

  const grid = document.createElement('div');
  grid.className = 'state-grid';
  states.forEach((state) => grid.appendChild(createCard(state)));

  section.append(sectionHeading, sectionDescription, grid);
  return section;
};

const drawAllCards = (): void => {
  cardsToDraw.forEach((draw) => draw());
};

sectionsHost.append(
  createSection(
    'Skier states',
    'Check readability, stance, and crash silhouette.',
    [
      { label: 'Center A', detail: 'neutral carve frame', spriteId: 'skier_center_a', scale: 0.9 },
      { label: 'Center B', detail: 'neutral alt frame', spriteId: 'skier_center_b', scale: 0.9 },
      { label: 'Left A', detail: 'left carve frame', spriteId: 'skier_left_a', scale: 0.9 },
      { label: 'Left B', detail: 'left alt frame', spriteId: 'skier_left_b', scale: 0.9 },
      { label: 'Right A', detail: 'right carve frame', spriteId: 'skier_right_a', scale: 0.9 },
      { label: 'Right B', detail: 'right alt frame', spriteId: 'skier_right_b', scale: 0.9 },
      { label: 'Crash', detail: 'impact/fall frame', spriteId: 'skier_crash', scale: 0.9 },
    ],
  ),
  createSection(
    'Bufo (yeti-style) states',
    'Confirm arms-out and arms-up phases used by chase behavior.',
    [
      { label: 'Arms Out', detail: 'stalking frame A', spriteId: 'bufo_a', scale: 0.85 },
      { label: 'Arms Up', detail: 'stalking/surge frame B', spriteId: 'bufo_b', scale: 0.85 },
      { label: 'Surge Pose', detail: 'arms up, larger silhouette', spriteId: 'bufo_b', scale: 0.97 },
      { label: 'Lunge Pose', detail: 'arms up, max aggression', spriteId: 'bufo_b', scale: 1.1 },
    ],
  ),
  createSection(
    'Obstacle variants',
    'Compare visual consistency across all generated obstacle families.',
    [
      { label: 'Tree 0', detail: 'evergreen variant', spriteId: 'tree_0', scale: 0.62 },
      { label: 'Tree 1', detail: 'evergreen variant', spriteId: 'tree_1', scale: 0.62 },
      { label: 'Tree 2', detail: 'evergreen variant', spriteId: 'tree_2', scale: 0.62 },
      { label: 'Rock 0', detail: 'rock shape variant', spriteId: 'rock_0', scale: 0.78 },
      { label: 'Rock 1', detail: 'rock shape variant', spriteId: 'rock_1', scale: 0.78 },
      { label: 'Rock 2', detail: 'rock shape variant', spriteId: 'rock_2', scale: 0.78 },
      { label: 'Gate Left', detail: 'slalom gate marker', spriteId: 'gate_left', scale: 0.8 },
      { label: 'Gate Right', detail: 'slalom gate marker', spriteId: 'gate_right', scale: 0.8 },
    ],
  ),
);

const checklist = document.createElement('section');
checklist.className = 'gallery-checklist';

const checklistTitle = document.createElement('h2');
checklistTitle.textContent = 'Visual QA checklist';
checklist.appendChild(checklistTitle);

const checklistItems = [
  'Skier body, skis, and poles are readable at glance.',
  'Bufo arms-out and arms-up silhouettes are distinct.',
  'Tree and rock variants keep a consistent palette.',
  'Slalom gate colors remain legible on snow.',
  'Pixel edges stay crisp (no blurred scaling).',
];

const checklistList = document.createElement('ul');
checklistItems.forEach((item) => {
  const li = document.createElement('li');
  li.textContent = item;
  checklistList.appendChild(li);
});

checklist.appendChild(checklistList);
page.appendChild(checklist);
app.appendChild(page);
