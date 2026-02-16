'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createPortal } from 'react-dom'
import { getPropertyDetails, submitLeadForm } from '@/services/propertyService'
import LeadCaptureModal from '@/components/property/LeadCaptureModal'
import { PropertyCardSkeleton } from '@/components/common/SkeletonLoader'
import ScrollReveal from '@/components/animations/ScrollReveal'
import SuccessModal from '@/components/common/SuccessModal'
import {
    Bed,
    Bath,
    Car,
    Maximize,
    Home,
    Calendar,
    ChevronLeft,
    ChevronRight,
    X,
    ImageOff,
    MapPin,
    School,
    ArrowLeft,
    ArrowUpRight,
    Building2,
    Ruler,
    Clock,
    ArrowRight,
    TrendingUp,
    AlertCircle
} from 'lucide-react'
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts'

export default function PropertyPage() {
    const params = useParams()
    const router = useRouter()
    const [property, setProperty] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isUnlocked, setIsUnlocked] = useState(false)
    const [isImageGalleryOpen, setIsImageGalleryOpen] = useState(false)
    const [currentImageIndex, setCurrentImageIndex] = useState(0)
    const [isSchoolsModalOpen, setIsSchoolsModalOpen] = useState(false)
    const [isComparablesModalOpen, setIsComparablesModalOpen] = useState(false)

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
                    // console.log('Property data:', data);

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

    useEffect(() => {
        if (isSchoolsModalOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        // Cleanup on unmount
        return () => {
            document.body.style.overflow = '';
        };
    }, [isSchoolsModalOpen]);

    // Show retry modal if price estimate API failed
    useEffect(() => {
        if (property && property.apiFailedError) {
            console.warn(`⚠️ Price estimate API failed. Reason: ${property.apiFailureReason}`)
            setIsPriceEstimateErrorModalOpen(true)
        }
    }, [property?.apiFailedError, property?.apiFailureReason])

    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)
    const [userEmail, setUserEmail] = useState('')
    const [formError, setFormError] = useState('')
    const [isPriceEstimateErrorModalOpen, setIsPriceEstimateErrorModalOpen] = useState(false)

    // Handle form submission
    const handleFormSubmit = async (formData) => {
        setIsSubmitting(true)
        setFormError('') // Clear previous errors
        try {
            const result = await submitLeadForm(formData, property)

            if (result.success) {
                if (typeof window !== 'undefined') {
                    localStorage.setItem(`property_${params.id}_unlocked`, 'true')
                    localStorage.setItem(`property_${params.id}_email`, formData.email)
                    // Save global user profile for auto-fill
                    localStorage.setItem('kindred_user_details', JSON.stringify(formData))
                }
                setUserEmail(formData.email)
                setIsUnlocked(true)
                setIsModalOpen(false)     // Close the form modal
                setIsSuccessModalOpen(true) // Open the success modal
            } else {
                // Set error message to show below form
                setFormError(result.message || 'There was an error sending your report. Please try again.')
            }
        } catch (error) {
            console.error('Error submitting form:', error)
            setFormError('There was an error processing your request. Please try again.')
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
            return `${(size / 10000).toFixed(2)} ha`
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
                <div className="flex flex-col items-center justify-center py-12">
                    <div className="bg-red-50 p-4 rounded-full mb-4">
                        <Home className="w-8 h-8 text-red-500" />
                    </div>
                    <h1 className="text-2xl font-bold text-dark-green mb-2">
                        Property Not Found
                    </h1>
                    {error && (
                        <p className="text-red-600 mb-6 max-w-md">{error}</p>
                    )}
                    <button
                        onClick={() => router.push('/')}
                        className="btn btn-primary flex items-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Home
                    </button>
                </div>
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
                                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                                BACK TO MAIN SITE
                            </button>

                            {/* DEBUG BUTTON - Show Error Modal */}
                            {/* <button
                                onClick={() => setIsPriceEstimateErrorModalOpen(true)}
                                className="text-xs bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-md font-medium transition-colors"
                                title="Debug: Open error modal"
                            >
                                🐛 Test Error Modal
                            </button> */}
                        </div>
                    </ScrollReveal>

                    {/* Lead Capture Banner - Show when locked */}
                    {!isUnlocked && (
                        <ScrollReveal delay={0.05}>
                            <div className="mb-8 rounded-xl bg-gradient-to-br from-[#48D98E] via-[#3bc57d] to-[#2fb06d] text-white relative overflow-hidden p-6 md:p-8 shadow-lg">
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
                                    <p className="text-sm text-gray-600 mb-2 flex items-center gap-1.5">
                                        <MapPin className="w-4 h-4 text-primary-500" />
                                        Property report for
                                    </p>
                                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-[#163331] mb-6">
                                        {property.address}
                                    </h1>
                                    <div className={`flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-gray-700 ${!isUnlocked ? 'blur-sm select-none opacity-60' : ''}`}>
                                        {property.beds > 0 && (
                                            <div className="flex items-center gap-2" title="Bedrooms">
                                                <Bed className="w-5 h-5 text-gray-400" strokeWidth={1.5} />
                                                <span className="font-medium">{property.beds} Bed</span>
                                            </div>
                                        )}
                                        {property.baths > 0 && (
                                            <div className="flex items-center gap-2" title="Bathrooms">
                                                <Bath className="w-5 h-5 text-gray-400" strokeWidth={1.5} />
                                                <span className="font-medium">{property.baths} Bath</span>
                                            </div>
                                        )}
                                        {(property.parking > 0 || property.cars > 0) && (
                                            <div className="flex items-center gap-2" title="Car Spaces">
                                                <Car className="w-5 h-5 text-gray-400" strokeWidth={1.5} />
                                                <span className="font-medium">{property.parking || property.cars} Car</span>
                                            </div>
                                        )}
                                        {property.propertyType && (
                                            <div className="flex items-center gap-2 hidden sm:flex">
                                                <Home className="w-4 h-4 text-gray-400" strokeWidth={1.5} />
                                                <span>{property.propertyType}</span>
                                            </div>
                                        )}
                                        {property.landSize > 0 && (
                                            <div className="flex items-center gap-2 hidden sm:flex">
                                                <Maximize className="w-4 h-4 text-gray-400" strokeWidth={1.5} />
                                                <span>{formatLandSize(property.landSize)}</span>
                                            </div>
                                        )}
                                        {property.buildingSize > 0 && (
                                            <div className="flex items-center gap-2 hidden sm:flex">
                                                <Building2 className="w-4 h-4 text-gray-400" strokeWidth={1.5} />
                                                <span>{property.buildingSize} m²</span>
                                            </div>
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
                                            <h2 className="text-lg font-heading font-semibold mb-6 text-white/95 uppercase tracking-wider flex items-center gap-2">
                                                <ArrowUpRight className="w-5 h-5 text-[#48D98E]" />
                                                Estimated Value
                                            </h2>
                                            {property.priceEstimate ? (
                                                <div className="space-y-6">
                                                    <div>
                                                        <div className="text-4xl md:text-4xl font-bold mb-3 leading-tight tracking-tight">
                                                            {formatCurrency(property.priceEstimate.low)} - {formatCurrency(property.priceEstimate.high)}
                                                        </div>
                                                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/15 backdrop-blur-sm rounded-full">
                                                            <div className="w-2 h-2 bg-[#48D98E] rounded-full animate-pulse"></div>
                                                            <span className="text-sm font-medium text-white/90">
                                                                {(property.priceEstimate.priceConfidence || 'Medium').charAt(0).toUpperCase() + (property.priceEstimate.priceConfidence || 'Medium').slice(1)} Confidence
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="pt-6 border-t border-white/25">
                                                        <a
                                                            href="https://www.kindred.com.au/sales-property-appraisal"
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-block w-full text-center bg-[#48D98E] text-[#163331] font-semibold py-3 px-6 rounded-lg hover:bg-[#3bc57d] transition-colors duration-200 shadow-lg"
                                                        >
                                                            Book your appraisal today
                                                        </a>
                                                    </div>

                                                    <p className="text-xs text-white/70 leading-relaxed pt-2">
                                                        {/* This estimate may not include recent renovations or improvements.
                                                        For a personal appraisal, please contact us. */}
                                                        This estimate may not have factored in your current home condition or any recent renovations. For a more accurate sale price contact Town for a personal appraisal.
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
                                                            <ImageOff className="w-20 h-20 text-white/80 mx-auto drop-shadow-sm" strokeWidth={1} />
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
                                                    <Maximize className="w-4 h-4 text-[#163331]" />
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
                                        <h2 className="text-2xl md:text-3xl font-heading font-bold text-[#163331] mb-6 flex items-center gap-3">
                                            <Home className="w-6 h-6 md:w-8 md:h-8 text-primary-500" strokeWidth={1.5} />
                                            Rental Estimate
                                        </h2>
                                        <div className="bg-gradient-to-br from-[#E9F2EE] to-[#d4e8e0] rounded-xl p-6 md:p-8 border border-[#48D98E]/20">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <div className="text-sm text-gray-600 mb-2 uppercase tracking-wide font-medium flex items-center gap-2">
                                                        <Calendar className="w-4 h-4" />
                                                        Weekly Rent Range
                                                    </div>
                                                    <div className="text-3xl md:text-4xl font-bold text-[#163331] mb-2">
                                                        {property.rentalEstimate.weekly?.low && property.rentalEstimate.weekly?.high ? (
                                                            <>{formatCurrency(property.rentalEstimate.weekly.low)} - {formatCurrency(property.rentalEstimate.weekly.high)}<span className="text-base text-gray-500 font-normal">/week</span></>
                                                        ) : (
                                                            <>{formatCurrency(property.rentalEstimate.weekly)}<span className="text-base text-gray-500 font-normal">/week</span></>
                                                        )}
                                                    </div>
                                                    <div className="text-sm text-gray-600">
                                                        Estimated weekly rental income range
                                                    </div>
                                                </div>
                                                {property.rentalEstimate.yield && (
                                                    <div>
                                                        <div className="text-sm text-gray-600 mb-2 uppercase tracking-wide font-medium flex items-center gap-2">
                                                            <ArrowUpRight className="w-4 h-4" />
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
                            {/* {property.suburbInsights && (
                                <ScrollReveal delay={0.2}>
                                    <div className="mb-12">
                                        <h2 className="text-2xl md:text-3xl font-heading font-bold text-[#163331] mb-6 flex items-center gap-3">
                                            <Building2 className="w-6 h-6 md:w-8 md:h-8 text-primary-500" strokeWidth={1.5} />
                                            Suburb Insights - {property.suburb}
                                        </h2>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {property.suburbInsights.medianPrice > 0 && (
                                                <div className="bg-gray-100 rounded-lg p-6 hover:shadow-md transition-shadow">
                                                    <div className="text-2xl md:text-3xl font-bold text-[#163331] mb-2">
                                                        {formatCurrency(property.suburbInsights.medianPrice)}
                                                    </div>
                                                    <div className="text-xs text-gray-600 font-medium mb-1 uppercase tracking-wide flex items-center gap-1.5">
                                                        <Home className="w-3.5 h-3.5" />
                                                        MEDIAN PRICE
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {property.suburb}
                                                    </div>
                                                </div>
                                            )}

                                            {property.suburbInsights.growthPercent !== undefined && property.suburbInsights.growthPercent !== null && (
                                                <div className="bg-gray-100 rounded-lg p-6 hover:shadow-md transition-shadow">
                                                    <div className={`text-2xl md:text-3xl font-bold mb-2 ${property.suburbInsights.growthPercent >= 0 ? 'text-[#163331]' : 'text-red-600'}`}>
                                                        {property.suburbInsights.growthPercent > 0 ? '+' : ''}{property.suburbInsights.growthPercent}%
                                                    </div>
                                                    <div className="text-xs text-gray-600 font-medium mb-1 uppercase tracking-wide flex items-center gap-1.5">
                                                        <ArrowUpRight className={`w-3.5 h-3.5 ${property.suburbInsights.growthPercent < 0 ? 'rotate-90' : ''}`} />
                                                        GROWTH %
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        Annual price growth
                                                    </div>
                                                </div>
                                            )}

                                            {property.suburbInsights.demand && (
                                                <div className="bg-gray-100 rounded-lg p-6 hover:shadow-md transition-shadow">
                                                    <div className="text-2xl md:text-3xl font-bold text-[#163331] mb-2">
                                                        {property.suburbInsights.demand}
                                                    </div>
                                                    <div className="text-xs text-gray-600 font-medium mb-1 uppercase tracking-wide flex items-center gap-1.5">
                                                        <Maximize className="w-3.5 h-3.5" />
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
                            )} */}

                            {/* Suburb Sales Statistics */}
                            {property.suburbInsights && (
                                <ScrollReveal delay={0.2}>
                                    <div className="mb-16">
                                        <div className="text-center mb-10">
                                            <h2 className="text-3xl md:text-4xl font-heading font-bold text-[#163331] mb-2 leading-tight">
                                                {property.suburb} Sales Statistics
                                            </h2>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                                            {/* Auction Clearance Rate */}
                                            <div className="flex flex-col h-full bg-[#f8f9f9] rounded-2xl shadow-sm border border-gray-100/50 overflow-hidden transform transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                                                <div className="flex-1 p-6 md:p-8 flex flex-col items-center justify-center text-center">
                                                    <div className="text-4xl md:text-5xl font-heading font-bold text-[#163331] mb-4">
                                                        {property.suburbInsights.overallClearanceRate?.toFixed(2)}%
                                                    </div>
                                                    <div className="text-[11px] md:text-xs font-bold text-[#163331]/60 uppercase tracking-[0.1em] leading-relaxed">
                                                        AUCTION CLEARANCE RATE
                                                    </div>
                                                </div>
                                                <div className="bg-[#ecedee] py-3 px-4 text-center">
                                                    <span className="text-[10px] md:text-[11px] font-bold text-[#163331]/40 uppercase tracking-wider">
                                                        {property.suburbInsights.periodRange}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Average Days on Market */}
                                            <div className="flex flex-col h-full bg-[#f8f9f9] rounded-2xl shadow-sm border border-gray-100/50 overflow-hidden transform transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                                                <div className="flex-1 p-6 md:p-8 flex flex-col items-center justify-center text-center">
                                                    <div className="text-4xl md:text-5xl font-heading font-bold text-[#163331] mb-4">
                                                        {property.suburbInsights.avgDaysOnMarket?.toFixed(2)}
                                                    </div>
                                                    <div className="text-[11px] md:text-xs font-bold text-[#163331]/60 uppercase tracking-[0.1em] leading-relaxed">
                                                        AVERAGE DAYS ON MARKET
                                                    </div>
                                                </div>
                                                <div className="bg-[#ecedee] py-3 px-4 text-center">
                                                    <span className="text-[10px] md:text-[11px] font-bold text-[#163331]/40 uppercase tracking-wider">
                                                        {property.suburbInsights.periodRange}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Median Sold Price */}
                                            <div className="flex flex-col h-full bg-[#f8f9f9] rounded-2xl shadow-sm border border-gray-100/50 overflow-hidden transform transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                                                <div className="flex-1 p-6 md:p-8 flex flex-col items-center justify-center text-center">
                                                    <div className="text-3xl md:text-4xl lg:text-4xl font-heading font-bold text-[#163331] mb-4 lg:whitespace-nowrap">
                                                        {formatCurrency(property.suburbInsights.avgMedianSoldPrice || property.suburbInsights.medianPrice)}
                                                    </div>
                                                    <div className="text-[11px] md:text-xs font-bold text-[#163331]/60 uppercase tracking-[0.1em] leading-relaxed">
                                                        MEDIAN SOLD PRICE
                                                    </div>
                                                </div>
                                                <div className="bg-[#ecedee] py-3 px-4 text-center">
                                                    <span className="text-[10px] md:text-[11px] font-bold text-[#163331]/40 uppercase tracking-wider">
                                                        {property.suburbInsights.periodRange}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Average Number of Sales */}
                                            <div className="flex flex-col h-full bg-[#f8f9f9] rounded-2xl shadow-sm border border-gray-100/50 overflow-hidden transform transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                                                <div className="flex-1 p-6 md:p-8 flex flex-col items-center justify-center text-center">
                                                    <div className="text-4xl md:text-5xl font-heading font-bold text-[#163331] mb-4">
                                                        {property.suburbInsights.avgNumberSold}
                                                    </div>
                                                    <div className="text-[11px] md:text-xs font-bold text-[#163331]/60 uppercase tracking-[0.1em] leading-relaxed">
                                                        AVERAGE NUMBER OF SALES<br />PER QUARTER
                                                    </div>
                                                </div>
                                                <div className="bg-[#ecedee] py-3 px-4 text-center">
                                                    <span className="text-[10px] md:text-[11px] font-bold text-[#163331]/40 uppercase tracking-wider">
                                                        {property.suburbInsights.periodRange}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </ScrollReveal>
                            )}

                            {/* Historical Performance Charts */}
                            {property.suburbInsights?.historicalData && property.suburbInsights.historicalData.length > 0 && (
                                <ScrollReveal delay={0.25}>
                                    <div className="mb-12">
                                        <h2 className="text-2xl md:text-3xl font-heading font-bold text-[#163331] mb-6 flex items-center gap-3">
                                            <TrendingUp className="w-6 h-6 md:w-8 md:h-8 text-primary-500" strokeWidth={1.5} />
                                            5-Year Suburb Performance - {property.suburb}
                                        </h2>

                                        {(() => {
                                            const rawData = property.suburbInsights.historicalData || [];

                                            // Process data: Group by year if possible, otherwise show monthly/detailed points
                                            const processChartData = (items) => {
                                                if (!items || items.length === 0) return [];

                                                // Try yearly grouping
                                                const years = [...new Set(items.filter(d => d.year).map(d => Number(d.year)))].sort();
                                                const yearly = [];

                                                years.forEach(year => {
                                                    const yearData = items.filter(d => Number(d.year) === year && d.medianPrice > 0);
                                                    if (yearData.length > 0) {
                                                        const latest = yearData.sort((a, b) => (b.month || 0) - (a.month || 0))[0];
                                                        yearly.push({
                                                            ...latest,
                                                            name: latest.year.toString()
                                                        });
                                                    }
                                                });

                                                // If we have 3+ years, yearly is good
                                                if (yearly.length >= 3) return yearly.slice(-10);

                                                // Fallback to monthly/quarterly to show more detail than a single point
                                                return items
                                                    .filter(d => d.medianPrice > 0)
                                                    .map(d => ({
                                                        ...d,
                                                        name: d.period || d.year?.toString()
                                                    }))
                                                    .slice(-24);
                                            };

                                            const chartData = processChartData(rawData);

                                            return (
                                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                                    {/* Median Value Chart */}
                                                    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                                                        <h3 className="text-lg font-semibold text-[#163331] mb-4 flex items-center gap-2">
                                                            <Home className="w-5 h-5 text-primary-500" />
                                                            Median Property Value
                                                        </h3>
                                                        <ResponsiveContainer width="100%" height={300}>
                                                            <LineChart data={chartData}>
                                                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                                                <XAxis
                                                                    dataKey="name"
                                                                    stroke="#6b7280"
                                                                    fontSize={12}
                                                                    tick={{ fill: '#6b7280' }}
                                                                    angle={-45}
                                                                    textAnchor="end"
                                                                    height={60}
                                                                />
                                                                <YAxis
                                                                    stroke="#6b7280"
                                                                    fontSize={12}
                                                                    tick={{ fill: '#6b7280' }}
                                                                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                                                                />
                                                                <Tooltip
                                                                    contentStyle={{
                                                                        backgroundColor: '#fff',
                                                                        border: '1px solid #e5e7eb',
                                                                        borderRadius: '8px',
                                                                        padding: '8px'
                                                                    }}
                                                                    formatter={(value) => formatCurrency(value)}
                                                                    labelStyle={{ color: '#163331', fontWeight: 'bold' }}
                                                                />
                                                                <Legend />
                                                                <Line
                                                                    type="monotone"
                                                                    dataKey="medianPrice"
                                                                    stroke="#163331"
                                                                    strokeWidth={2}
                                                                    dot={{ fill: '#163331', r: 3 }}
                                                                    activeDot={{ r: 5 }}
                                                                    name="Median Value"
                                                                    connectNulls={false}
                                                                />
                                                            </LineChart>
                                                        </ResponsiveContainer>
                                                    </div>

                                                    {/* Median Rent Chart */}
                                                    {chartData.some(d => d.medianRent && d.medianRent > 0) && (
                                                        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                                                            <h3 className="text-lg font-semibold text-[#163331] mb-4 flex items-center gap-2">
                                                                <Calendar className="w-5 h-5 text-primary-500" />
                                                                Median Weekly Rent
                                                            </h3>
                                                            <ResponsiveContainer width="100%" height={300}>
                                                                <LineChart data={chartData}>
                                                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                                                    <XAxis
                                                                        dataKey="name"
                                                                        stroke="#6b7280"
                                                                        fontSize={12}
                                                                        tick={{ fill: '#6b7280' }}
                                                                        angle={-45}
                                                                        textAnchor="end"
                                                                        height={60}
                                                                    />
                                                                    <YAxis
                                                                        stroke="#6b7280"
                                                                        fontSize={12}
                                                                        tick={{ fill: '#6b7280' }}
                                                                        tickFormatter={(value) => `$${value}/wk`}
                                                                    />
                                                                    <Tooltip
                                                                        contentStyle={{
                                                                            backgroundColor: '#fff',
                                                                            border: '1px solid #e5e7eb',
                                                                            borderRadius: '8px',
                                                                            padding: '8px'
                                                                        }}
                                                                        formatter={(value) => value ? `$${value}/week` : 'N/A'}
                                                                        labelStyle={{ color: '#163331', fontWeight: 'bold' }}
                                                                    />
                                                                    <Legend />
                                                                    <Line
                                                                        type="monotone"
                                                                        dataKey="medianRent"
                                                                        stroke="#48D98E"
                                                                        strokeWidth={2}
                                                                        dot={{ fill: '#48D98E', r: 3 }}
                                                                        activeDot={{ r: 5 }}
                                                                        name="Median Rent"
                                                                        connectNulls={false}
                                                                    />
                                                                </LineChart>
                                                            </ResponsiveContainer>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })()}

                                        {!property.suburbInsights.historicalData.some(d => d.medianRent > 0) && (
                                            <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                                                <p className="text-sm text-gray-600 text-center">
                                                    Rental data is not available for this suburb at this time.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </ScrollReveal>
                            )}

                            {/* Comparable Sales - Limited to 3 with View All option */}
                            {property.comparables && property.comparables.length > 0 && (
                                <ScrollReveal delay={0.3}>
                                    <div className="mb-12">
                                        <div className="flex items-center justify-between mb-6">
                                            <h2 className="text-2xl md:text-3xl font-heading font-bold text-[#163331] flex items-center gap-3">
                                                <Ruler className="w-6 h-6 md:w-8 md:h-8 text-primary-500" strokeWidth={1.5} />
                                                Comparable Sales
                                            </h2>
                                            {property.comparables.length > 3 && (
                                                <button
                                                    onClick={() => setIsComparablesModalOpen(true)}
                                                    className="text-primary-600 hover:text-primary-700 font-semibold text-sm flex items-center gap-1 transition-colors group"
                                                >
                                                    View all {property.comparables.length} sales
                                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                                                </button>
                                            )}
                                        </div>
                                        <p className="text-gray-600 mb-6 max-w-3xl">
                                            Similar properties in the area
                                        </p>
                                        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                                            <div className="divide-y divide-gray-200">
                                                {property.comparables.slice(0, 3).map((sale, index) => (
                                                    <div
                                                        key={index}
                                                        className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
                                                    >
                                                        <div className="w-20 h-20 rounded-lg flex-shrink-0 overflow-hidden bg-gray-200 relative">
                                                            {sale.images && sale.images.length > 0 && sale.images[0]?.url ? (
                                                                <img
                                                                    src={sale.images[0].url}
                                                                    alt={sale.address || 'Property image'}
                                                                    className="w-full h-full object-cover"
                                                                    onError={(e) => {
                                                                        e.target.onerror = null;
                                                                        e.target.style.display = 'none';
                                                                        if (e.target.nextSibling) {
                                                                            e.target.nextSibling.style.display = 'flex';
                                                                        }
                                                                    }}
                                                                />
                                                            ) : null}
                                                            {/* Fallback in case image is missing or fails to load */}
                                                            <div className="w-full h-full flex items-center justify-center bg-gray-100"
                                                                style={{ display: (sale.images && sale.images.length > 0 && sale.images[0]?.url) ? 'none' : 'flex' }}>
                                                                <ImageOff className="w-6 h-6 text-gray-300" />
                                                            </div>
                                                        </div>

                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-start justify-between gap-4 mb-1">
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="font-semibold text-[#163331] text-sm mb-0.5 line-clamp-1">
                                                                        {sale.address}
                                                                    </div>
                                                                    <div className="text-xs text-gray-600 flex items-center gap-1">
                                                                        <span>Sold {formatDate(sale.saleDate)}</span>
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

                                                            <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                                                                {sale.beds > 0 && (
                                                                    <span className="flex items-center gap-1">
                                                                        <Bed className="w-3.5 h-3.5" />
                                                                        {sale.beds}
                                                                    </span>
                                                                )}
                                                                {sale.baths > 0 && (
                                                                    <span className="flex items-center gap-1">
                                                                        <Bath className="w-3.5 h-3.5" />
                                                                        {sale.baths}
                                                                    </span>
                                                                )}
                                                                {(sale.parking > 0 || sale.cars > 0) && (
                                                                    <span className="flex items-center gap-1">
                                                                        <Car className="w-3.5 h-3.5" />
                                                                        {sale.parking || sale.cars}
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

                            {/* Local Schools */}
                            {property.schools && property.schools.length > 0 && (
                                <ScrollReveal delay={0.35}>
                                    <div className="mb-12">
                                        <div className="flex items-center justify-between mb-6">
                                            <h2 className="text-2xl md:text-3xl font-heading font-bold text-[#163331] flex items-center gap-3">
                                                <School className="w-6 h-6 md:w-8 md:h-8 text-primary-500" strokeWidth={1.5} />
                                                Local Schools
                                            </h2>
                                            {property.schools.length > 5 && (
                                                <button
                                                    onClick={() => setIsSchoolsModalOpen(true)}
                                                    className="text-primary-600 hover:text-primary-700 font-semibold text-sm flex items-center gap-1 transition-colors group"
                                                >
                                                    View all {property.schools.length} schools
                                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                                                </button>
                                            )}
                                        </div>
                                        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                                            <div className="divide-y divide-gray-200">
                                                {property.schools.slice(0, 5).map((school, index) => (
                                                    <div key={index} className="p-4 hover:bg-gray-50 transition-colors">
                                                        <div className="flex items-start justify-between">
                                                            <div>
                                                                <h3 className="font-semibold text-[#163331] text-sm mb-1">
                                                                    {school.name}
                                                                </h3>
                                                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                                                                    <span className="capitalize">{school.type}</span>
                                                                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                                                    <span className="capitalize">{school.sector}</span>
                                                                    {school.yearRange && (
                                                                        <>
                                                                            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                                                            <span>Years {school.yearRange}</span>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <div className="inline-flex items-center justify-center bg-gray-100 text-gray-700 text-xs font-semibold px-2 py-1 rounded">
                                                                    {school.distance < 1000
                                                                        ? `${Math.round(school.distance)}m`
                                                                        : `${(school.distance / 1000).toFixed(1)}km`}
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

                {/* Modals */}
                <LeadCaptureModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)} // Allowed closing even if not unlocked
                    onSubmit={handleFormSubmit}
                    isSubmitting={isSubmitting}
                    formError={formError}
                    property={property}
                    primaryImageUrl={propertyImages[0]?.url}
                />

                <SuccessModal
                    isOpen={isSuccessModalOpen}
                    onClose={() => setIsSuccessModalOpen(false)}
                    email={userEmail}
                />

                {/* Full Screen Image Gallery Modal - Swipeable */}
                {isImageGalleryOpen && propertyImages.length > 0 && createPortal(
                    <div
                        className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center animate-fadeIn"
                        onClick={() => setIsImageGalleryOpen(false)}
                    >
                        {/* Top Bar */}
                        <div className="absolute top-0 left-0 right-0 p-4 md:p-6 flex items-center justify-between z-20 text-white">
                            <div className="text-sm font-medium opacity-80">
                                {currentImageIndex + 1} / {propertyImages.length}
                            </div>
                            <button
                                onClick={() => setIsImageGalleryOpen(false)}
                                className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                            >
                                <X className="w-6 h-6 text-white" />
                            </button>
                        </div>

                        {/* Main Image */}
                        <div
                            className="relative w-full h-full flex items-center justify-center p-4 md:p-8"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Navigation Buttons - Hidden on Mobile, shown on Desktop */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    setCurrentImageIndex(prev => prev > 0 ? prev - 1 : propertyImages.length - 1)
                                }}
                                className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 p-3 bg-black/30 hover:bg-black/50 text-white rounded-full transition-colors hidden md:block"
                            >
                                <ChevronLeft className="w-8 h-8" />
                            </button>

                            <img
                                src={propertyImages[currentImageIndex].url}
                                alt={propertyImages[currentImageIndex].alt || property.address}
                                className="max-w-full max-h-full object-contain rounded-sm shadow-2xl"
                            />

                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    setCurrentImageIndex(prev => prev < propertyImages.length - 1 ? prev + 1 : 0)
                                }}
                                className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 p-3 bg-black/30 hover:bg-black/50 text-white rounded-full transition-colors hidden md:block"
                            >
                                <ChevronRight className="w-8 h-8" />
                            </button>
                        </div>

                        {/* Thumbnail Strip - Bottom */}
                        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-t from-black/80 to-transparent overflow-x-auto z-20">
                            <div className="flex items-center justify-center gap-3">
                                {propertyImages.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            setCurrentImageIndex(idx)
                                        }}
                                        className={`relative w-16 h-12 md:w-20 md:h-14 flex-shrink-0 rounded-md overflow-hidden border-2 transition-all ${currentImageIndex === idx ? 'border-brand-mint scale-110 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'
                                            }`}
                                    >
                                        <img
                                            src={img.url}
                                            alt={`Thumbnail ${idx + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>,
                    document.body
                )}

                {/* All Schools Modal */}
                {isSchoolsModalOpen && createPortal(
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6"
                        role="dialog"
                        aria-modal="true"
                    >
                        {/* Backdrop */}
                        <div
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                            onClick={() => setIsSchoolsModalOpen(false)}
                        ></div>

                        {/* Modal Content */}
                        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col animate-scaleIn overflow-hidden">
                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b border-gray-100">
                                <h3 className="text-2xl font-heading font-bold text-[#163331] flex items-center gap-2">
                                    <School className="w-6 h-6 text-primary-500" />
                                    All Local Schools ({property.schools.length})
                                </h3>
                                <button
                                    onClick={() => setIsSchoolsModalOpen(false)}
                                    className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Scrollable List */}
                            <div className="flex-1 overflow-y-auto p-0">
                                <div className="divide-y divide-gray-100">
                                    {property.schools.map((school, index) => (
                                        <div key={index} className="p-5 hover:bg-gray-50 transition-colors">
                                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                                                <div>
                                                    <h4 className="font-semibold text-[#163331] text-base mb-1.5">{school.name}</h4>
                                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-600">
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
                                                            {school.type}
                                                        </span>
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 text-xs font-medium">
                                                            {school.sector}
                                                        </span>
                                                        {school.yearRange && (
                                                            <span className="text-gray-500 text-xs">
                                                                Years {school.yearRange}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm font-medium text-[#163331]">
                                                    <MapPin className="w-4 h-4 text-gray-400" />
                                                    {school.distance < 1000
                                                        ? `${Math.round(school.distance)}m`
                                                        : `${(school.distance / 1000).toFixed(1)}km`}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>,
                    document.body
                )}

                {/* All Comparable Sales Modal */}
                {isComparablesModalOpen && createPortal(
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6"
                        role="dialog"
                        aria-modal="true"
                    >
                        {/* Backdrop */}
                        <div
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                            onClick={() => setIsComparablesModalOpen(false)}
                        ></div>

                        {/* Modal Content */}
                        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col animate-scaleIn overflow-hidden">
                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b border-gray-100">
                                <h3 className="text-2xl font-heading font-bold text-[#163331] flex items-center gap-2">
                                    <Ruler className="w-6 h-6 text-primary-500" />
                                    Comparable Sales ({property.comparables.length})
                                </h3>
                                <button
                                    onClick={() => setIsComparablesModalOpen(false)}
                                    className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Scrollable List */}
                            <div className="flex-1 overflow-y-auto p-0">
                                <div className="divide-y divide-gray-100">
                                    {property.comparables.map((sale, index) => (
                                        <div key={index} className="p-5 hover:bg-gray-50 transition-colors">
                                            <div className="flex gap-5">
                                                {/* Image */}
                                                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-lg flex-shrink-0 overflow-hidden bg-gray-200 relative">
                                                    {sale.images && sale.images.length > 0 && sale.images[0]?.url ? (
                                                        <img
                                                            src={sale.images[0].url}
                                                            alt={sale.address || 'Property image'}
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => {
                                                                e.target.onerror = null;
                                                                e.target.style.display = 'none';
                                                                if (e.target.nextSibling) {
                                                                    e.target.nextSibling.style.display = 'flex';
                                                                }
                                                            }}
                                                        />
                                                    ) : null}
                                                    {/* Fallback */}
                                                    <div className="w-full h-full flex items-center justify-center bg-gray-100"
                                                        style={{ display: (sale.images && sale.images.length > 0 && sale.images[0]?.url) ? 'none' : 'flex' }}>
                                                        <ImageOff className="w-8 h-8 text-gray-300" />
                                                    </div>
                                                </div>

                                                {/* Details */}
                                                <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                                                    <div>
                                                        <div className="flex items-start justify-between gap-4">
                                                            <h4 className="font-bold text-[#163331] text-lg sm:text-xl line-clamp-1">
                                                                {sale.address}
                                                            </h4>
                                                            <div className="text-right flex-shrink-0">
                                                                <div className="text-xl sm:text-2xl font-bold text-[#163331]">
                                                                    {formatCurrency(sale.salePrice)}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="text-sm text-gray-600 mt-1 mb-3">
                                                            Sold on {formatDate(sale.saleDate)}
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-700">
                                                        {sale.beds > 0 && (
                                                            <div className="flex items-center gap-2">
                                                                <Bed className="w-4 h-4 text-gray-400" />
                                                                <span className="font-medium">{sale.beds} Bed</span>
                                                            </div>
                                                        )}
                                                        {sale.baths > 0 && (
                                                            <div className="flex items-center gap-2">
                                                                <Bath className="w-4 h-4 text-gray-400" />
                                                                <span className="font-medium">{sale.baths} Bath</span>
                                                            </div>
                                                        )}
                                                        {(sale.parking > 0 || sale.cars > 0) && (
                                                            <div className="flex items-center gap-2">
                                                                <Car className="w-4 h-4 text-gray-400" />
                                                                <span className="font-medium">{sale.parking || sale.cars} Car</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>,
                    document.body
                )}

                {/* ═════════════════════════════════════════════════════════════════════════════════════════ */}
                {/* RETRY MODAL: Price Estimate API Failed */}
                {/* ═════════════════════════════════════════════════════════════════════════════════════════ */}
                {isPriceEstimateErrorModalOpen && createPortal(
                    <div
                        className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
                        style={{ top: 0, left: 0, right: 0, bottom: 0, height: '100vh', width: '100vw' }}
                    >
                        {/* Backdrop */}
                        <div
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => setIsPriceEstimateErrorModalOpen(false)}
                        />

                        {/* Modal */}
                        <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6 md:p-8 z-10">
                            {/* Close button */}
                            <button
                                onClick={() => setIsPriceEstimateErrorModalOpen(false)}
                                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="w-5 h-5" strokeWidth={2} />
                            </button>

                            {/* Content */}
                            <div className="text-center">
                                <div className="mb-4 flex justify-center">
                                    <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                                        <AlertCircle className="w-6 h-6 text-amber-600" />
                                    </div>
                                </div>

                                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                    Having Trouble Fetching Estimate
                                </h3>

                                <p className="text-gray-600 mb-6 text-sm">
                                    We couldn't retrieve the latest property price estimate at this moment.
                                    This could be due to a temporary service issue.
                                </p>

                                {/* 76y */}

                                {/* Buttons */}
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => {
                                            // Refresh the property data
                                            setIsLoading(true)
                                            getPropertyDetails(params.id)
                                                .then(data => {
                                                    setProperty(data)
                                                    if (!data.apiFailedError) {
                                                        setIsPriceEstimateErrorModalOpen(false)
                                                    }
                                                })
                                                .catch(err => console.error('Retry failed:', err))
                                                .finally(() => setIsLoading(false))
                                        }}
                                        className="flex-1 bg-[#48D98E] text-white font-semibold py-2.5 px-4 rounded-lg hover:bg-[#3bc57d] transition-colors"
                                    >
                                        Try Again
                                    </button>

                                    <button
                                        onClick={() => setIsPriceEstimateErrorModalOpen(false)}
                                        className="flex-1 bg-gray-100 text-gray-700 font-semibold py-2.5 px-4 rounded-lg hover:bg-gray-200 transition-colors"
                                    >
                                        Dismiss
                                    </button>
                                </div>

                                <p className="text-xs text-gray-500 mt-4">
                                    You can still view other property details and request a manual appraisal.
                                </p>
                            </div>
                        </div>
                    </div>,
                    document.body
                )}
            </div>
        </>
    )
}