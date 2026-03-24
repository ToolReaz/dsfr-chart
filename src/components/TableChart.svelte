<svelte:options customElement={{ tag: "table-chart", shadow: "none" }} />

<script>
  import { untrack } from 'svelte';
  import { formatNumber, teleportToDatabox } from '@/utils/global.js';

  let {
    x = '',
    y = '',
    line = '',
    name = '',
    tableName = '',
    databoxId = null,
    databoxType = null,
    databoxSource = 'global',
  } = $props();

  let widgetEl;
  let xparse = $state([]);
  let yparse = $state([]);
  let lineParse = $state([]);
  let nameParse = $state([]);

  function resetData() {
    xparse = [];
    yparse = [];
    lineParse = [];
    nameParse = [];
  }

  function getData() {
    if (x && y) {
      try {
        xparse = JSON.parse(x ?? '[]');
        yparse = JSON.parse(y ?? '[]');
      } catch (error) {
        console.error('Erreur lors du parsing des données x ou y:', error);
        return;
      }
    }

    if (line) {
      try {
        lineParse = JSON.parse(line ?? '[]');
      } catch (error) {
        console.error('Erreur lors du parsing des données line:', error);
        return;
      }
    }

    let tmpNameParse = [];
    if (name) {
      try { tmpNameParse = JSON.parse(name); } catch (error) { console.error('Erreur lors du parsing de name:', error); }
    }

    for (let i = 0; i < yparse.length; i++) {
      nameParse.push(tmpNameParse[i] || 'Série ' + (i + 1));
    }

    for (let i = 0; i < (lineParse.length ? lineParse[0].length : 0); i++) {
      nameParse.push(tmpNameParse[i] || 'Série ' + (i + 1));
    }
  }

  function getClass(value) {
    let classes = '';
    if (typeof value === 'string' && value.replace(/<[^>]*>/g, '').length > 132) {
      classes += 'text-overflow ';
    }
    if (typeof value === 'number') {
      classes += 'text-right ';
    } else {
      classes += 'text-left ';
    }
    return classes;
  }

  $effect(() => {
    x; y; line; name; tableName;
    if (!x) return;
    untrack(() => {
      teleportToDatabox(widgetEl);
      resetData();
      getData();
    });
  });
</script>

<div bind:this={widgetEl} class="widget_container">
  <div class="fr-table" style="max-height: 25rem; overflow: auto">
    <div class="fr-table__wrapper">
      <div class="fr-table__container">
        <div class="fr-table__content">
          <table>
            <caption>{tableName}</caption>
            <thead>
              <tr>
                {#if xparse.length}
                  <th scope="col">{tableName}</th>
                {/if}
                {#each nameParse as item}
                  <th scope="col">{item}</th>
                {/each}
              </tr>
            </thead>
            <tbody>
              {#each xparse as rowItem, rowIndex}
                <tr>
                  <td class={getClass(rowItem)}>{rowItem}</td>
                  {#each yparse as colItem}
                    <td class={getClass(colItem[rowIndex])}>{formatNumber(colItem[rowIndex])}</td>
                  {/each}
                </tr>
              {/each}
              {#each lineParse as rowItem}
                <tr>
                  {#each rowItem as cellItem}
                    <td class={getClass(cellItem)}>{@html cellItem}</td>
                  {/each}
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</div>
