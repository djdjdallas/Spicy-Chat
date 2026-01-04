// navigation/index.js
import React from "react";
import { View, ActivityIndicator, Platform } from "react-native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useOnboarding } from "../hooks/useOnboarding";
import { LinearGradient } from "expo-linear-gradient";

// Import screens
import Chat from "../pages/Chat";
import Profile from "../pages/Profile";
import Settings from "../pages/Settings";
import Tips from "../pages/Tips";
import ConversationHistory from "../pages/ConversationHistory";
import PartnerSelection from "../pages/PartnerSelection";
import Login from "../pages/Login";
import Subscription from "../pages/Subscription";
import OnboardingScreen from "../Onboarding";
import OnboardingProfile from "../pages/OnboardingProfile";
import OnboardingPartner from "../pages/OnboardingPartner";
import ScreenshotAnalysis from "../pages/ScreenshotAnalysis";
import AgeVerification from "../pages/AgeVerification";
import Home from "../pages/Home";
import ProfileAudit from "../pages/ProfileAudit";
import OpenersVault from "../pages/OpenersVault";
import { useCompliance } from "../hooks/useCompliance";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const OnboardingStack = createStackNavigator();
const MainStack = createStackNavigator();

function TabBarIcon({ name, focused, color, size }) {
  return (
    <View style={{ alignItems: "center", justifyContent: "center" }}>
      <Ionicons name={name} size={size} color={color} />
    </View>
  );
}

function BottomTabNavigator() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.background,
          borderTopWidth: 1,
          borderTopColor: theme.colors.border,
          height: 60 + (Platform.OS === "ios" ? insets.bottom : 0),
          paddingTop: 8,
          paddingBottom: Platform.OS === "ios" ? insets.bottom : 8,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "500",
          marginTop: 2,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={Home}
        options={{
          title: "Home",
          tabBarIcon: ({ focused, color, size }) => (
            <TabBarIcon
              name={focused ? "home" : "home-outline"}
              focused={focused}
              color={color}
              size={22}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Chat"
        component={Chat}
        options={{
          title: "Chat",
          tabBarIcon: ({ focused, color, size }) => (
            <TabBarIcon
              name={focused ? "chatbubble" : "chatbubble-outline"}
              focused={focused}
              color={color}
              size={22}
            />
          ),
        }}
      />
      <Tab.Screen
        name="ScreenshotAnalysis"
        component={ScreenshotAnalysis}
        options={{
          title: "Analyze",
          tabBarIcon: ({ focused, color, size }) => (
            <TabBarIcon
              name={focused ? "camera" : "camera-outline"}
              focused={focused}
              color={color}
              size={22}
            />
          ),
        }}
      />
      <Tab.Screen
        name="More"
        component={MoreStack}
        options={{
          title: "More",
          tabBarIcon: ({ focused, color, size }) => (
            <TabBarIcon
              name={focused ? "menu" : "menu-outline"}
              focused={focused}
              color={color}
              size={22}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// Stack for More tab items
function MoreStack() {
  const { theme } = useTheme();

  return (
    <MainStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.background,
          shadowColor: "transparent",
          elevation: 0,
        },
        headerTintColor: theme.colors.textPrimary,
        headerTitleStyle: {
          fontWeight: "600",
        },
      }}
    >
      <MainStack.Screen
        name="MoreMenu"
        component={MoreMenu}
        options={{ title: "More" }}
      />
      <MainStack.Screen
        name="History"
        component={ConversationHistory}
        options={{ title: "History" }}
      />
      <MainStack.Screen
        name="Profile"
        component={Profile}
        options={{ title: "Profile" }}
      />
      <MainStack.Screen
        name="ProfileAudit"
        component={ProfileAudit}
        options={{ title: "Profile Audit" }}
      />
      <MainStack.Screen
        name="OpenersVault"
        component={OpenersVault}
        options={{ title: "Openers Vault" }}
      />
      <MainStack.Screen
        name="PartnerSelection"
        component={PartnerSelection}
        options={{ title: "Partners" }}
      />
      <MainStack.Screen
        name="Tips"
        component={Tips}
        options={{ title: "Tips" }}
      />
      <MainStack.Screen
        name="Settings"
        component={Settings}
        options={{ title: "Settings" }}
      />
      <MainStack.Screen
        name="Subscription"
        component={Subscription}
        options={{ title: "Premium" }}
      />
    </MainStack.Navigator>
  );
}

// More Menu Screen
import { TouchableOpacity, Text, ScrollView } from "react-native";

function MoreMenu({ navigation }) {
  const { theme } = useTheme();

  const menuItems = [
    { name: "History", icon: "time-outline", screen: "History" },
    { name: "Profile", icon: "person-outline", screen: "Profile" },
    { name: "Tips", icon: "bulb-outline", screen: "Tips" },
    { name: "Settings", icon: "settings-outline", screen: "Settings" },
    { name: "Premium", icon: "diamond-outline", screen: "Subscription" },
  ];

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      contentContainerStyle={{ padding: 16 }}
    >
      {menuItems.map((item, index) => (
        <TouchableOpacity
          key={item.name}
          onPress={() => navigation.navigate(item.screen)}
          style={{
            flexDirection: "row",
            alignItems: "center",
            padding: 16,
            backgroundColor: theme.colors.surfaceSecondary,
            borderRadius: 12,
            marginBottom: 12,
            borderWidth: 1,
            borderColor: theme.colors.border,
          }}
          activeOpacity={0.7}
        >
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              backgroundColor: theme.colors.shimmerLight,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Ionicons name={item.icon} size={20} color={theme.colors.primary} />
          </View>
          <Text
            style={{
              marginLeft: 12,
              fontSize: 16,
              fontWeight: "500",
              color: theme.colors.textPrimary,
              flex: 1,
            }}
          >
            {item.name}
          </Text>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={theme.colors.textTertiary}
          />
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

function OnboardingNavigator() {
  const { completeCarousel, completeProfile, completePartner } = useOnboarding();
  const { confirmAge } = useCompliance();

  return (
    <OnboardingStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <OnboardingStack.Screen name="OnboardingCarousel">
        {(props) => (
          <OnboardingScreen
            {...props}
            onComplete={() => {
              completeCarousel();
              props.navigation.navigate("AgeVerificationGate");
            }}
          />
        )}
      </OnboardingStack.Screen>
      <OnboardingStack.Screen name="AgeVerificationGate">
        {(props) => (
          <AgeVerification
            {...props}
            onVerified={async () => {
              await confirmAge();
              props.navigation.navigate("OnboardingProfileSetup");
            }}
          />
        )}
      </OnboardingStack.Screen>
      <OnboardingStack.Screen name="OnboardingProfileSetup">
        {(props) => (
          <OnboardingProfile
            {...props}
            onComplete={() => {
              completeProfile();
              props.navigation.navigate("OnboardingPartnerSetup");
            }}
          />
        )}
      </OnboardingStack.Screen>
      <OnboardingStack.Screen name="OnboardingPartnerSetup">
        {(props) => (
          <OnboardingPartner
            {...props}
            onComplete={completePartner}
          />
        )}
      </OnboardingStack.Screen>
    </OnboardingStack.Navigator>
  );
}

export function RootNavigator({ userSession }) {
  const { theme } = useTheme();
  const { isLoading, hasCompletedOnboarding } = useOnboarding();

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: theme.colors.background,
        }}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

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
      ) : !hasCompletedOnboarding ? (
        <Stack.Screen name="Onboarding" component={OnboardingNavigator} />
      ) : (
        <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
      )}
    </Stack.Navigator>
  );
}

export default RootNavigator;
