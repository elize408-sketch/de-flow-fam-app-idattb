
# SendGrid Email Verification Fix Guide

## Problem
Your app is not proceeding to the email verification code screen because Supabase is failing to send confirmation emails. The error in the logs shows:

```
"error":"535 Authentication failed: The provided authorization grant is invalid, expired, or revoked"
"msg":"500: Error sending confirmation email"
```

## Root Cause
Your SendGrid API key has become invalid, expired, or revoked. This prevents Supabase from sending confirmation emails to new users.

## Solution Steps

### 1. Check SendGrid API Key Status
1. Log in to your SendGrid account at https://sendgrid.com
2. Go to **Settings** → **API Keys**
3. Check if your API key is still active
4. If it's expired or revoked, you'll need to create a new one

### 2. Create a New SendGrid API Key (if needed)
1. In SendGrid, go to **Settings** → **API Keys**
2. Click **Create API Key**
3. Give it a name like "Supabase Flow Fam Production"
4. Select **Full Access** or at minimum **Mail Send** permissions
5. Click **Create & View**
6. **IMPORTANT**: Copy the API key immediately - you won't be able to see it again!

### 3. Update Supabase with New API Key
1. Go to your Supabase project dashboard: https://supabase.com/dashboard/project/iykrwfgfdpnlfmdexrpr
2. Navigate to **Project Settings** → **Auth**
3. Scroll down to **SMTP Settings**
4. Update the following fields:
   - **SMTP Host**: `smtp.sendgrid.net`
   - **SMTP Port**: `587`
   - **SMTP User**: `apikey` (literally the word "apikey")
   - **SMTP Password**: Paste your new SendGrid API key here
   - **Sender Email**: `noreply@flowfam.nl` (or your verified sender)
   - **Sender Name**: `Flow Fam`
5. Click **Save**

### 4. Verify Email Settings
1. In Supabase, go to **Authentication** → **Email Templates**
2. Make sure **Enable email confirmations** is checked
3. Test by sending yourself a test email

### 5. Test the Fix
1. Try registering a new account in your app
2. You should now receive the confirmation email
3. The app should proceed to the email verification code screen

## Alternative: Disable Email Confirmation (Not Recommended for Production)
If you need to continue testing immediately while fixing SendGrid:

1. Go to Supabase **Project Settings** → **Auth**
2. Scroll to **Email Auth**
3. **Uncheck** "Enable email confirmations"
4. Click **Save**

**WARNING**: This allows users to sign up without verifying their email. Only use this for testing!

## Temporary Workaround in App
The app now includes a temporary workaround that:
1. Detects when email sending fails
2. Offers to continue without email verification
3. Attempts direct sign-in if auto-confirm is enabled

This is a **temporary solution** - you should fix the SendGrid configuration for production use.

## Need Help?
If you continue to have issues:
1. Check SendGrid's sender authentication: https://app.sendgrid.com/settings/sender_auth
2. Verify your domain's DNS records (SPF, DKIM, DMARC)
3. Check SendGrid's activity feed for delivery issues
4. Contact SendGrid support if the API key continues to fail

## Testing Checklist
- [ ] SendGrid API key is active and valid
- [ ] Supabase SMTP settings are updated
- [ ] Email confirmation is enabled in Supabase
- [ ] Test registration sends confirmation email
- [ ] App proceeds to verification code screen
- [ ] Verification code works correctly
- [ ] User can complete registration and access the app
