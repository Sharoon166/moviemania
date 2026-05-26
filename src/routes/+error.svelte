<script lang="ts">
	import { page } from '$app/stores';
	import { ArrowLeft } from 'phosphor-svelte';

	let status = $derived($page.status);
	let message = $derived($page.error?.message || 'Something went wrong');
</script>

<svelte:head>
	<title>{status} - Moviemania</title>
</svelte:head>

<div class="flex min-h-screen items-center justify-center bg-black px-6">
	<div class="w-full max-w-md text-center">
		<!-- Custom SVG Illustration -->
		<div class="mb-8 flex justify-center">
			<svg
				width="200"
				height="200"
				viewBox="0 0 200 200"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
				class="opacity-80"
			>
				<!-- Film reel -->
				<circle cx="100" cy="100" r="60" stroke="#333" stroke-width="2" />
				<circle cx="100" cy="100" r="45" stroke="#333" stroke-width="2" />

				<!-- Sprocket holes -->
				{#each Array(8) as _, i (i)}
					{@const angle = (i * 45 * Math.PI) / 180}
					{@const x = 100 + Math.cos(angle) * 52.5}
					{@const y = 100 + Math.sin(angle) * 52.5}
					<circle cx={x} cy={y} r="4" fill="#333" />
				{/each}

				<!-- Center circle -->
				<circle cx="100" cy="100" r="15" fill="#333" />

				<!-- Broken film strip -->
				<path
					d="M 60 100 L 40 100 M 140 100 L 160 100"
					stroke="#555"
					stroke-width="8"
					stroke-linecap="round"
				/>
				<path
					d="M 38 95 L 32 95 M 38 105 L 32 105 M 162 95 L 168 95 M 162 105 L 168 105"
					stroke="#555"
					stroke-width="2"
				/>

				<!-- X mark overlay -->
				<line x1="70" y1="70" x2="130" y2="130" stroke="#f59e0b" stroke-width="3" />
				<line x1="130" y1="70" x2="70" y2="130" stroke="#f59e0b" stroke-width="3" />
			</svg>
		</div>

		<!-- Error message -->
		<h1 class="font-display mb-3 text-6xl font-bold text-white">{status}</h1>
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
			<ArrowLeft class="h-4 w-4" />
			Back to home
		</a>
	</div>
</div>
