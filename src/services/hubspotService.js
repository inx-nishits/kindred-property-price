import { HUBSPOT_CONFIG } from '../config/hubspot';

/**
 * Service for interacting with HubSpot CRM API.
 */
export const createHubspotDeal = async (properties) => {
    const hubspotAccessToken = process.env.HUBSPOT_ACCESS_TOKEN;

    if (!hubspotAccessToken) {
        throw new Error('HubSpot Access Token not configured');
    }

    const payload = {
        properties: {
            ...properties,
            pipeline: HUBSPOT_CONFIG.PIPELINE_ID,
            dealstage: HUBSPOT_CONFIG.DEAL_STAGE_ID
        }
    };

    const response = await fetch(HUBSPOT_CONFIG.BASE_API_URL, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${hubspotAccessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    const responseText = await response.text();
    let result;
    try {
        result = JSON.parse(responseText);
    } catch {
        result = { raw: responseText };
    }

    if (!response.ok) {
        console.error('HubSpot Deal Creation Error:', result);
        return {
            success: false,
            status: response.status,
            error: result
        };
    }

    return {
        success: true,
        dealId: result.id,
        data: result
    };
};
