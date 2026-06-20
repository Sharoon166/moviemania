<script lang="ts">
	import { createQuery } from '@tanstack/svelte-query';
	import { tmdb } from '$lib/api/tmdb';
	import type { TmdbGenre, TmdbMovie, TmdbTvShow } from '$lib/types/tmdb.d';
	import Tile from '$lib/components/Tile.svelte';
	import { MagnifyingGlassIcon, XIcon, SpinnerIcon, CaretDownIcon } from 'phosphor-svelte';
	import { cn } from '$lib/cn';
	import { searchHistory } from '$lib/services/search-history.svelte';

	let q = $state('');
	let selectedGenres = $state<number[]>([]);
	let mediaFilter = $state<'all' | 'movie' | 'tv'>('all');
	let year = $state<number | ''>('');
	let minRating = $state<number | ''>('');
	let sortBy = $state('popularity.desc');

	let results = $state<(TmdbMovie | TmdbTvShow)[]>([]);
	let totalPages = $state(0);
	let loading = $state(false);
	let error = $state('');
	let loadingMore = $state(false);

	let showHistory = $state(false);
	let searchFocused = $state(false);
	let hasHistory = $derived(searchHistory.items.length > 0);
	let sentinel = $state<HTMLElement | null>(null);

	let sortOptions = [
		{ value: 'popularity.desc', label: 'Popularity' },
		{ value: 'vote_average.desc', label: 'Rating' },
		{ value: 'primary_release_date.desc', label: 'Release Date' },
		{ value: 'vote_count.desc', label: 'Most Voted' }
	];

	let genres = createQuery(() => ({
		queryKey: ['genres-browse'],
		queryFn: async () => {
			const [movie, tv] = await Promise.all([tmdb.genre.movie(), tmdb.genre.tv()]);
			const map = new Map<number, TmdbGenre>();
			for (const g of [...movie.genres, ...tv.genres]) map.set(g.id, g);
			return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
		}
	}));

	let hasFilters = $derived(
		selectedGenres.length > 0 || year !== '' || minRating !== '' || sortBy !== 'popularity.desc'
	);

	async function fetchPage(page: number) {
		const opts = {
			query: q.length >= 2 ? q : undefined,
			genreIds: selectedGenres,
			page,
			year: year || undefined,
			rating: minRating || undefined,
			sortBy: hasFilters ? sortBy : undefined
		};

		const useDiscover = hasFilters || mediaFilter !== 'all' || q.length >= 2;
		if (useDiscover) {
			const fetchMovie = mediaFilter === 'tv' ? null : tmdb.discover.movies(opts);
			const fetchTv = mediaFilter === 'movie' ? null : tmdb.discover.tv(opts);

			const [movies, tvShows] = await Promise.all([
				fetchMovie ?? Promise.resolve({ results: [], total_pages: 0, page: 1, total_results: 0 }),
				fetchTv ?? Promise.resolve({ results: [], total_pages: 0, page: 1, total_results: 0 })
			]);

			const combined = [...(movies as any).results, ...(tvShows as any).results].sort(
				(a: any, b: any) => b.popularity - a.popularity
			);
			return { results: combined, total_pages: Math.max(movies.total_pages, tvShows.total_pages) };
		}

		const res = await tmdb.trending.all('week');
		return { results: res.results, total_pages: res.total_pages };
	}

	$effect(() => {
		const term = q;
		const genreFilter = selectedGenres;
		const filter = mediaFilter;
		const y = year;
		const rating = minRating;
		const sort = sortBy;

		loading = true;
		error = '';
		results = [];
		totalPages = 0;

		const timer = setTimeout(async () => {
			try {
				if (term.length >= 2) {
					searchHistory.add(term);
				}
				const res = await fetchPage(1);
				results = res.results;
				totalPages = res.total_pages;
			} catch (e) {
				error = e instanceof Error ? e.message : 'Search failed';
			} finally {
				loading = false;
			}
		}, term.length >= 2 ? 300 : 0);

		return () => clearTimeout(timer);
	});

	let filtered = $derived.by(() => {
		let items = results;
		if (selectedGenres.length > 0) {
			items = items.filter((item) => {
				const ids = (item as any).genre_ids as number[] | undefined;
				return ids && selectedGenres.some((g) => ids.includes(g));
			});
		}
		if (mediaFilter !== 'all') {
			items = items.filter((item) => item.media_type === mediaFilter);
		}
		return items;
	});

	async function loadMore() {
		if (loadingMore || totalPages === 0 || results.length === 0) return;
		loadingMore = true;
		try {
			const nextPage = Math.ceil(results.length / 20) + 1;
			if (nextPage > totalPages) return;
			const res = await fetchPage(nextPage);
			results = [...results, ...res.results];
			totalPages = res.total_pages;
		} finally {
			loadingMore = false;
		}
	}

	function toggleGenre(id: number) {
		selectedGenres = selectedGenres.includes(id)
			? selectedGenres.filter((g) => g !== id)
			: [...selectedGenres, id];
	}

	function submitSearch(term: string) {
		q = term;
		showHistory = false;
	}

	function clearAllFilters() {
		selectedGenres = [];
		year = '';
		minRating = '';
		sortBy = 'popularity.desc';
	}

	$effect(() => {
		if (!sentinel) return;
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting && !loading && !loadingMore && results.length > 0) {
					loadMore();
				}
			},
			{ rootMargin: '400px' }
		);
		observer.observe(sentinel);
		return () => observer.disconnect();
	});
