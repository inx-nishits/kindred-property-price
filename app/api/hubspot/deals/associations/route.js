import { NextResponse } from 'next/server';

/**
 * HubSpot CRM Deal Associations API Handler
 * Server-side only - securely handles HubSpot access token
 * 
 * API Endpoint: PUT /api/hubspot/deals/associations
 * 
 * Associates a Deal with a Contact in HubSpot CRM
 * Uses the association type: deal_to_contact
 */

export async function PUT(request) {
  try {
    const body = await request.json();
    const { dealId, contactId } = body;

    // Validate required fields
    if (!dealId) {
      return NextResponse.json(
        { success: false, message: 'Deal ID is required' },
        { status: 400 }
      );
    }

    if (!contactId) {
      return NextResponse.json(
        { success: false, message: 'Contact ID is required' },
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

    console.log('📤 Associating deal with contact in HubSpot:', {
      dealId: dealId,
      contactId: contactId,
    });

    // Associate deal with contact via HubSpot CRM API
    // PUT /crm/v3/objects/deals/{dealId}/associations/contacts/{contactId}/deal_to_contact
    const hubspotApiUrl = `https://api.hubapi.com/crm/v3/objects/deals/${dealId}/associations/contacts/${contactId}/deal_to_contact`;

    const response = await fetch(hubspotApiUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${hubspotAccessToken}`,
        'Content-Type': 'application/json',
      },
    });

    // Get response
    const responseText = await response.text();

    let result;

    try {
      result = JSON.parse(responseText);
    } catch {
      result = { raw: responseText };
    }

    console.log('🔥 FULL HUBSPOT ASSOCIATION RESPONSE:');
    console.log(result);

    // Log full response
    console.log('🔍 HubSpot Associations API Response:', {
      status: response.status,
      ok: response.ok,
      result: result,
    });

    if (response.ok) {
      console.log('✅ HubSpot deal associated with contact successfully');
      console.log('   Deal ID:', dealId);
      console.log('   Contact ID:', contactId);

      return NextResponse.json({
        success: true,
        message: 'Deal associated with contact in HubSpot CRM',
        dealId: dealId,
        contactId: contactId,
        timestamp: new Date().toISOString(),
      });
    } else {
      // Error
      console.error('❌ HubSpot CRM Associations API error:', response.status, result);
      return NextResponse.json(
        {
          success: false,
          message: result.message || `HubSpot API error: ${response.status}`
        },
        { status: response.status }
      );
    }

  } catch (error) {
    console.error('❌ Error in HubSpot associations API:', error);
    return NextResponse.json(
      {
        success: false,
        message: `Server error: ${error.message}`
      },
      { status: 500 }
    );
  }
}

