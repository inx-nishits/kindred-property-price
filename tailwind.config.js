/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand Colors
        primary: {
          DEFAULT: '#34BF77', // Primary Green
          50: '#e8f8f0',
          100: '#c5eed6',
          200: '#9ee3ba',
          300: '#77d89e',
          400: '#50cd82',
          500: '#34BF77', // Primary Green
          600: '#2aa862',
          700: '#1f8f4d',
          800: '#163B2A', // Dark Green
          900: '#0A1C13', // Deepest Green
        },
        secondary: {
          DEFAULT: '#163B2A', // Dark Green
          50: '#e8f0ed',
          100: '#c5d9d0',
          200: '#9fc2b3',
          300: '#79ab96',
          400: '#529479',
          500: '#163B2A', // Dark Green
          600: '#0f2a1f',
          700: '#0A1C13', // Deepest Green
          800: '#050e09',
          900: '#000000',
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
        'dark-green': '#163B2A',
        'deepest-green': '#0A1C13',
      },
      fontFamily: {
        sans: ['Source Sans Pro', 'Open Sans', 'system-ui', 'sans-serif'],
        heading: ['Source Sans Pro', 'Open Sans', 'system-ui', 'sans-serif'],
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

