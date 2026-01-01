// pages/Settings.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Switch,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../context/ThemeContext";
import {
  APP_NAME,
  APP_VERSION,
  HELP_URL,
  SUPPORT_EMAIL,
  TERMS_URL,
  PRIVACY_URL,
} from "../config/app";

const SETTINGS_STORAGE_KEY = "@poise_settings";

const Settings = () => {
  const { theme, isDark, toggleTheme } = useTheme();
  const [notifications, setNotifications] = useState(false);
  const [saveConversations, setSaveConversations] = useState(true);

  // Load saved settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        setNotifications(settings.notifications ?? false);
        setSaveConversations(settings.saveConversations ?? true);
      }
    } catch (error) {
      console.warn("Failed to load settings:", error);
    }
  };

  const saveSettings = async (key, value) => {
    try {
      const savedSettings = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
      const settings = savedSettings ? JSON.parse(savedSettings) : {};
      settings[key] = value;
      await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.warn("Failed to save settings:", error);
    }
  };

  const handleNotificationsChange = (value) => {
    setNotifications(value);
    saveSettings("notifications", value);
  };

  const handleSaveConversationsChange = (value) => {
    setSaveConversations(value);
    saveSettings("saveConversations", value);
  };

  const openLink = (url) => {
    Linking.openURL(url);
  };

  const SettingItem = ({
    icon,
    label,
    description,
    value,
    onValueChange,
    isLast = false,
  }) => (
    <View
      style={[
        styles.settingItem,
        !isLast && { borderBottomWidth: 1, borderBottomColor: theme.colors.border },
      ]}
    >
      <View style={styles.settingLeft}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: theme.colors.backgroundTertiary },
          ]}
        >
          <Ionicons name={icon} size={20} color={theme.colors.textPrimary} />
        </View>
        <View style={styles.settingInfo}>
          <Text
            style={[
              styles.settingLabel,
              { color: theme.colors.textPrimary },
              theme.typography.body,
            ]}
          >
            {label}
          </Text>
          {description && (
            <Text
              style={[
                styles.settingDescription,
                { color: theme.colors.textSecondary },
                theme.typography.caption,
              ]}
            >
              {description}
            </Text>
          )}
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{
          false: theme.colors.border,
          true: theme.colors.primary,
        }}
        thumbColor={theme.colors.pureWhite}
        ios_backgroundColor={theme.colors.border}
      />
    </View>
  );

  const LinkItem = ({ icon, label, description, onPress, isLast = false }) => (
    <TouchableOpacity
      style={[
        styles.settingItem,
        !isLast && { borderBottomWidth: 1, borderBottomColor: theme.colors.border },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.settingLeft}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: theme.colors.backgroundTertiary },
          ]}
        >
          <Ionicons name={icon} size={20} color={theme.colors.textPrimary} />
        </View>
        <View style={styles.settingInfo}>
          <Text
            style={[
              styles.settingLabel,
              { color: theme.colors.textPrimary },
              theme.typography.body,
            ]}
          >
            {label}
          </Text>
          {description && (
            <Text
              style={[
                styles.settingDescription,
                { color: theme.colors.textSecondary },
                theme.typography.caption,
              ]}
            >
              {description}
            </Text>
          )}
        </View>
      </View>
      <Ionicons
        name="chevron-forward"
        size={20}
        color={theme.colors.textTertiary}
      />
    </TouchableOpacity>
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      <Text
        style={[
          styles.heading,
          { color: theme.colors.textPrimary },
          theme.typography.h2,
        ]}
      >
        Settings
      </Text>

      {/* Preferences Section */}
      <View style={styles.section}>
        <Text
          style={[
            styles.sectionTitle,
            { color: theme.colors.textSecondary },
            theme.typography.overline,
          ]}
        >
          PREFERENCES
        </Text>
        <View
          style={[
            styles.card,
            { backgroundColor: theme.colors.surface, ...theme.shadows.sm },
          ]}
        >
          <SettingItem
            icon="moon-outline"
            label="Dark Mode"
            description="Reduce eye strain in low light"
            value={isDark}
            onValueChange={toggleTheme}
          />
          <SettingItem
            icon="notifications-outline"
            label="Push Notifications"
            description="Get updates and reminders"
            value={notifications}
            onValueChange={handleNotificationsChange}
          />
          <SettingItem
            icon="save-outline"
            label="Save Conversations"
            description="Keep your chat history"
            value={saveConversations}
            onValueChange={handleSaveConversationsChange}
            isLast
          />
        </View>
      </View>

      {/* Support Section */}
      <View style={styles.section}>
        <Text
          style={[
            styles.sectionTitle,
            { color: theme.colors.textSecondary },
            theme.typography.overline,
          ]}
        >
          SUPPORT
        </Text>
        <View
          style={[
            styles.card,
            { backgroundColor: theme.colors.surface, ...theme.shadows.sm },
          ]}
        >
          <LinkItem
            icon="help-circle-outline"
            label="Help Center"
            description="Get answers to common questions"
            onPress={() => openLink(HELP_URL)}
          />
          <LinkItem
            icon="mail-outline"
            label="Contact Support"
            description="We're here to help"
            onPress={() => openLink(`mailto:${SUPPORT_EMAIL}`)}
            isLast
          />
        </View>
      </View>

      {/* Legal Section */}
      <View style={styles.section}>
        <Text
          style={[
            styles.sectionTitle,
            { color: theme.colors.textSecondary },
            theme.typography.overline,
          ]}
        >
          LEGAL
        </Text>
        <View
          style={[
            styles.card,
            { backgroundColor: theme.colors.surface, ...theme.shadows.sm },
          ]}
        >
          <LinkItem
            icon="document-text-outline"
            label="Terms of Service"
            onPress={() => openLink(TERMS_URL)}
          />
          <LinkItem
            icon="shield-outline"
            label="Privacy Policy"
            onPress={() => openLink(PRIVACY_URL)}
            isLast
          />
        </View>
      </View>

      {/* App Info */}
      <View style={styles.appInfo}>
        <Text
          style={[
            styles.appName,
            { color: theme.colors.textSecondary },
            theme.typography.bodySmall,
          ]}
        >
          {APP_NAME}
        </Text>
        <Text
          style={[
            styles.version,
            { color: theme.colors.textTertiary },
            theme.typography.caption,
          ]}
        >
          Version {APP_VERSION}
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 48,
  },
  heading: {
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 12,
    marginLeft: 4,
    letterSpacing: 1,
  },
  card: {
    borderRadius: 16,
    overflow: "hidden",
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  settingInfo: {
    marginLeft: 12,
    flex: 1,
  },
  settingLabel: {
    // Typography applied via theme
  },
  settingDescription: {
    marginTop: 2,
  },
  appInfo: {
    alignItems: "center",
    marginTop: 16,
  },
  appName: {
    // Typography applied via theme
  },
  version: {
    marginTop: 4,
  },
});

export default Settings;
