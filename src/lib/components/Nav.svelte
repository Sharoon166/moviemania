<script lang="ts">
	import { page } from '$app/state';
	import { MagnifyingGlass, FilmSlate, Shuffle, Newspaper, Play, Info } from 'phosphor-svelte';
	import { cn } from '$lib/cn';
	import { goto } from '$app/navigation';

	let isScrolled = $state(false);

	$effect(() => {
		if (typeof window === 'undefined') return;
		const onScroll = () => {
			isScrolled = window.scrollY > 32;
		};
		onScroll();
		window.addEventListener('scroll', onScroll, { passive: true });
		return () => window.removeEventListener('scroll', onScroll);
	});
</script>

<nav
	class={cn(
		'fixed inset-x-0 top-0 z-50 transition-all duration-500',
		isScrolled && 'bg-surface-950/85 shadow-[0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-xl'
	)}
	data-sveltekit-preload-data="hover"
>
	<div class="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8">
		<a href="/" class="group flex items-center gap-2.5">
			<div class="flex h-8 w-8 items-center justify-center transition-all duration-300">
				<img src="/logo.svg" alt="Moviemania" class="h-full w-full" />
			</div>
			<span
				class="font-display text-lg font-bold tracking-tight text-white transition-opacity duration-300 max-sm:hidden"
			>
				Moviemania
			</span>
		</a>

		<div class="flex items-center gap-2">
			<a
				href="/browse"
				class={cn(
					'flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-neutral-300 transition-all duration-300 hover:bg-white/5 hover:text-white active:scale-95',
					page.url.pathname === '/browse' && 'bg-white/5 text-white'
				)}
			>
				<MagnifyingGlass class="h-4 w-4" />
				<span class="hidden sm:inline">Search</span>
			</a>

			<a
				href="/news"
				class={cn(
					'flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-neutral-300 transition-all duration-300 hover:bg-white/5 hover:text-white active:scale-95',
					page.url.pathname === '/news' && 'bg-white/5 text-white'
				)}
			>
				<Newspaper class="h-4 w-4" />

				<span class="hidden sm:inline">News</span>
			</a>
			
			<a
				href="/shorts"
				class={cn(
					'flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-neutral-300 transition-all duration-300 hover:bg-white/5 hover:text-white active:scale-95',
					page.url.pathname === '/shorts' && 'bg-white/5 text-white'
				)}
			>
				<Play class="h-4 w-4" />

				<span class="hidden sm:inline">Shorts</span>
			</a>

			<a
				href="/about"
				class={cn(
					'flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-neutral-300 transition-all duration-300 hover:bg-white/5 hover:text-white active:scale-95',
					page.url.pathname === '/about' && 'bg-white/5 text-white'
				)}
			>
				<Info class="h-4 w-4" />

				<span class="hidden sm:inline">About</span>
			</a>

			<button
				onclick={() => {
					const pick = Math.random();
					// Rough random range; routing will 404 if the id doesn't exist.
					const id = Math.floor(Math.random() * 100000) + 1;
					// window.location.href = pick < 0.5 ? `/movie/${id}` : `/tv/${id}`;
					goto(pick < 0.5 ? `/movie/${id}` : `/tv/${id}`);
				}}
				class="flex items-center gap-2 rounded-xl bg-gold-500/20 px-4 py-2 text-sm font-medium text-gold-400 transition-all duration-300 hover:bg-gold-500/30 hover:text-gold-300 active:scale-95"
			>
				<Shuffle class="h-4.5 w-4.5 text-white" weight="fill" />
				<span class="hidden sm:inline">Random</span>
			</button>
		</div>
	</div>
</nav>
