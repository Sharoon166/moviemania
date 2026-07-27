<script lang="ts">
	import { createQuery } from '@tanstack/svelte-query';
	import { tmdb, embedSources } from '$lib/api/tmdb';
	import { browser } from '$app/environment';
	import {
		PlayIcon,
		FilmSlateIcon,
		DownloadIcon,
		SkipForwardIcon,
		SkipBackIcon,
		CornersOutIcon,
		ArrowsInIcon,
		ClockAfternoonIcon
	} from 'phosphor-svelte';
	import { cn } from '$lib/cn';
	import { continueWatching } from '$lib/services/continue-watching.svelte';
	import { getPreferredServer, setPreferredServer } from '$lib/stores/embed-server';
	import EpisodeSidebar from '$lib/components/EpisodeSidebar.svelte';
	import { untrack } from 'svelte';
	import WatchlistButton from '$lib/components/WatchlistButton.svelte';
	import ServerPicker from '$lib/components/ServerPicker.svelte';

	let { params } = $props();
	let id = $derived(params.id);

	let show = createQuery(() => ({
		queryKey: ['tv', id],
		queryFn: () => tmdb.tv.detail(Number(id))
	}));

	let source = $state<'embed' | 'trailer'>('embed');
	let season = $state(1);
	let episode = $state(1);
	let server = $state(getPreferredServer());
	let cinemaMode = $state(false);
	let playerWrapper = $state<HTMLElement | null>(null);

	let video = $derived(
		show.data?.videos.results.findLast((v) => v.site === 'YouTube' && v.type === 'Trailer') ??
			show.data?.videos.results[0]
	);

	let totalSeasons = $derived(show.data?.number_of_seasons ?? 0);
	let unreleased = $derived((show.data?.vote_average ?? 0) === 0);

	let seasonDetail = createQuery(() => ({
		queryKey: ['tv', Number(id), 'season', season],
		queryFn: () => tmdb.season.detail(Number(id), season)
	}));

	let nextEpisode = $derived.by(() => {
		if (!seasonDetail.data) return null;
		const currentIndex = seasonDetail.data.episodes.findIndex(
			(ep) => ep.episode_number === episode
		);
		if (currentIndex < seasonDetail.data.episodes.length - 1) {
			return seasonDetail.data.episodes[currentIndex + 1];
		}
		return null;
	});

	let hasNextEpisode = $derived(!!nextEpisode);

	let prevEpisode = $derived.by(() => {
		if (!seasonDetail.data) return null;
		const currentIndex = seasonDetail.data.episodes.findIndex(
			(ep) => ep.episode_number === episode
		);
		if (currentIndex > 0) {
			return seasonDetail.data.episodes[currentIndex - 1];
		}
		return null;
	});

	let hasPrevEpisode = $derived(!!prevEpisode);

	function goToNextEpisode() {
		if (!nextEpisode) return;
		handleEpisodeChange(season, nextEpisode.episode_number);
	}

	function goToPrevEpisode() {
		if (!prevEpisode) return;
		handleEpisodeChange(season, prevEpisode.episode_number);
	}

	function handleEpisodeChange(s: number, e: number) {
		season = s;
		episode = e;
		if (browser) {
			const url = new URL(window.location.href);
			url.searchParams.set('season', String(s));
			url.searchParams.set('episode', String(e));
			window.history.replaceState({}, '', url.toString());
		}
	}

	$effect(() => {
		if (!browser) return;
		const sp = new URL(window.location.href).searchParams;
		season = Number(sp.get('season')) || 1;
		episode = Number(sp.get('episode')) || 1;
	});

	$effect(() => {
		if (!browser) return;
		if (cinemaMode) {
			document.body.style.overflow = 'hidden';
		}
		return () => {
			document.body.style.overflow = '';
		};
	});

	let progressTimer: ReturnType<typeof setInterval> | undefined;

	$effect(() => {
		if (!show.data) return;
		const s = season;
		const e = episode;
		const data = show.data;
		const total = totalSeasons;

		const runtime = data.episode_run_time?.[0] ?? 45;

		untrack(() => {
			continueWatching.reload();
			const existing = continueWatching.items.find((i) => i.id === data.id && i.mediaType === 'tv');
			const prevSeason = existing?.season;
			const prevEpisode = existing?.episode;
			const isNewEpisode = prevSeason !== s || prevEpisode !== e;
			const baseProgress = isNewEpisode ? 1 : (existing?.progress ?? 1);

			continueWatching.upsert({
				id: data.id,
				mediaType: 'tv',
				title: data.name,
				posterPath: data.poster_path,
				season: s,
				episode: e,
				progress: baseProgress,
				runtime
			});
		});

		const intervalMs = 10_000;
		const pctPerTick = runtime > 0 ? (intervalMs / (runtime * 60_000)) * 100 : 0.35;

		progressTimer = setInterval(() => {
			untrack(() => {
				const current = continueWatching.items.find(
					(i) => i.id === data.id && i.mediaType === 'tv'
				);
				if (!current) return;
				const next = Math.min(current.progress + pctPerTick, 90);
				continueWatching.upsert({
					id: data.id,
					mediaType: 'tv',
					title: data.name,
					posterPath: data.poster_path,
					season: s,
					episode: e,
					progress: next,
					runtime
				});
			});
		}, intervalMs);

		return () => clearInterval(progressTimer);
	});
