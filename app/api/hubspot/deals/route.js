import { NextResponse } from 'next/server';
import { mapPropertyToHubspotDeal } from '@/utils/hubspotMapper';
import { createHubspotDeal } from '@/services/hubspotService';

/**
 * POST /api/hubspot/deals
 * Creates a new deal in HubSpot based on property report data.
 */
export async function POST(request) {
    try {
        const body = await request.json();
        const { contactId, property, reportId, utmData } = body;

        // 1. Validate required fields
        if (!contactId) {
            return NextResponse.json({ success: false, message: 'Contact ID is required' }, { status: 400 });
        }
        if (!property?.address) {
            return NextResponse.json({ success: false, message: 'Property address is required' }, { status: 400 });
        }
        if (!reportId) {
            return NextResponse.json({ success: false, message: 'Report ID is required' }, { status: 400 });
        }

        // 2. Map property data to HubSpot deal properties
        const dealProperties = mapPropertyToHubspotDeal(property, reportId, utmData);

        // Associate with contact if needed (HubSpot v3 API requires associations block or separate call)
        // For simplicity and matching previous logic, we focus on the deal creation properties first.
        // If the previous code didn't explicitly handle association in the same call, we'll stick to that.
        // Actually, the previous code didn't seem to include associations in the POST body.

        console.log('📤 Sending mapped properties to HubSpot:', dealProperties);

        // 3. Create the deal via Service
        const result = await createHubspotDeal(dealProperties);

        if (result.success) {
            return NextResponse.json({
                success: true,
                message: 'Deal created in HubSpot CRM',
                dealId: result.dealId,
                dealName: result.data.properties?.dealname,
                timestamp: new Date().toISOString(),
            });
        } else {
            return NextResponse.json(
                { success: false, message: result.error?.message || 'Failed to create deal in HubSpot' },
                { status: result.status || 500 }
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