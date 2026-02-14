# SkiFree Modern Clone

A modern browser remake of the classic SkiFree style game, built with TypeScript, Canvas, and Vite.

## Highlights

- Retro-inspired visuals and downhill gameplay similar to the original.
- Smooth touch controls for mobile web (drag-to-steer + on-screen left/right buttons).
- Keyboard support for desktop (`ArrowLeft`/`ArrowRight` or `A`/`D`).
- Dynamic progression: speed ramps up as distance grows.
- A bufo chase phase triggers at higher distance and can end the run.
- Slalom gates and obstacle density scale up with difficulty.
- Hybrid sprite renderer for skier/bufo/obstacles with retro-inspired style.
- Clean modular architecture (`engine`, `renderer`, `input`, `physics`).
- Automated tests with Vitest.
- CI on GitHub Actions for lint, tests, and production build.
- Optional GitHub Pages deploy workflow.

## Quick start

```bash
npm install
npm run dev
```

Open the local URL printed by Vite.

## Scripts

- `npm run dev` — start development server
- `npm run lint` — run ESLint
- `npm run test` — run Vitest in CI mode
- `npm run test:watch` — run Vitest in watch mode
- `npm run build` — type-check + production build
- `npm run preview` — preview production build locally
- `npm run ci` — lint + test + build

## Deploy and hosting

This app is static and easy to host on any CDN/static host.

### GitHub Pages

1. Enable Pages in your repository settings (`GitHub Actions` source).
2. Ensure your default branch is `main`.
3. Push changes — `.github/workflows/deploy_pages.yml` builds and deploys automatically.

### Netlify / Vercel / Cloudflare Pages

- Build command: `npm run build`
- Publish directory: `dist`

## Project structure

```text
src/
  game/
    constants.ts
    engine.ts
    input.ts
    obstacles.ts
    physics.ts
    random.ts
    renderer.ts
    types.ts
    __tests__/
  main.ts
  style.css
.github/workflows/
  ci.yml
  deploy_pages.yml
```

## Development notes

- Best score is persisted with `localStorage`.
- Input uses Pointer Events for touch + mouse support.
- Rendering is done with Canvas 2D and scales for high-DPI screens.
- Runs now end from either obstacle collisions or bufo capture.
