/**
 * Email Service for Property Reports
 * 
 * Handles generation of professional HTML emails for property reports.
 * Currently configured to LOG the email content to console (Stub Mode).
 * Ready to be connected to EmailJS, SendGrid, or AWS SES.
 */

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
                            <td align="center" style="padding: 30px 0; border-bottom: 1px solid ${colors.border}; background-color: ${colors.white};">
                                <a href="${baseUrl}" target="_blank" style="text-decoration: none;">
                                <a href="${baseUrl}" target="_blank" style="text-decoration: none;">
                                    <span style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 24px; font-weight: bold; color: ${colors.brandDark}; letter-spacing: 1px;">KINDRED PROPERTY</span>
                                </a>
                            </td>
                        </tr>

                        <!-- Hero Image -->
                        <tr>
                            <td style="padding: 0; background-color: #E9F2EE;">
                                ${property.images && property.images.length > 0
            ? `<img src="${property.images[0].url}" alt="Property" class="hero-image" width="600" style="display: block; width: 100%; max-width: 600px; height: 320px; object-fit: cover;" />`
            : `<div class="hero-image" style="width: 100%; height: 280px; background-color: #E9F2EE; display: block; color: ${colors.textMuted}; font-size: 16px; text-align: center; line-height: 280px;">No Image Available</div>`}
                            </td>
                        </tr>

                        <!-- Content Body -->
                        <tr>
                            <td class="mobile-pad" style="padding: 40px;">
                                
                                <!-- Introduction -->
                                <p style="margin: 0 0 15px 0; font-size: 18px; color: ${colors.textMain}; font-weight: 400;">Hi ${firstName},</p>
                                <p style="margin: 0 0 30px 0; font-size: 16px; color: ${colors.textMuted}; line-height: 1.6;">
                                    Here is the detailed property report you requested. This comprehensive overview includes valuation estimates, rental potential, and recent market activity for your property.
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
                                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 35px; border-collapse: separate; border-spacing: 2px;">
                                    <tr>
                                        <td align="center" class="feature-cell" width="25%" style="padding: 12px 5px; background-color: ${colors.softGray}; border-radius: 6px;">
                                            <div style="font-size: 20px; font-weight: 700; color: ${colors.brandDark}; line-height: 1;">${beds}</div>
                                            <div style="font-size: 11px; text-transform: uppercase; color: ${colors.textMuted}; margin-top: 5px; letter-spacing: 1px;">Beds</div>
                                        </td>
                                        <td align="center" class="feature-cell" width="25%" style="padding: 12px 5px; background-color: ${colors.softGray}; border-radius: 6px;">
                                            <div style="font-size: 20px; font-weight: 700; color: ${colors.brandDark}; line-height: 1;">${baths}</div>
                                            <div style="font-size: 11px; text-transform: uppercase; color: ${colors.textMuted}; margin-top: 5px; letter-spacing: 1px;">Baths</div>
                                        </td>
                                        <td align="center" class="feature-cell" width="25%" style="padding: 12px 5px; background-color: ${colors.softGray}; border-radius: 6px;">
                                            <div style="font-size: 20px; font-weight: 700; color: ${colors.brandDark}; line-height: 1;">${cars}</div>
                                            <div style="font-size: 11px; text-transform: uppercase; color: ${colors.textMuted}; margin-top: 5px; letter-spacing: 1px;">Cars</div>
                                        </td>
                                        <td align="center" class="feature-cell" width="25%" style="padding: 12px 5px; background-color: ${colors.softGray}; border-radius: 6px;">
                                            <div style="font-size: 20px; font-weight: 700; color: ${colors.brandDark}; line-height: 1;">${landSize > 0 ? formatNumber(landSize) : '-'}</div>
                                            <div style="font-size: 11px; text-transform: uppercase; color: ${colors.textMuted}; margin-top: 5px; letter-spacing: 1px;">m² Land</div>
                                        </td>
                                    </tr>
                                </table>

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
                                <div style="margin-bottom: 40px;">
                                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 20px;">
                                        <tr>
                                            <td style="border-bottom: 2px solid ${colors.primary}; padding-bottom: 8px;">
                                                <h3 style="margin: 0; font-size: 18px; font-weight: 700; color: ${colors.brandDark}; text-transform: uppercase; letter-spacing: 0.5px;">Market Comparables</h3>
                                            </td>
                                        </tr>
                                    </table>
                                    
                                    ${(property.comparables && property.comparables.length > 0) ? property.comparables.slice(0, 5).map(comp => `
                                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 15px; background-color: #ffffff; border: 1px solid ${colors.border}; border-radius: 8px; overflow: hidden;">
                                        <tr>
                                            <td style="padding: 15px;">
                                                <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                                    <tr>
                                                        <td valign="top" style="padding-bottom: 12px;">
                                                            <div style="font-weight: 700; font-size: 16px; color: ${colors.brandDark}; margin-bottom: 4px;">${comp.address || 'N/A'}</div>
                                                            <div style="font-size: 13px; color: ${colors.textMuted};">Sold ${comp.saleDate ? new Date(comp.saleDate).toLocaleDateString('en-AU', { month: 'short', year: 'numeric' }) : 'N/A'}</div>
                                                        </td>
                                                        <td align="right" valign="top">
                                                            <div style="font-weight: 700; font-size: 16px; color: ${colors.brandDark}; whitespace: nowrap;">${formatCurrency(comp.salePrice)}</div>
                                                        </td>
                                                    </tr>
                                                </table>
                                                <div style="padding-top: 12px; border-top: 1px dashed ${colors.border}; font-size: 13px; color: ${colors.textMuted};">
                                                    <span style="display: inline-block; margin-right: 15px;"><strong style="color: ${colors.brandDark};">${comp.beds}</strong> Beds</span>
                                                    <span style="display: inline-block; margin-right: 15px;"><strong style="color: ${colors.brandDark};">${comp.baths}</strong> Baths</span>
                                                    <span style="display: inline-block;"><strong style="color: ${colors.brandDark};">${comp.distance ? comp.distance + 'km' : 'N/A'}</strong> away</span>
                                                </div>
                                            </td>
                                        </tr>
                                    </table>
                                    `).join('') : '<p style="color: #999; font-style: italic;">No comparable sales available</p>'}
                                </div>

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
                            <td align="center" style="background-color: ${colors.brandDark}; padding: 40px 30px; color: rgba(255,255,255,0.6);">
                                <span style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 20px; font-weight: bold; color: rgba(255,255,255,0.8); letter-spacing: 1px; display: block; margin-bottom: 20px;">KINDRED PROPERTY</span>
                                <p style="margin: 0 0 10px 0; font-size: 12px; color: #a3b3af;">&copy; ${new Date().getFullYear()} Kindred Property. All rights reserved.</p>
                                <p style="margin: 0; font-size: 11px; line-height: 1.5; color: #a3b3af; max-width: 400px;">
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
 * Submit lead form and generate report
 * @param {Object} formData - { firstName, lastName, email, mobile }
 * @param {Object} property - Full property object
 * @returns {Promise<Object>} Success response
 */
