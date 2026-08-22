import { StorageService } from './storage';
import { createCrossTabChannel } from './cross-tab';

export type MediaType = 'movie' | 'tv';

export interface WatchlistItem {
	id: number;
	mediaType: MediaType;
	title: string;
	posterPath: string | null;
	genres: { id: number; name: string }[];
	tmdbRating: number;
	releaseYear: number | null;
	runtime: number | null;
	watched: boolean;
	notes: string;
	tags: string[];
	addedAt: number;
}

export type SortField = 'addedAt' | 'tmdbRating' | 'releaseYear' | 'title' | 'runtime';
export type SortDir = 'asc' | 'desc';

export interface FilterOptions {
	mediaType?: MediaType;
	watched?: boolean;
	genre?: string;
	yearMin?: number;
	yearMax?: number;
	ratingMin?: number;
	query?: string;
	sort?: SortField;
	dir?: SortDir;
}

const storage = new StorageService<WatchlistItem[]>('moviemania_watchlist');

class Watchlist {
	items = $state<WatchlistItem[]>(storage.load() ?? []);

	private channel = createCrossTabChannel('watchlist');

	constructor() {
		this.channel.onReceive((data) => {
			if (Array.isArray(data)) this.items = data as WatchlistItem[];
		});
	}

	private commit(): void {
		storage.save(this.items);
		this.channel.send(this.items);
	}

	has(id: number, mediaType: MediaType): boolean {
		return this.items.some((i) => i.id === id && i.mediaType === mediaType);
	}

	add(item: Omit<WatchlistItem, 'watched' | 'notes' | 'tags' | 'addedAt'>): void {
		const existing = [...this.items];
		const idx = existing.findIndex((i) => i.id === item.id && i.mediaType === item.mediaType);
		if (idx >= 0) {
			existing[idx] = { ...existing[idx], ...item };
		} else {
			existing.unshift({
				...item,
				watched: false,
				notes: '',
				tags: [],
				addedAt: Date.now()
			});
		}
		this.items = existing;
		this.commit();
	}

	toggle(item: Omit<WatchlistItem, 'watched' | 'notes' | 'tags' | 'addedAt'>): boolean {
		if (this.has(item.id, item.mediaType)) {
			this.remove(item.id, item.mediaType);
			return false;
		}
		this.add(item);
		return true;
	}

	remove(id: number, mediaType: MediaType): void {
		this.items = this.items.filter((i) => !(i.id === id && i.mediaType === mediaType));
		this.commit();
	}

	toggleWatched(id: number, mediaType: MediaType): void {
		this.items = this.items.map((i) =>
			i.id === id && i.mediaType === mediaType ? { ...i, watched: !i.watched } : i
		);
		this.commit();
	}

	updateNotes(id: number, mediaType: MediaType, notes: string): void {
		this.items = this.items.map((i) =>
			i.id === id && i.mediaType === mediaType ? { ...i, notes } : i
		);
		this.commit();
	}

	updateTags(id: number, mediaType: MediaType, tags: string[]): void {
		this.items = this.items.map((i) =>
			i.id === id && i.mediaType === mediaType ? { ...i, tags } : i
		);
		this.commit();
	}

	filter(opts: FilterOptions = {}): WatchlistItem[] {
		let result = this.items;

		if (opts.mediaType) {
			result = result.filter((i) => i.mediaType === opts.mediaType);
		}
		if (opts.watched !== undefined) {
			result = result.filter((i) => i.watched === opts.watched);
		}
		if (opts.genre) {
			const g = opts.genre.toLowerCase();
			result = result.filter((i) => i.genres.some((genre) => genre.name.toLowerCase() === g));
		}
		if (opts.yearMin !== undefined) {
			result = result.filter((i) => i.releaseYear !== null && i.releaseYear >= opts.yearMin!);
		}
		if (opts.yearMax !== undefined) {
			result = result.filter((i) => i.releaseYear !== null && i.releaseYear <= opts.yearMax!);
		}
		if (opts.ratingMin !== undefined) {
			result = result.filter((i) => i.tmdbRating >= opts.ratingMin!);
		}
		if (opts.query) {
			const q = opts.query.toLowerCase();
			result = result.filter((i) => i.title.toLowerCase().includes(q));
		}

		if (opts.sort) {
			const dir = opts.dir === 'asc' ? 1 : -1;
			result = [...result].sort((a, b) => {
				let cmp = 0;
				switch (opts.sort) {
					case 'addedAt':
						cmp = a.addedAt - b.addedAt;
						break;
					case 'tmdbRating':
						cmp = a.tmdbRating - b.tmdbRating;
						break;
					case 'releaseYear':
						cmp = (a.releaseYear ?? 0) - (b.releaseYear ?? 0);
						break;
					case 'title':
						cmp = a.title.localeCompare(b.title);
						break;
					case 'runtime':
						cmp = (a.runtime ?? 0) - (b.runtime ?? 0);
						break;
				}
				return cmp * dir;
			});
		}

		return result;
	}

	exportJson(): string {
		return JSON.stringify(this.items, null, 2);
	}

	importJson(json: string): { added: number; merged: number } {
		const parsed: WatchlistItem[] = JSON.parse(json);
		let added = 0;
		let merged = 0;
		const map = new Map<string, WatchlistItem>();

		for (const item of this.items) {
			map.set(`${item.mediaType}-${item.id}`, item);
		}

		for (const item of parsed) {
			const key = `${item.mediaType}-${item.id}`;
			if (map.has(key)) {
				map.set(key, { ...map.get(key)!, ...item });
				merged++;
			} else {
				map.set(key, item);
				added++;
			}
		}

		this.items = [...map.values()];
		this.commit();
		return { added, merged };
	}

	clear(): void {
		this.items = [];
		this.commit();
	}
}

export const watchlist = new Watchlist();
