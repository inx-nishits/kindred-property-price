/** @type {import('next').NextConfig } */
const nextConfig = {
    // Enable React strict mode for better development experience
    reactStrictMode: true,

    // Image optimization configuration
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '*.domain.com.au',
            },
            {
                protocol: 'https',
                hostname: '*.cloudfront.net',
            },
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
            },
            {
                protocol: 'https',
                hostname: 'photo-api-sandbox.*.amazonaws.com',
            },
            {
                protocol: 'https',
                hostname: '*.domain.img.aus.lb.dcn.net',
            },
            {
                protocol: 'https',
                hostname: 'api.domain.com.au',
            },
            {
                protocol: 'https',
                hostname: 'img.domain.com.au',
            },
            {
                protocol: 'https',
                hostname: '*.akamai.net',
            },
            {
                protocol: 'https',
                hostname: '*.akamaihd.net',
            },
        ],
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
