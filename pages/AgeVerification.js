// pages/AgeVerification.js
// Age verification gate shown before account creation
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../context/ThemeContext";
import { APP_NAME } from "../config/app";

const AgeVerification = ({ onVerified }) => {
  const { theme } = useTheme();
  const [isChecked, setIsChecked] = useState(false);

  const handleContinue = () => {
    if (isChecked) {
      onVerified();
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <LinearGradient
            colors={theme.gradients.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.iconContainer, theme.shadows.glow.md]}
          >
            <Ionicons
              name="shield-checkmark"
              size={40}
              color={theme.colors.pureWhite}
            />
          </LinearGradient>
          <Text
            style={[
              styles.title,
              { color: theme.colors.textPrimary },
              theme.typography.h2,
            ]}
          >
            Age Verification
          </Text>
          <Text
            style={[
              styles.subtitle,
              { color: theme.colors.textSecondary },
              theme.typography.body,
            ]}
          >
            {APP_NAME} is designed for adults only. Please confirm your age to continue.
          </Text>
        </View>

        {/* Verification Card */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.surfaceSecondary,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => setIsChecked(!isChecked)}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.checkbox,
                {
                  borderColor: isChecked
                    ? theme.colors.primary
                    : theme.colors.border,
                  backgroundColor: isChecked
                    ? theme.colors.primary
                    : "transparent",
                },
              ]}
            >
              {isChecked && (
                <Ionicons
                  name="checkmark"
                  size={18}
                  color={theme.colors.pureWhite}
                />
              )}
            </View>
            <Text
              style={[
                styles.checkboxLabel,
                { color: theme.colors.textPrimary },
                theme.typography.body,
              ]}
            >
              I confirm I am 18 years or older
            </Text>
          </TouchableOpacity>
        </View>

        {/* Continue Button */}
        <TouchableOpacity
          onPress={handleContinue}
          disabled={!isChecked}
          activeOpacity={0.85}
          style={[styles.buttonWrapper, !isChecked && styles.disabledButton]}
        >
          <LinearGradient
            colors={
              isChecked
                ? theme.gradients.primary
                : [theme.colors.border, theme.colors.border]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.continueButton, isChecked && theme.shadows.glow.sm]}
          >
            <Text
              style={[
                styles.continueButtonText,
                {
                  color: isChecked
                    ? theme.colors.pureWhite
                    : theme.colors.textMuted,
                },
                theme.typography.button,
              ]}
            >
              Continue
            </Text>
            <Ionicons
              name="arrow-forward"
              size={20}
              color={isChecked ? theme.colors.pureWhite : theme.colors.textMuted}
              style={styles.buttonIcon}
            />
          </LinearGradient>
        </TouchableOpacity>

        {/* Footer */}
        <View style={styles.footer}>
          <Text
            style={[
              styles.footerText,
              { color: theme.colors.textMuted },
              theme.typography.caption,
            ]}
          >
            By continuing, you acknowledge that this app contains content intended for adults and agree to use it responsibly.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  iconContainer: {
    width: 88,
    height: 88,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    textAlign: "center",
    paddingHorizontal: 16,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    marginBottom: 32,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  checkboxLabel: {
    flex: 1,
  },
  buttonWrapper: {
    borderRadius: 16,
    overflow: "hidden",
  },
  disabledButton: {
    opacity: 0.6,
  },
  continueButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 16,
  },
  continueButtonText: {},
  buttonIcon: {
    marginLeft: 8,
  },
  footer: {
    marginTop: 32,
    alignItems: "center",
    paddingHorizontal: 16,
  },
  footerText: {
    textAlign: "center",
    lineHeight: 18,
  },
});

export default AgeVerification;
