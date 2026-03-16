import { NextResponse } from 'next/server';

/**
 * HubSpot CRM Deals API Handler
 * Server-side only - securely handles HubSpot access token
 * 
 * API Endpoint: POST /api/hubspot/properties
 * 
 * Creates a new Deal in HubSpot CRM for each property search
 * Each property search creates a NEW Deal (not update)
 * 
 * Pipeline: "874236271"
 * Deal Stage: "1310030426"
 * 
 * Supports both US and EU HubSpot accounts
 */

/**
 * Get the appropriate HubSpot API base URL based on environment
 */
function getHubSpotApiBaseUrl() {
  const hubspotAccountRegion = process.env.HUBSPOT_ACCOUNT_REGION?.toLowerCase() || 'us';

  if (hubspotAccountRegion === 'eu' || hubspotAccountRegion === 'eu1') {
    return 'https://api.eu1.hubapi.com';
  }

  return 'https://api.hubapi.com';
}

/**
 * Safely converts a value to a numeric property for HubSpot.
 */
function safeNumericProperty(value) {
  if (value === null || value === undefined || value === "") {
    return undefined;
  }

  const num = Number(value);

  if (Number.isNaN(num) || !Number.isFinite(num)) {
    return undefined;
  }

  return num;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { contactId, property, reportId, shareUrl } = body;

    // Validate required fields
    if (!contactId) {
      return NextResponse.json(
        { success: false, message: 'Contact ID is required' },
        { status: 400 }
      );
    }

    if (!property?.address) {
      return NextResponse.json(
        { success: false, message: 'Property address is required' },
        { status: 400 }
      );
    }

    if (!reportId) {
      return NextResponse.json(
        { success: false, message: 'Report ID is required' },
        { status: 400 }
      );
    }

    // Get HubSpot Access Token from server-side environment
    const hubspotAccessToken = process.env.HUBSPOT_ACCESS_TOKEN;

    if (!hubspotAccessToken) {
      console.error('❌ HubSpot Access Token not configured');
      return NextResponse.json(
        { success: false, message: 'HubSpot integration not configured' },
        { status: 500 }
      );
    }

    // Get the correct API base URL
    const hubspotApiBase = getHubSpotApiBaseUrl();
    console.log('🌐 HubSpot API Base URL:', hubspotApiBase);

    // Build deal properties - only use standard HubSpot deal properties
    const dealProperties = {
      dealname: `Property Report - ${property.address}`,
      property_address: property.address,
      property_link: shareUrl,
    };

    // Property ID
    if (property.id) {
      dealProperties.property_id = property.id;
    }

    // Report ID
    if (reportId) {
      dealProperties.report_id = reportId;
    }

    // Location fields (these are standard HubSpot properties)
    if (property.suburb) {
      dealProperties.suburb = property.suburb;
    }
    if (property.state) {
      dealProperties.state = property.state;
    }
    if (property.postcode) {
      dealProperties.postcode = String(property.postcode);
    }

    // Property Type
    if (property.propertyType) {
      dealProperties.property_type = property.propertyType;
    }

    // Bedrooms
    const bedrooms = safeNumericProperty(property.beds);
    if (bedrooms !== undefined && bedrooms > 0) {
      dealProperties.bedrooms = bedrooms;
    }

    // Bathrooms
    const bathrooms = safeNumericProperty(property.baths);
    if (bathrooms !== undefined && bathrooms > 0) {
      dealProperties.bathrooms = bathrooms;
    }

    // Cars
    const cars = safeNumericProperty(property.cars ?? property.parking);
    if (cars !== undefined) {
      dealProperties.cars = cars;
    }

    // Price Estimates (these are standard deal properties)
    const priceEstimateMid = safeNumericProperty(property.priceEstimate?.mid);
    if (priceEstimateMid !== undefined) {
      dealProperties.amount = priceEstimateMid;  // Use built-in 'amount' field for price
      dealProperties.price_estimate_mid = priceEstimateMid;
    }
    const priceEstimateLow = safeNumericProperty(property.priceEstimate?.low);
    if (priceEstimateLow !== undefined) {
      dealProperties.price_estimate_low = priceEstimateLow;
    }
    const priceEstimateHigh = safeNumericProperty(property.priceEstimate?.high);
    if (priceEstimateHigh !== undefined) {
      dealProperties.price_estimate_high = priceEstimateHigh;
    }

    // NOTE: street_address and property_link are custom properties
    // They need to be created in HubSpot first (Settings > Properties > Deals)
    // For now, we'll include them as notes in the dealname if needed

    // Pipeline and Stage (required)
    dealProperties.pipeline = '874236271';
    dealProperties.dealstage = '1310030426';

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📤 HUBSPOT DEAL - CREATING NEW RECORD');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 Properties being sent to HubSpot:');
    Object.entries(dealProperties).forEach(([key, value]) => {
      console.log(`   ${key}: ${value} (type: ${typeof value})`);
    });
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // Create deal via HubSpot CRM API
    const hubspotApiUrl = `${hubspotApiBase}/crm/v3/objects/deals`;

    const response = await fetch(hubspotApiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${hubspotAccessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        properties: dealProperties,
      }),
    });

    // Get response
    const responseText = await response.text();

    let result;

    try {
      result = JSON.parse(responseText);
    } catch {
      result = { raw: responseText };
    }

    // Analyze response
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔥 HUBSPOT DEAL API RESPONSE');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📊 Status: ${response.status} ${response.ok ? '✓' : '✗'}`);

    if (response.ok) {
      console.log('✅ Deal created successfully!');
      console.log(`   Deal ID: ${result.id}`);

      // Now associate with contact
      console.log('📋 Associating deal with contact...');

      const associationResponse = await fetch(
        `${hubspotApiBase}/crm/v3/objects/deals/${result.id}/associations/contacts/${contactId}/deal_to_contact`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${hubspotAccessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const assocResult = await associationResponse.json();

      if (associationResponse.ok) {
        console.log('✅ Deal associated with contact successfully!');
      } else {
        console.log('⚠️  Association failed:', assocResult);
      }

      return NextResponse.json({
        success: true,
        message: 'Deal created and associated with contact',
        dealId: result.id,
        contactId: contactId,
        timestamp: new Date().toISOString(),
      });
    } else {
      console.log('❌ Deal creation failed!');
      console.log('   Error details:', JSON.stringify(result, null, 2));

      // Check for specific errors
      if (result.category === 'VALIDATION_ERROR') {
        console.log('\n⚠️  Deal Validation Issues:');
        if (result.errors) {
          result.errors.forEach(err => {
            console.log(`   ✗ ${err.message}`);

            // Check if it's an unknown property error
            if (err.message?.includes('unknown') || err.message?.includes('does not exist')) {
              const propMatch = err.message.match(/property '(\w+)'/i);
              if (propMatch) {
                console.warn(`   ⚠️  WARNING: Property "${propMatch[1]}" might not exist in HubSpot!`);
              }
            }
          });
        }
      }

      return NextResponse.json(
        {
          success: false,
          message: result.message || `HubSpot API error: ${response.status}`,
          error: result
        },
        { status: response.status }
      );
    }

  } catch (error) {
    console.error('❌ Error in HubSpot deals API:', error);
    return NextResponse.json(
      {
        success: false,
        message: `Server error: ${error.message}`
      },
      { status: 500 }
    );
  }
}