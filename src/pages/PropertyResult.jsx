import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { getPropertyDetails } from '../services/propertyService'
import { submitLeadForm } from '../services/propertyService'
import LeadCaptureModal from '../components/property/LeadCaptureModal'
import BlurredContent from '../components/property/BlurredContent'
import { PropertyCardSkeleton } from '../components/common/SkeletonLoader'
import ScrollReveal from '../components/animations/ScrollReveal'
import SEO from '../components/common/SEO'

function PropertyResult() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  // Get property from location state first, then try to fetch if needed
  const [property, setProperty] = useState(location.state?.property || null)
  const [isLoading, setIsLoading] = useState(!property)
  const [error, setError] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUnlocked, setIsUnlocked] = useLocalStorage(
    `property_${id}_unlocked`,
    false
  )
  const [userEmail, setUserEmail] = useLocalStorage(
    `property_${id}_email`,
    ''
  )

  // Always fetch full property details to ensure all features are available
  useEffect(() => {
    // Scroll to top when page loads
    window.scrollTo({ top: 0, behavior: 'smooth' })

    const fetchFullPropertyDetails = async () => {
      // If we have property from state, use it immediately for instant display
      if (location.state?.property && location.state.property.id === id) {
        setProperty(location.state.property)
        setIsLoading(false)
        setError(null)
      } else if (!location.state?.property) {
        // Only show loading if we don't have property from state
        setIsLoading(true)
      }

      // Always fetch full details to get comparables, suburbInsights, schools, salesHistory
      if (!id) {
        setIsLoading(false)
        setError('No property ID provided')
        return
      }

      try {
        setError(null)
        const fullPropertyData = await getPropertyDetails(id)
        if (fullPropertyData) {
          // Use the full property data which includes all features
          setProperty(fullPropertyData)
        } else {
          setError('Property not found')
        }
      } catch (error) {
        console.error('Error fetching property:', error)
        setError(error.message || 'Failed to load property details')
        // Don't clear property if we have it from state
        if (!location.state?.property) {
          setProperty(null)
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchFullPropertyDetails()
  }, [id, navigate]) // Removed location.state from deps to avoid re-fetching on every render

  const handleUnlockClick = () => {
    if (isUnlocked) return
    setIsModalOpen(true)
  }

  const handleFormSubmit = async (formData) => {
    setIsSubmitting(true)
    try {
      await submitLeadForm(formData)
      setIsUnlocked(true)
      setUserEmail(formData.email)
      setIsModalOpen(false)
      // Show success message
      alert(
        'Thank you! Your comprehensive property report will be sent to your email shortly.'
      )
    } catch (error) {
      console.error('Error submitting form:', error)
      alert('There was an error. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 sm:px-5 md:px-6 lg:px-8 py-12">
        <PropertyCardSkeleton />
      </div>
    )
  }

  if (!property && !isLoading) {
    return (
      <div className="container mx-auto px-4 sm:px-5 md:px-6 lg:px-8 py-12 text-center">
        <h1 className="text-2xl font-bold text-dark-green mb-4">
          Property Not Found
        </h1>
        {error && (
          <p className="text-red-600 mb-4">{error}</p>
        )}
        <button onClick={() => navigate('/')} className="btn btn-primary">
          Back to Home
        </button>
      </div>
    )
  }

  return (
    <>
      <SEO
        title={`${property.address} | Property Insights`}
        description={`Property insights for ${property.address}. View estimates, comparable sales, suburb data, and more.`}
        keywords={`${property.address}, property estimate, property value, ${property.suburb}, property data`}
        type="article"
        og={{
          article: {
            publishedTime: property.lastSoldDate,
            section: 'Property Insights',
            tags: [property.suburb, property.state, 'Property Estimate', 'Real Estate'],
          },
        }}
      />

      {/* Background with gradient */}
      <div className="min-h-screen bg-gradient-to-b from-white via-primary-50/20 to-white relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-20 w-96 h-96 bg-primary-100 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob" />
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob animation-delay-2000" />
        </div>

        <div className="container mx-auto px-4 sm:px-5 md:px-6 lg:px-8 py-6 md:py-8 relative z-10">
          {/* Compact Header with Back Button */}
          <ScrollReveal>
            <div className="mb-6">
              <motion.button
                onClick={() => navigate('/')}
                className="text-primary-500 hover:text-primary-600 mb-4 flex items-center gap-2 font-semibold transition-colors group"
                whileHover={{ x: -4 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg
                  className="w-5 h-5 group-hover:-translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Back to Search
              </motion.button>
              
              {/* Compact Header Card */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-primary-100/50 p-5 md:p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-heading font-extrabold text-dark-green mb-2 leading-tight">
                      <span className="bg-gradient-to-r from-dark-green via-primary-600 to-primary-500 bg-clip-text text-transparent">
                        {property.address}
                      </span>
                    </h1>
                    <div className="flex items-center gap-2 text-muted-600">
                      <svg
                        className="w-4 h-4 text-primary-500"
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
                      <span className="text-sm md:text-base">
                        {property.suburb}, {property.state} {property.postcode}
                      </span>
                    </div>
                  </div>
                  
                  {/* Quick Stats in Header */}
                  <div className="flex gap-3 md:gap-4">
                    <div className="text-center px-4 py-2 bg-gradient-to-br from-primary-50 to-primary-100/50 rounded-xl border border-primary-200/50">
                      <div className="text-xs text-muted-600 mb-1">Beds</div>
                      <div className="text-xl font-bold text-dark-green">{property.beds}</div>
                    </div>
                    <div className="text-center px-4 py-2 bg-gradient-to-br from-primary-50 to-primary-100/50 rounded-xl border border-primary-200/50">
                      <div className="text-xs text-muted-600 mb-1">Baths</div>
                      <div className="text-xl font-bold text-dark-green">{property.baths}</div>
                    </div>
                    {property.landSize > 0 && (
                      <div className="text-center px-4 py-2 bg-gradient-to-br from-primary-50 to-primary-100/50 rounded-xl border border-primary-200/50 hidden sm:block">
                        <div className="text-xs text-muted-600 mb-1">Land</div>
                        <div className="text-sm font-bold text-dark-green">{property.landSize}m²</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Two Column Layout for Estimates - More Compact */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Price Estimate - Locked */}
            <ScrollReveal delay={0.1}>
              <motion.div
                className="card relative overflow-hidden group h-full"
                whileHover={{ y: -2, scale: 1.01 }}
                transition={{ duration: 0.3 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/0 to-primary-600/0 group-hover:from-primary-500/5 group-hover:to-primary-600/5 transition-all duration-500 rounded-lg" />
                
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h2 className="text-xl md:text-2xl font-heading font-bold text-dark-green">Price Estimate</h2>
                  </div>
                  <BlurredContent isLocked={!isUnlocked} onUnlock={handleUnlockClick} className="min-h-[200px]">
                    {property.priceEstimate && (
                      <div className="space-y-3 min-h-[200px]">
                        {[
                          { label: 'Low', value: formatCurrency(property.priceEstimate.low), bg: 'from-primary-50 to-white', textColor: 'text-dark-green' },
                          { label: 'Mid (Best)', value: formatCurrency(property.priceEstimate.mid), bg: 'from-primary-100 to-primary-50', textColor: 'text-primary-600', highlight: true },
                          { label: 'High', value: formatCurrency(property.priceEstimate.high), bg: 'from-primary-50 to-white', textColor: 'text-dark-green' },
                        ].map((estimate, index) => (
                          <motion.div
                            key={index}
                            className={`p-4 bg-gradient-to-br ${estimate.bg} rounded-lg border ${estimate.highlight ? 'border-primary-300 shadow-md' : 'border-primary-100/50'} hover:shadow-lg transition-all`}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 + index * 0.1 }}
                            whileHover={{ scale: 1.02 }}
                          >
                            <div className="flex items-center justify-between">
                              <div className="text-sm text-muted-600 font-medium">{estimate.label}</div>
                              {estimate.highlight && (
                                <span className="px-2 py-0.5 bg-primary-500 text-white text-xs font-bold rounded-full">BEST</span>
                              )}
                            </div>
                            <div className={`text-xl md:text-2xl font-bold ${estimate.textColor} mt-1`}>
                              {estimate.value}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </BlurredContent>
                </div>
              </motion.div>
            </ScrollReveal>

            {/* Rental Estimate - Locked */}
            <ScrollReveal delay={0.15}>
              <motion.div
                className="card relative overflow-hidden group h-full"
                whileHover={{ y: -2, scale: 1.01 }}
                transition={{ duration: 0.3 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/0 to-primary-600/0 group-hover:from-primary-500/5 group-hover:to-primary-600/5 transition-all duration-500 rounded-lg" />
                
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                    </div>
                    <h2 className="text-xl md:text-2xl font-heading font-bold text-dark-green">Rental Estimate</h2>
                  </div>
                  <BlurredContent isLocked={!isUnlocked} onUnlock={handleUnlockClick} className="min-h-[200px]">
                    {property.rentalEstimate && (
                      <div className="space-y-3 min-h-[200px]">
                        <motion.div
                          className="p-4 bg-gradient-to-br from-primary-50 to-white rounded-lg border border-primary-100/50 hover:shadow-lg transition-all"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.15 }}
                          whileHover={{ scale: 1.02 }}
                        >
                          <div className="text-sm text-muted-600 font-medium mb-1">Weekly Rent</div>
                          <div className="text-xl md:text-2xl font-bold text-dark-green">
                            {formatCurrency(property.rentalEstimate.weekly)}<span className="text-sm text-muted-600">/week</span>
                          </div>
                        </motion.div>
                        <motion.div
                          className="p-4 bg-gradient-to-br from-primary-100 to-primary-50 rounded-lg border border-primary-300 hover:shadow-lg transition-all"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 }}
                          whileHover={{ scale: 1.02 }}
                        >
                          <div className="text-sm text-muted-600 font-medium mb-1">Rental Yield</div>
                          <div className="text-xl md:text-2xl font-bold text-primary-600">
                            {property.rentalEstimate.yield}%
                          </div>
                        </motion.div>
                      </div>
                    )}
                  </BlurredContent>
                </div>
              </motion.div>
            </ScrollReveal>
          </div>

          {/* Two Column Layout: Comparable Sales & Suburb Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Comparable Sales - Locked */}
            <ScrollReveal delay={0.2}>
              <motion.div
                className="card relative overflow-hidden group h-full"
                whileHover={{ y: -2, scale: 1.01 }}
                transition={{ duration: 0.3 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/0 to-primary-600/0 group-hover:from-primary-500/5 group-hover:to-primary-600/5 transition-all duration-500 rounded-lg" />
                
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <h2 className="text-xl md:text-2xl font-heading font-bold text-dark-green">Comparable Sales</h2>
                  </div>
                  <BlurredContent isLocked={!isUnlocked} onUnlock={handleUnlockClick} className="min-h-[200px]">
                    <div className="space-y-3 max-h-[500px] overflow-y-auto scrollbar-thin pr-2 min-h-[200px]">
                      {property.comparables && property.comparables.length > 0 ? (
                        property.comparables.map((sale, index) => (
                          <motion.div
                            key={index}
                            className="p-4 bg-gradient-to-br from-white to-primary-50/30 border border-primary-100/50 rounded-lg hover:shadow-md hover:border-primary-300 transition-all"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 + index * 0.03 }}
                            whileHover={{ scale: 1.01 }}
                          >
                            <div className="flex justify-between items-start gap-3 mb-2">
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold text-dark-green text-sm mb-1 truncate">
                                  {sale.address}
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-muted-600">
                                  <span>{formatDate(sale.saleDate)}</span>
                                  <span>•</span>
                                  <span>{sale.distance}km</span>
                                </div>
                              </div>
                              <div className="text-right shrink-0">
                                <div className="text-lg font-bold text-primary-600">
                                  {formatCurrency(sale.salePrice)}
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2 text-xs">
                              <span className="px-2 py-0.5 bg-primary-100 text-primary-700 rounded-full font-medium">
                                {sale.beds} bed{sale.beds !== 1 ? 's' : ''}
                              </span>
                              <span className="px-2 py-0.5 bg-primary-100 text-primary-700 rounded-full font-medium">
                                {sale.baths} bath{sale.baths !== 1 ? 's' : ''}
                              </span>
                              {sale.landSize > 0 && (
                                <span className="px-2 py-0.5 bg-primary-100 text-primary-700 rounded-full font-medium">
                                  {sale.landSize}m²
                                </span>
                              )}
                            </div>
                          </motion.div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-muted-600 text-sm">No comparable sales data available</p>
                        </div>
                      )}
                    </div>
                  </BlurredContent>
                </div>
              </motion.div>
            </ScrollReveal>

            {/* Suburb Insights - Locked */}
            <ScrollReveal delay={0.25}>
              <motion.div
                className="card relative overflow-hidden group h-full"
                whileHover={{ y: -2, scale: 1.01 }}
                transition={{ duration: 0.3 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/0 to-primary-600/0 group-hover:from-primary-500/5 group-hover:to-primary-600/5 transition-all duration-500 rounded-lg" />
                
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <h2 className="text-xl md:text-2xl font-heading font-bold text-dark-green">Suburb Insights</h2>
                  </div>
                  <BlurredContent isLocked={!isUnlocked} onUnlock={handleUnlockClick} className="min-h-[200px]">
                    {property.suburbInsights && (
                      <div className="grid grid-cols-2 gap-3 min-h-[200px]">
                        {[
                          { label: 'Median Price', value: formatCurrency(property.suburbInsights.medianPrice), highlight: false },
                          { label: 'Growth', value: `+${property.suburbInsights.growthPercent}%`, highlight: true },
                          { label: 'Demand', value: property.suburbInsights.demand, highlight: false },
                          { label: 'Days on Market', value: `${property.suburbInsights.averageDaysOnMarket}`, highlight: false },
                          { label: 'Clearance Rate', value: `${property.suburbInsights.auctionClearanceRate}%`, highlight: true },
                          { label: 'Population', value: property.suburbInsights.population.toLocaleString(), highlight: false },
                        ].map((insight, index) => (
                          <motion.div
                            key={index}
                            className={`p-3 bg-gradient-to-br ${insight.highlight ? 'from-primary-100 to-primary-50 border-primary-300' : 'from-white to-primary-50/30 border-primary-100/50'} border rounded-lg hover:shadow-md transition-all`}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.25 + index * 0.03 }}
                            whileHover={{ scale: 1.05 }}
                          >
                            <div className="text-xs text-muted-600 font-medium mb-1">{insight.label}</div>
                            <div className={`text-lg font-bold ${insight.highlight ? 'text-primary-600' : 'text-dark-green'}`}>
                              {insight.value}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </BlurredContent>
                </div>
              </motion.div>
            </ScrollReveal>
          </div>

          {/* Two Column Layout: Schools & Sales History */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Nearby Schools - Locked */}
            <ScrollReveal delay={0.3}>
              <motion.div
                className="card relative overflow-hidden group h-full"
                whileHover={{ y: -2, scale: 1.01 }}
                transition={{ duration: 0.3 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/0 to-primary-600/0 group-hover:from-primary-500/5 group-hover:to-primary-600/5 transition-all duration-500 rounded-lg" />
                
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <h2 className="text-xl md:text-2xl font-heading font-bold text-dark-green">Nearby Schools</h2>
                  </div>
                  <BlurredContent isLocked={!isUnlocked} onUnlock={handleUnlockClick} className="min-h-[200px]">
                    <div className="space-y-3 max-h-[500px] overflow-y-auto scrollbar-thin pr-2 min-h-[200px]">
                      {property.schools && property.schools.length > 0 ? (
                        property.schools.map((school, index) => (
                          <motion.div
                            key={index}
                            className="p-4 bg-gradient-to-br from-white to-primary-50/30 border border-primary-100/50 rounded-lg hover:shadow-md hover:border-primary-300 transition-all"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 + index * 0.03 }}
                            whileHover={{ scale: 1.01 }}
                          >
                            <div className="flex justify-between items-start gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold text-sm text-dark-green mb-1 truncate">
                                  {school.name}
                                </div>
                                <div className="flex flex-wrap items-center gap-1.5 mb-2">
                                  <span className="px-2 py-0.5 bg-primary-100 text-primary-700 rounded-full text-xs font-medium">
                                    {school.type}
                                  </span>
                                  <span className="text-xs text-muted-600">{school.yearRange}</span>
                                </div>
                                <div className="text-xs text-muted-600">{school.distance} km away</div>
                              </div>
                              <div className="shrink-0">
                                <div className="text-center px-3 py-2 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg">
                                  <div className="text-xl font-bold text-primary-600">{school.rating}</div>
                                  <div className="text-xs text-primary-700 font-medium">Rating</div>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-muted-600 text-sm">No nearby schools data available</p>
                        </div>
                      )}
                    </div>
                  </BlurredContent>
                </div>
              </motion.div>
            </ScrollReveal>

            {/* Past Sales History - Locked */}
            <ScrollReveal delay={0.35}>
              <motion.div
                className="card relative overflow-hidden group h-full"
                whileHover={{ y: -2, scale: 1.01 }}
                transition={{ duration: 0.3 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/0 to-primary-600/0 group-hover:from-primary-500/5 group-hover:to-primary-600/5 transition-all duration-500 rounded-lg" />
                
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h2 className="text-xl md:text-2xl font-heading font-bold text-dark-green">Past Sales History</h2>
                  </div>
                  <BlurredContent isLocked={!isUnlocked} onUnlock={handleUnlockClick} className="min-h-[200px]">
                    <div className="space-y-3 max-h-[500px] overflow-y-auto scrollbar-thin pr-2 min-h-[200px]">
                      {property.salesHistory && property.salesHistory.length > 0 ? (
                        property.salesHistory.map((sale, index) => (
                          <motion.div
                            key={index}
                            className="p-4 bg-gradient-to-br from-white to-primary-50/30 border border-primary-100/50 rounded-lg hover:shadow-md hover:border-primary-300 transition-all"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.35 + index * 0.03 }}
                            whileHover={{ scale: 1.01 }}
                          >
                            <div className="flex justify-between items-center gap-3">
                              <div className="flex-1">
                                <div className="font-bold text-lg text-dark-green mb-1">
                                  {formatCurrency(sale.salePrice)}
                                </div>
                                <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-600">
                                  <span>{formatDate(sale.saleDate)}</span>
                                  <span>•</span>
                                  <span className="px-2 py-0.5 bg-primary-100 text-primary-700 rounded-full font-medium">
                                    {sale.saleType}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-muted-600 text-sm">No past sales history available</p>
                        </div>
                      )}
                    </div>
                  </BlurredContent>
                </div>
              </motion.div>
            </ScrollReveal>
          </div>

          {/* CTA Section - Compact */}
          {!isUnlocked && (
            <ScrollReveal delay={0.4}>
              <motion.div
                className="card bg-gradient-to-br from-primary-50 via-primary-100/50 to-primary-50 border-primary-200 text-center mb-6 relative overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                whileHover={{ y: -2, scale: 1.01 }}
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary-200/20 rounded-full blur-2xl" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary-300/20 rounded-full blur-2xl" />
                
                <div className="relative z-10">
                  <div className="flex items-center justify-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-xl md:text-2xl font-heading font-bold text-dark-green">
                        Get Your Complete Property Report
                      </h2>
                      <p className="text-sm text-muted-600 mt-1">
                        Unlock all insights & receive PDF report via email
                      </p>
                    </div>
                  </div>
                  <motion.button
                    onClick={handleUnlockClick}
                    className="btn btn-primary px-6 py-3 flex items-center gap-2 mx-auto shadow-lg"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Unlock Full Report
                  </motion.button>
                </div>
              </motion.div>
            </ScrollReveal>
          )}

          {/* Success Message - Compact */}
          {isUnlocked && userEmail && (
            <ScrollReveal>
              <motion.div
                className="card bg-gradient-to-br from-green-50 to-green-100/50 border-green-300 text-center mb-6"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <motion.div
                  className="text-green-600 mb-3"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                >
                  <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </motion.div>
                <h3 className="text-xl font-heading font-bold text-dark-green mb-2">Report Sent!</h3>
                <p className="text-muted-700 text-sm">
                  Sent to <strong className="text-dark-green">{userEmail}</strong>
                </p>
              </motion.div>
            </ScrollReveal>
          )}

          {/* Bottom spacing */}
          <div className="h-6" />
        </div>
      </div>

      {/* Lead Capture Modal */}
      <LeadCaptureModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        isSubmitting={isSubmitting}
      />
    </>
  )
}

export default PropertyResult

