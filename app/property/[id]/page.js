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
    Share2,
    ArrowRight,
    Maximize2,
    FileText
} from 'lucide-react'

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
    const [isSchoolsModalOpen, setIsSchoolsModalOpen] = useState(false)

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

    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)
    const [userEmail, setUserEmail] = useState('')

    // Handle form submission
    const handleFormSubmit = async (formData) => {
        setIsSubmitting(true)
        try {
            await submitLeadForm(formData, property)
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
                            {property.suburbInsights && (
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
                            )}

                            {/* Comparable Sales */}
                            {property.comparables && property.comparables.length > 0 && (
                                <ScrollReveal delay={0.3}>
                                    <div className="mb-12">
                                        <h2 className="text-2xl md:text-3xl font-heading font-bold text-[#163331] mb-4 flex items-center gap-3">
                                            <Ruler className="w-6 h-6 md:w-8 md:h-8 text-primary-500" strokeWidth={1.5} />
                                            Comparable Sales
                                        </h2>
                                        <p className="text-gray-600 mb-6 max-w-3xl">
                                            Similar properties in the area
                                        </p>
                                        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                                            <div className="divide-y divide-gray-200">
                                                {property.comparables.map((sale, index) => (
                                                    <div
                                                        key={index}
                                                        className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
                                                    >
                                                        <div className="w-20 h-20 rounded-lg flex-shrink-0 overflow-hidden bg-gray-200 relative">
                                                            {sale.images && sale.images.length > 0 ? (
                                                                <img
                                                                    src={sale.images[0].url}
                                                                    alt={sale.address}
                                                                    className="w-full h-full object-cover"
                                                                    onError={(e) => {
                                                                        e.target.onerror = null;
                                                                        e.target.style.display = 'none';
                                                                        e.target.nextSibling.style.display = 'flex';
                                                                    }}
                                                                />
                                                            ) : null}
                                                            {/* Fallback in case image is missing or fails to load */}
                                                            <div className="w-full h-full flex items-center justify-center bg-gray-100" style={{ display: sale.images && sale.images.length > 0 ? 'none' : 'flex' }}>
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
                                                                {sale.landSize > 0 && (
                                                                    <span className="ml-auto flex items-center gap-1">
                                                                        <Maximize className="w-3.5 h-3.5" />
                                                                        {formatLandSize(sale.landSize)}
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

                            {/* Nearby Schools */}

                            {/* Display all nearby schools */}
                            {/* {property.schools && property.schools.length > 0 && (
                                <ScrollReveal delay={0.5}>
                                    <div className="mb-12">
                                        <h2 className="text-2xl md:text-3xl font-heading font-bold text-[#163331] mb-6 flex items-center gap-3">
                                            <School className="w-6 h-6 md:w-8 md:h-8 text-primary-500" strokeWidth={1.5} />
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
                                                    <div className="text-xs text-gray-600 mb-2 flex items-center gap-1">
                                                        <MapPin className="w-3 h-3" />
                                                        {school.distance} km away
                                                    </div>
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
                            )} */}

                            {/* Only 3 nearby schools are displayed */}
                            {property.schools && property.schools.length > 0 && (
                                <ScrollReveal delay={0.5}>
                                    <div className="mb-12">
                                        <div className="flex items-center justify-between mb-6">
                                            <h2 className="text-2xl md:text-3xl font-heading font-bold text-[#163331] flex items-center gap-3">
                                                <School className="w-6 h-6 md:w-8 md:h-8 text-primary-500" strokeWidth={1.5} />
                                                Nearby Schools
                                            </h2>
                                            {property.schools.length > 3 && (
                                                <button
                                                    onClick={() => setIsSchoolsModalOpen(true)}
                                                    className="text-primary-600 hover:text-primary-700 font-semibold text-sm flex items-center gap-1 transition-colors group"
                                                >
                                                    View all schools
                                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                                                </button>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {[...property.schools]
                                                .sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance))
                                                .slice(0, 3)
                                                .map((school, index) => (
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
                                                        <div className="text-xs text-gray-600 mb-0 flex items-center gap-1">
                                                            <MapPin className="w-3 h-3" />
                                                            {school.distance} km away
                                                        </div>
                                                        {school.rating && school.rating <= 10 && (
                                                            <div className="mt-3 text-center px-2 py-1 bg-gradient-to-br from-[#E9F2EE] to-[#d4e8e0] rounded-lg inline-block">
                                                                <div className="text-md font-bold text-[#163331]">{school.rating}</div>
                                                                <div className="text-xs text-[#163331] font-medium">Rating</div>
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
                                        <h2 className="text-2xl md:text-3xl font-heading font-bold text-[#163331] mb-4 flex items-center gap-3">
                                            <Clock className="w-6 h-6 md:w-8 md:h-8 text-primary-500" strokeWidth={1.5} />
                                            Past Sales History
                                        </h2>
                                        <p className="text-gray-600 mb-6 max-w-3xl">
                                            Historical sales data for this property
                                        </p>
                                        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
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
                                                                    <ImageOff className="w-6 h-6 text-gray-300" />
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
                        className="absolute inset-0 bg-black/95 backdrop-blur-sm"
                        onClick={() => setIsImageGalleryOpen(false)}
                    />

                    <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col items-center">
                        <button
                            onClick={() => setIsImageGalleryOpen(false)}
                            className="absolute top-4 right-4 p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-colors z-30"
                            aria-label="Close gallery"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <div className="relative w-full max-h-[80vh] flex items-center justify-center mb-6">
                            {propertyImages.length > 1 && (
                                <button
                                    onClick={() => setCurrentImageIndex((prev) => prev === 0 ? propertyImages.length - 1 : prev - 1)}
                                    className="absolute left-2 md:left-4 p-3 bg-black/50 hover:bg-black/70 backdrop-blur-md rounded-full text-white transition-colors z-20"
                                    aria-label="Previous image"
                                >
                                    <ChevronLeft className="w-6 h-6" />
                                </button>
                            )}

                            <img
                                src={propertyImages[currentImageIndex]?.url}
                                alt={propertyImages[currentImageIndex]?.alt || property.address}
                                className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
                            />

                            {propertyImages.length > 1 && (
                                <button
                                    onClick={() => setCurrentImageIndex((prev) => prev === propertyImages.length - 1 ? 0 : prev + 1)}
                                    className="absolute right-2 md:right-4 p-3 bg-black/50 hover:bg-black/70 backdrop-blur-md rounded-full text-white transition-colors z-20"
                                    aria-label="Next image"
                                >
                                    <ChevronRight className="w-6 h-6" />
                                </button>
                            )}
                        </div>

                        {propertyImages.length > 1 && (
                            <div className="w-full overflow-x-auto pb-4 scrollbar-hide">
                                <div className="flex gap-2 justify-center px-4">
                                    {propertyImages.map((image, index) => (
                                        <button
                                            key={image.id}
                                            onClick={() => setCurrentImageIndex(index)}
                                            className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-all ${currentImageIndex === index
                                                ? 'border-[#48D98E] opacity-100 scale-105'
                                                : 'border-transparent opacity-60 hover:opacity-100'
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
                            </div>
                        )}

                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-black/60 backdrop-blur-md rounded-full text-white text-sm font-medium">
                            {currentImageIndex + 1} / {propertyImages.length}
                        </div>
                    </div>
                </div>,
                document.body
            )}
            {/* Schools Modal */}
            {isSchoolsModalOpen && property.schools && typeof window !== 'undefined' && createPortal(
                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setIsSchoolsModalOpen(false)}
                    />
                    <div className="relative z-10 w-full max-w-4xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <div>
                                <h3 className="text-2xl font-heading font-bold text-[#163331] flex items-center gap-2">
                                    <School className="w-6 h-6 text-primary-500" />
                                    All Nearby Schools
                                </h3>
                                <p className="text-sm text-gray-600 mt-1">Sorted by closest to {property.address}</p>
                            </div>
                            <button
                                onClick={() => setIsSchoolsModalOpen(false)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X className="w-6 h-6 text-gray-400" />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[...property.schools]
                                    .sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance))
                                    .map((school, index) => (
                                        <div
                                            key={index}
                                            className="p-4 bg-gray-50 border border-gray-200 rounded-xl hover:border-primary-200 hover:shadow-md transition-all group"
                                        >
                                            <div className="font-semibold text-[#163331] mb-2 group-hover:text-primary-600 transition-colors">
                                                {school.name}
                                            </div>
                                            <div className="flex flex-wrap items-center gap-2 mb-3">
                                                <span className="px-2.5 py-0.5 bg-[#E9F2EE] text-[#163331] rounded-full text-xs font-semibold">
                                                    {school.type}
                                                </span>
                                                <span className="text-xs text-gray-600 font-medium">{school.yearRange}</span>
                                            </div>

                                            <div className="flex items-center justify-between mt-auto">
                                                <div className="text-xs text-gray-600 flex items-center gap-1.5">
                                                    <MapPin className="w-3.5 h-3.5 text-primary-500" />
                                                    {school.distance} km away
                                                </div>
                                                {school.rating && school.rating <= 10 && (
                                                    <div className="px-3 py-1 bg-gradient-to-br from-[#E9F2EE] to-[#d4e8e0] rounded-lg text-right">
                                                        <span className="text-md font-bold text-[#163331]">{school.rating}</span>
                                                        <span className="text-[10px] text-[#163331] font-medium block leading-none">Rating</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end">
                            <button
                                onClick={() => setIsSchoolsModalOpen(false)}
                                className="px-6 py-2 bg-[#163331] text-white font-semibold rounded-lg hover:bg-[#0d1f1e] transition-colors shadow-lg"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Success Modal */}
            <SuccessModal
                isOpen={isSuccessModalOpen}
                onClose={() => setIsSuccessModalOpen(false)}
                email={userEmail}
            />
        </>
    )
}