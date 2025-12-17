import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, Loader2 } from 'lucide-react'

function LeadCaptureModal({ isOpen, onClose, onSubmit, isSubmitting }) {
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
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
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
          className="relative bg-white rounded-md shadow-lg max-w-md w-full p-6 md:p-8 z-10 max-h-[90vh] overflow-y-auto"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-1.5 right-1.5 p-2 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>

          {/* Header */}
          <div className="mb-6">
            <p className="text-muted-600 text-xs mb-2 tracking-wide">
              Instant property estimate with kindred
            </p>
            <h2 className="text-2xl font-heading font-bold text-dark-green mb-2">
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

            <p className="text-xs text-muted-600 text-center mt-4">
              By submitting, you agree to receive property reports and updates.
              We respect your privacy and will never share your information.
            </p>
          </form>
        </div>
      </div>,
    document.body
  )
}

export default LeadCaptureModal

