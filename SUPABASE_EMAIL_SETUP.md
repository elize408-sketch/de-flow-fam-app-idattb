
# Supabase Email Configuration for OTP Verification

## Email Template Setup

To enable OTP (One-Time Password) verification for email signups, you need to configure the email template in your Supabase project dashboard.

### Steps:

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Email Templates**
3. Find the **Confirm signup** template
4. Replace the template content with the following:

```html
<h2>Bevestig je e-mailadres</h2>

<p>Bedankt voor je registratie bij Flow Fam!</p>

<p>Gebruik de volgende 6-cijferige code om je e-mailadres te bevestigen:</p>

<h1 style="font-size: 32px; font-weight: bold; text-align: center; letter-spacing: 8px; margin: 30px 0;">
  {{ .Token }}
</h1>

<p>Deze code is 24 uur geldig.</p>

<p>Als je deze registratie niet hebt aangevraagd, kun je deze e-mail negeren.</p>

<p>Met vriendelijke groet,<br>Het Flow Fam team</p>
```

### Important Notes:

- The `{{ .Token }}` variable will be replaced with the 6-digit OTP code
- OTP codes expire after 24 hours by default
- Users can request a new code using the "Resend code" button in the app

### Rate Limiting:

By default, Supabase has the following rate limits for OTP:
- Users can request an OTP once every 60 seconds
- OTP codes are valid for 24 hours

You can adjust these settings in:
**Authentication** → **Rate Limits** → **OTP**

### Testing:

1. Register a new user with email
2. Check your email inbox for the 6-digit code
3. Enter the code in the verification screen
4. The user should be successfully verified and redirected to the family setup

## Storage Configuration

The documents feature uses Supabase Storage with the following bucket:

- **Bucket name**: `family-documents`
- **Public**: No (private bucket)
- **File size limit**: None (default)
- **Allowed MIME types**: PDF and images

### RLS Policies:

The following RLS policies are already configured:

1. **Upload**: Users can upload documents to their own folder (user_id)
2. **View**: Users can view documents in their family
3. **Download**: Users can download documents they have permission for
4. **Delete**: Users can delete their own documents or documents they have delete permission for

### File Structure:

Files are stored in the following structure:
```
family-documents/
  └── {user_id}/
      └── {timestamp}_{filename}
```

This ensures each user has their own folder and files don't conflict.
