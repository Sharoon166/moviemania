<script lang="ts">
	import { onMount } from 'svelte';
	import { tmdb } from '$lib/api/tmdb';
	import type { TmdbMovie, TmdbTvShow, TmdbVideo } from '$lib/types/tmdb.d';
	import {
		PlayCircle,
		ArrowUp,
		ArrowDown,
		SpeakerSlashIcon,
		SpeakerHighIcon
	} from 'phosphor-svelte';
	import { SvelteSet } from 'svelte/reactivity';

	const EXPAND_BASE_ITEMS = 10;

	type ShortsClip = {
		id: string;
		key: string;
		name: string;
		title: string;
		mediaType: 'movie' | 'tv';
		mediaId: number;
		posterPath?: string | null;
		releaseDate?: string;
		voteAverage?: number;
	};

	type MediaItem = TmdbMovie | TmdbTvShow;

	let clips = $state<ShortsClip[]>([]);
	let loading = $state(false);
	let error = $state('');

	let activeIndex = $state(0);
	let container: HTMLDivElement;

	let currentPage = $state(1);
	let loadingMore = $state(false);
	let hasMore = $state(true);
	let muted = $state(true);
	let isPageVisible = $state(true);

	const seen = new SvelteSet<string>();

	function navigateToIndex(index: number) {
		if (index < 0 || index >= clips.length) return;

		const sections = [...container.querySelectorAll('[data-reel]')];
		const target = sections[index] as HTMLElement;

		if (target) {
			target.scrollIntoView({ behavior: 'smooth', block: 'start' });
		}
	}

	function handleKeyboard(e: KeyboardEvent) {
		if (e.key === 'ArrowDown') {
			e.preventDefault();
			navigateToIndex(activeIndex + 1);
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			navigateToIndex(activeIndex - 1);
		} else if (e.key === 'm' || e.key === 'M') {
			e.preventDefault();
			muted = !muted;
		}
	}

	let observer: IntersectionObserver;

	function setupIntersectionObserver() {
		observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						const index = parseInt(entry.target.getAttribute('data-index') || '0');
						activeIndex = index;

						// Load more when near end
						if (index >= clips.length - 3 && !loadingMore && hasMore) {
							loadFeed(false);
						}
					}
				});
			},
			{
				threshold: 0.5,
				root: container
			}
		);
	}

	function observeSections() {
		if (!observer) return;

		const sections = container.querySelectorAll('[data-reel]');
		sections.forEach((section) => observer.observe(section));
	}

	function toClip(item: MediaItem, video: TmdbVideo): ShortsClip {
		const mediaType = item.media_type;
		const isMovie = mediaType === 'movie';

		return {
			id: `${mediaType}-${item.id}-${video.id}`,
			key: video.key,
			name: video.name,
			title: video.name || (isMovie ? (item as TmdbMovie).title : (item as TmdbTvShow).name),
			mediaType,
			mediaId: item.id,
			posterPath: item.poster_path,
			releaseDate: isMovie ? (item as TmdbMovie).release_date : (item as TmdbTvShow).first_air_date,
			voteAverage: item.vote_average
		};
	}

	async function loadFeed(replace = false) {
		if (loadingMore || !hasMore) return;

		loading = true;
		loadingMore = true;
		error = '';

		try {
			const [moviesRes, tvRes] = await Promise.all([
				tmdb.trending.movies('week', currentPage),
				tmdb.trending.tv('week', currentPage)
			]);

			const results = [...(moviesRes.results ?? []), ...(tvRes.results ?? [])] as MediaItem[];

			if (!results.length) {
				hasMore = false;
				return;
			}

			currentPage++;

			let filtered = results.filter((i) => {
				const key = `${i.media_type}-${i.id}`;
				return !seen.has(key);
			});

			const pool = [...filtered];

			for (let i = pool.length - 1; i > 0; i--) {
				const j = Math.floor(Math.random() * (i + 1));
				[pool[i], pool[j]] = [pool[j], pool[i]];
			}

			const selected = pool.slice(0, EXPAND_BASE_ITEMS);
			selected.forEach((i) => seen.add(`${i.media_type}-${i.id}`));

			const expanded = await Promise.all(
				selected.map(async (item) => {
					const detail =
						item.media_type === 'movie'
							? await tmdb.movie.detail(item.id)
							: await tmdb.tv.detail(item.id);

					return {
						item,
						videos: detail?.videos?.results ?? []
					};
				})
			);

			const nextClips: ShortsClip[] = [];

			for (const entry of expanded) {
				const ytVideos = entry.videos.filter(
					(v: TmdbVideo) => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser')
				);

				const video = ytVideos[0];
				if (!video) continue;

				nextClips.push(toClip(entry.item, video));
			}

			clips = replace ? nextClips : [...clips, ...nextClips];

			// Re-observe sections after clips update
			setTimeout(() => observeSections(), 100);
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to load shorts';
		} finally {
			loading = false;
			loadingMore = false;
		}
	}

	onMount(() => {
		setupIntersectionObserver();
		loadFeed(true);
		window.addEventListener('keydown', handleKeyboard);

		return () => {
			observer?.disconnect();
			window.removeEventListener('keydown', handleKeyboard);
		};
	});
