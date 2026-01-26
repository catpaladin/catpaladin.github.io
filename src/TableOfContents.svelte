<script lang="ts">
  interface Props {
    tocHtml?: string;
  }

  let { tocHtml = '' }: Props = $props();
  let items = $derived(parseToc(tocHtml));
  let isOpen = $state(false);

  // Parse the raw HTML into Svelte state
  function parseToc(html: string) {
    if (!html) return [];

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const links = doc.querySelectorAll('a');

    return Array.from(links)
      .map((link) => {
        const href = link.getAttribute('href') || '';
        const text = link.textContent?.trim() || '';

        // Calculate depth by counting parent <ul> tags
        let level = 0;
        let parent = link.parentElement;
        while (parent && parent !== doc.body) {
          if (parent.tagName === 'UL') level++;
          parent = parent.parentElement;
        }

        return {
          id: href.startsWith('#') ? decodeURIComponent(href.slice(1)) : href,
          text,
          level: Math.max(0, level - 1)
        };
      })
      .filter((item) => item.id && item.text);
  }
</script>

{#if items.length > 0}
  <!-- Desktop Sidebar -->
  <aside class="hidden lg:block relative w-64 h-fit">
    <nav
      class="p-6 rounded-2xl bg-slate-50/50 dark:bg-dark-lighter/20 backdrop-blur-md border border-slate-200 dark:border-slate-800"
    >
      <h3
        class="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4"
      >
        Table of Contents
      </h3>
      <ul class="space-y-2">
        {#each items as item}
          <li style="padding-left: {item.level * 0.75}rem">
            <a
              href="#{item.id}"
              class="text-left text-sm text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-white transition-colors leading-tight block"
            >
              {item.text}
            </a>
          </li>
        {/each}
      </ul>
    </nav>
  </aside>

  <!-- Mobile Floating Trigger -->
  <div class="lg:hidden fixed bottom-6 right-6 z-40">
    <button
      onclick={() => (isOpen = !isOpen)}
      class="p-4 rounded-full bg-primary text-white shadow-2xl hover:scale-110 active:scale-95 transition-all"
      aria-label="Toggle Navigation"
    >
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M4 6h16M4 12h16m-7 6h7"
        />
      </svg>
    </button>

    {#if isOpen}
      <div
        class="absolute bottom-16 right-0 w-72 max-h-[60vh] overflow-y-auto p-6 rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in slide-in-from-bottom-4"
      >
        <h3
          class="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4"
        >
          Jump to Section
        </h3>
        <ul class="space-y-4">
          {#each items as item}
            <li style="padding-left: {item.level * 0.75}rem">
              <a
                href="#{item.id}"
                onclick={() => (isOpen = false)}
                class="text-left text-base font-medium text-slate-600 dark:text-slate-400 hover:text-primary transition-colors leading-snug block"
              >
                {item.text}
              </a>
            </li>
          {/each}
        </ul>
      </div>
    {/if}
  </div>
{/if}

<style>
  ul {
    list-style: none;
    margin: 0;
    padding: 0;
  }
</style>
