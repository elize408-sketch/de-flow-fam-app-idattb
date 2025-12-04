
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
    console.log('Email:', email);
    console.log('Skip verification:', SKIP_EMAIL_VERIFICATION);
    
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
      userEmail: data.user?.email,
    });

    // Check if user already exists (repeated signup)
    if (data.user && !data.session) {
      console.log('User created but no session - email verification required');
      
      if (SKIP_EMAIL_VERIFICATION) {
        console.log('⚠️ DEVELOPMENT MODE: Attempting to bypass email verification');
        
        // Show development mode alert
        Alert.alert(
          '⚠️ Development Mode',
          'Email verification is temporarily disabled for testing.\n\nIn production, users will need to verify their email.\n\nYou can now continue without email verification.',
          [{ text: 'Continue' }]
        );

        // Return success without session - the app will handle this
        // by allowing the user to proceed to family setup
        return { 
          success: true, 
          user: data.user, 
          session: null,
          requiresVerification: false // Skip verification in dev mode
        };
      }

      // Production mode - require email verification
      Alert.alert(
        'Bevestig je e-mail',
        'We hebben een bevestigingsmail gestuurd naar ' + email + '.\n\nControleer je inbox en klik op de link om je account te activeren.',
        [{ text: 'OK' }]
      );
      
      return { 
        success: true, 
        user: data.user, 
        session: data.session,
        requiresVerification: true
      };
    }

    // User has session - they're logged in
    if (data.session) {
      console.log('✅ User has session - fully authenticated');
      return { success: true, user: data.user, session: data.session, requiresVerification: false };
    }

    // Fallback
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
    console.log('Email:', email);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Sign-in error:', error);
      
      // Check if error is due to unconfirmed email
      if (error.message.includes('Email not confirmed')) {
        if (SKIP_EMAIL_VERIFICATION) {
          // In development mode, show a helpful message
          Alert.alert(
            '⚠️ Email Not Confirmed',
            'Your email is not confirmed yet.\n\nIn development mode, you can:\n1. Check your email and click the confirmation link\n2. Or create a new account (which will skip verification)',
            [{ text: 'OK' }]
          );
        } else {
          Alert.alert(
            'E-mail niet bevestigd',
            'Je e-mailadres is nog niet bevestigd.\n\nControleer je inbox voor de bevestigingsmail en klik op de link om je account te activeren.',
            [{ text: 'OK' }]
          );
        }
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
