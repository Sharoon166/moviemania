const GENRE_FONT_MAP: Record<number, { display: string; body: string }> = {
	28: { display: "'Oxanium', sans-serif", body: "'Inter', sans-serif" },
	12: { display: "'Outfit', sans-serif", body: "'DM Sans', sans-serif" },
	16: { display: "'Outfit', sans-serif", body: "'Nunito', sans-serif" },
	35: { display: "'Nunito', sans-serif", body: "'DM Sans', sans-serif" },
	80: { display: "'Space Grotesk', sans-serif", body: "'Inter', sans-serif" },
	99: { display: "'DM Sans', sans-serif", body: "'Inter', sans-serif" },
	18: { display: "'Playfair Display', serif", body: "'Lora', serif" },
	10751: { display: "'Outfit', sans-serif", body: "'Nunito', sans-serif" },
	14: { display: "'Syne', sans-serif", body: "'DM Sans', sans-serif" },
	36: { display: "'Playfair Display', serif", body: "'Lora', serif" },
	27: { display: "'Cormorant Garamond', serif", body: "'Lora', serif" },
	10402: { display: "'Poiret One', sans-serif", body: "'DM Sans', sans-serif" },
	9648: { display: "'Space Grotesk', sans-serif", body: "'Inter', sans-serif" },
	10749: { display: "'Poiret One', sans-serif", body: "'Raleway', sans-serif" },
	878: { display: "'Space Grotesk', sans-serif", body: "'Inter', sans-serif" },
	53: { display: "'Oxanium', sans-serif", body: "'Inter', sans-serif" },
	10752: { display: "'Josefin Sans', sans-serif", body: "'Inter', sans-serif" },
	37: { display: "'Josefin Sans', sans-serif", body: "'DM Sans', sans-serif" }
};

const DEFAULT_FONTS = { display: "'Outfit', sans-serif", body: "'DM Sans', sans-serif" };

function getFontsForGenres(genreIds: number[]): { display: string; body: string } {
	for (const id of genreIds) {
		if (GENRE_FONT_MAP[id]) return GENRE_FONT_MAP[id];
	}
	return DEFAULT_FONTS;
}

interface RGB {
	r: number;
	g: number;
	b: number;
}

function hexToRgb(hex: string): RGB {
	const r = parseInt(hex.slice(1, 3), 16);
	const g = parseInt(hex.slice(3, 5), 16);
	const b = parseInt(hex.slice(5, 7), 16);
	return { r, g, b };
}

function rgbToHex(r: number, g: number, b: number): string {
	return (
		'#' +
		[r, g, b]
			.map((c) => {
				const hex = Math.round(Math.max(0, Math.min(255, c))).toString(16);
				return hex.length === 1 ? '0' + hex : hex;
			})
			.join('')
	);
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
	r /= 255;
	g /= 255;
	b /= 255;
	const max = Math.max(r, g, b);
	const min = Math.min(r, g, b);
	const l = (max + min) / 2;
	let h = 0;
	let s = 0;

	if (max !== min) {
		const d = max - min;
		s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
		switch (max) {
			case r:
				h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
				break;
			case g:
				h = ((b - r) / d + 2) / 6;
				break;
			case b:
				h = ((r - g) / d + 4) / 6;
				break;
		}
	}

	return { h: h * 360, s: s * 100, l: l * 100 };
}

function hslToRgb(h: number, s: number, l: number): RGB {
	h /= 360;
	s /= 100;
	l /= 100;

	let r: number;
	let g: number;
	let b: number;

	if (s === 0) {
		r = g = b = l;
	} else {
		const hue2rgb = (p: number, q: number, t: number) => {
			if (t < 0) t += 1;
			if (t > 1) t -= 1;
			if (t < 1 / 6) return p + (q - p) * 6 * t;
			if (t < 1 / 2) return q;
			if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
			return p;
		};

		const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
		const p = 2 * l - q;
		r = hue2rgb(p, q, h + 1 / 3);
		g = hue2rgb(p, q, h);
		b = hue2rgb(p, q, h - 1 / 3);
	}

	return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
}

