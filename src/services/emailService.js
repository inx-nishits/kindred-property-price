import api from './api'

/**
 * Brevo Email Service
 * Handles sending emails through Brevo API via serverless function
 */

// Determine the correct API endpoint based on environment
const getEmailEndpoint = () => {
  // In production, try both Vercel and Netlify paths
  // The serverless function will handle the correct one
  if (import.meta.env.PROD) {
    // Try Vercel path first, then Netlify
    return '/api/send-email'
  }
  // In development, use the path based on VITE_API_BASE_URL or default
  if (import.meta.env.VITE_API_BASE_URL) {
    return `${import.meta.env.VITE_API_BASE_URL}/send-email`
  }
  // Default: try Vercel path, Netlify dev server will proxy it
  return '/api/send-email'
}

/**
 * Send contact form email
 * @param {Object} formData - Contact form data
 * @param {string} formData.firstName - First name
 * @param {string} formData.lastName - Last name
 * @param {string} formData.email - Email address
 * @param {string} formData.phone - Phone number (optional)
 * @param {string} formData.message - Message content
 * @returns {Promise<Object>} Success response
 */
export const sendContactEmail = async (formData) => {
  try {
    const response = await api.post(getEmailEndpoint(), {
      type: 'contact',
      data: {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone || 'Not provided',
        message: formData.message,
      },
    })
    return response.data
  } catch (error) {
    console.error('Error sending contact email:', error)
    throw new Error(
      error.response?.data?.message || 'Failed to send email. Please try again.'
    )
  }
}

/**
 * Send lead capture email (property report request)
 * @param {Object} formData - Lead form data
 * @param {string} formData.name - Full name
 * @param {string} formData.email - Email address
 * @param {Object} propertyData - Property information (optional)
 * @returns {Promise<Object>} Success response
 */
export const sendLeadCaptureEmail = async (formData, propertyData = null) => {
  try {
    const response = await api.post(getEmailEndpoint(), {
      type: 'lead',
      data: {
        name: formData.name,
        email: formData.email,
        propertyAddress: propertyData?.address || 'N/A',
        propertySuburb: propertyData?.suburb || 'N/A',
        propertyId: propertyData?.id || 'N/A',
      },
    })
    return response.data
  } catch (error) {
    console.error('Error sending lead capture email:', error)
    throw new Error(
      error.response?.data?.message || 'Failed to send email. Please try again.'
    )
  }
}

/**
 * Send property report email
 * @param {Object} data - Report data
 * @param {string} data.email - Recipient email
 * @param {string} data.name - Recipient name
 * @param {Object} data.property - Property data
 * @returns {Promise<Object>} Success response
 */
export const sendPropertyReportEmail = async (data) => {
  try {
    const response = await api.post(getEmailEndpoint(), {
      type: 'report',
      data: {
        email: data.email,
        name: data.name,
        property: data.property,
      },
    })
    return response.data
  } catch (error) {
    console.error('Error sending property report email:', error)
    throw new Error(
      error.response?.data?.message || 'Failed to send report. Please try again.'
    )
  }
}

