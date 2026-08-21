<script lang="ts">
	import { createQuery } from '@tanstack/svelte-query';
	import { tmdb } from '$lib/api/tmdb';
	import type { TmdbCollectionPart } from '$lib/types/tmdb.d';
	import Tile from '$lib/components/Tile.svelte';
	import StarIcon from 'phosphor-svelte/lib/StarIcon';
	import FilmSlateIcon from 'phosphor-svelte/lib/FilmSlateIcon';
	import SpinnerIcon from 'phosphor-svelte/lib/SpinnerIcon';
	import CalendarIcon from 'phosphor-svelte/lib/CalendarIcon';

	let { params } = $props();
	let id = $derived(params.id);

	let collection = createQuery(() => ({
		queryKey: ['collection', id],
		queryFn: () => tmdb.movie.collection(Number(id)),
		staleTime: Infinity
	}));

	// Sort parts by release date ascending
	let parts = $derived(
		(collection.data?.parts ?? [])
			.map((p) => ({ ...p, media_type: 'movie' as const, genre_ids: p.genre_ids ?? [] }))
			.sort((a, b) => (a.release_date ?? '').localeCompare(b.release_date ?? ''))
	);

	let avgRating = $derived(
		parts.length ? parts.reduce((s, p) => s + (p.vote_average ?? 0), 0) / parts.length : 0
	);

	let totalRuntime = $derived(parts.length); // placeholder — runtime isn't in collection parts
</script>

{#if collection.data}
	<!-- HERO -->
	<section
		class="relative flex min-h-[50vh] flex-col items-start justify-end overflow-hidden pt-32 pb-8"
	>
		<div class="absolute inset-0">
			<img
				src={tmdb.image.backdrop(collection.data.backdrop_path ?? '', 'original')}
				alt=""
				class="h-full w-full object-cover"
				style="filter: brightness(0.4) saturate(0.7)"
			/>
		</div>
		<div
			class="absolute inset-0 bg-linear-to-t from-surface-950 via-surface-950/60 to-surface-950/20"
		></div>
		<div
			class="absolute inset-0 bg-linear-to-r from-surface-950/90 via-transparent to-transparent"
		></div>

		<div
			class="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 md:flex-row md:items-end md:px-8"
		>
			<!-- Collection Poster -->
			{#if collection.data.poster_path}
				<div class="hidden shrink-0 md:block">
					<img
						src={tmdb.image.poster(collection.data.poster_path, 'w342')}
						alt={collection.data.name}
						class="h-72 w-auto rounded-xl object-cover shadow-2xl shadow-black/50"
					/>
				</div>
			{/if}

			<div class="flex flex-col gap-4">
				<div
					class="flex items-center gap-2 text-xs font-semibold tracking-[0.3em] text-gold-400 uppercase"
				>
					<span class="h-px w-8 bg-gold-500/50"></span>
					Film Collection
				</div>
				<h1 class="font-display text-4xl font-extrabold text-fg sm:text-5xl">
					{collection.data.name}
				</h1>

				<div class="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-neutral-400">
					<span class="flex items-center gap-1.5">
						<FilmSlateIcon class="h-4 w-4" />
						{parts.length} film{parts.length !== 1 ? 's' : ''}
					</span>
					{#if avgRating > 0}
						<span class="flex items-center gap-1.5">
							<StarIcon class="h-4 w-4 text-gold-400" weight="fill" />
							<span class="font-semibold text-gold-400">{avgRating.toFixed(1)}</span>
							<span class="text-neutral-500">avg rating</span>
						</span>
					{/if}
					{#if parts[0]?.release_date && parts[parts.length - 1]?.release_date}
						<span class="flex items-center gap-1.5">
							<CalendarIcon class="h-4 w-4" />
							{parts[0].release_date.slice(0, 4)} – {parts[parts.length - 1].release_date.slice(
								0,
								4
							)}
						</span>
					{/if}
				</div>

				{#if collection.data.overview}
					<p class="max-w-2xl text-base leading-relaxed text-neutral-300">
						{collection.data.overview}
					</p>
				{/if}
			</div>
		</div>
	</section>

	<!-- FILMS GRID -->
	<section class="mx-auto max-w-7xl px-4 pb-16 md:px-8">
		<h2 class="mb-6 font-display text-2xl font-bold text-fg">All Films</h2>
		<div
			class="grid grid-cols-2 gap-4 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
		>
			{#each parts as part, i (part.id)}
				<div class="flex flex-col gap-2">
					<!-- Number badge -->
					<div class="relative">
						<Tile media={part} />
						<div
							class="absolute top-2 left-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-xs font-bold text-gold-400 ring-1 ring-fg/10 backdrop-blur-sm"
						>
							{i + 1}
						</div>
					</div>
					{#if part.release_date}
						<p class="px-1 text-xs text-neutral-500">{part.release_date.slice(0, 4)}</p>
					{/if}
				</div>
			{/each}
		</div>
	</section>
{:else if collection.isPending}
	<div class="flex min-h-screen items-center justify-center">
		<SpinnerIcon class="h-8 w-8 animate-spin text-gold-500" />
	</div>
{:else if collection.isError}
	<div class="flex min-h-screen flex-col items-center justify-center gap-3 text-center">
		<p class="text-neutral-400">Failed to load collection</p>
		<button onclick={() => collection.refetch()} class="text-sm text-gold-400 hover:text-gold-300">
			Try again
		</button>
	</div>
{/if}
