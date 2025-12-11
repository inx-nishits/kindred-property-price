/**
 * Netlify Serverless Function for Sending Emails via Brevo
 * 
 * This function is automatically detected by Netlify when placed in /netlify/functions/
 * 
 * Environment Variables Required (set in Netlify dashboard):
 * - BREVO_API_KEY: Your Brevo API key
 * - ADMIN_EMAIL: Email address to receive contact form submissions
 * - FROM_EMAIL: Email address to send from (must be verified in Brevo)
 * - FROM_NAME: Display name for sender
 */

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method not allowed' }),
    }
  }

  try {
    const { type, data } = JSON.parse(event.body)

    // Validate required environment variables
    const BREVO_API_KEY = process.env.BREVO_API_KEY
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'customercare@kindred.com.au'
    const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@kindred.com.au'
    const FROM_NAME = process.env.FROM_NAME || 'Property Insights Australia'

    if (!BREVO_API_KEY) {
      console.error('BREVO_API_KEY is not set')
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: 'Email service is not configured. Please contact support.',
        }),
      }
    }

    let emailData

    switch (type) {
      case 'contact':
        // Contact form submission
        emailData = {
          sender: {
            name: FROM_NAME,
            email: FROM_EMAIL,
          },
          to: [
            {
              email: ADMIN_EMAIL,
              name: 'Property Insights Team',
            },
          ],
          replyTo: {
            email: data.email,
            name: `${data.firstName} ${data.lastName}`,
          },
          subject: `New Contact Form Submission from ${data.firstName} ${data.lastName}`,
          htmlContent: `
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #163B2A 0%, #2D5F47 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
                .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
                .field { margin-bottom: 15px; }
                .label { font-weight: bold; color: #163B2A; }
                .value { margin-top: 5px; }
                .message-box { background: white; padding: 15px; border-left: 4px solid #163B2A; margin-top: 10px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h2>New Contact Form Submission</h2>
                </div>
                <div class="content">
                  <div class="field">
                    <div class="label">Name:</div>
                    <div class="value">${data.firstName} ${data.lastName}</div>
                  </div>
                  <div class="field">
                    <div class="label">Email:</div>
                    <div class="value"><a href="mailto:${data.email}">${data.email}</a></div>
                  </div>
                  <div class="field">
                    <div class="label">Phone:</div>
                    <div class="value">${data.phone}</div>
                  </div>
                  <div class="field">
                    <div class="label">Message:</div>
                    <div class="message-box">${data.message.replace(/\n/g, '<br>')}</div>
                  </div>
                </div>
              </div>
            </body>
            </html>
          `,
          textContent: `
New Contact Form Submission

Name: ${data.firstName} ${data.lastName}
Email: ${data.email}
Phone: ${data.phone}

Message:
${data.message}
          `,
        }
        break

      case 'lead':
        // Lead capture (property report request)
        emailData = {
          sender: {
            name: FROM_NAME,
            email: FROM_EMAIL,
          },
          to: [
            {
              email: ADMIN_EMAIL,
              name: 'Property Insights Team',
            },
          ],
          replyTo: {
            email: data.email,
            name: data.name,
          },
          subject: `New Property Report Request - ${data.propertyAddress}`,
          htmlContent: `
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #163B2A 0%, #2D5F47 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
                .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
                .field { margin-bottom: 15px; }
                .label { font-weight: bold; color: #163B2A; }
                .value { margin-top: 5px; }
                .property-box { background: white; padding: 15px; border-left: 4px solid #163B2A; margin-top: 10px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h2>New Property Report Request</h2>
                </div>
                <div class="content">
                  <div class="field">
                    <div class="label">Name:</div>
                    <div class="value">${data.name}</div>
                  </div>
                  <div class="field">
                    <div class="label">Email:</div>
                    <div class="value"><a href="mailto:${data.email}">${data.email}</a></div>
                  </div>
                  <div class="property-box">
                    <div class="label">Property Address:</div>
                    <div class="value">${data.propertyAddress}</div>
                    <div class="label" style="margin-top: 10px;">Suburb:</div>
                    <div class="value">${data.propertySuburb}</div>
                    <div class="label" style="margin-top: 10px;">Property ID:</div>
                    <div class="value">${data.propertyId}</div>
                  </div>
                  <p style="margin-top: 20px; color: #666;">
                    A comprehensive property report should be sent to the user's email address.
                  </p>
                </div>
              </div>
            </body>
            </html>
          `,
          textContent: `
New Property Report Request

Name: ${data.name}
Email: ${data.email}

Property Details:
Address: ${data.propertyAddress}
Suburb: ${data.propertySuburb}
Property ID: ${data.propertyId}
          `,
        }
        break

      case 'report':
        // Property report email to user
        emailData = {
          sender: {
            name: FROM_NAME,
            email: FROM_EMAIL,
          },
          to: [
            {
              email: data.email,
              name: data.name,
            },
          ],
          subject: `Your Property Report for ${data.property?.address || 'Property'}`,
          htmlContent: `
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #163B2A 0%, #2D5F47 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
                .button { display: inline-block; padding: 12px 30px; background: #163B2A; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h2>Your Property Report is Ready!</h2>
                </div>
                <div class="content">
                  <p>Hi ${data.name},</p>
                  <p>Thank you for your interest in property insights. Your comprehensive property report for <strong>${data.property?.address || 'the selected property'}</strong> is ready.</p>
                  <p>Please find the detailed report attached or view it online by clicking the button below.</p>
                  <a href="${process.env.SITE_URL || 'https://yourwebsite.com'}/property/${data.property?.id}" class="button">View Property Report</a>
                  <p style="margin-top: 30px; color: #666; font-size: 14px;">
                    If you have any questions, please don't hesitate to contact us at <a href="mailto:${ADMIN_EMAIL}">${ADMIN_EMAIL}</a>
                  </p>
                </div>
              </div>
            </body>
            </html>
          `,
          textContent: `
Your Property Report is Ready!

Hi ${data.name},

Thank you for your interest in property insights. Your comprehensive property report for ${data.property?.address || 'the selected property'} is ready.

View your report: ${process.env.SITE_URL || 'https://yourwebsite.com'}/property/${data.property?.id}

If you have any questions, please contact us at ${ADMIN_EMAIL}
          `,
        }
        break

      default:
        return {
          statusCode: 400,
          body: JSON.stringify({ message: 'Invalid email type' }),
        }
    }

    // Send email via Brevo API
    const brevoResponse = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': BREVO_API_KEY,
        'content-type': 'application/json',
      },
      body: JSON.stringify(emailData),
    })

    if (!brevoResponse.ok) {
      const errorData = await brevoResponse.json()
      console.error('Brevo API error:', errorData)
      return {
        statusCode: brevoResponse.status,
        body: JSON.stringify({
          message: errorData.message || 'Failed to send email',
          error: errorData,
        }),
      }
    }

    const result = await brevoResponse.json()

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: 'Email sent successfully',
        messageId: result.messageId,
      }),
    }
  } catch (error) {
    console.error('Error in send-email function:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Internal server error',
        error: error.message,
      }),
    }
  }
}

