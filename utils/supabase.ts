import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

/**
 * 1️⃣ Lees extra config uit Expo
 * (werkt voor dev, preview én TestFlight)
 */
const extra =
  Constants.expoConfig?.extra ??
  Constants.manifest?.extra ??
  (Constants as any).manifest2?.extra;

/**
 * 2️⃣ Haal Supabase keys op
 */
const supabaseUrl = extra?.SUPABASE_URL;
const supabaseAnonKey = extra?.SUPABASE_ANON_KEY;

/**
 * 3️⃣ Alleen debug logging in DEV (geen popup!)
 */
if (__DEV__) {
  console.log("🧪 Supabase config check", {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseAnonKey,
    url: supabaseUrl,
  });
}

/**
 * 4️⃣ Veiligheidscheck
 */
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ Supabase env vars missing", {
    supabaseUrl,
    supabaseAnonKey,
  });
  throw new Error("Supabase environment variables are missing");
}

/**
 * 5️⃣ Maak Supabase client aan
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
