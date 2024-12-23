// components/DrawerContent.js
import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
} from "react-native";
import { DrawerContentScrollView, DrawerItem } from "@react-navigation/drawer";
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

const UserAvatar = ({ user }) => {
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
    <View style={styles.avatar}>
      <Text style={styles.avatarText}>{getInitials()}</Text>
    </View>
  );
};

export default function DrawerContent(props) {
  const [user, setUser] = useState(null);
  const [isDarkTheme, setIsDarkTheme] = useState(false);

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
        // Load additional profile data if needed
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (profileError && profileError.code !== "PGRST116") {
          // PGRST116 is 'not found'
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

  const handleSignOut = async () => {
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

              // Navigation will be handled automatically by the auth state listener
              // in App.js, no need to navigate manually
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

  const toggleTheme = () => {
    setIsDarkTheme(!isDarkTheme);
    // Add your theme switching logic here
  };

  return (
    <DrawerContentScrollView {...props}>
      <View style={styles.drawerContent}>
        {/* User Info Section */}
        <View style={styles.userInfoSection}>
          <TouchableOpacity
            style={styles.profileSection}
            onPress={() => props.navigation.navigate("Profile")}
          >
            <UserAvatar user={user} />
            <View style={styles.userInfo}>
              <Title style={styles.title}>
                {user?.user_metadata?.full_name || "User"}
              </Title>
              <Caption style={styles.caption}>{user?.email}</Caption>
            </View>
          </TouchableOpacity>
        </View>

        {/* Navigation Items */}
        <Drawer.Section style={styles.drawerSection}>
          <DrawerItem
            icon={({ color, size }) => (
              <Ionicons name="chatbubble-outline" color={color} size={size} />
            )}
            label="Chat"
            onPress={() => props.navigation.navigate("Chat")}
          />
          <DrawerItem
            icon={({ color, size }) => (
              <Ionicons name="people-outline" color={color} size={size} />
            )}
            label="Conversation Partners"
            onPress={() => props.navigation.navigate("Partners")}
          />
          <DrawerItem
            icon={({ color, size }) => (
              <Ionicons name="person-outline" color={color} size={size} />
            )}
            label="Profile"
            onPress={() => props.navigation.navigate("Profile")}
          />
          <DrawerItem
            icon={({ color, size }) => (
              <Ionicons name="time-outline" color={color} size={size} />
            )}
            label="Conversation History"
            onPress={() => props.navigation.navigate("ConversationHistory")}
          />
          <DrawerItem
            icon={({ color, size }) => (
              <Ionicons name="bulb-outline" color={color} size={size} />
            )}
            label="Tips & Tricks"
            onPress={() => props.navigation.navigate("Tips")}
          />
          <DrawerItem
            icon={({ color, size }) => (
              <Ionicons name="settings-outline" color={color} size={size} />
            )}
            label="Settings"
            onPress={() => props.navigation.navigate("Settings")}
          />
        </Drawer.Section>

        {/* Preferences Section */}
        <Drawer.Section title="Preferences">
          <TouchableRipple onPress={toggleTheme}>
            <View style={styles.preference}>
              <Text>Dark Theme</Text>
              <View pointerEvents="none">
                <Switch value={isDarkTheme} />
              </View>
            </View>
          </TouchableRipple>
        </Drawer.Section>

        {/* Sign Out Section */}
        <Drawer.Section style={styles.bottomDrawerSection}>
          <DrawerItem
            icon={({ color, size }) => (
              <Ionicons name="log-out-outline" color={color} size={size} />
            )}
            label="Sign Out"
            onPress={handleSignOut}
          />
        </Drawer.Section>

        {/* Version Info */}
        <View style={styles.versionInfo}>
          <Caption>Version 1.0.0</Caption>
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
    borderBottomColor: "#f4f4f4",
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
    backgroundColor: "#0084ff",
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
  bottomDrawerSection: {
    marginTop: 15,
    borderTopColor: "#f4f4f4",
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
    borderTopColor: "#f4f4f4",
  },
});
