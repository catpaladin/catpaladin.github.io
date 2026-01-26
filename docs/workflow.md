# Workflow

## Workflow Checklist

1. Create component with `<script lang="ts">` and proper types
2. Use Svelte 5 runes: `$state()`, `$props()`, `$effect()`
3. Add accessibility attributes
4. Format with Prettier: `npm run format`
5. Run type check: `npm run check`
6. Run linter: `npm run lint`
7. Write tests if component has logic

## Commit Message Guidelines

When generating commit messages, follow these rules:

- **Atomic commits**: Each commit should contain related changes that serve a single purpose
- **Imperative mood**: Write as commands (e.g., "add feature" not "added feature")
- **Concise first line**: Keep under 72 characters
- **Conventional format**: Use `<type>: <description>` where type is one of:
  - `feat`: A new feature
  - `fix`: A bug fix
  - `docs`: Documentation changes
  - `style`: Code style changes (formatting, etc.)
  - `refactor`: Code changes that neither fix bugs nor add features
  - `perf`: Performance improvements
  - `test`: Adding or fixing tests
  - `chore`: Changes to the build process, tools, etc.
- **Present tense, imperative mood**: Write commit messages as commands (e.g., "add feature" not
  "added feature")
- **Concise first line**: Keep the first line under 72 characters

## Reference: Good Commit Examples

Use these as examples when generating commit messages:

- feat: add user authentication system
- fix: resolve memory leak in rendering process
- docs: update API documentation with new endpoints
- refactor: simplify error handling logic in parser
- fix: resolve linter warnings in component files
- chore: improve developer tooling setup process
- feat: implement business logic for transaction validation
- fix: address minor styling inconsistency in header
- fix: patch critical security vulnerability in auth flow
- style: reorganize component structure for better readability
- fix: remove deprecated legacy code
- feat: add input validation for user registration form
- fix: resolve failing CI pipeline tests
- feat: implement analytics tracking for user engagement
- fix: strengthen authentication password requirements
- feat: improve form accessibility for screen readers

Example commit sequence:

- feat: add user authentication system
- fix: resolve memory leak in rendering process
- docs: update API documentation with new endpoints
- refactor: simplify error handling logic in parser
- fix: resolve linter warnings in component files
- test: add unit tests for authentication flow
