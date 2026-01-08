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
    const { address, beds, baths, cars, landSize, priceEstimate, rentalEstimate, propertyType } = property;
    const { firstName } = formData;

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

    // Helper to generate list items safely
    const generateListFromItems = (items) => {
        if (!items || items.length === 0) return '<p style="color: #666; font-style: italic;">No data available</p>';
        return items.map(item => `
            <div style="margin-bottom: 8px; font-size: 14px; color: #555;">
                • <strong>${item.name || item.address}</strong> ${item.distance ? `(${item.distance}km)` : ''} ${item.salePrice ? `- ${formatCurrency(item.salePrice)}` : ''}
            </div>
        `).join('');
    };

    // Main HTML Template
    return `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f9f9f9; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
        .header { background-color: #ffffff; padding: 25px 20px; text-align: center; border-bottom: 3px solid #48D98E; }
        .header h1 { margin: 0; font-size: 20px; font-weight: 700; letter-spacing: 1px; color: #163331; text-transform: uppercase; }
        .hero-image { width: 100%; height: 300px; background-color: #eee; object-fit: cover; display: block; }
        .content { padding: 30px 25px; }
        .greeting { font-size: 16px; margin-bottom: 25px; color: #555; }
        .property-title { font-size: 24px; color: #163331; margin-bottom: 5px; font-weight: 700; line-height: 1.3; }
        .property-subtitle { color: #888; margin-bottom: 25px; font-size: 15px; }
        
        .section-title { font-size: 16px; font-weight: 700; color: #163331; margin-top: 30px; margin-bottom: 15px; border-bottom: 1px solid #eee; padding-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px; }
        
        .features-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 30px; text-align: center; }
        .feature-item { background: #f4f8f6; padding: 12px 5px; border-radius: 6px; }
        .feature-value { font-size: 18px; font-weight: 700; color: #163331; display: block; margin-bottom: 4px; }
        .feature-label { font-size: 11px; color: #666; text-transform: uppercase; letter-spacing: 0.5px; }

        .estimates-box { background-color: #E9F2EE; padding: 20px; border-radius: 8px; margin-bottom: 10px; border-left: 4px solid #163331; }
        .estimate-item { display: flex; justify-content: space-between; margin-bottom: 8px; }
        .estimate-item:last-child { margin-bottom: 0; }
        .estimate-label { font-weight: 600; color: #163331; }
        .estimate-value { font-weight: 700; color: #333; }

        .btn-container { text-align: center; margin-top: 35px; margin-bottom: 10px; }
        .btn { display: inline-block; background-color: #163331; color: #ffffff; text-decoration: none; padding: 14px 35px; border-radius: 6px; font-weight: 600; font-size: 15px; transition: background 0.3s; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .btn:hover { background-color: #2a4f4c; }

        .footer { background-color: #f9f9f9; padding: 25px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #eee; margin-top: 20px; }
        
        /* Mobile responsive adjustments */
        @media only screen and (max-width: 480px) {
            .container { width: 100% !important; margin: 0 !important; border-radius: 0; }
            .features-grid { grid-template-columns: repeat(2, 1fr); }
            .content { padding: 20px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Kindred Property Report</h1>
        </div>
        ${property.images && property.images.length > 0
            ? `<img src="${property.images[0].url}" alt="Property" class="hero-image" style="width: 100%; max-width: 600px; height: auto; max-height: 300px; object-fit: cover; display: block; border-radius: 4px;" />`
            : `<div class="hero-image" style="width: 100%; height: 250px; background-color: #ddd; display: flex; align-items: center; justify-content: center; color: #666; font-size: 14px;">No Image Available</div>`}
        
        <div class="content">
            <p class="greeting">Hi ${firstName},</p>
            <p style="color: #666; margin-bottom: 25px;">Please find below the detailed property report you requested.</p>
            
            <h2 class="property-title">${address}</h2>
            <div class="property-subtitle">${propertyType} · ${property.suburb}, ${property.state}</div>

            <div class="features-grid">
                <div class="feature-item">
                    <span class="feature-value">${beds}</span>
                    <span class="feature-label">Beds</span>
                </div>
                <div class="feature-item">
                    <span class="feature-value">${baths}</span>
                    <span class="feature-label">Baths</span>
                </div>
                <div class="feature-item">
                    <span class="feature-value">${cars}</span>
                    <span class="feature-label">Cars</span>
                </div>
                <div class="feature-item">
                    <span class="feature-value">${landSize > 0 ? formatNumber(landSize) : '-'}</span>
                    <span class="feature-label">${landSize > 0 ? 'm²' : 'Land'}</span>
                </div>
                 ${property.buildingSize > 0 ? `
                <div class="feature-item">
                    <span class="feature-value">${formatNumber(property.buildingSize)}</span>
                    <span class="feature-label">Internal m²</span>
                </div>` : ''}
            </div>

            <!-- Value Estimates -->
            <div class="estimates-box">
                <div class="estimate-item">
                    <span class="estimate-label">Estimated Value</span>
                    <span class="estimate-value">${priceText}</span>
                </div>
                <div class="estimate-item" style="border-top: 1px solid rgba(0,0,0,0.05); padding-top: 8px; margin-top: 8px;">
                    <span class="estimate-label">Potential Rent</span>
                    <div style="text-align: right;">
                        <span class="estimate-value" style="display: block;">${rentalText}</span>
                        ${rentalYield ? `<span style="font-size: 12px; color: #666;">(Approx. ${rentalYield} Yield)</span>` : ''}
                    </div>
                </div>
            </div>

            <!-- Additional Details Sections -->
            ${property.suburbInsights ? `
            <div class="section-title">Suburb Performance (${property.suburb})</div>
            <div style="background: #fff; border: 1px solid #eee; border-radius: 6px; padding: 15px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                    <span style="color: #666;">Median Price</span>
                    <span style="font-weight: 600;">${formatCurrency(property.suburbInsights.medianPrice)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                    <span style="color: #666;">Annual Growth</span>
                    <span style="font-weight: 600; color: ${property.suburbInsights.growthPercent >= 0 ? '#163331' : '#e53935'};">${property.suburbInsights.growthPercent}%</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                    <span style="color: #666;">Avg Days on Market</span>
                    <span style="font-weight: 600;">${property.suburbInsights.averageDaysOnMarket || '-'}</span>
                </div>
                 <div style="display: flex; justify-content: space-between;">
                    <span style="color: #666;">Clearance Rate</span>
                    <span style="font-weight: 600;">${property.suburbInsights.auctionClearanceRate ? property.suburbInsights.auctionClearanceRate + '%' : '-'}</span>
                </div>
            </div>
            ` : ''}

            <div class="section-title">Comparable Sales</div>
            <div style="background: #fff; padding: 5px;">
                ${generateListFromItems(property.comparables)}
            </div>

            <div class="section-title">Property Sales History</div>
            <div style="background: #fff; padding: 5px;">
                ${property.salesHistory && property.salesHistory.length > 0 ? property.salesHistory.map(history => `
                    <div style="margin-bottom: 8px; font-size: 14px; color: #555;">
                        • <strong>${new Date(history.saleDate).getFullYear()}</strong> - ${formatCurrency(history.salePrice)} <span style="color: #888; font-size: 12px;">(${history.saleType})</span>
                    </div>
                `).join('') : '<p style="color: #666; font-style: italic;">No sales history available</p>'}
            </div>

            <div class="section-title">Nearby Schools</div>
            <div style="background: #fff; padding: 5px;">
                ${generateListFromItems(property.schools)}
            </div>

            <div class="btn-container">
                <a href="${(typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_BASE_URL) || 'http://localhost:3000'}/property/${property.id}" class="btn">View Full Online Report</a>
            </div>
        </div>

        <div class="footer">
            <p>Sent by Kindred Property</p>
            <p style="margin-top: 8px; color: #bbb;">The estimates provided are based on available market data and should be used as a guide only.</p>
        </div>
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
