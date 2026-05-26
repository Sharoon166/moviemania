<script lang="ts">
	import { X } from 'phosphor-svelte';

	let {
		videoKey,
		videoName,
		onclose
	}: { videoKey: string; videoName: string; onclose: () => void } = $props();

	let open = $state(false);

	$effect(() => {
		requestAnimationFrame(() => {
			open = true;
		});
	});

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') close();
	}

	function close() {
		open = false;
		setTimeout(onclose, 300);
	}

	$effect(() => {
		if (typeof window === 'undefined') return;
		window.addEventListener('keydown', handleKeydown);
		return () => window.removeEventListener('keydown', handleKeydown);
	});
</script>

<svelte:body class:overflow-hidden={open} />

<div
	class="fixed inset-0 z-[100] flex items-center justify-center transition-all duration-300"
	class:opacity-100={open}
	class:opacity-0={!open}
	class:pointer-events-auto={open}
	class:pointer-events-none={!open}
	onclick={close}
	onkeydown={(e) => e.key === 'Escape' && close()}
	role="dialog"
	aria-modal="true"
	aria-label="Trailer"
	tabindex="-1"
>
	<div class="absolute inset-0 bg-black/80 backdrop-blur-sm"></div>

	<div
		class="relative z-10 w-full max-w-5xl px-4 transition-all duration-300"
		class:scale-100={open}
		class:scale-95={!open}
		onclick={(e) => e.stopPropagation()}
		onkeydown={() => {}}
		role="presentation"
	>
		<div
			class="relative overflow-hidden rounded-2xl shadow-2xl ring-1 shadow-black/50 ring-white/10"
		>
			<button
				onclick={close}
				class="absolute top-3 right-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/20 active:scale-90"
			>
				<X class="h-5 w-5" weight="bold" />
			</button>
			<iframe
				src={`https://www.youtube.com/embed/${videoKey}?autoplay=1&rel=0`}
				title={videoName}
				class="aspect-video w-full"
				allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
				allowfullscreen
			></iframe>
		</div>
	</div>
</div>
