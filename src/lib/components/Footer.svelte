<script lang="ts">
	import { page } from '$app/state';

	const currentYear = new Date().getFullYear();
</script>

<footer class="border-t border-white/5 max-md:pb-12">
	<div
		class="mx-auto flex max-w-7xl flex-col items-center gap-3 px-4 py-8 md:flex-row md:justify-between md:px-8"
	>
		<div class="flex items-center gap-2">
			<img src="/logo.svg" alt="" class="h-5 w-5 opacity-40" />
			<span class="text-xs text-neutral-600">&copy; {currentYear} Moviemania</span>
		</div>

		<nav class="flex items-center gap-4">
			<a
				href="/about"
				class="text-xs text-neutral-600 transition-colors hover:text-neutral-400"
				class:text-neutral-400={page.url.pathname === '/about'}
			>
				About
			</a>
			<a
				href="/privacy"
				class="text-xs text-neutral-600 transition-colors hover:text-neutral-400"
				class:text-neutral-400={page.url.pathname === '/privacy'}
			>
				Privacy
			</a>
			<a
				href="/settings"
				class="text-xs text-neutral-600 transition-colors hover:text-neutral-400"
				class:text-neutral-400={page.url.pathname === '/settings'}
			>
				Settings
			</a>
		</nav>
	</div>
</footer>
