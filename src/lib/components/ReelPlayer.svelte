<script lang="ts">
	import { onDestroy } from 'svelte';

	let {
		youtubeKey,
		active,
		muted = true,
		playing,
		onTogglePlay = () => {}
	}: {
		youtubeKey: string;
		active: boolean;
		muted?: boolean;
		playing: boolean;
		onTogglePlay?: () => void;
	} = $props();

	// YouTube iframe URL switches autoplay based on active+playing.
	let src = $state('');

	$effect(() => {
		if (!active) {
			src = '';
			return;
		}
		const shouldAutoplay = active && playing;
		src = `https://www.youtube.com/embed/${youtubeKey}?autoplay=${shouldAutoplay ? 1 : 0}&mute=${
			muted ? 1 : 0
		}&controls=1&playsinline=1&loop=1&playlist=${youtubeKey}&rel=0&modestbranding=1&start=0`;
	});

	onDestroy(() => {
		// no-op
	});
</script>

<button
	type="button"
	aria-label={active && playing ? 'Pause video' : 'Play video'}
	onclick={() => onTogglePlay()}
	class="h-full w-full"
	style="padding:0; border:0; background:transparent;"
>
	<iframe
		class="h-full w-full"
		title={youtubeKey}
		{src}
		allow="autoplay; encrypted-media"
		allowfullscreen={false}
	></iframe>
</button>
