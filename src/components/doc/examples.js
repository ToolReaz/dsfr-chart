import { chartData } from '@/assets/data.js';

export const chartExamples = [
  {
    title: 'Graphique en ligne',
    desc: 'Un graphique en ligne est un type de visualisation de données qui affiche les valeurs sous forme de points sur une ligne. Elle permet d’affiche une seule ligne ou en présenter plusieurs pour permettre la comparaison.',
    graphs: [
      { tag: 'line-chart', heading: 'Graphique en ligne simple', title: 'Évolution du prix des logements anciens entre 2001 et 2020', desc: 'Indices des prix des logements neufs et anciens, France métropolitaine. Base 100 en moyenne en 2015. Insee, 04/11/2024', props: chartData.lineChart.default },
      { tag: 'line-chart', heading: 'Graphique en lignes multiples', title: 'Taux d’activité selon le sexe depuis 1975', desc: 'France hors Mayotte, personnes de 15 à 64 ans vivant en logement ordinaire. Insee, 04/11/2024', props: chartData.lineChart.multiple },
    ],
  },
  {
    title: 'Diagramme en barres',
    desc: 'Un diagramme en barres montre les dénombrements de valeurs pour les niveaux d’une variable catégorielle, séquentielle ou neutre. Les barres peuvent être présentées de manière horizontale, verticale ou être empilées.',
    graphs: [
      { tag: 'bar-chart', heading: 'Barres verticales', title: 'Projection de la population française', desc: 'Population au 1er janvier - Données issues du scénario central des projections de population 2013-2070. Insee, 04/11/2024', props: chartData.barChart.vertical },
      { tag: 'bar-chart', heading: '', title: 'Pratique de l’internet des plus de 60 ans en 2018', desc: 'France hors Mayotte, individus de 15 ans ou plus vivant dans un ménage ordinaire. Insee, enquête Technologies de l’information et de la communication auprès des ménages, 04/11/2024', props: chartData.barChart.unicolor },
      { tag: 'bar-chart', heading: '', title: 'Les régions les plus pluvieuses de France en 2023', desc: 'France métropolitaine uniquement. Météo France, 04/11/2024', props: chartData.barChart.sequential },
      { tag: 'bar-chart', heading: 'Barres horizontales', title: 'Émissions de gaz à effet de serre par habitant en France', desc: 'En tonnes équivalent CO₂ par habitant. France métropolitaine. Insee, 12/02/2024', props: chartData.barChart.horizontal },
      { tag: 'bar-chart', heading: 'Barres empilées', title: 'Satisfaction des français à l’égard des services publics', desc: 'Étude IFOP pour TF1, janvier 2024 - Le regard des Français sur les services publics : satisfaction, jugement sur leur financement par les impôts et attentes. Ifop, enquête Emploi, 04/01/2024', props: chartData.barChart.stacked },
    ],
  },
  {
    title: 'Graphique en ligne / Diagramme en barres',
    desc: 'Il est également possible de combiner un graphique en ligne et un diagramme en barres, pour permettre la comparaison entre des données présentées différemment.',
    graphs: [{ tag: 'bar-line-chart', title: 'Évolution du nombre de naissances et du taux de natalité', desc: 'France hors Mayotte, naissances en milliers et taux de natalité pour mille femmes. Insee, 16/01/2024', props: chartData.barLineChart.default }],
  },
  {
    title: 'Diagramme circulaire',
    desc: 'Un diagramme circulaire permet de représenter un petit nombre de valeurs par des angles proportionnels à la fréquence de ces valeurs. Chacune des « parts » représente une catégorie de données qui forment un ensemble, et la taille de chaque « part » est proportionnelle à son poids dans l’ensemble. Le diagramme circulaire peut être plein ou creux.',
    graphs: [
      { tag: 'pie-chart', heading: 'Diagramme circulaire creux (donut)', title: 'Statut des emplois en France', desc: 'Pour l’année 2018. France hors Mayotte, population des ménages, personnes en emploi. Insee, enquête Emploi, 04/11/2024', props: chartData.pieChart.doughnut },
      { tag: 'pie-chart', heading: 'Diagramme circulaire plein', title: 'Structure des dépenses publiques en France en 2022', desc: 'France métropolitaine. Insee, 30/11/2023', props: chartData.pieChart.pie },
    ],
  },
  {
    title: 'Nuage de points',
    desc: 'Le nuage de points est largement utilisée pour présenter plusieurs séries de données. C’est une représentation graphique qui est particulièrement utile lorsque les valeurs des données sur l’axe Y dépendent des valeurs d’un autre axe X.',
    graphs: [
      { tag: 'scatter-chart', heading: 'Nuage de points simple', title: 'Évolution du taux moyen d’émissions de CO₂ en France', desc: 'Véhicules particuliers neufs vendus en France. Ademe, 04/11/2024', props: chartData.scatterChart.default },
      { tag: 'scatter-chart', heading: 'Nuage de points reliés', title: 'Carrières complètes selon le sexe et la génération en 2016', desc: 'Retraités ayant perçu un droit direct au cours de l’année, résidant en France, vivants au 31 décembre 2016 ; tous régimes confondus. Insee, 09/09/2011', props: chartData.scatterChart.linked },
    ],
  },
  {
    title: 'Diagramme en étoile',
    desc: 'Le diagramme en étoile ou radar chart a été conçu pour représenter une ou plusieurs séries de valeurs sur plusieurs variables quantitatives.',
    graphs: [{ tag: 'radar-chart', title: 'Statut des emplois par tranche d’âge', desc: 'Pour l’année 2018. France hors Mayotte, population des ménages, personnes en emploi. Insee, enquête Emploi, 04/11/2024', props: chartData.radarChart.default }],
  },
  {
    title: 'Jauge',
    desc: 'La jauge permet d’afficher des valeurs numériques ou des mesures dans une plage, pour visualiser l’avancement d’un objectif par exemple.',
    graphs: [{ tag: 'gauge-chart', noPalette: true, props: chartData.gaugeChart.default }],
  },
];
