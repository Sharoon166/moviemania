<script lang="ts">
	import { tmdb } from '$lib/api/tmdb';
	import type { TmdbImage } from '$lib/types/tmdb.d';
	import CaretLeftIcon from 'phosphor-svelte/lib/CaretLeftIcon';
	import CaretRightIcon from 'phosphor-svelte/lib/CaretRightIcon';
	import XIcon from 'phosphor-svelte/lib/XIcon';
	import FilmStripIcon from 'phosphor-svelte/lib/FilmStripIcon';

	let { images }: { images: TmdbImage[] } = $props();

	let lightboxOpen = $state(false);
	let lightboxIndex = $state(0);
	let lightboxEl = $state<HTMLDivElement | null>(null);

	function openLightbox(index: number) {
		lightboxIndex = index;
		lightboxOpen = true;
	}

	function closeLightbox() {
		lightboxOpen = false;
	}

	function lightboxNext() {
		lightboxIndex = (lightboxIndex + 1) % images.length;
	}

	function lightboxPrev() {
		lightboxIndex = (lightboxIndex - 1 + images.length) % images.length;
	}

	function handleLightboxKey(e: KeyboardEvent) {
		if (e.key === 'Escape') closeLightbox();
		if (e.key === 'ArrowRight') lightboxNext();
		if (e.key === 'ArrowLeft') lightboxPrev();
	}

	$effect(() => {
		if (lightboxOpen && lightboxEl) {
			lightboxEl.focus();
		}
	});
</script>

{#if images.length > 0}
	<section class="mx-auto max-w-7xl px-4 pb-12 md:px-8">
		<div class="mb-5 flex items-center gap-2">
			<FilmStripIcon class="h-5 w-5 text-gold-400" weight="fill" />
			<h2 class="font-display text-2xl font-bold text-white">Gallery</h2>
			<span class="ml-1 text-sm text-neutral-500">{images.length} stills</span>
		</div>
		<div class="flex gap-3 overflow-x-auto pb-2" style="scrollbar-width: none;">
			{#each images.slice(0, 20) as image, i (image.file_path)}
				<button
					onclick={() => openLightbox(i)}
					class="relative shrink-0 overflow-hidden rounded-xl ring-1 ring-white/10 transition-all duration-300 hover:scale-[1.02] hover:ring-gold-500/40 focus:outline-none"
				>
					<img
						src={tmdb.image.backdrop(image.file_path, 'w780')}
						alt=""
						class="h-32 w-auto object-cover"
						loading="lazy"
					/>
					<div
						class="absolute inset-0 bg-black/0 transition-all duration-300 hover:bg-black/20"
					></div>
				</button>
			{/each}
		</div>
	</section>
{/if}

{#if lightboxOpen && images.length > 0}
	<div
		bind:this={lightboxEl}
		class="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm"
		onclick={closeLightbox}
		onkeydown={handleLightboxKey}
		role="dialog"
		aria-modal="true"
		tabindex="0"
	>
		<button
			onclick={closeLightbox}
			class="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/60 text-white backdrop-blur-sm transition-all hover:bg-white/20"
		>
			<XIcon class="h-5 w-5" weight="bold" />
		</button>

		<button
			onclick={(e) => {
				e.stopPropagation();
				lightboxPrev();
			}}
			class="absolute left-4 z-10 flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-black/50 text-white backdrop-blur-xl transition-all hover:bg-black/80"
		>
			<CaretLeftIcon size={20} weight="bold" />
		</button>

		<img
			src={tmdb.image.backdrop(images[lightboxIndex].file_path, 'original')}
			alt=""
			class="max-h-[85vh] max-w-[85vw] rounded-xl object-contain shadow-2xl"
			onclick={(e) => e.stopPropagation()}
		/>

		<button
			onclick={(e) => {
				e.stopPropagation();
				lightboxNext();
			}}
			class="absolute right-4 z-10 flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-black/50 text-white backdrop-blur-xl transition-all hover:bg-black/80"
		>
			<CaretRightIcon size={20} weight="bold" />
		</button>

		<div
			class="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full border border-white/10 bg-black/60 px-4 py-1.5 text-sm text-neutral-400 backdrop-blur-sm"
		>
			{lightboxIndex + 1} / {images.length}
		</div>
	</div>
{/if}
