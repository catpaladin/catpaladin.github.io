<script lang="ts">
  let { tocHtml = '' }: { tocHtml?: string } = $props();
  let isOpen = $state(false);

  function handleTocClick(event: MouseEvent) {
    const target = (event.target as HTMLElement).closest('a');
    if (!target || !target.hash || !target.hash.startsWith('#')) return;

    const id = target.hash.slice(1);
    const element = document.getElementById(id);

    if (element) {
      event.preventDefault();

      // Close mobile menu if open
      isOpen = false;

      const navbar = document.querySelector('nav');
      const navbarHeight = navbar ? navbar.offsetHeight : 64;
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = elementPosition - navbarHeight - 16; // Extra padding

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });

      // Update URL hash without jumping
      history.pushState(null, '', `#${id}`);
    }
  }
</script>

{#if tocHtml && tocHtml.trim().length > 0}
  <aside
    class="hidden lg:block fixed left-[calc(50%-56rem)] top-32 w-64 max-h-[calc(100vh-10rem)] overflow-y-auto"
  >
    <nav
      class="p-6 rounded-2xl bg-slate-50/50 dark:bg-dark-lighter/20 backdrop-blur-md border border-slate-200 dark:border-slate-800"
    >
      <h3
        class="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4"
      >
        Table of Contents
      </h3>
      <div
        class="toc-content prose prose-sm dark:prose-invert"
        onclick={handleTocClick}
        role="presentation"
      >
        {@html tocHtml}
      </div>
    </nav>
  </aside>

  <!-- Mobile Toggle -->
  <div class="xl:hidden fixed bottom-6 right-6 z-40">
    <button
      onclick={() => (isOpen = !isOpen)}
      class="p-3 rounded-full bg-primary text-white shadow-lg hover:scale-110 transition-transform"
      aria-label="Toggle Table of Contents"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        ><line x1="21" y1="10" x2="7" y2="10" /><line x1="21" y1="6" x2="3" y2="6" /><line
          x1="21"
          y1="14"
          x2="3"
          y2="14"
        /><line x1="21" y1="18" x2="7" y2="18" /></svg
      >
    </button>

    {#if isOpen}
      <div
        class="absolute bottom-16 right-0 w-72 max-h-[60vh] overflow-y-auto p-6 rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in slide-in-from-bottom-4"
      >
        <h3
          class="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4"
        >
          Table of Contents
        </h3>
        <div
          class="toc-content prose prose-sm dark:prose-invert"
          onclick={handleTocClick}
          role="presentation"
        >
          {@html tocHtml}
        </div>
      </div>
    {/if}
  </div>
{/if}

<style>
  :global(.toc-content ul) {
    list-style: none;
    padding-left: 0;
    margin: 0;
  }
  :global(.toc-content ul ul) {
    padding-left: 1rem;
    margin-top: 0.5rem;
  }
  :global(.toc-content li) {
    margin-bottom: 0.5rem;
  }
  :global(.toc-content a) {
    text-decoration: none;
    color: inherit;
    font-size: 0.875rem;
    transition: color 0.2s;
    display: block;
    line-height: 1.25;
  }
  :global(.toc-content a:hover) {
    color: var(--color-primary, #00b0ff);
  }
</style>
