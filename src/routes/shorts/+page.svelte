<script lang="ts">
	import { onDestroy, onMount, tick } from 'svelte';
	import { browser } from '$app/environment';
	import { tmdb } from '$lib/api/tmdb';
	import type { TmdbMovie, TmdbTvShow, TmdbVideo } from '$lib/types/tmdb.d';
	import { PlayCircleIcon, SpeakerSlashIcon, SpeakerHighIcon } from 'phosphor-svelte';
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
	let muted = $state(false);
	let isPageVisible = $state(true);
	let topOffset = $state(0);

	const seen = new SvelteSet<string>();

	// Iframe refs and command helpers
	let iframeRefs = $state<Map<number, HTMLIFrameElement>>(new Map());

	function sendCommand(iframe: HTMLIFrameElement | undefined, func: string, args: unknown[] = []) {
		iframe?.contentWindow?.postMessage(JSON.stringify({ event: 'command', func, args }), '*');
	}

	function getIframe(index: number): HTMLIFrameElement | undefined {
		return iframeRefs.get(index);
	}

	function playVideo(index: number) {
		sendCommand(getIframe(index), 'playVideo');
	}

	function pauseVideo(index: number) {
		sendCommand(getIframe(index), 'pauseVideo');
	}

	function muteActive() {
		sendCommand(getIframe(activeIndex), 'mute');
	}

	function unMuteActive() {
		sendCommand(getIframe(activeIndex), 'unMute');
	}

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
			toggleMute();
		}
	}

	function toggleMute() {
		muted = !muted;
		if (muted) {
			muteActive();
		} else {
			unMuteActive();
		}
	}

	function handleVisibility() {
		isPageVisible = document.visibilityState === 'visible';
		if (isPageVisible) {
			playVideo(activeIndex);
		} else {
			pauseVideo(activeIndex);
		}
	}

	function handleYTMessage(e: MessageEvent) {
		if (!e.data || typeof e.data !== 'string') return;
		try {
			const data = JSON.parse(e.data);
			if (data.event === 'infoDelivery' && data.info?.playerState === 0) {
				if (activeIndex < clips.length - 1) {
					navigateToIndex(activeIndex + 1);
				}
			}
		} catch {}
	}

	// React to activeIndex changes — play/pause via postMessage
	$effect(() => {
		const idx = activeIndex;
		// Pause all, play active
		for (let i = Math.max(0, idx - 1); i <= Math.min(clips.length - 1, idx + 1); i++) {
			if (i === idx && isPageVisible) {
				playVideo(i);
			} else {
				pauseVideo(i);
			}
		}
		// Apply mute state to newly active
		if (muted) {
			muteActive();
		} else {
			unMuteActive();
		}
	});

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

	function onIframeLoad(index: number, el: HTMLIFrameElement) {
		iframeRefs.set(index, el);
		// Apply initial mute state
		if (muted) {
			sendCommand(el, 'mute');
		}
		// Play if this is the active clip and page is visible
		if (index === activeIndex && isPageVisible) {
			// Small delay to ensure YouTube API is ready
			setTimeout(() => sendCommand(el, 'playVideo'), 500);
		} else {
			setTimeout(() => sendCommand(el, 'pauseVideo'), 500);
		}
	}

	onMount(() => {
		setupIntersectionObserver();
		loadFeed(true);
		window.addEventListener('keydown', handleKeyboard);
		window.addEventListener('message', handleYTMessage);
		document.addEventListener('visibilitychange', handleVisibility);

		if (browser) {
			const bottomNav = document.querySelector('nav.fixed.bottom-0') as HTMLElement | null;
			bottomNav?.style.setProperty('display', 'none');
		}

		tick().then(() => {
			const header = document.getElementById('top-header') as HTMLElement;
			header.style.setProperty('position', 'static');
			topOffset = header?.getBoundingClientRect().height ?? 0;
		});

		return () => {
			observer?.disconnect();
			window.removeEventListener('keydown', handleKeyboard);
			window.removeEventListener('message', handleYTMessage);
			document.removeEventListener('visibilitychange', handleVisibility);
		};
	});

	onDestroy(() => {
		if (browser) {
			const bottomNav = document.querySelector('nav.fixed.bottom-0') as HTMLElement | null;
			const header = document.getElementById('top-header') as HTMLElement;
			bottomNav?.style.setProperty('display', '');
			header.style.setProperty('position', 'fixed');
		}
	});
</script>

<svelte:head>
	<title>Shorts - Moviemania</title>
</svelte:head>

<div
	bind:this={container}
	class="snap-y snap-mandatory scrollbar-none overflow-x-hidden overflow-y-auto"
	style="height: calc(100dvh - {topOffset}px); -webkit-overflow-scrolling: touch;"
>
	{#if loading && clips.length === 0}
		<div class="flex items-center justify-center" style="height: calc(100dvh - {topOffset}px);">
			<div
				class="h-12 w-12 animate-spin rounded-full border-2 border-white/20 border-t-white"
			></div>
		</div>
	{:else if error}
		<div
			class="flex items-center justify-center px-6 text-center"
			style="height: calc(100dvh - {topOffset}px);"
		>
			<p class="text-red-400">{error}</p>
		</div>
	{:else}
		{#each clips as clip, index (clip.id)}
			<section
				data-reel
				data-index={index}
				class="relative mx-auto snap-start overflow-hidden bg-black md:aspect-9/16"
				style="height: calc(100dvh - {topOffset}px);"
			>
				{#if Math.abs(index - activeIndex) <= 1}
					<!-- Poster thumbnail behind iframe -->
					<div class="absolute inset-0 z-0">
						<img
							src={`https://img.youtube.com/vi/${clip.key}/hqdefault.jpg`}
							alt=""
							class="h-full w-full object-cover"
							loading="lazy"
						/>
					</div>
					<!-- Video iframe - only active ±1 -->
					<div class="absolute inset-0 z-[1]">
						<iframe
							class="h-full w-full"
							title={clip.title}
							src={`https://www.youtube.com/embed/${clip.key}?enablejsapi=1&controls=1&playsinline=1&rel=0&modestbranding=1&autoplay=0`}
							allow="autoplay; encrypted-media"
							allowfullscreen={false}
							onload={(e) => onIframeLoad(index, e.currentTarget as HTMLIFrameElement)}
						></iframe>
					</div>
				{:else}
					<!-- Poster thumbnail for non-loaded videos -->
					<div class="absolute inset-0 z-0">
						<img
							src={`https://img.youtube.com/vi/${clip.key}/hqdefault.jpg`}
							alt=""
							class="h-full w-full object-cover"
							loading="lazy"
						/>
					</div>
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
							<PlayCircleIcon size={28} weight="fill" class="text-black" />
						</div>
						<span class="text-xs font-medium text-white drop-shadow">Watch</span>
					</a>

					<button
						onclick={toggleMute}
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
			class="fixed top-20 left-4 z-30 rounded-lg bg-black/80 px-3 py-2 text-xs text-white/60 backdrop-blur-sm max-sm:hidden"
		>
			<div>↑↓ Navigate</div>
			<div>M Mute</div>
		</div>

		<!-- Attribution -->
		<div class="fixed bottom-4 left-4 z-30">
			<div class="rounded-xl bg-black/80 px-3 py-2 text-[11px] text-neutral-300 backdrop-blur-md">
				Content via YouTube/TMDB
			</div>
		</div>
	{/if}
</div>

<style>
	body {
		overflow: hidden;
		background: black;
	}

	div::-webkit-scrollbar {
		display: none;
	}
</style>
