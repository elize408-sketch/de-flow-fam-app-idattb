
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = 'https://iykrwfgfdpnlfmdexrpr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5a3J3ZmdmZHBubGZtZGV4cnByIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwNTA4ODIsImV4cCI6MjA3OTYyNjg4Mn0.e2KS_hzDwXb-oGPQW7tC6g70Wo5CDMVb61gGVqPiYTI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
