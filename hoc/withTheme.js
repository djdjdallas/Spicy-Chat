// hoc/withTheme.js
import React from "react";
import { View } from "react-native";
import { useTheme } from "../context/ThemeContext";

export const withTheme = (WrappedComponent) => {
  return (props) => {
    const { theme } = useTheme();

    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <WrappedComponent {...props} theme={theme} />
      </View>
    );
  };
};
