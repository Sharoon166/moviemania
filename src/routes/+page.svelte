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

	let heroItems = $derived(trending.data?.results ?? []);
</script>

{#if heroItems.length > 0 && browser}
	<Hero item={heroItems[0]} />
{/if}

<div class="mx-auto max-w-7xl space-y-10 pt-8 pb-12">
	{#if browser}
		<ContinueWatching />
	{/if}
	<Carousel items={trending.data?.results?.slice(1) ?? []} title="Trending This Week" />
	<Carousel items={nowPlaying.data?.results ?? []} title="Now Playing" />
	<Grid items={popular.data?.results ?? []} title="Popular Movies" />
	<Grid items={topRated.data?.results ?? []} title="Top Rated" />
</div>