</script>

<svelte:head>
	<title>{show.data?.name ?? 'Loading...'} - Moviemania</title>
</svelte:head>

{#if show.data}
	<div class="relative flex min-h-screen flex-col bg-black">
		<div class="flex flex-col items-center pt-20 pb-8">
			<div class="mx-auto w-full max-w-5xl px-4">
				{#if unreleased}
					<div
						class="flex aspect-video items-center justify-center overflow-hidden rounded-2xl bg-surface-900 ring-1 ring-white/10"
					>
						<div class="flex flex-col items-center gap-3 text-center">
							<ClockAfternoonIcon class="h-10 w-10 text-neutral-600" />
							<p class="text-sm font-medium text-neutral-400">Coming Soon</p>
							<p class="text-xs text-neutral-600">This show has not been released yet.</p>
						</div>
					</div>
				{:else}
					<div class="flex flex-wrap items-center gap-2 pb-4">
						<button
							onclick={() => (source = 'embed')}
							class={cn(
								'flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-300',
								source === 'embed'
									? 'bg-gold-500/20 text-gold-400 ring-1 ring-gold-500/30'
									: 'text-neutral-400 hover:text-white'
							)}
						>
							<FilmSlateIcon class="h-4 w-4" />
							Watch Now
						</button>
						{#if video}
							<button
								onclick={() => (source = 'trailer')}
								class={cn(
									'flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-300',
									source === 'trailer'
										? 'bg-gold-500/20 text-gold-400 ring-1 ring-gold-500/30'
										: 'text-neutral-400 hover:text-white'
								)}
							>
								<PlayIcon class="h-4 w-4" />
								Trailer
							</button>
						{/if}
					</div>

					<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
					<!-- svelte-ignore a11y_click_events_have_key_events -->
					<div
						bind:this={playerWrapper}
						onclick={() => {
							if (cinemaMode) {
								cinemaMode = false;
							}
						}}
						class={cn(
							'overflow-hidden',
							cinemaMode
								? '!fixed !inset-0 !z-[100] flex flex-col items-center justify-center !rounded-none bg-black'
								: 'relative rounded-2xl shadow-2xl ring-1 shadow-black/50 ring-white/10'
						)}
					>
						<div class={cn(cinemaMode ? 'max-h-[85dvh] w-full max-w-[90vw]' : '')}>
							<div class="relative mx-auto aspect-video h-full overflow-hidden rounded-xl">
								{#if source === 'embed'}
									<iframe
										src={tmdb.embed.tv(show.data.id, season, episode, server)}
										title={show.data.name}
										class="aspect-video w-full"
										allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
										allowfullscreen
									></iframe>
								{:else if video}
									<iframe
										src={`https://www.youtube.com/embed/${video.key}?autoplay=1&rel=0`}
										title={video.name}
										class="aspect-video w-full"
										allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
										allowfullscreen
									></iframe>
								{/if}
							</div>
						</div>

						{#if cinemaMode}
							<div
								class="mt-4 flex items-center gap-3"
								onclick={(e) => e.stopPropagation()}
								onkeydown={(e) => e.stopPropagation()}
							>
								{#if hasPrevEpisode}
									<button
										onclick={goToPrevEpisode}
										class="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-medium text-neutral-300 backdrop-blur-sm transition-all duration-200 hover:border-white/20 hover:bg-white/10 hover:text-white"
									>
										<SkipBackIcon class="h-4 w-4" weight="fill" />
										Prev
									</button>
								{/if}

								<button
									onclick={(e) => {
										e.stopPropagation();
										cinemaMode = false;
									}}
									class="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-medium text-neutral-300 backdrop-blur-sm transition-all duration-200 hover:border-white/20 hover:bg-white/10 hover:text-white"
								>
									<ArrowsInIcon class="h-4 w-4" />
									Exit Cinema
								</button>

								{#if hasNextEpisode}
									<button
										onclick={(e) => {
											e.stopPropagation();
											goToNextEpisode();
										}}
										class="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-medium text-neutral-300 backdrop-blur-sm transition-all duration-200 hover:border-white/20 hover:bg-white/10 hover:text-white"
									>
										Next
										<SkipForwardIcon class="h-4 w-4" weight="fill" />
									</button>
								{/if}
							</div>
						{/if}
					</div>

					{#if source === 'embed' && !cinemaMode}
						{#if hasNextEpisode && nextEpisode}
							<div class="mt-3">
								<button
									onclick={goToNextEpisode}
									class="group flex w-full items-center gap-3 rounded-xl border border-white/10 bg-surface-800/60 px-4 py-3 text-left backdrop-blur-sm transition-all duration-300 hover:border-white/20 hover:bg-surface-700/80"
								>
									<div
										class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gold-500/20 text-gold-400 transition-all group-hover:bg-gold-500/30"
									>
										<SkipForwardIcon class="h-5 w-5" weight="fill" />
									</div>
									<div class="min-w-0 flex-1">
										<p class="text-xs font-medium text-neutral-500">Up Next</p>
										<p class="truncate text-sm font-semibold text-white">
											{nextEpisode.name}
										</p>
										<p class="text-xs text-neutral-400">
											Season {season} Episode {nextEpisode.episode_number}
										</p>
									</div>
									<PlayIcon
										class="h-6 w-6 shrink-0 text-gold-400 transition-all group-hover:scale-110"
										weight="fill"
									/>
								</button>
							</div>
						{/if}

						<div class="flex flex-wrap items-center justify-between gap-3 pt-4">
							<div class="flex w-full items-center justify-center gap-2">
								<ServerPicker
									{server}
									onselect={(src) => {
										server = src;
										setPreferredServer(src.id);
									}}
								/>
							</div>

							<div class="flex items-center gap-2">
								<button
									onclick={() => (cinemaMode = true)}
									class="flex items-center gap-2 rounded-xl border border-white/10 bg-surface-800/80 px-4 py-2 text-xs font-medium text-neutral-300 backdrop-blur-sm transition-all duration-200 hover:border-white/20 hover:text-white"
								>
									<CornersOutIcon class="h-3.5 w-3.5" />
									Cinema
								</button>

								<a
									href={tmdb.embed.tv(show.data.id, season, episode, server)}
									target="_blank"
									rel="noopener noreferrer"
									class="flex items-center gap-2 rounded-xl border border-white/10 bg-surface-800/80 px-4 py-2 text-xs font-medium text-neutral-300 backdrop-blur-sm transition-all duration-200 hover:border-white/20 hover:text-white"
								>
									<DownloadIcon class="h-3.5 w-3.5" />
									Download
								</a>
							</div>
						</div>
					{/if}

					{#if source === 'embed' && totalSeasons > 0 && !cinemaMode}
						<div class="mt-6">
							<EpisodeSidebar
								tvId={show.data.id}
								showName={show.data.name}
								{totalSeasons}
								{season}
								{episode}
								onchange={handleEpisodeChange}
							/>
						</div>
					{/if}
				{/if}
			</div>
		</div>

		{#if !cinemaMode}
			<div class="mx-auto w-full max-w-5xl px-4 pb-16">
				<div class="flex flex-col gap-3">
					<div class="flex items-center gap-3">
						<h1 class="font-display text-2xl font-bold text-white">{show.data.name}</h1>
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
							variant="icon"
						/>
					</div>
					<p class="max-w-3xl text-sm leading-relaxed text-neutral-400">{show.data.overview}</p>
				</div>
			</div>
		{/if}
	</div>
{:else if show.isPending}
	<div class="flex min-h-screen items-center justify-center bg-black">
		<div class="flex flex-col items-center gap-4">
			<div
				class="h-10 w-10 animate-spin rounded-full border-2 border-gold-500/30 border-t-gold-500"
			></div>
			<p class="text-sm text-neutral-500">Loading...</p>
		</div>
	</div>
{/if}
