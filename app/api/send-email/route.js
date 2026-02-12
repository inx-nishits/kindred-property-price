import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { email, subject, htmlContent } = await request.json();

    // Validate required fields
    if (!email || !htmlContent) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields: email and htmlContent' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: 'Invalid email address format' },
        { status: 400 }
      );
    }

    // Limit content size for security
    if (htmlContent.length > 100000) { // 100KB limit
      return NextResponse.json(
        { success: false, message: 'Email content too large (max 100KB)' },
        { status: 400 }
      );
    }

    // Sanitize subject if present
    const safeSubject = subject && subject.length <= 200
      ? subject
      : 'Property Report from Kindred Property';

    // BREVO SMTP CONFIGURATION
    const brevoApiKey = process.env.SMTP_PASS || process.env.BREVO_API_KEY;
    const senderEmail = process.env.SENDER_EMAIL || 'aarif.r@inheritx.com';
    const senderName = process.env.SENDER_NAME || 'Kindred Property';
    const smtpUser = 'a12dc9001@smtp-brevo.com';

    // Check required env vars
    if (!brevoApiKey || !senderEmail) {
      console.error('Missing Brevo configuration in environment variables');
      console.error('BREVO_API_KEY status:', brevoApiKey ? 'DEFINED' : 'MISSING');
      console.error('SENDER_EMAIL status:', senderEmail ? 'DEFINED' : 'MISSING');
      return NextResponse.json(
        {
          success: false,
          message: 'Server configuration error: Missing BREVO_API_KEY or SENDER_EMAIL'
        },
        { status: 500 }
      );
    }

    // Debug logging (Safe)
    console.log('Brevo Configuration Trace:');
    console.log('- Sender Email:', senderEmail);
    console.log('- API Key present:', !!brevoApiKey);

    // Prepare the email data for Brevo API
    const emailData = {
      sender: {
        name: senderName,
        email: senderEmail
      },
      to: [
        {
          email: email,
          name: 'Property Report Recipient'
        }
      ],
      subject: safeSubject,
      htmlContent: htmlContent,
      textContent: `Property Report

View this report in your browser.

Best regards,
Kindred Property Team`
    };

    // Send email via Brevo HTTP API
    console.log('Sending email via Brevo HTTP API...');
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': brevoApiKey,
        'content-type': 'application/json'
      },
      body: JSON.stringify(emailData)
    });

    const result = await response.json();
    console.log('Brevo API Response:', result);

    if (!response.ok) {
      throw new Error(`Brevo API error: ${response.status} - ${result.message || 'Unknown error'}`);
    }

    return NextResponse.json({
      success: true,
      message: 'Email sent successfully via Brevo HTTP API',
      messageId: result.messageId || 'brevo-' + Date.now(),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    // Detailed error logging
    console.error('Email sending failed:', {
      message: error.message,
      code: error.code,
      response: error.response,
      stack: error.stack
    });

    let userMessage = 'Failed to send email. Please try again later.';

    // Specific Brevo HTTP API error handling
    if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
      userMessage = 'Brevo API authentication failed. Please verify BREVO_API_KEY / SMTP_PASS configuration.';
    } else if (error.message?.includes('403') || error.message?.includes('forbidden')) {
      userMessage = `Brevo API rejected the sender (${senderEmail}). Ensure this email is a verified sender in your Brevo account dashboard.`;
    } else if (error.message?.includes('400') || error.message?.includes('Bad Request')) {
      userMessage = 'Invalid email data or format sent to Brevo API.';
    } else if (error.message?.includes('API error')) {
      userMessage = error.message;
    }

    return NextResponse.json(
      {
        success: false,
        message: userMessage,
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
