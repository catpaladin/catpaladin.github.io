# Svelte 5 Patterns

## Svelte 5 Patterns (REQUIRED)

Use Svelte 5 runes for all reactive patterns:

```svelte
<script lang="ts">
  // Props with destructuring and types
  interface Props {
    title: string;
    items: string[];
  }
  let { title, items = [] }: Props = $props();

  // Reactive state
  let count = $state(0);
  let isOpen = $state(false);

  // Computed values
  $: doubled = $derived(count * 2);

  // Effects for side effects
  $effect(() => {
    // Reacts to dependencies
    console.log(count);
  });

  // One-time initialization
  onMount(() => {
    // Runs once on mount
  });
</script>
```

## Component Props Pattern

```svelte
<script lang="ts">
  interface Props {
    title: string;
    optional?: boolean; // Mark optional with ?
  }

  let { title, optional = false }: Props = $props();
</script>
```
