// pages/Settings.js
import React from "react";
import { View, Text, Switch, StyleSheet } from "react-native";

const Settings = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Settings</Text>
      <View style={styles.settingItem}>
        <Text style={styles.settingLabel}>Push Notifications</Text>
        <Switch />
      </View>
      <View style={styles.settingItem}>
        <Text style={styles.settingLabel}>Dark Mode</Text>
        <Switch />
      </View>
      <View style={styles.settingItem}>
        <Text style={styles.settingLabel}>Save Conversations</Text>
        <Switch />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 15,
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0084ff",
    marginBottom: 20,
  },
  section: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  profileInfo: {
    marginTop: 10,
  },
  label: {
    fontSize: 16,
    color: "#666",
    marginTop: 10,
  },
  value: {
    fontSize: 18,
    color: "#333",
    marginTop: 5,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  settingLabel: {
    fontSize: 16,
    color: "#333",
  },
  conversationItem: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  date: {
    fontSize: 14,
    color: "#666",
  },
  preview: {
    fontSize: 16,
    color: "#333",
    marginTop: 5,
  },
  tipCard: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  tipTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0084ff",
    marginBottom: 10,
  },
  tipContent: {
    fontSize: 16,
    color: "#333",
    lineHeight: 24,
  },
});

export default Settings;
