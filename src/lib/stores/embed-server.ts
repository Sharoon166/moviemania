import { browser } from '$app/environment';
import { embedSources, type EmbedSource } from '$lib/api/tmdb';

const STORAGE_KEY = 'moviemania_embed_server';

export function getPreferredServer(): EmbedSource {
	if (!browser) return embedSources[0];
	try {
		const id = localStorage.getItem(STORAGE_KEY);
		if (!id) return embedSources[0];
		return embedSources.find((s) => s.id === id) ?? embedSources[0];
	} catch {
		return embedSources[0];
	}
}

export function setPreferredServer(id: string) {
	if (!browser) return;
	try {
		localStorage.setItem(STORAGE_KEY, id);
	} catch {
		/* noop */
	}
}
