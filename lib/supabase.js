// lib/supabase.js
import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ibrmrnfgrvazcpeyjiby.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlicm1ybmZncnZhemNwZXlqaWJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ3MTk1MjksImV4cCI6MjA1MDI5NTUyOX0.e47kii6an1-lkLk9N9OKAZ8gipIT9pGaDkP87B11k1w";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
