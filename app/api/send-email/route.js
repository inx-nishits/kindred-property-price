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

        const apiKey = process.env.BREVO_API_KEY;
        const senderEmail = process.env.SENDER_EMAIL || 'noreply@kindred-property.com.au';
        const senderName = process.env.SENDER_NAME || 'Kindred Property';
        const smtpLogin = process.env.BREVO_SMTP_LOGIN || senderEmail; // Fallback to senderEmail if specific login not set

        if (!apiKey) {
            console.error('Brevo API Key (SMTP Key) is missing in environment variables');
            return NextResponse.json(
                { success: false, message: 'Server Configuration Error: API Key missing' },
                { status: 500 }
            );
        }

        // Create a Nodemailer transporter using Brevo SMTP
        const transporter = nodemailer.createTransport({
            host: 'smtp-relay.brevo.com',
            port: 587,
            secure: false, // Use STARTTLS
            auth: {
                user: smtpLogin,
                pass: apiKey,
            },
        });

        // Send the email
        const info = await transporter.sendMail({
            from: `"${senderName}" <${senderEmail}>`,
            to: email,
            subject: subject || 'Property Report',
            html: htmlContent,
        });

        console.log('Message sent: %s', info.messageId);

        return NextResponse.json({ success: true, messageId: info.messageId });

    } catch (error) {
        console.error('Server Error sending email:', JSON.stringify(error, null, 2));

        // Provide a more helpful error message if auth fails
        if (error.responseCode === 535) {
            return NextResponse.json(
                { success: false, message: 'SMTP Error: Authentication Failed. Check your SENDER_EMAIL matches your Brevo login.' },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { success: false, message: 'Failed to send email' },
            { status: 500 }
        );
    }
}
