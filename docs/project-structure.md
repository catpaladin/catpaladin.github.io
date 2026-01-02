# Project Structure

## Project Structure

- **Package Manager**: Bun
- **Framework**: Hugo (static site) + Svelte 5 components
- **Language**: TypeScript (strict mode)
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with class-based dark mode
- **Testing**: Vitest with @testing-library/svelte
- **Linting**: ESLint + Prettier

## Build Output

- **Svelte build**: `assets/dist/app.js`, `assets/dist/app.css`
- **Hugo build**: `public/` directory
- Vite outputs IIFE format for Hugo integration

## File Locations

- **Svelte components**: `src/*.svelte`
- **TypeScript utilities**: `src/*.ts`
- **Tests**: `src/*.test.ts` (next to component)
- **Hugo templates**: `layouts/**/*.html`
- **Content**: `content/**/*.md`
- **Static assets**: `static/`
