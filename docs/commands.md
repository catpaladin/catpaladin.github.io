# Essential Commands

## Development

```bash
bun run dev          # Start Vite dev server
bun run build        # Build to assets/dist/
bun run preview      # Preview production build
```

## Code Quality

```bash
bun run check        # Svelte type checking (svelte-check)
bun run lint         # ESLint
bun run format       # Format with Prettier
```

## Testing

```bash
bun run test         # Run all tests with vitest
bun test             # Run all tests with vitest
npx vitest run ThemeToggle.test.ts  # Run single test file
npx vitest watch     # Watch mode for TDD
```

## Hugo Build (full site)

```bash
hugo                 # Build Hugo site (includes Vite build)
```
