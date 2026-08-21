<script lang="ts">
	import { tmdb } from '$lib/api/tmdb';
	import type { TmdbMovie, TmdbTvShow, TmdbGenre } from '$lib/types/tmdb.d';
	import StarIcon from 'phosphor-svelte/lib/StarIcon';
	import PlayCircleIcon from 'phosphor-svelte/lib/PlayCircleIcon';
	import SpinnerIcon from 'phosphor-svelte/lib/SpinnerIcon';
	import ArrowClockwiseIcon from 'phosphor-svelte/lib/ArrowClockwiseIcon';
	import DiceFiveIcon from 'phosphor-svelte/lib/DiceFiveIcon';
	import FilmSlateIcon from 'phosphor-svelte/lib/FilmSlateIcon';
	import XIcon from 'phosphor-svelte/lib/XIcon';
	import YearRangeSelector from '$lib/components/YearRangeSelector.svelte';
	import { onMount, onDestroy } from 'svelte';
	import { scale } from 'svelte/transition';
	import { backOut, cubicIn } from 'svelte/easing';

	let genres = $state<{ movie: TmdbGenre[]; tv: TmdbGenre[] }>({ movie: [], tv: [] });
	let selectedGenres = $state<number[]>([]);
	let minRating = $state(0);
	let yearStart = $state(1990);
	let yearEnd = $state(new Date().getFullYear());
	let spinning = $state(false);
	let result = $state<(TmdbMovie | TmdbTvShow) | null>(null);
	let spinCycleItems = $state<(TmdbMovie | TmdbTvShow)[]>([]);
	let isCycling = $state(false);
	let hasResult = $state(false);
	let mounted = $state(false);

	type Card = { id: number; item: TmdbMovie | TmdbTvShow; x: number; y: number; rot: number };

	// Cards are spawned and despawned independently — each one mounts, bounces in,
	// holds briefly, then bounces out and is gone for good (no repositioning/reuse).
	let cards = $state<Card[]>([]);
	let cardSeq = 0;

	const ratings = [0, 5, 6, 7, 8];
	const currentYear = new Date().getFullYear();

	// --- timer bookkeeping so a re-spin / unmount can't leave stray callbacks touching stale state ---
	let timeoutIds: ReturnType<typeof setTimeout>[] = [];
	function schedule(fn: () => void, delay: number) {
		const id = setTimeout(fn, delay);
		timeoutIds.push(id);
		return id;
	}
	function clearAllTimers() {
		timeoutIds.forEach(clearTimeout);
		timeoutIds = [];
	}
	onDestroy(clearAllTimers);

	function easeOutCubic(t: number) {
		return 1 - Math.pow(1 - t, 3);
	}

	onMount(async () => {
		mounted = true;
		const [movieGenres, tvGenres] = await Promise.all([tmdb.genre.movie(), tmdb.genre.tv()]);
		genres = { movie: movieGenres.genres, tv: tvGenres.genres };
	});

	function toggleGenre(id: number) {
		if (selectedGenres.includes(id)) {
			selectedGenres = selectedGenres.filter((g) => g !== id);
		} else if (selectedGenres.length < 3) {
			selectedGenres = [...selectedGenres, id];
		}
	}

	function getTitle(item: TmdbMovie | TmdbTvShow): string {
		return 'title' in item ? item.title : item.name;
	}

	function getYear(item: TmdbMovie | TmdbTvShow): string {
		if ('release_date' in item) return item.release_date?.slice(0, 4) ?? '';
		return item.first_air_date?.slice(0, 4) ?? '';
	}

	function getLink(item: TmdbMovie | TmdbTvShow): string {
		return `/${item.media_type}/${item.id}`;
	}

	async function spin() {
		if (spinning || selectedGenres.length === 0) return;
		spinning = true;
		result = null;
		hasResult = false;
		isCycling = true;
		clearAllTimers();

		try {
			const [moviePage, tvPage] = await Promise.all([
				tmdb.discover.movies({
					genreIds: selectedGenres,
					rating: minRating > 0 ? minRating : undefined,
					sortBy: 'popularity.desc'
				}),
				tmdb.discover.tv({
					genreIds: selectedGenres,
					rating: minRating > 0 ? minRating : undefined,
					sortBy: 'popularity.desc'
				})
			]);

			const all = [...moviePage.results, ...tvPage.results].filter((item) => {
				if (!item.poster_path || item.vote_count <= 50) return false;
				const year = Number(getYear(item));
				if (year && (year < yearStart || year > yearEnd)) return false;
				return true;
			});

			if (all.length === 0) {
				isCycling = false;
				spinning = false;
				return;
			}

			const shuffled = all.sort(() => Math.random() - 0.5);
			spinCycleItems = shuffled;
			const winner = shuffled[0];

			cards = [];

			// Eased deceleration instead of a flat linear ramp — spawns come fast/chaotic
			// at first, then settle into a slow, readable crawl right before the reveal.
			const minInterval = 90;
			const maxInterval = 480;
			const holdTime = 480; // how long a card stays on screen before it bounces away
			const maxCycles = 22;

			await new Promise<void>((resolve) => {
				let cycleCount = 0;

				const spawn = () => {
					const progress = cycleCount / maxCycles;
					const interval = minInterval + (maxInterval - minInterval) * easeOutCubic(progress);

					const item = shuffled[cycleCount % shuffled.length];
					const id = cardSeq++;
					const x = (Math.random() - 0.5) * 70;
					const y = (Math.random() - 0.5) * 60;
					const rot = (Math.random() - 0.5) * 12;

					cards = [...cards, { id, item, x, y, rot }];

					// each card despawns on its own timer — never repositioned, just gone
					const hold = Math.max(220, Math.min(holdTime, interval * 1.4));
					schedule(() => {
						cards = cards.filter((c) => c.id !== id);
					}, hold);

					cycleCount++;

					if (cycleCount < maxCycles) {
						schedule(spawn, interval);
					} else {
						// let the last filler cards clear, hold a beat, then the winner
						// alone bounces in center-stage
						schedule(() => {
							cards = [];
							schedule(() => {
								cards = [{ id: cardSeq++, item: winner, x: 0, y: 0, rot: 0 }];
								schedule(() => {
									result = winner;
									isCycling = false;
									hasResult = true;
									cards = [];
									resolve();
								}, 650);
							}, 260);
						}, holdTime * 0.6);
					}
				};

				spawn();
			});
		} catch {
			isCycling = false;
		} finally {
			spinning = false;
		}
	}

	function changePreferences() {
		hasResult = false;
		result = null;
		isCycling = false;
		cards = [];
	}
