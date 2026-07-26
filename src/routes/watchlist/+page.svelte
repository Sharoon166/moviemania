<script lang="ts">
	import { watchlist, type SortField, type SortDir } from '$lib/services/watchlist.svelte';
	import { tmdb } from '$lib/api/tmdb';
	import {
		StarIcon,
		PlayCircleIcon,
		EyeIcon,
		EyeSlashIcon,
		TrashIcon,
		MagnifyingGlassIcon,
		CaretDownIcon,
		BookmarkIcon,
		CheckCircleIcon
	} from 'phosphor-svelte';
	import { cn } from '$lib/cn';

	let mediaType = $state<'all' | 'movie' | 'tv'>('all');
	let showWatched = $state<'all' | 'watched' | 'unwatched'>('all');
	let query = $state('');
	let sort = $state<SortField>('addedAt');
	let dir = $state<SortDir>('desc');

	let filtered = $derived(
		watchlist.filter({
			mediaType: mediaType === 'all' ? undefined : mediaType,
			watched: showWatched === 'all' ? undefined : showWatched === 'watched',
			query: query || undefined,
			sort,
			dir
		})
	);

	let itemCount = $derived(watchlist.items.length);

	const sortOptions: { value: SortField; label: string }[] = [
		{ value: 'addedAt', label: 'Date Added' },
		{ value: 'tmdbRating', label: 'Rating' },
		{ value: 'releaseYear', label: 'Year' },
		{ value: 'title', label: 'Title' },
		{ value: 'runtime', label: 'Runtime' }
	];

	function toggleWatched(id: number, mediaType: 'movie' | 'tv') {
		watchlist.toggleWatched(id, mediaType);
	}

	function remove(id: number, mediaType: 'movie' | 'tv') {
		watchlist.remove(id, mediaType);
	}

	function cycleDir() {
		dir = dir === 'asc' ? 'desc' : 'asc';
	}
</script>

<svelte:head>
	<title>Watchlist - Moviemania</title>
</svelte:head>

