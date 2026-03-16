# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DSFR Chart (`@gouvfr/dsfr-chart`) is a French government design system (DSFR) web components library for data visualization. Vue 3 chart components are wrapped via `defineCustomElement()` into custom elements (light DOM, no Shadow DOM). The documentation page is being migrated from Vue to Svelte (chart components remain Vue).

## Commands

| Task | Command |
|------|---------|
| Dev server (localhost:5173) | `npm run dev` |
| Build all components | `npm run build` |
| Build docs | `npm run build:docs` |
| Build single component | `npm run build-bar`, `npm run build-line`, etc. |
| Lint | `npm run lint` |
| Storybook (localhost:6006) | `npm run storybook` |
| Run tests | `npm test` |
| Update snapshots | `npm run test:update-snapshots` |
| Tests in Docker | `docker compose up test` |
| Update snapshots in Docker | `docker compose up snapshots` |

Tests require both Storybook and the dev server running. Use Docker for consistent snapshot environments.

## Architecture

**Two Vite configs:**
- `vite.config.js` — Dev/docs build (Svelte plugin, outputs to `docs/`)
- `vite-components.config.js` — Component library build (Vue plugin, outputs to `dist/`). Uses `LIBRARY` env var to select which component to build.

**Source layout:**
- `src/charts/main.js` — Registers all chart web components via `defineCustomElement()`
- `src/charts/[ChartName].js` — Individual chart exports for tree-shaking
- `src/components/*.vue` — Vue chart components (BarChart, LineChart, PieChart, RadarChart, GaugeChart, MapChart, ScatterChart, TableChart, BarLineChart, DataBox)
- `src/components/maps/` — SVG-based interactive map components (France regions/departments)
- `src/components/doc/` — Documentation components (Svelte migration in progress)
- `src/utils/colors.js` — Color palette generation (categorical, divergent, sequential)
- `src/utils/global.js` — Shared chart mixins, Chart.js setup, utility functions
- `src/stories/` — Storybook stories (one per component)
- `tests/` — Playwright visual regression tests with snapshots in `tests/__snapshots__/`

**Key dependencies:** Chart.js for rendering, Chroma-js for colors, D3-scale for scaling, html-to-image for export, DSFR for design tokens/CSS.

**Path alias:** `@` → `./src`

## Conventions

- Documentation, comments, and UI strings are in **French**
- Components use Vue `chartMixins` for shared behavior (props, lifecycle, theming)
- Common props across charts: `x`, `y`, `title`, `palette`, `selectedPalette`, `colorParse`, `date`, `accessibility`
- ESLint flat config with vue/recommended; `vue/multi-word-component-names` is disabled
- Package type is ES module
- NPM exports support both ESM (`.js`) and UMD (`.umd.cjs`) with per-component CSS

## Testing

Visual regression tests use Playwright (Chromium, 1920x1080 viewport). Tests dynamically discover Storybook stories and screenshot each one. Snapshots are compared pixel-by-pixel. Always use Docker for updating snapshots to ensure consistency.
