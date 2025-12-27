<script lang="ts">
  interface SocialItem {
    name: string;
    url: string;
    icon: string;
  }

  let {
    socials = [],
    siteTitle = 'CatPaladin',
    description = '',
    author = ''
  }: {
    socials?: SocialItem[];
    siteTitle?: string;
    description?: string;
    author?: string;
  } = $props();
  const currentYear = new Date().getFullYear();
</script>

<footer
  class="mt-24 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-dark-lighter/30 backdrop-blur-sm"
>
  <div class="max-w-4xl mx-auto px-4 py-12">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
      <div>
        <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-2">{siteTitle}</h3>
        <p class="text-sm text-slate-600 dark:text-slate-400 max-w-xs">
          {description ||
            'Software Engineer exploring Go, Platform Engineering, and modern web tech.'}
        </p>
      </div>

      <div class="flex md:justify-end space-x-6">
        {#if Array.isArray(socials)}
          {#each socials as social}
            <a
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              class="text-slate-500 hover:text-primary transition-colors p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label={social.name}
            >
              <span class="sr-only">{social.name}</span>
              <div class="w-6 h-6 flex items-center justify-center">
                {#if social.icon === 'brand-github'}
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
                    ><path
                      d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"
                    /><path d="M9 18c-4.51 2-5-2-7-2" /></svg
                  >
                {:else if social.icon === 'brand-linkedin'}
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
                    ><path
                      d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"
                    /><rect width="4" height="12" x="2" y="9" /><circle cx="4" cy="4" r="2" /></svg
                  >
                {:else if social.icon === 'brand-mastodon'}
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
                    ><path
                      d="M21 8c0-2.2-2.7-3-5.4-3-3.1 0-4.6 1.3-4.6 1.3V5H9v13h2v-5c0-1.7 1.4-3 3.1-3 .8 0 1.9.4 1.9 1.7V18h2V11c0-2.2-1.8-3-4-3m-15 0h2v10H6V8"
                    /><path d="M2 5h4v2H2z" /></svg
                  >
                {:else if social.icon === 'brand-bluesky'}
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
                    ><path d="M12 12c-2-2-6-2-8 0 2 2 2 6 0 8 2-2 6-2 8 0 2-2 2-6 0-8" /><path
                      d="M12 12c2-2 6-2 8 0-2 2-2 6 0 8-2-2-6-2-8 0-2-2-2-6 0-8"
                    /></svg
                  >
                {:else}
                  <span class="text-xs font-bold uppercase"
                    >{(social.name || social.icon || '??').toString().substring(0, 2)}</span
                  >
                {/if}
              </div>
            </a>
          {/each}
        {/if}
      </div>
    </div>

    <div
      class="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500"
    >
      <p>&copy; {currentYear} {author || 'Mike Sahari'}. All rights reserved.</p>
      <div class="mt-4 md:mt-0 flex space-x-4">
        <a href="/index.xml" class="hover:text-primary">RSS Feed</a>
        <a href="https://github.com/catpaladin/catpaladin.github.io" class="hover:text-primary"
          >Source Code</a
        >
      </div>
    </div>
  </div>
</footer>
