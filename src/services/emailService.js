/**
 * Email Service for Property Reports
 * 
 * Handles generation of professional HTML emails for property reports.
 * Integrates with HubSpot for lead capture and CRM management.
 * Currently configured to LOG the email content to console (Stub Mode).
 * Ready to be connected to EmailJS, SendGrid, AWS SES, or Brevo.
 */

import { HUBSPOT_CONFIG, CONTACT_CONFIG, BRAND_CONFIG } from '@/config/report.config'

/**
 * Create a HubSpot contact from lead form data
 * @param {Object} formData - The user's form data (firstName, lastName, email, mobile)
 * @param {Object} property - The property data object
 * @returns {Promise<Object>} HubSpot response with success status
 */
const createHubSpotContact = async (formData, property) => {
    try {
        if (!HUBSPOT_CONFIG.portalId || !HUBSPOT_CONFIG.formId) {
            console.warn('⚠️ HubSpot configuration incomplete: Missing Portal ID or Form ID');
            return { success: false, message: 'HubSpot configuration not set up' };
        }

        const payload = {
            fields: [
                { name: 'firstname', value: formData.firstName || '' },
                { name: 'lastname', value: formData.lastName || '' },
                { name: 'email', value: formData.email || '' },
                { name: 'phone', value: formData.mobile || '' },
                { name: 'property_address', value: property?.address || '' },
                { name: 'property_id', value: property?.id || '' },
            ]
        };

        console.log('📤 Sending contact to HubSpot:', {
            portalId: HUBSPOT_CONFIG.portalId,
            email: formData.email,
            propertyAddress: property?.address
        });

        const response = await fetch(HUBSPOT_CONFIG.contactApiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ...payload,
                context: {
                    pageUri: typeof window !== 'undefined' ? window.location.href : '',
                    pageName: 'Property Report Lead Capture'
                }
            })
        });

        // HubSpot returns 200 on success, 400+ on various errors
        if (response.ok) {
            console.log('✅ HubSpot contact created successfully');
            return { success: true, message: 'Contact created in HubSpot' };
        } else {
            const errorText = await response.text();
            console.error('❌ HubSpot API error:', response.status, errorText);
            return {
                success: false,
                message: `HubSpot API error: ${response.status}`
            };
        }
    } catch (error) {
        console.error('❌ Error creating HubSpot contact:', error);
        return {
            success: false,
            message: `Error creating contact: ${error.message}`
        };
    }
};

/**
 * Generate a professional HTML email template for the property
 * @param {Object} property - The property data object
 * @param {Object} formData - The user's form data
 * @returns {string} HTML string
 */
