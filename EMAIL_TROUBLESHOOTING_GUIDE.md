
# Email Verification Troubleshooting Guide

## Current Issues

### 1. SendGrid Authentication Error (535)
**Error**: `535 Authentication failed: The provided authorization grant is invalid, expired, or revoked`

**Cause**: Your SendGrid API key is invalid, expired, or has been revoked.

**Solution**:
1. Go to your SendGrid dashboard: https://app.sendgrid.com/
2. Navigate to Settings → API Keys
3. Create a new API key with "Full Access" or at minimum "Mail Send" permissions
4. Copy the new API key
5. Go to your Supabase dashboard: https://supabase.com/dashboard/project/iykrwfgfdpnlfmdexrpr/settings/auth
6. Scroll to "SMTP Settings"
7. Update the SMTP password with your new SendGrid API key
8. Click "Save"

### 2. Repeated Signup Issue
**Issue**: When a user tries to sign up with an email that already exists, Supabase doesn't send a new confirmation email by default.

**Solution**: The app now automatically calls `resend()` when it detects a repeated signup, so users will receive a new verification code.

### 3. Email Not Received
**Possible Causes**:
- Email is in spam/junk folder
- SendGrid API key is invalid (see issue #1)
- Email provider is blocking emails from Supabase
- Rate limiting (users can only request a code once every 60 seconds)

**Solutions**:
1. **Check Spam Folder**: Always check spam/junk/promotions folders
2. **Whitelist Sender**: Add `noreply@mail.app.supabase.io` to contacts
3. **Fix SendGrid**: Follow steps in issue #1
4. **Wait**: If rate limited, wait 60 seconds before requesting a new code
5. **Contact Support**: Email support@flowfam.nl with the user's email address

## Testing Email Delivery

### Test 1: Check SendGrid Activity
1. Go to SendGrid dashboard: https://app.sendgrid.com/
2. Navigate to Activity
3. Search for recent emails sent to your test email
4. Check the status (Delivered, Bounced, Dropped, etc.)

### Test 2: Check Supabase Auth Logs
1. Go to Supabase dashboard: https://supabase.com/dashboard/project/iykrwfgfdpnlfmdexrpr/logs/auth-logs
2. Look for recent signup attempts
3. Check for errors related to email sending

### Test 3: Manual Email Test
1. Use the Supabase SQL Editor to check if user exists:
```sql
SELECT id, email, email_confirmed_at, created_at 
FROM auth.users 
WHERE email = 'test@example.com';
```

2. If user exists but email_confirmed_at is NULL, they need to verify their email

## Email Template Configuration

Your email template should include the `{{ .Token }}` variable to send OTP codes:

```html
<h2>Bevestig je e-mailadres</h2>

<p>Welkom bij Flow Fam!</p>

<p>Voer deze code in de app in om je e-mailadres te bevestigen:</p>

<h1 style="font-size: 32px; letter-spacing: 8px; text-align: center; color: #F5A623;">
  {{ .Token }}
</h1>

<p>Deze code is 24 uur geldig.</p>

<p>Als je dit account niet hebt aangemaakt, kun je deze e-mail negeren.</p>
```

To update your email template:
1. Go to: https://supabase.com/dashboard/project/iykrwfgfdpnlfmdexrpr/auth/templates
2. Select "Confirm signup" template
3. Update the HTML to include `{{ .Token }}`
4. Click "Save"

## User Instructions

When users report not receiving emails, provide these instructions:

1. **Check Spam Folder**: Look in spam, junk, promotions, or other folders
2. **Wait a Few Minutes**: Emails can take 1-5 minutes to arrive
3. **Check Email Address**: Make sure the email address is correct
4. **Whitelist Sender**: Add `noreply@mail.app.supabase.io` to contacts
5. **Try Resending**: Use the "Resend Code" button in the app
6. **Contact Support**: If still not working, email support@flowfam.nl

## Common Error Messages

### "Er is een probleem met de e-mailprovider"
**Meaning**: SendGrid API key is invalid
**Fix**: Update SendGrid API key in Supabase settings (see issue #1)

### "De verificatiecode is verlopen"
**Meaning**: The OTP code has expired (24 hour limit)
**Fix**: Request a new code using "Resend Code" button

### "De ingevoerde code is onjuist"
**Meaning**: User entered wrong code
**Fix**: Double-check the code in the email and try again

### "Account bestaat al"
**Meaning**: User tried to sign up with an email that's already registered
**Fix**: App automatically resends verification code. User should check email and verify.

## Support Contact

For persistent issues, users should contact:
- Email: support@flowfam.nl
- Include: User's email address and description of the problem
