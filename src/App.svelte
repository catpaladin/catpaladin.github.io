<script lang="ts">
  import Navbar from './Navbar.svelte';
  import Footer from './Footer.svelte';
  import ScrollIndicator from './ScrollIndicator.svelte';
  import TableOfContents from './TableOfContents.svelte';
  import mermaid from 'mermaid';
  import { onMount } from 'svelte';

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

  type ThemeMode = 'dark' | 'light';

  const getTheme = (): ThemeMode =>
    document.documentElement.classList.contains('dark') ? 'dark' : 'light';

  const renderMermaid = async (themeMode?: ThemeMode) => {
    const elements = document.querySelectorAll('.mermaid');
    if (elements.length === 0) return;

    // Use passed theme mode or capture current DOM state immediately
    const currentMode: ThemeMode = themeMode ?? getTheme();
    const isDark = currentMode === 'dark';

    mermaidBusy = true;

    mermaid.initialize({
      startOnLoad: false,
      theme: 'base',
      themeVariables: isDark
        ? {
            darkMode: true,
            background: '#1e293b',
            primaryColor: '#3b82f6',
            primaryTextColor: '#f1f5f9',
            primaryBorderColor: '#60a5fa',
            lineColor: '#94a3b8',
            secondaryColor: '#475569',
            tertiaryColor: '#334155',
            fontFamily: 'inherit',
            fontSize: '16px',
            flowchart: {
              nodeTextColor: '#f1f5f9',
              nodeBorder: '#60a5fa',
              curve: 'basis'
            },
            sequence: {
              actorTextColor: '#f1f5f9',
              actorBkg: '#3b82f6',
              actorBorder: '#60a5fa',
              actorLineColor: '#94a3b8',
              signalColor: '#94a3b8',
              signalTextColor: '#f1f5f9'
            }
          }
        : {
            darkMode: false,
            background: '#ffffff',
            primaryColor: '#3b82f6',
            primaryTextColor: '#1e293b',
            primaryBorderColor: '#2563eb',
            lineColor: '#4b5563',
            secondaryColor: '#e2e8f0',
            tertiaryColor: '#cbd5e1',
            fontFamily: 'inherit',
            fontSize: '16px',
            flowchart: {
              nodeTextColor: '#1e293b',
              nodeBorder: '#2563eb',
              curve: 'basis'
            },
            sequence: {
              actorTextColor: '#1e293b',
              actorBkg: '#e0f2fe',
              actorBorder: '#2563eb',
              actorLineColor: '#4b5563',
              signalColor: '#4b5563',
              signalTextColor: '#1e293b'
            }
          },
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

  $effect(() => {
    void content;
    void tocHtml;

    // Handle initial page load with hash in URL
    if (window.location.hash) {
      const scrollToHash = () => {
        const id = window.location.hash.substring(1);
        const element = document.getElementById(id);

        if (element) {
          const rect = element.getBoundingClientRect();

          if (rect.height > 0) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          } else {
            setTimeout(scrollToHash, 100);
          }
        }
      };

      setTimeout(scrollToHash, 300);
    }

    const rafId = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (!mermaidBusy) {
          const theme = getTheme();
          setTimeout(() => renderMermaid(theme), 200);
        }
      });
    });

    return () => {
      cancelAnimationFrame(rafId);
      mermaidBusy = false;
    };
  });

  onMount(() => {
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          // Capture the theme immediately when mutation is detected
          const newTheme: ThemeMode = getTheme();
          // Render with captured theme, not re-reading DOM later
          setTimeout(() => renderMermaid(newTheme), 100);
        }
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => {
      observer.disconnect();
    };
  });
</script>

<div class="min-h-screen flex flex-col">
  <ScrollIndicator />
  <Navbar {siteTitle} {menu} />

  <main class="flex-1 w-full">
    <div class="max-w-4xl mx-auto px-4 py-12">
      {#if isPage && section === 'posts'}
        <TableOfContents {tocHtml} />
      {/if}
      <div class="content-wrapper">
        {@html content}
      </div>
    </div>
  </main>

  <Footer {socials} {siteTitle} {description} {author} />
</div>

<style>
  :global(html) {
    scroll-behavior: smooth;
  }

  :global(body) {
    overflow-y: auto;
  }

  :global(.content-wrapper) {
    display: block;
    position: relative;
    width: 100%;
    min-height: 100px;
  }

  :global(.content-wrapper h1),
  :global(.content-wrapper h2),
  :global(.content-wrapper h3),
  :global(.content-wrapper h4),
  :global(.content-wrapper h5),
  :global(.content-wrapper h6) {
    display: block !important;
    position: relative !important;
    scroll-margin-top: 6rem !important;
    margin-top: 2rem !important;
    margin-bottom: 1rem !important;
    min-height: 1.5rem !important;
    line-height: 1.4 !important;
  }

  :global(.content-wrapper h1 a),
  :global(.content-wrapper h2 a),
  :global(.content-wrapper h3 a),
  :global(.content-wrapper h4 a),
  :global(.content-wrapper h5 a),
  :global(.content-wrapper h6 a) {
    display: inline-block;
    color: inherit;
    text-decoration: none;
  }

  :global(.content-wrapper p),
  :global(.content-wrapper ul),
  :global(.content-wrapper ol),
  :global(.content-wrapper pre),
  :global(.content-wrapper blockquote) {
    display: block;
    position: relative;
  }

  :global(.toc),
  :global(.post-toc) {
    display: none !important;
  }
</style>
