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
    return await response.json()
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
    const data = await response.json()
    return data || []
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
      propertyTypes,
      status: 'Sold',
      searchMode: 'exact',
      locations: [
        {
          state: state,
          suburb: suburb,
          postCode: postcode,
          includeSurroundingSuburbs: true
        }
      ],
      minBedrooms: beds ? Math.max(0, beds - 1) : null,
      maxBedrooms: beds ? beds + 1 : null,
      sort: {
        sortKey: 'SoldDate',
        direction: 'Descending'
      },
      pageSize: 6,
    }

    const response = await fetch(`${DOMAIN_API_BASE_URL}/listings/residential/_search`, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
        'X-Api-Key': apiKey,
        'X-Api-Call-Source': 'live-api-browser',
      },
      body: JSON.stringify(searchBody)
    })

    if (!response.ok) {
      return [];
    }
    const data = await response.json()
    return data || []
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
    const data = await response.json()

    const series = data?.series?.seriesInfo || []

    // Process historical data for charts
    // API structure: seriesInfo array with { year, month, values }
    const historicalData = series
      .map((stat) => {
        const v = stat?.values || {}
        // Year and month are directly on the stat object, not in a period object
        const year = stat.year
        const month = stat.month

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
    return await response.json()
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
  // 1. Try to find the most recent 'sold' or 'advertised' price from history, scanning all records
  let basePrice = null

  if (history?.sales && Array.isArray(history.sales)) {
    for (const sale of history.sales) {
      // Check price at top level first (most common), then nested fields
      const price = sale.price || sale.soldPrice || sale.advertisedPrice
        || sale.last?.advertisedPrice || sale.last?.price
        || sale.first?.advertisedPrice || sale.first?.price

      if (typeof price === 'number' && price > 0) {
        basePrice = price
        break // Found a recent price, stop looking
      }
    }
  }

  let priceEstimate = null

  // Priority 1: Use direct API price estimate
  if (apiPriceEstimate) {
    // API response contains lowerPrice, upperPrice, midPrice directly
    const lower = apiPriceEstimate.lowerPrice || apiPriceEstimate.priceConfidenceLow || apiPriceEstimate.lower
    const upper = apiPriceEstimate.upperPrice || apiPriceEstimate.priceConfidenceHigh || apiPriceEstimate.upper
    const mid = apiPriceEstimate.midPrice || (lower && upper ? Math.round((lower + upper) / 2) : null)

    if (lower && upper) {
      priceEstimate = {
        ...apiPriceEstimate,
        low: lower,
        mid: mid,
        high: upper
      }
    }
  }

  // Priority 2: Derive from basePrice (sales history)
  if (!priceEstimate && basePrice) {
    const mid = basePrice
    const low = Math.round(mid * 0.93)
    const high = Math.round(mid * 1.07)
    priceEstimate = { low, mid, high }
  }

  // Priority 3: Derive from suburb median
  if (!priceEstimate && suburbInsights?.medianPrice && suburbInsights.medianPrice > 0) {
    const mid = suburbInsights.medianPrice
    const low = Math.round(mid * 0.9)
    const high = Math.round(mid * 1.1)
    priceEstimate = { low, mid, high }
  }

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
    priceEstimate,
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
        images: listing.media?.filter(m => m.type === 'photo').map(m => ({ url: m.url })) || []
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

    const domainProperty = await response.json()

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
