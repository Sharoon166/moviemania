import { StorageService } from './storage';
import { createCrossTabChannel } from './cross-tab';

export interface SearchHistoryItem {
	query: string;
	timestamp: number;
}

const storage = new StorageService<SearchHistoryItem[]>('moviemania_search_history');
const MAX_ITEMS = 10;

class SearchHistory {
	items = $state<SearchHistoryItem[]>(storage.load() ?? []);

	private channel = createCrossTabChannel('search-history');

	constructor() {
		this.channel.onReceive((data) => {
			if (Array.isArray(data)) this.items = data as SearchHistoryItem[];
		});
	}

	private commit() {
		storage.save(this.items);
		this.channel.send(this.items);
	}

	add(query: string) {
		const trimmed = query.trim();
		if (!trimmed) return;
		this.items = [
			{ query: trimmed, timestamp: Date.now() },
			...this.items.filter((i) => i.query.toLowerCase() !== trimmed.toLowerCase())
		].slice(0, MAX_ITEMS);
		this.commit();
	}

	remove(query: string) {
		this.items = this.items.filter((i) => i.query !== query);
		this.commit();
	}

	clear() {
		this.items = [];
		this.commit();
	}
}

export const searchHistory = new SearchHistory();
