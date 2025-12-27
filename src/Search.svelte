<script lang="ts">
  import Fuse from 'fuse.js';

  interface Post {
    title: string;
    permalink: string;
    date: string;
    tags?: string[];
    content: string;
  }

  let query = $state('');
  let results = $state<Post[]>([]);
  let fuse = $state<Fuse<Post> | null>(null);
  let isOpen = $state(false);
  let isInitialized = $state(false);

  async function initializeSearch() {
    if (isInitialized) return;

    try {
      // Use absolute path to avoid 404s on non-root pages
      const response = await fetch('/index.json');
      if (!response.ok) throw new Error(`Search index not found`);
      const data = await response.json();
      initFuse(data);
      isInitialized = true;
    } catch (e) {
      console.error('Search Initialization Error:', e);
    }
  }

  function initFuse(data: Post[]) {
    console.log('Initializing Search with', data.length, 'items');
    fuse = new Fuse(data, {
      keys: ['title', 'tags', 'content'],
      threshold: 0.4, // Slightly more relaxed for better results
      minMatchCharLength: 2,
      ignoreLocation: true // Search everywhere in content
    });
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && isOpen) {
      closeSearch();
    }
  }

  $effect(() => {
    if (fuse && query.length > 1) {
      results = fuse
        .search(query)
        .slice(0, 5)
        .map((r) => r.item);
    } else {
      results = [];
    }
  });

  function closeSearch() {
    isOpen = false;
    query = '';
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="relative">
  <button
    onclick={async () => {
      isOpen = true;
      await initializeSearch();
    }}
    class="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-primary transition-all text-sm group"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="group-hover:text-primary transition-colors"
      ><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg
    >
    <span class="hidden md:inline">Search...</span>
  </button>

  {#if isOpen}
    <div
      role="button"
      tabindex="0"
      class="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-sm flex items-start justify-center pt-24 px-4"
      onclick={closeSearch}
      onkeydown={(e) => e.key === 'Enter' && closeSearch()}
    >
      <div
        role="button"
        tabindex="0"
        class="bg-white dark:bg-slate-900 w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
        onclick={(e) => e.stopPropagation()}
        onkeydown={(e) => e.stopPropagation()}
      >
        <div class="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="text-slate-400 mr-3"
            ><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg
          >
          <input
            type="text"
            bind:value={query}
            placeholder="Search posts, tags, content..."
            class="bg-transparent border-none focus:ring-0 text-lg w-full text-slate-900 dark:text-white"
          />
          <button
            onclick={closeSearch}
            class="text-slate-400 hover:text-primary text-xs font-bold uppercase tracking-widest"
            >ESC</button
          >
        </div>

        <div class="max-h-[60vh] overflow-y-auto p-2">
          {#if results.length > 0}
            <div class="space-y-1">
              {#each results as post}
                <a
                  href={post.permalink}
                  class="block p-4 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 group transition-colors"
                  onclick={closeSearch}
                >
                  <div class="flex justify-between items-start">
                    <h4
                      class="font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors"
                    >
                      {post.title}
                    </h4>
                    <span class="text-[10px] text-slate-400 uppercase font-bold tracking-tighter"
                      >{post.date}</span
                    >
                  </div>
                  {#if post.tags}
                    <div class="flex gap-2 mt-2">
                      {#each post.tags as tag}
                        <span
                          class="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                          >#{tag}</span
                        >
                      {/each}
                    </div>
                  {/if}
                </a>
              {/each}
            </div>
          {:else if query.length > 1}
            <div class="p-12 text-center text-slate-500">
              No results found for "{query}"
            </div>
          {:else}
            <div class="p-12 text-center text-slate-400 text-sm italic">
              Type to start searching...
            </div>
          {/if}
        </div>
      </div>
    </div>
  {/if}
</div>
