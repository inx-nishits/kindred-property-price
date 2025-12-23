export const metadata = {
    title: 'Terms & Conditions | Property Insights Australia',
    description: 'Terms and conditions for using Property Insights Australia services.',
}

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-white">
            <div className="container px-6 lg:px-8 py-16 md:py-24">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-4xl md:text-5xl font-heading font-bold text-dark-green mb-8">
                        Terms & Conditions
                    </h1>
                    <div className="prose prose-lg max-w-none text-gray-600">
                        <p className="mb-4">
                            Last updated: {new Date().toLocaleDateString()}
                        </p>
                        <h2 className="text-2xl font-bold text-dark-green mt-8 mb-4">1. Acceptance of Terms</h2>
                        <p className="mb-4">
                            By accessing and using Property Insights Australia, you accept and agree to be bound by the terms and provision of this agreement.
                        </p>
                        <h2 className="text-2xl font-bold text-dark-green mt-8 mb-4">2. Use of Service</h2>
                        <p className="mb-4">
                            Our service provides property estimates and market data for informational purposes only.
                            All estimates are indicative and should not be relied upon as professional valuations.
                        </p>
                        <h2 className="text-2xl font-bold text-dark-green mt-8 mb-4">3. Data Accuracy</h2>
                        <p className="mb-4">
                            While we strive to provide accurate information, we do not guarantee the accuracy, completeness,
                            or timeliness of any data provided through our service.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
