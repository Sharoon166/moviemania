<script lang="ts">
	interface Props {
		minYear?: number;
		maxYear?: number;
		value?: [number, number];
		step?: number;
		onChange?: (value: [number, number]) => void;
	}

	let {
		minYear = 1900,
		maxYear = new Date().getFullYear(),
		value = [1990, new Date().getFullYear()],
		step = 1,
		onChange
	}: Props = $props();

	let startYear = $state(value[0]);
	let endYear = $state(value[1]);

	const range = $derived(maxYear - minYear);
	const startPercentage = $derived(((startYear - minYear) / range) * 100);
	const endPercentage = $derived(((endYear - minYear) / range) * 100);

	function updateStart(year: number) {
		startYear = Math.min(year, endYear);
		onChange?.([startYear, endYear]);
	}

	function updateEnd(year: number) {
		endYear = Math.max(year, startYear);
		onChange?.([startYear, endYear]);
	}
</script>

<div class="year-range">
	<div class="values">
		<span>{startYear}</span>
		<span>{endYear}</span>
	</div>

	<div class="slider">
		<div class="track"></div>
		<div class="range" style:left="{startPercentage}%" style:right="{100 - endPercentage}%"></div>
		<input
			class="thumb thumb-start"
			type="range"
			min={minYear}
			max={maxYear}
			{step}
			value={startYear}
			aria-label="Start year"
			oninput={(e) => updateStart(Number(e.currentTarget.value))}
		/>
		<input
			class="thumb thumb-end"
			type="range"
			min={minYear}
			max={maxYear}
			{step}
			value={endYear}
			aria-label="End year"
			oninput={(e) => updateEnd(Number(e.currentTarget.value))}
		/>
	</div>

	<div class="labels">
		<span>{minYear}</span>
		<span>{maxYear}</span>
	</div>
</div>

<style>
	.year-range {
		width: 100%;
	}

	.values {
		display: flex;
		justify-content: space-between;
		margin-bottom: 12px;
		font-size: 12px;
		font-weight: 600;
		color: var(--color-neutral-300);
	}

	.slider {
		position: relative;
		height: 24px;
	}

	.track,
	.range {
		position: absolute;
		top: 50%;
		height: 4px;
		border-radius: 999px;
		transform: translateY(-50%);
	}

	.track {
		left: 0;
		right: 0;
		background: rgba(255, 255, 255, 0.08);
	}

	.range {
		background: var(--color-gold-500, #eab308);
		opacity: 0.5;
	}

	.thumb {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 24px;
		margin: 0;
		padding: 0;
		appearance: none;
		background: transparent;
		pointer-events: none;
		outline: none;
	}

	.thumb::-webkit-slider-runnable-track {
		height: 4px;
		background: transparent;
	}

	.thumb::-moz-range-track {
		height: 4px;
		background: transparent;
	}

	.thumb::-webkit-slider-thumb {
		appearance: none;
		width: 18px;
		height: 18px;
		margin-top: -7px;
		border: 2px solid white;
		border-radius: 50%;
		background: var(--color-gold-500, #eab308);
		box-shadow: 0 1px 6px rgb(0 0 0 / 40%);
		cursor: grab;
		pointer-events: auto;
	}

	.thumb::-webkit-slider-thumb:active {
		cursor: grabbing;
		transform: scale(1.15);
	}

	.thumb::-moz-range-thumb {
		width: 18px;
		height: 18px;
		border: 2px solid white;
		border-radius: 50%;
		background: var(--color-gold-500, #eab308);
		box-shadow: 0 1px 6px rgb(0 0 0 / 40%);
		cursor: grab;
		pointer-events: auto;
	}

	.thumb:focus-visible::-webkit-slider-thumb {
		outline: 3px solid rgb(234 179 8 / 40%);
		outline-offset: 2px;
	}

	.thumb:focus-visible::-moz-range-thumb {
		outline: 3px solid rgb(234 179 8 / 40%);
		outline-offset: 2px;
	}

	.thumb-end {
		z-index: 2;
	}

	.thumb-start {
		z-index: 1;
	}

	.labels {
		display: flex;
		justify-content: space-between;
		margin-top: 6px;
		color: var(--color-neutral-600);
		font-size: 10px;
	}
</style>
