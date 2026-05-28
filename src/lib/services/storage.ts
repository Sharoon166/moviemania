import { browser } from '$app/environment';

export class StorageService<T> {
	constructor(private key: string) {}

	load(): T | null {
		if (!browser) return null;
		try {
			const raw = localStorage.getItem(this.key);
			return raw ? JSON.parse(raw) : null;
		} catch {
			return null;
		}
	}

	save(data: T): void {
		if (!browser) return;
		try {
			localStorage.setItem(this.key, JSON.stringify(data));
		} catch {
			/* quota exceeded */
		}
	}

	remove(): void {
		if (!browser) return;
		try {
			localStorage.removeItem(this.key);
		} catch {
			/* noop */
		}
	}
}