export const submitLeadFormAndSendReport = async (formData, property) => {
    try {
        // 1. Generate the HTML content
        const htmlContent = generatePropertyEmailHtml(property, formData);
        const subject = `Property Report: ${property.address}`;

        // 2. Send to our Next.js API route
        const response = await fetch('/api/send-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: formData.email,
                subject: subject,
                htmlContent: htmlContent,
            }),
        });

        const result = await response.json();

        if (!response.ok) {
            console.error('Email sending failed with status:', response.status);
            console.error('Error details:', result);

            // Check if it's a configuration error (missing SMTP settings)
            if (result.message && (result.message.includes('SMTP settings') || result.message.includes('Missing'))) {
                console.warn('⚠️ EMAIL NOT SENT: SMTP configuration is missing or incomplete in .env');
            }
            return {
                success: true, // Keep UI flow successful even if email fails (graceful degradation)
                message: result.message || 'Report generated (Email delivery failed)',
                reportId: `RPT-${Date.now()}`,
            };
        }

        return {
            success: true,
            message: 'Report sent successfully',
            reportId: `RPT-${Date.now()}`,
        };

    } catch (error) {
        console.error('Error in property report service:', error);
        // Always fail gracefully so the user still gets "unlocked"
        return {
            success: true,
            message: 'Report generated successfully',
            reportId: `RPT-${Date.now()}`,
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
