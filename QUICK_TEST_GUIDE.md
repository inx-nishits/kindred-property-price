# 🚀 Quick Test Guide - Brevo Email Integration

## Fastest Way to Test (5 Minutes)

### Step 1: Set Up Environment Variables

Create a `.env.local` file in your project root:

```env
BREVO_API_KEY=your_brevo_api_key_here
ADMIN_EMAIL=customercare@kindred.com.au
FROM_EMAIL=noreply@kindred.com.au
FROM_NAME=Property Insights Australia
SITE_URL=http://localhost:3000
```

### Step 2: Start Development Server

**For Vercel:**
```bash
# Install Vercel CLI if you haven't
npm install -g vercel

# Start dev server with functions
vercel dev
```

**For Netlify:**
```bash
# Install Netlify CLI if you haven't
npm install -g netlify-cli

# Start dev server with functions
netlify dev
```

### Step 3: Open Test Page

Open in your browser:
- **Vercel:** http://localhost:3000/test-email.html
- **Netlify:** http://localhost:8888/test-email.html

### Step 4: Click Test Buttons

1. Click "Send Test Contact Email"
2. Click "Send Test Lead Capture Email"
3. Check your email inbox (and spam folder)
4. Check Brevo dashboard: https://app.brevo.com/statistics/email-activity

## ✅ What to Check

- [ ] Test buttons show success messages
- [ ] Emails arrive in your `ADMIN_EMAIL` inbox
- [ ] Emails are formatted correctly
- [ ] Brevo dashboard shows sent emails

## 🐛 Troubleshooting

**"Network Error" or "Failed to fetch"**
- Make sure `vercel dev` or `netlify dev` is running
- Check that the server is on the correct port

**"Email service is not configured"**
- Check that `.env.local` file exists
- Verify `BREVO_API_KEY` is set correctly
- Restart the dev server after adding env vars

**"401 Unauthorized"**
- Verify your Brevo API key is correct
- Check Brevo dashboard → Settings → API Keys

**Emails not received**
- Check spam/junk folder
- Verify `ADMIN_EMAIL` is correct
- Check Brevo dashboard → Email activity

## 📧 Test in Production

Once deployed:

1. Set environment variables in your platform dashboard
2. Visit your live site
3. Test the contact form at `/contact`
4. Test lead capture on property pages
5. Check emails and Brevo dashboard

## 📚 More Details

See [docs/TESTING_EMAIL.md](./docs/TESTING_EMAIL.md) for comprehensive testing guide.

