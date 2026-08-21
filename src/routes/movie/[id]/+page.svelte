<script lang="ts">
	import { createQuery } from '@tanstack/svelte-query';
	import { tmdb, embedSources } from '$lib/api/tmdb';
	import StarIcon from 'phosphor-svelte/lib/StarIcon';
	import PlayCircleIcon from 'phosphor-svelte/lib/PlayCircleIcon';
	import ClockIcon from 'phosphor-svelte/lib/ClockIcon';
	import CalendarIcon from 'phosphor-svelte/lib/CalendarIcon';
	import TrendUpIcon from 'phosphor-svelte/lib/TrendUpIcon';
	import DownloadIcon from 'phosphor-svelte/lib/DownloadIcon';
	import CurrencyDollarIcon from 'phosphor-svelte/lib/CurrencyDollarIcon';
	import ClockAfternoonIcon from 'phosphor-svelte/lib/ClockAfternoonIcon';
	import Carousel from '$lib/components/Carousel.svelte';
	import TrailerModal from '$lib/components/TrailerModal.svelte';
	import WatchlistButton from '$lib/components/WatchlistButton.svelte';
	import GallerySection from '$lib/components/GallerySection.svelte';
	import CastSection from '$lib/components/CastSection.svelte';
	import ThemeGenerator from '$lib/components/ThemeGenerator.svelte';
	import { appSettings } from '$lib/services/app-settings.svelte';

	let { params } = $props();
	let id = $derived(params.id);

	let movie = createQuery(() => ({
		queryKey: ['movie', id],
		queryFn: () => tmdb.movie.detail(Number(id)),
		staleTime: 1000 * 60 * 5
	}));

	let collection = createQuery(() => ({
		queryKey: ['collection', movie.data?.belongs_to_collection?.id],
		queryFn: () => tmdb.movie.collection(movie.data!.belongs_to_collection!.id),
		enabled: !!movie.data?.belongs_to_collection,
		staleTime: Infinity
	}));

	// Collection parts as Carousel-compatible items (add media_type)
	let collectionItems = $derived(
		(collection.data?.parts ?? [])
			.map((p) => ({ ...p, media_type: 'movie' as const, genre_ids: p.genre_ids ?? [] }))
			.sort((a, b) => (a.release_date ?? '').localeCompare(b.release_date ?? ''))
	);

	let showTrailer = $state(false);

	let images = $derived(movie.data?.images?.backdrops ?? []);

	let video = $derived(
		movie.data?.videos.results.findLast((v) => v.site === 'YouTube' && v.type === 'Trailer') ??
			movie.data?.videos.results[0]
	);

	function formatCurrency(n: number) {
		if (!n) return null;
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
			notation: 'compact',
			maximumFractionDigits: 1
		}).format(n);
	}

	let director = $derived(movie.data?.credits?.crew?.find((c) => c.job === 'Director'));
	let unreleased = $derived((movie.data?.vote_average ?? 0) === 0);
</script>

