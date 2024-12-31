// pages/Settings.js
import React, { useState } from "react";
import {
  View,
  Text,
  Switch,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useTheme } from "../context/ThemeContext";

const Settings = () => {
  const { theme, isDark, toggleTheme } = useTheme();
  const [notifications, setNotifications] = useState(false);
  const [saveConversations, setSaveConversations] = useState(true);

  if (!theme) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF0000" />
      </View>
    );
  }

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Text style={[styles.heading, { color: theme.colors.primary }]}>
        Settings
      </Text>

      <View
        style={[
          styles.section,
          {
            backgroundColor: theme.colors.surface,
            shadowColor: theme.colors.shadow,
          },
        ]}
      >
        <View
          style={[
            styles.settingItem,
            { borderBottomColor: theme.colors.border },
          ]}
        >
          <Text
            style={[styles.settingLabel, { color: theme.colors.textPrimary }]}
          >
            Push Notifications
          </Text>
          <Switch
            value={notifications}
            onValueChange={setNotifications}
            trackColor={{
              false: theme.colors.border,
              true: theme.colors.primary,
            }}
            thumbColor={
              notifications ? theme.colors.surface : theme.colors.surface
            }
          />
        </View>

        <View
          style={[
            styles.settingItem,
            { borderBottomColor: theme.colors.border },
          ]}
        >
          <Text
            style={[styles.settingLabel, { color: theme.colors.textPrimary }]}
          >
            Dark Mode
          </Text>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{
              false: theme.colors.border,
              true: theme.colors.primary,
            }}
            thumbColor={isDark ? theme.colors.surface : theme.colors.surface}
          />
        </View>

        <View style={styles.settingItem}>
          <Text
            style={[styles.settingLabel, { color: theme.colors.textPrimary }]}
          >
            Save Conversations
          </Text>
          <Switch
            value={saveConversations}
            onValueChange={setSaveConversations}
            trackColor={{
              false: theme.colors.border,
              true: theme.colors.primary,
            }}
            thumbColor={
              saveConversations ? theme.colors.surface : theme.colors.surface
            }
          />
        </View>
      </View>

      <View
        style={[
          styles.section,
          {
            backgroundColor: theme.colors.surface,
            shadowColor: theme.colors.shadow,
            marginTop: 20,
          },
        ]}
      >
        <Text
          style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}
        >
          App Information
        </Text>
        <View
          style={[
            styles.settingItem,
            { borderBottomColor: theme.colors.border },
          ]}
        >
          <Text
            style={[styles.settingLabel, { color: theme.colors.textPrimary }]}
          >
            Version
          </Text>
          <Text
            style={[styles.settingValue, { color: theme.colors.textSecondary }]}
          >
            1.0.0
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  section: {
    borderRadius: 12,
    marginBottom: 8,
    elevation: 2,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    padding: 16,
    borderBottomWidth: 1,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  settingLabel: {
    fontSize: 16,
  },
  settingValue: {
    fontSize: 16,
  },
});

export default Settings;
