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

    // Initial check for hash in URL on load - ensures page scrolls to section after Svelte renders
    if (window.location.hash) {
      setTimeout(() => {
        const id = decodeURIComponent(window.location.hash.slice(1));
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 500);
    }

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
        htmlLabels: true,
        flowchart: {
          htmlLabels: true,
          useMaxWidth: false,
          curve: 'basis'
        },
        sequence: { useMaxWidth: false }
      });

      for (const el of Array.from(elements)) {
        try {
          if (!(el instanceof HTMLElement)) continue;
          const rawCode = el.getAttribute('data-mermaid');
          if (!rawCode) continue;

          const rect = el.getBoundingClientRect();
          if (rect.width === 0 || rect.height === 0) continue;

          const style = window.getComputedStyle(el);
          if (style.display === 'none' || style.visibility === 'hidden') continue;

          let decodedCode = '';
          try {
            const binString = atob(rawCode);
            const bytes = Uint8Array.from(binString, (m) => m.codePointAt(0)!);
            decodedCode = new TextDecoder().decode(bytes);
          } catch {
            const decoder = document.createElement('div');
            decoder.innerHTML = rawCode;
            decodedCode = decoder.textContent || decoder.innerText || rawCode;
          }

          decodedCode = decodedCode.replace(/\\n/g, '\n').replace(/\r/g, '').trim();

          el.innerHTML = decodedCode;
          el.removeAttribute('data-processed');

          const id = 'mermaid-' + Math.random().toString(36).substring(2, 11);
          const { svg } = await mermaid.render(id, decodedCode);
          el.innerHTML = svg;
          el.setAttribute('data-processed', 'true');
        } catch (err) {
          if (err instanceof Error && err.message.includes('suitable point')) {
            continue;
          }
          console.error('Mermaid individual render error:', err);
        }
      }

      mermaidBusy = false;
    };

    // Double-RAF + a small delay to ensure DOM and styles are fully applied
    const rafId = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (!mermaidBusy) {
          setTimeout(renderMermaid, 200);
        }
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

  <div class="flex-grow"></div>

  <Footer {socials} {siteTitle} {description} {author} />
</div>

<style>
  :global(html) {
    scroll-behavior: smooth;
    overflow-y: scroll;
  }

  :global(body) {
    overflow-y: auto;
  }

  /* Hide Hugo-injected TOCs to avoid duplication with the Svelte TOC */
  :global(.toc),
  :global(.post-toc) {
    display: none !important;
  }
</style>
