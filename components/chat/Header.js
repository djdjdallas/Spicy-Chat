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
import { useNavigation, DrawerActions } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../context/ThemeContext";

export const ChatHeader = ({ onNewChat, title = "Poise" }) => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  const handleNewChat = () => {
    if (onNewChat) {
      onNewChat();
    }
  };

  return (
    <View
      style={[
        styles.header,
        {
          paddingTop: insets.top,
          backgroundColor: theme.colors.black,
          ...theme.shadows.md,
        },
      ]}
    >
      <TouchableOpacity
        onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
        style={[
          styles.menuButton,
          { backgroundColor: theme.colors.charcoal },
        ]}
        activeOpacity={0.7}
      >
        <Ionicons name="menu" size={22} color={theme.colors.pureWhite} />
      </TouchableOpacity>

      <View style={styles.titleContainer}>
        <View style={[styles.logoContainer, { backgroundColor: theme.colors.primary }]}>
          <Text style={[styles.logoText, { color: theme.colors.pureWhite }]}>P</Text>
        </View>
        <Text style={[styles.headerText, { color: theme.colors.pureWhite }, theme.typography.h3]}>
          {title}
        </Text>
      </View>

      <TouchableOpacity
        style={[
          styles.menuButton,
          { backgroundColor: theme.colors.charcoal },
        ]}
        onPress={handleNewChat}
        activeOpacity={0.7}
      >
        <Ionicons
          name="add"
          size={22}
          color={theme.colors.pureWhite}
        />
      </TouchableOpacity>
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
  },
  headerText: {
    // Typography applied via theme
  },
});

export default ChatHeader;
