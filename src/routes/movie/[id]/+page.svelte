<script lang="ts">
	import { createQuery } from '@tanstack/svelte-query';
	import { tmdb, embedSources } from '$lib/api/tmdb';
	import { StarIcon, PlayCircleIcon, ClockIcon, CalendarIcon, TrendUpIcon, DownloadIcon } from 'phosphor-svelte';
	import Carousel from '$lib/components/Carousel.svelte';
	import TrailerModal from '$lib/components/TrailerModal.svelte';

	let { params } = $props();
	let id = $derived(params.id);

	let movie = createQuery(() => ({
		queryKey: ['movie', id],
		queryFn: () => tmdb.movie.detail(Number(id))
	}));

	let showTrailer = $state(false);

	let video = $derived(
		movie.data?.videos.results.findLast((v) => v.site === 'YouTube' && v.type === 'Trailer') ??
			movie.data?.videos.results[0]
	);
</script>

{#if movie.data}
	<section
		class="relative flex min-h-[60vh] flex-col items-start justify-end overflow-hidden pt-32 pb-8"
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
			<div class="hidden shrink-0 md:block">
				<img
					src={tmdb.image.poster(movie.data.poster_path ?? '', 'w342')}
					alt={movie.data.title}
					class="h-[22rem] w-auto rounded-xl object-cover shadow-2xl shadow-black/50"
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
					<span class="flex items-center gap-1.5">
						<TrendUpIcon class="h-4 w-4" />
						{movie.data.popularity.toFixed(0)}
					</span>
				</div>

				{#if movie.data.tagline}
					<p class="text-base text-gold-400/70 italic">{movie.data.tagline}</p>
				{/if}

				<p class="max-w-2xl text-base leading-relaxed text-neutral-300">{movie.data.overview}</p>

				<div class="flex flex-wrap gap-2">
					{#each movie.data.genres as genre (genre.id)}
						<span
							class="rounded-full border border-white/10 bg-white/5 px-3.5 py-1 text-xs font-medium text-neutral-300 backdrop-blur-sm"
							>{genre.name}</span
						>
					{/each}
				</div>

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
							onclick={() => {
								showTrailer = true;
							}}
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

	<section class="mx-auto max-w-7xl px-4 pb-12 md:px-8">
		<h2 class="mb-5 font-display text-2xl font-bold text-white">Cast</h2>
		<div
			class="flex snap-x gap-4 overflow-x-auto scroll-smooth pb-2"
			style="scrollbar-width: none;"
		>
			{#each movie.data.credits?.cast?.slice(0, 15) ?? [] as cast (cast.id)}
				<div class="flex w-[120px] shrink-0 snap-start flex-col items-center gap-2.5 text-center">
					<div class="overflow-hidden rounded-full ring-2 ring-white/10">
						{#if cast.profile_path}
							<img
								src={tmdb.image.profile(cast.profile_path, 'w185')}
								alt={cast.name}
								class="h-[120px] w-[120px] object-cover transition-transform duration-500 hover:scale-110"
								loading="lazy"
							/>
						{:else}
							<div class="flex h-[120px] w-[120px] items-center justify-center bg-surface-800">
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

	<section class="mx-auto max-w-7xl px-4 pb-16 md:px-8">
		<Carousel items={movie.data.recommendations?.results ?? []} title="You Might Also Like" />
	</section>

	{#if showTrailer && video}
		<TrailerModal
			videoKey={video.key}
			videoName={video.name}
			onclose={() => {
				showTrailer = false;
			}}
		/>
	{/if}
{/if}
