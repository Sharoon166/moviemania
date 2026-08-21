<script lang="ts">
	import type { TmdbMovie, TmdbTvShow } from '$lib/types/tmdb.d';
	import Tile from './Tile.svelte';

	let { items, title }: { items: (TmdbMovie | TmdbTvShow)[]; title: string } = $props();
</script>

<div class="space-y-5 px-4 md:px-8">
	<h2 class="font-display text-2xl font-bold text-fg">{title}</h2>
	<div
		class="grid grid-cols-2 gap-3 gap-y-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
	>
		{#each items as item (item.id)}
			<div class="animate-fade-up" style="animation-delay: {items.indexOf(item) * 30}ms">
				<Tile media={item} />
			</div>
		{/each}
	</div>
</div>
