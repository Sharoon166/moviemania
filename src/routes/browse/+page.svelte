<script lang="ts">
	import { createQuery } from '@tanstack/svelte-query';
	import { tmdb } from '$lib/api/tmdb';
	import type { TmdbGenre, TmdbMovie, TmdbTvShow } from '$lib/types/tmdb.d';
	import Tile from '$lib/components/Tile.svelte';
	import SkeletonTile from '$lib/components/SkeletonTile.svelte';
	import MagnifyingGlassIcon from 'phosphor-svelte/lib/MagnifyingGlassIcon';
	import XIcon from 'phosphor-svelte/lib/XIcon';
	import CaretDownIcon from 'phosphor-svelte/lib/CaretDownIcon';
	import CalendarIcon from 'phosphor-svelte/lib/CalendarIcon';
	import ArrowCounterClockwiseIcon from 'phosphor-svelte/lib/ArrowCounterClockwiseIcon';
	import YearRangeSelector from '$lib/components/YearRangeSelector.svelte';
	import { cn } from '$lib/cn';
	import { searchHistory } from '$lib/services/search-history.svelte';
	import { appSettings } from '$lib/services/app-settings.svelte';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	let q = $state('');
	let submittedQuery = $state('');
	let selectedGenres = $state<number[]>([]);
	let mediaFilter = $state<'all' | 'movie' | 'tv'>(appSettings.defaultMediaFilter);
	const currentYear = new Date().getFullYear();
	const defaultYearRange: [number, number] = [1900, currentYear];
	let yearRange = $state<[number, number]>([...defaultYearRange]);
	let showYearPicker = $state(false);
	let yearPickerKey = $state(0);
	let yearPickerPos = $state({ top: 0, left: 0 });

	function toggleYearPicker(e: MouseEvent) {
		if (showYearPicker) {
			showYearPicker = false;
			return;
		}
		const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
		yearPickerPos = {
			top: rect.bottom + 8,
			left: Math.max(8, Math.min(rect.left, window.innerWidth - 272))
		};
		showYearPicker = true;
	}
	let minRating = $state<number | ''>('');
	let sortBy = $state(appSettings.defaultSortBy);
	let country = $state('');
	let language = $state('');
	let region = $state('');

	let results = $state<(TmdbMovie | TmdbTvShow)[]>([]);
	let totalPages = $state(0);
	let totalResults = $state(0);
	let loading = $state(false);
	let error = $state('');
	let loadingMore = $state(false);
	let currentPage = $state(0);

	let showHistory = $state(false);
	let searchFocused = $state(false);
	let hasHistory = $derived(searchHistory.items.length > 0);
	let sentinel = $state<HTMLElement | null>(null);
	let searchInput = $state<HTMLInputElement | null>(null);

	type AutocompleteItem = {
		id: number;
		media_type: 'movie' | 'tv';
		title: string;
		year: string;
		poster: string | null;
		rating: number;
	};
	let suggestions = $state<AutocompleteItem[]>([]);
	let suggestionsLoading = $state(false);
	let showSuggestions = $derived(suggestions.length > 0 || suggestionsLoading);
	let showDropdown = $derived(searchFocused && (showHistory || showSuggestions));

	let sortOptions = [
		{ value: 'popularity.desc', label: 'Popularity' },
		{ value: 'vote_average.desc', label: 'Rating' },
		{ value: 'primary_release_date.desc', label: 'Release Date' },
		{ value: 'vote_count.desc', label: 'Most Voted' }
	];

	let countryOptions = [
		{ value: 'US', label: 'United States', flag: '\u{1F1FA}\u{1F1F8}' },
		{ value: 'GB', label: 'United Kingdom', flag: '\u{1F1EC}\u{1F1E7}' },
		{ value: 'KR', label: 'South Korea', flag: '\u{1F1F0}\u{1F1F7}' },
		{ value: 'JP', label: 'Japan', flag: '\u{1F1EF}\u{1F1F5}' },
		{ value: 'FR', label: 'France', flag: '\u{1F1EB}\u{1F1F7}' },
		{ value: 'DE', label: 'Germany', flag: '\u{1F1E9}\u{1F1EA}' },
		{ value: 'IN', label: 'India', flag: '\u{1F1EE}\u{1F1F3}' },
		{ value: 'ES', label: 'Spain', flag: '\u{1F1EA}\u{1F1F8}' },
		{ value: 'IT', label: 'Italy', flag: '\u{1F1EE}\u{1F1F9}' },
		{ value: 'CN', label: 'China', flag: '\u{1F1E8}\u{1F1F3}' },
		{ value: 'BR', label: 'Brazil', flag: '\u{1F1E7}\u{1F1F7}' },
		{ value: 'CA', label: 'Canada', flag: '\u{1F1E8}\u{1F1E6}' },
		{ value: 'AU', label: 'Australia', flag: '\u{1F1E6}\u{1F1FA}' },
		{ value: 'MX', label: 'Mexico', flag: '\u{1F1F2}\u{1F1FD}' },
		{ value: 'TR', label: 'Turkey', flag: '\u{1F1F9}\u{1F1F7}' },
		{ value: 'TH', label: 'Thailand', flag: '\u{1F1F9}\u{1F1ED}' },
		{ value: 'SE', label: 'Sweden', flag: '\u{1F1F8}\u{1F1EA}' },
		{ value: 'NL', label: 'Netherlands', flag: '\u{1F1F3}\u{1F1F1}' },
		{ value: 'DK', label: 'Denmark', flag: '\u{1F1E9}\u{1F1F0}' },
		{ value: 'NO', label: 'Norway', flag: '\u{1F1F3}\u{1F1F4}' }
	];

	let languageOptions = [
		{ value: 'en', label: 'English' },
		{ value: 'ko', label: 'Korean' },
		{ value: 'ja', label: 'Japanese' },
		{ value: 'fr', label: 'French' },
		{ value: 'es', label: 'Spanish' },
		{ value: 'de', label: 'German' },
		{ value: 'hi', label: 'Hindi' },
		{ value: 'zh', label: 'Chinese' },
		{ value: 'pt', label: 'Portuguese' },
		{ value: 'it', label: 'Italian' },
		{ value: 'sv', label: 'Swedish' },
		{ value: 'nl', label: 'Dutch' },
		{ value: 'da', label: 'Danish' },
		{ value: 'no', label: 'Norwegian' },
		{ value: 'tr', label: 'Turkish' },
		{ value: 'th', label: 'Thai' },
		{ value: 'pl', label: 'Polish' },
		{ value: 'ru', label: 'Russian' }
	];

	const regionLanguages: Record<string, string[]> = {
		anime: ['ja']
	};

	let regionOptions = [{ value: 'anime', label: 'Anime', flag: '\u{1F34E}' }];

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
		selectedGenres.length > 0 ||
			yearRange[0] !== defaultYearRange[0] ||
			yearRange[1] !== defaultYearRange[1] ||
			minRating !== '' ||
			sortBy !== 'popularity.desc' ||
			country !== '' ||
			language !== '' ||
			region !== ''
	);

	// async function fetchPage(page: number) {
	// 	const opts = {
	// 		query: q.length >= 2 ? q : undefined,
	// 		genreIds: selectedGenres,
	// 		page,
	// 		year: year || undefined,
	// 		rating: minRating || undefined,
	// 		sortBy: hasFilters ? sortBy : undefined
	// 	};

	// 	const useDiscover = hasFilters || mediaFilter !== 'all' || q.length >= 2;
	// 	if (useDiscover) {
	// 		const fetchMovie = mediaFilter === 'tv' ? null : tmdb.discover.movies(opts);
	// 		const fetchTv = mediaFilter === 'movie' ? null : tmdb.discover.tv(opts);

	// 		const [movies, tvShows] = await Promise.all([
	// 			fetchMovie ?? Promise.resolve({ results: [], total_pages: 0, page: 1, total_results: 0 }),
	// 			fetchTv ?? Promise.resolve({ results: [], total_pages: 0, page: 1, total_results: 0 })
	// 		]);

	// 		const combined = [...(movies as any).results, ...(tvShows as any).results].sort(
	// 			(a: any, b: any) => b.popularity - a.popularity
	// 		);
	// 		return { results: combined, total_pages: Math.max(movies.total_pages, tvShows.total_pages) };
	// 	}

	// 	const res = await tmdb.trending.all('week');
	// 	return { results: res.results, total_pages: res.total_pages };
	// }

	async function fetchPage(page: number) {
		const langs = region ? regionLanguages[region] : language ? [language] : undefined;
		const yearChanged =
			yearRange[0] !== defaultYearRange[0] || yearRange[1] !== defaultYearRange[1];

		const opts = {
			query: q.length >= 2 ? q : undefined,
			genreIds: selectedGenres,
			page,
			yearRange: (yearChanged ? yearRange : undefined) as [number, number] | undefined,
			rating: minRating || undefined,
			sortBy: hasFilters ? sortBy : undefined,
			country: country || undefined,
			language: langs && langs.length === 1 ? langs[0] : !langs ? language || undefined : undefined,
			languages: langs && langs.length > 1 ? langs : undefined
		};

		const useDiscover = hasFilters || mediaFilter !== 'all' || q.length >= 2;
		if (useDiscover) {
			if (opts.languages && opts.languages.length > 1) {
				const perLang = await Promise.all(
					opts.languages.map((lang) => {
						const langOpts = { ...opts, languages: undefined, language: lang };
						return Promise.all([
							mediaFilter !== 'tv'
								? tmdb.discover.movies(langOpts)
								: Promise.resolve({ results: [], total_pages: 0, total_results: 0 }),
							mediaFilter !== 'movie'
								? tmdb.discover.tv(langOpts)
								: Promise.resolve({ results: [], total_pages: 0, total_results: 0 })
						]);
					})
				);

				const allMovies: any[] = [];
				const allTv: any[] = [];
				let maxPages = 0;
				let totalResultsCount = 0;

				for (const [movies, tvShows] of perLang) {
					allMovies.push(...(movies as any).results.map((m: any) => ({ ...m, media_type: 'movie' })));
					allTv.push(...(tvShows as any).results.map((t: any) => ({ ...t, media_type: 'tv' })));
					maxPages = Math.max(maxPages, (movies as any).total_pages, (tvShows as any).total_pages);
					totalResultsCount += (movies as any).total_results + (tvShows as any).total_results;
				}

				const combined = [...allMovies, ...allTv]
					.sort((a: any, b: any) => b.popularity - a.popularity)
					.slice(0, 20);

				return { results: combined, total_pages: maxPages, total_results: totalResultsCount };
			}

			const fetchMovie = mediaFilter === 'tv' ? null : tmdb.discover.movies(opts);
			const fetchTv = mediaFilter === 'movie' ? null : tmdb.discover.tv(opts);

			const [movies, tvShows] = await Promise.all([
				fetchMovie ?? Promise.resolve({ results: [], total_pages: 0, page: 1, total_results: 0 }),
				fetchTv ?? Promise.resolve({ results: [], total_pages: 0, page: 1, total_results: 0 })
			]);

			const taggedMovies = (movies as any).results.map((m: any) => ({ ...m, media_type: 'movie' }));
			const taggedTv = (tvShows as any).results.map((t: any) => ({ ...t, media_type: 'tv' }));

			const combined = [...taggedMovies, ...taggedTv].sort(
				(a: any, b: any) => b.popularity - a.popularity
			);
			return {
				results: combined,
				total_pages: Math.max(movies.total_pages, tvShows.total_pages),
				total_results: (movies as any).total_results + (tvShows as any).total_results
			};
		}

		const res = await tmdb.trending.all('week', page);
		return { results: res.results, total_pages: res.total_pages, total_results: res.total_results };
	}

	$effect(() => {
		const term = submittedQuery;
		const genreFilter = selectedGenres;
		const filter = mediaFilter;
		const y = `${yearRange[0]}-${yearRange[1]}`;
		const rating = minRating;
		const sort = sortBy;
		const c = country;
		const l = language;
		const r = region;

		loading = true;
		error = '';
		results = [];
		totalPages = 0;
		totalResults = 0;
		currentPage = 0;

		const timer = setTimeout(async () => {
			try {
				if (term.length >= 2) {
					searchHistory.add(term);
				}
				const res = await fetchPage(1);
				results = res.results;
				totalPages = res.total_pages;
				totalResults = res.total_results;
				currentPage = 1;
			} catch (e) {
				error = e instanceof Error ? e.message : 'Search failed';
			} finally {
				loading = false;
			}
		}, 300);

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
	// 		const res = await fetchPage(nextPage);
	// 		results = [...results, ...res.results];
	// 		totalPages = res.total_pages;
	// 	} finally {
	// 		loadingMore = false;
	// 	}
	// }

	async function loadMore() {
		if (loadingMore || totalPages === 0 || results.length === 0) return;
		const nextPage = currentPage + 1;
		if (nextPage > totalPages) return;
		loadingMore = true;
		try {
			const res = await fetchPage(nextPage);

			const seen = new Set(results.map((r: any) => `${r.media_type}-${r.id}`));
			const deduped = res.results.filter((r: any) => !seen.has(`${r.media_type}-${r.id}`));

			results = [...results, ...deduped];
			totalPages = res.total_pages;
			currentPage = nextPage;
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
		submittedQuery = term;
		showHistory = false;
		suggestions = [];
		searchInput?.blur();
	}

	function navigateToSuggestion(item: AutocompleteItem) {
		suggestions = [];
		showHistory = false;
		searchInput?.blur();
		if (item.media_type === 'movie') {
			goto(`/movie/${item.id}`);
		} else {
			goto(`/tv/${item.id}`);
		}
	}

	function clearAllFilters() {
		selectedGenres = [];
		yearRange = [...defaultYearRange];
		yearPickerKey++;
		minRating = '';
		sortBy = 'popularity.desc';
		country = '';
		language = '';
		region = '';
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

	onMount(() => {
		appSettings.load();
		mediaFilter = appSettings.defaultMediaFilter;
		sortBy = appSettings.defaultSortBy;
	});

	let autocompleteTimer: ReturnType<typeof setTimeout> | null = null;

	function fetchSuggestions() {
		const query = q.trim();
		if (autocompleteTimer) clearTimeout(autocompleteTimer);

		if (query.length < 2) {
			suggestions = [];
			suggestionsLoading = false;
			return;
		}

		suggestionsLoading = true;
		autocompleteTimer = setTimeout(async () => {
			try {
				const res = await tmdb.search.multi(query, 1);
				suggestions = res.results.slice(0, 6).map((item) => ({
					id: item.id,
					media_type: item.media_type as 'movie' | 'tv',
					title: item.media_type === 'movie' ? (item as any).title : (item as any).name,
					year:
						(item.media_type === 'movie'
							? (item as any).release_date
							: (item as any).first_air_date
						)?.slice(0, 4) ?? '',
					poster: item.poster_path,
					rating: item.vote_average
				}));
			} catch {
				suggestions = [];
			} finally {
				suggestionsLoading = false;
			}
		}, 300);
	}
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
					bind:this={searchInput}
					bind:value={q}
					oninput={fetchSuggestions}
					onfocus={() => {
						searchFocused = true;
						showHistory = true;
						if (q.trim().length >= 2) fetchSuggestions();
					}}
					onblur={() =>
						setTimeout(() => {
							searchFocused = false;
							showHistory = false;
							suggestions = [];
						}, 200)}
					onkeydown={(e) => {
						if (e.key === 'Enter') {
							submittedQuery = q;
							showHistory = false;
							searchInput?.blur();
						}
					}}
					placeholder="Search movies & TV..."
					class="w-full rounded-2xl border border-fg/10 bg-surface-800 py-3.5 pr-4 pl-11 text-sm text-fg placeholder-neutral-500 transition-all duration-300 outline-none focus:border-gold-500/50 focus:bg-surface-700 focus:ring-2 focus:ring-gold-500/20"
				/>

				{#if showDropdown}
					<div
						class="absolute top-full right-0 left-0 z-50 mt-2 overflow-hidden rounded-2xl border border-fg/10 bg-surface-800 shadow-2xl shadow-black/50 backdrop-blur-xl"
					>
						<!-- Recent Searches -->
						{#if hasHistory && !q.trim()}
							<div class="flex items-center justify-between border-b border-fg/10 px-4 py-2.5">
								<span class="text-xs font-medium text-neutral-500">Recent Searches</span>
								<button
									onmousedown={(e) => e.preventDefault()}
									onclick={() => {
										searchHistory.clear();
										showHistory = false;
									}}
									class="text-xs text-gold-400 hover:text-gold-300"
								>
									Clear
								</button>
							</div>
							{#each searchHistory.items as item (item.query + item.timestamp)}
								<div
									onmousedown={(e) => e.preventDefault()}
									onclick={() => submitSearch(item.query)}
									onkeydown={(e) => e.key === 'Enter' && submitSearch(item.query)}
									role="button"
									tabindex="0"
									class="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left text-sm text-neutral-300 transition-all hover:bg-fg/5 hover:text-fg"
								>
									<MagnifyingGlassIcon class="h-3.5 w-3.5 shrink-0 text-neutral-500" />
									<span class="truncate">{item.query}</span>
									<button
										onmousedown={(e) => e.preventDefault()}
										onclick={(e) => {
											e.stopPropagation();
											searchHistory.remove(item.query);
										}}
										class="ml-auto shrink-0 rounded-md p-1.5 text-neutral-500 hover:bg-fg/10 hover:text-fg"
									>
										<XIcon class="h-3.5 w-3.5" />
									</button>
								</div>
							{/each}
						{/if}

						<!-- TMDB Suggestions -->
						{#if suggestionsLoading}
							<div class="flex items-center gap-3 px-4 py-3">
								<div
									class="h-3.5 w-3.5 animate-spin rounded-full border-2 border-gold-500/30 border-t-gold-500"
								></div>
								<span class="text-xs text-neutral-500">Searching...</span>
							</div>
						{:else if suggestions.length > 0}
							<div class="border-t border-fg/5 px-4 py-2.5">
								<span class="text-xs font-medium text-neutral-500">
									{q.trim() ? 'Suggestions' : 'Popular'}
								</span>
							</div>
							{#each suggestions as item (item.media_type + '-' + item.id)}
								<button
									onmousedown={(e) => e.preventDefault()}
									onclick={() => navigateToSuggestion(item)}
									class="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-all hover:bg-fg/5"
								>
									{#if item.poster}
										<img
											src={tmdb.image.poster(item.poster, 'w92')}
											alt=""
											class="h-11 w-8 shrink-0 rounded-md object-cover"
											loading="lazy"
										/>
									{:else}
										<div class="h-11 w-8 shrink-0 rounded-md bg-surface-700"></div>
									{/if}
									<div class="min-w-0 flex-1">
										<p class="truncate text-sm font-medium text-fg">{item.title}</p>
										<div class="flex items-center gap-2">
											<span class="text-[11px] text-neutral-500">
												{item.media_type === 'movie' ? 'Movie' : 'TV'}
												{#if item.year}
													&middot; {item.year}
												{/if}
											</span>
											{#if item.rating > 0}
												<span class="text-[11px] text-gold-400">{item.rating.toFixed(1)}</span>
											{/if}
										</div>
									</div>
								</button>
							{/each}
						{/if}
					</div>
				{/if}
			</div>
		</div>

		<!-- Filters -->
		<div class="space-y-2">
			<!-- Row 1: Controls -->
			<div class="flex items-center gap-2 overflow-x-auto pb-1" style="scrollbar-width: none;">
				<!-- Media Type -->
				<div class="flex shrink-0 rounded-xl border border-fg/10 bg-surface-800 p-0.5">
					<button
						onclick={() => (mediaFilter = 'all')}
						class={cn(
							'rounded-lg px-3 py-1.5 text-xs font-medium transition-all',
							mediaFilter === 'all'
								? 'bg-gold-500/20 text-gold-400'
								: 'text-neutral-400 hover:text-fg'
						)}>All</button
					>
					<button
						onclick={() => (mediaFilter = 'movie')}
						class={cn(
							'rounded-lg px-3 py-1.5 text-xs font-medium transition-all',
							mediaFilter === 'movie'
								? 'bg-gold-500/20 text-gold-400'
								: 'text-neutral-400 hover:text-fg'
						)}>Movies</button
					>
					<button
						onclick={() => (mediaFilter = 'tv')}
						class={cn(
							'rounded-lg px-3 py-1.5 text-xs font-medium transition-all',
							mediaFilter === 'tv'
								? 'bg-gold-500/20 text-gold-400'
								: 'text-neutral-400 hover:text-fg'
						)}>TV</button
					>
				</div>

				<div class="h-5 w-px shrink-0 bg-fg/10"></div>

				<!-- Year Range Filter -->
				<div class="shrink-0">
					<button
						onclick={toggleYearPicker}
						class={cn(
							'flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs transition-all outline-none',
							showYearPicker ||
								yearRange[0] !== defaultYearRange[0] ||
								yearRange[1] !== defaultYearRange[1]
								? 'border-gold-500/30 bg-gold-500/10 text-gold-400 ring-1 ring-gold-500/30'
								: 'border-fg/10 bg-surface-800 text-fg hover:border-gold-500/30'
						)}
					>
						<CalendarIcon class="h-3.5 w-3.5" />
						{yearRange[0]} – {yearRange[1]}
					</button>
					{#if showYearPicker}
						<!-- svelte-ignore a11y_no_static_element_interactions -->
						<!-- svelte-ignore a11y_click_events_have_key_events -->
						<div class="fixed inset-0 z-40" onclick={() => (showYearPicker = false)}></div>
						<div
							class="fixed z-50 w-64 rounded-xl border border-fg/10 bg-surface-800 p-4 shadow-2xl shadow-black/50"
							style="top: {yearPickerPos.top}px; left: {yearPickerPos.left}px"
						>
							<div class="mb-3 flex items-center justify-between">
								<span class="text-xs font-semibold text-neutral-400">Year Range</span>
								{#if yearRange[0] !== defaultYearRange[0] || yearRange[1] !== defaultYearRange[1]}
									<button
										onclick={() => {
											yearRange = [...defaultYearRange];
											yearPickerKey++;
										}}
										class="flex items-center gap-1 text-xs text-gold-400 transition-all hover:text-gold-300"
									>
										<ArrowCounterClockwiseIcon class="h-3 w-3" />
										Reset
									</button>
								{/if}
							</div>
							{#key yearPickerKey}
								<YearRangeSelector
									minYear={1900}
									maxYear={currentYear}
									value={[...yearRange]}
									onChange={(v) => (yearRange = v)}
								/>
							{/key}
						</div>
					{/if}
				</div>

				<!-- Rating Filter -->
				<select
					bind:value={minRating}
					class="shrink-0 rounded-lg border border-fg/10 bg-surface-800 px-3 py-1.5 text-xs text-fg transition-all outline-none focus:border-gold-500/30 focus:ring-1 focus:ring-gold-500/30"
				>
					<option value="" class="bg-surface-900">Min Rating</option>
					<option value="7" class="bg-surface-900">7+</option>
					<option value="6" class="bg-surface-900">6+</option>
					<option value="5" class="bg-surface-900">5+</option>
				</select>

				<!-- Country Filter -->
				<select
					bind:value={country}
					class="shrink-0 rounded-lg border border-fg/10 bg-surface-800 px-3 py-1.5 text-xs text-fg transition-all outline-none focus:border-gold-500/30 focus:ring-1 focus:ring-gold-500/30"
				>
					<option value="" class="bg-surface-900">Country</option>
					{#each countryOptions as opt (opt.value)}
						<option value={opt.value} class="bg-surface-900">{opt.flag} {opt.label}</option>
					{/each}
				</select>

				<!-- Language Filter -->
				<select
					bind:value={language}
					disabled={region !== ''}
					class="shrink-0 rounded-lg border border-fg/10 bg-surface-800 px-3 py-1.5 text-xs text-fg transition-all outline-none focus:border-gold-500/30 focus:ring-1 focus:ring-gold-500/30 disabled:cursor-not-allowed disabled:opacity-40"
				>
					<option value="" class="bg-surface-900">Language</option>
					{#each languageOptions as opt (opt.value)}
						<option value={opt.value} class="bg-surface-900">{opt.label}</option>
					{/each}
				</select>

				<!-- Sort By -->
				<div class="relative shrink-0">
					<select
						bind:value={sortBy}
						class="appearance-none rounded-lg border border-fg/10 bg-surface-800 py-1.5 pr-7 pl-3 text-xs text-fg transition-all outline-none focus:border-gold-500/30 focus:ring-1 focus:ring-gold-500/30"
					>
						{#each sortOptions as opt (opt.value)}
							<option value={opt.value} class="bg-surface-900">{opt.label}</option>
						{/each}
					</select>
					<CaretDownIcon
						class="pointer-events-none absolute top-1/2 right-2 h-3 w-3 -translate-y-1/2 text-neutral-500"
					/>
				</div>

				<!-- Clear All Filters -->
				{#if hasFilters}
					<button
						onclick={clearAllFilters}
						class="flex shrink-0 items-center gap-1 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs text-red-400 transition-all hover:bg-red-500/20 hover:text-red-300"
					>
						<XIcon class="h-3 w-3" />
						Clear
					</button>
				{/if}
			</div>

			<!-- Row 2: Genre Chips + Region Presets -->
			<div class="flex items-center gap-2 overflow-x-auto pb-1" style="scrollbar-width: none;">
				<!-- Region Presets -->
				{#each regionOptions as opt (opt.value)}
					<button
						onclick={() => {
							region = region === opt.value ? '' : opt.value;
							language = '';
						}}
						class={cn(
							'shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-all',
							region === opt.value
								? 'bg-gold-500/20 text-gold-400 ring-1 ring-gold-500/30'
								: 'bg-surface-800 text-neutral-400 hover:bg-surface-700 hover:text-fg'
						)}
					>
						{opt.flag} {opt.label}
					</button>
				{/each}

				<div class="h-5 w-px shrink-0 bg-fg/10"></div>

				<!-- Genre Chips -->
				{#if genres.data}
					{#each genres.data as genre (genre.id)}
						<button
							onclick={() => toggleGenre(genre.id)}
							class={cn(
								'shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-all',
								selectedGenres.includes(genre.id)
									? 'bg-gold-500/20 text-gold-400 ring-1 ring-gold-500/30'
									: 'bg-surface-800 text-neutral-400 hover:bg-surface-700 hover:text-fg'
							)}
						>
							{genre.name}
						</button>
					{/each}
				{/if}
			</div>
		</div>
	</div>

	<!-- Results Count -->
	{#if !loading && totalResults > 0}
		<p class="px-4 text-xs text-neutral-500 md:px-8">{totalResults.toLocaleString()} results</p>
	{/if}

	<!-- Results -->
	{#if error}
		<div class="flex flex-col items-center gap-2 px-4 py-16 text-center">
			<p class="text-sm text-red-400">{error}</p>
		</div>
	{:else if loading}
		<div class="space-y-4 px-4 md:px-8">
			<div
				class="grid grid-cols-2 gap-3 gap-y-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
			>
				<SkeletonTile count={appSettings.itemsPerPage} />
			</div>
		</div>
	{:else if filtered.length > 0}
		<div class="space-y-4 px-4 md:px-8">
			<div
				class="grid grid-cols-2 gap-3 gap-y-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
			>
				{#each filtered as item (item.media_type + '-' + item.id)}
					<div class="animate-fade-up" style="animation-delay: {filtered.indexOf(item) * 20}ms">
						<Tile media={item} />
					</div>
				{/each}
				{#if loadingMore}
					<SkeletonTile count={6} />
				{/if}
			</div>
		</div>

		<!-- Infinite Scroll Sentinel -->
		{#if totalPages > 1}
			<div bind:this={sentinel} class="h-1"></div>
		{/if}
	{:else}
		<div class="flex flex-col items-center gap-2 px-4 py-16 text-center">
			<p class="text-sm text-neutral-500">No results found</p>
			<p class="text-xs text-neutral-600">Try adjusting your filters or search term</p>
		</div>
	{/if}
</div>
