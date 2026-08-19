<script lang="ts">
	import { tmdb } from '$lib/api/tmdb';
	import type { TmdbCollection, TmdbCollectionSummary } from '$lib/types/tmdb.d';
	import CollectionCard from '$lib/components/CollectionCard.svelte';

	import MagnifyingGlassIcon from 'phosphor-svelte/lib/MagnifyingGlassIcon';
	import SpinnerIcon from 'phosphor-svelte/lib/SpinnerIcon';

	import { cn } from '$lib/cn';
	import { onMount } from 'svelte';

	type DisplayCollection =
		| (TmdbCollection & { parts_count?: number })
		| (TmdbCollectionSummary & { parts_count?: number });

	const CURATED_COLLECTION_IDS = [
		10, // Star Wars
		119, // LOTR
		1241, // Harry Potter
		230, // The Godfather
		263, // The Dark Knight
		328, // Jurassic Park
		645, // James Bond
		8091, // Alien
		86311, // Avengers
		87359, // Mission Impossible
		9485, // Fast & Furious
		404609, // John Wick
		8650, // Transformers
		89137, // Thor
		131635, // Hunger Games
		556, // Spider-Man Raimi
		531241, // Spider-Verse
		529892, // Black Panther
		623911, // Knives Out
		295, // Pirates of the Caribbean
		84, // Indiana Jones
		8732, // X-Men
		448150, // Deadpool
		528, // Terminator
		420, // Chronicles of Narnia
		9888, // Planet of the Apes
		748, // Shrek
		10194, // Toy Story
		135416, // Conjuring
		1575, // Rocky
		9432, // Saw
		256322, // LEGO
		115570, // National Treasure
		107158, // Hobbit
		89151, // Superman
		86066, // Despicable Me
		125570, // 300
		2344, // Matrix
		8354, // Ice Age
		9735 // Friday the 13th
	];

	let q = $state('');
	let sort = $state<'popular' | 'az' | 'films'>('popular');

	let collections = $state<TmdbCollection[]>([]);
	let searchResults = $state<TmdbCollectionSummary[]>([]);

	let loading = $state(true);
	let searching = $state(false);
	let error = $state('');
	const BATCH_SIZE = 10;

	let usingSearch = $derived(q.trim().length >= 2);

	let sourceCollections = $derived(usingSearch ? searchResults : collections);

	let filtered = $derived.by(() => {
		let items = [...sourceCollections] as DisplayCollection[];

		if (sort === 'az') {
			items.sort((a, b) => a.name.localeCompare(b.name));
		}

		if (sort === 'films') {
			items.sort(
				(a, b) =>
					((b as TmdbCollection).parts?.length ?? b.parts_count ?? 0) -
					((a as TmdbCollection).parts?.length ?? a.parts_count ?? 0)
			);
		}

		return items;
	});

	async function loadCuratedCollections() {
		loading = true;
		error = '';
		collections = [];

		try {
			for (let i = 0; i < CURATED_COLLECTION_IDS.length; i += BATCH_SIZE) {
				const batch = CURATED_COLLECTION_IDS.slice(i, i + BATCH_SIZE);

				const res = await Promise.allSettled(batch.map((id) => tmdb.movie.collection(id)));

				const valid = res
					.filter((r): r is PromiseFulfilledResult<TmdbCollection> => r.status === 'fulfilled')
					.map((r) => r.value)
					.filter((c) => c.poster_path);

				collections = [...collections, ...valid];
			}
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to load collections';
		} finally {
			loading = false;
		}
	}

	async function hydrateCollections(items: TmdbCollectionSummary[]) {
		const batch = items.slice(0, 20);

		const full = await Promise.allSettled(batch.map((c) => tmdb.movie.collection(c.id)));

		const map = new Map();

		for (const r of full) {
			if (r.status === 'fulfilled') {
				map.set(r.value.id, r.value);
			}
		}

		return items.map((item) => map.get(item.id) ?? item);
	}

	onMount(() => {
		loadCuratedCollections();
	});

	$effect(() => {
		const term = q.trim();

		if (term.length < 2) {
			searchResults = [];
			searching = false;
			return;
		}

		searching = true;

		const timer = setTimeout(async () => {
			try {
				const res = await tmdb.collection.search(term);

				const hydrated = await hydrateCollections(res.results);

				searchResults = hydrated;
			} catch (e) {
				console.error(e);
			} finally {
				searching = false;
			}
		}, 300);

		return () => clearTimeout(timer);
	});
