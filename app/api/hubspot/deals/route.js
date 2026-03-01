import { NextResponse } from 'next/server';

/**
 * HubSpot CRM Deals API Handler
 * Server-side only - securely handles HubSpot access token
 * 
 * API Endpoint: POST /api/hubspot/deals
 * 
 * Creates a new Deal in HubSpot CRM
 * Pipeline: "874236271"
 * Deal Stage: "1310030426"
 */

/**
 * Parses a currency string (e.g., "$1,234.56") into a number.
 * @param {any} value - The value to parse.
 * @returns {number|null} - The parsed number or null if invalid.
 */
function parseCurrency(value) {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }
  if (typeof value !== 'string') {
    return null;
  }
  // Remove currency symbols, commas, and whitespace
  const cleanedValue = value.replace(/[$,\s]/g, '');
  const num = parseFloat(cleanedValue);
  return Number.isFinite(num) ? num : null;
}

/**
 * Safely converts a value to a numeric property for HubSpot.
 * - Returns the number if it's a valid finite number (including 0)
 * - Returns undefined if value is null, undefined, empty string, NaN, Infinity, or -Infinity
 */
function safeNumericProperty(value) {
  if (value === null || value === undefined || value === "") {
    return undefined;
  }

  const num = parseCurrency(value);

  if (num === null || !Number.isFinite(num)) {
    return undefined;
  }

  return num;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { contactId, property, reportId } = body;

    console.log('📦 Raw property object received:', JSON.stringify(property, null, 2));

    // Validate required fields
    if (!contactId) {
      return NextResponse.json({ success: false, message: 'Contact ID is required' }, { status: 400 });
    }
    if (!property?.address) {
      return NextResponse.json({ success: false, message: 'Property address is required' }, { status: 400 });
    }
    if (!reportId) {
      return NextResponse.json({ success: false, message: 'Report ID is required' }, { status: 400 });
    }

    const hubspotAccessToken = process.env.HUBSPOT_ACCESS_TOKEN;
    if (!hubspotAccessToken) {
      console.error('❌ HubSpot Access Token not configured');
      return NextResponse.json({ success: false, message: 'HubSpot integration not configured' }, { status: 500 });
    }

    const dealProperties = {};

    // Core Deal Properties
    dealProperties.dealname = `Property Report - ${property.address}`;
    dealProperties.property_address = property.address;
    if (reportId) dealProperties.report_id = reportId;

    // ── Property Identifier ───────────────────────────────────────────────
    const propertyId = property.property_id || property.id;
    if (propertyId) {
      dealProperties.property_id = propertyId;
    } else {
      console.warn('⚠️ Could not determine property_id from property.property_id or property.id');
    }

    // ── Location & Details ────────────────────────────────────────────────
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

    // ── Price & Amount Logic ──────────────────────────────────────────────
    // Parse all price values early
    const parsedMid   = safeNumericProperty(property.priceEstimate?.mid);
    const parsedLow   = safeNumericProperty(property.priceEstimate?.low);
    const parsedHigh  = safeNumericProperty(property.priceEstimate?.high);
    const parsedAmount = safeNumericProperty(property.amount);

    // Set primary deal amount FIRST (critical for fallback)
    let finalAmount;
    if (parsedMid !== undefined) {
      finalAmount = parsedMid;
      console.log(`💡 Set deal.amount to ${finalAmount} from priceEstimate.mid`);
    } else if (parsedAmount !== undefined) {
      finalAmount = parsedAmount;
      console.log(`💡 Set deal.amount to ${finalAmount} from property.amount (fallback)`);
    }

    if (finalAmount !== undefined) {
      dealProperties.amount = finalAmount;
    } else {
      console.warn("⚠️ Could not set deal 'amount' — no valid mid or amount value");
    }

    // Set custom estimate fields
    if (parsedLow !== undefined) dealProperties.price_estimate_low = parsedLow;
    if (parsedHigh !== undefined) dealProperties.price_estimate_high = parsedHigh;

    // Set price_estimate_mid — fallback to amount if mid missing
    if (parsedMid !== undefined) {
      dealProperties.price_estimate_mid = parsedMid;
    } else if (dealProperties.amount !== undefined) {
      dealProperties.price_estimate_mid = dealProperties.amount;
      console.log(`💡 price_estimate_mid fallback → ${dealProperties.amount} from deal.amount`);
    } else {
      console.warn("⚠️ price_estimate_mid remains unset");
    }

    // ── Property URL ──────────────────────────────────────────────────────
    if (property.propertyUrl) {
      dealProperties.property_report_url = property.propertyUrl;
      console.log(`💡 Using explicit property.propertyUrl: ${dealProperties.property_report_url}`);
    } else if (propertyId) {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.kindredproperty.com.au';
      dealProperties.property_report_url = `${baseUrl}/property/${propertyId}`;
      console.log(`💡 Generated property_report_url: ${dealProperties.property_report_url}`);
    } else {
      console.warn('⚠️ property_report_url could not be set (no propertyUrl or propertyId)');
    }

    // Add UTM parameters if they exist
    if (body.utmData) {
      if (body.utmData.utm_source) dealProperties.utm_source = body.utmData.utm_source;
      if (body.utmData.utm_medium) dealProperties.utm_medium = body.utmData.utm_medium;
      if (body.utmData.utm_campaign) dealProperties.utm_campaign = body.utmData.utm_campaign;
      if (body.utmData.utm_term) dealProperties.utm_term = body.utmData.utm_term;
      if (body.utmData.utm_content) dealProperties.utm_content = body.utmData.utm_content;
    }

    // Pipeline & Stage
    dealProperties.pipeline = '874236271';
    dealProperties.dealstage = '1310030426';

    // ── DEBUG: Final properties ───────────────────────────────────────────
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📤 HUBSPOT DEAL - FINAL PROPERTIES BEING SENT');
    console.log('📋 Properties being sent to HubSpot:');
    Object.entries(dealProperties).forEach(([key, value]) => {
      console.log(`   ${key}: ${value} (type: ${typeof value})`);
    });
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // Create deal
    const hubspotApiUrl = 'https://api.hubapi.com/crm/v3/objects/deals';
    const response = await fetch(hubspotApiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${hubspotAccessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ properties: dealProperties }),
    });

    const responseText = await response.text();
    let result;
    try {
      result = JSON.parse(responseText);
    } catch {
      result = { raw: responseText };
    }

    // ── DEBUG: HubSpot response ───────────────────────────────────────────
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔥 HUBSPOT DEAL API RESPONSE');
    console.log(`📊 Status: ${response.status} ${response.ok ? '✓' : '✗'}`);

    if (response.ok) {
      console.log('✅ Deal created successfully!');
      console.log(`   Deal ID: ${result.id}`);
      console.log(`   Deal Name: ${result.properties?.dealname}`);

      console.log('\n📝 Properties accepted by HubSpot:');
      Object.entries(result.properties || {}).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          console.log(`   ✓ ${key}: ${value}`);
        }
      });
    } else {
      console.log('❌ Deal creation failed!');
      console.log('   Error details:', JSON.stringify(result, null, 2));

      if (result.category === 'VALIDATION_ERRORS' || result.errors) {
        console.log('\n⚠️ Property Validation Issues:');
        const errors = result.errors || result.details?.innerStatus?.[0]?.errors || [];
        errors.forEach(err => {
          console.log(`   ✗ ${err.message}`);
          if (err.message?.includes('unknown') || err.message?.includes('does not exist')) {
            const propMatch = err.message.match(/property '(\w+)'/i);
            if (propMatch) {
              console.warn(`   ⚠️ WARNING: Property "${propMatch[1]}" might not exist in HubSpot!`);
            }
          }
        });
      }
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    if (response.ok) {
      return NextResponse.json({
        success: true,
        message: 'Deal created in HubSpot CRM',
        dealId: result.id,
        dealName: result.properties?.dealname,
        timestamp: new Date().toISOString(),
      });
    } else {
      return NextResponse.json(
        { success: false, message: result.message || `HubSpot API error: ${response.status}` },
        { status: response.status }
      );
    }

  } catch (error) {
    console.error('❌ Error in HubSpot deals API route:', error);
    return NextResponse.json(
      { success: false, message: `Server error: ${error.message}` },  
      { status: 500 }
    );
  }
}