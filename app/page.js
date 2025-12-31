'use client'

import { useRouter } from 'next/navigation'
import { Search, Mail, FileText } from 'lucide-react'
import KindredLogo from '@/assets/images/logo.png'
import PropertySearch from '@/components/property/PropertySearch'
import propertyValueEstimateImage from '@/assets/images/property-value-estimate.png'
import comparableSalesImage from '@/assets/images/comparable-sales.png'
import suburbPerformanceImage from '@/assets/images/suburb-performance.png'
import getPriceEstimateImage from '@/assets/images/get-price-estimate-a.jpg'

export default function HomePage() {
    const router = useRouter()

    const handlePropertySelect = (property) => {
        router.push(`/property/${property.id}`)
    }

    const handleFooterPropertySelect = (property) => {
        router.push(`/property/${property.id}`)
    }

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section
                className="hero-section relative flex items-center justify-center md:justify-start md:items-start py-10 md:py-16 lg:py-20 pb-0 min-h-[520px] sm:min-h-[560px] md:min-h-[600px] lg:min-h-[calc(100vh-104px)] z-10 mb-12 md:mb-24"
                aria-label="Hero section with property search"
            >
                {/* Background Image with Overlay */}
                <div className="absolute inset-0 overflow-hidden">
                    <img
                        src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1920&h=1080&fit=crop&q=80"
                        alt="Beautiful Australian real estate property"
                        className="w-full h-full object-cover"
                        loading="eager"
                    />
                    <div className="absolute inset-0 bg-black/60" />
                </div>

                {/* Main Content */}
                <div className="container px-4 sm:px-6 lg:px-8 relative z-10 pt-4 pb-8 md:pb-8">
                    <div className="max-w-4xl mx-auto text-center">
                        {/* Hero Title */}
                        <div className="mb-4 md:mb-5">
                            <h1 className="text-[32px] sm:text-[40px] md:text-[40px] lg:text-[56px] xl:text-[62px] font-heading font-semibold leading-tight tracking-tight">
                                <span className="text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.4)]">
                                    Get an instant property{' '}
                                    <span className="relative inline-block pb-2 md:pb-3 lg:pb-4">
                                        estimate
                                        <svg
                                            className="absolute bottom-0 left-0 w-full h-3 md:h-4 lg:h-5"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="1.89 4.19 187.49 11.7"
                                            preserveAspectRatio="none"
                                            style={{ width: '100%', height: 'auto' }}
                                        >
                                            <path
                                                fillRule="evenodd"
                                                clipRule="evenodd"
                                                d="M95.4142 14.2774C79.2509 12.7025 34.6058 11.6607 11.3734 15.4478C7.66859 16.0517 3.86646 14.398 2.0943 11.0889V11.0889C1.57679 10.1226 2.0935 8.92907 3.16244 8.68626C28.0014 3.04417 80.9272 3.68224 98.5286 5.39729C98.8659 5.43016 98.1906 5.36431 98.5286 5.39729C114.684 6.97382 152.543 8.19785 179.385 6.19142C183.345 5.89535 187.154 7.84824 189.114 11.3025L189.247 11.537C189.593 12.1464 189.232 12.9114 188.538 13.0111C158.795 17.2865 112.931 15.9877 95.4142 14.2774C95.0266 14.2395 95.7994 14.3149 95.4142 14.2774Z"
                                                className="fill-brand-mint"
                                            />
                                        </svg>
                                    </span>
                                </span>
                            </h1>
                        </div>

                        <p className="text-base md:text-lg text-white mb-8 md:mb-6 text-balance max-w-2xl mx-auto font-medium drop-shadow-[0_1px_4px_rgba(0,0,0,0.3)] leading-relaxed">
                            Find out the market value of your property (instantly) and see comparable sales, suburb performance and more.
                        </p>

                        {/* Search Bar */}
                        <div className="max-w-3xl mx-auto mb-8 relative z-10">
                            <div className="bg-white/20 rounded-md p-1.5 shadow-lg">
                                <PropertySearch
                                    onSelectProperty={handlePropertySelect}
                                    showHelpTagline={true}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works - 3 Cards with Light Sage Background */}
            <section className="bg-white section-spacing pt-15 md:pt-30 pb-15 md:pb-30">
                <div className="container px-6 lg:px-8">
                    <div className="text-center mb-12 md:mb-16">
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-dark-green mb-4">
                            Get your property report in{' '}
                            <span className="relative inline-block pb-2 md:pb-3 lg:pb-4">
                                3 simple
                                <svg
                                    className="absolute bottom-0 left-0 w-full h-3 md:h-4 lg:h-5"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="1.89 4.19 187.49 11.7"
                                    preserveAspectRatio="none"
                                    style={{ width: '100%', height: 'auto' }}
                                >
                                    <path
                                        fillRule="evenodd"
                                        clipRule="evenodd"
                                        d="M95.4142 14.2774C79.2509 12.7025 34.6058 11.6607 11.3734 15.4478C7.66859 16.0517 3.86646 14.398 2.0943 11.0889V11.0889C1.57679 10.1226 2.0935 8.92907 3.16244 8.68626C28.0014 3.04417 80.9272 3.68224 98.5286 5.39729C98.8659 5.43016 98.1906 5.36431 98.5286 5.39729C114.684 6.97382 152.543 8.19785 179.385 6.19142C183.345 5.89535 187.154 7.84824 189.114 11.3025L189.247 11.537C189.593 12.1464 189.232 12.9114 188.538 13.0111C158.795 17.2865 112.931 15.9877 95.4142 14.2774C95.0266 14.2395 95.7994 14.3149 95.4142 14.2774Z"
                                        className="fill-brand-mint"
                                    />
                                </svg>
                            </span>{' '}
                            steps
                        </h2>
                        <p className="text-lg text-muted-600 max-w-2xl mx-auto">
                            Quick, easy, and completely free
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-9">
                        {[
                            {
                                icon: <Search className="w-9 h-9" strokeWidth={1.5} />,
                                number: '1',
                                title: 'Find your property',
                                description: 'Enter your address to find your property and provide some basic details.'
                            },
                            {
                                icon: <Mail className="w-9 h-9" strokeWidth={1.5} />,
                                number: '2',
                                title: 'Check your email',
                                description: 'We\'ll send you a link to access your comprehensive property report.'
                            },
                            {
                                icon: <FileText className="w-9 h-9" strokeWidth={1.5} />,
                                number: '3',
                                title: 'View your report',
                                description: 'Access detailed insights about your property and the local market.'
                            },
                        ].map((step, index) => (
                            <div
                                key={index}
                                className="bg-primary-50 rounded-xl p-9 shadow-sm"
                            >
                                <div className="flex items-center justify-start mb-6 text-primary-600">
                                    {step.icon}
                                </div>
                                <h3 className="text-xl font-heading font-bold text-dark-green mb-3">
                                    {step.number}. {step.title}
                                </h3>
                                <p className="text-base text-muted-600 leading-relaxed">
                                    {step.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* What's in the Kindred property report? */}
            <section className="bg-white section-spacing py-15 md:py-30">
                <div className="container px-6 lg:px-8">
                    <div className="mb-12 md:mb-16">
                        {/* Small Kindred Logo */}
                        <div className="mb-6">
                            <img
                                src={KindredLogo.src}
                                alt="Kindred"
                                className="h-8 w-auto"
                            />
                        </div>

                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-dark-green mb-4">
                            What's in the Kindred property report?
                        </h2>
                        <p className="text-lg text-gray-600">
                            The Kindred report gives you an in-depth understanding of your property and the market with comprehensive data including property value estimates, comparable sales and historical suburb performance.
                        </p>
                    </div>

                    <div className="mx-auto space-y-20 md:space-y-32">
                        {/* Feature 1: Property value estimate - Image Left */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
                            <div className="order-2 lg:order-1 relative">
                                {/* Light mint green blob background */}
                                <div className="relative z-10">
                                    <div className="overflow-hidden">
                                        <img
                                            src={propertyValueEstimateImage.src}
                                            alt="Property value estimate showing price ranges"
                                            className="w-full h-auto"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="order-1 lg:order-2">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-8 h-8 rounded-full bg-dark-green text-white flex items-center justify-center text-sm font-bold">
                                        1
                                    </div>
                                    <span className="text-xs font-bold text-dark-green tracking-wider uppercase">
                                        REPORT INSIGHT
                                    </span>
                                </div>
                                <h3 className="text-2xl md:text-3xl lg:text-4xl font-heading font-bold text-dark-green mb-4">
                                    Property value estimate
                                </h3>
                                <p className="text-lg text-gray-600 leading-relaxed">
                                    Get a property value estimate from Australia's leading real estate data provider. See how the value has changed over the years with past sales.
                                </p>
                            </div>
                        </div>

                        {/* Feature 2: Comparable sales - Image Right */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
                            <div>
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-8 h-8 rounded-full bg-dark-green text-white flex items-center justify-center text-sm font-bold">
                                        2
                                    </div>
                                    <span className="text-xs font-bold text-dark-green tracking-wider uppercase">
                                        REPORT INSIGHT
                                    </span>
                                </div>
                                <h3 className="text-2xl md:text-3xl lg:text-4xl font-heading font-bold text-dark-green mb-4">
                                    Comparable sales
                                </h3>
                                <p className="text-lg text-gray-600 leading-relaxed">
                                    Discover the prices and details of similar properties that have recently sold nearby to get an idea of the market value of your property.
                                </p>
                            </div>
                            <div className="relative">
                                <div className="relative z-10">
                                    <div className="overflow-hidden">
                                        <img
                                            src={comparableSalesImage.src}
                                            alt="Comparable sales showing recently sold properties"
                                            className="w-full h-auto"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Feature 3: Suburb Performance - Image Left */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
                            <div className="order-2 lg:order-1 relative">
                                <div className="relative z-10">
                                    <div className="overflow-hidden">
                                        <img
                                            src={suburbPerformanceImage.src}
                                            alt="Suburb performance showing median prices and growth trends"
                                            className="w-full h-auto"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="order-1 lg:order-2">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-8 h-8 rounded-full bg-dark-green text-white flex items-center justify-center text-sm font-bold">
                                        3
                                    </div>
                                    <span className="text-xs font-bold text-dark-green tracking-wider uppercase">
                                        REPORT INSIGHT
                                    </span>
                                </div>
                                <h3 className="text-2xl md:text-3xl lg:text-4xl font-heading font-bold text-dark-green mb-4">
                                    Suburb Performance and Insights
                                </h3>
                                <p className="text-lg text-gray-600 leading-relaxed">
                                    See how the property market in your suburb has changed over the last 10 years including median property prices, average days on market and auction clearance rates for both houses and units.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Hero Section - Before Footer */}
            <section
                className="hero-section relative flex items-center justify-center py-10 md:py-16 lg:py-20 min-h-[520px] sm:min-h-[560px] md:min-h-[600px] lg:min-h-[calc(100vh-104px)] z-10"
                aria-label="Hero section with property search"
            >
                {/* Background Image with Overlay */}
                <div className="absolute inset-0 overflow-hidden">
                    <img
                        src={getPriceEstimateImage.src}
                        alt="Two women discussing property - real estate professionals"
                        className="w-full h-full object-cover"
                        loading="eager"
                    />
                    <div className="absolute inset-0 bg-black/60" />
                </div>

                {/* Main Content */}
                <div className="container px-4 sm:px-6 lg:px-8 relative z-10 w-full">
                    <div className="max-w-4xl mx-auto flex items-center justify-center min-h-[400px] md:min-h-[500px]">
                        <div className="text-center w-full">
                            {/* Hero Title */}
                            <div className="mb-4 md:mb-5">
                                <h1 className="text-[32px] sm:text-[40px] md:text-[40px] lg:text-[56px] xl:text-[62px] font-heading font-semibold leading-tight tracking-tight">
                                    <span className="text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.4)]">
                                        Get a free online property{' '}
                                        <span className="relative inline-block pb-2 md:pb-3 lg:pb-4">
                                            estimate
                                            <svg
                                                className="absolute bottom-0 left-0 w-full h-3 md:h-4 lg:h-5"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="1.89 4.19 187.49 11.7"
                                                preserveAspectRatio="none"
                                                style={{ width: '100%', height: 'auto' }}
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    clipRule="evenodd"
                                                    d="M95.4142 14.2774C79.2509 12.7025 34.6058 11.6607 11.3734 15.4478C7.66859 16.0517 3.86646 14.398 2.0943 11.0889V11.0889C1.57679 10.1226 2.0935 8.92907 3.16244 8.68626C28.0014 3.04417 80.9272 3.68224 98.5286 5.39729C98.8659 5.43016 98.1906 5.36431 98.5286 5.39729C114.684 6.97382 152.543 8.19785 179.385 6.19142C183.345 5.89535 187.154 7.84824 189.114 11.3025L189.247 11.537C189.593 12.1464 189.232 12.9114 188.538 13.0111C158.795 17.2865 112.931 15.9877 95.4142 14.2774C95.0266 14.2395 95.7994 14.3149 95.4142 14.2774Z"
                                                    className="fill-brand-mint"
                                                />
                                            </svg>
                                        </span>
                                    </span>
                                </h1>
                            </div>

                            <p className="text-base md:text-lg text-white mb-8 md:mb-6 text-balance max-w-2xl mx-auto font-medium drop-shadow-[0_1px_4px_rgba(0,0,0,0.3)] leading-relaxed">
                                Discover the value of your property with our free online estimate tool
                            </p>

                            {/* Search Bar */}
                            <div className="max-w-3xl mx-auto relative z-10">
                                <div className="bg-white/20 rounded-md p-1.5 shadow-lg">
                                    <PropertySearch
                                        onSelectProperty={handleFooterPropertySelect}
                                        showHelpTagline={false}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
