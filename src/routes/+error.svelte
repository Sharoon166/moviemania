<script lang="ts">
	import { page } from '$app/state';
	import { ArrowLeftIcon, FilmReelIcon } from 'phosphor-svelte';

	let status = $derived(page.status);
	let message = $derived(page.error?.message || 'Something went wrong');
</script>

<svelte:head>
	<title>{status} - Moviemania</title>
</svelte:head>

<div class="flex min-h-screen items-center justify-center bg-black px-6">
	<div class="w-full max-w-md text-center">
		<!-- Custom SVG Illustration -->
		<div class="mb-2 flex justify-center"></div>

		<!-- Error message -->
		<h1
			class="mb-3 flex items-end justify-center font-display text-6xl font-bold text-white md:text-9xl"
		>
			{#if status == 404}
				4<FilmReelIcon class="text-5xl md:text-8xl" />4
			{:else}
				{status}
			{/if}
		</h1>
		<p class="mb-8 text-lg text-neutral-400">
			{#if status === 404}
				This page doesn't exist
			{:else}
				{message}
			{/if}
		</p>

		<a
			href="/"
			class="inline-flex items-center gap-2 rounded-xl bg-gold-500/20 px-6 py-3 text-sm font-medium text-gold-400 transition-all hover:bg-gold-500/30"
		>
			<ArrowLeftIcon class="h-4 w-4" />
			Back to home
		</a>
	</div>
</div>
