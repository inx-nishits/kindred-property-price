/** @type {import('tailwindcss').Config} */

export default {

  content: [
    "./app/**/*.{js,jsx}",
    "./src/components/**/*.{js,jsx}",
    "./src/pages/**/*.{js,jsx}",
  ],

  theme: {

    extend: {

      colors: {

        // Brand Colors - Kindred Property Theme

        primary: {

          DEFAULT: '#34BF77', // Kindred Primary Green

          50: 'var(--green-100)', // #E9F2EE

          100: '#d1fae5',

          200: '#a7f3d0',

          300: '#67E9A6', // Hover state - matches --green-300

          400: '#34d399',

          500: '#34BF77', // Primary Green

          600: '#219358',

          700: '#047857',

          800: '#065f46', // Dark Green

          900: '#064e3b', // Deepest Green

        },

        secondary: {

          DEFAULT: '#065f46', // Dark Green

          50: '#ecfdf5',

          100: '#d1fae5',

          200: '#a7f3d0',

          300: '#6ee7b7',

          400: '#34d399',

          500: '#059669',

          600: '#047857',

          700: '#065f46', // Dark Green

          800: '#064e3b', // Deepest Green

          900: '#022c22',

        },

        muted: {

          DEFAULT: '#6b7280',

          50: '#f9fafb',

          100: '#f3f4f6',

          200: '#e5e7eb',

          300: '#d1d5db',

          400: '#9ca3af',

          500: '#6b7280',

          600: '#4b5563',

          700: '#374151',

          800: '#1f2937',

          900: '#111827',

        },

        border: {

          DEFAULT: '#e5e7eb',

        },

        // Brand-specific color aliases (using kebab-case for Tailwind compatibility)

        'soft-white': '#F5F3EB',

        'pure-white': '#F5F3EB',

        'dark-green': '#065f46', // Updated to match Kindred theme

        'deepest-green': '#064e3b', // Updated to match Kindred theme

      },

      fontFamily: {

        sans: ['Open Sauce One', 'sans-serif'],

        heading: ['Open Sauce One', 'sans-serif'],

      },

      container: {

        center: true,

        padding: {

          DEFAULT: '1rem', // 16px - industry standard mobile spacing

          sm: '1.25rem', // 20px - small screens

          md: '1.5rem', // 24px - medium screens

          lg: '2rem', // 32px - large screens (1024px+)

          xl: '4rem', // 64px - extra large

          '2xl': '5rem', // 80px - 2xl screens

        },

        screens: {

          sm: '640px',

          md: '768px',

          lg: '1024px', // Containers get max-width only at 1024px+

          xl: '1280px',

          '2xl': '1536px',

        },

      },

    },

  },

  plugins: [],

}

