// navigation/index.js
import React from "react";
import { View, Text, TouchableOpacity, Platform } from "react-native";
import { createStackNavigator } from "@react-navigation/stack";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
// Import screens
import DrawerContent from "../components/DrawerContent";
import Chat from "../pages/Chat";
import Profile from "../pages/Profile";
import Settings from "../pages/Settings";
import Tips from "../pages/Tips";
import ConversationHistory from "../pages/ConversationHistory";
import PartnerSelection from "../pages/PartnerSelection";
import Login from "../pages/Login";
import Subscription from "../pages/Subscription";

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

function CustomHeader({ navigation, route, options }) {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const title = options?.headerTitle || route.name;

  return (
    <View
      style={{
        paddingTop: Platform.OS === "ios" ? insets.top : 0,
        backgroundColor: theme.colors.background,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
      }}
    >
      <View
        style={{
          height: 56,
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: theme.colors.background,
          paddingHorizontal: 16,
        }}
      >
        <TouchableOpacity
          onPress={navigation.toggleDrawer}
          style={{
            width: 44,
            height: 44,
            justifyContent: "center",
            alignItems: "center",
            borderRadius: 12,
            backgroundColor: theme.colors.backgroundTertiary,
          }}
        >
          <Ionicons name="menu" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text
          style={{
            marginLeft: 16,
            color: theme.colors.textPrimary,
            fontSize: 18,
            fontWeight: "600",
            letterSpacing: 0,
          }}
        >
          {title}
        </Text>
      </View>
    </View>
  );
}

function DrawerNavigator() {
  const { theme } = useTheme();

  const drawerScreenOptions = {
    drawerStyle: {
      backgroundColor: theme.colors.background,
      width: 280,
    },
    drawerActiveBackgroundColor: theme.colors.backgroundTertiary,
    drawerActiveTintColor: theme.colors.textPrimary,
    drawerInactiveTintColor: theme.colors.textSecondary,
    drawerLabelStyle: {
      marginLeft: -16,
      fontSize: 16,
      fontWeight: "500",
    },
    header: (props) => <CustomHeader {...props} />,
  };

  return (
    <Drawer.Navigator
      drawerContent={(props) => <DrawerContent {...props} />}
      screenOptions={drawerScreenOptions}
    >
      <Drawer.Screen
        name="Chat"
        component={Chat}
        options={{
          headerShown: false,
          title: "Poise",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="chatbubble-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Partners"
        component={PartnerSelection}
        options={{
          title: "Conversation Partners",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Profile"
        component={Profile}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="ConversationHistory"
        component={ConversationHistory}
        options={{
          title: "History",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="time-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Tips"
        component={Tips}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="bulb-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Settings"
        component={Settings}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Subscription"
        component={Subscription}
        options={{
          title: "Premium",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="diamond-outline" size={size} color={color} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
}

export function RootNavigator({ userSession }) {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      {!userSession ? (
        <Stack.Screen
          name="Login"
          component={Login}
          options={{
            animationTypeForReplace: !userSession ? "pop" : "push",
          }}
        />
      ) : (
        <Stack.Screen name="DrawerNavigator" component={DrawerNavigator} />
      )}
    </Stack.Navigator>
  );
}

export default RootNavigator;
