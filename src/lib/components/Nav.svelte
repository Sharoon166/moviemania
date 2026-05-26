<script lang="ts">
	import { page } from '$app/state';
	import { MagnifyingGlass, FilmSlate } from 'phosphor-svelte';
	import { cn } from '$lib/cn';

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
			<div
				class="flex h-8 w-8 items-center justify-center rounded-lg bg-gold-500 transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(245,158,11,0.4)]"
			>
				<FilmSlate class="h-4.5 w-4.5 text-black" weight="fill" />
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
		</div>
	</div>
</nav>
