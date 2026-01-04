// components/chat/Header.js
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../../context/ThemeContext";

export const ChatHeader = ({ onNewChat, title = "Poise" }) => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();

  const handleNewChat = () => {
    if (onNewChat) {
      onNewChat();
    }
  };

  const handleScreenshotAnalysis = () => {
    navigation.navigate("ScreenshotAnalysis");
  };

  const handleHistory = () => {
    navigation.navigate("History");
  };

  return (
    <View
      style={[
        styles.header,
        {
          paddingTop: insets.top,
          backgroundColor: isDark
            ? theme.colors.headerBackground
            : theme.colors.background,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border,
        },
      ]}
    >
      {/* History button */}
      <TouchableOpacity
        onPress={handleHistory}
        style={[
          styles.menuButton,
          {
            backgroundColor: theme.colors.glassHeavy,
            borderWidth: 1,
            borderColor: theme.colors.borderLight,
          },
        ]}
        activeOpacity={0.7}
      >
        <Ionicons name="time-outline" size={22} color={theme.colors.textPrimary} />
      </TouchableOpacity>

      {/* Logo and title */}
      <View style={styles.titleContainer}>
        <LinearGradient
          colors={theme.gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.logoContainer, theme.shadows.glow.sm]}
        >
          <Text style={styles.logoText}>P</Text>
        </LinearGradient>
        <Text
          style={[
            styles.headerText,
            { color: theme.colors.textPrimary },
            theme.typography.h3,
          ]}
        >
          {title}
        </Text>
      </View>

      {/* Right action buttons */}
      <View style={styles.rightButtons}>
        <TouchableOpacity
          style={[
            styles.menuButton,
            {
              backgroundColor: theme.colors.glassHeavy,
              borderWidth: 1,
              borderColor: theme.colors.borderLight,
            },
          ]}
          onPress={handleScreenshotAnalysis}
          activeOpacity={0.7}
        >
          <Ionicons name="camera" size={20} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.menuButton,
            {
              backgroundColor: theme.colors.shimmer,
              borderWidth: 1,
              borderColor: theme.colors.primary,
            },
          ]}
          onPress={handleNewChat}
          activeOpacity={0.7}
        >
          <Ionicons name="add" size={22} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 16,
    zIndex: 1000,
  },
  menuButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
  },
  rightButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  logoContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  logoText: {
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: -0.5,
    color: "#FFFFFF",
  },
  headerText: {
    // Typography applied via theme
  },
});

export default ChatHeader;
