// pages/Login.js
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  Linking,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../lib/supabase";
import { useTheme } from "../context/ThemeContext";
import { APP_NAME, APP_TAGLINE, TERMS_URL, PRIVACY_URL } from "../config/app";

const Login = () => {
  const { theme } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password");
      return;
    }

    // Require terms acceptance for sign up
    if (isSignUp && !termsAccepted) {
      Alert.alert(
        "Terms Required",
        "Please agree to the Terms of Service and Privacy Policy to create an account."
      );
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        const { error, data } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;

        // Store terms acceptance timestamp in profile
        if (data?.user) {
          const timestamp = new Date().toISOString();
          await supabase.from("profiles").upsert({
            id: data.user.id,
            terms_accepted_at: timestamp,
            updated_at: timestamp,
          });
        }

        Alert.alert(
          "Success",
          "Check your email for a confirmation link to complete your registration."
        );
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          {/* Logo/Brand Section */}
          <View style={styles.brandSection}>
            <LinearGradient
              colors={theme.gradients.primary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.logoContainer, theme.shadows.glow.md]}
            >
              <Text style={[styles.logoText, { color: theme.colors.pureWhite }]}>
                P
              </Text>
            </LinearGradient>
            <Text
              style={[
                styles.title,
                { color: theme.colors.textPrimary },
                theme.typography.h1,
              ]}
            >
              {APP_NAME}
            </Text>
            <Text
              style={[
                styles.subtitle,
                { color: theme.colors.textSecondary },
                theme.typography.body,
              ]}
            >
              {APP_TAGLINE}
            </Text>
          </View>

          {/* Form Section */}
          <View style={styles.formSection}>
            <View style={styles.inputContainer}>
              <Text
                style={[
                  styles.inputLabel,
                  { color: theme.colors.textMuted },
                  theme.typography.overline,
                ]}
              >
                EMAIL
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.colors.inputBackground,
                    color: theme.colors.textPrimary,
                    borderWidth: 1,
                    borderColor: emailFocused
                      ? theme.colors.inputFocusBorder
                      : theme.colors.inputBorder,
                  },
                  emailFocused && theme.shadows.glow.sm,
                ]}
                placeholder="Enter your email"
                placeholderTextColor={theme.colors.textMuted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text
                style={[
                  styles.inputLabel,
                  { color: theme.colors.textMuted },
                  theme.typography.overline,
                ]}
              >
                PASSWORD
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.colors.inputBackground,
                    color: theme.colors.textPrimary,
                    borderWidth: 1,
                    borderColor: passwordFocused
                      ? theme.colors.inputFocusBorder
                      : theme.colors.inputBorder,
                  },
                  passwordFocused && theme.shadows.glow.sm,
                ]}
                placeholder="Enter your password"
                placeholderTextColor={theme.colors.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoComplete="password"
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
              />
            </View>

            <TouchableOpacity
              onPress={handleAuth}
              disabled={loading}
              activeOpacity={0.85}
              style={styles.buttonWrapper}
            >
              <LinearGradient
                colors={theme.gradients.primary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.primaryButton, theme.shadows.glow.sm]}
              >
                {loading ? (
                  <ActivityIndicator color={theme.colors.pureWhite} />
                ) : (
                  <Text
                    style={[
                      styles.primaryButtonText,
                      { color: theme.colors.pureWhite },
                      theme.typography.button,
                    ]}
                  >
                    {isSignUp ? "Create Account" : "Sign In"}
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Terms Checkbox - Only show for sign up */}
            {isSignUp && (
              <TouchableOpacity
                style={styles.termsRow}
                onPress={() => setTermsAccepted(!termsAccepted)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.checkbox,
                    {
                      borderColor: termsAccepted
                        ? theme.colors.primary
                        : theme.colors.border,
                      backgroundColor: termsAccepted
                        ? theme.colors.primary
                        : "transparent",
                    },
                  ]}
                >
                  {termsAccepted && (
                    <Ionicons
                      name="checkmark"
                      size={14}
                      color={theme.colors.pureWhite}
                    />
                  )}
                </View>
                <Text
                  style={[
                    styles.termsText,
                    { color: theme.colors.textSecondary },
                    theme.typography.bodySmall,
                  ]}
                >
                  I agree to the{" "}
                  <Text
                    style={[styles.termsLink, { color: theme.colors.primary }]}
                    onPress={() => Linking.openURL(TERMS_URL)}
                  >
                    Terms of Service
                  </Text>
                  {" "}and{" "}
                  <Text
                    style={[styles.termsLink, { color: theme.colors.primary }]}
                    onPress={() => Linking.openURL(PRIVACY_URL)}
                  >
                    Privacy Policy
                  </Text>
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.switchButton}
              onPress={() => setIsSignUp(!isSignUp)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.switchText,
                  { color: theme.colors.textSecondary },
                  theme.typography.body,
                ]}
              >
                {isSignUp
                  ? "Already have an account? "
                  : "Don't have an account? "}
                <Text
                  style={[styles.switchTextBold, { color: theme.colors.primary }]}
                >
                  {isSignUp ? "Sign In" : "Sign Up"}
                </Text>
              </Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text
              style={[
                styles.footerText,
                { color: theme.colors.textMuted },
                theme.typography.caption,
              ]}
            >
              By continuing, you agree to our{" "}
              <Text
                style={[styles.footerLink, { color: theme.colors.primary }]}
                onPress={() => Linking.openURL(TERMS_URL)}
              >
                Terms of Service
              </Text>
              {" "}and{" "}
              <Text
                style={[styles.footerLink, { color: theme.colors.primary }]}
                onPress={() => Linking.openURL(PRIVACY_URL)}
              >
                Privacy Policy
              </Text>
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  brandSection: {
    alignItems: "center",
    marginBottom: 48,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  logoText: {
    fontSize: 40,
    fontWeight: "700",
    letterSpacing: -1,
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    textAlign: "center",
  },
  formSection: {
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    fontSize: 15,
  },
  buttonWrapper: {
    marginTop: 8,
    borderRadius: 16,
    overflow: "hidden",
  },
  primaryButton: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  primaryButtonText: {
    // Typography applied via theme
  },
  switchButton: {
    marginTop: 24,
    alignItems: "center",
  },
  switchText: {
    textAlign: "center",
  },
  switchTextBold: {
    fontWeight: "600",
  },
  termsRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 20,
    paddingHorizontal: 4,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    marginTop: 2,
  },
  termsText: {
    flex: 1,
    lineHeight: 20,
  },
  termsLink: {
    fontWeight: "600",
  },
  footer: {
    alignItems: "center",
    paddingHorizontal: 16,
  },
  footerText: {
    textAlign: "center",
    lineHeight: 18,
  },
  footerLink: {
    fontWeight: "500",
  },
});

export default Login;
