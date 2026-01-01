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
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useTheme } from "../context/ThemeContext";

const ProfileEditForm = ({ profile, onSave, onCancel }) => {
  const { theme } = useTheme();

  const [formData, setFormData] = useState({
    full_name: profile?.full_name || "",
    display_name: profile?.display_name || "",
    bio: profile?.bio || "",
    age: profile?.age?.toString() || "",
    relationship_goal: profile?.relationship_goal || "not_sure_yet",
    communication_style: profile?.communication_style || "casual_friendly",
    interests: profile?.interests?.join(", ") || "",
    hobbies: profile?.hobbies?.join(", ") || "",
    values: profile?.values?.join(", ") || "",
  });

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
      ...formData,
      age,
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
    };

    onSave(processedData);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.heading, { color: theme.colors.primary }, theme.typography.h2]}>
          Edit Profile
        </Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={[styles.headerButton, styles.cancelButton, { backgroundColor: theme.colors.surfaceSecondary }]}
            onPress={onCancel}
          >
            <Text style={[styles.cancelButtonText, { color: theme.colors.textSecondary }, theme.typography.buttonSmall]}>
              Cancel
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.headerButton, styles.saveButton, { backgroundColor: theme.colors.primary }]}
            onPress={handleSubmit}
          >
            <Text style={[styles.saveButtonText, { color: theme.colors.pureWhite }, theme.typography.buttonSmall]}>
              Save
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.form, { backgroundColor: theme.colors.surface }]}>
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
          <View style={[styles.pickerContainer, { borderColor: theme.colors.border, backgroundColor: theme.colors.inputBackground }]}>
            <Picker
              selectedValue={formData.relationship_goal}
              onValueChange={(value) =>
                setFormData({ ...formData, relationship_goal: value })
              }
              style={[styles.picker, { color: theme.colors.textPrimary }]}
              dropdownIconColor={theme.colors.textSecondary}
            >
              <Picker.Item label="Not Sure Yet" value="not_sure_yet" />
              <Picker.Item
                label="Long Term Relationship"
                value="long_term_relationship"
              />
              <Picker.Item label="Casual Dating" value="casual_dating" />
              <Picker.Item label="Friendship" value="friendship" />
            </Picker>
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.colors.textSecondary }, theme.typography.bodySmall]}>
            Communication Style
          </Text>
          <View style={[styles.pickerContainer, { borderColor: theme.colors.border, backgroundColor: theme.colors.inputBackground }]}>
            <Picker
              selectedValue={formData.communication_style}
              onValueChange={(value) =>
                setFormData({ ...formData, communication_style: value })
              }
              style={[styles.picker, { color: theme.colors.textPrimary }]}
              dropdownIconColor={theme.colors.textSecondary}
            >
              <Picker.Item label="Casual & Friendly" value="casual_friendly" />
              <Picker.Item
                label="Direct & Straightforward"
                value="direct_straightforward"
              />
              <Picker.Item
                label="Thoughtful & Reserved"
                value="thoughtful_reserved"
              />
              <Picker.Item
                label="Playful & Humorous"
                value="playful_humorous"
              />
            </Picker>
          </View>
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
    borderRadius: 20,
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
    borderRadius: 12,
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
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 10,
    overflow: "hidden",
  },
  picker: {
    height: 50,
  },
});

export default ProfileEditForm;
