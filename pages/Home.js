// pages/Home.js
import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";
import { getTodayInsight } from "../data/dailyInsights";

const Home = ({ navigation }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const todayInsight = getTodayInsight();

  const handleDiscussInsight = () => {
    navigation.navigate("Chat", {
      prefillContext: todayInsight.discussPrompt,
      contextType: "daily_insight",
      insightTitle: todayInsight.title,
    });
  };

  const essentials = [
    {
      id: "profile-audit",
      title: "Profile Audit",
      icon: "star-outline",
      description: "Get AI feedback on your dating profile",
      onPress: () => navigation.navigate("More", { screen: "ProfileAudit" }),
    },
    {
      id: "openers-vault",
      title: "Openers Vault",
      icon: "chatbubbles-outline",
      description: "Curated conversation starters",
      onPress: () => navigation.navigate("More", { screen: "OpenersVault" }),
    },
    {
      id: "partners",
      title: "Partners",
      icon: "people-outline",
      description: "Practice with AI conversation partners",
      onPress: () => navigation.navigate("More", { screen: "PartnerSelection" }),
    },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={[
        styles.contentContainer,
        { paddingTop: insets.top + 16 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text
          style={[
            styles.greeting,
            { color: theme.colors.textSecondary },
            theme.typography.bodySmall,
          ]}
        >
          Today's Insight
        </Text>
        <Text
          style={[
            styles.date,
            { color: theme.colors.textTertiary },
            theme.typography.caption,
          ]}
        >
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </Text>
      </View>

      {/* Daily Insight Card */}
      <View
        style={[
          styles.insightCard,
          {
            backgroundColor: theme.colors.surfaceSecondary,
            borderWidth: 1,
            borderColor: theme.colors.border,
          },
        ]}
      >
        {/* Category Badge */}
        <View
          style={[
            styles.categoryBadge,
            { backgroundColor: theme.colors.shimmerLight },
          ]}
        >
          <Text
            style={[
              styles.categoryText,
              { color: theme.colors.primary },
              theme.typography.overline,
            ]}
          >
            {todayInsight.category}
          </Text>
        </View>

        {/* Title */}
        <Text
          style={[
            styles.insightTitle,
            { color: theme.colors.textPrimary },
            theme.typography.h3,
          ]}
        >
          {todayInsight.title}
        </Text>

        {/* Description */}
        <Text
          style={[
            styles.insightDescription,
            { color: theme.colors.textSecondary },
            theme.typography.body,
          ]}
        >
          {todayInsight.description}
        </Text>

        {/* Discuss Button */}
        <TouchableOpacity
          style={styles.discussButton}
          onPress={handleDiscussInsight}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.discussButtonText,
              { color: theme.colors.textPrimary },
              theme.typography.button,
            ]}
          >
            Discuss with Coach
          </Text>
          <Ionicons
            name="arrow-forward"
            size={18}
            color={theme.colors.textPrimary}
          />
        </TouchableOpacity>
      </View>

      {/* Essentials Section */}
      <View style={styles.essentialsSection}>
        <Text
          style={[
            styles.sectionTitle,
            { color: theme.colors.textPrimary },
            theme.typography.h4,
          ]}
        >
          Essentials
        </Text>

        <View style={styles.essentialsGrid}>
          {essentials.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.essentialCard,
                {
                  backgroundColor: theme.colors.surfaceSecondary,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                },
              ]}
              onPress={item.onPress}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.essentialIconContainer,
                  { backgroundColor: theme.colors.shimmerLight },
                ]}
              >
                <Ionicons
                  name={item.icon}
                  size={24}
                  color={theme.colors.primary}
                />
              </View>
              <Text
                style={[
                  styles.essentialTitle,
                  { color: theme.colors.textPrimary },
                  theme.typography.button,
                ]}
              >
                {item.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActionsSection}>
        <Text
          style={[
            styles.sectionTitle,
            { color: theme.colors.textPrimary },
            theme.typography.h4,
          ]}
        >
          Quick Actions
        </Text>

        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={() => navigation.navigate("Chat")}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={theme.gradients.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.gradientButton, theme.shadows.glow.sm]}
          >
            <Ionicons
              name="chatbubble-ellipses"
              size={20}
              color={theme.colors.pureWhite}
            />
            <Text
              style={[
                styles.gradientButtonText,
                { color: theme.colors.pureWhite },
                theme.typography.button,
              ]}
            >
              Start a Conversation
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.secondaryButton,
            {
              backgroundColor: theme.colors.surfaceSecondary,
              borderWidth: 1,
              borderColor: theme.colors.border,
            },
          ]}
          onPress={() => navigation.navigate("ScreenshotAnalysis")}
          activeOpacity={0.7}
        >
          <Ionicons
            name="camera-outline"
            size={20}
            color={theme.colors.textPrimary}
          />
          <Text
            style={[
              styles.secondaryButtonText,
              { color: theme.colors.textPrimary },
              theme.typography.button,
            ]}
          >
            Analyze a Screenshot
          </Text>
        </TouchableOpacity>
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
    paddingBottom: 100,
  },
  header: {
    marginBottom: 20,
  },
  greeting: {
    marginBottom: 4,
  },
  date: {
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  insightCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 32,
  },
  categoryBadge: {
    alignSelf: "flex-start",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  categoryText: {
    fontWeight: "600",
    letterSpacing: 1,
  },
  insightTitle: {
    marginBottom: 12,
  },
  insightDescription: {
    lineHeight: 24,
    marginBottom: 20,
  },
  discussButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  discussButtonText: {
    fontWeight: "600",
  },
  essentialsSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  essentialsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  essentialCard: {
    width: "48%",
    flexGrow: 1,
    borderRadius: 16,
    padding: 20,
    alignItems: "flex-start",
  },
  essentialIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  essentialTitle: {
    fontWeight: "600",
  },
  quickActionsSection: {
    marginBottom: 24,
  },
  quickActionButton: {
    marginBottom: 12,
  },
  gradientButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 14,
  },
  gradientButtonText: {
    fontWeight: "600",
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 14,
  },
  secondaryButtonText: {
    fontWeight: "600",
  },
});

export default Home;
