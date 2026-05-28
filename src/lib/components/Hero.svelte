<script lang="ts">
	import { tmdb } from '$lib/api/tmdb';
	import type { TmdbMovie, TmdbTvShow } from '$lib/types/tmdb.d';
	import { PlayIcon, InfoIcon, StarIcon, CaretLeftIcon, CaretRight } from 'phosphor-svelte';
	import { cn } from '$lib/cn';
	import { onMount } from 'svelte';

	type HeroItem = TmdbMovie | TmdbTvShow;

	let { items }: { items: HeroItem[] } = $props();

	let activeIndex = $state(0);
	let loaded = $state(false);
	let imageLoaded = $state<Record<number, boolean>>({});

	let autoplay = true;
	let interval: ReturnType<typeof setInterval>;

	const current = $derived(items[activeIndex]);

	const title = $derived('title' in current ? current.title : current.name);

	const year = $derived(
		'release_date' in current
			? current.release_date?.slice(0, 4)
			: current.first_air_date?.slice(0, 4)
	);

	const mediaType = $derived(current.media_type);

	const backdrop = $derived(tmdb.image.backdrop(current.backdrop_path ?? '', 'original'));

	const poster = $derived(tmdb.image.poster(current.poster_path ?? '', 'w500'));

	function next() {
		activeIndex = (activeIndex + 1) % items.length;
	}

	function prev() {
		activeIndex = (activeIndex - 1 + items.length) % items.length;
	}

	function goTo(index: number) {
		activeIndex = index;
	}

	function startAutoplay() {
		clearInterval(interval);

		if (!autoplay) return;

		interval = setInterval(() => {
			next();
		}, 7000);
	}

	onMount(() => {
		loaded = true;
		startAutoplay();

		return () => {
			clearInterval(interval);
		};
	});

	$effect(() => {
		startAutoplay();
	});
</script>

