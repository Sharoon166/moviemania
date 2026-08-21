import { browser } from '$app/environment';
import { SvelteSet } from 'svelte/reactivity';

interface Theme {
	id: string;
	name: string;
	surface: string[];
	accent: string[];
	crimson: string[];
	text: string;
	fontDisplay: string;
	fontBody: string;
}

const themes: Theme[] = [
	{
		id: 'obsidian-gold',
		name: 'Obsidian Gold',
		surface: [
			'#fafafa',
			'#f0f0f0',
			'#d9d9d9',
			'#b3b3b3',
			'#808080',
			'#5c5c5c',
			'#404040',
			'#2a2a2a',
			'#1a1a1a',
			'#121212',
			'#0a0a0a',
			'#050505'
		],
		accent: ['#fffbeb', '#fef3c7', '#fde68a', '#fcd34d', '#fbbf24', '#f59e0b', '#d97706'],
		crimson: ['#dc2626', '#b91c1c'],
		text: '#ffffff',
		fontDisplay: "'Syne', sans-serif",
		fontBody: "'DM Sans', sans-serif"
	},
	{
		id: 'netflix',
		name: 'Netflix',
		surface: [
			'#f5f5f5',
			'#e8e8e8',
			'#d1d1d1',
			'#a3a3a3',
			'#737373',
			'#525252',
			'#3b3b3b',
			'#262626',
			'#1a1a1a',
			'#141414',
			'#0d0d0d',
			'#080808'
		],
		accent: ['#fef2f2', '#fecaca', '#fca5a5', '#f87171', '#e50914', '#b20710', '#8b0008'],
		crimson: ['#ff1744', '#d50000'],
		text: '#ffffff',
		fontDisplay: "'Inter', sans-serif",
		fontBody: "'DM Sans', sans-serif"
	},
	{
		id: 'discord',
		name: 'Discord',
		surface: [
			'#f0eef5',
			'#ddd8ec',
			'#c2b8db',
			'#9a8cc0',
			'#7269a3',
			'#585187',
			'#433d6b',
			'#312d50',
			'#23203b',
			'#1c1930',
			'#151224',
			'#0e0c19'
		],
		accent: ['#eef0ff', '#d8dcff', '#b0b8ff', '#8894ff', '#7289da', '#5865f2', '#4752c4'],
		crimson: ['#ed4245', '#c03537'],
		text: '#ffffff',
		fontDisplay: "'Outfit', sans-serif",
		fontBody: "'DM Sans', sans-serif"
	},
	{
		id: 'doom',
		name: 'Doom',
		surface: [
			'#f0ece8',
			'#ddd5cd',
			'#c4b8ab',
			'#9f9186',
			'#7d6e64',
			'#625550',
			'#4d4340',
			'#3c3433',
			'#312a29',
			'#272221',
			'#1e1a19',
			'#161312'
		],
		accent: ['#fff5ed', '#ffe4cc', '#ffc799', '#f0a060', '#e07828', '#c45a1a', '#9c4614'],
		crimson: ['#c4381a', '#9c2c14'],
		text: '#e7e7e7',
		fontDisplay: "'Oxanium', sans-serif",
		fontBody: "'Oxanium', sans-serif"
	},
	{
		id: 'youtube',
		name: 'YouTube',
		surface: [
			'#fafafa',
			'#f0f0f0',
			'#dcdcdc',
			'#b0b0b0',
			'#808080',
			'#5a5a5a',
			'#424242',
			'#2c2c2c',
			'#1c1c1c',
			'#151515',
			'#0f0f0f',
			'#0a0a0a'
		],
		accent: ['#fef2f2', '#fecaca', '#fca5a5', '#ff5252', '#ff0000', '#cc0000', '#990000'],
		crimson: ['#ff1744', '#d50000'],
		text: '#ffffff',
		fontDisplay: "'Roboto', sans-serif",
		fontBody: "'Roboto', sans-serif"
	},
	{
		id: 'mono',
		name: 'Mono',
		surface: [
			'#fafafa',
			'#f4f4f5',
			'#e4e4e7',
			'#d4d4d8',
			'#a1a1aa',
			'#71717a',
			'#52525b',
			'#3f3f46',
			'#27272a',
			'#1f1f22',
			'#18181b',
			'#09090b'
		],
		accent: ['#fafafa', '#f4f4f5', '#e4e4e7', '#d4d4d8', '#a1a1aa', '#71717a', '#52525b'],
		crimson: ['#ef4444', '#dc2626'],
		text: '#fafafa',
		fontDisplay: "'Space Grotesk', sans-serif",
		fontBody: "'Inter', sans-serif"
	},
	{
		id: 'sakura',
		name: 'Sakura',
		surface: [
			'#faf5f7',
			'#f0e4ea',
			'#e0c8d4',
			'#c8a0b4',
			'#a87894',
			'#8a5878',
			'#6e4260',
			'#54334a',
			'#3e2638',
			'#2e1c2a',
			'#221420',
			'#180e16'
		],
		accent: ['#fff0f6', '#ffd6e8', '#ffadc8', '#ff80aa', '#ff5090', '#e83078', '#c01060'],
		crimson: ['#ff1744', '#d50000'],
		text: '#fff0f5',
		fontDisplay: "'Poiret One', sans-serif",
		fontBody: "'DM Sans', sans-serif"
	},
	{
		id: 'emerald',
		name: 'Emerald',
		surface: [
			'#f8faf9',
			'#eef2f0',
			'#d8e0dc',
			'#b0beb8',
			'#7a9488',
			'#587268',
			'#3e5448',
			'#2c3c34',
			'#1e2a24',
			'#16201a',
			'#0e1612',
			'#080c0a'
		],
		accent: ['#f0fdf4', '#dcfce7', '#bbf7d0', '#86efac', '#4ade80', '#22c55e', '#16a34a'],
		crimson: ['#ef4444', '#dc2626'],
		text: '#f0fdf4',
		fontDisplay: "'Tenor Sans', sans-serif",
		fontBody: "'Inter', sans-serif"
	}
];

