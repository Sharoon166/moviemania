<script lang="ts">
	import { createQuery } from '@tanstack/svelte-query';
	import { tmdb } from '$lib/api/tmdb';
	import { browser } from '$app/environment';
	import Hero from '$lib/components/Hero.svelte';
	import Carousel from '$lib/components/Carousel.svelte';
	import Grid from '$lib/components/Grid.svelte';
	import ContinueWatching from '$lib/components/ContinueWatching.svelte';

	let trending = createQuery(() => ({
		queryKey: ['trending', 'all', 'week'],
		queryFn: () => tmdb.trending.all('week')
	}));

	let popular = createQuery(() => ({
		queryKey: ['movie', 'popular'],
		queryFn: () => tmdb.movie.popular()
	}));

	let topRated = createQuery(() => ({
		queryKey: ['movie', 'top_rated'],
		queryFn: () => tmdb.movie.topRated()
	}));

	let nowPlaying = createQuery(() => ({
		queryKey: ['movie', 'now_playing'],
		queryFn: () => tmdb.movie.nowPlaying()
	}));

	let popularTv = createQuery(() => ({
		queryKey: ['tv', 'popular'],
		queryFn: () => tmdb.tv.popular()
	}));

	let heroItems = $derived(trending.data?.results ?? []);
</script>

<svelte:head>
	<title>Moviemania</title>
</svelte:head>

{#if heroItems.length > 0 && browser}
	<Hero items={heroItems} />
{:else}
	<div class="bg-background min-h-[94dvh] animate-pulse"></div>
{/if}

<div class="mx-auto max-w-7xl space-y-10 pt-8 pb-12">
	{#if browser}
		<ContinueWatching />
	{/if}
	<Carousel items={trending.data?.results?.slice(1) ?? []} title="Trending This Week" />
	<Carousel items={nowPlaying.data?.results ?? []} title="Now Playing" />
	<Grid items={popular.data?.results ?? []} title="Popular Movies" />
	<Grid items={popularTv.data?.results ?? []} title="Popular TV Shows" />
	<Grid items={topRated.data?.results ?? []} title="Top Rated" />
</div>
