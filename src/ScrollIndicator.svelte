<script lang="ts">
  import { onMount } from 'svelte';

  let progress = $state<number>(0);

  onMount(() => {
    const updateProgress = () => {
      const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (height <= 0) {
        progress = 0;
      } else {
        const p = (winScroll / height) * 100;
        progress = isNaN(p) ? 0 : Math.min(100, Math.max(0, p));
      }
    };

    window.addEventListener('scroll', updateProgress);
    return () => window.removeEventListener('scroll', updateProgress);
  });
</script>

 <div class="fixed top-0 left-0 w-full h-1 z-[60] pointer-events-none bg-transparent">
   <div
     class="h-full bg-primary shadow-[0_0_10px_rgba(0,176,255,0.5)] transition-all duration-75 ease-out"
     style="width: {progress}%"
   ></div>
 </div>
