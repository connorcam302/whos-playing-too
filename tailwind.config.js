/** @type {import('tailwindcss').Config} */
export default {
    content: ['./src/**/*.{html,js,svelte,ts}'],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Nunito Sans', 'sans-serif'],
                body: ['Nunito Sans', 'sans-serif'],
                display: ['Poppins', 'sans-serif']
            },
            backgroundSize: {
                'size-200': '200% 200%'
            },
            backgroundPosition: {
                'pos-0': '0% 0%',
                'pos-100': '100% 100%'
            }
        },
        dropShadow: {
            glow: ['0 0px 20px rgba(255,255, 255, 0.35)', '0 0px 65px rgba(255, 255,255, 0.2)']
        }
    },
    plugins: []
};
