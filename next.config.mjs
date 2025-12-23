/** @type {import('next').NextConfig} */
const nextConfig = {
    // Enable React strict mode for better development experience
    reactStrictMode: true,

    // Image optimization configuration
    images: {
        domains: [],
        formats: ['image/webp', 'image/avif'],
    },

    // Compiler options
    compiler: {
        // Remove console logs in production
        removeConsole: process.env.NODE_ENV === 'production',
    },

    // Experimental features
    experimental: {
        optimizePackageImports: ['lucide-react', 'framer-motion'],
    },
}

export default nextConfig
