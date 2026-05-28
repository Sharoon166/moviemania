<script lang="ts">
	import { createQuery } from '@tanstack/svelte-query';
	import { tmdb, embedSources } from '$lib/api/tmdb';
	import {
		StarIcon,
		PlayCircleIcon,
		CalendarIcon,
		TelevisionIcon,
		DownloadIcon
	} from 'phosphor-svelte';
	import Carousel from '$lib/components/Carousel.svelte';
	import TrailerModal from '$lib/components/TrailerModal.svelte';

	let { params } = $props();
	let id = $derived(params.id);

	let show = createQuery(() => ({
		queryKey: ['tv', id],
		queryFn: () => tmdb.tv.detail(Number(id))
	}));

	let totalSeasons = $derived(show.data?.number_of_seasons ?? 0);
	let totalEpisodes = $derived(show.data?.number_of_episodes ?? 0);

	let showTrailer = $state(false);

	let video = $derived(
		show.data?.videos.results.findLast((v) => v.site === 'YouTube' && v.type === 'Trailer') ??
			show.data?.videos.results[0]
	);
</script>

{#if show.data}
	<section
		class="relative flex min-h-[60vh] flex-col items-start justify-end overflow-hidden pt-32 pb-8"
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
			<div class="hidden shrink-0 md:block">
				<img
					src={tmdb.image.poster(show.data.poster_path ?? '', 'w342')}
					alt={show.data.name}
					class="h-88 w-auto rounded-xl object-cover shadow-2xl shadow-black/50"
				/>
			</div>
			<div class="flex max-w-3xl flex-col gap-5">
				<h1 class="font-display text-4xl font-extrabold text-white sm:text-5xl">
					{show.data.name}
				</h1>

				<div class="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-neutral-400">
					<span class="flex items-center gap-1.5">
						<StarIcon class="h-4 w-4 text-gold-400" weight="fill" />
						<span class="font-semibold text-gold-400">{show.data.vote_average.toFixed(1)}</span>
						<span class="text-neutral-500">/ 10</span>
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

				<p class="max-w-2xl text-base leading-relaxed text-neutral-300">{show.data.overview}</p>

				<div class="flex flex-wrap gap-2">
					{#each show.data.genres as genre (genre.id)}
						<span
							class="rounded-full border border-white/10 bg-white/5 px-3.5 py-1 text-xs font-medium text-neutral-300 backdrop-blur-sm"
							>{genre.name}</span
						>
					{/each}
				</div>

				<div class="flex flex-wrap gap-3 pt-2">
					<a
						href={`/watch/tv/${show.data.id}?season=1&episode=1`}
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
						href={embedSources[0].tv(show.data.id, 1, 1)}
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
		<h2 class="mb-5 font-display text-2xl font-bold text-white">Seasons</h2>
		<div
			class="flex snap-x gap-4 overflow-x-auto scroll-smooth pb-2"
			style="scrollbar-width: none;"
		>
			{#each show.data.seasons as season (season.id)}
				<div class="flex w-40 shrink-0 snap-start flex-col gap-2.5">
					<div class="overflow-hidden rounded-xl">
						{#if season.poster_path}
							<img
								src={tmdb.image.poster(season.poster_path, 'w342')}
								alt={season.name}
								class="aspect-2/3 w-full rounded-xl object-cover transition-transform duration-500 hover:scale-110"
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
					<p class="text-sm font-semibold text-white">{season.name}</p>
					<p class="text-xs text-neutral-500">
						{season.episode_count} episode{season.episode_count !== 1 ? 's' : ''}
					</p>
				</div>
			{/each}
		</div>
	</section>

	<section class="mx-auto max-w-7xl px-4 pb-16 md:px-8">
		<Carousel items={show.data.recommendations?.results ?? []} title="You Might Also Like" />
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