function colorDistance(a: RGB, b: RGB): number {
	return Math.sqrt((a.r - b.r) ** 2 + (a.g - b.g) ** 2 + (a.b - b.b) ** 2);
}

function kMeans(pixels: RGB[], k: number, maxIterations = 20): RGB[] {
	const centroids: RGB[] = [];

	// Initialize centroids using k-means++
	centroids.push(pixels[Math.floor(Math.random() * pixels.length)]);

	for (let i = 1; i < k; i++) {
		const distances = pixels.map((p) => {
			const minDist = Math.min(...centroids.map((c) => colorDistance(p, c)));
			return minDist * minDist;
		});
		const total = distances.reduce((a, b) => a + b, 0);
		let random = Math.random() * total;
		for (let j = 0; j < pixels.length; j++) {
			random -= distances[j];
			if (random <= 0) {
				centroids.push(pixels[j]);
				break;
			}
		}
		if (centroids.length <= i) {
			centroids.push(pixels[Math.floor(Math.random() * pixels.length)]);
		}
	}

	for (let iter = 0; iter < maxIterations; iter++) {
		const clusters: RGB[][] = Array.from({ length: k }, () => []);

		for (const pixel of pixels) {
			let minDist = Infinity;
			let closest = 0;
			for (let i = 0; i < centroids.length; i++) {
				const dist = colorDistance(pixel, centroids[i]);
				if (dist < minDist) {
					minDist = dist;
					closest = i;
				}
			}
			clusters[closest].push(pixel);
		}

		let converged = true;
		for (let i = 0; i < k; i++) {
			if (clusters[i].length === 0) continue;
			const newR = clusters[i].reduce((s, p) => s + p.r, 0) / clusters[i].length;
			const newG = clusters[i].reduce((s, p) => s + p.g, 0) / clusters[i].length;
			const newB = clusters[i].reduce((s, p) => s + p.b, 0) / clusters[i].length;
			const newCentroid = { r: Math.round(newR), g: Math.round(newG), b: Math.round(newB) };
			if (colorDistance(centroids[i], newCentroid) > 2) converged = false;
			centroids[i] = newCentroid;
		}

		if (converged) break;
	}

	return centroids;
}

function lighten(rgb: RGB, amount: number): RGB {
	const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
	hsl.l = Math.min(100, hsl.l + amount);
	const result = hslToRgb(hsl.h, hsl.s, hsl.l);
	return result;
}

function darken(rgb: RGB, amount: number): RGB {
	const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
	hsl.l = Math.max(0, hsl.l - amount);
	const result = hslToRgb(hsl.h, hsl.s, hsl.l);
	return result;
}

function desaturate(rgb: RGB, amount: number): RGB {
	const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
	hsl.s = Math.max(0, hsl.s - amount);
	const result = hslToRgb(hsl.h, hsl.s, hsl.l);
	return result;
}

function saturation(rgb: RGB): number {
	return rgbToHsl(rgb.r, rgb.g, rgb.b).s;
}

function brightness(rgb: RGB): number {
	return rgbToHsl(rgb.r, rgb.g, rgb.b).l;
}

function isReddish(rgb: RGB): boolean {
	const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
	return (hsl.h < 20 || hsl.h > 340) && hsl.s > 30 && hsl.l > 20 && hsl.l < 60;
}

export async function extractColorsFromPoster(posterUrl: string): Promise<string[]> {
	const img = new Image();
	img.crossOrigin = 'anonymous';
	img.src = posterUrl;

	await new Promise<void>((resolve, reject) => {
		img.onload = () => resolve();
		img.onerror = () => reject(new Error('Failed to load image'));
	});

	const canvas = new OffscreenCanvas(100, Math.round(100 * (img.height / img.width)));
	const ctx = canvas.getContext('2d')!;
	ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
	const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
	const data = imageData.data;

	const pixels: RGB[] = [];
	for (let i = 0; i < data.length; i += 4) {
		const r = data[i];
		const g = data[i + 1];
		const b = data[i + 2];
		const a = data[i + 3];
		if (a < 128) continue;
		const brightness = (r + g + b) / 3;
		if (brightness < 10 || brightness > 245) continue;
		pixels.push({ r, g, b });
	}

	if (pixels.length === 0) {
		return ['#1a1a1a', '#333333', '#666666', '#999999', '#cccccc'];
	}

	const colors = kMeans(pixels, 8);

	colors.sort((a, b) => saturation(b) - saturation(a));

	const unique: RGB[] = [];
	for (const c of colors) {
		if (unique.every((u) => colorDistance(u, c) > 40)) {
			unique.push(c);
		}
	}

	return unique.slice(0, 7).map((c) => rgbToHex(c.r, c.g, c.b));
}

