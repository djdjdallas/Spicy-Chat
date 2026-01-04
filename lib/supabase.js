// lib/supabase.js
import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import Constants from "expo-constants";

// Get env vars from expo-constants extra (works in both dev and EAS builds)
const extra = Constants.expoConfig?.extra || Constants.manifest?.extra || {};
const supabaseUrl = extra.supabaseUrl;
const supabaseAnonKey = extra.supabaseAnonKey;

// Validate we have the required values
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase configuration. URL:", !!supabaseUrl, "Key:", !!supabaseAnonKey);
}

export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder-key",
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);