</script>

<div class="mx-auto max-w-7xl space-y-6 pt-24 pb-12">
	<div class="z-40 space-y-4 bg-surface-950 px-4 py-8">
		<!-- Search -->
		<div>
			<div class="relative flex-1">
				<MagnifyingGlassIcon
					class="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-neutral-500"
				/>

				<input
					bind:value={q}
					placeholder="Search collections..."
					class="w-full rounded-2xl border border-white/10 bg-surface-800 py-3.5 pr-4 pl-11 text-sm text-white placeholder-neutral-500 transition-all duration-300 outline-none focus:border-gold-500/50 focus:bg-surface-700 focus:ring-2 focus:ring-gold-500/20"
				/>
			</div>
		</div>

		<!-- Sort Row -->
		<div>
			<div class="flex items-center gap-2 overflow-x-auto pb-2" style="scrollbar-width: none;">
				<button
					onclick={() => (sort = 'popular')}
					class={cn(
						'shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-all',
						sort === 'popular'
							? 'bg-gold-500/20 text-gold-400 ring-1 ring-gold-500/30'
							: 'bg-surface-800 text-neutral-400 hover:bg-surface-700 hover:text-white'
					)}
				>
					Popular
				</button>

				<button
					onclick={() => (sort = 'az')}
					class={cn(
						'shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-all',
						sort === 'az'
							? 'bg-gold-500/20 text-gold-400 ring-1 ring-gold-500/30'
							: 'bg-surface-800 text-neutral-400 hover:bg-surface-700 hover:text-white'
					)}
				>
					A–Z
				</button>

				<button
					onclick={() => (sort = 'films')}
					class={cn(
						'shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-all',
						sort === 'films'
							? 'bg-gold-500/20 text-gold-400 ring-1 ring-gold-500/30'
							: 'bg-surface-800 text-neutral-400 hover:bg-surface-700 hover:text-white'
					)}
				>
					Most Films
				</button>
			</div>
		</div>
	</div>

	<!-- Loading -->
	{#if (loading && collections.length === 0) || searching}
		<div class="flex items-center justify-center px-4 py-16">
			<SpinnerIcon class="h-6 w-6 animate-spin text-gold-500" />
		</div>

		<!-- Error -->
	{:else if error}
		<div class="flex flex-col items-center gap-2 px-4 py-16 text-center">
			<p class="text-sm text-red-400">{error}</p>
		</div>

		<!-- Results -->
	{:else if filtered.length > 0}
		<div class="space-y-4 px-4 md:px-8">
			<div class="grid grid-cols-2 gap-3 gap-y-5 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
				{#each filtered as collection (collection.id)}
					<div
						class="animate-fade-up"
						style="animation-delay: {filtered.indexOf(collection) * 20}ms"
					>
						<CollectionCard
							collection={{
								...collection,
								parts_count:
									'parts' in collection ? collection.parts.length : collection.parts_count
							}}
						/>
					</div>
				{/each}
			</div>
		</div>

		<!-- Empty -->
	{:else}
		<div class="flex flex-col items-center gap-2 px-4 py-16 text-center">
			<p class="text-sm text-neutral-500">
				{usingSearch ? 'No collections found' : 'No collections available'}
			</p>

			<p class="text-xs text-neutral-600">Try a different search term</p>
		</div>
	{/if}
</div>
