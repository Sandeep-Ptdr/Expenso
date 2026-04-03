import { ThemeProvider, DefaultTheme } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { PropsWithChildren } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { LanguageProvider } from "@/providers/LanguageProvider";
import StoreBootstrap from "@/providers/StoreBootstrap";

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: "#faf9f6",
    card: "#ffffff",
    border: "rgba(0, 0, 0, 0.08)",
    text: "#2d2d2d",
    primary: "#10b981",
  },
};

export default function AppProviders({ children }: PropsWithChildren) {
  return (
    <SafeAreaProvider>
      <LanguageProvider>
        <ThemeProvider value={navigationTheme}>
          <StoreBootstrap>
            <StatusBar style="dark" />
            {children}
          </StoreBootstrap>
        </ThemeProvider>
      </LanguageProvider>
    </SafeAreaProvider>
  );
}
