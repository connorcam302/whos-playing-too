import { browser } from '$app/environment';
import { writable } from 'svelte/store';

const STORAGE_KEY = 'whos-playing:show-beta-impact';

const createBetaImpactPreference = () => {
	const { subscribe, set } = writable(false);
	const persist = (enabled: boolean) => {
		set(enabled);
		if (!browser) return;
		try {
			window.localStorage.setItem(STORAGE_KEY, String(enabled));
		} catch {
			// Still allow the preference for this session when storage is unavailable.
		}
	};

	const initialise = () => {
		if (!browser) return;
		try {
			set(window.localStorage.getItem(STORAGE_KEY) === 'true');
		} catch {
			set(false);
		}
		const handleStorage = (event: StorageEvent) => {
			if (event.key === STORAGE_KEY || event.key === null) set(event.newValue === 'true');
		};
		window.addEventListener('storage', handleStorage);
		return () => window.removeEventListener('storage', handleStorage);
	};

	return { subscribe, set: persist, initialise };
};

export const showBetaImpact = createBetaImpactPreference();
