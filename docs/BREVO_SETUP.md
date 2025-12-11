# Brevo Email Integration Setup Guide

This guide will help you set up Brevo email functionality for your Property Price website.

## Prerequisites

- Brevo account (sign up at https://www.brevo.com)
- Brevo API key (get from https://app.brevo.com/settings/keys/api)

## Deployment Platform Setup

### Option 1: Vercel Deployment

1. **Create `.env.local` file** (for local development):
   ```env
   BREVO_API_KEY=your_brevo_api_key_here
   ADMIN_EMAIL=customercare@kindred.com.au
   FROM_EMAIL=noreply@kindred.com.au
   FROM_NAME=Property Insights Australia
   SITE_URL=http://localhost:5173
   ```

2. **Set Environment Variables in Vercel Dashboard**:
   - Go to your project settings → Environment Variables
   - Add all variables from `.env.local`
   - The `/api` folder functions will automatically be deployed as serverless functions

3. **Deploy**:
   ```bash
   vercel deploy
   ```

### Option 2: Netlify Deployment

1. **Create `.env` file** (for local development):
   ```env
   BREVO_API_KEY=your_brevo_api_key_here
   ADMIN_EMAIL=customercare@kindred.com.au
   FROM_EMAIL=noreply@kindred.com.au
   FROM_NAME=Property Insights Australia
   SITE_URL=http://localhost:8888
   ```

2. **Set Environment Variables in Netlify Dashboard**:
   - Go to Site settings → Build & deploy → Environment
   - Add all variables
   - The `/netlify/functions` folder functions will automatically be deployed

3. **Netlify Configuration**:
   - The `netlify.toml` file is already configured with redirects
   - This allows `/api/send-email` to work with Netlify functions
   - No additional configuration needed

4. **Deploy**:
   ```bash
   netlify deploy --prod
   ```

## Brevo Account Configuration

### 1. Verify Sender Email

1. Log in to Brevo dashboard: https://app.brevo.com
2. Go to **Senders & IP** → **Senders**
3. Add and verify your sender email (`FROM_EMAIL`)
4. Verify the email address through the confirmation email

### 2. Configure API Key

1. Go to **Settings** → **API Keys**
2. Create a new API key or use an existing one
3. Make sure the API key has **SMTP** permissions enabled
4. Copy the API key and add it to your environment variables

### 3. Test Email Sending

You can test the integration by:
1. Submitting the contact form on your website
2. Checking the Brevo dashboard → **Statistics** → **Email activity**
3. Verifying emails are received at `ADMIN_EMAIL`

## Email Types Supported

### 1. Contact Form Emails
- **Trigger**: When user submits contact form
- **Recipient**: `ADMIN_EMAIL`
- **Contains**: Name, email, phone, message

### 2. Lead Capture Emails
- **Trigger**: When user requests property report
- **Recipient**: `ADMIN_EMAIL`
- **Contains**: Name, email, property address, suburb, property ID

### 3. Property Report Emails
- **Trigger**: When property report is generated
- **Recipient**: User's email
- **Contains**: Property report link and details

## Local Development

### Using Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Run development server:
   ```bash
   vercel dev
   ```

3. The API functions will be available at `http://localhost:3000/api/send-email`

### Using Netlify CLI

1. Install Netlify CLI:
   ```bash
   npm i -g netlify-cli
   ```

2. Run development server:
   ```bash
   netlify dev
   ```

3. The API functions will be available at `http://localhost:8888/.netlify/functions/send-email`

## Troubleshooting

### Emails Not Sending

1. **Check API Key**: Verify the API key is correct and has SMTP permissions
2. **Check Sender Email**: Ensure sender email is verified in Brevo
3. **Check Environment Variables**: Verify all env vars are set in deployment platform
4. **Check Function Logs**: Review serverless function logs in Vercel/Netlify dashboard
5. **Check Brevo Dashboard**: Look for errors in Brevo → Statistics → Email activity

### Common Errors

- **401 Unauthorized**: API key is incorrect or missing
- **400 Bad Request**: Sender email not verified or invalid email format
- **429 Too Many Requests**: Exceeded Brevo rate limits (300 emails/day on free plan)

## Security Notes

⚠️ **IMPORTANT**: Never commit API keys to version control!

- The API key is stored securely in environment variables
- Serverless functions keep the API key server-side only
- Frontend code never directly accesses the Brevo API

## Brevo Free Plan Limits

- **300 emails per day** (~9,000 per month)
- Perfect for initial launch and testing
- Upgrade to Starter plan (£19/month) for 20,000 emails/month

## Support

For issues with:
- **Brevo API**: Contact Brevo support at https://help.brevo.com
- **Integration**: Check function logs in your deployment platform dashboard
- **Code Issues**: Review the error messages in browser console and function logs

