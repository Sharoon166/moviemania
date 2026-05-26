<script lang="ts">
	import { tmdb } from '$lib/api/tmdb';
	import type { TmdbMovie, TmdbTvShow } from '$lib/types/tmdb.d';
	import { Play, Info, Star } from 'phosphor-svelte';
	import { cn } from '$lib/cn';

	type HeroItem = TmdbMovie | TmdbTvShow;

	let { item }: { item: HeroItem } = $props();

	const title = $derived('title' in item ? item.title : item.name);
	const year = $derived(
		'release_date' in item ? item.release_date?.slice(0, 4) : item.first_air_date?.slice(0, 4)
	);
	const mediaType = $derived(item.media_type);
	const backdrop = $derived(tmdb.image.backdrop(item.backdrop_path ?? '', 'original'));
	const poster = $derived(tmdb.image.poster(item.poster_path ?? '', 'w342'));

	let loaded = $state(false);
	let imageLoaded = $state(false);

	$effect(() => {
		if (typeof window === 'undefined') return;
		const timer = setTimeout(() => {
			loaded = true;
		}, 100);
		return () => clearTimeout(timer);
	});
</script>

<section class="relative flex min-h-[80vh] items-end overflow-hidden">
	{#if backdrop && loaded}
		<div class="absolute inset-0">
			<img
				src={backdrop}
				alt=""
				class={cn(
					'h-full w-full object-cover transition-all duration-1000',
					imageLoaded ? 'scale-100 opacity-100' : 'scale-105 opacity-0'
				)}
				onload={() => {
					imageLoaded = true;
				}}
				style="filter: brightness(0.7)"
			/>
		</div>
	{/if}

	<div
		class="animate-fade-in absolute inset-0 bg-gradient-to-t from-surface-950 via-surface-950/50 via-60% to-transparent"
	></div>
	<div
		class="animate-fade-in absolute inset-0 bg-gradient-to-r from-surface-950/80 via-transparent to-transparent"
	></div>

	<div
		class="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 pt-48 pb-16 md:flex-row md:items-end md:px-8 md:pb-20"
	>
		<div
			class="hidden shrink-0 md:block"
			style="animation: fade-up 0.7s cubic-bezier(0.16,1,0.3,1) 400ms both"
		>
			<div class="relative">
				<img
					src={poster}
					alt={title}
					class="h-[28rem] w-auto rounded-2xl object-cover shadow-2xl shadow-black/50"
				/>
				<div
					class="absolute -right-2 -bottom-2 rounded-xl bg-gold-500/20 px-3 py-1.5 backdrop-blur-md"
				>
					<div class="flex items-center gap-1.5 text-sm font-semibold text-gold-400">
						<Star class="h-4 w-4" weight="fill" />
						{item.vote_average.toFixed(1)}
					</div>
				</div>
			</div>
		</div>

		<div
			class="flex max-w-2xl flex-col gap-4"
			style="animation: fade-up 0.7s cubic-bezier(0.16,1,0.3,1) 500ms both"
		>
			<div
				class="flex items-center gap-3 text-xs font-medium tracking-widest text-gold-400 uppercase"
			>
				<span class="h-px w-8 bg-gold-500/50"></span>
				<span>Featured {mediaType === 'movie' ? 'Movie' : 'Show'}</span>
			</div>

			<h1 class="font-display text-2xl leading-tight font-extrabold text-white md:text-4xl">
				{title}
			</h1>

			<div class="flex flex-wrap items-center gap-4 text-sm text-neutral-400">
				<div class="flex items-center gap-1.5 text-gold-400 md:hidden">
					<Star class="h-4 w-4" weight="fill" />
					<span class="font-semibold">{item.vote_average.toFixed(1)}</span>
				</div>
				<span class="text-neutral-500 md:hidden">&middot;</span>
				<span>{year}</span>
			</div>

			<p class="line-clamp-3 max-w-xl text-base leading-relaxed text-neutral-300">
				{item.overview}
			</p>

			<div class="flex flex-wrap gap-3 pt-2">
				<a
					href={`/watch/${mediaType}/${item.id}`}
					class="group flex items-center gap-2.5 rounded-full bg-gold-500 px-7 py-3 text-sm font-bold text-black transition-all duration-300 hover:bg-gold-400 hover:shadow-[0_0_30px_rgba(245,158,11,0.35)] active:scale-95"
				>
					<Play class="h-5 w-5" weight="fill" />
					Watch Now
				</a>
				<a
					href={`/${mediaType}/${item.id}`}
					class="flex items-center gap-2.5 rounded-full border border-white/10 bg-white/5 px-7 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:border-white/20 hover:bg-white/10 active:scale-95"
				>
					<Info class="h-5 w-5" />
					More Info
				</a>
			</div>
		</div>
	</div>
</section>
