/**
 * Utility helper functions
 */

/**
 * Format a date to a readable string
 * @param {Date|string} date - Date to format
 * @param {object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date string
 */
export function formatDate(date, options = {}) {
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  }
  return new Intl.DateTimeFormat('en-US', defaultOptions).format(new Date(date))
}

/**
 * Format a number as currency
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default: USD)
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount)
}

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Truncate text to a specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export function truncate(text, maxLength = 100) {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

/**
 * Check if value is empty (null, undefined, empty string, empty array, empty object)
 * @param {any} value - Value to check
 * @returns {boolean} True if empty
 */
export function isEmpty(value) {
  if (value == null) return true
  if (typeof value === 'string' || Array.isArray(value)) {
    return value.length === 0
  }
  if (typeof value === 'object') {
    return Object.keys(value).length === 0
  }
  return false
}

/**
 * Australian states and territories
 */
export const AUSTRALIAN_STATES = [
  'NSW',
  'VIC',
  'QLD',
  'SA',
  'WA',
  'TAS',
  'NT',
  'ACT',
]

/**
 * Australian state full names
 */
export const AUSTRALIAN_STATE_NAMES = {
  NSW: 'New South Wales',
  VIC: 'Victoria',
  QLD: 'Queensland',
  SA: 'South Australia',
  WA: 'Western Australia',
  TAS: 'Tasmania',
  NT: 'Northern Territory',
  ACT: 'Australian Capital Territory',
}

/**
 * Validate if a postcode is a valid Australian postcode (4 digits, 0200-9999)
 * @param {string} postcode - Postcode to validate
 * @returns {boolean} True if valid Australian postcode
 */
export function isValidAustralianPostcode(postcode) {
  if (!postcode || typeof postcode !== 'string') return false
  const cleaned = postcode.trim()
  // Australian postcodes are 4 digits, ranging from 0200 to 9999
  const postcodeRegex = /^[0-9]{4}$/
  if (!postcodeRegex.test(cleaned)) return false
  const num = parseInt(cleaned, 10)
  return num >= 200 && num <= 9999
}

/**
 * Check if a query contains Australian state or postcode
 * @param {string} query - Search query
 * @returns {boolean} True if query appears to be Australian
 */
export function isAustralianLocation(query) {
  if (!query || typeof query !== 'string') return false
  const upperQuery = query.toUpperCase()
  
  // Check for Australian state abbreviations
  const hasState = AUSTRALIAN_STATES.some((state) =>
    upperQuery.includes(state)
  )
  
  // Check for Australian postcode pattern (4 digits)
  const postcodeMatch = query.match(/\b\d{4}\b/)
  if (postcodeMatch) {
    const postcode = postcodeMatch[0]
    if (isValidAustralianPostcode(postcode)) {
      return true
    }
  }
  
  // Check for common Australian city/suburb names
  const australianCities = [
    'SYDNEY',
    'MELBOURNE',
    'BRISBANE',
    'PERTH',
    'ADELAIDE',
    'CANBERRA',
    'HOBART',
    'DARWIN',
    'GOLD COAST',
    'NEWCASTLE',
    'WOLLONGONG',
    'GEELONG',
    'TOWNSVILLE',
    'CAIRNS',
  ]
  const hasCity = australianCities.some((city) => upperQuery.includes(city))
  
  return hasState || hasCity
}

/**
 * Validate Australian address format
 * @param {string} address - Address to validate
 * @returns {object} Validation result with isValid and error message
 */
export function validateAustralianAddress(address) {
  if (!address || typeof address !== 'string') {
    return {
      isValid: false,
      error: 'Please enter a property address',
    }
  }
  
  const trimmed = address.trim()
  
  if (trimmed.length < 3) {
    return {
      isValid: false,
      error: 'Address must be at least 3 characters',
    }
  }
  
  // Check if it appears to be an Australian location
  if (!isAustralianLocation(trimmed)) {
    return {
      isValid: false,
      error: 'Please enter an Australian property address only',
    }
  }
  
  return {
    isValid: true,
    error: null,
  }
}

