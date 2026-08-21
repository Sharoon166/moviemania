<script lang="ts">
	import { page } from '$app/state';
	import GithubLogo from 'phosphor-svelte/lib/GithubLogoIcon';

	const currentYear = new Date().getFullYear();

	const navLinks = [
		{ href: '/browse', label: 'Search' },
		{ href: '/shorts', label: 'Shorts' },
		{ href: '/collections', label: 'Collections' },
		{ href: '/watchlist', label: 'Watchlist' },
		{ href: '/settings', label: 'Settings' }
	];

	const legalLinks = [
		{ href: '/about', label: 'About' },
		{ href: '/privacy', label: 'Privacy' }
	];
</script>

<footer class="border-t border-white/5 max-md:pb-12">
	<div class="mx-auto max-w-7xl px-4 pt-12 pb-8 md:px-8">
		<div class="grid grid-cols-2 gap-8 md:grid-cols-4">
			<div class="col-span-2 md:col-span-1">
				<div class="flex items-center gap-2">
					<img src="/logo.svg" alt="" class="h-5 w-5 opacity-40" />
					<span class="font-display text-sm font-bold text-white">Moviemania</span>
				</div>
				<p class="mt-3 max-w-xs text-xs leading-relaxed text-neutral-500">
					A personal streaming platform for movies and TV shows. Clean, distraction-free.
				</p>
			</div>

			<div>
				<h4 class="mb-3 text-xs font-semibold tracking-wider text-neutral-400 uppercase">
					Navigate
				</h4>
				<ul class="space-y-2">
					{#each navLinks as { href, label } (href)}
						<li>
							<a
								{href}
								class="text-xs text-neutral-500 transition-colors hover:text-neutral-300"
								class:text-neutral-300={page.url.pathname === href}
							>
								{label}
							</a>
						</li>
					{/each}
				</ul>
			</div>

			<div>
				<h4 class="mb-3 text-xs font-semibold tracking-wider text-neutral-400 uppercase">Info</h4>
				<ul class="space-y-2">
					{#each legalLinks as { href, label } (href)}
						<li>
							<a
								{href}
								class="text-xs text-neutral-500 transition-colors hover:text-neutral-300"
								class:text-neutral-300={page.url.pathname === href}
							>
								{label}
							</a>
						</li>
					{/each}
				</ul>
			</div>

			<div>
				<h4 class="mb-3 text-xs font-semibold tracking-wider text-neutral-400 uppercase">Source</h4>
				<a
					href="https://github.com/Sharoon166/moviemania"
					target="_blank"
					rel="noopener noreferrer"
					class="inline-flex items-center gap-2 text-xs text-neutral-500 transition-colors hover:text-neutral-300"
				>
					<GithubLogo class="h-4 w-4" />
					GitHub
				</a>
			</div>
		</div>

		<div class="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/5 pt-6 md:flex-row">
			<span class="text-xs text-neutral-600">&copy; {currentYear} Moviemania</span>
			<span class="text-xs text-neutral-600">
				Made by
				<a
					href="https://sharoon.dev"
					target="_blank"
					rel="noopener noreferrer"
					class="text-neutral-400 underline decoration-neutral-700 underline-offset-2 transition-colors hover:text-neutral-300"
				>Sharoon Shaleem</a>
			</span>
		</div>
	</div>
</footer>
