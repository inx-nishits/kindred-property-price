import FAQ from '@/components/common/FAQ'
import staticContent from '@/data/staticContent.json'

export const metadata = {
    title: 'FAQ | Property Price Estimate | Instant & Free Value',
    description: 'Frequently asked questions about property estimates, reports, and our services.',
}

export default function FAQPage() {
    const faqContent = staticContent.faq

    return (
        <div className="min-h-screen bg-white">
            <div className="container px-6 lg:px-8 py-16 md:py-24">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl md:text-5xl font-heading font-bold text-dark-green mb-4">
                            Frequently Asked Questions
                        </h1>
                        <p className="text-lg text-gray-600">
                            Find answers to common questions about our property insights service
                        </p>
                    </div>
                    <FAQ items={faqContent} />
                </div>
            </div>
        </div>
    )
}
