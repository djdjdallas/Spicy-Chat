// pages/OnboardingProfile.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../context/ThemeContext";
import { supabase } from "../lib/supabase";

const DATING_GOALS = [
  { label: "Exploring", value: "exploring" },
  { label: "Open Relationship", value: "open_relationship" },
  { label: "Polyamorous", value: "polyamorous" },
  { label: "Swinger", value: "swinger" },
  { label: "Monogamous", value: "monogamous" },
  { label: "Friends with Benefits", value: "fwb" },
];

const COMMUNICATION_STYLES = [
  { label: "Flirty & Playful", value: "flirty_playful" },
  { label: "Direct & Confident", value: "direct_confident" },
  { label: "Slow & Sensual", value: "slow_sensual" },
  { label: "Witty & Teasing", value: "witty_teasing" },
  { label: "Sweet & Romantic", value: "sweet_romantic" },
];

const DropdownSelect = ({ label, value, options, onSelect, theme }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <>
      <TouchableOpacity
        style={[
          styles.dropdownButton,
          {
            borderColor: theme.colors.border,
            backgroundColor: theme.colors.inputBackground,
          },
        ]}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.dropdownButtonText,
            { color: theme.colors.textPrimary },
          ]}
        >
          {selectedOption?.label || "Select..."}
        </Text>
        <Ionicons
          name="chevron-down"
          size={20}
          color={theme.colors.textSecondary}
        />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View
            style={[
              styles.modalContent,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text
                style={[
                  styles.modalTitle,
                  { color: theme.colors.textPrimary },
                ]}
              >
                {label}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons
                  name="close"
                  size={24}
                  color={theme.colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.optionsList}>
              {options.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.optionItem,
                    {
                      backgroundColor:
                        value === option.value
                          ? theme.colors.primaryMuted
                          : "transparent",
                    },
                  ]}
                  onPress={() => {
                    onSelect(option.value);
                    setModalVisible(false);
                  }}
                >
                  <Text
                    style={[
                      styles.optionText,
                      {
                        color:
                          value === option.value
                            ? theme.colors.primary
                            : theme.colors.textPrimary,
                        fontWeight: value === option.value ? "600" : "400",
                      },
                    ]}
                  >
                    {option.label}
                  </Text>
                  {value === option.value && (
                    <Ionicons
                      name="checkmark"
                      size={20}
                      color={theme.colors.primary}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const OnboardingProfile = ({ onComplete }) => {
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    full_name: "",
    display_name: "",
    bio: "",
    age: "",
    relationship_goal: "exploring",
    communication_style: "flirty_playful",
    interests: "",
    hobbies: "",
    values: "",
  });

  const handleSubmit = async () => {
    if (!formData.full_name.trim() || !formData.display_name.trim()) {
      Alert.alert("Required", "Please enter your full name and display name");
      return;
    }

    const age = parseInt(formData.age);
    if (isNaN(age) || age < 18) {
      Alert.alert("Age Required", "Please enter a valid age (18+)");
      return;
    }

    setIsLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        Alert.alert("Error", "Please log in again");
        return;
      }

      const processedData = {
        full_name: formData.full_name.trim(),
        display_name: formData.display_name.trim(),
        bio: formData.bio.trim(),
        age,
        relationship_goal: formData.relationship_goal,
        communication_style: formData.communication_style,
        interests: formData.interests
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        hobbies: formData.hobbies
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        values: formData.values
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        is_profile_complete: true,
        age_verified: true, // User passed age verification gate
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          ...processedData,
          created_at: new Date().toISOString(),
        });

      if (error) throw error;

      onComplete();
    } catch (error) {
      if (__DEV__) {
        console.error("Error saving profile:", error);
      }
      Alert.alert("Error", "Failed to save profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <LinearGradient
            colors={theme.gradients.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.iconContainer, theme.shadows.glow.sm]}
          >
            <Ionicons name="person-outline" size={32} color={theme.colors.pureWhite} />
          </LinearGradient>
          <Text
            style={[
              styles.title,
              { color: theme.colors.textPrimary },
              theme.typography.h2,
            ]}
          >
            Create Your Profile
          </Text>
          <Text
            style={[
              styles.subtitle,
              { color: theme.colors.textSecondary },
              theme.typography.body,
            ]}
          >
            Help us personalize your Poise experience
          </Text>
        </View>

        <View
          style={[
            styles.form,
            {
              backgroundColor: theme.colors.surfaceSecondary,
              borderWidth: 1,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <View style={styles.formGroup}>
            <Text
              style={[
                styles.label,
                { color: theme.colors.textSecondary },
                theme.typography.bodySmall,
              ]}
            >
              Full Name *
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  borderColor: theme.colors.border,
                  backgroundColor: theme.colors.inputBackground,
                  color: theme.colors.textPrimary,
                },
              ]}
              value={formData.full_name}
              onChangeText={(text) =>
                setFormData({ ...formData, full_name: text })
              }
              placeholder="Enter your full name"
              placeholderTextColor={theme.colors.textTertiary}
            />
          </View>

          <View style={styles.formGroup}>
            <Text
              style={[
                styles.label,
                { color: theme.colors.textSecondary },
                theme.typography.bodySmall,
              ]}
            >
              Display Name *
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  borderColor: theme.colors.border,
                  backgroundColor: theme.colors.inputBackground,
                  color: theme.colors.textPrimary,
                },
              ]}
              value={formData.display_name}
              onChangeText={(text) =>
                setFormData({ ...formData, display_name: text })
              }
              placeholder="How should we call you?"
              placeholderTextColor={theme.colors.textTertiary}
            />
          </View>

          <View style={styles.formGroup}>
            <Text
              style={[
                styles.label,
                { color: theme.colors.textSecondary },
                theme.typography.bodySmall,
              ]}
            >
              Age *
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  borderColor: theme.colors.border,
                  backgroundColor: theme.colors.inputBackground,
                  color: theme.colors.textPrimary,
                },
              ]}
              value={formData.age}
              onChangeText={(text) => setFormData({ ...formData, age: text })}
              placeholder="Your age"
              placeholderTextColor={theme.colors.textTertiary}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.formGroup}>
            <Text
              style={[
                styles.label,
                { color: theme.colors.textSecondary },
                theme.typography.bodySmall,
              ]}
            >
              Dating Goals
            </Text>
            <DropdownSelect
              label="Dating Goals"
              value={formData.relationship_goal}
              options={DATING_GOALS}
              onSelect={(value) =>
                setFormData({ ...formData, relationship_goal: value })
              }
              theme={theme}
            />
          </View>

          <View style={styles.formGroup}>
            <Text
              style={[
                styles.label,
                { color: theme.colors.textSecondary },
                theme.typography.bodySmall,
              ]}
            >
              Communication Style
            </Text>
            <DropdownSelect
              label="Communication Style"
              value={formData.communication_style}
              options={COMMUNICATION_STYLES}
              onSelect={(value) =>
                setFormData({ ...formData, communication_style: value })
              }
              theme={theme}
            />
          </View>

          <View style={styles.formGroup}>
            <Text
              style={[
                styles.label,
                { color: theme.colors.textSecondary },
                theme.typography.bodySmall,
              ]}
            >
              Bio
            </Text>
            <Text
              style={[
                styles.helperText,
                { color: theme.colors.primary },
              ]}
            >
              This is the most important field! A detailed bio helps generate more personalized and effective messages.
            </Text>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                {
                  borderColor: theme.colors.border,
                  backgroundColor: theme.colors.inputBackground,
                  color: theme.colors.textPrimary,
                },
              ]}
              value={formData.bio}
              onChangeText={(text) => setFormData({ ...formData, bio: text })}
              placeholder="Tell us about yourself - your personality, what makes you unique, what you're looking for..."
              placeholderTextColor={theme.colors.textTertiary}
              multiline
              numberOfLines={4}
            />
          </View>
        </View>

        <TouchableOpacity
          onPress={handleSubmit}
          disabled={isLoading}
          activeOpacity={0.85}
          style={[styles.continueButtonWrapper, isLoading && styles.disabledButton]}
        >
          <LinearGradient
            colors={theme.gradients.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.continueButton, theme.shadows.glow.sm]}
          >
            <Text
              style={[
                styles.continueButtonText,
                { color: theme.colors.pureWhite },
                theme.typography.button,
              ]}
            >
              {isLoading ? "Saving..." : "Continue"}
            </Text>
            {!isLoading && (
              <Ionicons
                name="arrow-forward"
                size={20}
                color={theme.colors.pureWhite}
                style={styles.buttonIcon}
              />
            )}
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 48,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    textAlign: "center",
  },
  form: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
  },
  textArea: {
    height: 120,
    textAlignVertical: "top",
  },
  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
  },
  dropdownButtonText: {
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContent: {
    width: "100%",
    maxHeight: "60%",
    borderRadius: 16,
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  optionsList: {
    maxHeight: 300,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  optionText: {
    fontSize: 16,
  },
  helperText: {
    fontSize: 13,
    marginBottom: 8,
    fontWeight: "500",
  },
  continueButtonWrapper: {
    borderRadius: 16,
    overflow: "hidden",
  },
  continueButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 16,
  },
  disabledButton: {
    opacity: 0.6,
  },
  continueButtonText: {},
  buttonIcon: {
    marginLeft: 8,
  },
});

export default OnboardingProfile;