const displayFontOptions = [
	{ id: 'syne', family: "'Syne', sans-serif", label: 'Syne' },
	{ id: 'space-grotesk', family: "'Space Grotesk', sans-serif", label: 'Space Grotesk' },
	{ id: 'inter', family: "'Inter', sans-serif", label: 'Inter' },
	{ id: 'playfair', family: "'Playfair Display', serif", label: 'Playfair Display' },
	{ id: 'outfit', family: "'Outfit', sans-serif", label: 'Outfit' },
	{ id: 'oxanium', family: "'Oxanium', sans-serif", label: 'Oxanium' },
	{ id: 'montserrat', family: "'Montserrat', sans-serif", label: 'Montserrat' },
	{ id: 'raleway', family: "'Raleway', sans-serif", label: 'Raleway' },
	{ id: 'dm-sans', family: "'DM Sans', sans-serif", label: 'DM Sans' },
	{ id: 'poiret-one', family: "'Poiret One', sans-serif", label: 'Poiret One' },
	{ id: 'cormorant-garamond', family: "'Cormorant Garamond', serif", label: 'Cormorant Garamond' },
	{ id: 'josefin-sans', family: "'Josefin Sans', sans-serif", label: 'Josefin Sans' },
	{ id: 'righteous', family: "'Righteous', sans-serif", label: 'Righteous' },
	{ id: 'tenor-sans', family: "'Tenor Sans', sans-serif", label: 'Tenor Sans' }
];

const bodyFontOptions = [
	{ id: 'dm-sans', family: "'DM Sans', sans-serif", label: 'DM Sans' },
	{ id: 'inter', family: "'Inter', sans-serif", label: 'Inter' },
	{ id: 'lora', family: "'Lora', serif", label: 'Lora' },
	{ id: 'space-grotesk', family: "'Space Grotesk', sans-serif", label: 'Space Grotesk' },
	{ id: 'source-code-pro', family: "'Source Code Pro', monospace", label: 'Source Code Pro' },
	{ id: 'oxanium', family: "'Oxanium', sans-serif", label: 'Oxanium' },
	{ id: 'montserrat', family: "'Montserrat', sans-serif", label: 'Montserrat' },
	{ id: 'nunito', family: "'Nunito', sans-serif", label: 'Nunito' },
	{ id: 'raleway', family: "'Raleway', sans-serif", label: 'Raleway' },
	{ id: 'roboto', family: "'Roboto', sans-serif", label: 'Roboto' }
];

