// components/DrawerContent.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Switch,
} from "react-native";
import { DrawerContentScrollView } from "@react-navigation/drawer";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../lib/supabase";
import { useTheme } from "../context/ThemeContext";

const UserAvatar = ({ user, theme }) => {
  const getInitials = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name
        .split(" ")
        .map((name) => name[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return user?.email?.[0].toUpperCase() || "?";
  };

  return (
    <View style={[styles.avatar, { backgroundColor: theme.colors.primary }]}>
      <Text style={[styles.avatarText, { color: theme.colors.pureWhite }]}>
        {getInitials()}
      </Text>
    </View>
  );
};

const DrawerItem = ({ label, icon, onPress, theme, isDestructive = false }) => (
  <TouchableOpacity
    onPress={onPress}
    style={[styles.drawerItem, { backgroundColor: "transparent" }]}
    activeOpacity={0.7}
  >
    <View
      style={[
        styles.drawerItemIcon,
        { backgroundColor: isDestructive ? theme.colors.errorMuted : theme.colors.backgroundTertiary },
      ]}
    >
      <Ionicons
        name={icon}
        size={20}
        color={isDestructive ? theme.colors.error : theme.colors.textPrimary}
      />
    </View>
    <Text
      style={[
        styles.drawerItemLabel,
        { color: isDestructive ? theme.colors.error : theme.colors.textPrimary },
        theme.typography.body,
      ]}
    >
      {label}
    </Text>
    <Ionicons
      name="chevron-forward"
      size={18}
      color={theme.colors.textTertiary}
    />
  </TouchableOpacity>
);

export default function DrawerContent(props) {
  const [user, setUser] = useState(null);
  const { isDark, toggleTheme, theme } = useTheme();

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error) throw error;
      setUser(user);

      if (user) {
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (profileError && profileError.code !== "PGRST116") {
          throw profileError;
        }

        if (profile) {
          setUser((prev) => ({ ...prev, ...profile }));
        }
      }
    } catch (error) {
      console.error("Error loading user profile:", error);
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: async () => {
            try {
              const { error } = await supabase.auth.signOut();
              if (error) throw error;
            } catch (error) {
              console.error("Error signing out:", error);
              Alert.alert("Error", "Failed to sign out. Please try again.");
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const menuItems = [
    { label: "Chat", icon: "chatbubble-outline", screen: "Chat" },
    { label: "Partners", icon: "people-outline", screen: "Partners" },
    { label: "Profile", icon: "person-outline", screen: "Profile" },
    { label: "History", icon: "time-outline", screen: "ConversationHistory" },
    { label: "Tips", icon: "bulb-outline", screen: "Tips" },
    { label: "Settings", icon: "settings-outline", screen: "Settings" },
  ];

  return (
    <DrawerContentScrollView
      {...props}
      style={{ backgroundColor: theme.colors.background }}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={[styles.drawerContent, { backgroundColor: theme.colors.background }]}>
        {/* Header with Logo */}
        <View style={[styles.headerSection, { borderBottomColor: theme.colors.border }]}>
          <View style={[styles.logoContainer, { backgroundColor: theme.colors.black }]}>
            <Text style={[styles.logoText, { color: theme.colors.pureWhite }]}>P</Text>
          </View>
          <Text style={[styles.brandName, { color: theme.colors.textPrimary }, theme.typography.h2]}>
            Poise
          </Text>
          <Text style={[styles.tagline, { color: theme.colors.textTertiary }, theme.typography.caption]}>
            Master the art of conversation
          </Text>
        </View>

        {/* User Info Section */}
        <TouchableOpacity
          style={[styles.userSection, { backgroundColor: theme.colors.surface }]}
          onPress={() => props.navigation.navigate("Profile")}
          activeOpacity={0.7}
        >
          <UserAvatar user={user} theme={theme} />
          <View style={styles.userInfo}>
            <Text
              style={[styles.userName, { color: theme.colors.textPrimary }, theme.typography.h4]}
              numberOfLines={1}
            >
              {user?.user_metadata?.full_name || "User"}
            </Text>
            <Text
              style={[styles.userEmail, { color: theme.colors.textSecondary }, theme.typography.caption]}
              numberOfLines={1}
            >
              {user?.email}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.colors.textTertiary} />
        </TouchableOpacity>

        {/* Navigation Items */}
        <View style={styles.menuSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textTertiary }, theme.typography.overline]}>
            MENU
          </Text>
          <View style={[styles.menuCard, { backgroundColor: theme.colors.surface, ...theme.shadows.sm }]}>
            {menuItems.map((item, index) => (
              <View key={item.screen}>
                <DrawerItem
                  label={item.label}
                  icon={item.icon}
                  onPress={() => props.navigation.navigate(item.screen)}
                  theme={theme}
                />
                {index < menuItems.length - 1 && (
                  <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Preferences Section */}
        <View style={styles.preferencesSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textTertiary }, theme.typography.overline]}>
            PREFERENCES
          </Text>
          <View style={[styles.preferenceCard, { backgroundColor: theme.colors.surface, ...theme.shadows.sm }]}>
            <View style={styles.preferenceItem}>
              <View style={styles.preferenceLeft}>
                <View style={[styles.drawerItemIcon, { backgroundColor: theme.colors.backgroundTertiary }]}>
                  <Ionicons name="moon-outline" size={20} color={theme.colors.textPrimary} />
                </View>
                <Text style={[styles.preferenceLabel, { color: theme.colors.textPrimary }, theme.typography.body]}>
                  Dark Mode
                </Text>
              </View>
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{
                  false: theme.colors.border,
                  true: theme.colors.primary,
                }}
                thumbColor={theme.colors.pureWhite}
                ios_backgroundColor={theme.colors.border}
              />
            </View>
          </View>
        </View>

        {/* Sign Out */}
        <View style={styles.signOutSection}>
          <TouchableOpacity
            style={[styles.signOutButton, { backgroundColor: theme.colors.errorMuted }]}
            onPress={handleSignOut}
            activeOpacity={0.7}
          >
            <Ionicons name="log-out-outline" size={20} color={theme.colors.error} />
            <Text style={[styles.signOutText, { color: theme.colors.error }, theme.typography.button]}>
              Sign Out
            </Text>
          </TouchableOpacity>
        </View>

        {/* Version Info */}
        <View style={styles.versionSection}>
          <Text style={[styles.versionText, { color: theme.colors.textTertiary }, theme.typography.caption]}>
            Poise v1.0.0
          </Text>
        </View>
      </View>
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
  },
  drawerContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  headerSection: {
    alignItems: "center",
    paddingVertical: 24,
    borderBottomWidth: 1,
    marginBottom: 16,
  },
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  logoText: {
    fontSize: 32,
    fontWeight: "700",
    letterSpacing: -1,
  },
  brandName: {
    marginBottom: 4,
  },
  tagline: {
    textAlign: "center",
  },
  userSection: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "600",
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userName: {
    marginBottom: 2,
  },
  userEmail: {
    // Typography applied via theme
  },
  menuSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 12,
    marginLeft: 4,
    letterSpacing: 1,
  },
  menuCard: {
    borderRadius: 16,
    overflow: "hidden",
  },
  drawerItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  drawerItemIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  drawerItemLabel: {
    flex: 1,
    marginLeft: 12,
  },
  divider: {
    height: 1,
    marginLeft: 64,
  },
  preferencesSection: {
    marginBottom: 24,
  },
  preferenceCard: {
    borderRadius: 16,
    overflow: "hidden",
  },
  preferenceItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  preferenceLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  preferenceLabel: {
    marginLeft: 12,
  },
  signOutSection: {
    marginBottom: 16,
  },
  signOutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  signOutText: {
    // Typography applied via theme
  },
  versionSection: {
    alignItems: "center",
    paddingBottom: 24,
  },
  versionText: {
    // Typography applied via theme
  },
});
