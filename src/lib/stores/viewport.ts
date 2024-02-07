import { writable } from 'svelte/store';

// Create a writable store for viewport dimensions
export const viewport = writable({
	width: window.innerWidth,
	height: window.innerHeight
});

// Update store when the window is resized
window.addEventListener('resize', () => {
	viewport.set({
		width: window.innerWidth,
		height: window.innerHeight
	});
});
