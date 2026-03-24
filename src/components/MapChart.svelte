<svelte:options customElement={{ tag: "map-chart", shadow: "none" }} />

<script>
  import { onDestroy, untrack } from 'svelte';
  import * as d3 from 'd3-scale';
  import { getDep, getReg, getAllReg, getDepsFromReg, isMobile, formatNumber } from '@/utils/global.js';
  import { choosePalette } from '@/utils/colors.js';
  import MapInfo from '@/components/MapInfo.svelte';
  import France from '@/components/maps/France.svelte';
  import FranceReg from '@/components/maps/FranceReg.svelte';
  import Guadeloupe from '@/components/maps/Guadeloupe.svelte';
  import Martinique from '@/components/maps/Martinique.svelte';
  import Guyane from '@/components/maps/Guyane.svelte';
  import Reunion from '@/components/maps/Reunion.svelte';
  import Mayotte from '@/components/maps/Mayotte.svelte';

  let {
    data,
    value = '',
    date = '',
    level = 'dep',
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

  let isDep = $state(true);
  let isReg = $state(false);
  let zoomDep = $state('');

  let InfoProps = $state({
    localisation: '',
    names: [],
    min: 0,
    max: 0,
    colorMin: '',
    colorMax: '',
    value: 0,
    valueNat: 0,
    date: '',
  });

  let FranceProps = $state({
    viewBox: '0 0 1010 1010',
    displayDep: {},
    colorStroke: '#FFFFFF',
  });

  let DromProps = $state({
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
  let displayGuadeloupe = $state('');
  let displayMartinique = $state('');
  let displayMayotte = $state('');
  let displayReunion = $state('');
  let displayGuyane = $state('');
  let dromColor = $state('#6b6b6b');

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

    if (zoomDep) {
      if (isDep) {
        const region = getDep(zoomDep).region_value;
        listDep = getDepsFromReg(region);
      } else if (isReg) {
        listDep = getAllReg();
      }

      for (const key of listDep) {
        values.push(dataParse[key]);
      }
    } else {
      for (const key in dataParse) {
        values.push(dataParse[key]);
      }
    }

    scaleMin = Math.min(...values);
    scaleMax = Math.max(...values);

    const colorScale = d3.scaleLinear().domain([scaleMin, scaleMax]).range([colorLeft, colorRight]);

    let xmin = [], xmax = [], ymin = [], ymax = [];

    for (const key in dataParse) {
      const className = 'FR-' + key;
      const elCol = parentWidget.getElementsByClassName(className);

      if (!zoomDep) {
        elCol.length !== 0 && elCol[0].setAttribute('fill', colorScale(dataParse[key]));
        FranceProps.displayDep[className] = '';
      } else {
        const polygon = parentWidget.querySelector('.' + className)?.getBBox();
        if (!polygon) continue;
        if (zoomDep === key) {
          elCol.length !== 0 && elCol[0].setAttribute('fill', colorScale(dataParse[key]));
          FranceProps.displayDep[className] = '';
          xmin.push(polygon.x);
          ymin.push(polygon.y);
          xmax.push(polygon.x + polygon.width);
          ymax.push(polygon.y + polygon.height);
        } else if (listDep.includes(key)) {
          elCol.length !== 0 && elCol[0].setAttribute('fill', colorLeft + 'B3');
          FranceProps.displayDep[className] = '';
          xmin.push(polygon.x);
          ymin.push(polygon.y);
          xmax.push(polygon.x + polygon.width);
          ymax.push(polygon.y + polygon.height);
        } else {
          elCol.length !== 0 && elCol[0].setAttribute('fill', 'rgba(255, 255, 255, 0)');
          FranceProps.displayDep[className] = 'none';
        }
      }
    }

    if (zoomDep) {
      if (isDep) {
        InfoProps.localisation = getDep(zoomDep).department;
        const xminValue = Math.min(...xmin);
        const yminValue = Math.min(...ymin);
        const xmaxValue = Math.max(...xmax);
        const ymaxValue = Math.max(...ymax);
        const width = xmaxValue - xminValue;
        const height = ymaxValue - yminValue;
        const size = Math.max(width, height);
        FranceProps.viewBox = `${xminValue} ${yminValue} ${size} ${size}`;
      } else if (isReg) {
        InfoProps.localisation = getReg(zoomDep).region;
      }
      InfoProps.value = value;
      InfoProps.valueNat = dataParse[zoomDep];

      if (isDep) {
        displayFrance = 'none';
        displayGuadeloupe = 'none';
        displayMartinique = 'none';
        displayMayotte = 'none';
        displayReunion = 'none';
        displayGuyane = 'none';

        if (zoomDep === '971') displayGuadeloupe = '';
        else if (zoomDep === '972') displayMartinique = '';
        else if (zoomDep === '973') displayGuyane = '';
        else if (zoomDep === '974') displayReunion = '';
        else if (zoomDep === '976') displayMayotte = '';
        else displayFrance = '';
      }
    } else {
      InfoProps.localisation = 'France';
      InfoProps.value = value;
      InfoProps.valueNat = 0;
      FranceProps.viewBox = '0 0 1010 1010';
      displayFrance = '';
      displayGuadeloupe = '';
      displayMartinique = '';
      displayMayotte = '';
      displayReunion = '';
      displayGuyane = '';
    }

    InfoProps.names = name;
    InfoProps.min = scaleMin;
    InfoProps.max = scaleMax;
    InfoProps.colorMin = colorLeft;
    InfoProps.colorMax = colorRight;
  }

  function displayTooltip(e) {
    if (isMobile()) return;
    const parentWidget = widgetEl;
    const hoverElement = e.target.className.baseVal;
    const hoverValue = hoverElement.replace('FR-', '');

    const elCol = parentWidget.getElementsByClassName(hoverElement);
    elCol[0].style.opacity = 0.8;
    tooltip.value = dataParse[hoverValue];
    if (isDep) {
      tooltip.place = getDep(hoverValue).department;
    } else if (isReg) {
      tooltip.place = getReg(hoverValue).region;
    }

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
      dromColor = '#6b6b6b';
      FranceProps.colorStroke = '#FFFFFF';
      DromProps.colorStroke = '#FFFFFF';
    } else {
      dromColor = '#cecece';
      FranceProps.colorStroke = '#161616';
      DromProps.colorStroke = '#161616';
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
    data; value; date; level; name; selectedPalette;

    if (!widgetEl) return;

    untrack(() => {
      isDep = level === 'dep';
      isReg = level === 'reg';
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
      {#if isDep}
        <div class="france_container no_select" style:display={displayFrance}>
          <France
            config={FranceProps}
            onclick={changeGeoLevel}
            ondblclick={resetGeoFilters}
            onenter={displayTooltip}
            onleave={hideTooltip}
          />
        </div>
      {/if}
      {#if isReg}
        <div class="france_container no_select" style:display={displayFrance}>
          <FranceReg
            config={FranceProps}
            onclick={changeGeoLevel}
            ondblclick={resetGeoFilters}
            onenter={displayTooltip}
            onleave={hideTooltip}
          />
        </div>
      {/if}
      <div class="om_container fr-grid-row no_select">
        <div class="om fr-col-sm" style:display={displayGuadeloupe}>
          <span class="om_title fr-text--xs fr-my-1w" style:color={dromColor}>Guadeloupe</span>
          <Guadeloupe
            height="50"
            config={DromProps}
            onclick={changeGeoLevel}
            ondblclick={resetGeoFilters}
            onenter={displayTooltip}
            onleave={hideTooltip}
          />
        </div>
        <div class="om fr-col-sm" style:display={displayMartinique}>
          <span class="fr-text--xs fr-my-1w" style:color={dromColor}>Martinique</span>
          <Martinique
            height="50"
            config={DromProps}
            onclick={changeGeoLevel}
            ondblclick={resetGeoFilters}
            onenter={displayTooltip}
            onleave={hideTooltip}
          />
        </div>
        <div class="om fr-col-sm" style:display={displayGuyane}>
          <span class="fr-text--xs fr-my-1w" style:color={dromColor}>Guyane</span>
          <Guyane
            height="50"
            config={DromProps}
            onclick={changeGeoLevel}
            ondblclick={resetGeoFilters}
            onenter={displayTooltip}
            onleave={hideTooltip}
          />
        </div>
        <div class="om fr-col-sm" style:display={displayReunion}>
          <span class="fr-text--xs fr-my-1w" style:color={dromColor}>La Réunion</span>
          <Reunion
            height="50"
            config={DromProps}
            onclick={changeGeoLevel}
            ondblclick={resetGeoFilters}
            onenter={displayTooltip}
            onleave={hideTooltip}
          />
        </div>
        <div class="om fr-col-sm" style:display={displayMayotte}>
          <span class="fr-text--xs fr-my-1w" style:color={dromColor}>Mayotte</span>
          <Mayotte
            height="50"
            config={DromProps}
            onclick={changeGeoLevel}
            ondblclick={resetGeoFilters}
            onenter={displayTooltip}
            onleave={hideTooltip}
          />
        </div>
      </div>
    </div>
  </div>
</div>
