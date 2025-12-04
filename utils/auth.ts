
import { supabase } from './supabase';
import * as AppleAuthentication from 'expo-apple-authentication';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import * as Crypto from 'expo-crypto';
import { Alert, Platform } from 'react-native';

// Configure Google Sign-In
GoogleSignin.configure({
  webClientId: 'YOUR_WEB_CLIENT_ID', // Replace with your actual web client ID from Google Cloud Console
  iosClientId: 'YOUR_IOS_CLIENT_ID', // Replace with your actual iOS client ID
});

export interface AuthResult {
  success: boolean;
  user?: any;
  session?: any;
  error?: string;
  requiresVerification?: boolean;
  isRepeatedSignup?: boolean;
}

// Sign up with email and password
export async function signUpWithEmail(
  email: string,
  password: string,
  name: string
): Promise<AuthResult> {
  try {
    console.log('=== Starting email signup ===');
    console.log('Email:', email);
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: 'https://natively.dev/email-confirmed',
        data: {
          name,
        },
      },
    });

    if (error) {
      console.error('Signup error:', error);
      
      // Check if it's an email sending error (SendGrid issue)
      if (error.message.includes('Error sending') || error.message.includes('mail')) {
        return { 
          success: false, 
          error: 'Er is een probleem met het versturen van de bevestigingsmail. Dit komt waarschijnlijk door een configuratieprobleem met de e-mailprovider. Neem contact op met support@flowfam.nl voor hulp.' 
        };
      }
      
      return { success: false, error: error.message };
    }

    console.log('Signup result:', {
      hasUser: !!data.user,
      hasSession: !!data.session,
      userId: data.user?.id,
      userEmail: data.user?.email,
      emailConfirmedAt: data.user?.email_confirmed_at,
    });

    // Check if user already exists (repeated signup)
    if (data.user && !data.session && data.user.identities && data.user.identities.length === 0) {
      console.log('⚠️ Repeated signup detected - user already exists');
      
      // Try to resend the confirmation email
      console.log('Attempting to resend confirmation email...');
      const resendResult = await resendVerificationEmail(email);
      
      if (resendResult.success) {
        return { 
          success: true, 
          user: data.user, 
          session: null,
          requiresVerification: true,
          isRepeatedSignup: true
        };
      } else {
        // Resend failed, but still allow user to proceed to verification screen
        console.warn('Resend failed:', resendResult.error);
        return { 
          success: true, 
          user: data.user, 
          session: null,
          requiresVerification: true,
          isRepeatedSignup: true
        };
      }
    }

    // Check if user needs email verification
    if (data.user && !data.session) {
      console.log('User created but no session - email verification required');
      
      // Email verification is required
      return { 
        success: true, 
        user: data.user, 
        session: null,
        requiresVerification: true
      };
    }

    // User has session - they're logged in (auto-confirm is enabled)
    if (data.session) {
      console.log('✅ User has session - fully authenticated');
      return { success: true, user: data.user, session: data.session, requiresVerification: false };
    }

    // Fallback
    return { success: true, user: data.user, session: data.session };
  } catch (error: any) {
    console.error('Sign up error:', error);
    
    // Check if it's a network error
    if (error.message && error.message.includes('500')) {
      return { 
        success: false, 
        error: 'Er is een probleem met de server. Probeer het later opnieuw of neem contact op met support@flowfam.nl.' 
      };
    }
    
    return { success: false, error: error.message || 'Er ging iets mis bij het aanmelden' };
  }
}

// Resend verification email
export async function resendVerificationEmail(email: string): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('Resending verification email to:', email);
    
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: 'https://natively.dev/email-confirmed',
      },
    });

    if (error) {
      console.error('Resend error:', error);
      
      // Check if it's a SendGrid error
      if (error.message.includes('Error sending') || error.message.includes('mail') || error.message.includes('535')) {
        return { 
          success: false, 
          error: 'Er is een probleem met de e-mailprovider. Neem contact op met support@flowfam.nl.' 
        };
      }
      
      return { success: false, error: error.message };
    }

    console.log('✅ Verification email resent successfully');
    return { success: true };
  } catch (error: any) {
    console.error('Resend error:', error);
    return { success: false, error: error.message || 'Er ging iets mis bij het versturen van de e-mail' };
  }
}

// Sign in with email and password
export async function signInWithEmail(
  email: string,
  password: string
): Promise<AuthResult> {
  try {
    console.log('=== Starting email sign-in ===');
    console.log('Email:', email);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Sign-in error:', error);
      
      // Check if error is due to unconfirmed email
      if (error.message.includes('Email not confirmed')) {
        return { 
          success: false, 
          error: 'Je e-mailadres is nog niet bevestigd. Controleer je inbox voor de bevestigingsmail.',
          requiresVerification: true
        };
      }
      
      return { success: false, error: error.message };
    }

    console.log('Sign-in successful:', {
      hasUser: !!data.user,
      hasSession: !!data.session,
      userId: data.user?.id,
    });

    return { success: true, user: data.user, session: data.session };
  } catch (error: any) {
    console.error('Sign in error:', error);
    return { success: false, error: error.message || 'Er ging iets mis bij het inloggen' };
  }
}

// Sign in with Apple
export async function signInWithApple(): Promise<AuthResult> {
  try {
    if (Platform.OS !== 'ios') {
      return { success: false, error: 'Apple Sign-In is alleen beschikbaar op iOS' };
    }

    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    if (!credential.identityToken) {
      return { success: false, error: 'Geen identity token ontvangen van Apple' };
    }

    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'apple',
      token: credential.identityToken,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, user: data.user, session: data.session };
  } catch (error: any) {
    console.error('Apple sign in error:', error);
    if (error.code === 'ERR_REQUEST_CANCELED') {
      return { success: false, error: 'Inloggen geannuleerd' };
    }
    return { success: false, error: error.message || 'Er ging iets mis bij het inloggen met Apple' };
  }
}

// Sign in with Google
export async function signInWithGoogle(): Promise<AuthResult> {
  try {
    await GoogleSignin.hasPlayServices();
    const userInfo = await GoogleSignin.signIn();

    if (!userInfo.data?.idToken) {
      return { success: false, error: 'Geen ID token ontvangen van Google' };
    }

    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: userInfo.data.idToken,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, user: data.user, session: data.session };
  } catch (error: any) {
    console.error('Google sign in error:', error);
    if (error.code === 'SIGN_IN_CANCELLED') {
      return { success: false, error: 'Inloggen geannuleerd' };
    }
    return { success: false, error: error.message || 'Er ging iets mis bij het inloggen met Google' };
  }
}

// Sign out
export async function signOut(): Promise<void> {
  try {
    await supabase.auth.signOut();
  } catch (error) {
    console.error('Sign out error:', error);
  }
}

// Get current user
export async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
      console.error('Get user error:', error);
      return null;
    }
    return user;
  } catch (error) {
    console.error('Get user error:', error);
    return null;
  }
}

// Get current session
export async function getCurrentSession() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Get session error:', error);
      return null;
    }
    return session;
  } catch (error) {
    console.error('Get session error:', error);
    return null;
  }
}

// Check if user is authenticated
export async function isAuthenticated(): Promise<boolean> {
  const session = await getCurrentSession();
  return session !== null;
}
