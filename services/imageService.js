// services/imageService.js
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { supabase } from "../lib/supabase";

/**
 * Request permission to access the photo library
 * @returns {Promise<boolean>} Whether permission was granted
 */
export const requestMediaLibraryPermission = async () => {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  return status === "granted";
};

/**
 * Pick a screenshot from the device gallery
 * @returns {Promise<{uri: string, base64: string} | null>} Image data or null if cancelled
 */
export const pickScreenshot = async () => {
  const hasPermission = await requestMediaLibraryPermission();

  if (!hasPermission) {
    return { error: "Permission to access photos was denied" };
  }

  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.8,
      base64: true,
    });

    if (result.canceled) {
      return null;
    }

    const asset = result.assets[0];
    return {
      uri: asset.uri,
      base64: asset.base64,
      width: asset.width,
      height: asset.height,
    };
  } catch (error) {
    if (__DEV__) {
      console.error("Error picking image:", error);
    }
    return { error: error.message || "Failed to pick image" };
  }
};

/**
 * Read a shared image from a URI and convert to base64
 * @param {string} uri - The URI of the shared image
 * @returns {Promise<{uri: string, base64: string} | null>} Image data
 */
export const readSharedImage = async (uri) => {
  try {
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    return {
      uri,
      base64,
    };
  } catch (error) {
    if (__DEV__) {
      console.error("Error reading shared image:", error);
    }
    return { error: error.message || "Failed to read shared image" };
  }
};

/**
 * Analyze a screenshot using the Supabase Edge Function
 * @param {string} base64Image - Base64 encoded image
 * @param {object} userProfile - User profile data for personalization
 * @param {string} platform - The dating platform the screenshot is from
 * @returns {Promise<object>} Analysis results
 */
export const analyzeScreenshot = async (base64Image, userProfile, platform) => {
  try {
    const { data, error } = await supabase.functions.invoke("analyze-screenshot", {
      body: {
        base64Image,
        userProfile: {
          display_name: userProfile?.display_name,
          communication_style: userProfile?.communication_style,
          relationship_goal: userProfile?.relationship_goal,
          interests: userProfile?.interests,
          values: userProfile?.values,
          hobbies: userProfile?.hobbies,
        },
        platform,
      },
    });

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    if (__DEV__) {
      console.error("Error analyzing screenshot:", error);
    }
    throw new Error(error.message || "Failed to analyze screenshot");
  }
};

/**
 * Compress an image if it's too large
 * @param {string} uri - Image URI
 * @returns {Promise<string>} Base64 of compressed image
 */
export const compressImage = async (uri) => {
  try {
    const info = await FileSystem.getInfoAsync(uri);

    // If file is larger than 5MB, we should compress
    if (info.size > 5 * 1024 * 1024) {
      // For now, just read as-is. In production, you'd want to use
      // expo-image-manipulator for actual compression
      if (__DEV__) {
        console.warn("Image is large, consider implementing compression");
      }
    }

    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    return base64;
  } catch (error) {
    if (__DEV__) {
      console.error("Error compressing image:", error);
    }
    throw error;
  }
};

/**
 * Analyze a user's dating profile screenshot using the Supabase Edge Function
 * @param {string} base64Image - Base64 encoded image of the profile
 * @param {string} bioText - Optional bio text input by user
 * @param {string} platform - The dating platform the profile is from
 * @returns {Promise<object>} Analysis results with score, strengths, improvements
 */
export const analyzeProfile = async (base64Image, bioText, platform) => {
  try {
    const { data, error } = await supabase.functions.invoke("analyze-profile", {
      body: {
        base64Image,
        bioText,
        platform,
      },
    });

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    if (__DEV__) {
      console.error("Error analyzing profile:", error);
    }
    throw new Error(error.message || "Failed to analyze profile");
  }
};

export default {
  pickScreenshot,
  readSharedImage,
  analyzeScreenshot,
  analyzeProfile,
  requestMediaLibraryPermission,
  compressImage,
};
