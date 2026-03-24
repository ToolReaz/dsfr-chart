<svelte:options customElement={{ tag: "map-chart-reg", shadow: "none" }} />

<script>
  import { onDestroy, untrack, tick } from 'svelte';
  import * as d3 from 'd3-scale';
  import { getDep, getReg, getDepsFromReg, isMobile, formatNumber, teleportToDatabox } from '@/utils/global.js';
  import { choosePalette } from '@/utils/colors.js';
  import MapInfo from '@/components/MapInfo.svelte';
  import France from '@/components/maps/France.svelte';

  let {
    data,
    value = '',
    date = '',
    region = '',
    name = 'Data',
    selectedPalette = 'sequentialAscending',
    databoxId = null,
    databoxType = null,
    databoxSource = 'default',
  } = $props();

  let widgetId = 'dsfr-widget-' + Math.floor(Math.random() * 1000);
  let widgetEl;

  let dataParse = {};
  let scaleMin = 0;
  let scaleMax = 0;
  let colorLeft = '';
  let colorRight = '';

  let zoomDep = $state('');

  let InfoProps = $state({
    localisation: '',
    names: [],
    min: 0,
    max: 0,
    colorMin: '',
    colorMax: '',
    value: 0,
    valueReg: 0,
    date: '',
  });

  let FranceProps = $state({
    viewBox: '0 0 1010 1010',
    displayDep: {},
    colorStroke: '#FFFFFF',
  });

  let tooltip = $state({
    top: '0px',
    left: '0px',
    visibility: 'hidden',
    value: 0,
    place: '',
  });

  let displayFrance = $state('');

  function createChart() {
    const parentWidget = widgetEl;
    if (!parentWidget) return;

    try {
      dataParse = JSON.parse(data);
    } catch (error) {
      console.error('Erreur lors du parsing des données data:', error);
      return;
    }

    const palette = choosePalette(selectedPalette);
    colorLeft = palette[0];
    colorRight = palette[palette.length - 1];
    InfoProps.colorMin = colorLeft;
    InfoProps.colorMax = colorRight;
    InfoProps.date = date;
    InfoProps.names = name;

    const values = [];
    let listDep = [];

    FranceProps.displayDep = {};

    // Afficher uniquement les départements de la région sélectionnée
    listDep = getDepsFromReg(region);
    for (const key of listDep) {
      values.push(dataParse[key]);
    }

    scaleMin = Math.min(...values);
    scaleMax = Math.max(...values);

    const colorScale = d3.scaleLinear().domain([scaleMin, scaleMax]).range([colorLeft, colorRight]);

    let xmin = [], xmax = [], ymin = [], ymax = [];

    // Masquer tous les départements
    for (const key in dataParse) {
      const className = 'FR-' + key;
      const elCol = parentWidget.getElementsByClassName(className);
      elCol.length !== 0 && elCol[0].setAttribute('fill', 'rgba(255, 255, 255, 0)');
      FranceProps.displayDep[className] = 'none';
    }

    // Colorier les départements de la région
    for (const key of listDep) {
      const className = 'FR-' + key;
      const elCol = parentWidget.getElementsByClassName(className);

      if (!zoomDep) {
        if (listDep.includes(key)) {
          const polygon = elCol[0]?.getBBox();
          if (!polygon) continue;
          elCol.length !== 0 && elCol[0].setAttribute('fill', colorScale(dataParse[key]));
          FranceProps.displayDep[className] = '';
          xmin.push(polygon.x);
          ymin.push(polygon.y);
          xmax.push(polygon.x + polygon.width);
          ymax.push(polygon.y + polygon.height);
        }
      } else {
        if (zoomDep === key) {
          const polygon = elCol[0]?.getBBox();
          if (!polygon) continue;
          elCol.length !== 0 && elCol[0].setAttribute('fill', colorScale(dataParse[key]));
          FranceProps.displayDep[className] = '';
          xmin.push(polygon.x);
          ymin.push(polygon.y);
          xmax.push(polygon.x + polygon.width);
          ymax.push(polygon.y + polygon.height);
        } else if (listDep.includes(key)) {
          const polygon = elCol[0]?.getBBox();
          if (!polygon) continue;
          elCol.length !== 0 && elCol[0].setAttribute('fill', colorLeft + 'B3');
          FranceProps.displayDep[className] = '';
          xmin.push(polygon.x);
          ymin.push(polygon.y);
          xmax.push(polygon.x + polygon.width);
          ymax.push(polygon.y + polygon.height);
        }
      }
    }

    // Calculer le viewBox pour centrer sur la région
    if (xmin.length && ymin.length && xmax.length && ymax.length) {
      const xminValue = Math.min(...xmin);
      const yminValue = Math.min(...ymin);
      const xmaxValue = Math.max(...xmax);
      const ymaxValue = Math.max(...ymax);
      const width = xmaxValue - xminValue;
      const height = ymaxValue - yminValue;
      const size = Math.max(width, height);
      FranceProps.viewBox = `${xminValue} ${yminValue} ${size} ${size}`;
    }

    InfoProps.localisation = getReg(region).department;
    InfoProps.value = value;
    InfoProps.valueReg = dataParse[zoomDep];
    InfoProps.min = scaleMin;
    InfoProps.max = scaleMax;
  }

  function displayTooltip(e) {
    if (isMobile()) return;
    const parentWidget = widgetEl;
    const hoverElement = e.target.className.baseVal;
    const hoverValue = hoverElement.replace('FR-', '');

    const elCol = parentWidget.getElementsByClassName(hoverElement);
    elCol[0].style.opacity = 0.8;
    tooltip.value = dataParse[hoverValue];
    tooltip.place = getDep(hoverValue).department;

    const franceRect = parentWidget.querySelector('.france_container').getBoundingClientRect();
    const tooltipRect = parentWidget.querySelector('.map_tooltip').getBoundingClientRect();
    const containerRect = e.target.getBoundingClientRect();

    const adjust = window.innerWidth > 1000 ? window.innerWidth / 30 : window.innerWidth / 15;

    let tooltipX = containerRect.x - franceRect.x + tooltipRect.width - adjust;
    let tooltipY = containerRect.y - franceRect.y;

    if (tooltipX + tooltipRect.width + adjust > franceRect.x) {
      tooltipX = containerRect.x / 2 - franceRect.x + tooltipRect.width + adjust / 2;
    }

    tooltip.top = tooltipY + 'px';
    tooltip.left = tooltipX + 'px';
    tooltip.visibility = 'visible';
  }

  function hideTooltip(e) {
    if (isMobile()) return;
    tooltip.visibility = 'hidden';
    const parentWidget = widgetEl;
    const hoverElement = e.target.className.baseVal;

    const elCol = parentWidget.getElementsByClassName(hoverElement);
    elCol[0].style.opacity = 1;
  }

  function changeGeoLevel(e) {
    const hoverValue = e.target.className.baseVal.replace('FR-', '');
    zoomDep = hoverValue;
    createChart();
  }

  function resetGeoFilters() {
    zoomDep = '';
    createChart();
  }

  function changeTheme(theme) {
    if (theme === 'light') {
      FranceProps.colorStroke = '#FFFFFF';
    } else {
      FranceProps.colorStroke = '#161616';
    }
    createChart();
  }

  function handleThemeChange(e) {
    changeTheme(e.detail.theme);
  }

  onDestroy(() => {
    document.documentElement.removeEventListener('dsfr.theme', handleThemeChange);
  });

  $effect(() => {
    data; value; date; region; name; selectedPalette;

    if (!widgetEl) return;

    untrack(async () => {
      teleportToDatabox(widgetEl);
      await tick();
      createChart();
      document.documentElement.addEventListener('dsfr.theme', handleThemeChange);
    });
  });
</script>

<div bind:this={widgetEl} class="widget_container fr-grid-row">
  <MapInfo data={InfoProps} />
  <div class="fr-col-12 fr-col-lg-9 align-stretch">
    {#if zoomDep}
      <button
        class="fr-btn fr-btn--sm fr-icon-arrow-go-back-fill fr-btn--icon-left fr-btn--tertiary-no-outline fr-ml-4w"
        onclick={resetGeoFilters}
      >
        Retour
      </button>
    {/if}
    <div class="map">
      <div
        class="map_tooltip"
        style:top={tooltip.top}
        style:left={tooltip.left}
        style:visibility={tooltip.visibility}
      >
        <div class="tooltip_header fr-text--sm fr-mb-0">
          {tooltip.place}
        </div>
        <div class="tooltip_body">
          <div class="tooltip_value-content">
            <div class="tooltip_value">
              {tooltip.value}
            </div>
          </div>
        </div>
      </div>
      <div class="france_container no_select" style:display={displayFrance}>
        <France
          config={FranceProps}
          onclick={changeGeoLevel}
          ondblclick={resetGeoFilters}
          onenter={displayTooltip}
          onleave={hideTooltip}
        />
      </div>
    </div>
  </div>
</div>
