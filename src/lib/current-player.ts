import { browser } from '$app/environment';
import { writable } from 'svelte/store';

const STORAGE_KEY = 'whos-playing:current-player';

const createCurrentPlayerStore = () => {
	const { subscribe, set } = writable<number | null>(null);

	const persist = (playerId: number | null) => {
		set(playerId);
		if (!browser) return;

		if (playerId === null) {
			window.localStorage.removeItem(STORAGE_KEY);
		} else {
			window.localStorage.setItem(STORAGE_KEY, playerId.toString());
		}
	};

	const initialise = (validPlayerIds: number[]) => {
		if (!browser) return;

		const storedValue = window.localStorage.getItem(STORAGE_KEY);
		const storedPlayerId = storedValue === null ? null : Number(storedValue);
		persist(
			storedPlayerId !== null && validPlayerIds.includes(storedPlayerId) ? storedPlayerId : null
		);
	};

	return { subscribe, set: persist, initialise };
};

export const currentPlayer = createCurrentPlayerStore();
