<script lang="ts">
	import type { TmdbCollection, TmdbCollectionSummary } from '$lib/types/tmdb.d';

	import { tmdb } from '$lib/api/tmdb';
	import { FilmSlateIcon } from 'phosphor-svelte';
	import { goto } from '$app/navigation';
	import { cn } from '$lib/cn';

	type Collection =
		| (TmdbCollection & { parts_count?: number })
		| (TmdbCollectionSummary & {
				parts?: {
					poster_path: string | null;
				}[];
				parts_count?: number;
		  });

	let {
		collection
	}: {
		collection: Collection;
	} = $props();

	let posters = $derived.by(() => {
		if ('parts' in collection && collection.parts?.length) {
			const partPosters = collection.parts.filter((p) => p.poster_path).slice(0, 3);

			if (partPosters.length > 0) {
				return partPosters.map((p) => p.poster_path);
			}
		}

		return collection.poster_path ? [collection.poster_path] : [];
	});

	let filmCount = $derived.by(() => {
		if ('parts' in collection && collection.parts?.length) {
			return collection.parts.length;
		}

		return collection.parts_count ?? 0;
	});
</script>

<button
	onclick={() => goto(`/collections/${collection.id}`)}
	class="group flex w-full flex-col gap-3 text-left"
>
	<div
		class="overflow- relative aspect-2/3 rounded-2xl border border-white/5 bg-surface-800 transition-all duration-300 group-hover:border-white/10 group-hover:shadow-2xl group-hover:shadow-black/40"
	>
		<!-- Background Glow -->
		<div
			class="absolute inset-0 bg-radial from-gold-500/10 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
		></div>

		<!-- Posters Stack -->
		<div class="absolute inset-0 flex items-center justify-center py-8">
			{#if posters.length > 0}
				<div class="relative h-[82%] w-[72%]">
					{#each posters as poster, i (poster)}
						<div
							class={cn(
								'absolute inset-0 overflow-hidden rounded-2xl border border-white/10 bg-surface-700 shadow-2xl transition-all duration-500 ease-out hover:z-100',
								i === 0 && 'z-30 rotate-0 group-hover:-translate-y-1 group-hover:scale-[1.03]',
								i === 1 &&
									'translatex-10 z-20 rotate-8 group-hover:translate-x-13 group-hover:-translate-y-1',
								i === 2 &&
									'-translatex-10 z-10 -rotate-8 group-hover:-translate-x-13 group-hover:-translate-y-1'
							)}
						>
							<img
								src={tmdb.image.poster(poster, 'w500')}
								alt={collection.name}
								class="h-full w-full object-cover"
								loading="lazy"
							/>

							<div
								class="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent"
							></div>
						</div>
					{/each}
				</div>
			{:else}
				<div
					class="flex h-[82%] w-[72%] items-center justify-center rounded-2xl border border-white/10 bg-surface-700"
				>
					<FilmSlateIcon class="h-14 w-14 text-neutral-600" />
				</div>
			{/if}
		</div>

		<!-- Hover Overlay -->
		<div
			class="absolute inset-0 bg-black/0 transition-all duration-300 group-hover:bg-black/20"
		></div>

		<!-- Bottom Gradient -->
		<div
			class="absolute inset-x-0 bottom-0 h-28 bg-linear-to-t from-black/90 via-black/40 to-transparent"
		></div>

		<!-- Film Count Badge -->
		<div
			class="absolute bottom-3 left-3 z-40 rounded-full border border-white/10 bg-black/70 px-2.5 py-1 text-[11px] font-medium text-gold-400 backdrop-blur-md"
		>
			{filmCount} film{filmCount !== 1 ? 's' : ''}
		</div>
	</div>

	<!-- Title -->
	<div class="space-y-1 px-1">
		<h3
			class="line-clamp-2 text-sm font-medium text-white transition-colors group-hover:text-gold-400"
		>
			{collection.name}
		</h3>

		<p class="text-xs text-neutral-500">
			{filmCount} film{filmCount !== 1 ? 's' : ''}
		</p>
	</div>
</button>
