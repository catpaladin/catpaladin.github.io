import '../assets/css/app.css';
import { mount } from 'svelte';
import App from './App.svelte';

const blogData = window.BLOG_DATA || {
  siteTitle: 'Didactic Musings',
  menu: [],
  socials: [],
  description: '',
  author: 'Mike',
  isPage: false,
  section: ''
};

const target = document.getElementById('app') as HTMLElement;
const source = document.getElementById('hugo-content');
let initialContent = '';
let tocHtml = '';

if (source) {
  // Get the TOC content
  const tocElement = source.querySelector('#hugo-toc');
  tocHtml = tocElement ? tocElement.innerHTML : '';

  // Get the inner main content
  const mainContent = source.querySelector('main');
  initialContent = mainContent ? mainContent.innerHTML : source.innerHTML;

  // Remove the source element after extraction to avoid conflicts
  source.remove();
}

const app = mount(App, {
  target: target,
  props: {
    siteTitle: blogData.siteTitle,
    menu: blogData.menu,
    socials: blogData.socials,
    content: initialContent,
    description: blogData.description,
    author: blogData.author,
    tocHtml,
    isPage: blogData.isPage ?? false,
    section: blogData.section ?? ''
  }
});

export default app;