</script>

<svelte:head>
	<title>Shorts - Moviemania</title>
</svelte:head>

<div
	bind:this={container}
	class="h-screen snap-y snap-mandatory scrollbar-none overflow-x-hidden overflow-y-auto bg-black"
	style="-webkit-overflow-scrolling: touch"
>
	{#if loading && clips.length === 0}
		<div class="flex h-screen items-center justify-center">
			<div
				class="h-12 w-12 animate-spin rounded-full border-2 border-white/20 border-t-white"
			></div>
		</div>
	{:else if error}
		<div class="flex h-screen items-center justify-center px-6 text-center">
			<p class="text-red-400">{error}</p>
		</div>
	{:else}
		{#each clips as clip, index (clip.id)}
			<section
				data-reel
				data-index={index}
				class="relative mx-auto h-screen snap-start overflow-hidden bg-black md:aspect-9/16"
			>
				<!-- Video iframe - render for active and next 2 videos -->
				{#if Math.abs(index - activeIndex) <= 2}
					<div class="absolute inset-0 z-0">
						<iframe
							class="h-full w-full"
							title={clip.title}
							src={`https://www.youtube.com/embed/${clip.key}?autoplay=${index === activeIndex && isPageVisible ? 1 : 0}&mute=${muted ? 1 : 0}&controls=1&playsinline=1&loop=1&playlist=${clip.key}&rel=0&modestbranding=1&enablejsapi=1`}
							allow="autoplay; encrypted-media"
							allowfullscreen={false}
						></iframe>
					</div>
				{:else}
					<!-- Placeholder for non-loaded videos -->
					<div class="absolute inset-0 z-0 bg-neutral-900"></div>
				{/if}
				<!-- Overlay gradient -->
				<div
					class="pointer-events-none absolute inset-0 z-10 bg-linear-to-t from-black/60 via-transparent to-black/40"
				></div>

				<!-- Right actions -->
				<div class="absolute right-4 bottom-32 z-20 flex flex-col items-center gap-6">
					<a
						href={clip.mediaType === 'movie' ? `/movie/${clip.mediaId}` : `/tv/${clip.mediaId}`}
						class="flex flex-col items-center gap-1.5 transition-transform hover:scale-110 active:scale-95"
					>
						<div
							class="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm"
						>
							<PlayCircle size={28} weight="fill" class="text-black" />
						</div>
						<span class="text-xs font-medium text-white drop-shadow">Watch</span>
					</a>

					<button
						onclick={() => {
							muted = !muted;
						}}
						class="flex flex-col items-center gap-1.5 transition-transform hover:scale-110 active:scale-95"
					>
						<div
							class="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm"
						>
							{#if muted}
								<SpeakerSlashIcon />
							{:else}
								<SpeakerHighIcon />
							{/if}
						</div>
						<span class="text-xs font-medium text-white drop-shadow">
							{muted ? 'Unmute' : 'Mute'}
						</span>
					</button>
				</div>

				<!-- Navigation hints -->
				{#if index === 0}
					<div class="absolute top-24 left-1/2 z-20 -translate-x-1/2 animate-bounce">
						<div class="rounded-full bg-black/40 p-2 backdrop-blur-sm">
							<ArrowDown size={24} class="text-white" weight="bold" />
						</div>
					</div>
				{/if}

				{#if !hasMore && index === clips.length - 1}
					<div
						class="absolute bottom-6 left-1/2 z-20 -translate-x-1/2 rounded-full bg-white/10 px-4 py-2 text-xs text-white backdrop-blur-md"
					>
						End of feed
					</div>
				{/if}
			</section>
		{/each}

		{#if loadingMore}
			<div
				class="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-black/60 px-4 py-2 backdrop-blur-md"
			>
				<div class="flex items-center gap-2">
					<div
						class="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white"
					></div>
					<span class="text-xs text-white">Loading more</span>
				</div>
			</div>
		{/if}

		<!-- Keyboard shortcuts hint -->
		<div
			class="fixed top-20 left-4 z-30 rounded-lg bg-black/40 px-3 py-2 text-xs text-white/60 backdrop-blur-sm"
		>
			<div>↑↓ Navigate</div>
			<div>M Mute</div>
		</div>

		<!-- Attribution -->
		<div class="fixed bottom-4 left-4 z-30">
			<div class="rounded-xl bg-black/40 px-3 py-2 text-[11px] text-neutral-300 backdrop-blur-md">
				Content via YouTube/TMDB
			</div>
		</div>
	{/if}
</div>

<style>
	:global(body) {
		overflow: hidden;
		background: black;
	}

	div::-webkit-scrollbar {
		display: none;
	}
</style>
