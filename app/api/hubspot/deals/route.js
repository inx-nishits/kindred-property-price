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
import { hasValidShareToken, hasKindredGroupAccess } from '@/utils/tokenUtils'
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
    const [shareUrl, setShareUrl] = useState('')
    const [isGeneratingShareUrl, setIsGeneratingShareUrl] = useState(false)

    const propertyImages = property?.images || []
    console.log(property);

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

    // Check if property is unlocked (local storage or share token)
    useEffect(() => {
        if (typeof window !== 'undefined' && params.id) {
            const localStorageUnlocked = localStorage.getItem(`property_${params.id}_unlocked`) === 'true'
            const shareTokenUnlocked = hasValidShareToken(params.id)
            const kindredGroupAccess = hasKindredGroupAccess()
            
            setIsUnlocked(localStorageUnlocked || shareTokenUnlocked || kindredGroupAccess)
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
                
                // Generate shareable link for the user
                generateShareableLink()
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

    // Generate shareable link
    const generateShareableLink = async () => {
        setIsGeneratingShareUrl(true)
        try {
            const response = await fetch('/api/share/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ propertyId: params.id }),
            })

            const result = await response.json()
            if (result.success) {
                setShareUrl(result.shareUrl)
                // Copy to clipboard
                await navigator.clipboard.writeText(result.shareUrl)
                alert('Shareable link copied to clipboard!')
            } else {
                alert('Failed to generate shareable link. Please try again.')
            }
        } catch (error) {
            console.error('Error generating shareable link:', error)
            alert('Failed to generate shareable link. Please try again.')
        } finally {
            setIsGeneratingShareUrl(false)
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
                                        <div>
                                            <button
                                                onClick={() => setIsModalOpen(true)}
                                                className="btn bg-white text-[#163331] hover:bg-gray-100 px-8 py-4 text-lg font-semibold shadow-xl whitespace-nowrap"
                                            >
                                                Get Full Report
                                            </button>
                                            
                                            {/* Kindred Group Access Button */}
                                            <div className="mt-4 text-sm text-white/90">
                                                <a 
                                                    href={`/property/${params.id}?kindred_group_token=access`}
                                                    className="underline hover:text-white"
                                                >
                                                    Kindred Group Access
                                                </a>
                                            </div>
                                        </div>
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
                                                        <div className="space-y-4">
                                                            <a
                                                                href="https://www.kindred.com.au/sales-property-appraisal"
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-block w-full text-center bg-[#48D98E] text-[#163331] font-semibold py-3 px-6 rounded-lg hover:bg-[#3bc57d] transition-colors duration-200 shadow-lg"
                                                            >
                                                                Book your appraisal today
                                                            </a>
                                                            
                                                            {/* Share Button */}
                                                            <button
                                                                onClick={generateShareableLink}
                                                                disabled={isGeneratingShareUrl}
                                                                className="inline-block w-full text-center bg-white text-[#163331] font-semibold py-3 px-6 rounded-lg hover:bg-gray-100 transition-colors duration-200 shadow-lg"
                                                            >
                                                                {isGeneratingShareUrl ? 'Generating...' : 'Share Property'}
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <p className="text-xs text-white/70 leading-relaxed pt-2">
                                                        {/* This estimate may not include recent renovations or improvements.
                                                        For a personal appraisal, please contact us. */}
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="space-y-6">
                                                    <div>
                                                        <h2 className="text-2xl md:text-3xl font-heading font-semibold text-white/95 mb-4">
                                                            Estimated Value
                                                        </h2>
                                                        <p className="text-white/80 mb-6">
                                                            Unable to generate an estimate for this property.
                                                        </p>
                                                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/15 backdrop-blur-sm rounded-full">
                                                            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                                                            <span className="text-sm font-medium text-white/90">
                                                                Insufficient data
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
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Property Image */}
                                    <div className="relative">
                                        {propertyImages.length > 0 ? (
                                            <div 
                                                className="aspect-[4/3] rounded-xl overflow-hidden shadow-2xl cursor-pointer"
                                                onClick={() => setIsImageGalleryOpen(true)}
                                            >
                                                <img
                                                    src={propertyImages[0]}
                                                    alt={`${property.address} - Main image`}
                                                    className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                                                    loading="eager"
                                                />
                                            </div>
                                        ) : (
                                            <div className="aspect-[4/3] rounded-xl bg-gray-100 flex items-center justify-center shadow-2xl">
                                                <ImageOff className="w-16 h-16 text-gray-400" />
                                            </div>
                                        )}

                                        {propertyImages.length > 1 && (
                                            <div className="absolute bottom-4 right-4 bg-black/70 text-white text-sm px-3 py-1.5 rounded-full backdrop-blur-sm">
                                                {propertyImages.length} photos
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </ScrollReveal>

                        {/* Add the rest of the property page content here */}
                    </div>
                </div>
            </div>

            {/* Lead Capture Modal */}
            {isModalOpen && createPortal(
                <LeadCaptureModal
                    property={property}
                    onSubmit={handleFormSubmit}
                    onClose={() => setIsModalOpen(false)}
                    isSubmitting={isSubmitting}
                    error={formError}
                />,
                document.body
            )}

            {/* Success Modal */}
            {isSuccessModalOpen && createPortal(
                <SuccessModal
                    email={userEmail}
                    propertyAddress={property.address}
                    onClose={() => setIsSuccessModalOpen(false)}
                />,
                document.body
            )}
        </>
    )
}
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
import { hasValidShareToken, hasKindredGroupAccess } from '@/utils/tokenUtils'
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
    const [shareUrl, setShareUrl] = useState('')
    const [isGeneratingShareUrl, setIsGeneratingShareUrl] = useState(false)

    const propertyImages = property?.images || []
    console.log(property);

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

    // Check if property is unlocked (local storage or share token)
    useEffect(() => {
        if (typeof window !== 'undefined' && params.id) {
            const localStorageUnlocked = localStorage.getItem(`property_${params.id}_unlocked`) === 'true'
            const shareTokenUnlocked = hasValidShareToken(params.id)
            const kindredGroupAccess = hasKindredGroupAccess()
            
            setIsUnlocked(localStorageUnlocked || shareTokenUnlocked || kindredGroupAccess)
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
                
                // Generate shareable link for the user
                generateShareableLink()
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

    // Generate shareable link
    const generateShareableLink = async () => {
        setIsGeneratingShareUrl(true)
        try {
            const response = await fetch('/api/share/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ propertyId: params.id }),
            })

            const result = await response.json()
            if (result.success) {
                setShareUrl(result.shareUrl)
                // Copy to clipboard
                await navigator.clipboard.writeText(result.shareUrl)
                alert('Shareable link copied to clipboard!')
            } else {
                alert('Failed to generate shareable link. Please try again.')
            }
        } catch (error) {
            console.error('Error generating shareable link:', error)
            alert('Failed to generate shareable link. Please try again.')
        } finally {
            setIsGeneratingShareUrl(false)
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
                                        <div>
                                            <button
                                                onClick={() => setIsModalOpen(true)}
                                                className="btn bg-white text-[#163331] hover:bg-gray-100 px-8 py-4 text-lg font-semibold shadow-xl whitespace-nowrap"
                                            >
                                                Get Full Report
                                            </button>
                                            
                                            {/* Kindred Group Access Button */}
                                            <div className="mt-4 text-sm text-white/90">
                                                <a 
                                                    href={`/property/${params.id}?kindred_group_token=access`}
                                                    className="underline hover:text-white"
                                                >
                                                    Kindred Group Access
                                                </a>
                                            </div>
                                        </div>
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
                                                        <div className="space-y-4">
                                                            <a
                                                                href="https://www.kindred.com.au/sales-property-appraisal"
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-block w-full text-center bg-[#48D98E] text-[#163331] font-semibold py-3 px-6 rounded-lg hover:bg-[#3bc57d] transition-colors duration-200 shadow-lg"
                                                            >
                                                                Book your appraisal today
                                                            </a>
                                                            
                                                            {/* Share Button */}
                                                            <button
                                                                onClick={generateShareableLink}
                                                                disabled={isGeneratingShareUrl}
                                                                className="inline-block w-full text-center bg-white text-[#163331] font-semibold py-3 px-6 rounded-lg hover:bg-gray-100 transition-colors duration-200 shadow-lg"
                                                            >
                                                                {isGeneratingShareUrl ? 'Generating...' : 'Share Property'}
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <p className="text-xs text-white/70 leading-relaxed pt-2">
                                                        {/* This estimate may not include recent renovations or improvements.
                                                        For a personal appraisal, please contact us. */}
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="space-y-6">
                                                    <div>
                                                        <h2 className="text-2xl md:text-3xl font-heading font-semibold text-white/95 mb-4">
                                                            Estimated Value
                                                        </h2>
                                                        <p className="text-white/80 mb-6">
                                                            Unable to generate an estimate for this property.
                                                        </p>
                                                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/15 backdrop-blur-sm rounded-full">
                                                            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                                                            <span className="text-sm font-medium text-white/90">
                                                                Insufficient data
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
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Property Image */}
                                    <div className="relative">
                                        {propertyImages.length > 0 ? (
                                            <div 
                                                className="aspect-[4/3] rounded-xl overflow-hidden shadow-2xl cursor-pointer"
                                                onClick={() => setIsImageGalleryOpen(true)}
                                            >
                                                <img
                                                    src={propertyImages[0]}
                                                    alt={`${property.address} - Main image`}
                                                    className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                                                    loading="eager"
                                                />
                                            </div>
                                        ) : (
                                            <div className="aspect-[4/3] rounded-xl bg-gray-100 flex items-center justify-center shadow-2xl">
                                                <ImageOff className="w-16 h-16 text-gray-400" />
                                            </div>
                                        )}

                                        {propertyImages.length > 1 && (
                                            <div className="absolute bottom-4 right-4 bg-black/70 text-white text-sm px-3 py-1.5 rounded-full backdrop-blur-sm">
                                                {propertyImages.length} photos
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </ScrollReveal>

                        {/* Add the rest of the property page content here */}
                    </div>
                </div>
            </div>

            {/* Lead Capture Modal */}
            {isModalOpen && createPortal(
                <LeadCaptureModal
                    property={property}
                    onSubmit={handleFormSubmit}
                    onClose={() => setIsModalOpen(false)}
                    isSubmitting={isSubmitting}
                    error={formError}
                />,
                document.body
            )}

            {/* Success Modal */}
            {isSuccessModalOpen && createPortal(
                <SuccessModal
                    email={userEmail}
                    propertyAddress={property.address}
                    onClose={() => setIsSuccessModalOpen(false)}
                />,
                document.body
            )}
        </>
    )
}
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
import { hasValidShareToken, hasKindredGroupAccess } from '@/utils/tokenUtils'
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
    const [shareUrl, setShareUrl] = useState('')
    const [isGeneratingShareUrl, setIsGeneratingShareUrl] = useState(false)

    const propertyImages = property?.images || []
    console.log(property);

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

    // Check if property is unlocked (local storage or share token)
    useEffect(() => {
        if (typeof window !== 'undefined' && params.id) {
            const localStorageUnlocked = localStorage.getItem(`property_${params.id}_unlocked`) === 'true'
            const shareTokenUnlocked = hasValidShareToken(params.id)
            const kindredGroupAccess = hasKindredGroupAccess()
            
            setIsUnlocked(localStorageUnlocked || shareTokenUnlocked || kindredGroupAccess)
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
                
                // Generate shareable link for the user
                generateShareableLink()
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

    // Generate shareable link
    const generateShareableLink = async () => {
        setIsGeneratingShareUrl(true)
        try {
            const response = await fetch('/api/share/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ propertyId: params.id }),
            })

            const result = await response.json()
            if (result.success) {
                setShareUrl(result.shareUrl)
                // Copy to clipboard
                await navigator.clipboard.writeText(result.shareUrl)
                alert('Shareable link copied to clipboard!')
            } else {
                alert('Failed to generate shareable link. Please try again.')
            }
        } catch (error) {
            console.error('Error generating shareable link:', error)
            alert('Failed to generate shareable link. Please try again.')
        } finally {
            setIsGeneratingShareUrl(false)
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
                                        <div>
                                            <button
                                                onClick={() => setIsModalOpen(true)}
                                                className="btn bg-white text-[#163331] hover:bg-gray-100 px-8 py-4 text-lg font-semibold shadow-xl whitespace-nowrap"
                                            >
                                                Get Full Report
                                            </button>
                                            
                                            {/* Kindred Group Access Button */}
                                            <div className="mt-4 text-sm text-white/90">
                                                <a 
                                                    href={`/property/${params.id}?kindred_group_token=access`}
                                                    className="underline hover:text-white"
                                                >
                                                    Kindred Group Access
                                                </a>
                                            </div>
                                        </div>
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
                                                        <div className="space-y-4">
                                                            <a
                                                                href="https://www.kindred.com.au/sales-property-appraisal"
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-block w-full text-center bg-[#48D98E] text-[#163331] font-semibold py-3 px-6 rounded-lg hover:bg-[#3bc57d] transition-colors duration-200 shadow-lg"
                                                            >
                                                                Book your appraisal today
                                                            </a>
                                                            
                                                            {/* Share Button */}
                                                            <button
                                                                onClick={generateShareableLink}
                                                                disabled={isGeneratingShareUrl}
                                                                className="inline-block w-full text-center bg-white text-[#163331] font-semibold py-3 px-6 rounded-lg hover:bg-gray-100 transition-colors duration-200 shadow-lg"
                                                            >
                                                                {isGeneratingShareUrl ? 'Generating...' : 'Share Property'}
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <p className="text-xs text-white/70 leading-relaxed pt-2">
                                                        {/* This estimate may not include recent renovations or improvements.
                                                        For a personal appraisal, please contact us. */}
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="space-y-6">
                                                    <div>
                                                        <h2 className="text-2xl md:text-3xl font-heading font-semibold text-white/95 mb-4">
                                                            Estimated Value
                                                        </h2>
                                                        <p className="text-white/80 mb-6">
                                                            Unable to generate an estimate for this property.
                                                        </p>
                                                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/15 backdrop-blur-sm rounded-full">
                                                            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                                                            <span className="text-sm font-medium text-white/90">
                                                                Insufficient data
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
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Property Image */}
                                    <div className="relative">
                                        {propertyImages.length > 0 ? (
                                            <div 
                                                className="aspect-[4/3] rounded-xl overflow-hidden shadow-2xl cursor-pointer"
                                                onClick={() => setIsImageGalleryOpen(true)}
                                            >
                                                <img
                                                    src={propertyImages[0]}
                                                    alt={`${property.address} - Main image`}
                                                    className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                                                    loading="eager"
                                                />
                                            </div>
                                        ) : (
                                            <div className="aspect-[4/3] rounded-xl bg-gray-100 flex items-center justify-center shadow-2xl">
                                                <ImageOff className="w-16 h-16 text-gray-400" />
                                            </div>
                                        )}

                                        {propertyImages.length > 1 && (
                                            <div className="absolute bottom-4 right-4 bg-black/70 text-white text-sm px-3 py-1.5 rounded-full backdrop-blur-sm">
                                                {propertyImages.length} photos
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </ScrollReveal>

                        {/* Add the rest of the property page content here */}
                    </div>
                </div>
            </div>

            {/* Lead Capture Modal */}
            {isModalOpen && createPortal(
                <LeadCaptureModal
                    property={property}
                    onSubmit={handleFormSubmit}
                    onClose={() => setIsModalOpen(false)}
                    isSubmitting={isSubmitting}
                    error={formError}
                />,
                document.body
            )}

            {/* Success Modal */}
            {isSuccessModalOpen && createPortal(
                <SuccessModal
                    email={userEmail}
                    propertyAddress={property.address}
                    onClose={() => setIsSuccessModalOpen(false)}
                />,
                document.body
            )}
        </>
    )
}
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
import { hasValidShareToken, hasKindredGroupAccess } from '@/utils/tokenUtils'
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
    const [shareUrl, setShareUrl] = useState('')
    const [isGeneratingShareUrl, setIsGeneratingShareUrl] = useState(false)

    const propertyImages = property?.images || []
    console.log(property);

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

    // Check if property is unlocked (local storage or share token)
    useEffect(() => {
        if (typeof window !== 'undefined' && params.id) {
            const localStorageUnlocked = localStorage.getItem(`property_${params.id}_unlocked`) === 'true'
            const shareTokenUnlocked = hasValidShareToken(params.id)
            const kindredGroupAccess = hasKindredGroupAccess()
            
            setIsUnlocked(localStorageUnlocked || shareTokenUnlocked || kindredGroupAccess)
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
                
                // Generate shareable link for the user
                generateShareableLink()
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

    // Generate shareable link
    const generateShareableLink = async () => {
        setIsGeneratingShareUrl(true)
        try {
            const response = await fetch('/api/share/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ propertyId: params.id }),
            })

            const result = await response.json()
            if (result.success) {
                setShareUrl(result.shareUrl)
                // Copy to clipboard
                await navigator.clipboard.writeText(result.shareUrl)
                alert('Shareable link copied to clipboard!')
            } else {
                alert('Failed to generate shareable link. Please try again.')
            }
        } catch (error) {
            console.error('Error generating shareable link:', error)
            alert('Failed to generate shareable link. Please try again.')
        } finally {
            setIsGeneratingShareUrl(false)
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
                                        <div>
                                            <button
                                                onClick={() => setIsModalOpen(true)}
                                                className="btn bg-white text-[#163331] hover:bg-gray-100 px-8 py-4 text-lg font-semibold shadow-xl whitespace-nowrap"
                                            >
                                                Get Full Report
                                            </button>
                                            
                                            {/* Kindred Group Access Button */}
                                            <div className="mt-4 text-sm text-white/90">
                                                <a 
                                                    href={`/property/${params.id}?kindred_group_token=access`}
                                                    className="underline hover:text-white"
                                                >
                                                    Kindred Group Access
                                                </a>
                                            </div>
                                        </div>
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
                                                        <div className="space-y-4">
                                                            <a
                                                                href="https://www.kindred.com.au/sales-property-appraisal"
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-block w-full text-center bg-[#48D98E] text-[#163331] font-semibold py-3 px-6 rounded-lg hover:bg-[#3bc57d] transition-colors duration-200 shadow-lg"
                                                            >
                                                                Book your appraisal today
                                                            </a>
                                                            
                                                            {/* Share Button */}
                                                            <button
                                                                onClick={generateShareableLink}
                                                                disabled={isGeneratingShareUrl}
                                                                className="inline-block w-full text-center bg-white text-[#163331] font-semibold py-3 px-6 rounded-lg hover:bg-gray-100 transition-colors duration-200 shadow-lg"
                                                            >
                                                                {isGeneratingShareUrl ? 'Generating...' : 'Share Property'}
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <p className="text-xs text-white/70 leading-relaxed pt-2">
                                                        {/* This estimate may not include recent renovations or improvements.
                                                        For a personal appraisal, please contact us. */}
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="space-y-6">
                                                    <div>
                                                        <h2 className="text-2xl md:text-3xl font-heading font-semibold text-white/95 mb-4">
                                                            Estimated Value
                                                        </h2>
                                                        <p className="text-white/80 mb-6">
                                                            Unable to generate an estimate for this property.
                                                        </p>
                                                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/15 backdrop-blur-sm rounded-full">
                                                            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                                                            <span className="text-sm font-medium text-white/90">
                                                                Insufficient data
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
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Property Image */}
                                    <div className="relative">
                                        {propertyImages.length > 0 ? (
                                            <div 
                                                className="aspect-[4/3] rounded-xl overflow-hidden shadow-2xl cursor-pointer"
                                                onClick={() => setIsImageGalleryOpen(true)}
                                            >
                                                <img
                                                    src={propertyImages[0]}
                                                    alt={`${property.address} - Main image`}
                                                    className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                                                    loading="eager"
                                                />
                                            </div>
                                        ) : (
                                            <div className="aspect-[4/3] rounded-xl bg-gray-100 flex items-center justify-center shadow-2xl">
                                                <ImageOff className="w-16 h-16 text-gray-400" />
                                            </div>
                                        )}

                                        {propertyImages.length > 1 && (
                                            <div className="absolute bottom-4 right-4 bg-black/70 text-white text-sm px-3 py-1.5 rounded-full backdrop-blur-sm">
                                                {propertyImages.length} photos
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </ScrollReveal>

                        {/* Add the rest of the property page content here */}
                    </div>
                </div>
            </div>

            {/* Lead Capture Modal */}
            {isModalOpen && createPortal(
                <LeadCaptureModal
                    property={property}
                    onSubmit={handleFormSubmit}
                    onClose={() => setIsModalOpen(false)}
                    isSubmitting={isSubmitting}
                    error={formError}
                />,
                document.body
            )}

            {/* Success Modal */}
            {isSuccessModalOpen && createPortal(
                <SuccessModal
                    email={userEmail}
                    propertyAddress={property.address}
                    onClose={() => setIsSuccessModalOpen(false)}
                />,
                document.body
            )}
        </>
    )
}
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
import { hasValidShareToken, hasKindredGroupAccess } from '@/utils/tokenUtils'
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
    const [shareUrl, setShareUrl] = useState('')
    const [isGeneratingShareUrl, setIsGeneratingShareUrl] = useState(false)

    const propertyImages = property?.images || []
    console.log(property);

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

    // Check if property is unlocked (local storage or share token)
    useEffect(() => {
        if (typeof window !== 'undefined' && params.id) {
            const localStorageUnlocked = localStorage.getItem(`property_${params.id}_unlocked`) === 'true'
            const shareTokenUnlocked = hasValidShareToken(params.id)
            const kindredGroupAccess = hasKindredGroupAccess()
            
            setIsUnlocked(localStorageUnlocked || shareTokenUnlocked || kindredGroupAccess)
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
                
                // Generate shareable link for the user
                generateShareableLink()
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

    // Generate shareable link
    const generateShareableLink = async () => {
        setIsGeneratingShareUrl(true)
        try {
            const response = await fetch('/api/share/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ propertyId: params.id }),
            })

            const result = await response.json()
            if (result.success) {
                setShareUrl(result.shareUrl)
                // Copy to clipboard
                await navigator.clipboard.writeText(result.shareUrl)
                alert('Shareable link copied to clipboard!')
            } else {
                alert('Failed to generate shareable link. Please try again.')
            }
        } catch (error) {
            console.error('Error generating shareable link:', error)
            alert('Failed to generate shareable link. Please try again.')
        } finally {
            setIsGeneratingShareUrl(false)
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
                                        <div>
                                            <button
                                                onClick={() => setIsModalOpen(true)}
                                                className="btn bg-white text-[#163331] hover:bg-gray-100 px-8 py-4 text-lg font-semibold shadow-xl whitespace-nowrap"
                                            >
                                                Get Full Report
                                            </button>
                                            
                                            {/* Kindred Group Access Button */}
                                            <div className="mt-4 text-sm text-white/90">
                                                <a 
                                                    href={`/property/${params.id}?kindred_group_token=access`}
                                                    className="underline hover:text-white"
                                                >
                                                    Kindred Group Access
                                                </a>
                                            </div>
                                        </div>
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
                                                        <div className="space-y-4">
                                                            <a
                                                                href="https://www.kindred.com.au/sales-property-appraisal"
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-block w-full text-center bg-[#48D98E] text-[#163331] font-semibold py-3 px-6 rounded-lg hover:bg-[#3bc57d] transition-colors duration-200 shadow-lg"
                                                            >
                                                                Book your appraisal today
                                                            </a>
                                                            
                                                            {/* Share Button */}
                                                            <button
                                                                onClick={generateShareableLink}
                                                                disabled={isGeneratingShareUrl}
                                                                className="inline-block w-full text-center bg-white text-[#163331] font-semibold py-3 px-6 rounded-lg hover:bg-gray-100 transition-colors duration-200 shadow-lg"
                                                            >
                                                                {isGeneratingShareUrl ? 'Generating...' : 'Share Property'}
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <p className="text-xs text-white/70 leading-relaxed pt-2">
                                                        {/* This estimate may not include recent renovations or improvements.
                                                        For a personal appraisal, please contact us. */}
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="space-y-6">
                                                    <div>
                                                        <h2 className="text-2xl md:text-3xl font-heading font-semibold text-white/95 mb-4">
                                                            Estimated Value
                                                        </h2>
                                                        <p className="text-white/80 mb-6">
                                                            Unable to generate an estimate for this property.
                                                        </p>
                                                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/15 backdrop-blur-sm rounded-full">
                                                            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                                                            <span className="text-sm font-medium text-white/90">
                                                                Insufficient data
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
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Property Image */}
                                    <div className="relative">
                                        {propertyImages.length > 0 ? (
                                            <div 
                                                className="aspect-[4/3] rounded-xl overflow-hidden shadow-2xl cursor-pointer"
                                                onClick={() => setIsImageGalleryOpen(true)}
                                            >
                                                <img
                                                    src={propertyImages[0]}
                                                    alt={`${property.address} - Main image`}
                                                    className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                                                    loading="eager"
                                                />
                                            </div>
                                        ) : (
                                            <div className="aspect-[4/3] rounded-xl bg-gray-100 flex items-center justify-center shadow-2xl">
                                                <ImageOff className="w-16 h-16 text-gray-400" />
                                            </div>
                                        )}

                                        {propertyImages.length > 1 && (
                                            <div className="absolute bottom-4 right-4 bg-black/70 text-white text-sm px-3 py-1.5 rounded-full backdrop-blur-sm">
                                                {propertyImages.length} photos
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </ScrollReveal>

                        {/* Add the rest of the property page content here */}
                    </div>
                </div>
            </div>

            {/* Lead Capture Modal */}
            {isModalOpen && createPortal(
                <LeadCaptureModal
                    property={property}
                    onSubmit={handleFormSubmit}
                    onClose={() => setIsModalOpen(false)}
                    isSubmitting={isSubmitting}
                    error={formError}
                />,
                document.body
            )}

            {/* Success Modal */}
            {isSuccessModalOpen && createPortal(
                <SuccessModal
                    email={userEmail}
                    propertyAddress={property.address}
                    onClose={() => setIsSuccessModalOpen(false)}
                />,
                document.body
            )}
        </>
    )
}
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
import { hasValidShareToken, hasKindredGroupAccess } from '@/utils/tokenUtils'
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
    const [shareUrl, setShareUrl] = useState('')
    const [isGeneratingShareUrl, setIsGeneratingShareUrl] = useState(false)

    const propertyImages = property?.images || []
    console.log(property);

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

    // Check if property is unlocked (local storage or share token)
    useEffect(() => {
        if (typeof window !== 'undefined' && params.id) {
            const localStorageUnlocked = localStorage.getItem(`property_${params.id}_unlocked`) === 'true'
            const shareTokenUnlocked = hasValidShareToken(params.id)
            const kindredGroupAccess = hasKindredGroupAccess()
            
            setIsUnlocked(localStorageUnlocked || shareTokenUnlocked || kindredGroupAccess)
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
                
                // Generate shareable link for the user
                generateShareableLink()
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

    // Generate shareable link
    const generateShareableLink = async () => {
        setIsGeneratingShareUrl(true)
        try {
            const response = await fetch('/api/share/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ propertyId: params.id }),
            })

            const result = await response.json()
            if (result.success) {
                setShareUrl(result.shareUrl)
                // Copy to clipboard
                await navigator.clipboard.writeText(result.shareUrl)
                alert('Shareable link copied to clipboard!')
            } else {
                alert('Failed to generate shareable link. Please try again.')
            }
        } catch (error) {
            console.error('Error generating shareable link:', error)
            alert('Failed to generate shareable link. Please try again.')
        } finally {
            setIsGeneratingShareUrl(false)
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
                                        <div>
                                            <button
                                                onClick={() => setIsModalOpen(true)}
                                                className="btn bg-white text-[#163331] hover:bg-gray-100 px-8 py-4 text-lg font-semibold shadow-xl whitespace-nowrap"
                                            >
                                                Get Full Report
                                            </button>
                                            
                                            {/* Kindred Group Access Button */}
                                            <div className="mt-4 text-sm text-white/90">
                                                <a 
                                                    href={`/property/${params.id}?kindred_group_token=access`}
                                                    className="underline hover:text-white"
                                                >
                                                    Kindred Group Access
                                                </a>
                                            </div>
                                        </div>
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
                                                        <div className="space-y-4">
                                                            <a
                                                                href="https://www.kindred.com.au/sales-property-appraisal"
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-block w-full text-center bg-[#48D98E] text-[#163331] font-semibold py-3 px-6 rounded-lg hover:bg-[#3bc57d] transition-colors duration-200 shadow-lg"
                                                            >
                                                                Book your appraisal today
                                                            </a>
                                                            
                                                            {/* Share Button */}
                                                            <button
                                                                onClick={generateShareableLink}
                                                                disabled={isGeneratingShareUrl}
                                                                className="inline-block w-full text-center bg-white text-[#163331] font-semibold py-3 px-6 rounded-lg hover:bg-gray-100 transition-colors duration-200 shadow-lg"
                                                            >
                                                                {isGeneratingShareUrl ? 'Generating...' : 'Share Property'}
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <p className="text-xs text-white/70 leading-relaxed pt-2">
                                                        {/* This estimate may not include recent renovations or improvements.
                                                        For a personal appraisal, please contact us. */}
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="space-y-6">
                                                    <div>
                                                        <h2 className="text-2xl md:text-3xl font-heading font-semibold text-white/95 mb-4">
                                                            Estimated Value
                                                        </h2>
                                                        <p className="text-white/80 mb-6">
                                                            Unable to generate an estimate for this property.
                                                        </p>
                                                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/15 backdrop-blur-sm rounded-full">
                                                            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                                                            <span className="text-sm font-medium text-white/90">
                                                                Insufficient data
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
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Property Image */}
                                    <div className="relative">
                                        {propertyImages.length > 0 ? (
                                            <div 
                                                className="aspect-[4/3] rounded-xl overflow-hidden shadow-2xl cursor-pointer"
                                                onClick={() => setIsImageGalleryOpen(true)}
                                            >
                                                <img
                                                    src={propertyImages[0]}
                                                    alt={`${property.address} - Main image`}
                                                    className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                                                    loading="eager"
                                                />
                                            </div>
                                        ) : (
                                            <div className="aspect-[4/3] rounded-xl bg-gray-100 flex items-center justify-center shadow-2xl">
                                                <ImageOff className="w-16 h-16 text-gray-400" />
                                            </div>
                                        )}

                                        {propertyImages.length > 1 && (
                                            <div className="absolute bottom-4 right-4 bg-black/70 text-white text-sm px-3 py-1.5 rounded-full backdrop-blur-sm">
                                                {propertyImages.length} photos
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </ScrollReveal>

                        {/* Add the rest of the property page content here */}
                    </div>
                </div>
            </div>

            {/* Lead Capture Modal */}
            {isModalOpen && createPortal(
                <LeadCaptureModal
                    property={property}
                    onSubmit={handleFormSubmit}
                    onClose={() => setIsModalOpen(false)}
                    isSubmitting={isSubmitting}
                    error={formError}
                />,
                document.body
            )}

            {/* Success Modal */}
            {isSuccessModalOpen && createPortal(
                <SuccessModal
                    email={userEmail}
                    propertyAddress={property.address}
                    onClose={() => setIsSuccessModalOpen(false)}
                />,
                document.body
            )}
        </>
    )
}
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
import { hasValidShareToken, hasKindredGroupAccess } from '@/utils/tokenUtils'
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
    const [shareUrl, setShareUrl] = useState('')
    const [isGeneratingShareUrl, setIsGeneratingShareUrl] = useState(false)

    const propertyImages = property?.images || []
    console.log(property);

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

    // Check if property is unlocked (local storage or share token)
    useEffect(() => {
        if (typeof window !== 'undefined' && params.id) {
            const localStorageUnlocked = localStorage.getItem(`property_${params.id}_unlocked`) === 'true'
            const shareTokenUnlocked = hasValidShareToken(params.id)
            const kindredGroupAccess = hasKindredGroupAccess()
            
            setIsUnlocked(localStorageUnlocked || shareTokenUnlocked || kindredGroupAccess)
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
                
                // Generate shareable link for the user
                generateShareableLink()
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

    // Generate shareable link
    const generateShareableLink = async () => {
        setIsGeneratingShareUrl(true)
        try {
            const response = await fetch('/api/share/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ propertyId: params.id }),
            })

            const result = await response.json()
            if (result.success) {
                setShareUrl(result.shareUrl)
                // Copy to clipboard
                await navigator.clipboard.writeText(result.shareUrl)
                alert('Shareable link copied to clipboard!')
            } else {
                alert('Failed to generate shareable link. Please try again.')
            }
        } catch (error) {
            console.error('Error generating shareable link:', error)
            alert('Failed to generate shareable link. Please try again.')
        } finally {
            setIsGeneratingShareUrl(false)
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
                                        <div>
                                            <button
                                                onClick={() => setIsModalOpen(true)}
                                                className="btn bg-white text-[#163331] hover:bg-gray-100 px-8 py-4 text-lg font-semibold shadow-xl whitespace-nowrap"
                                            >
                                                Get Full Report
                                            </button>
                                            
                                            {/* Kindred Group Access Button */}
                                            <div className="mt-4 text-sm text-white/90">
                                                <a 
                                                    href={`/property/${params.id}?kindred_group_token=access`}
                                                    className="underline hover:text-white"
                                                >
                                                    Kindred Group Access
                                                </a>
                                            </div>
                                        </div>
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
                                                        <div className="space-y-4">
                                                            <a
                                                                href="https://www.kindred.com.au/sales-property-appraisal"
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-block w-full text-center bg-[#48D98E] text-[#163331] font-semibold py-3 px-6 rounded-lg hover:bg-[#3bc57d] transition-colors duration-200 shadow-lg"
                                                            >
                                                                Book your appraisal today
                                                            </a>
                                                            
                                                            {/* Share Button */}
                                                            <button
                                                                onClick={generateShareableLink}
                                                                disabled={isGeneratingShareUrl}
                                                                className="inline-block w-full text-center bg-white text-[#163331] font-semibold py-3 px-6 rounded-lg hover:bg-gray-100 transition-colors duration-200 shadow-lg"
                                                            >
                                                                {isGeneratingShareUrl ? 'Generating...' : 'Share Property'}
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <p className="text-xs text-white/70 leading-relaxed pt-2">
                                                        {/* This estimate may not include recent renovations or improvements.
                                                        For a personal appraisal, please contact us. */}
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="space-y-6">
                                                    <div>
                                                        <h2 className="text-2xl md:text-3xl font-heading font-semibold text-white/95 mb-4">
                                                            Estimated Value
                                                        </h2>
                                                        <p className="text-white/80 mb-6">
                                                            Unable to generate an estimate for this property.
                                                        </p>
                                                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/15 backdrop-blur-sm rounded-full">
                                                            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                                                            <span className="text-sm font-medium text-white/90">
                                                                Insufficient data
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
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Property Image */}
                                    <div className="relative">
                                        {propertyImages.length > 0 ? (
                                            <div 
                                                className="aspect-[4/3] rounded-xl overflow-hidden shadow-2xl cursor-pointer"
                                                onClick={() => setIsImageGalleryOpen(true)}
                                            >
                                                <img
                                                    src={propertyImages[0]}
                                                    alt={`${property.address} - Main image`}
                                                    className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                                                    loading="eager"
                                                />
                                            </div>
                                        ) : (
                                            <div className="aspect-[4/3] rounded-xl bg-gray-100 flex items-center justify-center shadow-2xl">
                                                <ImageOff className="w-16 h-16 text-gray-400" />
                                            </div>
                                        )}

                                        {propertyImages.length > 1 && (
                                            <div className="absolute bottom-4 right-4 bg-black/70 text-white text-sm px-3 py-1.5 rounded-full backdrop-blur-sm">
                                                {propertyImages.length} photos
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </ScrollReveal>

                        {/* Add the rest of the property page content here */}
                    </div>
                </div>
            </div>

            {/* Lead Capture Modal */}
            {isModalOpen && createPortal(
                <LeadCaptureModal
                    property={property}
                    onSubmit={handleFormSubmit}
                    onClose={() => setIsModalOpen(false)}
                    isSubmitting={isSubmitting}
                    error={formError}
                />,
                document.body
            )}

            {/* Success Modal */}
            {isSuccessModalOpen && createPortal(
                <SuccessModal
                    email={userEmail}
                    propertyAddress={property.address}
                    onClose={() => setIsSuccessModalOpen(false)}
                />,
                document.body
            )}
        </>
    )
}
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
import { hasValidShareToken, hasKindredGroupAccess } from '@/utils/tokenUtils'
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
    const [shareUrl, setShareUrl] = useState('')
    const [isGeneratingShareUrl, setIsGeneratingShareUrl] = useState(false)

    const propertyImages = property?.images || []
    console.log(property);

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

    // Check if property is unlocked (local storage or share token)
    useEffect(() => {
        if (typeof window !== 'undefined' && params.id) {
            const localStorageUnlocked = localStorage.getItem(`property_${params.id}_unlocked`) === 'true'
            const shareTokenUnlocked = hasValidShareToken(params.id)
            const kindredGroupAccess = hasKindredGroupAccess()
            
            setIsUnlocked(localStorageUnlocked || shareTokenUnlocked || kindredGroupAccess)
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
                
                // Generate shareable link for the user
                generateShareableLink()
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

    // Generate shareable link
    const generateShareableLink = async () => {
        setIsGeneratingShareUrl(true)
        try {
            const response = await fetch('/api/share/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ propertyId: params.id }),
            })

            const result = await response.json()
            if (result.success) {
                setShareUrl(result.shareUrl)
                // Copy to clipboard
                await navigator.clipboard.writeText(result.shareUrl)
                alert('Shareable link copied to clipboard!')
            } else {
                alert('Failed to generate shareable link. Please try again.')
            }
        } catch (error) {
            console.error('Error generating shareable link:', error)
            alert('Failed to generate shareable link. Please try again.')
        } finally {
            setIsGeneratingShareUrl(false)
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
                                        <div>
                                            <button
                                                onClick={() => setIsModalOpen(true)}
                                                className="btn bg-white text-[#163331] hover:bg-gray-100 px-8 py-4 text-lg font-semibold shadow-xl whitespace-nowrap"
                                            >
                                                Get Full Report
                                            </button>
                                            
                                            {/* Kindred Group Access Button */}
                                            <div className="mt-4 text-sm text-white/90">
                                                <a 
                                                    href={`/property/${params.id}?kindred_group_token=access`}
                                                    className="underline hover:text-white"
                                                >
                                                    Kindred Group Access
                                                </a>
                                            </div>
                                        </div>
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
                                                        <div className="space-y-4">
                                                            <a
                                                                href="https://www.kindred.com.au/sales-property-appraisal"
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-block w-full text-center bg-[#48D98E] text-[#163331] font-semibold py-3 px-6 rounded-lg hover:bg-[#3bc57d] transition-colors duration-200 shadow-lg"
                                                            >
                                                                Book your appraisal today
                                                            </a>
                                                            
                                                            {/* Share Button */}
                                                            <button
                                                                onClick={generateShareableLink}
                                                                disabled={isGeneratingShareUrl}
                                                                className="inline-block w-full text-center bg-white text-[#163331] font-semibold py-3 px-6 rounded-lg hover:bg-gray-100 transition-colors duration-200 shadow-lg"
                                                            >
                                                                {isGeneratingShareUrl ? 'Generating...' : 'Share Property'}
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <p className="text-xs text-white/70 leading-relaxed pt-2">
                                                        {/* This estimate may not include recent renovations or improvements.
                                                        For a personal appraisal, please contact us. */}
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="space-y-6">
                                                    <div>
                                                        <h2 className="text-2xl md:text-3xl font-heading font-semibold text-white/95 mb-4">
                                                            Estimated Value
                                                        </h2>
                                                        <p className="text-white/80 mb-6">
                                                            Unable to generate an estimate for this property.
                                                        </p>
                                                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/15 backdrop-blur-sm rounded-full">
                                                            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                                                            <span className="text-sm font-medium text-white/90">
                                                                Insufficient data
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
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Property Image */}
                                    <div className="relative">
                                        {propertyImages.length > 0 ? (
                                            <div 
                                                className="aspect-[4/3] rounded-xl overflow-hidden shadow-2xl cursor-pointer"
                                                onClick={() => setIsImageGalleryOpen(true)}
                                            >
                                                <img
                                                    src={propertyImages[0]}
                                                    alt={`${property.address} - Main image`}
                                                    className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                                                    loading="eager"
                                                />
                                            </div>
                                        ) : (
                                            <div className="aspect-[4/3] rounded-xl bg-gray-100 flex items-center justify-center shadow-2xl">
                                                <ImageOff className="w-16 h-16 text-gray-400" />
                                            </div>
                                        )}

                                        {propertyImages.length > 1 && (
                                            <div className="absolute bottom-4 right-4 bg-black/70 text-white text-sm px-3 py-1.5 rounded-full backdrop-blur-sm">
                                                {propertyImages.length} photos
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </ScrollReveal>

                        {/* Add the rest of the property page content here */}
                    </div>
                </div>
            </div>

            {/* Lead Capture Modal */}
            {isModalOpen && createPortal(
                <LeadCaptureModal
                    property={property}
                    onSubmit={handleFormSubmit}
                    onClose={() => setIsModalOpen(false)}
                    isSubmitting={isSubmitting}
                    error={formError}
                />,
                document.body
            )}

            {/* Success Modal */}
            {isSuccessModalOpen && createPortal(
                <SuccessModal
                    email={userEmail}
                    propertyAddress={property.address}
                    onClose={() => setIsSuccessModalOpen(false)}
                />,
                document.body
            )}
        </>
    )
}
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
import { hasValidShareToken, hasKindredGroupAccess } from '@/utils/tokenUtils'
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
    const [shareUrl, setShareUrl] = useState('')
    const [isGeneratingShareUrl, setIsGeneratingShareUrl] = useState(false)

    const propertyImages = property?.images || []
    console.log(property);

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

    // Check if property is unlocked (local storage or share token)
    useEffect(() => {
        if (typeof window !== 'undefined' && params.id) {
            const localStorageUnlocked = localStorage.getItem(`property_${params.id}_unlocked`) === 'true'
            const shareTokenUnlocked = hasValidShareToken(params.id)
            const kindredGroupAccess = hasKindredGroupAccess()
            
            setIsUnlocked(localStorageUnlocked || shareTokenUnlocked || kindredGroupAccess)
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
                
                // Generate shareable link for the user
                generateShareableLink()
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

    // Generate shareable link
    const generateShareableLink = async () => {
        setIsGeneratingShareUrl(true)
        try {
            const response = await fetch('/api/share/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ propertyId: params.id }),
            })

            const result = await response.json()
            if (result.success) {
                setShareUrl(result.shareUrl)
                // Copy to clipboard
                await navigator.clipboard.writeText(result.shareUrl)
                alert('Shareable link copied to clipboard!')
            } else {
                alert('Failed to generate shareable link. Please try again.')
            }
        } catch (error) {
            console.error('Error generating shareable link:', error)
            alert('Failed to generate shareable link. Please try again.')
        } finally {
            setIsGeneratingShareUrl(false)
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
                                        <div>
                                            <button
                                                onClick={() => setIsModalOpen(true)}
                                                className="btn bg-white text-[#163331] hover:bg-gray-100 px-8 py-4 text-lg font-semibold shadow-xl whitespace-nowrap"
                                            >
                                                Get Full Report
                                            </button>
                                            
                                            {/* Kindred Group Access Button */}
                                            <div className="mt-4 text-sm text-white/90">
                                                <a 
                                                    href={`/property/${params.id}?kindred_group_token=access`}
                                                    className="underline hover:text-white"
                                                >
                                                    Kindred Group Access
                                                </a>
                                            </div>
                                        </div>
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
                                                        <div className="space-y-4">
                                                            <a
                                                                href="https://www.kindred.com.au/sales-property-appraisal"
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-block w-full text-center bg-[#48D98E] text-[#163331] font-semibold py-3 px-6 rounded-lg hover:bg-[#3bc57d] transition-colors duration-200 shadow-lg"
                                                            >
                                                                Book your appraisal today
                                                            </a>
                                                            
                                                            {/* Share Button */}
                                                            <button
                                                                onClick={generateShareableLink}
                                                                disabled={isGeneratingShareUrl}
                                                                className="inline-block w-full text-center bg-white text-[#163331] font-semibold py-3 px-6 rounded-lg hover:bg-gray-100 transition-colors duration-200 shadow-lg"
                                                            >
                                                                {isGeneratingShareUrl ? 'Generating...' : 'Share Property'}
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <p className="text-xs text-white/70 leading-relaxed pt-2">
                                                        {/* This estimate may not include recent renovations or improvements.
                                                        For a personal appraisal, please contact us. */}
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="space-y-6">
                                                    <div>
                                                        <h2 className="text-2xl md:text-3xl font-heading font-semibold text-white/95 mb-4">
                                                            Estimated Value
                                                        </h2>
                                                        <p className="text-white/80 mb-6">
                                                            Unable to generate an estimate for this property.
                                                        </p>
                                                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/15 backdrop-blur-sm rounded-full">
                                                            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                                                            <span className="text-sm font-medium text-white/90">
                                                                Insufficient data
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
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Property Image */}
                                    <div className="relative">
                                        {propertyImages.length > 0 ? (
                                            <div 
                                                className="aspect-[4/3] rounded-xl overflow-hidden shadow-2xl cursor-pointer"
                                                onClick={() => setIsImageGalleryOpen(true)}
                                            >
                                                <img
                                                    src={propertyImages[0]}
                                                    alt={`${property.address} - Main image`}
                                                    className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                                                    loading="eager"
                                                />
                                            </div>
                                        ) : (
                                            <div className="aspect-[4/3] rounded-xl bg-gray-100 flex items-center justify-center shadow-2xl">
                                                <ImageOff className="w-16 h-16 text-gray-400" />
                                            </div>
                                        )}

                                        {propertyImages.length > 1 && (
                                            <div className="absolute bottom-4 right-4 bg-black/70 text-white text-sm px-3 py-1.5 rounded-full backdrop-blur-sm">
                                                {propertyImages.length} photos
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </ScrollReveal>

                        {/* Add the rest of the property page content here */}
                    </div>
                </div>
            </div>

            {/* Lead Capture Modal */}
            {isModalOpen && createPortal(
                <LeadCaptureModal
                    property={property}
                    onSubmit={handleFormSubmit}
                    onClose={() => setIsModalOpen(false)}
                    isSubmitting={isSubmitting}
                    error={formError}
                />,
                document.body
            )}

            {/* Success Modal */}
            {isSuccessModalOpen && createPortal(
                <SuccessModal
                    email={userEmail}
                    propertyAddress={property.address}
                    onClose={() => setIsSuccessModalOpen(false)}
                />,
                document.body
            )}
        </>
    )
}
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
import { hasValidShareToken, hasKindredGroupAccess } from '@/utils/tokenUtils'
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
    const [shareUrl, setShareUrl] = useState('')
    const [isGeneratingShareUrl, setIsGeneratingShareUrl] = useState(false)

    const propertyImages = property?.images || []
    console.log(property);

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

    // Check if property is unlocked (local storage or share token)
    useEffect(() => {
        if (typeof window !== 'undefined' && params.id) {
            const localStorageUnlocked = localStorage.getItem(`property_${params.id}_unlocked`) === 'true'
            const shareTokenUnlocked = hasValidShareToken(params.id)
            const kindredGroupAccess = hasKindredGroupAccess()
            
            setIsUnlocked(localStorageUnlocked || shareTokenUnlocked || kindredGroupAccess)
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
                
                // Generate shareable link for the user
                generateShareableLink()
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

    // Generate shareable link
    const generateShareableLink = async () => {
        setIsGeneratingShareUrl(true)
        try {
            const response = await fetch('/api/share/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ propertyId: params.id }),
            })

            const result = await response.json()
            if (result.success) {
                setShareUrl(result.shareUrl)
                // Copy to clipboard
                await navigator.clipboard.writeText(result.shareUrl)
                alert('Shareable link copied to clipboard!')
            } else {
                alert('Failed to generate shareable link. Please try again.')
            }
        } catch (error) {
            console.error('Error generating shareable link:', error)
            alert('Failed to generate shareable link. Please try again.')
        } finally {
            setIsGeneratingShareUrl(false)
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
                                        <div>
                                            <button
                                                onClick={() => setIsModalOpen(true)}
                                                className="btn bg-white text-[#163331] hover:bg-gray-100 px-8 py-4 text-lg font-semibold shadow-xl whitespace-nowrap"
                                            >
                                                Get Full Report
                                            </button>
                                            
                                            {/* Kindred Group Access Button */}
                                            <div className="mt-4 text-sm text-white/90">
                                                <a 
                                                    href={`/property/${params.id}?kindred_group_token=access`}
                                                    className="underline hover:text-white"
                                                >
                                                    Kindred Group Access
                                                </a>
                                            </div>
                                        </div>
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
                                                        <div className="space-y-4">
                                                            <a
                                                                href="https://www.kindred.com.au/sales-property-appraisal"
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-block w-full text-center bg-[#48D98E] text-[#163331] font-semibold py-3 px-6 rounded-lg hover:bg-[#3bc57d] transition-colors duration-200 shadow-lg"
                                                            >
                                                                Book your appraisal today
                                                            </a>
                                                            
                                                            {/* Share Button */}
                                                            <button
                                                                onClick={generateShareableLink}
                                                                disabled={isGeneratingShareUrl}
                                                                className="inline-block w-full text-center bg-white text-[#163331] font-semibold py-3 px-6 rounded-lg hover:bg-gray-100 transition-colors duration-200 shadow-lg"
                                                            >
                                                                {isGeneratingShareUrl ? 'Generating...' : 'Share Property'}
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <p className="text-xs text-white/70 leading-relaxed pt-2">
                                                        {/* This estimate may not include recent renovations or improvements.
                                                        For a personal appraisal, please contact us. */}
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="space-y-6">
                                                    <div>
                                                        <h2 className="text-2xl md:text-3xl font-heading font-semibold text-white/95 mb-4">
                                                            Estimated Value
                                                        </h2>
                                                        <p className="text-white/80 mb-6">
                                                            Unable to generate an estimate for this property.
                                                        </p>
                                                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/15 backdrop-blur-sm rounded-full">
                                                            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                                                            <span className="text-sm font-medium text-white/90">
                                                                Insufficient data
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
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Property Image */}
                                    <div className="relative">
                                        {propertyImages.length > 0 ? (
                                            <div 
                                                className="aspect-[4/3] rounded-xl overflow-hidden shadow-2xl cursor-pointer"
                                                onClick={() => setIsImageGalleryOpen(true)}
                                            >
                                                <img
                                                    src={propertyImages[0]}
                                                    alt={`${property.address} - Main image`}
                                                    className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                                                    loading="eager"
                                                />
                                            </div>
                                        ) : (
                                            <div className="aspect-[4/3] rounded-xl bg-gray-100 flex items-center justify-center shadow-2xl">
                                                <ImageOff className="w-16 h-16 text-gray-400" />
                                            </div>
                                        )}

                                        {propertyImages.length > 1 && (
                                            <div className="absolute bottom-4 right-4 bg-black/70 text-white text-sm px-3 py-1.5 rounded-full backdrop-blur-sm">
                                                {propertyImages.length} photos
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </ScrollReveal>

                        {/* Add the rest of the property page content here */}
                    </div>
                </div>
            </div>

            {/* Lead Capture Modal */}
            {isModalOpen && createPortal(
                <LeadCaptureModal
                    property={property}
                    onSubmit={handleFormSubmit}
                    onClose={() => setIsModalOpen(false)}
                    isSubmitting={isSubmitting}
                    error={formError}
                />,
                document.body
            )}

            {/* Success Modal */}
            {isSuccessModalOpen && createPortal(
                <SuccessModal
                    email={userEmail}
                    propertyAddress={property.address}
                    onClose={() => setIsSuccessModalOpen(false)}
                />,
                document.body
            )}
        </>
    )
}
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
import { hasValidShareToken, hasKindredGroupAccess } from '@/utils/tokenUtils'
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
    const [shareUrl, setShareUrl] = useState('')
    const [isGeneratingShareUrl, setIsGeneratingShareUrl] = useState(false)

    const propertyImages = property?.images || []
    console.log(property);

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

    // Check if property is unlocked (local storage or share token)
    useEffect(() => {
        if (typeof window !== 'undefined' && params.id) {
            const localStorageUnlocked = localStorage.getItem(`property_${params.id}_unlocked`) === 'true'
            const shareTokenUnlocked = hasValidShareToken(params.id)
            const kindredGroupAccess = hasKindredGroupAccess()
            
            setIsUnlocked(localStorageUnlocked || shareTokenUnlocked || kindredGroupAccess)
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
                
                // Generate shareable link for the user
                generateShareableLink()
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

    // Generate shareable link
    const generateShareableLink = async () => {
        setIsGeneratingShareUrl(true)
        try {
            const response = await fetch('/api/share/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ propertyId: params.id }),
            })

            const result = await response.json()
            if (result.success) {
                setShareUrl(result.shareUrl)
                // Copy to clipboard
                await navigator.clipboard.writeText(result.shareUrl)
                alert('Shareable link copied to clipboard!')
            } else {
                alert('Failed to generate shareable link. Please try again.')
            }
        } catch (error) {
            console.error('Error generating shareable link:', error)
            alert('Failed to generate shareable link. Please try again.')
        } finally {
            setIsGeneratingShareUrl(false)
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
                                        <div>
                                            <button
                                                onClick={() => setIsModalOpen(true)}
                                                className="btn bg-white text-[#163331] hover:bg-gray-100 px-8 py-4 text-lg font-semibold shadow-xl whitespace-nowrap"
                                            >
                                                Get Full Report
                                            </button>
                                            
                                            {/* Kindred Group Access Button */}
                                            <div className="mt-4 text-sm text-white/90">
                                                <a 
                                                    href={`/property/${params.id}?kindred_group_token=access`}
                                                    className="underline hover:text-white"
                                                >
                                                    Kindred Group Access
                                                </a>
                                            </div>
                                        </div>
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
                                                        <div className="space-y-4">
                                                            <a
                                                                href="https://www.kindred.com.au/sales-property-appraisal"
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-block w-full text-center bg-[#48D98E] text-[#163331] font-semibold py-3 px-6 rounded-lg hover:bg-[#3bc57d] transition-colors duration-200 shadow-lg"
                                                            >
                                                                Book your appraisal today
                                                            </a>
                                                            
                                                            {/* Share Button */}
                                                            <button
                                                                onClick={generateShareableLink}
                                                                disabled={isGeneratingShareUrl}
                                                                className="inline-block w-full text-center bg-white text-[#163331] font-semibold py-3 px-6 rounded-lg hover:bg-gray-100 transition-colors duration-200 shadow-lg"
                                                            >
                                                                {isGeneratingShareUrl ? 'Generating...' : 'Share Property'}
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <p className="text-xs text-white/70 leading-relaxed pt-2">
                                                        {/* This estimate may not include recent renovations or improvements.
                                                        For a personal appraisal, please contact us. */}
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="space-y-6">
                                                    <div>
                                                        <h2 className="text-2xl md:text-3xl font-heading font-semibold text-white/95 mb-4">
                                                            Estimated Value
                                                        </h2>
                                                        <p className="text-white/80 mb-6">
                                                            Unable to generate an estimate for this property.
                                                        </p>
                                                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/15 backdrop-blur-sm rounded-full">
                                                            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                                                            <span className="text-sm font-medium text-white/90">
                                                                Insufficient data
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
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Property Image */}
                                    <div className="relative">
                                        {propertyImages.length > 0 ? (
                                            <div 
                                                className="aspect-[4/3] rounded-xl overflow-hidden shadow-2xl cursor-pointer"
                                                onClick={() => setIsImageGalleryOpen(true)}
                                            >
                                                <img
                                                    src={propertyImages[0]}
                                                    alt={`${property.address} - Main image`}
                                                    className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                                                    loading="eager"
                                                />
                                            </div>
                                        ) : (
                                            <div className="aspect-[4/3] rounded-xl bg-gray-100 flex items-center justify-center shadow-2xl">
                                                <ImageOff className="w-16 h-16 text-gray-400" />
                                            </div>
                                        )}

                                        {propertyImages.length > 1 && (
                                            <div className="absolute bottom-4 right-4 bg-black/70 text-white text-sm px-3 py-1.5 rounded-full backdrop-blur-sm">
                                                {propertyImages.length} photos
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </ScrollReveal>

                        {/* Add the rest of the property page content here */}
                    </div>
                </div>
            </div>

            {/* Lead Capture Modal */}
            {isModalOpen && createPortal(
                <LeadCaptureModal
                    property={property}
                    onSubmit={handleFormSubmit}
                    onClose={() => setIsModalOpen(false)}
                    isSubmitting={isSubmitting}
                    error={formError}
                />,
                document.body
            )}

            {/* Success Modal */}
            {isSuccessModalOpen && createPortal(
                <SuccessModal
                    email={userEmail}
                    propertyAddress={property.address}
                    onClose={() => setIsSuccessModalOpen(false)}
                />,
                document.body
            )}
        </>
    )
}
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
import { hasValidShareToken, hasKindredGroupAccess } from '@/utils/tokenUtils'
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
    const [shareUrl, setShareUrl] = useState('')
    const [isGeneratingShareUrl, setIsGeneratingShareUrl] = useState(false)

    const propertyImages = property?.images || []
    console.log(property);

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

    // Check if property is unlocked (local storage or share token)
    useEffect(() => {
        if (typeof window !== 'undefined' && params.id) {
            const localStorageUnlocked = localStorage.getItem(`property_${params.id}_unlocked`) === 'true'
            const shareTokenUnlocked = hasValidShareToken(params.id)
            const kindredGroupAccess = hasKindredGroupAccess()
            
            setIsUnlocked(localStorageUnlocked || shareTokenUnlocked || kindredGroupAccess)
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
                
                // Generate shareable link for the user
                generateShareableLink()
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

    // Generate shareable link
    const generateShareableLink = async () => {
        setIsGeneratingShareUrl(true)
        try {
            const response = await fetch('/api/share/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ propertyId: params.id }),
            })

            const result = await response.json()
            if (result.success) {
                setShareUrl(result.shareUrl)
                // Copy to clipboard
                await navigator.clipboard.writeText(result.shareUrl)
                alert('Shareable link copied to clipboard!')
            } else {
                alert('Failed to generate shareable link. Please try again.')
            }
        } catch (error) {
            console.error('Error generating shareable link:', error)
            alert('Failed to generate shareable link. Please try again.')
        } finally {
            setIsGeneratingShareUrl(false)
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
                                        <div>
                                            <button
                                                onClick={() => setIsModalOpen(true)}
                                                className="btn bg-white text-[#163331] hover:bg-gray-100 px-8 py-4 text-lg font-semibold shadow-xl whitespace-nowrap"
                                            >
                                                Get Full Report
                                            </button>
                                            
                                            {/* Kindred Group Access Button */}
                                            <div className="mt-4 text-sm text-white/90">
                                                <a 
                                                    href={`/property/${params.id}?kindred_group_token=access`}
                                                    className="underline hover:text-white"
                                                >
                                                    Kindred Group Access
                                                </a>
                                            </div>
                                        </div>
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
                                                        <div className="space-y-4">
                                                            <a
                                                                href="https://www.kindred.com.au/sales-property-appraisal"
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-block w-full text-center bg-[#48D98E] text-[#163331] font-semibold py-3 px-6 rounded-lg hover:bg-[#3bc57d] transition-colors duration-200 shadow-lg"
                                                            >
                                                                Book your appraisal today
                                                            </a>
                                                            
                                                            {/* Share Button */}
                                                            <button
                                                                onClick={generateShareableLink}
                                                                disabled={isGeneratingShareUrl}
                                                                className="inline-block w-full text-center bg-white text-[#163331] font-semibold py-3 px-6 rounded-lg hover:bg-gray-100 transition-colors duration-200 shadow-lg"
                                                            >
                                                                {isGeneratingShareUrl ? 'Generating...' : 'Share Property'}
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <p className="text-xs text-white/70 leading-relaxed pt-2">
                                                        {/* This estimate may not include recent renovations or improvements.
                                                        For a personal appraisal, please contact us. */}
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="space-y-6">
                                                    <div>
                                                        <h2 className="text-2xl md:text-3xl font-heading font-semibold text-white/95 mb-4">
                                                            Estimated Value
                                                        </h2>
                                                        <p className="text-white/80 mb-6">
                                                            Unable to generate an estimate for this property.
                                                        </p>
                                                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/15 backdrop-blur-sm rounded-full">
                                                            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                                                            <span className="text-sm font-medium text-white/90">
                                                                Insufficient data
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
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Property Image */}
                                    <div className="relative">
                                        {propertyImages.length > 0 ? (
                                            <div 
                                                className="aspect-[4/3] rounded-xl overflow-hidden shadow-2xl cursor-pointer"
                                                onClick={() => setIsImageGalleryOpen(true)}
                                            >
                                                <img
                                                    src={propertyImages[0]}
                                                    alt={`${property.address} - Main image`}
                                                    className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                                                    loading="eager"
                                                />
                                            </div>
                                        ) : (
                                            <div className="aspect-[4/3] rounded-xl bg-gray-100 flex items-center justify-center shadow-2xl">
                                                <ImageOff className="w-16 h-16 text-gray-400" />
                                            </div>
                                        )}

                                        {propertyImages.length > 1 && (
                                            <div className="absolute bottom-4 right-4 bg-black/70 text-white text-sm px-3 py-1.5 rounded-full backdrop-blur-sm">
                                                {propertyImages.length} photos
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </ScrollReveal>

                        {/* Add the rest of the property page content here */}
                    </div>
                </div>
            </div>

            {/* Lead Capture Modal */}
            {isModalOpen && createPortal(
                <LeadCaptureModal
                    property={property}
                    onSubmit={handleFormSubmit}
                    onClose={() => setIsModalOpen(false)}
                    isSubmitting={isSubmitting}
                    error={formError}
                />,
                document.body
            )}

            {/* Success Modal */}
            {isSuccessModalOpen && createPortal(
                <SuccessModal
                    email={userEmail}
                    propertyAddress={property.address}
                    onClose={() => setIsSuccessModalOpen(false)}
                />,
                document.body
            )}
        </>
    )
}
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
import { hasValidShareToken, hasKindredGroupAccess } from '@/utils/tokenUtils'
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
    const [shareUrl, setShareUrl] = useState('')
    const [isGeneratingShareUrl, setIsGeneratingShareUrl] = useState(false)

    const propertyImages = property?.images || []
    console.log(property);

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

    // Check if property is unlocked (local storage or share token)
    useEffect(() => {
        if (typeof window !== 'undefined' && params.id) {
            const localStorageUnlocked = localStorage.getItem(`property_${params.id}_unlocked`) === 'true'
            const shareTokenUnlocked = hasValidShareToken(params.id)
            const kindredGroupAccess = hasKindredGroupAccess()
            
            setIsUnlocked(localStorageUnlocked || shareTokenUnlocked || kindredGroupAccess)
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
                
                // Generate shareable link for the user
                generateShareableLink()
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

    // Generate shareable link
    const generateShareableLink = async () => {
        setIsGeneratingShareUrl(true)
        try {
            const response = await fetch('/api/share/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ propertyId: params.id }),
            })

            const result = await response.json()
            if (result.success) {
                setShareUrl(result.shareUrl)
                // Copy to clipboard
                await navigator.clipboard.writeText(result.shareUrl)
                alert('Shareable link copied to clipboard!')
            } else {
                alert('Failed to generate shareable link. Please try again.')
            }
        } catch (error) {
            console.error('Error generating shareable link:', error)
            alert('Failed to generate shareable link. Please try again.')
        } finally {
            setIsGeneratingShareUrl(false)
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
                                        <div>
                                            <button
                                                onClick={() => setIsModalOpen(true)}
                                                className="btn bg-white text-[#163331] hover:bg-gray-100 px-8 py-4 text-lg font-semibold shadow-xl whitespace-nowrap"
                                            >
                                                Get Full Report
                                            </button>
                                            
                                            {/* Kindred Group Access Button */}
                                            <div className="mt-4 text-sm text-white/90">
                                                <a 
                                                    href={`/property/${params.id}?kindred_group_token=access`}
                                                    className="underline hover:text-white"
                                                >
                                                    Kindred Group Access
                                                </a>
                                            </div>
                                        </div>
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
                                                        <div className="space-y-4">
                                                            <a
                                                                href="https://www.kindred.com.au/sales-property-appraisal"
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-block w-full text-center bg-[#48D98E] text-[#163331] font-semibold py-3 px-6 rounded-lg hover:bg-[#3bc57d] transition-colors duration-200 shadow-lg"
                                                            >
                                                                Book your appraisal today
                                                            </a>
                                                            
                                                            {/* Share Button */}
                                                            <button
                                                                onClick={generateShareableLink}
                                                                disabled={isGeneratingShareUrl}
                                                                className="inline-block w-full text-center bg-white text-[#163331] font-semibold py-3 px-6 rounded-lg hover:bg-gray-100 transition-colors duration-200 shadow-lg"
                                                            >
                                                                {isGeneratingShareUrl ? 'Generating...' : 'Share Property'}
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <p className="text-xs text-white/70 leading-relaxed pt-2">
                                                        {/* This estimate may not include recent renovations or improvements.
                                                        For a personal appraisal, please contact us. */}
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="space-y-6">
                                                    <div>
                                                        <h2 className="text-2xl md:text-3xl font-heading font-semibold text-white/95 mb-4">
                                                            Estimated Value
                                                        </h2>
                                                        <p className="text-white/80 mb-6">
                                                            Unable to generate an estimate for this property.
                                                        </p>
                                                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/15 backdrop-blur-sm rounded-full">
                                                            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                                                            <span className="text-sm font-medium text-white/90">
                                                                Insufficient data
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
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Property Image */}
                                    <div className="relative">
                                        {propertyImages.length > 0 ? (
                                            <div 
                                                className="aspect-[4/3] rounded-xl overflow-hidden shadow-2xl cursor-pointer"
                                                onClick={() => setIsImageGalleryOpen(true)}
                                            >
                                                <img
                                                    src={propertyImages[0]}
                                                    alt={`${property.address} - Main image`}
                                                    className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                                                    loading="eager"
                                                />
                                            </div>
                                        ) : (
                                            <div className="aspect-[4/3] rounded-xl bg-gray-100 flex items-center justify-center shadow-2xl">
                                                <ImageOff className="w-16 h-16 text-gray-400" />
                                            </div>
                                        )}

                                        {propertyImages.length > 1 && (
                                            <div className="absolute bottom-4 right-4 bg-black/70 text-white text-sm px-3 py-1.5 rounded-full backdrop-blur-sm">
                                                {propertyImages.length} photos
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </ScrollReveal>

                        {/* Add the rest of the property page content here */}
                    </div>
                </div>
            </div>

            {/* Lead Capture Modal */}
            {isModalOpen && createPortal(
                <LeadCaptureModal
                    property={property}
                    onSubmit={handleFormSubmit}
                    onClose={() => setIsModalOpen(false)}
                    isSubmitting={isSubmitting}
                    error={formError}
                />,
                document.body
            )}

            {/* Success Modal */}
            {isSuccessModalOpen && createPortal(
                <SuccessModal
                    email={userEmail}
                    propertyAddress={property.address}
                    onClose={() => setIsSuccessModalOpen(false)}
                />,
                document.body
            )}
        </>
    )
}
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
import { hasValidShareToken, hasKindredGroupAccess } from '@/utils/tokenUtils'
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
    const [shareUrl, setShareUrl] = useState('')
    const [isGeneratingShareUrl, setIsGeneratingShareUrl] = useState(false)

    const propertyImages = property?.images || []
    console.log(property);

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

    // Check if property is unlocked (local storage or share token)
    useEffect(() => {
        if (typeof window !== 'undefined' && params.id) {
            const localStorageUnlocked = localStorage.getItem(`property_${params.id}_unlocked`) === 'true'
            const shareTokenUnlocked = hasValidShareToken(params.id)
            const kindredGroupAccess = hasKindredGroupAccess()
            
            setIsUnlocked(localStorageUnlocked || shareTokenUnlocked || kindredGroupAccess)
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
                
                // Generate shareable link for the user
                generateShareableLink()
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

    // Generate shareable link
    const generateShareableLink = async () => {
        setIsGeneratingShareUrl(true)
        try {
            const response = await fetch('/api/share/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ propertyId: params.id }),
            })

            const result = await response.json()
            if (result.success) {
                setShareUrl(result.shareUrl)
                // Copy to clipboard
                await navigator.clipboard.writeText(result.shareUrl)
                alert('Shareable link copied to clipboard!')
            } else {
                alert('Failed to generate shareable link. Please try again.')
            }
        } catch (error) {
            console.error('Error generating shareable link:', error)
            alert('Failed to generate shareable link. Please try again.')
        } finally {
            setIsGeneratingShareUrl(false)
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
                                        <div>
                                            <button
                                                onClick={() => setIsModalOpen(true)}
                                                className="btn bg-white text-[#163331] hover:bg-gray-100 px-8 py-4 text-lg font-semibold shadow-xl whitespace-nowrap"
                                            >
                                                Get Full Report
                                            </button>
                                            
                                            {/* Kindred Group Access Button */}
                                            <div className="mt-4 text-sm text-white/90">
                                                <a 
                                                    href={`/property/${params.id}?kindred_group_token=access`}
                                                    className="underline hover:text-white"
                                                >
                                                    Kindred Group Access
                                                </a>
                                            </div>
                                        </div>
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
                                                        <div className="space-y-4">
                                                            <a
                                                                href="https://www.kindred.com.au/sales-property-appraisal"
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-block w-full text-center bg-[#48D98E] text-[#163331] font-semibold py-3 px-6 rounded-lg hover:bg-[#3bc57d] transition-colors duration-200 shadow-lg"
                                                            >
                                                                Book your appraisal today
                                                            </a>
                                                            
                                                            {/* Share Button */}
                                                            <button
                                                                onClick={generateShareableLink}
                                                                disabled={isGeneratingShareUrl}
                                                                className="inline-block w-full text-center bg-white text-[#163331] font-semibold py-3 px-6 rounded-lg hover:bg-gray-100 transition-colors duration-200 shadow-lg"
                                                            >
                                                                {isGeneratingShareUrl ? 'Generating...' : 'Share Property'}
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <p className="text-xs text-white/70 leading-relaxed pt-2">
                                                        {/* This estimate may not include recent renovations or improvements.
                                                        For a personal appraisal, please contact us. */}
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="space-y-6">
                                                    <div>
                                                        <h2 className="text-2xl md:text-3xl font-heading font-semibold text-white/95 mb-4">
                                                            Estimated Value
                                                        </h2>
                                                        <p className="text-white/80 mb-6">
                                                            Unable to generate an estimate for this property.
                                                        </p>
                                                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/15 backdrop-blur-sm rounded-full">
                                                            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                                                            <span className="text-sm font-medium text-white/90">
                                                                Insufficient data
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
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Property Image */}
                                    <div className="relative">
                                        {propertyImages.length > 0 ? (
                                            <div 
                                                className="aspect-[4/3] rounded-xl overflow-hidden shadow-2xl cursor-pointer"
                                                onClick={() => setIsImageGalleryOpen(true)}
                                            >
                                                <img
                                                    src={propertyImages[0]}
                                                    alt={`${property.address} - Main image`}
                                                    className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                                                    loading="eager"
                                                />
                                            </div>
                                        ) : (
                                            <div className="aspect-[4/3] rounded-xl bg-gray-100 flex items-center justify-center shadow-2xl">
                                                <ImageOff className="w-16 h-16 text-gray-400" />
                                            </div>
                                        )}

                                        {propertyImages.length > 1 && (
                                            <div className="absolute bottom-4 right-4 bg-black/70 text-white text-sm px-3 py-1.5 rounded-full backdrop-blur-sm">
                                                {propertyImages.length} photos
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </ScrollReveal>

                        {/* Add the rest of the property page content here */}
                    </div>
                </div>
            </div>

            {/* Lead Capture Modal */}
            {isModalOpen && createPortal(
                <LeadCaptureModal
                    property={property}
                    onSubmit={handleFormSubmit}
                    onClose={() => setIsModalOpen(false)}
                    isSubmitting={isSubmitting}
                    error={formError}
                />,
                document.body
            )}

            {/* Success Modal */}
            {isSuccessModalOpen && createPortal(
                <SuccessModal
                    email={userEmail}
                    propertyAddress={property.address}
                    onClose={() => setIsSuccessModalOpen(false)}
                />,
                document.body
            )}
        </>
    )
}
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
import { hasValidShareToken, hasKindredGroupAccess } from '@/utils/tokenUtils'
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
    const [shareUrl, setShareUrl] = useState('')
    const [isGeneratingShareUrl, setIsGeneratingShareUrl] = useState(false)

    const propertyImages = property?.images || []
    console.log(property);

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

    // Check if property is unlocked (local storage or share token)
    useEffect(() => {
        if (typeof window !== 'undefined' && params.id) {
            const localStorageUnlocked = localStorage.getItem(`property_${params.id}_unlocked`) === 'true'
            const shareTokenUnlocked = hasValidShareToken(params.id)
            const kindredGroupAccess = hasKindredGroupAccess()
            
            setIsUnlocked(localStorageUnlocked || shareTokenUnlocked || kindredGroupAccess)
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
                
                // Generate shareable link for the user
                generateShareableLink()
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

    // Generate shareable link
    const generateShareableLink = async () => {
        setIsGeneratingShareUrl(true)
        try {
            const response = await fetch('/api/share/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ propertyId: params.id }),
            })

            const result = await response.json()
            if (result.success) {
                setShareUrl(result.shareUrl)
                // Copy to clipboard
                await navigator.clipboard.writeText(result.shareUrl)
                alert('Shareable link copied to clipboard!')
            } else {
                alert('Failed to generate shareable link. Please try again.')
            }
        } catch (error) {
            console.error('Error generating shareable link:', error)
            alert('Failed to generate shareable link. Please try again.')
        } finally {
            setIsGeneratingShareUrl(false)
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
                                        <div>
                                            <button
                                                onClick={() => setIsModalOpen(true)}
                                                className="btn bg-white text-[#163331] hover:bg-gray-100 px-8 py-4 text-lg font-semibold shadow-xl whitespace-nowrap"
                                            >
                                                Get Full Report
                                            </button>
                                            
                                            {/* Kindred Group Access Button */}
                                            <div className="mt-4 text-sm text-white/90">
                                                <a 
                                                    href={`/property/${params.id}?kindred_group_token=access`}
                                                    className="underline hover:text-white"
                                                >
                                                    Kindred Group Access
                                                </a>
                                            </div>
                                        </div>
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
                                                        <div className="space-y-4">
                                                            <a
                                                                href="https://www.kindred.com.au/sales-property-appraisal"
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-block w-full text-center bg-[#48D98E] text-[#163331] font-semibold py-3 px-6 rounded-lg hover:bg-[#3bc57d] transition-colors duration-200 shadow-lg"
                                                            >
                                                                Book your appraisal today
                                                            </a>
                                                            
                                                            {/* Share Button */}
                                                            <button
                                                                onClick={generateShareableLink}
                                                                disabled={isGeneratingShareUrl}
                                                                className="inline-block w-full text-center bg-white text-[#163331] font-semibold py-3 px-6 rounded-lg hover:bg-gray-100 transition-colors duration-200 shadow-lg"
                                                            >
                                                                {isGeneratingShareUrl ? 'Generating...' : 'Share Property'}
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <p className="text-xs text-white/70 leading-relaxed pt-2">
                                                        {/* This estimate may not include recent renovations or improvements.
                                                        For a personal appraisal, please contact us. */}
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="space-y-6">
                                                    <div>
                                                        <h2 className="text-2xl md:text-3xl font-heading font-semibold text-white/95 mb-4">
                                                            Estimated Value
                                                        </h2>
                                                        <p className="text-white/80 mb-6">
                                                            Unable to generate an estimate for this property.
                                                        </p>
                                                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/15 backdrop-blur-sm rounded-full">
                                                            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                                                            <span className="text-sm font-medium text-white/90">
                                                                Insufficient data
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
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Property Image */}
                                    <div className="relative">
                                        {propertyImages.length > 0 ? (
                                            <div 
                                                className="aspect-[4/3] rounded-xl overflow-hidden shadow-2xl cursor-pointer"
                                                onClick={() => setIsImageGalleryOpen(true)}
                                            >
                                                <img
                                                    src={propertyImages[0]}
                                                    alt={`${property.address} - Main image`}
                                                    className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                                                    loading="eager"
                                                />
                                            </div>
                                        ) : (
                                            <div className="aspect-[4/3] rounded-xl bg-gray-100 flex items-center justify-center shadow-2xl">
                                                <ImageOff className="w-16 h-16 text-gray-400" />
                                            </div>
                                        )}

                                        {propertyImages.length > 1 && (
                                            <div className="absolute bottom-4 right-4 bg-black/70 text-white text-sm px-3 py-1.5 rounded-full backdrop-blur-sm">
                                                {propertyImages.length} photos
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </ScrollReveal>

                        {/* Add the rest of the property page content here */}
                    </div>
                </div>
            </div>

            {/* Lead Capture Modal */}
            {isModalOpen && createPortal(
                <LeadCaptureModal
                    property={property}
                    onSubmit={handleFormSubmit}
                    onClose={() => setIsModalOpen(false)}
                    isSubmitting={isSubmitting}
                    error={formError}
                />,
                document.body
            )}

            {/* Success Modal */}
            {isSuccessModalOpen && createPortal(
                <SuccessModal
                    email={userEmail}
                    propertyAddress={property.address}
                    onClose={() => setIsSuccessModalOpen(false)}
                />,
                document.body
            )}
        </>
    )
}
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
import { hasValidShareToken, hasKindredGroupAccess } from '@/utils/tokenUtils'
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
    const [shareUrl, setShareUrl] = useState('')
    const [isGeneratingShareUrl, setIsGeneratingShareUrl] = useState(false)

    const propertyImages = property?.images || []
    console.log(property);

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

    // Check if property is unlocked (local storage or share token)
    useEffect(() => {
        if (typeof window !== 'undefined' && params.id) {
            const localStorageUnlocked = localStorage.getItem(`property_${params.id}_unlocked`) === 'true'
            const shareTokenUnlocked = hasValidShareToken(params.id)
            const kindredGroupAccess = hasKindredGroupAccess()
            
            setIsUnlocked(localStorageUnlocked || shareTokenUnlocked || kindredGroupAccess)
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
                
                // Generate shareable link for the user
                generateShareableLink()
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

    // Generate shareable link
    const generateShareableLink = async () => {
        setIsGeneratingShareUrl(true)
        try {
            const response = await fetch('/api/share/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ propertyId: params.id }),
            })

            const result = await response.json()
            if (result.success) {
                setShareUrl(result.shareUrl)
                // Copy to clipboard
                await navigator.clipboard.writeText(result.shareUrl)
                alert('Shareable link copied to clipboard!')
            } else {
                alert('Failed to generate shareable link. Please try again.')
            }
        } catch (error) {
            console.error('Error generating shareable link:', error)
            alert('Failed to generate shareable link. Please try again.')
        } finally {
            setIsGeneratingShareUrl(false)
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
                                        <div>
                                            <button
                                                onClick={() => setIsModalOpen(true)}
                                                className="btn bg-white text-[#163331] hover:bg-gray-100 px-8 py-4 text-lg font-semibold shadow-xl whitespace-nowrap"
                                            >
                                                Get Full Report
                                            </button>
                                            
                                            {/* Kindred Group Access Button */}
                                            <div className="mt-4 text-sm text-white/90">
                                                <a 
                                                    href={`/property/${params.id}?kindred_group_token=access`}
                                                    className="underline hover:text-white"
                                                >
                                                    Kindred Group Access
                                                </a>
                                            </div>
                                        </div>
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
                                                        <div className="space-y-4">
                                                            <a
                                                                href="https://www.kindred.com.au/sales-property-appraisal"
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-block w-full text-center bg-[#48D98E] text-[#163331] font-semibold py-3 px-6 rounded-lg hover:bg-[#3bc57d] transition-colors duration-200 shadow-lg"
                                                            >
                                                                Book your appraisal today
                                                            </a>
                                                            
                                                            {/* Share Button */}
                                                            <button
                                                                onClick={generateShareableLink}
                                                                disabled={isGeneratingShareUrl}
                                                                className="inline-block w-full text-center bg-white text-[#163331] font-semibold py-3 px-6 rounded-lg hover:bg-gray-100 transition-colors duration-200 shadow-lg"
                                                            >
                                                                {isGeneratingShareUrl ? 'Generating...' : 'Share Property'}
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <p className="text-xs text-white/70 leading-relaxed pt-2">
                                                        {/* This estimate may not include recent renovations or improvements.
                                                        For a personal appraisal, please contact us. */}
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="space-y-6">
                                                    <div>
                                                        <h2 className="text-2xl md:text-3xl font-heading font-semibold text-white/95 mb-4">
                                                            Estimated Value
                                                        </h2>
                                                        <p className="text-white/80 mb-6">
                                                            Unable to generate an estimate for this property.
                                                        </p>
                                                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/15 backdrop-blur-sm rounded-full">
                                                            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                                                            <span className="text-sm font-medium text-white/90">
                                                                Insufficient data
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
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Property Image */}
                                    <div className="relative">
                                        {propertyImages.length > 0 ? (
                                            <div 
                                                className="aspect-[4/3] rounded-xl overflow-hidden shadow-2xl cursor-pointer"
                                                onClick={() => setIsImageGalleryOpen(true)}
                                            >
                                                <img
                                                    src={propertyImages[0]}
                                                    alt={`${property.address} - Main image`}
                                                    className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                                                    loading="eager"
                                                />
                                            </div>
                                        ) : (
                                            <div className="aspect-[4/3] rounded-xl bg-gray-100 flex items-center justify-center shadow-2xl">
                                                <ImageOff className="w-16 h-16 text-gray-400" />
                                            </div>
                                        )}

                                        {propertyImages.length > 1 && (
                                            <div className="absolute bottom-4 right-4 bg-black/70 text-white text-sm px-3 py-1.5 rounded-full backdrop-blur-sm">
                                                {propertyImages.length} photos
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </ScrollReveal>

                        {/* Add the rest of the property page content here */}
                    </div>
                </div>
            </div>

            {/* Lead Capture Modal */}
            {isModalOpen && createPortal(
                <LeadCaptureModal
                    property={property}
                    onSubmit={handleFormSubmit}
                    onClose={() => setIsModalOpen(false)}
                    isSubmitting={isSubmitting}
                    error={formError}
                />,
                document.body
            )}

            {/* Success Modal */}
            {isSuccessModalOpen && createPortal(
                <SuccessModal
                    email={userEmail}
                    propertyAddress={property.address}
                    onClose={() => setIsSuccessModalOpen(false)}
                />,
                document.body
            )}
        </>
    )
}
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
import { hasValidShareToken, hasKindredGroupAccess } from '@/utils/tokenUtils'
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
    const [shareUrl, setShareUrl] = useState('')
    const [isGeneratingShareUrl, setIsGeneratingShareUrl] = useState(false)

    const propertyImages = property?.images || []
    console.log(property);

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

    // Check if property is unlocked (local storage or share token)
    useEffect(() => {
        if (typeof window !== 'undefined' && params.id) {
            const localStorageUnlocked = localStorage.getItem(`property_${params.id}_unlocked`) === 'true'
            const shareTokenUnlocked = hasValidShareToken(params.id)
            const kindredGroupAccess = hasKindredGroupAccess()
            
            setIsUnlocked(localStorageUnlocked || shareTokenUnlocked || kindredGroupAccess)
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
                
                // Generate shareable link for the user
                generateShareableLink()
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

    // Generate shareable link
    const generateShareableLink = async () => {
        setIsGeneratingShareUrl(true)
        try {
            const response = await fetch('/api/share/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ propertyId: params.id }),
            })

            const result = await response.json()
            if (result.success) {
                setShareUrl(result.shareUrl)
                // Copy to clipboard
                await navigator.clipboard.writeText(result.shareUrl)
                alert('Shareable link copied to clipboard!')
            } else {
                alert('Failed to generate shareable link. Please try again.')
            }
        } catch (error) {
            console.error('Error generating shareable link:', error)
            alert('Failed to generate shareable link. Please try again.')
        } finally {
            setIsGeneratingShareUrl(false)
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
                                        <div>
                                            <button
                                                onClick={() => setIsModalOpen(true)}
                                                className="btn bg-white text-[#163331] hover:bg-gray-100 px-8 py-4 text-lg font-semibold shadow-xl whitespace-nowrap"
                                            >
                                                Get Full Report
                                            </button>
                                            
                                            {/* Kindred Group Access Button */}
                                            <div className="mt-4 text-sm text-white/90">
                                                <a 
                                                    href={`/property/${params.id}?kindred_group_token=access`}
                                                    className="underline hover:text-white"
                                                >
                                                    Kindred Group Access
                                                </a>
                                            </div>
                                        </div>
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
                                                        <div className="space-y-4">
                                                            <a
                                                                href="https://www.kindred.com.au/sales-property-appraisal"
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-block w-full text-center bg-[#48D98E] text-[#163331] font-semibold py-3 px-6 rounded-lg hover:bg-[#3bc57d] transition-colors duration-200 shadow-lg"
                                                            >
                                                                Book your appraisal today
                                                            </a>
                                                            
                                                            {/* Share Button */}
                                                            <button
                                                                onClick={generateShareableLink}
                                                                disabled={isGeneratingShareUrl}
                                                                className="inline-block w-full text-center bg-white text-[#163331] font-semibold py-3 px-6 rounded-lg hover:bg-gray-100 transition-colors duration-200 shadow-lg"
                                                            >
                                                                {isGeneratingShareUrl ? 'Generating...' : 'Share Property'}
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <p className="text-xs text-white/70 leading-relaxed pt-2">
                                                        {/* This estimate may not include recent renovations or improvements.
                                                        For a personal appraisal, please contact us. */}
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="space-y-6">
                                                    <div>
                                                        <h2 className="text-2xl md:text-3xl font-heading font-semibold text-white/95 mb-4">
                                                            Estimated Value
                                                        </h2>
                                                        <p className="text-white/80 mb-6">
                                                            Unable to generate an estimate for this property.
                                                        </p>
                                                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/15 backdrop-blur-sm rounded-full">
                                                            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                                                            <span className="text-sm font-medium text-white/90">
                                                                Insufficient data
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
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Property Image */}
                                    <div className="relative">
                                        {propertyImages.length > 0 ? (
                                            <div 
                                                className="aspect-[4/3] rounded-xl overflow-hidden shadow-2xl cursor-pointer"
                                                onClick={() => setIsImageGalleryOpen(true)}
                                            >
                                                <img
                                                    src={propertyImages[0]}
                                                    alt={`${property.address} - Main image`}
                                                    className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                                                    loading="eager"
                                                />
                                            </div>
                                        ) : (
                                            <div className="aspect-[4/3] rounded-xl bg-gray-100 flex items-center justify-center shadow-2xl">
                                                <ImageOff className="w-16 h-16 text-gray-400" />
                                            </div>
                                        )}

                                        {propertyImages.length > 1 && (
                                            <div className="absolute bottom-4 right-4 bg-black/70 text-white text-sm px-3 py-1.5 rounded-full backdrop-blur-sm">
                                                {propertyImages.length} photos
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </ScrollReveal>

                        {/* Add the rest of the property page content here */}
                    </div>
                </div>
            </div>

            {/* Lead Capture Modal */}
            {isModalOpen && createPortal(
                <LeadCaptureModal
                    property={property}
                    onSubmit={handleFormSubmit}
                    onClose={() => setIsModalOpen(false)}
                    isSubmitting={isSubmitting}
                    error={formError}
                />,
                document.body
            )}

            {/* Success Modal */}
            {isSuccessModalOpen && createPortal(
                <SuccessModal
                    email={userEmail}
                    propertyAddress={property.address}
                    onClose={() => setIsSuccessModalOpen(false)}
                />,
                document.body
            )}
        </>
    )
}
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
import { hasValidShareToken, hasKindredGroupAccess } from '@/utils/tokenUtils'
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
    const [shareUrl, setShareUrl] = useState('')
    const [isGeneratingShareUrl, setIsGeneratingShareUrl] = useState(false)

    const propertyImages = property?.images || []
    console.log(property);

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

    // Check if property is unlocked (local storage or share token)
    useEffect(() => {
        if (typeof window !== 'undefined' && params.id) {
            const localStorageUnlocked = localStorage.getItem(`property_${params.id}_unlocked`) === 'true'
            const shareTokenUnlocked = hasValidShareToken(params.id)
            const kindredGroupAccess = hasKindredGroupAccess()
            
            setIsUnlocked(localStorageUnlocked || shareTokenUnlocked || kindredGroupAccess)
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
                
                // Generate shareable link for the user
                generateShareableLink()
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

    // Generate shareable link
    const generateShareableLink = async () => {
        setIsGeneratingShareUrl(true)
        try {
            const response = await fetch('/api/share/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ propertyId: params.id }),
            })

            const result = await response.json()
            if (result.success) {
                setShareUrl(result.shareUrl)
                // Copy to clipboard
                await navigator.clipboard.writeText(result.shareUrl)
                alert('Shareable link copied to clipboard!')
            } else {
                alert('Failed to generate shareable link. Please try again.')
            }
        } catch (error) {
            console.error('Error generating shareable link:', error)
            alert('Failed to generate shareable link. Please try again.')
        } finally {
            setIsGeneratingShareUrl(false)
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
                                        <div>
                                            <button
                                                onClick={() => setIsModalOpen(true)}
                                                className="btn bg-white text-[#163331] hover:bg-gray-100 px-8 py-4 text-lg font-semibold shadow-xl whitespace-nowrap"
                                            >
                                                Get Full Report
                                            </button>
                                            
                                            {/* Kindred Group Access Button */}
                                            <div className="mt-4 text-sm text-white/90">
                                                <a 
                                                    href={`/property/${params.id}?kindred_group_token=access`}
                                                    className="underline hover:text-white"
                                                >
                                                    Kindred Group Access
                                                </a>
                                            </div>
                                        </div>
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
                                                        <div className="space-y-4">
                                                            <a
                                                                href="https://www.kindred.com.au/sales-property-appraisal"
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-block w-full text-center bg-[#48D98E] text-[#163331] font-semibold py-3 px-6 rounded-lg hover:bg-[#3bc57d] transition-colors duration-200 shadow-lg"
                                                            >
                                                                Book your appraisal today
                                                            </a>
                                                            
                                                            {/* Share Button */}
                                                            <button
                                                                onClick={generateShareableLink}
                                                                disabled={isGeneratingShareUrl}
                                                                className="inline-block w-full text-center bg-white text-[#163331] font-semibold py-3 px-6 rounded-lg hover:bg-gray-100 transition-colors duration-200 shadow-lg"
                                                            >
                                                                {isGeneratingShareUrl ? 'Generating...' : 'Share Property'}
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <p className="text-xs text-white/70 leading-relaxed pt-2">
                                                        {/* This estimate may not include recent renovations or improvements.
                                                        For a personal appraisal, please contact us. */}
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="space-y-6">
                                                    <div>
                                                        <h2 className="text-2xl md:text-3xl font-heading font-semibold text-white/95 mb-4">
                                                            Estimated Value
                                                        </h2>
                                                        <p className="text-white/80 mb-6">
                                                            Unable to generate an estimate for this property.
                                                        </p>
                                                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/15 backdrop-blur-sm rounded-full">
                                                            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                                                            <span className="text-sm font-medium text-white/90">
                                                                Insufficient data
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
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Property Image */}
                                    <div className="relative">
                                        {propertyImages.length > 0 ? (
                                            <div 
                                                className="aspect-[4/3] rounded-xl overflow-hidden shadow-2xl cursor-pointer"
                                                onClick={() => setIsImageGalleryOpen(true)}
                                            >
                                                <img
                                                    src={propertyImages[0]}
                                                    alt={`${property.address} - Main image`}
                                                    className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                                                    loading="eager"
                                                />
                                            </div>
                                        ) : (
                                            <div className="aspect-[4/3] rounded-xl bg-gray-100 flex items-center justify-center shadow-2xl">
                                                <ImageOff className="w-16 h-16 text-gray-400" />
                                            </div>
                                        )}

                                        {propertyImages.length > 1 && (
                                            <div className="absolute bottom-4 right-4 bg-black/70 text-white text-sm px-3 py-1.5 rounded-full backdrop-blur-sm">
                                                {propertyImages.length} photos
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </ScrollReveal>

                        {/* Add the rest of the property page content here */}
                    </div>
                </div>
            </div>

            {/* Lead Capture Modal */}
            {isModalOpen && createPortal(
                <LeadCaptureModal
                    property={property}
                    onSubmit={handleFormSubmit}
                    onClose={() => setIsModalOpen(false)}
                    isSubmitting={isSubmitting}
                    error={formError}
                />,
                document.body
            )}

            {/* Success Modal */}
            {isSuccessModalOpen && createPortal(
                <SuccessModal
                    email={userEmail}
                    propertyAddress={property.address}
                    onClose={() => setIsSuccessModalOpen(false)}
                />,
                document.body
            )}
        </>
    )
}
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
import { hasValidShareToken, hasKindredGroupAccess } from '@/utils/tokenUtils'
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
    const [shareUrl, setShareUrl] = useState('')
    const [isGeneratingShareUrl, setIsGeneratingShareUrl] = useState(false)

    const propertyImages = property?.images || []
    console.log(property);

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

    // Check if property is unlocked (local storage or share token)
    useEffect(() => {
        if (typeof window !== 'undefined' && params.id) {
            const localStorageUnlocked = localStorage.getItem(`property_${params.id}_unlocked`) === 'true'
            const shareTokenUnlocked = hasValidShareToken(params.id)
            const kindredGroupAccess = hasKindredGroupAccess()
            
            setIsUnlocked(localStorageUnlocked || shareTokenUnlocked || kindredGroupAccess)
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
                
                // Generate shareable link for the user
                generateShareableLink()
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

    // Generate shareable link
    const generateShareableLink = async () => {
        setIsGeneratingShareUrl(true)
        try {
            const response = await fetch('/api/share/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ propertyId: params.id }),
            })

            const result = await response.json()
            if (result.success) {
                setShareUrl(result.shareUrl)
                // Copy to clipboard
                await navigator.clipboard.writeText(result.shareUrl)
                alert('Shareable link copied to clipboard!')
            } else {
                alert('Failed to generate shareable link. Please try again.')
            }
        } catch (error) {
            console.error('Error generating shareable link:', error)
            alert('Failed to generate shareable link. Please try again.')
        } finally {
            setIsGeneratingShareUrl(false)
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
                                        <div>
                                            <button
                                                onClick={() => setIsModalOpen(true)}
                                                className="btn bg-white text-[#163331] hover:bg-gray-100 px-8 py-4 text-lg font-semibold shadow-xl whitespace-nowrap"
                                            >
                                                Get Full Report
                                            </button>
                                            
                                            {/* Kindred Group Access Button */}
                                            <div className="mt-4 text-sm text-white/90">
                                                <a 
                                                    href={`/property/${params.id}?kindred_group_token=access`}
                                                    className="underline hover:text-white"
                                                >
                                                    Kindred Group Access
                                                </a>
                                            </div>
                                        </div>
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
                                                        <div className="space-y-4">
                                                            <a
                                                                href="https://www.kindred.com.au/sales-property-appraisal"
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-block w-full text-center bg-[#48D98E] text-[#163331] font-semibold py-3 px-6 rounded-lg hover:bg-[#3bc57d] transition-colors duration-200 shadow-lg"
                                                            >
                                                                Book your appraisal today
                                                            </a>
                                                            
                                                            {/* Share Button */}
                                                            <button
                                                                onClick={generateShareableLink}
                                                                disabled={isGeneratingShareUrl}
                                                                className="inline-block w-full text-center bg-white text-[#163331] font-semibold py-3 px-6 rounded-lg hover:bg-gray-100 transition-colors duration-200 shadow-lg"
                                                            >
                                                                {isGeneratingShareUrl ? 'Generating...' : 'Share Property'}
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <p className="text-xs text-white/70 leading-relaxed pt-2">
                                                        {/* This estimate may not include recent renovations or improvements.
                                                        For a personal appraisal, please contact us. */}
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="space-y-6">
                                                    <div>
                                                        <h2 className="text-2xl md:text-3xl font-heading font-semibold text-white/95 mb-4">
                                                            Estimated Value
                                                        </h2>
                                                        <p className="text-white/80 mb-6">
                                                            Unable to generate an estimate for this property.
                                                        </p>
                                                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/15 backdrop-blur-sm rounded-full">
                                                            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                                                            <span className="text-sm font-medium text-white/90">
                                                                Insufficient data
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
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Property Image */}
                                    <div className="relative">
                                        {propertyImages.length > 0 ? (
                                            <div 
                                                className="aspect-[4/3] rounded-xl overflow-hidden shadow-2xl cursor-pointer"
                                                onClick={() => setIsImageGalleryOpen(true)}
                                            >
                                                <img
                                                    src={propertyImages[0]}
                                                    alt={`${property.address} - Main image`}
                                                    className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                                                    loading="eager"
                                                />
                                            </div>
                                        ) : (
                                            <div className="aspect-[4/3] rounded-xl bg-gray-100 flex items-center justify-center shadow-2xl">
                                                <ImageOff className="w-16 h-16 text-gray-400" />
                                            </div>
                                        )}

                                        {propertyImages.length > 1 && (
                                            <div className="absolute bottom-4 right-4 bg-black/70 text-white text-sm px-3 py-1.5 rounded-full backdrop-blur-sm">
                                                {propertyImages.length} photos
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </ScrollReveal>

                        {/* Add the rest of the property page content here */}
                    </div>
                </div>
            </div>

            {/* Lead Capture Modal */}
            {isModalOpen && createPortal(
                <LeadCaptureModal
                    property={property}
                    onSubmit={handleFormSubmit}
                    onClose={() => setIsModalOpen(false)}
                    isSubmitting={isSubmitting}
                    error={formError}
                />,
                document.body
            )}

            {/* Success Modal */}
            {isSuccessModalOpen && createPortal(
                <SuccessModal
                    email={userEmail}
                    propertyAddress={property.address}
                    onClose={() => setIsSuccessModalOpen(false)}
                />,
                document.body
            )}
        </>
    )
}
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
import { hasValidShareToken, hasKindredGroupAccess } from '@/utils/tokenUtils'
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
    const [shareUrl, setShareUrl] = useState('')
    const [isGeneratingShareUrl, setIsGeneratingShareUrl] = useState(false)

    const propertyImages = property?.images || []
    console.log(property);

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

    // Check if property is unlocked (local storage or share token)
    useEffect(() => {
        if (typeof window !== 'undefined' && params.id) {
            const localStorageUnlocked = localStorage.getItem(`property_${params.id}_unlocked`) === 'true'
            const shareTokenUnlocked = hasValidShareToken(params.id)
            const kindredGroupAccess = hasKindredGroupAccess()
            
            setIsUnlocked(localStorageUnlocked || shareTokenUnlocked || kindredGroupAccess)
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
                
                // Generate shareable link for the user
                generateShareableLink()
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

    // Generate shareable link
    const generateShareableLink = async () => {
        setIsGeneratingShareUrl(true)
        try {
            const response = await fetch('/api/share/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ propertyId: params.id }),
            })

            const result = await response.json()
            if (result.success) {
                setShareUrl(result.shareUrl)
                // Copy to clipboard
                await navigator.clipboard.writeText(result.shareUrl)
                alert('Shareable link copied to clipboard!')
            } else {
                alert('Failed to generate shareable link. Please try again.')
            }
        } catch (error) {
            console.error('Error generating shareable link:', error)
            alert('Failed to generate shareable link. Please try again.')
        } finally {
            setIsGeneratingShareUrl(false)
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
                                        <div>
                                            <button
                                                onClick={() => setIsModalOpen(true)}
                                                className="btn bg-white text-[#163331] hover:bg-gray-100 px-8 py-4 text-lg font-semibold shadow-xl whitespace-nowrap"
                                            >
                                                Get Full Report
                                            </button>
                                            
                                            {/* Kindred Group Access Button */}
                                            <div className="mt-4 text-sm text-white/90">
                                                <a 
                                                    href={`/property/${params.id}?kindred_group_token=access`}
                                                    className="underline hover:text-white"
                                                >
                                                    Kindred Group Access
                                                </a>
                                            </div>
                                        </div>
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
                                                        <div className="space-y-4">
                                                            <a
                                                                href="https://www.kindred.com.au/sales-property-appraisal"
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-block w-full text-center bg-[#48D98E] text-[#163331] font-semibold py-3 px-6 rounded-lg hover:bg-[#3bc57d] transition-colors duration-200 shadow-lg"
                                                            >
                                                                Book your appraisal today
                                                            </a>
                                                            
                                                            {/* Share Button */}
                                                            <button
                                                                onClick={generateShareableLink}
                                                                disabled={isGeneratingShareUrl}
                                                                className="inline-block w-full text-center bg-white text-[#163331] font-semibold py-3 px-6 rounded-lg hover:bg-gray-100 transition-colors duration-200 shadow-lg"
                                                            >
                                                                {isGeneratingShareUrl ? 'Generating...' : 'Share Property'}
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <p className="text-xs text-white/70 leading-relaxed pt-2">
                                                        {/* This estimate may not include recent renovations or improvements.
                                                        For a personal appraisal, please contact us. */}
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="space-y-6">
                                                    <div>
                                                        <h2 className="text-2xl md:text-3xl font-heading font-semibold text-white/95 mb-4">
                                                            Estimated Value
                                                        </h2>
                                                        <p className="text-white/80 mb-6">
                                                            Unable to generate an estimate for this property.
                                                        </p>
                                                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/15 backdrop-blur-sm rounded-full">
                                                            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                                                            <span className="text-sm font-medium text-white/90">
                                                                Insufficient data
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
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Property Image */}
                                    <div className="relative">
                                        {propertyImages.length > 0 ? (
                                            <div 
                                                className="aspect-[4/3] rounded-xl overflow-hidden shadow-2xl cursor-pointer"
                                                onClick={() => setIsImageGalleryOpen(true)}
                                            >
                                                <img
                                                    src={propertyImages[0]}
                                                    alt={`${property.address} - Main image`}
                                                    className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                                                    loading="eager"
                                                />
                                            </div>
                                        ) : (
                                            <div className="aspect-[4/3] rounded-xl bg-gray-100 flex items-center justify-center shadow-2xl">
                                                <ImageOff className="w-16 h-16 text-gray-400" />
                                            </div>
                                        )}

                                        {propertyImages.length > 1 && (
                                            <div className="absolute bottom-4 right-4 bg-black/70 text-white text-sm px-3 py-1.5 rounded-full backdrop-blur-sm">
                                                {propertyImages.length} photos
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </ScrollReveal>

                        {/* Add the rest of the property page content here */}
                    </div>
                </div>
            </div>

            {/* Lead Capture Modal */}
            {isModalOpen && createPortal(
                <LeadCaptureModal
                    property={property}
                    onSubmit={handleFormSubmit}
                    onClose={() => setIsModalOpen(false)}
                    isSubmitting={isSubmitting}
                    error={formError}
                />,
                document.body
            )}

            {/* Success Modal */}
            {isSuccessModalOpen && createPortal(
                <SuccessModal
                    email={userEmail}
                    propertyAddress={property.address}
                    onClose={() => setIsSuccessModalOpen(false)}
                />,
                document.body
            )}
        </>
    )
}
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
import { hasValidShareToken, hasKindredGroupAccess } from '@/utils/tokenUtils'
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
    const [shareUrl, setShareUrl] = useState('')
    const [isGeneratingShareUrl, setIsGeneratingShareUrl] = useState(false)

    const propertyImages = property?.images || []
    console.log(property);

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

    // Check if property is unlocked (local storage or share token)
    useEffect(() => {
        if (typeof window !== 'undefined' && params.id) {
            const localStorageUnlocked = localStorage.getItem(`property_${params.id}_unlocked`) === 'true'
            const shareTokenUnlocked = hasValidShareToken(params.id)
            const kindredGroupAccess = hasKindredGroupAccess()
            
            setIsUnlocked(localStorageUnlocked || shareTokenUnlocked || kindredGroupAccess)
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
                
                // Generate shareable link for the user
                generateShareableLink()
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

    // Generate shareable link
    const generateShareableLink = async () => {
        setIsGeneratingShareUrl(true)
        try {
            const response = await fetch('/api/share/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ propertyId: params.id }),
            })

            const result = await response.json()
            if (result.success) {
                setShareUrl(result.shareUrl)
                // Copy to clipboard
                await navigator.clipboard.writeText(result.shareUrl)
                alert('Shareable link copied to clipboard!')
            } else {
                alert('Failed to generate shareable link. Please try again.')
            }
        } catch (error) {
            console.error('Error generating shareable link:', error)
            alert('Failed to generate shareable link. Please try again.')
        } finally {
            setIsGeneratingShareUrl(false)
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
                                        <div>
                                            <button
                                                onClick={() => setIsModalOpen(true)}
                                                className="btn bg-white text-[#163331] hover:bg-gray-100 px-8 py-4 text-lg font-semibold shadow-xl whitespace-nowrap"
                                            >
                                                Get Full Report
                                            </button>
                                            
                                            {/* Kindred Group Access Button */}
                                            <div className="mt-4 text-sm text-white/90">
                                                <a 
                                                    href={`/property/${params.id}?kindred_group_token=access`}
                                                    className="underline hover:text-white"
                                                >
                                                    Kindred Group Access
                                                </a>
                                            </div>
                                        </div>
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
                                                        <div className="space-y-4">
                                                            <a
                                                                href="https://www.kindred.com.au/sales-property-appraisal"
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-block w-full text-center bg-[#48D98E] text-[#163331] font-semibold py-3 px-6 rounded-lg hover:bg-[#3bc57d] transition-colors duration-200 shadow-lg"
                                                            >
                                                                Book your appraisal today
                                                            </a>
                                                            
                                                            {/* Share Button */}
                                                            <button
                                                                onClick={generateShareableLink}
                                                                disabled={isGeneratingShareUrl}
                                                                className="inline-block w-full text-center bg-white text-[#163331] font-semibold py-3 px-6 rounded-lg hover:bg-gray-100 transition-colors duration-200 shadow-lg"
                                                            >
                                                                {isGeneratingShareUrl ? 'Generating...' : 'Share Property'}
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <p className="text-xs text-white/70 leading-relaxed pt-2">
                                                        {/* This estimate may not include recent renovations or improvements.
                                                        For a personal appraisal, please contact us. */}
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="space-y-6">
                                                    <div>
                                                        <h2 className="text-2xl md:text-3xl font-heading font-semibold text-white/95 mb-4">
                                                            Estimated Value
                                                        </h2>
                                                        <p className="text-white/80 mb-6">
                                                            Unable to generate an estimate for this property.
                                                        </p>
                                                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/15 backdrop-blur-sm rounded-full">
                                                            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                                                            <span className="text-sm font-medium text-white/90">
                                                                Insufficient data
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
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Property Image */}
                                    <div className="relative">
                                        {propertyImages.length > 0 ? (
                                            <div 
                                                className="aspect-[4/3] rounded-xl overflow-hidden shadow-2xl cursor-pointer"
                                                onClick={() => setIsImageGalleryOpen(true)}
                                            >
                                                <img
                                                    src={propertyImages[0]}
                                                    alt={`${property.address} - Main image`}
                                                    className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                                                    loading="eager"
                                                />
                                            </div>
                                        ) : (
                                            <div className="aspect-[4/3] rounded-xl bg-gray-100 flex items-center justify-center shadow-2xl">
                                                <ImageOff className="w-16 h-16 text-gray-400" />
                                            </div>
                                        )}

                                        {propertyImages.length > 1 && (
                                            <div className="absolute bottom-4 right-4 bg-black/70 text-white text-sm px-3 py-1.5 rounded-full backdrop-blur-sm">
                                                {propertyImages.length} photos
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </ScrollReveal>

                        {/* Add the rest of the property page content here */}
                    </div>
                </div>
            </div>

            {/* Lead Capture Modal */}
            {isModalOpen && createPortal(
                <LeadCaptureModal
                    property={property}
                    onSubmit={handleFormSubmit}
                    onClose={() => setIsModalOpen(false)}
                    isSubmitting={isSubmitting}
                    error={formError}
                />,
                document.body
            )}

            {/* Success Modal */}
            {isSuccessModalOpen && createPortal(
                <SuccessModal
                    email={userEmail}
                    propertyAddress={property.address}
                    onClose={() => setIsSuccessModalOpen(false)}
                />,
                document.body
            )}
        </>
    )
}
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
import { hasValidShareToken, hasKindredGroupAccess } from '@/utils/tokenUtils'
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
    const [shareUrl, setShareUrl] = useState('')
    const [isGeneratingShareUrl, setIsGeneratingShareUrl] = useState(false)

    const propertyImages = property?.images || []
    console.log(property);

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

    // Check if property is unlocked (local storage or share token)
    useEffect(() => {
        if (typeof window !== 'undefined' && params.id) {
            const localStorageUnlocked = localStorage.getItem(`property_${params.id}_unlocked`) === 'true'
            const shareTokenUnlocked = hasValidShareToken(params.id)
            const kindredGroupAccess = hasKindredGroupAccess()
            
            setIsUnlocked(localStorageUnlocked || shareTokenUnlocked || kindredGroupAccess)
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
                
                // Generate shareable link for the user
                generateShareableLink()
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

    // Generate shareable link
    const generateShareableLink = async () => {
        setIsGeneratingShareUrl(true)
        try {
            const response = await fetch('/api/share/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ propertyId: params.id }),
            })

            const result = await response.json()
            if (result.success) {
                setShareUrl(result.shareUrl)
                // Copy to clipboard
                await navigator.clipboard.writeText(result.shareUrl)
                alert('Shareable link copied to clipboard!')
            } else {
                alert('Failed to generate shareable link. Please try again.')
            }
        } catch (error) {
            console.error('Error generating shareable link:', error)
            alert('Failed to generate shareable link. Please try again.')
        } finally {
            setIsGeneratingShareUrl(false)
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
                                        <div>
                                            <button
                                                onClick={() => setIsModalOpen(true)}
                                                className="btn bg-white text-[#163331] hover:bg-gray-100 px-8 py-4 text-lg font-semibold shadow-xl whitespace-nowrap"
                                            >
                                                Get Full Report
                                            </button>
                                            
                                            {/* Kindred Group Access Button */}
                                            <div className="mt-4 text-sm text-white/90">
                                                <a 
                                                    href={`/property/${params.id}?kindred_group_token=access`}
                                                    className="underline hover:text-white"
                                                >
                                                    Kindred Group Access
                                                </a>
                                            </div>
                                        </div>
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
                                                        <div className="space-y-4">
                                                            <a
                                                                href="https://www.kindred.com.au/sales-property-appraisal"
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-block w-full text-center bg-[#48D98E] text-[#163331] font-semibold py-3 px-6 rounded-lg hover:bg-[#3bc57d] transition-colors duration-200 shadow-lg"
                                                            >
                                                                Book your appraisal today
                                                            </a>
                                                            
                                                            {/* Share Button */}
                                                            <button
                                                                onClick={generateShareableLink}
                                                                disabled={isGeneratingShareUrl}
                                                                className="inline-block w-full text-center bg-white text-[#163331] font-semibold py-3 px-6 rounded-lg hover:bg-gray-100 transition-colors duration-200 shadow-lg"
                                                            >
                                                                {isGeneratingShareUrl ? 'Generating...' : 'Share Property'}
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <p className="text-xs text-white/70 leading-relaxed pt-2">
                                                        {/* This estimate may not include recent renovations or improvements.
                                                        For a personal appraisal, please contact us. */}
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="space-y-6">
                                                    <div>
                                                        <h2 className="text-2xl md:text-3xl font-heading font-semibold text-white/95 mb-4">
                                                            Estimated Value
                                                        </h2>
                                                        <p className="text-white/80 mb-6">
                                                            Unable to generate an estimate for this property.
                                                        </p>
                                                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/15 backdrop-blur-sm rounded-full">
                                                            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                                                            <span className="text-sm font-medium text-white/90">
                                                                Insufficient data
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
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Property Image */}
                                    <div className="relative">
                                        {propertyImages.length > 0 ? (
                                            <div 
                                                className="aspect-[4/3] rounded-xl overflow-hidden shadow-2xl cursor-pointer"
                                                onClick={() => setIsImageGalleryOpen(true)}
                                            >
                                                <img
                                                    src={propertyImages[0]}
                                                    alt={`${property.address} - Main image`}
                                                    className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                                                    loading="eager"
                                                />
                                            </div>
                                        ) : (
                                            <div className="aspect-[4/3] rounded-xl bg-gray-100 flex items-center justify-center shadow-2xl">
                                                <ImageOff className="w-16 h-16 text-gray-400" />
                                            </div>
                                        )}

                                        {propertyImages.length > 1 && (
                                            <div className="absolute bottom-4 right-4 bg-black/70 text-white text-sm px-3 py-1.5 rounded-full backdrop-blur-sm">
                                                {propertyImages.length} photos
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </ScrollReveal>

                        {/* Add the rest of the property page content here */}
                    </div>
                </div>
            </div>

            {/* Lead Capture Modal */}
            {isModalOpen && createPortal(
                <LeadCaptureModal
                    property={property}
                    onSubmit={handleFormSubmit}
                    onClose={() => setIsModalOpen(false)}
                    isSubmitting={isSubmitting}
                    error={formError}
                />,
                document.body
            )}

            {/* Success Modal */}
            {isSuccessModalOpen && createPortal(
                <SuccessModal
                    email={userEmail}
                    propertyAddress={property.address}
                    onClose={() => setIsSuccessModalOpen(false)}
                />,
                document.body
            )}
        </>
    )
}
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
import { hasValidShareToken, hasKindredGroupAccess } from '@/utils/tokenUtils'
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
    const [shareUrl, setShareUrl] = useState('')
    const [isGeneratingShareUrl, setIsGeneratingShareUrl] = useState(false)

    const propertyImages = property?.images || []
    console.log(property);

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

    // Check if property is unlocked (local storage or share token)
    useEffect(() => {
        if (typeof window !== 'undefined' && params.id) {
            const localStorageUnlocked = localStorage.getItem(`property_${params.id}_unlocked`) === 'true'
            const shareTokenUnlocked = hasValidShareToken(params.id)
            const kindredGroupAccess = hasKindredGroupAccess()
            
            setIsUnlocked(localStorageUnlocked || shareTokenUnlocked || kindredGroupAccess)
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
                
                // Generate shareable link for the user
                generateShareableLink()
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

    // Generate shareable link
    const generateShareableLink = async () => {
        setIsGeneratingShareUrl(true)
        try {
            const response = await fetch('/api/share/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ propertyId: params.id }),
            })

            const result = await response.json()
            if (result.success) {
                setShareUrl(result.shareUrl)
                // Copy to clipboard
                await navigator.clipboard.writeText(result.shareUrl)
                alert('Shareable link copied to clipboard!')
            } else {
                alert('Failed to generate shareable link. Please try again.')
            }
        } catch (error) {
            console.error('Error generating shareable link:', error)
            alert('Failed to generate shareable link. Please try again.')
        } finally {
            setIsGeneratingShareUrl(false)
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
                                        <div>
                                            <button
                                                onClick={() => setIsModalOpen(true)}
                                                className="btn bg-white text-[#163331] hover:bg-gray-100 px-8 py-4 text-lg font-semibold shadow-xl whitespace-nowrap"
                                            >
                                                Get Full Report
                                            </button>
                                            
                                            {/* Kindred Group Access Button */}
                                            <div className="mt-4 text-sm text-white/90">
                                                <a 
                                                    href={`/property/${params.id}?kindred_group_token=access`}
                                                    className="underline hover:text-white"
                                                >
                                                    Kindred Group Access
                                                </a>
                                            </div>
                                        </div>
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
                                                        <div className="space-y-4">
                                                            <a
                                                                href="https://www.kindred.com.au/sales-property-appraisal"
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-block w-full text-center bg-[#48D98E] text-[#163331] font-semibold py-3 px-6 rounded-lg hover:bg-[#3bc57d] transition-colors duration-200 shadow-lg"
                                                            >
                                                                Book your appraisal today
                                                            </a>
                                                            
                                                            {/* Share Button */}
                                                            <button
                                                                onClick={generateShareableLink}
                                                                disabled={isGeneratingShareUrl}
                                                                className="inline-block w-full text-center bg-white text-[#163331] font-semibold py-3 px-6 rounded-lg hover:bg-gray-100 transition-colors duration-200 shadow-lg"
                                                            >
                                                                {isGeneratingShareUrl ? 'Generating...' : 'Share Property'}
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <p className="text-xs text-white/70 leading-relaxed pt-2">
                                                        {/* This estimate may not include recent renovations or improvements.
                                                        For a personal appraisal, please contact us. */}
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="space-y-6">
                                                    <div>
                                                        <h2 className="text-2xl md:text-3xl font-heading font-semibold text-white/95 mb-4">
                                                            Estimated Value
                                                        </h2>
                                                        <p className="text-white/80 mb-6">
                                                            Unable to generate an estimate for this property.
                                                        </p>
                                                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/15 backdrop-blur-sm rounded-full">
                                                            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                                                            <span className="text-sm font-medium text-white/90">
                                                                Insufficient data
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
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Property Image */}
                                    <div className="relative">
                                        {propertyImages.length > 0 ? (
                                            <div 
                                                className="aspect-[4/3] rounded-xl overflow-hidden shadow-2xl cursor-pointer"
                                                onClick={() => setIsImageGalleryOpen(true)}
                                            >
                                                <img
                                                    src={propertyImages[0]}
                                                    alt={`${property.address} - Main image`}
                                                    className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                                                    loading="eager"
                                                />
                                            </div>
                                        ) : (
                                            <div className="aspect-[4/3] rounded-xl bg-gray-100 flex items-center justify-center shadow-2xl">
                                                <ImageOff className="w-16 h-16 text-gray-400" />
                                            </div>
                                        )}

                                        {propertyImages.length > 1 && (
                                            <div className="absolute bottom-4 right-4 bg-black/70 text-white text-sm px-3 py-1.5 rounded-full backdrop-blur-sm">
                                                {propertyImages.length} photos
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </ScrollReveal>

                        {/* Add the rest of the property page content here */}
                    </div>
                </div>
            </div>

            {/* Lead Capture Modal */}
            {isModalOpen && createPortal(
                <LeadCaptureModal
                    property={property}
                    onSubmit={handleFormSubmit}
                    onClose={() => setIsModalOpen(false)}
                    isSubmitting={isSubmitting}
                    error={formError}
                />,
                document.body
            )}

            {/* Success Modal */}
            {isSuccessModalOpen && createPortal(
                <SuccessModal
                    email={userEmail}
                    propertyAddress={property.address}
                    onClose={() => setIsSuccessModalOpen(false)}
                />,
                document.body
            )}
        </>
    )
}
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
import { hasValidShareToken, hasKindredGroupAccess } from '@/utils/tokenUtils'
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
    const [shareUrl, setShareUrl] = useState('')
    const [isGeneratingShareUrl, setIsGeneratingShareUrl] = useState(false)

    const propertyImages = property?.images || []
    console.log(property);

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

    // Check if property is unlocked (local storage or share token)
    useEffect(() => {
        if (typeof window !== 'undefined' && params.id) {
            const localStorageUnlocked = localStorage.getItem(`property_${params.id}_unlocked`) === 'true'
            const shareTokenUnlocked = hasValidShareToken(params.id)
            const kindredGroupAccess = hasKindredGroupAccess()
            
            setIsUnlocked(localStorageUnlocked || shareTokenUnlocked || kindredGroupAccess)
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
                
                // Generate shareable link for the user
                generateShareableLink()
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

    // Generate shareable link
    const generateShareableLink = async () => {
        setIsGeneratingShareUrl(true)
        try {
            const response = await fetch('/api/share/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ propertyId: params.id }),
            })

            const result = await response.json()
            if (result.success) {
                setShareUrl(result.shareUrl)
                // Copy to clipboard
                await navigator.clipboard.writeText(result.shareUrl)
                alert('Shareable link copied to clipboard!')
            } else {
                alert('Failed to generate shareable link. Please try again.')
            }
        } catch (error) {
            console.error('Error generating shareable link:', error)
            alert('Failed to generate shareable link. Please try again.')
        } finally {
            setIsGeneratingShareUrl(false)
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
                                        <div>
                                            <button
                                                onClick={() => setIsModalOpen(true)}
                                                className="btn bg-white text-[#163331] hover:bg-gray-100 px-8 py-4 text-lg font-semibold shadow-xl whitespace-nowrap"
                                            >
                                                Get Full Report
                                            </button>
                                            
                                            {/* Kindred Group Access Button */}
                                            <div className="mt-4 text-sm text-white/90">
                                                <a 
                                                    href={`/property/${params.id}?kindred_group_token=access`}
                                                    className="underline hover:text-white"
                                                >
                                                    Kindred Group Access
                                                </a>
                                            </div>
                                        </div>
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
                                                        <div className="space-y-4">
                                                            <a
                                                                href="https://www.kindred.com.au/sales-property-appraisal"
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-block w-full text-center bg-[#48D98E] text-[#163331] font-semibold py-3 px-6 rounded-lg hover:bg-[#3bc57d] transition-colors duration-200 shadow-lg"
                                                            >
                                                                Book your appraisal today
                                                            </a>
                                                            
                                                            {/* Share Button */}
                                                            <button
                                                                onClick={generateShareableLink}
                                                                disabled={isGeneratingShareUrl}
                                                                className="inline-block w-full text-center bg-white text-[#163331] font-semibold py-3 px-6 rounded-lg hover:bg-gray-100 transition-colors duration-200 shadow-lg"
                                                            >
                                                                {isGeneratingShareUrl ? 'Generating...' : 'Share Property'}
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <p className="text-xs text-white/70 leading-relaxed pt-2">
                                                        {/* This estimate may not include recent renovations or improvements.
                                                        For a personal appraisal, please contact us. */}
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="space-y-6">
                                                    <div>
                                                        <h2 className="text-2xl md:text-3xl font-heading font-semibold text-white/95 mb-4">
                                                            Estimated Value
                                                        </h2>
                                                        <p className="text-white/80 mb-6">
                                                            Unable to generate an estimate for this property.
                                                        </p>
                                                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/15 backdrop-blur-sm rounded-full">
                                                            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                                                            <span className="text-sm font-medium text-white/90">
                                                                Insufficient data
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
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Property Image */}
                                    <div className="relative">
                                        {propertyImages.length > 0 ? (
                                            <div 
                                                className="aspect-[4/3] rounded-xl overflow-hidden shadow-2xl cursor-pointer"
                                                onClick={() => setIsImageGalleryOpen(true)}
                                            >
                                                <img
                                                    src={propertyImages[0]}
                                                    alt={`${property.address} - Main image`}
                                                    className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                                                    loading="eager"
                                                />
                                            </div>
                                        ) : (
                                            <div className="aspect-[4/3] rounded-xl bg-gray-100 flex items-center justify-center shadow-2xl">
                                                <ImageOff className="w-16 h-16 text-gray-400" />
                                            </div>
                                        )}

                                        {propertyImages.length > 1 && (
                                            <div className="absolute bottom-4 right-4 bg-black/70 text-white text-sm px-3 py-1.5 rounded-full backdrop-blur-sm">
                                                {propertyImages.length} photos
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </ScrollReveal>

                        {/* Add the rest of the property page content here */}
                    </div>
                </div>
            </div>

            {/* Lead Capture Modal */}
            {isModalOpen && createPortal(
                <LeadCaptureModal
                    property={property}
                    onSubmit={handleFormSubmit}
                    onClose={() => setIsModalOpen(false)}
                    isSubmitting={isSubmitting}
                    error={formError}
                />,
                document.body
            )}

            {/* Success Modal */}
            {isSuccessModalOpen && createPortal(
                <SuccessModal
                    email={userEmail}
                    propertyAddress={property.address}
                    onClose={() => setIsSuccessModalOpen(false)}
                />,
                document.body
            )}
        </>
    )
}
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
import { hasValidShareToken, hasKindredGroupAccess } from '@/utils/tokenUtils'
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
    const [shareUrl, setShareUrl] = useState('')
    const [isGeneratingShareUrl, setIsGeneratingShareUrl] = useState(false)

    const propertyImages = property?.images || []
    console.log(property);

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

    // Check if property is unlocked (local storage or share token)
    useEffect(() => {
        if (typeof window !== 'undefined' && params.id) {
            const localStorageUnlocked = localStorage.getItem(`property_${params.id}_unlocked`) === 'true'
            const shareTokenUnlocked = hasValidShareToken(params.id)
            const kindredGroupAccess = hasKindredGroupAccess()
            
            setIsUnlocked(localStorageUnlocked || shareTokenUnlocked || kindredGroupAccess)
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
                
                // Generate shareable link for the user
                generateShareableLink()
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

    // Generate shareable link
    const generateShareableLink = async () => {
        setIsGeneratingShareUrl(true)
        try {
            const response = await fetch('/api/share/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ propertyId: params.id }),
            })

            const result = await response.json()
            if (result.success) {
                setShareUrl(result.shareUrl)
                // Copy to clipboard
                await navigator.clipboard.writeText(result.shareUrl)
                alert('Shareable link copied to clipboard!')
            } else {
                alert('Failed to generate shareable link. Please try again.')
            }
        } catch (error) {
            console.error('Error generating shareable link:', error)
            alert('Failed to generate shareable link. Please try again.')
        } finally {
            setIsGeneratingShareUrl(false)
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
                                        <div>
                                            <button
                                                onClick={() => setIsModalOpen(true)}
                                                className="btn bg-white text-[#163331] hover:bg-gray-100 px-8 py-4 text-lg font-semibold shadow-xl whitespace-nowrap"
                                            >
                                                Get Full Report
                                            </button>
                                            
                                            {/* Kindred Group Access Button */}
                                            <div className="mt-4 text-sm text-white/90">
                                                <a 
                                                    href={`/property/${params.id}?kindred_group_token=access`}
                                                    className="underline hover:text-white"
                                                >
                                                    Kindred Group Access
                                                </a>
                                            </div>
                                        </div>
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
                                                        <div className="space-y-4">
                                                            <a
                                                                href="https://www.kindred.com.au/sales-property-appraisal"
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-block w-full text-center bg-[#48D98E] text-[#163331] font-semibold py-3 px-6 rounded-lg hover:bg-[#3bc57d] transition-colors duration-200 shadow-lg"
                                                            >
                                                                Book your appraisal today
                                                            </a>
                                                            
                                                            {/* Share Button */}
                                                            <button
                                                                onClick={generateShareableLink}
                                                                disabled={isGeneratingShareUrl}
                                                                className="inline-block w-full text-center bg-white text-[#163331] font-semibold py-3 px-6 rounded-lg hover:bg-gray-100 transition-colors duration-200 shadow-lg"
                                                            >
                                                                {isGeneratingShareUrl ? 'Generating...' : 'Share Property'}
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <p className="text-xs text-white/70 leading-relaxed pt-2">
                                                        {/* This estimate may not include recent renovations or improvements.
                                                        For a personal appraisal, please contact us. */}
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="space-y-6">
                                                    <div>
                                                        <h2 className="text-2xl md:text-3xl font-heading font-semibold text-white/95 mb-4">
                                                            Estimated Value
                                                        </h2>
                                                        <p className="text-white/80 mb-6">
                                                            Unable to generate an estimate for this property.
                                                        </p>
                                                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/15 backdrop-blur-sm rounded-full">
                                                            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                                                            <span className="text-sm font-medium text-white/90">
                                                                Insufficient data
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
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Property Image */}
                                    <div className="relative">
                                        {propertyImages.length > 0 ? (
                                            <div 
                                                className="aspect-[4/3] rounded-xl overflow-hidden shadow-2xl cursor-pointer"
                                                onClick={() => setIsImageGalleryOpen(true)}
                                            >
                                                <img
                                                    src={propertyImages[0]}
                                                    alt={`${property.address} - Main image`}
                                                    className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                                                    loading="eager"
                                                />
                                            </div>
                                        ) : (
                                            <div className="aspect-[4/3] rounded-xl bg-gray-100 flex items-center justify-center shadow-2xl">
                                                <ImageOff className="w-16 h-16 text-gray-400" />
                                            </div>
                                        )}

                                        {propertyImages.length > 1 && (
                                            <div className="absolute bottom-4 right-4 bg-black/70 text-white text-sm px-3 py-1.5 rounded-full backdrop-blur-sm">
                                                {propertyImages.length} photos
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </ScrollReveal>

                        {/* Add the rest of the property page content here */}
                    </div>
                </div>
            </div>

            {/* Lead Capture Modal */}
            {isModalOpen && createPortal(
                <LeadCaptureModal
                    property={property}
                    onSubmit={handleFormSubmit}
                    onClose={() => setIsModalOpen(false)}
                    isSubmitting={isSubmitting}
                    error={formError}
                />,
                document.body
            )}

            {/* Success Modal */}
            {isSuccessModalOpen && createPortal(
                <SuccessModal
                    email={userEmail}
                    propertyAddress={property.address}
                    onClose={() => setIsSuccessModalOpen(false)}
                />,
                document.body
            )}
        </>
    )
}
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
import { hasValidShareToken, hasKindredGroupAccess } from '@/utils/tokenUtils'
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
    const [shareUrl, setShareUrl] = useState('')
    const [isGeneratingShareUrl, setIsGeneratingShareUrl] = useState(false)

    const propertyImages = property?.images || []
    console.log(property);

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

    // Check if property is unlocked (local storage or share token)
    useEffect(() => {
        if (typeof window !== 'undefined' && params.id) {
            const localStorageUnlocked = localStorage.getItem(`property_${params.id}_unlocked`) === 'true'
            const shareTokenUnlocked = hasValidShareToken(params.id)
            const kindredGroupAccess = hasKindredGroupAccess()
            
            setIsUnlocked(localStorageUnlocked || shareTokenUnlocked || kindredGroupAccess)
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
                
                // Generate shareable link for the user
                generateShareableLink()
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

    // Generate shareable link
    const generateShareableLink = async () => {
        setIsGeneratingShareUrl(true)
        try {
            const response = await fetch('/api/share/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ propertyId: params.id }),
            })

            const result = await response.json()
            if (result.success) {
                setShareUrl(result.shareUrl)
                // Copy to clipboard
                await navigator.clipboard.writeText(result.shareUrl)
                alert('Shareable link copied to clipboard!')
            } else {
                alert('Failed to generate shareable link. Please try again.')
            }
        } catch (error) {
            console.error('Error generating shareable link:', error)
            alert('Failed to generate shareable link. Please try again.')
        } finally {
            setIsGeneratingShareUrl(false)
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
                                        <div>
                                            <button
                                                onClick={() => setIsModalOpen(true)}
                                                className="btn bg-white text-[#163331] hover:bg-gray-100 px-8 py-4 text-lg font-semibold shadow-xl whitespace-nowrap"
                                            >
                                                Get Full Report
                                            </button>
                                            
                                            {/* Kindred Group Access Button */}
                                            <div className="mt-4 text-sm text-white/90">
                                                <a 
                                                    href={`/property/${params.id}?kindred_group_token=access`}
                                                    className="underline hover:text-white"
                                                >
                                                    Kindred Group Access
                                                </a>
                                            </div>
                                        </div>
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
                                                        <div className="space-y-4">
                                                            <a
                                                                href="https://www.kindred.com.au/sales-property-appraisal"
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-block w-full text-center bg-[#48D98E] text-[#163331] font-semibold py-3 px-6 rounded-lg hover:bg-[#3bc57d] transition-colors duration-200 shadow-lg"
                                                            >
                                                                Book your appraisal today
                                                            </a>
                                                            
                                                            {/* Share Button */}
                                                            <button
                                                                onClick={generateShareableLink}
                                                                disabled={isGeneratingShareUrl}
                                                                className="inline-block w-full text-center bg-white text-[#163331] font-semibold py-3 px-6 rounded-lg hover:bg-gray-100 transition-colors duration-200 shadow-lg"
                                                            >
                                                                {isGeneratingShareUrl ? 'Generating...' : 'Share Property'}
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <p className="text-xs text-white/70 leading-relaxed pt-2">
                                                        {/* This estimate may not include recent renovations or improvements.
                                                        For a personal appraisal, please contact us. */}
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="space-y-6">
                                                    <div>
                                                        <h2 className="text-2xl md:text-3xl font-heading font-semibold text-white/95 mb-4">
                                                            Estimated Value
                                                        </h2>
                                                        <p className="text-white/80 mb-6">
                                                            Unable to generate an estimate for this property.
                                                        </p>
                                                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/15 backdrop-blur-sm rounded-full">
                                                            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                                                            <span className="text-sm font-medium text-white/90">
                                                                Insufficient data
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
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Property Image */}
                                    <div className="relative">
                                        {propertyImages.length > 0 ? (
                                            <div 
                                                className="aspect-[4/3] rounded-xl overflow-hidden shadow-2xl cursor-pointer"
                                                onClick={() => setIsImageGalleryOpen(true)}
                                            >
                                                <img
                                                    src={propertyImages[0]}
                                                    alt={`${property.address} - Main image`}
                                                    className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                                                    loading="eager"
                                                />
                                            </div>
                                        ) : (
                                            <div className="aspect-[4/3] rounded-xl bg-gray-100 flex items-center justify-center shadow-2xl">
                                                <ImageOff className="w-16 h-16 text-gray-400" />
                                            </div>
                                        )}

                                        {propertyImages.length > 1 && (
                                            <div className="absolute bottom-4 right-4 bg-black/70 text-white text-sm px-3 py-1.5 rounded-full backdrop-blur-sm">
                                                {propertyImages.length} photos
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </ScrollReveal>

                        {/* Add the rest of the property page content here */}
                    </div>
                </div>
            </div>

            {/* Lead Capture Modal */}
            {isModalOpen && createPortal(
                <LeadCaptureModal
                    property={property}
                    onSubmit={handleFormSubmit}
                    onClose={() => setIsModalOpen(false)}
                    isSubmitting={isSubmitting}
                    error={formError}
                />,
                document.body
            )}

            {/* Success Modal */}
            {isSuccessModalOpen && createPortal(
                <SuccessModal
                    email={userEmail}
                    propertyAddress={property.address}
                    onClose={() => setIsSuccessModalOpen(false)}
                />,
                document.body
            )}
        </>
    )
}
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
import { hasValidShareToken, hasKindredGroupAccess } from '@/utils/tokenUtils'
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
    const [shareUrl, setShareUrl] = useState('')
    const [isGeneratingShareUrl, setIsGeneratingShareUrl] = useState(false)

    const propertyImages = property?.images || []
    console.log(property);

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

    // Check if property is unlocked (local storage or share token)
    useEffect(() => {
        if (typeof window !== 'undefined' && params.id) {
            const localStorageUnlocked = localStorage.getItem(`property_${params.id}_unlocked`) === 'true'
            const shareTokenUnlocked = hasValidShareToken(params.id)
            const kindredGroupAccess = hasKindredGroupAccess()
            
            setIsUnlocked(localStorageUnlocked || shareTokenUnlocked || kindredGroupAccess)
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
                
                // Generate shareable link for the user
                generateShareableLink()
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

    // Generate shareable link
    const generateShareableLink = async () => {
        setIsGeneratingShareUrl(true)
        try {
            const response = await fetch('/api/share/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ propertyId: params.id }),
            })

            const result = await response.json()
            if (result.success) {
                setShareUrl(result.shareUrl)
                // Copy to clipboard
                await navigator.clipboard.writeText(result.shareUrl)
                alert('Shareable link copied to clipboard!')
            } else {
                alert('Failed to generate shareable link. Please try again.')
            }
        } catch (error) {
            console.error('Error generating shareable link:', error)
            alert('Failed to generate shareable link. Please try again.')
        } finally {
            setIsGeneratingShareUrl(false)
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
                                        <div>
                                            <button
                                                onClick={() => setIsModalOpen(true)}
                                                className="btn bg-white text-[#163331] hover:bg-gray-100 px-8 py-4 text-lg font-semibold shadow-xl whitespace-nowrap"
                                            >
                                                Get Full Report
                                            </button>
                                            
                                            {/* Kindred Group Access Button */}
                                            <div className="mt-4 text-sm text-white/90">
                                                <a 
                                                    href={`/property/${params.id}?kindred_group_token=access`}
                                                    className="underline hover:text-white"
                                                >
                                                    Kindred Group Access
                                                </a>
                                            </div>
                                        </div>
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
                                                        <div className="space-y-4">
                                                            <a
                                                                href="https://www.kindred.com.au/sales-property-appraisal"
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-block w-full text-center bg-[#48D98E] text-[#163331] font-semibold py-3 px-6 rounded-lg hover:bg-[#3bc57d] transition-colors duration-200 shadow-lg"
                                                            >
                                                                Book your appraisal today
                                                            </a>
                                                            
                                                            {/* Share Button */}
                                                            <button
                                                                onClick={generateShareableLink}
                                                                disabled={isGeneratingShareUrl}
                                                                className="inline-block w-full text-center bg-white text-[#163331] font-semibold py-3 px-6 rounded-lg hover:bg-gray-100 transition-colors duration-200 shadow-lg"
                                                            >
                                                                {isGeneratingShareUrl ? 'Generating...' : 'Share Property'}
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <p className="text-xs text-white/70 leading-relaxed pt-2">
                                                        {/* This estimate may not include recent renovations or improvements.
                                                        For a personal appraisal, please contact us. */}
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="space-y-6">
                                                    <div>
                                                        <h2 className="text-2xl md:text-3xl font-heading font-semibold text-white/95 mb-4">
                                                            Estimated Value
                                                        </h2>
                                                        <p className="text-white/80 mb-6">
                                                            Unable to generate an estimate for this property.
                                                        </p>
                                                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/15 backdrop-blur-sm rounded-full">
                                                            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                                                            <span className="text-sm font-medium text-white/90">
                                                                Insufficient data
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
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Property Image */}
                                    <div className="relative">
                                        {propertyImages.length > 0 ? (
                                            <div 
                                                className="aspect-[4/3] rounded-xl overflow-hidden shadow-2xl cursor-pointer"
                                                onClick={() => setIsImageGalleryOpen(true)}
                                            >
                                                <img
                                                    src={propertyImages[0]}
                                                    alt={`${property.address} - Main image`}
                                                    className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                                                    loading="eager"
                                                />
                                            </div>
                                        ) : (
                                            <div className="aspect-[4/3] rounded-xl bg-gray-100 flex items-center justify-center shadow-2xl">
                                                <ImageOff className="w-16 h-16 text-gray-400" />
                                            </div>
                                        )}

                                        {propertyImages.length > 1 && (
                                            <div className="absolute bottom-4 right-4 bg-black/70 text-white text-sm px-3 py-1.5 rounded-full backdrop-blur-sm">
                                                {propertyImages.length} photos
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </ScrollReveal>

                        {/* Add the rest of the property page content here */}
                    </div>
                </div>
            </div>

            {/* Lead Capture Modal */}
            {isModalOpen && createPortal(
                <LeadCaptureModal
                    property={property}
                    onSubmit={handleFormSubmit}
                    onClose={() => setIsModalOpen(false)}
                    isSubmitting={isSubmitting}
                    error={formError}
                />,
                document.body
            )}

            {/* Success Modal */}
            {isSuccessModalOpen && createPortal(
                <SuccessModal
                    email={userEmail}
                    propertyAddress={property.address}
                    onClose={() => setIsSuccessModalOpen(false)}
                />,
                document.body
            )}
        </>
    )
}
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
import { hasValidShareToken, hasKindredGroupAccess } from '@/utils/tokenUtils'
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
    const [shareUrl, setShareUrl] = useState('')
    const [isGeneratingShareUrl, setIsGeneratingShareUrl] = useState(false)

    const propertyImages = property?.images || []
    console.log(property);

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

    // Check if property is unlocked (local storage or share token)
    useEffect(() => {
        if (typeof window !== 'undefined' && params.id) {
            const localStorageUnlocked = localStorage.getItem(`property_${params.id}_unlocked`) === 'true'
            const shareTokenUnlocked = hasValidShareToken(params.id)
            const kindredGroupAccess = hasKindredGroupAccess()
            
            setIsUnlocked(localStorageUnlocked || shareTokenUnlocked || kindredGroupAccess)
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
                
                // Generate shareable link for the user
                generateShareableLink()
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

    // Generate shareable link
    const generateShareableLink = async () => {
        setIsGeneratingShareUrl(true)
        try {
            const response = await fetch('/api/share/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ propertyId: params.id }),
            })

            const result = await response.json()
            if (result.success) {
                setShareUrl(result.shareUrl)
                // Copy to clipboard
                await navigator.clipboard.writeText(result.shareUrl)
                alert('Shareable link copied to clipboard!')
            } else {
                alert('Failed to generate shareable link. Please try again.')
            }
        } catch (error) {
            console.error('Error generating shareable link:', error)
            alert('Failed to generate shareable link. Please try again.')
        } finally {
            setIsGeneratingShareUrl(false)
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
                                        <div>
                                            <button
                                                onClick={() => setIsModalOpen(true)}
                                                className="btn bg-white text-[#163331] hover:bg-gray-100 px-8 py-4 text-lg font-semibold shadow-xl whitespace-nowrap"
                                            >
                                                Get Full Report
                                            </button>
                                            
                                            {/* Kindred Group Access Button */}
                                            <div className="mt-4 text-sm text-white/90">
                                                <a 
                                                    href={`/property/${params.id}?kindred_group_token=access`}
                                                    className="underline hover:text-white"
                                                >
                                                    Kindred Group Access
                                                </a>
                                            </div>
                                        </div>
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
                                                        <div className="space-y-4">
                                                            <a
                                                                href="https://www.kindred.com.au/sales-property-appraisal"
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-block w-full text-center bg-[#48D98E] text-[#163331] font-semibold py-3 px-6 rounded-lg hover:bg-[#3bc57d] transition-colors duration-200 shadow-lg"
                                                            >
                                                                Book your appraisal today
                                                            </a>
                                                            
                                                            {/* Share Button */}
                                                            <button
                                                                onClick={generateShareableLink}
                                                                disabled={isGeneratingShareUrl}
                                                                className="inline-block w-full text-center bg-white text-[#163331] font-semibold py-3 px-6 rounded-lg hover:bg-gray-100 transition-colors duration-200 shadow-lg"
                                                            >
                                                                {isGeneratingShareUrl ? 'Generating...' : 'Share Property'}
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <p className="text-xs text-white/70 leading-relaxed pt-2">
                                                        {/* This estimate may not include recent renovations or improvements.
                                                        For a personal appraisal, please contact us. */}
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="space-y-6">
                                                    <div>
                                                        <h2 className="text-2xl md:text-3xl font-heading font-semibold text-white/95 mb-4">
                                                            Estimated Value
                                                        </h2>
                                                        <p className="text-white/80 mb-6">
                                                            Unable to generate an estimate for this property.
                                                        </p>
                                                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/15 backdrop-blur-sm rounded-full">
                                                            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                                                            <span className="text-sm font-medium text-white/90">
                                                                Insufficient data
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
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Property Image */}
                                    <div className="relative">
                                        {propertyImages.length > 0 ? (
                                            <div 
                                                className="aspect-[4/3] rounded-xl overflow-hidden shadow-2xl cursor-pointer"
                                                onClick={() => setIsImageGalleryOpen(true)}
                                            >
                                                <img
                                                    src={propertyImages[0]}
                                                    alt={`${property.address} - Main image`}
                                                    className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                                                    loading="eager"
                                                />
                                            </div>
                                        ) : (
                                            <div className="aspect-[4/3] rounded-xl bg-gray-100 flex items-center justify-center shadow-2xl">
                                                <ImageOff className="w-16 h-16 text-gray-400" />
                                            </div>
                                        )}

                                        {propertyImages.length > 1 && (
                                            <div className="absolute bottom-4 right-4 bg-black/70 text-white text-sm px-3 py-1.5 rounded-full backdrop-blur-sm">
                                                {propertyImages.length} photos
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </ScrollReveal>

                        {/* Add the rest of the property page content here */}
                    </div>
                </div>
            </div>

            {/* Lead Capture Modal */}
            {isModalOpen && createPortal(
                <LeadCaptureModal
                    property={property}
                    onSubmit={handleFormSubmit}
                    onClose={() => setIsModalOpen(false)}
                    isSubmitting={isSubmitting}
                    error={formError}
                />,
                document.body
            )}

            {/* Success Modal */}
            {isSuccessModalOpen && createPortal(
                <SuccessModal
                    email={userEmail}
                    propertyAddress={property.address}
                    onClose={() => setIsSuccessModalOpen(false)}
                />,
                document.body
            )}
        </>
    )
}
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
import { hasValidShareToken, hasKindredGroupAccess } from '@/utils/tokenUtils'
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
    const [shareUrl, setShareUrl] = useState('')
    const [isGeneratingShareUrl, setIsGeneratingShareUrl] = useState(false)

    const propertyImages = property?.images || []
    console.log(property);

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

    // Check if property is unlocked (local storage or share token)
    useEffect(() => {
        if (typeof window !== 'undefined' && params.id) {
            const localStorageUnlocked = localStorage.getItem(`property_${params.id}_unlocked`) === 'true'
            const shareTokenUnlocked = hasValidShareToken(params.id)
            const kindredGroupAccess = hasKindredGroupAccess()
            
            setIsUnlocked(localStorageUnlocked || shareTokenUnlocked || kindredGroupAccess)
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
                
                // Generate shareable link for the user
                generateShareableLink()
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

    // Generate shareable link
    const generateShareableLink = async () => {
        setIsGeneratingShareUrl(true)
        try {
            const response = await fetch('/api/share/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ propertyId: params.id }),
            })

            const result = await response.json()
            if (result.success) {
                setShareUrl(result.shareUrl)
                // Copy to clipboard
                await navigator.clipboard.writeText(result.shareUrl)
                alert('Shareable link copied to clipboard!')
            } else {
                alert('Failed to generate shareable link. Please try again.')
            }
        } catch (error) {
            console.error('Error generating shareable link:', error)
            alert('Failed to generate shareable link. Please try again.')
        } finally {
            setIsGeneratingShareUrl(false)
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
                                        <div>
                                            <button
                                                onClick={() => setIsModalOpen(true)}
                                                className="btn bg-white text-[#163331] hover:bg-gray-100 px-8 py-4 text-lg font-semibold shadow-xl whitespace-nowrap"
                                            >
                                                Get Full Report
                                            </button>
                                            
                                            {/* Kindred Group Access Button */}
                                            <div className="mt-4 text-sm text-white/90">
                                                <a 
                                                    href={`/property/${params.id}?kindred_group_token=access`}
                                                    className="underline hover:text-white"
                                                >
                                                    Kindred Group Access
                                                </a>
                                            </div>
                                        </div>
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
                                                        <div className="space-y-4">
                                                            <a
                                                                href="https://www.kindred.com.au/sales-property-appraisal"
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-block w-full text-center bg-[#48D98E] text-[#163331] font-semibold py-3 px-6 rounded-lg hover:bg-[#3bc57d] transition-colors duration-200 shadow-lg"
                                                            >
                                                                Book your appraisal today
                                                            </a>
                                                            
                                                            {/* Share Button */}
                                                            <button
                                                                onClick={generateShareableLink}
                                                                disabled={isGeneratingShareUrl}
                                                                className="inline-block w-full text-center bg-white text-[#163331] font-semibold py-3 px-6 rounded-lg hover:bg-gray-100 transition-colors duration-200 shadow-lg"
                                                            >
                                                                {isGeneratingShareUrl ? 'Generating...' : 'Share Property'}
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <p className="text-xs text-white/70 leading-relaxed pt-2">
                                                        {/* This estimate may not include recent renovations or improvements.
                                                        For a personal appraisal, please contact us. */}
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="space-y-6">
                                                    <div>
                                                        <h2 className="text-2xl md:text-3xl font-heading font-semibold text-white/95 mb-4">
                                                            Estimated Value
                                                        </h2>
                                                        <p className="text-white/80 mb-6">
                                                            Unable to generate an estimate for this property.
                                                        </p>
                                                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/15 backdrop-blur-sm rounded-full">
                                                            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                                                            <span className="text-sm font-medium text-white/90">
                                                                Insufficient data
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
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Property Image */}
                                    <div className="relative">
                                        {propertyImages.length > 0 ? (
                                            <div 
                                                className="aspect-[4/3] rounded-xl overflow-hidden shadow-2xl cursor-pointer"
                                                onClick={() => setIsImageGalleryOpen(true)}
                                            >
                                                <img
                                                    src={propertyImages[0]}
                                                    alt={`${property.address} - Main image`}
                                                    className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                                                    loading="eager"
                                                />
                                            </div>
                                        ) : (
                                            <div className="aspect-[4/3] rounded-xl bg-gray-100 flex items-center justify-center shadow-2xl">
                                                <ImageOff className="w-16 h-16 text-gray-400" />
                                            </div>
                                        )}

                                        {propertyImages.length > 1 && (
                                            <div className="absolute bottom-4 right-4 bg-black/70 text-white text-sm px-3 py-1.5 rounded-full backdrop-blur-sm">
                                                {propertyImages.length} photos
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </ScrollReveal>

                        {/* Add the rest of the property page content here */}
                    </div>
                </div>
            </div>

            {/* Lead Capture Modal */}
            {isModalOpen && createPortal(
                <LeadCaptureModal
                    property={property}
                    onSubmit={handleFormSubmit}
                    onClose={() => setIsModalOpen(false)}
                    isSubmitting={isSubmitting}
                    error={formError}
                />,
                document.body
            )}

            {/* Success Modal */}
            {isSuccessModalOpen && createPortal(
                <SuccessModal
                    email={userEmail}
                    propertyAddress={property.address}
                    onClose={() => setIsSuccessModalOpen(false)}
                />,
                document.body
            )}
        </>
    )
}
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
import { hasValidShareToken, hasKindredGroupAccess } from '@/utils/tokenUtils'
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
    const [shareUrl, setShareUrl] = useState('')
    const [isGeneratingShareUrl, setIsGeneratingShareUrl] = useState(false)

    const propertyImages = property?.images || []
    console.log(property);

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

    // Check if property is unlocked (local storage or share token)
    useEffect(() => {
        if (typeof window !== 'undefined' && params.id) {
            const localStorageUnlocked = localStorage.getItem(`property_${params.id}_unlocked`) === 'true'
            const shareTokenUnlocked = hasValidShareToken(params.id)
            const kindredGroupAccess = hasKindredGroupAccess()
            
            setIsUnlocked(localStorageUnlocked || shareTokenUnlocked || kindredGroupAccess)
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
                
                // Generate shareable link for the user
                generateShareableLink()
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

    // Generate shareable link
    const generateShareableLink = async () => {
        setIsGeneratingShareUrl(true)
        try {
            const response = await fetch('/api/share/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ propertyId: params.id }),
            })

            const result = await response.json()
            if (result.success) {
                setShareUrl(result.shareUrl)
                // Copy to clipboard
                await navigator.clipboard.writeText(result.shareUrl)
                alert('Shareable link copied to clipboard!')
            } else {
                alert('Failed to generate shareable link. Please try again.')
            }
        } catch (error) {
            console.error('Error generating shareable link:', error)
            alert('Failed to generate shareable link. Please try again.')
        } finally {
            setIsGeneratingShareUrl(false)
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
                                        <div>
                                            <button
                                                onClick={() => setIsModalOpen(true)}
                                                className="btn bg-white text-[#163331] hover:bg-gray-100 px-8 py-4 text-lg font-semibold shadow-xl whitespace-nowrap"
                                            >
                                                Get Full Report
                                            </button>
                                            
                                            {/* Kindred Group Access Button */}
                                            <div className="mt-4 text-sm text-white/90">
                                                <a 
                                                    href={`/property/${params.id}?kindred_group_token=access`}
                                                    className="underline hover:text-white"
                                                >
                                                    Kindred Group Access
                                                </a>
                                            </div>
                                        </div>
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
                                                        <div className="space-y-4">
                                                            <a
                                                                href="https://www.kindred.com.au/sales-property-appraisal"
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-block w-full text-center bg-[#48D98E] text-[#163331] font-semibold py-3 px-6 rounded-lg hover:bg-[#3bc57d] transition-colors duration-200 shadow-lg"
                                                            >
                                                                Book your appraisal today
                                                            </a>
                                                            
                                                            {/* Share Button */}
                                                            <button
                                                                onClick={generateShareableLink}
                                                                disabled={isGeneratingShareUrl}
                                                                className="inline-block w-full text-center bg-white text-[#163331] font-semibold py-3 px-6 rounded-lg hover:bg-gray-100 transition-colors duration-200 shadow-lg"
                                                            >
                                                                {isGeneratingShareUrl ? 'Generating...' : 'Share Property'}
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <p className="text-xs text-white/70 leading-relaxed pt-2">
                                                        {/* This estimate may not include recent renovations or improvements.
                                                        For a personal appraisal, please contact us. */}
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="space-y-6">
                                                    <div>
                                                        <h2 className="text-2xl md:text-3xl font-heading font-semibold text-white/95 mb-4">
                                                            Estimated Value
                                                        </h2>
                                                        <p className="text-white/80 mb-6">
                                                            Unable to generate an estimate for this property.
                                                        </p>
                                                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/15 backdrop-blur-sm rounded-full">
                                                            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                                                            <span className="text-sm font-medium text-white/90">
                                                                Insufficient data
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
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Property Image */}
                                    <div className="relative">
                                        {propertyImages.length > 0 ? (
                                            <div 
                                                className="aspect-[4/3] rounded-xl overflow-hidden shadow-2xl cursor-pointer"
                                                onClick={() => setIsImageGalleryOpen(true)}
                                            >
                                                <img
                                                    src={propertyImages[0]}
                                                    alt={`${property.address} - Main image`}
                                                    className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                                                    loading="eager"
                                                />
                                            </div>
                                        ) : (
                                            <div className="aspect-[4/3] rounded-xl bg-gray-100 flex items-center justify-center shadow-2xl">
                                                <ImageOff className="w-16 h-16 text-gray-400" />
                                            </div>
                                        )}

                                        {propertyImages.length > 1 && (
                                            <div className="absolute bottom-4 right-4 bg-black/70 text-white text-sm px-3 py-1.5 rounded-full backdrop-blur-sm">
                                                {propertyImages.length} photos
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </ScrollReveal>

                        {/* Add the rest of the property page content here */}
                    </div>
                </div>
            </div>

            {/* Lead Capture Modal */}
            {isModalOpen && createPortal(
                <LeadCaptureModal
                    property={property}
                    onSubmit={handleFormSubmit}
                    onClose={() => setIsModalOpen(false)}
                    isSubmitting={isSubmitting}
                    error={formError}
                />,
                document.body
            )}

            {/* Success Modal */}
            {isSuccessModalOpen && createPortal(
                <SuccessModal
                    email={userEmail}
                    propertyAddress={property.address}
                    onClose={() => setIsSuccessModalOpen(false)}
                />,
                document.body
            )}
        </>
    )
}
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
import { hasValidShareToken, hasKindredGroupAccess } from '@/utils/tokenUtils'
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
    const [shareUrl, setShareUrl] = useState('')
    const [isGeneratingShareUrl, setIsGeneratingShareUrl] = useState(false)

    const propertyImages = property?.images || []
    console.log(property);

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

    // Check if property is unlocked (local storage or share token)
    useEffect(() => {
        if (typeof window !== 'undefined' && params.id) {
            const localStorageUnlocked = localStorage.getItem(`property_${params.id}_unlocked`) === 'true'
            const shareTokenUnlocked = hasValidShareToken(params.id)
            const kindredGroupAccess = hasKindredGroupAccess()
            
            setIsUnlocked(localStorageUnlocked || shareTokenUnlocked || kindredGroupAccess)
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
                
                // Generate shareable link for the user
                generateShareableLink()
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

    // Generate shareable link
    const generateShareableLink = async () => {
        setIsGeneratingShareUrl(true)
        try {
            const response = await fetch('/api/share/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ propertyId: params.id }),
            })

            const result = await response.json()
            if (result.success) {
                setShareUrl(result.shareUrl)
                // Copy to clipboard
                await navigator.clipboard.writeText(result.shareUrl)
                alert('Shareable link copied to clipboard!')
            } else {
                alert('Failed to generate shareable link. Please try again.')
            }
        } catch (error) {
            console.error('Error generating shareable link:', error)
            alert('Failed to generate shareable link. Please try again.')
        } finally {
            setIsGeneratingShareUrl(false)
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
                                        <div>
                                            <button
                                                onClick={() => setIsModalOpen(true)}
                                                className="btn bg-white text-[#163331] hover:bg-gray-100 px-8 py-4 text-lg font-semibold shadow-xl whitespace-nowrap"
                                            >
                                                Get Full Report
                                            </button>
                                            
                                            {/* Kindred Group Access Button */}
                                            <div className="mt-4 text-sm text-white/90">
                                                <a 
                                                    href={`/property/${params.id}?kindred_group_token=access`}
                                                    className="underline hover:text-white"
                                                >
                                                    Kindred Group Access
                                                </a>
                                            </div>
                                        </div>
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
                                                        <div className="space-y-4">
                                                            <a
                                                                href="https://www.kindred.com.au/sales-property-appraisal"
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-block w-full text-center bg-[#48D98E] text-[#163331] font-semibold py-3 px-6 rounded-lg hover:bg-[#3bc57d] transition-colors duration-200 shadow-lg"
                                                            >
                                                                Book your appraisal today
                                                            </a>
                                                            
                                                            {/* Share Button */}
                                                            <button
                                                                onClick={generateShareableLink}
                                                                disabled={isGeneratingShareUrl}
                                                                className="inline-block w-full text-center bg-white text-[#163331] font-semibold py-3 px-6 rounded-lg hover:bg-gray-100 transition-colors duration-200 shadow-lg"
                                                            >
                                                                {isGeneratingShareUrl ? 'Generating...' : 'Share Property'}
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <p className="text-xs text-white/70 leading-relaxed pt-2">
                                                        {/* This estimate may not include recent renovations or improvements.
                                                        For a personal appraisal, please contact us. */}
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="space-y-6">
                                                    <div>
                                                        <h2 className="text-2xl md:text-3xl font-heading font-semibold text-white/95 mb-4">
                                                            Estimated Value
                                                        </h2>
                                                        <p className="text-white/80 mb-6">
                                                            Unable to generate an estimate for this property.
                                                        </p>
                                                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/15 backdrop-blur-sm rounded-full">
                                                            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                                                            <span className="text-sm font-medium text-white/90">
                                                                Insufficient data
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
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Property Image */}
                                    <div className="relative">
                                        {propertyImages.length > 0 ? (
                                            <div 
                                                className="aspect-[4/3] rounded-xl overflow-hidden shadow-2xl cursor-pointer"
                                                onClick={() => setIsImageGalleryOpen(true)}
                                            >
                                                <img
                                                    src={propertyImages[0]}
                                                    alt={`${property.address} - Main image`}
                                                    className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                                                    loading="eager"
                                                />
                                            </div>
                                        ) : (
                                            <div className="aspect-[4/3] rounded-xl bg-gray-100 flex items-center justify-center shadow-2xl">
                                                <ImageOff className="w-16 h-16 text-gray-400" />
                                            </div>
                                        )}

                                        {propertyImages.length > 1 && (
                                            <div className="absolute bottom-4 right-4 bg-black/70 text-white text-sm px-3 py-1.5 rounded-full backdrop-blur-sm">
                                                {propertyImages.length} photos
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </ScrollReveal>

                        {/* Add the rest of the property page content here */}
                    </div>
                </div>
            </div>

            {/* Lead Capture Modal */}
            {isModalOpen && createPortal(
                <LeadCaptureModal
                    property={property}
                    onSubmit={handleFormSubmit}
                    onClose={() => setIsModalOpen(false)}
                    isSubmitting={isSubmitting}
                    error={formError}
                />,
                document.body
            )}

            {/* Success Modal */}
            {isSuccessModalOpen && createPortal(
                <SuccessModal
                    email={userEmail}
                    propertyAddress={property.address}
                    onClose={() => setIsSuccessModalOpen(false)}
                />,
                document.body
            )}
        </>
    )
}
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
import { hasValidShareToken, hasKindredGroupAccess } from '@/utils/tokenUtils'
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
    const [shareUrl, setShareUrl] = useState('')
    const [isGeneratingShareUrl, setIsGeneratingShareUrl] = useState(false)

    const propertyImages = property?.images || []
    console.log(property);

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

    // Check if property is unlocked (local storage or share token)
    useEffect(() => {
        if (typeof window !== 'undefined' && params.id) {
            const localStorageUnlocked = localStorage.getItem(`property_${params.id}_unlocked`) === 'true'
            const shareTokenUnlocked = hasValidShareToken(params.id)
            const kindredGroupAccess = hasKindredGroupAccess()
            
            setIsUnlocked(localStorageUnlocked || shareTokenUnlocked || kindredGroupAccess)
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
                
                // Generate shareable link for the user
                generateShareableLink()
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

    // Generate shareable link
    const generateShareableLink = async () => {
        setIsGeneratingShareUrl(true)
        try {
            const response = await fetch('/api/share/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ propertyId: params.id }),
            })

            const result = await response.json()
            if (result.success) {
                setShareUrl(result.shareUrl)
                // Copy to clipboard
                await navigator.clipboard.writeText(result.shareUrl)
                alert('Shareable link copied to clipboard!')
            } else {
                alert('Failed to generate shareable link. Please try again.')
            }
        } catch (error) {
            console.error('Error generating shareable link:', error)
            alert('Failed to generate shareable link. Please try again.')
        } finally {
            setIsGeneratingShareUrl(false)
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
                                        <div>
                                            <button
                                                onClick={() => setIsModalOpen(true)}
                                                className="btn bg-white text-[#163331] hover:bg-gray-100 px-8 py-4 text-lg font-semibold shadow-xl whitespace-nowrap"
                                            >
                                                Get Full Report
                                            </button>
                                            
                                            {/* Kindred Group Access Button */}
                                            <div className="mt-4 text-sm text-white/90">
                                                <a 
                                                    href={`/property/${params.id}?kindred_group_token=access`}
                                                    className="underline hover:text-white"
                                                >
                                                    Kindred Group Access
                                                </a>
                                            </div>
                                        </div>
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
                                                        <div className="space-y-4">
                                                            <a
                                                                href="https://www.kindred.com.au/sales-property-appraisal"
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-block w-full text-center bg-[#48D98E] text-[#163331] font-semibold py-3 px-6 rounded-lg hover:bg-[#3bc57d] transition-colors duration-200 shadow-lg"
                                                            >
                                                                Book your appraisal today
                                                            </a>
                                                            
                                                            {/* Share Button */}
                                                            <button
                                                                onClick={generateShareableLink}
                                                                disabled={isGeneratingShareUrl}
                                                                className="inline-block w-full text-center bg-white text-[#163331] font-semibold py-3 px-6 rounded-lg hover:bg-gray-100 transition-colors duration-200 shadow-lg"
                                                            >
                                                                {isGeneratingShareUrl ? 'Generating...' : 'Share Property'}
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <p className="text-xs text-white/70 leading-relaxed pt-2">
                                                        {/* This estimate may not include recent renovations or improvements.
                                                        For a personal appraisal, please contact us. */}
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="space-y-6">
                                                    <div>
                                                        <h2 className="text-2xl md:text-3xl font-heading font-semibold text-white/95 mb-4">
                                                            Estimated Value
                                                        </h2>
                                                        <p className="text-white/80 mb-6">
                                                            Unable to generate an estimate for this property.
                                                        </p>
                                                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/15 backdrop-blur-sm rounded-full">
                                                            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                                                            <span className="text-sm font-medium text-white/90">
                                                                Insufficient data
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
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Property Image */}
                                    <div className="relative">
                                        {propertyImages.length > 0 ? (
                                            <div 
                                                className="aspect-[4/3] rounded-xl overflow-hidden shadow-2xl cursor-pointer"
                                                onClick={() => setIsImageGalleryOpen(true)}
                                            >
                                                <img
                                                    src={propertyImages[0]}
                                                    alt={`${property.address} - Main image`}
                                                    className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                                                    loading="eager"
                                                />
                                            </div>
                                        ) : (
                                            <div className="aspect-[4/3] rounded-xl bg-gray-100 flex items-center justify-center shadow-2xl">
                                                <ImageOff className="w-16 h-16 text-gray-400" />
                                            </div>
                                        )}

                                        {propertyImages.length > 1 && (
                                            <div className="absolute bottom-4 right-4 bg-black/70 text-white text-sm px-3 py-1.5 rounded-full backdrop-blur-sm">
                                                {propertyImages.length} photos
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </ScrollReveal>

                        {/* Add the rest of the property page content here */}
                    </div>
                </div>
            </div>

            {/* Lead Capture Modal */}
            {isModalOpen && createPortal(
                <LeadCaptureModal
                    property={property}
                    onSubmit={handleFormSubmit}
                    onClose={() => setIsModalOpen(false)}
                    isSubmitting={isSubmitting}
                    error={formError}
                />,
                document.body
            )}

            {/* Success Modal */}
            {isSuccessModalOpen && createPortal(
                <SuccessModal
                    email={userEmail}
                    propertyAddress={property.address}
                    onClose={() => setIsSuccessModalOpen(false)}
                />,
                document.body
            )}
        </>
    )
}
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
import { hasValidShareToken, hasKindredGroupAccess } from '@/utils/tokenUtils'
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
    const [shareUrl, setShareUrl] = useState('')
    const [isGeneratingShareUrl, setIsGeneratingShareUrl] = useState(false)

    const propertyImages = property?.images || []
    console.log(property);

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

    // Check if property is unlocked (local storage or share token)
    useEffect(() => {
        if (typeof window !== 'undefined' && params.id) {
            const localStorageUnlocked = localStorage.getItem(`property_${params.id}_unlocked`) === 'true'
            const shareTokenUnlocked = hasValidShareToken(params.id)
            const kindredGroupAccess = hasKindredGroupAccess()
            
            setIsUnlocked(localStorageUnlocked || shareTokenUnlocked || kindredGroupAccess)
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
                
                // Generate shareable link for the user
                generateShareableLink()
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

    // Generate shareable link
    const generateShareableLink = async () => {
        setIsGeneratingShareUrl(true)
        try {
            const response = await fetch('/api/share/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ propertyId: params.id }),
            })

            const result = await response.json()
            if (result.success) {
                setShareUrl(result.shareUrl)
                // Copy to clipboard
                await navigator.clipboard.writeText(result.shareUrl)
                alert('Shareable link copied to clipboard!')
            } else {
                alert('Failed to generate shareable link. Please try again.')
            }
        } catch (error) {
            console.error('Error generating shareable link:', error)
            alert('Failed to generate shareable link. Please try again.')
        } finally {
            setIsGeneratingShareUrl(false)
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
                                        <div>
                                            <button
                                                onClick={() => setIsModalOpen(true)}
                                                className="btn bg-white text-[#163331] hover:bg-gray-100 px-8 py-4 text-lg font-semibold shadow-xl whitespace-nowrap"
                                            >
                                                Get Full Report
                                            </button>
                                            
                                            {/* Kindred Group Access Button */}
                                            <div className="mt-4 text-sm text-white/90">
                                                <a 
                                                    href={`/property/${params.id}?kindred_group_token=access`}
                                                    className="underline hover:text-white"
                                                >
                                                    Kindred Group Access
                                                </a>
                                            </div>
                                        </div>
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
                                                        <div className="space-y-4">
                                                            <a
                                                                href="https://www.kindred.com.au/sales-property-appraisal"
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-block w-full text-center bg-[#48D98E] text-[#163331] font-semibold py-3 px-6 rounded-lg hover:bg-[#3bc57d] transition-colors duration-200 shadow-lg"
                                                            >
                                                                Book your appraisal today
                                                            </a>
                                                            
                                                            {/* Share Button */}
                                                            <button
                                                                onClick={generateShareableLink}
                                                                disabled={isGeneratingShareUrl}
                                                                className="inline-block w-full text-center bg-white text-[#163331] font-semibold py-3 px-6 rounded-lg hover:bg-gray-100 transition-colors duration-200 shadow-lg"
                                                            >
                                                                {isGeneratingShareUrl ? 'Generating...' : 'Share Property'}
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <p className="text-xs text-white/70 leading-relaxed pt-2">
                                                        {/* This estimate may not include recent renovations or improvements.
                                                        For a personal appraisal, please contact us. */}
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="space-y-6">
                                                    <div>
                                                        <h2 className="text-2xl md:text-3xl font-heading font-semibold text-white/95 mb-4">
                                                            Estimated Value
                                                        </h2>
                                                        <p className="text-white/80 mb-6">
                                                            Unable to generate an estimate for this property.
                                                        </p>
                                                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/15 backdrop-blur-sm rounded-full">
                                                            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                                                            <span className="text-sm font-medium text-white/90">
                                                                Insufficient data
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
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Property Image */}
                                    <div className="relative">
                                        {propertyImages.length > 0 ? (
                                            <div 
                                                className="aspect-[4/3] rounded-xl overflow-hidden shadow-2xl cursor-pointer"
                                                onClick={() => setIsImageGalleryOpen(true)}
                                            >
                                                <img
                                                    src={propertyImages[0]}
                                                    alt={`${property.address} - Main image`}
                                                    className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                                                    loading="eager"
                                                />
                                            </div>
                                        ) : (
                                            <div className="aspect-[4/3] rounded-xl bg-gray-100 flex items-center justify-center shadow-2xl">
                                                <ImageOff className="w-16 h-16 text-gray-400" />
                                            </div>
                                        )}

                                        {propertyImages.length > 1 && (
                                            <div className="absolute bottom-4 right-4 bg-black/70 text-white text-sm px-3 py-1.5 rounded-full backdrop-blur-sm">
                                                {propertyImages.length} photos
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </ScrollReveal>

                        {/* Add the rest of the property page content here */}
                    </div>
                </div>
            </div>

            {/* Lead Capture Modal */}
            {isModalOpen && createPortal(
                <LeadCaptureModal
                    property={property}
                    onSubmit={handleFormSubmit}
                    onClose={() => setIsModalOpen(false)}
                    isSubmitting={isSubmitting}
                    error={formError}
                />,
                document.body
            )}

            {/* Success Modal */}
            {isSuccessModalOpen && createPortal(
                <SuccessModal
                    email={userEmail}
                    propertyAddress={property.address}
                    onClose={() => setIsSuccessModalOpen(false)}
                />,
                document.body
            )}
        </>
    )
}
import jwt from 'jsonwebtoken';

/**
 * Verifies a JWT token
 * @param {string} token - The JWT token to verify
 * @returns {object|null} - The decoded token payload or null if invalid
 */
export function verifyToken(token) {
  if (!token) return null;

  try {
    // For frontend verification, we just decode the token without secret
    // since we're only checking the expiration and payload
    const decoded = jwt.decode(token);
    
    // Check if token is expired
    if (decoded && decoded.exp) {
      const currentTime = Math.floor(Date.now() / 1000);
      if (currentTime > decoded.exp) {
        return null; // Token expired
      }
    }
    
    return decoded;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

/**
 * Checks if a share token is valid for a specific property
 * @param {string} token - The JWT token
 * @param {string} propertyId - The property ID to check against
 * @returns {boolean} - True if token is valid for the property
 */
export function isShareTokenValid(token, propertyId) {
  const decoded = verifyToken(token);
  return decoded && decoded.propertyId === propertyId;
}

/**
 * Checks if the current URL has a valid share token
 * @param {string} propertyId - The property ID to check against
 * @returns {boolean} - True if valid share token is present
 */
export function hasValidShareToken(propertyId) {
  if (typeof window === 'undefined') return false;
  
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('share_token');
  
  return isShareTokenValid(token, propertyId);
}

/**
 * Checks if the current URL has a Kindred group access token
 * @returns {boolean} - True if Kindred group access token is present
 */
export function hasKindredGroupAccess() {
  if (typeof window === 'undefined') return false;
  
  const urlParams = new URLSearchParams(window.location.search);
  const groupToken = urlParams.get('kindred_group_token');
  
  // In a real implementation, you would verify this token
  // For now, we'll just check if it exists
  return !!groupToken;
}
import { NextResponse } from 'next/server';

/**
 * HubSpot CRM Deals API Handler
 * Server-side only - securely handles HubSpot access token
 * 
 * API Endpoint: POST /api/hubspot/deals
 * 
 * Creates a new Deal in HubSpot CRM
 * Pipeline: "874236271"
 * Deal Stage: "1310030426"
 */

/**
 * Parses a currency string (e.g., "$1,234.56") into a number.
 * @param {any} value - The value to parse.
 * @returns {number|null} - The parsed number or null if invalid.
 */
function parseCurrency(value) {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }
  if (typeof value !== 'string') {
    return null;
  }
  // Remove currency symbols, commas, and whitespace
  const cleanedValue = value.replace(/[$,\s]/g, '');
  const num = parseFloat(cleanedValue);
  return Number.isFinite(num) ? num : null;
}

/**
 * Safely converts a value to a numeric property for HubSpot.
 * - Returns the number if it's a valid finite number (including 0)
 * - Returns undefined if value is null, undefined, empty string, NaN, Infinity, or -Infinity
 */
function safeNumericProperty(value) {
  if (value === null || value === undefined || value === "") {
    return undefined;
  }

  const num = parseCurrency(value);

  if (num === null || !Number.isFinite(num)) {
    return undefined;
  }

  return num;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { contactId, property, reportId } = body;

    console.log('📦 Raw property object received:', JSON.stringify(property, null, 2));

    // Validate required fields
    if (!contactId) {
      return NextResponse.json({ success: false, message: 'Contact ID is required' }, { status: 400 });
    }
    if (!property?.address) {
      return NextResponse.json({ success: false, message: 'Property address is required' }, { status: 400 });
    }
    if (!reportId) {
      return NextResponse.json({ success: false, message: 'Report ID is required' }, { status: 400 });
    }

    const hubspotAccessToken = process.env.HUBSPOT_ACCESS_TOKEN;
    if (!hubspotAccessToken) {
      console.error('❌ HubSpot Access Token not configured');
      return NextResponse.json({ success: false, message: 'HubSpot integration not configured' }, { status: 500 });
    }

    const dealProperties = {};

    // Core Deal Properties
    dealProperties.dealname = `Property Report - ${property.address}`;
    dealProperties.property_address = property.address;
    if (reportId) dealProperties.report_id = reportId;

    // ── Property Identifier ───────────────────────────────────────────────
    const propertyId = property.property_id || property.id;
    if (propertyId) {
      dealProperties.property_id = propertyId;
    } else {
      console.warn('⚠️ Could not determine property_id from property.property_id or property.id');
    }

    // ── Location & Details ────────────────────────────────────────────────
    if (property.suburb) dealProperties.suburb = property.suburb;
    if (property.state) dealProperties.state = property.state;
    if (property.propertyType) dealProperties.property_type = property.propertyType;

    const postcode = safeNumericProperty(property.postcode);
    if (postcode !== undefined) dealProperties.postcode = postcode;

    const bedrooms = safeNumericProperty(property.beds);
    if (bedrooms !== undefined && bedrooms > 0) dealProperties.bedrooms = bedrooms;

    const bathrooms = safeNumericProperty(property.baths);
    if (bathrooms !== undefined && bathrooms > 0) dealProperties.bathrooms = bathrooms;

    const cars = safeNumericProperty(property.cars ?? property.parking);
    if (cars !== undefined) dealProperties.cars = cars;

    // ── Price & Amount Logic ──────────────────────────────────────────────
    // Parse all price values early
    const parsedMid   = safeNumericProperty(property.priceEstimate?.mid);
    const parsedLow   = safeNumericProperty(property.priceEstimate?.low);
    const parsedHigh  = safeNumericProperty(property.priceEstimate?.high);
    const parsedAmount = safeNumericProperty(property.amount);

    // Set primary deal amount FIRST (critical for fallback)
    let finalAmount;
    if (parsedMid !== undefined) {
      finalAmount = parsedMid;
      console.log(`💡 Set deal.amount to ${finalAmount} from priceEstimate.mid`);
    } else if (parsedAmount !== undefined) {
      finalAmount = parsedAmount;
      console.log(`💡 Set deal.amount to ${finalAmount} from property.amount (fallback)`);
    }

    if (finalAmount !== undefined) {
      dealProperties.amount = finalAmount;
    } else {
      console.warn("⚠️ Could not set deal 'amount' — no valid mid or amount value");
    }

    // Set custom estimate fields
    if (parsedLow !== undefined) dealProperties.price_estimate_low = parsedLow;
    if (parsedHigh !== undefined) dealProperties.price_estimate_high = parsedHigh;

    // Set price_estimate_mid — fallback to amount if mid missing
    if (parsedMid !== undefined) {
      dealProperties.price_estimate_mid = parsedMid;
    } else if (dealProperties.amount !== undefined) {
      dealProperties.price_estimate_mid = dealProperties.amount;
      console.log(`💡 price_estimate_mid fallback → ${dealProperties.amount} from deal.amount`);
    } else {
      console.warn("⚠️ price_estimate_mid remains unset");
    }

    // ── Property URL ──────────────────────────────────────────────────────
    if (property.propertyUrl) {
      dealProperties.property_report_url = property.propertyUrl;
      console.log(`💡 Using explicit property.propertyUrl: ${dealProperties.property_report_url}`);
    } else if (propertyId) {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.kindredproperty.com.au';
      dealProperties.property_report_url = `${baseUrl}/property/${propertyId}`;
      console.log(`💡 Generated property_report_url: ${dealProperties.property_report_url}`);
    } else {
      console.warn('⚠️ property_report_url could not be set (no propertyUrl or propertyId)');
    }

    // Add UTM parameters if they exist
    if (body.utmData) {
      if (body.utmData.utm_source) dealProperties.utm_source = body.utmData.utm_source;
      if (body.utmData.utm_medium) dealProperties.utm_medium = body.utmData.utm_medium;
      if (body.utmData.utm_campaign) dealProperties.utm_campaign = body.utmData.utm_campaign;
      if (body.utmData.utm_term) dealProperties.utm_term = body.utmData.utm_term;
      if (body.utmData.utm_content) dealProperties.utm_content = body.utmData.utm_content;
    }

    // Pipeline & Stage
    dealProperties.pipeline = '874236271';
    dealProperties.dealstage = '1310030426';

    // ── DEBUG: Final properties ───────────────────────────────────────────
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📤 HUBSPOT DEAL - FINAL PROPERTIES BEING SENT');
    console.log('📋 Properties being sent to HubSpot:');
    Object.entries(dealProperties).forEach(([key, value]) => {
      console.log(`   ${key}: ${value} (type: ${typeof value})`);
    });
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // Create deal
    const hubspotApiUrl = 'https://api.hubapi.com/crm/v3/objects/deals';
    const response = await fetch(hubspotApiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${hubspotAccessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ properties: dealProperties }),
    });

    const responseText = await response.text();
    let result;
    try {
      result = JSON.parse(responseText);
    } catch {
      result = { raw: responseText };
    }

    // ── DEBUG: HubSpot response ───────────────────────────────────────────
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔥 HUBSPOT DEAL API RESPONSE');
    console.log(`📊 Status: ${response.status} ${response.ok ? '✓' : '✗'}`);

    if (response.ok) {
      console.log('✅ Deal created successfully!');
      console.log(`   Deal ID: ${result.id}`);
      console.log(`   Deal Name: ${result.properties?.dealname}`);

      console.log('\n📝 Properties accepted by HubSpot:');
      Object.entries(result.properties || {}).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          console.log(`   ✓ ${key}: ${value}`);
        }
      });
    } else {
      console.log('❌ Deal creation failed!');
      console.log('   Error details:', JSON.stringify(result, null, 2));

      if (result.category === 'VALIDATION_ERRORS' || result.errors) {
        console.log('\n⚠️ Property Validation Issues:');
        const errors = result.errors || result.details?.innerStatus?.[0]?.errors || [];
        errors.forEach(err => {
          console.log(`   ✗ ${err.message}`);
          if (err.message?.includes('unknown') || err.message?.includes('does not exist')) {
            const propMatch = err.message.match(/property '(\w+)'/i);
            if (propMatch) {
              console.warn(`   ⚠️ WARNING: Property "${propMatch[1]}" might not exist in HubSpot!`);
            }
          }
        });
      }
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    if (response.ok) {
      return NextResponse.json({
        success: true,
        message: 'Deal created in HubSpot CRM',
        dealId: result.id,
        dealName: result.properties?.dealname,
        timestamp: new Date().toISOString(),
      });
    } else {
      return NextResponse.json(
        { success: false, message: result.message || `HubSpot API error: ${response.status}` },
        { status: response.status }
      );
    }

  } catch (error) {
    console.error('❌ Error in HubSpot deals API route:', error);
    return NextResponse.json(
      { success: false, message: `Server error: ${error.message}` },  
      { status: 500 }
    );
  }
}