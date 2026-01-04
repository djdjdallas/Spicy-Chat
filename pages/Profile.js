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
import { LinearGradient } from "expo-linear-gradient";
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

  const handleSaveProfile = async (updatedProfile) => {
    try {
      setLoading(true);
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) throw userError;

      const { error } = await supabase
        .from("profiles")
        .update({
          ...updatedProfile,
          updated_at: new Date().toISOString(),
          is_profile_complete: true,
        })
        .eq("id", user.id);

      if (error) throw error;

      setProfile({ ...profile, ...updatedProfile, is_profile_complete: true });
      setIsEditing(false);
      Alert.alert("Success", "Profile updated successfully");
    } catch (error) {
      console.error("Error saving profile:", error);
      Alert.alert("Error", "Failed to save profile. Please try again.");
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
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.header}>
          <Text
            style={[
              styles.heading,
              { color: theme.colors.textPrimary },
              theme.typography.h2,
            ]}
          >
            My Profile
          </Text>
        </View>
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.surfaceSecondary,
              borderWidth: 1,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <View style={styles.incompleteContent}>
            <LinearGradient
              colors={theme.gradients.primary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.iconContainer, theme.shadows.glow.sm]}
            >
              <Ionicons
                name="person-outline"
                size={32}
                color={theme.colors.pureWhite}
              />
            </LinearGradient>
            <Text
              style={[
                styles.incompleteTitle,
                { color: theme.colors.textPrimary },
                theme.typography.h4,
              ]}
            >
              Complete Your Profile
            </Text>
            <Text
              style={[
                styles.incompleteMessage,
                { color: theme.colors.textSecondary },
                theme.typography.body,
              ]}
            >
              Help us personalize your Poise experience by completing your
              profile.
            </Text>
            <TouchableOpacity
              onPress={() => setIsEditing(true)}
              activeOpacity={0.85}
              style={styles.buttonWrapper}
            >
              <LinearGradient
                colors={theme.gradients.primary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.primaryButton, theme.shadows.glow.sm]}
              >
                <Text
                  style={[
                    styles.primaryButtonText,
                    { color: theme.colors.pureWhite },
                    theme.typography.button,
                  ]}
                >
                  Complete Profile
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    );
  }

  const profileFields = [
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
    {
      label: "Preferred Platforms",
      value: profile?.preferred_platforms
        ?.map((p) => p.charAt(0).toUpperCase() + p.slice(1))
        .join(", "),
    },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.header}>
        <Text
          style={[
            styles.heading,
            { color: theme.colors.textPrimary },
            theme.typography.h2,
          ]}
        >
          My Profile
        </Text>
        <TouchableOpacity
          style={[
            styles.editButton,
            {
              backgroundColor: theme.colors.shimmerLight,
              borderWidth: 1,
              borderColor: theme.colors.primary,
            },
          ]}
          onPress={() => setIsEditing(true)}
          activeOpacity={0.7}
        >
          <Ionicons name="pencil" size={20} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <View
        style={[
          styles.card,
          {
            backgroundColor: theme.colors.surfaceSecondary,
            borderWidth: 1,
            borderColor: theme.colors.border,
          },
        ]}
      >
        {profileFields.map((item, index) => (
          <View
            key={index}
            style={[
              styles.fieldContainer,
              index < profileFields.length - 1 && {
                borderBottomWidth: 1,
                borderBottomColor: theme.colors.border,
              },
            ]}
          >
            <Text
              style={[
                styles.label,
                { color: theme.colors.textMuted },
                theme.typography.overline,
              ]}
            >
              {item.label.toUpperCase()}
            </Text>
            <Text
              style={[
                styles.value,
                {
                  color: item.value
                    ? theme.colors.textPrimary
                    : theme.colors.textMuted,
                },
                theme.typography.body,
              ]}
            >
              {item.value || "Not set"}
            </Text>
          </View>
        ))}
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
    paddingBottom: 32,
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
    marginBottom: 24,
  },
  heading: {
    // Typography applied via theme
  },
  editButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    borderRadius: 16,
    overflow: "hidden",
  },
  incompleteContent: {
    padding: 32,
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
  incompleteTitle: {
    marginBottom: 8,
    textAlign: "center",
  },
  incompleteMessage: {
    textAlign: "center",
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  buttonWrapper: {
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
  },
  primaryButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    width: "100%",
    alignItems: "center",
  },
  primaryButtonText: {
    // Typography applied via theme
  },
  fieldContainer: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  label: {
    marginBottom: 4,
  },
  value: {
    // Typography applied via theme
  },
});

export default Profile;