<section class="group relative flex min-h-[94dvh] items-end overflow-hidden bg-black">
	<!-- BACKDROP STACK -->
	{#each items as item, index (item.id)}
		{@const itemBackdrop = tmdb.image.backdrop(item.backdrop_path ?? '', 'original')}

		<div
			class={cn(
				'absolute inset-0 transition-all duration-1000 ease-out',
				index === activeIndex ? 'scale-100 opacity-100' : 'pointer-events-none scale-105 opacity-0'
			)}
		>
			<img
				src={itemBackdrop}
				alt=""
				class={cn(
					'h-full w-full object-cover object-top transition-all duration-1000',
					imageLoaded[index] ? 'scale-100 opacity-100' : 'scale-110 opacity-0'
				)}
				style="filter: brightness(0.55)"
				onload={() => {
					imageLoaded[index] = true;
				}}
			/>

			<!-- cinematic vignette -->
			<div
				class="absolute inset-0 bg-radial-[ellipse_at_center] from-transparent via-black/10 to-black/70"
			></div>
		</div>
	{/each}

	<!-- overlays -->
	<div
		class="absolute inset-0 bg-linear-to-t from-surface-950 via-surface-950/30 via-60% to-transparent"
	></div>

	<div
		class="absolute inset-0 bg-linear-to-r from-surface-950/90 via-surface-950/30 to-transparent"
	></div>

	<!-- CONTENT -->
	<div
		class="relative z-20 mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 pt-40 pb-16 md:flex-row md:items-end md:px-8 md:pb-20"
	>
		<!-- POSTER -->
		<div
			class="hidden shrink-0 md:block"
			style="animation: fade-up 0.7s cubic-bezier(0.16,1,0.3,1)"
		>
			<div class="relative">
				<img
					src={poster}
					alt={title}
					class="h-[300px] w-auto rounded-3xl object-cover shadow-[0_30px_80px_rgba(0,0,0,0.7)] transition-all duration-700"
				/>

				<div
					class="absolute -top-4 -right-4 rounded-2xl border border-gold-500/20 bg-gold-500/15 px-4 py-2 backdrop-blur-xl"
				>
					<div class="flex items-center gap-2 text-sm font-bold text-gold-400">
						<StarIcon class="h-4 w-4" weight="fill" />
						{current.vote_average.toFixed(1)}
					</div>
				</div>
			</div>
		</div>

		<!-- TEXT -->
		<div
			class="flex max-w-2xl flex-col gap-5"
			style="animation: fade-up 0.8s cubic-bezier(0.16,1,0.3,1)"
		>
			<div
				class="flex items-center gap-3 text-xs font-semibold tracking-[0.3em] text-gold-400 uppercase"
			>
				<span class="h-px w-10 bg-gold-500/50"></span>

				<span>
					Featured {mediaType === 'movie' ? 'Movie' : 'Series'}
				</span>
			</div>

			<h1
				{title}
				class="line-clamp-2 max-w-3xl font-display text-2xl leading-[0.95] font-black text-white md:text-4xl"
			>
				{title}
			</h1>

			<div class="flex flex-wrap items-center gap-4 text-sm text-neutral-300">
				<div class="flex items-center gap-1.5 text-gold-400 md:hidden">
					<StarIcon class="h-4 w-4" weight="fill" />
					<span class="font-semibold">
						{current.vote_average.toFixed(1)}
					</span>
				</div>

				<span>{year}</span>

				<span
					class="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase backdrop-blur-sm"
				>
					{mediaType}
				</span>
			</div>

			<p class="line-clamp-4 max-w-2xl text-base leading-relaxed text-neutral-300 md:text-lg">
				{current.overview}
			</p>

			<!-- ACTIONS -->
			<div class="flex flex-wrap gap-3 pt-3">
				<a
					href={`/watch/${mediaType}/${current.id}`}
					class="group flex items-center gap-2.5 rounded-full bg-gold-500 px-8 py-3.5 text-sm font-bold text-black transition-all duration-300 hover:scale-[1.03] hover:bg-gold-400 hover:shadow-[0_0_40px_rgba(245,158,11,0.35)] active:scale-95"
				>
					<PlayIcon class="h-5 w-5" weight="fill" />

					Watch Now
				</a>

				<a
					href={`/${mediaType}/${current.id}`}
					class="flex items-center gap-2.5 rounded-full border border-white/10 bg-white/5 px-8 py-3.5 text-sm font-semibold text-white backdrop-blur-md transition-all duration-300 hover:border-white/20 hover:bg-white/10 active:scale-95"
				>
					<InfoIcon class="h-5 w-5" />

					More Info
				</a>
			</div>

			<!-- PROGRESS -->
			<div class="absolute right-0 bottom-[3%] mt-8 flex items-center gap-3 self-end">
				{#each items as _, index (index)}
					<button
						onclick={() => goTo(index)}
						class={cn(
							'h-1.5 rounded-full transition-all duration-500',
							index === activeIndex ? 'w-12 bg-gold-400' : 'w-3 bg-white/20 hover:bg-white/40'
						)}
						aria-label={`Go to featured-item ${index}`}
					></button>
				{/each}
				<div class="flex gap-2">
					<button
						onclick={prev}
						class="rounded-full border border-white/10 bg-black/30 p-2 text-white/70 opacity-100 backdrop-blur-xl transition-all duration-300 hover:scale-110 hover:bg-black/50 hover:text-white md:block"
					>
						<CaretLeftIcon size={18} weight="bold" />
					</button>
					<button
						onclick={next}
						class="rounded-full border border-white/10 bg-black/30 p-2 text-white/70 opacity-100 backdrop-blur-xl transition-all duration-300 hover:scale-110 hover:bg-black/50 hover:text-white md:block"
					>
						<CaretRight size={18} weight="bold" />
					</button>
				</div>
			</div>
		</div>
	</div>

	<!-- BOTTOM FADE -->
	<div
		class="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-linear-to-t from-surface-950 to-transparent"
	></div>
</section>
