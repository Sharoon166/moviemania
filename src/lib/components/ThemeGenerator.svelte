<script lang="ts">
	import { extractColorsFromPoster, generateThemeFromColors } from '$lib/utils/color-extract';
	import { themeStore } from '$lib/services/theme.svelte';
	import SparkleIcon from 'phosphor-svelte/lib/SparkleIcon';
	import CheckIcon from 'phosphor-svelte/lib/CheckIcon';
	import XIcon from 'phosphor-svelte/lib/XIcon';
	import SpinnerIcon from 'phosphor-svelte/lib/SpinnerIcon';

	let { posterPath, title, genreIds = [] }: { posterPath: string; title: string; genreIds?: number[] } = $props();

	let loading = $state(false);
	let error = $state('');
	let showPreview = $state(false);
	let extractedColors = $state<string[]>([]);
	let pickedAccent = $state<string>('');
	let pickedSurface = $state<string>('');

	function getProxiedUrl(path: string): string {
		return `/api/image?path=${encodeURIComponent(path)}&size=w342`;
	}

	async function generate(e: Event) {
		e.stopPropagation();
		if (!posterPath || loading) return;
		loading = true;
		error = '';
		extractedColors = [];

		try {
			const url = getProxiedUrl(posterPath);
			extractedColors = await extractColorsFromPoster(url);
			pickedAccent = extractedColors[0] ?? '';
			pickedSurface = extractedColors[extractedColors.length - 1] ?? extractedColors[0] ?? '';
			showPreview = true;
		} catch {
			error = 'Failed to extract colors';
		} finally {
			loading = false;
		}
	}

	let theme = $derived(
		pickedAccent && pickedSurface
			? generateThemeFromColors(pickedAccent, pickedSurface, title, genreIds)
			: null
	);

	function applyTheme() {
		if (!theme) return;
		themeStore.addCustomTheme(theme);
		themeStore.selectTheme(theme);
	}

	function closePreview(e: Event) {
		e.stopPropagation();
		showPreview = false;
		extractedColors = [];
		pickedAccent = '';
		pickedSurface = '';
		error = '';
	}

	const surfaceKeys = [50, 100, 200, 300, 400, 500, 600, 700, 800, 850, 900, 950];
</script>

<button
	onclick={generate}
	disabled={loading}
	class="absolute top-2 right-2 z-10 rounded-lg bg-black/60 p-2 text-white/70 backdrop-blur-sm transition-all hover:bg-black/80 hover:text-gold-400 disabled:opacity-50"
	title="Generate theme from poster"
>
	{#if loading}
		<SpinnerIcon class="h-4 w-4 animate-spin" />
	{:else}
		<SparkleIcon class="h-4 w-4" />
	{/if}
</button>

{#if showPreview && theme}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<div
		role="button"
		tabindex="-1"
		onclick={closePreview}
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
	>
		<div
			role="document"
			onclick={(e) => e.stopPropagation()}
			onkeydown={(e) => e.stopPropagation()}
			class="mx-4 w-full max-w-sm rounded-2xl border border-white/10 bg-surface-900 p-5 shadow-2xl"
		>
			<div class="mb-4 flex items-center justify-between">
				<h3 class="text-sm font-semibold text-white">{title}</h3>
				<button
					onclick={closePreview}
					class="rounded-lg p-1 text-neutral-500 transition-colors hover:bg-white/10 hover:text-white"
				>
					<XIcon class="h-4 w-4" />
				</button>
			</div>

			<p class="mb-2 text-[10px] font-medium text-neutral-500 uppercase tracking-wider">
				Click to pick accent color
			</p>
			<div class="mb-4 flex gap-1.5">
				{#each extractedColors as color}
					<button
						onclick={(e) => {
							e.stopPropagation();
							pickedAccent = color;
						}}
						class="h-8 flex-1 rounded-lg ring-2 ring-inset transition-all hover:scale-110 {pickedAccent ===
						color
							? 'ring-gold-400 shadow-[0_0_8px_rgba(251,191,36,0.4)]'
							: 'ring-white/10 hover:ring-white/30'}"
						style="background-color: {color}"
						title={color}
					></button>
				{/each}
			</div>

			<p class="mb-2 text-[10px] font-medium text-neutral-500 uppercase tracking-wider">
				Click to pick surface base
			</p>
			<div class="mb-4 flex gap-1.5">
				{#each extractedColors as color}
					<button
						onclick={(e) => {
							e.stopPropagation();
							pickedSurface = color;
						}}
						class="h-8 flex-1 rounded-lg ring-2 ring-inset transition-all hover:scale-110 {pickedSurface ===
						color
							? 'ring-gold-400 shadow-[0_0_8px_rgba(251,191,36,0.4)]'
							: 'ring-white/10 hover:ring-white/30'}"
						style="background-color: {color}"
						title={color}
					></button>
				{/each}
			</div>

			<div class="mb-4 rounded-lg bg-black/30 p-3">
				<p class="mb-1.5 text-[10px] font-medium text-neutral-500 uppercase tracking-wider">
					Surface
				</p>
				<div class="flex gap-0.5">
					{#each theme.surface as color, i}
						<div
							class="h-3 flex-1 first:rounded-l last:rounded-r"
							style="background-color: {color}"
							title="surface-{surfaceKeys[i]}"
						></div>
					{/each}
				</div>
				<p class="mt-2 mb-1.5 text-[10px] font-medium text-neutral-500 uppercase tracking-wider">
					Accent
				</p>
				<div class="flex gap-0.5">
					{#each theme.accent as color}
						<div
							class="h-3 flex-1 first:rounded-l last:rounded-r"
							style="background-color: {color}"
						></div>
					{/each}
				</div>
				<p class="mt-2 mb-1.5 text-[10px] font-medium text-neutral-500 uppercase tracking-wider">
					Crimson
				</p>
				<div class="flex gap-0.5">
					{#each theme.crimson as color}
						<div
							class="h-3 flex-1 first:rounded-l last:rounded-r"
							style="background-color: {color}"
						></div>
					{/each}
				</div>
			</div>

			{#if error}
				<p class="mb-3 text-xs text-red-400">{error}</p>
			{/if}

			<button
				onclick={(e) => {
					e.stopPropagation();
					applyTheme();
				}}
				disabled={themeStore.activeThemeId === theme.id}
				class="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-medium transition-all {themeStore.activeThemeId ===
				theme.id
					? 'cursor-default border-gold-500/30 bg-gold-500/10 text-gold-400'
					: 'border border-gold-500/50 bg-gold-500/10 text-gold-400 hover:bg-gold-500/20'}"
			>
				{#if themeStore.activeThemeId === theme.id}
					<CheckIcon class="h-3.5 w-3.5" />
					Theme Applied
				{:else}
					<SparkleIcon class="h-3.5 w-3.5" />
					Apply Theme
				{/if}
			</button>
		</div>
	</div>
{/if}
