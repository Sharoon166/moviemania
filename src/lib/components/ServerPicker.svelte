<script lang="ts">
	import { embedSources, type EmbedSource } from '$lib/api/tmdb';
	import { cn } from '$lib/cn';

	let {
		server,
		onselect
	}: {
		server: EmbedSource;
		onselect: (src: EmbedSource) => void;
	} = $props();
</script>

<div class="flex gap-1.5 overflow-x-auto" style="scrollbar-width: none;">
	{#each embedSources as src (src.id)}
		<button
			onclick={() => onselect(src)}
			class={cn(
				'shrink-0 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-all duration-200 active:scale-95',
				src.id === server.id
					? 'border-gold-500/40 bg-gold-500/15 text-gold-400'
					: 'border-white/10 bg-surface-800/60 text-neutral-400 hover:border-white/20 hover:text-white'
			)}
		>
			{src.name}
		</button>
	{/each}
</div>
