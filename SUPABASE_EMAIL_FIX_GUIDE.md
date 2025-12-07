
# Supabase Email Configuration Fix Guide

## Problem

The app is showing this error when users try to sign up with email/password:

```
"535 Authentication failed: The provided authorization grant is invalid, expired, or revoked"
```

This error appears in the Supabase Auth logs and indicates that the **SMTP/SendGrid credentials are invalid or expired**.

## Root Cause

The email provider (SendGrid or custom SMTP) configured in Supabase Auth has invalid or expired credentials. This prevents Supabase from sending confirmation emails to new users.

## Solutions

### Option 1: Fix SendGrid Configuration (Recommended for Production)

1. **Go to Supabase Dashboard**
   - Navigate to: https://supabase.com/dashboard/project/iykrwfgfdpnlfmdexrpr
   - Go to: **Authentication → Email Templates → SMTP Settings**

2. **Check SendGrid API Key**
   - Verify that the SendGrid API key is valid
   - If expired, generate a new API key from SendGrid:
     - Go to: https://app.sendgrid.com/settings/api_keys
     - Create new API key with "Mail Send" permissions
     - Copy the key and update it in Supabase

3. **Verify Sender Email**
   - Make sure the "From" email address is verified in SendGrid
   - Go to: https://app.sendgrid.com/settings/sender_auth
   - Verify the domain or single sender email

4. **Test the Configuration**
   - In Supabase Dashboard, send a test email
   - Check SendGrid activity logs for any errors

### Option 2: Disable Email Confirmation (For TestFlight Testing)

**⚠️ Only use this during testing - NOT for production!**

1. **Go to Supabase Dashboard**
   - Navigate to: https://supabase.com/dashboard/project/iykrwfgfdpnlfmdexrpr
   - Go to: **Authentication → Providers → Email**

2. **Disable Email Confirmation**
   - Find the setting: **"Confirm email"**
   - Toggle it **OFF**
   - Click **Save**

3. **What This Does**
   - Users can sign up without email verification
   - They get immediate access to the app
   - No confirmation email is sent

4. **Re-enable Before Production**
   - Remember to turn this back ON before launching
   - Email verification is important for security

### Option 3: Use Supabase's Built-in Email Service

1. **Go to Supabase Dashboard**
   - Navigate to: **Authentication → Email Templates → SMTP Settings**

2. **Switch to Supabase Email**
   - Select: **"Use Supabase's email service"**
   - This uses Supabase's default email provider
   - Limited to 3 emails per hour on free tier

3. **Limitations**
   - Rate limited (3 emails/hour on free tier)
   - Not suitable for production
   - Good for testing

## Client-Side Improvements (Already Implemented)

The app now handles email errors gracefully:

1. **Better Error Messages**
   - Shows clear message when email provider fails
   - Provides contact information for support

2. **Workaround for Users**
   - Suggests contacting support@flowfam.nl
   - Explains the issue clearly

3. **Login Flow**
   - Detects unconfirmed email on login
   - Shows helpful message with support contact

## Testing After Fix

1. **Test Email Signup**
   ```
   - Go to "Register with e-mail"
   - Fill in: Name, Email, Password
   - Submit
   - Check if confirmation email arrives
   ```

2. **Test Email Login**
   ```
   - Go to "Login with e-mail"
   - Use existing account credentials
   - Should login successfully
   ```

3. **Check Logs**
   ```
   - Go to Supabase Dashboard → Logs → Auth
   - Look for any "535" errors
   - Should see successful email sends
   ```

## Recommended Approach for TestFlight

**For immediate testing:**
1. Disable email confirmation (Option 2)
2. Test the app thoroughly
3. Fix SendGrid configuration in parallel

**Before production launch:**
1. Fix SendGrid configuration (Option 1)
2. Re-enable email confirmation
3. Test email flow end-to-end

## Support Contact

If users encounter issues during TestFlight:
- Email: support@flowfam.nl
- Include: User's name and email address
- Manually activate accounts if needed

## Additional Notes

- Apple/Google Sign-In work fine (no email confirmation needed)
- The family creation flow works correctly
- Only email/password signup is affected by this issue
