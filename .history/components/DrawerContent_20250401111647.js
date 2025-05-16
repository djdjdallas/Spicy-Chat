// components/DrawerContent.js
import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
} from "react-native";
import { DrawerContentScrollView } from "@react-navigation/drawer";
import {
  Text,
  Title,
  Caption,
  Drawer,
  Switch,
  TouchableRipple,
} from "react-native-paper";
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
        .toUpperCase();
    }
    return user?.email?.[0].toUpperCase() || "?";
  };

  return (
    <View style={[styles.avatar, { backgroundColor: theme.colors.primary }]}>
      <Text style={styles.avatarText}>{getInitials()}</Text>
    </View>
  );
};

const DrawerItem = ({ label, icon: Icon, onPress, theme }) => (
  <TouchableRipple onPress={onPress} style={styles.drawerItem}>
    <View style={styles.drawerItemContent}>
      <Icon color={theme.colors.textPrimary} size={24} />
      <Text
        style={[styles.drawerItemLabel, { color: theme.colors.textPrimary }]}
      >
        {label}
      </Text>
    </View>
  </TouchableRipple>
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

  return (
    <DrawerContentScrollView
      {...props}
      style={{ backgroundColor: theme.colors.background }}
    >
      <View
        style={[
          styles.drawerContent,
          { backgroundColor: theme.colors.background },
        ]}
      >
        {/* User Info Section */}
        <View
          style={[
            styles.userInfoSection,
            { borderBottomColor: theme.colors.border },
          ]}
        >
          <TouchableOpacity
            style={styles.profileSection}
            onPress={() => props.navigation.navigate("Profile")}
          >
            <UserAvatar user={user} theme={theme} />
            <View style={styles.userInfo}>
              <Title
                style={[styles.title, { color: theme.colors.textPrimary }]}
              >
                {user?.user_metadata?.full_name || "User"}
              </Title>
              <Caption
                style={[styles.caption, { color: theme.colors.textSecondary }]}
              >
                {user?.email}
              </Caption>
            </View>
          </TouchableOpacity>
        </View>

        {/* Navigation Items */}
        <Drawer.Section style={styles.drawerSection}>
          <DrawerItem
            label="Chat"
            icon={(props) => <Ionicons name="chatbubble-outline" {...props} />}
            onPress={() => props.navigation.navigate("Chat")}
            theme={theme}
          />
          {/* <DrawerItem
            label="Conversation Partners"
            icon={(props) => <Ionicons name="people-outline" {...props} />}
            onPress={() => props.navigation.navigate("Partners")}
            theme={theme}
          /> */}
          <DrawerItem
            label="Profile"
            icon={(props) => <Ionicons name="person-outline" {...props} />}
            onPress={() => props.navigation.navigate("Profile")}
            theme={theme}
          />
          <DrawerItem
            label="Conversation History"
            icon={(props) => <Ionicons name="time-outline" {...props} />}
            onPress={() => props.navigation.navigate("ConversationHistory")}
            theme={theme}
          />
          <DrawerItem
            label="Tips & Tricks"
            icon={(props) => <Ionicons name="bulb-outline" {...props} />}
            onPress={() => props.navigation.navigate("Tips")}
            theme={theme}
          />
          <DrawerItem
            label="Settings"
            icon={(props) => <Ionicons name="settings-outline" {...props} />}
            onPress={() => props.navigation.navigate("Settings")}
            theme={theme}
          />
        </Drawer.Section>

        {/* Preferences Section */}
        <Drawer.Section title="Preferences" theme={theme}>
          <TouchableRipple onPress={toggleTheme}>
            <View style={styles.preference}>
              <Text style={{ color: theme.colors.textPrimary }}>
                Dark Theme
              </Text>
              <View pointerEvents="none">
                <Switch value={isDark} />
              </View>
            </View>
          </TouchableRipple>
        </Drawer.Section>

        {/* Sign Out Section */}
        <Drawer.Section
          style={[
            styles.bottomDrawerSection,
            { borderTopColor: theme.colors.border },
          ]}
        >
          <DrawerItem
            label="Sign Out"
            icon={(props) => (
              <Ionicons
                name="log-out-outline"
                {...props}
                color={theme.colors.error}
              />
            )}
            onPress={handleSignOut}
            theme={theme}
          />
        </Drawer.Section>

        {/* Version Info */}
        <View
          style={[styles.versionInfo, { borderTopColor: theme.colors.border }]}
        >
          <Caption style={{ color: theme.colors.textSecondary }}>
            Version 1.0.0
          </Caption>
        </View>
      </View>
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  drawerContent: {
    flex: 1,
  },
  userInfoSection: {
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "white",
    fontSize: 32,
    fontWeight: "bold",
  },
  userInfo: {
    marginLeft: 15,
    flexDirection: "column",
  },
  title: {
    fontSize: 16,
    marginTop: 3,
    fontWeight: "bold",
  },
  caption: {
    fontSize: 14,
    lineHeight: 14,
  },
  drawerSection: {
    marginTop: 15,
  },
  drawerItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  drawerItemContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  drawerItemLabel: {
    marginLeft: 32,
    fontSize: 16,
  },
  bottomDrawerSection: {
    marginTop: 15,
    borderTopWidth: 1,
  },
  preference: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  versionInfo: {
    padding: 20,
    alignItems: "center",
    borderTopWidth: 1,
  },
});
