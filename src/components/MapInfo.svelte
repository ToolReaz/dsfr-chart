<script>
  import { formatNumber } from '@/utils/global.js';

  let { data } = $props();

  let gradient = $derived(
    'linear-gradient(90deg,' + data.colorMin + ' 0%,' + data.colorMax + ' 100%)'
  );
</script>

<div class="map_info fr-col-12 fr-col-lg-3">
  {#if data.valueNat || data.valueReg}
    <div>
      <p class="fr-text--xs fr-mb-1v" style:color={data.textMention}>
        Mise à jour : {data.date}
      </p>
      <p class="fr-text--xs fr-text--bold fr-mb-1v" style:color={data.textMention}>
        {data.names}, en France
      </p>
      <div class="sep fr-mb-2w"></div>
      <p class="fr-text--xs fr-text--bold fr-mb-2w" style:color={data.textMention}>
        {formatNumber(data.value)}
      </p>
    </div>
  {/if}
  <div>
    <p class="fr-text--xs fr-mb-1v" style:color={data.textMention}>
      Localisation
    </p>
    <p class="flex fr-text--sm fr-text--bold fr-mb-2w">
      <span>{data.localisation}</span>
    </p>
    <p class="fr-text--xs fr-mb-1v" style:color={data.textMention}>
      Mise à jour : {data.date}
    </p>
    <p class="fr-text--sm fr-text--bold fr-mb-1v">
      {data.names}
    </p>
    <p class="fr-text--md fr-text--bold fr-my-0">
      {formatNumber(data.valueNat || data.valueReg || data.value)}
    </p>
  </div>
  <div class="scale fr-mt-auto">
    <div class="sep fr-my-2w"></div>
    <p class="fr-text--xs fr-mb-1w" style:color={data.textMention}>
      Légende
    </p>
    <div class="scale_container" style:background={gradient}></div>
    <div class="scale_values">
      <span class="min fr-text--sm fr-text--bold fr-mb-0">{formatNumber(data.min)}</span>
      <span class="max fr-text--sm fr-text--bold fr-mb-0">{formatNumber(data.max)}</span>
    </div>
  </div>
</div>
