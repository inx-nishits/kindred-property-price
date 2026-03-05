import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

/**
 * API Endpoint: POST /api/share/generate
 * 
 * Generates a shareable link with a JWT token for time-limited access
 */
async function POST(request) {
  try {
    const body = await request.json();
    const { propertyId, type, recipientEmail } = body;

    if (!propertyId) {
      return NextResponse.json({ success: false, message: 'Property ID is required' }, { status: 400 });
    }

    // Generate JWT token with 24-hour expiration
    const token = jwt.sign(
      {
        propertyId,
        type: recipientEmail ? 'personal' : (type || 'time-limited'),
        recipientEmail: recipientEmail || null,
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
      },
      process.env.JWT_SECRET || 'your-secret-key' // Use environment variable for production
    );

    // Construct shareable URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.kindredproperty.com.au';
    const shareUrl = `${baseUrl}/property/${propertyId}?share_token=${token}`;

    return NextResponse.json({
      success: true,
      shareUrl,
      token,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    });
  } catch (error) {
    console.error('Error generating shareable link:', error);
    return NextResponse.json(
      { success: false, message: `Server error: ${error.message}` },
      { status: 500 }
    );
  }
}

export { POST };