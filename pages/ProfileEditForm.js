// pages/ProfileEditForm.js
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../context/ThemeContext";

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

const PLATFORMS = [
  { id: "feeld", name: "Feeld" },
  { id: "tinder", name: "Tinder" },
  { id: "hinge", name: "Hinge" },
  { id: "bumble", name: "Bumble" },
  { id: "okcupid", name: "OkCupid" },
  { id: "3fun", name: "3Fun" },
  { id: "other", name: "Other" },
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
              {
                backgroundColor: theme.colors.surfaceSecondary,
                borderWidth: 1,
                borderColor: theme.colors.border,
              },
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

const ProfileEditForm = ({ profile, onSave, onCancel }) => {
  const { theme } = useTheme();

  const [formData, setFormData] = useState({
    full_name: profile?.full_name || "",
    display_name: profile?.display_name || "",
    bio: profile?.bio || "",
    age: profile?.age?.toString() || "",
    relationship_goal: profile?.relationship_goal || "exploring",
    communication_style: profile?.communication_style || "flirty_playful",
    interests: profile?.interests?.join(", ") || "",
    hobbies: profile?.hobbies?.join(", ") || "",
    values: profile?.values?.join(", ") || "",
    preferred_platforms: profile?.preferred_platforms || [],
  });

  const togglePlatform = (platformId) => {
    setFormData((prev) => {
      const platforms = prev.preferred_platforms || [];
      if (platforms.includes(platformId)) {
        return {
          ...prev,
          preferred_platforms: platforms.filter((p) => p !== platformId),
        };
      } else {
        return {
          ...prev,
          preferred_platforms: [...platforms, platformId],
        };
      }
    });
  };

  const handleSubmit = () => {
    // Validate required fields
    if (!formData.full_name.trim() || !formData.display_name.trim()) {
      Alert.alert("Error", "Full name and display name are required");
      return;
    }

    // Convert age to number and validate
    const age = parseInt(formData.age);
    if (isNaN(age) || age < 18) {
      Alert.alert("Error", "Please enter a valid age (18+)");
      return;
    }

    // Convert comma-separated strings to arrays
    const processedData = {
      full_name: formData.full_name,
      display_name: formData.display_name,
      bio: formData.bio,
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
      preferred_platforms: formData.preferred_platforms,
    };

    onSave(processedData);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.heading, { color: theme.colors.textPrimary }, theme.typography.h2]}>
          Edit Profile
        </Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={[
              styles.headerButton,
              styles.cancelButton,
              {
                backgroundColor: theme.colors.surfaceSecondary,
                borderWidth: 1,
                borderColor: theme.colors.border,
              },
            ]}
            onPress={onCancel}
          >
            <Text style={[styles.cancelButtonText, { color: theme.colors.textSecondary }, theme.typography.buttonSmall]}>
              Cancel
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleSubmit}
            activeOpacity={0.85}
            style={styles.saveButtonWrapper}
          >
            <LinearGradient
              colors={theme.gradients.primary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.headerButton, styles.saveButton]}
            >
              <Text style={[styles.saveButtonText, { color: theme.colors.pureWhite }, theme.typography.buttonSmall]}>
                Save
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
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
          <Text style={[styles.label, { color: theme.colors.textSecondary }, theme.typography.bodySmall]}>
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
          <Text style={[styles.label, { color: theme.colors.textSecondary }, theme.typography.bodySmall]}>
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
            placeholder="Enter your display name"
            placeholderTextColor={theme.colors.textTertiary}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.colors.textSecondary }, theme.typography.bodySmall]}>
            Bio
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
            placeholder="Tell us about yourself"
            placeholderTextColor={theme.colors.textTertiary}
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.colors.textSecondary }, theme.typography.bodySmall]}>
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
            placeholder="Enter your age"
            placeholderTextColor={theme.colors.textTertiary}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.colors.textSecondary }, theme.typography.bodySmall]}>
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
          <Text style={[styles.label, { color: theme.colors.textSecondary }, theme.typography.bodySmall]}>
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
          <Text style={[styles.label, { color: theme.colors.textSecondary }, theme.typography.bodySmall]}>
            Interests (comma-separated)
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
            value={formData.interests}
            onChangeText={(text) =>
              setFormData({ ...formData, interests: text })
            }
            placeholder="e.g., Music, Travel, Food"
            placeholderTextColor={theme.colors.textTertiary}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.colors.textSecondary }, theme.typography.bodySmall]}>
            Hobbies (comma-separated)
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
            value={formData.hobbies}
            onChangeText={(text) => setFormData({ ...formData, hobbies: text })}
            placeholder="e.g., Photography, Cooking, Gaming"
            placeholderTextColor={theme.colors.textTertiary}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.colors.textSecondary }, theme.typography.bodySmall]}>
            Values (comma-separated)
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
            value={formData.values}
            onChangeText={(text) => setFormData({ ...formData, values: text })}
            placeholder="e.g., Honesty, Kindness, Ambition"
            placeholderTextColor={theme.colors.textTertiary}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.colors.textSecondary }, theme.typography.bodySmall]}>
            Preferred Dating Platforms
          </Text>
          <View style={styles.platformsContainer}>
            {PLATFORMS.map((platform) => {
              const isSelected = formData.preferred_platforms?.includes(platform.id);
              return (
                <TouchableOpacity
                  key={platform.id}
                  style={[
                    styles.platformChip,
                    {
                      backgroundColor: isSelected
                        ? theme.colors.primary
                        : theme.colors.inputBackground,
                      borderColor: isSelected
                        ? theme.colors.primary
                        : theme.colors.border,
                    },
                  ]}
                  onPress={() => togglePlatform(platform.id)}
                  activeOpacity={0.7}
                >
                  {isSelected && (
                    <Ionicons
                      name="checkmark"
                      size={16}
                      color={theme.colors.pureWhite}
                      style={styles.checkIcon}
                    />
                  )}
                  <Text
                    style={[
                      styles.platformChipText,
                      {
                        color: isSelected
                          ? theme.colors.pureWhite
                          : theme.colors.textPrimary,
                      },
                    ]}
                  >
                    {platform.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  heading: {},
  headerButtons: {
    flexDirection: "row",
    gap: 10,
  },
  headerButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 12,
  },
  saveButtonWrapper: {
    borderRadius: 12,
    overflow: "hidden",
  },
  saveButton: {},
  cancelButton: {},
  saveButtonText: {
    fontWeight: "bold",
  },
  cancelButtonText: {
    fontWeight: "bold",
  },
  form: {
    borderRadius: 16,
    padding: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
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
  platformsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  platformChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
  },
  platformChipText: {
    fontSize: 14,
    fontWeight: "500",
  },
  checkIcon: {
    marginRight: 4,
  },
});

export default ProfileEditForm;
