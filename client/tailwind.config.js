/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Pedinno AI blue
        brand: {
          50: '#eef6ff', 100: '#d9ecff', 200: '#b6dcff', 300: '#7fc3ff', 400: '#38a4ff',
          500: '#0f7ef0', 600: '#0b63cc', 700: '#0c4fa3', 800: '#0e4280', 900: '#0f3766',
        },
        cyanx: { 400: '#3ad6ff', 500: '#00c6ff', 600: '#00a4dd' },
        ink: '#061229',
        panel: '#0b1a36',
        panel2: '#0f2344',
        line: '#1b3560',
        muted: '#8ba6cf',
      },
      boxShadow: {
        soft: '0 10px 30px -10px rgba(2,8,23,.5)',
        glow: '0 25px 70px -25px rgba(15,126,240,.85)',
      },
      keyframes: {
        fadeUp: { '0%': { opacity: 0, transform: 'translateY(22px)' }, '100%': { opacity: 1, transform: 'none' } },
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-12px)' } },
        floatSlow: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-20px)' } },
        marquee: { '0%': { transform: 'translateX(0)' }, '100%': { transform: 'translateX(-50%)' } },
        shimmer: { '0%': { backgroundPosition: '200% 0' }, '100%': { backgroundPosition: '-200% 0' } },
        barGrow: { '0%': { transform: 'scaleY(.25)' }, '100%': { transform: 'scaleY(1)' } },
        ring: { '0%': { transform: 'scale(.8)', opacity: .7 }, '100%': { transform: 'scale(1.9)', opacity: 0 } },
        spinSlow: { to: { transform: 'rotate(360deg)' } },
        blink: { '0%,100%': { opacity: 1 }, '50%': { opacity: .25 } },
      },
      animation: {
        fadeUp: 'fadeUp .7s cubic-bezier(.16,.84,.44,1) both',
        float: 'float 5s ease-in-out infinite',
        floatSlow: 'floatSlow 8s ease-in-out infinite',
        marquee: 'marquee 28s linear infinite',
        shimmer: 'shimmer 2.6s linear infinite',
        ring: 'ring 2.4s ease-out infinite',
        spinSlow: 'spinSlow 22s linear infinite',
        blink: 'blink 1.6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
