<svelte:options customElement={{ tag: "bar-chart", shadow: "none" }} />

<script>
  import { onDestroy, untrack } from 'svelte';
  import { BarController, BarElement, Chart } from 'chart.js';
  import { configureChartDefaults, capitalize, formatNumber } from '@/utils/global.js';
  import { choosePalette, generateColors } from '@/utils/colors.js';

  Chart.register(BarController, BarElement);

  let {
    x,
    y,
    name = '',
    date = '',
    stacked = false,
    horizontal = false,
    barSize = 'flex',
    maxBarSize = 32,
    aspectRatio = 2,
    selectedPalette = '',
    highlightIndex = '[3, 4]',
    unitTooltip = '',
    xMin = '',
    xMax = '',
    yMin = '',
    yMax = '',
    databoxId = null,
    databoxType = null,
    databoxSource = 'default',
  } = $props();

  let chartId = 'dsfr-chart-' + Math.floor(Math.random() * 1000);
  let widgetId = 'dsfr-widget-' + Math.floor(Math.random() * 1000);

  let canvasEl;
  let widgetEl;
  let chart;
  let datasets = $state([]);
  let labels = $state([]);
  let xparse = [];
  let yparse = [];
  let nameParse = $state([]);
  let tmpColorParse = [];
  let colorParse = $state([]);
  let colorHover = [];
  let legendColors = $state([]);

  function resetData() {
    if (chart) {
      chart.destroy();
      chart = undefined;
    }
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
      try {
        tmpNameParse = JSON.parse(name);
      } catch (error) {
        console.error('Erreur lors du parsing de name:', error);
      }
    }

    for (let i = 0; i < yparse.length; i++) {
      if (tmpNameParse[i]) {
        nameParse.push(tmpNameParse[i]);
      } else {
        nameParse.push('Série ' + (i + 1));
      }
    }

    labels = xparse[0];

    loadColors();

    datasets = yparse.map((dataSet, index) => ({
      label: nameParse[index],
      data: dataSet,
      backgroundColor: colorParse[index],
      borderColor: colorParse[index],
      hoverBackgroundColor: colorHover[index],
      hoverBorderColor: colorHover[index],
      barThickness: barSize,
      ...(maxBarSize ? { maxBarThickness: maxBarSize } : {}),
    }));
  }

  function loadColors() {
    let parsedHighlightIndex;
    try {
      parsedHighlightIndex = typeof highlightIndex === 'string' ? JSON.parse(highlightIndex) : highlightIndex;
    } catch {
      parsedHighlightIndex = [3, 4];
    }

    const result = generateColors({
      yparse,
      tmpColorParse,
      highlightIndex: parsedHighlightIndex,
      selectedPalette,
      reverseOrder: selectedPalette === 'divergentDescending',
    });

    colorParse = result.colorParse;
    colorHover = result.colorHover;
    legendColors = result.legendColors;
  }

  function createChart() {
    if (chart) chart.destroy();

    getData();

    const ctx = canvasEl.getContext('2d');

    chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: [...labels],
        datasets: $state.snapshot(datasets),
      },
      options: {
        indexAxis: horizontal === true || horizontal === 'true' ? 'y' : 'x',
        aspectRatio,
        scales: {
          x: {
            offset: !(horizontal === true || horizontal === 'true'),
            stacked: stacked === true || stacked === 'true',
            grid: {
              drawTicks: false,
              drawOnChartArea: horizontal === true || horizontal === 'true',
            },
            ticks: {
              beginAtZero: true,
              padding: (horizontal === true || horizontal === 'true') ? 5 : 15,
            },
            ...(xMin ? { suggestedMin: xMin } : {}),
            ...(xMax ? { suggestedMax: xMax } : {}),
          },
          y: {
            stacked: stacked === true || stacked === 'true',
            offset: horizontal === true || horizontal === 'true',
            grid: {
              drawTicks: false,
              drawOnChartArea: !(horizontal === true || horizontal === 'true'),
            },
            border: {
              dash: [3],
            },
            ticks: {
              beginAtZero: true,
              padding: 5,
            },
            ...(yMin ? { suggestedMin: yMin } : {}),
            ...(yMax ? { suggestedMax: yMax } : {}),
          },
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            enabled: false,
            mode: 'index',
            displayColors: false,
            backgroundColor: '#6b6b6b',
            callbacks: {
              label: (tooltipItems) => {
                const value = datasets[tooltipItems.datasetIndex].data[tooltipItems.dataIndex];
                return formatNumber(value);
              },
              title: (tooltipItems) => {
                return tooltipItems[0].label;
              },
              labelTextColor: (tooltipItems) => {
                return colorParse[tooltipItems.datasetIndex][tooltipItems.dataIndex];
              },
            },
            external: (context) => {
              const dom = document.getElementById(databoxId + '-' + databoxType + '-' + databoxSource) || widgetEl;
              const tooltipEl = dom?.querySelector('.tooltip');
              const tooltipModel = context.tooltip;

              if (!tooltipEl) return;

              if (!tooltipModel || tooltipModel.opacity === 0) {
                tooltipEl.style.opacity = 0;
                return;
              }

              tooltipEl.classList.remove('above', 'below', 'no-transform');
              if (tooltipModel.yAlign) {
                tooltipEl.classList.add(tooltipModel.yAlign);
              } else {
                tooltipEl.classList.add('no-transform');
              }

              if (tooltipModel.body) {
                const titleLines = tooltipModel.title || [];

                const divDate = tooltipEl.querySelector('.tooltip_header.fr-text--sm.fr-mb-0');
                divDate.innerHTML = titleLines[0];

                const divValue = tooltipEl.querySelector('.tooltip_value');
                divValue.innerHTML = '';

                tooltipModel.dataPoints.forEach((dataPoint) => {
                  const datasetIndex = dataPoint.datasetIndex;
                  const index = dataPoint.dataIndex;
                  const color = colorParse[datasetIndex] ? colorParse[datasetIndex][index] : '#000';
                  const value = formatNumber(datasets[datasetIndex].data[index]);
                  const displayValue = `${value}${unitTooltip ? ' ' + unitTooltip : ''}`;

                  divValue.innerHTML += `
                    <div class="tooltip_value-content">
                      <span class="tooltip_dot" style="background-color:${color};"></span>
                      <p class="tooltip_place fr-mb-0">${displayValue}</p>
                    </div>
                  `;
                });
              }

              const { offsetLeft: positionX, offsetTop: positionY } = chart.canvas;
              const canvasWidth = Number(chart.canvas.style.width.replace(/\D/g, ''));
              const canvasHeight = Number(chart.canvas.style.height.replace(/\D/g, ''));

              let tooltipX = positionX + tooltipModel.caretX + 10;
              let tooltipY = positionY + tooltipModel.caretY - 20;
              if (tooltipX + tooltipEl.clientWidth > positionX + canvasWidth) {
                tooltipX = positionX + tooltipModel.caretX - tooltipEl.clientWidth - 10;
              }
              if (tooltipY + tooltipEl.clientHeight > positionY + 0.9 * canvasHeight) {
                tooltipY = positionY + tooltipModel.caretY - tooltipEl.clientHeight + 20;
              }
              if (tooltipX < positionX) {
                tooltipX = positionX + tooltipModel.caretX - tooltipEl.clientWidth / 2;
                tooltipY = positionY + tooltipModel.caretY - tooltipEl.clientHeight - 20;
              }

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

  function changeColors(theme) {
    loadColors();

    chart.data.datasets.forEach((dataset, i) => {
      dataset.borderColor = colorParse[i];
      dataset.backgroundColor = colorParse[i];
      dataset.hoverBorderColor = colorHover[i];
      dataset.hoverBackgroundColor = colorHover[i];
    });

    chart.options.scales.x.ticks.color = theme === 'dark' ? '#cecece' : Chart.defaults.color;
    chart.options.scales.y.ticks.color = theme === 'dark' ? '#cecece' : Chart.defaults.color;

    chart.update('none');
  }

  function handleThemeChange(e) {
    if (chart) {
      changeColors(e.detail.theme);
    }
  }

  onDestroy(() => {
    if (chart) {
      chart.destroy();
    }
    document.documentElement.removeEventListener('dsfr.theme', handleThemeChange);
  });

  $effect(() => {
    // Track all props that should trigger a re-render
    x; y; name; date; stacked; horizontal; barSize; maxBarSize;
    aspectRatio; selectedPalette; highlightIndex; unitTooltip;
    xMin; xMax; yMin; yMax;

    if (!canvasEl) return;

    untrack(() => {
      configureChartDefaults();
      resetData();
      createChart();
      document.documentElement.addEventListener('dsfr.theme', handleThemeChange);
    });
  });
</script>

<div bind:this={widgetEl} class="widget_container fr-grid-row">
  <div class="fr-col-12">
    <div class="chart">
      <div class="tooltip">
        <div class="tooltip_header fr-text--sm fr-mb-0"></div>
        <div class="tooltip_body">
          <div class="tooltip_value"></div>
        </div>
      </div>

      <canvas bind:this={canvasEl}></canvas>

      <div class="chart_legend fr-mb-0 fr-mt-4v">
        {#each nameParse as item, index}
          <div class="flex fr-mt-3v fr-mb-1v">
            <span
              class="legende_dot"
              style="background-color: {legendColors[index]}"
            ></span>
            <p class="fr-text--sm fr-text--bold fr-ml-1w fr-mb-0">
              {capitalize(item)}
            </p>
          </div>
        {/each}
      </div>

      {#if date}
        <div class="flex fr-mt-1w">
          <p class="fr-text--xs">
            Mise à jour : {date}
          </p>
        </div>
      {/if}
    </div>
  </div>
</div>
