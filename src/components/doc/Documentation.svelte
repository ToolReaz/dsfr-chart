<script>
  import { chartExamples } from './examples.js';
  import Intro from './Intro.svelte';
  import CodeBlock from './CodeBlock.svelte';
  import DisplayMode from './DisplayMode.svelte';
  import DataBoxSection from './DataBoxSection.svelte';
  import ColorsSection from './ColorsSection.svelte';
  import AccessibilitySection from './AccessibilitySection.svelte';

  const PALETTE_LABELS = {
    default: 'Palette par défaut',
    neutral: 'Palette unicolore',
    sequentialDescending: 'Palette séquentielle',
    divergentDescending: 'Palette séquentielle divergente',
  };

  let currentPage = $state(window.location.hash.slice(1));

  $effect(() => {
    function handleHashChange() {
      currentPage = window.location.hash.slice(1);
    }
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  });

  const toKebabCase = (str) =>
    str
      .replace('dataBox', 'databox')
      .replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)
      .replace(/^-/, '');

  function renderChart(node, params) {
    const props = $state.snapshot(params.props);
    const el = document.createElement(params.tag);
    // Set all props as JS properties BEFORE appending to DOM
    // so data is ready when the custom element's onMount fires
    for (const [key, value] of Object.entries(props)) {
      el[key] = value;
    }
    node.appendChild(el);

    return {
      destroy() {
        el.remove();
      }
    };
  }
</script>

<div class="fr-container">
  <section class="fr-grid-row fr-grid-row--center fr-mt-4w fr-mt-md-8w">
    <Intro />

    <!-- SIDE MENU -->
    <div class="fr-col-12 fr-col-md-3">
      <nav class="fr-sidemenu fr-sidemenu--sticky-full-height" role="navigation" aria-labelledby="sidemenu-title">
        <div class="fr-sidemenu__inner fr-mb-4w">
          <button class="fr-sidemenu__btn" aria-controls="sidemenu" aria-expanded="false" aria-current="true">
            Dans cette rubrique
          </button>
          <div id="sidemenu" class="fr-collapse">
            <p id="sidemenu-title" class="fr-sidemenu__title fr-sr-only">Menu de navigation</p>
            <ul class="fr-sidemenu__list">
              <li class="fr-sidemenu__item">
                <button
                  class="fr-sidemenu__btn"
                  aria-controls="sidemenu-representations-graphiques"
                  aria-expanded="true"
                  aria-current={!['Databox', 'Couleurs', 'Accessibilit%C3%A9'].includes(currentPage) || undefined}
                >
                  Graphiques disponibles
                </button>
                <div id="sidemenu-representations-graphiques" class="fr-collapse fr-collapse--expanded">
                  <ul class="fr-sidemenu__list">
                    {#each chartExamples as section}
                      <li class="fr-sidemenu__item">
                        <a
                          class="fr-sidemenu__link"
                          href={'#' + encodeURIComponent(section.title.replace(/ /g, '-'))}
                          target="_self"
                          aria-current={currentPage === encodeURIComponent(section.title.replace(/ /g, '-')) || undefined}
                        >
                          {section.title}
                        </a>
                      </li>
                    {/each}
                  </ul>
                </div>
              </li>
              <li class="fr-sidemenu__item">
                <a class="fr-sidemenu__link" href="#Databox" aria-current={currentPage === 'Databox' || undefined}>
                  Databox
                </a>
              </li>
              <li class="fr-sidemenu__item">
                <a class="fr-sidemenu__link" href="#Couleurs" aria-current={currentPage === 'Couleurs' || undefined}>
                  Les couleurs
                </a>
              </li>
              <li class="fr-sidemenu__item">
                <a class="fr-sidemenu__link" href="#Accessibilité" aria-current={currentPage === encodeURIComponent('Accessibilité') || undefined}>
                  Accessibilité
                </a>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </div>

    <div class="fr-col-12 fr-col-md-7">
      <h2 class="fr-h1">Graphiques disponibles</h2>

      <p>
        Ce catalogue présente l'ensemble des graphiques disponibles dans le module complémentaire au Système de design de l'État (DSFR) pour la visualisation de données. Les options de chacun des graphiques sont également présentés dans ce document.
      </p>

      {#each chartExamples as section}
        <div class="part_container">
          <h2 id={encodeURIComponent(section.title.replace(/ /g, '-'))}>
            {section.title}
          </h2>
          <p>{section.desc}</p>
          {#each section.graphs as graph}
            {#if graph.heading}
              <h3 id={encodeURIComponent(graph.heading.replace(/ /g, '-'))}>
                {graph.heading}
              </h3>
            {/if}
            {#if !graph.noPalette}
              <p class="fr-badge fr-badge--info fr-mt-1w fr-mb-1w">
                {PALETTE_LABELS?.[graph.props.selectedPalette] ?? 'Palette par défaut'}
              </p>
            {/if}
            {#if graph.title}
              <h3 class="fr-h6 fr-text--bold fr-mb-0">{graph.title}</h3>
            {/if}
            {#if graph.desc}
              <p class="fr-text--sm">{graph.desc}</p>
            {/if}
            <div use:renderChart={{ tag: graph.tag, props: graph.props }}></div>
            <CodeBlock
              tag={graph.tag}
              attributes={graph.props}
            />
          {/each}
        </div>
      {/each}

      <DataBoxSection />
      <ColorsSection />
      <AccessibilitySection />
    </div>
  </section>

  <DisplayMode />
</div>
