<script lang="ts">
	import {
		themeStore,
		themes,
		displayFontOptions,
		bodyFontOptions
	} from '$lib/services/theme.svelte';
	import { ArrowCounterClockwiseIcon } from 'phosphor-svelte';
</script>

<svelte:head>
	<title>Settings - Moviemania</title>
</svelte:head>

<main class="mx-auto max-w-2xl px-4 py-8 pb-24 md:py-16">
	<h1 class="font-display text-2xl font-bold text-white mb-1">Settings</h1>
	<p class="text-sm text-neutral-500 mb-10">Customize the look and feel of Moviemania.</p>

	<!-- Color Theme -->
	<section class="mb-10">
		<h2 class="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-3">
			Color Theme
		</h2>
		<div class="grid grid-cols-2 gap-2 sm:grid-cols-3">
			{#each themes as theme (theme.id)}
				<button
					onclick={() => themeStore.selectTheme(theme)}
					class="group flex flex-col items-start gap-2 rounded-xl border p-3 text-left transition-all {themeStore.activeThemeId === theme.id
						? 'border-gold-500/50 bg-gold-500/10 ring-1 ring-gold-500/20'
						: 'border-white/5 bg-white/[0.02] hover:border-white/15 hover:bg-white/5'}"
				>
					<div class="flex gap-1.5">
						<div
							class="h-5 w-5 rounded-full ring-1 ring-inset ring-white/10"
							style="background-color: {theme.surface[11]}"
						></div>
						<div
							class="h-5 w-5 rounded-full ring-1 ring-inset ring-white/10"
							style="background-color: {theme.surface[8]}"
						></div>
						<div
							class="h-5 w-5 rounded-full ring-1 ring-inset ring-white/10"
							style="background-color: {theme.accent[5]}"
						></div>
					</div>
					<span
						class="text-xs font-medium {themeStore.activeThemeId === theme.id
							? 'text-gold-400'
							: 'text-neutral-400 group-hover:text-white'}"
					>
						{theme.name}
					</span>
				</button>
			{/each}
		</div>
	</section>

	<!-- Display Font -->
	<section class="mb-10">
		<h2 class="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-3">
			Display Font
		</h2>
		<div class="flex flex-wrap gap-2">
			{#each displayFontOptions as font (font.id)}
				<button
					onclick={() => themeStore.selectDisplayFont(font.family)}
					class="rounded-xl border px-3.5 py-1.5 text-xs font-medium transition-all {themeStore.activeDisplayFont === font.family
						? 'border-gold-500/50 bg-gold-500/10 text-gold-400'
						: 'border-white/5 bg-white/[0.02] text-neutral-500 hover:border-white/15 hover:text-white'}"
				>
					{font.label}
				</button>
			{/each}
		</div>
	</section>

	<!-- Body Font -->
	<section class="mb-10">
		<h2 class="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-3">
			Body Font
		</h2>
		<div class="flex flex-wrap gap-2">
			{#each bodyFontOptions as font (font.id)}
				<button
					onclick={() => themeStore.selectBodyFont(font.family)}
					class="rounded-xl border px-3.5 py-1.5 text-xs font-medium transition-all {themeStore.activeBodyFont === font.family
						? 'border-gold-500/50 bg-gold-500/10 text-gold-400'
						: 'border-white/5 bg-white/[0.02] text-neutral-500 hover:border-white/15 hover:text-white'}"
				>
					{font.label}
				</button>
			{/each}
		</div>
	</section>

	<!-- Reset -->
	<button
		onclick={() => themeStore.resetTheme()}
		class="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-xs font-medium text-neutral-400 transition-all hover:border-white/20 hover:text-white"
	>
		<ArrowCounterClockwiseIcon class="h-4 w-4" />
		Reset to Default
	</button>
</main>