export function generateThemeFromColors(
	accentColor: string,
	surfaceColor: string,
	title: string,
	genreIds: number[] = []
): {
	id: string;
	name: string;
	surface: string[];
	accent: string[];
	crimson: string[];
	text: string;
	fontDisplay: string;
	fontBody: string;
} {
	const accentRgb = hexToRgb(accentColor);
	const surfaceRgb = hexToRgb(surfaceColor);

	const accentHsl = rgbToHsl(accentRgb.r, accentRgb.g, accentRgb.b);
	const surfaceHsl = rgbToHsl(surfaceRgb.r, surfaceRgb.g, surfaceRgb.b);

	const surface: string[] = [];
	surface.push(hslToHex(surfaceHsl.h, Math.min(surfaceHsl.s, 8), 96));
	surface.push(hslToHex(surfaceHsl.h, Math.min(surfaceHsl.s, 8), 91));
	surface.push(hslToHex(surfaceHsl.h, Math.min(surfaceHsl.s, 10), 82));
	surface.push(hslToHex(surfaceHsl.h, Math.min(surfaceHsl.s, 12), 65));
	surface.push(hslToHex(surfaceHsl.h, Math.min(surfaceHsl.s, 14), 48));
	surface.push(hslToHex(surfaceHsl.h, Math.min(surfaceHsl.s, 16), 35));
	surface.push(hslToHex(surfaceHsl.h, Math.min(surfaceHsl.s, 18), 26));
	surface.push(hslToHex(surfaceHsl.h, Math.min(surfaceHsl.s, 20), 19));
	surface.push(hslToHex(surfaceHsl.h, Math.min(surfaceHsl.s, 22), 14));
	surface.push(hslToHex(surfaceHsl.h, Math.min(surfaceHsl.s, 20), 10));
	surface.push(hslToHex(surfaceHsl.h, Math.min(surfaceHsl.s, 18), 7));
	surface.push(hslToHex(surfaceHsl.h, Math.min(surfaceHsl.s, 16), 4));

	const accent: string[] = [];
	accent.push(hslToHex(accentHsl.h, Math.min(accentHsl.s, 60), 97));
	accent.push(hslToHex(accentHsl.h, Math.min(accentHsl.s, 70), 88));
	accent.push(hslToHex(accentHsl.h, Math.min(accentHsl.s, 80), 74));
	accent.push(hslToHex(accentHsl.h, Math.min(accentHsl.s, 85), 58));
	accent.push(accentColor);
	accent.push(hslToHex(accentHsl.h, Math.min(accentHsl.s, 90), Math.max(accentHsl.l - 12, 20)));
	accent.push(hslToHex(accentHsl.h, Math.min(accentHsl.s, 85), Math.max(accentHsl.l - 24, 14)));

	const crimsonRgb = isReddish(accentRgb) ? accentRgb : hexToRgb(accentColor);
	const crimsonHsl = rgbToHsl(crimsonRgb.r, crimsonRgb.g, crimsonRgb.b);
	const crimson = [
		accentColor,
		hslToHex(crimsonHsl.h, crimsonHsl.s, Math.max(crimsonHsl.l - 18, 10))
	];

	const text = hslToHex(accentHsl.h, Math.min(accentHsl.s, 15), 95);

	const fonts = getFontsForGenres(genreIds);

	return {
		id: `poster-${Date.now()}`,
		name: title,
		surface,
		accent,
		crimson,
		text,
		fontDisplay: fonts.display,
		fontBody: fonts.body
	};
}

function hslToHex(h: number, s: number, l: number): string {
	const rgb = hslToRgb(h, s, l);
	return rgbToHex(rgb.r, rgb.g, rgb.b);
}
