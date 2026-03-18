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
    console.log(`🔐 Token Check: Length=${hubspotAccessToken.length}, StartsWith=${hubspotAccessToken.substring(0, 8)}`);
    console.log(`🔐 Contact Info: Email=${formData.email}`);

    // Build properties object - ONLY include contact-specific fields (no property data)
    // Property data will be stored in the Custom Object, not the Contact
    const contactProperties = {
      email: formData.email,
      firstname: formData.firstName,
      lastname: formData.lastName,
      mobilephone: formData.mobile,
    };

    console.log('📤 Upserting contact to HubSpot:', contactProperties);

    // Step 1: Search for existing contact by email
    console.log('🔍 Searching for existing contact with email:', formData.email);
    const searchUrl = `${hubspotApiBase}/crm/v3/objects/contacts/search`;
    const searchResponse = await fetch(searchUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${hubspotAccessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filterGroups: [{
          filters: [{
            propertyName: 'email',
            operator: 'EQ',
            value: formData.email
          }]
        }],
        properties: ['id']
      }),
    });

    const searchResult = await searchResponse.json();
    console.log('🔍 Search result:', searchResult);

    // IMPORTANT: Check if the search API call itself was successful
    if (!searchResponse.ok) {
      console.error('❌ HubSpot search API failed:', searchResult);
      return NextResponse.json(
        {
          success: false,
          message: searchResult.message || 'Failed to search for contact',
          details: searchResult
        },
        { status: searchResponse.status }
      );
    }

    let contactId;

    // Step 2: Create or update contact
    if (searchResult.total === 0) {
      // Contact doesn't exist, create new
      console.log('➕ Creating new contact in HubSpot');
      const createUrl = `${hubspotApiBase}/crm/v3/objects/contacts`;
      const createResponse = await fetch(createUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${hubspotAccessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          properties: contactProperties,
        }),
      });

      const createResult = await createResponse.json();
      console.log('🔥 Create response:', {
        status: createResponse.status,
        ok: createResponse.ok,
        result: createResult,
      });

      if (createResponse.ok) {
        console.log('✅ HubSpot contact created successfully');
        console.log('   Contact ID:', createResult.id);
        contactId = createResult.id;
      } else {
        console.error('❌ HubSpot contact creation failed:', createResult);
        return NextResponse.json(
          {
            success: false,
            message: createResult.message || 'Failed to create contact',
            details: createResult
          },
          { status: createResponse.status }
        );
      }
    } else {
      // Contact exists, update
      contactId = searchResult.results[0].id;
      console.log(`✏️ Updating existing contact (ID: ${contactId})`);

      const updateUrl = `${hubspotApiBase}/crm/v3/objects/contacts/${contactId}`;
      const updateResponse = await fetch(updateUrl, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${hubspotAccessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          properties: contactProperties,
        }),
      });

      const updateResult = await updateResponse.json();
      console.log('🔥 Update response:', {
        status: updateResponse.status,
        ok: updateResponse.ok,
        result: updateResult,
      });

      if (updateResponse.ok) {
        console.log('✅ HubSpot contact updated successfully');
      } else {
        console.error('❌ HubSpot contact update failed:', updateResult);
        return NextResponse.json(
          {
            success: false,
            message: updateResult.message || 'Failed to update contact',
            details: updateResult
          },
          { status: updateResponse.status }
        );
      }
    }

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Contact processed in HubSpot CRM',
      contactId: contactId,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('❌ Error in HubSpot contacts API:', {
      message: error.message,
      stack: error.stack,
      body: request.body,
    });
    return NextResponse.json(
      {
        success: false,
        message: `Server error: ${error.message}`
      },
      { status: 500 }
    );
  }
}