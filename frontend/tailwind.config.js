/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Biopunk Agriculture Palette
        forest: {
          50: '#f0f7f3',
          100: '#e0efe8',
          200: '#c1dfd0',
          300: '#a3cfb9',
          400: '#84bfa1',
          500: '#66af8a',
          600: '#4d9a73',
          700: '#2d6a4f',  // Core moss
          800: '#0f3d2e',  // Deep forest
          900: '#082620',
        },
        sage: {
          50: '#fafbf8',
          100: '#f5f7f1',
          200: '#ebefe3',
          300: '#e1e7d5',
          400: '#d7dfc7',
          500: '#cdd7b9',
          600: '#a8bf8f',
          700: '#74c69d',  // Sage accent
          800: '#5a9f7d',
          900: '#42745c',
        },
        cream: '#f8f3e8',
        amber: {
          alert: '#e9b949',
          light: '#f5d67f',
          dark: '#d4a335',
        },
        rust: {
          alert: '#c0392b',
          light: '#d86156',
          dark: '#8b2f1f',
        },
      },
      fontFamily: {
        display: ['DM Serif Display', 'serif'],
        sans: ['Nunito', 'system-ui', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      },
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1rem' }],
        sm: ['0.875rem', { lineHeight: '1.25rem' }],
        base: ['1rem', { lineHeight: '1.5rem' }],
        lg: ['1.125rem', { lineHeight: '1.75rem' }],
        xl: ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
      },
      backgroundColor: {
        'gradient-forest': 'linear-gradient(135deg, #0f3d2e 0%, #2d6a4f 100%)',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(116, 198, 157, 0.4)',
        'glow-lg': '0 0 40px rgba(116, 198, 157, 0.3)',
        'glow-amber': '0 0 20px rgba(233, 185, 73, 0.3)',
        'elevated': '0 10px 40px rgba(0, 0, 0, 0.2)',
      },
      animation: {
        'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'scan-sweep': 'scan-sweep 2s linear infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: '0.6', boxShadow: '0 0 20px rgba(116, 198, 157, 0.4)' },
          '50%': { opacity: '1', boxShadow: '0 0 40px rgba(116, 198, 157, 0.8)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'scan-sweep': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
      },
      backgroundImage: {
        'noise': "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"100\" height=\"100\"><filter id=\"n\"><feTurbulence type=\"fractalNoise\" baseFrequency=\"0.9\" numOctaves=\"4\"/><feDisplacementMap in=\"SourceGraphic\" scale=\"1\"/></filter><rect width=\"100\" height=\"100\" fill=\"%230f3d2e\" filter=\"url(%23n)\"/></svg>')",
        'leaf-veins': "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 400 400\"><defs><pattern id=\"veins\" x=\"0\" y=\"0\" width=\"200\" height=\"200\" patternUnits=\"userSpaceOnUse\"><path d=\"M100,10 Q120,50 100,100 Q80,140 100,180\" stroke=\"rgba(116,198,157,0.1)\" stroke-width=\"1\" fill=\"none\"/><path d=\"M100,20 L95,80 M100,20 L105,80\" stroke=\"rgba(116,198,157,0.08)\" stroke-width=\"0.5\" fill=\"none\"/></pattern></defs><rect width=\"400\" height=\"400\" fill=\"none\"/><rect width=\"400\" height=\"400\" fill=\"url(%23veins)\"/></svg>')",
      },
    },
  },
  plugins: [],
};
