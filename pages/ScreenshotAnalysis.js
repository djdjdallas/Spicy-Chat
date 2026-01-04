// pages/ScreenshotAnalysis.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { useTheme } from "../context/ThemeContext";
import { supabase } from "../lib/supabase";
import {
  pickScreenshot,
  readSharedImage,
  analyzeScreenshot,
} from "../services/imageService";

const PLATFORMS = [
  { id: "feeld", name: "Feeld", icon: "heart" },
  { id: "tinder", name: "Tinder", icon: "flame" },
  { id: "hinge", name: "Hinge", icon: "link" },
  { id: "bumble", name: "Bumble", icon: "chatbubble" },
  { id: "okcupid", name: "OkCupid", icon: "heart-circle" },
  { id: "3fun", name: "3Fun", icon: "people" },
  { id: "other", name: "Other", icon: "apps" },
];

const ScreenshotAnalysis = ({ navigation, route }) => {
  const { theme } = useTheme();
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [screenshot, setScreenshot] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

  // Handle shared image from other apps
  useEffect(() => {
    if (route.params?.sharedImageUri) {
      handleSharedImage(route.params.sharedImageUri);
    }
  }, [route.params?.sharedImageUri]);

  // Load user profile for personalization
  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) throw userError;

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileError && profileError.code !== "PGRST116") {
        throw profileError;
      }

      setUserProfile(profile);

      // Auto-select platform if user has preferred platforms
      if (profile?.preferred_platforms?.length > 0) {
        setSelectedPlatform(profile.preferred_platforms[0]);
      }
    } catch (error) {
      if (__DEV__) {
        console.error("Error loading profile:", error);
      }
    }
  };

  const handleSharedImage = async (uri) => {
    try {
      const imageData = await readSharedImage(uri);
      if (imageData.error) {
        Alert.alert("Error", imageData.error);
        return;
      }
      setScreenshot(imageData);
      setAnalysisResult(null);
    } catch (error) {
      if (__DEV__) {
        console.error("Error handling shared image:", error);
      }
      Alert.alert("Error", "Failed to load shared image");
    }
  };

  const handlePickScreenshot = async () => {
    const result = await pickScreenshot();

    if (result === null) {
      // User cancelled
      return;
    }

    if (result.error) {
      Alert.alert("Error", result.error);
      return;
    }

    setScreenshot(result);
    setAnalysisResult(null);
  };

  const handleAnalyze = async () => {
    if (!screenshot) {
      Alert.alert("No Image", "Please select a screenshot first");
      return;
    }

    if (!selectedPlatform) {
      Alert.alert("Select Platform", "Please select which dating app this screenshot is from");
      return;
    }

    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      const result = await analyzeScreenshot(
        screenshot.base64,
        userProfile,
        selectedPlatform
      );
      setAnalysisResult(result);
    } catch (error) {
      if (__DEV__) {
        console.error("Analysis error:", error);
      }
      Alert.alert("Analysis Failed", error.message || "Failed to analyze screenshot");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCopyResponse = async (text) => {
    try {
      await Clipboard.setStringAsync(text);
      Alert.alert("Copied!", "Response copied to clipboard");
    } catch (error) {
      if (__DEV__) {
        console.error("Copy error:", error);
      }
    }
  };

  const handleUseInChat = (response) => {
    navigation.navigate("Chat", {
      prefillMessage: response,
      context: analysisResult?.context,
    });
  };

  const clearScreenshot = () => {
    setScreenshot(null);
    setAnalysisResult(null);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text
          style={[
            styles.heading,
            { color: theme.colors.textPrimary },
            theme.typography.h2,
          ]}
        >
          Screenshot Analysis
        </Text>
        <Text
          style={[
            styles.subtitle,
            { color: theme.colors.textSecondary },
            theme.typography.body,
          ]}
        >
          Get AI-powered response suggestions for your dating conversations
        </Text>
      </View>

      {/* Platform Selector */}
      <View style={styles.section}>
        <Text
          style={[
            styles.sectionTitle,
            { color: theme.colors.textPrimary },
            theme.typography.h4,
          ]}
        >
          Select Platform
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.platformScroll}
        >
          {PLATFORMS.map((platform) => {
            const isSelected = selectedPlatform === platform.id;
            return (
              <TouchableOpacity
                key={platform.id}
                style={[
                  styles.platformChip,
                  {
                    backgroundColor: isSelected
                      ? theme.colors.primary
                      : theme.colors.surface,
                    borderColor: isSelected
                      ? theme.colors.primary
                      : theme.colors.border,
                    ...theme.shadows.sm,
                  },
                ]}
                onPress={() => setSelectedPlatform(platform.id)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={platform.icon}
                  size={18}
                  color={isSelected ? theme.colors.pureWhite : theme.colors.textSecondary}
                />
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
        </ScrollView>
      </View>

      {/* Screenshot Section */}
      <View style={styles.section}>
        <Text
          style={[
            styles.sectionTitle,
            { color: theme.colors.textPrimary },
            theme.typography.h4,
          ]}
        >
          Screenshot
        </Text>

        {screenshot ? (
          <View
            style={[
              styles.imagePreviewContainer,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                ...theme.shadows.sm,
              },
            ]}
          >
            <Image
              source={{ uri: screenshot.uri }}
              style={styles.imagePreview}
              resizeMode="contain"
            />
            <TouchableOpacity
              style={[
                styles.clearButton,
                { backgroundColor: theme.colors.error },
              ]}
              onPress={clearScreenshot}
            >
              <Ionicons name="close" size={20} color={theme.colors.pureWhite} />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={[
              styles.uploadArea,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                ...theme.shadows.sm,
              },
            ]}
            onPress={handlePickScreenshot}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.uploadIconContainer,
                { backgroundColor: theme.colors.primaryMuted },
              ]}
            >
              <Ionicons
                name="image-outline"
                size={32}
                color={theme.colors.primary}
              />
            </View>
            <Text
              style={[
                styles.uploadTitle,
                { color: theme.colors.textPrimary },
                theme.typography.h4,
              ]}
            >
              Add Screenshot
            </Text>
            <Text
              style={[
                styles.uploadSubtitle,
                { color: theme.colors.textSecondary },
                theme.typography.bodySmall,
              ]}
            >
              Tap to select from your gallery
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Analyze Button */}
      {screenshot && (
        <TouchableOpacity
          style={[
            styles.analyzeButton,
            {
              backgroundColor: isAnalyzing
                ? theme.colors.border
                : theme.colors.primary,
            },
          ]}
          onPress={handleAnalyze}
          disabled={isAnalyzing}
          activeOpacity={0.85}
        >
          {isAnalyzing ? (
            <>
              <ActivityIndicator
                size="small"
                color={theme.colors.textSecondary}
                style={styles.buttonIcon}
              />
              <Text
                style={[
                  styles.analyzeButtonText,
                  { color: theme.colors.textSecondary },
                  theme.typography.button,
                ]}
              >
                Analyzing...
              </Text>
            </>
          ) : (
            <>
              <Ionicons
                name="sparkles"
                size={20}
                color={theme.colors.pureWhite}
                style={styles.buttonIcon}
              />
              <Text
                style={[
                  styles.analyzeButtonText,
                  { color: theme.colors.pureWhite },
                  theme.typography.button,
                ]}
              >
                Analyze & Get Suggestions
              </Text>
            </>
          )}
        </TouchableOpacity>
      )}

      {/* Analysis Results */}
      {analysisResult && (
        <View style={styles.section}>
          <Text
            style={[
              styles.sectionTitle,
              { color: theme.colors.textPrimary },
              theme.typography.h4,
            ]}
          >
            Analysis Results
          </Text>

          {/* Context Card */}
          {analysisResult.context && (
            <View
              style={[
                styles.resultCard,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                  ...theme.shadows.sm,
                },
              ]}
            >
              <View style={styles.resultCardHeader}>
                <View
                  style={[
                    styles.resultIconContainer,
                    { backgroundColor: theme.colors.primaryMuted },
                  ]}
                >
                  <Ionicons
                    name="analytics"
                    size={20}
                    color={theme.colors.primary}
                  />
                </View>
                <Text
                  style={[
                    styles.resultCardTitle,
                    { color: theme.colors.textPrimary },
                    theme.typography.h4,
                  ]}
                >
                  Conversation Context
                </Text>
              </View>
              <Text
                style={[
                  styles.resultCardText,
                  { color: theme.colors.textSecondary },
                  theme.typography.body,
                ]}
              >
                {analysisResult.context}
              </Text>
            </View>
          )}

          {/* Suggested Responses */}
          {analysisResult.suggestions?.length > 0 && (
            <View style={styles.suggestionsContainer}>
              <Text
                style={[
                  styles.suggestionsTitle,
                  { color: theme.colors.textPrimary },
                  theme.typography.h4,
                ]}
              >
                Suggested Responses
              </Text>

              {analysisResult.suggestions.map((suggestion, index) => (
                <View
                  key={index}
                  style={[
                    styles.suggestionCard,
                    {
                      backgroundColor: theme.colors.surface,
                      borderColor: theme.colors.border,
                      ...theme.shadows.sm,
                    },
                  ]}
                >
                  <View style={styles.suggestionHeader}>
                    <View
                      style={[
                        styles.suggestionBadge,
                        { backgroundColor: theme.colors.primaryMuted },
                      ]}
                    >
                      <Text
                        style={[
                          styles.suggestionBadgeText,
                          { color: theme.colors.primary },
                          theme.typography.caption,
                        ]}
                      >
                        {suggestion.tone || `Option ${index + 1}`}
                      </Text>
                    </View>
                  </View>

                  <Text
                    style={[
                      styles.suggestionText,
                      { color: theme.colors.textPrimary },
                      theme.typography.body,
                    ]}
                  >
                    {suggestion.message}
                  </Text>

                  <View style={styles.suggestionActions}>
                    <TouchableOpacity
                      style={[
                        styles.actionButton,
                        { backgroundColor: theme.colors.backgroundTertiary },
                      ]}
                      onPress={() => handleCopyResponse(suggestion.message)}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name="copy-outline"
                        size={18}
                        color={theme.colors.textSecondary}
                      />
                      <Text
                        style={[
                          styles.actionButtonText,
                          { color: theme.colors.textSecondary },
                          theme.typography.bodySmall,
                        ]}
                      >
                        Copy
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.actionButton,
                        { backgroundColor: theme.colors.primary },
                      ]}
                      onPress={() => handleUseInChat(suggestion.message)}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name="chatbubble-outline"
                        size={18}
                        color={theme.colors.pureWhite}
                      />
                      <Text
                        style={[
                          styles.actionButtonText,
                          { color: theme.colors.pureWhite },
                          theme.typography.bodySmall,
                        ]}
                      >
                        Use in Chat
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Tips */}
          {analysisResult.tips && (
            <View
              style={[
                styles.tipsCard,
                {
                  backgroundColor: theme.colors.primaryMuted,
                  borderColor: theme.colors.primary,
                },
              ]}
            >
              <View style={styles.tipsHeader}>
                <Ionicons
                  name="bulb"
                  size={20}
                  color={theme.colors.primary}
                />
                <Text
                  style={[
                    styles.tipsTitle,
                    { color: theme.colors.primary },
                    theme.typography.h4,
                  ]}
                >
                  Pro Tips
                </Text>
              </View>
              <Text
                style={[
                  styles.tipsText,
                  { color: theme.colors.textPrimary },
                  theme.typography.body,
                ]}
              >
                {analysisResult.tips}
              </Text>
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingTop: 60,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 24,
  },
  heading: {
    marginBottom: 8,
  },
  subtitle: {
    // Typography applied via theme
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  platformScroll: {
    gap: 10,
    paddingRight: 16,
  },
  platformChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 24,
    borderWidth: 1,
    gap: 8,
  },
  platformChipText: {
    fontSize: 14,
    fontWeight: "600",
  },
  uploadArea: {
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: "dashed",
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  uploadIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  uploadTitle: {
    marginBottom: 4,
  },
  uploadSubtitle: {
    // Typography applied via theme
  },
  imagePreviewContainer: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    position: "relative",
  },
  imagePreview: {
    width: "100%",
    height: 300,
    backgroundColor: "#000",
  },
  clearButton: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  analyzeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  buttonIcon: {
    marginRight: 8,
  },
  analyzeButtonText: {
    // Typography applied via theme
  },
  resultCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  resultCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  resultIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  resultCardTitle: {
    flex: 1,
  },
  resultCardText: {
    lineHeight: 22,
  },
  suggestionsContainer: {
    gap: 12,
  },
  suggestionsTitle: {
    marginBottom: 4,
  },
  suggestionCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  suggestionHeader: {
    marginBottom: 12,
  },
  suggestionBadge: {
    alignSelf: "flex-start",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  suggestionBadgeText: {
    textTransform: "capitalize",
    fontWeight: "600",
  },
  suggestionText: {
    marginBottom: 16,
    lineHeight: 24,
  },
  suggestionActions: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 10,
    gap: 6,
  },
  actionButtonText: {
    fontWeight: "600",
  },
  tipsCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginTop: 16,
  },
  tipsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  tipsTitle: {
    // Typography applied via theme
  },
  tipsText: {
    lineHeight: 22,
  },
});

export default ScreenshotAnalysis;
