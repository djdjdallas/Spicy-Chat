// Onboarding.js
import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  TouchableOpacity,
  Animated,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "./context/ThemeContext";

const { width, height } = Dimensions.get("window");

const onboardingData = [
  {
    id: "1",
    title: "Welcome to Poise",
    description:
      "Your AI-powered conversation coach that helps you develop better communication skills",
    icon: "chatbubbles-outline",
    key: "welcome",
  },
  {
    id: "2",
    title: "Practice Makes Perfect",
    description:
      "Get real-time feedback on your conversations and learn from AI-powered suggestions",
    icon: "bulb-outline",
    key: "practice",
  },
  {
    id: "3",
    title: "Safe and Private",
    description:
      "Your conversations are private and secure. Practice without pressure or judgment",
    icon: "shield-checkmark-outline",
    key: "privacy",
  },
];

const OnboardingScreen = ({ onComplete }) => {
  const { theme } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef(null);

  const viewableItemsChanged = useRef(({ viewableItems }) => {
    setCurrentIndex(viewableItems[0]?.index ?? 0);
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const scrollTo = () => {
    if (currentIndex < onboardingData.length - 1) {
      slidesRef.current.scrollToIndex({ index: currentIndex + 1 });
    } else {
      onComplete();
    }
  };

  const renderItem = ({ item, index }) => {
    return (
      <View style={styles.slide}>
        <View style={styles.slideContent}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: theme.colors.primaryMuted },
            ]}
          >
            <Ionicons
              name={item.icon}
              size={48}
              color={theme.colors.primary}
            />
          </View>
          <Text
            style={[
              styles.title,
              { color: theme.colors.textPrimary },
              theme.typography.h1,
            ]}
          >
            {item.title}
          </Text>
          <Text
            style={[
              styles.description,
              { color: theme.colors.textSecondary },
              theme.typography.bodyLarge,
            ]}
          >
            {item.description}
          </Text>
        </View>
      </View>
    );
  };

  const Paginator = () => {
    return (
      <View style={styles.paginationContainer}>
        {onboardingData.map((_, index) => {
          const inputRange = [
            (index - 1) * width,
            index * width,
            (index + 1) * width,
          ];

          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [8, 24, 8],
            extrapolate: "clamp",
          });

          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.3, 1, 0.3],
            extrapolate: "clamp",
          });

          return (
            <Animated.View
              style={[
                styles.dot,
                {
                  width: dotWidth,
                  opacity,
                  backgroundColor: theme.colors.black,
                },
              ]}
              key={index.toString()}
            />
          );
        })}
      </View>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.flatListContainer}>
        <FlatList
          data={onboardingData}
          renderItem={renderItem}
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          bounces={false}
          keyExtractor={(item) => item.id}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={32}
          onViewableItemsChanged={viewableItemsChanged}
          viewabilityConfig={viewConfig}
          ref={slidesRef}
        />
      </View>

      <View style={styles.bottomContainer}>
        <Paginator />

        <TouchableOpacity
          style={[
            styles.button,
            {
              backgroundColor:
                currentIndex === onboardingData.length - 1
                  ? theme.colors.primary
                  : theme.colors.black,
            },
          ]}
          onPress={scrollTo}
          activeOpacity={0.85}
        >
          <Text
            style={[
              styles.buttonText,
              { color: theme.colors.pureWhite },
              theme.typography.button,
            ]}
          >
            {currentIndex === onboardingData.length - 1 ? "Get Started" : "Next"}
          </Text>
          <Ionicons
            name="arrow-forward"
            size={20}
            color={theme.colors.pureWhite}
            style={styles.buttonIcon}
          />
        </TouchableOpacity>

        {currentIndex < onboardingData.length - 1 && (
          <TouchableOpacity
            style={styles.skipButton}
            onPress={onComplete}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.skipText,
                { color: theme.colors.textSecondary },
                theme.typography.body,
              ]}
            >
              Skip
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flatListContainer: {
    flex: 1,
  },
  slide: {
    width,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  slideContent: {
    alignItems: "center",
    maxWidth: 320,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    textAlign: "center",
    marginBottom: 16,
  },
  description: {
    textAlign: "center",
    lineHeight: 28,
  },
  bottomContainer: {
    paddingHorizontal: 24,
    paddingBottom: 48,
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 32,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginBottom: 16,
  },
  buttonText: {
    // Typography applied via theme
  },
  buttonIcon: {
    marginLeft: 8,
  },
  skipButton: {
    alignItems: "center",
    paddingVertical: 8,
  },
  skipText: {
    // Typography applied via theme
  },
});

export default OnboardingScreen;
