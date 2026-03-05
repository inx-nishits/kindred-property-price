import { NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/session';

const KINDRED_ACCESS_TOKEN = 'kindred2026';

export async function middleware(request) {
  const session = await getSessionFromRequest(request);
  const { searchParams } = new URL(request.url);

  // Check for the Kindred access token in the query parameters
  if (searchParams.has('k') && searchParams.get('k') === KINDRED_ACCESS_TOKEN) {
    console.log('Kindred access token detected. Granting bypass access.');
    // Set a bypass flag in the session
    session.bypass = true;
    await session.save();

    // Redirect to the same URL without the token to clean the address bar
    const url = new URL(request.url);
    url.searchParams.delete('k');
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// This config ensures the middleware only runs on property pages
export const config = {
  matcher: '/property/:path*',
};