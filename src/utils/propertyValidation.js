/**
 * Property Validation Utilities
 * Prevents 400 Bad Request and 404 Not Found errors from Domain API
 */

// Mock property IDs that cause 404 errors
const MOCK_PROPERTY_IDS = ['1', '2', '3', '4', '5', 'test', 'mock'];

/**
 * Validates property ID format
 * @param {string} id - Property ID to validate
 * @returns {boolean} - True if valid
 */
export const isValidPropertyId = (id) => {
  if (!id || typeof id !== 'string') return false;
  if (id.length < 3) return false;
  if (MOCK_PROPERTY_IDS.includes(id.toLowerCase())) return false;
  return /^[a-zA-Z0-9\-_]+$/.test(id);
};

/**
 * Validates Australian postcode (4 digits)
 * @param {string|number} postcode - Postcode to validate
 * @returns {boolean} - True if valid
 */
export const isValidPostcode = (postcode) => {
  if (!postcode) return false;
  const code = String(postcode).trim();
  return /^\d{4}$/.test(code);
};

/**
 * Validates Australian state abbreviations
 * @param {string} state - State abbreviation to validate
 * @returns {boolean} - True if valid
 */
export const isValidState = (state) => {
  if (!state) return false;
  const validStates = ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT'];
  return validStates.includes(state.toUpperCase());
};

/**
 * Validates suburb name format
 * @param {string} suburb - Suburb name to validate
 * @returns {boolean} - True if valid
 */
export const isValidSuburb = (suburb) => {
  if (!suburb || typeof suburb !== 'string') return false;
  const cleanSuburb = suburb.trim();
  return cleanSuburb.length > 0 && cleanSuburb.length <= 50 && /^[a-zA-Z\s\-']+$/.test(cleanSuburb);
};

/**
 * Detects mock/test property IDs
 * @param {string} id - Property ID to check
 * @returns {boolean} - True if mock ID
 */
export const isMockPropertyId = (id) => {
  if (!id) return false;
  return MOCK_PROPERTY_IDS.includes(String(id).toLowerCase());
};

/**
 * Validates search criteria for Domain API
 * @param {Object} criteria - Search criteria object
 * @returns {Object} - Validation result { isValid: boolean, errors: string[] }
 */
export const validateSearchCriteria = (criteria) => {
  const errors = [];
  
  if (!criteria) {
    errors.push('Search criteria object is required');
    return { isValid: false, errors };
  }

  // Validate locations array
  if (!criteria.locations || !Array.isArray(criteria.locations)) {
    errors.push('locations array is required');
  } else {
    criteria.locations.forEach((location, index) => {
      if (!location.suburb) {
        errors.push(`Location[${index}]: suburb is required`);
      } else if (!isValidSuburb(location.suburb)) {
        errors.push(`Location[${index}]: invalid suburb format`);
      }

      if (!location.postCode) {
        errors.push(`Location[${index}]: postCode is required`);
      } else if (!isValidPostcode(location.postCode)) {
        errors.push(`Location[${index}]: invalid postcode format`);
      }

      if (!location.state) {
        errors.push(`Location[${index}]: state is required`);
      } else if (!isValidState(location.state)) {
        errors.push(`Location[${index}]: invalid state abbreviation`);
      }
    });
  }

  // Validate property types
  if (criteria.propertyTypes && Array.isArray(criteria.propertyTypes)) {
    if (criteria.propertyTypes.length === 0) {
      errors.push('propertyTypes array cannot be empty');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Creates standardized API error object
 * @param {number} status - HTTP status code
 * @param {string} message - Error message
 * @param {Object} details - Additional error details
 * @returns {Object} - Error object
 */
export const createApiError = (status, message, details = {}) => {
  return {
    status,
    message,
    timestamp: new Date().toISOString(),
    ...details
  };
};

/**
 * Logs validation warnings in development
 * @param {string} context - Context of validation
 * @param {Array} errors - Validation errors
 */
export const logValidationWarnings = (context, errors) => {
  if (process.env.NODE_ENV === 'development' && errors.length > 0) {
    console.warn(`[Validation Warning] ${context}:`, errors);
  }
};