// vite.config.js
import { defineConfig } from 'vite';
import { sveltekit } from '@sveltejs/kit/vite';
import Icons from 'unplugin-icons/vite';
import tailwindcss from '@tailwindcss/vite';


export default defineConfig({
	plugins: [
		sveltekit(),
		tailwindcss(),
		Icons({
			compiler: 'svelte'
		})
	]
});