</script>

<svelte:head>
	<title>Movie Night Wheel - Moviemania</title>
</svelte:head>

<main class="mx-auto max-w-7xl px-4 pt-16 pb-24 md:pt-24">
	{#if mounted}
		{#if isCycling || hasResult}
			<!-- Full-screen focus mode -->
			<div class="flex min-h-[85vh] flex-col justify-center">
				{#if isCycling}
					<!-- Bouncing cards animation -->
					<div class="relative h-[70vh] w-full">
						{#each cards as card (card.id)}
							<div
								class="absolute left-1/2 top-1/2"
								style="transform: translate(calc(-50% + {card.x}vw), calc(-50% + {card.y}vh)) rotate({card.rot}deg);"
							>
								<div
									class="w-32 overflow-hidden rounded-2xl ring-1 ring-fg/10"
									in:scale={{ duration: 380, start: 0.3, opacity: 0, easing: backOut }}
									out:scale={{ duration: 200, start: 1, opacity: 0, easing: cubicIn }}
								>
									{#if card.item.poster_path}
										<img
											src={tmdb.image.poster(card.item.poster_path, 'w342')}
											alt=""
											class="h-44 w-32 object-cover"
										/>
									{:else}
										<div class="flex h-44 w-32 items-center justify-center bg-surface-800">
											<FilmSlateIcon class="h-8 w-8 text-surface-600" />
										</div>
									{/if}
									<div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
									<div class="absolute inset-x-0 bottom-0 p-2 text-center">
										<p class="truncate text-[10px] font-bold text-fg drop-shadow-lg">
											{getTitle(card.item)}
										</p>
									</div>
								</div>
							</div>
						{/each}

						<!-- Center glow -->
						<div class="pointer-events-none absolute inset-0 flex items-center justify-center">
							<div class="h-64 w-64 rounded-full bg-gold-500/5 blur-3xl"></div>
							<p class="absolute text-sm font-semibold tracking-wide text-fg/70 drop-shadow-lg">
								Finding the best match for you...
							</p>
						</div>
					</div>
				{:else if hasResult && result}
					<!-- Result card -->
					<div class="flex flex-col items-center gap-5">
						<p class="text-sm font-semibold tracking-wider text-gold-400 uppercase">
							Your fate is sealed
						</p>

						<div class="relative w-full max-w-2xs">
							<div
								class="winner-glow pointer-events-none absolute -inset-4 rounded-3xl bg-gold-500/20 blur-2xl"
							></div>

							<div
								class="winner-card aspect-2/3  relative overflow-hidden rounded-2xl bg-surface-900 shadow-2xl ring-1 ring-fg/10"
							>
								{#if result.poster_path}
									<img
										src={tmdb.image.poster(result.poster_path, 'w500')}
										alt={getTitle(result)}
										class="h-full w-full object-cover object-top"
									/>
								{:else}
									<div class="flex h-96 w-full items-center justify-center bg-surface-800">
										<FilmSlateIcon class="h-16 w-16 text-surface-600" />
									</div>
								{/if}

								<div
									class="absolute inset-0 bg-gradient-to-t from-surface-900 via-surface-900/40 to-transparent"
								></div>

								<div class="absolute inset-x-0 bottom-0 p-5">
									<h2 class="mb-2 font-display text-2xl font-bold text-fg">
										{getTitle(result)}
									</h2>
									<div class="mb-3 flex flex-wrap items-center gap-2 text-sm text-neutral-400">
										<span class="flex items-center gap-1">
											<StarIcon class="h-4 w-4 text-gold-400" weight="fill" />
											<span class="font-semibold text-gold-400">
												{result.vote_average > 0 ? result.vote_average.toFixed(1) : 'TBD'}
											</span>
										</span>
										<span>&middot;</span>
										<span>{getYear(result)}</span>
										<span>&middot;</span>
										<span class="rounded-full bg-fg/10 px-2 py-0.5 text-xs capitalize">
											{result.media_type === 'movie' ? 'Movie' : 'TV Show'}
										</span>
									</div>
									<p class="mb-4 line-clamp-3 text-xs leading-relaxed text-neutral-400">
										{result.overview}
									</p>
									<div class="flex gap-3">
										<a
											href={getLink(result)}
											class="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gold-500 px-4 py-2.5 text-sm font-bold text-black transition-all hover:bg-gold-400 active:scale-95"
										>
											<PlayCircleIcon class="h-4 w-4" weight="fill" />
											Watch
										</a>
										<button
											onclick={spin}
											disabled={spinning}
											class="flex items-center justify-center gap-2 rounded-xl border border-fg/10 bg-fg/5 px-4 py-2.5 text-sm font-medium text-fg transition-all hover:border-fg/20 hover:bg-fg/10 active:scale-95 disabled:opacity-40"
										>
											<ArrowClockwiseIcon class="h-4 w-4" />
											Spin Again
										</button>
									</div>
								</div>
							</div>
						</div>

						<!-- Change Preferences button -->
						<button
							onclick={changePreferences}
							class="flex items-center gap-1.5 rounded-full border border-fg/10 bg-fg/5 px-4 py-2 text-xs font-medium text-neutral-400 transition-all hover:border-fg/20 hover:text-fg"
						>
							<XIcon class="h-3.5 w-3.5" />
							Change Preferences
						</button>
					</div>
				{/if}
			</div>
		{:else}
			<!-- Idle mode -->
			<div class="mb-8 text-center">
				<h1 class="mb-2 font-display text-3xl font-bold text-fg md:text-4xl">
					Movie Night Wheel
				</h1>
				<p class="text-sm text-neutral-500">Can't decide what to watch? Let fate choose.</p>
			</div>

			<!-- Genre Picker -->
			<section class="mx-auto mb-5 max-w-6xl">
				<p class="mb-2.5 text-xs font-semibold tracking-wider text-neutral-500 uppercase">
					Pick 1-3 Genres
				</p>
				<div class="flex flex-wrap gap-2">
					{#each genres.movie as genre (genre.id)}
						{@const isActive = selectedGenres.includes(genre.id)}
						{@const atLimit = selectedGenres.length >= 3 && !isActive}
						<button
							onclick={() => toggleGenre(genre.id)}
							disabled={atLimit}
							class="rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all {isActive
								? 'border-gold-500/50 bg-gold-500/15 text-gold-400'
								: atLimit
									? 'cursor-not-allowed border-fg/5 bg-fg/[0.02] text-neutral-700'
									: 'border-fg/5 bg-fg/[0.02] text-neutral-400 hover:border-fg/15 hover:text-fg'}"
						>
							{genre.name}
						</button>
					{/each}
				</div>
			</section>

			<!-- Filters row -->
			<div class="mx-auto mb-8 flex items-center justify-between flex-wrap gap-6 max-w-6xl">
				<section class="grow">
					<p class="mb-2.5 text-xs font-semibold tracking-wider text-neutral-500 uppercase">
						Min Rating
					</p>
					<div class="flex flex-wrap gap-2">
						{#each ratings as r (r)}
							<button
								onclick={() => (minRating = r)}
								class="flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium transition-all {minRating ===
								r
									? 'border-gold-500/50 bg-gold-500/15 text-gold-400'
									: 'border-fg/5 bg-fg/[0.02] text-neutral-400 hover:border-fg/15 hover:text-fg'}"
							>
								{#if r > 0}
									<StarIcon class="h-3 w-3" weight="fill" />
									{r}+
								{:else}
									Any
								{/if}
							</button>
						{/each}
					</div>
				</section>

				<section class="flex-1 min-w-96">
					<p class="mb-2.5 text-xs font-semibold tracking-wider text-neutral-500 uppercase">
						Year Range
					</p>
					<YearRangeSelector
						minYear={1960}
						maxYear={currentYear}
						value={[yearStart, yearEnd]}
						onChange={(v) => { yearStart = v[0]; yearEnd = v[1]; }}
					/>
				</section>
			</div>

			<!-- Spin button -->
			<div class="flex flex-col items-center">
				<button
					onclick={spin}
					disabled={selectedGenres.length === 0}
					class="flex h-20 w-20 items-center justify-center rounded-full transition-all duration-300 active:scale-90 disabled:cursor-not-allowed disabled:opacity-30 {spinning
						? 'bg-gold-500/20 text-gold-400 ring-2 ring-gold-500/30'
						: 'bg-radial from-gold-400 to-gold-500 text-black shadow-lg shadow-gold-500/30 hover:scale-105'}"
				>
					{#if spinning}
						<SpinnerIcon class="h-8 w-8 animate-spin" weight="fill" />
					{:else}
						<DiceFiveIcon class="h-8 w-8" weight="fill" />
					{/if}
				</button>

				<p class="mt-6 text-xs text-neutral-600">Pick genres above to unlock</p>
			</div>
		{/if}
	{:else}
		<div class="flex min-h-[50vh] items-center justify-center">
			<div
				class="h-10 w-10 animate-spin rounded-full border-2 border-gold-500/30 border-t-gold-500"
			></div>
		</div>
	{/if}
</main>

<style>
	@keyframes winner-pop {
		0% {
			transform: scale(0.85);
			opacity: 0;
		}
		60% {
			transform: scale(1.04);
			opacity: 1;
		}
		100% {
			transform: scale(1);
			opacity: 1;
		}
	}
	@keyframes glow-pulse {
		0%,
		100% {
			opacity: 0.35;
			transform: scale(1);
		}
		50% {
			opacity: 0.6;
			transform: scale(1.08);
		}
	}
	.winner-card {
		animation: winner-pop 480ms cubic-bezier(0.34, 1.56, 0.64, 1);
	}
	.winner-glow {
		animation: glow-pulse 2.4s ease-in-out infinite;
	}
</style>