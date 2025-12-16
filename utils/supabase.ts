import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * 🔐 Supabase config via EXPO_PUBLIC env vars
 * Werkt correct in:
 * - local dev
 * - preview builds
 * - TestFlight / App Store
 */
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

/**
 * 🧪 Debug alleen in DEV
 */
if (__DEV__) {
  console.log("🧪 Supabase ENV check", {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseAnonKey,
  });
}

/**
 * ❌ Hard fail als env ontbreekt
 * (voorkomt vage login errors)
 */
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "❌ Supabase environment variables missing. Check EXPO_PUBLIC_SUPABASE_URL & EXPO_PUBLIC_SUPABASE_ANON_KEY"
  );
}

/**
 * ✅ Supabase client
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
