// pages/Profile.js
import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";

const Profile = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.heading}>My Profile</Text>
        <View style={styles.profileInfo}>
          <Text style={styles.label}>Dating Goals</Text>
          <Text style={styles.value}>Long-term relationship</Text>

          <Text style={styles.label}>Communication Style</Text>
          <Text style={styles.value}>Casual and friendly</Text>

          <Text style={styles.label}>Interests</Text>
          <Text style={styles.value}>Music, Travel, Food</Text>
        </View>
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

export default Profile;
