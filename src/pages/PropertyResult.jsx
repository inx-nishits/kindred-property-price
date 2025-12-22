import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom'
import { createPortal } from 'react-dom'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { getPropertyDetails } from '../services/propertyService'
import { submitLeadForm } from '../services/propertyService'
import LeadCaptureModal from '../components/property/LeadCaptureModal'
import BlurredContent from '../components/property/BlurredContent'
import { PropertyCardSkeleton } from '../components/common/SkeletonLoader'
import ScrollReveal from '../components/animations/ScrollReveal'
import SEO from '../components/common/SEO'
import SuccessModal from '../components/common/SuccessModal'

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
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)
  const [errorModalMessage, setErrorModalMessage] = useState('')
  const [isUnlocked, setIsUnlocked] = useLocalStorage(
    `property_${id}_unlocked`,
    false
  )
  const [userEmail, setUserEmail] = useLocalStorage(
    `property_${id}_email`,
    ''
  )
  const [isImageGalleryOpen, setIsImageGalleryOpen] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [imageLoading, setImageLoading] = useState(true)
  const [imageError, setImageError] = useState(false)

  // Mock property images - in real app, this would come from property data
  const propertyImages = [
    { id: 1, url: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1200&h=800&fit=crop&q=80', alt: 'Property exterior' },
    { id: 2, url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&h=800&fit=crop&q=80', alt: 'Property interior' },
    { id: 3, url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&h=800&fit=crop&q=80', alt: 'Property kitchen' },
    { id: 4, url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&h=800&fit=crop&q=80', alt: 'Property bedroom' },
  ]

  // Keyboard navigation for image gallery
  useEffect(() => {
    if (!isImageGalleryOpen) return

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsImageGalleryOpen(false)
      } else if (e.key === 'ArrowLeft') {
        setCurrentImageIndex((prev) =>
          prev === 0 ? propertyImages.length - 1 : prev - 1
        )
      } else if (e.key === 'ArrowRight') {
        setCurrentImageIndex((prev) =>
          prev === propertyImages.length - 1 ? 0 : prev + 1
        )
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isImageGalleryOpen, propertyImages.length])

  // Reset image loading state when image changes
  useEffect(() => {
    if (isImageGalleryOpen) {
      setImageLoading(true)
      setImageError(false)
    }
  }, [currentImageIndex, isImageGalleryOpen])

  // Lock body scroll when gallery is open
  useEffect(() => {
    if (isImageGalleryOpen) {
      const scrollY = window.scrollY
      document.body.style.overflow = 'hidden'
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY}px`
      document.body.style.width = '100%'
    } else {
      const scrollY = document.body.style.top
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0', 10) * -1)
      }
    }
    return () => {
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
    }
  }, [isImageGalleryOpen])

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

  // Auto-open modal if not unlocked when page loads
  useEffect(() => {
    if (!isUnlocked && property && !isLoading) {
      // Small delay to ensure smooth page load
      const timer = setTimeout(() => {
        setIsModalOpen(true)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [isUnlocked, property, isLoading])

  const handleFormSubmit = async (formData) => {
    setIsSubmitting(true)
    try {
      // Pass property data to generate and send PDF report
      await submitLeadForm(formData, property)
      setIsUnlocked(true)
      setUserEmail(formData.email)
      setIsModalOpen(false)
      // Show success modal
      setIsSuccessModalOpen(true)
    } catch (error) {
      console.error('Error submitting form:', error)
      setErrorModalMessage('There was an error. Please try again.')
      setIsSuccessModalOpen(true)
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

      {/* Clean Background */}
      <div className="min-h-screen bg-white relative">
        <div className="container mx-auto px-4 sm:px-5 md:px-6 lg:px-8 py-6 md:py-8 relative z-10">
          {/* Minimal Header with Back to Main Site */}
          <ScrollReveal>
            <div className="mb-8 flex items-center justify-between">
              <button
                onClick={() => navigate('/')}
                className="text-muted-600 hover:text-dark-green text-sm font-medium transition-colors flex items-center gap-2 group"
              >
                <svg
                  className="w-4 h-4 group-hover:-translate-x-1 transition-transform"
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
                BACK TO MAIN SITE
              </button>
            </div>
          </ScrollReveal>

          {/* Prominent Form CTA Banner - Show when locked (Visible, not blurred) */}
          {!isUnlocked && (
            <ScrollReveal delay={0.05}>
              <div className="mb-8 card bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 text-white relative overflow-hidden">
                <div className="relative z-10 p-6 md:p-8">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <div className="flex-1">
                      <h2 className="text-2xl md:text-3xl font-heading font-bold text-white mb-3">
                        Unlock Complete Property Insights
                      </h2>
                      <p className="text-primary-50 text-base md:text-lg leading-relaxed mb-4">
                        Enter your details to view all property estimates, comparable sales, suburb insights,
                        nearby schools, and sales history. Plus, receive a comprehensive PDF report via email.
                      </p>
                    </div>
                    <button
                      onClick={handleUnlockClick}
                      className="btn bg-white text-primary-600 hover:bg-primary-50 px-8 py-4 text-lg font-semibold shadow-xl whitespace-nowrap"
                    >
                      Get Full Report
                    </button>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          )}

          {/* All Content Wrapped in Full Page Blur */}
          <BlurredContent isLocked={!isUnlocked} className="w-full">
            {/* Property Overview Section */}
            <ScrollReveal>
              <div className="section-spacing">
                {/* Property Title */}
                <div className="mb-6">
                  <p className="text-sm text-muted-600 mb-2">Property report for</p>
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-dark-green mb-4">
                    {property.address}
                  </h1>
                  {/* Inline Stats */}
                  <div className="flex flex-wrap items-center gap-2 text-sm text-muted-600">
                    <span>{property.beds} Bed</span>
                    <span>•</span>
                    <span>{property.baths} Bath</span>
                    {(property.parking > 0 || property.cars > 0) && (
                      <>
                        <span>•</span>
                        <span>{property.parking || property.cars || 0} Car</span>
                      </>
                    )}
                    <span>•</span>
                    <span>{property.propertyType || 'House'}</span>
                    {property.landSize > 0 && (
                      <>
                        <span>•</span>
                        <span>Land: {property.landSize} m²</span>
                      </>
                    )}
                    {property.buildingSize > 0 && (
                      <>
                        <span>•</span>
                        <span>Building: {property.buildingSize} m²</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Estimated Value and Property Image - Enhanced Design */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  {/* Estimated Value Card - Enhanced Dark Green */}
                  <div className="bg-dark-green text-white rounded-xl p-8 md:p-10 relative overflow-hidden shadow-2xl">
                    {/* Subtle gradient overlay for depth */}
                    <div className="absolute inset-0 bg-gradient-to-br from-dark-green via-dark-green to-deepest-green opacity-90"></div>

                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full blur-2xl"></div>

                    <div className="relative z-10">
                      <h2 className="text-lg font-heading font-semibold mb-6 text-white/95 uppercase tracking-wider">
                        Estimated Value
                      </h2>
                      {property.priceEstimate ? (
                        <div className="space-y-6">
                          {/* Price Range - More Prominent */}
                          <div>
                            <div className="text-4xl md:text-4xl font-bold mb-3 leading-tight tracking-tight">
                              {formatCurrency(property.priceEstimate.low)} - {formatCurrency(property.priceEstimate.high)}
                            </div>
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/15 backdrop-blur-sm rounded-full">
                              <div className="w-2 h-2 bg-white/80 rounded-full"></div>
                              <span className="text-sm font-medium text-white/90">Medium Confidence</span>
                            </div>
                          </div>

                          {/* CTA Button */}
                          <div className="pt-6 border-t border-white/25">
                            <Link
                              to="/contact"
                              className="inline-block w-full text-center bg-[color:var(--green-400)] text-[color:var(--green-900)] font-semibold py-3 px-6 rounded-lg hover:bg-[color:var(--green-300)] transition-colors duration-200 shadow-lg"
                            >
                              Book your appraisal today
                            </Link>
                          </div>

                          {/* Disclaimer - Better Readability */}
                          <p className="text-xs text-white/70 leading-relaxed pt-2">
                            This estimate may not include recent renovations or improvements.
                            For a personal appraisal, please contact us.
                          </p>
                        </div>
                      ) : (
                        <div className="text-3xl md:text-4xl font-bold">Loading...</div>
                      )}
                    </div>
                  </div>

                  {/* Property Image - Single Image with Gallery Button */}
                  <div
                    className="relative rounded-xl overflow-hidden bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 shadow-2xl group cursor-pointer"
                    onClick={() => setIsImageGalleryOpen(true)}
                  >
                    <div className="aspect-[4/3] relative">
                      {propertyImages && propertyImages.length > 0 ? (
                        <img
                          src={propertyImages[0].url}
                          alt={propertyImages[0].alt || 'Property image'}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            // Fallback to placeholder if image fails to load
                            e.target.style.display = 'none'
                            e.target.nextElementSibling.style.display = 'flex'
                          }}
                        />
                      ) : null}
                      {/* Fallback placeholder - hidden by default, shown if image fails */}
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700" style={{ display: propertyImages && propertyImages.length > 0 ? 'none' : 'flex' }}>
                        <div className="text-center relative z-10">
                          <div className="mb-4">
                            <svg
                              className="w-28 h-28 text-white/90 mx-auto drop-shadow-lg"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                              />
                            </svg>
                          </div>
                          <div className="text-white text-base font-semibold tracking-wide">Property Image</div>
                        </div>
                      </div>
                    </div>

                    {/* Gallery Button Overlay */}
                    {propertyImages && propertyImages.length > 1 && (
                      <div className="absolute bottom-4 right-4 z-20">
                        <button
                          className="flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-md rounded-lg shadow-lg hover:bg-white transition-colors group"
                          onClick={(e) => {
                            e.stopPropagation()
                            setIsImageGalleryOpen(true)
                          }}
                        >
                          <svg className="w-5 h-5 text-dark-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="text-sm font-semibold text-dark-green">View Gallery</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* Rental Estimate Section */}
            {property.rentalEstimate && (
              <ScrollReveal delay={0.1}>
                <div className="section-spacing">
                  <h2 className="text-2xl md:text-3xl font-heading font-bold text-dark-green mb-6">
                    Rental Estimate
                  </h2>
                  <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl p-6 md:p-8 border border-primary-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <div className="text-sm text-muted-600 mb-2 uppercase tracking-wide font-medium">
                          Weekly Rent Range
                        </div>
                        {property.rentalEstimate.weekly && typeof property.rentalEstimate.weekly === 'object' ? (
                          <>
                            <div className="text-3xl md:text-4xl font-bold text-dark-green mb-2">
                              {formatCurrency(property.rentalEstimate.weekly.low)} - {formatCurrency(property.rentalEstimate.weekly.high)}/week
                            </div>
                            <div className="text-sm text-muted-600 mb-1">
                              Mid estimate: {formatCurrency(property.rentalEstimate.weekly.mid)}/week
                            </div>
                            <div className="text-sm text-muted-600">
                              Estimated weekly rental income range
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="text-3xl md:text-4xl font-bold text-dark-green mb-2">
                              {formatCurrency(property.rentalEstimate.weekly)}/week
                            </div>
                            <div className="text-sm text-muted-600">
                              Estimated weekly rental income
                            </div>
                          </>
                        )}
                      </div>
                      <div>
                        <div className="text-sm text-muted-600 mb-2 uppercase tracking-wide font-medium">
                          Rental Yield
                        </div>
                        <div className="text-3xl md:text-4xl font-bold text-dark-green mb-2">
                          {property.rentalEstimate.yield}%
                        </div>
                        <div className="text-sm text-muted-600">
                          Annual rental yield percentage
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            )}

            {/* Suburb Insights */}
            {property.suburbInsights && (
              <ScrollReveal delay={0.2}>
                <div className="section-spacing">
                  <h2 className="text-2xl md:text-3xl font-heading font-bold text-dark-green mb-6">
                    Suburb Insights
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                      {
                        value: formatCurrency(property.suburbInsights.medianPrice),
                        label: 'MEDIAN PRICE',
                        subtitle: property.suburb
                      },
                      {
                        value: `${property.suburbInsights.growthPercent}%`,
                        label: 'GROWTH %',
                        subtitle: 'Annual price growth'
                      },
                      {
                        value: property.suburbInsights.demand || 'N/A',
                        label: 'DEMAND',
                        subtitle: 'Market demand level'
                      },
                    ].map((stat, index) => (
                      <div
                        key={index}
                        className="bg-gray-100 rounded-lg p-6"
                      >
                        <div className="text-2xl md:text-3xl font-bold text-dark-green mb-2">
                          {stat.value}
                        </div>
                        <div className="text-xs text-muted-600 font-medium mb-1 uppercase tracking-wide">
                          {stat.label}
                        </div>
                        {stat.subtitle && (
                          <div className="text-xs text-muted-500">
                            {stat.subtitle}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </ScrollReveal>
            )}

            {/* Comparable Sales */}
            {property.comparables && property.comparables.length > 0 && (
              <ScrollReveal delay={0.3}>
                <div className="section-spacing">
                  <h2 className="text-2xl md:text-3xl font-heading font-bold text-dark-green mb-4">
                    Comparable Sales
                  </h2>
                  <p className="text-muted-600 mb-6 max-w-3xl">
                    Similar properties sold in the last 12 months
                  </p>
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <div className="divide-y divide-gray-200">
                      {property.comparables.slice(0, 6).map((sale, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
                        >
                          {/* Property Image */}
                          <div className="w-20 h-20 rounded-lg flex-shrink-0 overflow-hidden bg-gray-200">
                            <img
                              src={[
                                'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=200&h=200&fit=crop&q=80',
                                'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=200&h=200&fit=crop&q=80',
                                'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=200&h=200&fit=crop&q=80',
                                'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=200&h=200&fit=crop&q=80',
                                'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=200&h=200&fit=crop&q=80',
                                'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=200&h=200&fit=crop&q=80'
                              ][index % 6]}
                              alt={sale.address}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.src = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=200&h=200&fit=crop&q=80';
                              }}
                            />
                          </div>

                          {/* Property Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4 mb-1">
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold text-dark-green text-sm mb-0.5 line-clamp-1">
                                  {sale.address}
                                </div>
                                <div className="text-xs text-muted-600">
                                  Sold {formatDate(sale.saleDate)}
                                </div>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <div className="text-lg font-bold text-dark-green">
                                  {formatCurrency(sale.salePrice)}
                                </div>
                                <span className="inline-block px-2 py-0.5 bg-dark-green/10 text-dark-green text-xs font-medium rounded mt-1">
                                  SOLD
                                </span>
                              </div>
                            </div>

                            {/* Property Stats */}
                            <div className="flex items-center gap-3 mt-2 text-xs text-muted-600">
                              {sale.beds > 0 && (
                                <span className="flex items-center gap-1">
                                  <svg className="w-3.5 h-3.5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                  </svg>
                                  {sale.beds}
                                </span>
                              )}
                              {sale.baths > 0 && (
                                <span className="flex items-center gap-1">
                                  <svg className="w-3.5 h-3.5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                  </svg>
                                  {sale.baths}
                                </span>
                              )}
                              {(sale.parking > 0 || sale.cars > 0) && (
                                <span className="flex items-center gap-1">
                                  <svg className="w-3.5 h-3.5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                                  </svg>
                                  {sale.parking || sale.cars || 0}
                                </span>
                              )}
                              {sale.landSize > 0 && (
                                <span className="flex items-center gap-1 ml-auto">
                                  <svg className="w-3.5 h-3.5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                                  </svg>
                                  {sale.landSize} m²
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            )}

            {/* Nearby Schools Section */}
            {property.schools && property.schools.length > 0 && (
              <ScrollReveal delay={0.5}>
                <div className="section-spacing">
                  <h2 className="text-2xl md:text-3xl font-heading font-bold text-dark-green mb-6">
                    Nearby Schools
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {property.schools.map((school, index) => (
                      <div
                        key={index}
                        className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-all"
                      >
                        <div className="font-semibold text-sm text-dark-green mb-2">
                          {school.name}
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5 mb-2">
                          <span className="px-2 py-0.5 bg-primary-100 text-primary-700 rounded-full text-xs font-medium">
                            {school.type}
                          </span>
                          <span className="text-xs text-muted-600">{school.yearRange}</span>
                        </div>
                        <div className="text-xs text-muted-600 mb-2">{school.distance} km away</div>
                        <div className="text-center px-3 py-2 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg inline-block">
                          <div className="text-xl font-bold text-primary-600">{school.rating}</div>
                          <div className="text-xs text-primary-700 font-medium">Rating</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </ScrollReveal>
            )}

            {/* Past Sales History */}
            {property.salesHistory && property.salesHistory.length > 0 && (
              <ScrollReveal delay={0.6}>
                <div className="section-spacing">
                  <h2 className="text-2xl md:text-3xl font-heading font-bold text-dark-green mb-4">
                    Past Sales History
                  </h2>
                  <p className="text-muted-600 mb-6 max-w-3xl">
                    Historical sales data for this property
                  </p>
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <div className="divide-y divide-gray-200">
                      {property.salesHistory.map((sale, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
                        >
                          {/* Property Image */}
                          <div className="w-16 h-16 rounded-lg flex-shrink-0 overflow-hidden bg-gray-200">
                            <img
                              src={[
                                'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=200&h=200&fit=crop&q=80',
                                'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=200&h=200&fit=crop&q=80',
                                'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=200&h=200&fit=crop&q=80',
                                'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=200&h=200&fit=crop&q=80'
                              ][index % 4]}
                              alt={`Property sold on ${formatDate(sale.saleDate)}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.src = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=200&h=200&fit=crop&q=80';
                              }}
                            />
                          </div>

                          {/* Sale Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4 mb-1">
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold text-dark-green text-sm mb-0.5">
                                  {formatDate(sale.saleDate)}
                                </div>
                                <div className="text-xs text-muted-600">
                                  {sale.saleType || 'Sale'}
                                </div>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <div className="text-lg font-bold text-dark-green">
                                  {formatCurrency(sale.salePrice)}
                                </div>
                                <span className="inline-block px-2 py-0.5 bg-primary-100 text-primary-700 text-xs font-medium rounded mt-1">
                                  SOLD
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            )}

            {/* Success Message */}
            {isUnlocked && userEmail && (
              <ScrollReveal>
                <div className="card bg-gradient-to-br from-green-50 to-green-100/50 border-green-300 text-center mb-6">
                  <div className="text-green-600 mb-3">
                    <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-heading font-bold text-dark-green mb-2">Report Sent!</h3>
                  <p className="text-muted-700 text-sm">
                    Sent to <strong className="text-dark-green">{userEmail}</strong>
                  </p>
                </div>
              </ScrollReveal>
            )}
          </BlurredContent>

        </div>
      </div>

      {/* Selling CTA - above footer */}
      <section className="section-spacing">
        <div className="container px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
          <div
            className="relative rounded-xl px-6 sm:px-10 lg:px-14 py-8 sm:py-10 md:py-12"
            style={{ backgroundColor: 'var(--green-900)' }}
          >
            <div className="flex flex-col md:flex-row items-center md:items-center justify-between gap-6">
              <div className="text-center md:text-left">
                <h2 className="text-2xl md:text-3xl font-heading font-semibold text-white">
                  If you're thinking of selling, speak to our team&nbsp;today.
                </h2>
              </div>

              <button
                type="button"
                onClick={() => navigate('/contact')}
                className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-3.5 rounded-full text-sm sm:text-base font-semibold bg-[color:var(--green-400)] text-[color:var(--green-900)] hover:bg-[color:var(--green-300)] transition-colors whitespace-nowrap shadow-md"
              >
                Book your appraisal now
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Lead Capture Modal */}
      <LeadCaptureModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        isSubmitting={isSubmitting}
        property={property}
        primaryImageUrl={propertyImages[0]?.url}
      />

      {/* Success Modal */}
      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => {
          setIsSuccessModalOpen(false)
          setErrorModalMessage('')
        }}
        title={errorModalMessage ? 'Error' : 'Thank you!'}
        message={
          errorModalMessage ||
          'Thank you! Your comprehensive property report will be sent to your email shortly.'
        }
        isError={!!errorModalMessage}
      />

      {/* Image Gallery Modal */}
      {isImageGalleryOpen && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            height: '100vh',
            width: '100vw',
          }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/90 backdrop-blur-sm"
            onClick={() => setIsImageGalleryOpen(false)}
          />

          {/* Modal Content */}
          <div className="relative z-10 w-full max-w-6xl mx-auto">
            {/* Close Button */}
            <button
              onClick={() => setIsImageGalleryOpen(false)}
              className="absolute top-4 right-4 p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-colors z-30"
              aria-label="Close gallery"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Main Image */}
            <div className="relative bg-black rounded-xl overflow-hidden mb-4">
              <div className="aspect-video flex items-center justify-center relative">
                {imageLoading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                  </div>
                )}
                {imageError ? (
                  <div className="flex flex-col items-center justify-center text-white/60 p-8">
                    <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm">Image failed to load</p>
                  </div>
                ) : (
                  <img
                    src={propertyImages[currentImageIndex]?.url || propertyImages[0]?.url}
                    alt={propertyImages[currentImageIndex]?.alt || 'Property image'}
                    className={`w-full h-full object-contain ${imageLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
                    onLoad={() => setImageLoading(false)}
                    onError={() => {
                      setImageLoading(false)
                      setImageError(true)
                    }}
                  />
                )}
              </div>

              {/* Navigation Arrows */}
              {propertyImages.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setCurrentImageIndex((prev) =>
                        prev === 0 ? propertyImages.length - 1 : prev - 1
                      )
                    }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-colors z-20"
                    aria-label="Previous image"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setCurrentImageIndex((prev) =>
                        prev === propertyImages.length - 1 ? 0 : prev + 1
                      )
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-colors z-20"
                    aria-label="Next image"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}

              {/* Image Counter */}
              {propertyImages.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/50 backdrop-blur-md rounded-full text-white text-sm font-medium z-20">
                  {currentImageIndex + 1} / {propertyImages.length}
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {propertyImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                {propertyImages.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${currentImageIndex === index
                        ? 'border-primary-500 ring-2 ring-primary-500/50'
                        : 'border-transparent hover:border-white/50'
                      }`}
                  >
                    <img
                      src={image.url}
                      alt={image.alt}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  )
}

export default PropertyResult

