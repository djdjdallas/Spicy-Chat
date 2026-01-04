// pages/ProfileAudit.js
import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../context/ThemeContext";
import { pickScreenshot, analyzeProfile } from "../services/imageService";

const PLATFORMS = [
  { id: "feeld", name: "Feeld", icon: "heart" },
  { id: "tinder", name: "Tinder", icon: "flame" },
  { id: "hinge", name: "Hinge", icon: "link" },
  { id: "bumble", name: "Bumble", icon: "chatbubble" },
  { id: "okcupid", name: "OkCupid", icon: "heart-circle" },
  { id: "3fun", name: "3Fun", icon: "people" },
  { id: "other", name: "Other", icon: "apps" },
];

const ProfileAudit = ({ navigation }) => {
  const { theme } = useTheme();
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [screenshot, setScreenshot] = useState(null);
  const [bioText, setBioText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  const handlePickScreenshot = async () => {
    const result = await pickScreenshot();

    if (result === null) {
      return;
    }

    if (result.error) {
      Alert.alert("Error", result.error);
      return;
    }

    setScreenshot(result);
    setAnalysisResult(null);
  };

  const clearScreenshot = () => {
    setScreenshot(null);
    setAnalysisResult(null);
  };

  const handleAnalyze = async () => {
    if (!screenshot && !bioText.trim()) {
      Alert.alert(
        "Missing Content",
        "Please add a screenshot of your profile or enter your bio text"
      );
      return;
    }

    if (!selectedPlatform) {
      Alert.alert(
        "Select Platform",
        "Please select which dating app this profile is from"
      );
      return;
    }

    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      const result = await analyzeProfile(
        screenshot?.base64 || null,
        bioText.trim(),
        selectedPlatform
      );
      setAnalysisResult(result);
    } catch (error) {
      if (__DEV__) {
        console.error("Analysis error:", error);
      }
      Alert.alert(
        "Analysis Failed",
        error.message || "Failed to analyze profile. Please try again."
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 8) return theme.colors.success;
    if (score >= 6) return "#F59E0B";
    return theme.colors.error;
  };

  const resetAudit = () => {
    setScreenshot(null);
    setBioText("");
    setAnalysisResult(null);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
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
            Profile Audit
          </Text>
          <Text
            style={[
              styles.subtitle,
              { color: theme.colors.textSecondary },
              theme.typography.body,
            ]}
          >
            Get AI-powered feedback to optimize your dating profile
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
                    },
                  ]}
                  onPress={() => setSelectedPlatform(platform.id)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={platform.icon}
                    size={18}
                    color={
                      isSelected
                        ? theme.colors.pureWhite
                        : theme.colors.textSecondary
                    }
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
            Profile Screenshot
          </Text>

          {screenshot ? (
            <View
              style={[
                styles.imagePreviewContainer,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
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
                  name="person-circle-outline"
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
                Add Profile Screenshot
              </Text>
              <Text
                style={[
                  styles.uploadSubtitle,
                  { color: theme.colors.textSecondary },
                  theme.typography.bodySmall,
                ]}
              >
                Screenshot your dating profile from the app
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Bio Text Section */}
        <View style={styles.section}>
          <Text
            style={[
              styles.sectionTitle,
              { color: theme.colors.textPrimary },
              theme.typography.h4,
            ]}
          >
            Bio Text (Optional)
          </Text>
          <Text
            style={[
              styles.sectionSubtitle,
              { color: theme.colors.textSecondary },
              theme.typography.bodySmall,
            ]}
          >
            Paste your bio here for more detailed feedback
          </Text>
          <TextInput
            style={[
              styles.bioInput,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                color: theme.colors.textPrimary,
              },
              theme.typography.body,
            ]}
            placeholder="Paste your profile bio text here..."
            placeholderTextColor={theme.colors.textMuted}
            value={bioText}
            onChangeText={setBioText}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
          />
        </View>

        {/* Analyze Button */}
        {(screenshot || bioText.trim()) && !analysisResult && (
          <TouchableOpacity
            style={styles.analyzeButton}
            onPress={handleAnalyze}
            disabled={isAnalyzing}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={
                isAnalyzing
                  ? [theme.colors.border, theme.colors.border]
                  : theme.gradients.primary
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.gradientButton, !isAnalyzing && theme.shadows.glow.sm]}
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
                    Analyze My Profile
                  </Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Analysis Results */}
        {analysisResult && (
          <View style={styles.resultsSection}>
            <Text
              style={[
                styles.sectionTitle,
                { color: theme.colors.textPrimary },
                theme.typography.h4,
              ]}
            >
              Analysis Results
            </Text>

            {/* Score Card */}
            {analysisResult.score && (
              <View
                style={[
                  styles.scoreCard,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.scoreLabel,
                    { color: theme.colors.textSecondary },
                    theme.typography.caption,
                  ]}
                >
                  PROFILE SCORE
                </Text>
                <View style={styles.scoreRow}>
                  <Text
                    style={[
                      styles.scoreValue,
                      { color: getScoreColor(analysisResult.score) },
                    ]}
                  >
                    {analysisResult.score}
                  </Text>
                  <Text
                    style={[
                      styles.scoreMax,
                      { color: theme.colors.textTertiary },
                      theme.typography.h4,
                    ]}
                  >
                    /10
                  </Text>
                </View>
              </View>
            )}

            {/* Overview */}
            {analysisResult.overview && (
              <View
                style={[
                  styles.resultCard,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
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
                    Overview
                  </Text>
                </View>
                <Text
                  style={[
                    styles.resultCardText,
                    { color: theme.colors.textSecondary },
                    theme.typography.body,
                  ]}
                >
                  {analysisResult.overview}
                </Text>
              </View>
            )}

            {/* Strengths */}
            {analysisResult.strengths?.length > 0 && (
              <View
                style={[
                  styles.resultCard,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
                  },
                ]}
              >
                <View style={styles.resultCardHeader}>
                  <View
                    style={[
                      styles.resultIconContainer,
                      { backgroundColor: theme.colors.success + "20" },
                    ]}
                  >
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={theme.colors.success}
                    />
                  </View>
                  <Text
                    style={[
                      styles.resultCardTitle,
                      { color: theme.colors.textPrimary },
                      theme.typography.h4,
                    ]}
                  >
                    Strengths
                  </Text>
                </View>
                {analysisResult.strengths.map((item, index) => (
                  <View key={index} style={styles.bulletItem}>
                    <View
                      style={[
                        styles.bulletDot,
                        { backgroundColor: theme.colors.success },
                      ]}
                    />
                    <Text
                      style={[
                        styles.bulletText,
                        { color: theme.colors.textSecondary },
                        theme.typography.body,
                      ]}
                    >
                      {item}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Improvements */}
            {analysisResult.improvements?.length > 0 && (
              <View
                style={[
                  styles.resultCard,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
                  },
                ]}
              >
                <View style={styles.resultCardHeader}>
                  <View
                    style={[
                      styles.resultIconContainer,
                      { backgroundColor: "#F59E0B20" },
                    ]}
                  >
                    <Ionicons
                      name="arrow-up-circle"
                      size={20}
                      color="#F59E0B"
                    />
                  </View>
                  <Text
                    style={[
                      styles.resultCardTitle,
                      { color: theme.colors.textPrimary },
                      theme.typography.h4,
                    ]}
                  >
                    Areas to Improve
                  </Text>
                </View>
                {analysisResult.improvements.map((item, index) => (
                  <View key={index} style={styles.bulletItem}>
                    <View
                      style={[styles.bulletDot, { backgroundColor: "#F59E0B" }]}
                    />
                    <Text
                      style={[
                        styles.bulletText,
                        { color: theme.colors.textSecondary },
                        theme.typography.body,
                      ]}
                    >
                      {item}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Suggestions */}
            {analysisResult.suggestions?.length > 0 && (
              <View
                style={[
                  styles.resultCard,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
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
                    <Ionicons name="bulb" size={20} color={theme.colors.primary} />
                  </View>
                  <Text
                    style={[
                      styles.resultCardTitle,
                      { color: theme.colors.textPrimary },
                      theme.typography.h4,
                    ]}
                  >
                    Suggestions
                  </Text>
                </View>
                {analysisResult.suggestions.map((item, index) => (
                  <View key={index} style={styles.bulletItem}>
                    <View
                      style={[
                        styles.bulletDot,
                        { backgroundColor: theme.colors.primary },
                      ]}
                    />
                    <Text
                      style={[
                        styles.bulletText,
                        { color: theme.colors.textSecondary },
                        theme.typography.body,
                      ]}
                    >
                      {item}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Try Again Button */}
            <TouchableOpacity
              style={[
                styles.tryAgainButton,
                {
                  borderColor: theme.colors.primary,
                },
              ]}
              onPress={resetAudit}
              activeOpacity={0.7}
            >
              <Ionicons name="refresh" size={18} color={theme.colors.primary} />
              <Text
                style={[
                  styles.tryAgainButtonText,
                  { color: theme.colors.primary },
                  theme.typography.button,
                ]}
              >
                Audit Another Profile
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 50 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingTop: 16,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 24,
  },
  heading: {
    marginBottom: 8,
  },
  subtitle: {
    lineHeight: 22,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 8,
  },
  sectionSubtitle: {
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
    textAlign: "center",
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
  bioInput: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    minHeight: 120,
    lineHeight: 22,
  },
  analyzeButton: {
    marginBottom: 24,
  },
  gradientButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 14,
  },
  buttonIcon: {
    marginRight: 8,
  },
  analyzeButtonText: {
    fontWeight: "600",
  },
  resultsSection: {
    gap: 16,
  },
  scoreCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
    alignItems: "center",
  },
  scoreLabel: {
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
  },
  scoreRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  scoreValue: {
    fontSize: 56,
    fontWeight: "700",
  },
  scoreMax: {
    marginLeft: 4,
  },
  resultCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
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
    fontWeight: "600",
  },
  resultCardText: {
    lineHeight: 22,
  },
  bulletItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 8,
    marginRight: 12,
  },
  bulletText: {
    flex: 1,
    lineHeight: 22,
  },
  tryAgainButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 8,
  },
  tryAgainButtonText: {
    fontWeight: "600",
  },
});

export default ProfileAudit;
