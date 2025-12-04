
# Supabase Email Delivery Troubleshooting Guide

## Issue
Confirmation emails are not being delivered after user registration.

## Checklist for Email Configuration

### 1. Check Email Confirmation Settings
1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/iykrwfgfdpnlfmdexrpr
2. Navigate to **Authentication** → **Settings**
3. Check the following settings:
   - **Enable email confirmations**: Should be enabled for production
   - **Confirm email**: This determines if users need to verify their email
   - **SITE_URL**: Should be set to your production domain (flowfam.nl)
   - **Redirect URLs**: Add `https://natively.dev/email-confirmed` to the allowed redirect URLs

### 2. SMTP Configuration
1. In Supabase Dashboard, go to **Project Settings** → **Auth**
2. Scroll to **SMTP Settings**
3. Check if custom SMTP is configured:
   - **SMTP Host**: Should be configured (e.g., smtp.sendgrid.net, smtp.mailgun.org)
   - **SMTP Port**: Usually 587 or 465
   - **SMTP User**: Your SMTP username
   - **SMTP Password**: Your SMTP password
   - **Sender Email**: Should be a verified email from your domain (e.g., noreply@flowfam.nl)
   - **Sender Name**: Flow Fam

**Note**: By default, Supabase uses their own email service, but it has rate limits and may not work reliably for production. You should configure a custom SMTP provider.

### 3. Domain Verification (for flowfam.nl)
To send emails from your domain, you need to verify it with your email provider:

#### SPF Record
Add this TXT record to your DNS:
```
Type: TXT
Name: @
Value: v=spf1 include:_spf.youremailprovider.com ~all
```

#### DKIM Record
Your email provider will give you a DKIM record to add:
```
Type: TXT
Name: default._domainkey
Value: [provided by your email service]
```

#### DMARC Record
Add this TXT record:
```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none; rua=mailto:dmarc@flowfam.nl
```

### 4. Email Provider Setup
Popular options:
- **SendGrid**: Free tier includes 100 emails/day
- **Mailgun**: Free tier includes 5,000 emails/month
- **AWS SES**: Very affordable, pay-as-you-go
- **Postmark**: Reliable, starts at $10/month

### 5. Test Email Delivery
1. In Supabase Dashboard, go to **Authentication** → **Users**
2. Try creating a test user
3. Check the **Logs** section for any email-related errors
4. Check your spam folder

### 6. Rate Limits
Supabase has rate limits on email sending:
- Default: 4 emails per hour per user
- Can be increased in project settings

## Temporary Workaround (Development Only)
For testing purposes, you can disable email confirmation:
1. Go to **Authentication** → **Settings**
2. Disable **Confirm email**
3. Users will be able to sign up and log in immediately without email verification

**⚠️ Warning**: This should only be used for development/testing. Always enable email confirmation in production for security.

## Current Status
- Project ID: iykrwfgfdpnlfmdexrpr
- Region: eu-central-1
- Status: ACTIVE_HEALTHY
- Auth logs show successful signup attempts but emails may not be configured

## Next Steps
1. Configure custom SMTP provider (recommended: SendGrid or Mailgun)
2. Verify your domain (flowfam.nl) with SPF/DKIM/DMARC records
3. Test email delivery with a test account
4. Re-enable email confirmation once emails are working
