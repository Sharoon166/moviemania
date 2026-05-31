<script lang="ts">
	import { page } from '$app/state';
	import {
		MagnifyingGlassIcon,
		ShuffleIcon,
		PlayIcon,
		InfoIcon,
		HouseIcon,
		CardsThreeIcon,
		BookmarkIcon
	} from 'phosphor-svelte';
	import { cn } from '$lib/cn';
	import { goto } from '$app/navigation';
	import { watchlist } from '$lib/services/watchlist.svelte';

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

	function goRandom() {
		const pick = Math.random();
		const id = Math.floor(Math.random() * 100000) + 1;
		goto(pick < 0.5 ? `/movie/${id}` : `/tv/${id}`);
	}

	let watchlistCount = $derived(watchlist.items.length);

	const navLinks = [
		{ href: '/browse', label: 'Search', Icon: MagnifyingGlassIcon },
		{ href: '/shorts', label: 'Shorts', Icon: PlayIcon },
		{ href: '/collections', label: 'Collections', Icon: CardsThreeIcon },
		{ href: '/watchlist', label: 'Watchlist', Icon: BookmarkIcon },
		{ href: '/about', label: 'About', Icon: InfoIcon }
	];

	const mobileNavLinks = [
		{ href: '/browse', label: 'Search', Icon: MagnifyingGlassIcon },
		{ href: '/shorts', label: 'Shorts', Icon: PlayIcon },
		{ href: '/collections', label: 'Collections', Icon: CardsThreeIcon },
		{ href: '/about', label: 'About', Icon: InfoIcon }
		
	];
</script>

<!-- ─── Top bar ─── -->
<nav
	class={cn(
		'fixed inset-x-0 top-0 z-50 transition-all duration-500',
		isScrolled && 'bg-surface-950/85 shadow-[0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-xl'
	)}
	data-sveltekit-preload-data="hover"
>
	<div class="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8">
		<!-- Logo -->
		<a href="/" class="group flex items-center gap-2.5">
			<div class="flex h-8 w-8 items-center justify-center transition-all duration-300">
				<img src="/logo.svg" alt="Moviemania" class="h-full w-full" />
			</div>
			<span class="font-display text-lg font-bold tracking-tight text-white transition-opacity duration-300">
				Moviemania
			</span>
		</a>

		<!-- Desktop nav (md+) -->
		<div class="hidden items-center gap-2 md:flex">
			{#each navLinks as { href, label, Icon } (href)}
				<a
					{href}
					class={cn(
						'relative flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-neutral-300 transition-all duration-300 hover:bg-white/5 hover:text-white active:scale-95',
						page.url.pathname === href && 'bg-white/5 text-white'
					)}
				>
					<Icon class="h-4 w-4" />
					<span>{label}</span>
					{#if href === '/watchlist' && watchlistCount > 0}
						<span class="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold-500 px-1 text-[10px] font-bold text-black">
							{watchlistCount > 99 ? '99+' : watchlistCount}
						</span>
					{/if}
				</a>
			{/each}

			<button
				onclick={goRandom}
				class="flex items-center gap-2 rounded-xl bg-gold-500/20 px-4 py-2 text-sm font-medium text-gold-400 transition-all duration-300 hover:bg-gold-500/30 hover:text-gold-300 active:scale-95"
			>
				<ShuffleIcon class="h-4.5 w-4.5" weight="fill" />
				<span>Random</span>
			</button>
		</div>

		<!-- Mobile: Watchlist icon + Random button -->
		<div class="flex items-center gap-2 md:hidden">
			<a
				href="/watchlist"
				class="relative flex h-9 w-9 items-center justify-center rounded-xl text-neutral-300 transition-all duration-200 hover:bg-white/5 hover:text-white active:scale-90"
			>
				<BookmarkIcon
					class="h-5 w-5"
					weight={page.url.pathname === '/watchlist' ? 'fill' : 'regular'}
				/>
				{#if watchlistCount > 0}
					<span class="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold-500 px-1 text-[10px] font-bold text-black">
						{watchlistCount > 99 ? '99+' : watchlistCount}
					</span>
				{/if}
			</a>

			<button
				onclick={goRandom}
				class="flex items-center gap-1.5 rounded-xl bg-gold-500/20 px-3 py-2 text-sm font-medium text-gold-400 transition-all duration-300 hover:bg-gold-500/30 active:scale-95"
			>
				<ShuffleIcon class="h-4 w-4 text-white" weight="fill" />
				<span class="text-xs font-semibold tracking-wide">Random</span>
			</button>
		</div>
	</div>
</nav>

<!-- ─── Mobile bottom tab bar ─── -->
<nav class="fixed inset-x-0 bottom-0 z-50 md:hidden">
	<div class="border-t border-white/6 bg-surface-950/90 backdrop-blur-xl">
		<div class="mx-auto flex h-16 max-w-sm items-center justify-around px-2 pb-[env(safe-area-inset-bottom)]">
			<!-- Home -->
			<a
				href="/"
				class={cn(
					'flex flex-col items-center gap-1 rounded-xl px-4 py-1.5 text-neutral-400 transition-all duration-200 active:scale-90',
					page.url.pathname === '/' && 'text-white'
				)}
			>
				<HouseIcon class="h-5 w-5" weight={page.url.pathname === '/' ? 'fill' : 'regular'} />
				<span class="text-[10px] font-medium tracking-wide">Home</span>
			</a>

			{#each mobileNavLinks as { href, label, Icon } (href)}
				<a
					{href}
					class={cn(
						'relative flex flex-col items-center gap-1 rounded-xl px-4 py-1.5 text-neutral-400 transition-all duration-200 active:scale-90',
						page.url.pathname === href && 'text-white'
					)}
				>
					<Icon class="h-5 w-5" weight={page.url.pathname === href ? 'fill' : 'regular'} />
					<span class="text-[10px] font-medium tracking-wide">{label}</span>
					{#if href === '/watchlist' && watchlistCount > 0}
						<span class="absolute -top-0.5 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold-500 px-1 text-[10px] font-bold text-black">
							{watchlistCount > 99 ? '99+' : watchlistCount}
						</span>
					{/if}
				</a>
			{/each}
		</div>
	</div>
</nav>

<!-- Spacer -->
<div class="h-16 md:hidden" aria-hidden="true"></div>