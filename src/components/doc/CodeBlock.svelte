<script>
  let { attributes, tag } = $props();

  const tags = Array.isArray(tag) ? tag : [tag];
  const attrs = Array.isArray(attributes) ? attributes : [attributes];

  const toKebabCase = (str) =>
    str
      .replace('dataBox', 'databox')
      .replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)
      .replace(/^-/, '');

  const id = Math.floor(Math.random() * 1000);
</script>

<section class="fr-accordion fr-mt-4w fr-mb-6w">
  <h3 class="fr-accordion__title">
    <button class="fr-accordion__btn" aria-expanded="false" aria-controls="accordion-{tags[0]}-{id}">
      Extrait de code
    </button>
  </h3>
  <div id="accordion-{tags[0]}-{id}" class="fr-collapse">
    <div class="code-toolbar">
      <pre><code>{#each tags as comp, i}
<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;</span>{comp}</span></span>{#each Object.entries(attrs[i] || {}) as [attr, value]}
      <span class="token attr-name">{toKebabCase(attr)}</span><span class="token attr-value"><span class="token punctuation">=</span><span class="token punctuation">'</span><span class="class">{value}</span><span class="token punctuation">'</span></span>{/each}
  <span class="token punctuation">&gt;</span>
<span class="token tag"><span class="token punctuation">&lt;/</span>{comp}</span><span class="token punctuation">&gt;</span>
{/each}</code></pre>
    </div>
  </div>
</section>

<style>
.code-toolbar {
  background-color: #f5f2f0;
  overflow: scroll;
}
.attr-name, .builtin, .char, .inserted, .selector, .string { color: #690; }
.punctuation { color: #999; }
.tag { color: #905; }
.class { color: #000091; }
</style>
