// hooks/useCompliance.js
// Manages age verification, terms acceptance, and AI consent states
import { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "../lib/supabase";

const AGE_VERIFIED_KEY = "@poise_age_verified";
const TERMS_ACCEPTED_KEY = "@poise_terms_accepted";
const AI_CONSENT_KEY = "@poise_ai_consent";

export function useCompliance() {
  const [isLoading, setIsLoading] = useState(true);
  const [ageVerified, setAgeVerified] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [aiConsentGiven, setAiConsentGiven] = useState(false);

  useEffect(() => {
    loadComplianceStatus();
  }, []);

  const loadComplianceStatus = useCallback(async () => {
    try {
      const [ageStatus, termsStatus, aiStatus] = await Promise.all([
        AsyncStorage.getItem(AGE_VERIFIED_KEY),
        AsyncStorage.getItem(TERMS_ACCEPTED_KEY),
        AsyncStorage.getItem(AI_CONSENT_KEY),
      ]);

      setAgeVerified(ageStatus === "true");
      setTermsAccepted(termsStatus === "true");
      setAiConsentGiven(aiStatus === "true");
    } catch (error) {
      if (__DEV__) {
        console.error("Error loading compliance status:", error);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const confirmAge = useCallback(async () => {
    try {
      await AsyncStorage.setItem(AGE_VERIFIED_KEY, "true");
      setAgeVerified(true);

      // Also update Supabase profile if user is logged in
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from("profiles")
          .upsert({
            id: user.id,
            age_verified: true,
            updated_at: new Date().toISOString(),
          });
      }

      return true;
    } catch (error) {
      if (__DEV__) {
        console.error("Error confirming age:", error);
      }
      return false;
    }
  }, []);

  const acceptTerms = useCallback(async () => {
    try {
      const timestamp = new Date().toISOString();
      await AsyncStorage.setItem(TERMS_ACCEPTED_KEY, "true");
      setTermsAccepted(true);

      // Also update Supabase profile if user is logged in
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from("profiles")
          .upsert({
            id: user.id,
            terms_accepted_at: timestamp,
            updated_at: timestamp,
          });
      }

      return true;
    } catch (error) {
      if (__DEV__) {
        console.error("Error accepting terms:", error);
      }
      return false;
    }
  }, []);

  const giveAiConsent = useCallback(async () => {
    try {
      const timestamp = new Date().toISOString();
      await AsyncStorage.setItem(AI_CONSENT_KEY, "true");
      setAiConsentGiven(true);

      // Also update Supabase profile if user is logged in
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from("profiles")
          .upsert({
            id: user.id,
            ai_consent_given: true,
            ai_consent_given_at: timestamp,
            updated_at: timestamp,
          });
      }

      return true;
    } catch (error) {
      if (__DEV__) {
        console.error("Error giving AI consent:", error);
      }
      return false;
    }
  }, []);

  // Sync local state with Supabase profile on login
  const syncWithProfile = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("age_verified, terms_accepted_at, ai_consent_given")
        .eq("id", user.id)
        .single();

      if (profile) {
        if (profile.age_verified) {
          await AsyncStorage.setItem(AGE_VERIFIED_KEY, "true");
          setAgeVerified(true);
        }
        if (profile.terms_accepted_at) {
          await AsyncStorage.setItem(TERMS_ACCEPTED_KEY, "true");
          setTermsAccepted(true);
        }
        if (profile.ai_consent_given) {
          await AsyncStorage.setItem(AI_CONSENT_KEY, "true");
          setAiConsentGiven(true);
        }
      }
    } catch (error) {
      if (__DEV__) {
        console.error("Error syncing compliance with profile:", error);
      }
    }
  }, []);

  const resetCompliance = useCallback(async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem(AGE_VERIFIED_KEY),
        AsyncStorage.removeItem(TERMS_ACCEPTED_KEY),
        AsyncStorage.removeItem(AI_CONSENT_KEY),
      ]);
      setAgeVerified(false);
      setTermsAccepted(false);
      setAiConsentGiven(false);
    } catch (error) {
      if (__DEV__) {
        console.error("Error resetting compliance:", error);
      }
    }
  }, []);

  return {
    isLoading,
    ageVerified,
    termsAccepted,
    aiConsentGiven,
    confirmAge,
    acceptTerms,
    giveAiConsent,
    syncWithProfile,
    resetCompliance,
  };
}

export default useCompliance;
