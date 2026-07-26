<script lang="ts">
	import { GithubLogoIcon, GlobeIcon } from 'phosphor-svelte';
</script>

<svelte:head>
	<title>About - Moviemania</title>
</svelte:head>

<div class="min-h-screen pt-32 pb-24">
	<div class="mx-auto max-w-2xl px-6">
		<div class="mb-16 flex items-center gap-4">
			<h1 class="font-display text-4xl font-bold tracking-tight text-white">About</h1>
		</div>

		<div class="space-y-12 text-neutral-400">
			<p class="text-lg leading-relaxed">
				A personal streaming platform for movies and TV shows. Built for myself to watch content in
				a clean, distraction-free environment.
			</p>

			<div class="space-y-4">
				<h2 class="text-sm font-medium tracking-wider text-neutral-500 uppercase">Stack</h2>
				<p class="leading-relaxed">
					SvelteKit, TypeScript, TailwindCSS. Content metadata from TMDB.
				</p>
			</div>

			<div class="space-y-4">
				<h2 class="text-sm font-medium tracking-wider text-neutral-500 uppercase">Developer</h2>
				<p class="leading-relaxed">Sharoon Shaleem</p>
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
			</div>
		</div>
	</div>
</div>
