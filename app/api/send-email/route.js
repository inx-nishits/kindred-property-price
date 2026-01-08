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

        /* 
        // FUTURE BREVO SETUP (Commented out for now)
        // ------------------------------------------
        // const apiKey = process.env.BREVO_API_KEY;
        // const smtpLogin = process.env.BREVO_SMTP_LOGIN;
        // const smtpHost = 'smtp-relay.brevo.com';
        // const smtpPort = 587;
        // ------------------------------------------
        */

        // CURRENT ACTIVE SETUP (Gmail / Generic SMTP)
        const gmailUser = process.env.GMAIL_USER?.trim();
        const gmailPass = process.env.GMAIL_APP_PASSWORD?.trim();

        const smtpHost = process.env.SMTP_HOST?.trim() || 'smtp.gmail.com';
        const smtpPort = process.env.SMTP_PORT?.trim() || '587';
        const smtpUser = gmailUser || process.env.SMTP_USER?.trim();
        const smtpPass = gmailPass || process.env.SMTP_PASS?.trim();
        const senderEmail = process.env.SENDER_EMAIL?.trim() || smtpUser;
        const senderName = process.env.SENDER_NAME?.trim() || 'Kindred Property';

        if (!smtpUser || !smtpPass) {
            console.error('Missing SMTP configuration: (GMAIL_USER/GMAIL_APP_PASSWORD) or (SMTP_USER/SMTP_PASS)');
            return NextResponse.json(
                {
                    success: false,
                    message: 'Server Configuration Error: Email credentials missing'
                },
                { status: 500 }
            );
        }

        // Create a Nodemailer transporter
        const transporter = nodemailer.createTransport({
            host: smtpHost,
            port: parseInt(smtpPort),
            secure: smtpPort === '465', // true for 465, false for 587
            auth: {
                user: smtpUser,
                pass: smtpPass,
            },
        });

        // Send the email
        const info = await transporter.sendMail({
            from: `"${senderName}" <${senderEmail}>`,
            to: email,
            subject: subject || 'Property Report',
            html: htmlContent,
        });

        console.log('Email sent successfully:', info.messageId);

        return NextResponse.json({
            success: true,
            message: 'Email sent successfully',
            messageId: info.messageId
        });

    } catch (error) {
        console.error('SMTP Server Error:', error);

        return NextResponse.json(
            {
                success: false,
                message: error.message || 'Failed to send email. Please check your SMTP configuration.',
                error: process.env.NODE_ENV === 'development' ? error.toString() : undefined
            },
            { status: 500 }
        );
    }
}
