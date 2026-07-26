<script lang="ts">
	let { count = 1 }: { count?: number } = $props();
</script>

{#each Array(count) as _, i (i)}
	<div class="overflow-hidden rounded-xl bg-surface-800">
		<div class="aspect-2/3 w-full animate-shimmer bg-surface-700"></div>
		<div class="space-y-2 p-3">
			<div class="h-3.5 w-3/4 rounded bg-surface-700 animate-shimmer"></div>
			<div class="flex items-center gap-2">
				<div class="h-3 w-8 rounded bg-surface-700 animate-shimmer"></div>
				<div class="h-3 w-6 rounded bg-surface-700 animate-shimmer"></div>
			</div>
		</div>
	</div>
{/each}
