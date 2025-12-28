<script lang="ts">
  import Navbar from './Navbar.svelte';
  import Footer from './Footer.svelte';
  import ScrollIndicator from './ScrollIndicator.svelte';
  import TableOfContents from './TableOfContents.svelte';
  import mermaid from 'mermaid';

  interface MenuItem {
    name: string;
    url: string;
  }

  interface SocialItem {
    name: string;
    url: string;
    icon: string;
  }

  interface Props {
    siteTitle: string;
    menu: MenuItem[];
    socials: SocialItem[];
    content: string;
    description: string;
    author: string;
    tocHtml: string;
    isPage: boolean;
    section: string;
  }

  let { siteTitle, menu, socials, content, description, author, tocHtml, isPage, section }: Props =
    $props();

  let mermaidBusy = false;

  $effect(() => {
    // These dependencies trigger the effect on content, TOC, or theme changes
    void content;
    void tocHtml;
    void document.documentElement.classList.contains('dark');

    if (mermaidBusy) return;

    const renderMermaid = async () => {
      const elements = document.querySelectorAll('.mermaid');
      if (elements.length === 0) return;

      mermaidBusy = true;

      const isDark = document.documentElement.classList.contains('dark');
      mermaid.initialize({
        startOnLoad: false,
        theme: isDark ? 'dark' : 'default',
        securityLevel: 'loose',
        fontFamily: 'inherit',
        htmlLabels: true, // Crucial for <br> support
        flowchart: {
          htmlLabels: true,
          useMaxWidth: false,
          curve: 'basis'
        },
        sequence: { useMaxWidth: false }
      });

      // Process each element individually for better control
      for (const el of Array.from(elements)) {
        try {
          if (!(el instanceof HTMLElement)) continue;
          const rawCode = el.getAttribute('data-mermaid');
          if (!rawCode) continue;

          // Check visibility and dimensions - more robust check
          const rect = el.getBoundingClientRect();
          if (rect.width === 0 || rect.height === 0) continue;

          // Additional check: ensure element is actually visible in DOM
          const style = window.getComputedStyle(el);
          if (style.display === 'none' || style.visibility === 'hidden') continue;

          // Reset the element
          let decodedCode = '';
          try {
            // Decode base64 to handling unicode correctly
            const binString = atob(rawCode);
            const bytes = Uint8Array.from(binString, (m) => m.codePointAt(0)!);
            decodedCode = new TextDecoder().decode(bytes);
          } catch {
            // Fallback for non-base64 or failed decode
            const decoder = document.createElement('div');
            decoder.innerHTML = rawCode;
            decodedCode = decoder.textContent || decoder.innerText || rawCode;
          }

          // Use standard newlines. Preserve <br> for Mermaid's internal node labels.
          decodedCode = decodedCode.replace(/\\n/g, '\n').replace(/\r/g, '').trim();

          el.innerHTML = decodedCode;
          el.removeAttribute('data-processed');

          // Generate a unique ID for this render pass
          const id = 'mermaid-' + Math.random().toString(36).substring(2, 11);
          const { svg } = await mermaid.render(id, decodedCode);
          el.innerHTML = svg;
          el.setAttribute('data-processed', 'true');
        } catch (err) {
          // If it's the "suitable point" error, it's usually transient layout issues
          if (err instanceof Error && err.message.includes('suitable point')) {
            // Silent retry later or just skip this one
            continue;
          }
          console.error('Mermaid individual render error:', err);
        }
      }

      mermaidBusy = false;
    };

    // Double-RAF + a small delay to ensure DOM and styles (like dark mode) are fully applied
    const rafId = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setTimeout(renderMermaid, 200);
      });
    });

    return () => {
      cancelAnimationFrame(rafId);
      mermaidBusy = false;
    };
  });
</script>

<div class="min-h-screen flex flex-col relative">
  <ScrollIndicator />
  <Navbar {siteTitle} {menu} />

  <div class="flex-grow max-w-4xl mx-auto px-4 py-12 w-full relative min-h-screen">
    {#if isPage && section === 'posts'}
      <TableOfContents {tocHtml} />
    {/if}
    {@html content}
  </div>

  <Footer {socials} {siteTitle} {description} {author} />
</div>

<!-- Add CSS for scroll offset -->
<style>
  :global(html) {
    scroll-behavior: smooth;
    scroll-padding-top: 6rem; /* Offset for fixed navbar (h-16 = 4rem, use 6rem for safety) */
    overflow-y: scroll;
  }

  :global(body) {
    overflow-y: auto;
  }

  /* Ensure headers have scroll margin as backup */
  :global(h2[id]),
  :global(h3[id]),
  :global(h4[id]) {
    scroll-margin-top: 6rem;
  }
</style>
