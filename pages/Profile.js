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

const Profile = () => {
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

      // Try to get existing profile
      const { data: existingProfile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      // If no profile exists (PGRST116) or other error, create one
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
        // If it's any other error, throw it
        throw profileError;
      } else {
        // If profile exists, use it
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
          is_profile_complete: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) throw error;

      setProfile({ ...profile, ...updatedProfile });
      setIsEditing(false);
      Alert.alert("Success", "Profile updated successfully");

      // Reload profile to ensure we have the latest data
      await loadProfile();
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0084ff" />
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

  // Show a message if profile is not complete
  if (!profile?.is_profile_complete) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.heading}>My Profile</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.incompleteMessage}>
            Please complete your profile to get the most out of RizzChat!
          </Text>
          <TouchableOpacity
            style={styles.completeProfileButton}
            onPress={() => setIsEditing(true)}
          >
            <Text style={styles.completeProfileButtonText}>
              Complete Profile
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.heading}>My Profile</Text>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => setIsEditing(true)}
          activeOpacity={0.7}
        >
          <Ionicons name="pencil" size={24} color="#0084ff" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <View style={styles.profileInfo}>
          <Text style={styles.label}>Full Name</Text>
          <Text style={styles.value}>{profile?.full_name || "Not set"}</Text>

          <Text style={styles.label}>Display Name</Text>
          <Text style={styles.value}>{profile?.display_name || "Not set"}</Text>

          <Text style={styles.label}>Bio</Text>
          <Text style={styles.value}>{profile?.bio || "Not set"}</Text>

          <Text style={styles.label}>Age</Text>
          <Text style={styles.value}>{profile?.age || "Not set"}</Text>

          <Text style={styles.label}>Dating Goals</Text>
          <Text style={styles.value}>
            {profile?.relationship_goal
              ?.replace(/_/g, " ")
              .replace(/\b\w/g, (c) => c.toUpperCase()) || "Not set"}
          </Text>

          <Text style={styles.label}>Communication Style</Text>
          <Text style={styles.value}>
            {profile?.communication_style
              ?.replace(/_/g, " ")
              .replace(/\b\w/g, (c) => c.toUpperCase()) || "Not set"}
          </Text>

          <Text style={styles.label}>Interests</Text>
          <Text style={styles.value}>
            {profile?.interests?.join(", ") || "Not set"}
          </Text>

          <Text style={styles.label}>Hobbies</Text>
          <Text style={styles.value}>
            {profile?.hobbies?.join(", ") || "Not set"}
          </Text>

          <Text style={styles.label}>Values</Text>
          <Text style={styles.value}>
            {profile?.values?.join(", ") || "Not set"}
          </Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
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
    color: "#0084ff",
  },
  editButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "rgba(0, 132, 255, 0.1)",
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
  incompleteMessage: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  completeProfileButton: {
    backgroundColor: "#0084ff",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  completeProfileButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default Profile;
