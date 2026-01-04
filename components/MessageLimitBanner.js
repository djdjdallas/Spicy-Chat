// components/MessageLimitBanner.js
// Banner showing remaining messages for free users

import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../context/ThemeContext";

/**
 * Banner component showing message limits for free users
 * @param {object} props
 * @param {number} props.messagesUsed - Number of messages used today
 * @param {number} props.messagesRemaining - Number of messages remaining
 * @param {number} props.limit - Daily message limit
 * @param {boolean} props.isSubscribed - Whether user is subscribed
 * @param {function} props.onUpgrade - Callback when upgrade is pressed
 */
export const MessageLimitBanner = ({
  messagesUsed,
  messagesRemaining,
  limit,
  isSubscribed,
  onUpgrade,
}) => {
  const { theme } = useTheme();

  // Don't show for subscribed users
  if (isSubscribed) return null;

  // Determine banner state
  const isWarning = messagesRemaining <= 2 && messagesRemaining > 0;
  const isBlocked = messagesRemaining === 0;

  // Get banner style based on state
  const getBannerStyle = () => {
    if (isBlocked) {
      return {
        backgroundColor: theme.colors.errorMuted,
        borderColor: theme.colors.error,
      };
    }
    if (isWarning) {
      return {
        backgroundColor: theme.colors.warningMuted,
        borderColor: theme.colors.warning,
      };
    }
    return {
      backgroundColor: theme.colors.surfaceSecondary,
      borderColor: theme.colors.border,
    };
  };

  const getIconColor = () => {
    if (isBlocked) return theme.colors.error;
    if (isWarning) return theme.colors.warning;
    return theme.colors.textSecondary;
  };

  const getMessageText = () => {
    if (isBlocked) {
      return "You've used all messages today";
    }
    return `${messagesRemaining} of ${limit} messages remaining`;
  };

  return (
    <View style={[styles.container, getBannerStyle()]}>
      <View style={styles.content}>
        <View style={styles.leftSection}>
          <Ionicons
            name={isBlocked ? "alert-circle" : "chatbubbles-outline"}
            size={20}
            color={getIconColor()}
          />
          <Text
            style={[
              styles.text,
              { color: isBlocked ? theme.colors.error : theme.colors.textSecondary },
              theme.typography.bodySmall,
            ]}
          >
            {getMessageText()}
          </Text>
        </View>

        {(isWarning || isBlocked) && (
          <TouchableOpacity
            onPress={onUpgrade}
            activeOpacity={0.85}
            style={styles.upgradeButtonWrapper}
          >
            <LinearGradient
              colors={theme.gradients.primary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.upgradeButton, theme.shadows.glow.sm]}
            >
              <Ionicons name="diamond" size={14} color={theme.colors.pureWhite} />
              <Text
                style={[
                  styles.upgradeText,
                  { color: theme.colors.pureWhite },
                  theme.typography.buttonSmall,
                ]}
              >
                Upgrade
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>

      {/* Progress bar */}
      <View style={[styles.progressContainer, { backgroundColor: theme.colors.border }]}>
        <View
          style={[
            styles.progressBar,
            {
              backgroundColor: isBlocked
                ? theme.colors.error
                : isWarning
                ? theme.colors.warning
                : theme.colors.primary,
              width: `${(messagesUsed / limit) * 100}%`,
            },
          ]}
        />
      </View>
    </View>
  );
};

/**
 * Compact version for inline display
 */
export const MessageLimitIndicator = ({
  messagesRemaining,
  limit,
  isSubscribed,
  onUpgrade,
}) => {
  const { theme } = useTheme();

  if (isSubscribed) return null;

  const isLow = messagesRemaining <= 2;

  return (
    <TouchableOpacity
      style={[
        styles.indicator,
        {
          backgroundColor: isLow ? theme.colors.warningMuted : theme.colors.surfaceSecondary,
          borderColor: isLow ? theme.colors.warning : theme.colors.border,
        },
      ]}
      onPress={onUpgrade}
      activeOpacity={0.8}
    >
      <Ionicons
        name="chatbubbles-outline"
        size={14}
        color={isLow ? theme.colors.warning : theme.colors.textSecondary}
      />
      <Text
        style={[
          styles.indicatorText,
          { color: isLow ? theme.colors.warning : theme.colors.textSecondary },
          theme.typography.caption,
        ]}
      >
        {messagesRemaining}/{limit}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  text: {
    marginLeft: 8,
    flex: 1,
  },
  upgradeButtonWrapper: {
    borderRadius: 16,
    overflow: "hidden",
  },
  upgradeButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  upgradeText: {},
  progressContainer: {
    height: 3,
    width: "100%",
  },
  progressBar: {
    height: "100%",
  },
  // Indicator styles
  indicator: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
  },
  indicatorText: {},
});

export default MessageLimitBanner;
