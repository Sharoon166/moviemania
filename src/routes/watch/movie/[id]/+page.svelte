<script lang="ts">
	import { createQuery } from '@tanstack/svelte-query';
	import { tmdb, embedSources } from '$lib/api/tmdb';
	import { PlayIcon, FilmSlateIcon, DownloadIcon } from 'phosphor-svelte';
	import { cn } from '$lib/cn';
	import { upsertContinueWatching } from '$lib/stores/continue-watching';
	import { getPreferredServer, setPreferredServer } from '$lib/stores/embed-server';

	let { params } = $props();
	let id = $derived(params.id);

	let movie = createQuery(() => ({
		queryKey: ['movie', id],
		queryFn: () => tmdb.movie.detail(Number(id))
	}));

	let source = $state<'embed' | 'trailer'>('embed');
	let server = $state(getPreferredServer());
	let serverOpen = $state(false);

	let video = $derived(
		movie.data?.videos.results.findLast((v) => v.site === 'YouTube' && v.type === 'Trailer') ??
			movie.data?.videos.results[0]
	);

	$effect(() => {
		if (!movie.data) return;
		upsertContinueWatching({
			id: movie.data.id,
			mediaType: 'movie',
			title: movie.data.title,
			posterPath: movie.data.poster_path,
			progress: 50
		});
	});
</script>

<svelte:head>
	<title>{movie.data?.title} - Moviemania</title>
</svelte:head>
{#if movie.data}
	<div class="relative flex min-h-screen flex-col bg-black">
		<div class="flex flex-col items-center pt-20 pb-8">
			<div class="w-full max-w-5xl px-4">
				<div class="flex flex-wrap items-center gap-2 pb-4">
					<button
						onclick={() => (source = 'embed')}
						class={cn(
							'flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-300',
							source === 'embed'
								? 'bg-gold-500/20 text-gold-400 ring-1 ring-gold-500/30'
								: 'text-neutral-400 hover:text-white'
						)}
					>
						<FilmSlateIcon class="h-4 w-4" />
						Watch Now
					</button>
					{#if video}
						<button
							onclick={() => (source = 'trailer')}
							class={cn(
								'flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-300',
								source === 'trailer'
									? 'bg-gold-500/20 text-gold-400 ring-1 ring-gold-500/30'
									: 'text-neutral-400 hover:text-white'
							)}
						>
							<PlayIcon class="h-4 w-4" />
							Trailer
						</button>
					{/if}
				</div>

				<div
					class="relative overflow-hidden rounded-2xl shadow-2xl ring-1 shadow-black/50 ring-white/10"
				>
					{#if source === 'embed'}
						<iframe
							src={tmdb.embed.movie(movie.data.id, server)}
							title={movie.data.title}
							class="aspect-video w-full"
							allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
							allowfullscreen
						></iframe>
					{:else if video}
						<iframe
							src={`https://www.youtube.com/embed/${video.key}?autoplay=1&rel=0`}
							title={video.name}
							class="aspect-video w-full"
							allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
							allowfullscreen
						></iframe>
					{/if}
				</div>

				{#if source === 'embed'}
					<div class="flex flex-wrap items-center justify-between gap-3 pt-4">
						<div class="flex items-center gap-2">
							<span class="text-xs font-medium text-neutral-500">Server:</span>
							<div class="relative">
								<button
									onclick={() => (serverOpen = !serverOpen)}
									class="flex items-center gap-2 rounded-xl border border-white/10 bg-surface-800/80 px-3 py-2 text-xs font-medium text-neutral-300 backdrop-blur-sm transition-all duration-200 hover:border-white/20 hover:text-white"
								>
									{server.name}
									<svg
										class={cn(
											'h-3.5 w-3.5 transition-transform duration-200',
											serverOpen && 'rotate-180'
										)}
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2"
									>
										<path d="m6 9 6 6 6-6" />
									</svg>
								</button>
								{#if serverOpen}
									<div
										class="fixed inset-0 z-40"
										onclick={() => (serverOpen = false)}
										onkeydown={(e) => e.key === 'Escape' && (serverOpen = false)}
										role="presentation"
									></div>
									<div
										class="absolute top-full left-0 z-50 mt-2 w-44 overflow-hidden rounded-xl border border-white/10 bg-surface-800 shadow-2xl shadow-black/50 backdrop-blur-xl"
									>
										{#each embedSources as src (src.id)}
											<button
												onclick={() => {
													server = src;
													setPreferredServer(src.id);
													serverOpen = false;
												}}
												class={cn(
													'flex w-full items-center gap-2 px-4 py-2.5 text-left text-xs font-medium transition-all duration-200 hover:bg-white/5',
													src.id === server.id ? 'bg-gold-500/10 text-gold-400' : 'text-neutral-400'
												)}
											>
												<span
													class={cn(
														'h-1.5 w-1.5 rounded-full',
														src.id === server.id ? 'bg-gold-500' : 'bg-neutral-600'
													)}
												></span>
												{src.name}
											</button>
										{/each}
									</div>
								{/if}
							</div>
						</div>
						<a
							href={tmdb.embed.movie(movie.data.id, server)}
							target="_blank"
							rel="noopener noreferrer"
							class="flex items-center gap-2 rounded-xl border border-white/10 bg-surface-800/80 px-4 py-2 text-xs font-medium text-neutral-300 backdrop-blur-sm transition-all duration-200 hover:border-white/20 hover:text-white"
						>
							<DownloadIcon class="h-3.5 w-3.5" />
							Download
						</a>
					</div>
				{/if}
			</div>
		</div>

		<div class="mx-auto w-full max-w-5xl px-4 pb-16">
			<div class="flex flex-col gap-3">
				<h1 class="font-display text-2xl font-bold text-white">{movie.data.title}</h1>
				<p class="max-w-3xl text-sm leading-relaxed text-neutral-400">{movie.data.overview}</p>
			</div>
		</div>
	</div>
{:else if movie.isPending}
	<div class="flex min-h-screen items-center justify-center bg-black">
		<div class="flex flex-col items-center gap-4">
			<div
				class="h-10 w-10 animate-spin rounded-full border-2 border-gold-500/30 border-t-gold-500"
			></div>
			<p class="text-sm text-neutral-500">Loading...</p>
		</div>
	</div>
{/if}
