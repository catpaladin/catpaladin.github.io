# Linting Rules

Key ESLint overrides for this project:

```javascript
// From eslint.config.js
'svelte/no-at-html-tags': 'off',              // Allows HTML tags in JS
'@typescript-eslint/no-explicit-any': 'warn', // Warns on `any`, not error
'svelte/require-each-key': 'off',             # Allows {#each} without :key
```
