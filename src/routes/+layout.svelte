<script lang="ts">
	import './layout.css';
	import { QueryClientProvider } from '@tanstack/svelte-query';
	import { queryClient } from '$lib/stores/query-client';
	import { browser } from '$app/environment';
	import Nav from '$lib/components/Nav.svelte';

	let { children } = $props();

	$effect(() => {
		if (browser) import('@tanstack/svelte-query-devtools');
	});
</script>

<svelte:head>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&family=Syne:wght@400;500;600;700;800&display=swap"
		rel="stylesheet"
	/>
	<link
		rel="icon"
		href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='6' fill='%23f59e0b'/><text x='16' y='23' text-anchor='middle' font-size='20' font-family='sans-serif' fill='%23000'>🎬</text></svg>"
	/>
</svelte:head>

<QueryClientProvider client={queryClient}>
	<Nav />
	<main>
		{@render children()}
	</main>
</QueryClientProvider>
