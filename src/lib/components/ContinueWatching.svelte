<script lang="ts">
	import { continueWatching } from '$lib/services/continue-watching.svelte';
	import { tmdb } from '$lib/api/tmdb';
	import { XIcon, PlayIcon } from 'phosphor-svelte';
	import { browser } from '$app/environment';

	let items = $derived(continueWatching.items);

	$effect(() => {
		if (!browser) return;
		continueWatching.reload();
	});

</script>

{#if items.length > 0}
	<div class="space-y-4 px-4 md:px-8">
		<h2 class="font-display text-2xl font-bold text-white">Continue Watching</h2>
		<div class="flex gap-3 overflow-x-auto pb-4" style="scrollbar-width: none;">
			{#each items as item (item.id)}
				<a
					href={item.mediaType === 'movie' ? `/watch/movie/${item.id}` : `/watch/tv/${item.id}?season=${item.season ?? 1}&episode=${item.episode ?? 1}`}
					class="group relative w-45 shrink-0 overflow-hidden rounded-xl bg-surface-800 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-black/50"
				>
					<div class="aspect-2/3 w-full overflow-hidden">
						<img
							src={tmdb.image.poster(item.posterPath ?? '', 'w342')}
							alt={item.title}
							class="h-full w-full object-cover transition-all duration-700 group-hover:scale-110"
							loading="lazy"
						/>
					</div>

					<div
						class="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/90 via-black/50 to-transparent p-3 pt-8"
					>
						<p class="truncate text-sm font-semibold text-white">{item.title}</p>
						{#if item.season}
							<p class="mt-1 text-xs text-neutral-500">S{item.season}:E{item.episode}</p>
						{/if}
					</div>

					<div
						class="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
					>
						<PlayIcon class="h-10 w-10 text-white" weight="fill" />
					</div>

					<button
						onclick={(e) => {
							e.preventDefault();
							e.stopPropagation();
							continueWatching.remove(item.id, item.mediaType);
						}}
						class="absolute top-2 right-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:opacity-100 hover:bg-white/20"
					>
						<XIcon class="h-3 w-3" weight="bold" />
					</button>
				</a>
			{/each}
		</div>
	</div>
{/if}
