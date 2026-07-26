<script lang="ts">
	import {
		themeStore,
		themes,
		displayFontOptions,
		bodyFontOptions
	} from '$lib/services/theme.svelte';
	import { appSettings } from '$lib/services/app-settings.svelte';
	import { embedSources } from '$lib/api/tmdb';
	import { searchHistory } from '$lib/services/search-history.svelte';
	import { setPreferredServer } from '$lib/stores/embed-server';
	import {
		ArrowCounterClockwiseIcon,
		TrashIcon,
		CaretDownIcon
	} from 'phosphor-svelte';
	import { cn } from '$lib/cn';
	import { onMount } from 'svelte';

	const sortOptions = [
		{ value: 'popularity.desc', label: 'Popularity' },
		{ value: 'vote_average.desc', label: 'Rating' },
		{ value: 'primary_release_date.desc', label: 'Release Date' },
		{ value: 'vote_count.desc', label: 'Most Voted' }
	];

	const mediaFilterOptions = [
		{ value: 'all' as const, label: 'All' },
		{ value: 'movie' as const, label: 'Movies' },
		{ value: 'tv' as const, label: 'TV' }
	];

	const itemsPerPageOptions = [12, 20, 30, 40, 60];

	onMount(() => {
		appSettings.load();
	});
</script>

<svelte:head>
	<title>Settings - Moviemania</title>
</svelte:head>

<main class="mx-auto max-w-2xl px-4 pt-16 pb-8 md:pt-24 md:pb-16">
	<h1 class="font-display text-2xl font-bold text-white mb-1">Settings</h1>
	<p class="text-sm text-neutral-500 mb-10">Customize the look and feel of Moviemania.</p>

	<!-- ═══════════════════════════════════════════ -->
	<!-- Appearance                                  -->
	<!-- ═══════════════════════════════════════════ -->

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

	<!-- Reset Appearance -->
	<button
		onclick={() => themeStore.resetTheme()}
		class="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-xs font-medium text-neutral-400 transition-all hover:border-white/20 hover:text-white"
	>
		<ArrowCounterClockwiseIcon class="h-4 w-4" />
		Reset Appearance
	</button>

	<!-- Divider -->
	<div class="my-10 border-t border-white/5"></div>

	<!-- ═══════════════════════════════════════════ -->
	<!-- Playback                                    -->
	<!-- ═══════════════════════════════════════════ -->

	<section class="mb-10">
		<h2 class="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-3">
			Playback
		</h2>
		<p class="text-xs text-neutral-600 mb-4">Choose the default streaming server.</p>

		<div class="flex flex-wrap gap-2">
			{#each embedSources as src (src.id)}
				<button
					onclick={() => { appSettings.setDefaultServer(src.id); setPreferredServer(src.id); }}
					class={cn(
						'rounded-xl border px-3.5 py-1.5 text-xs font-medium transition-all',
						appSettings.defaultServerId === src.id
							? 'border-gold-500/50 bg-gold-500/10 text-gold-400'
							: 'border-white/5 bg-white/[0.02] text-neutral-500 hover:border-white/15 hover:text-white'
					)}
				>
					{src.name}
				</button>
			{/each}
		</div>
	</section>

	<!-- Divider -->
	<div class="my-10 border-t border-white/5"></div>

	<!-- ═══════════════════════════════════════════ -->
	<!-- Browsing                                    -->
	<!-- ═══════════════════════════════════════════ -->

	<section class="mb-10">
		<h2 class="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-3">
			Browsing
		</h2>
		<p class="text-xs text-neutral-600 mb-4">Defaults for the browse page.</p>

		<div class="space-y-6">
			<!-- Default Media Filter -->
			<div>
				<p class="text-xs text-neutral-400 mb-2">Default Media Filter</p>
				<div class="flex gap-2">
					{#each mediaFilterOptions as opt}
						<button
							onclick={() => appSettings.setDefaultMediaFilter(opt.value)}
							class={cn(
								'rounded-xl border px-3.5 py-1.5 text-xs font-medium transition-all',
								appSettings.defaultMediaFilter === opt.value
									? 'border-gold-500/50 bg-gold-500/10 text-gold-400'
									: 'border-white/5 bg-white/[0.02] text-neutral-500 hover:border-white/15 hover:text-white'
							)}
						>
							{opt.label}
						</button>
					{/each}
				</div>
			</div>

			<!-- Default Sort -->
			<div>
				<p class="text-xs text-neutral-400 mb-2">Default Sort Order</p>
				<div class="relative inline-block">
					<select
						value={appSettings.defaultSortBy}
						onchange={(e) => appSettings.setDefaultSortBy(e.currentTarget.value)}
						class="appearance-none rounded-xl border border-white/5 bg-white/[0.02] py-1.5 pr-8 pl-3.5 text-xs font-medium text-neutral-400 outline-none transition-all hover:border-white/15 hover:text-white focus:border-gold-500/50 focus:text-white"
					>
						{#each sortOptions as opt}
							<option value={opt.value} class="bg-surface-900">{opt.label}</option>
						{/each}
					</select>
					<CaretDownIcon class="pointer-events-none absolute top-1/2 right-2.5 h-3 w-3 -translate-y-1/2 text-neutral-500" />
				</div>
			</div>

			<!-- Items Per Page -->
			<div>
				<p class="text-xs text-neutral-400 mb-2">Items Per Page</p>
				<div class="flex gap-2">
					{#each itemsPerPageOptions as count}
						<button
							onclick={() => appSettings.setItemsPerPage(count)}
							class={cn(
								'rounded-xl border px-3.5 py-1.5 text-xs font-medium transition-all',
								appSettings.itemsPerPage === count
									? 'border-gold-500/50 bg-gold-500/10 text-gold-400'
									: 'border-white/5 bg-white/[0.02] text-neutral-500 hover:border-white/15 hover:text-white'
							)}
						>
							{count}
						</button>
					{/each}
				</div>
			</div>
		</div>
	</section>

	<!-- Divider -->
	<div class="my-10 border-t border-white/5"></div>

	<!-- ═══════════════════════════════════════════ -->
	<!-- Data                                        -->
	<!-- ═══════════════════════════════════════════ -->

	<section class="mb-10">
		<h2 class="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-3">
			Data
		</h2>

		<div class="space-y-3">
			<!-- Clear Search History -->
			<button
				onclick={() => searchHistory.clear()}
				disabled={searchHistory.items.length === 0}
				class="flex items-center gap-2.5 rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3 text-left transition-all hover:border-white/15 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
			>
				<TrashIcon class="h-4 w-4 shrink-0 text-neutral-500" />
				<div class="flex-1">
					<p class="text-xs font-medium text-neutral-300">Clear Search History</p>
					<p class="text-[11px] text-neutral-600">
						{searchHistory.items.length} recent {searchHistory.items.length === 1 ? 'search' : 'searches'}
					</p>
				</div>
			</button>
		</div>
	</section>
</main>
