import '../node_modules/@gouvfr/dsfr/dist/dsfr.module.min.js';
import '../node_modules/@gouvfr/dsfr/dist/dsfr.main.min.css';
import '../node_modules/@gouvfr/dsfr/dist/utility/icons/icons.main.min.css';

import '@/styles/style.scss';

// Import all Svelte chart components to register them as custom elements
import '@/components/BarChart.svelte';
import '@/components/LineChart.svelte';
import '@/components/PieChart.svelte';
import '@/components/RadarChart.svelte';
import '@/components/GaugeChart.svelte';
import '@/components/ScatterChart.svelte';
import '@/components/BarLineChart.svelte';
import '@/components/TableChart.svelte';
import '@/components/DataBox.svelte';
import '@/components/DialogModal.svelte';
import '@/components/MapChart.svelte';
import '@/components/MapChartReg.svelte';

import { mount } from 'svelte'
import Documentation from '@/components/doc/Documentation.svelte';

const app = mount(Documentation, {
  target: document.getElementById('app'),
})

export default app
