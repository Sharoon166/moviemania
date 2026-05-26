<script lang="ts">
	import { getContinueWatching, removeContinueWatching } from '$lib/stores/continue-watching';
	import { tmdb } from '$lib/api/tmdb';
	import { X, Play, Clock } from 'phosphor-svelte';

	let items = $state(getContinueWatching());

	$effect(() => {
		const interval = setInterval(() => {
			items = getContinueWatching();
		}, 1000);
		return () => clearInterval(interval);
	});
</script>

{#if items.length > 0}
	<div class="space-y-4 px-4 md:px-8">
		<h2 class="font-display text-2xl font-bold text-white">Continue Watching</h2>
		<div class="flex gap-3 overflow-x-auto pb-4" style="scrollbar-width: none;">
			{#each items as item (item.id)}
				<a
					href={item.mediaType === 'movie' ? `/watch/movie/${item.id}` : `/watch/tv/${item.id}`}
					class="group relative w-[180px] shrink-0 overflow-hidden rounded-xl bg-surface-800 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-black/50"
				>
					<div class="aspect-[2/3] w-full overflow-hidden">
						<img
							src={tmdb.image.poster(item.posterPath ?? '', 'w342')}
							alt={item.title}
							class="h-full w-full object-cover transition-all duration-700 group-hover:scale-110"
							loading="lazy"
						/>
					</div>

					<div
						class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3 pt-8"
					>
						<p class="truncate text-sm font-semibold text-white">{item.title}</p>
						<div class="mt-1 flex items-center gap-2 text-xs text-neutral-400">
							<Clock class="h-3 w-3" />
							<span>{Math.round(item.progress)}%</span>
							{#if item.season}
								<span class="text-surface-600">&middot;</span>
								<span>S{item.season}:E{item.episode}</span>
							{/if}
						</div>
					</div>

					<div
						class="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
					>
						<Play class="h-10 w-10 text-white" weight="fill" />
					</div>

					<div class="absolute inset-x-0 bottom-0 h-1 bg-surface-700">
						<div
							class="h-full bg-gold-500 transition-all duration-300"
							style="width: {item.progress}%"
						></div>
					</div>

					<button
						onclick={(e) => {
							e.preventDefault();
							e.stopPropagation();
							removeContinueWatching(item.id, item.mediaType);
							items = getContinueWatching();
						}}
						class="absolute top-2 right-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:opacity-100 hover:bg-white/20"
					>
						<X class="h-3 w-3" weight="bold" />
					</button>
				</a>
			{/each}
		</div>
	</div>
{/if}
