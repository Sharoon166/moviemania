<script lang="ts">
	import { createQuery } from '@tanstack/svelte-query';
	import { tmdb, embedSources } from '$lib/api/tmdb';
	import type { TmdbImage } from '$lib/types/tmdb.d';
	import {
		StarIcon,
		PlayCircleIcon,
		ClockIcon,
		CalendarIcon,
		TrendUpIcon,
		DownloadIcon,
		CaretLeftIcon,
		CaretRightIcon,
		XIcon,
		FilmStripIcon,
		CurrencyDollarIcon
	} from 'phosphor-svelte';
	import Carousel from '$lib/components/Carousel.svelte';
	import TrailerModal from '$lib/components/TrailerModal.svelte';

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

	// Lightbox state
	let lightboxOpen = $state(false);
	let lightboxIndex = $state(0);
	let lightboxEl = $state<HTMLDivElement | null>(null);

	let images = $derived(movie.data?.images?.backdrops ?? []);

	function openLightbox(index: number) {
		lightboxIndex = index;
		lightboxOpen = true;
	}

	function closeLightbox() {
		lightboxOpen = false;
	}

	function lightboxNext() {
		lightboxIndex = (lightboxIndex + 1) % images.length;
	}

	function lightboxPrev() {
		lightboxIndex = (lightboxIndex - 1 + images.length) % images.length;
	}

	function handleLightboxKey(e: KeyboardEvent) {
		if (e.key === 'Escape') closeLightbox();
		if (e.key === 'ArrowRight') lightboxNext();
		if (e.key === 'ArrowLeft') lightboxPrev();
	}

	$effect(() => {
		if (lightboxOpen && lightboxEl) {
			lightboxEl.focus();
		}
	});

	let video = $derived(
		movie.data?.videos.results.findLast((v) => v.site === 'YouTube' && v.type === 'Trailer') ??
			movie.data?.videos.results[0]
	);

	function formatCurrency(n: number) {
		if (!n) return null;
		return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 1 }).format(n);
	}

	let director = $derived(
		movie.data?.credits?.crew?.find((c) => c.job === 'Director')
	);
</script>

