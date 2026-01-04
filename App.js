// App.js
import "react-native-gesture-handler";
import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { Provider as PaperProvider } from "react-native-paper";
import { View, ActivityIndicator, StatusBar, Text } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { supabase, isSupabaseConfigured } from "./lib/supabase";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import RootNavigator from "./navigation";
import ErrorBoundary from "./components/ErrorBoundary";

function LoadingScreen() {
  const { theme } = useTheme();
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

function ConfigErrorScreen() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#0C0A09",
        padding: 32,
      }}
    >
      <Text style={{ color: "#EF4444", fontSize: 24, fontWeight: "700", marginBottom: 16 }}>
        Configuration Error
      </Text>
      <Text style={{ color: "#A8A29E", fontSize: 15, textAlign: "center", lineHeight: 22 }}>
        The app is missing required configuration. Please contact support.
      </Text>
    </View>
  );
}

function NavigationWrapper() {
  const [isLoading, setIsLoading] = useState(true);
  const [userSession, setUserSession] = useState(null);
  const [initError, setInitError] = useState(null);
  const { theme, isDark } = useTheme();

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (!isSupabaseConfigured) {
          setInitError("Supabase not configured");
          setIsLoading(false);
          return;
        }

        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Auth session error:", error);
        }
        setUserSession(session);
        setIsLoading(false);
      } catch (e) {
        console.error("Init error:", e);
        setInitError(e.message);
        setIsLoading(false);
      }
    };

    initAuth();

    let subscription;
    try {
      const authListener = supabase.auth.onAuthStateChange((_event, session) => {
        setUserSession(session);
        setIsLoading(false);
      });
      subscription = authListener.data.subscription;
    } catch (e) {
      console.error("Auth listener error:", e);
    }

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (initError) {
    return <ConfigErrorScreen />;
  }

  return (
    <NavigationContainer
      theme={{
        dark: isDark,
        colors: {
          primary: theme.colors.primary,
          background: theme.colors.background,
          card: theme.colors.surface,
          text: theme.colors.textPrimary,
          border: theme.colors.border,
          notification: theme.colors.primary,
        },
        fonts: {
          regular: {
            fontFamily: "System",
            fontWeight: "400",
          },
          medium: {
            fontFamily: "System",
            fontWeight: "500",
          },
          bold: {
            fontFamily: "System",
            fontWeight: "700",
          },
          heavy: {
            fontFamily: "System",
            fontWeight: "900",
          },
        },
      }}
    >
      <RootNavigator userSession={userSession} />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <ThemeProvider>
          <PaperProvider>
            <StatusBar barStyle="light-content" backgroundColor="#0C0A09" />
            <NavigationWrapper />
          </PaperProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