{#if movie.data}
	<!-- HERO -->
	<section
		class="relative flex min-h-[80vh] flex-col items-start justify-end overflow-hidden pt-32 pb-8"
	>
		<div class="absolute inset-0">
			<img
				src={tmdb.image.backdrop(movie.data.backdrop_path ?? '', 'original')}
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
					src={tmdb.image.poster(movie.data.poster_path ?? '', 'w342')}
					alt={movie.data.title}
					class="h-88 w-auto rounded-xl object-cover shadow-2xl shadow-black/50"
				/>
				{#if appSettings.enableThemeGenerator && movie.data.poster_path}
					<ThemeGenerator
						posterPath={movie.data.poster_path}
						title={movie.data.title}
						genreIds={movie.data.genres.map((g) => g.id)}
					/>
				{/if}
			</div>
			<div class="flex max-w-3xl flex-col gap-5">
				<h1 class="font-display text-4xl font-extrabold text-white sm:text-5xl">
					{movie.data.title}
				</h1>

				<div class="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-neutral-400">
					<span class="flex items-center gap-1.5">
						<StarIcon class="h-4 w-4 text-gold-400" weight="fill" />
						<span class="font-semibold text-gold-400"
							>{movie.data.vote_average > 0 ? movie.data.vote_average.toFixed(1) : 'TBD'}</span
						>
						{#if movie.data.vote_average > 0}<span class="text-neutral-500">/ 10</span>{/if}
					</span>
					<span class="flex items-center gap-1.5">
						<CalendarIcon class="h-4 w-4" />
						{movie.data.release_date?.slice(0, 4)}
					</span>
					{#if movie.data.runtime}
						<span class="flex items-center gap-1.5">
							<ClockIcon class="h-4 w-4" />
							{movie.data.runtime} min
						</span>
					{/if}
					{#if director}
						<span class="text-neutral-500"
							>Dir. <span class="text-neutral-300">{director.name}</span></span
						>
					{/if}
				</div>

				{#if movie.data.tagline}
					<p class="text-base text-gold-400/70 italic">{movie.data.tagline}</p>
				{/if}

				<p class="max-w-2xl text-base leading-relaxed text-neutral-300">{movie.data.overview}</p>

				<div class="flex flex-wrap gap-2">
					{#each movie.data.genres as genre (genre.id)}
						<span
							class="rounded-full border border-white/10 bg-white/5 px-3.5 py-1 text-xs font-medium text-neutral-300 backdrop-blur-sm"
						>
							{genre.name}
						</span>
					{/each}
				</div>

				<!-- Budget / Revenue -->
				{#if movie.data.budget || movie.data.revenue}
					<div class="flex flex-wrap gap-4 text-sm">
						{#if movie.data.budget}
							<span class="flex items-center gap-1.5 text-neutral-400">
								<CurrencyDollarIcon class="h-4 w-4" />
								Budget: <span class="text-neutral-200">{formatCurrency(movie.data.budget)}</span>
							</span>
						{/if}
						{#if movie.data.revenue}
							<span class="flex items-center gap-1.5 text-neutral-400">
								<TrendUpIcon class="h-4 w-4" />
								Box Office:
								<span class="text-neutral-200">{formatCurrency(movie.data.revenue)}</span>
							</span>
						{/if}
					</div>
				{/if}

				<div class="flex flex-wrap gap-3 pt-2">
					{#if unreleased}
						<div
							class="flex items-center gap-2.5 rounded-full border border-white/10 bg-white/5 px-7 py-3 text-sm font-semibold text-neutral-400 backdrop-blur-sm"
						>
							<ClockAfternoonIcon class="h-5 w-5" />
							Coming Soon
						</div>
					{:else}
						<a
							href={`/watch/movie/${movie.data.id}`}
							class="flex items-center gap-2.5 rounded-full bg-gold-500 px-7 py-3 text-sm font-bold text-black transition-all duration-300 hover:bg-gold-400 hover:shadow-[0_0_30px_rgba(245,158,11,0.35)] active:scale-95"
						>
							<PlayCircleIcon class="h-5 w-5" weight="fill" />
							Watch Now
						</a>
					{/if}
					<WatchlistButton
						id={movie.data.id}
						mediaType="movie"
						title={movie.data.title}
						posterPath={movie.data.poster_path}
						genres={movie.data.genres}
						tmdbRating={movie.data.vote_average}
						releaseYear={movie.data.release_date
							? Number(movie.data.release_date.slice(0, 4))
							: null}
						runtime={movie.data.runtime}
					/>
					{#if !unreleased && video}
						<button
							onclick={() => (showTrailer = true)}
							class="flex items-center gap-2.5 rounded-full border border-white/10 bg-white/5 px-7 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:border-white/20 hover:bg-white/10 active:scale-95"
						>
							<PlayCircleIcon class="h-5 w-5" />
							Trailer
						</button>
					{/if}
					{#if !unreleased}
						<a
							href={embedSources[0].movie(movie.data.id)}
							target="_blank"
							rel="noopener noreferrer"
							class="flex items-center gap-2.5 rounded-full border border-white/10 bg-white/5 px-7 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:border-white/20 hover:bg-white/10 active:scale-95"
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
	<CastSection cast={movie.data.credits?.cast ?? []} />

	<!-- COLLECTION -->
	{#if collection.data && collectionItems.length > 1}
		<section class="mx-auto max-w-7xl px-4 pb-12 md:px-8">
			<Carousel items={collectionItems} title={collection.data.name} />
		</section>
	{/if}

	<!-- RECOMMENDATIONS -->
	<section class="mx-auto max-w-7xl px-4 pb-16 md:px-8">
		<Carousel items={movie.data.recommendations?.results ?? []} title="You Might Also Like" />
	</section>

	<!-- TRAILER MODAL -->
	{#if showTrailer && video}
		<TrailerModal
			videoKey={video.key}
			videoName={video.name}
			onclose={() => (showTrailer = false)}
		/>
	{/if}
{:else if movie.isPending}
	<div class="flex min-h-screen items-center justify-center">
		<div
			class="h-10 w-10 animate-spin rounded-full border-2 border-gold-500/30 border-t-gold-500"
		></div>
	</div>
{/if}
