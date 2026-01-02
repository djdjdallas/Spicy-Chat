// hooks/useOnboarding.js
import { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ONBOARDING_KEY = "@poise_onboarding_complete";
const ONBOARDING_STEP_KEY = "@poise_onboarding_step";

export const ONBOARDING_STEPS = {
  CAROUSEL: "carousel",
  PROFILE: "profile",
  PARTNER: "partner",
  COMPLETE: "complete",
};

export function useOnboarding() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [currentStep, setCurrentStep] = useState(ONBOARDING_STEPS.CAROUSEL);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = useCallback(async () => {
    try {
      const [completed, step] = await Promise.all([
        AsyncStorage.getItem(ONBOARDING_KEY),
        AsyncStorage.getItem(ONBOARDING_STEP_KEY),
      ]);

      setHasCompletedOnboarding(completed === "true");
      if (step) {
        setCurrentStep(step);
      }
    } catch (error) {
      if (__DEV__) {
        console.error("Error checking onboarding status:", error);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const completeCarousel = useCallback(async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_STEP_KEY, ONBOARDING_STEPS.PROFILE);
      setCurrentStep(ONBOARDING_STEPS.PROFILE);
    } catch (error) {
      if (__DEV__) {
        console.error("Error completing carousel:", error);
      }
    }
  }, []);

  const completeProfile = useCallback(async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_STEP_KEY, ONBOARDING_STEPS.PARTNER);
      setCurrentStep(ONBOARDING_STEPS.PARTNER);
    } catch (error) {
      if (__DEV__) {
        console.error("Error completing profile step:", error);
      }
    }
  }, []);

  const completePartner = useCallback(async () => {
    try {
      await Promise.all([
        AsyncStorage.setItem(ONBOARDING_KEY, "true"),
        AsyncStorage.setItem(ONBOARDING_STEP_KEY, ONBOARDING_STEPS.COMPLETE),
      ]);
      setCurrentStep(ONBOARDING_STEPS.COMPLETE);
      setHasCompletedOnboarding(true);
    } catch (error) {
      if (__DEV__) {
        console.error("Error completing partner step:", error);
      }
    }
  }, []);

  const completeOnboarding = useCallback(async () => {
    try {
      await Promise.all([
        AsyncStorage.setItem(ONBOARDING_KEY, "true"),
        AsyncStorage.setItem(ONBOARDING_STEP_KEY, ONBOARDING_STEPS.COMPLETE),
      ]);
      setHasCompletedOnboarding(true);
      setCurrentStep(ONBOARDING_STEPS.COMPLETE);
    } catch (error) {
      if (__DEV__) {
        console.error("Error completing onboarding:", error);
      }
    }
  }, []);

  const resetOnboarding = useCallback(async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem(ONBOARDING_KEY),
        AsyncStorage.removeItem(ONBOARDING_STEP_KEY),
      ]);
      setHasCompletedOnboarding(false);
      setCurrentStep(ONBOARDING_STEPS.CAROUSEL);
    } catch (error) {
      if (__DEV__) {
        console.error("Error resetting onboarding:", error);
      }
    }
  }, []);

  return {
    isLoading,
    hasCompletedOnboarding,
    currentStep,
    completeCarousel,
    completeProfile,
    completePartner,
    completeOnboarding,
    resetOnboarding,
  };
}

export default useOnboarding;
