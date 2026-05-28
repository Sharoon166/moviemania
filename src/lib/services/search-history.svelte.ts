import { StorageService } from './storage';

export interface SearchHistoryItem {
	query: string;
	timestamp: number;
}

const storage = new StorageService<SearchHistoryItem[]>('moviemania_search_history');
const MAX_ITEMS = 10;

class SearchHistory {
	items = $state<SearchHistoryItem[]>(storage.load() ?? []);

	add(query: string) {
		const trimmed = query.trim();
		if (!trimmed) return;
		this.items = [
			{ query: trimmed, timestamp: Date.now() },
			...this.items.filter((i) => i.query.toLowerCase() !== trimmed.toLowerCase())
		].slice(0, MAX_ITEMS);
		storage.save(this.items);
	}

	remove(query: string) {
		this.items = this.items.filter((i) => i.query !== query);
		storage.save(this.items);
	}

	clear() {
		this.items = [];
		storage.save(this.items);
	}
}

export const searchHistory = new SearchHistory();
