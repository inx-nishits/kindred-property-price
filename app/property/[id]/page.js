'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createPortal } from 'react-dom'
import { getPropertyDetails, submitLeadForm } from '@/services/propertyService'
import LeadCaptureModal from '@/components/property/LeadCaptureModal'
import { PropertyCardSkeleton } from '@/components/common/SkeletonLoader'
import ScrollReveal from '@/components/animations/ScrollReveal'

export default function PropertyPage() {
    const params = useParams()
    const router = useRouter()
    const [property, setProperty] = useState(null)
    console.log(property?.schools, "property.schools")
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isUnlocked, setIsUnlocked] = useState(false)
    const [isImageGalleryOpen, setIsImageGalleryOpen] = useState(false)
    const [currentImageIndex, setCurrentImageIndex] = useState(0)

    const propertyImages = property?.images || []

    // Fetch property details
    useEffect(() => {
        async function fetchProperty() {
            if (!params.id) {
                setIsLoading(false)
                setError('No property ID provided')
                return
            }

            try {
                setIsLoading(true)
                setError(null)
                const data = await getPropertyDetails(params.id)
                if (data) {
                    setProperty(data)
                } else {
                    setError('Property not found')
                }
            } catch (err) {
                console.error('Error fetching property:', err)
                setError(err.message || 'Failed to load property details')
            } finally {
                setIsLoading(false)
            }
        }

        fetchProperty()
    }, [params.id])

    // Check if property is unlocked
    useEffect(() => {
        if (typeof window !== 'undefined' && params.id) {
            const unlocked = localStorage.getItem(`property_${params.id}_unlocked`) === 'true'
            setIsUnlocked(unlocked)
        }
    }, [params.id])

    // Auto-open modal if not unlocked
    useEffect(() => {
        if (!isUnlocked && property && !isLoading) {
            const timer = setTimeout(() => {
                setIsModalOpen(true)
            }, 500)
            return () => clearTimeout(timer)
        }
    }, [isUnlocked, property, isLoading])

    // Handle form submission
    const handleFormSubmit = async (formData) => {
        setIsSubmitting(true)
        try {
            await submitLeadForm(formData, property)
            if (typeof window !== 'undefined') {
                localStorage.setItem(`property_${params.id}_unlocked`, 'true')
                localStorage.setItem(`property_${params.id}_email`, formData.email)
            }
            setIsUnlocked(true)
            setIsModalOpen(false)
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

    const formatLandSize = (size) => {
        if (!size) return ''
        // If land size is very large (rural property), convert to hectares
        if (size >= 10000) {
            return `${(size / 10000).toFixed(2)}`
        }
        return `${size.toLocaleString()} m²`
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
                <button onClick={() => router.push('/')} className="btn btn-primary">
                    Back to Home
                </button>
            </div>
        )
    }

    return (
        <>
            <div className="min-h-screen bg-white relative">
                <div className="container mx-auto px-4 sm:px-5 md:px-6 lg:px-8 py-6 md:py-8 relative z-10">
                    {/* Back to Main Site */}
                    <ScrollReveal>
                        <div className="mb-8 flex items-center justify-between">
                            <button
                                onClick={() => router.push('/')}
                                className="text-gray-600 hover:text-[#163331] text-sm font-medium transition-colors flex items-center gap-2 group"
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

                    {/* Lead Capture Banner - Show when locked */}
                    {!isUnlocked && (
                        <ScrollReveal delay={0.05}>
                            <div className="mb-8 rounded-xl bg-gradient-to-br from-[#48D98E] via-[#3bc57d] to-[#2fb06d] text-white relative overflow-hidden p-6 md:p-8">
                                <div className="relative z-10">
                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                                        <div className="flex-1">
                                            <h2 className="text-2xl md:text-3xl font-heading font-bold text-white mb-3">
                                                Unlock Complete Property Insights
                                            </h2>
                                            <p className="text-white/90 text-base md:text-lg leading-relaxed mb-4">
                                                Enter your details to view all property estimates, comparable sales, suburb insights,
                                                nearby schools, and sales history. Plus, receive a comprehensive PDF report via email.
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => setIsModalOpen(true)}
                                            className="btn bg-white text-[#163331] hover:bg-gray-100 px-8 py-4 text-lg font-semibold shadow-xl whitespace-nowrap"
                                        >
                                            Get Full Report
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </ScrollReveal>
                    )}

                    {/* Content */}
                    <div>
                        {/* Property Overview Section */}
                        <ScrollReveal>
                            <div className="mb-12">
                                <div className="mb-6">
                                    <p className="text-sm text-gray-600 mb-2">Property report for</p>
                                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-[#163331] mb-4">
                                        {property.address}
                                    </h1>
                                    <div className={`flex flex-wrap items-center gap-2 text-sm text-gray-600 ${!isUnlocked ? 'blur-sm select-none opacity-60' : ''}`}>
                                        {property.beds > 0 && <span>{property.beds} Bed</span>}
                                        {property.beds > 0 && property.baths > 0 && <span>•</span>}
                                        {property.baths > 0 && <span>{property.baths} Bath</span>}
                                        {(property.parking > 0 || property.cars > 0) && (
                                            <>
                                                <span>•</span>
                                                <span>{property.parking || property.cars} Car</span>
                                            </>
                                        )}
                                        {property.propertyType && (
                                            <>
                                                <span>•</span>
                                                <span>{property.propertyType}</span>
                                            </>
                                        )}
                                        {property.landSize > 0 && (
                                            <>
                                                <span>•</span>
                                                <span>Land: {formatLandSize(property.landSize)}</span>
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

                                {/* Estimated Value and Property Image */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                                    {/* Estimated Value Card - Blurred if locked */}
                                    <div className={`bg-[#163331] text-white rounded-xl p-8 md:p-10 relative overflow-hidden shadow-2xl ${!isUnlocked ? 'blur-md select-none pointer-events-none opacity-80' : ''}`}>
                                        <div className="absolute inset-0 bg-gradient-to-br from-[#163331] via-[#163331] to-[#0d1f1e] opacity-90"></div>
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
                                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full blur-2xl"></div>

                                        <div className="relative z-10">
                                            <h2 className="text-lg font-heading font-semibold mb-6 text-white/95 uppercase tracking-wider">
                                                Estimated Value
                                            </h2>
                                            {property.priceEstimate ? (
                                                <div className="space-y-6">
                                                    <div>
                                                        <div className="text-4xl md:text-4xl font-bold mb-3 leading-tight tracking-tight">
                                                            {formatCurrency(property.priceEstimate.low)} - {formatCurrency(property.priceEstimate.high)}
                                                        </div>
                                                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/15 backdrop-blur-sm rounded-full">
                                                            <div className="w-2 h-2 bg-white/80 rounded-full"></div>
                                                            <span className="text-sm font-medium text-white/90">Medium Confidence</span>
                                                        </div>
                                                    </div>

                                                    <div className="pt-6 border-t border-white/25">
                                                        <Link
                                                            href="/contact"
                                                            className="inline-block w-full text-center bg-[#48D98E] text-[#163331] font-semibold py-3 px-6 rounded-lg hover:bg-[#3bc57d] transition-colors duration-200 shadow-lg"
                                                        >
                                                            Book your appraisal today
                                                        </Link>
                                                    </div>

                                                    <p className="text-xs text-white/70 leading-relaxed pt-2">
                                                        This estimate may not include recent renovations or improvements.
                                                        For a personal appraisal, please contact us.
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="text-3xl md:text-4xl font-bold">Price estimate not available</div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Property Image - Always Visible */}
                                    <div
                                        className="relative rounded-xl overflow-hidden bg-gradient-to-br from-[#48D98E] via-[#3bc57d] to-[#2fb06d] shadow-2xl group cursor-pointer"
                                        onClick={() => propertyImages.length > 0 && setIsImageGalleryOpen(true)}
                                    >
                                        <div className="aspect-[4/3] relative">
                                            {propertyImages && propertyImages.length > 0 ? (
                                                <img
                                                    src={propertyImages[0].url}
                                                    alt={propertyImages[0].alt || property.address}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                            ) : (
                                                <div className="absolute inset-0 flex items-center justify-center">
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
                                                        <div className="text-white text-base font-semibold tracking-wide">No Image Available</div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Gallery Button Overlay */}
                                        {propertyImages && propertyImages.length > 1 && (
                                            <div className="absolute bottom-4 right-4 z-20">
                                                <button
                                                    className="flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-md rounded-lg shadow-lg hover:bg-white transition-colors"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        setIsImageGalleryOpen(true)
                                                    }}
                                                >
                                                    <svg className="w-5 h-5 text-[#163331]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    <span className="text-sm font-semibold text-[#163331]">
                                                        View Gallery ({propertyImages.length})
                                                    </span>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </ScrollReveal>

                        {/* Below the Fold Content - Blurred if locked */}
                        <div className={!isUnlocked ? 'blur-md select-none pointer-events-none opacity-50' : ''}>
                            {/* Rental Estimate Section */}
                            {property.rentalEstimate && (
                                <ScrollReveal delay={0.1}>
                                    <div className="mb-12">
                                        <h2 className="text-2xl md:text-3xl font-heading font-bold text-[#163331] mb-6">
                                            Rental Estimate
                                        </h2>
                                        <div className="bg-gradient-to-br from-[#E9F2EE] to-[#d4e8e0] rounded-xl p-6 md:p-8 border border-[#48D98E]/20">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <div className="text-sm text-gray-600 mb-2 uppercase tracking-wide font-medium">
                                                        Weekly Rent Range
                                                    </div>
                                                    <div className="text-3xl md:text-4xl font-bold text-[#163331] mb-2">
                                                        {property.rentalEstimate.weekly?.low && property.rentalEstimate.weekly?.high ? (
                                                            <>{formatCurrency(property.rentalEstimate.weekly.low)} - {formatCurrency(property.rentalEstimate.weekly.high)}/week</>
                                                        ) : (
                                                            <>{formatCurrency(property.rentalEstimate.weekly)}/week</>
                                                        )}
                                                    </div>
                                                    <div className="text-sm text-gray-600">
                                                        Estimated weekly rental income range
                                                    </div>
                                                </div>
                                                {property.rentalEstimate.yield && (
                                                    <div>
                                                        <div className="text-sm text-gray-600 mb-2 uppercase tracking-wide font-medium">
                                                            Rental Yield
                                                        </div>
                                                        <div className="text-3xl md:text-4xl font-bold text-[#163331] mb-2">
                                                            {property.rentalEstimate.yield}%
                                                        </div>
                                                        <div className="text-sm text-gray-600">
                                                            Annual rental yield percentage
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </ScrollReveal>
                            )}

                            {/* Suburb Insights */}
                            {property.suburbInsights && (
                                <ScrollReveal delay={0.2}>
                                    <div className="mb-12">
                                        <h2 className="text-2xl md:text-3xl font-heading font-bold text-[#163331] mb-6">
                                            Suburb Insights - {property.suburb}
                                        </h2>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {property.suburbInsights.medianPrice > 0 && (
                                                <div className="bg-gray-100 rounded-lg p-6">
                                                    <div className="text-2xl md:text-3xl font-bold text-[#163331] mb-2">
                                                        {formatCurrency(property.suburbInsights.medianPrice)}
                                                    </div>
                                                    <div className="text-xs text-gray-600 font-medium mb-1 uppercase tracking-wide">
                                                        MEDIAN PRICE
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {property.suburb}
                                                    </div>
                                                </div>
                                            )}

                                            {property.suburbInsights.growthPercent !== undefined && property.suburbInsights.growthPercent !== null && (
                                                <div className="bg-gray-100 rounded-lg p-6">
                                                    <div className="text-2xl md:text-3xl font-bold text-[#163331] mb-2">
                                                        {property.suburbInsights.growthPercent}%
                                                    </div>
                                                    <div className="text-xs text-gray-600 font-medium mb-1 uppercase tracking-wide">
                                                        GROWTH %
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        Annual price growth
                                                    </div>
                                                </div>
                                            )}

                                            {property.suburbInsights.demand && (
                                                <div className="bg-gray-100 rounded-lg p-6">
                                                    <div className="text-2xl md:text-3xl font-bold text-[#163331] mb-2">
                                                        {property.suburbInsights.demand}
                                                    </div>
                                                    <div className="text-xs text-gray-600 font-medium mb-1 uppercase tracking-wide">
                                                        DEMAND
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        Market demand level
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </ScrollReveal>
                            )}

                            {/* Comparable Sales */}
                            {property.comparables && property.comparables.length > 0 && (
                                <ScrollReveal delay={0.3}>
                                    <div className="mb-12">
                                        <h2 className="text-2xl md:text-3xl font-heading font-bold text-[#163331] mb-4">
                                            Comparable Sales
                                        </h2>
                                        <p className="text-gray-600 mb-6 max-w-3xl">
                                            Similar properties in the area
                                        </p>
                                        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                                            <div className="divide-y divide-gray-200">
                                                {property.comparables.map((sale, index) => (
                                                    <div
                                                        key={index}
                                                        className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
                                                    >
                                                        <div className="w-20 h-20 rounded-lg flex-shrink-0 overflow-hidden bg-gray-200">
                                                            {sale.images && sale.images.length > 0 ? (
                                                                <img
                                                                    src={sale.images[0].url}
                                                                    alt={sale.address}
                                                                    className="w-full h-full object-cover"
                                                                    onError={(e) => {
                                                                        e.target.onerror = null;
                                                                        e.target.src = 'https://placehold.co/100x100?text=No+Image'; // Fallback
                                                                    }}
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                                                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                                                    </svg>
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-start justify-between gap-4 mb-1">
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="font-semibold text-[#163331] text-sm mb-0.5 line-clamp-1">
                                                                        {sale.address}
                                                                    </div>
                                                                    <div className="text-xs text-gray-600">
                                                                        Sold {formatDate(sale.saleDate)}
                                                                    </div>
                                                                </div>
                                                                <div className="text-right flex-shrink-0">
                                                                    <div className="text-lg font-bold text-[#163331]">
                                                                        {formatCurrency(sale.salePrice)}
                                                                    </div>
                                                                    <span className="inline-block px-2 py-0.5 bg-[#163331]/10 text-[#163331] text-xs font-medium rounded mt-1">
                                                                        SOLD
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center gap-3 mt-2 text-xs text-gray-600">
                                                                {sale.beds > 0 && <span>{sale.beds} Bed</span>}
                                                                {sale.baths > 0 && <span>{sale.baths} Bath</span>}
                                                                {(sale.parking > 0 || sale.cars > 0) && <span>{sale.parking || sale.cars} Car</span>}
                                                                {sale.landSize > 0 && <span className="ml-auto">{formatLandSize(sale.landSize)} m²</span>}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </ScrollReveal>
                            )}

                            {/* Nearby Schools */}
                            {property.schools && property.schools.length > 0 && (
                                <ScrollReveal delay={0.5}>
                                    <div className="mb-12">
                                        <h2 className="text-2xl md:text-3xl font-heading font-bold text-[#163331] mb-6">
                                            Nearby Schools
                                        </h2>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {property.schools.map((school, index) => (
                                                <div
                                                    key={index}
                                                    className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-all"
                                                >
                                                    <div className="font-semibold text-sm text-[#163331] mb-2">
                                                        {school.name}
                                                    </div>
                                                    <div className="flex flex-wrap items-center gap-1.5 mb-2">
                                                        <span className="px-2 py-0.5 bg-[#E9F2EE] text-[#163331] rounded-full text-xs font-medium">
                                                            {school.type}
                                                        </span>
                                                        <span className="text-xs text-gray-600">{school.yearRange}</span>
                                                    </div>
                                                    <div className="text-xs text-gray-600 mb-2">{school.distance} km away</div>
                                                    {school.rating && (
                                                        <div className="text-center px-2 py-1 bg-gradient-to-br from-[#E9F2EE] to-[#d4e8e0] rounded-lg inline-block">
                                                            <div className="text-md font-bold text-[#163331]">{school.rating}</div>
                                                            <div className="text-xs text-[#163331] font-medium">{school.rating > 10 ? 'ICSEA' : 'Rating'}</div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </ScrollReveal>
                            )}

                            {/* Past Sales History */}
                            {property.salesHistory && property.salesHistory.length > 0 && (
                                <ScrollReveal delay={0.6}>
                                    <div className="mb-12">
                                        <h2 className="text-2xl md:text-3xl font-heading font-bold text-[#163331] mb-4">
                                            Past Sales History
                                        </h2>
                                        <p className="text-gray-600 mb-6 max-w-3xl">
                                            Historical sales data for this property
                                        </p>
                                        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                                            <div className="divide-y divide-gray-200">
                                                {property.salesHistory.map((sale, index) => (
                                                    <div
                                                        key={index}
                                                        className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
                                                    >
                                                        <div className="w-16 h-16 rounded-lg flex-shrink-0 overflow-hidden bg-gray-200">
                                                            {propertyImages && propertyImages.length > 0 ? (
                                                                <img
                                                                    src={propertyImages[0].url}
                                                                    alt={`Property sold on ${formatDate(sale.saleDate)}`}
                                                                    className="w-full h-full object-cover opacity-80"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                                                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                    </svg>
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-start justify-between gap-4 mb-1">
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="font-semibold text-[#163331] text-sm mb-0.5">
                                                                        {formatDate(sale.saleDate)}
                                                                    </div>
                                                                    <div className="text-xs text-gray-600">
                                                                        {sale.saleType || 'Sale'}
                                                                    </div>
                                                                </div>
                                                                <div className="text-right flex-shrink-0">
                                                                    <div className="text-lg font-bold text-[#163331]">
                                                                        {formatCurrency(sale.salePrice)}
                                                                    </div>
                                                                    <span className="inline-block px-2 py-0.5 bg-primary-100 text-primary-600 text-xs font-medium rounded mt-1">
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
                        </div>
                    </div>
                </div>
            </div>

            {/* Lead Capture Modal */}
            <LeadCaptureModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleFormSubmit}
                isSubmitting={isSubmitting}
                property={property}
                primaryImageUrl={propertyImages[0]?.url}
            />

            {/* Image Gallery Modal */}
            {isImageGalleryOpen && propertyImages.length > 0 && typeof window !== 'undefined' && createPortal(
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
                    <div
                        className="absolute inset-0 bg-black/90 backdrop-blur-sm"
                        onClick={() => setIsImageGalleryOpen(false)}
                    />

                    <div className="relative z-10 w-full max-w-6xl mx-auto">
                        <button
                            onClick={() => setIsImageGalleryOpen(false)}
                            className="absolute top-4 right-4 p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-colors z-30"
                            aria-label="Close gallery"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        <div className="relative bg-black rounded-xl overflow-hidden mb-4">
                            <div className="aspect-video flex items-center justify-center relative">
                                <img
                                    src={propertyImages[currentImageIndex]?.url}
                                    alt={propertyImages[currentImageIndex]?.alt || property.address}
                                    className="w-full h-full object-contain"
                                />
                            </div>

                            {propertyImages.length > 1 && (
                                <>
                                    <button
                                        onClick={() => setCurrentImageIndex((prev) => prev === 0 ? propertyImages.length - 1 : prev - 1)}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-colors z-20"
                                        aria-label="Previous image"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => setCurrentImageIndex((prev) => prev === propertyImages.length - 1 ? 0 : prev + 1)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-colors z-20"
                                        aria-label="Next image"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/50 backdrop-blur-md rounded-full text-white text-sm font-medium z-20">
                                        {currentImageIndex + 1} / {propertyImages.length}
                                    </div>
                                </>
                            )}
                        </div>

                        {propertyImages.length > 1 && (
                            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                                {propertyImages.map((image, index) => (
                                    <button
                                        key={image.id}
                                        onClick={() => setCurrentImageIndex(index)}
                                        className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${currentImageIndex === index
                                            ? 'border-[#48D98E] ring-2 ring-[#48D98E]/50'
                                            : 'border-transparent hover:border-white/50'
                                            }`}
                                    >
                                        <img
                                            src={image.url}
                                            alt={image.alt || `Gallery image ${index + 1}`}
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