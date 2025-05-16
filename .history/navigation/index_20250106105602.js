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
        backgroundColor: theme?.colors?.primary || "#FF0000",
      }}
    >
      <View
        style={{
          height: 56,
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: theme?.colors?.primary || "#FF0000",
          paddingHorizontal: 16,
          elevation: 4,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
        }}
      >
        <TouchableOpacity
          onPress={navigation.toggleDrawer}
          style={{
            width: 40,
            height: 40,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Ionicons name="menu" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text
          style={{
            marginLeft: 16,
            color: "#FFFFFF",
            fontSize: 18,
            fontWeight: "600",
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
      backgroundColor: theme?.colors?.background || "#FFFFFF",
    },
    drawerActiveBackgroundColor: theme?.colors?.primary || "#FF0000",
    drawerActiveTintColor: "#FFFFFF",
    drawerInactiveTintColor: theme?.colors?.textSecondary || "#666666",
    drawerLabelStyle: {
      marginLeft: -20,
      fontSize: 16,
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
          title: "RizzChat",
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
