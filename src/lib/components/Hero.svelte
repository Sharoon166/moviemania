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

	let filmstripEl = $state<HTMLDivElement | null>(null);
	let hoveredIndex = $state<number | null>(null);

	function getScale(index: number): number {
		const focus = hoveredIndex ?? activeIndex;
		const dist = Math.abs(index - focus);
		if (dist === 0) return 1;
		if (dist === 1) return 0.8;
		if (dist === 2) return 0.65;
		return 0.5;
	}

	function getOpacity(index: number): number {
		const focus = hoveredIndex ?? activeIndex;
		const dist = Math.abs(index - focus);
		if (dist === 0) return 1;
		if (dist === 1) return 0.7;
		if (dist === 2) return 0.45;
		return 0.3;
	}

	$effect(() => {
		const el = filmstripEl;
		if (!el) return;
		const activeBtn = el.children[activeIndex] as HTMLElement;
		if (!activeBtn) return;
		const elCenter = el.offsetWidth / 2;
		const btnCenter = activeBtn.offsetLeft + activeBtn.offsetWidth / 2;
		el.scrollTo({ left: btnCenter - elCenter, behavior: 'smooth' });
	});

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

	function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'ArrowLeft') { prev(); }
    else if (e.key === 'ArrowRight') { next(); }
}
</script>

<svelte:window onkeydown={handleKeydown} />

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
		<div class="hidden shrink-0" style="animation: fade-up 0.7s cubic-bezier(0.16,1,0.3,1)">
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
			<div class="hidden lg:flex absolute right-4 bottom-6 z-30 items-end md:right-8 md:bottom-10">
				<div class="relative">
					<div
						bind:this={filmstripEl}
						class="flex max-w-[min(460px,65vw)] items-end overflow-x-hidden px-4 py-2"
						style="scrollbar-width: none;"
					>
						{#each items as item, index (item.id)}
							{@const scale = getScale(index)}
							{@const opacity = getOpacity(index)}
							{@const isActive = index === activeIndex}
							<button
								onclick={() => goTo(index)}
								onmouseenter={() => (hoveredIndex = index)}
								onmouseleave={() => (hoveredIndex = null)}
								class="relative mx-1 shrink-0 origin-bottom overflow-hidden rounded-lg focus:outline-none"
								style="
                        width: {82 * scale}px;
                        height: {120 * scale}px;
                        opacity: {opacity};
                        transform: scale(1);
                        transition: width 400ms cubic-bezier(0.34,1.56,0.64,1),
                                    height 400ms cubic-bezier(0.34,1.56,0.64,1),
                                    opacity 400ms ease;
                        {isActive
									? 'box-shadow: 0 0 0 2px #f59e0b, 0 0 0 3px rgba(0,0,0,0.5);'
									: ''}
                    "
							>
								<img
									src={tmdb.image.poster(item.poster_path ?? '', 'w154')}
									alt=""
									class="h-full w-full object-cover"
									loading="lazy"
								/>
								{#if isActive}
									<div class="absolute inset-0 bg-linear-to-t from-black/50 to-transparent"></div>
									<div class="absolute right-0 bottom-1.5 left-0 flex justify-center">
										<span class="h-0.5 w-5 rounded-full bg-gold-400"></span>
									</div>
								{/if}
							</button>
						{/each}
					</div>
				</div>

				<div class="flex gap-1.5 pb-0.5">
					<button
						onclick={prev}
						class="rounded-full border border-white/10 bg-black/40 p-2 text-white/70 backdrop-blur-xl transition-all duration-300 hover:scale-110 hover:bg-black/60 hover:text-white"
					>
						<CaretLeftIcon size={16} weight="bold" />
					</button>
					<button
						onclick={next}
						class="rounded-full border border-white/10 bg-black/40 p-2 text-white/70 backdrop-blur-xl transition-all duration-300 hover:scale-110 hover:bg-black/60 hover:text-white"
					>
						<CaretRight size={16} weight="bold" />
					</button>
				</div>
			</div>
			<div class="absolute right-4 bottom-[3%] mt-8 flex items-center gap-3 self-end">
				<div class="hidden md:flex lg:hidden gap-2">
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
