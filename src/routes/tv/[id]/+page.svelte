<script lang="ts">
	import { createQuery } from '@tanstack/svelte-query';
	import { tmdb, embedSources } from '$lib/api/tmdb';
	import StarIcon from 'phosphor-svelte/lib/StarIcon';
	import PlayCircleIcon from 'phosphor-svelte/lib/PlayCircleIcon';
	import CalendarIcon from 'phosphor-svelte/lib/CalendarIcon';
	import TelevisionIcon from 'phosphor-svelte/lib/TelevisionIcon';
	import DownloadIcon from 'phosphor-svelte/lib/DownloadIcon';
	import ClockAfternoonIcon from 'phosphor-svelte/lib/ClockAfternoonIcon';
	import Carousel from '$lib/components/Carousel.svelte';
	import TrailerModal from '$lib/components/TrailerModal.svelte';
	import EpisodeRatingsHeatmap from '$lib/components/EpisodeRatingsHeatmap.svelte';
	import { appSettings } from '$lib/services/app-settings.svelte';
	import WatchlistButton from '$lib/components/WatchlistButton.svelte';
	import GallerySection from '$lib/components/GallerySection.svelte';
	import CastSection from '$lib/components/CastSection.svelte';
	import ThemeGenerator from '$lib/components/ThemeGenerator.svelte';

	let { params } = $props();
	let id = $derived(params.id);

	let show = createQuery(() => ({
		queryKey: ['tv', id],
		queryFn: () => tmdb.tv.detail(Number(id)),
		staleTime: 1000 * 60 * 5
	}));

	let totalSeasons = $derived(show.data?.number_of_seasons ?? 0);
	let totalEpisodes = $derived(show.data?.number_of_episodes ?? 0);

	let showTrailer = $state(false);

	let images = $derived(show.data?.images?.backdrops ?? []);

	let video = $derived(
		show.data?.videos.results.findLast((v) => v.site === 'YouTube' && v.type === 'Trailer') ??
			show.data?.videos.results[0]
	);

	let creators = $derived(
		show.data?.credits?.crew?.filter((c) => c.job === 'Executive Producer').slice(0, 2) ?? []
	);
	let unreleased = $derived(
		(show.data?.first_air_date ?? '') > new Date().toISOString().split('T')[0]
	);
</script>

