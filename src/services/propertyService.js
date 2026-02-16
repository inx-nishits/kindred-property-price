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
export const fetchComparables = async (state, suburb, postcode, propertyType, beds) => {
  const apiKey = process.env.NEXT_PUBLIC_DOMAIN_API_KEY

  // Validate required parameters to prevent 400 errors
  if (!apiKey) {
    return [];
  }

  if (!suburb || !postcode || !state) {
    return [];
  }

  try {
    // Valid property types for Domain API
    const VALID_PROPERTY_TYPES = [
      'House', 'ApartmentUnitFlat', 'Townhouse', 'Villa', 'Semi-detached',
      'Terrace', 'Duplex', 'Acreage', 'AcreageSemi-rural', 'Retirement',
      'BlockOfUnits', 'Other'
    ];

    // Function to validate and normalize property types for the API
    const validatePropertyType = (type) => {
      if (!type) return null

      // Normalize the property type to match API expectations
      const normalized = type.trim()

      // Check if it's already a valid API property type
      if (VALID_PROPERTY_TYPES.includes(normalized)) {
        return normalized
      }

      // Map common variations to valid types
      const mapping = {
        'house': 'House',
        'apartment': 'ApartmentUnitFlat',
        'unit': 'ApartmentUnitFlat',
        'flat': 'ApartmentUnitFlat',
        'townhouse': 'Townhouse',
        'villa': 'Villa',
        'semidetached': 'Semi-detached',
        'semi_detached': 'Semi-detached',
        'terrace': 'Terrace',
        'duplex': 'Duplex',
        'acreage': 'Acreage',
        'retirement': 'Retirement',
        'blockofunits': 'BlockOfUnits',
        'other': 'Other',
        // Handle capitalized versions
        'ApartmentUnit': 'ApartmentUnitFlat',
        'SemiDetached': 'Semi-detached',
        'Semi_Detached': 'Semi-detached',
        'AcreageSemiRural': 'AcreageSemi-rural',
        'AcreageSemi_Rural': 'AcreageSemi-rural',
      }

      const lowerCaseType = normalized.toLowerCase().replace(/[^a-z]/g, '')

      if (mapping[lowerCaseType]) {
        return mapping[lowerCaseType]
      }

      // If we can't map it, return null to not include it
      return null
    };

    let propertyTypes = []
    if (propertyType) {
      const validatedType = validatePropertyType(propertyType)
      if (validatedType) {
        propertyTypes = [validatedType]
      }
    }

    const searchBody = {
      listingType: 'Sale',
      // only include propertyTypes when we have a validated type
      ...(propertyTypes.length > 0 ? { propertyTypes } : {}),
      status: 'Sold',
      searchMode: 'exact',
      locations: [
        {
          state: state,
          suburb: suburb,
          postcode: postcode,
          includeSurroundingSuburbs: true
        }
      ],
      // Only include bedroom filters when provided
      ...(beds ? { minBedrooms: Math.max(0, beds - 1), maxBedrooms: beds + 1 } : {}),
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
        console.log(`Fetched comparables: ${Array.isArray(data) ? data.length : 'unknown'}`)
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
const mapDomainPropertyToAppModel = (domainProperty, suburbInsights = null, apiPriceEstimate = null, schools = [], comparables = [], apiRentalEstimate = null) => {
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
  // If no API estimate available, fall back to sales history
  if (!priceEstimate && basePrice) {
    console.log('📊 Using sales history for price estimate - basePrice:', basePrice);
    console.log('📊 Most recent sale date:', mostRecentSaleDate);

    // 1. Relax Confidence Thresholds & Adjust Price (Indexing)
    let priceConfidence = 'Medium'
    let adjustedPrice = basePrice

    if (mostRecentSaleDate) {
      const ageMs = now - mostRecentSaleDate
      const ageMonths = ageMs / (1000 * 60 * 60 * 24 * 30.44)

      // Index the price if older than 12 months using suburb growth data
      console.log(suburbInsights);
      if (ageMonths > 12 && suburbInsights) {

        const saleYear = mostRecentSaleDate.getFullYear()
        const saleMonth = mostRecentSaleDate.getMonth() + 1

        // Try to find historical median at time of sale
        const historicalStat = suburbInsights.historicalData?.find(d => d.year === saleYear && d.month === saleMonth)
        const currentMedian = suburbInsights.medianPrice

        console.log('📊 Indexing debug - saleYear:', saleYear, 'saleMonth:', saleMonth);
        console.log('📊 Indexing debug - historicalStat:', historicalStat);
        console.log('📊 Indexing debug - currentMedian:', currentMedian);

        if (historicalStat?.medianPrice && currentMedian && currentMedian > 0 && historicalStat.medianPrice > 0) {
          const multiplier = currentMedian / historicalStat.medianPrice
          adjustedPrice = Math.round(basePrice * multiplier)
          console.log(`📈 Indexed price: $${basePrice.toLocaleString('en-AU')} -> $${adjustedPrice.toLocaleString('en-AU')} (Suburb growth multiplier: ${multiplier.toFixed(2)})`)
        } else if (suburbInsights.growthPercent && suburbInsights.growthPercent !== 0) {
          // Fallback to compounding growth if specific historical month is missing
          const ageYears = ageMonths / 12
          const compoundMultiplier = Math.pow(1 + (suburbInsights.growthPercent / 100), ageYears)
          adjustedPrice = Math.round(basePrice * compoundMultiplier)
          console.log(`📈 Indexed price (compound): $${basePrice.toLocaleString('en-AU')} -> $${adjustedPrice.toLocaleString('en-AU')} (${suburbInsights.growthPercent}% annual growth over ${ageYears.toFixed(1)} years)`)
        }
      }

      // Relaxed thresholds
      if (ageMonths <= 12) {
        priceConfidence = 'Very High'  // Sold within 1 year
      } else if (ageMonths <= 24) {
        priceConfidence = 'High'       // Sold within 2 years
      } else if (ageMonths <= 48) {
        priceConfidence = 'Medium'     // Sold within 4 years
      } else {
        priceConfidence = 'Low'        // Sold over 4 years ago
      }
    }

    // 2. Dynamic Variance based on confidence levels
    let variance = 0.07 // Default 7%
    if (priceConfidence === 'Very High') variance = 0.05
    if (priceConfidence === 'High') variance = 0.07
    if (priceConfidence === 'Medium') variance = 0.10
    if (priceConfidence === 'Low') variance = 0.15

    const mid = adjustedPrice
    const low = Math.round(mid * (1 - variance))
    const high = Math.round(mid * (1 + variance))

    console.log('📊 Variance calculation - Base price:', adjustedPrice, 'Variance:', variance, 'Confidence:', priceConfidence);
    console.log('📊 Final calculated values - Low:', low, 'Mid:', mid, 'High:', high);

    priceEstimate = { low, mid, high, priceConfidence }
    console.log(`✅ Estimated Value: $${mid.toLocaleString('en-AU')} (Confidence: ${priceConfidence})`)
    apiFailedError = false  // Success
  } else if (!priceEstimate && suburbInsights?.medianPrice && suburbInsights.medianPrice > 0) {
    // 3. Fallback to Suburb Median if NO sales history exists at all
    const mid = suburbInsights.medianPrice
    const variance = 0.15 // Low confidence variance for generic data
    const low = Math.round(mid * (1 - variance))
    const high = Math.round(mid * (1 + variance))
    const priceConfidence = 'Low'

    priceEstimate = { low, mid, high, priceConfidence }
    apiFailedError = false
    console.log(`ℹ️ No property sales found. Using suburb median fallback: $${mid.toLocaleString('en-AU')}`)
  } else if (!priceEstimate) {
    // No API result, no sales AND no suburb data (rare fallback)
    apiFailedError = true
    apiFailureReason = 'NO_RECENT_SALES'
    console.warn(`⚠️ No recent sales or suburb median found. Showing error modal.`)
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
    comparables: comparables.map(c => {
      const listing = c.listing || c // Search API usually returns items directly or wrapped
      const listingPrice = listing.priceDetails?.price || listing.price || 0
      // Clean price string if it's a string, or use numeric
      let cleanPrice = 0
      if (typeof listingPrice === 'number') cleanPrice = listingPrice
      else if (typeof listingPrice === 'string') {
        cleanPrice = parseInt(listingPrice.replace(/[^0-9]/g, '')) || 0
      }

      return {
        ...c,
        id: listing.id,
        address: listing.propertyDetails?.displayableAddress || listing.addressParts?.displayAddress || 'Address hidden',
        salePrice: listing.saleDetails?.soldPrice || cleanPrice,
        saleDate: listing.saleDetails?.soldDate || listing.dateSold,
        beds: listing.propertyDetails?.bedrooms || 0,
        baths: listing.propertyDetails?.bathrooms || 0,
        parking: listing.propertyDetails?.carspaces || 0,
        landSize: listing.propertyDetails?.landArea || 0,
        // Extract images from various possible sources in the API response
        images: listing.media?.filter(m => m.category === 'Image').map(m => ({ url: m.url, alt: 'Property image' })) ||
          listing.images?.map(img => ({ url: img.url || img, alt: 'Property image' })) ||
          (listing.propertyPhotos || []).map(photo => ({ url: photo.medium || photo.small || photo, alt: 'Property image' })) ||
          []
      }
    }).filter(c => c.salePrice > 0),
    suburbInsights,
    schools: schools.map(s => {
      // The API returns the structure { distance: number, school: { name, schoolType, ... } }
      const schoolData = s.school || s
      return {
        ...s,
        name: schoolData.name,
        type: schoolData.schoolType,
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

    // 4. Comparables
    if (domainProperty.suburb && domainProperty.postcode) {
      promises.push(
        fetchComparables(
          domainProperty.state,
          domainProperty.suburb,
          domainProperty.postcode,
          domainProperty.propertyCategory,
          domainProperty.bedrooms
        ).then(res => ({ type: 'comparables', data: res }))
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
    let apiRentalEstimate = null

    results.forEach(result => {
      if (result.status === 'fulfilled') {
        const { type, data } = result.value
        if (type === 'suburbInsights') suburbInsights = data
        if (type === 'priceEstimate') apiPriceEstimate = data
        if (type === 'schools') schools = data
        if (type === 'comparables') comparables = data
        if (type === 'rentalEstimate') apiRentalEstimate = data
      }
    })

    const mapped = mapDomainPropertyToAppModel(domainProperty, suburbInsights, apiPriceEstimate, schools, comparables, apiRentalEstimate)
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
