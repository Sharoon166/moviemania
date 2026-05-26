<script lang="ts">
	import type { TmdbMovie, TmdbTvShow, TmdbVideo } from '$lib/types/tmdb.d';
	import { PlayCircleIcon, ThumbsUpIcon } from 'phosphor-svelte';

	type ShortsClip = {
		id: string;
		key: string;
		name: string;
		title: string;
		mediaType: 'movie' | 'tv';
		mediaId: number;
		youtubeThumbnail: string | null;
	};

	let {
		clips,
		liked,
		onLike,
		onOpen
	}: {
		clips: ShortsClip[];
		liked: Record<string, boolean>;
		onLike: (id: string) => void;
		onOpen: (clip: ShortsClip) => void;
	} = $props();

	function toggleLike(id: string) {
		onLike(id);
	}

	function openClip(clip: ShortsClip) {
		onOpen(clip);
	}
</script>

<div class="relative">
	<div
		class="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-surface-950 to-transparent"
	></div>
	<div
		class="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-surface-950 to-transparent"
	></div>

	<div
		class="flex snap-x snap-mandatory [scrollbar-width:none] gap-3 overflow-x-auto scroll-smooth pt-1 pb-4"
		style="-webkit-overflow-scrolling: touch"
	>
		{#each clips as clip (clip.id)}
			<div class="w-[200px] shrink-0 snap-start">
				<div
					role="button"
					tabindex="0"
					onclick={() => openClip(clip)}
					onkeydown={(e) => e.key === 'Enter' && openClip(clip)}
					class="group block w-full rounded-2xl bg-surface-800 ring-1 ring-white/10 transition-transform duration-300 hover:-translate-y-0.5"
					aria-label={`Open ${clip.title}`}
				>
					<div class="relative aspect-[9/16] overflow-hidden rounded-2xl">
						{#if clip.youtubeThumbnail}
							<img
								src={clip.youtubeThumbnail}
								alt={clip.title}
								class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
								loading="lazy"
							/>
						{:else}
							<div class="flex h-full w-full items-center justify-center bg-surface-800">
								<div class="flex h-14 w-14 items-center justify-center rounded-full bg-white/5">
									<PlayCircleIcon class="h-7 w-7 text-white" weight="fill" />
								</div>
							</div>
						{/if}

						<div
							class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent"
						></div>
						<div class="absolute right-2 bottom-2 left-2">
							<p class="line-clamp-2 text-xs font-semibold text-white">{clip.name || clip.title}</p>
							<p class="mt-1 text-[11px] text-neutral-300">Tap to open</p>
						</div>

						<button
							onclick={(e) => {
								e.stopPropagation();
								toggleLike(clip.id);
							}}
							class="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-black/50 px-2.5 py-1 text-xs text-white ring-1 ring-white/10 backdrop-blur-sm transition-colors duration-200 hover:bg-black/60"
							aria-pressed={!!liked[clip.id]}
							title={liked[clip.id] ? 'Unlike' : 'Like'}
						>
							<ThumbsUpIcon class="h-3.5 w-3.5" weight={liked[clip.id] ? 'fill' : 'regular'} />
							<span class="tabular-nums">{liked[clip.id] ? 'Liked' : 'Like'}</span>
						</button>
					</div>
				</div>
			</div>
		{/each}
		<div class="w-4 shrink-0"></div>
	</div>
</div>
