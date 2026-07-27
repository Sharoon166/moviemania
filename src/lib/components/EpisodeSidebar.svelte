<script lang="ts">
	import { createQuery } from '@tanstack/svelte-query';
	import { tmdb } from '$lib/api/tmdb';
	import type { TmdbEpisode } from '$lib/types/tmdb.d';
	import { cn } from '$lib/cn';
	import {
		CaretUpIcon,
		CaretDownIcon,
		ListIcon,
		ArrowsDownUpIcon,
		MagnifyingGlassIcon,
		StarIcon,
		PlayIcon
	} from 'phosphor-svelte';

	let {
		tvId,
		showName,
		totalSeasons,
		season: initialSeason,
		episode: initialEpisode,
		onchange
	}: {
		tvId: number;
		showName: string;
		totalSeasons: number;
		season: number;
		episode: number;
		onchange: (s: number, e: number) => void;
	} = $props();

	let season = $state(initialSeason);
	let episode = $state(initialEpisode);
	let isExpanded = $state(true);
	let searchQuery = $state('');
	let sortOrder = $state<'asc' | 'desc'>('asc');

	$effect(() => {
		season = initialSeason;
		episode = initialEpisode;
	});

	let seasonDetail = createQuery(() => ({
		queryKey: ['tv', tvId, 'season', season],
		queryFn: () => tmdb.season.detail(tvId, season)
	}));

	let currentEpisode = $derived(
		seasonDetail.data?.episodes.find((ep) => ep.episode_number === episode)
	);

	let nextEpisode = $derived.by(() => {
		if (!seasonDetail.data) return null;
		const currentIndex = seasonDetail.data.episodes.findIndex(
			(ep) => ep.episode_number === episode
		);
		if (currentIndex < seasonDetail.data.episodes.length - 1) {
			return seasonDetail.data.episodes[currentIndex + 1];
		}
		if (season < totalSeasons) {
			return {
				season_number: season + 1,
				episode_number: 1,
				name: 'Season Premiere'
			} as TmdbEpisode;
		}
		return null;
	});

	let filteredEpisodes = $derived.by(() => {
		if (!seasonDetail.data) return [];
		let episodes = [...seasonDetail.data.episodes];

		if (searchQuery.trim()) {
			episodes = episodes.filter(
				(ep) =>
					ep.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
					ep.overview?.toLowerCase().includes(searchQuery.toLowerCase())
			);
		}

		if (sortOrder === 'desc') {
			episodes.reverse();
		}

		return episodes;
	});

	function select(s: number, e: number) {
		season = s;
		episode = e;
		onchange(s, e);
	}

	function toggleExpanded() {
		isExpanded = !isExpanded;
	}

	function toggleSort() {
		sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
	}

	function closeOnEscape(e: KeyboardEvent) {
		if (e.key === 'Escape' && searchQuery) {
			searchQuery = '';
		}
	}

	function handleKeyNavigation(e: KeyboardEvent) {
		if (!seasonDetail.data || !isExpanded) return;

		const episodes = filteredEpisodes;
		const currentIndex = episodes.findIndex((ep) => ep.episode_number === episode);

		if (e.key === 'ArrowDown' && currentIndex < episodes.length - 1) {
			e.preventDefault();
			select(season, episodes[currentIndex + 1].episode_number);
		} else if (e.key === 'ArrowUp' && currentIndex > 0) {
			e.preventDefault();
			select(season, episodes[currentIndex - 1].episode_number);
		}
	}

	$effect(() => {
		if (typeof window === 'undefined') return;
		window.addEventListener('keydown', closeOnEscape);
		window.addEventListener('keydown', handleKeyNavigation);
		return () => {
			window.removeEventListener('keydown', closeOnEscape);
			window.removeEventListener('keydown', handleKeyNavigation);
		};
	});
</script>

