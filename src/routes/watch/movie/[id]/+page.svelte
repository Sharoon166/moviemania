<script lang="ts">
	import { createQuery } from '@tanstack/svelte-query';
	import { tmdb } from '$lib/api/tmdb';
	import { browser } from '$app/environment';
	import DownloadIcon from 'phosphor-svelte/lib/DownloadIcon';
	import PlayIcon from 'phosphor-svelte/lib/PlayIcon';
	import CornersOutIcon from 'phosphor-svelte/lib/CornersOutIcon';
	import ArrowsInIcon from 'phosphor-svelte/lib/ArrowsInIcon';
	import ClockAfternoonIcon from 'phosphor-svelte/lib/ClockAfternoonIcon';
	import { cn } from '$lib/cn';
	import { continueWatching } from '$lib/services/continue-watching.svelte';
	import { getPreferredServer, setPreferredServer } from '$lib/stores/embed-server';
	import { untrack } from 'svelte';
	import WatchlistButton from '$lib/components/WatchlistButton.svelte';
	import ServerPicker from '$lib/components/ServerPicker.svelte';
	import TrailerModal from '$lib/components/TrailerModal.svelte';

	let { params } = $props();
	let id = $derived(params.id);

	let movie = createQuery(() => ({
		queryKey: ['movie', id],
		queryFn: () => tmdb.movie.detail(Number(id))
	}));

	let showTrailer = $state(false);
	let server = $state(getPreferredServer());
	let cinemaMode = $state(false);
	let playerWrapper = $state<HTMLElement | null>(null);

	let video = $derived(
		movie.data?.videos.results.findLast((v) => v.site === 'YouTube' && v.type === 'Trailer') ??
			movie.data?.videos.results[0]
	);
	let unreleased = $derived((movie.data?.vote_average ?? 0) === 0);

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
		if (!movie.data) return;
		const data = movie.data;

		untrack(() => {
			continueWatching.reload();
			const existing = continueWatching.items.find(
				(i) => i.id === data.id && i.mediaType === 'movie'
			);
			continueWatching.upsert({
				id: data.id,
				mediaType: 'movie',
				title: data.title,
				posterPath: data.poster_path,
				progress: existing?.progress ?? 1,
				runtime: data.runtime ?? 120
			});
		});

		const runtime = data.runtime ?? 120;
		const intervalMs = 10_000;
		const pctPerTick = runtime > 0 ? (intervalMs / (runtime * 60_000)) * 100 : 0.15;

		progressTimer = setInterval(() => {
			untrack(() => {
				const current = continueWatching.items.find(
					(i) => i.id === data.id && i.mediaType === 'movie'
				);
				if (!current) return;
				const next = Math.min(current.progress + pctPerTick, 90);
				continueWatching.upsert({
					id: data.id,
					mediaType: 'movie',
					title: data.title,
					posterPath: data.poster_path,
					progress: next,
					runtime
				});
			});
		}, intervalMs);

		return () => clearInterval(progressTimer);
	});
</script>

<svelte:head>
	<title>{movie.data?.title} - Moviemania</title>
</svelte:head>
{#if movie.data}
	<div class="relative flex min-h-screen flex-col">
		<div class="flex flex-col items-center pt-20 pb-8">
			<div class="w-full max-w-5xl px-4">
				{#if unreleased}
					<div
						class="flex aspect-video items-center justify-center overflow-hidden rounded-2xl bg-surface-900 ring-1 ring-white/10"
					>
						<div class="flex flex-col items-center gap-3 text-center">
							<ClockAfternoonIcon class="h-10 w-10 text-neutral-600" />
							<p class="text-sm font-medium text-neutral-400">Coming Soon</p>
							<p class="text-xs text-neutral-600">This title has not been released yet.</p>
						</div>
					</div>
				{:else}
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
								<iframe
									src={tmdb.embed.movie(movie.data.id, server)}
									title={movie.data.title}
									class="aspect-video w-full"
									allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
									allowfullscreen
								></iframe>
							</div>
						</div>

						{#if cinemaMode}
							<div
								class="mt-4"
								onclick={(e) => e.stopPropagation()}
								onkeydown={(e) => e.stopPropagation()}
							>
								<button
									onclick={() => {
										cinemaMode = false;
									}}
									class="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-medium text-neutral-300 backdrop-blur-sm transition-all duration-200 hover:border-white/20 hover:bg-white/10 hover:text-white"
								>
									<ArrowsInIcon class="h-4 w-4" />
									Exit Cinema
								</button>
							</div>
						{/if}
					</div>

					{#if !cinemaMode}
						<div class="flex flex-wrap items-center justify-between gap-3 pt-4">
							<div class="w-full flex justify-center items-center gap-2">
								<ServerPicker
									{server}
									onselect={(src) => {
										server = src;
										setPreferredServer(src.id);
									}}
								/>
							</div>
							<div class="flex items-center gap-2">
								{#if video}
									<button
										onclick={() => (showTrailer = true)}
										class="flex items-center gap-2 rounded-xl border border-white/10 bg-surface-800/80 px-4 py-2 text-xs font-medium text-neutral-300 backdrop-blur-sm transition-all duration-200 hover:border-white/20 hover:text-white"
									>
										<PlayIcon class="h-3.5 w-3.5" />
										Trailer
									</button>
								{/if}
								<button
									onclick={() => (cinemaMode = true)}
									class="flex items-center gap-2 rounded-xl border border-white/10 bg-surface-800/80 px-4 py-2 text-xs font-medium text-neutral-300 backdrop-blur-sm transition-all duration-200 hover:border-white/20 hover:text-white"
								>
									<CornersOutIcon class="h-3.5 w-3.5" />
									Cinema
								</button>
								<a
									href={tmdb.embed.movie(movie.data.id, server)}
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
				{/if}
			</div>
		</div>

		{#if !cinemaMode}
			<div class="mx-auto w-full max-w-5xl px-4 pb-16">
				<div class="flex flex-col gap-3">
					<div class="flex items-center gap-3">
						<h1 class="font-display text-2xl font-bold text-white">{movie.data.title}</h1>
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
							variant="icon"
						/>
					</div>
					<p class="max-w-3xl text-sm leading-relaxed text-neutral-400">{movie.data.overview}</p>
				</div>
			</div>
		{/if}
	</div>
{:else if movie.isPending}
	<div class="flex min-h-screen items-center justify-center bg-black">
		<div class="flex flex-col items-center gap-4">
			<div
				class="h-10 w-10 animate-spin rounded-full border-2 border-gold-500/30 border-t-gold-500"
			></div>
			<p class="text-sm text-neutral-500">Loading...</p>
		</div>
	</div>
{/if}

{#if showTrailer && video}
	<TrailerModal
		videoKey={video.key}
		videoName={video.name}
		onclose={() => (showTrailer = false)}
	/>
{/if}
