---
name: Svelte migration project
description: Full migration of chart web components from Vue.js to Svelte, not just documentation
type: project
---

The goal is to convert the entire dsfr-chart library from Vue.js to Svelte, keeping web components as the output format (custom elements).

**Why:** User decision to migrate the full library, not just the documentation page. Both chart components and documentation should move to Svelte.

**How to apply:** When working on this project, focus on converting Vue chart components (.vue) to Svelte components (.svelte) with `customElement: true`. The build pipeline (Vite) needs to use the Svelte plugin for custom element compilation instead of Vue's `defineCustomElement()`. All existing chart functionality (props, mixins, Chart.js integration, theming, accessibility) must be preserved in the Svelte versions.
