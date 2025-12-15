import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { BarChart3, Home as HomeIcon, MapPin, FileText, Search, Mail, CheckCircle, X, ChevronRight, Bed, Bath, Building2, XCircle, ArrowRight } from 'lucide-react'
import PropertySearch from '../components/property/PropertySearch'
import FAQ from '../components/common/FAQ'
import SEO from '../components/common/SEO'
import staticContent from '../data/staticContent.json'

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
          className="hero-section relative min-h-[75vh] md:min-h-[85vh] flex items-center justify-center pb-8 sm:pb-4 md:pb-0 z-10"
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
          <div className="container mx-auto px-4 sm:px-5 md:px-6 lg:px-8 relative z-10 py-8 md:py-12">
            <div className="max-w-4xl mx-auto text-center">
              {/* Hero Title - Clean and Elegant */}
              <div className="mb-6 md:mb-8">
                <h1 className="text-3xl md:text-4xl lg:text-6xl font-heading font-semibold leading-tight tracking-tight">
                  <span className="text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.4)]">
                    Get an instant property estimate
                  </span>
                </h1>
              </div>

              <p className="text-base md:text-xl text-white mb-8 md:mb-10 text-balance max-w-2xl mx-auto font-medium drop-shadow-[0_1px_4px_rgba(0,0,0,0.3)] leading-relaxed">
                Find out the market value of your property (instantly) and see comparable sales, suburb performance and more.
              </p>

              {/* Search Bar with Overlay Results */}
              <div className="max-w-2xl mx-auto mb-8 relative z-10">
                {/* Search Container */}
                <div className="bg-white rounded-md p-4 md:p-6 shadow-lg border border-gray-200">
                  <PropertySearch
                    onSelectProperty={handlePropertySelect}
                    showHelpTagline={true}
                    onSearchResultsChange={setSearchResults}
                    onClear={() => setSearchResults([])}
                  />
                </div>

                {/* Search Results - Absolute positioned overlay to prevent page jump */}
                {searchResults.length > 0 && (
                  <div className="absolute left-0 right-0 top-[88px] landscape:top-[76px] md:landscape:top-[88px] z-[999] mt-2">
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
                              className="w-full text-left px-3 py-2 landscape:py-1.5 md:landscape:py-2 hover:bg-primary-50/50 transition-colors group"
                            >
                              <div className="flex items-center justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-semibold text-dark-green truncate group-hover:text-primary-600 transition-colors">
                                      {property.shortAddress}
                                    </h3>
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary-100 text-primary-700 shrink-0">
                                      {property.propertyType}
                                    </span>
                                  </div>
                                  <p className="text-sm text-muted-500">
                                    {property.suburb}, {property.state} {property.postcode}
                                  </p>
                                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-500">
                                    {property.beds > 0 && (
                                      <span className="flex items-center gap-1">
                                        <Bed className="w-3.5 h-3.5" strokeWidth={1.5} />
                                        {property.beds} bed{property.beds !== 1 ? 's' : ''}
                                      </span>
                                    )}
                                    {property.baths > 0 && (
                                      <span className="flex items-center gap-1">
                                        <Bath className="w-3.5 h-3.5" strokeWidth={1.5} />
                                        {property.baths} bath{property.baths !== 1 ? 's' : ''}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="text-right shrink-0">
                                  <div className="text-lg font-bold text-primary-600">
                                    {new Intl.NumberFormat('en-AU', {
                                      style: 'currency',
                                      currency: 'AUD',
                                      maximumFractionDigits: 0,
                                    }).format(property.priceEstimate.mid)}
                                  </div>
                                  <div className="text-xs text-muted-400 mt-0.5">Estimated Value</div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-muted-300 group-hover:text-primary-500 group-hover:translate-x-1 transition-all shrink-0" strokeWidth={1.5} />
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
                              <span className="hidden landscape:inline md:landscape:hidden">↓ More results</span>
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

        {/* Features Section */}
        <section className="py-16 md:py-24 bg-primary-50">
          <div className="container mx-auto px-4 sm:px-5 md:px-6 lg:px-8">
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-dark-green mb-4">
                Complete Property Insights
              </h2>
              <p className="text-lg md:text-xl text-muted-600 max-w-2xl mx-auto">
                Everything you need to make informed property decisions
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 max-w-7xl mx-auto">
              {[
                {
                  title: 'Property Estimates',
                  description:
                    'Get accurate low, mid, and high price estimates based on comprehensive market analysis and comparable sales data.',
                  icon: <BarChart3 className="w-7 h-7" strokeWidth={1.5} />,
                },
                {
                  title: 'Comparable Sales',
                  description:
                    'View recent sales of similar properties in the area to understand market trends and property values.',
                  icon: <HomeIcon className="w-7 h-7" strokeWidth={1.5} />,
                },
                {
                  title: 'Suburb Insights',
                  description:
                    'Comprehensive suburb data including median prices, growth trends, demand indicators, and market statistics.',
                  icon: <MapPin className="w-7 h-7" strokeWidth={1.5} />,
                },
                {
                  title: 'Detailed Reports',
                  description:
                    'Download comprehensive PDF reports with all property insights, estimates, and market analysis delivered to your email.',
                  icon: <FileText className="w-7 h-7" strokeWidth={1.5} />,
                },
              ].map((feature) => (
                <div key={feature.title} className="bg-white rounded-md shadow-sm border border-gray-200 p-6 md:p-8">
                  {/* Icon Container */}
                  <div className="w-14 h-14 bg-primary-100 rounded-md flex items-center justify-center mb-5 text-primary-600">
                    {feature.icon}
                  </div>

                  {/* Content */}
                  <h3 className="text-xl md:text-2xl font-heading font-bold text-dark-green mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-muted-600 leading-relaxed text-sm md:text-base">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 md:py-24 bg-white">
          <div className="container mx-auto px-4 sm:px-5 md:px-6 lg:px-8">
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-dark-green mb-4">
                Get Your Property Report in 3 Simple Steps
              </h2>
              <p className="text-lg md:text-xl text-muted-600 max-w-2xl mx-auto">
                Quick, easy, and completely free
              </p>
            </div>

            <div className="max-w-5xl mx-auto">
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
                  <div key={item.step} className="bg-white rounded-md shadow-sm border border-gray-200 p-6 md:p-8 text-center">
                    {/* Icon */}
                    <div className="w-16 h-16 mx-auto mb-5 text-primary-600 flex items-center justify-center">
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

        {/* Privacy & Trust Message */}
        <section className="py-16 bg-primary-50">
          <div className="container mx-auto px-4 sm:px-5 md:px-6 lg:px-8">
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
        <FAQ faqContent={faqContent} showHeader={true} showHelpSection={true} variant="default" />
      </div>
    </>
  )
}

export default Home
