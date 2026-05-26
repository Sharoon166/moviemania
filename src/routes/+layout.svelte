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
	<link rel="icon" type="image/svg+xml" href="/logo.svg" />
</svelte:head>

<QueryClientProvider client={queryClient}>
	<Nav />
	<main>
		{@render children()}
	</main>
</QueryClientProvider>
