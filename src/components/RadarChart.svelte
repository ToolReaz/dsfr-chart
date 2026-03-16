<svelte:options customElement={{ tag: "radar-chart", shadow: "none" }} />

<script>
  import { onMount, onDestroy } from 'svelte';
  import { Chart, RadarController, RadialLinearScale } from 'chart.js';
  import chroma from 'chroma-js';
  import { configureChartDefaults, capitalize } from '@/utils/global.js';
  import { generateColors } from '@/utils/colors.js';

  Chart.register(RadarController, RadialLinearScale);

  let {
    x,
    y,
    name = '',
    date = '',
    aspectRatio = 2,
    selectedPalette = '',
    unitTooltip = '',
    databoxId = null,
    databoxType = null,
    databoxSource = 'default',
  } = $props();

  let canvasEl;
  let widgetEl;
  let chart;
  let datasets = $state([]);
  let labels = [];
  let xparse = [];
  let yparse = [];
  let nameParse = $state([]);
  let tmpColorParse = [];
  let colorParse = $state([]);
  let colorHover = [];

  function resetData() {
    if (chart) { chart.destroy(); chart = undefined; }
    datasets = [];
    labels = [];
    xparse = [];
    yparse = [];
    nameParse = [];
    tmpColorParse = [];
    colorParse = [];
    colorHover = [];
  }

  function getData() {
    try {
      xparse = JSON.parse(x);
      yparse = JSON.parse(y);
    } catch (error) {
      console.error('Erreur lors du parsing des données x ou y:', error);
      return;
    }

    let tmpNameParse = [];
    if (name) {
      try { tmpNameParse = JSON.parse(name); } catch (error) { console.error('Erreur lors du parsing de name:', error); }
    }

    for (let i = 0; i < yparse.length; i++) {
      nameParse.push(tmpNameParse[i] || 'Série ' + (i + 1));
    }

    labels = xparse[0];
    loadColors();

    datasets = yparse.map((dataSet, index) => ({
      pointRadius: 5,
      pointHoverRadius: 5,
      data: dataSet,
      borderColor: colorParse[index],
      pointBackgroundColor: colorParse[index],
      backgroundColor: chroma(colorParse[index]).alpha(0.3).hex(),
      fill: true,
      hoverBorderColor: colorHover[index],
      hoverBackgroundColor: colorHover[index],
    }));
  }

  function loadColors() {
    const result = generateColors({
      yparse: yparse.map(() => [1]),
      tmpColorParse,
      selectedPalette,
    });
    colorParse = result.colorParse.map((colors) => colors[0]);
    colorHover = result.colorHover.map((colors) => colors[0]);
  }

  function changeColors(theme) {
    loadColors();
    chart.data.datasets.forEach((dataset, i) => {
      dataset.borderColor = colorParse[i];
      dataset.pointBorderColor = colorParse[i];
      dataset.pointBackgroundColor = colorParse[i];
      dataset.hoverBorderColor = colorHover[i];
      dataset.hoverBackgroundColor = colorHover[i];
      dataset.pointHoverBorderColor = colorHover[i];
      dataset.pointHoverBackgroundColor = colorHover[i];
    });
    chart.options.scales.r.pointLabels.color = theme === 'dark' ? '#cecece' : Chart.defaults.color;
    chart.update('none');
  }

  function createChart() {
    if (chart) chart.destroy();
    getData();
    const ctx = canvasEl.getContext('2d');

    chart = new Chart(ctx, {
      type: 'radar',
      data: { labels, datasets },
      options: {
        aspectRatio,
        scales: {
          r: {
            angleLines: { display: true, borderDash: [3, 3] },
            ticks: { display: false },
            grid: { color: '#6b6b6b' },
          },
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            enabled: false,
            mode: 'index',
            displayColors: false,
            backgroundColor: '#6b6b6b',
            callbacks: {
              label: (tooltipItems) => {
                const label = [];
                datasets.forEach((set) => label.push(set.data[tooltipItems.dataIndex]));
                return label;
              },
              title: (tooltipItems) => tooltipItems[0].label,
              labelTextColor: () => colorParse,
            },
            external: (context) => {
              const dom = document.getElementById(databoxId + '-' + databoxType + '-' + databoxSource) || widgetEl;
              const tooltipEl = dom?.querySelector('.tooltip');
              const tooltipModel = context.tooltip;
              if (!tooltipEl) return;
              if (!tooltipModel || tooltipModel.opacity === 0) { tooltipEl.style.opacity = 0; return; }

              tooltipEl.classList.remove('above', 'below', 'no-transform');
              tooltipEl.classList.add(tooltipModel.yAlign || 'no-transform');

              if (tooltipModel.body) {
                const titleLines = [xparse[0][tooltipModel.dataPoints[0].dataIndex]];
                const bodyLines = tooltipModel.body.map((b) => b.lines);
                tooltipEl.querySelector('.tooltip_header.fr-text--sm.fr-mb-0').innerHTML = titleLines[0];
                const divValue = tooltipEl.querySelector('.tooltip_value');
                divValue.innerHTML = '';
                bodyLines[0].forEach((line, i) => {
                  if (line && tooltipModel.dataPoints[i]) {
                    const datasetIndex = tooltipModel.dataPoints[i].datasetIndex;
                    const color = colorParse[datasetIndex] || '#000';
                    const displayValue = `${line}${unitTooltip ? ' ' + unitTooltip : ''}`;
                    divValue.innerHTML += `<div class="tooltip_value-content"><span class="tooltip_dot" style="background-color:${color};"></span><p class="tooltip_place fr-mb-0">${displayValue}</p></div>`;
                  }
                });
              }

              const { offsetLeft: positionX, offsetTop: positionY } = chart.canvas;
              const canvasWidth = Number(chart.canvas.style.width.replace(/\D/g, ''));
              const canvasHeight = Number(chart.canvas.style.height.replace(/\D/g, ''));
              let tooltipX = positionX + tooltipModel.caretX + 10;
              let tooltipY = positionY + tooltipModel.caretY - 20;
              if (tooltipX + tooltipEl.clientWidth > positionX + canvasWidth) tooltipX = positionX + tooltipModel.caretX - tooltipEl.clientWidth - 10;
              if (tooltipY + tooltipEl.clientHeight > positionY + 0.9 * canvasHeight) tooltipY = positionY + tooltipModel.caretY - tooltipEl.clientHeight + 20;
              if (tooltipX < positionX) { tooltipX = positionX + tooltipModel.caretX - tooltipEl.clientWidth / 2; tooltipY = positionY + tooltipModel.caretY - tooltipEl.clientHeight - 20; }
              tooltipEl.style.position = 'absolute';
              tooltipEl.style.padding = tooltipModel.padding + 'px ' + tooltipModel.padding + 'px';
              tooltipEl.style.pointerEvents = 'none';
              tooltipEl.style.left = tooltipX + 'px';
              tooltipEl.style.top = tooltipY + 'px';
              tooltipEl.style.opacity = 1;
            },
          },
        },
      },
    });
  }

  function handleThemeChange(e) { if (chart) changeColors(e.detail.theme); }

  onMount(() => {
    configureChartDefaults();
    resetData();
    createChart();
    document.documentElement.addEventListener('dsfr.theme', handleThemeChange);
  });

  onDestroy(() => {
    if (chart) chart.destroy();
    document.documentElement.removeEventListener('dsfr.theme', handleThemeChange);
  });

  $effect(() => {
    x; y; name; date; aspectRatio; selectedPalette; unitTooltip;
    if (chart) { resetData(); createChart(); }
  });
</script>

<div bind:this={widgetEl} class="widget_container fr-grid-row">
  <div class="fr-col-12">
    <div class="chart">
      <div class="tooltip">
        <div class="tooltip_header fr-text--sm fr-mb-0"></div>
        <div class="tooltip_body">
          <div class="tooltip_value">
            <span class="tooltip_dot"></span>
          </div>
        </div>
      </div>

      <canvas bind:this={canvasEl}></canvas>

      <div class="chart_legend fr-mb-0 fr-mt-4v">
        {#each nameParse as item, index}
          <div class="flex fr-mt-3v fr-mb-1v">
            <span class="legende_dot" style="background-color: {colorParse[index]}"></span>
            <p class="fr-text--sm fr-text--bold fr-ml-1w fr-mb-0">{capitalize(item)}</p>
          </div>
        {/each}
      </div>

      {#if date}
        <div class="flex fr-mt-1w">
          <p class="fr-text--xs">Mise à jour : {date}</p>
        </div>
      {/if}
    </div>
  </div>
</div>
