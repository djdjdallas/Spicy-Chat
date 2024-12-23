// pages/Tips.js
import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";

const Tips = () => {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>Conversation Tips</Text>
      <View style={styles.tipCard}>
        <Text style={styles.tipTitle}>Active Listening</Text>
        <Text style={styles.tipContent}>
          Show genuine interest by asking follow-up questions and remembering
          details.
        </Text>
      </View>
      <View style={styles.tipCard}>
        <Text style={styles.tipTitle}>Be Authentic</Text>
        <Text style={styles.tipContent}>
          Stay true to yourself while maintaining respectful communication.
        </Text>
      </View>
    </ScrollView>
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

export default Tips;
