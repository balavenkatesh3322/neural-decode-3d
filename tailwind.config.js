/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FDFBF7',
          100: '#FBF9F5',
          200: '#F5EFDF',
          300: '#EDE4CD',
          400: '#DECFA8',
          500: '#C2B080',
        },
        stone: {
          850: '#1C1917',
          900: '#171412',
          950: '#0E0C0A',
        },
        neural: {
          amber: '#F59E0B',
          cyan: '#06B6D4',
          emerald: '#10B981',
          purple: '#8B5CF6',
          rose: '#F43F5E',
          blue: '#3B82F6',
        }
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      },
      boxShadow: {
        'glow-amber': '0 0 20px rgba(245, 158, 11, 0.4)',
        'glow-cyan': '0 0 20px rgba(6, 182, 212, 0.4)',
        'glow-purple': '0 0 20px rgba(139, 92, 246, 0.4)',
        'editorial': '0 10px 30px -5px rgba(0, 0, 0, 0.05), 0 4px 12px -2px rgba(0, 0, 0, 0.03)',
      }
    },
  },
  plugins: [],
}
