// App.js
import "react-native-gesture-handler";
import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { Provider as PaperProvider } from "react-native-paper";
import { View, ActivityIndicator, StatusBar, Platform } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "./lib/supabase";

// Import components
import DrawerContent from "./components/DrawerContent";
import Login from "./pages/Login";
import Chat from "./pages/Chat";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Tips from "./pages/Tips";
import ConversationHistory from "./pages/ConversationHistory";
import PartnerSelection from "./pages/PartnerSelection";

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

// Create drawer navigation
function DrawerNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <DrawerContent {...props} />}
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: "#0084ff",
          elevation: 5,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "bold",
        },
        drawerActiveBackgroundColor: "#0084ff",
        drawerActiveTintColor: "#fff",
        drawerInactiveTintColor: "#333",
        drawerLabelStyle: {
          marginLeft: -20,
          fontSize: 16,
        },
      }}
    >
      <Drawer.Screen
        name="Chat"
        component={Chat}
        options={{
          title: "RizzChat",
          headerShown: false,
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

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [userSession, setUserSession] = useState(null);

  useEffect(() => {
    // Listen for authentication state changes
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserSession(session);
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserSession(session);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0084ff" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <PaperProvider>
        <StatusBar
          barStyle={Platform.OS === "ios" ? "dark-content" : "light-content"}
          backgroundColor="#0084ff"
        />
        <NavigationContainer>
          <Stack.Navigator
            screenOptions={{
              headerShown: false,
            }}
          >
            {!userSession ? (
              // Auth screens
              <Stack.Screen
                name="Login"
                component={Login}
                options={{
                  animationTypeForReplace: !userSession ? "pop" : "push",
                }}
              />
            ) : (
              // App screens
              <Stack.Screen
                name="DrawerNavigator"
                component={DrawerNavigator}
              />
            )}
          </Stack.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

export default App;
