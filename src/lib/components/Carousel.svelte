<script lang="ts">
	import type { TmdbMovie, TmdbTvShow } from '$lib/types/tmdb.d';
	import { CaretLeftIcon, CaretRightIcon } from 'phosphor-svelte';
	import Tile from './Tile.svelte';

	let { items, title }: { items: (TmdbMovie | TmdbTvShow)[]; title: string } = $props();

	let scrollRef: HTMLElement | undefined = $state();
	let canScrollLeft = $state(false);
	let canScrollRight = $state(false);

	function updateScrollState() {
		if (!scrollRef) return;
		canScrollLeft = scrollRef.scrollLeft > 8;
		canScrollRight = scrollRef.scrollLeft < scrollRef.scrollWidth - scrollRef.clientWidth - 8;
	}

	function scroll(amount: number) {
		scrollRef?.scrollBy({ left: amount, behavior: 'smooth' });
	}

	$effect(() => {
		if (!scrollRef) return;
		updateScrollState();
		const el = scrollRef;
		el.addEventListener('scroll', updateScrollState, { passive: true });
		return () => el.removeEventListener('scroll', updateScrollState);
	});
</script>

<div class="space-y-4">
	<div class="flex items-center justify-between px-4 md:px-8">
		<h2 class="font-display text-2xl font-bold text-white">{title}</h2>
		<div class="flex gap-1.5">
			<button
				onclick={() => scroll(-400)}
				class="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-neutral-400 backdrop-blur-sm transition-all duration-300 hover:bg-white/10 hover:text-white active:scale-90 disabled:cursor-not-allowed disabled:opacity-20"
				disabled={!canScrollLeft}
			>
				<CaretLeftIcon class="h-4 w-4" weight="bold" />
			</button>
			<button
				onclick={() => scroll(400)}
				class="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-neutral-400 backdrop-blur-sm transition-all duration-300 hover:bg-white/10 hover:text-white active:scale-90 disabled:cursor-not-allowed disabled:opacity-20"
				disabled={!canScrollRight}
			>
				<CaretRightIcon class="h-4 w-4" weight="bold" />
			</button>
		</div>
	</div>
	<div class="relative">
		<div
			class="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-linear-to-r from-surface-950 to-transparent md:w-16"
		></div>
		<div
			bind:this={scrollRef}
			class="flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-4 pb-4 md:px-8"
			style="-webkit-overflow-scrolling: touch; scrollbar-width: none;"
		>
			{#each items as item (item.id)}
				<div class="w-[160px] shrink-0 snap-start md:w-[180px]">
					<Tile media={item} />
				</div>
			{/each}
			<div class="w-4 shrink-0"></div>
		</div>
		<div
			class="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-linear-to-l from-surface-950 to-transparent md:w-16"
		></div>
	</div>
</div>
