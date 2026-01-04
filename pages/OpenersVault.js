// pages/OpenersVault.js
import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { useTheme } from "../context/ThemeContext";
import { openerCategories, getOpenersByCategory } from "../data/conversationOpeners";

const OpenersVault = ({ navigation }) => {
  const { theme } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState(openerCategories[0].id);
  const [expandedOpener, setExpandedOpener] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const currentOpeners = getOpenersByCategory(selectedCategory);

  const handleCopyOpener = async (opener) => {
    try {
      await Clipboard.setStringAsync(opener.text);
      setCopiedId(opener.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      Alert.alert("Error", "Failed to copy to clipboard");
    }
  };

  const handleUseInChat = (opener) => {
    navigation.navigate("Chat", {
      prefillMessage: opener.text,
    });
  };

  const toggleExpanded = (openerId) => {
    setExpandedOpener(expandedOpener === openerId ? null : openerId);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Category Selector */}
      <View style={styles.categorySection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {openerCategories.map((category) => {
            const isSelected = selectedCategory === category.id;
            return (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryChip,
                  {
                    backgroundColor: isSelected
                      ? theme.colors.primary
                      : theme.colors.surfaceSecondary,
                    borderWidth: 1,
                    borderColor: isSelected
                      ? theme.colors.primary
                      : theme.colors.border,
                  },
                ]}
                onPress={() => setSelectedCategory(category.id)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={category.icon}
                  size={16}
                  color={isSelected ? theme.colors.pureWhite : theme.colors.textSecondary}
                />
                <Text
                  style={[
                    styles.categoryChipText,
                    {
                      color: isSelected
                        ? theme.colors.pureWhite
                        : theme.colors.textPrimary,
                    },
                    theme.typography.caption,
                  ]}
                >
                  {category.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Category Description */}
      <View style={styles.descriptionSection}>
        <Text
          style={[
            styles.categoryDescription,
            { color: theme.colors.textSecondary },
            theme.typography.bodySmall,
          ]}
        >
          {openerCategories.find((c) => c.id === selectedCategory)?.description}
        </Text>
      </View>

      {/* Openers List */}
      <ScrollView
        style={styles.openersContainer}
        contentContainerStyle={styles.openersContent}
        showsVerticalScrollIndicator={false}
      >
        {currentOpeners.map((opener) => {
          const isExpanded = expandedOpener === opener.id;
          const isCopied = copiedId === opener.id;

          return (
            <View
              key={opener.id}
              style={[
                styles.openerCard,
                {
                  backgroundColor: theme.colors.surfaceSecondary,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              {/* Opener Text */}
              <TouchableOpacity
                onPress={() => toggleExpanded(opener.id)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.openerText,
                    { color: theme.colors.textPrimary },
                    theme.typography.body,
                  ]}
                >
                  "{opener.text}"
                </Text>

                {/* Context Tag */}
                <View style={styles.contextRow}>
                  <Ionicons
                    name="information-circle-outline"
                    size={14}
                    color={theme.colors.textTertiary}
                  />
                  <Text
                    style={[
                      styles.contextText,
                      { color: theme.colors.textTertiary },
                      theme.typography.caption,
                    ]}
                  >
                    {opener.context}
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Expanded Tips Section */}
              {isExpanded && (
                <View
                  style={[
                    styles.tipsSection,
                    { borderTopColor: theme.colors.border },
                  ]}
                >
                  <View style={styles.tipsHeader}>
                    <Ionicons
                      name="bulb-outline"
                      size={16}
                      color={theme.colors.primary}
                    />
                    <Text
                      style={[
                        styles.tipsLabel,
                        { color: theme.colors.primary },
                        theme.typography.caption,
                      ]}
                    >
                      Pro Tip
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.tipsText,
                      { color: theme.colors.textSecondary },
                      theme.typography.bodySmall,
                    ]}
                  >
                    {opener.tips}
                  </Text>
                </View>
              )}

              {/* Action Buttons */}
              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    {
                      backgroundColor: isCopied
                        ? theme.colors.success + "20"
                        : theme.colors.shimmerLight,
                    },
                  ]}
                  onPress={() => handleCopyOpener(opener)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={isCopied ? "checkmark" : "copy-outline"}
                    size={16}
                    color={isCopied ? theme.colors.success : theme.colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.actionButtonText,
                      {
                        color: isCopied
                          ? theme.colors.success
                          : theme.colors.textSecondary,
                      },
                      theme.typography.caption,
                    ]}
                  >
                    {isCopied ? "Copied!" : "Copy"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    { backgroundColor: theme.colors.primary + "20" },
                  ]}
                  onPress={() => handleUseInChat(opener)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="chatbubble-outline"
                    size={16}
                    color={theme.colors.primary}
                  />
                  <Text
                    style={[
                      styles.actionButtonText,
                      { color: theme.colors.primary },
                      theme.typography.caption,
                    ]}
                  >
                    Practice
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.expandButton,
                    { backgroundColor: theme.colors.shimmerLight },
                  ]}
                  onPress={() => toggleExpanded(opener.id)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={isExpanded ? "chevron-up" : "chevron-down"}
                    size={16}
                    color={theme.colors.textTertiary}
                  />
                </TouchableOpacity>
              </View>
            </View>
          );
        })}

        {/* Bottom spacing */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  categorySection: {
    paddingTop: 16,
  },
  categoryScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  categoryChipText: {
    fontWeight: "600",
  },
  descriptionSection: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  categoryDescription: {
    fontStyle: "italic",
  },
  openersContainer: {
    flex: 1,
  },
  openersContent: {
    padding: 16,
    gap: 12,
  },
  openerCard: {
    borderRadius: 16,
    padding: 16,
  },
  openerText: {
    lineHeight: 24,
    fontStyle: "italic",
    marginBottom: 8,
  },
  contextRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
  },
  contextText: {
    flex: 1,
  },
  tipsSection: {
    borderTopWidth: 1,
    paddingTop: 12,
    marginBottom: 12,
  },
  tipsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  tipsLabel: {
    fontWeight: "600",
  },
  tipsText: {
    lineHeight: 20,
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  actionButtonText: {
    fontWeight: "600",
  },
  expandButton: {
    marginLeft: "auto",
    padding: 8,
    borderRadius: 8,
  },
});

export default OpenersVault;
