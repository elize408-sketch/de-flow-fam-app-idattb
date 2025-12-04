
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
}

// TEMPORARY: Skip email verification for testing
// Set to false to require email verification (production setting)
const SKIP_EMAIL_VERIFICATION = true;

// Sign up with email and password
export async function signUpWithEmail(
  email: string,
  password: string,
  name: string
): Promise<AuthResult> {
  try {
    console.log('=== Starting email signup ===');
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
      return { success: false, error: error.message };
    }

    console.log('Signup result:', {
      hasUser: !!data.user,
      hasSession: !!data.session,
      userId: data.user?.id,
    });

    // TEMPORARY WORKAROUND: Auto-confirm user for testing
    if (SKIP_EMAIL_VERIFICATION && data.user && !data.session) {
      console.log('⚠️ DEVELOPMENT MODE: Skipping email verification');
      
      // Show alert that we're skipping verification
      Alert.alert(
        '⚠️ Development Mode',
        'Email verification is temporarily disabled for testing. In production, users will need to verify their email.\n\nAttempting to sign you in...',
        [{ text: 'Continue' }]
      );

      // Try to sign in the user immediately
      try {
        console.log('Attempting auto sign-in...');
        const signInResult = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInResult.error) {
          console.error('Auto sign-in error:', signInResult.error);
          // If sign-in fails, return success but indicate verification is needed
          return { 
            success: true, 
            user: data.user, 
            session: null,
            requiresVerification: false
          };
        }

        // Successfully signed in
        console.log('✅ Auto sign-in successful, user has session');
        return { 
          success: true, 
          user: signInResult.data.user, 
          session: signInResult.data.session,
          requiresVerification: false
        };
      } catch (signInError: any) {
        console.error('Auto sign-in exception:', signInError);
        return { 
          success: true, 
          user: data.user, 
          session: null,
          requiresVerification: false
        };
      }
    }

    if (data.user && !data.session) {
      // Email confirmation required
      Alert.alert(
        'Bevestig je e-mail',
        'We hebben een bevestigingsmail gestuurd. Controleer je inbox en klik op de link om je account te activeren.',
        [{ text: 'OK' }]
      );
      
      return { 
        success: true, 
        user: data.user, 
        session: data.session,
        requiresVerification: true
      };
    }

    return { success: true, user: data.user, session: data.session };
  } catch (error: any) {
    console.error('Sign up error:', error);
    return { success: false, error: error.message || 'Er ging iets mis bij het aanmelden' };
  }
}

// Sign in with email and password
export async function signInWithEmail(
  email: string,
  password: string
): Promise<AuthResult> {
  try {
    console.log('=== Starting email sign-in ===');
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
          error: 'Je e-mailadres is nog niet bevestigd. Controleer je inbox voor de bevestigingsmail.' 
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