<div class="w-full rounded-2xl border border-white/10 bg-surface-900/95 shadow-xl backdrop-blur-xl">
	<!-- Header - Collapsible -->
	<button
		onclick={toggleExpanded}
		class="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-white/5"
	>
		<div class="max-w-full">
			<div class="flex items-center gap-2">
				<h3 class="line-clamp-2 font-display text-base font-bold text-white">
					{#if nextEpisode}
						Up Next - {nextEpisode.name}
					{:else}
						Episode {episode}
					{/if}
				</h3>
			</div>
			{#if currentEpisode}
				<p class="mt-0.5 truncate text-xs text-neutral-400">
					Playing - Episode {episode} - {currentEpisode.name}
				</p>
			{/if}
		</div>
		<div class="ml-4">
			{#if isExpanded}
				<CaretUpIcon class="h-5 w-5 text-neutral-400" weight="bold" />
			{:else}
				<CaretDownIcon class="h-5 w-5 text-neutral-400" weight="bold" />
			{/if}
		</div>
	</button>

	<!-- Season Info Card -->
	{#if isExpanded && seasonDetail.data}
		{#if seasonDetail.data.poster_path || seasonDetail.data.overview}
			<div class="border-b border-white/10 px-4 py-3">
				<div class="flex gap-3">
					{#if seasonDetail.data.poster_path}
						<img
							src={`https://image.tmdb.org/t/p/w185${seasonDetail.data.poster_path}`}
							alt={seasonDetail.data.name}
							class="h-28 w-20 shrink-0 rounded-lg object-cover shadow-lg ring-1 ring-white/10"
							loading="lazy"
						/>
					{/if}
					<div class="min-w-0 flex-1">
						<h4 class="line-clamp-1 text-sm font-semibold text-white">{seasonDetail.data.name}</h4>
						{#if seasonDetail.data.overview}
							<p class="mt-1 line-clamp-4 text-xs leading-relaxed text-neutral-400">
								{seasonDetail.data.overview}
							</p>
						{:else}
							<p class="mt-1 text-xs text-neutral-500">No description available</p>
						{/if}
					</div>
				</div>
			</div>
		{/if}
	{/if}

	<!-- Collapsible Content -->
	{#if isExpanded}
		<div class="border-t border-white/10">
			<!-- Search & Controls -->
			<div class="space-y-3 border-b border-white/10 px-4 py-3">
				<!-- Search Bar -->
				<div class="relative">
					<MagnifyingGlassIcon
						class="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-500"
						weight="bold"
					/>
					<input
						type="text"
						bind:value={searchQuery}
						placeholder="Search Episode"
						class="w-full rounded-lg border border-white/10 bg-surface-800 py-2.5 pr-3 pl-10 text-sm text-white placeholder-neutral-500 transition-all focus:border-gold-500/30 focus:ring-1 focus:ring-gold-500/30 focus:outline-none"
					/>
				</div>

				<!-- Season Selector & Sort -->
				<div class="flex flex-col gap-2">
					<div class="flex items-center gap-2">
						<button
							onclick={toggleSort}
							class="flex items-center gap-1.5 rounded-lg border border-white/10 bg-surface-800 px-3 py-2 text-xs font-medium text-neutral-300 transition-all hover:border-white/20 hover:bg-surface-700"
							title={sortOrder === 'asc' ? 'Sort descending' : 'Sort ascending'}
						>
							<ArrowsDownUpIcon class="h-3.5 w-3.5" weight="bold" />
						</button>

						<div
							class="flex items-center gap-1.5 rounded-lg border border-white/10 bg-surface-800 px-3 py-2"
						>
							<ListIcon class="h-3.5 w-3.5 text-neutral-500" weight="bold" />
							<span class="text-xs font-medium text-neutral-400">Season</span>
						</div>
					</div>

					<div class="flex flex-1 gap-1.5 overflow-x-auto">
						{#each Array(totalSeasons) as _, i (i)}
							<button
								onclick={() => {
									season = i + 1;
									episode = 1;
								}}
								class={cn(
									'rounded-lg px-2.5 py-1.5 text-xs font-bold text-nowrap transition-all duration-200',
									season === i + 1
										? 'bg-gold-500/20 text-gold-400 ring-1 ring-gold-500/30'
										: 'bg-surface-800 text-neutral-400 hover:bg-surface-700 hover:text-white'
								)}>S {i + 1}</button
							>
						{/each}
					</div>
				</div>
			</div>

			<!-- Episode List -->
			<div class="max-h-125 overflow-y-auto overscroll-contain">
				{#if seasonDetail.data}
					<div class="space-y-0">
						{#each filteredEpisodes as ep (ep.id)}
							{@const isActive = episode === ep.episode_number}
							<button
								onclick={() => select(season, ep.episode_number)}
								class={cn(
									'group flex w-full items-start gap-3 border-b border-white/5 px-4 py-3 text-left transition-all duration-200 last:border-b-0',
									isActive ? 'bg-surface-800/80' : 'hover:bg-white/5'
								)}
							>
								<!-- Thumbnail -->
								<div class="relative shrink-0">
									{#if ep.still_path}
										<div class="relative h-16 w-28 overflow-hidden rounded-lg">
											<img
												src={`https://image.tmdb.org/t/p/w300${ep.still_path}`}
												alt={ep.name}
												class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
												loading="lazy"
											/>
											{#if isActive}
												<div
													class="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-[1px]"
												>
													<PlayIcon class="h-5 w-5 text-white" weight="fill" />
												</div>
											{/if}
										</div>
									{:else}
										<div
											class="flex h-16 w-28 items-center justify-center rounded-lg bg-surface-800 text-lg font-bold text-neutral-400"
										>
											{ep.episode_number}
										</div>
									{/if}
									<!-- Episode Number Badge -->
									<div
										class={cn(
											'absolute -top-1.5 -left-1.5 rounded-md px-1.5 py-0.5 text-[10px] font-bold',
											isActive
												? 'bg-neutral-900 text-white ring-2 ring-white/20'
												: 'bg-neutral-900/90 text-neutral-400'
										)}
									>
										Ep {ep.episode_number}
									</div>
								</div>

								<!-- Episode Info -->
								<div class="min-w-0 flex-1">
									<h4
										class={cn(
											'line-clamp-2 text-sm leading-snug font-medium',
											isActive ? 'text-white' : 'text-neutral-200 group-hover:text-white'
										)}
									>
										{ep.name}
									</h4>

									<div class="mt-1 flex items-center gap-2 text-xs text-neutral-400">
										{#if ep.vote_average > 0}
											<div class="flex items-center gap-1">
												<StarIcon class="h-3 w-3 text-gold-500" weight="fill" />
												<span>{ep.vote_average.toFixed(1)}</span>
											</div>
											<span>•</span>
										{/if}
										{#if ep.air_date}
											<span>
												{new Date(ep.air_date).toLocaleDateString('en-US', {
													month: 'short',
													day: 'numeric',
													year: 'numeric'
												})}
											</span>
										{/if}
									</div>
								</div>
							</button>
						{/each}

						{#if filteredEpisodes.length === 0}
							<div class="flex flex-col items-center justify-center gap-2 px-4 py-12 text-center">
								<MagnifyingGlassIcon class="h-8 w-8 text-neutral-600" />
								<p class="text-sm text-neutral-400">No episodes found</p>
								<button
									onclick={() => (searchQuery = '')}
									class="text-xs text-gold-400 hover:text-gold-300"
								>
									Clear search
								</button>
							</div>
						{/if}
					</div>
				{:else if seasonDetail.isPending}
					<div class="flex items-center justify-center py-12">
						<div
							class="h-8 w-8 animate-spin rounded-full border-2 border-gold-500/30 border-t-gold-500"
						></div>
					</div>
				{:else if seasonDetail.isError}
					<div class="flex flex-col items-center justify-center gap-2 px-4 py-12 text-center">
						<p class="text-sm text-neutral-400">Failed to load episodes</p>
						<button
							onclick={() => seasonDetail.refetch()}
							class="text-xs text-gold-400 hover:text-gold-300"
						>
							Try again
						</button>
					</div>
				{/if}
			</div>

			<!-- Footer -->
			<div class="border-t border-white/10 bg-surface-950/50 px-4 py-3">
				<div class="flex items-center justify-between text-xs">
					<span class="text-neutral-500">
						{filteredEpisodes.length} of {seasonDetail.data?.episodes.length ?? 0} episodes
					</span>
				</div>
			</div>
		</div>
	{/if}
</div>