const generatePropertyEmailHtml = (property, formData) => {
    const { address, beds, baths, cars, landSize, priceEstimate, rentalEstimate, propertyType, id, postcode, suburb, state, coordinates, buildingSize, shortAddress } = property;
    const { firstName } = formData;

    // Base URL for links (should match current environment so testing works on localhost)
    const baseUrl = (typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_BASE_URL) || 'http://localhost:3000';

    const logoUrl = BRAND_CONFIG.logoUrl;
    const footerLogoUrl = BRAND_CONFIG.footerLogoUrl || logoUrl;
    // Branding Colors
    const colors = {
        primary: '#34BF77',
        brandDark: '#163331',
        brandGreen: '#065f46',
        softWhite: '#F5F3EB',
        softGray: '#F8FAF9',
        textMain: '#163331',
        textMuted: '#6b7280',
        border: '#e5e7eb',
        white: '#ffffff',
        success: '#34d399',
        error: '#e53935'
    };

    // Format currency helper
    const formatCurrency = (val) => new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD', maximumFractionDigits: 0 }).format(val);
    const formatNumber = (val) => new Intl.NumberFormat('en-AU').format(val);

    const priceText = priceEstimate
        ? `${formatCurrency(priceEstimate.low)} - ${formatCurrency(priceEstimate.high)}`
        : 'Contact Agent';

    const rentalText = rentalEstimate?.weekly?.mid
        ? `${formatCurrency(rentalEstimate.weekly.low)} - ${formatCurrency(rentalEstimate.weekly.high)} / week`
        : 'Not available';

    const rentalYield = rentalEstimate?.yield ? `${rentalEstimate.yield}%` : '';

    // Main HTML Template
    return `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Property Report for ${address}</title>
    <style type="text/css">
        /* Client-specific resets */
        body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
        img { -ms-interpolation-mode: bicubic; }
        
        /* Mobile Styles */
        @media screen and (max-width: 600px) {
            .main-container { width: 100% !important; }
            .stack-column { display: block !important; width: 100% !important; box-sizing: border-box; }
            .mobile-pad { padding: 20px !important; }
            .mobile-center { text-align: center !important; }
            .hero-image { height: 200px !important; }
            .feature-cell { width: 50% !important; display: inline-block !important; border: 0 !important; margin-bottom: 10px; background: ${colors.softGray}; }
            .no-border-mobile { border: none !important; }
        }
    </style>
</head>
<body style="margin: 0; padding: 0; background-color: ${colors.softGray}; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: ${colors.textMain};">
    <div style="background-color: ${colors.softGray}; width: 100%;">
        <!-- Wrapper Table -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: ${colors.softGray};">
            <tr>
                <td align="center" style="padding-top: 20px; padding-bottom: 40px;">
                    <!-- Main Container -->
                    <table border="0" cellpadding="0" cellspacing="0" width="600" class="main-container" style="background-color: ${colors.white}; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); width: 600px; max-width: 600px;">
                        
                        <!-- Header with Logo -->
                        <tr>
                            <td align="center" style="padding: 20px 0; border-bottom: 1px solid ${colors.border}; background-color: ${colors.white}; line-height: 1;">
                                <a href="${baseUrl}" target="_blank" style="text-decoration: none; display: inline-block; padding: 0; line-height: 1;">
                                    <img src="${logoUrl}" alt="KINDRED PROPERTY" style="height: 65px; width: auto; max-width: 230px; display: block; margin: 0;" draggable="false" />
                                </a>
                            </td>
                        </tr>

                        ${property.images && property.images.length > 0 ? `
                        <!-- Hero Image -->
                        <tr>
                            <td style="padding: 0; background-color: #E9F2EE;">
                                <img src="${property.images[0].url}" alt="Property" class="hero-image" width="600" style="display: block; width: 100%; max-width: 600px; height: 200px; object-fit: cover;" />
                            </td>
                        </tr>
                        ` : ''}

                        <!-- Content Body -->
                        <tr>
                            <td class="mobile-pad" style="padding: 40px;">
                                
                                <!-- Introduction -->
                                <p style="margin: 0 0 15px 0; font-size: 18px; color: ${colors.textMain}; font-weight: 400;">Hi ${firstName},</p>
                                <p style="margin: 0 0 30px 0; font-size: 16px; color: ${colors.textMuted}; line-height: 1.6;">
                                    Here is the property report you requested. This comprehensive overview includes valuation estimates, rental potential, and recent market activity for your property.
                                </p>

                                <!-- Property Title Block -->
                                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 30px;">
                                    <tr>
                                        <td>
                                            <h1 style="margin: 0 0 8px 0; font-size: 26px; font-weight: 700; color: ${colors.brandDark}; line-height: 1.3;">${address}</h1>
                                            <p style="margin: 0; font-size: 15px; color: ${colors.textMuted}; letter-spacing: 0.5px;">
                                                ${propertyType} &bull; ${suburb}, ${state} ${postcode} &bull; ID: ${id}
                                            </p>
                                        </td>
                                    </tr>
                                </table>

                                <!-- Key Features Grid -->
                                ${(beds > 0 || baths > 0 || cars > 0 || (landSize && landSize > 0)) ? `
                                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 35px; border-collapse: separate; border-spacing: 2px;">
                                    <tr>
                                        ${beds > 0 ? `
                                        <td align="center" class="feature-cell" width="25%" style="padding: 12px 5px; background-color: ${colors.softGray}; border-radius: 6px;">
                                            <div style="font-size: 20px; font-weight: 700; color: ${colors.brandDark}; line-height: 1;">${beds}</div>
                                            <div style="font-size: 11px; text-transform: uppercase; color: ${colors.textMuted}; margin-top: 5px; letter-spacing: 1px;">Beds</div>
                                        </td>
                                        ` : ''}
                                        ${baths > 0 ? `
                                        <td align="center" class="feature-cell" width="25%" style="padding: 12px 5px; background-color: ${colors.softGray}; border-radius: 6px;">
                                            <div style="font-size: 20px; font-weight: 700; color: ${colors.brandDark}; line-height: 1;">${baths}</div>
                                            <div style="font-size: 11px; text-transform: uppercase; color: ${colors.textMuted}; margin-top: 5px; letter-spacing: 1px;">Baths</div>
                                        </td>
                                        ` : ''}
                                        ${cars > 0 ? `
                                        <td align="center" class="feature-cell" width="25%" style="padding: 12px 5px; background-color: ${colors.softGray}; border-radius: 6px;">
                                            <div style="font-size: 20px; font-weight: 700; color: ${colors.brandDark}; line-height: 1;">${cars}</div>
                                            <div style="font-size: 11px; text-transform: uppercase; color: ${colors.textMuted}; margin-top: 5px; letter-spacing: 1px;">Cars</div>
                                        </td>
                                        ` : ''}
                                        ${(landSize && landSize > 0) ? `
                                        <td align="center" class="feature-cell" width="25%" style="padding: 12px 5px; background-color: ${colors.softGray}; border-radius: 6px;">
                                            <div style="font-size: 20px; font-weight: 700; color: ${colors.brandDark}; line-height: 1;">${formatNumber(landSize)}</div>
                                            <div style="font-size: 11px; text-transform: uppercase; color: ${colors.textMuted}; margin-top: 5px; letter-spacing: 1px;">m² Land</div>
                                        </td>
                                        ` : ''}
                                    </tr>
                                </table>
                                ` : ''}

                                <!-- Valuation Estimates Card -->
                                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: ${colors.brandDark}; border-radius: 12px; margin-bottom: 40px; color: ${colors.white}; overflow: hidden;">
                                    <tr>
                                        <td style="padding: 30px;">
                                            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                                <tr>
                                                    <td style="padding-bottom: 25px; border-bottom: 1px solid rgba(255,255,255,0.15);">
                                                        <div style="font-size: 13px; text-transform: uppercase; letter-spacing: 1.5px; opacity: 0.8; margin-bottom: 8px;">Estimated Value</div>
                                                        <div style="font-size: 28px; font-weight: 700; color: #ffffff; line-height: 1.2;">${priceText}</div>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td style="padding-top: 25px;">
                                                        <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                                            <tr>
                                                                <td>
                                                                    <div style="font-size: 13px; text-transform: uppercase; letter-spacing: 1.5px; opacity: 0.8; margin-bottom: 8px;">Potential Rent</div>
                                                                    <div style="font-size: 22px; font-weight: 600; color: #ffffff;">${rentalText}</div>
                                                                </td>
                                                                ${rentalYield ? `
                                                                <td align="right" style="vertical-align: bottom;">
                                                                    <span style="background: rgba(255,255,255,0.15); padding: 6px 14px; border-radius: 20px; font-size: 14px; font-weight: 500; white-space: nowrap;">
                                                                        ${rentalYield} Yield
                                                                    </span>
                                                                </td>
                                                                ` : ''}
                                                            </tr>
                                                        </table>
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                </table>

                                <!-- Suburb Insights -->
                                ${property.suburbInsights ? `
                                <div style="margin-bottom: 40px;">
                                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 20px;">
                                        <tr>
                                            <td style="border-bottom: 2px solid ${colors.primary}; padding-bottom: 8px;">
                                                <h3 style="margin: 0; font-size: 18px; font-weight: 700; color: ${colors.brandDark}; text-transform: uppercase; letter-spacing: 0.5px;">Suburb Performance</h3>
                                            </td>
                                        </tr>
                                    </table>
                                    
                                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: ${colors.softGray}; border-radius: 10px; padding: 25px;">
                                        <tr>
                                            <td class="stack-column" width="50%" valign="top" style="padding-bottom: 20px;">
                                                <div style="font-size: 14px; color: ${colors.textMuted}; margin-bottom: 4px;">Median Price</div>
                                                <div style="font-size: 18px; font-weight: 700; color: ${colors.brandDark};">${formatCurrency(property.suburbInsights.medianPrice)}</div>
                                            </td>
                                            <td class="stack-column" width="50%" valign="top" style="padding-bottom: 20px;">
                                                <div style="font-size: 14px; color: ${colors.textMuted}; margin-bottom: 4px;">Annual Growth</div>
                                                <div style="font-size: 18px; font-weight: 700; color: ${property.suburbInsights.growthPercent >= 0 ? colors.brandDark : colors.error};">${property.suburbInsights.growthPercent}%</div>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td class="stack-column" width="50%" valign="top">
                                                <div style="font-size: 14px; color: ${colors.textMuted}; margin-bottom: 4px;">Avg Days on Market</div>
                                                <div style="font-size: 18px; font-weight: 700; color: ${colors.brandDark};">${property.suburbInsights.averageDaysOnMarket || '-'}</div>
                                            </td>
                                            <td class="stack-column" width="50%" valign="top">
                                                <div style="font-size: 14px; color: ${colors.textMuted}; margin-bottom: 4px;">Clearance Rate</div>
                                                <div style="font-size: 18px; font-weight: 700; color: ${colors.brandDark};">${property.suburbInsights.auctionClearanceRate ? property.suburbInsights.auctionClearanceRate + '%' : '-'}</div>
                                            </td>
                                        </tr>
                                    </table>
                                </div>
                                ` : ''}

                                <!-- Market Comparables -->
                                ${(property.comparables && property.comparables.length > 0) ? `
                                <!-- Comparable Sales -->
                                <div style="margin-bottom: 40px;">
                                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 20px;">
                                        <tr>
                                            <td style="border-bottom: 2px solid ${colors.primary}; padding-bottom: 8px;">
                                                <h3 style="margin: 0; font-size: 18px; font-weight: 700; color: ${colors.brandDark}; text-transform: uppercase; letter-spacing: 0.5px;"> Comparable Sales</h3>
                                            </td>
                                        </tr>
                                    </table>
                                    
                                    ${property.comparables.slice(0, 5).map(comp => `
                                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 15px; background-color: #ffffff; border: 1px solid ${colors.border}; border-radius: 8px; overflow: hidden;">
                                        <tr>
                                            <td style="padding: 15px;">
                                                <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                                    <tr>
                                                        <td valign="top" style="padding-bottom: 12px;">
                                                            <div style="font-weight: 700; font-size: 16px; color: ${colors.brandDark}; margin-bottom: 4px;">${comp.address || 'N/A'}</div>
                                                            <div style="font-size: 13px; color: ${colors.textMuted};">Sold ${comp.saleDate ? new Date(comp.saleDate).toLocaleDateString('en-AU') : 'N/A'}</div>
                                                        </td>
                                                        <td align="right" valign="top">
                                                            <div style="font-weight: 700; font-size: 16px; color: ${colors.brandDark}; whitespace: nowrap;">${formatCurrency(comp.salePrice)}</div>
                                                        </td>
                                                    </tr>
                                                </table>
                                                <div style="padding-top: 12px; border-top: 1px dashed ${colors.border}; font-size: 13px; color: ${colors.textMuted};">
                                                    <div style="display: flex; justify-content: space-between;">
                                                        <div>
                                                            ${comp.beds > 0 ? `<span style="display: inline-block; margin-right: 15px;"><strong style="color: ${colors.brandDark};">${comp.beds}</strong> Beds</span>` : ''}
                                                            ${comp.baths > 0 ? `<span style="display: inline-block; margin-right: 15px;"><strong style="color: ${colors.brandDark};">${comp.baths}</strong> Baths</span>` : ''}
                                                            ${comp.cars > 0 ? `<span style="display: inline-block;"><strong style="color: ${colors.brandDark};">${comp.cars}</strong> Cars</span>` : ''}
                                                        </div>
                                                        <div style="text-align: right;">
                                                            ${comp.distance > 0 ? `<span style="display: inline-block;"><strong style="color: ${colors.brandDark};">${comp.distance}km</strong> away</span>` : ''}
                                                        </div>
                                                    </div>
                                                    ${comp.landSize ? `<div style="margin-top: 5px; font-size: 13px; color: ${colors.textMuted};"><strong style="color: ${colors.brandDark};">Land Size:</strong> ${formatNumber(comp.landSize)}m²</div>` : ''}
                                                </div>
                                            </td>
                                        </tr>
                                    </table>
                                    `).join('')}
                                    ${property.comparables.length > 5 ? `<p style="text-align: center; font-style: italic; color: ${colors.textMuted}; margin-top: 20px;">For more details, visit the website</p>` : ''}
                                </div>
                                ` : ''}

                                <!--  Sales History -->
                                ${(property.salesHistory && property.salesHistory.length > 0) ? `
                                <!--  Property Sales History -->
                                <div style="margin-bottom: 40px;">
                                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 20px;">
                                        <tr>
                                            <td style="border-bottom: 2px solid ${colors.primary}; padding-bottom: 8px;">
                                                <h3 style="margin: 0; font-size: 18px; font-weight: 700; color: ${colors.brandDark}; text-transform: uppercase; letter-spacing: 0.5px;"> Property Sales History</h3>
                                            </td>
                                        </tr>   
                                    </table>
                                    
                                    ${property.salesHistory.slice(0, 5).map(history => `
                                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 15px; background-color: #ffffff; border: 1px solid ${colors.border}; border-radius: 8px; overflow: hidden;">
                                        <tr>
                                            <td style="padding: 15px;">
                                                <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                                    <tr>
                                                        <td valign="top" style="padding-bottom: 12px;">
                                                            <div style="font-weight: 700; font-size: 16px; color: ${colors.brandDark}; margin-bottom: 4px;">${history.saleDate ? new Date(history.saleDate).toLocaleDateString('en-AU') : 'N/A'}</div>
                                                            <div style="font-size: 13px; color: ${colors.textMuted};">${history.saleType || 'N/A'}</div>
                                                        </td>
                                                        <td align="right" valign="top">
                                                            <div style="font-weight: 700; font-size: 16px; color: ${colors.brandDark}; whitespace: nowrap;">${formatCurrency(history.salePrice)}</div>
                                                        </td>
                                                    </tr>
                                                </table>
                                                <div style="padding-top: 12px; border-top: 1px dashed ${colors.border}; font-size: 13px; color: ${colors.textMuted};">
                                                    <div style="display: flex; justify-content: space-between;">
                                                        <div>
                                                            ${history.daysOnMarket > 0 ? `<span style="display: inline-block; margin-right: 15px;"><strong style="color: ${colors.brandDark};">${history.daysOnMarket}</strong> Days on Market</span>` : ''}
                                                            ${history.agency ? `<span style="display: inline-block; margin-right: 15px;"><strong style="color: ${colors.brandDark};">${history.agency}</strong></span>` : ''}
                                                        </div>
                                                        <div style="text-align: right;">
                                                            ${history.priceChangePercent ? `<span style="display: inline-block; color: ${history.priceChange >= 0 ? colors.brandDark : colors.error};"><strong>${history.priceChange >= 0 ? '+' : ''}${formatCurrency(history.priceChange)} (${history.priceChangePercent}%)</strong></span>` : ''}
                                                        </div>
                                                    </div>
                                                    ${history.agent ? `<div style="margin-top: 5px; font-size: 13px; color: ${colors.textMuted};"><strong style="color: ${colors.brandDark};">Agent:</strong> ${history.agent}</div>` : ''}
                                                </div>
                                            </td>
                                        </tr>
                                    </table>
                                    `).join('')}
                                    ${property.salesHistory.length > 5 ? `<p style="text-align: center; font-style: italic; color: ${colors.textMuted}; margin-top: 20px;">For more details, visit the website</p>` : ''}
                                </div>
                                ` : ''}

                                <!-- School Details -->
                                ${(property.schools && property.schools.length > 0) ? `
                                <!-- School Details -->
                                <div style="margin-bottom: 40px;">
                                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 20px;">
                                        <tr>
                                            <td style="border-bottom: 2px solid ${colors.primary}; padding-bottom: 8px;">
                                                <h3 style="margin: 0; font-size: 18px; font-weight: 700; color: ${colors.brandDark}; text-transform: uppercase; letter-spacing: 0.5px;">Nearby Schools</h3>
                                            </td>
                                        </tr>
                                    </table>
                                    
                                    ${property.schools.slice(0, 5).map(school => `
                                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 15px; background-color: #ffffff; border: 1px solid ${colors.border}; border-radius: 8px; overflow: hidden;">
                                        <tr>
                                            <td style="padding: 15px;">
                                                <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                                    <tr>
                                                        <td valign="top" style="padding-bottom: 12px;">
                                                            <div style="font-weight: 700; font-size: 16px; color: ${colors.brandDark}; margin-bottom: 4px;">${school.name || 'N/A'}</div>
                                                            <div style="font-size: 13px; color: ${colors.textMuted};">
                                                                <span>${school.type || 'N/A'}</span>
                                                                ${school.yearRange ? `<span> • Years: ${school.yearRange}</span>` : ''}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                </table>
                                                <div style="padding-top: 12px; border-top: 1px dashed ${colors.border}; font-size: 13px; color: ${colors.textMuted};">
                                                    <div style="display: flex; justify-content: space-between;">
                                                        <div>
                                                            ${school.distance > 0 ? `<span style="display: inline-block;"><strong style="color: ${colors.brandDark};">${school.distance}km</strong> away</span>` : ''}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    </table>
                                    `).join('')}
                                    ${property.schools.length > 5 ? `<p style="text-align: center; font-style: italic; color: ${colors.textMuted}; margin-top: 20px;">For more details, visit the website</p>` : ''}
                                </div>
                                ` : ''}

                                <!-- CTA Section -->
                                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 40px; margin-bottom: 20px;">
                                    <tr>
                                        <td align="center">
                                            <a href="${baseUrl}/property/${property.id}" style="display: inline-block; background-color: ${colors.brandDark}; color: ${colors.white}; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 700; font-size: 16px; text-align: center; mso-padding-alt: 0;">
                                                <!--[if mso]><i style="letter-spacing: 40px; mso-font-width: -100%; mso-text-raise: 30pt">&nbsp;</i><![endif]-->
                                                <span style="mso-text-raise: 15pt;">View Full Interactive Report</span>
                                                <!--[if mso]><i style="letter-spacing: 40px; mso-font-width: -100%">&nbsp;</i><![endif]-->
                                            </a>
                                            <p style="margin: 20px 0 0 0; font-size: 14px; color: ${colors.textMuted};">
                                                View complete sales history, school catchments, and market trends online.
                                            </p>
                                        </td>
                                    </tr>
                                </table>

                            </td>
                        </tr>

                        <!-- Footer -->
                        <tr>
                            <td align="center" style="background-color: ${colors.brandDark}; padding: 20px 30px; color: rgba(255,255,255,0.6); line-height: 1.4;">
                                <div style="display: inline-block; padding: 0; line-height: 1;">
                                    <img src="${footerLogoUrl}" alt="KINDRED PROPERTY" style="height: 60px; width: auto; max-width: 230px; margin: 0; display: block;" draggable="false" />
                                </div>
                                <p style="margin: 15px 0 10px 0; font-size: 12px; color: #a3b3af;">&copy; ${new Date().getFullYear()} Kindred Property. All rights reserved.</p>
                                <p style="margin: 0 0 20px 0; font-size: 11px; line-height: 1.5; color: #a3b3af; max-width: 400px;">
                                    The estimates provided in this report are based on available market data and should be used as a guide only. They do not constitute a sworn valuation.
                                </p>
                            </td>
                        </tr>

                    </table>
                </td>
            </tr>
        </table>
    </div>
</body>
</html>
    `;
};

