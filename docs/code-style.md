# Code Style Guidelines

This document contains code style guidelines for the Hugo + Svelte 5 project.

## TypeScript Configuration

- **Strict mode**: Enabled
- **Target**: ESNext
- **No unused locals/parameters**: Enforced
- **No fallthrough cases in switch**: Enforced

## Import Organization

```typescript
// 1. External libraries
import Fuse from 'fuse.js';
import { onMount } from 'svelte';

// 2. Internal components
import Button from './Button.svelte';

// 3. Types/interfaces
interface MenuItem {
  name: string;
  url: string;
}

// 4. Utility functions (if exported from module)
```

## Formatting (Prettier)

- **Indentation**: 2 spaces (no tabs)
- **Quotes**: Single quotes
- **Line width**: 100 characters
- **Trailing commas**: Disabled
- Always format before committing: `npm run format`

## Naming Conventions

- **Components**: PascalCase (`ThemeToggle.svelte`, `TableOfContents`)
- **Variables/Functions**: camelCase (`toggleTheme()`, `let isOpen`)
- **Type interfaces**: PascalCase (`interface MenuItem { ... }`)
- **Tailwind classes**: Use as-is from framework (already consistent)
- **Event handlers**: `handle*` prefix (`handleKeydown()`, `handleSubmit()`)

## Error Handling

```typescript
// Always use try/catch for async operations
async function fetchPosts() {
  try {
    const response = await fetch('/api/posts');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (err) {
    console.error('Fetch error:', err);
    // Show user-friendly message or fallback
  }
}
```

## Accessibility Requirements

- Use semantic HTML elements
- Include ARIA labels for interactive elements: `aria-label="Toggle theme"`
- Keyboard support for custom components
- Test with screen readers when possible
