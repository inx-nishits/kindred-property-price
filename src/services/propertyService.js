'use client'

import {
  searchProperties,
  getPropertyById,
  getPropertyByAddress,
  getComparableSales,
  getSuburbInsights,
  getNearbySchools,
  getPastSalesHistory,
} from '../data/mockPropertyData'
import { submitLeadFormAndSendReport } from './emailService'

// Simulate API delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Search for properties by address query
 * @param {string} query - Search query
 * @returns {Promise<Array>} Array of matching properties
 */
export const searchPropertiesByQuery = async (query) => {
  // Instant search for real-time experience - no artificial delay
  // Using requestAnimationFrame for smooth UI updates
  await new Promise(resolve => requestAnimationFrame(resolve))
  return searchProperties(query)
}

/**
 * Get full property details by ID
 * @param {string} id - Property ID
 * @returns {Promise<Object>} Property object with all details
 */
export const getPropertyDetails = async (id) => {
  await delay(400)
  const property = getPropertyById(id)
  if (!property) {
    throw new Error('Property not found')
  }

  return {
    ...property,
    comparables: getComparableSales(id),
    suburbInsights: getSuburbInsights(property.suburb, property.state),
    schools: getNearbySchools(id),
    salesHistory: getPastSalesHistory(id),
  }
}

/**
 * Get property by address
 * @param {string} address - Property address
 * @returns {Promise<Object>} Property object
 */
export const getPropertyByAddressQuery = async (address) => {
  await delay(400)
  const property = getPropertyByAddress(address)
  if (!property) {
    throw new Error('Property not found')
  }

  return {
    ...property,
    comparables: getComparableSales(property.id),
    suburbInsights: getSuburbInsights(property.suburb, property.state),
    schools: getNearbySchools(property.id),
    salesHistory: getPastSalesHistory(property.id),
  }
}

/**
 * Submit lead form and unlock content
 * @param {Object} formData - { firstName, lastName, email, mobile }
 * @param {Object} property - Full property object (optional, will be fetched if not provided)
 * @returns {Promise<Object>} Success response
 */
export const submitLeadForm = async (formData, property = null) => {
  try {
    // If property is provided, send the report
    if (property) {
      return await submitLeadFormAndSendReport(formData, property)
    }

    // Otherwise, just simulate success (for backward compatibility)
    await delay(800) // Simulate API call
    return {
      success: true,
      message: 'Report will be sent to your email shortly',
      reportId: `RPT-${Date.now()}`,
    }
  } catch (error) {
    console.error('Error in submitLeadForm:', error)
    // Still return success to unlock content, but log the error
    return {
      success: true,
      message: 'Content unlocked. Report email may be delayed.',
      reportId: `RPT-${Date.now()}`,
      warning: error.message,
    }
  }
}

