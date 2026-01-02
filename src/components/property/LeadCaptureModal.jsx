'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, Loader2 } from 'lucide-react'

function LeadCaptureModal({ isOpen, onClose, onSubmit, isSubmitting, property, primaryImageUrl }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
  })
  const [errors, setErrors] = useState({})

  // Lock body scroll when modal is open and ensure modal is visible
  useEffect(() => {
    if (isOpen) {
      // Store current scroll position
      const scrollY = window.scrollY

      // Prevent body scrolling
      document.body.style.overflow = 'hidden'
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY}px`
      document.body.style.width = '100%'

      // AUTO-FILL: Check for saved user details
      try {
        const savedDetails = localStorage.getItem('kindred_user_details')
        if (savedDetails) {
          const parsed = JSON.parse(savedDetails)
          setFormData(prev => ({
            ...prev,
            firstName: parsed.firstName || '',
            lastName: parsed.lastName || '',
            email: parsed.email || '',
            mobile: parsed.mobile || ''
          }))
        }
      } catch (e) {
        console.error('Failed to auto-fill form', e)
      }

    } else {
      // Restore body scrolling
      const scrollY = document.body.style.top
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''

      // Restore scroll position
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0', 10) * -1)
      }
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
    }
  }, [isOpen])

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const validateMobile = (mobile) => {
    // Basic mobile validation - accepts digits, spaces, hyphens, parentheses, and + for international
    const re = /^[\d\s\-\+\(\)]+$/
    return re.test(mobile) && mobile.replace(/\D/g, '').length >= 8
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const newErrors = {}

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required'
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!formData.mobile.trim()) {
      newErrors.mobile = 'Mobile is required'
    } else if (!validateMobile(formData.mobile)) {
      newErrors.mobile = 'Please enter a valid mobile number'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    onSubmit(formData)
  }

  if (!isOpen) return null

  // Use portal to render modal at document body level
  // This ensures the modal appears above all other content including sticky headers
  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-6"
      style={{
        // Ensure modal is always centered in viewport
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
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative bg-white rounded-xl shadow-xl max-w-5xl w-full p-4 md:p-6 lg:p-8 z-10 max-h-[90vh] overflow-y-auto"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-1.5 right-1.5 p-2 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" strokeWidth={1.5} />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] gap-6 lg:gap-8 items-start">
          {/* Left: Form */}
          <div>
            {/* Header */}
            <div className="mb-6">
              <p className="text-muted-600 text-xs mb-1 tracking-wide">
                Instant property estimate with Kindred
              </p>
              <h2 className="text-2xl md:text-3xl font-heading font-bold text-dark-green mb-1">
                Confirm your details
              </h2>
              <p className="text-muted-600 text-sm">
                Almost there, we just need to get a few details from you
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-sm font-medium text-dark-green mb-2"
                >
                  First name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={`input ${errors.firstName ? 'border-red-500' : ''}`}
                  placeholder="John"
                  disabled={isSubmitting}
                />
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-500">{errors.firstName}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="lastName"
                  className="block text-sm font-medium text-dark-green mb-2"
                >
                  Last name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={`input ${errors.lastName ? 'border-red-500' : ''}`}
                  placeholder="Smith"
                  disabled={isSubmitting}
                />
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-500">{errors.lastName}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-dark-green mb-2"
                >
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`input ${errors.email ? 'border-red-500' : ''}`}
                  placeholder="john.smith@example.com"
                  disabled={isSubmitting}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="mobile"
                  className="block text-sm font-medium text-dark-green mb-2"
                >
                  Mobile <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  id="mobile"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  className={`input ${errors.mobile ? 'border-red-500' : ''}`}
                  placeholder="0412 345 678"
                  disabled={isSubmitting}
                />
                {errors.mobile && (
                  <p className="mt-1 text-sm text-red-500">{errors.mobile}</p>
                )}
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} />
                      Processing...
                    </span>
                  ) : (
                    'View Property Details'
                  )}
                </button>
              </div>

              <p className="text-xs text-muted-600 text-center mt-4 leading-relaxed">
                Don't worry, we never pass your details onto any third parties. By continuing you agree to&nbsp;our&nbsp;<a href="/privacy" className="text-primary-600 underline hover:text-primary-700">
                  Privacy Policy
                </a>
                .
              </p>
            </form>
          </div>

          {/* Right: Property Summary */}
          <div className="w-full">
            <div className="rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm">
              <div className="relative h-40 sm:h-48 bg-gray-200">
                {primaryImageUrl ? (
                  <img
                    src={primaryImageUrl}
                    alt={property?.address || 'Property image'}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 text-white/80 text-sm font-semibold">
                    Property preview
                  </div>
                )}
                <div className="absolute inset-0 bg-black/20" />
              </div>
              <div className="p-4">
                <p className="text-xs font-semibold text-primary-600 mb-1">
                  You're viewing
                </p>
                <h3 className="text-sm md:text-base font-heading font-semibold text-dark-green mb-1 line-clamp-2">
                  {property?.address || 'Selected property'}
                </h3>
                {property && (
                  <p className="text-xs text-muted-600 mb-3">
                    {property.propertyType} · {property.beds} Bed · {property.baths} Bath
                    {typeof property.parking === 'number' ? ` · ${property.parking} Car` : ''}
                  </p>
                )}
                <div className="text-[11px] text-muted-500">
                  This estimate is based on recent sales and market data for this property and its surrounding area.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}

export default LeadCaptureModal

