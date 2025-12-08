
import { supabase } from './supabase';
import * as AppleAuthentication from 'expo-apple-authentication';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import * as Crypto from 'expo-crypto';
import { Alert, Platform } from 'react-native';

// Configure Google Sign-In
// IMPORTANT: Replace these with your actual client IDs from Google Cloud Console
GoogleSignin.configure({
  webClientId: '143b077c-c9bc-49ad-8f27-0180e47a6e1a.apps.googleusercontent.com', // Web client ID from Google Cloud Console
  iosClientId: '143b077c-c9bc-49ad-8f27-0180e47a6e1a.apps.googleusercontent.com', // iOS client ID from Google Cloud Console
  offlineAccess: true,
  forceCodeForRefreshToken: true,
});

export interface AuthResult {
  success: boolean;
  user?: any;
  session?: any;
  error?: string;
  requiresVerification?: boolean;
  isRepeatedSignup?: boolean;
  emailProviderError?: boolean;
}

// Sign up with email and password
export async function signUpWithEmail(
  email: string,
  password: string,
  name: string
): Promise<AuthResult> {
  try {
    console.log('=== signUpWithEmail START ===');
    console.log('Email:', email);
    console.log('Name:', name);
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: 'https://natively.dev/email-confirmed',
        data: {
          name,
          full_name: name,
        },
      },
    });

    if (error) {
      console.error('❌ Signup error:', error);
      
      // Check if it's an email sending error (SendGrid/SMTP issue)
      if (error.message.includes('Error sending') || 
          error.message.includes('mail') || 
          error.message.includes('535') ||
          error.message.includes('Authentication failed')) {
        return { 
          success: false, 
          emailProviderError: true,
          error: 'Er is een probleem met het versturen van de bevestigingsmail. Dit komt waarschijnlijk door een configuratieprobleem met de e-mailprovider. Neem contact op met support@flowfam.nl voor hulp.' 
        };
      }
      
      // Check for user already exists
      if (error.message.includes('already registered') || error.message.includes('already been registered')) {
        return { 
          success: false, 
          error: 'Dit e-mailadres is al geregistreerd. Probeer in te loggen of gebruik de "Wachtwoord vergeten" optie.' 
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
      identitiesCount: data.user?.identities?.length || 0,
    });

    // Check if user already exists (repeated signup)
    if (data.user && !data.session && data.user.identities && data.user.identities.length === 0) {
      console.log('⚠️ Repeated signup detected - user already exists');
      
      return { 
        success: false,
        error: 'Dit e-mailadres is al geregistreerd. Probeer in te loggen of gebruik de "Wachtwoord vergeten" optie.'
      };
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
      console.log('✅ User has session - fully authenticated (email confirmation disabled)');
      return { success: true, user: data.user, session: data.session, requiresVerification: false };
    }

    // Fallback
    console.log('=== signUpWithEmail END ===');
    return { success: true, user: data.user, session: data.session };
  } catch (error: any) {
    console.error('=== signUpWithEmail ERROR ===');
    console.error('Error:', error);
    
    // Check if it's a network error
    if (error.message && (error.message.includes('500') || error.message.includes('Network'))) {
      return { 
        success: false, 
        error: 'Er is een probleem met de server. Probeer het later opnieuw of neem contact op met support@flowfam.nl.' 
      };
    }
    
    return { success: false, error: error.message || 'Er ging iets mis bij het aanmelden' };
  }
}

// Resend verification email
export async function resendVerificationEmail(email: string): Promise<{ success: boolean; error?: string; emailProviderError?: boolean }> {
  try {
    console.log('=== resendVerificationEmail START ===');
    console.log('Email:', email);
    
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: 'https://natively.dev/email-confirmed',
      },
    });

    if (error) {
      console.error('❌ Resend error:', error);
      
      // Check if it's a SendGrid/SMTP error
      if (error.message.includes('Error sending') || 
          error.message.includes('mail') || 
          error.message.includes('535') ||
          error.message.includes('Authentication failed')) {
        return { 
          success: false,
          emailProviderError: true,
          error: 'Er is een probleem met de e-mailprovider. Neem contact op met support@flowfam.nl.' 
        };
      }
      
      return { success: false, error: error.message };
    }

    console.log('✅ Verification email resent successfully');
    console.log('=== resendVerificationEmail END ===');
    return { success: true };
  } catch (error: any) {
    console.error('=== resendVerificationEmail ERROR ===');
    console.error('Error:', error);
    return { success: false, error: error.message || 'Er ging iets mis bij het versturen van de e-mail' };
  }
}

