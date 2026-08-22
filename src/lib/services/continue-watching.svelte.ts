import { StorageService } from './storage';
import { createCrossTabChannel } from './cross-tab';

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

	private channel = createCrossTabChannel('continue-watching');

	constructor() {
		this.channel.onReceive((data) => {
			if (Array.isArray(data)) this.items = data as ContinueWatchingItem[];
		});
	}

	private commit() {
		storage.save(this.items);
		this.channel.send(this.items);
	}

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
		this.commit();
	}

	remove(id: number, mediaType: 'movie' | 'tv') {
		this.items = this.items.filter((i) => !(i.id === id && i.mediaType === mediaType));
		this.commit();
	}

	clear() {
		this.items = [];
		this.commit();
	}

	reload() {
		const data = storage.load();
		if (data) this.items = data;
	}
}

export const continueWatching = new ContinueWatching();
