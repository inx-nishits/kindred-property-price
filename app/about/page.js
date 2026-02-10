'use client'

import Link from 'next/link'
import { Heart, BookOpen, Users, Headphones, Search, Home, FileText, ArrowRight, Phone } from 'lucide-react'
import JourneyTree from '@/assets/images/tree.webp'

export default function AboutPage() {
    return (
        <div className="min-h-screen">
            {/* Section 1: Hero - About Kindred */}
            <section className="bg-white py-16 md:py-24">
                <div className="container px-6 lg:px-8">
                    <div className="max-w-4xl mx-auto text-center">
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-brand-dark mb-6">
                            About Kindred
                        </h1>
                        <p className="text-xl md:text-2xl text-gray-700 mb-6 leading-relaxed">
                            At Kindred, we started with a simple frustration: too many people feel like they're being <em>sold to</em>, not <em>supported</em>.
                        </p>
                        <p className="text-lg text-gray-600 leading-relaxed">
                            So we built something better. A real estate experience grounded in honesty, not hype – where clear communication, genuine care and real results come standard, and where our digital tools give you bank‑grade clarity on property prices, suburb performance and what it all means for your next move.
                        </p>
                    </div>
                </div>
            </section>

            {/* Section 2: We do things differently */}
            <section className="bg-brand-dark py-16 md:py-24">
                <div className="container px-6 lg:px-8">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-12 md:mb-16">
                            <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-white mb-4">
                                We do things{' '}
                                <span className="relative inline-block pb-2 md:pb-3 lg:pb-4">
                                    differently
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
                            </h2>
                            <p className="text-lg text-white/90 max-w-3xl mx-auto">
                                We live and work by our values, combining local agents, honest advice and modern technology to deliver unmatched service, care and results.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                            {[
                                {
                                    icon: <Heart className="w-8 h-8" strokeWidth={1.5} />,
                                    title: 'We value you',
                                    description: 'The industry average has more than half of enquiries go unanswered. That is not good enough. We hold ourselves to responding to every enquiry, because you and your time matter.'
                                },
                                {
                                    icon: <BookOpen className="w-8 h-8" strokeWidth={1.5} />,
                                    title: 'We teach you',
                                    description: 'We hold a wealth of knowledge about positioning for success in real estate – and we make it a priority to share it in full, through our team, our resources and the insights inside every report.'
                                },
                                {
                                    icon: <Users className="w-8 h-8" strokeWidth={1.5} />,
                                    title: 'We understand you',
                                    description: 'We work hard to understand your unique needs, what matters most to you, and the goals behind every move, so our recommendations and pricing guidance reflect what you actually care about.'
                                },
                                {
                                    icon: <Headphones className="w-8 h-8" strokeWidth={1.5} />,
                                    title: 'We support you',
                                    description: 'From selling to renting, real estate can feel overwhelming. We pair local specialists with clear, data‑backed insights so you are supported at every step and never left wondering what comes next.'
                                },
                            ].map((item, index) => (
                                <div key={index} className="bg-white rounded-2xl p-8">
                                    <div className="text-primary-green mb-4">
                                        {item.icon}
                                    </div>
                                    <h3 className="text-xl md:text-2xl font-heading font-bold text-dark-green mb-3">
                                        {item.title}
                                    </h3>
                                    <p className="text-gray-600 leading-relaxed">
                                        {item.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Section 3: Property insights, built around you */}
            <section className="bg-soft-gray py-16 md:py-24">
                <div className="container px-6 lg:px-8">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-12 md:mb-16">
                            <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-dark-green mb-4">
                                Property insights, built around you
                            </h2>
                            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                                Use Kindred's tools alongside your local agent to go from rough idea to clear, data‑backed property plan in just a few simple steps.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                            {[
                                {
                                    icon: <Search className="w-8 h-8" strokeWidth={1.5} />,
                                    number: '1',
                                    title: 'Search any property',
                                    description: 'Enter an address to instantly surface a property profile, including basic details and location context.'
                                },
                                {
                                    icon: <Home className="w-8 h-8" strokeWidth={1.5} />,
                                    number: '2',
                                    title: 'Explore the data',
                                    description: 'Review price estimates, comparable sales and suburb insights to understand where the property sits in the market.'
                                },
                                {
                                    icon: <FileText className="w-8 h-8" strokeWidth={1.5} />,
                                    number: '3',
                                    title: 'Unlock your report',
                                    description: 'Have a full PDF report emailed to you so you can revisit the numbers, share them with others and plan your next move.'
                                },
                            ].map((item, index) => (
                                <div key={index} className="bg-white rounded-2xl p-8">
                                    <div className="text-primary-green mb-4">
                                        {item.icon}
                                    </div>
                                    <h3 className="text-xl md:text-2xl font-heading font-bold text-dark-green mb-3">
                                        {item.number}. {item.title}
                                    </h3>
                                    <p className="text-gray-600 leading-relaxed">
                                        {item.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Section 4: Kindred in the community */}
            <section className="bg-white py-16 md:py-24">
                <div className="container px-6 lg:px-8">
                    <div className="max-w-6xl mx-auto">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
                            {/* Left Column */}
                            <div>
                                <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-dark-green mb-6">
                                    Kindred in the community
                                </h2>
                                <div className="space-y-4 text-gray-600 leading-relaxed">
                                    <p>
                                        Our community, and every person in it, is at the heart of what we do. Real estate is more than contracts and campaigns – it's about people, streets, schools and the long‑term health of the area.
                                    </p>
                                    <p>
                                        That's why we're committed to giving back, sharing knowledge and being a trusted local presence you can rely on, whether you're buying, selling, renting or simply curious about the market.
                                    </p>
                                    <p>
                                        From charity drives to free educational resources, we're here to support the community that supports us.
                                    </p>
                                </div>
                            </div>

                            {/* Right Column */}
                            <div className="space-y-6">
                                {[
                                    {
                                        title: 'Unwrapping compassion',
                                        description: 'Kindred regularly collects for local community groups and charities, ensuring that our success translates into meaningful support for those who need it most.'
                                    },
                                    {
                                        title: 'Practical guidance, not hype',
                                        description: 'From "sell before you buy" to "renovate or buy new?", we share honest, practical advice through our blog, reports and one-on-one consultations – no sales pitch required.'
                                    },
                                    {
                                        title: 'Locals helping locals',
                                        description: 'We live and work where our customers do. That means we understand the schools, the streets, the vibe – and we\'re invested in seeing the area thrive for everyone.'
                                    },
                                ].map((item, index) => (
                                    <div key={index} className="border-l-4 border-primary-green pl-6 py-2">
                                        <h3 className="text-lg md:text-xl font-heading font-bold text-dark-green mb-2">
                                            {item.title}
                                        </h3>
                                        <p className="text-gray-600 leading-relaxed">
                                            {item.description}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Section 5: Final CTA with Tree */}
            <section className="pb-16 md:pb-20 bg-soft-gray">
                <div className="container px-6 lg:px-8 pt-10 md:pt-16 max-w-6xl mx-auto">
                    <div
                        className="relative rounded-[40px] md:rounded-[48px] bg-brand-dark overflow-hidden"
                    >
                        <div className="px-6 sm:px-10 lg:px-16 pt-12 md:pt-16 pb-32 md:pb-24 text-center text-white">
                            <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-semibold mb-4 text-white">
                                Ready to take the journey with us?
                            </h2>
                            <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto mb-8">
                                With 15+ years' experience, see why thousands of North Brisbane and Moreton Bay residents continue to choose Kindred – and start your journey with a free, data‑rich property price estimate in just a few clicks.
                            </p>

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <Link
                                    href="https://www.kindred.com.au/property?type=Sale&status=current#"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-3.5 rounded-full text-sm sm:text-base font-semibold bg-primary-green text-white hover:bg-primary-green/90 transition-colors"
                                >
                                    Explore our properties
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Link>
                                <Link
                                    href="mailto:hello@kindred.com.au"
                                    className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-3.5 rounded-full text-sm sm:text-base font-semibold text-white border border-white/50 hover:bg-white/10 transition-colors"
                                >
                                    <span className="inline-flex items-center gap-2">
                                        <Phone className="w-4 h-4" />
                                        Contact our friendly team
                                    </span>
                                </Link>
                            </div>
                        </div>

                        <div className="pointer-events-none select-none flex justify-center">
                            <img
                                src={JourneyTree.src}
                                alt="Kindred tree illustration"
                                className="max-w-[260px] sm:max-w-[320px] md:max-w-[380px] w-full object-contain"
                            />
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}

