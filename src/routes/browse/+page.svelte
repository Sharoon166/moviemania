<script lang="ts">
	import { createQuery } from '@tanstack/svelte-query';
	import { tmdb } from '$lib/api/tmdb';
	import type { TmdbGenre, TmdbMovie, TmdbTvShow } from '$lib/types/tmdb.d';
	import Tile from '$lib/components/Tile.svelte';
	import { MagnifyingGlass, X, Spinner } from 'phosphor-svelte';
	import { cn } from '$lib/cn';

	let q = $state('');
	let selectedGenres = $state<number[]>([]);
	let mediaFilter = $state<'all' | 'movie' | 'tv'>('all');

	let results = $state<(TmdbMovie | TmdbTvShow)[]>([]);
	let totalPages = $state(0);
	let loading = $state(false);
	let error = $state('');
	let loadingMore = $state(false);

	let genres = createQuery(() => ({
		queryKey: ['genres-browse'],
		queryFn: async () => {
			const [movie, tv] = await Promise.all([tmdb.genre.movie(), tmdb.genre.tv()]);
			const map = new Map<number, TmdbGenre>(); // eslint-disable-line svelte/prefer-svelte-reactivity
			for (const g of [...movie.genres, ...tv.genres]) map.set(g.id, g);
			return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
		}
	}));

	// $effect(() => {
	// 	const term = q; // track q directly — Svelte 5 sees this as a dependency

	// 	loading = true;
	// 	error = '';
	// 	results = [];
	// 	totalPages = 0;

	// 	const timer = setTimeout(
	// 		async () => {
	// 			try {
	// 				const searchTerm = term.length >= 2 ? term : '';
	// 				const res = searchTerm
	// 					? await tmdb.search.multi(searchTerm)
	// 					: await tmdb.trending.all('week');
	// 				results = res.results;
	// 				totalPages = res.total_pages;
	// 			} catch (e) {
	// 				error = e instanceof Error ? e.message : 'Search failed';
	// 			} finally {
	// 				loading = false;
	// 			}
	// 		},
	// 		term.length >= 2 ? 300 : 0
	// 	);

	// 	return () => clearTimeout(timer);
	// });
	$effect(() => {
    const term = q;
    const genres = selectedGenres;
    const filter = mediaFilter;

    loading = true;
    error = '';
    results = [];
    totalPages = 0;

    const timer = setTimeout(async () => {
        try {
            if (genres.length > 0) {
                // genres selected — use discover which supports genre filtering
                const fetchMovie = filter === 'tv' ? null :
                    tmdb.discover.movies({ query: term.length >= 2 ? term : undefined, genreIds: genres });
                const fetchTv = filter === 'movie' ? null :
                    tmdb.discover.tv({ query: term.length >= 2 ? term : undefined, genreIds: genres });

                const [movies, tv] = await Promise.all([
                    fetchMovie ?? Promise.resolve({ results: [], total_pages: 0, page: 1, total_results: 0 }),
                    fetchTv   ?? Promise.resolve({ results: [], total_pages: 0, page: 1, total_results: 0 })
                ]);

                results = [...movies.results, ...tv.results]
                    .sort((a, b) => b.popularity - a.popularity);
                totalPages = Math.max(movies.total_pages, tv.total_pages);

            } else if (term.length >= 2) {
                // no genres, just search
                const res = await tmdb.search.multi(term);
                if (filter !== 'all') {
                    res.results = res.results.filter(r => r.media_type === filter);
                }
                results = res.results;
                totalPages = res.total_pages;

            } else {
                // no genres, no query — trending
                if (filter === 'movie') {
                    const res = await tmdb.trending.movies('week');
                    results = res.results; totalPages = res.total_pages;
                } else if (filter === 'tv') {
                    const res = await tmdb.trending.tv('week');
                    results = res.results; totalPages = res.total_pages;
                } else {
                    const res = await tmdb.trending.all('week');
                    results = res.results; totalPages = res.total_pages;
                }
            }
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

	// async function loadMore() {
	// 	if (loadingMore || totalPages === 0 || results.length === 0) return;
	// 	loadingMore = true;
	// 	try {
	// 		const nextPage = Math.ceil(results.length / 20) + 1;
	// 		if (nextPage > totalPages) return;
	// 		const res =
	// 			q.length >= 2 ? await tmdb.search.multi(q, nextPage) : await tmdb.trending.all('week'); // trending has no pagination but safe fallback
	// 		results = [...results, ...res.results];
	// 		totalPages = res.total_pages;
	// 	} finally {
	// 		loadingMore = false;
	// 	}
	// }

	async function loadMore() {
    if (loadingMore || totalPages === 0 || results.length === 0) return;
    loadingMore = true;
    try {
        const nextPage = Math.ceil(results.length / 20) + 1;
        if (nextPage > totalPages) return;

        if (selectedGenres.length > 0) {
            const [movies, tv] = await Promise.all([
                mediaFilter === 'tv'    ? null : tmdb.discover.movies({ query: q.length >= 2 ? q : undefined, genreIds: selectedGenres, page: nextPage }),
                mediaFilter === 'movie' ? null : tmdb.discover.tv({ query: q.length >= 2 ? q : undefined, genreIds: selectedGenres, page: nextPage })
            ].map(p => p ?? Promise.resolve({ results: [], total_pages: 0, page: 1, total_results: 0 })));
            results = [...results, ...(movies as any).results, ...(tv as any).results]
                .sort((a, b) => b.popularity - a.popularity);
        } else {
            const res = q.length >= 2
                ? await tmdb.search.multi(q, nextPage)
                : await tmdb.trending.all('week');
            results = [...results, ...res.results];
            totalPages = res.total_pages;
        }
    } finally {
        loadingMore = false;
    }
}

	function toggleGenre(id: number) {
		selectedGenres = selectedGenres.includes(id)
			? selectedGenres.filter((g) => g !== id)
			: [...selectedGenres, id];
	}
</script>

<div class="mx-auto max-w-7xl space-y-6 pt-24 pb-12">
	<div class="sticky top-16 z-40 bg-surface-950 px-4 pb-4 md:px-8">
		<div class="relative flex-1">
			<MagnifyingGlass
				class="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-neutral-500"
			/>
			<input
				bind:value={q}
				placeholder="Search movies & TV..."
				class="w-full rounded-2xl border border-white/10 bg-surface-800 py-3.5 pr-4 pl-11 text-sm text-white placeholder-neutral-500 transition-all duration-300 outline-none focus:border-gold-500/50 focus:bg-surface-700 focus:ring-2 focus:ring-gold-500/20"
			/>
		</div>
	</div>

	<div class="sticky top-32 z-40 bg-surface-950 px-4 pb-2 md:px-8">
		<div class="flex items-center gap-2 overflow-x-auto pb-2" style="scrollbar-width: none;">
			<div class="flex rounded-xl border border-white/10 bg-surface-800 p-0.5">
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

			<div class="h-5 w-px bg-white/10"></div>

			{#if genres.data}
				{#each genres.data as genre (genre.id)}
					<button
						onclick={() => toggleGenre(genre.id)}
						class={cn(
							'rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-all',
							selectedGenres.includes(genre.id)
								? 'bg-gold-500/20 text-gold-400 ring-1 ring-gold-500/30'
								: 'bg-surface-800 text-neutral-400 hover:bg-surface-700 hover:text-white'
						)}
					>
						{genre.name}
					</button>
				{/each}
			{/if}

			{#if selectedGenres.length > 0}
				<button
					onclick={() => (selectedGenres = [])}
					class="flex items-center gap-1 rounded-lg bg-surface-800 px-3 py-1.5 text-xs text-neutral-500 transition-all hover:text-white"
				>
					<X class="h-3 w-3" />
					Clear
				</button>
			{/if}
		</div>
	</div>

	{#if error}
		<div class="flex flex-col items-center gap-2 px-4 py-16 text-center">
			<p class="text-sm text-red-400">{error}</p>
		</div>
	{:else if loading}
		<div class="flex items-center justify-center px-4 py-16">
			<Spinner class="h-6 w-6 animate-spin text-neutral-500" />
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

		{#if totalPages > 1}
			<div class="flex justify-center px-4">
				<button
					onclick={loadMore}
					disabled={loadingMore}
					class="flex items-center gap-2 rounded-xl border border-white/10 bg-surface-800 px-6 py-3 text-sm font-medium text-neutral-300 transition-all duration-300 hover:bg-surface-700 hover:text-white active:scale-95 disabled:opacity-50"
				>
					{#if loadingMore}
						<div
							class="h-4 w-4 animate-spin rounded-full border-2 border-gold-500/30 border-t-gold-500"
						></div>
						Loading...
					{:else}
						Load More
					{/if}
				</button>
			</div>
		{/if}
	{:else}
		<div class="flex flex-col items-center gap-2 px-4 py-16 text-center">
			<p class="text-sm text-neutral-500">No results found</p>
			<p class="text-xs text-neutral-600">Try adjusting your filters or search term</p>
		</div>
	{/if}
</div>
