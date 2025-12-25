/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Main app's purple-based brand colors
        primary: {
          50: '#F8F5FC',
          100: '#F1E6FB', 
          200: '#E3CCF7',
          300: '#CAA3F0',
          400: '#AD79E6',
          500: '#8D4FD6',
          600: '#7838C7',
          700: '#6A0DAD', // Main brand color
          800: '#530A86',
          900: '#3C0760',
        },
        // Secondary pink colors
        secondary: {
          50: '#FFF5F9',
          100: '#FFE6F1',
          200: '#FFC9E2', 
          300: '#FFA3CD',
          400: '#FF7AB5',
          500: '#FF4D9B',
          600: '#EB2F96',
          700: '#D81B78',
          800: '#B11260',
          900: '#8A0C4A',
        },
        // Consistent gray scale
        gray: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        },
        // Status colors matching main app
        status: {
          open: '#2f54eb',
          confirmation: '#13c2c2',
          ready: '#8c8c8c',
          progress: '#fa8c16',
          hold: '#faad14',
          completed: '#52c41a',
        },
        // Priority colors
        priority: {
          high: '#ff4d4f',
          medium: '#faad14',
          low: '#52c41a',
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      screens: {
        'xs': '475px',
      },
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
      borderRadius: {
        'lg': '8px',
        'xl': '12px',
        '2xl': '16px',
      },
      boxShadow: {
        'sm': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'md': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      }
    },
  },
  plugins: [],
}