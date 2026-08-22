import { browser } from '$app/environment';

export interface CrossTabChannel {
	send(data: unknown): void;
	onReceive(handler: (data: unknown) => void): void;
}

export function createCrossTabChannel(name: string): CrossTabChannel {
	if (!browser || typeof BroadcastChannel === 'undefined') {
		return { send: () => {}, onReceive: () => {} };
	}

	const channel = new BroadcastChannel(`moviemania-${name}`);

	return {
		send: (data) => channel.postMessage(data),
		onReceive: (handler) =>
			channel.addEventListener('message', (e) => handler(e.data))
	};
}
