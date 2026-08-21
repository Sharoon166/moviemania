<script lang="ts">
	import BookmarkIcon from 'phosphor-svelte/lib/BookmarkIcon';
	import { cn } from '$lib/cn';
	import { watchlist } from '$lib/services/watchlist.svelte';
	import type { MediaType } from '$lib/services/watchlist.svelte';

	let {
		id,
		mediaType,
		title,
		posterPath,
		genres,
		tmdbRating,
		releaseYear,
		runtime,
		variant = 'default'
	}: {
		id: number;
		mediaType: MediaType;
		title: string;
		posterPath: string | null;
		genres: { id: number; name: string }[];
		tmdbRating: number;
		releaseYear: number | null;
		runtime: number | null;
		variant?: 'default' | 'icon';
	} = $props();

	let inList = $derived(watchlist.has(id, mediaType));

	function handleClick() {
		if (watchlist.has(id, mediaType)) {
			watchlist.remove(id, mediaType);
		} else {
			watchlist.add({ id, mediaType, title, posterPath, genres, tmdbRating, releaseYear, runtime });
		}
	}
</script>

{#if variant === 'icon'}
	<button
		onclick={handleClick}
		class={cn(
			'flex h-10 w-10 items-center justify-center rounded-full border text-fg backdrop-blur-sm transition-all duration-300 active:scale-90',
			inList
				? 'border-gold-500/40 bg-gold-500/20 text-gold-400 hover:bg-gold-500/30'
				: 'border-fg/10 bg-fg/5 hover:border-fg/20 hover:bg-fg/10'
		)}
		aria-label={inList ? 'Remove from watchlist' : 'Add to watchlist'}
	>
		<BookmarkIcon class="h-4.5 w-4.5" weight={inList ? 'fill' : 'regular'} />
	</button>
{:else}
	<button
		onclick={handleClick}
		class={cn(
			'flex items-center gap-2.5 rounded-full px-6 py-3 text-sm font-bold transition-all duration-300 active:scale-95',
			inList
				? 'bg-gold-500/20 text-gold-400 ring-1 ring-gold-500/30 hover:bg-gold-500/30'
				: 'border border-fg/10 bg-fg/5 text-fg backdrop-blur-sm hover:border-fg/20 hover:bg-fg/10'
		)}
	>
		<BookmarkIcon class="h-5 w-5" weight={inList ? 'fill' : 'regular'} />
		{inList ? 'Saved' : 'Want to Watch'}
	</button>
{/if}
