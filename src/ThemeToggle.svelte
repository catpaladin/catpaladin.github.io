<script lang="ts">
  import { onMount } from 'svelte';

  let theme = $state<'light' | 'dark'>('dark');

  onMount(() => {
    // Determine initial theme
    if (
      localStorage.theme === 'dark' ||
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
    ) {
      theme = 'dark';
    } else {
      theme = 'light';
    }
  });

  $effect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
    }
  });

  function toggleTheme() {
    theme = theme === 'light' ? 'dark' : 'light';
  }
</script>

<button
  onclick={toggleTheme}
  class="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-300 flex items-center justify-center border border-transparent hover:border-primary/50"
  aria-label="Toggle theme"
>
  {#if theme === 'light'}
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="w-5 h-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" /></svg
    >
  {:else}
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="w-5 h-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      ><circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path d="M12 20v2" /><path
        d="m4.93 4.93 1.41 1.41"
      /><path d="m17.66 17.66 1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path
        d="m6.34 17.66-1.41 1.41"
      /><path d="m19.07 4.93-1.41 1.41" /></svg
    >
  {/if}
</button>
