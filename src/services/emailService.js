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

    // Main HTML Template
    return `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background-color: #163331; color: #ffffff; padding: 30px 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 300; letter-spacing: 1px; }
        .hero-image { width: 100%; height: 250px; background-color: #e0e0e0; object-fit: cover; }
        .content { padding: 30px; }
        .greeting { font-size: 18px; margin-bottom: 20px; color: #163331; font-weight: bold; }
        .property-title { font-size: 22px; color: #163331; margin-bottom: 10px; border-bottom: 2px solid #48D98E; padding-bottom: 10px; display: inline-block; }
        .features-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-bottom: 25px; }
        .feature-item { background: #f9f9f9; padding: 10px; border-radius: 4px; border-left: 3px solid #48D98E; }
        .feature-label { font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 0.5px; }
        .feature-value { font-size: 16px; font-weight: bold; color: #333; }
        .estimates-section { background-color: #E9F2EE; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
        .estimate-row { display: flex; justify-content: space-between; margin-bottom: 10px; border-bottom: 1px solid rgba(0,0,0,0.05); padding-bottom: 10px; }
        .estimate-row:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
        .btn { display: inline-block; background-color: #163331; color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 50px; font-weight: bold; text-align: center; margin-top: 20px; }
        .footer { background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #ddd; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>KINDRED PROPERTY REPORT</h1>
        </div>
        ${property.images && property.images.length > 0 ? `<img src="${property.images[0].url}" alt="Property" class="hero-image" />` : ''}
        
        <div class="content">
            <p class="greeting">Hi ${firstName},</p>
            <p>Here is the Kindred property report you requested.</p>
            
            <h2 class="property-title">${address}</h2>
            <p style="margin-bottom: 20px; color: #666;">${propertyType} in ${property.suburb}, ${property.state}</p>

            <div class="features-grid">
                <div class="feature-item">
                    <div class="feature-label">Bedrooms</div>
                    <div class="feature-value">${beds}</div>
                </div>
                <div class="feature-item">
                    <div class="feature-label">Bathrooms</div>
                    <div class="feature-value">${baths}</div>
                </div>
                <div class="feature-item">
                    <div class="feature-label">Car Spaces</div>
                    <div class="feature-value">${cars}</div>
                </div>
                <div class="feature-item">
                    <div class="feature-label">Land Size</div>
                    <div class="feature-value">${landSize > 0 ? formatNumber(landSize) + ' m²' : 'N/A'}</div>
                </div>
            </div>

            <div class="estimates-section">
                <div class="estimate-row">
                    <div><strong>Estimated Value</strong></div>
                    <div style="color: #163331; font-weight: bold;">${priceText}</div>
                </div>
                <div class="estimate-row">
                    <div><strong>Rental Estimate</strong></div>
                    <div>${rentalText}</div>
                </div>
            </div>

            <div style="text-align: center;">
                <a href="http://localhost:3000/property/${property.id}" class="btn">View Full Property Details</a>
            </div>
        </div>

        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Kindred Property. All rights reserved.</p>
            <p>This is an automated report based on available market data.</p>
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
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // GENERATE THE EMAIL HTML
    const emailHtml = generatePropertyEmailHtml(property, formData);

    console.group('📧 EMAIL SERVICE - MOCK SEND');
    console.log('To:', formData.email);
    console.log('Subject:', `Property Report for ${property.address}`);
    console.log('--- HTML CONTENT START ---');
    console.log(emailHtml);
    console.log('--- HTML CONTENT END ---');
    console.groupEnd();

    return {
        success: true,
        message: 'Report generated and logged to console',
        reportId: `RPT-${Date.now()}`,
        emailId: `MOCK-${Date.now()}`,
    }
}
