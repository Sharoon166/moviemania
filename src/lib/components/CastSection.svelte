<script lang="ts">
	import { tmdb } from '$lib/api/tmdb';

	let { cast }: { cast: { id: number; name: string; character: string; profile_path: string | null }[] } =
		$props();
</script>

<section class="mx-auto max-w-7xl px-4 pb-12 md:px-8">
	<h2 class="mb-5 font-display text-2xl font-bold text-white">Cast</h2>
	<div
		class="flex snap-x gap-4 overflow-x-auto scroll-smooth pb-2"
		style="scrollbar-width: none;"
	>
		{#each cast.slice(0, 15) as member (member.id)}
			<div class="flex w-30 shrink-0 snap-start flex-col items-center gap-2.5 text-center">
				<div class="overflow-hidden rounded-full ring-2 ring-white/10">
					{#if member.profile_path}
						<img
							src={tmdb.image.profile(member.profile_path, 'w185')}
							alt={member.name}
							class="h-30 w-30 object-cover transition-transform duration-500 hover:scale-110"
							loading="lazy"
						/>
					{:else}
						<div class="flex h-30 w-30 items-center justify-center bg-surface-800">
							<span class="text-2xl font-bold text-surface-500">{member.name[0]}</span>
						</div>
					{/if}
				</div>
				<p class="w-full truncate text-sm font-medium text-white">{member.name}</p>
				<p class="w-full truncate text-xs text-neutral-500">{member.character}</p>
			</div>
		{/each}
	</div>
</section>
