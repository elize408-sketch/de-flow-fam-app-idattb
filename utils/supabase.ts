import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { Alert } from "react-native";

/**
 * 1️⃣ Lees extra config uit Expo
 * (werkt voor dev, preview én TestFlight)
 */
const extra =
  Constants.expoConfig?.extra ??
  Constants.manifest?.extra ??
  (Constants as any).manifest2?.extra;

/**
 * 2️⃣ Debug popup – dit MOET je zien in de app
 */
Alert.alert(
  "Supabase config check",
  `hasUrl: ${!!extra?.SUPABASE_URL}
hasKey: ${!!extra?.SUPABASE_ANON_KEY}
url: ${extra?.SUPABASE_URL ?? "MISSING"}`
);

/**
 * 3️⃣ Haal Supabase keys op
 */
const supabaseUrl = extra?.SUPABASE_URL;
const supabaseAnonKey = extra?.SUPABASE_ANON_KEY;

/**
 * 4️⃣ Extra console warning (voor zekerheid)
 */
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("❌ Supabase env vars missing", {
    supabaseUrl,
    supabaseAnonKey,
  });
}

/**
 * 5️⃣ Maak Supabase client aan
 */
export const supabase = createClient(supabaseUrl!, supabaseAnonKey!, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
