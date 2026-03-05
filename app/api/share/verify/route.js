import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

/**
 * API Endpoint: POST /api/share/verify
 * 
 * Verifies a share_token JWT
 */
export async function POST(request) {
    try {
        const body = await request.json();
        const { token, propertyId } = body;

        if (!token) {
            return NextResponse.json({ success: false, message: 'Token is required' }, { status: 400 });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

            // If propertyId is provided, ensure the token is for that specific property
            if (propertyId && decoded.propertyId !== propertyId) {
                return NextResponse.json({
                    success: false,
                    message: 'This link is for a different property'
                }, { status: 403 });
            }

            return NextResponse.json({
                success: true,
                propertyId: decoded.propertyId,
                type: decoded.type,
                recipientEmail: decoded.recipientEmail
            });
        } catch (err) {
            console.error('JWT verification failed:', err.message);
            return NextResponse.json({
                success: false,
                message: err.name === 'TokenExpiredError' ? 'This link has expired' : 'Invalid link'
            }, { status: 401 });
        }
    } catch (error) {
        console.error('Error verifying link:', error);
        return NextResponse.json(
            { success: false, message: `Server error: ${error.message}` },
            { status: 500 }
        );
    }
}
