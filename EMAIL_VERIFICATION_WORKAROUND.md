
# Email Verification Workaround

## Current Status

The Flow Fam app currently has email verification **enabled** in Supabase, which means:

- ✅ Users receive confirmation emails when they register
- ✅ Email links work correctly
- ⚠️ Users **cannot** log in until they verify their email

## Development Mode Workaround

To allow testing without email verification, the app includes a **development mode** flag in `utils/auth.ts`:

```typescript
const SKIP_EMAIL_VERIFICATION = true;
```

### How It Works

When `SKIP_EMAIL_VERIFICATION` is `true`:

1. **Registration Flow:**
   - User fills in registration form
   - Account is created in Supabase
   - App shows a development mode alert
   - User can proceed to family setup **without** verifying email
   - No session is created, but the user object is available

2. **Login Flow:**
   - If user tries to log in with unverified email, they see a helpful message
   - Message explains they need to verify email OR create a new account

### Important Notes

⚠️ **This is a development-only workaround**

- In production, set `SKIP_EMAIL_VERIFICATION = false`
- Users will need to verify their email before accessing the app
- This ensures security and prevents spam accounts

## Testing Instructions

### To Test Registration (Development Mode)

1. Go to "Gezin aanmaken" (Create Family)
2. Choose "Registreer met e-mail"
3. Fill in name, email, and password
4. Click "Gezin aanmaken"
5. You'll see a development mode alert
6. Click "Continue"
7. You can now proceed to family setup

### To Test Login (With Unverified Email)

1. Try to log in with an unverified email
2. You'll see an error message
3. Options:
   - Verify your email by clicking the link in your inbox
   - Or create a new account (which will skip verification in dev mode)

## Production Setup

Before deploying to production:

1. **Set the flag to false:**
   ```typescript
   const SKIP_EMAIL_VERIFICATION = false;
   ```

2. **Configure email settings in Supabase:**
   - Go to Authentication → Email Templates
   - Customize the confirmation email
   - Set up custom SMTP (optional, for branded emails)
   - Configure email rate limits

3. **Test the full flow:**
   - Register a new account
   - Check email inbox
   - Click confirmation link
   - Verify you can log in

## Troubleshooting

### "Email not confirmed" error when logging in

This is expected behavior when:
- Email verification is enabled in Supabase
- User hasn't clicked the confirmation link
- `SKIP_EMAIL_VERIFICATION` is `false`

**Solution:** Click the confirmation link in your email, or set `SKIP_EMAIL_VERIFICATION = true` for testing.

### No email received

Check:
1. Spam folder
2. Email address is correct
3. Supabase email settings are configured
4. Rate limits haven't been exceeded

### Development mode not working

Make sure:
1. `SKIP_EMAIL_VERIFICATION = true` in `utils/auth.ts`
2. You're creating a **new** account (not logging in)
3. You're using the "Registreer met e-mail" flow

## Future Improvements

Consider implementing:

- [ ] Magic link authentication (passwordless)
- [ ] Phone number verification as alternative
- [ ] Social login (Apple, Google) which bypasses email verification
- [ ] Admin panel to manually verify users
- [ ] Resend confirmation email button
