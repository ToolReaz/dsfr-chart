<svelte:options customElement={{ tag: "gauge-chart", shadow: "none" }} />

<script>
  import { formatNumber } from '@/utils/global.js';

  let {
    value = '',
    percent = '',
    init,
    target,
    initDate = '',
    targetDate = '',
    height = '2rem',
    legend = true,
    date = '',
    databoxId = null,
    databoxType = null,
    databoxSource = 'default',
  } = $props();

  let percentage = $state(0);
  let width = $state(0);

  function createChart() {
    if (!percent) {
      percentage = Math.round((100 * (value - init)) / (target - init));
    } else {
      percentage = Math.round(percent);
    }
    width = Math.min(100, percentage);
  }

  $effect(() => {
    value; percent; init; target; initDate; targetDate; height; legend; date;
    if (!value && !percent) return;
    createChart();
  });

  function isLegend() {
    return legend === true || legend === 'true';
  }
</script>

<div class="widget_container fr-grid-row">
  <div class="fr-col-12">
    <div class="chart">
      <div class="gauge-container">
        <div class="jauge" style="height: {height}">
          <div class="jauge-fill" style="width: {width}%">
            <span class="jauge-text fr-text fr-text--sm fr-text-title--blue-france fr-pl-1w">{percentage}%</span>
          </div>
        </div>
      </div>
      <div class="gauge-container">
        <p class="fr-text--xs fr-text-mention--grey fr-mt-1w fr-mb-0">
          {formatNumber(init)}
        </p>
        <p class="fr-text--xs fr-text-mention--grey fr-mt-1w fr-mb-0 fr-ml-auto fr-mr-0">
          {formatNumber(target)}
        </p>
      </div>

      {#if initDate && targetDate}
        <div class="gauge-container">
          <p class="fr-text--xs fr-text-mention--grey">{initDate}</p>
          <p class="fr-text--xs fr-text-mention--grey fr-ml-auto fr-mr-0">{targetDate}</p>
        </div>
      {/if}

      {#if isLegend()}
        <div class="flex">
          <span class="legende_dot target_legend"></span>
          <p class="fr-text--sm fr-text--bold fr-ml-2v fr-mb-0">Valeur cible</p>
        </div>
        <div class="flex fr-mt-3v fr-mb-1v">
          <span class="legende_dot actual_legend"></span>
          <p class="fr-text--sm fr-text--bold fr-ml-2v fr-mb-0">Valeur actuelle</p>
        </div>
      {/if}

      {#if date}
        <div class="flex fr-mt-1w">
          <p class="fr-text--xs">Mise à jour : {date}</p>
        </div>
      {/if}
    </div>
  </div>
</div>
