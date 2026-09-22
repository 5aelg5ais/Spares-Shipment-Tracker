/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bae0fd',
          500: '#0284c7',
          800: '#075985',
          900: '#0c4a6e',
          darkNavy: '#0A2540',
          hoverNavy: '#13355A',
        },
        iceBg: '#F3F8FB',
        iceCard: '#FFFFFF',
        iceBorder: '#E2E9F0',
        badge: {
          pendingAirwaybill: '#D9EEF9',
          pendingAirwaybillText: '#004B87',
          delayed: '#B91C1C',
          delayedText: '#FFFFFF',
          pendingCustom: '#D6EAFA',
          pendingCustomText: '#105080',
          inTransit: '#D1ECF1',
          inTransitText: '#0C5460',
          delivered: '#D4EDDA',
          deliveredText: '#155724',
        }
      },
      fontFamily: {
        sans: ['Segoe UI', '-apple-system', 'BlinkMacSystemFont', 'Roboto', 'Helvetica Neue', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
