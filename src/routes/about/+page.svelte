<script lang="ts">
	import GithubLogoIcon from 'phosphor-svelte/lib/GithubLogoIcon';
	import GlobeIcon from 'phosphor-svelte/lib/GlobeIcon';
	import PlayIcon from 'phosphor-svelte/lib/PlayIcon';
	import BookmarkIcon from 'phosphor-svelte/lib/BookmarkIcon';
	import MagnifyingGlassIcon from 'phosphor-svelte/lib/MagnifyingGlassIcon';
	import ClockIcon from 'phosphor-svelte/lib/ClockIcon';
	import ChartBarIcon from 'phosphor-svelte/lib/ChartBarIcon';
	import MonitorIcon from 'phosphor-svelte/lib/MonitorIcon';
	import PaletteIcon from 'phosphor-svelte/lib/PaletteIcon';
	import DeviceMobileIcon from 'phosphor-svelte/lib/DeviceMobileIcon';
	import SquaresFourIcon from 'phosphor-svelte/lib/SquaresFourIcon';

	const version = '0.0.1';

	const features = [
		{ Icon: PlayIcon, text: 'Cinema mode' },
		{ Icon: ClockIcon, text: 'Continue watching' },
		{ Icon: BookmarkIcon, text: 'Watchlist' },
		{ Icon: MagnifyingGlassIcon, text: 'Autocomplete search' },
		{ Icon: ChartBarIcon, text: 'Episode heatmap' },
		{ Icon: MonitorIcon, text: 'Shorts player' },
		{ Icon: PaletteIcon, text: '8 themes' },
		{ Icon: DeviceMobileIcon, text: 'PWA support' },
		{ Icon: SquaresFourIcon, text: 'Collections' }
	];

	let activeIndex = $state<number | null>(null);
	let mouseX = $state(0);
	let mouseY = $state(0);
	let itemRefs: HTMLDivElement[] = $state([]);
	let rafId = 0;

	function onMouseMove(e: MouseEvent) {
		if (rafId) cancelAnimationFrame(rafId);
		rafId = requestAnimationFrame(() => {
			mouseX = e.clientX;
			mouseY = e.clientY;
			rafId = 0;
		});
	}

	function onMouseEnter(index: number) {
		activeIndex = index;
	}

	function onMouseLeave() {
		activeIndex = null;
	}

	function getStyle(index: number): string {
		if (activeIndex === null) return '';

		const el = itemRefs[index];
		if (!el) return '';

		const rect = el.getBoundingClientRect();
		const cx = rect.left + rect.width / 2;
		const cy = rect.top + rect.height / 2;

		if (index === activeIndex) {
			return 'transform: scale(1.2); z-index: 10;';
		}

		const dx = cx - mouseX;
		const dy = cy - mouseY;
		const dist = Math.sqrt(dx * dx + dy * dy);
		const radius = 300;

		if (dist > radius) return '';

		const strength = Math.pow(1 - dist / radius, 2);
		const pushX = (dx / (dist || 1)) * strength * 14;
		const pushY = (dy / (dist || 1)) * strength * 14;
		const s = 1 + strength * 0.06;

		return `transform: translate(${pushX.toFixed(1)}px, ${pushY.toFixed(1)}px) scale(${s.toFixed(3)}); z-index: 5;`;
	}
</script>

<svelte:head>
	<title>About - Moviemania</title>
</svelte:head>

<main class="mx-auto max-w-2xl px-4 pt-16 pb-8 md:pt-24 md:pb-16">
	<h1 class="mb-1 font-display text-2xl font-bold text-white">About</h1>
	<p class="mb-10 text-xs text-neutral-600">v{version}</p>

	<div class="space-y-8 text-sm leading-relaxed text-neutral-400">
		<section>
			<h2 class="mb-2 text-xs font-semibold tracking-wider text-neutral-500 uppercase">
				What is this
			</h2>
			<p>
				A personal streaming platform for movies and TV shows. Built to watch content in a clean,
				distraction-free environment.
			</p>
		</section>

		<section>
			<h2 class="mb-4 text-xs font-semibold tracking-wider text-neutral-500 uppercase">Features</h2>
			<div onmousemove={onMouseMove} role="list" class="grid grid-cols-3 overflow-visible">
				{#each features as { Icon, text }, i (text)}
					<div
						bind:this={itemRefs[i]}
						onmouseenter={() => onMouseEnter(i)}
						onmouseleave={onMouseLeave}
						role="listitem"
						class="feature-item flex flex-col items-center gap-2 border border-white/[0.04] bg-neutral-900/50 px-2 py-4 text-center"
						style="{getStyle(i)} animation-delay: {i * 30}ms"
					>
						<Icon
							class="h-5 w-5 transition-colors duration-300 {activeIndex === i
								? 'text-gold-500'
								: 'text-neutral-600'}"
							weight="duotone"
						/>
						<span
							class="text-xs leading-tight transition-colors duration-300 {activeIndex === i
								? 'text-neutral-200'
								: 'text-neutral-500'}">{text}</span
						>
					</div>
				{/each}
			</div>
		</section>

		<section>
			<h2 class="mb-2 text-xs font-semibold tracking-wider text-neutral-500 uppercase">Stack</h2>
			<p>
				<span class="text-neutral-300">SvelteKit</span>,
				<span class="text-neutral-300">TypeScript</span>,
				<span class="text-neutral-300">Tailwind CSS</span>,
				<span class="text-neutral-300">TanStack Query</span>. Content metadata from
				<a
					href="https://www.themoviedb.org"
					target="_blank"
					rel="noopener noreferrer"
					class="text-gold-400 underline decoration-gold-500/30 underline-offset-2 hover:text-gold-300"
					>TMDB</a
				>.
			</p>
		</section>

		<section>
			<h2 class="mb-2 text-xs font-semibold tracking-wider text-neutral-500 uppercase">
				TMDB Attribution
			</h2>
			<p>
				This product uses the TMDB API but is not endorsed or certified by TMDB. All movie and TV
				show metadata, images, and content are provided by
				<a
					href="https://www.themoviedb.org"
					target="_blank"
					rel="noopener noreferrer"
					class="text-gold-400 underline decoration-gold-500/30 underline-offset-2 hover:text-gold-300"
					>The Movie Database</a
				>.
			</p>
		</section>

		<section>
			<h2 class="mb-2 text-xs font-semibold tracking-wider text-neutral-500 uppercase">
				Developer
			</h2>
			<p class="mb-3">Sharoon Shaleem</p>
			<div class="flex gap-4">
				<a
					href="https://sharoon.vercel.app"
					target="_blank"
					rel="noopener noreferrer"
					class="flex items-center gap-2 text-sm text-neutral-400 transition-colors hover:text-white"
				>
					<GlobeIcon class="h-4 w-4" />
					Portfolio
				</a>
				<a
					href="https://github.com/sharoon166"
					target="_blank"
					rel="noopener noreferrer"
					class="flex items-center gap-2 text-sm text-neutral-400 transition-colors hover:text-white"
				>
					<GithubLogoIcon class="h-4 w-4" />
					GitHub
				</a>
			</div>
		</section>
	</div>
</main>

<style>
	.feature-item {
		will-change: transform;
		transition:
			transform 0.45s cubic-bezier(0.23, 1, 0.32, 1),
			background-color 0.45s ease,
			border-color 0.45s ease;
		animation: feature-fade-in 0.4s ease-out both;
	}

	@keyframes feature-fade-in {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
</style>
