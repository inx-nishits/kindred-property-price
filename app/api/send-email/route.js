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

        // Gmail Configuration
        const gmailUser = process.env.GMAIL_USER?.trim();
        const gmailPass = process.env.GMAIL_APP_PASSWORD?.trim();
        const senderName = process.env.SENDER_NAME?.trim() || 'Kindred Property';

        if (!gmailUser || !gmailPass) {
            console.error('Missing Gmail configuration: GMAIL_USER and GMAIL_APP_PASSWORD are required');
            return NextResponse.json(
                {
                    success: false,
                    message: 'Server Configuration Error: Gmail credentials missing. Please provide GMAIL_USER and GMAIL_APP_PASSWORD'
                },
                { status: 500 }
            );
        }

        // Create a Nodemailer transporter for Gmail
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false, // true for 465, false for 587
            auth: {
                user: gmailUser,
                pass: gmailPass,
            },
        });

        // Send the email
        const info = await transporter.sendMail({
            from: `"${senderName}" <${gmailUser}>`,
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
                message: error.message || 'Failed to send email. Please check your Gmail configuration.',
                error: process.env.NODE_ENV === 'development' ? error.toString() : undefined
            },
            { status: 500 }
        );
    }
}
