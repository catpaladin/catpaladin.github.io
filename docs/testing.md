# Testing Guidelines

This repository uses Vitest for testing Svelte components with @testing-library/svelte.

## Testing Commands

```bash
bun run test         # Run all tests with vitest
bun test             # Run all tests with vitest
npx vitest run ThemeToggle.test.ts  # Run single test file
npx vitest watch     # Watch mode for TDD
```

## Testing Patterns

```typescript
import { render, screen, fireEvent } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';

describe('ComponentName', () => {
  it('renders correctly', () => {
    render(Component);
    const button = screen.getByRole('button', { name: /text/i });
    expect(button).toBeInTheDocument();
  });

  it('handles user interaction', async () => {
    render(Component);
    const button = screen.getByRole('button');
    await fireEvent.click(button);
    // Assert behavior
  });
});
```
