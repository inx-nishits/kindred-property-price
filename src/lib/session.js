import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';

export const sessionOptions = {
  password: process.env.SECRET_COOKIE_PASSWORD,
  cookieName: 'kindred-property-session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
  },
};

/**
 * Retrieves the session for use in Next.js Middleware (Edge Runtime).
 * It takes the request object and extracts cookies from it.
 */
export async function getSessionFromRequest(request) {
  const session = await getIronSession(request.cookies, sessionOptions);
  return session;
}

/**
 * Retrieves the session for use in API Routes and Server Components (Node.js Runtime).
 * It uses the `cookies()` function from `next/headers`.
 */
export async function getSession() {
  const session = await getIronSession(cookies(), sessionOptions);
  return session;
}