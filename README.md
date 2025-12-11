# Property Price

A modern, production-ready React application built with Vite, Tailwind CSS, and best practices.

## Features

- ⚡️ **Vite** - Lightning fast build tool and dev server
- ⚛️ **React 18** - Latest React with Strict Mode
- 🎨 **Tailwind CSS** - Utility-first CSS framework with custom theme
- 🧭 **React Router** - Client-side routing with lazy loading
- 🌙 **Dark Mode** - Built-in dark mode support with system preference detection
- 🔧 **ESLint & Prettier** - Code quality and formatting
- 📦 **Axios** - HTTP client with interceptors
- 🎯 **Absolute Imports** - Clean imports using `@/` alias
- 🛡️ **Error Boundary** - Graceful error handling
- 📱 **Responsive Design** - Mobile-first approach
- 🔍 **SEO Ready** - React Helmet for meta tags
- 📧 **Brevo Email Integration** - Contact forms and lead capture via Brevo API

## Project Structure

```
src/
 ├─ assets/          # Static assets
 ├─ components/      # React components
 │   ├─ common/      # Reusable components
 │   └─ layout/      # Layout components
 ├─ pages/           # Page components
 ├─ hooks/           # Custom React hooks
 ├─ context/         # React Context providers
 ├─ services/        # API services
 ├─ utils/           # Utility functions
 ├─ styles/          # Global styles
 │   └─ globals.css  # Tailwind imports & custom styles
 ├─ App.jsx          # Main app component
 └─ main.jsx         # Entry point
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm

### Installation

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file (optional):

```bash
cp .env.example .env
```

3. Start the development server:

```bash
npm run dev
```

4. Open [http://localhost:5173](http://localhost:5173) in your browser.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Configuration

### Tailwind CSS

Custom theme configuration is in `tailwind.config.js`:
- Custom colors: primary, secondary, muted, border
- Custom fonts: sans (Inter) and heading (Poppins)
- Dark mode via class strategy
- Container with centered layout and padding

### Absolute Imports

Import using `@/` alias:
```jsx
import { useTheme } from '@/context/ThemeContext'
import api from '@/services/api'
```

### Environment Variables

Use `import.meta.env.VITE_*` for environment variables:
```jsx
const apiUrl = import.meta.env.VITE_API_BASE_URL
```

### Email Service (Brevo)

The project includes Brevo email integration for contact forms and lead capture.

**Quick Testing:**
- See [QUICK_TEST_GUIDE.md](./QUICK_TEST_GUIDE.md) for 5-minute test setup
- Use the test page at `/test-email.html` once dev server is running

**Setup & Documentation:**
- [BREVO_SETUP.md](./docs/BREVO_SETUP.md) - Complete setup instructions
- [TESTING_EMAIL.md](./docs/TESTING_EMAIL.md) - Comprehensive testing guide

**Required Environment Variables:**
- `BREVO_API_KEY` - Your Brevo API key
- `ADMIN_EMAIL` - Email to receive contact form submissions
- `FROM_EMAIL` - Verified sender email in Brevo
- `FROM_NAME` - Display name for emails
- `SITE_URL` - Your website URL (for email links)

## Technologies

- **React** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Routing
- **Axios** - HTTP client
- **React Helmet Async** - SEO
- **ESLint** - Linting
- **Prettier** - Code formatting

## License

MIT

