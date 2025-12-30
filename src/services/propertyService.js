'use client'

import { submitLeadFormAndSendReport } from './emailService'

const DOMAIN_API_BASE_URL = 'https://api.domain.com.au/v1'
const DOMAIN_API_V2_BASE_URL = 'https://api.domain.com.au/v2'

/**
 * Fetch price estimate for a property
 */
const fetchPriceEstimate = async (id) => {
  const apiKey = process.env.NEXT_PUBLIC_DOMAIN_API_KEY
  if (!apiKey || !id) return null

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
const fetchSchools = async (lat, lng) => {
  const apiKey = process.env.NEXT_PUBLIC_DOMAIN_API_KEY
  if (!apiKey || !lat || !lng) return []

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
const fetchComparables = async (state, suburb, postcode, propertyType, beds) => {
  const apiKey = process.env.NEXT_PUBLIC_DOMAIN_API_KEY
  if (!apiKey || !suburb || !postcode) return []

  try {
    const searchBody = {
      listingType: 'Sale',
      propertyTypes: propertyType ? [propertyType] : [],
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

    if (!response.ok) return []
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
  if (!trimmedQuery) {
    return []
  }

  const apiKey = process.env.NEXT_PUBLIC_DOMAIN_API_KEY

  if (!apiKey) {
    console.error('NEXT_PUBLIC_DOMAIN_API_KEY not found.')
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
      console.error('Domain API error:', response.status, response.statusText)
      return []
    }

    const data = await response.json()

    if (!Array.isArray(data)) {
      console.warn('API response is not an array:', typeof data)
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
 * Fetch suburb performance statistics
 */
const fetchSuburbPerformance = async (state, suburb, postcode) => {
  const apiKey = process.env.NEXT_PUBLIC_DOMAIN_API_KEY
  if (!apiKey || !state || !suburb || !postcode) return null

  try {
    const response = await fetch(
      `${DOMAIN_API_V2_BASE_URL}/suburbPerformanceStatistics/${state}/${suburb}/${postcode}?propertyCategory=House&chronologicalSpan=12&tPeriod=1`,
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

    // Reverse to find the most recent valid data first
    // Since many fields are null (like medianSoldPrice), we need smarter fallbacks
    const validStat = [...series].reverse().find(stat => {
      const v = stat?.values
      return v && (v.medianSoldPrice > 0 || v.medianSaleListingPrice > 0 || v.highestSoldPrice > 0)
    })

    const latestStat = validStat || series[series.length - 1] || {}
    const values = latestStat.values || {}

    // Calculate generic auction clearance rate if not provided: Sold / (Sold + Withdrawn)
    let clearanceRate = values.auctionClearanceRate
    if (!clearanceRate && values.auctionNumberAuctioned > 0) {
      const sold = values.auctionNumberSold || 0
      const total = values.auctionNumberAuctioned
      clearanceRate = Math.round((sold / total) * 100)
    }

    // Median price fallback logic:
    // 1. Median Sold Price
    // 2. Median Listing Price
    // 3. 50th percentile (derived average of highest/lowest sold if desperate, but risky. Let's stick to listing price)
    let medianPrice = values.medianSoldPrice
    if (!medianPrice) medianPrice = values.medianSaleListingPrice
    if (!medianPrice && values.lowestSoldPrice && values.highestSoldPrice) {
      // Very rough estimate if no median avail
      medianPrice = Math.round((values.lowestSoldPrice + values.highestSoldPrice) / 2)
    }

    return {
      medianPrice: medianPrice || 0,
      growthPercent: values.annualGrowth || 0,
      demand: 'Medium', // API doesn't provide demand score directly
      population: 0, // Not in this endpoint
      averageDaysOnMarket: values.daysOnMarket || 0,
      auctionClearanceRate: clearanceRate || 0,
    }

  } catch (error) {
    console.error('Error fetching suburb performance:', error)
    return null
  }
}

/**
 * Fetch rental estimate for a property
 */
const fetchRentalEstimate = async (id) => {
  const apiKey = process.env.NEXT_PUBLIC_DOMAIN_API_KEY
  if (!apiKey || !id) return null

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
      // Check standard fields or possible variants in API response
      const price = sale.price || sale.soldPrice || sale.advertisedPrice
        || sale.first?.price || sale.first?.advertisedPrice
        || sale.last?.price || sale.last?.advertisedPrice

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
      priceEstimate = { low: lower, mid: mid, high: upper }
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

  // Build sales history
  const salesHistory =
    history?.sales?.map((sale) => {
      const seg = sale.last || sale.first || {}
      return {
        salePrice: seg.price || seg.advertisedPrice || null,
        saleDate: seg.date || seg.advertisedDate || null,
        saleType: seg.type || null,
      }
    }).filter(s => s.salePrice && s.saleDate) || []

  // Basic photo gallery from Domain photos
  const propertyImages =
    photos?.filter((p) => p.imageType === 'Property').map((p) => ({
      id: `${p.advertId}-${p.rank}`,
      url: p.fullUrl,
      alt: `${address || streetAddress || 'Property image'}`,
    })) || []

  return {
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

  if (!apiKey) {
    console.error("Missing API Key")
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
      throw new Error(`Domain API error: ${response.status}`)
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
