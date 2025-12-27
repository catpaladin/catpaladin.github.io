import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  ...svelte.configs['flat/recommended'],
  prettier,
  ...svelte.configs['flat/prettier'],
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node
      }
    }
  },
  {
    files: ['**/*.svelte'],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser
      }
    }
  },
  {
    ignores: ['assets/dist/', 'public/', 'resources/', '.hugo_build.lock']
  },
  {
    rules: {
      'svelte/no-at-html-tags': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      'svelte/require-each-key': 'off',
      '@typescript-eslint/no-require-imports': 'off'
    }
  }
);
