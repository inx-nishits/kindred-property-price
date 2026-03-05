import jwt from 'jsonwebtoken';

/**
 * Verifies a JWT token
 * @param {string} token - The JWT token to verify
 * @returns {object|null} - The decoded token payload or null if invalid
 */
export function verifyToken(token) {
  if (!token) return null;

  try {
    // For frontend verification, we just decode the token without secret
    // since we're only checking the expiration and payload
    const decoded = jwt.decode(token);
    
    // Check if token is expired
    if (decoded && decoded.exp) {
      const currentTime = Math.floor(Date.now() / 1000);
      if (currentTime > decoded.exp) {
        return null; // Token expired
      }
    }
    
    return decoded;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

/**
 * Checks if a share token is valid for a specific property
 * @param {string} token - The JWT token
 * @param {string} propertyId - The property ID to check against
 * @returns {boolean} - True if token is valid for the property
 */
export function isShareTokenValid(token, propertyId) {
  const decoded = verifyToken(token);
  return decoded && decoded.propertyId === propertyId;
}

/**
 * Checks if the current URL has a valid share token
 * @param {string} propertyId - The property ID to check against
 * @returns {boolean} - True if valid share token is present
 */
export function hasValidShareToken(propertyId) {
  if (typeof window === 'undefined') return false;
  
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('share_token');
  
  return isShareTokenValid(token, propertyId);
}

/**
 * Checks if the current URL has a Kindred group access token
 * @returns {boolean} - True if Kindred group access token is present
 */
export function hasKindredGroupAccess() {
  if (typeof window === 'undefined') return false;
  
  const urlParams = new URLSearchParams(window.location.search);
  const groupToken = urlParams.get('kindred_group_token');
  
    // Check if the token matches the secret from environment variables
  const internalSecret = process.env.NEXT_PUBLIC_INTERNAL_ACCESS_TOKEN || 'kindreda_insider-access';
  return groupToken === internalSecret;
}