</script>

<div class="mx-auto max-w-7xl space-y-6 pt-24 pb-12">
	<div class="z-40 space-y-4 bg-surface-950 px-4 py-8">
		<!-- Search Bar -->
		<div>
			<div class="relative flex-1">
				<MagnifyingGlassIcon
					class="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-neutral-500"
				/>
				<input
					bind:value={q}
					onfocus={() => {
						searchFocused = true;
						showHistory = true;
					}}
					onblur={() => setTimeout(() => {
						searchFocused = false;
						showHistory = false;
					}, 200)}
					placeholder="Search movies & TV..."
					class="w-full rounded-2xl border border-white/10 bg-surface-800 py-3.5 pr-4 pl-11 text-sm text-white placeholder-neutral-500 transition-all duration-300 outline-none focus:border-gold-500/50 focus:bg-surface-700 focus:ring-2 focus:ring-gold-500/20"
				/>

				{#if searchFocused && showHistory && hasHistory}
					<div
						class="absolute top-full left-0 right-0 z-50 mt-2 overflow-hidden rounded-2xl border border-white/10 bg-surface-800 shadow-2xl shadow-black/50 backdrop-blur-xl"
					>
						<div class="flex items-center justify-between border-b border-white/10 px-4 py-2.5">
							<span class="text-xs font-medium text-neutral-500">Recent Searches</span>
							<button
								onclick={() => { searchHistory.clear(); showHistory = false; }}
								class="text-xs text-gold-400 hover:text-gold-300"
							>
								Clear
							</button>
						</div>
						{#each searchHistory.items as item (item.query + item.timestamp)}
							<div
								onclick={() => submitSearch(item.query)}
								onkeydown={(e) => e.key === 'Enter' && submitSearch(item.query)}
								role="button"
								tabindex="0"
								class="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left text-sm text-neutral-300 transition-all hover:bg-white/5 hover:text-white"
							>
								<MagnifyingGlassIcon class="h-3.5 w-3.5 shrink-0 text-neutral-500" />
								<span class="truncate">{item.query}</span>
								<button
									onclick={(e) => { e.stopPropagation(); searchHistory.remove(item.query); }}
									class="ml-auto shrink-0 text-neutral-600 hover:text-white"
								>
									<XIcon class="h-3 w-3" />
								</button>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		</div>

		<!-- Filter Row -->
		<div>
			<div class="flex items-center gap-2 overflow-x-auto pb-2" style="scrollbar-width: none;">
				<!-- Media Type -->
				<div class="flex shrink-0 rounded-xl border border-white/10 bg-surface-800 p-0.5">
					<button
						onclick={() => (mediaFilter = 'all')}
						class={cn(
							'rounded-lg px-3 py-1.5 text-xs font-medium transition-all',
							mediaFilter === 'all'
								? 'bg-gold-500/20 text-gold-400'
								: 'text-neutral-400 hover:text-white'
						)}>All</button
					>
					<button
						onclick={() => (mediaFilter = 'movie')}
						class={cn(
							'rounded-lg px-3 py-1.5 text-xs font-medium transition-all',
							mediaFilter === 'movie'
								? 'bg-gold-500/20 text-gold-400'
								: 'text-neutral-400 hover:text-white'
						)}>Movies</button
					>
					<button
						onclick={() => (mediaFilter = 'tv')}
						class={cn(
							'rounded-lg px-3 py-1.5 text-xs font-medium transition-all',
							mediaFilter === 'tv'
								? 'bg-gold-500/20 text-gold-400'
								: 'text-neutral-400 hover:text-white'
						)}>TV</button
					>
				</div>

				<div class="h-5 w-px shrink-0 bg-white/10"></div>

				<!-- Year Filter -->
				<input
					type="number"
					bind:value={year}
					placeholder="Year"
					min="1900"
					max="2030"
					class="w-20 shrink-0 rounded-lg border border-white/10 bg-surface-800 px-3 py-1.5 text-xs text-white placeholder-neutral-500 transition-all outline-none focus:border-gold-500/30 focus:ring-1 focus:ring-gold-500/30"
				/>

				<!-- Rating Filter -->
				<select
					bind:value={minRating}
					class="shrink-0 rounded-lg border border-white/10 bg-surface-800 px-3 py-1.5 text-xs text-white outline-none transition-all focus:border-gold-500/30 focus:ring-1 focus:ring-gold-500/30"
				>
					<option value="" class="bg-surface-900">Min Rating</option>
					<option value="7" class="bg-surface-900">7+</option>
					<option value="6" class="bg-surface-900">6+</option>
					<option value="5" class="bg-surface-900">5+</option>
				</select>

				<!-- Sort By -->
				<div class="relative shrink-0">
					<select
						bind:value={sortBy}
						class="appearance-none rounded-lg border border-white/10 bg-surface-800 py-1.5 pr-7 pl-3 text-xs text-white outline-none transition-all focus:border-gold-500/30 focus:ring-1 focus:ring-gold-500/30"
					>
						{#each sortOptions as opt}
							<option value={opt.value} class="bg-surface-900">{opt.label}</option>
						{/each}
					</select>
					<CaretDownIcon
						class="pointer-events-none absolute top-1/2 right-2 h-3 w-3 -translate-y-1/2 text-neutral-500"
					/>
				</div>

				<div class="h-5 w-px shrink-0 bg-white/10"></div>

				<!-- Genre Chips -->
				{#if genres.data}
					{#each genres.data as genre (genre.id)}
						<button
							onclick={() => toggleGenre(genre.id)}
							class={cn(
								'shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-all',
								selectedGenres.includes(genre.id)
									? 'bg-gold-500/20 text-gold-400 ring-1 ring-gold-500/30'
									: 'bg-surface-800 text-neutral-400 hover:bg-surface-700 hover:text-white'
							)}
						>
							{genre.name}
						</button>
					{/each}
				{/if}

				<!-- Clear All Filters -->
				{#if hasFilters}
					<button
						onclick={clearAllFilters}
						class="flex shrink-0 items-center gap-1 rounded-lg bg-surface-800 px-3 py-1.5 text-xs text-neutral-500 transition-all hover:text-white"
					>
						<XIcon class="h-3 w-3" />
						Clear
					</button>
				{/if}
			</div>
		</div>
	</div>

	<!-- Results -->
	{#if error}
		<div class="flex flex-col items-center gap-2 px-4 py-16 text-center">
			<p class="text-sm text-red-400">{error}</p>
		</div>
	{:else if loading}
		<div class="flex items-center justify-center px-4 py-16">
			<SpinnerIcon class="h-6 w-6 animate-spin text-neutral-500" />
		</div>
	{:else if filtered.length > 0}
		<div class="space-y-4 px-4 md:px-8">
			<div
				class="grid grid-cols-2 gap-3 gap-y-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
			>
				{#each filtered as item (item.id)}
					<div class="animate-fade-up" style="animation-delay: {filtered.indexOf(item) * 20}ms">
						<Tile media={item} />
					</div>
				{/each}
			</div>
		</div>

		<!-- Infinite Scroll Sentinel -->
		{#if totalPages > 1}
			<div
				bind:this={sentinel}
				class="flex justify-center px-4 py-8"
			>
				{#if loadingMore}
					<div
						class="h-8 w-8 animate-spin rounded-full border-2 border-gold-500/30 border-t-gold-500"
					></div>
				{:else}
					<div class="h-8"></div>
				{/if}
			</div>
		{/if}
	{:else}
		<div class="flex flex-col items-center gap-2 px-4 py-16 text-center">
			<p class="text-sm text-neutral-500">No results found</p>
			<p class="text-xs text-neutral-600">Try adjusting your filters or search term</p>
		</div>
	{/if}
</div>