{#if show.data}
	<!-- HERO -->
	<section
		class="relative flex min-h-[80vh] flex-col items-start justify-end overflow-hidden pt-32 pb-8"
	>
		<div class="absolute inset-0">
			<img
				src={tmdb.image.backdrop(show.data.backdrop_path ?? '', 'original')}
				alt=""
				class="h-full w-full object-cover"
				style="filter: brightness(0.5) saturate(0.8)"
			/>
		</div>
		<div
			class="absolute inset-0 bg-linear-to-t from-surface-950 via-surface-950/70 to-surface-950/30"
		></div>
		<div
			class="absolute inset-0 bg-linear-to-r from-surface-950/90 via-transparent to-transparent"
		></div>

		<div
			class="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 md:flex-row md:px-8"
		>
			<div class="relative hidden shrink-0 md:block">
				<img
					src={tmdb.image.poster(show.data.poster_path ?? '', 'w342')}
					alt={show.data.name}
					class="h-88 w-auto rounded-xl object-cover shadow-2xl shadow-black/50"
				/>
				{#if appSettings.enableThemeGenerator && show.data.poster_path}
					<ThemeGenerator
						posterPath={show.data.poster_path}
						title={show.data.name}
						genreIds={show.data.genres.map((g) => g.id)}
					/>
				{/if}
			</div>
			<div class="flex max-w-3xl flex-col gap-5">
				<h1 class="font-display text-3xl text-balance font-extrabold text-fg sm:text-5xl">
					{show.data.name}
				</h1>

				<div class="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-neutral-400">
					<span class="flex items-center gap-1.5">
						<StarIcon class="h-4 w-4 text-gold-400" weight="fill" />
						<span class="font-semibold text-gold-400"
							>{show.data.vote_average > 0 ? show.data.vote_average.toFixed(1) : 'TBD'}</span
						>
						{#if show.data.vote_average > 0}<span class="text-neutral-500">/ 10</span>{/if}
					</span>
					<span class="flex items-center gap-1.5">
						<CalendarIcon class="h-4 w-4" />
						{show.data.first_air_date?.slice(0, 4)}
					</span>
					<span class="flex items-center gap-1.5">
						<TelevisionIcon class="h-4 w-4" />
						{totalSeasons} season{totalSeasons !== 1 ? 's' : ''} &middot; {totalEpisodes} episode{totalEpisodes !==
						1
							? 's'
							: ''}
					</span>
				</div>

				<p class="max-w-2xl text-sm sm:text-base leading-relaxed text-neutral-300">{show.data.overview}</p>

				<div class="flex flex-wrap gap-2">
					{#each show.data.genres as genre (genre.id)}
						<span
							class="rounded-full border border-fg/10 bg-fg/5 px-3.5 py-1 text-xs font-medium text-neutral-300 backdrop-blur-sm"
						>
							{genre.name}
						</span>
					{/each}
				</div>

				<div class="flex flex-wrap gap-3 pt-2">
					{#if unreleased}
						<div
							class="flex items-center gap-2.5 rounded-full border border-fg/10 bg-fg/5 px-7 py-3 text-sm font-semibold text-neutral-400 backdrop-blur-sm"
						>
							<ClockAfternoonIcon class="h-5 w-5" />
							Coming Soon
						</div>
					{:else}
						<a
							href={`/watch/tv/${show.data.id}?season=1&episode=1`}
							class="flex items-center gap-2.5 rounded-full bg-gold-500 px-6 py-3 text-sm font-bold text-black transition-all duration-300 hover:bg-gold-400 hover:shadow-gold-300 active:scale-95"
						>
							<PlayCircleIcon class="h-5 w-5" weight="fill" />
							Watch Now
						</a>
					{/if}
					<WatchlistButton
						id={show.data.id}
						mediaType="tv"
						title={show.data.name}
						posterPath={show.data.poster_path}
						genres={show.data.genres}
						tmdbRating={show.data.vote_average}
						releaseYear={show.data.first_air_date
							? Number(show.data.first_air_date.slice(0, 4))
							: null}
						runtime={show.data.episode_run_time[0] ?? null}
					/>
					{#if !unreleased && video}
						<button
							onclick={() => (showTrailer = true)}
							class="flex items-center gap-2.5 rounded-full border border-fg/10 bg-fg/5 px-6 py-3 text-sm font-semibold text-fg backdrop-blur-sm transition-all duration-300 hover:border-fg/20 hover:bg-fg/10 active:scale-95"
						>
							<PlayCircleIcon class="h-5 w-5" />
							Trailer
						</button>
					{/if}
					{#if !unreleased}
						<a
							href={embedSources[0].tv(show.data.id, 1, 1)}
							target="_blank"
							rel="noopener noreferrer"
							class="flex items-center gap-2.5 rounded-full border border-fg/10 bg-fg/5 px-6 py-3 text-sm font-semibold text-fg backdrop-blur-sm transition-all duration-300 hover:border-fg/20 hover:bg-fg/10 active:scale-95"
						>
							<DownloadIcon class="h-5 w-5" />
							Download
						</a>
					{/if}
				</div>
			</div>
		</div>
	</section>

	<!-- GALLERY -->
	<GallerySection {images} />

	<!-- CAST -->
	<CastSection cast={show.data.credits?.cast ?? []} />

	<!-- SEASONS -->
	<section class="mx-auto max-w-7xl px-4 pb-12 md:px-8">
		<h2 class="mb-5 font-display text-2xl font-bold text-fg">Seasons</h2>
		<div
			class="flex snap-x gap-4 overflow-x-auto scroll-smooth pb-2"
			style="scrollbar-width: none;"
		>
			{#each show.data.seasons as season (season.id)}
				<a
					href={`/watch/tv/${show.data.id}?season=${season.season_number}&episode=1`}
					class="group flex w-40 shrink-0 snap-start flex-col gap-2.5"
				>
					<div class="overflow-hidden rounded-xl">
						{#if season.poster_path}
							<img
								src={tmdb.image.poster(season.poster_path, 'w342')}
								alt={season.name}
								class="aspect-2/3 w-full rounded-xl object-cover transition-transform duration-500 group-hover:scale-105"
								loading="lazy"
							/>
						{:else}
							<div
								class="flex aspect-2/3 w-full items-center justify-center rounded-xl bg-surface-800"
							>
								<TelevisionIcon class="h-10 w-10 text-surface-600" />
							</div>
						{/if}
					</div>
					<p class="text-sm font-semibold text-fg transition-colors group-hover:text-gold-400">
						{season.name}
					</p>
					<p class="text-xs text-neutral-500">
						{season.episode_count} episode{season.episode_count !== 1 ? 's' : ''}
					</p>
				</a>
			{/each}
		</div>
	</section>

	<!-- RATINGS HEATMAP -->
	{#if appSettings.showHeatmap}
		<EpisodeRatingsHeatmap showId={show.data.id} />
	{/if}

	<!-- RECOMMENDATIONS -->
	<section class="mx-auto max-w-7xl px-4 pb-16 md:px-8">
		<Carousel items={show.data.recommendations?.results ?? []} title="You Might Also Like" />
	</section>

	<!-- TRAILER MODAL -->
	{#if showTrailer && video}
		<TrailerModal
			videoKey={video.key}
			videoName={video.name}
			onclose={() => (showTrailer = false)}
		/>
	{/if}
{:else if show.isPending}
	<div class="flex min-h-screen items-center justify-center">
		<div
			class="h-10 w-10 animate-spin rounded-full border-2 border-gold-500/30 border-t-gold-500"
		></div>
	</div>
{/if}