const FONT_URLS: Record<string, string> = {
	syne: 'https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&display=swap',
	'dm-sans':
		'https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap',
	'space-grotesk':
		'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap',
	inter: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
	playfair:
		'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&display=swap',
	lora: 'https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600;700&display=swap',
	outfit: 'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap',
	oxanium: 'https://fonts.googleapis.com/css2?family=Oxanium:wght@300;400;500;600;700&display=swap',
	montserrat:
		'https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap',
	raleway: 'https://fonts.googleapis.com/css2?family=Raleway:wght@300;400;500;600;700&display=swap',
	'source-code-pro':
		'https://fonts.googleapis.com/css2?family=Source+Code+Pro:wght@300;400;500;600;700&display=swap',
	nunito: 'https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;500;600;700&display=swap',
	roboto: 'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap',
	'poiret-one':
		'https://fonts.googleapis.com/css2?family=Poiret+One&display=swap',
	'cormorant-garamond':
		'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&display=swap',
	'josefin-sans':
		'https://fonts.googleapis.com/css2?family=Josefin+Sans:wght@300;400;500;600;700&display=swap',
	righteous:
		'https://fonts.googleapis.com/css2?family=Righteous&display=swap',
	'tenor-sans':
		'https://fonts.googleapis.com/css2?family=Tenor+Sans&display=swap'
};

const FONT_KEYS_BY_FAMILY: Record<string, string[]> = {
	Syne: ['syne'],
	'DM Sans': ['dm-sans'],
	'Space Grotesk': ['space-grotesk'],
	Inter: ['inter'],
	'Playfair Display': ['playfair'],
	Lora: ['lora'],
	Outfit: ['outfit'],
	Oxanium: ['oxanium'],
	Montserrat: ['montserrat'],
	Raleway: ['raleway'],
	'Source Code Pro': ['source-code-pro'],
	Nunito: ['nunito'],
	Roboto: ['roboto'],
	'Poiret One': ['poiret-one'],
	'Cormorant Garamond': ['cormorant-garamond'],
	'Josefin Sans': ['josefin-sans'],
	Righteous: ['righteous'],
	'Tenor Sans': ['tenor-sans']
};

class ThemeStore {
	activeThemeId = $state('doom');
	activeDisplayFont = $state("'Oxanium', sans-serif");
	activeBodyFont = $state("'Oxanium', sans-serif");

	private styleEl: HTMLStyleElement | null = null;
	private loadedFonts = new SvelteSet<string>();

	private hexToRgba(hex: string, alpha: number): string {
		const r = parseInt(hex.slice(1, 3), 16);
		const g = parseInt(hex.slice(3, 5), 16);
		const b = parseInt(hex.slice(5, 7), 16);
		return `rgba(${r}, ${g}, ${b}, ${alpha})`;
	}

