/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			fontFamily: {
				sans: ['Inter', 'sans-serif'],
				display: ['Poppins', 'sans-serif']
			}
		},
		dropShadow: {
			glow: ['0 0px 20px rgba(255,255, 255, 0.35)', '0 0px 65px rgba(255, 255,255, 0.2)']
		}
	},
	plugins: []
};
