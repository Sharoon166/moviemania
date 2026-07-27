import { StorageService } from './storage';

export interface ContinueWatchingItem {
	id: number;
	mediaType: 'movie' | 'tv';
	title: string;
	posterPath: string | null;
	season?: number;
	episode?: number;
	progress: number;
	runtime: number;
	updatedAt?: number;
}

const storage = new StorageService<ContinueWatchingItem[]>('moviemania_continue_watching');
const MAX_ITEMS = 20;

class ContinueWatching {
	items = $state<ContinueWatchingItem[]>(storage.load() ?? []);

	upsert(item: Omit<ContinueWatchingItem, 'updatedAt'>) {
		const existing = [...this.items];
		const idx = existing.findIndex((i) => i.id === item.id && i.mediaType === item.mediaType);
		const entry = { ...item, updatedAt: Date.now() };
		if (idx >= 0) {
			existing[idx] = { ...existing[idx], ...entry };
		} else {
			existing.unshift(entry);
			if (existing.length > MAX_ITEMS) existing.length = MAX_ITEMS;
		}
		this.items = existing;
		storage.save(this.items);
	}

	remove(id: number, mediaType: 'movie' | 'tv') {
		this.items = this.items.filter((i) => !(i.id === id && i.mediaType === mediaType));
		storage.save(this.items);
	}

	clear() {
		this.items = [];
		storage.save(this.items);
	}

	reload() {
		const data = storage.load();
		if (data) this.items = data;
	}
}

export const continueWatching = new ContinueWatching();
