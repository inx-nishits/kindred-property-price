/**
 * Email Service for Property Reports (Stub)
 * 
 * This service will be developed in the future to handle PDF report generation 
 * and email delivery via services like Brevo, SendGrid, or AWS SES.
 */

/**
 * Submit lead form and send property report (Stub)
 * @param {Object} formData - { firstName, lastName, email, mobile }
 * @param {Object} property - Full property object
 * @returns {Promise<Object>} Success response
 */
export const submitLeadFormAndSendReport = async (formData, property) => {
    // Simulate a bit of delay
    await new Promise(resolve => setTimeout(resolve, 800))

    console.log('Lead submitted (logic to be implemented later):', { formData, address: property?.address })

    return {
        success: true,
        message: 'Report will be sent to your email shortly',
        reportId: `RPT-${Date.now()}`,
        emailId: `STUB-${Date.now()}`,
    }
}
