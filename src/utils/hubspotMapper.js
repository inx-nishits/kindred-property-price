/**
 * Utility for mapping internal property objects to HubSpot deal properties.
 */

export const safeNumericProperty = (num) => {
    if (num === null || num === undefined || num === '') {
        return undefined;
    }

    if (typeof num === 'string') {
        num = parseFloat(num.replace(/[^0-9.-]+/g, ""));
    }

    if (num === null || !Number.isFinite(num)) {
        return undefined;
    }

    return num;
};

export const mapPropertyToHubspotDeal = (property, reportId, utmData = {}) => {
    const dealProperties = {};

    // Core Deal Properties
    dealProperties.dealname = `Property Report - ${property.address}`;
    dealProperties.property_address = property.address;
    if (reportId) dealProperties.report_id = reportId;

    // Property Identifier
    const propertyId = property.property_id || property.id;
    if (propertyId) {
        dealProperties.property_id = propertyId;
    }

    // Location & Details
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

    // Price & Amount Logic
    const parsedMid = safeNumericProperty(property.priceEstimate?.mid);
    const parsedLow = safeNumericProperty(property.priceEstimate?.low);
    const parsedHigh = safeNumericProperty(property.priceEstimate?.high);
    const parsedAmount = safeNumericProperty(property.amount);

    let finalAmount;
    if (parsedMid !== undefined) {
        finalAmount = parsedMid;
    } else if (parsedAmount !== undefined) {
        finalAmount = parsedAmount;
    }

    if (finalAmount !== undefined) {
        dealProperties.amount = finalAmount;
    }

    if (parsedLow !== undefined) dealProperties.price_estimate_low = parsedLow;
    if (parsedHigh !== undefined) dealProperties.price_estimate_high = parsedHigh;

    if (parsedMid !== undefined) {
        dealProperties.price_estimate_mid = parsedMid;
    } else if (dealProperties.amount !== undefined) {
        dealProperties.price_estimate_mid = dealProperties.amount;
    }

    // Property URL
    if (property.propertyUrl) {
        dealProperties.property_report_url = property.propertyUrl;
    } else if (propertyId) {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.kindredproperty.com.au';
        dealProperties.property_report_url = `${baseUrl}/property/${propertyId}`;
    }

    // UTM parameters
    if (utmData) {
        if (utmData.utm_source) dealProperties.utm_source = utmData.utm_source;
        if (utmData.utm_medium) dealProperties.utm_medium = utmData.utm_medium;
        if (utmData.utm_campaign) dealProperties.utm_campaign = utmData.utm_campaign;
        if (utmData.utm_term) dealProperties.utm_term = utmData.utm_term;
        if (utmData.utm_content) dealProperties.utm_content = utmData.utm_content;
    }

    return dealProperties;
};
