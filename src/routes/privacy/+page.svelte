<script lang="ts">
	const lastUpdated = 'July 2026';
</script>

<svelte:head>
	<title>Privacy Policy - Moviemania</title>
</svelte:head>

<main class="mx-auto max-w-2xl px-4 pt-16 pb-8 md:pt-24 md:pb-16">
	<h1 class="font-display text-2xl font-bold text-white mb-1">Privacy Policy</h1>
	<p class="text-xs text-neutral-600 mb-10">Last updated: {lastUpdated}</p>

	<div class="space-y-8 text-sm leading-relaxed text-neutral-400">
		<section>
			<h2 class="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-2">Overview</h2>
			<p>
				Moviemania is a free, open-source movie and TV show browsing application.
				This policy explains what data we handle and how.
			</p>
		</section>

		<section>
			<h2 class="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-2">No Account Required</h2>
			<p>
				Moviemania does not require registration or login. There are no user accounts.
			</p>
		</section>

		<section>
			<h2 class="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-2">Local Storage Only</h2>
			<p>
				All your preferences, watchlist, search history, and continue-watching data are stored
				locally in your browser's localStorage. This data never leaves your device and is not
				transmitted to any server operated by us.
			</p>
		</section>

		<section>
			<h2 class="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-2">Third-Party Services</h2>
			<p class="mb-2">Moviemania interacts with the following third-party services:</p>
			<ul class="list-disc list-inside space-y-1 ml-1">
				<li>
					<span class="text-neutral-300">TMDB API</span> — Used to fetch movie and TV show metadata,
					images, and search results. TMDB may collect standard request data (IP, user agent)
					per their own privacy policy.
				</li>
				<li>
					<span class="text-neutral-300">Streaming embeds</span> — When you play content, an iframe
					from a third-party server is loaded. These servers may collect usage data per their
					own policies.
				</li>
				<li>
					<span class="text-neutral-300">Google Fonts</span> — Fonts are loaded from Google's CDN.
					Google may collect standard request data.
				</li>
			</ul>
		</section>

		<section>
			<h2 class="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-2">No Analytics or Tracking</h2>
			<p>
				Moviemania does not use analytics tools, advertising trackers, or any form of
				user behavior tracking.
			</p>
		</section>

		<section>
			<h2 class="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-2">Data Deletion</h2>
			<p>
				Since all data is stored locally, you can delete everything at any time by clearing
				your browser's site data for Moviemania, or by using the reset options in Settings.
			</p>
		</section>

		<section>
			<h2 class="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-2">Changes</h2>
			<p>
				This policy may be updated from time to time. Changes will be reflected on this page
				with a revised date.
			</p>
		</section>
	</div>
</main>
