/**
 * Centralized Configuration for Property Reports
 * Contains all branding, contact, and report settings
 */

// Branding Configuration
export const BRAND_CONFIG = {
  // Main logo URL - high quality version
  logoUrl: "https://kindred-property.s3.ap-southeast-2.amazonaws.com/logos/kindred-email-logo.png",

  // Footer logo URL for emails
  footerLogoUrl: "https://kindred-property.s3.ap-southeast-2.amazonaws.com/logos/kindred-email-logo-footer.png",


  // Tagline to appear under logo
  tagline: "real estate, recreated",

  // Brand colors
  colors: {
    primary: '#34BF77',
    brandDark: '#163331',
    brandGreen: '#065f46',
    softWhite: '#F5F3EB',
    softGray: '#F8FAF9',
    textMain: '#163331',
    textMuted: '#6b7280',
    border: '#e5e7eb',
    white: '#ffffff',
    success: '#34d399',
    error: '#e53935'
  }
};

// Contact Information Configuration
export const CONTACT_CONFIG = {
  // Main contact details for reports
  email: "customercare@kindred.com.au",
  phone: "(07) 3284 0512",
  website: "https://www.kindred.com.au",

  // Sales appraisal CTA link
  salesAppraisalUrl: "https://www.kindred.com.au/sales-property-appraisal",

  // Company information
  companyName: "Kindred Property",
  copyright: `&copy; ${new Date().getFullYear()} Kindred Property. All rights reserved.`
};

// Report Settings Configuration
export const REPORT_CONFIG = {
  // Schools section settings
  schools: {
    maxDisplayCount: 5,  // Limit schools displayed in email report
    showIcsea: false     // Remove ICSEA numbers entirely
  },

  // Comparables section settings
  comparables: {
    maxDisplayCount: 10,
    showDistance: true
  },

  // Sales history section settings
  salesHistory: {
    maxDisplayCount: 5
  },

  // CTA Button settings
  cta: {
    text: "Get Your Free Property Appraisal",
    backgroundColor: '#163331',
    textColor: '#ffffff'
  }
};

// HubSpot Integration Configuration
export const HUBSPOT_CONFIG = {
  // HubSpot Portal ID
  portalId: process.env.NEXT_PUBLIC_HUBSPOT_PORTAL_ID || '',

  // HubSpot Form ID for property reports
  formId: process.env.NEXT_PUBLIC_HUBSPOT_FORM_ID || '',

  // API endpoint for contact creation
  contactApiUrl: 'https://api.hsforms.com/submissions/v3/integration/submit',

  // Form fields mapping
  formFields: {
    firstName: 'firstname',
    lastName: 'lastname',
    email: 'email',
    mobile: 'phone',
    propertyAddress: 'property_address',
    propertyId: 'property_id',
    reportType: 'report_type'
  }
};

// Export combined configuration
export const REPORT_CONFIG_FULL = {
  brand: BRAND_CONFIG,
  contact: CONTACT_CONFIG,
  settings: REPORT_CONFIG,
  hubspot: HUBSPOT_CONFIG
};

export default REPORT_CONFIG_FULL;