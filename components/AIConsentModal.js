// components/AIConsentModal.js
// Modal for AI data processing consent - shown on first message generation
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../context/ThemeContext";
import { PRIVACY_URL } from "../config/app";

const AIConsentModal = ({ visible, onConsent, onLearnMore }) => {
  const { theme } = useTheme();

  const handleLearnMore = () => {
    Linking.openURL(PRIVACY_URL);
    if (onLearnMore) {
      onLearnMore();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={[styles.overlay, { backgroundColor: theme.colors.overlay }]}>
        <View
          style={[
            styles.modalContent,
            {
              backgroundColor: theme.colors.backgroundSecondary,
              borderColor: theme.colors.border,
            },
          ]}
        >
          {/* Icon */}
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: theme.colors.shimmerLight },
            ]}
          >
            <Ionicons
              name="sparkles"
              size={32}
              color={theme.colors.primary}
            />
          </View>

          {/* Title */}
          <Text
            style={[
              styles.title,
              { color: theme.colors.textPrimary },
              theme.typography.h3,
            ]}
          >
            AI-Powered Messages
          </Text>

          {/* Body */}
          <Text
            style={[
              styles.body,
              { color: theme.colors.textSecondary },
              theme.typography.body,
            ]}
          >
            Poise uses AI technology to generate message suggestions. Your conversation context is sent to our AI providers to create personalized responses.
          </Text>

          <Text
            style={[
              styles.bodyHighlight,
              { color: theme.colors.textPrimary },
              theme.typography.body,
            ]}
          >
            Your data is never used to train AI models.
          </Text>

          <Text
            style={[
              styles.body,
              { color: theme.colors.textSecondary },
              theme.typography.body,
            ]}
          >
            Do you consent to this?
          </Text>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              onPress={onConsent}
              activeOpacity={0.85}
              style={styles.primaryButtonWrapper}
            >
              <LinearGradient
                colors={theme.gradients.primary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.primaryButton, theme.shadows.glow.sm]}
              >
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={theme.colors.pureWhite}
                  style={styles.buttonIcon}
                />
                <Text
                  style={[
                    styles.primaryButtonText,
                    { color: theme.colors.pureWhite },
                    theme.typography.button,
                  ]}
                >
                  I Consent
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleLearnMore}
              activeOpacity={0.7}
              style={[
                styles.secondaryButton,
                {
                  borderColor: theme.colors.border,
                  backgroundColor: theme.colors.surfaceSecondary,
                },
              ]}
            >
              <Ionicons
                name="information-circle-outline"
                size={20}
                color={theme.colors.textSecondary}
                style={styles.buttonIcon}
              />
              <Text
                style={[
                  styles.secondaryButtonText,
                  { color: theme.colors.textSecondary },
                  theme.typography.button,
                ]}
              >
                Learn More
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContent: {
    width: "100%",
    maxWidth: 360,
    borderRadius: 20,
    borderWidth: 1,
    padding: 28,
    alignItems: "center",
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    textAlign: "center",
    marginBottom: 16,
  },
  body: {
    textAlign: "center",
    marginBottom: 12,
  },
  bodyHighlight: {
    textAlign: "center",
    marginBottom: 12,
    fontWeight: "600",
  },
  buttonContainer: {
    width: "100%",
    marginTop: 12,
    gap: 12,
  },
  primaryButtonWrapper: {
    borderRadius: 14,
    overflow: "hidden",
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 14,
  },
  primaryButtonText: {},
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  secondaryButtonText: {},
  buttonIcon: {
    marginRight: 8,
  },
});

export default AIConsentModal;
