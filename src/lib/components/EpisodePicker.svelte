<script lang="ts">
	import { createQuery } from '@tanstack/svelte-query';
	import { tmdb } from '$lib/api/tmdb';
	import { cn } from '$lib/cn';
	import { CaretDown, Play } from 'phosphor-svelte';

	let {
		tvId,
		totalSeasons,
		season: initialSeason,
		episode: initialEpisode,
		onchange
	}: {
		tvId: number;
		totalSeasons: number;
		season: number;
		episode: number;
		onchange: (s: number, e: number) => void;
	} = $props();

	let season = $state(initialSeason);
	let episode = $state(initialEpisode);
	let open = $state(false);

	let seasonDetail = createQuery(() => ({
		queryKey: ['tv', tvId, 'season', season],
		queryFn: () => tmdb.season.detail(tvId, season),
		enabled: open
	}));

	function select(s: number, e: number) {
		season = s;
		episode = e;
		onchange(s, e);
		open = false;
	}

	function toggle() {
		open = !open;
	}

	function closeOnEscape(e: KeyboardEvent) {
		if (e.key === 'Escape') open = false;
	}

	$effect(() => {
		if (typeof window === 'undefined' || !open) return;
		window.addEventListener('keydown', closeOnEscape);
		return () => window.removeEventListener('keydown', closeOnEscape);
	});
</script>

<div class="relative">
	<button
		onclick={toggle}
		class="flex items-center gap-2 rounded-xl border border-white/10 bg-surface-800 px-4 py-2 text-sm text-white transition-all duration-300 hover:bg-surface-700 active:scale-95"
	>
		<span class="text-neutral-400">S</span><span class="font-medium">{season}</span>
		<span class="text-neutral-500">/</span>
		<span class="text-neutral-400">E</span><span class="font-medium">{episode}</span>
		<CaretDown
			class={cn('h-4 w-4 text-neutral-500 transition-transform duration-300', open && 'rotate-180')}
			weight="bold"
		/>
	</button>

	{#if open}
		<div
			class="fixed inset-0 z-40"
			onclick={() => {
				open = false;
			}}
			role="presentation"
		></div>

		<div
			class="absolute top-full left-0 z-50 mt-2 w-[320px] rounded-2xl border border-white/10 bg-surface-800 shadow-2xl shadow-black/50 backdrop-blur-xl"
		>
			<div class="flex items-center gap-2 border-b border-white/10 px-4 py-3">
				<span class="text-xs font-medium text-neutral-500">Season</span>
				<div class="flex gap-1 overflow-auto">
					{#each Array(totalSeasons) as _, i (i)}
						<button
							onclick={() => {
								season = i + 1;
								episode = 1;
							}}
							class={cn(
								'rounded-lg px-2.5 py-1 text-xs font-medium transition-all duration-200',
								season === i + 1
									? 'bg-gold-500/20 text-gold-400'
									: 'text-neutral-400 hover:bg-white/5 hover:text-white'
							)}>{i + 1}</button
						>
					{/each}
				</div>
			</div>

			<div class="max-h-64 overflow-y-auto overscroll-contain" style="scrollbar-width: thin;">
				{#if seasonDetail.data}
					{#each seasonDetail.data.episodes as ep (ep.id)}
						<button
							onclick={() => select(season, ep.episode_number)}
							class={cn(
								'flex w-full items-start gap-3 px-4 py-2.5 text-left transition-all duration-200 hover:bg-white/5',
								episode === ep.episode_number && 'bg-gold-500/10'
							)}
						>
							<div
								class={cn(
									'mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold',
									episode === ep.episode_number
										? 'bg-gold-500/20 text-gold-400'
										: 'bg-surface-700 text-neutral-400'
								)}
							>
								{#if episode === ep.episode_number}
									<Play class="h-3.5 w-3.5" weight="fill" />
								{:else}
									{ep.episode_number}
								{/if}
							</div>
							<div class="min-w-0 flex-1">
								<div class="flex items-center gap-2">
									<p class="truncate text-sm font-medium text-white">{ep.name}</p>
								</div>
								{#if ep.overview}
									<p class="mt-0.5 line-clamp-2 text-xs text-neutral-500">{ep.overview}</p>
								{/if}
							</div>
						</button>
					{/each}
				{:else}
					<div class="flex items-center justify-center py-8">
						<div
							class="h-5 w-5 animate-spin rounded-full border-2 border-gold-500/30 border-t-gold-500"
						></div>
					</div>
				{/if}
			</div>
		</div>
	{/if}
</div>
