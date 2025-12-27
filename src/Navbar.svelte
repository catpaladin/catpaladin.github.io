<script lang="ts">
  import Search from './Search.svelte';
  import ThemeToggle from './ThemeToggle.svelte';

  interface MenuItem {
    name: string;
    url: string;
  }

  let { siteTitle = 'CatPaladin', menu = [] }: { siteTitle?: string; menu?: MenuItem[] } = $props();
  let mobileMenuOpen = $state(false);

  function toggleMobileMenu() {
    mobileMenuOpen = !mobileMenuOpen;
  }
</script>

<nav
  class="sticky top-0 z-[100] w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-dark/80 backdrop-blur-md transition-colors duration-300"
>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex justify-between h-16 items-center">
      <div class="flex-shrink-0">
        <a
          href="/"
          class="text-xl font-bold text-slate-900 dark:text-white hover:text-primary transition-colors"
        >
          {siteTitle}
        </a>
      </div>

      <!-- Desktop Menu -->
      <div class="hidden sm:flex sm:items-center sm:space-x-6">
        {#each menu as item}
          {#if item.name && item.name.toLowerCase() !== 'about'}
            <a
              href={item.url}
              class="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-white transition-colors"
            >
              {item.name}
            </a>
          {/if}
        {/each}

        <Search />

        <a
          href="/about/"
          class="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-white transition-colors"
        >
          About
        </a>

        <ThemeToggle />
      </div>

      <!-- Mobile menu button -->
      <div class="flex items-center sm:hidden space-x-4">
        <ThemeToggle />
        <button
          onclick={toggleMobileMenu}
          class="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none transition-colors"
          aria-expanded={mobileMenuOpen}
        >
          <span class="sr-only">Open main menu</span>
          {#if !mobileMenuOpen}
            <svg
              class="block h-6 w-6"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          {:else}
            <svg
              class="block h-6 w-6"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          {/if}
        </button>
      </div>
    </div>
  </div>

  <!-- Mobile Menu -->
  {#if mobileMenuOpen}
    <div
      class="sm:hidden bg-white dark:bg-dark border-b border-slate-200 dark:border-slate-800 animate-in fade-in slide-in-from-top-4 duration-200"
    >
      <div class="pt-2 pb-3 space-y-1 px-4">
        {#each menu as item}
          <a
            href={item.url}
            class="block px-3 py-2 rounded-md text-base font-medium text-slate-600 dark:text-slate-400 hover:text-primary hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            onclick={() => (mobileMenuOpen = false)}
          >
            {item.name}
          </a>
        {/each}
      </div>
    </div>
  {/if}
</nav>