// Sign in with email and password
export async function signInWithEmail(
  email: string,
  password: string
): Promise<AuthResult> {
  try {
    console.log('=== signInWithEmail START ===');
    console.log('Email:', email);
    console.log('Timestamp:', new Date().toISOString());
    
    console.log('[1/3] Calling supabase.auth.signInWithPassword...');
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    console.log('[2/3] Sign-in response received');
    console.log('Has error:', !!error);
    console.log('Has data:', !!data);
    console.log('Has user:', !!data?.user);
    console.log('Has session:', !!data?.session);

    if (error) {
      console.error('❌ Sign-in error:', error);
      console.error('Error message:', error.message);
      console.error('Error status:', error.status);
      
      // Check if error is due to unconfirmed email
      if (error.message.includes('Email not confirmed') || error.message.includes('not confirmed')) {
        return { 
          success: false, 
          error: 'Je e-mailadres is nog niet bevestigd. Controleer je inbox voor de bevestigingsmail.',
          requiresVerification: true
        };
      }
      
      // Check for invalid credentials
      if (error.message.includes('Invalid login credentials') || error.message.includes('Invalid')) {
        return { 
          success: false, 
          error: 'Onjuist e-mailadres of wachtwoord. Controleer je gegevens en probeer het opnieuw.' 
        };
      }
      
      return { success: false, error: error.message };
    }

    // Validate that we have both user and session
    if (!data.user || !data.session) {
      console.error('❌ Sign-in succeeded but missing user or session:', {
        hasUser: !!data.user,
        hasSession: !!data.session,
      });
      return {
        success: false,
        error: 'Er ging iets mis bij het inloggen. Probeer het opnieuw.',
      };
    }

    console.log('✅ Sign-in successful');
    console.log('[3/3] User ID:', data.user.id);
    console.log('Email confirmed:', data.user.email_confirmed_at);
    console.log('Session expires:', data.session.expires_at);
    console.log('=== signInWithEmail END ===');

    return { success: true, user: data.user, session: data.session };
  } catch (error: any) {
    console.error('=== signInWithEmail ERROR ===');
    console.error('Error:', error);
    console.error('Error stack:', error.stack);
    return { success: false, error: error.message || 'Er ging iets mis bij het inloggen' };
  }
}

// Sign in with Apple
export async function signInWithApple(): Promise<AuthResult> {
  try {
    if (Platform.OS !== 'ios') {
      return { success: false, error: 'Apple Sign-In is alleen beschikbaar op iOS' };
    }

    console.log('=== signInWithApple START ===');
    console.log('[1/3] Requesting Apple credentials...');
    
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    console.log('[2/3] Apple credential received:', {
      hasIdentityToken: !!credential.identityToken,
      hasEmail: !!credential.email,
      hasFullName: !!credential.fullName,
    });

    if (!credential.identityToken) {
      return { success: false, error: 'Geen identity token ontvangen van Apple' };
    }

    console.log('[3/3] Authenticating with Supabase...');
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'apple',
      token: credential.identityToken,
    });

    if (error) {
      console.error('❌ Supabase Apple sign-in error:', error);
      return { success: false, error: error.message };
    }

    // Validate that we have both user and session
    if (!data.user || !data.session) {
      console.error('❌ Apple sign-in succeeded but missing user or session:', {
        hasUser: !!data.user,
        hasSession: !!data.session,
      });
      return {
        success: false,
        error: 'Er ging iets mis bij het inloggen met Apple. Probeer het opnieuw.',
      };
    }

    console.log('✅ Apple sign-in successful:', {
      hasUser: !!data.user,
      hasSession: !!data.session,
      userId: data.user?.id,
    });
    console.log('=== signInWithApple END ===');

    return { success: true, user: data.user, session: data.session };
  } catch (error: any) {
    console.error('=== signInWithApple ERROR ===');
    console.error('Error:', error);
    
    if (error.code === 'ERR_REQUEST_CANCELED') {
      return { success: false, error: 'Inloggen geannuleerd' };
    }
    return { success: false, error: error.message || 'Er ging iets mis bij het inloggen met Apple' };
  }
}

