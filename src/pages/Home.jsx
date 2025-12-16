import { useState, useEffect, useRef } from 'react'

import { useNavigate, Link } from 'react-router-dom'

import { BarChart3, Home as HomeIcon, MapPin, FileText, Search, Mail, CheckCircle, X, ChevronRight, Building2, XCircle, ArrowRight, Phone } from 'lucide-react'

import PropertySearch from '../components/property/PropertySearch'

import FAQ from '../components/common/FAQ'

import SEO from '../components/common/SEO'

import staticContent from '../data/staticContent.json'

import JourneyTree from '../assets/images/tree.webp'
import logoImage from '../assets/images/logo.png'


function Home() {

  const navigate = useNavigate()

  const [searchQuery, setSearchQuery] = useState('')

  const [searchResults, setSearchResults] = useState([])

  const [resultsListMaxHeight, setResultsListMaxHeight] = useState(null)

  const resultsContainerRef = useRef(null)

  const resultsListRef = useRef(null)

  const scrollFooterRef = useRef(null)

  const faqContent = staticContent.faq



  // Calculate dynamic max-height for results list to ensure footer is always visible

  useEffect(() => {

    if (!searchResults.length || !resultsContainerRef.current || !resultsListRef.current) {

      setResultsListMaxHeight(null)

      return

    }



    const calculateMaxHeight = () => {

      const container = resultsContainerRef.current

      const list = resultsListRef.current

      const footer = scrollFooterRef.current



      if (!container || !list) return



      const containerRect = container.getBoundingClientRect()

      const viewportHeight = window.innerHeight

      const containerTop = containerRect.top

      

      // Calculate available space from container top to viewport bottom

      const availableSpace = viewportHeight - containerTop

      

      // Reserve space for header (measure actual height)

      const headerElement = container.querySelector('.flex.items-center.justify-between')

      const headerHeight = headerElement?.offsetHeight || 50

      

      // Reserve space for footer if it exists (measure actual height)

      const footerHeight = footer?.offsetHeight || 0

      

      // Add some padding to ensure footer is always visible (16px buffer)

      const buffer = 16

      

      // Calculate max height for scrollable list

      const calculatedMaxHeight = availableSpace - headerHeight - footerHeight - buffer

      

      // Set minimum height to show at least 2 items (approximately 100px)

      const minHeight = 100

      

      // Set maximum reasonable height (don't exceed viewport)

      const maxReasonableHeight = Math.min(calculatedMaxHeight, viewportHeight * 0.6)

      

      setResultsListMaxHeight(Math.max(minHeight, maxReasonableHeight))

    }



    // Use requestAnimationFrame to ensure DOM has updated

    const timeoutId = setTimeout(() => {

      requestAnimationFrame(() => {

        calculateMaxHeight()

      })

    }, 0)



    // Recalculate on window resize and scroll

    window.addEventListener('resize', calculateMaxHeight)

    window.addEventListener('scroll', calculateMaxHeight, true)



    return () => {

      clearTimeout(timeoutId)

      window.removeEventListener('resize', calculateMaxHeight)

      window.removeEventListener('scroll', calculateMaxHeight, true)

    }

  }, [searchResults.length])



  const handlePropertySelect = (property) => {

    navigate(`/property/${property.id}`, { state: { property } })

  }





  return (

    <>

      <SEO

        title="Search Property Prices & Market Data"

        description="Get instant property estimates, comparable sales, suburb insights, and rental data for any Australian property. Free property reports delivered to your email."

        keywords="property prices, property estimates, Australian property, property data, suburb insights, property reports"

      />



      <div className="min-h-screen">

        {/* Hero Section - Kindred Inspired */}

        <section 

          className="hero-section relative flex items-center justify-center md:justify-start md:items-start py-10 md:py-16 lg:py-20 min-h-[520px] sm:min-h-[560px] md:min-h-[600px] lg:min-h-[calc(100vh-104px)] z-10"

          aria-label="Hero section with property search"

        >

          {/* Background Image with Overlay */}

          <div className="absolute inset-0 overflow-hidden">

            {/* Australia Real Estate Background Image */}

            <img

              src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1920&h=1080&fit=crop&q=80"

              alt="Beautiful Australian real estate property"

              className="w-full h-full object-cover"

              loading="eager"

            />

            {/* Dark Overlay for better text readability */}

            <div className="absolute inset-0 bg-black/60" />

          </div>



          {/* Main Content */}

          <div className="container px-4 sm:px-6 lg:px-8 relative z-10 pt-4 pb-8 md:pb-8">

            <div className="max-w-4xl mx-auto text-center">

              {/* Hero Title - Clean and Elegant */}

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

                          fill="#48D98E"

                        />

                      </svg>

                    </span>

                  </span>

                </h1>

              </div>



              <p className="text-base md:text-lg text-white mb-8 md:mb-6 text-balance max-w-2xl mx-auto font-medium drop-shadow-[0_1px_4px_rgba(0,0,0,0.3)] leading-relaxed">

                Find out the market value of your property (instantly) and see comparable sales, suburb performance and more.

              </p>



              {/* Search Bar with Overlay Results */}

              <div className="max-w-3xl mx-auto mb-8 relative z-10">

                {/* Search Container */}

                <div className="bg-white/20 rounded-md p-1.5 shadow-lg">

                  <PropertySearch

                    onSelectProperty={handlePropertySelect}

                    showHelpTagline={true}

                    onSearchResultsChange={setSearchResults}

                    onClear={() => setSearchResults([])}

                  />

                </div>



                {/* Search Results - Absolute positioned overlay to prevent page jump */}

                {searchResults.length > 0 && (

                  <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-[999]">

                    {/* Results Container */}

                    <div 

                      ref={resultsContainerRef}

                      className="bg-white rounded-md shadow-lg border border-gray-200 overflow-hidden"

                    >

                        {/* Results Header - compact in mobile landscape */}

                        <div className="flex items-center justify-between px-5 py-3 landscape:px-3 landscape:py-2 md:landscape:px-5 md:landscape:py-3 bg-gray-50 border-b border-gray-100">

                          <div className="flex items-center gap-2">

                            <Building2 className="w-5 h-5 text-primary-500" strokeWidth={1.5} />

                            <span className="text-sm font-semibold text-dark-green">

                              {searchResults.length} {searchResults.length === 1 ? 'Property' : 'Properties'} Found

                            </span>

                          </div>

                          <button

                            onClick={() => setSearchResults([])}

                            className="text-xs text-muted-500 hover:text-red-500 transition-colors flex items-center gap-1"

                          >

                            <XCircle className="w-3.5 h-3.5" strokeWidth={1.5} />

                            Clear

                          </button>

                        </div>



                        {/* Results List - Scrollable - dynamic height based on viewport to ensure footer is always visible */}

                        <div 

                          ref={resultsListRef}

                          className="divide-y divide-gray-100 overflow-y-auto min-h-[100px] max-h-[calc(100vh-480px)] sm:max-h-[calc(100vh-450px)] md:max-h-[calc(100vh-420px)] landscape:max-h-[220px] md:landscape:max-h-[calc(100vh-420px)]"

                          style={{

                            maxHeight: resultsListMaxHeight 

                              ? `${resultsListMaxHeight}px` 

                              : undefined

                          }}

                        >

                          {searchResults.map((property) => (

                            <button

                              key={property.id}

                              onClick={() => handlePropertySelect(property)}

                              className="w-full text-left px-3 py-1.5 landscape:py-1 md:landscape:py-1.5 hover:bg-primary-50/60 transition-colors group"

                            >

                              <div className="flex items-center justify-between gap-3">

                                <div className="flex-1 min-w-0">

                                  <h3 className="font-medium text-sm text-dark-green truncate group-hover:text-primary-600 transition-colors mb-0.5">

                                    {property.shortAddress}

                                  </h3>

                                  <p className="text-[11px] text-muted-500 truncate">

                                    {property.suburb}, {property.state} {property.postcode}

                                  </p>

                                </div>

                                <ChevronRight className="w-4 h-4 text-muted-300 group-hover:text-primary-500 group-hover:translate-x-1 transition-all shrink-0" strokeWidth={1.5} />

                              </div>

                            </button>

                          ))}

                        </div>



                        {/* Scroll indicator - compact for mobile landscape - always visible */}

                        {searchResults.length > 3 && (

                          <div 

                            ref={scrollFooterRef}

                            className="px-5 py-2 landscape:px-3 landscape:py-1 md:landscape:px-5 md:landscape:py-2 bg-gray-50 border-t border-gray-100 text-center"

                          >

                            <span className="text-xs text-muted-400">

                              <span className="landscape:hidden md:landscape:inline">Scroll to see more results</span>

                              <span className="hidden landscape:inline md:landscape:hidden">

                                ↓ More results

                              </span>

                            </span>

                          </div>

                        )}

                      </div>

                    </div>

                  )}

              </div>



            </div>

          </div>

        </section>



        {/* Features Section - Kindred "We do all the things" Style */}

        <section className="pt-16 md:pt-24 section-spacing">

          <div className="container px-6 lg:px-8">

            <div

              className="rounded-3xl py-16 md:py-24 px-6 lg:px-8"

              style={{ backgroundColor: 'var(--green-900)' }}

            >

              <div className="text-center mb-12 md:mb-16">

                <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-white mb-4">

                  Complete Property{' '}

                  <span className="relative inline-block pb-2 md:pb-3 lg:pb-4">

                    Insights

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

                        fill="#48D98E"

                      />

                    </svg>

                  </span>

                </h2>

                <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">

                  Everything you need to make informed property decisions

                </p>

              </div>



              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto">

                {[

                  {

                    title: 'Property Estimates',

                    description:

                      'Get accurate low, mid, and high price estimates based on comprehensive market analysis and comparable sales data.',

                    icon: <BarChart3 className="w-8 h-8" strokeWidth={2} />,

                  },

                  {

                    title: 'Comparable Sales',

                    description:

                      'View recent sales of similar properties in the area to understand market trends and property values.',

                    icon: <HomeIcon className="w-8 h-8" strokeWidth={2} />,

                  },

                  {

                    title: 'Suburb Insights',

                    description:

                      'Comprehensive suburb data including median prices, growth trends, demand indicators, and market statistics.',

                    icon: <MapPin className="w-8 h-8" strokeWidth={2} />,

                  },

                  {

                    title: 'Detailed Reports',

                    description:

                      'Download comprehensive PDF reports with all property insights, estimates, and market analysis delivered to your email.',

                    icon: <FileText className="w-8 h-8" strokeWidth={2} />,

                  },

                ].map((feature) => (

                  <div

                    key={feature.title}

                    className="bg-white rounded-xl p-6 md:p-8 shadow-lg hover:shadow-xl transition-shadow duration-300"

                  >

                    {/* Icon */}

                    <div className="mb-5" style={{ color: 'var(--green-400)' }}>

                      {feature.icon}

                    </div>



                    {/* Content */}

                    <h3 className="text-xl md:text-2xl font-heading font-bold text-gray-900 mb-3">

                      {feature.title}

                    </h3>

                    <p className="text-gray-600 leading-relaxed text-sm md:text-base">

                      {feature.description}

                    </p>

                  </div>

                ))}

              </div>

            </div>

          </div>

        </section>



        {/* How It Works */}

        <section className="bg-white section-spacing">

          <div className="container px-6 lg:px-8">

            <div className="text-center mb-12 md:mb-16">

              <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-dark-green mb-4">

                Get Your Property Report in{' '}

                <span className="relative inline-block pb-2 md:pb-3 lg:pb-4">

                  3 Simple

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

                      fill="#48D98E"

                    />

                  </svg>

                </span>

                {' '}

                Steps

              </h2>

              <p className="text-lg md:text-xl text-muted-600 max-w-2xl mx-auto">

                Quick, easy, and completely free

              </p>

            </div>



            <div className="w-full mx-auto">

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">

                {[

                  {

                    step: '1',

                    title: 'Find your property',

                    description:

                      'Enter your address to find your property and provide some basic details.',

                    icon: <Search className="w-8 h-8" strokeWidth={1.5} />,

                  },

                  {

                    step: '2',

                    title: 'Check your email',

                    description:

                      "We'll send the report to your email so you can easily come back to it later.",

                    icon: <Mail className="w-8 h-8" strokeWidth={1.5} />,

                  },

                  {

                    step: '3',

                    title: 'View your report',

                    description:

                      "Simply click the link in the email to view the full report, it's that easy.",

                    icon: <FileText className="w-8 h-8" strokeWidth={1.5} />,

                  },

                ].map((item) => (

                  <div

                    key={item.step}

                    className="bg-primary-50 rounded-xl shadow-sm p-6 md:p-8 text-left"

                  >

                    {/* Icon */}

                    <div className="w-16 h-16 mb-5 text-primary-600 flex items-center justify-start">

                      {item.icon}

                    </div>



                    {/* Content */}

                    <h3 className="text-lg md:text-xl font-heading font-bold text-dark-green mb-3">

                      {item.step}. {item.title}

                    </h3>

                    <p className="text-muted-600 leading-relaxed text-sm md:text-base">

                      {item.description}

                    </p>

                  </div>

                ))}

              </div>

            </div>

          </div>

        </section>

        {/* What's in the kindred property report */}

        <section className="bg-white section-spacing">

          <div className="container px-6 lg:px-8">

            {/* Header */}

            <div className="max-w-4xl mx-auto mb-12 md:mb-16 text-center md:text-left">

              <img

                src={logoImage}

                alt="kindred logo"

                className="h-6 md:h-7 w-auto object-contain mb-4 md:mb-5 mx-auto md:mx-0"

              />

              <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-dark-green mb-3 md:mb-4 leading-tight">

                What’s in the kindred property report?

              </h2>

              <p className="text-base md:text-lg text-muted-600 leading-relaxed max-w-2xl mx-auto md:mx-0">

                The kindred Report gives you an in-depth understanding of your property and the market with

                comprehensive data including property value estimates, comparable sales and historical suburb

                performance.

              </p>

            </div>



            {/* Zig-zag content rows */}

            <div className="space-y-14 md:space-y-20">

              {[

                {

                  title: 'Property value estimate',

                  description:

                    "Get a property value estimate from Australia’s leading real estate data provider. See how the value has changed over the years with past sales.",

                  image:

                    'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=900&h=600&fit=crop&q=80',

                },

                {

                  title: 'Comparable sales',

                  description:

                    'Discover the prices and details of similar properties that have recently sold nearby to get an idea of the market value of your property.',

                  image:

                    'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=900&h=600&fit=crop&q=80&auto=format&ixlib=rb-4.0.3',

                },

                {

                  title: 'Suburb Performance and Insights',

                  description:

                    'See how the property market in your suburb has changed over the last 10 years including median property prices, average days on market and auction clearance rates for both houses and units.',

                  image:

                    'https://images.unsplash.com/photo-1502672023488-70e25813eb80?w=900&h=600&fit=crop&q=80',

                },

              ].map((item, index) => (

                <div

                  key={item.title}

                  className={`group relative flex flex-col md:flex-row items-start md:items-stretch gap-8 lg:gap-16 ${

                    index % 2 === 1 ? 'md:flex-row-reverse' : ''

                  }`}

                >

                  {/* Image */}

                  <div className="w-full md:w-1/2">

                    <div className="relative overflow-hidden rounded-3xl bg-gray-100 transition-transform duration-300 group-hover:-translate-y-1">

                      <div className="aspect-[4/3] w-full">

                        <img

                          src={item.image}

                          alt={item.title}

                          className="w-full h-full object-cover"

                          loading="lazy"

                        />

                      </div>

                      <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent pointer-events-none" />

                    </div>

                  </div>



                  {/* Content */}

                  <div className="w-full md:w-1/2">

                    <div className="h-full bg-white/90 md:bg-primary-50/70 rounded-3xl px-6 py-6 md:px-8 md:py-8 flex flex-col justify-center transition-transform duration-300 group-hover:-translate-y-0.5">

                      <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-primary-600 mb-3">

                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary-50 text-primary-700">

                          {index + 1}

                        </span>

                        <span>Report insight</span>

                      </div>

                      <h3 className="text-2xl md:text-3xl font-heading font-semibold text-dark-green mb-3 md:mb-4">

                        {item.title}

                      </h3>

                      <p className="text-base md:text-lg text-muted-700 leading-relaxed">

                        {item.description}

                      </p>

                    </div>

                  </div>

                </div>

              ))}

            </div>

          </div>

        </section>



        {/* Privacy & Trust Message */}

        <section className="pt-16 pb-16 bg-primary-50 section-spacing !mb-0">

          <div className="container px-6 lg:px-8">

            <div className="max-w-3xl mx-auto text-center">

              <h2 className="text-2xl md:text-3xl font-heading font-bold text-dark-green mb-4">

                Privacy-First & Trusted

              </h2>

              <p className="text-lg text-muted-600 mb-6">

                Your privacy is our priority. We never share your information

                with third parties, and all data is securely protected. Get

                accurate, reliable property insights you can trust.

              </p>

              <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-600">

                <span>✓ Data Protected</span>

                <span>✓ No Spam</span>

                <span>✓ Free Reports</span>

                <span>✓ Accurate Estimates</span>

              </div>

            </div>

          </div>

        </section>



        {/* FAQ Section */}

        <section className="section-spacing bg-white">

          <FAQ faqContent={faqContent} showHeader={true} showHelpSection={true} variant="default" />

        </section>



        {/* Journey CTA - match About page UI, above footer */}

        <section className="pb-[60px] md:pb-[80px] bg-primary-50">

          <div className="container px-6 lg:px-8 pt-[40px] md:pt-[60px] max-w-6xl mx-auto">

            <div

              className="relative rounded-[40px] md:rounded-[48px]"

              style={{ backgroundColor: 'var(--green-900)' }}

            >

              <div className="px-6 sm:px-10 lg:px-16 pt-12 md:pt-16 pb-32 md:pb-24 text-center text-white">

                <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-semibold mb-4 text-white">

                  Ready to take the journey with us?

                </h2>

                <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto mb-8">

                  Browse current properties or talk to our team and we&apos;ll help you take the next step with clear,

                  data‑backed insights.

                </p>



                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">

                  <a

                    href="https://www.kindred.com.au/property?status=current&price=100000%2C5000000&rent-price=400%2C2000#"

                    target="_blank"

                    rel="noopener noreferrer"

                    className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-3.5 rounded-full text-sm sm:text-base font-semibold bg-[color:var(--green-400)] text-[color:var(--green-900)] hover:bg-[color:var(--green-300)] transition-colors"

                  >

                    View current properties

                    <ArrowRight className="w-4 h-4 ml-2" />

                  </a>

                  <Link

                    to="/contact"

                    className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-3.5 rounded-full text-sm sm:text-base font-semibold text-white border border-white/50 hover:bg-white/10 transition-colors"

                  >

                    <span className="inline-flex items-center gap-2">

                      <Phone className="w-4 h-4" />

                      Contact our friendly team

                    </span>

                  </Link>

                </div>

              </div>



              {/* Tree image anchored at the bottom */}

              <div className="pointer-events-none select-none flex justify-center">

                <img

                  src={JourneyTree}

                  alt="Kindred tree illustration"

                  className="max-w-[260px] sm:max-w-[320px] md:max-w-[380px] w-full object-contain"

                />

              </div>

            </div>

          </div>

        </section>

      </div>

    </>

  )

}



export default Home

