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
} from "react-native";
import { supabase } from "../lib/supabase";
import { useTheme } from "../context/ThemeContext";
import { APP_NAME, APP_TAGLINE } from "../config/app";

const Login = () => {
  const { theme } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password");
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
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
            <View
              style={[
                styles.logoContainer,
                { backgroundColor: theme.colors.black },
              ]}
            >
              <Text style={[styles.logoText, { color: theme.colors.pureWhite }]}>
                P
              </Text>
            </View>
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
                  { color: theme.colors.textSecondary },
                  theme.typography.caption,
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
                  },
                ]}
                placeholder="Enter your email"
                placeholderTextColor={theme.colors.textTertiary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text
                style={[
                  styles.inputLabel,
                  { color: theme.colors.textSecondary },
                  theme.typography.caption,
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
                  },
                ]}
                placeholder="Enter your password"
                placeholderTextColor={theme.colors.textTertiary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoComplete="password"
              />
            </View>

            <TouchableOpacity
              style={[
                styles.primaryButton,
                { backgroundColor: theme.colors.primary },
              ]}
              onPress={handleAuth}
              disabled={loading}
              activeOpacity={0.85}
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
            </TouchableOpacity>

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
                { color: theme.colors.textTertiary },
                theme.typography.caption,
              ]}
            >
              By continuing, you agree to our Terms of Service and Privacy Policy
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
    letterSpacing: 1,
  },
  input: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    fontSize: 16,
  },
  primaryButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
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
  footer: {
    alignItems: "center",
    paddingHorizontal: 16,
  },
  footerText: {
    textAlign: "center",
    lineHeight: 18,
  },
});

export default Login;