// Sign in with Google
export async function signInWithGoogle(): Promise<AuthResult> {
  try {
    console.log('=== signInWithGoogle START ===');
    console.log('[1/4] Checking Play Services...');
    
    // Check if Play Services are available (Android only)
    if (Platform.OS === 'android') {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    }
    
    console.log('[2/4] Signing in with Google...');
    const userInfo = await GoogleSignin.signIn();
    
    console.log('[3/4] Google sign-in response:', {
      hasData: !!userInfo.data,
      hasIdToken: !!userInfo.data?.idToken,
      hasUser: !!userInfo.data?.user,
    });

    if (!userInfo.data?.idToken) {
      console.error('❌ No ID token in Google response');
      return { success: false, error: 'Geen ID token ontvangen van Google' };
    }

    console.log('[4/4] Authenticating with Supabase...');
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: userInfo.data.idToken,
    });

    if (error) {
      console.error('❌ Supabase Google sign-in error:', error);
      return { success: false, error: error.message };
    }

    // Validate that we have both user and session
    if (!data.user || !data.session) {
      console.error('❌ Google sign-in succeeded but missing user or session:', {
        hasUser: !!data.user,
        hasSession: !!data.session,
      });
      return {
        success: false,
        error: 'Er ging iets mis bij het inloggen met Google. Probeer het opnieuw.',
      };
    }

    console.log('✅ Google sign-in successful:', {
      hasUser: !!data.user,
      hasSession: !!data.session,
      userId: data.user?.id,
    });
    console.log('=== signInWithGoogle END ===');

    return { success: true, user: data.user, session: data.session };
  } catch (error: any) {
    console.error('=== signInWithGoogle ERROR ===');
    console.error('Error:', error);
    
    // Handle specific Google Sign-In errors
    if (error.code === 'SIGN_IN_CANCELLED') {
      return { success: false, error: 'Inloggen geannuleerd' };
    } else if (error.code === 'IN_PROGRESS') {
      return { success: false, error: 'Er is al een inlogpoging bezig' };
    } else if (error.code === 'PLAY_SERVICES_NOT_AVAILABLE') {
      return { success: false, error: 'Google Play Services niet beschikbaar' };
    }
    
    return { success: false, error: error.message || 'Er ging iets mis bij het inloggen met Google' };
  }
}

// Sign out
export async function signOut(): Promise<void> {
  try {
    console.log('=== signOut START ===');
    
    // Sign out from Google if signed in
    const isGoogleSignedIn = await GoogleSignin.isSignedIn();
    if (isGoogleSignedIn) {
      console.log('Signing out from Google...');
      await GoogleSignin.signOut();
    }
    
    // Sign out from Supabase
    console.log('Signing out from Supabase...');
    await supabase.auth.signOut();
    
    console.log('✅ Sign out successful');
    console.log('=== signOut END ===');
  } catch (error) {
    console.error('=== signOut ERROR ===');
    console.error('Error:', error);
  }
}

// Get current user
export async function getCurrentUser() {
  try {
    console.log('=== getCurrentUser START ===');
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('❌ Get user error:', error);
      return null;
    }
    
    console.log('User found:', !!user, 'ID:', user?.id);
    console.log('=== getCurrentUser END ===');
    return user;
  } catch (error) {
    console.error('=== getCurrentUser ERROR ===');
    console.error('Error:', error);
    return null;
  }
}

// Get current session
export async function getCurrentSession() {
  try {
    console.log('=== getCurrentSession START ===');
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('❌ Get session error:', error);
      return null;
    }
    
    console.log('Session found:', !!session);
    if (session) {
      console.log('Session expires:', session.expires_at);
    }
    console.log('=== getCurrentSession END ===');
    return session;
  } catch (error) {
    console.error('=== getCurrentSession ERROR ===');
    console.error('Error:', error);
    return null;
  }
}

// Check if user is authenticated
export async function isAuthenticated(): Promise<boolean> {
  const session = await getCurrentSession();
  return session !== null;
}
