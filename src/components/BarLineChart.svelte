<svelte:options customElement={{ tag: "bar-line-chart", shadow: "none" }} />

<script>
  import { onDestroy, untrack } from 'svelte';
  import { Chart, LineController, LineElement } from 'chart.js';
  import { configureChartDefaults, capitalize, formatNumber } from '@/utils/global.js';
  import { generateBarLineChartColors } from '@/utils/colors.js';

  Chart.register(LineController, LineElement);

  let {
    x,
    yBar,
    yLine,
    nameBar = '',
    nameLine = '',
    barSize = 'flex',
    maxBarSize = 32,
    vline = '',
    vlinecolor = '',
    vlinename = '',
    hline = '',
    hlinecolor = '',
    hlinename = '',
    date = '',
    aspectRatio = 2,
    selectedPalette = 'categorical',
    unitTooltipBar = '',
    unitTooltipLine = '',
    xMin = '',
    xMax = '',
    yBarMin = '',
    yBarMax = '',
    yLineMin = '',
    yLineMax = '',
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
  let ybarparse = [];
  let ylineparse = [];
  let colorParse = $state('');
  let colorBarParse = $state('');
  let colorHover = '';
  let colorBarHover = '';
  let vlineParse = [];
  let vlineColorParse = $state([]);
  let tmpVlineColorParse = [];
  let vlineNameParse = $state([]);
  let hlineParse = [];
  let hlineColorParse = $state([]);
  let tmpHlineColorParse = [];
  let hlineNameParse = $state([]);

  function resetData() {
    if (chart) { chart.destroy(); chart = undefined; }
    datasets = [];
    labels = [];
    xparse = [];
    ybarparse = [];
    ylineparse = [];
    colorParse = '';
    colorBarParse = '';
    colorHover = '';
    colorBarHover = '';
    vlineParse = [];
    vlineColorParse = [];
    tmpVlineColorParse = [];
    vlineNameParse = [];
    hlineParse = [];
    hlineColorParse = [];
    tmpHlineColorParse = [];
    hlineNameParse = [];
  }

  function getData() {
    try {
      xparse = JSON.parse(x);
      ybarparse = JSON.parse(yBar);
      ylineparse = JSON.parse(yLine);
    } catch (error) {
      console.error('Erreur lors du parsing des données x ou y-bar ou y-line:', error);
      return;
    }

    if (vline) {
      vlineParse = JSON.parse(vline);
      let tmpVlineNameParse = [];
      if (vlinename) tmpVlineNameParse = JSON.parse(vlinename);
      if (vlinecolor) tmpVlineColorParse = JSON.parse(vlinecolor);
      for (let i = 0; i < vlineParse.length; i++) {
        vlineNameParse.push(tmpVlineNameParse[i] || 'V' + (i + 1));
      }
    }

    if (hline) {
      hlineParse = JSON.parse(hline);
      let tmpHlineNameParse = [];
      if (hlinename) tmpHlineNameParse = JSON.parse(hlinename);
      if (hlinecolor) tmpHlineColorParse = JSON.parse(hlinecolor);
      for (let i = 0; i < hlineParse.length; i++) {
        hlineNameParse.push(tmpHlineNameParse[i] || 'H' + (i + 1));
      }
    }

    let dataLine = [];
    let dataBar = [];
    if (typeof xparse[0] === 'number') {
      const xsort = xparse.map((a) => a).sort((a, b) => a - b);
      xsort.forEach((k) => {
        const index = xparse.findIndex((element) => element === k);
        dataBar.push(ybarparse[index]);
        dataLine.push(ylineparse[index]);
      });
      labels = xsort;
    } else {
      dataBar = ybarparse;
      dataLine = ylineparse;
      labels = xparse;
    }

    loadColors();

    datasets = [
      {
        data: dataBar,
        type: 'bar',
        borderColor: colorBarParse,
        backgroundColor: colorBarParse,
        hoverBorderColor: colorBarHover,
        hoverBackgroundColor: colorBarHover,
        pointRadius: 5,
        pointHoverRadius: 5,
        barThickness: barSize,
        ...(maxBarSize ? { maxBarThickness: maxBarSize } : {}),
        barPercentage: 0.5,
      },
      {
        data: dataLine,
        type: 'line',
        borderColor: colorParse,
        backgroundColor: 'rgba(0, 0, 0, 0)',
        pointBorderColor: colorParse,
        pointBackgroundColor: colorParse,
        pointHoverBorderColor: colorHover,
        pointHoverBackgroundColor: colorHover,
        pointRadius: 5,
        pointHoverRadius: 5,
        yAxisID: 'yLine',
        tension: 0.4,
      },
    ];
  }

  function loadColors() {
    const result = generateBarLineChartColors({
      vlineParse,
      hlineParse,
      tmpVlineColorParse,
      tmpHlineColorParse,
      selectedPalette,
    });
    colorBarParse = result.colorBarParse;
    colorBarHover = result.colorBarHover;
    colorParse = result.colorParse;
    colorHover = result.colorHover;
    vlineColorParse = result.vlineColorParse;
    hlineColorParse = result.hlineColorParse;
  }

  function changeColors(theme) {
    loadColors();
    chart.data.datasets.forEach((dataset) => {
      dataset.borderColor = colorParse;
      dataset.backgroundColor = colorBarParse;
      dataset.pointBorderColor = colorParse;
      dataset.pointBackgroundColor = colorParse;
      dataset.hoverBorderColor = colorHover;
      dataset.hoverBackgroundColor = colorBarHover;
      dataset.pointHoverBorderColor = colorHover;
      dataset.pointHoverBackgroundColor = colorHover;
    });
    chart.options.scales.x.ticks.color = theme === 'dark' ? '#cecece' : Chart.defaults.color;
    chart.options.scales.y.ticks.color = theme === 'dark' ? '#cecece' : Chart.defaults.color;
    chart.options.scales.yLine.ticks.color = theme === 'dark' ? '#cecece' : Chart.defaults.color;
    chart.update('none');
  }

  function createChart() {
    if (chart) chart.destroy();
    getData();
    const ctx = canvasEl.getContext('2d');

    chart = new Chart(ctx, {
      data: { labels: [...labels], datasets: $state.snapshot(datasets) },
      plugins: [{
        afterDraw: (chartInstance) => {
          if (chartInstance.tooltip?._active && chartInstance.tooltip?._active.length) {
            const { ctx: drawCtx } = chartInstance;
            const xPos = chartInstance.tooltip.getActiveElements()[0].element.tooltipPosition().x;
            const index = chartInstance.tooltip._active[0].index;
            const yBarPos = chartInstance.scales.y.getPixelForValue(ybarparse[index]);
            const yLinePos = chartInstance.scales.yLine.getPixelForValue(ylineparse[index]);

            drawCtx.save(); drawCtx.beginPath();
            drawCtx.moveTo(xPos, chartInstance.scales.y.top);
            drawCtx.lineTo(xPos, chartInstance.scales.y.bottom);
            drawCtx.lineWidth = 1; drawCtx.setLineDash([10, 5]);
            drawCtx.stroke(); drawCtx.restore();

            drawCtx.save(); drawCtx.beginPath();
            drawCtx.moveTo(chartInstance.scales.x.right, yLinePos);
            drawCtx.lineTo(xPos, yLinePos);
            drawCtx.lineWidth = 1; drawCtx.setLineDash([10, 5]);
            drawCtx.stroke(); drawCtx.restore();

            drawCtx.save(); drawCtx.beginPath();
            drawCtx.moveTo(chartInstance.scales.x.left, yBarPos);
            drawCtx.lineTo(xPos, yBarPos);
            drawCtx.lineWidth = 1; drawCtx.setLineDash([10, 5]);
            drawCtx.stroke(); drawCtx.restore();
          }
        },
      }],
      options: {
        aspectRatio,
        scales: {
          x: {
            offset: true,
            grid: { drawTicks: false, drawOnChartArea: false },
            ...(xMin ? { suggestedMin: xMin } : {}),
            ...(xMax ? { suggestedMax: xMax } : {}),
          },
          y: {
            type: 'linear', position: 'left',
            grid: { drawTicks: false },
            border: { dash: [3] },
            ticks: {
              padding: 10, maxTicksLimit: 5,
              callback: (value) => {
                if (value >= 1000000000 || value <= -1000000000) return value / 1e9 + 'B';
                if (value >= 1000000 || value <= -1000000) return value / 1e6 + 'M';
                if (value >= 1000 || value <= -1000) return value / 1e3 + 'K';
                return value;
              },
            },
            ...(yBarMin ? { suggestedMin: yBarMin } : {}),
            ...(yBarMax ? { suggestedMax: yBarMax } : {}),
          },
          yLine: {
            type: 'linear', position: 'right', id: 'yLine', beginAtZero: true,
            grid: { drawTicks: false },
            border: { dash: [3] },
            ticks: {
              padding: 10, maxTicksLimit: 5,
              callback: (value) => {
                if (value >= 1000000000 || value <= -1000000000) return value / 1e9 + 'B';
                if (value >= 1000000 || value <= -1000000) return value / 1e6 + 'M';
                if (value >= 1000 || value <= -1000) return value / 1e3 + 'K';
                return value;
              },
            },
            ...(yLineMin ? { suggestedMin: yLineMin } : {}),
            ...(yLineMax ? { suggestedMax: yLineMax } : {}),
          },
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            enabled: false,
            displayColors: false,
            backgroundColor: '#6b6b6b',
            callbacks: {
              label: (tooltipItems) => {
                const label = [];
                datasets.forEach((set) => label.push(formatNumber(set.data[tooltipItems.dataIndex])));
                return label;
              },
              title: (tooltipItems) => tooltipItems[0].label,
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
                const titleLines = tooltipModel.title || [];
                const bodyLines = tooltipModel.body.map((b) => b.lines);
                tooltipEl.querySelector('.tooltip_header.fr-text--sm.fr-mb-0').innerHTML = titleLines[0];
                const divValue = tooltipEl.querySelector('.tooltip_value');
                divValue.innerHTML = '';
                const colors = [colorBarParse, colorParse];
                bodyLines[0].forEach((line, i) => {
                  if (line) {
                    const color = colors[i] || '#000';
                    const displayValue = i === 0 ? `${line}${unitTooltipBar ? ' ' + unitTooltipBar : ''}` : `${line}${unitTooltipLine ? ' ' + unitTooltipLine : ''}`;
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

  onDestroy(() => {
    if (chart) chart.destroy();
    document.documentElement.removeEventListener('dsfr.theme', handleThemeChange);
  });

  $effect(() => {
    x; yBar; yLine; nameBar; nameLine; barSize; maxBarSize;
    vline; vlinecolor; vlinename; hline; hlinecolor; hlinename;
    date; aspectRatio; selectedPalette; unitTooltipBar; unitTooltipLine;
    xMin; xMax; yBarMin; yBarMax; yLineMin; yLineMax;
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
          <div class="tooltip_value">
            <div class="flex fr-mt-3v fr-mb-1v" style="border-bottom: 1px solid #e0e0e0">
              <div class="tooltip_value-content">
                <span class="tooltip_dot" style="background-color: {colorBarParse}"></span>
                <p class="tooltip_place">{capitalize(nameBar)}</p>
              </div>
            </div>
            <div class="flex fr-mt-3v fr-mb-1v" style="border-bottom: 1px solid #e0e0e0">
              <div class="tooltip_value-content">
                <span class="tooltip_dot" style="background-color: {colorParse}"></span>
                <p class="tooltip_place">{capitalize(nameLine)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <canvas bind:this={canvasEl}></canvas>

      <div class="chart_legend fr-mb-0 fr-mt-4v">
        <div class="flex fr-mt-3v fr-mb-1v">
          <span class="legende_dot" style="background-color: {colorBarParse}"></span>
          <p class="fr-text--sm fr-text--bold fr-ml-1w fr-mb-0">{capitalize(nameBar)}</p>
        </div>
        <div class="flex fr-mt-3v fr-mb-1v">
          <span class="legende_dot" style="background-color: {colorParse}"></span>
          <p class="fr-text--sm fr-text--bold fr-ml-1w fr-mb-0">{capitalize(nameLine)}</p>
        </div>

        {#each hlineNameParse as item, index}
          <div class="flex">
            <span class="legende_dash_line" style="background-color: {hlineColorParse[index]}"></span>
            <span class="legende_dash_line legende_dash_line_end" style="background-color: {hlineColorParse[index]}"></span>
            <p class="fr-text--sm fr-text--bold fr-ml-1w fr-mb-0">{capitalize(item)}</p>
          </div>
        {/each}

        {#each vlineNameParse as item, index}
          <div class="flex">
            <span class="legende_dash_line" style="background-color: {vlineColorParse[index]}"></span>
            <span class="legende_dash_line legende_dash_line_end" style="background-color: {vlineColorParse[index]}"></span>
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
