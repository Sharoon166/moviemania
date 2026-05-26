<script lang="ts">
	import { createQuery } from '@tanstack/svelte-query';
	import { fetchNews } from '$lib/api/news';

	let news = createQuery(() => ({
		queryKey: ['news'],
		queryFn: fetchNews
	}));
</script>

<svelte:head>
	<title>News - Moviemania</title>
</svelte:head>

<div class="mx-auto max-w-4xl px-6 pt-32 pb-24">
	<h1 class="font-display mb-12 text-4xl font-bold tracking-tight text-white">News</h1>

	{#if news.isLoading}
		<div class="flex items-center justify-center py-24">
			<div
				class="h-8 w-8 animate-spin rounded-full border-2 border-neutral-800 border-t-neutral-600"
			></div>
		</div>
	{:else if news.data && news.data.length > 0}
		<div class="space-y-8">
			{#each news.data as item (item.link)}
				<a
					href={item.link}
					target="_blank"
					rel="noreferrer"
					class="group block border-b border-white/5 pb-8 transition-opacity last:border-b-0 hover:opacity-70"
				>
					<div class="flex gap-6">
						{#if item.thumbnail}
							<div class="shrink-0">
								<img
									class="h-24 w-36 rounded-lg bg-neutral-900 object-cover"
									src={item.thumbnail}
									alt=""
									loading="lazy"
								/>
							</div>
						{/if}
						<div class="min-w-0 flex-1">
							<div class="mb-2 flex items-center gap-3 text-xs text-neutral-500">
								<span>{item.source}</span>
								<span>·</span>
								{#if item.pubDate}
									<time datetime={item.pubDate}>
										{new Date(item.pubDate).toLocaleDateString('en-US', {
											month: 'short',
											day: 'numeric',
											year: 'numeric'
										})}
									</time>
								{/if}
							</div>
							<h2 class="text-lg font-medium leading-snug text-white">{item.title}</h2>
						</div>
					</div>
				</a>
			{/each}
		</div>
	{:else}
		<div class="flex flex-col items-center gap-2 py-24 text-center">
			<p class="text-neutral-500">No news found</p>
		</div>
	{/if}
</div>
