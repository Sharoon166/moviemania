import { browser } from '$app/environment';
import { SvelteSet } from 'svelte/reactivity';
import { embedSources, type EmbedSource } from '$lib/api/tmdb';
import { createCrossTabChannel } from './cross-tab';

const STORAGE_KEY = 'moviemania_app_settings';

interface AppSettingsData {
	defaultMediaFilter: 'all' | 'movie' | 'tv';
	defaultSortBy: string;
	itemsPerPage: number;
	defaultServerId: string;
	showHeatmap: boolean;
	enableThemeGenerator: boolean;
}

const defaults: AppSettingsData = {
	defaultMediaFilter: 'all',
	defaultSortBy: 'popularity.desc',
	itemsPerPage: 20,
	defaultServerId: embedSources[0].id,
	showHeatmap: true,
	enableThemeGenerator: true
};

class AppSettings {
	defaultMediaFilter = $state<'all' | 'movie' | 'tv'>(defaults.defaultMediaFilter);
	defaultSortBy = $state(defaults.defaultSortBy);
	itemsPerPage = $state(defaults.itemsPerPage);
	defaultServerId = $state(defaults.defaultServerId);
	showHeatmap = $state(defaults.showHeatmap);
	enableThemeGenerator = $state(defaults.enableThemeGenerator);

	private channel = createCrossTabChannel('settings');

	constructor() {
		this.channel.onReceive((data) => this.apply(data as Partial<AppSettingsData>));
	}

	get defaultServer(): EmbedSource {
		return embedSources.find((s) => s.id === this.defaultServerId) ?? embedSources[0];
	}

	private apply(data: Partial<AppSettingsData>) {
		if (data.defaultMediaFilter) this.defaultMediaFilter = data.defaultMediaFilter;
		if (data.defaultSortBy) this.defaultSortBy = data.defaultSortBy;
		if (data.itemsPerPage) this.itemsPerPage = data.itemsPerPage;
		if (data.defaultServerId) this.defaultServerId = data.defaultServerId;
		if (data.showHeatmap !== undefined) this.showHeatmap = data.showHeatmap;
		if (data.enableThemeGenerator !== undefined) this.enableThemeGenerator = data.enableThemeGenerator;
	}

	load() {
		if (!browser) return;
		try {
			const raw = localStorage.getItem(STORAGE_KEY);
			if (!raw) return;
			this.apply(JSON.parse(raw));
		} catch {}
	}

	save() {
		if (!browser) return;
		try {
			const data: AppSettingsData = {
				defaultMediaFilter: this.defaultMediaFilter,
				defaultSortBy: this.defaultSortBy,
				itemsPerPage: this.itemsPerPage,
				defaultServerId: this.defaultServerId,
				showHeatmap: this.showHeatmap,
				enableThemeGenerator: this.enableThemeGenerator
			};
			localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
			this.channel.send(data);
		} catch {}
	}

	setDefaultServer(id: string) {
		this.defaultServerId = id;
		this.save();
	}

	setDefaultMediaFilter(filter: 'all' | 'movie' | 'tv') {
		this.defaultMediaFilter = filter;
		this.save();
	}

	setDefaultSortBy(sort: string) {
		this.defaultSortBy = sort;
		this.save();
	}

	setItemsPerPage(count: number) {
		this.itemsPerPage = count;
		this.save();
	}

	toggleHeatmap() {
		this.showHeatmap = !this.showHeatmap;
		this.save();
	}

	toggleThemeGenerator() {
		this.enableThemeGenerator = !this.enableThemeGenerator;
		this.save();
	}

	reset() {
		this.defaultMediaFilter = defaults.defaultMediaFilter;
		this.defaultSortBy = defaults.defaultSortBy;
		this.itemsPerPage = defaults.itemsPerPage;
		this.defaultServerId = defaults.defaultServerId;
		this.showHeatmap = defaults.showHeatmap;
		this.enableThemeGenerator = defaults.enableThemeGenerator;
		this.save();
	}
}

export const appSettings = new AppSettings();
