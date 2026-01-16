import './globals.css'
import LayoutWrapper from '@/components/layout/LayoutWrapper'

export const metadata = {
    title: 'Property Price Estimate | Instant & Free Value',
    description: 'Get instant property estimates, comparable sales, suburb insights, and rental data for any Australian property. Free property reports delivered to your email.',
    keywords: 'property prices, property estimates, Australian property, property data, suburb insights, property reports',
    authors: [{ name: 'Property Insights Australia' }],
    openGraph: {
        type: 'website',
        locale: 'en_AU',
        siteName: 'Property Insights Australia',
        title: 'Property Price Estimate | Instant & Free Value',
        description: 'Get instant property estimates, comparable sales, suburb insights, and rental data for any Australian property. Free property reports delivered to your email.',
        images: [
            {
                url: '/og-image.png',
                width: 1200,
                height: 630,
                alt: 'Property Insights Australia',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Property Price Estimate | Instant & Free Value',
        description: 'Get instant property estimates, comparable sales, suburb insights, and rental data for any Australian property. Free property reports delivered to your email.',
        images: ['/og-image.png'],
    },
    robots: 'index, follow',
    themeColor: '#10b981',
}

export default function RootLayout({ children }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
                <link rel="apple-touch-icon" href="/apple-touch-icon.jpg" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            </head>
            <body className="font-sans antialiased" suppressHydrationWarning>
                <LayoutWrapper>
                    {children}
                </LayoutWrapper>
            </body>
        </html>
    )
}
