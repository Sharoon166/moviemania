import { browser } from '$app/environment';
import { SvelteSet } from 'svelte/reactivity';
import { embedSources, type EmbedSource } from '$lib/api/tmdb';

const STORAGE_KEY = 'moviemania_app_settings';

interface AppSettingsData {
	defaultMediaFilter: 'all' | 'movie' | 'tv';
	defaultSortBy: string;
	itemsPerPage: number;
	defaultServerId: string;
}

const defaults: AppSettingsData = {
	defaultMediaFilter: 'all',
	defaultSortBy: 'popularity.desc',
	itemsPerPage: 20,
	defaultServerId: embedSources[0].id
};

class AppSettings {
	defaultMediaFilter = $state<'all' | 'movie' | 'tv'>(defaults.defaultMediaFilter);
	defaultSortBy = $state(defaults.defaultSortBy);
	itemsPerPage = $state(defaults.itemsPerPage);
	defaultServerId = $state(defaults.defaultServerId);

	get defaultServer(): EmbedSource {
		return embedSources.find((s) => s.id === this.defaultServerId) ?? embedSources[0];
	}

	load() {
		if (!browser) return;
		try {
			const raw = localStorage.getItem(STORAGE_KEY);
			if (!raw) return;
			const data: Partial<AppSettingsData> = JSON.parse(raw);
			if (data.defaultMediaFilter) this.defaultMediaFilter = data.defaultMediaFilter;
			if (data.defaultSortBy) this.defaultSortBy = data.defaultSortBy;
			if (data.itemsPerPage) this.itemsPerPage = data.itemsPerPage;
			if (data.defaultServerId) this.defaultServerId = data.defaultServerId;
		} catch {}
	}

	save() {
		if (!browser) return;
		try {
			const data: AppSettingsData = {
				defaultMediaFilter: this.defaultMediaFilter,
				defaultSortBy: this.defaultSortBy,
				itemsPerPage: this.itemsPerPage,
				defaultServerId: this.defaultServerId
			};
			localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
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

	reset() {
		this.defaultMediaFilter = defaults.defaultMediaFilter;
		this.defaultSortBy = defaults.defaultSortBy;
		this.itemsPerPage = defaults.itemsPerPage;
		this.defaultServerId = defaults.defaultServerId;
		this.save();
	}
}

export const appSettings = new AppSettings();