<div class="mx-auto max-w-7xl px-4 pt-24 pb-16 md:px-8">
	<!-- Header -->
	<div class="mb-8 flex flex-col justify-between gap-4">
		<div class="flex items-center gap-3">
			<BookmarkIcon class="h-6 w-6 text-gold-400" weight="fill" />
			<h1 class="font-display text-3xl font-bold text-white">Watchlist</h1>
			<span class="mt-1 text-sm text-neutral-500"
				>({itemCount} {itemCount === 1 ? 'item' : 'items'})</span
			>
		</div>
		<p>Everything you save is kept locally in your browser. We don't sync or store any of it on our servers.</p>
		<div class="flex items-center gap-2">
			<button
				onclick={() => {
					const b = document.getElementById('import-input');
					if (b) b.click();
				}}
				class="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-neutral-300 backdrop-blur-sm transition-all hover:border-white/20 hover:text-white"
			>
				Import
			</button>
			<button
				onclick={() => {
					const blob = new Blob([watchlist.exportJson()], { type: 'application/json' });
					const url = URL.createObjectURL(blob);
					const a = document.createElement('a');
					a.href = url;
					a.download = 'moviemania-watchlist.json';
					a.click();
					URL.revokeObjectURL(url);
				}}
				class="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-neutral-300 backdrop-blur-sm transition-all hover:border-white/20 hover:text-white"
			>
				Export
			</button>
			{#if itemCount > 0}
				<button
					onclick={() => {
						if (confirm('Clear all items?')) watchlist.clear();
					}}
					class="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2 text-xs font-medium text-red-400 backdrop-blur-sm transition-all hover:border-red-500/40"
				>
					Clear All
				</button>
			{/if}
		</div>
	</div>

	<input
		id="import-input"
		type="file"
		accept=".json"
		class="hidden"
		onchange={(e) => {
			const file = (e.target as HTMLInputElement).files?.[0];
			if (!file) return;
			const reader = new FileReader();
			reader.onload = () => {
				try {
					watchlist.importJson(reader.result as string);
				} catch {}
			};
			reader.readAsText(file);
		}}
	/>

	<!-- Filters -->
	<div class="mb-6 flex flex-col gap-3">
		<div class="relative w-full max-w-sm">
			<MagnifyingGlassIcon
				class="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-white-500"
			/>
			<input
				type="text"
				bind:value={query}
				placeholder="Search your watchlist..."
				class="w-full rounded-xl border border-white/10 bg-surface-800/80 py-2.5 pr-3 pl-10 text-sm text-white placeholder-neutral-500 backdrop-blur-sm transition-all focus:border-gold-500/40 focus:ring-1 focus:ring-gold-500/20 focus:outline-none"
			/>
		</div>

		<div
			class="flex items-center gap-2 overflow-x-auto pb-2 px-2"
			style="scrollbar-width: none;"
		>
			<button
				onclick={() => (mediaType = 'all')}
				class={cn(
					'shrink-0 rounded-xl px-3.5 py-2 text-xs font-medium transition-all',
					mediaType === 'all'
						? 'bg-gold-500/20 text-gold-400 ring-1 ring-gold-500/30'
						: 'border border-white/10 bg-white/5 text-neutral-400 hover:text-white'
				)}>All</button
			>
			<button
				onclick={() => (mediaType = 'movie')}
				class={cn(
					'shrink-0 rounded-xl px-3.5 py-2 text-xs font-medium transition-all',
					mediaType === 'movie'
						? 'bg-gold-500/20 text-gold-400 ring-1 ring-gold-500/30'
						: 'border border-white/10 bg-white/5 text-neutral-400 hover:text-white'
				)}>Movies</button
			>
			<button
				onclick={() => (mediaType = 'tv')}
				class={cn(
					'shrink-0 rounded-xl px-3.5 py-2 text-xs font-medium transition-all',
					mediaType === 'tv'
						? 'bg-gold-500/20 text-gold-400 ring-1 ring-gold-500/30'
						: 'border border-white/10 bg-white/5 text-neutral-400 hover:text-white'
				)}>TV</button
			>

			<div class="mx-1 h-6 w-px shrink-0 bg-white/10"></div>

			<button
				onclick={() => (showWatched = 'all')}
				class={cn(
					'shrink-0 rounded-xl px-3.5 py-2 text-xs font-medium transition-all',
					showWatched === 'all'
						? 'bg-gold-500/20 text-gold-400 ring-1 ring-gold-500/30'
						: 'border border-white/10 bg-white/5 text-neutral-400 hover:text-white'
				)}>All</button
			>
			<button
				onclick={() => (showWatched = 'unwatched')}
				class={cn(
					'shrink-0 flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-medium transition-all',
					showWatched === 'unwatched'
						? 'bg-gold-500/20 text-gold-400 ring-1 ring-gold-500/30'
						: 'border border-white/10 bg-white/5 text-neutral-400 hover:text-white'
				)}
			>
				<EyeSlashIcon class="h-3.5 w-3.5" />
				Unwatched
			</button>
			<button
				onclick={() => (showWatched = 'watched')}
				class={cn(
					'shrink-0 flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-medium transition-all',
					showWatched === 'watched'
						? 'bg-gold-500/20 text-gold-400 ring-1 ring-gold-500/30'
						: 'border border-white/10 bg-white/5 text-neutral-400 hover:text-white'
				)}
			>
				<EyeIcon class="h-3.5 w-3.5" />
				Watched
			</button>

			<div class="mx-1 h-6 w-px shrink-0 bg-white/10"></div>

			<button
				onclick={cycleDir}
				class="shrink-0 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-neutral-400 transition-all hover:text-white"
			>
				{dir === 'asc' ? '↑' : '↓'}
			</button>
			<div class="relative shrink-0">
				<select
					bind:value={sort}
					class="appearance-none rounded-xl border border-white/10 bg-surface-800/80 py-2 pr-8 pl-3 text-xs font-medium text-neutral-300 backdrop-blur-sm transition-all focus:border-gold-500/40 focus:outline-none"
				>
					{#each sortOptions as opt (opt.value)}
						<option value={opt.value}>{opt.label}</option>
					{/each}
				</select>
				<CaretDownIcon class="pointer-events-none absolute top-1/2 right-2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-500" />
			</div>
		</div>
	</div>

	<!-- Empty state -->
	{#if filtered.length === 0}
		<div class="flex flex-col items-center justify-center py-24 text-neutral-500">
			<BookmarkIcon class="mb-4 h-16 w-16" />
			<p class="text-lg font-medium text-neutral-400">Your watchlist is empty</p>
			<p class="mt-1 text-sm">Browse movies and TV shows to add them here</p>
		</div>
	{:else}
		<!-- Items grid -->
		<div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
			{#each filtered as item (item.id + item.mediaType)}
				<div
					class="group relative overflow-hidden rounded-xl bg-surface-800 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-black/50"
				>
					<a
						href={item.mediaType === 'movie' ? `/movie/${item.id}` : `/tv/${item.id}`}
						class="block"
					>
						<div class="aspect-2/3 w-full overflow-hidden">
							{#if item.posterPath}
								<img
									src={tmdb.image.poster(item.posterPath, 'w342')}
									alt={item.title}
									class="h-full w-full object-cover transition-all duration-500 group-hover:scale-110"
									loading="lazy"
								/>
							{:else}
								<div class="flex h-full w-full items-center justify-center bg-surface-800">
									<BookmarkIcon class="h-12 w-12 text-surface-600" />
								</div>
							{/if}
						</div>

						<div
							class="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/90 via-black/50 to-transparent p-3 pt-8"
						>
							<p class="truncate text-sm font-semibold text-white">{item.title}</p>
							<div
								class="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-neutral-400"
							>
								{#if item.tmdbRating}
									<span class="flex items-center gap-0.5">
										<StarIcon class="h-3 w-3 text-gold-400" weight="fill" />
										{item.tmdbRating.toFixed(1)}
									</span>
								{/if}
								{#if item.releaseYear}
									<span>{item.releaseYear}</span>
								{/if}
								{#if item.runtime}
									<span>{item.runtime}m</span>
								{/if}
							</div>
						</div>

						{#if item.watched}
							<div
								class="absolute top-2 left-2 flex items-center gap-1 rounded-full bg-emerald-500/80 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm"
							>
								<CheckCircleIcon class="h-3 w-3" weight="fill" />
								Watched
							</div>
						{/if}
					</a>

					<!-- Overlay actions -->
					<div
						class="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
					>
						<a
							href={item.mediaType === 'movie'
								? `/watch/movie/${item.id}`
								: `/watch/tv/${item.id}?season=1&episode=1`}
							class="flex h-9 w-9 items-center justify-center rounded-full bg-gold-500/80 text-black transition-all hover:bg-gold-400 active:scale-90"
						>
							<PlayCircleIcon class="h-4.5 w-4.5" weight="fill" />
						</a>
						<button
							onclick={(e) => {
								e.preventDefault();
								e.stopPropagation();
								toggleWatched(item.id, item.mediaType);
							}}
							class={cn(
								'flex h-9 w-9 items-center justify-center rounded-full text-white transition-all active:scale-90',
								item.watched
									? 'bg-surface-600/80 hover:bg-surface-500'
									: 'bg-emerald-500/80 hover:bg-emerald-400'
							)}
						>
							{#if item.watched}
								<EyeSlashIcon class="h-4 w-4" />
							{:else}
								<EyeIcon class="h-4 w-4" />
							{/if}
						</button>
						<button
							onclick={(e) => {
								e.preventDefault();
								e.stopPropagation();
								remove(item.id, item.mediaType);
							}}
							class="flex h-9 w-9 items-center justify-center rounded-full bg-red-500/80 text-white transition-all hover:bg-red-400 active:scale-90"
						>
							<TrashIcon class="h-4 w-4" />
						</button>
					</div>

					<!-- Tags -->
					{#if item.tags.length > 0}
						<div class="absolute bottom-12 left-2 flex flex-wrap gap-1">
							{#each item.tags as tag}
								<span
									class="rounded-full bg-black/60 px-2 py-0.5 text-[10px] text-neutral-300 backdrop-blur-sm"
									>{tag}</span
								>
							{/each}
						</div>
					{/if}
				</div>
			{/each}
		</div>
	{/if}
</div>
