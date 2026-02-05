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
      console.error('BREVO_API_KEY:', brevoApiKey ? 'SET' : 'MISSING');
      console.error('SENDER_EMAIL:', senderEmail ? 'SET' : 'MISSING');
      return NextResponse.json(
        {
          success: false,
          message: 'Server configuration error: Missing BREVO_API_KEY or SENDER_EMAIL'
        },
        { status: 500 }
      );
    }

    // Debug logging
    console.log('Brevo Configuration:');
    console.log('- Sender Email:', senderEmail);
    console.log('- API Key length:', brevoApiKey.length);
    console.log('- API Key prefix:', brevoApiKey.substring(0, 20) + '...');

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
      userMessage = 'Brevo API authentication failed. Check BREVO_API_KEY.';
    } else if (error.message?.includes('400') || error.message?.includes('Bad Request')) {
      userMessage = 'Invalid email data sent to Brevo API. Check email format and content.';
    } else if (error.message?.includes('403') || error.message?.includes('Forbidden')) {
      userMessage = 'Brevo API access forbidden. Check sender email verification in Brevo dashboard.';
    } else if (error.message?.includes('API error')) {
      userMessage = `Brevo API error: ${error.message}`;
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
