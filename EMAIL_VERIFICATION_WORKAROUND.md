
# Email Verification Workaround - Development Mode

## Overview
This document explains the temporary workaround implemented to bypass email verification during development and testing.

## Problem
- Confirmation emails are not being delivered after user registration
- Users cannot complete the signup flow and access the Family Setup screen
- This blocks testing and development of the rest of the app

## Solution Implemented

### 1. Temporary Skip Email Verification Flag
In `utils/auth.ts`, a flag has been added:

```typescript
// TEMPORARY: Skip email verification for testing
// Set to false to require email verification (production setting)
const SKIP_EMAIL_VERIFICATION = true;
```

**⚠️ Important**: Set this to `false` before deploying to production!

### 2. Modified Signup Flow
When `SKIP_EMAIL_VERIFICATION` is `true`:
- Users can register with email/password
- A development mode alert is shown explaining that verification is skipped
- Users are immediately allowed to continue to the Family Setup screen
- No email verification is required

### 3. Updated Screens
The following screens have been updated to support the workaround:
- `app/(auth)/create-family.tsx` - Create new family flow
- `app/(auth)/join-family.tsx` - Join existing family flow
- `utils/auth.ts` - Core authentication logic

### 4. User Experience
When a user registers:
1. They fill in their name, email, and password
2. They see an alert: "⚠️ Development Mode - Email verification is temporarily disabled for testing"
3. They can immediately continue to the Family Setup screen
4. They can add family members and start using the app

## How to Re-enable Email Verification

### Step 1: Configure Email Service
Follow the guide in `SUPABASE_EMAIL_TROUBLESHOOTING.md` to:
1. Set up SMTP provider (SendGrid, Mailgun, etc.)
2. Configure Supabase Auth settings
3. Verify your domain (flowfam.nl)
4. Test email delivery

### Step 2: Update Code
In `utils/auth.ts`, change:
```typescript
const SKIP_EMAIL_VERIFICATION = false; // Enable email verification
```

### Step 3: Test
1. Create a test account
2. Verify you receive the confirmation email
3. Click the link in the email
4. Confirm the user can access the app

## Current Flow (Development Mode)

### Create Family Flow:
1. Welcome Screen → Select Language
2. Create Family → Choose auth method
3. Register with email/password
4. **Skip verification** → Show development alert
5. Create family automatically
6. Navigate to Family Setup screen
7. Add family members
8. Navigate to Home screen

### Join Family Flow:
1. Welcome Screen → Select Language
2. Join Family → Enter family code
3. Choose auth method
4. Register with email/password
5. **Skip verification** → Show development alert
6. Add to family automatically
7. Navigate to Home screen

## Production Flow (When Email is Configured)

### Create Family Flow:
1. Welcome Screen → Select Language
2. Create Family → Choose auth method
3. Register with email/password
4. **Verify Email Screen** → Enter 6-digit code
5. Create family automatically
6. Navigate to Family Setup screen
7. Add family members
8. Navigate to Home screen

### Join Family Flow:
1. Welcome Screen → Select Language
2. Join Family → Enter family code
3. Choose auth method
4. Register with email/password
5. **Verify Email Screen** → Enter 6-digit code
6. Add to family automatically
7. Navigate to Home screen

## Security Considerations

**⚠️ WARNING**: The current workaround is ONLY for development/testing!

### Why Email Verification is Important:
1. **Prevents fake accounts**: Ensures users own the email address
2. **Reduces spam**: Makes it harder to create bulk accounts
3. **Account recovery**: Verified emails are needed for password resets
4. **Security**: Confirms user identity before granting access

### Before Production:
- [ ] Configure SMTP provider
- [ ] Verify domain (SPF/DKIM/DMARC)
- [ ] Test email delivery
- [ ] Set `SKIP_EMAIL_VERIFICATION = false`
- [ ] Test full signup flow with email verification
- [ ] Remove development alerts

## Testing Checklist

### With Workaround (Current):
- [x] User can register with email
- [x] User sees development mode alert
- [x] User can skip verification
- [x] User can create family
- [x] User can access Family Setup screen
- [x] User can add family members
- [x] User can access Home screen

### After Email Configuration:
- [ ] User receives confirmation email
- [ ] Email contains 6-digit code
- [ ] User can enter code on Verify Email screen
- [ ] User can resend code if needed
- [ ] User is redirected after verification
- [ ] User can create/join family after verification

## Support

If you encounter issues:
1. Check the console logs for error messages
2. Review `SUPABASE_EMAIL_TROUBLESHOOTING.md` for email setup
3. Verify Supabase project settings
4. Check auth logs in Supabase Dashboard

## Next Steps

1. **Immediate**: Continue testing the app with the workaround enabled
2. **Short-term**: Set up email service (SendGrid/Mailgun)
3. **Before launch**: Re-enable email verification and test thoroughly
