<script>
  import { chartData } from '@/assets/data';
  import CodeBlock from './CodeBlock.svelte';

  const scatterData = JSON.parse(chartData.scatterChart.linked.y);

  const defaultScatterData = JSON.stringify(scatterData);
  const sortedScatterData = JSON.stringify(scatterData.map((arr) => [...arr].sort((a, b) => a - b)));
  const reversedScatterData = JSON.stringify(scatterData.map((arr) => [...arr].reverse()));

  const tableParse = (data) => JSON.stringify(JSON.parse(data)[0]);
</script>

<div class="part_container">
  <h2 id="Databox">Databox</h2>
  <h3>Présentation</h3>
  <p>Le composant <strong>DataBox</strong> est un composant permettant d'afficher dans un cadre normé des données sous différentes formes (graphiques, chiffres clés, tableaux, etc). Il est à utiliser pour composer un tableau de bord, ou toute page nécessitant de structurer la visualisation de données.</p>
  <p>Polyvalente, la databox intègre également des fonctionnalités interactives telles que des sélecteurs de sources, des modales, et des menus déroulants permettant la mise à disposition d'actions supplémentaires.</p>

  <div class="fr-my-6w">
    <h3 id="Databox-simple">Exemple de databox simple</h3>
    <data-box
      id={chartData.dataBox.simple.id}
      title={chartData.dataBox.simple.title}
      tooltip-title={chartData.dataBox.simple.tooltipTitle}
      tooltip-content={chartData.dataBox.simple.tooltipContent}
      source={chartData.dataBox.simple.source}
      date={chartData.dataBox.simple.date}
      trend={chartData.dataBox.simple.trend}
    ></data-box>
    <pie-chart
      x={chartData.pieChart.doughnut.x}
      y={chartData.pieChart.doughnut.y}
      name={chartData.pieChart.doughnut.name}
      selected-palette={chartData.pieChart.doughnut.selectedPalette}
      fill={chartData.pieChart.doughnut.fill}
      databox-id="simple"
      databox-type="chart"
    ></pie-chart>
    <table-chart
      databox-id="simple"
      databox-type="table"
      x={tableParse(chartData.pieChart.doughnut.x)}
      y={chartData.pieChart.doughnut.y}
      name='["Pourcentage"]'
      table-name="Catégories"
    ></table-chart>
    <CodeBlock
      tag={['data-box', 'pie-chart', 'table-chart']}
      attributes={[
        chartData.dataBox.simple,
        {dataBoxId: 'simple', dataBoxType: 'chart', ...chartData.pieChart.doughnut},
        {dataBoxId: 'simple', dataBoxType: 'table', x: tableParse(chartData.pieChart.doughnut.x), y: chartData.pieChart.doughnut.y, name: '["Pourcentage"]', tableName: 'Catégories'},
      ]}
    />
  </div>

  <div class="fr-my-6w">
    <h3 id="Databox-complète-multi-source">Exemple de databox complète et multi-source</h3>
    <data-box
      id={chartData.dataBox.complete.id}
      title={chartData.dataBox.complete.title}
      tooltip-title={chartData.dataBox.complete.tooltipTitle}
      tooltip-content={chartData.dataBox.complete.tooltipContent}
      modal-title={chartData.dataBox.complete.modalTitle}
      modal-content={chartData.dataBox.complete.modalContent}
      source={chartData.dataBox.complete.source}
      date={chartData.dataBox.complete.date}
      default-source={chartData.dataBox.complete.defaultSource}
      trend={chartData.dataBox.complete.trend}
      segmented-control={chartData.dataBox.complete.segmentedControl}
      screenshot={chartData.dataBox.complete.screenshot}
      download={chartData.dataBox.complete.download}
      fullscreen={chartData.dataBox.complete.fullscreen}
      actions={JSON.stringify(chartData.dataBox.complete.actions)}
    ></data-box>
    <scatter-chart
      x={chartData.scatterChart.linked.x}
      y={defaultScatterData}
      name={chartData.scatterChart.linked.name}
      show-line={chartData.scatterChart.linked.showLine}
      databox-id="complete"
      databox-type="chart"
      databox-source="insee"
    ></scatter-chart>
    <scatter-chart
      x={chartData.scatterChart.linked.x}
      y={sortedScatterData}
      name={chartData.scatterChart.linked.name}
      show-line={chartData.scatterChart.linked.showLine}
      databox-id="complete"
      databox-type="chart"
      databox-source="pole-emploi"
    ></scatter-chart>
    <scatter-chart
      x={chartData.scatterChart.linked.x}
      y={reversedScatterData}
      name={chartData.scatterChart.linked.name}
      show-line={chartData.scatterChart.linked.showLine}
      databox-id="complete"
      databox-type="chart"
      databox-source="autre"
    ></scatter-chart>
    <table-chart
      databox-id="complete"
      databox-type="table"
      databox-source="insee"
      x={tableParse(chartData.scatterChart.linked.x)}
      y={defaultScatterData}
      name={chartData.scatterChart.linked.name}
      table-name="Années INSEE"
    ></table-chart>
    <table-chart
      databox-id="complete"
      databox-type="table"
      x={tableParse(chartData.scatterChart.linked.x)}
      y={reversedScatterData}
      name={chartData.scatterChart.linked.name}
      table-name="Années"
    ></table-chart>
    <CodeBlock
      tag={['data-box', 'scatter-chart', 'scatter-chart', 'scatter-chart', 'table-chart', 'table-chart']}
      attributes={[
        chartData.dataBox.complete,
        {dataBoxId: 'complete', dataBoxType: 'chart', dataBoxSource: 'insee', ...chartData.scatterChart.linked, y: defaultScatterData},
        {dataBoxId: 'complete', dataBoxType: 'chart', dataBoxSource: 'pole-emploi', ...chartData.scatterChart.linked, y: sortedScatterData},
        {dataBoxId: 'complete', dataBoxType: 'chart', dataBoxSource: 'autre', ...chartData.scatterChart.linked, y: reversedScatterData},
        {dataBoxId: 'complete', dataBoxType: 'table', x: tableParse(chartData.scatterChart.linked.x), y: defaultScatterData, name: chartData.scatterChart.linked.name, tableName: 'Années INSEE'},
        {dataBoxId: 'complete', dataBoxType: 'table', x: tableParse(chartData.scatterChart.linked.x), y: reversedScatterData, name: chartData.scatterChart.linked.name, tableName: 'Années'},
      ]}
    />
  </div>

  <h3>Un composant flexible pour construire vos tableaux de bord</h3>
  <p>
    La databox s'appuie sur
    <a href="https://www.systeme-de-design.gouv.fr/fondamentaux/grille-et-points-de-rupture/" target="_blank">la grille proposée par le DSFR</a>
    , et peut s'afficher selon vos besoins, sur une ou plusieurs colonnes de la grille, grâce à la classe <code>fr-col-*</code>. Pensez toutefois à utiliser un <code>fr-grid-row</code> par ligne pour permettre le bon fonctionnement des infobulles du composant.
  </p>
  <p>Vous pourrez ainsi construire des dashboard en donnant aux databox la taille nécessaire, en fonction de vos besoins métiers et de l'aspect souhaité pour vos graphiques :</p>

  <div class="fr-my-6w">
    <div class="fr-grid-row fr-grid-row--gutters">
      <div class="fr-col-12 fr-col-lg-6">
        <data-box
          id="grid-left"
          title={chartData.dataBox.simple.title}
          tooltip-title={chartData.dataBox.simple.tooltipTitle}
          tooltip-content={chartData.dataBox.simple.tooltipContent}
          source={chartData.dataBox.simple.source}
          date={chartData.dataBox.simple.date}
          trend={chartData.dataBox.simple.trend}
        ></data-box>
        <pie-chart
          x={chartData.pieChart.doughnut.x}
          y={chartData.pieChart.doughnut.y}
          name={chartData.pieChart.doughnut.name}
          selected-palette={chartData.pieChart.doughnut.selectedPalette}
          fill={chartData.pieChart.doughnut.fill}
          databox-id="grid-left"
          databox-type="chart"
        ></pie-chart>
        <table-chart
          databox-id="grid-left"
          databox-type="table"
          x={tableParse(chartData.pieChart.doughnut.x)}
          y={chartData.pieChart.doughnut.y}
          name='["Pourcentage"]'
          table-name="Catégories"
        ></table-chart>
      </div>
      <div class="fr-col-12 fr-col-lg-6">
        <data-box
          id="grid-right"
          title={chartData.dataBox.modal.title}
          tooltip-title={chartData.dataBox.modal.tooltipTitle}
          tooltip-content={chartData.dataBox.modal.tooltipContent}
          modal-title={chartData.dataBox.modal.modalTitle}
          modal-content={chartData.dataBox.modal.modalContent}
          source={chartData.dataBox.modal.source}
          date={chartData.dataBox.modal.date}
          fullscreen={chartData.dataBox.modal.fullscreen}
        ></data-box>
        <pie-chart
          x={chartData.pieChart.pie.x}
          y={chartData.pieChart.pie.y}
          name={chartData.pieChart.pie.name}
          selected-palette={chartData.pieChart.pie.selectedPalette}
          fill={chartData.pieChart.pie.fill}
          databox-id="grid-right"
          databox-type="chart"
        ></pie-chart>
        <table-chart
          databox-id="grid-right"
          databox-type="table"
          x={tableParse(chartData.pieChart.pie.x)}
          y={chartData.pieChart.pie.y}
          name='["Pourcentage"]'
          table-name="Catégories"
        ></table-chart>
      </div>
    </div>
    <div class="fr-grid-row fr-grid-row--gutters">
      <div class="fr-col-12">
        <data-box
          id="grid-full"
          title={chartData.dataBox.complete.title}
          tooltip-title={chartData.dataBox.complete.tooltipTitle}
          tooltip-content={chartData.dataBox.complete.tooltipContent}
          source="INSEE"
          date={chartData.dataBox.complete.date}
          actions="[]"
        ></data-box>
        <scatter-chart
          x={chartData.scatterChart.linked.x}
          y={chartData.scatterChart.linked.y}
          name={chartData.scatterChart.linked.name}
          show-line={chartData.scatterChart.linked.showLine}
          databox-id="grid-full"
          databox-type="chart"
        ></scatter-chart>
        <table-chart
          databox-id="grid-full"
          databox-type="table"
          x={tableParse(chartData.scatterChart.linked.x)}
          y={chartData.scatterChart.linked.y}
          name={chartData.scatterChart.linked.name}
          table-name="Années"
        ></table-chart>
      </div>
    </div>
  </div>

  <h3>Structure</h3>
  <p>La databox est composée des éléments suivants :</p>
  <ul>
    <li><strong>un titre</strong> (obligatoire)</li>
    <li>une infobulle permettant de préciser la donnée affichée (optionnelle)</li>
    <li>un bouton permettant l'affichage d'une modale en plein écran (optionnel)</li>
    <li>un menu à points permettant l'affichage d'actions supplémentaires (optionnel et personnalisable voir plus bas)</li>
    <li>un indicateur de tendance (optionnel)</li>
    <li><strong>la donnée principale : chiffre, graphique ou tableau</strong> (obligatoire)</li>
    <li><strong>une source</strong> (obligatoire)</li>
    <li><strong>une date de mise à jour de la donnée</strong> (obligatoire)</li>
    <li><strong>un contrôle segmenté pour afficher la donnée en vue tableau</strong> (obligatoire lorsque c'est un graphique qui est affiché)</li>
  </ul>

  <h3>Personnalisation du menu à points</h3>
  <p>Par défaut, la librairie DSFR Chart propose dans le menu à points deux fonctionnalités :</p>
  <ul>
    <li>une fonctionnalité d'export CSV des données</li>
    <li>une fonctionnalité de téléchargement de capture d'écran</li>
  </ul>
  <p>Toutefois, ces fonctionnalités sont optionnelles, et ne doivent pas apparaître obligatoirement si vous n'en avez pas le besoin. Par ailleurs, le menu à points peut contenir tous les liens ou actions utilisateurs dont vous avez besoin pour votre projet.</p>
</div>

<style>
code {
  color: var(--text-default-warning);
  background-color: var(--background-alt-grey);
  border: var(--border-default-grey) solid 1px;
  border-radius: 0.25rem;
  padding: 0 0.25rem;
  font-size: 0.9rem;
  font-family: 'Courier New';
}
</style>
