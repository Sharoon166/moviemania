import { browser } from '$app/environment';

export interface CrossTabChannel {
	send(data: unknown): void;
	onReceive(handler: (data: unknown) => void): void;
}

/**
 * BroadcastChannel uses the structured clone algorithm, which rejects Svelte
 * `$state` proxies (as well as functions, DOM nodes, etc.) with a
 * "could not be cloned" DataCloneError. Anything we broadcast is plain data
 * that also gets persisted to localStorage, so a JSON round trip is always a
 * valid fallback for values that can't be structured cloned directly.
 */
function toCloneable(data: unknown): unknown {
	if (data === null || typeof data !== 'object') return data;

	try {
		return structuredClone(data);
	} catch {
		return JSON.parse(JSON.stringify(data));
	}
}

export function createCrossTabChannel(name: string): CrossTabChannel {
	if (!browser || typeof BroadcastChannel === 'undefined') {
		return { send: () => {}, onReceive: () => {} };
	}

	const channel = new BroadcastChannel(`moviemania-${name}`);

	return {
		send: (data) => {
			try {
				channel.postMessage(toCloneable(data));
			} catch (error) {
				// Never let a cross-tab broadcast break the calling feature.
				console.warn(`[cross-tab] Failed to broadcast on "${name}"`, error);
			}
		},
		onReceive: (handler) => channel.addEventListener('message', (e) => handler(e.data))
	};
}
