// utils/auth.ts
import { supabase } from "./supabase";
import type { Session, User } from "@supabase/supabase-js";
import * as AppleAuthentication from "expo-apple-authentication";
import { GoogleSignin } from "@react-native-google-signin/google-signin";

export type AuthResult = {
  success: boolean;
  user?: User | null;
  session?: Session | null;
  error?: string;
  requiresVerification?: boolean;
};

function toErrorMessage(err: unknown): string {
  if (!err) return "Onbekende fout";
  if (typeof err === "string") return err;
  if (err instanceof Error) return err.message;
  try {
    return JSON.stringify(err);
  } catch {
    return "Onbekende fout";
  }
}

function isEmailNotConfirmedMessage(msg: string) {
  const m = (msg || "").toLowerCase();
  return (
    m.includes("email not confirmed") ||
    m.includes("email_not_confirmed") ||
    m.includes("not confirmed") ||
    m.includes("email is not confirmed")
  );
}

/**
 * Email + password login
 */
export async function signInWithEmail(
  email: string,
  password: string
): Promise<AuthResult> {
  console.log("=== signInWithEmail START ===", { email });

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      const msg = error.message || "Inloggen mislukt";
      console.error("❌ signInWithEmail error:", error);

      return {
        success: false,
        error: msg,
        requiresVerification: isEmailNotConfirmedMessage(msg),
        user: null,
        session: null,
      };
    }

    console.log("✅ signInWithEmail OK", {
      hasUser: !!data.user,
      hasSession: !!data.session,
      userId: data.user?.id,
    });

    return {
      success: true,
      user: data.user,
      session: data.session,
    };
  } catch (e) {
    console.error("❌ signInWithEmail exception:", e);
    return { success: false, error: toErrorMessage(e), user: null, session: null };
  } finally {
    console.log("=== signInWithEmail END ===");
  }
}

/**
 * Apple login (iOS only)
 * Uses Supabase "Sign in with ID Token" flow.
 */
export async function signInWithApple(): Promise<AuthResult> {
  console.log("=== signInWithApple START ===");

  try {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    const identityToken = credential.identityToken;

    if (!identityToken) {
      console.error("❌ Apple: missing identityToken");
      return {
        success: false,
        error: "Apple login gaf geen identity token terug.",
        user: null,
        session: null,
      };
    }

    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: "apple",
      token: identityToken,
    });

    if (error) {
      console.error("❌ Supabase Apple signInWithIdToken error:", error);
      return {
        success: false,
        error: error.message || "Inloggen met Apple mislukt",
        user: null,
        session: null,
      };
    }

    console.log("✅ signInWithApple OK", {
      hasUser: !!data.user,
      hasSession: !!data.session,
      userId: data.user?.id,
    });

    return {
      success: true,
      user: data.user,
      session: data.session,
    };
  } catch (e) {
    // Belangrijk: Apple cancel is geen echte error
    const msg = toErrorMessage(e);
    console.error("❌ signInWithApple exception:", e);

    // expo-apple-authentication cancellation check
    if (msg.toLowerCase().includes("canceled") || msg.toLowerCase().includes("cancelled")) {
      return { success: false, error: "Apple login geannuleerd.", user: null, session: null };
    }

    return { success: false, error: msg, user: null, session: null };
  } finally {
    console.log("=== signInWithApple END ===");
  }
}

/**
 * Google login
 * IMPORTANT: GoogleSignin.configure() must be set somewhere at app start
 * (often in app/_layout.tsx or a startup file).
 */
export async function signInWithGoogle(): Promise<AuthResult> {
  console.log("=== signInWithGoogle START ===");

  try {
    // If you haven't configured GoogleSignin yet, do it once on app start.
    // Example (do NOT do it repeatedly here):
    // GoogleSignin.configure({
    //   webClientId: "YOUR_WEB_CLIENT_ID.apps.googleusercontent.com",
    //   iosClientId: "YOUR_IOS_CLIENT_ID.apps.googleusercontent.com",
    // });

    await GoogleSignin.hasPlayServices?.({ showPlayServicesUpdateDialog: true }).catch(() => {
      // iOS has no Play Services - ignore
    });

    const userInfo = await GoogleSignin.signIn();
    const idToken = userInfo?.data?.idToken ?? (userInfo as any)?.idToken;

    if (!idToken) {
      console.error("❌ Google: missing idToken", userInfo);
      return {
        success: false,
        error: "Google login gaf geen idToken terug.",
        user: null,
        session: null,
      };
    }

    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: "google",
      token: idToken,
    });

    if (error) {
      console.error("❌ Supabase Google signInWithIdToken error:", error);
      return {
        success: false,
        error: error.message || "Inloggen met Google mislukt",
        user: null,
        session: null,
      };
    }

    console.log("✅ signInWithGoogle OK", {
      hasUser: !!data.user,
      hasSession: !!data.session,
      userId: data.user?.id,
    });

    return {
      success: true,
      user: data.user,
      session: data.session,
    };
  } catch (e) {
    console.error("❌ signInWithGoogle exception:", e);
    return { success: false, error: toErrorMessage(e), user: null, session: null };
  } finally {
    console.log("=== signInWithGoogle END ===");
  }
}

// --- Helpers you already had (kept, but tightened) ---

export async function getCurrentUser(): Promise<User | null> {
  try {
    console.log("=== getCurrentUser START ===");
    const { data, error } = await supabase.auth.getUser();

    if (error) {
      console.error("❌ Error getting current user:", error);
      return null;
    }

    console.log("✅ Current user:", data.user?.id);
    console.log("=== getCurrentUser END ===");
    return data.user;
  } catch (error) {
    console.error("=== getCurrentUser ERROR ===", error);
    return null;
  }
}

export async function getCurrentSession(): Promise<Session | null> {
  try {
    console.log("=== getCurrentSession START ===");
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      console.error("❌ Error getting current session:", error);
      return null;
    }

    console.log("✅ Current session exists:", !!data.session);
    console.log("=== getCurrentSession END ===");
    return data.session;
  } catch (error) {
    console.error("=== getCurrentSession ERROR ===", error);
    return null;
  }
}

export async function signOut(): Promise<void> {
  try {
    console.log("=== signOut START ===");
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    console.log("✅ Signed out successfully");
    console.log("=== signOut END ===");
  } catch (error) {
    console.error("=== signOut ERROR ===", error);
    throw error;
  }
}
