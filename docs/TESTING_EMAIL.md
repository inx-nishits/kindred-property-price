# Testing Brevo Email Integration

This guide will help you test the email functionality in your Property Price website.

## 🚀 Quick Start (Easiest Method)

### Option A: Use the Test Page (Recommended)

1. **Start your development server with serverless functions:**
   ```bash
   # For Vercel
   vercel dev
   
   # OR for Netlify
   netlify dev
   ```

2. **Open the test page in your browser:**
   ```
   http://localhost:3000/test-email.html  (Vercel)
   http://localhost:8888/test-email.html  (Netlify)
   ```

3. **Click the test buttons** to send test emails
4. **Check your email inbox** and Brevo dashboard

This is the easiest way to test - no coding required!

## Quick Test Options

### Option 1: Test in Production (Easiest)

Once deployed to Vercel or Netlify with environment variables set:

1. **Test Contact Form:**
   - Navigate to `/contact` page
   - Fill out the contact form
   - Submit and check for success message
   - Check your `ADMIN_EMAIL` inbox for the email

2. **Test Lead Capture:**
   - Navigate to a property page
   - Click to unlock property details
   - Fill out name and email in the modal
   - Submit and check `ADMIN_EMAIL` inbox

3. **Check Brevo Dashboard:**
   - Go to https://app.brevo.com
   - Navigate to **Statistics** → **Email activity**
   - You should see sent emails listed there

### Option 2: Local Development with Serverless Functions

#### For Vercel:

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Link your project:**
   ```bash
   vercel link
   ```

4. **Set environment variables locally:**
   ```bash
   vercel env pull .env.local
   ```
   Or manually create `.env.local`:
   ```env
   BREVO_API_KEY=your_brevo_api_key_here
   ADMIN_EMAIL=customercare@kindred.com.au
   FROM_EMAIL=noreply@kindred.com.au
   FROM_NAME=Property Insights Australia
   SITE_URL=http://localhost:3000
   ```

5. **Run development server:**
   ```bash
   vercel dev
   ```
   This will start both the frontend and API functions locally.

6. **Test:**
   - Open http://localhost:3000
   - Test contact form and lead capture
   - Check your email inbox

#### For Netlify:

1. **Install Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify:**
   ```bash
   netlify login
   ```

3. **Link your project:**
   ```bash
   netlify link
   ```

4. **Set environment variables:**
   Create `.env` file in project root:
   ```env
   BREVO_API_KEY=your_brevo_api_key_here
   ADMIN_EMAIL=customercare@kindred.com.au
   FROM_EMAIL=noreply@kindred.com.au
   FROM_NAME=Property Insights Australia
   SITE_URL=http://localhost:8888
   ```

5. **Run development server:**
   ```bash
   netlify dev
   ```
   This will start both the frontend and functions locally.

6. **Test:**
   - Open http://localhost:8888
   - Test contact form and lead capture
   - Check your email inbox

### Option 3: Test API Function Directly (Advanced)

You can test the serverless function directly using curl or Postman:

#### Test Contact Form Email:

```bash
curl -X POST http://localhost:3000/api/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "type": "contact",
    "data": {
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "phone": "0412345678",
      "message": "This is a test message from the contact form."
    }
  }'
```

#### Test Lead Capture Email:

```bash
curl -X POST http://localhost:3000/api/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "type": "lead",
    "data": {
      "name": "Jane Smith",
      "email": "jane.smith@example.com",
      "propertyAddress": "123 Test Street",
      "propertySuburb": "Brisbane",
      "propertyId": "test-123"
    }
  }'
```

## Testing Checklist

### ✅ Contact Form Test

- [ ] Fill out contact form with all fields
- [ ] Submit form
- [ ] See success message
- [ ] Receive email at `ADMIN_EMAIL`
- [ ] Email contains correct information
- [ ] Reply-to address is set to user's email

### ✅ Lead Capture Test

- [ ] Navigate to property page
- [ ] Click to unlock property details
- [ ] Fill out name and email
- [ ] Submit form
- [ ] Content unlocks
- [ ] Receive email at `ADMIN_EMAIL`
- [ ] Email contains property information

### ✅ Error Handling Test

- [ ] Submit form with invalid email
- [ ] See appropriate error message
- [ ] Submit form with missing required fields
- [ ] See validation errors
- [ ] Test with API key removed (should show error)

## Debugging Tips

### Check Browser Console

1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for any error messages when submitting forms
4. Check Network tab to see API requests

### Check Serverless Function Logs

**Vercel:**
```bash
vercel logs
```

**Netlify:**
- Go to Netlify dashboard
- Navigate to Functions → View logs

### Common Issues

#### 1. "Failed to send email" Error

**Possible causes:**
- API key not set or incorrect
- Sender email not verified in Brevo
- Network/CORS issues

**Solutions:**
- Verify `BREVO_API_KEY` in environment variables
- Check Brevo dashboard → Senders & IP → verify sender email
- Check function logs for detailed error messages

#### 2. CORS Errors

**Solution:**
- Make sure serverless function headers are configured
- Check `netlify.toml` or `vercel.json` for CORS settings

#### 3. Function Not Found (404)

**Vercel:**
- Ensure file is in `/api` folder
- Check `vercel.json` configuration

**Netlify:**
- Ensure file is in `/netlify/functions` folder
- Check `netlify.toml` redirect rules

#### 4. Emails Not Received

**Check:**
- Spam/junk folder
- Brevo dashboard → Email activity (see if emails were sent)
- Brevo dashboard → Statistics (check delivery rates)
- Verify `ADMIN_EMAIL` is correct

### Test Email Templates

You can preview email templates by checking the HTML content in:
- `api/send-email.js` (Vercel)
- `netlify/functions/send-email.js` (Netlify)

## Monitoring Email Activity

### Brevo Dashboard

1. **Email Activity:**
   - Go to https://app.brevo.com
   - Navigate to **Statistics** → **Email activity**
   - See all sent emails with status (sent, delivered, opened, clicked)

2. **Delivery Reports:**
   - Check delivery rates
   - See bounce and spam reports
   - Monitor email reputation

3. **API Logs:**
   - Go to **Settings** → **API Keys**
   - View API usage and logs

## Rate Limits

**Free Plan:**
- 300 emails per day
- ~9,000 emails per month

**Monitor usage:**
- Brevo dashboard → Statistics
- Keep track of daily/monthly limits

## Next Steps After Testing

1. ✅ Verify all email types work correctly
2. ✅ Check email formatting and content
3. ✅ Test error handling
4. ✅ Monitor email delivery rates
5. ✅ Set up email templates in Brevo (optional)
6. ✅ Configure email automation (optional)

## Need Help?

- **Brevo Support:** https://help.brevo.com
- **Check function logs** in your deployment platform
- **Review error messages** in browser console
- **Check Brevo dashboard** for API errors

