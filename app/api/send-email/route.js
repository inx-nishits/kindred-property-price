import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request) {
  try {
    const { email, subject, htmlContent } = await request.json();

    if (!email || !htmlContent) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // GMAIL SMTP IMPLEMENTATION
    const gmailUser = process.env.GMAIL_USER;
    const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;
    const senderName = process.env.SENDER_NAME || 'Kindred Property';

    if (!gmailUser || !gmailAppPassword) {
      return NextResponse.json(
        {
          success: false,
          message: 'Server Configuration Error: Gmail credentials missing. Please provide GMAIL_USER and GMAIL_APP_PASSWORD'
        },
        { status: 500 }
      );
    }

    // Create a Nodemailer transporter for Gmail SMTP
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: gmailUser,
        pass: gmailAppPassword
      },
      tls: {
        ciphers: 'SSLv3'
      }
    });

    // Define the email options
    const mailOptions = {
      from: `"${senderName}" <${gmailUser}>`,
      to: email,
      subject: subject || 'Property Report',
      html: htmlContent,
      text: `Property Report

View this report in your browser.

Best regards,
Kindred Property Team`,
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);

    return NextResponse.json({
      success: true,
      message: 'Email sent successfully',
      messageId: info.messageId,
    });

    /*
    // OLD AWS SES IMPLEMENTATION - COMMENTED OUT FOR REFERENCE
    // AWS SES SMTP Configuration
    const smtpHost = process.env.SMTP_HOST || `email-smtp.${process.env.AWS_REGION}.amazonaws.com`;
    const smtpPort = parseInt(process.env.SMTP_PORT) || 587;
    const awsAccessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const awsSecretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
    const fromEmail = process.env.FROM_EMAIL;

    if (!awsAccessKeyId || !awsSecretAccessKey || !fromEmail) {
      return NextResponse.json(
        {
          success: false,
          message: 'Server Configuration Error: AWS SES credentials missing. Please provide AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and FROM_EMAIL'
        },
        { status: 500 }
      );
    }

    // Create a Nodemailer transporter for AWS SES SMTP
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: false, // true for 465, false for other ports
      auth: {
        user: awsAccessKeyId,
        pass: awsSecretAccessKey
      },
      tls: {
        ciphers:'SSLv3' 
      }
    });

    // Define the email options
    const mailOptions = {
      from: `"Kindred Property" <${fromEmail}>`,
      to: email,
      subject: subject || 'Property Report',
      html: htmlContent,
      text: `Property Report

View this report in your browser.

Best regards,
Kindred Property Team`,
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);

    return NextResponse.json({
      success: true,
      message: 'Email sent successfully',
      messageId: info.messageId,
    });
    */

  } catch (error) {
    let userMessage = 'Failed to send email.';

    // Gmail SMTP error handling
    if (error.code === 'EAUTH' || error.message?.includes('authentication')) {
      userMessage = 'Gmail SMTP authentication failed – check GMAIL_USER and GMAIL_APP_PASSWORD';
    } else if (error.message?.includes('verify') || error.message?.includes('connection')) {
      userMessage = 'Cannot connect to Gmail SMTP – check SMTP_HOST and SMTP_PORT';
    } else if (error.code === 'ECONNREFUSED') {
      userMessage = 'Connection to SMTP server refused – check SMTP configuration';
    } else if (error.message?.includes('credentials') || error.message?.includes('auth')) {
      userMessage = 'Gmail SMTP credentials invalid or missing – check environment variables';
    }

    return NextResponse.json(
      {
        success: false,
        message: userMessage,
        error: process.env.NODE_ENV === 'development' ? error.toString() : undefined,
      },
      { status: 500 }
    );
  }
}