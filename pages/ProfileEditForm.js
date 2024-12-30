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

const ProfileEditForm = ({ profile, onSave, onCancel }) => {
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
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.heading}>Edit Profile</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={[styles.headerButton, styles.cancelButton]}
            onPress={onCancel}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.headerButton, styles.saveButton]}
            onPress={handleSubmit}
          >
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.form}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Full Name *</Text>
          <TextInput
            style={styles.input}
            value={formData.full_name}
            onChangeText={(text) =>
              setFormData({ ...formData, full_name: text })
            }
            placeholder="Enter your full name"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Display Name *</Text>
          <TextInput
            style={styles.input}
            value={formData.display_name}
            onChangeText={(text) =>
              setFormData({ ...formData, display_name: text })
            }
            placeholder="Enter your display name"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Bio</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.bio}
            onChangeText={(text) => setFormData({ ...formData, bio: text })}
            placeholder="Tell us about yourself"
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Age *</Text>
          <TextInput
            style={styles.input}
            value={formData.age}
            onChangeText={(text) => setFormData({ ...formData, age: text })}
            placeholder="Enter your age"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Dating Goals</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.relationship_goal}
              onValueChange={(value) =>
                setFormData({ ...formData, relationship_goal: value })
              }
              style={styles.picker}
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
          <Text style={styles.label}>Communication Style</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.communication_style}
              onValueChange={(value) =>
                setFormData({ ...formData, communication_style: value })
              }
              style={styles.picker}
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
          <Text style={styles.label}>Interests (comma-separated)</Text>
          <TextInput
            style={styles.input}
            value={formData.interests}
            onChangeText={(text) =>
              setFormData({ ...formData, interests: text })
            }
            placeholder="e.g., Music, Travel, Food"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Hobbies (comma-separated)</Text>
          <TextInput
            style={styles.input}
            value={formData.hobbies}
            onChangeText={(text) => setFormData({ ...formData, hobbies: text })}
            placeholder="e.g., Photography, Cooking, Gaming"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Values (comma-separated)</Text>
          <TextInput
            style={styles.input}
            value={formData.values}
            onChangeText={(text) => setFormData({ ...formData, values: text })}
            placeholder="e.g., Honesty, Kindness, Ambition"
          />
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
  headerButtons: {
    flexDirection: "row",
    gap: 10,
  },
  headerButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  saveButton: {
    backgroundColor: "#0084ff",
  },
  cancelButton: {
    backgroundColor: "#f0f0f0",
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  cancelButtonText: {
    color: "#666",
    fontWeight: "bold",
  },
  form: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 15,
  },
  formGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    color: "#666",
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  picker: {
    height: 50,
  },
});

export default ProfileEditForm;
