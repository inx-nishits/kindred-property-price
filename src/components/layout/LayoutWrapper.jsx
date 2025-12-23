'use client'

import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import PageTransition from '@/components/animations/PageTransition'

export default function LayoutWrapper({ children }) {
    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
                <PageTransition>
                    {children}
                </PageTransition>
            </main>
            <Footer />
        </div>
    )
}
