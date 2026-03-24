<svelte:options customElement={{ tag: "line-chart", shadow: "none" }} />

<script>
  import { onDestroy, untrack } from 'svelte';
  import { Chart, LineController, LineElement } from 'chart.js';
  import chroma from 'chroma-js';
  import { configureChartDefaults, capitalize, formatNumber, teleportToDatabox } from '@/utils/global.js';
  import { choosePalette, getColorsByIndex, getNeutralColor } from '@/utils/colors.js';

  Chart.register(LineController, LineElement);

  let {
    x,
    y,
    name = '',
    vline = '',
    vlinecolor = '',
    vlinename = '',
    hline = '',
    hlinecolor = '',
    hlinename = '',
    date = '',
    aspectRatio = 2,
    formatDate = false,
    selectedPalette = '',
    unitTooltip = '',
    xMin = '',
    xMax = '',
    yMin = '',
    yMax = '',
    databoxId = null,
    databoxType = null,
    databoxSource = 'default',
  } = $props();

  let canvasEl;
  let widgetEl;
  let chart;
  let datasets = $state([]);
  let labels = [];
  let xAxisType = 'category';
  let xparse = [];
  let yparse = [];
  let nameParse = $state([]);
  let tmpColorParse = [];
  let colorParse = $state([]);
  let colorHover = [];
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
    xAxisType = 'category';
    xparse = [];
    yparse = [];
    nameParse = [];
    tmpColorParse = [];
    colorParse = [];
    colorHover = [];
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

    // Récupération données Vline
    if (vline) {
      vlineParse = JSON.parse(vline);
      let tmpVlineNameParse = [];
      if (vlinename) tmpVlineNameParse = JSON.parse(vlinename);
      if (vlinecolor) tmpVlineColorParse = JSON.parse(vlinecolor);
      for (let i = 0; i < vlineParse.length; i++) {
        vlineNameParse.push(tmpVlineNameParse[i] || 'V' + (i + 1));
      }
    }

    // Récupération données Hline
    if (hline) {
      hlineParse = JSON.parse(hline);
      let tmpHlineNameParse = [];
      if (hlinename) tmpHlineNameParse = JSON.parse(hlinename);
      if (hlinecolor) tmpHlineColorParse = JSON.parse(hlinecolor);
      for (let i = 0; i < hlineParse.length; i++) {
        hlineNameParse.push(tmpHlineNameParse[i] || 'H' + (i + 1));
      }
    }

    // Formatage des données
    let data = [];
    if (typeof xparse[0][0] === 'number') {
      const allX = [];
      xparse.forEach((xArr, i) => {
        const dj = [];
        const xsort = xArr.map((a) => a).sort((a, b) => a - b);
        xsort.forEach((k) => {
          const index = xArr.findIndex((element) => element === k);
          dj.push({ x: k, y: yparse[i][index] });
          if (!allX.includes(k)) allX.push(k);
        });
        data.push(dj);
      });
      labels = [];
      xAxisType = 'linear';
    } else {
      data = yparse;
      labels = xparse[0];
      xAxisType = 'category';
    }

    loadColors();

    datasets = data.map((dataSet, index) => ({
      data: dataSet,
      fill: false,
      borderColor: colorParse[index],
      pointRadius: 5,
      pointHoverRadius: 5,
      pointBackgroundColor: colorParse[index],
      pointBorderColor: colorParse[index],
      pointHoverBackgroundColor: colorHover[index],
      pointHoverBorderColor: colorHover[index],
      borderWidth: 2,
      tension: 0.4,
    }));
  }

  function loadColors() {
    colorParse = [];
    colorHover = [];
    const palette = choosePalette(selectedPalette);
    for (let i = 0; i < yparse.length; i++) {
      if (tmpColorParse[i]) {
        colorParse.push(tmpColorParse[i]);
        colorHover.push(chroma(tmpColorParse[i]).brighten(0.5).hex());
      } else {
        const color = getColorsByIndex(i, palette);
        colorParse.push(color);
        colorHover.push(chroma(color).brighten(0.5).hex());
      }
    }

    vlineColorParse = vlineParse.map((_, i) => tmpVlineColorParse[i] || getNeutralColor());
    hlineColorParse = hlineParse.map((_, i) => tmpHlineColorParse[i] || getNeutralColor());
  }

  function changeColors(theme) {
    loadColors();
    chart.data.datasets.forEach((dataset, i) => {
      dataset.borderColor = colorParse[i];
      dataset.backgroundColor = colorParse[i];
      dataset.pointBorderColor = colorParse[i];
      dataset.pointBackgroundColor = colorParse[i];
      dataset.hoverBorderColor = colorHover[i];
      dataset.hoverBackgroundColor = colorHover[i];
      dataset.pointHoverBorderColor = colorHover[i];
      dataset.pointHoverBackgroundColor = colorHover[i];
    });
    chart.options.scales.x.ticks.color = theme === 'dark' ? '#cecece' : Chart.defaults.color;
    chart.options.scales.y.ticks.color = theme === 'dark' ? '#cecece' : Chart.defaults.color;
    chart.update('none');
  }

  function createChart() {
    if (chart) chart.destroy();
    getData();
    const ctx = canvasEl.getContext('2d');

    chart = new Chart(ctx, {
      type: 'line',
      data: { labels: [...labels], datasets: $state.snapshot(datasets) },
      plugins: [{
        afterDraw: (chartInstance) => {
          if (chartInstance.tooltip?._active && chartInstance.tooltip?._active.length) {
            const { ctx: drawCtx } = chartInstance;
            const xPos = chartInstance.tooltip.getActiveElements()[0].element.tooltipPosition().x;
            const index = chartInstance.tooltip._active[0].index;

            drawCtx.save();
            drawCtx.beginPath();
            drawCtx.moveTo(xPos, chartInstance.scales.y.top);
            drawCtx.lineTo(xPos, chartInstance.scales.y.bottom);
            drawCtx.lineWidth = 1;
            drawCtx.setLineDash([10, 5]);
            drawCtx.stroke();
            drawCtx.restore();

            yparse.forEach((i) => {
              let yPos = chartInstance.scales.y.getPixelForValue(i[index]);
              drawCtx.save();
              drawCtx.beginPath();
              drawCtx.moveTo(chartInstance.scales.x.left, yPos);
              drawCtx.lineTo(chartInstance.scales.x.right, yPos);
              drawCtx.lineWidth = 1;
              drawCtx.setLineDash([10, 5]);
              drawCtx.stroke();
              drawCtx.restore();
            });
          }
        },
      }],
      options: {
        aspectRatio,
        scales: {
          x: {
            offset: true,
            type: xAxisType,
            grid: { drawOnChartArea: false },
            ticks: { padding: 10 },
            ...(xMin ? { suggestedMin: xMin } : {}),
            ...(xMax ? { suggestedMax: xMax } : {}),
          },
          y: {
            grid: { drawTicks: false },
            border: { dash: [3] },
            ticks: {
              padding: 5,
              maxTicksLimit: 5,
              callback: (value) => {
                if (value >= 1000000000 || value <= -1000000000) return value / 1e9 + 'B';
                if (value >= 1000000 || value <= -1000000) return value / 1e6 + 'M';
                if (value >= 1000 || value <= -1000) return value / 1e3 + 'K';
                return value;
              },
            },
            ...(yMin ? { suggestedMin: yMin } : {}),
            ...(yMax ? { suggestedMax: yMax } : {}),
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
                datasets.forEach((set, i) => {
                  if (xAxisType === 'linear') {
                    const idx = xparse[i].indexOf(tooltipItems.parsed.x);
                    if (idx !== -1) label.push(yparse[i][idx]);
                  } else {
                    label.push(set.data[tooltipItems.dataIndex]);
                  }
                });
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
                const titleLines = tooltipModel.title || [];
                const bodyLines = tooltipModel.body.map((b) => b.lines);
                tooltipEl.querySelector('.tooltip_header.fr-text--sm.fr-mb-0').innerHTML = titleLines[0];
                const divValue = tooltipEl.querySelector('.tooltip_value');
                divValue.innerHTML = '';
                bodyLines[0].forEach((line, i) => {
                  const displayValue = `${line}${unitTooltip ? ' ' + unitTooltip : ''}`;
                  if (line) {
                    divValue.innerHTML += `<div class="tooltip_value-content"><span class="tooltip_dot" style="background-color:${colorParse[i]};"></span><p class="tooltip_place fr-mb-0">${displayValue}</p></div>`;
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
    x; y; name; vline; vlinecolor; vlinename; hline; hlinecolor; hlinename;
    date; aspectRatio; formatDate; selectedPalette; unitTooltip;
    xMin; xMax; yMin; yMax;
    if (!canvasEl) return;
    untrack(() => {
      teleportToDatabox(widgetEl);
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
            {#each nameParse as item, index}
              <div class="flex fr-mt-3v fr-mb-1v" style="border-bottom: 1px solid #e0e0e0">
                <div class="tooltip_value-content">
                  <span class="tooltip_dot" style="background-color: {colorParse[index]}"></span>
                  <p class="tooltip_place">{capitalize(item)}</p>
                </div>
              </div>
            {/each}
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

      {#each hlineNameParse as item, index}
        <div class="flex fr-mt-3v">
          <span class="legende_dash_line" style="background-color: {hlineColorParse[index]}"></span>
          <span class="legende_dash_line legende_dash_line_end" style="background-color: {hlineColorParse[index]}"></span>
          <p class="fr-text--sm fr-text--bold fr-ml-1w fr-mb-0">{capitalize(item)}</p>
        </div>
      {/each}

      {#each vlineNameParse as item, index}
        <div class="flex fr-mt-3v fr-mb-1v">
          <span class="legende_dash_line" style="background-color: {vlineColorParse[index]}"></span>
          <span class="legende_dash_line legende_dash_line_end" style="background-color: {vlineColorParse[index]}"></span>
          <p class="fr-text--sm fr-text--bold fr-ml-1w fr-mb-0">{capitalize(item)}</p>
        </div>
      {/each}

      {#if date}
        <div class="flex fr-mt-1w">
          <p class="fr-text--xs">Mise à jour : {date}</p>
        </div>
      {/if}
    </div>
  </div>
</div>