{#if movie.data}
	<!-- HERO -->
	<section class="relative flex min-h-[60vh] flex-col items-start justify-end overflow-hidden pt-32 pb-8">
		<div class="absolute inset-0">
			<img
				src={tmdb.image.backdrop(movie.data.backdrop_path ?? '', 'original')}
				alt=""
				class="h-full w-full object-cover"
				style="filter: brightness(0.5) saturate(0.8)"
			/>
		</div>
		<div class="absolute inset-0 bg-linear-to-t from-surface-950 via-surface-950/70 to-surface-950/30"></div>
		<div class="absolute inset-0 bg-linear-to-r from-surface-950/90 via-transparent to-transparent"></div>

		<div class="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 md:flex-row md:px-8">
			<div class="hidden shrink-0 md:block">
				<img
					src={tmdb.image.poster(movie.data.poster_path ?? '', 'w342')}
					alt={movie.data.title}
					class="h-88 w-auto rounded-xl object-cover shadow-2xl shadow-black/50"
				/>
			</div>
			<div class="flex max-w-3xl flex-col gap-5">
				<h1 class="font-display text-4xl font-extrabold text-white sm:text-5xl">
					{movie.data.title}
				</h1>

				<div class="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-neutral-400">
					<span class="flex items-center gap-1.5">
						<StarIcon class="h-4 w-4 text-gold-400" weight="fill" />
						<span class="font-semibold text-gold-400">{movie.data.vote_average.toFixed(1)}</span>
						<span class="text-neutral-500">/ 10</span>
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
						<span class="text-neutral-500">Dir. <span class="text-neutral-300">{director.name}</span></span>
					{/if}
				</div>

				{#if movie.data.tagline}
					<p class="text-base text-gold-400/70 italic">{movie.data.tagline}</p>
				{/if}

				<p class="max-w-2xl text-base leading-relaxed text-neutral-300">{movie.data.overview}</p>

				<div class="flex flex-wrap gap-2">
					{#each movie.data.genres as genre (genre.id)}
						<span class="rounded-full border border-white/10 bg-white/5 px-3.5 py-1 text-xs font-medium text-neutral-300 backdrop-blur-sm">
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
								Box Office: <span class="text-neutral-200">{formatCurrency(movie.data.revenue)}</span>
							</span>
						{/if}
					</div>
				{/if}

				<div class="flex flex-wrap gap-3 pt-2">
					<a
						href={`/watch/movie/${movie.data.id}`}
						class="flex items-center gap-2.5 rounded-full bg-gold-500 px-7 py-3 text-sm font-bold text-black transition-all duration-300 hover:bg-gold-400 hover:shadow-[0_0_30px_rgba(245,158,11,0.35)] active:scale-95"
					>
						<PlayCircleIcon class="h-5 w-5" weight="fill" />
						Watch Now
					</a>
					{#if video}
						<button
							onclick={() => (showTrailer = true)}
							class="flex items-center gap-2.5 rounded-full border border-white/10 bg-white/5 px-7 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:border-white/20 hover:bg-white/10 active:scale-95"
						>
							<PlayCircleIcon class="h-5 w-5" />
							Trailer
						</button>
					{/if}
					<a
						href={embedSources[0].movie(movie.data.id)}
						target="_blank"
						rel="noopener noreferrer"
						class="flex items-center gap-2.5 rounded-full border border-white/10 bg-white/5 px-7 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:border-white/20 hover:bg-white/10 active:scale-95"
					>
						<DownloadIcon class="h-5 w-5" />
						Download
					</a>
				</div>
			</div>
		</div>
	</section>

	<!-- GALLERY -->
	{#if images.length > 0}
		<section class="mx-auto max-w-7xl px-4 pb-12 md:px-8">
			<div class="mb-5 flex items-center gap-2">
				<FilmStripIcon class="h-5 w-5 text-gold-400" weight="fill" />
				<h2 class="font-display text-2xl font-bold text-white">Gallery</h2>
				<span class="ml-1 text-sm text-neutral-500">{images.length} stills</span>
			</div>
			<div class="flex gap-3 overflow-x-auto pb-2" style="scrollbar-width: none;">
				{#each images.slice(0, 20) as image, i (image.file_path)}
					<button
						onclick={() => openLightbox(i)}
						class="relative shrink-0 overflow-hidden rounded-xl ring-1 ring-white/10 transition-all duration-300 hover:scale-[1.02] hover:ring-gold-500/40 focus:outline-none"
					>
						<img
							src={tmdb.image.backdrop(image.file_path, 'w780')}
							alt=""
							class="h-32 w-auto object-cover"
							loading="lazy"
						/>
						<div class="absolute inset-0 bg-black/0 transition-all duration-300 hover:bg-black/20"></div>
					</button>
				{/each}
			</div>
		</section>
	{/if}

	<!-- CAST -->
	<section class="mx-auto max-w-7xl px-4 pb-12 md:px-8">
		<h2 class="mb-5 font-display text-2xl font-bold text-white">Cast</h2>
		<div class="flex snap-x gap-4 overflow-x-auto scroll-smooth pb-2" style="scrollbar-width: none;">
			{#each movie.data.credits?.cast?.slice(0, 15) ?? [] as cast (cast.id)}
				<div class="flex w-30 shrink-0 snap-start flex-col items-center gap-2.5 text-center">
					<div class="overflow-hidden rounded-full ring-2 ring-white/10">
						{#if cast.profile_path}
							<img
								src={tmdb.image.profile(cast.profile_path, 'w185')}
								alt={cast.name}
								class="h-30 w-30 object-cover transition-transform duration-500 hover:scale-110"
								loading="lazy"
							/>
						{:else}
							<div class="flex h-30 w-30 items-center justify-center bg-surface-800">
								<span class="text-2xl font-bold text-surface-500">{cast.name[0]}</span>
							</div>
						{/if}
					</div>
					<p class="w-full truncate text-sm font-medium text-white">{cast.name}</p>
					<p class="w-full truncate text-xs text-neutral-500">{cast.character}</p>
				</div>
			{/each}
		</div>
	</section>

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

	<!-- LIGHTBOX -->
	{#if lightboxOpen && images.length > 0}
		<div
			bind:this={lightboxEl}
			class="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm"
			onclick={closeLightbox}
			onkeydown={handleLightboxKey}
			role="dialog"
			aria-modal="true"
			tabindex="0"
		>
			<!-- Close -->
			<button
				onclick={closeLightbox}
				class="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/60 text-white backdrop-blur-sm transition-all hover:bg-white/20"
			>
				<XIcon class="h-5 w-5" weight="bold" />
			</button>

			<!-- Prev -->
			<button
				onclick={(e) => { e.stopPropagation(); lightboxPrev(); }}
				class="absolute left-4 z-10 flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-black/50 text-white backdrop-blur-xl transition-all hover:bg-black/80"
			>
				<CaretLeftIcon size={20} weight="bold" />
			</button>

			<!-- Image -->
			<img
				src={tmdb.image.backdrop(images[lightboxIndex].file_path, 'original')}
				alt=""
				class="max-h-[85vh] max-w-[85vw] rounded-xl object-contain shadow-2xl"
				onclick={(e) => e.stopPropagation()}
			/>

			<!-- Next -->
			<button
				onclick={(e) => { e.stopPropagation(); lightboxNext(); }}
				class="absolute right-4 z-10 flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-black/50 text-white backdrop-blur-xl transition-all hover:bg-black/80"
			>
				<CaretRightIcon size={20} weight="bold" />
			</button>

			<!-- Counter -->
			<div class="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full border border-white/10 bg-black/60 px-4 py-1.5 text-sm text-neutral-400 backdrop-blur-sm">
				{lightboxIndex + 1} / {images.length}
			</div>
		</div>
	{/if}
{:else if movie.isPending}
	<div class="flex min-h-screen items-center justify-center">
		<div class="h-10 w-10 animate-spin rounded-full border-2 border-gold-500/30 border-t-gold-500"></div>
	</div>
{/if}