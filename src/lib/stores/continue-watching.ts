import { browser } from '$app/environment';

export interface ContinueWatchingItem {
	id: number;
	mediaType: 'movie' | 'tv';
	title: string;
	posterPath: string | null;
	season?: number;
	episode?: number;
	progress: number;
	updatedAt?: number;
}

const STORAGE_KEY = 'moviemania_continue_watching';
const MAX_ITEMS = 20;

function load(): ContinueWatchingItem[] {
	if (!browser) return [];
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		return raw ? JSON.parse(raw) : [];
	} catch {
		return [];
	}
}

function save(items: ContinueWatchingItem[]) {
	if (!browser) return;
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
	} catch {
		/* quota exceeded */
	}
}

export function getContinueWatching(): ContinueWatchingItem[] {
	return load();
}

export function upsertContinueWatching(item: ContinueWatchingItem) {
	const items = load();
	const idx = items.findIndex((i) => i.id === item.id && i.mediaType === item.mediaType);
	if (idx >= 0) {
		items[idx] = { ...items[idx], ...item, updatedAt: Date.now() };
	} else {
		items.unshift({ ...item, updatedAt: Date.now() });
		if (items.length > MAX_ITEMS) items.length = MAX_ITEMS;
	}
	save(items);
}

export function removeContinueWatching(id: number, mediaType: 'movie' | 'tv') {
	const items = load().filter((i) => !(i.id === id && i.mediaType === mediaType));
	save(items);
}
