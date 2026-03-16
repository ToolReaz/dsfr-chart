<svelte:options customElement={{ tag: "data-box", shadow: "none" }} />

<script>
  import { onMount } from 'svelte';
  import { toPng } from 'html-to-image';
  import { slugify } from '@/utils/global.js';
  import DialogModal from '@/components/DialogModal.svelte';

  let {
    id,
    title,
    tooltipTitle = '',
    tooltipContent = '',
    modalTitle = '',
    modalContent = '',
    source,
    date,
    defaultSource = null,
    trend = null,
    segmentedControl = true,
    fullscreen = false,
    screenshot = false,
    download = false,
    actions = '[]',
  } = $props();

  let chartSources = $state([]);
  let tableSources = $state([]);
  let currentSource = $state('');
  let selectedView = $state('chart');

  function isTruthy(val) {
    return [true, 'true', ''].includes(val);
  }

  function parsedActions() {
    return typeof actions === 'string' ? JSON.parse(actions) : actions;
  }

  function generateOptions(sourceList) {
    return sourceList.map((option) => ({
      label: option.charAt(0).toUpperCase() + option.slice(1).replace(/-/g, ' '),
      value: option,
    }));
  }

  function changeView(view) {
    selectedView = view;
  }

  function downloadCSV(mode) {
    const dom = document.querySelector(`[databox-id="${id}"][databox-type="${mode}"][databox-source="${currentSource}"]`);
    const xData = JSON.parse(dom.getAttribute('x'));
    const yData = JSON.parse(dom.getAttribute('y'));
    const nameData = JSON.parse(dom.getAttribute('name'));
    const tableNameData = dom.getAttribute('table-name') ?? '';

    let csv = [];
    csv.push(tableNameData + ',' + nameData.join(',') + '\n');
    const rows = mode === 'chart' ? xData[0] : xData;
    rows.forEach((xItem, i) => {
      csv.push(`${xItem},${yData.map((yItem) => yItem[i]).join(',')}\n`);
    });

    const blob = new Blob(csv, { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'data.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  }

  function screenshotChart() {
    const databox = document.getElementById(`container-${id}`);
    const dom = databox.querySelectorAll('.screenshot-hide-' + id);
    dom.forEach((item) => (item.style.display = 'none'));

    const data = databox.querySelector('.databox__data');
    const select = databox.querySelector(`#select-${id}`);
    const tendency = databox.querySelector('.databox__tendency');

    data.style.display = 'block';
    if (select) {
      select.style.boxShadow = 'none';
      select.style.appearance = 'none';
    }
    if (tendency) tendency.style.marginTop = '20px';

    toPng(databox)
      .then((dataUrl) => {
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = 'chart.png';
        a.click();
      })
      .catch((error) => {
        console.error('Error while taking screenshot', error);
      })
      .finally(() => {
        dom.forEach((item) => item.style.removeProperty('display'));
        data.style.removeProperty('display');
        if (select) {
          select.style.removeProperty('box-shadow');
          select.style.removeProperty('appearance');
        }
        if (tendency) tendency.style.removeProperty('margin-top');
      });
  }

  onMount(() => {
    chartSources = [...document.querySelectorAll(`[databox-id="${id}"][databox-type="chart"]`)].map((el) => el.getAttribute('databox-source') || 'default');
    tableSources = [...document.querySelectorAll(`[databox-id="${id}"][databox-type="table"]`)].map((el) => el.getAttribute('databox-source') || 'global');
    currentSource = chartSources.includes(defaultSource) ? defaultSource : chartSources[0];
    selectedView = chartSources.length > 0 ? 'chart' : 'table';
  });
</script>

<div id="container-{id}" class="fr-card fr-card--shadow databox">
  <!-- Header -->
  <div class="fr-p-2w databox__header">
    <h3 class="fr-h6 fr-mb-0">{title}</h3>

    <div class="flex screenshot-hide-{id}">
      <!-- Tooltip -->
      <button
        class="fr-btn--tooltip fr-btn"
        type="button"
        aria-describedby="tooltip-{id}"
        title="Informations complémentaires sur le graphique"
      >
        Informations complémentaires sur le graphique
      </button>

      {#if tooltipTitle || tooltipContent}
        <div id="tooltip-{id}" class="fr-tooltip fr-placement" role="tooltip" aria-hidden="true">
          {#if tooltipTitle}
            <p class="fr-text--xs fr-mb-0 fr-text--bold">{tooltipTitle}</p>
          {/if}
          {#if tooltipContent}
            <p class="fr-text--xs fr-mb-0">{tooltipContent}</p>
          {/if}
        </div>
      {/if}

      <!-- Modal -->
      {#if isTruthy(fullscreen)}
        <button
          type="button"
          class="fr-btn fr-btn--sm fr-icon-fullscreen-line fr-btn--tertiary-no-outline fr-ratio-1x1"
          data-fr-opened="false"
          aria-controls="modal-{id}"
          title="Afficher la modale"
        ></button>
      {/if}

      <!-- More actions -->
      {#if isTruthy(screenshot) || isTruthy(download) || parsedActions().length}
        <nav role="navigation" class="fr-translate fr-nav more-actions-menu">
          <div class="fr-nav__item fr-nav__item--align-right">
            <button
              class="fr-btn fr-btn--sm fr-icon-more-line fr-btn--tertiary-no-outline fr-ratio-1x1"
              aria-controls="translate-{id}"
              aria-expanded="false"
              title="Plus d'actions"
            ></button>
            <div id="translate-{id}" class="fr-collapse fr-translate__menu fr-menu">
              <ul class="fr-menu__list">
                {#if isTruthy(screenshot)}
                  <li>
                    <button class="fr-translate__language fr-nav__link" title="Prendre une capture d'écran" onclick={screenshotChart}>
                      Capture d'écran
                    </button>
                  </li>
                {/if}
                {#if isTruthy(download)}
                  <li>
                    <button class="fr-translate__language fr-nav__link" title="Télécharger les données en CSV" onclick={() => downloadCSV(selectedView)}>
                      Télécharger en CSV
                    </button>
                  </li>
                {/if}
                {#each parsedActions() as action}
                  <li>
                    <button id={slugify(action)} class="fr-translate__language fr-nav__link" title={action}>
                      {action}
                    </button>
                  </li>
                {/each}
              </ul>
            </div>
          </div>
        </nav>
      {/if}
    </div>
  </div>

  <div class="fr-px-2w databox__data">
    <!-- Source -->
    {#if chartSources.length > 1}
      <div class="databox__source">
        <div class="fr-select-group">
          <label class="fr-label fr-text--xs fr-mb-0" for="select-{id}">
            Choisir une source de données
          </label>
          <select id="select-{id}" bind:value={currentSource} name="select" class="fr-select fr-mt-0">
            {#each generateOptions(chartSources) as option}
              <option value={option.value}>{option.label}</option>
            {/each}
          </select>
        </div>
      </div>
    {/if}

    <!-- Tendency -->
    {#if trend}
      <div class="databox__tendency">
        {#if trend.includes('-')}
          <p class="fr-text--xs fr-m-0">
            En baisse
            <span class="fr-badge fr-badge--error fr-badge--no-icon fr-badge--sm fr-ml-1v" aria-label="Baisse de {trend.replace('-', '').trim()}">
              <span class="fr-pr-1v screenshot-hide-{id}" aria-hidden="true">↘ </span>
              {trend.replace('-', '').trim()}
            </span>
          </p>
        {:else}
          <p class="fr-text--xs fr-m-0">
            En hausse
            <span class="fr-badge fr-badge--success fr-badge--no-icon fr-badge--sm fr-ml-1v" aria-label="Hausse de {trend.trim()}">
              <span class="fr-pr-1v screenshot-hide-{id}" aria-hidden="true">↗ </span>
              {trend.trim()}
            </span>
          </p>
        {/if}
      </div>
    {/if}
  </div>

  <!-- Content -->
  <div class="fr-p-2w databox__content">
    <div class={selectedView === 'table' ? 'fr-hidden' : 'w-full'} aria-hidden={selectedView === 'chart'}>
      {#each chartSources as chartSource}
        <div id="{id}-chart-{chartSource}" class={currentSource !== chartSource ? 'fr-hidden' : ''}></div>
      {/each}
    </div>
    <div class={selectedView === 'chart' ? 'fr-hidden' : 'w-full'} aria-hidden={selectedView === 'table'}>
      {#each tableSources.filter((s) => s !== 'global') as tableSource}
        <div id="{id}-table-{tableSource}" class={currentSource !== tableSource ? 'fr-hidden' : ''}></div>
      {/each}
      {#if tableSources.includes('global')}
        <div id="{id}-table-global" class={tableSources.includes(currentSource) ? 'fr-hidden' : ''}></div>
      {/if}
    </div>
  </div>

  <!-- Footer -->
  <div class="fr-p-2w databox__footer">
    <p class="fr-text--xs fr-mb-0">{source}, {date}</p>

    {#if isTruthy(segmentedControl) && chartSources.length > 0}
      <fieldset class="fr-segmented fr-segmented--no-legend fr-segmented--sm screenshot-hide-{id}">
        <legend class="fr-segmented__legend">Choisir votre vue</legend>
        <div class="fr-segmented__elements">
          <div class="fr-segmented__element">
            <input id="segmented-chart-{id}" value="1" type="radio" checked name="segmented-{id}" onchange={() => changeView('chart')}>
            <label class="fr-label" for="segmented-chart-{id}">
              <span class="fr-icon-pie-chart-2-fill fr-icon--sm" aria-hidden="true"></span>
              <span class="fr-sr-only">Vue graphique</span>
            </label>
          </div>
          <div class="fr-segmented__element">
            <input id="segmented-table-{id}" value="2" type="radio" name="segmented-{id}" onchange={() => changeView('table')}>
            <label class="fr-label" for="segmented-table-{id}">
              <span class="fr-icon-table-2 fr-icon fr-icon--sm" aria-hidden="true"></span>
              <span class="fr-sr-only">Vue tableau</span>
            </label>
          </div>
        </div>
      </fieldset>
    {/if}
  </div>
</div>

<!-- Modal teleported to body via JS since Svelte has no Teleport -->
{#if isTruthy(fullscreen)}
  <DialogModal {id} {modalTitle} {modalContent} />
{/if}
