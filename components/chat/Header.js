// components/chat/Header.js
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, DrawerActions } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../context/ThemeContext";

export const ChatHeader = ({ onNewChat }) => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  const handleNewChat = () => {
    if (onNewChat) {
      onNewChat();
    }
  };

  return (
    <View
      style={[
        styles.header,
        {
          paddingTop: insets.top,
          backgroundColor: theme.colors.primary,
          shadowColor: theme.colors.shadow,
        },
      ]}
    >
      <TouchableOpacity
        onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
        style={[
          styles.menuButton,
          { backgroundColor: "rgba(255, 255, 255, 0.1)" },
        ]}
        activeOpacity={0.7}
      >
        <Ionicons name="menu" size={24} color={theme.colors.textInverted} />
      </TouchableOpacity>

      <Text style={[styles.headerText, { color: theme.colors.textInverted }]}>
        RizzChat
      </Text>

      <TouchableOpacity
        style={[
          styles.menuButton,
          { backgroundColor: "rgba(255, 255, 255, 0.1)" },
        ]}
        onPress={handleNewChat}
        activeOpacity={0.7}
      >
        <Ionicons
          name="add-outline"
          size={24}
          color={theme.colors.textInverted}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingBottom: 15,
    elevation: 5,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 1000,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  menuButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
  },
});

export default ChatHeader;
