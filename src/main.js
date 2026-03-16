import '../node_modules/@gouvfr/dsfr/dist/dsfr.module.min.js';
import '../node_modules/@gouvfr/dsfr/dist/dsfr.main.min.css';
import '../node_modules/@gouvfr/dsfr/dist/utility/icons/icons.main.min.css';

import '@/charts/main.js';
import '@/styles/style.scss';

// import { createApp } from 'vue';
// import Documentation from '@/components/doc/Documentation.vue';

// document.addEventListener('DOMContentLoaded', function () {
//   if (window.dsfr && window.dsfr.start) {
//     window.dsfr.start();
//   }
// });

// createApp(Documentation).mount('#app');

import { mount } from 'svelte'
import Documentation from '@/components/doc/Documentation.svelte';

const app = mount(Documentation, {
  target: document.getElementById('app'),
})

export default app
