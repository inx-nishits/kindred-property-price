import { NextResponse } from 'next/server';

/**
 * HubSpot CRM Contacts API Handler
 * Server-side only - securely handles HubSpot access token
 * 
 * API Endpoint: POST /api/hubspot/contacts
 * 
 * Uses UPSERT via Search + Create/Update to create or update a contact in HubSpot CRM
 * - If contact exists → update
 * - If contact does not exist → create
 * Uses email as unique identifier
 * 
 * Supports both US and EU HubSpot accounts
 */

/**
 * Get the appropriate HubSpot API base URL based on the access token
 * EU accounts use api.eu1.hubapi.com
 */
function getHubSpotApiBaseUrl() {
  // Check environment variable for account region
  // EU accounts use api.eu1.hubapi.com
  // US accounts use api.hubapi.com
  const hubspotAccountRegion = process.env.HUBSPOT_ACCOUNT_REGION?.toLowerCase() || 'us';
  
  if (hubspotAccountRegion === 'eu' || hubspotAccountRegion === 'eu1') {
    return 'https://api.eu1.hubapi.com';
  }
  
  // Default to US
  return 'https://api.hubapi.com';
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { formData, property, reportId } = body;

    // Validate required fields
    if (!formData?.email) {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
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

    // Build properties object - ONLY include contact-specific fields (no property data)
    // Property data will be stored in the Custom Object, not the Contact
    const contactProperties = {
      email: formData.email,
      firstname: formData.firstName,
      lastname: formData.lastName,
      mobilephone: formData.mobile,
    };

    console.log('📤 Upserting contact to HubSpot:', contactProperties);

    // Use createOrUpdate (UPSERT) by email
    const hubspotApiUrl = `${hubspotApiBase}/crm/v3/objects/contacts`;
    
    const response = await fetch(hubspotApiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${hubspotAccessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        properties: contactProperties,
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
    
    console.log('🔥 HubSpot API Response:', {
      status: response.status,
      ok: response.ok,
      result: result,
    });

    if (response.ok) {
      console.log('✅ HubSpot contact created successfully');
      console.log('   Contact ID:', result.id);

      return NextResponse.json({
        success: true,
        message: 'Contact created in HubSpot CRM',
        contactId: result.id,
        timestamp: new Date().toISOString(),
      });
    } else if (response.status === 409) {
        // Contact already exists, extract ID and update
        const existingContactId = result.errors[0].context.existingId;
        console.log(`Contact already exists (ID: ${existingContactId}), attempting update...`);

        const updateUrl = `${hubspotApiBase}/crm/v3/objects/contacts/${existingContactId}`;
        const updateResponse = await fetch(updateUrl, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${hubspotAccessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ properties: contactProperties }),
        });

        const updateResult = await updateResponse.json();

        if (updateResponse.ok) {
            console.log('✅ HubSpot contact updated successfully');
            return NextResponse.json({
                success: true,
                message: 'Contact updated in HubSpot CRM',
                contactId: updateResult.id,
            });
        } else {
            console.error('❌ HubSpot contact update failed:', updateResult);
            return NextResponse.json({ success: false, message: 'Failed to update contact' }, { status: 500 });
        }
    } else {
      // Error
      console.error('❌ HubSpot CRM API error:', response.status, result);
      return NextResponse.json(
        {
          success: false,
          message: result.message || `HubSpot API error: ${response.status}`,
          details: result
        },
        { status: response.status }
      );
    }

  } catch (error) {
    console.error('❌ Error in HubSpot contacts API:', error);
    return NextResponse.json(
      {
        success: false,
        message: `Server error: ${error.message}`
      },
      { status: 500 }
    );
  }
}