/**
 * Generate a notification email for the Kindred team when a new lead is generated
 * @param {Object} formData - The user's form data
 * @param {Object} property - The property details
 * @returns {string} HTML string
 */
const generateLeadNotificationEmailHtml = (formData, property) => {
    const { firstName, lastName, email, mobile } = formData;
    const { address, id, suburb, state, postcode, propertyType, beds, baths, cars, priceEstimate } = property || {};

    return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #163331; border-bottom: 2px solid #34BF77; padding-bottom: 10px;">New Property Report Lead</h2>
        <p>A new property report has been requested by a potential client.</p>
        
        <h3 style="color: #065f46; margin-top: 25px;">Customer Details</h3>
        <table width="100%" cellpadding="8" cellspacing="0" style="border-collapse: collapse;">
            <tr style="background: #f9f9f9;"><td width="40%"><strong>Name:</strong></td><td>${firstName} ${lastName}</td></tr>
            <tr><td><strong>Email:</strong></td><td><a href="mailto:${email}">${email}</a></td></tr>
            <tr style="background: #f9f9f9;"><td><strong>Mobile:</strong></td><td><a href="tel:${mobile}">${mobile}</a></td></tr>
        </table>
        
        <h3 style="color: #065f46; margin-top: 25px;">Property Details</h3>
        <table width="100%" cellpadding="8" cellspacing="0" style="border-collapse: collapse;">
            <tr style="background: #f9f9f9;"><td width="40%"><strong>Address:</strong></td><td>${address}</td></tr>
            <tr><td><strong>Suburb:</strong></td><td>${suburb}, ${state} ${postcode}</td></tr>
            <tr style="background: #f9f9f9;"><td><strong>Type:</strong></td><td>${propertyType}</td></tr>
            <tr><td><strong>Bed/Bath/Car:</strong></td><td>${beds || 0} / ${baths || 0} / ${cars || 0}</td></tr>
            ${priceEstimate ? `<tr style="background: #f9f9f9;"><td><strong>Estimate:</strong></td><td>$${priceEstimate.low?.toLocaleString()} - $${priceEstimate.high?.toLocaleString()}</td></tr>` : ''}
            <tr><td><strong>Domain ID:</strong></td><td>${id}</td></tr>
        </table>
        
        <div style="margin-top: 30px; padding: 15px; background: #e9f2ee; border-radius: 8px; text-align: center;">
            <p style="margin: 0; font-size: 14px; color: #163331;">This lead has been sent to HubSpot and the property report has been emailed to the customer.</p>
        </div>
    </div>
    `;
};

/**
 * Submit lead form and generate report
 * @param {Object} formData - { firstName, lastName, email, mobile }
 * @param {Object} property - Full property object
 * @returns {Promise<Object>} Success response
 */
export const submitLeadFormAndSendReport = async (formData, property) => {
    try {
        const reportId = `RPT-${Date.now()}`;
        let hubspotSuccess = false;
        let hubspotMessage = '';

        // 1. Create HubSpot contact FIRST
        console.log('📋 Step 1: Creating HubSpot contact...');
        const hubspotResult = await createHubSpotContact(formData, property);
        hubspotSuccess = hubspotResult.success;
        hubspotMessage = hubspotResult.message;

        // 2. Generate and send report to CUSTOMER
        console.log('📋 Step 2: Sending report to customer...');
        const customerHtml = generatePropertyEmailHtml(property, formData);
        const customerSubject = `Your Property Report: ${property.address}`;

        const customerResponse = await fetch('/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: formData.email,
                subject: customerSubject,
                htmlContent: customerHtml,
            }),
        });

        // 3. Generate and send lead notification to KINDRED TEAM
        console.log('📋 Step 3: Sending lead notification to Kindred team...');
        const teamHtml = generateLeadNotificationEmailHtml(formData, property);
        const teamSubject = `🔥 NEW LEAD: ${property.address} - ${formData.firstName} ${formData.lastName}`;
        const teamEmail = CONTACT_CONFIG.email || 'info@kindred.com.au';

        console.log(`📤 Sending internal notification to: ${teamEmail}`);

        // We fire this and don't strictly wait for it to block the UI, but we log the result
        const teamResponse = await fetch('/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: teamEmail,
                subject: teamSubject,
                htmlContent: teamHtml,
            }),
        });

        if (!customerResponse.ok) {
            const result = await customerResponse.json();
            return {
                success: false,
                message: result.message || 'Email delivery failed',
                reportId: reportId,
                hubspotSuccess: hubspotSuccess,
            };
        }

        console.log('✅ Lead processed successfully');
        return {
            success: true,
            message: 'Report sent successfully',
            reportId: reportId,
            hubspotSuccess: hubspotSuccess,
            hubspotMessage: hubspotMessage,
        };

    } catch (error) {
        console.error('Error in property report service:', error);
        return {
            success: false,
            message: 'Report generation failed',
            reportId: `RPT-${Date.now()}`,
            hubspotSuccess: false,
            hubspotMessage: error.message,
        };
    }
};

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
