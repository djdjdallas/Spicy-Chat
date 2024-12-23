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
import Constants from "expo-constants";

const { width, height } = Dimensions.get("window");

const onboardingData = [
  {
    id: "1",
    title: "Welcome to RizzChat",
    description:
      "Your AI-powered conversation coach that helps you develop better communication skills",
    key: "welcome",
  },
  {
    id: "2",
    title: "Practice Makes Perfect",
    description:
      "Get real-time feedback on your conversations and learn from AI-powered suggestions",
    key: "practice",
  },
  {
    id: "3",
    title: "Safe and Private",
    description:
      "Your conversations are private and secure. Practice without pressure or judgment",
    key: "privacy",
  },
];

const OnboardingScreen = ({ onComplete }) => {
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

  const renderItem = ({ item }) => {
    return (
      <View style={styles.slide}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.description}>{item.description}</Text>
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
            outputRange: [10, 20, 10],
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
    <SafeAreaView style={styles.container}>
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
      <Paginator />
      <TouchableOpacity style={styles.button} onPress={scrollTo}>
        <Text style={styles.buttonText}>
          {currentIndex === onboardingData.length - 1 ? "Get Started" : "Next"}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
  },
  flatListContainer: {
    flex: 3,
  },
  slide: {
    width,
    height: height * 0.75,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  titleContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#0084ff",
    textAlign: "center",
    marginBottom: 10,
  },
  description: {
    fontSize: 18,
    color: "#666",
    textAlign: "center",
    paddingHorizontal: 20,
  },
  paginationContainer: {
    flexDirection: "row",
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  dot: {
    height: 10,
    borderRadius: 5,
    backgroundColor: "#0084ff",
    marginHorizontal: 8,
  },
  button: {
    backgroundColor: "#0084ff",
    padding: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginBottom: 50,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default OnboardingScreen;
