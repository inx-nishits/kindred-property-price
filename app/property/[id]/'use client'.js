'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createPortal } from 'react-dom'
import { getPropertyDetails, submitLeadForm, fetchSchools, fetchSuburbPerformance } from '@/services/propertyService'
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
    const [isPriceEstimateLoading, setIsPriceEstimateLoading] = useState(true)
    const [error, setError] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isUnlocked, setIsUnlocked] = useState(false)
    const [isImageGalleryOpen, setIsImageGalleryOpen] = useState(false)
    const [currentImageIndex, setCurrentImageIndex] = useState(0)
    const [isSchoolsModalOpen, setIsSchoolsModalOpen] = useState(false)
    const [isComparablesModalOpen, setIsComparablesModalOpen] = useState(false)
    const [comparableFilter, setComparableFilter] = useState('all') // 'all', 'sold', 'sale'
    const [schools, setSchools] = useState([])
    const [isFetchingSchools, setIsFetchingSchools] = useState(false)
    const [suburbPerformance, setSuburbPerformance] = useState(null)
    const [isFetchingSuburbPerformance, setIsFetchingSuburbPerformance] = useState(false)

    const propertyImages = property?.images || []
    console.log(property);

    const openSchoolsModal = async () => {
        setIsSchoolsModalOpen(true)
        if (schools.length === 0 && property) {
            setIsFetchingSchools(true)
            try {
                // Use data from property object if available, otherwise fetch
                if (property.schools && property.schools.length > 0) {
                    setSchools(property.schools)
                } else {
                    // Support both coordinates (API) and latitude/lng (mock)
                    const lat = property.coordinates?.lat || property.latitude
                    const lng = property.coordinates?.lng || property.longitude
                    if (lat && lng) {
                        const schoolsData = await fetchSchools(lat, lng)
                        setSchools(schoolsData || [])
                    }
                }
            } catch (err) {
                console.error("Error fetching schools", err)
            } finally {
                setIsFetchingSchools(false)
            }
        }
    }

    const viewSuburbInsights = async () => {
        if (!suburbPerformance && property) {
            // Support both addressComponents (API) and direct properties (mock)
            const state = property.addressComponents?.state || property.state
            const suburb = property.addressComponents?.suburb || property.suburb
            const postcode = property.addressComponents?.postCode || property.postcode
            
            if (state && suburb && postcode) {
                setIsFetchingSuburbPerformance(true);
                try {
                    const performanceData = await fetchSuburbPerformance(state, suburb, postcode);
                    setSuburbPerformance(performanceData);
                } catch (error) {
                    console.error('Error fetching suburb performance:', error);
                } finally {
                    setIsFetchingSuburbPerformance(false);
                }
            }
        }
    };

    // When property data is loaded, and it's unlocked, fetch suburb performance
    useEffect(() => {
        if (property && isUnlocked) {
            viewSuburbInsights();
        }
    }, [property, isUnlocked]);

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
                setIsPriceEstimateLoading(true)  // Reset price estimate loading state
                setError(null)
                const data = await getPropertyDetails(params.id)
                if (data) {
                    setProperty(data)
                    console.log('Property data:', data);

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

    // Track price estimate loading
    useEffect(() => {
        if (property && property.priceEstimate !== undefined) {
            // Price estimate is available (either from API or fallback)
            setIsPriceEstimateLoading(false)
        }
    }, [property?.priceEstimate])

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
        if (typeof amount !== 'number') {
            return ''
        }
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
                                            {isPriceEstimateLoading ? (
                                                // Loading skeleton for price estimate
                                                <div className="space-y-6 animate-pulse">
                                                    <div>
                                                        <div className="h-10 bg-white/20 rounded-lg w-3/4 mb-3"></div>
                                                        <div className="h-6 bg-white/15 rounded-full w-32"></div>
                                                    </div>
                                                    <div className="pt-6 border-t border-white/25">
                                                        <div className="h-12 bg-white/10 rounded-lg"></div>
                                                    </div>
                                                </div>
                                            ) : property.priceEstimate && property.priceEstimate.mid > 0 ? (
                                                <div className="space-y-6">
                                                    <div>
                                                        <h2 className="text-2xl md:text-3xl font-heading font-semibold text-white/95 uppercase tracking-wider flex items-center gap-2 mb-4">
                                                            <ArrowUpRight className="w-5 h-5 text-[#48D98E]" />
                                                            <span className="text-lg md:text-xl">Estimated Value:</span> {formatCurrency(property.priceEstimate.mid)}
                                                        </h2>
                                                        <div className="text-xl md:text-xl text-white/80">
                                                            {formatCurrency(property.priceEstimate.low)} - {formatCurrency(property.priceEstimate.high)}
                                                        </div>
                                                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/15 backdrop-blur-sm rounded-full mt-4">
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
                                                <div className="space-y-6">
                                                    <div>
                                                        <h2 className="text-2xl md:text-3xl font-heading font-semibold text-white/95 uppercase tracking-wider flex items-center gap-2 mb-4">
                                                            <ArrowUpRight className="w-5 h-5 text-[#48D98E]" />
                                                            <span className="text-lg md:text-xl">Estimated Value:</span> $0
                                                        </h2>
                                                        <div className="text-xl md:text-xl text-white/80">
                                                            $0 - $0
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
                                                        This estimate may not have factored in your current home condition or any recent renovations. For a more accurate sale price contact Town for a personal appraisal.
                                                    </p>
                                                </div>
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
                            {isFetchingSuburbPerformance ? (
                                <div className="text-center p-8">
                                    <p className="text-gray-600">Loading Suburb Insights...</p>
                                </div>
                            ) : suburbPerformance && (
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
                                                        {suburbPerformance.overallClearanceRate?.toFixed(2)}%
                                                    </div>
                                                    <div className="text-[11px] md:text-xs font-bold text-[#163331]/60 uppercase tracking-[0.1em] leading-relaxed">
                                                        AUCTION CLEARANCE RATE
                                                    </div>
                                                </div>
                                                <div className="bg-[#ecedee] py-3 px-4 text-center">
                                                    <span className="text-[10px] md:text-[11px] font-bold text-[#163331]/40 uppercase tracking-wider">
                                                        {suburbPerformance.periodRange}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Average Days on Market */}
                                            <div className="flex flex-col h-full bg-[#f8f9f9] rounded-2xl shadow-sm border border-gray-100/50 overflow-hidden transform transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                                                <div className="flex-1 p-6 md:p-8 flex flex-col items-center justify-center text-center">
                                                    <div className="text-4xl md:text-5xl font-heading font-bold text-[#163331] mb-4">
                                                        {suburbPerformance.avgDaysOnMarket?.toFixed(2)}
                                                    </div>
                                                    <div className="text-[11px] md:text-xs font-bold text-[#163331]/60 uppercase tracking-[0.1em] leading-relaxed">
                                                        AVERAGE DAYS ON MARKET
                                                    </div>
                                                </div>
                                                <div className="bg-[#ecedee] py-3 px-4 text-center">
                                                    <span className="text-[10px] md:text-[11px] font-bold text-[#163331]/40 uppercase tracking-wider">
                                                        {suburbPerformance.periodRange}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Median Sold Price */}
                                            <div className="flex flex-col h-full bg-[#f8f9f9] rounded-2xl shadow-sm border border-gray-100/50 overflow-hidden transform transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                                                <div className="flex-1 p-6 md:p-8 flex flex-col items-center justify-center text-center">
                                                    <div className="text-3xl md:text-4xl lg:text-4xl font-heading font-bold text-[#163331] mb-4 lg:whitespace-nowrap">
                                                        {formatCurrency(suburbPerformance.avgMedianSoldPrice || suburbPerformance.medianPrice)}
                                                    </div>
                                                    <div className="text-[11px] md:text-xs font-bold text-[#163331]/60 uppercase tracking-[0.1em] leading-relaxed">
                                                        MEDIAN SOLD PRICE
                                                    </div>
                                                </div>
                                                <div className="bg-[#ecedee] py-3 px-4 text-center">
                                                    <span className="text-[10px] md:text-[11px] font-bold text-[#163331]/40 uppercase tracking-wider">
                                                        {suburbPerformance.periodRange}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Average Number of Sales */}
                                            <div className="flex flex-col h-full bg-[#f8f9f9] rounded-2xl shadow-sm border border-gray-100/50 overflow-hidden transform transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                                                <div className="flex-1 p-6 md:p-8 flex flex-col items-center justify-center text-center">
                                                    <div className="text-4xl md:text-5xl font-heading font-bold text-[#163331] mb-4">
                                                        {suburbPerformance.avgNumberSold}
                                                    </div>
                                                    <div className="text-[11px] md:text-xs font-bold text-[#163331]/60 uppercase tracking-[0.1em] leading-relaxed">
                                                        AVERAGE NUMBER OF SALES<br />PER QUARTER
                                                    </div>
                                                </div>
                                                <div className="bg-[#ecedee] py-3 px-4 text-center">
                                                    <span className="text-[10px] md:text-[11px] font-bold text-[#163331]/40 uppercase tracking-wider">
                                                        {suburbPerformance.periodRange}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </ScrollReveal>
                            )}

                            {/* Historical Performance Charts */}
                            {suburbPerformance?.historicalData && suburbPerformance.historicalData.length > 0 && (
                                <ScrollReveal delay={0.25}>
                                    <div className="mb-12">
                                        <h2 className="text-2xl md:text-3xl font-heading font-bold text-[#163331] mb-6 flex items-center gap-3">
                                            <TrendingUp className="w-6 h-6 md:w-8 md:h-8 text-primary-500" strokeWidth={1.5} />
                                            5-Year Suburb Performance - {property.suburb}
                                        </h2>

                                        {(() => {
                                            const rawData = suburbPerformance.historicalData || [];

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

                                        {!suburbPerformance.historicalData.some(d => d.medianRent > 0) && (
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
                                        <div className="flex flex-wrap gap-2 mb-6">
                                            {[
                                                { id: 'all', label: 'All', count: property.comparables.length },
                                                { id: 'sold', label: 'Sold', count: property.comparables.filter(c => c.status === 'Sold').length },
                                                { id: 'sale', label: 'For Sale', count: property.comparables.filter(c => c.status === 'For Sale').length }
                                            ].map((filter) => (
                                                <button
                                                    key={filter.id}
                                                    onClick={() => setComparableFilter(filter.id)}
                                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${comparableFilter === filter.id
                                                        ? 'bg-[#163331] text-white shadow-md'
                                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                        }`}
                                                >
                                                    {filter.label} ({filter.count})
                                                </button>
                                            ))}
                                        </div>

                                        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                                            <div className="divide-y divide-gray-200">
                                                {property.comparables
                                                    .filter(c => {
                                                        if (comparableFilter === 'all') return true;
                                                        if (comparableFilter === 'sold') return c.status === 'Sold';
                                                        if (comparableFilter === 'sale') return c.status === 'For Sale';
                                                        return true;
                                                    })
                                                    .slice(0, 3)
                                                    .map((sale, index) => (
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
                                                                            <span>{sale.status === 'Sold' ? 'Sold' : 'Listed'} {sale.saleDate && !isNaN(new Date(sale.saleDate)) ? formatDate(sale.saleDate) : 'recently'}</span>
                                                                        </div>
                                                                    </div>
                                                                    <div className="text-right flex-shrink-0">
                                                                        <div className="text-lg font-bold text-[#163331]">
                                                                            {formatCurrency(sale.salePrice)}
                                                                        </div>
                                                                        <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded mt-1 ${sale.status === 'Sold'
                                                                            ? 'bg-[#163331]/10 text-[#163331]'
                                                                            : 'bg-blue-100 text-blue-700'
                                                                            }`}>
                                                                            {sale.status === 'Sold' ? 'SOLD' : 'FOR SALE'}
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
                                                {property.comparables.filter(c => {
                                                    if (comparableFilter === 'all') return true;
                                                    if (comparableFilter === 'sold') return c.status === 'Sold';
                                                    if (comparableFilter === 'sale') return c.status === 'For Sale';
                                                    return true;
                                                }).length === 0 && (
                                                        <div className="p-8 text-center text-gray-500">
                                                            No {comparableFilter === 'all' ? 'comparable' : comparableFilter === 'sold' ? 'sold' : 'for sale'} properties found in this area.
                                                        </div>
                                                    )}
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
                                            {property.schools && property.schools.length > 5 && (
                                                <button
                                                    onClick={openSchoolsModal}
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
                                                                    {school.sector && (
                                                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${school.sector.toLowerCase().includes('government')
                                                                            ? 'bg-blue-50 text-blue-700'
                                                                            : school.sector.toLowerCase().includes('independent')
                                                                                ? 'bg-purple-50 text-purple-700'
                                                                                : 'bg-gray-100 text-gray-700'}`}>
                                                                            {school.sector}
                                                                        </span>
                                                                    )}
                                                                    {school.yearRange && (
                                                                        <span>Years {school.yearRange}</span>
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
                                    All Local Schools ({schools.length})
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
                                    {schools.map((school, index) => (
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





//--------------------------------------------------------------------------------------------
//  propertyservice code too
'use client'

import { submitLeadFormAndSendReport } from './emailService'
import {
  isValidPropertyId,
  isMockPropertyId,
  isValidPostcode,
  isValidState,
  isValidSuburb,
  validateSearchCriteria,
  createApiError,
} from '../utils/propertyValidation'

const DOMAIN_API_BASE_URL = 'https://api.domain.com.au/v1'
const DOMAIN_API_V2_BASE_URL = 'https://api.domain.com.au/v2'

/**
 * Fetch price estimate for a property
 */
/**
 * Fetch price estimate for a property from Domain API
 * 
 * This provides accurate estimates directly from Domain's
 * proprietary pricing algorithm.
 */
export const fetchPriceEstimate = async (id) => {
  const apiKey = process.env.NEXT_PUBLIC_DOMAIN_API_KEY

  // Validate property ID to prevent 404 errors
  if (!id) {
    return null;
  }

  if (!isValidPropertyId(id)) {
    return null;
  }

  if (isMockPropertyId(id)) {
    return null;
  }

  if (!apiKey) {
    return null;
  }

  try {
    const response = await fetch(`${DOMAIN_API_BASE_URL}/properties/${id}/priceEstimate`, {
      method: 'GET',
      headers: {
        accept: 'application/json',
        'X-Api-Key': apiKey,
        'X-Api-Call-Source': 'live-api-browser',
      },
    })

    if (!response.ok) return null

    const responseText = await response.text();
    if (!responseText || responseText.trim() === '') {
      console.warn('Empty response from price estimate API');
      return null;
    }

    try {
      return JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse JSON from price estimate API:', parseError);
      console.error('Response text:', responseText);
      return null;
    }
  } catch (error) {
    console.error('Error fetching price estimate:', error)
    return null
  }
}

/**
 * Fetch nearby schools based on location
 */
export const fetchSchools = async (lat, lng) => {
  const apiKey = process.env.NEXT_PUBLIC_DOMAIN_API_KEY

  // Validate coordinates
  if (!apiKey) {
    return [];
  }

  if (!lat || !lng) {
    return [];
  }

  // Validate coordinate ranges
  const latNum = Number(lat);
  const lngNum = Number(lng);

  if (isNaN(latNum) || latNum < -90 || latNum > 90) {
    return [];
  }

  if (isNaN(lngNum) || lngNum < -180 || lngNum > 180) {
    return [];
  }

  try {
    const response = await fetch(`${DOMAIN_API_V2_BASE_URL}/schools/${lat}/${lng}`, {
      method: 'GET',
      headers: {
        accept: 'application/json',
        'X-Api-Key': apiKey,
        'X-Api-Call-Source': 'live-api-browser',
      },
    })

    if (!response.ok) return []

    const responseText = await response.text()
    if (!responseText || responseText.trim() === '') {
      console.warn('Empty response from schools API')
      return []
    }

    try {
      const data = JSON.parse(responseText)
      return data || []
    } catch (parseError) {
      console.error('Failed to parse JSON from schools API:', parseError)
      console.error('Response text:', responseText)
      return []
    }
  } catch (error) {
    console.error('Error fetching schools:', error)
    return []
  }
}

/**
 * Fetch comparable sold listings
 */
export const fetchComparables = async (state, suburb, postcode, propertyType, beds, baths, landSize, coordinates) => {
  const apiKey = process.env.NEXT_PUBLIC_DOMAIN_API_KEY

  // Validate required parameters
  if (!apiKey) return [];
  if (!suburb && !coordinates) return [];

  try {
    // Valid property types for Domain API
    const VALID_PROPERTY_TYPES = [
      'House', 'ApartmentUnitFlat', 'Townhouse', 'Villa', 'Semi-detached',
      'Terrace', 'Duplex', 'Acreage', 'AcreageSemi-rural', 'Retirement',
      'BlockOfUnits', 'Other'
    ];

    const validatePropertyType = (type) => {
      if (!type) return null
      const normalized = type.trim()
      if (VALID_PROPERTY_TYPES.includes(normalized)) return normalized

      const mapping = {
        'house': 'House', 'apartment': 'ApartmentUnitFlat', 'unit': 'ApartmentUnitFlat',
        'flat': 'ApartmentUnitFlat', 'townhouse': 'Townhouse', 'villa': 'Villa',
        'semidetached': 'Semi-detached', 'semi_detached': 'Semi-detached',
        'terrace': 'Terrace', 'duplex': 'Duplex', 'acreage': 'Acreage',
        'retirement': 'Retirement', 'blockofunits': 'BlockOfUnits', 'other': 'Other',
        'ApartmentUnit': 'ApartmentUnitFlat', 'SemiDetached': 'Semi-detached',
        'Semi_Detached': 'Semi-detached', 'AcreageSemiRural': 'AcreageSemi-rural',
        'AcreageSemi_Rural': 'AcreageSemi-rural',
      }

      const lowerCaseType = normalized.toLowerCase().replace(/[^a-z]/g, '')
      return mapping[lowerCaseType] || null
    };

    let propertyTypes = []
    if (propertyType) {
      const validatedType = validatePropertyType(propertyType)
      if (validatedType) propertyTypes = [validatedType]
    }

    // Calculate dates for 12 months period
    const twelveMonthsAgo = new Date()
    twelveMonthsAgo.setFullYear(twelveMonthsAgo.getFullYear() - 1)
    const minSoldDate = twelveMonthsAgo.toISOString().split('T')[0]

    const searchBody = {
      listingType: 'Sold',
      ...(propertyTypes.length > 0 ? { propertyTypes } : {}),
      searchMode: 'exact',
      locations: [
        {
          state: state,
          suburb: suburb,
          postcode: postcode,
          includeSurroundingSuburbs: true
        }
      ],
      // Property feature filters
      ...(beds ? { minBedrooms: Math.max(0, beds - 1), maxBedrooms: beds + 1 } : {}),
      ...(baths ? { minBathrooms: Math.max(0, baths - 1), maxBathrooms: baths + 1 } : {}),
      ...(landSize ? { minLandArea: Math.round(landSize * 0.8), maxLandArea: Math.round(landSize * 1.2) } : {}),

      // Period filter: Sold in last 12 months
      minSoldDate: minSoldDate,

      sort: {
        sortKey: 'SoldDate',
        direction: 'Descending'
      },
      pageNumber: 1,
      pageSize: 12,
    }

    // Clean the body to avoid sending nulls or empty arrays which may cause 400s
    const cleanedBody = JSON.parse(JSON.stringify(searchBody, (k, v) => {
      if (v === null || v === undefined) return undefined
      if (Array.isArray(v) && v.length === 0) return undefined
      return v
    }))

    const requestUrl = `${DOMAIN_API_BASE_URL}/listings/residential/_search`
    console.debug('Domain comparables request:', requestUrl, cleanedBody)

    const response = await fetch(requestUrl, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
        'X-Api-Key': apiKey,
        'X-Api-Call-Source': 'live-api-browser',
      },
      body: JSON.stringify(cleanedBody)
    })

    try {
      if (!response.ok) {
        let respText = '<unreadable>'
        try { respText = await response.text() } catch (e) { }
        console.error('Domain comparables API error:', response.status, response.statusText, respText)
        return []
      }

      const responseText = await response.text()
      if (!responseText || responseText.trim() === '') {
        console.warn('Empty response from comparables API')
        return []
      }

      try {
        const data = JSON.parse(responseText)
        // console.log(`Fetched comparables: ${Array.isArray(data) ? data.length : 'unknown'}`)

        // Debug: Log first comparable to understand structure
        // if (Array.isArray(data) && data.length > 0) {
        //   console.log('First comparable structure:', JSON.stringify(data[0], null, 2))
        // }

        return data || []
      } catch (parseError) {
        console.error('Failed to parse JSON from comparables API:', parseError)
        console.error('Response text:', responseText)
        return []
      }
    } catch (error) {
      console.error('Error handling comparables response:', error)
      return []
    }
  } catch (error) {
    console.error('Error fetching comparables:', error)
    return []
  }
}

/**
 * Fetch comparable for-sale listings (current market listings)
 */
export const fetchForSaleComparables = async (state, suburb, postcode, propertyType, beds, baths, landSize, coordinates) => {
  const apiKey = process.env.NEXT_PUBLIC_DOMAIN_API_KEY

  if (!apiKey) return [];
  if (!suburb && !coordinates) return [];

  try {
    const VALID_PROPERTY_TYPES = [
      'House', 'ApartmentUnitFlat', 'Townhouse', 'Villa', 'Semi-detached',
      'Terrace', 'Duplex', 'Acreage', 'AcreageSemi-rural', 'Retirement',
      'BlockOfUnits', 'Other'
    ];

    const validatePropertyType = (type) => {
      if (!type) return null
      const normalized = type.trim()
      if (VALID_PROPERTY_TYPES.includes(normalized)) return normalized

      const mapping = {
        'house': 'House', 'apartment': 'ApartmentUnitFlat', 'unit': 'ApartmentUnitFlat',
        'flat': 'ApartmentUnitFlat', 'townhouse': 'Townhouse', 'villa': 'Villa',
        'semidetached': 'Semi-detached', 'semi_detached': 'Semi-detached',
        'terrace': 'Terrace', 'duplex': 'Duplex', 'acreage': 'Acreage',
        'retirement': 'Retirement', 'blockofunits': 'BlockOfUnits', 'other': 'Other'
      }

      return mapping[normalized.toLowerCase().replace(/[^a-z]/g, '')] || null
    };

    let propertyTypes = []
    if (propertyType) {
      const validatedType = validatePropertyType(propertyType)
      if (validatedType) propertyTypes = [validatedType]
    }

    const searchBody = {
      listingType: 'Sale',
      ...(propertyTypes.length > 0 ? { propertyTypes } : {}),
      searchMode: 'exact',
      locations: [
        {
          state: state,
          suburb: suburb,
          postcode: postcode,
          includeSurroundingSuburbs: true
        }
      ],
      // Property feature filters
      ...(beds ? { minBedrooms: Math.max(0, beds - 1), maxBedrooms: beds + 1 } : {}),
      ...(baths ? { minBathrooms: Math.max(0, baths - 1), maxBathrooms: baths + 1 } : {}),
      ...(landSize ? { minLandArea: Math.round(landSize * 0.8), maxLandArea: Math.round(landSize * 1.2) } : {}),

      sort: { sortKey: 'DateListed', direction: 'Descending' },
      pageNumber: 1,
      pageSize: 12,
    }

    const cleanedBody = JSON.parse(JSON.stringify(searchBody, (k, v) => {
      if (v === null || v === undefined) return undefined
      if (Array.isArray(v) && v.length === 0) return undefined
      return v
    }))

    const response = await fetch(`${DOMAIN_API_BASE_URL}/listings/residential/_search`, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
        'X-Api-Key': apiKey,
        'X-Api-Call-Source': 'live-api-browser',
      },
      body: JSON.stringify(cleanedBody)
    })

    if (!response.ok) {
      console.error('Domain for-sale comparables API error:', response.status)
      return []
    }

    const responseText = await response.text()
    if (!responseText || responseText.trim() === '') {
      return []
    }

    const data = JSON.parse(responseText)
    console.log(`Fetched for-sale comparables: ${Array.isArray(data) ? data.length : 'unknown'}`)
    return data || []
  } catch (error) {
    console.error('Error fetching for-sale comparables:', error)
    return []
  }
}


/**
 * Search for properties by address query
 * Uses live Domain suggest API.
 *
 * @param {string} query - Search query
 * @returns {Promise<Array>} Array of matching properties
 */
export const searchPropertiesByQuery = async (query) => {
  const trimmedQuery = query?.trim()

  // Validate query
  if (!trimmedQuery) {
    return []
  }

  const apiKey = process.env.NEXT_PUBLIC_DOMAIN_API_KEY

  if (!apiKey) {
    return []
  }

  try {
    const params = new URLSearchParams({
      terms: trimmedQuery,
      channel: 'All',
    })

    const response = await fetch(
      `${DOMAIN_API_BASE_URL}/properties/_suggest?${params.toString()}`,
      {
        method: 'GET',
        headers: {
          accept: 'application/json',
          'X-Api-Key': apiKey,
          'X-Api-Call-Source': 'live-api-browser',
        },
      })

    if (!response.ok) {
      return []
    }

    const data = await response.json()

    if (!Array.isArray(data)) {
      return []
    }

    // Map Domain response into the shape expected by the UI
    const mappedResults = data.map((item) => {
      const components = item.addressComponents || {}
      const address = item.address || ''
      const shortAddress = address.split(',')[0] || address

      return {
        id: item.id,
        address,
        shortAddress,
        suburb: components.suburb || '',
        state: components.state || '',
        postcode: components.postCode || '',
        relativeScore: item.relativeScore,
      }
    })

    return mappedResults
  } catch (error) {
    console.error('Error calling Domain suggest API:', error)
    return []
  }
}

/**
 * Fetch suburb performance statistics with historical data (5 years)
 */
export const fetchSuburbPerformance = async (state, suburb, postcode) => {
  const apiKey = process.env.NEXT_PUBLIC_DOMAIN_API_KEY

  // Validate required parameters
  if (!apiKey) {
    return null;
  }

  if (!state || !suburb || !postcode) {
    return null;
  }

  // Validate postcode format
  if (!isValidPostcode(postcode)) {
    return null;
  }

  // Validate state abbreviation
  if (!isValidState(state)) {
    return null;
  }

  // Validate suburb name
  if (!isValidSuburb(suburb)) {
    return null;
  }

  try {
    // Fetch 5 years of data (60 months)
    const response = await fetch(
      `${DOMAIN_API_V2_BASE_URL}/suburbPerformanceStatistics/${state}/${suburb}/${postcode}?propertyCategory=House&chronologicalSpan=60&tPeriod=1`,
      {
        method: 'GET',
        headers: {
          accept: 'application/json',
          'X-Api-Key': apiKey,
          'X-Api-Call-Source': 'live-api-browser',
        },
      }
    )

    if (!response.ok) return null

    // Check if response has content before parsing JSON
    const responseText = await response.text()
    if (!responseText || responseText.trim() === '') {
      console.warn('Empty response from suburb performance API')
      return null
    }

    // Try to parse JSON, handle parsing errors
    let data
    try {
      data = JSON.parse(responseText)
    } catch (parseError) {
      console.error('Failed to parse JSON from suburb performance API:', parseError)
      console.error('Response text:', responseText)
      return null
    }

    const series = data?.series?.seriesInfo || []

    // Process historical data for charts
    // API structure: seriesInfo array with { year, month, values }
    const historicalData = series
      .map((stat) => {
        const v = stat?.values || {}
        // Support both flat and nested period structures (different Domain API versions)
        const year = stat.year || stat.period?.year
        const month = stat.month || stat.period?.month

        // Get median price with better fallback logic
        let medianPrice = v.medianSoldPrice
        if (!medianPrice || medianPrice === 0) {
          medianPrice = v.medianSaleListingPrice
        }
        // If still no median, calculate from highest/lowest sold prices
        if ((!medianPrice || medianPrice === 0) && v.lowestSoldPrice && v.highestSoldPrice) {
          medianPrice = Math.round((v.lowestSoldPrice + v.highestSoldPrice) / 2)
        }
        // Last resort: use listing price range
        if ((!medianPrice || medianPrice === 0) && v.lowestSaleListingPrice && v.highestSaleListingPrice) {
          medianPrice = Math.round((v.lowestSaleListingPrice + v.highestSaleListingPrice) / 2)
        }

        // Get median rent (if available)
        let medianRent = v.medianRentListingPrice || v.medianRent || null
        // Calculate median rent from range if available
        if (!medianRent && v.lowestRentListingPrice && v.highestRentListingPrice) {
          medianRent = Math.round((v.lowestRentListingPrice + v.highestRentListingPrice) / 2)
        }

        // Include data even if only one metric is available
        if (medianPrice > 0 || medianRent > 0) {
          return {
            period: year && month
              ? `${year}-${String(month).padStart(2, '0')}`
              : year
                ? `${year}`
                : null,
            year: year,
            month: month,
            medianPrice: medianPrice > 0 ? medianPrice : null,
            medianRent: medianRent > 0 ? medianRent : null,
            growthPercent: v.annualGrowth || null,
          }
        }
        return null
      })
      .filter(Boolean)
      .sort((a, b) => {
        // Sort by year, then month
        if (a.year !== b.year) return a.year - b.year
        return (a.month || 0) - (b.month || 0)
      })

    // Reverse to find the most recent valid data first
    const validStat = [...series].reverse().find(stat => {
      const v = stat?.values
      return v && (v.medianSoldPrice > 0 || v.medianSaleListingPrice > 0 || v.highestSoldPrice > 0)
    })

    const latestStat = validStat || series[series.length - 1] || {}
    const values = latestStat.values || {}

    // Calculate generic auction clearance rate if not provided
    let clearanceRate = values.auctionClearanceRate
    if (!clearanceRate && values.auctionNumberAuctioned > 0) {
      const sold = values.auctionNumberSold || 0
      const total = values.auctionNumberAuctioned
      clearanceRate = Math.round((sold / total) * 100)
    }

    // Median price fallback logic
    let medianPrice = values.medianSoldPrice
    if (!medianPrice) medianPrice = values.medianSaleListingPrice
    if (!medianPrice && values.lowestSoldPrice && values.highestSoldPrice) {
      medianPrice = Math.round((values.lowestSoldPrice + values.highestSoldPrice) / 2)
    }

    // Calculate aggregated statistics across the series
    let totalMedianPrice = 0
    let countMedianPrice = 0
    let totalDaysOnMarket = 0
    let countDaysOnMarket = 0
    let totalNumberSold = 0
    let countNumberSold = 0
    let totalAuctionsAuctioned = 0
    let totalAuctionsSold = 0

    series.forEach(stat => {
      const v = stat.values || {}
      if (v.medianSoldPrice > 0) {
        totalMedianPrice += v.medianSoldPrice
        countMedianPrice++
      }
      if (v.daysOnMarket > 0) {
        totalDaysOnMarket += v.daysOnMarket
        countDaysOnMarket++
      }
      if (v.numberSold > 0) {
        totalNumberSold += v.numberSold
        countNumberSold++
      }
      if (v.auctionNumberAuctioned > 0) {
        totalAuctionsAuctioned += v.auctionNumberAuctioned
        totalAuctionsSold += (v.auctionNumberSold || 0)
      }
    })

    const avgMedianSoldPrice = countMedianPrice > 0 ? Math.round(totalMedianPrice / countMedianPrice) : 0
    const avgDaysOnMarket = countDaysOnMarket > 0 ? totalDaysOnMarket / countDaysOnMarket : 0
    const avgNumberSold = countNumberSold > 0 ? Math.round(totalNumberSold / countNumberSold) : 0
    const overallClearanceRate = totalAuctionsAuctioned > 0 ? (totalAuctionsSold / totalAuctionsAuctioned) * 100 : 0

    // Determine period range
    let periodRange = ''
    if (historicalData.length > 0) {
      const first = historicalData[0]
      const last = historicalData[historicalData.length - 1]
      periodRange = `${String(first.month).padStart(2, '0')}-${first.year} to ${String(last.month).padStart(2, '0')}-${last.year}`
    }

    return {
      ...data,
      medianPrice: medianPrice || 0,
      growthPercent: values.annualGrowth || 0,
      demand: 'Medium',
      population: 0,
      averageDaysOnMarket: values.daysOnMarket || 0,
      auctionClearanceRate: clearanceRate || 0,
      historicalData, // Add historical data for charts
      // Added aggregated statistics
      avgMedianSoldPrice,
      avgDaysOnMarket,
      avgNumberSold,
      overallClearanceRate,
      periodRange,
      totalAuctionsAuctioned,
      totalAuctionsSold
    }

  } catch (error) {
    console.error('Error fetching suburb performance:', error)
    return null
  }
}

/**
 * Fetch rental estimate for a property
 */
export const fetchRentalEstimate = async (id) => {
  const apiKey = process.env.NEXT_PUBLIC_DOMAIN_API_KEY

  // Validate property ID to prevent 404 errors
  if (!id) {
    return null;
  }

  if (!isValidPropertyId(id)) {
    return null;
  }

  if (isMockPropertyId(id)) {
    return null;
  }

  if (!apiKey) {
    return null;
  }

  try {
    const response = await fetch(`${DOMAIN_API_BASE_URL}/properties/${id}/rentalEstimate`, {
      method: 'GET',
      headers: {
        accept: 'application/json',
        'X-Api-Key': apiKey,
        'X-Api-Call-Source': 'live-api-browser',
      },
    })

    if (!response.ok) return null

    const responseText = await response.text();
    if (!responseText || responseText.trim() === '') {
      console.warn('Empty response from rental estimate API');
      return null;
    }

    try {
      return JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse JSON from rental estimate API:', parseError);
      console.error('Response text:', responseText);
      return null;
    }
  } catch (error) {
    console.error('Error fetching rental estimate:', error)
    return null
  }
}

/**
 * Map Domain property details response into the app's internal property shape
 */
const mapDomainPropertyToAppModel = (domainProperty, suburbInsights = null, apiPriceEstimate = null, schools = [], comparables = [], forSaleComparables = [], apiRentalEstimate = null) => {
  if (!domainProperty) return null

  const {
    id,
    address,
    streetAddress,
    suburb,
    state,
    postcode,
    bedrooms,
    bathrooms,
    carSpaces,
    areaSize,
    internalArea,
    propertyType,
    propertyCategory,
    addressCoordinate,
    history,
    photos,
  } = domainProperty

  // Derive price estimate:
  // 1. Try to find the most recent 'sold' or 'advertised' price from history
  let basePrice = null
  let mostRecentSaleDate = null
  const TWO_YEARS_MS = 2 * 365.25 * 24 * 60 * 60 * 1000
  const now = new Date()

  if (history?.sales && Array.isArray(history.sales)) {
    // Sort by date descending to get most recent first
    const sortedSales = [...history.sales].sort((a, b) => {
      const dateA = new Date(a.saleDate || a.date || 0)
      const dateB = new Date(b.saleDate || b.date || 0)
      return dateB - dateA
    })

    // Try to find a sale within the last 4 years
    for (const sale of sortedSales) {
      const saleDate = new Date(sale.saleDate || sale.date)
      const ageMs = now - saleDate

      // Check price at top level first (most common), then nested fields
      const price = sale.price || sale.soldPrice || sale.advertisedPrice
        || sale.last?.advertisedPrice || sale.last?.price
        || sale.first?.advertisedPrice || sale.first?.price

      // Only use sales within 4 years to prevent very old sales from skewing estimates
      const FOUR_YEARS_MS = 4 * 365.25 * 24 * 60 * 60 * 1000
      if (typeof price === 'number' && price > 0 && ageMs <= FOUR_YEARS_MS) {
        basePrice = price
        mostRecentSaleDate = saleDate
        const ageYears = (ageMs / (365.25 * 24 * 60 * 60 * 1000)).toFixed(1)
        console.log(`✅ Using most recent sale price: $${price.toLocaleString('en-AU')} from ${saleDate.toLocaleDateString()} (${ageYears} years ago)`)
        break
      } else if (typeof price === 'number' && price > 0 && ageMs > FOUR_YEARS_MS) {
        console.log(`⚠️ Found sale price: $${price.toLocaleString('en-AU')} from ${saleDate.toLocaleDateString()}, but it's too old (${(ageMs / (365.25 * 24 * 60 * 60 * 1000)).toFixed(1)} years) - skipping`)
      }
    }

    // If no valid sale price found
    if (!basePrice && sortedSales.length > 0) {
      console.warn(`⚠️ Sales data exists but no valid price found in any sale record.`)
    }
  }

  let priceEstimate = null
  let apiFailedError = false
  let apiFailureReason = null

  // ════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
  // PRIORITY 1: PRIMARY DATA SOURCE — Domain Price Estimate API
  // ════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
  // Use the official Domain API price estimate as the primary source when available.
  // This provides the most accurate and up-to-date valuations.
  // ════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════

  // Priority 1: Use direct API Price Estimate if available
  if (apiPriceEstimate) {
    console.log('✅ Using Domain API price estimate:', apiPriceEstimate);

    // Map API response to expected format based on the exact response structure provided
    const apiLow = apiPriceEstimate.lowerPrice ||
      apiPriceEstimate.history?.[0]?.lowerPrice || null;
    const apiHigh = apiPriceEstimate.upperPrice ||
      apiPriceEstimate.history?.[0]?.upperPrice || null;
    const apiMid = apiPriceEstimate.midPrice ||
      apiPriceEstimate.history?.[0]?.midPrice || null;
    const apiConfidence = apiPriceEstimate.priceConfidence ||
      apiPriceEstimate.history?.[0]?.confidence || 'Medium';

    if ((apiLow && apiHigh) || apiMid) {
      // If we only have a mid value, calculate low/high with a reasonable spread (typically ±10%)
      const finalLow = apiLow || (apiMid ? Math.round(apiMid * 0.9) : null);
      const finalHigh = apiHigh || (apiMid ? Math.round(apiMid * 1.1) : null);
      const finalMid = apiMid || (finalLow && finalHigh ? Math.round((finalLow + finalHigh) / 2) : null);

      if (finalLow && finalHigh && finalMid) {
        priceEstimate = {
          low: finalLow,
          mid: finalMid,
          high: finalHigh,
          priceConfidence: apiConfidence
        };
        apiFailedError = false;
      }
    }
  }
  // DISABLED FALLBACK: Only use Domain API price estimate - no sales history fallback
  // if (!priceEstimate && basePrice) {
  //   // Use sales history only if within 1 year for high confidence
  //   if (mostRecentSaleDate) {
  //     const ageMs = now - mostRecentSaleDate
  //     const ageMonths = ageMs / (1000 * 60 * 60 * 24 * 30.44)
  //     if (ageMonths <= 12) {
  //       const priceConfidence = 'High'
  //       const variance = 0.07
  //       const mid = basePrice
  //       const low = Math.round(mid * (1 - variance))
  //       const high = Math.round(mid * (1 + variance))
  //       priceEstimate = { low, mid, high, priceConfidence }
  //     }
  //   }
  // }

  // DISABLED FALLBACK: No suburb median fallback - only show API results
  /*
  } else if (!priceEstimate && suburbInsights?.medianPrice && suburbInsights.medianPrice > 0) {
    // 3. Fallback to Suburb Median if NO sales history exists at all
    const mid = suburbInsights.medianPrice
    const variance = 0.15 // Low confidence variance for generic data
    const low = Math.round(mid * (1 - variance))
    const high = Math.round(mid * (1 + variance))
    const priceConfidence = 'Low'

    priceEstimate = { low, mid, high, priceConfidence }
    apiFailedError = false
  }
  */

  if (!priceEstimate) {
    // No API result - show $0 instead of error
    priceEstimate = { low: 0, mid: 0, high: 0, priceConfidence: 'None' }
    apiFailedError = false
    apiFailureReason = null
  }

  // ════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════

  // Rental estimate
  let rentalEstimate = null

  // Priority 1: Use direct API Rental Estimate if available
  if (apiRentalEstimate && apiRentalEstimate.weeklyRentEstimate > 0) {
    const weeklyMid = apiRentalEstimate.weeklyRentEstimate
    const weeklyLow = Math.round(weeklyMid * 0.9) // estimate range
    const weeklyHigh = Math.round(weeklyMid * 1.1) // estimate range

    rentalEstimate = {
      ...apiRentalEstimate,
      weekly: {
        low: weeklyLow,
        mid: weeklyMid,
        high: weeklyHigh
      },
      yield: apiRentalEstimate.percentYieldRentEstimate?.toFixed(2) || '0.00'
    }
  }

  // Priority 2: Fallback calculation
  if (!rentalEstimate && priceEstimate?.mid) {
    const assumedYieldPercent = 3.5
    const yearlyRentMid = priceEstimate.mid * (assumedYieldPercent / 100)
    const weeklyMid = yearlyRentMid / 52
    const weeklyLow = Math.round(weeklyMid * 0.9)
    const weeklyHigh = Math.round(weeklyMid * 1.1)

    rentalEstimate = {
      weekly: {
        low: weeklyLow,
        mid: Math.round(weeklyMid),
        high: weeklyHigh,
      },
      yield: assumedYieldPercent.toFixed(1),
    }
  }

  // Build sales history with enhanced details
  const salesHistoryRaw =
    history?.sales?.map((sale) => {
      // Price can be at top level (sale.price) or in last/first segments
      const salePrice = sale.price || sale.soldPrice || sale.advertisedPrice
        || sale.last?.advertisedPrice || sale.last?.price
        || sale.first?.advertisedPrice || sale.first?.price

      // Date can be at top level (sale.date) or in segments
      const saleDate = sale.date || sale.soldDate
        || sale.last?.advertisedDate || sale.last?.date
        || sale.first?.advertisedDate || sale.first?.date

      // Type can be at top level or in segments
      const saleType = sale.type || sale.last?.type || sale.first?.type || 'Sale'

      // Extract additional details if available
      const daysOnMarket = sale.daysOnMarket || sale.last?.daysOnMarket || null
      const agency = sale.agency || sale.last?.agency || null
      const agent = sale.agent || sale.last?.agent || null
      const listingId = sale.listingId || sale.advertId || null

      return {
        ...sale,
        salePrice: salePrice || null,
        saleDate: saleDate || null,
        saleType: saleType,
        daysOnMarket: daysOnMarket,
        agency: agency,
        agent: agent,
        listingId: listingId,
      }
    }).filter(s => s.salePrice && s.saleDate) || []

  // Sort by date descending (most recent first)
  const salesHistory = salesHistoryRaw
    .sort((a, b) => {
      const dateA = new Date(a.saleDate)
      const dateB = new Date(b.saleDate)
      return dateB - dateA
    })
    .map((sale, index, array) => {
      // Calculate price change from previous sale (chronologically earlier, which is next in sorted array)
      let priceChange = null
      let priceChangePercent = null
      if (index < array.length - 1) {
        const previousSale = array[index + 1] // Previous sale chronologically (older)
        const previousPrice = previousSale.salePrice

        if (previousPrice && sale.salePrice) {
          priceChange = sale.salePrice - previousPrice
          priceChangePercent = ((priceChange / previousPrice) * 100).toFixed(1)
        }
      }

      return {
        ...sale,
        priceChange: priceChange,
        priceChangePercent: priceChangePercent,
      }
    })

  // Basic photo gallery from Domain photos
  const propertyImages =
    photos?.filter((p) => p.imageType === 'Property').map((p) => ({
      id: `${p.advertId}-${p.rank}`,
      url: p.fullUrl,
      alt: `${address || streetAddress || 'Property image'}`,
    })) || []

  return {
    ...domainProperty,
    id,
    address,
    shortAddress: streetAddress || (address ? address.split(',')[0] : ''),
    beds: bedrooms ?? 0,
    baths: bathrooms ?? 0,
    parking: carSpaces ?? 0,
    cars: carSpaces ?? 0,
    landSize: areaSize ?? 0,
    buildingSize: internalArea ?? 0,
    propertyType: propertyType || propertyCategory || 'House',
    priceEstimate: priceEstimate ? { ...priceEstimate, apiFailedError, apiFailureReason } : null,
    apiFailedError,  // ← Expose to frontend for retry modal logic
    apiFailureReason,  // ← Expose reason for debugging
    rentalEstimate,
    suburb,
    state,
    postcode,
    coordinates: addressCoordinate
      ? { lat: addressCoordinate.lat, lng: addressCoordinate.lon }
      : null,
    comparables: (() => {
      const mapItem = (c, status) => {
        const listing = c.listing || c

        // Extract price - try multiple sources
        const priceValue = status === 'Sold'
          ? (listing.soldData?.soldPrice || c.soldData?.soldPrice || listing.saleDetails?.soldPrice || c.saleDetails?.soldPrice || listing.priceDetails?.price || c.priceDetails?.price || 0)
          : (listing.priceDetails?.price || c.priceDetails?.price || listing.price || c.price || 0)

        // Clean price if it's a string
        let cleanPrice = 0
        if (typeof priceValue === 'number') {
          cleanPrice = priceValue
        } else if (typeof priceValue === 'string') {
          cleanPrice = parseInt(priceValue.replace(/[^0-9]/g, '')) || 0
        }

        // Extract address
        const addressText = listing.propertyDetails?.displayableAddress ||
          c.propertyDetails?.displayableAddress ||
          listing.addressParts?.displayAddress ||
          c.addressParts?.displayAddress ||
          listing.address ||
          c.address ||
          'Address hidden'

        // Extract sale/listing date
        const dateValue = status === 'Sold'
          ? (listing.soldData?.soldDate || c.soldData?.soldDate || listing.saleDetails?.soldDate || c.saleDetails?.soldDate || listing.dateSold || c.dateSold)
          : (listing.dateListed || c.dateListed || listing.saleDate || c.saleDate)

        // Extract property details
        const beds = listing.propertyDetails?.bedrooms || c.propertyDetails?.bedrooms || 0
        const baths = listing.propertyDetails?.bathrooms || c.propertyDetails?.bathrooms || 0
        const parking = listing.propertyDetails?.carspaces || c.propertyDetails?.carspaces || 0
        const landSize = listing.propertyDetails?.landArea || c.propertyDetails?.landArea || 0

        // Extract images
        let images = []
        if (listing.media && Array.isArray(listing.media)) {
          images = listing.media.filter(m => m.category === 'Image' && m.url).map(m => ({ url: m.url, alt: 'Property image' }))
        } else if (c.media && Array.isArray(c.media)) {
          images = c.media.filter(m => m.category === 'Image' && m.url).map(m => ({ url: m.url, alt: 'Property image' }))
        }

        if (images.length === 0) {
          const imgs = listing.images || c.images || listing.propertyPhotos || c.propertyPhotos || []
          images = imgs.map(img => ({ url: img.url || img.medium || img.small || img, alt: 'Property image' }))
        }

        return {
          id: listing.id || c.id || c.advertId,
          address: addressText,
          salePrice: cleanPrice, // We use salePrice as generic price field
          price: cleanPrice,
          saleDate: dateValue,
          date: dateValue,
          beds: beds,
          baths: baths,
          parking: parking,
          cars: parking,
          landSize: landSize,
          images: images,
          status: status // 'Sold' or 'For Sale'
        }
      }

      const soldItems = comparables.map(c => mapItem(c, 'Sold')).filter(item => item.price > 0)
      const forSaleItems = forSaleComparables.map(c => mapItem(c, 'For Sale')).filter(item => item.price > 0)

      return [...soldItems, ...forSaleItems]
    })(),
    suburbInsights,
    schools: schools.map(s => {
      // The API returns the structure { distance: number, school: { name, schoolType, schoolSector, ... } }
      const schoolData = s.school || s
      return {
        ...s,
        name: schoolData.name,
        type: schoolData.schoolType,
        sector: schoolData.schoolSector, // Extract school sector (Government, Independent, etc.)
        yearRange: schoolData.profile?.yearRange || 'K-12',
        distance: s.distance ? (s.distance / 1000).toFixed(2) : '0', // API returns meters
        // API doesn't provide 1-5 rating, but provides ICSEA score.
        rating: schoolData.profile?.icsea || null,
        id: s.id || schoolData.domainId || `${schoolData.name}-${s.distance}`
      }
    }),
    salesHistory,
    images: propertyImages,
  }
}

/**
 * Get full property details by ID
 * Always uses live Domain property API.
 *
 * @param {string} id - Property ID
 * @returns {Promise<Object>} Property object with all details
 */
export const getPropertyDetails = async (id) => {
  const apiKey = process.env.NEXT_PUBLIC_DOMAIN_API_KEY

  // Validate property ID to prevent 404 errors
  if (!id) {
    throw createApiError(400, 'Property ID is required');
  }

  if (!isValidPropertyId(id)) {
    throw createApiError(400, `Invalid property ID format: ${id}`);
  }

  if (isMockPropertyId(id)) {
    throw createApiError(404, `Property not found: ${id}`);
  }

  if (!apiKey) {
    throw new Error("API Key configuration missing")
  }

  try {
    const response = await fetch(`${DOMAIN_API_BASE_URL}/properties/${id}`, {
      method: 'GET',
      headers: {
        accept: 'application/json',
        'X-Api-Key': apiKey,
        'X-Api-Call-Source': 'live-api-browser',
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        throw createApiError(404, `Property not found: ${id}`);
      }
      throw createApiError(response.status, `Domain API error: ${response.status}`);
    }
    
    const responseText = await response.text()
    if (!responseText || responseText.trim() === '') {
      throw createApiError(500, 'Empty response from Domain API')
    }

    let domainProperty
    try {
      domainProperty = JSON.parse(responseText)
    } catch (parseError) {
      console.error('Failed to parse JSON from Domain API:', parseError)
      console.error('Response text:', responseText)
      throw createApiError(500, 'Invalid JSON response from Domain API')
    }

    // Fetch insights, price estimate, schools, and comparables concurrently
    const promises = []

    // 1. Suburb Performance
    if (domainProperty.suburb && domainProperty.state && domainProperty.postcode) {
      promises.push(
        fetchSuburbPerformance(domainProperty.state, domainProperty.suburb, domainProperty.postcode)
          .then(res => ({ type: 'suburbInsights', data: res }))
      )
    }

    // 2. Price Estimate
    promises.push(
      fetchPriceEstimate(id)
        .then(res => ({ type: 'priceEstimate', data: res }))
    )

    // 3. Schools (if coords available)
    if (domainProperty.addressCoordinate?.lat && domainProperty.addressCoordinate?.lon) {
      promises.push(
        fetchSchools(domainProperty.addressCoordinate.lat, domainProperty.addressCoordinate.lon)
          .then(res => ({ type: 'schools', data: res }))
      )
    }

    // 4. Sold Comparables
    const locationDataAvailable = (domainProperty.suburb && domainProperty.postcode) || domainProperty.addressCoordinate;
    if (locationDataAvailable) {
      promises.push(
        fetchComparables(
          domainProperty.state,
          domainProperty.suburb,
          domainProperty.postcode,
          domainProperty.propertyCategory,
          domainProperty.bedrooms,
          domainProperty.bathrooms,
          domainProperty.areaSize || domainProperty.internalArea,
          domainProperty.addressCoordinate ? {
            lat: domainProperty.addressCoordinate.lat,
            lng: domainProperty.addressCoordinate.lon
          } : null
        ).then(res => ({ type: 'comparables', data: res }))
      )

      // 4b. For-Sale Comparables
      promises.push(
        fetchForSaleComparables(
          domainProperty.state,
          domainProperty.suburb,
          domainProperty.postcode,
          domainProperty.propertyCategory,
          domainProperty.bedrooms,
          domainProperty.bathrooms,
          domainProperty.areaSize || domainProperty.internalArea,
          domainProperty.addressCoordinate ? {
            lat: domainProperty.addressCoordinate.lat,
            lng: domainProperty.addressCoordinate.lon
          } : null
        ).then(res => ({ type: 'forSaleComparables', data: res }))
      )
    }


    // 5. Rental Estimate
    promises.push(
      fetchRentalEstimate(id)
        .then(res => ({ type: 'rentalEstimate', data: res }))
    )

    const results = await Promise.allSettled(promises)

    let suburbInsights = null
    let apiPriceEstimate = null
    let schools = []
    let comparables = []
    let forSaleComparables = []
    let apiRentalEstimate = null

    results.forEach(result => {
      if (result.status === 'fulfilled') {
        const { type, data } = result.value
        if (type === 'suburbInsights') suburbInsights = data
        if (type === 'priceEstimate') apiPriceEstimate = data
        if (type === 'schools') schools = data
        if (type === 'comparables') comparables = data
        if (type === 'forSaleComparables') forSaleComparables = data
        if (type === 'rentalEstimate') apiRentalEstimate = data
      }
    })

    const mapped = mapDomainPropertyToAppModel(domainProperty, suburbInsights, apiPriceEstimate, schools, comparables, forSaleComparables, apiRentalEstimate)
    return mapped

  } catch (error) {
    console.error('Error calling Domain property detail API:', error)
    throw error
  }
}

/**
 * Get property by address
 * Since we don't have a direct "get by address" API that returns full details,
 * we will search for it first, then get details by ID.
 * @param {string} address - Property address
 * @returns {Promise<Object>} Property object
 */
export const getPropertyByAddressQuery = async (address) => {
  const results = await searchPropertiesByQuery(address)
  if (results && results.length > 0) {
    return getPropertyDetails(results[0].id)
  }
  throw new Error('Property not found')
}

/**
 * Submit lead form and unlock content
 * @param {Object} formData
 * @param {Object} property
 * @returns {Promise<Object>} Success response
 */
export const submitLeadForm = async (formData, property = null) => {
  // If property is provided, send the report
  if (property) {
    return await submitLeadFormAndSendReport(formData, property)
  }

  return {
    success: true,
    message: 'Report will be sent to your email shortly',
    reportId: `RPT-${Date.now()}`,
  }
}