import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { mockProperties } from '../data/mockPropertyData'
import ScrollReveal from '../components/animations/ScrollReveal'
import AnimatedCard from '../components/animations/AnimatedCard'
import SEO from '../components/common/SEO'

function PropertiesList() {
  const navigate = useNavigate()
  const [properties] = useState(mockProperties)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const handlePropertyClick = (property) => {
    navigate(`/property/${property.id}`, { state: { property } })
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <>
      <SEO
        title="View Properties"
        description="Browse all available properties with detailed insights, price estimates, and market data."
        keywords="properties, property listings, property search, browse properties, property database"
      />

      <div className="min-h-screen bg-gradient-to-b from-primary-50/30 to-white">
        <div className="container mx-auto px-4 sm:px-5 md:px-6 lg:px-8 py-8 md:py-12">
          {/* Header */}
          <ScrollReveal>
            <div className="mb-12 text-center">
              <h1 className="text-4xl md:text-5xl font-heading font-bold text-dark-green mb-4">
                View Properties
              </h1>
              <p className="text-xl text-muted-600 max-w-2xl mx-auto">
                Browse all available properties with detailed insights, price estimates, and comprehensive market data
              </p>
              <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-600">
                <svg
                  className="w-5 h-5 text-primary-500"
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
                <span>{properties.length} Properties Available</span>
              </div>
            </div>
          </ScrollReveal>

          {/* Properties Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {properties.map((property, index) => (
              <ScrollReveal key={property.id} delay={index * 0.1}>
                <motion.div
                  className="h-full"
                  whileHover={{ y: -8 }}
                  transition={{ duration: 0.3 }}
                >
                  <AnimatedCard className="h-full cursor-pointer overflow-hidden border border-gray-200 hover:border-primary-300 transition-all duration-300 bg-white shadow-md hover:shadow-lg rounded-lg">
                    <div
                      onClick={() => handlePropertyClick(property)}
                      className="h-full flex flex-col"
                    >
                      {/* Property Image with Rental Tag */}
                      <div className="relative w-full h-64 bg-gradient-to-br from-primary-400 via-primary-500 to-primary-600 overflow-hidden rounded-t-lg">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                        {/* Rental Tag - Oval shaped, white background, black text */}
                        <div className="absolute top-4 right-4">
                          <span className="inline-block px-4 py-1.5 bg-white text-black text-sm font-semibold rounded-full shadow-sm">
                            Rental
                          </span>
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <svg
                              className="w-20 h-20 text-white/80 mx-auto mb-2"
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
                            <div className="text-white/90 text-sm font-medium">
                              Property Image
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Property Details */}
                      <div className="flex-1 flex flex-col p-5">
                        {/* Price - Green, prominent */}
                        <div className="mb-3">
                          <div className="text-2xl font-bold text-primary-600">
                            {property.rentalEstimate?.weekly 
                              ? `${formatCurrency(property.rentalEstimate.weekly)} Per Week`
                              : formatCurrency(property.priceEstimate.mid)}
                          </div>
                        </div>

                        {/* Description - Bold black text, truncated */}
                        <div className="mb-2">
                          <p className="text-base font-bold text-black line-clamp-1">
                            {property.description || `Modern ${property.propertyType} With Ducted Air Conditioning and Outdoor...`}
                          </p>
                        </div>

                        {/* Address - Lighter grey text */}
                        <div className="mb-4">
                          <p className="text-sm text-gray-500">
                            {property.shortAddress}, {property.suburb} {property.state} {property.postcode}
                          </p>
                        </div>

                        {/* Property Statistics - Green icons with numbers and labels */}
                        <div className="flex items-center gap-4 mt-auto pt-4 border-t border-gray-200">
                          {property.beds > 0 && (
                            <div className="flex items-center gap-1.5">
                              <svg
                                className="w-5 h-5 text-primary-600"
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
                              <span className="text-base font-semibold text-primary-600">
                                {property.beds} bed{property.beds !== 1 ? 's' : ''}
                              </span>
                            </div>
                          )}
                          {property.baths > 0 && (
                            <div className="flex items-center gap-1.5">
                              <svg
                                className="w-5 h-5 text-primary-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"
                                />
                              </svg>
                              <span className="text-base font-semibold text-primary-600">
                                {property.baths} bath{property.baths !== 1 ? 's' : ''}
                              </span>
                            </div>
                          )}
                          {property.parking > 0 && (
                            <div className="flex items-center gap-1.5">
                              <svg
                                className="w-5 h-5 text-primary-600"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" />
                              </svg>
                              <span className="text-base font-semibold text-primary-600">
                                {property.parking} car{property.parking !== 1 ? 's' : ''}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </AnimatedCard>
                </motion.div>
              </ScrollReveal>
            ))}
          </div>

          {/* Empty State (shouldn't show, but just in case) */}
          {properties.length === 0 && (
            <ScrollReveal>
              <div className="text-center py-20">
                <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg
                    className="w-12 h-12 text-primary-500"
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
                </div>
                <h3 className="text-2xl font-heading font-bold text-dark-green mb-2">
                  No Properties Available
                </h3>
                <p className="text-muted-600">Check back later for new listings</p>
              </div>
            </ScrollReveal>
          )}
        </div>
      </div>
    </>
  )
}

export default PropertiesList