	private extractFamilyName(cssFamily: string): string {
		return cssFamily.split(',')[0].replace(/['"]/g, '').trim();
	}

	private buildStyleTag(
		text: string,
		accent: string[],
		surface: string[],
		fontDisplay: string,
		fontBody: string
	): string {
		const selectionRgba = this.hexToRgba(accent[4], 0.3);
		const thumbColor = surface[6];
		const thumbHover = surface[5];
		return `
			body {
				color: ${text} !important;
				font-family: ${fontBody} !important;
			}
			h1, h2, h3, h4, h5, h6 {
				font-family: ${fontDisplay} !important;
			}
			::selection { background-color: ${selectionRgba} !important; }
			::-webkit-scrollbar-thumb { background: ${thumbColor} !important; }
			::-webkit-scrollbar-thumb:hover { background: ${thumbHover} !important; }
		`;
	}

	private async loadFontForFamily(family: string): Promise<void> {
		const keys = FONT_KEYS_BY_FAMILY[family] ?? [];
		const toLoad = keys.filter((k) => !this.loadedFonts.has(k));
		if (toLoad.length === 0) return;

		await Promise.all(
			toLoad.map(
				(k) =>
					new Promise<void>((resolve) => {
						const link = document.createElement('link');
						link.rel = 'stylesheet';
						link.href = FONT_URLS[k];
						link.onload = () => {
							this.loadedFonts.add(k);
							resolve();
						};
						link.onerror = () => resolve();
						document.head.appendChild(link);
					})
			)
		);
	}

	applyTheme(theme: Theme) {
		if (!browser) return;
		const root = document.documentElement;

		const surfaceKeys = [50, 100, 200, 300, 400, 500, 600, 700, 800, 850, 900, 950];
		theme.surface.forEach((color, i) => {
			root.style.setProperty(`--color-surface-${surfaceKeys[i]}`, color);
		});

		const accentKeys = [50, 100, 200, 300, 400, 500, 600];
		theme.accent.forEach((color, i) => {
			root.style.setProperty(`--color-gold-${accentKeys[i]}`, color);
		});

		theme.crimson.forEach((color, i) => {
			root.style.setProperty(`--color-crimson-${i === 0 ? '500' : '600'}`, color);
		});

		root.style.setProperty('--font-display', theme.fontDisplay);
		root.style.setProperty('--font-body', theme.fontBody);

		if (!this.styleEl) {
			const el = document.createElement('style');
			el.id = 'theme-switcher-overrides';
			document.head.appendChild(el);
			this.styleEl = el;
		}

		this.styleEl.textContent = this.buildStyleTag(
			theme.text,
			theme.accent,
			theme.surface,
			theme.fontDisplay,
			theme.fontBody
		);
	}

	async selectTheme(theme: Theme) {
		await Promise.all([
			this.loadFontForFamily(this.extractFamilyName(theme.fontDisplay)),
			this.loadFontForFamily(this.extractFamilyName(theme.fontBody))
		]);
		this.activeThemeId = theme.id;
		this.activeDisplayFont = theme.fontDisplay;
		this.activeBodyFont = theme.fontBody;
		this.applyTheme(theme);
		this.saveState();
	}

	async selectDisplayFont(family: string) {
		await this.loadFontForFamily(this.extractFamilyName(family));
		this.activeDisplayFont = family;
		const root = document.documentElement;
		root.style.setProperty('--font-display', family);

		if (this.styleEl) {
			const currentTheme = themes.find((t) => t.id === this.activeThemeId);
			const surface = currentTheme?.surface ?? themes[0].surface;
			const accent = currentTheme?.accent ?? themes[0].accent;
			const text = currentTheme?.text ?? themes[0].text;
			this.styleEl.textContent = this.buildStyleTag(
				text,
				accent,
				surface,
				family,
				this.activeBodyFont
			);
		}
		this.saveState();
	}

	async selectBodyFont(family: string) {
		await this.loadFontForFamily(this.extractFamilyName(family));
		this.activeBodyFont = family;
		const root = document.documentElement;
		root.style.setProperty('--font-body', family);

		if (this.styleEl) {
			const currentTheme = themes.find((t) => t.id === this.activeThemeId);
			const surface = currentTheme?.surface ?? themes[0].surface;
			const accent = currentTheme?.accent ?? themes[0].accent;
			const text = currentTheme?.text ?? themes[0].text;
			this.styleEl.textContent = this.buildStyleTag(
				text,
				accent,
				surface,
				this.activeDisplayFont,
				family
			);
		}
		this.saveState();
	}

	resetTheme() {
		if (!browser) return;
		const root = document.documentElement;

		const varsToReset: string[] = [];
		for (let i = 0; i < root.style.length; i++) {
			const prop = root.style.item(i);
			if (prop && (prop.startsWith('--color-') || prop.startsWith('--font-'))) {
				varsToReset.push(prop);
			}
		}
		varsToReset.forEach((v) => root.style.removeProperty(v));

		if (this.styleEl) {
			this.styleEl.textContent = '';
		}

		this.activeThemeId = 'doom';
		this.activeDisplayFont = "'Oxanium', sans-serif";
		this.activeBodyFont = "'Oxanium', sans-serif";
		localStorage.removeItem('theme-switcher');
	}

	saveState() {
		if (!browser) return;
		localStorage.setItem(
			'theme-switcher',
			JSON.stringify({
				themeId: this.activeThemeId,
				displayFont: this.activeDisplayFont,
				bodyFont: this.activeBodyFont
			})
		);
	}

	restoreState() {
		if (!browser) return;
		const raw = localStorage.getItem('theme-switcher');
		if (!raw) return;
		try {
			const data = JSON.parse(raw);
			const theme = themes.find((t) => t.id === data.themeId);
			if (theme) {
				this.activeThemeId = data.themeId;
				this.activeDisplayFont = data.displayFont ?? theme.fontDisplay;
				this.activeBodyFont = data.bodyFont ?? theme.fontBody;

				Promise.all([
					this.loadFontForFamily(this.extractFamilyName(theme.fontDisplay)),
					this.loadFontForFamily(this.extractFamilyName(theme.fontBody))
				]).then(() => {
					this.applyTheme(theme);
					const root = document.documentElement;
					root.style.setProperty('--font-display', this.activeDisplayFont);
					root.style.setProperty('--font-body', this.activeBodyFont);

					if (this.styleEl) {
						this.styleEl.textContent = this.buildStyleTag(
							theme.text,
							theme.accent,
							theme.surface,
							this.activeDisplayFont,
							this.activeBodyFont
						);
					}
				});
			}
		} catch {}
	}
}

export const themeStore = new ThemeStore();
export { themes, displayFontOptions, bodyFontOptions };
export type { Theme };
