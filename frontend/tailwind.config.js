/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                teal: {
                    700: '#0f766e', // Deep Teal
                    800: '#115e59', // Darker for hover
                    900: '#134e4a',
                },
                amber: {
                    100: '#fef3c7', // Soft Amber
                    500: '#f59e0b',
                }
            }
        },
    },
    plugins: [],
}
