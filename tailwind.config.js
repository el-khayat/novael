/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        black: '#0E0E0E',
        ivory: '#F6F3EE',
        gold: '#C6A97A',
        plum: '#2D133A',
        mauve: '#B79BBF',
        'rose-nude': '#E8C6C6',
        taupe: '#A8A17A',
        'admin-bg': '#0A0A0A',
        'admin-surface': '#141414',
      },
      fontFamily: {
        display: ['Cinzel', 'Playfair Display', 'Georgia', 'serif'],
        body: ['Montserrat', 'Lato', 'Open Sans', 'sans-serif'],
      },
      letterSpacing: {
        widest: '0.2em',
        luxe: '0.12em',
        soft: '0.03em',
      },
      maxWidth: {
        container: '1440px',
      },
      transitionTimingFunction: {
        luxe: 'cubic-bezier(0.16, 1, 0.3, 1)',
        smooth: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      },
      boxShadow: {
        gold: '0 0 0 1px rgba(198, 169, 122, 0.3)',
        'gold-strong': '0 0 0 1px rgba(198, 169, 122, 0.6)',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        pulseGold: {
          '0%,100%': { opacity: 1 },
          '50%': { opacity: 0.4 },
        },
        bounceSubtle: {
          '0%,100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.2)' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.8s linear infinite',
        marquee: 'marquee 28s linear infinite',
        pulseGold: 'pulseGold 2s ease-in-out infinite',
        bounceSubtle: 'bounceSubtle 0.4s ease',
      },
    },
  },
  plugins: [],
}
