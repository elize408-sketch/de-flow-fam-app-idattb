import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

const extra =
  Constants.expoConfig?.extra ??
  Constants.manifest?.extra;

const supabaseUrl = extra?.SUPABASE_URL;
const supabaseAnonKey = extra?.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("❌ Supabase env vars missing", {
    supabaseUrl,
    supabaseAnonKey,
  });
}

export const supabase = createClient(supabaseUrl!, supabaseAnonKey!, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
