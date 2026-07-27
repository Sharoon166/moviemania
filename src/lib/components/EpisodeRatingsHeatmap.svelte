<script lang="ts">
	import { ChartBarIcon } from 'phosphor-svelte';
	import { tmdb } from '$lib/api/tmdb';

	let { showId }: { showId: number } = $props();

	const ratingTiers = [
		{ label: 'Awesome', min: 9.0, color: '#00A859', bg: 'rgba(0,168,89,0.15)' },
		{ label: 'Great', min: 8.0, color: '#00C853', bg: 'rgba(0,200,83,0.15)' },
		{ label: 'Good', min: 7.0, color: '#5CDB95', bg: 'rgba(92,219,149,0.15)' },
		{ label: 'Regular', min: 6.0, color: '#FFB300', bg: 'rgba(255,179,0,0.15)' },
		{ label: 'Bad', min: 5.0, color: '#E53935', bg: 'rgba(229,57,53,0.15)' },
		{ label: 'Garbage', min: 0, color: '#7E57C2', bg: 'rgba(126,87,194,0.15)' }
	];

	function getColor(score: number) {
		if (score >= 9.0) return '#00A859';
		if (score >= 8.0) return '#00C853';
		if (score >= 7.0) return '#5CDB95';
		if (score >= 6.0) return '#FFB300';
		if (score >= 5.0) return '#E53935';
		return '#7E57C2';
	}

	function getBg(score: number) {
		if (score >= 9.0) return 'rgba(0,168,89,0.18)';
		if (score >= 8.0) return 'rgba(0,200,83,0.18)';
		if (score >= 7.0) return 'rgba(92,219,149,0.18)';
		if (score >= 6.0) return 'rgba(255,179,0,0.18)';
		if (score >= 5.0) return 'rgba(229,57,53,0.18)';
		return 'rgba(126,87,194,0.18)';
	}

	let heatmapData = $state<
		Array<{ season: number; episodes: Array<{ episode: number; score: number; name: string }> }>
	>([]);
	let isLoading = $state(true);
	let maxEpisodes = $derived(Math.max(...heatmapData.map((s) => s.episodes.length), 0));
	let seasonCount = $derived(heatmapData.length);

	async function loadRatings() {
		isLoading = true;
		try {
			const detail = await tmdb.tv.detail(showId);

			const seasons = (detail.seasons ?? []).filter(
				(s) => s.season_number > 0 && s.episode_count > 0
			);

			const results: Array<{
				season: number;
				episodes: Array<{ episode: number; score: number; name: string }>;
			}> = [];

			for (const season of seasons) {
				try {
					const seasonDetail = await tmdb.season.detail(showId, season.season_number);

					const episodes = seasonDetail.episodes
						.filter((ep) => ep.vote_average > 0)
						.map((ep, idx) => ({
							episode: idx + 1,
							score: Math.round(ep.vote_average * 10) / 10,
							name: ep.name
						}));

					if (episodes.length > 0) {
						results.push({ season: season.season_number, episodes });
					}
				} catch {
					// skip failed season
				}
			}

			heatmapData = results;
		} catch {
			heatmapData = [];
		}
		isLoading = false;
	}

	$effect(() => {
		if (showId) loadRatings();
	});
</script>

<section class="mx-auto max-w-7xl px-4 pb-12 md:px-8">
	<div class="mb-5 flex items-center gap-2">
		<ChartBarIcon class="h-5 w-5 text-gold-400" weight="fill" />
		<h2 class="font-display text-2xl font-bold text-white">Ratings Heatmap</h2>
	</div>

	{#if isLoading}
		<div class="flex items-center justify-center py-12">
			<div
				class="h-8 w-8 animate-spin rounded-full border-2 border-gold-500/30 border-t-gold-500"
			></div>
		</div>
	{:else if heatmapData.length === 0}
		<p class="py-8 text-center text-sm text-neutral-600">No rating data available.</p>
	{:else}
		<!-- Legend -->
		<div class="mb-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
			{#each ratingTiers as tier (tier.label)}
				<div class="flex items-center gap-1.5">
					<span
						class="inline-block h-2.5 w-2.5 rounded-full"
						style="background-color: {tier.color};"
					></span>
					<span class="text-xs text-neutral-500">{tier.label}</span>
				</div>
			{/each}
		</div>

		<!-- Grid -->
		<div class="overflow-x-auto" style="scrollbar-width: none;">
			<div class="inline-flex flex-col gap-1" style="min-width: fit-content;">
				<!-- Column headers (Season labels) -->
				<div class="flex items-center gap-1.5">
					<div class="w-12 shrink-0"></div>
					{#each heatmapData as s (s.season)}
						<div
							class="flex items-center justify-center text-[11px] font-semibold text-neutral-500"
							style="width: 64px; height: 24px;"
						>
							S{s.season}
						</div>
					{/each}
				</div>

				<!-- Rows (Episode labels + cells) -->
				{#each Array.from({ length: maxEpisodes }, (_, i) => i + 1) as epNum (epNum)}
					<div class="flex items-center gap-1.5">
						<!-- Row label -->
						<div
							class="flex shrink-0 items-center justify-end pr-2 text-[11px] font-medium text-neutral-600"
							style="width: 48px; height: 36px;"
						>
							E{epNum}
						</div>

						<!-- Cells per season -->
						{#each heatmapData as s (s.season)}
							{@const ep = s.episodes.find((e) => e.episode === epNum)}
							{#if ep}
								<div
									class="flex items-center justify-center rounded-md text-[13px] font-bold"
									style="width: 64px; height: 36px; background-color: {getBg(
										ep.score
									)}; color: {getColor(ep.score)}; border: 1px solid {getColor(ep.score)}22;"
									title="S{s.season}E{ep.episode} — {ep.name} ({ep.score})"
								>
									{ep.score.toFixed(1)}
								</div>
							{:else}
								<div style="width: 64px; height: 36px;"></div>
							{/if}
						{/each}
					</div>
				{/each}
			</div>
		</div>
	{/if}
</section>
