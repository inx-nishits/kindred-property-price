import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import PropertySearch from '../components/property/PropertySearch'
import ScrollReveal from '../components/animations/ScrollReveal'
import AnimatedCard from '../components/animations/AnimatedCard'
import NumberCounter from '../components/animations/NumberCounter'
import FAQ from '../components/common/FAQ'
import SEO from '../components/common/SEO'
import staticContent from '../data/staticContent.json'

function Home() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [currentWord, setCurrentWord] = useState(0)
  const [resultsListMaxHeight, setResultsListMaxHeight] = useState(null)
  const resultsContainerRef = useRef(null)
  const resultsListRef = useRef(null)
  const scrollFooterRef = useRef(null)
  const faqContent = staticContent.faq

  // Animated words for the hero title
  const animatedWords = ['True Value', 'Market Worth', 'Price Estimate', 'Full Potential']

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWord((prev) => (prev + 1) % animatedWords.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

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

  const features = [
    {
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      ),
      title: 'Property Estimates',
      description:
        'Get accurate low, mid, and high price estimates based on comprehensive market analysis and comparable sales data.',
    },
    {
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      ),
      title: 'Comparable Sales',
      description:
        'View recent sales of similar properties in the area to understand market trends and property values.',
    },
    {
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
      title: 'Suburb Insights',
      description:
        'Comprehensive suburb data including median prices, growth trends, demand indicators, and market statistics.',
    },
    {
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
      title: 'Detailed Reports',
      description:
        'Download comprehensive PDF reports with all property insights, estimates, and market analysis delivered to your email.',
    },
  ]

  const trustElements = [
    {
      value: 98,
      suffix: '%',
      label: 'Data Accuracy',
      description: 'Verified property information',
    },
    {
      value: 500,
      suffix: 'K+',
      label: 'Properties Analyzed',
      description: 'Across Australia',
    },
    {
      value: 4.8,
      suffix: '/5',
      decimals: 1,
      label: 'User Rating',
      description: 'Trusted by thousands',
    },
  ]

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
          className="hero-section relative min-h-[75vh] md:min-h-[85vh] flex items-center justify-center pb-8 sm:pb-4 md:pb-0 z-[99]"
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
            {/* Black/Dark Gradient Overlay for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/60 to-black/65" />
            {/* Additional overlay for depth and contrast */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            {/* Dark overlay at bottom for better text contrast */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40" />
            
            {/* Floating Gradient Orbs - Subtle neutral accent */}
            <motion.div
              className="absolute top-20 left-[10%] w-72 h-72 md:w-96 md:h-96 rounded-full bg-gradient-to-br from-white/10 to-white/5 blur-3xl"
              animate={{
                x: [0, 30, 0],
                y: [0, -20, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              aria-hidden="true"
            />
            <motion.div
              className="absolute bottom-20 right-[10%] w-64 h-64 md:w-80 md:h-80 rounded-full bg-gradient-to-br from-white/8 to-white/4 blur-3xl"
              animate={{
                x: [0, -25, 0],
                y: [0, 25, 0],
                scale: [1, 0.9, 1],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              aria-hidden="true"
            />
          </div>

          {/* Main Content */}
          <div className="container mx-auto px-4 sm:px-5 md:px-6 lg:px-8 relative z-10 py-8 md:py-12">
            <motion.div
              className="max-w-4xl mx-auto text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              {/* Hero Title - Clean and Elegant */}
              <motion.div
                className="mb-6 md:mb-8 overflow-visible"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                <h1 className="text-3xl md:text-4xl lg:text-6xl font-heading font-extrabold leading-tight tracking-tight overflow-visible">
                  <span className="text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.4)]">
                    Discover Your Property's
                  </span>
                  <br />
                  <span className="relative inline-block mt-2 px-2 overflow-visible">
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={currentWord}
                        className="inline-block bg-gradient-to-r from-white via-primary-300 to-primary-500 bg-clip-text text-transparent italic font-extrabold drop-shadow-[0_2px_6px_rgba(0,0,0,0.4)] px-1 overflow-visible"
                        style={{
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          backgroundClip: 'text',
                        }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                      >
                        {animatedWords[currentWord]}
                      </motion.span>
                    </AnimatePresence>
                  </span>
                </h1>
              </motion.div>

              <motion.p
                className="text-base md:text-xl text-white mb-8 md:mb-10 text-balance max-w-2xl mx-auto font-medium drop-shadow-[0_1px_4px_rgba(0,0,0,0.3)] leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                Get instant property estimates, comparable sales, suburb insights,
                and comprehensive reports for any Australian property.
              </motion.p>

              {/* Search Bar with Overlay Results - Enhanced Visibility */}
              <motion.div
                className="max-w-2xl mx-auto mb-8 relative z-[100]"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
              >
                {/* Glassmorphism Container for Search */}
                <div className="backdrop-blur-md bg-white/95 rounded-2xl p-4 md:p-6 shadow-2xl border border-white/30">
                  <PropertySearch
                    onSelectProperty={handlePropertySelect}
                    showHelpTagline={true}
                    onSearchResultsChange={setSearchResults}
                    onClear={() => setSearchResults([])}
                  />
                </div>

                {/* Search Results - Absolute positioned overlay to prevent page jump */}
                <AnimatePresence>
                  {searchResults.length > 0 && (
                    <motion.div
                      className="absolute left-0 right-0 top-[88px] landscape:top-[76px] md:landscape:top-[88px] z-[999] mt-2"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                    >
                      {/* Results Container */}
                      <div 
                        ref={resultsContainerRef}
                        className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden landscape:rounded-lg md:landscape:rounded-xl"
                      >
                        {/* Results Header - compact in mobile landscape */}
                        <div className="flex items-center justify-between px-5 py-3 landscape:px-3 landscape:py-2 md:landscape:px-5 md:landscape:py-3 bg-gray-50 border-b border-gray-100">
                          <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            <span className="text-sm font-semibold text-dark-green">
                              {searchResults.length} {searchResults.length === 1 ? 'Property' : 'Properties'} Found
                            </span>
                          </div>
                          <button
                            onClick={() => setSearchResults([])}
                            className="text-xs text-muted-500 hover:text-red-500 transition-colors flex items-center gap-1"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
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
                          {searchResults.map((property, index) => (
                            <motion.button
                              key={property.id}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: index * 0.02 }}
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
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                        </svg>
                                        {property.beds} bed{property.beds !== 1 ? 's' : ''}
                                      </span>
                                    )}
                                    {property.baths > 0 && (
                                      <span className="flex items-center gap-1">
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                                        </svg>
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
                                <svg className="w-5 h-5 text-muted-300 group-hover:text-primary-500 group-hover:translate-x-1 transition-all shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </div>
                            </motion.button>
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
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

            </motion.div>
          </div>
        </section>

        {/* Trust Elements */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 sm:px-5 md:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {trustElements.map((item, index) => (
                <ScrollReveal key={index} delay={index * 0.1}>
                  <div className="text-center">
                    <div className="text-4xl md:text-5xl font-bold text-primary-500 mb-2">
                      <NumberCounter
                        value={item.value}
                        suffix={item.suffix}
                        decimals={item.decimals || 0}
                      />
                    </div>
                    <h3 className="text-lg font-semibold text-dark-green mb-1">
                      {item.label}
                    </h3>
                    <p className="text-sm text-muted-600">{item.description}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features-section" className="py-16 md:py-24 bg-gradient-to-b from-white via-primary-50/30 to-white relative overflow-hidden">
          {/* Decorative Background Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-10 right-20 w-96 h-96 bg-primary-100 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob" />
            <div className="absolute bottom-20 left-20 w-96 h-96 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob animation-delay-2000" />
          </div>

          <div className="container mx-auto px-4 sm:px-5 md:px-6 lg:px-8 relative z-10">
            <ScrollReveal>
              <div className="text-center mb-16 md:mb-20">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="inline-block mb-4"
                >
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Complete Insights
                  </span>
                </motion.div>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading font-extrabold text-dark-green mb-6 leading-tight">
                  <span className="bg-gradient-to-r from-dark-green via-primary-600 to-primary-500 bg-clip-text text-transparent">
                    Everything You Need to Know
                  </span>
                </h2>
                <p className="text-lg md:text-xl text-muted-600 max-w-3xl mx-auto leading-relaxed">
                  Comprehensive property insights at your fingertips
                </p>
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 max-w-7xl mx-auto">
              {features.map((feature, index) => (
                <ScrollReveal key={index} delay={index * 0.1} direction="up">
                  <motion.div
                    className="h-full group"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ y: -8, scale: 1.02 }}
                  >
                    <div className="relative h-full bg-white rounded-2xl shadow-lg p-8 border border-primary-100/50 transition-all duration-500 hover:shadow-2xl hover:border-primary-300 overflow-hidden">
                      {/* Hover Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-br from-primary-500/0 to-primary-600/0 group-hover:from-primary-500/5 group-hover:to-primary-600/5 transition-all duration-500 rounded-2xl" />

                      {/* Shine Effect on Hover */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                      </div>

                      {/* Icon Container with Enhanced Design */}
                      <motion.div
                        className="relative mb-6 z-10"
                        whileHover={{ scale: 1.1, rotate: [0, -5, 5, -5, 0] }}
                        transition={{ duration: 0.5 }}
                      >
                        <div className="relative inline-flex">
                          {/* Icon Glow */}
                          <div className="absolute inset-0 bg-primary-200 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-300" />
                          {/* Icon Background */}
                          <div className="relative w-20 h-20 bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl flex items-center justify-center text-primary-600 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:from-primary-200 group-hover:to-primary-300">
                            <div className="transform group-hover:scale-110 transition-transform duration-300">
                              {feature.icon}
                            </div>
                          </div>
                        </div>
                      </motion.div>

                      {/* Content */}
                      <div className="relative z-10">
                        <h3 className="text-xl md:text-2xl font-heading font-bold mb-3 text-dark-green group-hover:text-primary-600 transition-colors duration-300">
                          {feature.title}
                        </h3>
                        <p className="text-muted-600 leading-relaxed text-base group-hover:text-muted-700 transition-colors duration-300">
                          {feature.description}
                        </p>
                      </div>

                      {/* Decorative Bottom Accent */}
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary-200 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                      {/* Corner Accents */}
                      <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-primary-200/50 rounded-tr-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-primary-200/50 rounded-bl-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </div>
                  </motion.div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-10 md:py-32 bg-gradient-to-b from-white via-primary-50/20 to-white relative overflow-hidden">
          {/* Decorative Background Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-10 w-72 h-72 bg-primary-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
            <div className="absolute top-40 right-10 w-72 h-72 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
            <div className="absolute -bottom-32 left-1/2 w-72 h-72 bg-primary-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
          </div>

          <div className="container mx-auto px-4 sm:px-5 md:px-6 lg:px-8 relative z-10">
            <ScrollReveal>
              <div className="text-center mb-20">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="inline-block mb-4"
                >
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                    Simple Process
                  </span>
                </motion.div>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading font-extrabold text-dark-green mb-6 leading-tight">
                  <span className="bg-gradient-to-r from-dark-green via-primary-600 to-primary-500 bg-clip-text text-transparent">
                    How It Works
                  </span>
                </h2>
                <p className="text-lg md:text-xl text-muted-600 max-w-2xl mx-auto leading-relaxed">
                  Get comprehensive property insights in just three simple steps
                </p>
              </div>
            </ScrollReveal>

            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 lg:gap-12 relative w-full">
                {/* Animated Connecting Arrows - Desktop Only */}
                <div className="hidden md:block absolute top-32 left-0 right-0 h-0.5">
                  <div className="absolute top-0 left-[16.66%] right-[16.66%] h-full bg-gradient-to-r from-transparent via-primary-300 to-transparent opacity-60" />
                  <motion.div
                    className="absolute top-0 left-[16.66%] h-full bg-primary-500 origin-left"
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.5 }}
                  />
                  {/* Arrow Heads */}
                  <motion.svg
                    className="absolute top-1/2 left-[33.33%] transform -translate-y-1/2 -translate-x-1/2 w-6 h-6 text-primary-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 1.5 }}
                  >
                    <path
                      fillRule="evenodd"
                      d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </motion.svg>
                  <motion.svg
                    className="absolute top-1/2 left-[66.66%] transform -translate-y-1/2 -translate-x-1/2 w-6 h-6 text-primary-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 1.7 }}
                  >
                    <path
                      fillRule="evenodd"
                      d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </motion.svg>
                </div>

                {[
                  {
                    step: '1',
                    title: 'Search Property',
                    description:
                      'Enter any Australian property address to get started with instant property insights.',
                    icon: (
                      <svg
                        className="w-10 h-10"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    ),
                    gradient: 'from-blue-500 to-cyan-500',
                  },
                  {
                    step: '2',
                    title: 'View Insights',
                    description:
                      'Browse detailed property estimates, comparable sales, and comprehensive market data.',
                    icon: (
                      <svg
                        className="w-10 h-10"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    ),
                    gradient: 'from-purple-500 to-pink-500',
                  },
                  {
                    step: '3',
                    title: 'Get Full Report',
                    description:
                      'Unlock comprehensive PDF reports with all insights delivered directly to your email.',
                    icon: (
                      <svg
                        className="w-10 h-10"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    ),
                    gradient: 'from-orange-500 to-red-500',
                  },
                ].map((item, index) => (
                  <ScrollReveal key={index} delay={index * 0.2}>
                    <motion.div
                      className="relative h-full group mb-6 md:mb-0 w-full"
                      initial={{ opacity: 0, y: 50 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: index * 0.15 }}
                      whileHover={{ y: -12, scale: 1.02 }}
                    >
                      {/* Mobile Arrow Indicator - Only show between cards (up to 767px) */}
                      {index < 2 && (
                        <div className="md:hidden absolute -bottom-3 left-1/2 transform -translate-x-1/2 z-10">
                          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-primary-200">
                            <svg
                              className="w-5 h-5 text-primary-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2.5}
                                d="M19 14l-7 7m0 0l-7-7m7 7V3"
                              />
                            </svg>
                          </div>
                        </div>
                      )}
                      {/* Step Number Badge with Glow Effect */}
                      <div className="absolute -top-4 md:-top-6 left-1/2 transform -translate-x-1/2 z-20">
                        <motion.div
                          className="relative"
                          whileHover={{ scale: 1.1 }}
                          transition={{ type: 'spring', stiffness: 400 }}
                        >
                          <div className="absolute inset-0 bg-primary-500 rounded-full blur-lg opacity-50 animate-pulse" />
                          <div className="relative w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-white to-primary-50 border-3 md:border-4 border-primary-500 rounded-full flex items-center justify-center shadow-2xl">
                            <span className="text-primary-600 font-extrabold text-lg md:text-xl">
                              {item.step}
                            </span>
                          </div>
                        </motion.div>
                      </div>

                      {/* Card with Enhanced Design */}
                      <div className="relative bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 rounded-2xl md:rounded-3xl shadow-2xl p-6 xl:p-10 pt-12 md:pt-16 h-full w-full flex flex-col items-center text-center transform transition-all duration-500 hover:shadow-[0_20px_60px_-15px_rgba(16,185,129,0.5)] overflow-hidden">
                        {/* Animated Background Pattern */}
                        <div className="absolute inset-0 opacity-10">
                          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)]" />
                        </div>

                        {/* Shine Effect on Hover */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                        </div>

                        {/* Icon Container with Enhanced Design */}
                        <motion.div
                          className="relative w-16 h-16 md:w-24 md:h-24 bg-white/25 backdrop-blur-md rounded-2xl md:rounded-3xl flex items-center justify-center mb-4 md:mb-8 text-white shadow-2xl z-10 mt-5"
                          whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
                          transition={{ duration: 0.5 }}
                        >
                          {/* Icon Glow */}
                          <div className="absolute inset-0 bg-white/30 rounded-2xl md:rounded-3xl blur-xl" />
                          <div className="relative z-10 scale-75 md:scale-100">{item.icon}</div>
                        </motion.div>

                        {/* Content */}
                        <h3 className="text-2xl xl:text-3xl font-heading font-bold text-white mb-3 md:mb-5 z-10 relative">
                          {item.title}
                        </h3>
                        <p className="text-primary-50 text-sm md:text-lg leading-relaxed flex-grow z-10 relative px-2">
                          {item.description}
                        </p>

                        {/* Decorative Elements */}
                        <div className="mt-4 md:mt-8 flex items-center gap-2 z-10 relative">
                          <div className="w-8 md:w-12 h-1 bg-white/40 rounded-full" />
                          <div className="w-1.5 md:w-2 h-1.5 md:h-2 bg-white/60 rounded-full" />
                          <div className="w-8 md:w-12 h-1 bg-white/40 rounded-full" />
                        </div>

                        {/* Corner Accents */}
                        <div className="absolute top-3 right-3 md:top-4 md:right-4 w-10 h-10 md:w-16 md:h-16 border-t-2 border-r-2 border-white/20 rounded-tr-2xl md:rounded-tr-3xl" />
                        <div className="absolute bottom-3 left-3 md:bottom-4 md:left-4 w-10 h-10 md:w-16 md:h-16 border-b-2 border-l-2 border-white/20 rounded-bl-2xl md:rounded-bl-3xl" />
                      </div>
                    </motion.div>
                  </ScrollReveal>
                ))}
              </div>

              {/* Enhanced Call to Action */}
              <ScrollReveal delay={0.6}>
                <motion.div
                  className="text-center mt-12 md:mt-20"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                >
                  <div className="inline-block p-6 md:p-8 bg-white rounded-2xl md:rounded-3xl shadow-xl border border-primary-100 w-full md:w-auto max-w-md md:max-w-none">
                    <p className="text-lg md:text-2xl font-semibold text-dark-green mb-2">
                      Ready to discover your property's value?
                    </p>
                    <p className="text-muted-600 mb-4 md:mb-6 text-sm md:text-base">
                      Start your search now and get instant insights
                    </p>
                    <motion.button
                      onClick={() => {
                        document
                          .querySelector('.hero-section')
                          ?.scrollIntoView({ behavior: 'smooth' })
                      }}
                      className="btn btn-secondary px-6 md:px-10 py-3 md:py-4 text-base md:text-lg font-semibold inline-flex items-center gap-2 md:gap-3 shadow-lg w-full md:w-auto justify-center"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <svg
                        className="w-5 h-5 md:w-6 md:h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                      <span className="whitespace-nowrap">Start Your Search</span>
                      <svg
                        className="w-4 h-4 md:w-5 md:h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 7l5 5m0 0l-5 5m5-5H6"
                        />
                      </svg>
                    </motion.button>
                  </div>
                </motion.div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* Privacy & Trust Message */}
        <section className="py-16 bg-primary-50">
          <div className="container mx-auto px-4 sm:px-5 md:px-6 lg:px-8">
            <ScrollReveal>
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
            </ScrollReveal>
          </div>
        </section>

        {/* FAQ Section */}
        <FAQ faqContent={faqContent} showHeader={true} showHelpSection={true} variant="default" />
      </div>
    </>
  )
}

export default Home
