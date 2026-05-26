<script lang="ts">
	import { tmdb } from '$lib/api/tmdb';
	import type { TmdbMovie, TmdbTvShow } from '$lib/types/tmdb.d';
	import { FilmSlate, Star, PlayCircle } from 'phosphor-svelte';
	import { cn } from '$lib/cn';

	type TileItem = TmdbMovie | TmdbTvShow;

	let { media }: { media: TileItem } = $props();

	const title = $derived('title' in media ? media.title : media.name);
	const year = $derived(
		'release_date' in media ? media.release_date?.slice(0, 4) : media.first_air_date?.slice(0, 4)
	);

	let hovered = $state(false);
	let imgLoaded = $state(false);
</script>

<a
	href={`/${media.media_type}/${media.id}`}
	class={cn(
		'group relative overflow-hidden rounded-xl bg-surface-800 transition-all duration-500',
		hovered && 'scale-[1.02] shadow-2xl shadow-black/50'
	)}
	style="view-transition-name: tile-{media.id}"
	onmouseenter={() => {
		hovered = true;
	}}
	onmouseleave={() => {
		hovered = false;
	}}
>
	<div class="aspect-2/3 w-full overflow-hidden">
		{#if media.poster_path}
			<img
				src={tmdb.image.poster(media.poster_path, 'w342')}
				alt={title}
				loading="lazy"
				class={cn(
					'h-full w-full object-cover transition-all duration-700',
					hovered && 'scale-110',
					imgLoaded ? 'opacity-100' : 'opacity-0'
				)}
				onload={() => {
					imgLoaded = true;
				}}
			/>
			<div class={cn('animate-shimmer absolute inset-0', imgLoaded && 'hidden')}></div>
		{:else}
			<div class="flex h-full w-full items-center justify-center bg-surface-800">
				<FilmSlate class="h-12 w-12 text-surface-600" />
			</div>
		{/if}
	</div>

	<div
		class={cn(
			'absolute inset-0 transition-opacity duration-500',
			hovered ? 'opacity-100' : 'opacity-0'
		)}
	>
		<div class="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent"></div>
		<div class="absolute inset-0 rounded-xl ring-1 ring-white/10 ring-inset"></div>
	</div>

	<div
		class="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/90 via-black/50 to-transparent p-3 pt-8"
	>
		<p class="truncate text-sm font-semibold text-white">{title}</p>
		<div class="mt-1 flex items-center gap-2 text-xs text-neutral-400">
			<Star class="h-3.5 w-3.5 text-gold-400" weight="fill" />
			<span class="font-medium text-neutral-200">{media.vote_average.toFixed(1)}</span>
			<span class="text-surface-600">&middot;</span>
			<span>{year ?? ''}</span>
			<PlayCircle
				class={cn(
					'ml-auto h-4 w-4 text-white transition-all duration-300',
					hovered ? 'translate-x-0 opacity-100' : 'translate-x-1 opacity-0'
				)}
				weight="fill"
			/>
		</div>
	</div>

	{#if hovered}
		<div
			class="pointer-events-none absolute -inset-px rounded-xl bg-linear-to-b from-gold-500/20 to-transparent opacity-100 transition-opacity duration-500"
		></div>
	{/if}
</a>
