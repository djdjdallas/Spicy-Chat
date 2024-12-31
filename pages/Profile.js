// pages/Profile.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../lib/supabase";
import ProfileEditForm from "./ProfileEditForm";
import { useTheme } from "../context/ThemeContext";

const Profile = () => {
  const { theme } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) throw userError;

      const { data: existingProfile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileError && profileError.code === "PGRST116") {
        console.log("No profile found, creating new profile...");
        const { data: newProfile, error: createError } = await supabase
          .from("profiles")
          .insert({
            id: user.id,
            full_name: user?.user_metadata?.full_name || "",
            display_name: user?.user_metadata?.full_name || "",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            is_profile_complete: false,
          })
          .select()
          .single();

        if (createError) throw createError;
        setProfile(newProfile);
      } else if (profileError) {
        throw profileError;
      } else {
        setProfile(existingProfile);
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      Alert.alert("Error", "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (isEditing) {
    return (
      <ProfileEditForm
        profile={profile}
        onSave={handleSaveProfile}
        onCancel={() => setIsEditing(false)}
      />
    );
  }

  if (!profile?.is_profile_complete) {
    return (
      <ScrollView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <View style={styles.header}>
          <Text style={[styles.heading, { color: theme.colors.primary }]}>
            My Profile
          </Text>
        </View>
        <View
          style={[
            styles.section,
            {
              backgroundColor: theme.colors.surface,
              shadowColor: theme.colors.shadow,
            },
          ]}
        >
          <Text
            style={[
              styles.incompleteMessage,
              { color: theme.colors.textSecondary },
            ]}
          >
            Please complete your profile to get the most out of RizzChat!
          </Text>
          <TouchableOpacity
            style={[
              styles.completeProfileButton,
              { backgroundColor: theme.colors.primary },
            ]}
            onPress={() => setIsEditing(true)}
          >
            <Text
              style={[
                styles.completeProfileButtonText,
                { color: theme.colors.surface },
              ]}
            >
              Complete Profile
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.header}>
        <Text style={[styles.heading, { color: theme.colors.primary }]}>
          My Profile
        </Text>
        <TouchableOpacity
          style={[
            styles.editButton,
            { backgroundColor: `${theme.colors.primary}20` },
          ]}
          onPress={() => setIsEditing(true)}
          activeOpacity={0.7}
        >
          <Ionicons name="pencil" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <View
        style={[
          styles.section,
          {
            backgroundColor: theme.colors.surface,
            shadowColor: theme.colors.shadow,
          },
        ]}
      >
        <View style={styles.profileInfo}>
          {[
            { label: "Full Name", value: profile?.full_name },
            { label: "Display Name", value: profile?.display_name },
            { label: "Bio", value: profile?.bio },
            { label: "Age", value: profile?.age },
            {
              label: "Dating Goals",
              value: profile?.relationship_goal
                ?.replace(/_/g, " ")
                .replace(/\b\w/g, (c) => c.toUpperCase()),
            },
            {
              label: "Communication Style",
              value: profile?.communication_style
                ?.replace(/_/g, " ")
                .replace(/\b\w/g, (c) => c.toUpperCase()),
            },
            { label: "Interests", value: profile?.interests?.join(", ") },
            { label: "Hobbies", value: profile?.hobbies?.join(", ") },
            { label: "Values", value: profile?.values?.join(", ") },
          ].map((item, index) => (
            <View key={index} style={styles.fieldContainer}>
              <Text
                style={[styles.label, { color: theme.colors.textSecondary }]}
              >
                {item.label}
              </Text>
              <Text style={[styles.value, { color: theme.colors.textPrimary }]}>
                {item.value || "Not set"}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
  },
  editButton: {
    padding: 8,
    borderRadius: 20,
  },
  section: {
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  profileInfo: {
    marginTop: 10,
  },
  fieldContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginTop: 10,
  },
  value: {
    fontSize: 18,
    marginTop: 5,
  },
  incompleteMessage: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  completeProfileButton: {
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  completeProfileButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default Profile;
