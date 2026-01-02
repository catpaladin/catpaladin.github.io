# Tailwind CSS Styling

This document covers Tailwind CSS styling guidelines and dark mode patterns for the project.

## Dark Mode Pattern

Use class variants for dark mode to ensure proper theming:

```svelte
<div class="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
  <button class="hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
    <!-- Content -->
  </button>
</div>
```

## Key Patterns

- **Background colors**: Use `dark:bg-*` variants for dark mode
- **Text colors**: Use `dark:text-*` variants for readability
- **Hover states**: Apply dark mode variants to `hover:` classes
- **Transitions**: Use `transition-*` utilities for smooth interactions

## Example Usage

```svelte
<!-- Card component with dark mode -->
<div class="bg-slate-50 dark:bg-slate-800 rounded-lg shadow-lg p-4">
  <h2 class="text-xl font-semibold text-slate-900 dark:text-white">Card Title</h2>
  <p class="text-slate-700 dark:text-slate-300 mt-2">
    Card content with proper dark mode text colors
  </p>
  <button
    class="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors"
  >
    Action Button
  </button>
</div>
```

## Best Practices

- Always provide both light and dark mode variants for colors
- Use semantic color names (slate, blue, etc.) rather than arbitrary values
- Test dark mode by toggling the theme in the UI
- Apply dark mode to parent containers to cascade to children
