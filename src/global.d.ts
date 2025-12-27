/// <reference types="svelte" />
/// <reference types="vite/client" />

interface BlogData {
  siteTitle: string;
  menu: Array<{ name: string; url: string }>;
  socials: Array<{ name: string; url: string; icon: string }>;
  description: string;
  author: string;
  isPage?: boolean;
  section?: string;
}

interface Window {
  BLOG_DATA: BlogData;
}
