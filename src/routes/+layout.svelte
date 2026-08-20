<script lang="ts">
	import './layout.css';
	import { QueryClientProvider } from '@tanstack/svelte-query';
	import { queryClient } from '$lib/stores/query-client';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import Nav from '$lib/components/Nav.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { themeStore } from '$lib/services/theme.svelte';
	import { appSettings } from '$lib/services/app-settings.svelte';
	import { page } from '$app/state';

	let { children } = $props();

	let isShorts = $derived(page.url.pathname.startsWith('/shorts'));

	$effect(() => {
		if (browser) import('@tanstack/svelte-query-devtools');
	});

	onMount(() => {
		if (browser) {
			themeStore.restoreState();
			appSettings.load();
		}
	});
</script>

<svelte:head>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&family=Inter:wght@300;400;500;600;700&family=Lora:wght@400;500;600;700&family=Montserrat:wght@300;400;500;600;700&family=Nunito:wght@300;400;500;600;700&family=Outfit:wght@300;400;500;600;700&family=Oxanium:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500;600;700&family=Raleway:wght@300;400;500;600;700&family=Roboto:wght@300;400;500;700&family=Source+Code+Pro:wght@300;400;500;600;700&family=Space+Grotesk:wght@300;400;500;600;700&family=Syne:wght@400;500;600;700;800&display=swap"
		rel="stylesheet"
	/>
	<link rel="icon" type="image/svg+xml" href="/logo.svg" />
</svelte:head>

<QueryClientProvider client={queryClient}>
	<div class="flex min-h-dvh flex-col">
		<Nav />
		<main class="flex-1">
			{@render children()}
		</main>
		{#if !isShorts}
			<Footer />
		{/if}
	</div>
</QueryClientProvider>
